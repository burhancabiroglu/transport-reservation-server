import { Collections } from "@core/collections/firebase-collections";
import { CoreResponse } from "@core/types/core-response";
import { FirebaseService } from "@modules/firebase/firebase.service";
import { Injectable, HttpException, HttpStatus } from "@nestjs/common";

@Injectable()
export class NotifierService {
  constructor(private readonly firebase: FirebaseService) {}

  public async getNotifierList(): Promise<CoreResponse<Array<string>>> {
    try {
      const querySnapshot = await this.firebase
        .collection(Collections.NOTIFICATION_EMAILS)
        .get();

      const list: string[] = querySnapshot.docs.map((doc) => doc.id);
      return new CoreResponse(list);
    } catch (error) {
      console.error('Failed to fetch Notifier Emails:', error);
      throw new HttpException('Failed to fetch Notifier Emails', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async addNotifierEmail(email: string): Promise<CoreResponse<{}>> {
    if (!email || !email.includes('@')) {
      throw new HttpException('Invalid email address', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.firebase
        .collection(Collections.NOTIFICATION_EMAILS)
        .doc(email)
        .set({});

      return new CoreResponse();
    } catch (error) {
      console.error('Failed to post Notifier Email:', error);
      throw new HttpException('Failed to post Notifier Email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async deleteNotifierEmail(email: string): Promise<CoreResponse<{}>> {
    if (!email || !email.includes('@')) {
      throw new HttpException('Invalid email address', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.firebase
        .collection(Collections.NOTIFICATION_EMAILS)
        .doc(email)
        .delete();

      return new CoreResponse();
    } catch (error) {
      console.error('Failed to delete Notifier Email:', error);
      throw new HttpException('Failed to delete Notifier Email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}