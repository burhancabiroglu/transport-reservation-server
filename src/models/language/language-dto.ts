import { IsString } from "class-validator";

export class LanguageDto {
  @IsString()
  code: string;
  @IsString()
  name: string;
  map: Map<string,string>;
  hash?: string;
}
