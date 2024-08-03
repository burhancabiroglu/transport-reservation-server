import {
	Controller,
	Get,
	Param,
	UseGuards,
	Body,
	Post,
	ValidationPipe,
	Delete,
	Request
} from "@nestjs/common";
import { AuthGuard } from "@guards/auth.guard";
import { TransferWishService } from "./transfer-wish.service";
import { AdminGuard } from "@guards/admin.guard";
import { type TransferWishRequest } from "@models/wish/transfer-wish.request";
import { type TransferWishDto } from "@models/wish/transfer-wish.dto";
import { type CoreResponse } from "@core/types/core-response";

@Controller("transferWish")
export class TransferWishController {
	constructor(private readonly service: TransferWishService) { }

	@UseGuards(AuthGuard)
	@Post()
	async createTransferWish(
		@Body(ValidationPipe) body: TransferWishRequest,
	): Promise<CoreResponse<string>> {
		return this.service.createTransferWish(body);
	}

	@UseGuards(AuthGuard)
	@Delete(":id")
	async removeTransferWish(
		@Param("id") id: string
	): Promise<CoreResponse<string>> {
		return this.service.removeTransferWish(id);
	}

	@UseGuards(AdminGuard)
	@Get("all")
	async getTransferWishes(): Promise<CoreResponse<TransferWishDto[]>> {
		return this.service.getTransferWishes();
	}

	@UseGuards(AuthGuard)
	@Get()
	async getTransferWishesByUserId(
		@Request() req: Request
	): Promise<CoreResponse<TransferWishDto[]>> {
		return this.service.getTransferWishesByUserId(req["user"]);
	}
}
