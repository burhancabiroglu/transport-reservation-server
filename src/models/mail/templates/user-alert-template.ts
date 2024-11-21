import { MailOptions } from "nodemailer/lib/sendmail-transport";

export function userAlertTemplate(
  sender: string,
  adminEmail: string,
  newMemberName: string,
  newMemberEmail: string,
): MailOptions {
  return {
    from: `Babi Eğitim ve Danışmanlık <${sender.trim()}>`,
    to: adminEmail.trim(),
    subject: "Yeni Üye Kaydı Bildirimi",
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
                background-color: #d9534f;
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
                color: #d9534f;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Yeni Üye Kaydı</h1>
            </div>
            <div class="content">
                <p>Merhaba,</p>
                <p>Aramıza yeni bir üye katıldı:</p>
                <p><strong>Ad Soyad:</strong> <span class="highlight">${newMemberName}</span></p>
                <p><strong>Email:</strong> <span class="highlight">${newMemberEmail}</span></p>
                <p>Gerekli durumlarda takip edebilirsiniz.</p>
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