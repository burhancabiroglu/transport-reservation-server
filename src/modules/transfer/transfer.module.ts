import { Module } from "@nestjs/common";
import { TransferController } from "./transfer.controller";
import { TransferService } from "./transfer.service";
import { AuthModule } from "@modules/auth/auth.module";

@Module({
  imports: [AuthModule ],
  controllers: [TransferController],
  providers: [TransferService],
})
export class TransferModule {}
