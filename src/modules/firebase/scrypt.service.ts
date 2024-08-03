import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FirebaseScrypt, FirebaseScryptOptions } from "firebase-scrypt";

@Injectable()
export class ScryptService {
  private machine: FirebaseScrypt;

  constructor(readonly configService: ConfigService) {
    this.machine = new FirebaseScrypt(this.parameters);
  }

  private get parameters(): FirebaseScryptOptions {
    return {
      signerKey: this.configService.get("BASE64_SIGNER_KEY"),
      saltSeparator: this.configService.get("BASE64_SALT_SEPARATOR"),
      rounds: parseInt(this.configService.get("ROUNDS")),
      memCost: parseInt(this.configService.get("MEM_COST")),
    };
  }

  async verify(password: string,passwordSalt: string, passwordHash: string): Promise<boolean> {
    return await this.machine.verify(password, passwordSalt, passwordHash);
  }
}
