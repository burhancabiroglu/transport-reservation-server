import { Injectable } from "@nestjs/common";
import { Collections } from "@core/collections/firebase-collections";
import { FirebaseService } from "@modules/firebase/firebase.service";
import { v4 as uuidv4 } from "uuid";
import { type SeatDAO } from "@models/seat/seat-dao";
import { type TransferDto } from "@models/transfer/transfer.dto";
import { type TransferRequest } from "@models/transfer/transfer.request";
import { type SeatResponse } from "@models/seat/seat-dto";
import { type AppUser } from "@models/user/app-user";
import { type DocumentReference } from "firebase-admin/firestore";
import { CoreResponse } from "@core/types/core-response";
import { UserPayload } from "@models/payload/user-payload";
import { SeatReservation } from "@models/seat/seat-reservation";
import { SeatStatus } from "@core/config/seat-status-enum";
import { ReservationReq } from "@models/seat/reserve-request";

@Injectable()
export class TransferService {
	constructor(private readonly firebase: FirebaseService) { }

	public async updateSeat(
		seatId: string,
		userId: string,
		status: string,
	): Promise<CoreResponse<string>> {
		try {
			// Retrieve the seat document from Firestore
			const seatRef = this.firebase.collection(Collections.SEATS).doc(seatId);
			const seatSnapshot = await seatRef.get();

			// Check if the seat exists
			if (!seatSnapshot.exists) {
				throw new Error("Seat not found");
			}

			// Update the seat document to associate it with the user ID
			await seatRef.set({
				userId: userId,
				seatStatus: status,
			},{merge: true});
			
			return new CoreResponse("OK");
		} catch (error) {
			console.error("Error reserving seat:", error);
			throw new Error("Failed to reserve seat");
		}
	}

	public async getAllTransfers(): Promise<CoreResponse<TransferDto[]>> {
		try {
			// Query transfers collection to find transfers with the specified type
			const querySnapshot = await this.firebase
				.collection(Collections.TRANSFERS)
				.get();

			// Map query results to TransferDto objects
			const transfers: TransferDto[] = querySnapshot.docs.map(
				(doc) => doc.data() as TransferDto,
			);
			return new CoreResponse(transfers);
		} catch (error) {
			console.error("Error fetching transfers:", error);
			throw new Error("Failed to fetch transfers");
		}
	}


	public async getTransfersByStatus(
		transferStatus: string,
	): Promise<CoreResponse<TransferDto[]>> {
		try {
			// Query transfers collection to find transfers with the specified type
			const querySnapshot = await this.firebase
				.collection(Collections.TRANSFERS)
				.where("status", "==", transferStatus)
				.get();

			// Map query results to TransferDto objects
			const transfers: TransferDto[] = querySnapshot.docs.map(
				(doc) => doc.data() as TransferDto,
			);
			return new CoreResponse(transfers);
		} catch (error) {
			console.error("Error fetching transfers by type:", error);
			throw new Error("Failed to fetch transfers by type");
		}
	}

	public async getTransfersByType(
		transferType: string,
	): Promise<CoreResponse<TransferDto[]>> {
		try {
			// Query transfers collection to find transfers with the specified type
			const querySnapshot = await this.firebase
				.collection(Collections.TRANSFERS)
				.where("transferType", "==", transferType)
				.get();

			// Map query results to TransferDto objects
			const transfers: TransferDto[] = querySnapshot.docs.map(
				(doc) => doc.data() as TransferDto,
			);
			return new CoreResponse(transfers);
		} catch (error) {
			console.error("Error fetching transfers by type:", error);
			throw new Error("Failed to fetch transfers by type");
		}
	}

	public async createTransfer(transfer: TransferRequest): Promise<CoreResponse<string>> {
		try {
			// Generate a unique ID for the transfer
			const transferId: string = uuidv4();

			// Create a pre-transfer DTO with a unique ID and other transfer properties
			const transferDto: TransferDto = {
				id: transferId,
				...transfer,
			};

			// Concurrently create seats for the transfer
			await this.createSeats(transferDto);

			// Save the transfer data to Firestore
			await this.firebase
				.collection(Collections.TRANSFERS)
				.doc(transferId)
				.set(transferDto);

			return new CoreResponse(transferId); // Return the generated transfer ID
		} catch (error) {
			console.error("Error creating transfer:", error);
			throw new Error("Failed to create transfer");
		}
	}

	private async createSeats(transferDto: TransferDto): Promise<CoreResponse<string[]>> {
		const { seatCount } = transferDto;
		const seatIds: string[] = [];

		for (let i = 0; i < seatCount; i++) {
			const seatId = await this.createSeat(transferDto);
			seatIds.push(seatId);
		}

		return new CoreResponse(seatIds);
	}

	public async createSeat(dto: TransferDto): Promise<string> {
		try {
			// Generate a unique ID for the seat
			const seatId: string = uuidv4();

			// Create a new SeatDto object
			const seat: SeatDAO = {
				seatId: seatId,
				transferId: dto.id,
				seatStatus: dto.transferStatus,
				informationGiven: false
			};

			// Save the seat data to Firestore
			await this.firebase.collection(Collections.SEATS).doc(seatId).set(seat);

			// Return the generated seatId
			return seatId;
		} catch (error) {
			// Handle any errors that occur during seat creation or saving
			console.error("Error creating or saving seat:", error);
			throw new Error("Failed to create or save seat");
		}
	}

