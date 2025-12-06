import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth/auth';
import { getPaymobInstance } from '@/lib/integrations/paymob';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: 'رقم الحجز مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من الحجز
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
        userId: session.user.id, // التأكد أن الحجز للمستخدم الحالي
      },
      include: {
        stadium: {
          select: {
            name: true,
            pricePerHour: true,
          },
        },
        payments: {
          where: {
            status: 'SUCCESS',
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'الحجز غير موجود أو غير مصرح' },
        { status: 404 }
      );
    }

    // التحقق من حالة الحجز
    if (booking.status !== 'PENDING') {
      return NextResponse.json({
        success: false,
        message: 'لا يمكن دفع حجز تم تأكيده بالفعل',
      });
    }

    // حساب المبلغ المطلوب
    const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingAmount = booking.price - totalPaid;

    if (remainingAmount <= 0) {
      return NextResponse.json({
        success: false,
        message: 'تم دفع كامل المبلغ بالفعل',
      });
    }

    // إنشاء طلب دفع في Paymob
    const paymob = getPaymobInstance();
    
    const orderRequest = {
      amount: remainingAmount,
      currency: 'EGP',
      items: [{
        name: `حجز ${booking.stadium.name}`,
        amount: remainingAmount,
        description: `حجز من ${booking.startTime} إلى ${booking.endTime}`,
      }],
      billingData: {
        first_name: session.user.name.split(' ')[0] || session.user.name,
        last_name: session.user.name.split(' ').slice(1).join(' ') || '',
        phone_number: session.user.phone || '+201000000000',
        email: session.user.email || '',
      },
      metadata: {
        bookingId,
        userId: session.user.id,
        stadiumId: booking.stadiumId,
      },
    };

    const paymobResult = await paymob.createOrder(orderRequest);

    // حفظ محاولة الدفع
    await prisma.paymentAttempt.create({
      data: {
        bookingId,
        amount: remainingAmount,
        method: 'paymob',
        status: 'PENDING',
        transactionId: paymobResult.orderId?.toString(),
        metadata: {
          paymobOrderId: paymobResult.orderId,
          paymentKey: paymobResult.paymentKey,
        },
      },
    });

    return NextResponse.json({
      success: true,
      paymentUrl: paymobResult.paymentUrl,
      orderId: paymobResult.orderId,
      amount: remainingAmount,
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    
    // حفظ محاولة فاشلة
    try {
      const { bookingId } = await request.json();
      await prisma.paymentAttempt.create({
        data: {
          bookingId,
          amount: 0,
          method: 'paymob',
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'خطأ غير معروف',
        },
      });
    } catch (e) {
      console.error('Error saving failed payment attempt:', e);
    }

    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'حدث خطأ في إنشاء طلب الدفع' 
      },
      { status: 500 }
    );
  }
}
