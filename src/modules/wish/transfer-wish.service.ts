import { Injectable } from "@nestjs/common";
import { Collections } from "@core/collections/firebase-collections";
import { v4 as uuidv4 } from "uuid";
import { CoreResponse } from "@core/types/core-response";
import { type TransferWishDAO } from "@models/wish/transfer-wish.dao";
import { type DocumentReference } from "firebase-admin/firestore";
import { type AppUser } from "@models/user/app-user";
import { type TransferWishRequest } from "@models/wish/transfer-wish.request";
import { type TransferWishDto } from "@models/wish/transfer-wish.dto";
import { type UserPayload } from "@models/payload/user-payload";
import { FirebaseService } from "@modules/firebase/firebase.service";
import { EventBus } from "@nestjs/cqrs";
import { TransferWishAlertEvent } from "@models/event/comm.event";

@Injectable()
export class TransferWishService {
	constructor(
		private readonly firebase: FirebaseService,
		private readonly eventBus: EventBus
	) { }

	public async createTransferWish(request: TransferWishRequest): Promise<CoreResponse<string>> {
		try {
			// Generate a unique ID for the transfer
			const id: string = uuidv4();

			// Create a pre-transfer DTO with a unique ID and other transfer properties

			const dao: TransferWishDAO = {
				id: id,
				transferType: request.transferType,
				createdAt: Date.now().toString(),
				userId: request.userId,
				additionalNote: request.additionalNote
			}
			await this.firebase
				.collection(Collections.TRANSFER_REQUESTS)
				.doc(id)
				.set(dao);

			const dto = await this.getTransferWishesById(id)	
			await this.eventBus.publish(new TransferWishAlertEvent(dto))	
			return new CoreResponse(id); // Return the generated transfer ID
		} catch (error) {
			console.error("Error creating transfer wish:", error);
			throw new Error("Failed to create transfer wish");
		}
	}

	public async removeTransferWish(id: string): Promise<CoreResponse<string>> {
		try {
			// Delete transfer document
			await this.firebase
				.collection(Collections.TRANSFER_REQUESTS)
				.doc(id)
				.delete();
			return new CoreResponse("OK")
		} catch (error) {
			console.error("Error removing transfer wish:", error);
			throw new Error("Failed to remove transfer wish");
		}
	}

	public async getTransferWishes(): Promise<CoreResponse<TransferWishDto[]>> {
		try {
			const querySnapshot = await this.firebase
				.collection(Collections.TRANSFER_REQUESTS)
				.get();

			const list: TransferWishDAO[] = querySnapshot.docs.map(
				(doc) => doc.data() as TransferWishDAO,
			);
			const response: Promise<TransferWishDto>[] = list.map(async (doc) => {
				const ref: DocumentReference = this.firebase
						.collection(Collections.USERS)
						.doc(doc.userId);
					const snapshot = await ref.get();

					const user = snapshot.data() as AppUser;
					return {
						...doc,
						email: user.email,
						fullname: `${user.name} ${user.surname}`
					};
			});
			return new CoreResponse(await Promise.all(response))
		} catch (error) {
			console.error("Error fetching TransferWishDto", error);
			throw new Error("Failed to fetch TransferWishDto");
		}
	}

	public async getTransferWishesByUserId(payload: UserPayload): Promise<CoreResponse<TransferWishDto[]>> {
		try {
			const querySnapshot = await this.firebase
				.collection(Collections.TRANSFER_REQUESTS)
				.where("userId","==",payload.uid)
				.get();

			const list: TransferWishDAO[] = querySnapshot.docs.map(
				(doc) => doc.data() as TransferWishDAO,
			);
			const response: Promise<TransferWishDto>[] = list.map(async (doc) => {
				const ref: DocumentReference = this.firebase
						.collection(Collections.USERS)
						.doc(doc.userId);
					const snapshot = await ref.get();

					const user = snapshot.data() as AppUser;
					return {
						...doc,
						email: user.email,
						fullname: `${user.name} ${user.surname}`
					};
			});
			return new CoreResponse(await Promise.all(response));
		} catch (error) {
			console.error("Error fetching TransferWishDto by userId", error);
			throw new Error("Failed to fetch TransferWishDto by userId");
		}
	}
	

	public async getTransferWishesById(id: string): Promise<TransferWishDto> {
		try {
			const querySnapshot = await this.firebase
				.collection(Collections.TRANSFER_REQUESTS)
				.doc(id)
				.get();

			const dao = querySnapshot.data() as TransferWishDAO;
			const ref: DocumentReference = this.firebase
				.collection(Collections.USERS)
				.doc(dao.userId);
			const snapshot = await ref.get();

			const user = snapshot.data() as AppUser;
			return {
				...dao,
				email: user.email,
				fullname: `${user.name} ${user.surname}`
			};
		} catch (error) {
			console.error("Error fetching TransferWishDto by id", error);
			throw new Error("Failed to fetch TransferWishDto by id");
		}
	}
}
