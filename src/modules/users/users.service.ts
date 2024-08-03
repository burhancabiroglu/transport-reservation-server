import { type AppUser } from "@models/user/app-user";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Collections } from "@core/collections/firebase-collections";
import { FirebaseService } from "@modules/firebase/firebase.service";
import { CoreResponse } from "@core/types/core-response";
import { EventBus } from "@nestjs/cqrs";
import { UserConfirmationEvent } from "@models/event/comm.event";

@Injectable()
export class UsersService {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly eventBus: EventBus,
  ) {}

  public async getUsers(): Promise<CoreResponse<AppUser[]>> {
    try {
      const querySnapshot = await this.firebase
        .collection(Collections.USERS)
        .get();
      const userList: AppUser[] = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data() as AppUser;
        userList.push({
          uid: doc.id,
          ...userData,
        });
      });

      return new CoreResponse(userList);
    } catch (error) {
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async updateUser(user: AppUser): Promise<CoreResponse<string>> {
    try {
      const userRef = this.firebase.collection(Collections.USERS).doc(user.uid);
      await userRef.set({ ...user }, { merge: true }); // Use merge option to update only provided fields

      return new CoreResponse("User Updated");
    } catch (error) {
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async deleteUser(userId: string): Promise<CoreResponse<string>> {
    try {
      await this.firebase.auth.deleteUser(userId);
      await this.firebase
        .collection(Collections.USERS).doc(userId)
        .delete();
      return new CoreResponse("User Deleted");
    } catch (error) {
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  public async approveUser(uid: string): Promise<CoreResponse<string>> {
    try {
      const userRef = this.firebase.collection(Collections.USERS).doc(uid);
      await userRef.set({ isApproved: true }, { merge: true });
      const userData: AppUser = (await userRef.get()).data() as AppUser;
      this.eventBus.publish(new UserConfirmationEvent(userData.email,userData.name));      
      return new CoreResponse("User Approved");
    } catch (error) {
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
