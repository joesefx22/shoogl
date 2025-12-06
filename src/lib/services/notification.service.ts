import { PrismaClient } from '@prisma/client';
import { getEmailService } from './email.service';

const prisma = new PrismaClient();

interface NotificationData {
  type: string;
  title: string;
  message: string;
  data?: any;
  sendEmail?: boolean;
  sendSMS?: boolean;
}

export class NotificationService {
  private emailService = getEmailService();

  async createNotification(userId: string, data: NotificationData) {
    try {
      // 1. حفظ الإشعار في قاعدة البيانات
      const notification = await prisma.notification.create({
        data: {
          userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data || {},
          isRead: false,
        },
      });

      // 2. إرسال إيميل إذا طلب
      if (data.sendEmail) {
        await this.sendEmailNotification(userId, data);
      }

      // 3. إرسال SMS إذا طلب
      if (data.sendSMS) {
        await this.sendSMSNotification(userId, data);
      }

      // 4. إرسال Push Notification (إذا كان PWA)
      await this.sendPushNotification(userId, data);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  private async sendEmailNotification(userId: string, data: NotificationData) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (!user?.email) return;

      await this.emailService.sendEmail({
        to: user.email,
        subject: data.title,
        html: `
          <!DOCTYPE html>
          <html dir="rtl">
          <head><meta charset="UTF-8"></head>
          <body>
            <h2>${data.title}</h2>
            <p>${data.message}</p>
            ${data.data ? `<pre>${JSON.stringify(data.data, null, 2)}</pre>` : ''}
          </body>
          </html>
        `,
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  private async sendSMSNotification(userId: string, data: NotificationData) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true },
      });

      if (!user?.phone) return;

      // TODO: تكامل مع خدمة SMS
      console.log('SMS would be sent to:', user.phone, 'Message:', data.message);
    } catch (error) {
      console.error('Error sending SMS notification:', error);
    }
  }

  private async sendPushNotification(userId: string, data: NotificationData) {
    try {
      // TODO: تكامل مع Push Notifications (PWA)
      console.log('Push notification would be sent to user:', userId);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.update({
      where: {
        id: notificationId,
        userId, // التأكد أن الإشعار للمستخدم الصحيح
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async sendBookingNotifications(bookingId: string, type: 'CREATED' | 'CONFIRMED' | 'CANCELLED') {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          stadium: {
            include: {
              owner: true,
              staff: true,
            },
          },
        },
      });

      if (!booking) return;

      const notificationData = {
        bookingId,
        stadiumName: booking.stadium.name,
        date: booking.date.toLocaleDateString('ar-EG'),
        startTime: booking.startTime,
        endTime: booking.endTime,
        amount: booking.price,
      };

      // إشعار للمستخدم
      await this.createNotification(booking.userId, {
        type: `BOOKING_${type}`,
        title: type === 'CONFIRMED' ? '✅ تم تأكيد حجزك' : 
               type === 'CANCELLED' ? '⚠️ تم إلغاء حجزك' : '📅 تم إنشاء حجزك',
        message: type === 'CONFIRMED' 
          ? `تم تأكيد حجزك في ${booking.stadium.name}`
          : type === 'CANCELLED'
          ? `تم إلغاء حجزك في ${booking.stadium.name}`
          : `تم إنشاء حجز في ${booking.stadium.name}`,
        data: notificationData,
        sendEmail: true,
      });

      // إشعار للمالك
      await this.createNotification(booking.stadium.ownerId, {
        type: `BOOKING_${type}_OWNER`,
        title: type === 'CONFIRMED' ? '✅ حجز جديد مؤكد' : 
               type === 'CANCELLED' ? '⚠️ تم إلغاء حجز' : '📅 حجز جديد',
        message: type === 'CONFIRMED'
          ? `تم تأكيد حجز جديد في ${booking.stadium.name}`
          : type === 'CANCELLED'
          ? `تم إلغاء حجز في ${booking.stadium.name}`
          : `تم إنشاء حجز جديد في ${booking.stadium.name}`,
        data: notificationData,
        sendEmail: true,
      });

      // إشعار للموظفين
      for (const staff of booking.stadium.staff) {
        await this.createNotification(staff.id, {
          type: `BOOKING_${type}_STAFF`,
          title: type === 'CONFIRMED' ? '✅ حجز جديد' : 
                 type === 'CANCELLED' ? '⚠️ حجز ملغي' : '📅 حجز جديد',
          message: type === 'CONFIRMED'
            ? `تم تأكيد حجز جديد في ${booking.stadium.name}`
            : type === 'CANCELLED'
            ? `تم إلغاء حجز في ${booking.stadium.name}`
            : `تم إنشاء حجز جديد في ${booking.stadium.name}`,
          data: notificationData,
        });
      }
    } catch (error) {
      console.error('Error sending booking notifications:', error);
    }
  }
}

// Singleton instance
let notificationInstance: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationInstance) {
    notificationInstance = new NotificationService();
  }
  return notificationInstance;
}
