
import { CommunicationService } from "./comm.service";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { 
  CommunicationEvent, 
  PasswordResetEvent, 
  UserConfirmationEvent 
} from "@models/event/comm.event";


@EventsHandler(CommunicationEvent)
export class CommunicationHandler implements IEventHandler<CommunicationEvent> {
	constructor(private readonly service: CommunicationService) { }

  async handle(event: CommunicationEvent) {
    switch(event.constructor) {
      case UserConfirmationEvent:
        const p0 = event as UserConfirmationEvent
        return this.service.sendAuthConfirmation(p0.fullname,p0.email);
      case PasswordResetEvent:
        const p1 = event as PasswordResetEvent;
        return this.service.sendResetPasswordLink(p1.link,p1.email);
    }
  }  
}
