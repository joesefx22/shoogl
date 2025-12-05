import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getVoucherSystem } from '@/lib/integrations/vouchers';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { code, amount, userId } = await request.json();

    if (!code || !amount) {
      return NextResponse.json(
        { valid: false, message: 'الكود والمبلغ مطلوبان' },
        { status: 400 }
      );
    }

    const voucherSystem = getVoucherSystem();
    const validation = await voucherSystem.validateVoucher(code, amount, userId);

    if (validation.valid) {
      return NextResponse.json({
        valid: true,
        discountAmount: validation.discountAmount,
        voucher: {
          code: validation.voucher?.code,
          type: validation.voucher?.type,
          value: validation.voucher?.value,
          expiresAt: validation.voucher?.expiresAt,
        },
        message: 'الكود صالح',
      });
    } else {
      return NextResponse.json({
        valid: false,
        discountAmount: 0,
        message: validation.message,
      });
    }
  } catch (error) {
    console.error('Voucher validation error:', error);
    return NextResponse.json(
      { valid: false, message: 'حدث خطأ في التحقق من الكود' },
      { status: 500 }
    );
  }
}