	private async deleteSeatsByTransferId(transferId: string): Promise<CoreResponse<string>> {
		try {
			// Query seats collection to find seats connected to the transferId
			const querySnapshot = await this.firebase
				.collection(Collections.SEATS)
				.where("transferId", "==", transferId)
				.get();

			// Delete each seat document
			const deletePromises = querySnapshot.docs.map((doc) => doc.ref.delete());
			await Promise.all(deletePromises);
			return new CoreResponse("OK");
		} catch (error) {
			console.error("Error deleting seats connected to transfer:", error);
			throw new Error("Failed to delete seats connected to transfer");
		}
	}

	public async removeTransfer(transferId: string): Promise<CoreResponse<string>> {
		try {
			// Delete transfer document
			await this.firebase
				.collection(Collections.TRANSFERS)
				.doc(transferId)
				.delete();

			// Delete seats connected to the transfer
			await this.deleteSeatsByTransferId(transferId);
			return new CoreResponse("OK");
		} catch (error) {
			console.error("Error removing transfer:", error);
			throw new Error("Failed to remove transfer");
		}
	}

	public async getSeatsByTransferId(transferId: string): Promise<CoreResponse<SeatResponse[]>> {
		try {
			// Query seats collection to find seats connected to the transferId
			const querySnapshot = await this.firebase
				.collection(Collections.SEATS)
				.where("transferId", "==", transferId)
				.get();

			// Map query results to SeatDto objects
			const seats: SeatDAO[] = querySnapshot.docs.map(
				(doc) => doc.data() as SeatDAO,
			);
			const seatResponse: Promise<SeatResponse>[] = seats.map(async (doc) => {
				if (!doc.userId) {
					return { ...doc };
				}
				else {
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
				}

			});
			return new CoreResponse(await Promise.all(seatResponse));
		} catch (error) {
			console.error("Error fetching seats by transfer ID:", error);
			throw new Error("Failed to fetch seats by transfer ID");
		}
	}

	public async updateTransfer(
		transferId: string,
		update: Partial<TransferRequest>,
	): Promise<CoreResponse<string>> {
		try {
			// Retrieve the existing transfer data from Firestore
			const transferSnapshot = await this.firebase
				.collection(Collections.TRANSFERS)
				.doc(transferId)
				.get();
			if (!transferSnapshot.exists) {
				throw new Error("Transfer not found");
			}

			// Merge the update into the existing transfer data
			const existingTransferData = transferSnapshot.data() as TransferDto;
			const updatedTransferData: TransferDto = {
				...existingTransferData,
				...update,
			};

			// Update the transfer data in Firestore
			await this.firebase
				.collection(Collections.TRANSFERS)
				.doc(transferId)
				.set(updatedTransferData);

			return new CoreResponse("OK");
		} catch (error) {
			console.error("Error updating transfer:", error);
			throw new Error("Failed to update transfer");
		}
	}

	public async getTransfersByQuery(
		transferStatus: string,
		transferType: string
	): Promise<CoreResponse<TransferDto[]>> {
		try {
			// Query transfers collection to find transfers with the specified type
			const querySnapshot = await this.firebase
				.collection(Collections.TRANSFERS)
				.where("transferType","==",transferType)
				.where("transferStatus","==",transferStatus)
				.get();

			// Map query results to TransferDto objects
			const transfers: TransferDto[] = querySnapshot.docs.map(
				(doc) => doc.data() as TransferDto,
			);
			return new CoreResponse(transfers);
		} catch (error) {
			console.error("Error fetching transfers by query", error);
			throw new Error("Failed to fetch transfers by query");
		}
	}
	
	public async getUserReservations(payload: UserPayload): Promise<CoreResponse<SeatReservation[]>> {
		try {
			// Query seats collection to find seats connected to the transferId
			const querySnapshot = await this.firebase
				.collection(Collections.SEATS)
				.where("userId", "==", payload.uid)
				.get();

			// Map query results to SeatDto objects
			const seats: SeatDAO[] = querySnapshot.docs.map(
				(doc) => doc.data() as SeatDAO,
			);
			const seatReservations: Promise<SeatReservation>[] = seats.map(async (doc) => {
				const transferRef: DocumentReference = this.firebase.collection(Collections.TRANSFERS).doc(doc.transferId);
				const transferSnapshot = await transferRef.get();
				const transfer = transferSnapshot.data() as TransferDto;
				const userRef: DocumentReference = this.firebase.collection(Collections.USERS).doc(doc.userId);
				const userSnapshot = await userRef.get();
				const user = userSnapshot.data() as AppUser;
				return {
					...doc,
					email: user.email,
					fullname: `${user.name} ${user.surname}`,
					transferStatus: transfer.transferStatus,
					transferType: transfer.transferType,
					plannedAt: transfer.plannedAt
				};
			});
			return new CoreResponse(await Promise.all(seatReservations));
		} catch (error) {
			console.error("Error fetching seats by transfer ID:", error);
			throw new Error("Failed to fetch seats by transfer ID");
		}
	}

	public async reserveSeat(
		body: ReservationReq,
		userId: string,
	): Promise<CoreResponse<string>> {
		try {
			// Retrieve the seat document from Firestore
			const seatRef = this.firebase.collection(Collections.SEATS).doc(body.seatId);
			const seatSnapshot = await seatRef.get();

			// Check if the seat exists
			if (!seatSnapshot.exists) {
				throw new Error("Seat not found");
			}

			// Update the seat document to associate it with the user ID
			await seatRef.set({
				userId: userId,
				message: body.message,
				seatStatus: SeatStatus.FULL,
			},{merge: true});
			
			return new CoreResponse("OK");
		} catch (error) {
			console.error("Error reserving seat:", error);
			throw new Error("Failed to reserve seat");
		}
	}
}
