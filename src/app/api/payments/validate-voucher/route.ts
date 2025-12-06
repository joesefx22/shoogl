import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth/auth';
import { getVoucherSystem } from '@/lib/integrations/vouchers';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { code, amount, bookingId } = await request.json();

    if (!code || !amount) {
      return NextResponse.json(
        { valid: false, message: 'الكود والمبلغ مطلوبان' },
        { status: 400 }
      );
    }

    // إذا كان هناك bookingId، التحقق من الحجز
    if (bookingId && session?.user) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking || booking.userId !== session.user.id) {
        return NextResponse.json(
          { valid: false, message: 'الحجز غير موجود أو غير مصرح' },
          { status: 403 }
        );
      }
    }

    const voucherSystem = getVoucherSystem();
    const validation = await voucherSystem.validateVoucher(
      code.toUpperCase(),
      amount,
      session?.user?.id
    );

    return NextResponse.json(validation);

  } catch (error) {
    console.error('Voucher validation error:', error);
    return NextResponse.json(
      { valid: false, message: 'حدث خطأ في التحقق من الكود' },
      { status: 500 }
    );
  }
}
