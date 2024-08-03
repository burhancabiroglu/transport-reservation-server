import { TransferDto } from "@models/transfer/transfer.dto";
import { IsNotEmpty } from "class-validator";

export class MailRequest {
    @IsNotEmpty()
    fullname: string;
    @IsNotEmpty()
    email: string;
    transferDto?: TransferDto;
}