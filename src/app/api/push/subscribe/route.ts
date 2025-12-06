import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth/auth';
import webpush from 'web-push';

const prisma = new PrismaClient();

// تكوين web-push
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:info@ehgzly.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      );
    }

    const subscription = await request.json();

    if (!subscription.endpoint) {
      return NextResponse.json(
        { success: false, message: 'بيانات الاشتراك غير صالحة' },
        { status: 400 }
      );
    }

    // حفظ الاشتراك في قاعدة البيانات
    await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: session.user.id,
          endpoint: subscription.endpoint,
        },
      },
      update: {
        keys: subscription.keys,
        expirationTime: subscription.expirationTime,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        expirationTime: subscription.expirationTime,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حفظ اشتراك الإشعارات',
    });

  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في حفظ الاشتراك' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json(
        { success: false, message: 'معرف الاشتراك مطلوب' },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        userId: session.user.id,
        endpoint,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إلغاء اشتراك الإشعارات',
    });

  } catch (error) {
    console.error('Error deleting push subscription:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في إلغاء الاشتراك' },
      { status: 500 }
    );
  }
}
