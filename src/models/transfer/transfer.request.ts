import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class TransferRequest {
  @IsNotEmpty()
  readonly transferType: string;

  @IsNotEmpty()
  @IsString()
  readonly additionalNote: string;

  @IsNotEmpty()
  readonly plannedAt: string;

  @IsNotEmpty()
  @IsNumber()
  readonly seatCount: number;

  @IsNotEmpty()
  readonly transferStatus: string;
}
