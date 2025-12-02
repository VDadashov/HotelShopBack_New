import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { CreateContactDto } from '../../contact/dto/create-contact.dto';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: true, // 587 üçün false, 465 üçün true
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  // Admin-ə yeni contact mesajı haqqında bildiriş
  async sendContactNotificationToAdmin(contactData: CreateContactDto) {
    const adminEmail = this.configService.get('ADMIN_EMAIL') || this.configService.get('MAIL_USER');
    
    const mailOptions = {
      from: this.configService.get('MAIL_USER'),
      to: adminEmail,
      subject: '🔔 Yeni Contact Mesajı - GStone',
      html: this.getAdminNotificationTemplate(contactData),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (err) {
      // Email göndərilərkən xəta
    }
  }

  // İstifadəçiyə təsdiq mesajı
  async sendContactConfirmationToUser(contactData: CreateContactDto) {
    const mailOptions = {
      from: this.configService.get('MAIL_USER'),
      to: contactData.email,
      subject: '✅ Mesajınız Alındı - GStone',
      html: this.getUserConfirmationTemplate(contactData),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (err) {
      // Email göndərilərkən xəta
    }
  }

  // Admin üçün email template
  private getAdminNotificationTemplate(data: CreateContactDto): string {
    return `
      <!DOCTYPE html>
      <html lang="az">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Yeni Contact Mesajı</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #333; margin-bottom: 5px; display: block; }
          .value { background: #f8f9fa; padding: 12px; border-radius: 5px; border-left: 4px solid #667eea; }
          .message-box { background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; border-top: 1px solid #eee; }
          .urgent { color: #dc3545; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Yeni Contact Mesajı</h1>
            <p>GStone saytından yeni mesaj alındı</p>
          </div>
          
          <div class="content">
            <div class="field">
              <span class="label">👤 Ad və Soyad:</span>
              <div class="value">${data.name}</div>
            </div>
            
            <div class="field">
              <span class="label">📧 Email:</span>
              <div class="value">
                <a href="mailto:${data.email}">${data.email}</a>
              </div>
            </div>
            
            <div class="field">
              <span class="label">💬 Mesaj:</span>
              <div class="message-box">${data.message}</div>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <p class="urgent">⏰ Bu mesaja tez bir zamanda cavab verin!</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Bu email avtomatik olaraq GStone sistemi tərəfindən göndərilmişdir.</p>
            <p>© ${new Date().getFullYear()} GStone. Bütün hüquqlar qorunur.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // İstifadəçi üçün email template
  private getUserConfirmationTemplate(data: CreateContactDto): string {
    return `
      <!DOCTYPE html>
      <html lang="az">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mesajınız Alındı</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .success-icon { font-size: 48px; margin-bottom: 10px; }
          .message-summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50; }
          .contact-info { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; border-top: 1px solid #eee; }
          .btn { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1>Mesajınız Alındı!</h1>
            <p>Hörmətli ${data.name}, mesajınız uğurla qəbul edildi</p>
          </div>
          
          <div class="content">
            <p>Salam <strong>${data.name}</strong>,</p>
            
            <p>GStone şirkətinə müraciətiniz üçün təşəkkür edirik. Mesajınız bizim komandamız tərəfindən qəbul edilmiş və tezliklə baxılacaq.</p>
            
            <div class="message-summary">
              <h3>📋 Mesajınızın Xülasəsi:</h3>
              <p><strong>Email:</strong> ${data.email}</p>
            </div>
            
            <div class="contact-info">
              <h3>📞 Bizim Əlaqə Məlumatlarımız:</h3>
              <p><strong>Email:</strong> info@gstone.az</p>
              <p><strong>Telefon:</strong> +994 XX XXX XX XX</p>
              <p><strong>Ünvan:</strong> Bakı şəhəri, Azərbaycan</p>
            </div>
            
            <p>Adətən 24-48 saat ərzində mesajlarınıza cavab veririk. Əgər təcili məsələniz varsa, birbaşa telefon nömrəmizlə əlaqə saxlaya bilərsiniz.</p>
            
            <div style="text-align: center;">
              <a href="https://gstone.az" class="btn">Saytımızı Ziyarət Edin</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Bu email avtomatik olaraq göndərilmişdir. Bu mesaja cavab verməyin.</p>
            <p>© ${new Date().getFullYear()} GStone. Bütün hüquqlar qorunur.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
} 