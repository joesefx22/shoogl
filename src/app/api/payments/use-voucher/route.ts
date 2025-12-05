import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getVoucherSystem } from '@/lib/integrations/vouchers';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { code, bookingId, userId, amount } = await request.json();

    if (!code || !bookingId || !userId || !amount) {
      return NextResponse.json(
        { success: false, message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق أولاً من صلاحية الحجز
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'الحجز غير موجود أو غير مصرح' },
        { status: 403 }
      );
    }

    // التحقق من الكود
    const voucherSystem = getVoucherSystem();
    const validation = await voucherSystem.validateVoucher(code, amount, userId);

    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        discountAmount: 0,
        message: validation.message,
      });
    }

    // استخدام الكود في معاملة واحدة (transaction)
    const result = await prisma.$transaction(async (tx) => {
      // 1. تحديث الكود (زيادة usedCount)
      await tx.voucher.update({
        where: { code },
        data: {
          usedCount: { increment: 1 },
        },
      });

      // 2. تسجيل الاستخدام
      await tx.voucherUsage.create({
        data: {
          voucherId: validation.voucher!.id,
          bookingId,
          userId,
          discountAmount: validation.discountAmount,
        },
      });

      // 3. تحديث الحجز
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          voucherCode: code,
          discountAmount: validation.discountAmount,
          finalAmount: amount - validation.discountAmount,
        },
      });

      return updatedBooking;
    });

    return NextResponse.json({
      success: true,
      discountAmount: validation.discountAmount,
      finalAmount: result.finalAmount,
      message: 'تم استخدام الكود بنجاح',
    });

  } catch (error) {
    console.error('Use voucher error:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في استخدام الكود' },
      { status: 500 }
    );
  }
}
