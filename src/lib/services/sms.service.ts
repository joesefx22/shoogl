import axios from 'axios';

interface SMSOptions {
  to: string;
  message: string;
  senderId?: string;
}

interface SMSTemplates {
  bookingConfirmation: (data: any) => string;
  paymentSuccess: (data: any) => string;
  bookingReminder: (data: any) => string;
  otp: (data: any) => string;
}

export class SMSService {
  private client: any;
  private templates: SMSTemplates;

  constructor() {
    // تكامل مع Unifonic (خدمة SMS مصرية)
    this.client = axios.create({
      baseURL: process.env.SMS_API_URL || 'https://api.unifonic.com',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.templates = {
      bookingConfirmation: (data) => 
        `احجزلي: تم تأكيد حجزك في ${data.stadiumName}\nالتاريخ: ${data.date}\nالوقت: ${data.time}\nرقم الحجز: ${data.bookingId}\nشكراً لاستخدامك احجزلي`,

      paymentSuccess: (data) =>
        `احجزلي: تم الدفع بنجاح ${data.amount} ج.م\nرقم المعاملة: ${data.transactionId}\nشكراً لثقتك باحجزلي`,

      bookingReminder: (data) =>
        `احجزلي: تذكير بحجزك غداً في ${data.stadiumName}\nالوقت: ${data.time}\nيرجى الحضور قبل الموعد بـ 15 دقيقة`,

      otp: (data) =>
        `احجزلي: رمز التحقق هو ${data.otp}\nصالح لمدة 10 دقائق`,
    };
  }

  async sendSMS(options: SMSOptions) {
    try {
      // إذا لم يكن هناك تكامل SMS، نستخدم mock للتنمية
      if (process.env.NODE_ENV === 'development' || !process.env.SMS_API_KEY) {
        console.log('SMS Mock (Development):', {
          to: options.to,
          message: options.message,
          senderId: options.senderId || 'Ehgzly',
        });
        return { success: true, messageId: 'mock-' + Date.now() };
      }

      // إرسال SMS حقيقي عبر Unifonic
      const response = await this.client.post('/rest/Messages/Send', {
        AppSid: process.env.SMS_APP_SID,
        SenderID: options.senderId || process.env.SMS_SENDER_ID || 'Ehgzly',
        Recipient: options.to,
        Body: options.message,
        CorrelationID: Date.now().toString(),
        BaseEncode: true,
        StatusCallback: process.env.SMS_STATUS_CALLBACK,
      });

      if (response.data.success === 'true') {
        return {
          success: true,
          messageId: response.data.MessageID,
          data: response.data,
        };
      } else {
        throw new Error(response.data.message || 'فشل في إرسال SMS');
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      
      // Fallback: محاولة إرسال عبر خدمة بديلة أو تسجيل للتحقق لاحقاً
      await this.logFailedSMS(options, error);
      
      throw error;
    }
  }

  async sendTemplateSMS(
    template: keyof SMSTemplates,
    to: string,
    data: any,
    senderId?: string
  ) {
    const message = this.templates[template](data);
    
    return this.sendSMS({
      to,
      message,
      senderId,
    });
  }

  async sendBookingConfirmationSMS(data: {
    to: string;
    stadiumName: string;
    date: string;
    time: string;
    bookingId: string;
  }) {
    return this.sendTemplateSMS('bookingConfirmation', data.to, data);
  }

  async sendPaymentSuccessSMS(data: {
    to: string;
    amount: number;
    transactionId: string;
  }) {
    return this.sendTemplateSMS('paymentSuccess', data.to, data);
  }

  async sendOTP(to: string, otp: string) {
    return this.sendTemplateSMS('otp', to, { otp });
  }

  async sendBookingReminder(data: {
    to: string;
    stadiumName: string;
    time: string;
  }) {
    return this.sendTemplateSMS('bookingReminder', data.to, data);
  }

  private async logFailedSMS(options: SMSOptions, error: any) {
    try {
      // يمكنك حفظ محاولات SMS الفاشلة في قاعدة البيانات
      console.log('Failed SMS logged:', {
        to: options.to,
        message: options.message,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Error logging failed SMS:', logError);
    }
  }

  async getSMSBalance() {
    try {
      if (!process.env.SMS_API_KEY) {
        return { balance: 'غير متوفر (وضع التنمية)' };
      }

      const response = await this.client.get('/rest/Account/Balance', {
        params: {
          AppSid: process.env.SMS_APP_SID,
        },
      });

      return {
        balance: response.data.balance,
        currency: response.data.currency,
      };
    } catch (error) {
      console.error('Error getting SMS balance:', error);
      return { balance: 'خطأ في التحقق' };
    }
  }
}

// Singleton instance
let smsInstance: SMSService | null = null;

export function getSMSService(): SMSService {
  if (!smsInstance) {
    smsInstance = new SMSService();
  }
  return smsInstance;
}
