import { Collections, DOCS } from "@core/collections/firebase-collections";
import { CoreResponse } from "@core/types/core-response";
import { type MailInfoDAO } from "@models/mail/mail-info";
import { resetPasswordTemplate } from "@models/mail/templates/reset-pass-template";
import { userTemplate } from "@models/mail/templates/user-template";
import { TransferDto } from "@models/transfer/transfer.dto";
import { FirebaseService } from "@modules/firebase/firebase.service";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { createTransport, Transporter } from "nodemailer";
import { type MailOptions } from "nodemailer/lib/json-transport";


@Injectable()
export class CommunicationService {
	public sender: MailInfoDAO;
	protected transporter?: Transporter;

	constructor(readonly firebase: FirebaseService) { this.init() }


	private async init() {
		try {
			const { data } = await this.getMailInfo(DOCS.NOREPLY);
			this.sender = data;
			this.createTransporter(data)
		}catch(e: any) {
			Logger.error(e.toString())	
		}
	}

	createTransporter(info: MailInfoDAO) {
		this.transporter = createTransport({
			host: info.host,
			auth: {
				user: info.user,
				pass: info.password,
			},
			secure: true,
			port: Number.parseInt(info.port),
		});
	}

	async sendMail(options: MailOptions): Promise<any> {
		try {
			return await this.transporter?.sendMail(options);
		}
		catch(error: unknown) {
			Logger.error("send mail error", error);
			throw new HttpException(
				"Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async getMailInfo(mailDoc: string): Promise<CoreResponse<MailInfoDAO>> {
		try {
			const mailRef = this.firebase
				.collection(Collections.COMMUNICATION)
				.doc(mailDoc)
			const snapshot = await mailRef.get()
			const dao = snapshot.data() as MailInfoDAO;
			if (!snapshot.exists) {
				throw new HttpException(`${mailDoc} not found`, HttpStatus.NOT_FOUND);
			}
			return new CoreResponse(dao);
		}
		catch (error: any) {
			if (error instanceof HttpException) {
				throw error;
			} else {
				Logger.error("getMailInfo", error);
				// If an unexpected error occurs, return a generic 500 error
				throw new HttpException(
					"Internal server error",
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}
		}
	}


	async sendResetPasswordLink(link: string, email: string): Promise<any> {
		return await this.sendMail(
			resetPasswordTemplate(this.sender.user, email, link)
		)
	}


	async sendAuthConfirmation(fullname: string, email: string): Promise<any> {
		return await this.sendMail(
			userTemplate(this.sender.user, email, fullname)
		)
	}

	async sendTransferConfirmation(email: string,transferInfo: TransferDto) {
		return this.sendMail(
			userTemplate(this.sender.user, email, transferInfo.id)
		)
	}
}
