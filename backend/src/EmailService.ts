import * as nodemailer from "nodemailer";
import {Transporter} from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import ConfigCache from "./ConfigCache";

export default class EmailService {

    private configCache = new ConfigCache();
    private config = this.configCache.getConfig()

    private transporter: Transporter<SMTPTransport.SentMessageInfo> = nodemailer.createTransport({
        host: this.config.smpServer.host,
        port: this.config.smpServer.port,
        secure: this.config.smpServer.secure,
        auth: {
            user: this.config.smpServer.auth.user,
            pass: this.config.smpServer.auth.pass
        },
    });


    //Send email to the selected user with a pdf
    public async sendPdfEmail(user: {username: string, authCode: string, batchID: string}, docName: string): Promise<boolean> {
        const verificationLink = encodeURI(`http://pscms.lockular.online/read-pdf/${user.authCode}/${user.batchID}/${docName}`);
        // const verificationLink = encodeURI(`http://localhost:3000/read-pdf/${user.authCode}/${user.batchID}/${docName}`);

        let info = await this.transporter.sendMail({
            from: this.config.smpServer.emailAddress, // sender address
            // to: user.email, // list of receivers
            to: "jakubek278@gmail.com", // Milosz personal email for debugging
            subject: "Verification Email - Test", // Subject line
            html: `Your Verification Code ${user.username}: ${verificationLink}`, // html body
        });
        return info.accepted.length > 0;
    }

}
