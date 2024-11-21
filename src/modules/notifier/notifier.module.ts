import { Module } from "@nestjs/common";
import { NotifierController } from "./notifier.controller";
import { NotifierService } from "./notifier.service";

@Module({
  providers: [NotifierService],
  controllers: [NotifierController],
  exports: [NotifierService]
})
export class NotifierModule {}