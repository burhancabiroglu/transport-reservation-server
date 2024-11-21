
import { CommunicationService } from "./comm.service";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { 
  CommunicationEvent, 
  PasswordResetEvent, 
  UserAlertEvent, 
  UserConfirmationEvent 
} from "@models/event/comm.event";


@EventsHandler(CommunicationEvent)
export class CommunicationHandler implements IEventHandler<CommunicationEvent> {
	constructor(private readonly service: CommunicationService) { }

  async handle(event: CommunicationEvent) {
    switch(true) {
      case event instanceof UserConfirmationEvent:
        return this.service.sendAuthConfirmation(event.fullname,event.email);
      case event instanceof PasswordResetEvent:
        return this.service.sendResetPasswordLink(event.link,event.email);
      case event instanceof UserAlertEvent:
        return this.service.sendUserAlert(event.fullname,event.email);
      case event instanceof UserAlertEvent:
        return this.service.sendUserAlert(event.fullname,event.email);
    }
  }  
}
