// إضافة هذا في بداية الملف
import { getSMSService } from './sms.service';

// ثم تحديث دالة sendSMSNotification:
private async sendSMSNotification(userId: string, data: NotificationData) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true, smsNotifications: true },
    });

    if (!user?.phone || !user.smsNotifications) return;

    const smsService = getSMSService();
    
    await smsService.sendSMS({
      to: user.phone,
      message: `${data.title}: ${data.message}`,
      senderId: 'Ehgzly',
    });
  } catch (error) {
    console.error('Error sending SMS notification:', error);
  }
}
