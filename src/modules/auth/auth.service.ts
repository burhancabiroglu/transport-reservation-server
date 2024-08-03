import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { FirebaseService } from "@modules/firebase/firebase.service";
import { Collections } from "@core/collections/firebase-collections";
import { ScryptService } from "@modules/firebase/scrypt.service";
import { JwtService } from "@nestjs/jwt";
import { CoreResponse } from "@core/types/core-response";
import { type LoginResponse } from "@models/login/login.response";
import { type UserPayload } from "@models/payload/user-payload";
import { type UserRecord } from "firebase-admin/auth";
import { type AppUser } from "@models/user/app-user";
import { type LoginRequest } from "@models/login/login.request";
import { type RegisterRequest } from "@models/register/register.request";
import { AuthErrorCodes } from "@core/config/auth-error-codes";
import { UserFcmDto } from "@models/user/user-fcm-dto";
import { ResetPasswordRequest } from "@models/reset/reset-password-request";
import { EventBus } from "@nestjs/cqrs";
import { PasswordResetEvent } from "@models/event/comm.event";
import { SeatStatus } from "@core/config/seat-status-enum";

@Injectable()
export class AuthService {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly scrypt: ScryptService,
    private readonly jwtService: JwtService,
    private readonly eventBus: EventBus
  ) {}

  public async register(body: RegisterRequest): Promise<CoreResponse<string>> {
    const { email, password } = body;
    try {
      // Creating user in Firebase Authentication
      const userRecord = await this.firebase.auth.createUser({
        email,
        password,
      });

      // Creating user record in Firestore
      const isAdminEmail = await this.isAdminEmail(email);
      const user: AppUser = {
        uid: userRecord.uid,
        ...body,
        createdAt: Date.now().toString(),
        emailVerified: isAdminEmail,
        isApproved: isAdminEmail,
        isBanned: false,
        isAdmin: await this.isAdminEmail(email),
      }
      await this.firebase.collection(Collections.USERS).doc(user.uid).set(user);

      return new CoreResponse(`User ${email} was registered successfully`);
    } catch (error) {
      // Handling different error states
      if (error["code"] === "auth/email-already-in-use") {
        throw new BadRequestException(AuthErrorCodes.EMAIL_ALREADY_USED);
      } else if (error["code"] === "auth/weak-password") {
        throw new BadRequestException(AuthErrorCodes.PASSWORD_TOO_WEAK);
      } else {
        // General error
        if(error["message"].includes("already in use")){
          throw new BadRequestException(AuthErrorCodes.EMAIL_ALREADY_USED);
        }
        else {
          throw new BadRequestException(
            `Error registering new user: ${error["message"]}`,
          );
        }
      }
    }
  }

  public async login(body: LoginRequest): Promise<CoreResponse<LoginResponse>> {
    const { email, password } = body;
    try {
      const userRecord: UserRecord = (
        await this.firebase.auth.listUsers()
      ).users.find((userRecord) => userRecord.email === email);
      const isPasswordValid = await this.scrypt.verify(
        password,
        userRecord.passwordSalt,
        userRecord.passwordHash,
      );
      if (isPasswordValid) {
        const userData = await this.getUserById(userRecord.uid);
        const payload: UserPayload = {
          uid: userRecord.uid,
          isAdmin: userData.isAdmin,
        };
        const accessToken = await this.jwtService.signAsync(payload);
        const { data } = await this.profile(payload);
        if(!data.isApproved) {
          throw new UnauthorizedException(`user approved error`);
        }
        return new CoreResponse({ 
          user: data,
          accessToken: accessToken 
        });
      } else {
        throw new UnauthorizedException(`Invalid email or password`);
      }
    } catch (error) {
      if (error["code"] === "auth/user-not-found") {
        throw new UnauthorizedException(AuthErrorCodes.WRONG_CREDENTIALS);
      }
      if(error["message"] === "user approved error") {
        throw new UnauthorizedException(AuthErrorCodes.USER_NOT_CONFIRMED);
      } 
      throw new UnauthorizedException(AuthErrorCodes.WRONG_CREDENTIALS);
    }
  }

  public async profile(payload: UserPayload): Promise<CoreResponse<AppUser>> {
    return new CoreResponse(await this.getUserById(payload.uid));
  }

  public async resetPassword(dto: ResetPasswordRequest): Promise<CoreResponse<string>> {
    try {
      const ref = this.firebase.collection(Collections.USERS).where("email","==",dto.email);
      const snapshot = await ref.get();

      if(snapshot.empty) {
        throw new HttpException("Invalid Email", HttpStatus.NOT_FOUND);
      }

      const link = await this.firebase.auth.generatePasswordResetLink(dto.email);
      this.eventBus.publish(new PasswordResetEvent(link,dto.email))
      return new CoreResponse("Password Reset Link sent successfuly")
    }
    catch(error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        Logger.error("resetPassword", error);
        // If an unexpected error occurs, return a generic 500 error
        throw new HttpException(
          "Internal server error",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    // return new CoreResponse(await this.getUserById(payload.uid));
  }

  public async getUserById(uid: string): Promise<AppUser> {
    try {
      const ref = this.firebase.collection(Collections.USERS).doc(uid);
      const snapshot = await ref.get();

      if (!snapshot.exists) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      const userData = snapshot.data() as AppUser;

      // Ensure the user data has all required fields
      if (!userData.uid || !userData.email) {
        throw new HttpException(
          "Invalid user data",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return userData;
    } catch (error) {
      // Catching and rethrowing specific exceptions
      if (error instanceof HttpException) {
        throw error;
      } else {
        // If an unexpected error occurs, return a generic 500 error
        throw new HttpException(
          "Internal server error",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async updateUserFcm(
    payload: UserPayload,
    dto: UserFcmDto
  ): Promise<CoreResponse<string>> {
    try {
      const userRef = this.firebase.collection(Collections.USERS).doc(payload.uid);
      await userRef.set({ ...dto }, { merge: true }); // Use merge option to update only provided fields

      return new CoreResponse("User Updated");
    } catch (error) {
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async deleteAccount(payload: UserPayload): Promise<CoreResponse<string>> {
    try {
      const userRef = this.firebase.collection(Collections.USERS).doc(payload.uid);
      const transferWishSnapshot = (await this.firebase
        .collection(Collections.TRANSFER_REQUESTS)
        .where("userId", "==", payload.uid)
        .get()).docs;

      const seatsSnapshot = (await this.firebase
          .collection(Collections.SEATS)
          .where("userId", "==", payload.uid)
          .get()).docs;
  
      
      await userRef.delete()
      await Promise.all(
        transferWishSnapshot.map(async (doc)=> await doc.ref.delete())
      );
      await Promise.all(
        seatsSnapshot.map(async (doc)=> {
          await doc.ref.set({
            "userId": null,
            seatStatus: SeatStatus.EMPTY
          }, {merge: true})
        })
      );

      return new CoreResponse("User Deleted");
    } catch (error) {
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async isAdminEmail(email: string): Promise<boolean> {
    try {
      const ref = this.firebase.collection(Collections.ADMIN_WHITE_LIST).doc(email);
      const snapshot = await ref.get();
      if(snapshot.exists) {
        return true
      }
      return false
    }
    catch (error) {
      return false;
    }
  }
}
