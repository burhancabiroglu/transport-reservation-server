import { Collections, DOCS } from "@core/collections/firebase-collections";
import { CoreResponse } from "@core/types/core-response";
import { type MailInfoDAO } from "@models/mail/mail-info";
import { userAlertTemplate } from "@models/mail/templates/user-alert-template";
import { resetPasswordTemplate } from "@models/mail/templates/reset-pass-template";
import { userTemplate } from "@models/mail/templates/user-template";
import { TransferDto } from "@models/transfer/transfer.dto";
import { FirebaseService } from "@modules/firebase/firebase.service";
import { NotifierService } from "@modules/notifier/notifier.service";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { createTransport, Transporter } from "nodemailer";
import { type MailOptions } from "nodemailer/lib/json-transport";
import { TransferWishDto } from "@models/wish/transfer-wish.dto";
import { transferWishNotificationTemplate } from "@models/mail/templates/transfer-wish-template";


@Injectable()
export class CommunicationService {
	public sender: MailInfoDAO;
	protected transporter?: Transporter;

	constructor(
		readonly firebase: FirebaseService,
		readonly notifier: NotifierService
	) { this.init() }


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
			pool: true,
			connectionTimeout: 10000, // 10 seconds
			greetingTimeout: 5000, // 5 seconds
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
	async sendUserAlert(fullname: string, email: string): Promise<void> {
		try {
			const response = await this.notifier.getNotifierList();
	
			if (!response.data || response.data.length === 0) {
				console.warn('No admin emails found to notify.');
				return;
			}
	
			// Send all emails in parallel
			await Promise.all(
				response.data.map(async (adminEmail) => {
					try {
						await this.sendMail(
							userAlertTemplate(this.sender.user, adminEmail, fullname, email),
						);
						console.log(`Email sent to ${adminEmail}`);
					} catch (error) {
						console.error(`Failed to send email to ${adminEmail}:`, error);
					}
				}),
			);
	
			console.log('All emails sent successfully');
		} catch (error) {
			console.error('Error while sending new user confirmation emails:', error);
			throw new Error('Failed to send new user confirmation emails');
		}
	}

	
	async sendTransferWishAlert(transferWish: TransferWishDto): Promise<void> {
		try {
			const response = await this.notifier.getNotifierList();
			const adminEmails = response.data;
	
			if (!adminEmails || adminEmails.length === 0) {
				console.warn('No admin emails found to notify.');
				return;
			}
	
			// Send emails in parallel
			await Promise.all(
				adminEmails.map(async (adminEmail) => {
					try {
						await this.sendMail(
							transferWishNotificationTemplate(this.sender.user, adminEmail, transferWish),
						);
						console.log(`Email sent to admin: ${adminEmail}`);
					} catch (error) {
						console.error(`Failed to send email to admin: ${adminEmail}`, error);
					}
				}),
			);
	
			console.log('Admin notifications sent successfully');
		} catch (error) {
			console.error('Error while sending transfer wish notifications:', error);
			throw new Error('Failed to notify admins about transfer wish.');
		}
	}
}
