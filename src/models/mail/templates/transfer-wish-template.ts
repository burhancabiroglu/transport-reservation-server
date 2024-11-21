import { TransferWishDto } from "@models/wish/transfer-wish.dto";
import { MailOptions } from "nodemailer/lib/sendmail-transport";

export function transferWishNotificationTemplate(
  sender: string,
  adminEmail: string,
  transferWish: TransferWishDto,
): MailOptions {
  return {
    from: `Babi Eğitim ve Danışmanlık <${sender.trim()}>`,
    to: adminEmail.trim(),
    subject: "Yeni Transfer Talebi Bildirimi",
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                padding: 20px;
                background-color: #ffffff;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                margin: 50px auto;
                max-width: 600px;
                border-radius: 8px;
            }
            .header {
                background-color: #0078D4;
                color: white;
                padding: 10px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .content {
                padding: 20px;
                text-align: left;
            }
            .footer {
                text-align: center;
                padding: 10px;
                font-size: 12px;
                color: #888888;
            }
            .highlight {
                font-weight: bold;
                color: #0078D4;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Yeni Transfer Talebi</h1>
            </div>
            <div class="content">
                <p>Merhaba,</p>
                <p>Yeni bir transfer talebi alınmıştır:</p>
                <p><strong>Ad Soyad:</strong> <span class="highlight">${transferWish.fullname}</span></p>
                <p><strong>Email:</strong> <span class="highlight">${transferWish.email}</span></p>
                <p><strong>Transfer Türü:</strong> <span class="highlight">${transferWish.transferType}</span></p>
                ${
                  transferWish.additionalNote
                    ? `<p><strong>Ek Not:</strong> ${transferWish.additionalNote}</p>`
                    : ''
                }
                <p><strong>Talep Tarihi:</strong> <span class="highlight">${transferWish.createdAt}</span></p>
            </div>
            <div class="footer">
                <p>Saygılarımızla,<br>Babi Eğitim ve Danışmanlık</p>
            </div>
        </div>
    </body>
    </html>
    `,
  };
}