import { Module } from "@nestjs/common";
import { TransferWishController } from "./transfer-wish.controller";
import { TransferWishService } from "./transfer-wish.service";

@Module({
	imports: [],
	controllers: [TransferWishController],
	providers: [TransferWishService],
})
export class TransferWishModule { }
