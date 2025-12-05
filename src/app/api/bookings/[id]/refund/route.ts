import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getRefundService } from '@/lib/services/refund.service';
import { auth } from '@/lib/auth/auth';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      );
    }

    const bookingId = params.id;
    const data = await request.json();
    const { reason, refundType, partialAmount } = data;

    if (!reason || !refundType) {
      return NextResponse.json(
        { success: false, message: 'السبب ونوع الاسترجاع مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من صلاحيات المستخدم
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

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'الحجز غير موجود' },
        { status: 404 }
      );
    }

    // تحديد الدور الذي بدأ الاسترجاع
    let initiatedByRole: 'admin' | 'owner' | 'player' = 'player';
    
    if (session.user.roles.includes('admin')) {
      initiatedByRole = 'admin';
    } else if (session.user.id === booking.stadium.ownerId) {
      initiatedByRole = 'owner';
    } else if (booking.stadium.staff.some(staff => staff.id === session.user.id)) {
      initiatedByRole = 'owner'; // الموظف يعامل كمستخدم
    } else if (session.user.id !== booking.userId) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لهذا الإجراء' },
        { status: 403 }
      );
    }

    const refundService = getRefundService();
    
    // التحقق من إمكانية الاسترجاع
    const eligibility = await refundService.calculateRefundAmount(bookingId, refundType);
    
    if (!eligibility.eligible && initiatedByRole === 'player') {
      return NextResponse.json({
        success: false,
        amount: 0,
        message: eligibility.message,
      });
    }

    // معالجة الاسترجاع
    const result = await refundService.processRefund({
      bookingId,
      reason,
      refundType,
      partialAmount,
      initiatedBy: session.user.id,
      initiatedByRole,
    });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Refund API error:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في معالجة الاسترجاع' },
      { status: 500 }
    );
  }
}
