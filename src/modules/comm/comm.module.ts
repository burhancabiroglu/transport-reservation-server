import { Module } from "@nestjs/common";
import { CommunicationService } from "./comm.service";
import { CommunicationHandler } from "./comm.handler";
import { NotifierModule } from "@modules/notifier/notifier.module";

@Module({
  providers: [CommunicationService,CommunicationHandler],
  imports: [NotifierModule]
})
export class CommunicationModule { }
