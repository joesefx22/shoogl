import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: any[];
}

interface EmailTemplates {
  bookingConfirmation: (data: any) => { subject: string; html: string };
  paymentSuccess: (data: any) => { subject: string; html: string };
  bookingCancelled: (data: any) => { subject: string; html: string };
  welcome: (data: any) => { subject: string; html: string };
  resetPassword: (data: any) => { subject: string; html: string };
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private templates: EmailTemplates;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    this.templates = {
      bookingConfirmation: (data) => ({
        subject: `✅ تأكيد حجزك في ${data.stadiumName}`,
        html: `
          <!DOCTYPE html>
          <html dir="rtl">
          <head>
            <meta charset="UTF-8">
            <title>تأكيد الحجز</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ تم تأكيد حجزك</h1>
              </div>
              <div class="content">
                <h2>مرحباً ${data.userName},</h2>
                <p>تم تأكيد حجزك بنجاح! إليك تفاصيل الحجز:</p>
                
                <div class="booking-details">
                  <h3>${data.stadiumName}</h3>
                  <p><strong>📅 التاريخ:</strong> ${data.date}</p>
                  <p><strong>⏰ الوقت:</strong> ${data.startTime} - ${data.endTime}</p>
                  <p><strong>💰 المبلغ:</strong> ${data.amount} ج.م</p>
                  <p><strong>🔢 رقم الحجز:</strong> ${data.bookingId}</p>
                  <p><strong>📍 العنوان:</strong> ${data.location}</p>
                </div>
                
                <p><strong>تعليمات مهمة:</strong></p>
                <ol>
                  <li>احضر قبل الموعد بـ 15 دقيقة</li>
                  <li>أحضر معك رقم الحجز أو QR Code</li>
                  <li>للاستفسار: ${data.contactPhone}</li>
                </ol>
                
                <div class="footer">
                  <p>شكراً لاستخدامك احجزلي ⚽</p>
                  <p>© ${new Date().getFullYear()} احجزلي. جميع الحقوق محفوظة.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      }),

      paymentSuccess: (data) => ({
        subject: '✅ تمت عملية الدفع بنجاح',
        html: `
          <!DOCTYPE html>
          <html dir="rtl">
          <head>
            <meta charset="UTF-8">
            <title>تم الدفع بنجاح</title>
          </head>
          <body>
            <h2>✅ تم دفع ${data.amount} ج.م بنجاح</h2>
            <p>رقم المعاملة: ${data.transactionId}</p>
            <p>رقم الحجز: ${data.bookingId}</p>
          </body>
          </html>
        `,
      }),

      bookingCancelled: (data) => ({
        subject: '⚠️ تم إلغاء الحجز',
        html: `
          <!DOCTYPE html>
          <html dir="rtl">
          <head>
            <meta charset="UTF-8">
            <title>إلغاء الحجز</title>
          </head>
          <body>
            <h2>تم إلغاء حجزك في ${data.stadiumName}</h2>
            <p>تم استرجاع ${data.refundAmount} ج.م إلى حسابك</p>
            <p>سبب الإلغاء: ${data.reason}</p>
          </body>
          </html>
        `,
      }),

      welcome: (data) => ({
        subject: '🎉 أهلاً بك في احجزلي!',
        html: `
          <!DOCTYPE html>
          <html dir="rtl">
          <head>
            <meta charset="UTF-8">
            <title>أهلاً بك</title>
          </head>
          <body>
            <h2>مرحباً ${data.name} 👋</h2>
            <p>نشكرك على انضمامك لاحجزلي!</p>
            <p>يمكنك الآن حجز الملاعب بسهولة وأمان.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/stadiums">📅 ابدأ بحجز أول ملعب</a>
          </body>
          </html>
        `,
      }),

      resetPassword: (data) => ({
        subject: '🔑 إعادة تعيين كلمة المرور',
        html: `
          <!DOCTYPE html>
          <html dir="rtl">
          <head>
            <meta charset="UTF-8">
            <title>إعادة تعيين كلمة المرور</title>
          </head>
          <body>
            <h2>إعادة تعيين كلمة المرور</h2>
            <p>اضغط على الرابط التالي لإعادة تعيين كلمة المرور:</p>
            <a href="${data.resetUrl}">إعادة تعيين كلمة المرور</a>
            <p>الرابط صالح لمدة ساعة واحدة</p>
          </body>
          </html>
        `,
      }),
    };
  }

  async sendEmail(options: EmailOptions) {
    try {
      const mailOptions = {
        from: `"احجزلي" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
        attachments: options.attachments || [],
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }

  async sendTemplateEmail(
    template: keyof EmailTemplates,
    to: string | string[],
    data: any
  ) {
    const templateData = this.templates[template](data);
    
    return this.sendEmail({
      to,
      subject: templateData.subject,
      html: templateData.html,
    });
  }

  async sendBookingConfirmation(data: {
    to: string;
    userName: string;
    stadiumName: string;
    date: string;
    startTime: string;
    endTime: string;
    amount: number;
    bookingId: string;
    location: string;
    contactPhone: string;
  }) {
    return this.sendTemplateEmail('bookingConfirmation', data.to, data);
  }

  async sendPaymentSuccess(data: {
    to: string;
    amount: number;
    transactionId: string;
    bookingId: string;
  }) {
    return this.sendTemplateEmail('paymentSuccess', data.to, data);
  }

  async sendWelcomeEmail(data: {
    to: string;
    name: string;
  }) {
    return this.sendTemplateEmail('welcome', data.to, data);
  }
}

// Singleton instance
let emailInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailInstance) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      throw new Error('SMTP configuration is missing');
    }
    emailInstance = new EmailService();
  }
  return emailInstance;
}
