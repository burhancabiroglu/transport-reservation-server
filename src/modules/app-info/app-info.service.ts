import { Collections, DOCS } from "@core/collections/firebase-collections";
import { CoreResponse } from "@core/types/core-response";
import { AboutUsDto } from "@models/about/about-us-dto";
import { LanguageDto } from "@models/language/language-dto";
import { LanguagePair } from "@models/language/language-pair";
import { SupportDto } from "@models/support/support-dto";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { FirebaseService } from "@modules/firebase/firebase.service";
import * as md5Hash from "md5";

@Injectable()
export class AppInfoService {

	constructor(readonly firebase: FirebaseService) { }

	async getAboutUs(): Promise<CoreResponse<AboutUsDto>> {
		try {
			const ref = this.firebase
				.collection(Collections.APP_INFO)
				.doc(DOCS.ABOUT_US)
			const snapshot = await ref.get()
			const dao = snapshot.data() as AboutUsDto;
			if (!snapshot.exists) {
				throw new HttpException(`About Info not found`, HttpStatus.NOT_FOUND);
			}
			return new CoreResponse(dao);
		}
		catch (error: any) {
			if (error instanceof HttpException) {
				throw error;
			} else {
				// If an unexpected error occurs, return a generic 500 error
				throw new HttpException(
					"Internal server error",
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}
		}
	}

	async support(): Promise<CoreResponse<SupportDto>> {
		try {
			const ref = this.firebase
				.collection(Collections.APP_INFO)
				.doc(DOCS.SUPPORT)
			const snapshot = await ref.get()
			const dao = snapshot.data() as SupportDto;
			if (!snapshot.exists) {
				throw new HttpException(`Support Info not found`, HttpStatus.NOT_FOUND);
			}
			return new CoreResponse(dao);
		}
		catch (error: any) {
			if (error instanceof HttpException) {
				throw error;
			} else {
				// If an unexpected error occurs, return a generic 500 error
				throw new HttpException(
					"Internal server error",
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}
		}
	}

	async language(code: string, hash?: string): Promise<CoreResponse<LanguageDto>> {
		try {
			const ref = this.firebase
				.collection(Collections.LANGUAGES)
				.doc(code)
			const snapshot = await ref.get()
			const dto = snapshot.data() as LanguageDto;
			const newHash = md5Hash(JSON.stringify(dto));

			if (!snapshot.exists) {
				throw new HttpException(`Support Info not found`, HttpStatus.NOT_FOUND);
			}

			if(hash === newHash) {
				return new CoreResponse();
			}

			return new CoreResponse({
				...dto,
				hash: newHash
			});
		}
		catch (error: any) {
			if (error instanceof HttpException) {
				throw error;
			} else {
				// If an unexpected error occurs, return a generic 500 error
				throw new HttpException(
					"Internal server error",
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}
		}
	}

	async availableLanguages(): Promise<CoreResponse<LanguagePair[]>> {
		try {
			const ref = this.firebase
				.collection(Collections.LANGUAGES)
			const querySnapshot = await ref.get()

			const languages: LanguagePair[] = querySnapshot.docs.map(
				(doc) =>{
					let dto = (doc.data() as LanguageDto)
					return { code: dto.code,name: dto.name }
				},
			);

			return new CoreResponse(languages);
		}
		catch (error: any) {
			if (error instanceof HttpException) {
				throw error;
			} else {
				// If an unexpected error occurs, return a generic 500 error
				throw new HttpException(
					"Internal server error",
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}
		}
	}

	async uploadLanguage(
		dto: LanguageDto
	): Promise<CoreResponse<string>> {
		try {
			await this.firebase
				.collection(Collections.LANGUAGES)
				.doc(dto.code)
				.set(dto);

			return new CoreResponse("success");
		}
		catch (error: any) {
			if (error instanceof HttpException) {
				throw error;
			} else {
				Logger.error(error);
				// If an unexpected error occurs, return a generic 500 error
				throw new HttpException(
					"Internal server error",
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}
		}
	}
}
