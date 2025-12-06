import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth/auth';

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

    const updated = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `تم تحديد ${updated.count} إشعار كمقروء`,
      count: updated.count,
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في تحديد الإشعارات' },
      { status: 500 }
    );
  }
}
