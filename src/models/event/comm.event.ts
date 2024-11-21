import { TransferWishDto } from "@models/wish/transfer-wish.dto";

export abstract class CommunicationEvent { }

export class UserConfirmationEvent extends CommunicationEvent {
  constructor(
    public readonly email: string,
    public readonly fullname: string,
  ) { super(); }
}

export class PasswordResetEvent extends CommunicationEvent {
  constructor(
    public readonly link: string,
    public readonly email: string,
  ) { super(); }
}

export class UserAlertEvent extends CommunicationEvent {
  constructor(
    public readonly fullname: string,
    public readonly email: string,
  ) { super(); }
}

export class TransferWishAlertEvent extends CommunicationEvent {
  constructor(
    public readonly data: TransferWishDto,
  ) { super(); }
}

export class TransferConfirmationEvent extends CommunicationEvent {}