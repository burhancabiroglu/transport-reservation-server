import { DynamicModule, Module } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";
import { ScryptService } from "./scrypt.service";

@Module({})
export class FirebaseModule {
  static forRoot(): DynamicModule {
    return {
      module: FirebaseModule,
      providers: [FirebaseService, ScryptService],
      exports: [FirebaseService, ScryptService],
      global: true,
    }
  }
}
