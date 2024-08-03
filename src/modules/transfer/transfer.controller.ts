import {
	Controller,
	Get,
	Param,
	UseGuards,
	Request,
	Body,
	Post,
	ValidationPipe,
	Delete,
	Put,
	Query,
	Req,
} from "@nestjs/common";
import { AuthGuard } from "@guards/auth.guard";
import { TransferService } from "./transfer.service";
import { AdminGuard } from "@guards/admin.guard";
import { type UserPayload } from "@models/payload/user-payload";
import { type TransferDto } from "@models/transfer/transfer.dto";
import { type TransferRequest } from "@models/transfer/transfer.request";
import { type CoreResponse} from "@core/types/core-response";
import { type SeatResponse } from "@models/seat/seat-dto";
import { SeatReservation } from "@models/seat/seat-reservation";
import { ReservationReq } from "@models/seat/reserve-request";

@Controller("transfer")
export class TransferController {
	constructor(private readonly service: TransferService) { }

	@UseGuards(AuthGuard)
	@Get()
	async getAllTransfers(): Promise<CoreResponse<TransferDto[]>> {
		return this.service.getAllTransfers();
	}

	@UseGuards(AuthGuard)
	@Get("status/:status")
	async getTransfersByStatus(
		@Param("status") status: string,
	): Promise<CoreResponse<TransferDto[]>> {
		return this.service.getTransfersByStatus(status);
	}

	@UseGuards(AuthGuard)
	@Get("type/:type")
	async getTransfersByType(
		@Param("type") type: string,
	): Promise<CoreResponse<TransferDto[]>> {
		return this.service.getTransfersByType(type);
	}

	@UseGuards(AdminGuard)
	@Post()
	async createTransfer(
		@Body(ValidationPipe) transfer: TransferRequest,
	): Promise<CoreResponse<string>> {
		return this.service.createTransfer(transfer);
	}

	@UseGuards(AdminGuard)
	@Delete(":id")
	async removeTransfer(
		@Param("id") id: string
	): Promise<CoreResponse<string>> {
		return this.service.removeTransfer(id);
	}

	@UseGuards(AuthGuard)
	@Put("updateSeat")
	async updateSeat(
		@Req() request: Request,
		@Query("seatId") seatId: string,
		@Query("status") status: string,
	): Promise<CoreResponse<string>> {
		const user = request["user"] as UserPayload;
		return this.service.updateSeat(seatId, user.uid, status);
	}

	@UseGuards(AuthGuard)
	@Get("seats/:id")
	async getSeatsByTransferId(
		@Param("id") transferId: string,
	): Promise<CoreResponse<SeatResponse[]>> {
		return this.service.getSeatsByTransferId(transferId);
	}

	@UseGuards(AdminGuard)
	@Put(":transferId")
	async updateTransfer(
		@Param("transferId") transferId: string,
		@Body(ValidationPipe) update: TransferRequest,
	): Promise<CoreResponse<string>> {
		return this.service.updateTransfer(transferId, update);
	}

	@UseGuards(AuthGuard)
	@Get("query")
	async getTransfersByQuery(
		@Query("transferType") transferType: string,
		@Query("transferStatus") transferStatus: string,
	): Promise<CoreResponse<TransferDto[]>> {
		return this.service.getTransfersByQuery(transferStatus,transferType);
	}

  @UseGuards(AuthGuard)
  @Get("reservation")
  async getUserReservations(@Request() req: Request): Promise<CoreResponse<SeatReservation[]>> {
    return this.service.getUserReservations(req["user"]);
  }

  @UseGuards(AuthGuard)
  @Post("reserveSeat")
  async reserveSeat(
	  @Req() request: Request,
	  @Body() body: ReservationReq,
  ): Promise<CoreResponse<string>> {
	  const user = request["user"] as UserPayload;
	  return this.service.reserveSeat(body, user.uid);
  }
}
