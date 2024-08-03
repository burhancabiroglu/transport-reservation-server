import { Module } from "@nestjs/common";
import { CommunicationService } from "./comm.service";
import { CommunicationHandler } from "./comm.handler";

@Module({
  providers: [CommunicationService,CommunicationHandler],
})
export class CommunicationModule { }
