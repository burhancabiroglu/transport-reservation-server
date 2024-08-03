import { MailOptions } from "nodemailer/lib/sendmail-transport";

export function userTemplate(
	sender: string,
	client: string,
	fullname: string
): MailOptions {
	return {
		from: `Babi Egitim ve Danismanlik <${sender.trim()}>`,
		to: client.trim(),
		subject: "Üyeliğiniz Onaylandı",
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
                text-align: center;
            }
            .footer {
                text-align: center;
                padding: 10px;
                font-size: 12px;
                color: #888888;
            }
            .button {
                background-color: #0078D4;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Üyeliğiniz Onaylandı!</h1>
            </div>
            <div class="content">
                <p>Merhaba, ${fullname}</p>
                <p>Üyeliğiniz onaylanmıştır. Aramıza hoş geldiniz!</p>
            </div>
            <div class="footer">
                <p>Saygılarımızla,<br>Babi Eğitim ve Danışmanlık</p>
            </div>
        </div>
    </body>
    </html>
    `
	}
}