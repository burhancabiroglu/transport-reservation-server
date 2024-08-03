import { NestFactory } from "@nestjs/core";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "@modules/auth/auth.module";
import { FirebaseModule } from "@modules/firebase/firebase.module";
import { UsersModule } from "@modules/users/users.module";
import { TransferWishModule } from "@modules/wish/transfer-wish.module";
import { TransferModule } from "@modules/transfer/transfer.module";
import { AppInfoModule } from "@modules/app-info/app-info.module";
import { JwtModule } from "@nestjs/jwt";
import { CqrsModule } from "@nestjs/cqrs";
import { CommunicationModule } from "@modules/comm/comm.module";
import { PolicyModule } from "@modules/policy/policy.module";


@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		CqrsModule.forRoot(),
		JwtModule.registerAsync({
			useFactory: async (conf: ConfigService) => {
				return {
					secret: conf.get("ACCESS_TOKEN_SECRET"),
					signOptions: { expiresIn: "14d" },
				}
			},
			global: true,
			inject: [ConfigService],
		
		}),
		FirebaseModule.forRoot(),
		UsersModule,
		AppInfoModule,
		AuthModule,
		TransferModule,
		TransferWishModule,
		CommunicationModule,
		PolicyModule
	],
	controllers: [],
	providers: [],
})
export class MainModule { }

async function bootstrap() {
	const app = await NestFactory.create(MainModule);
	app.enableCors();
	await app.listen(process.env.PORT || 3000);
}
bootstrap();
