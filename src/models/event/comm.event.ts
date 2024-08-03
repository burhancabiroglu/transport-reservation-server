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

export class TransferConfirmationEvent extends CommunicationEvent {}