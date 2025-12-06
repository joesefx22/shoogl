import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getPaymobInstance } from '@/lib/integrations/paymob';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // التحقق من HMAC
    const paymob = getPaymobInstance();
    const isValid = paymob.verifyHMAC(
      payload.amount_cents?.toString(),
      payload.hmac,
      payload.obj?.order?.id?.toString()
    );

    if (!isValid) {
      console.error('Invalid HMAC signature');
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 400 }
      );
    }

    const { success, transactionId, bookingId, amount } = 
      await paymob.handleWebhook(payload);

    if (!success) {
      throw new Error('Payment failed in webhook');
    }

    // تحديث حالة الدفع في قاعدة البيانات
    await prisma.$transaction(async (tx) => {
      // 1. تحديث محاولة الدفع
      await tx.paymentAttempt.updateMany({
        where: {
          transactionId: transactionId,
        },
        data: {
          status: 'SUCCESS',
          lastAttempt: new Date(),
        },
      });

      // 2. إنشاء سجل الدفع
      await tx.payment.create({
        data: {
          bookingId,
          amount,
          paymentMethod: 'PAYMOB',
          status: 'SUCCESS',
          transactionId,
          metadata: payload,
        },
      });

      // 3. تحديث حالة الحجز
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      });

      // 4. إنشاء إشعار
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { user: true, stadium: true },
      });

      if (booking) {
        await tx.notification.create({
          data: {
            userId: booking.userId,
            type: 'PAYMENT_SUCCESS',
            title: 'تم الدفع بنجاح',
            message: `تم تأكيد دفع حجزك في ${booking.stadium.name} بمبلغ ${amount} ج.م`,
            data: {
              bookingId,
              amount,
              stadiumName: booking.stadium.name,
            },
          },
        });

        // إشعار للمالك
        await tx.notification.create({
          data: {
            userId: booking.stadium.ownerId,
            type: 'BOOKING_CONFIRMED',
            title: 'تم تأكيد حجز جديد',
            message: `تم حجز ${booking.stadium.name} من ${booking.startTime} إلى ${booking.endTime}`,
            data: {
              bookingId,
              stadiumName: booking.stadium.name,
            },
          },
        });
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    
    // محاولة حفظ الخطأ
    try {
      const payload = await request.json();
      await prisma.auditLog.create({
        data: {
          action: 'PAYMENT_WEBHOOK_FAILED',
          entityType: 'PAYMENT',
          changes: { error: error instanceof Error ? error.message : 'Unknown' },
          metadata: { payload },
        },
      });
    } catch (e) {
      console.error('Error saving audit log:', e);
    }

    return NextResponse.json(
      { success: false, message: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
