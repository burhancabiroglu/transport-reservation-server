import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class TransferWishRequest {
    @IsNotEmpty()
    @IsNumber()
    readonly transferType: string;

    readonly additionalNote?: string;

    @IsNotEmpty()
    @IsString()
    readonly userId: string;
}