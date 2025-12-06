import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // بناء query مع الفلترة
    const where: any = {
      userId: session.user.id,
    };

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // جلب الحجوزات مع العلاقات
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          stadium: {
            select: {
              id: true,
              name: true,
              location: true,
              images: true,
            },
          },
          payments: {
            where: {
              status: 'SUCCESS',
            },
            select: {
              amount: true,
              paymentMethod: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    // حساب الإحصائيات
    const stats = {
      total: await prisma.booking.count({ where: { userId: session.user.id } }),
      pending: await prisma.booking.count({ 
        where: { userId: session.user.id, status: 'PENDING' } 
      }),
      confirmed: await prisma.booking.count({ 
        where: { userId: session.user.id, status: 'CONFIRMED' } 
      }),
      cancelled: await prisma.booking.count({ 
        where: { userId: session.user.id, status: 'CANCELLED' } 
      }),
      completed: await prisma.booking.count({ 
        where: { userId: session.user.id, status: 'COMPLETED' } 
      }),
    };

    // تحويل البيانات
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      stadiumId: booking.stadiumId,
      stadiumName: booking.stadium.name,
      stadiumLocation: booking.stadium.location,
      stadiumImage: booking.stadium.images[0] || null,
      date: booking.date.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status.toLowerCase(),
      price: booking.price,
      depositPaid: booking.depositPaid || 0,
      totalPaid: booking.payments.reduce((sum, p) => sum + p.amount, 0),
      paymentMethod: booking.payments[0]?.paymentMethod || 'cash',
      paymentStatus: booking.payments.length > 0 ? 'paid' : 'pending',
      playersCount: booking.playersCount,
      notes: booking.notes,
      voucherCode: booking.voucherCode,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Error fetching player bookings:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في جلب الحجوزات' },
      { status: 500 }
    );
  }
}
