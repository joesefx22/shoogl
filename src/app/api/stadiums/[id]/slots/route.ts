import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stadiumId = params.id;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json(
        { success: false, message: 'التاريخ مطلوب' },
        { status: 400 }
      );
    }

    // جلب الساعات المتاحة لهذا اليوم
    const slots = await prisma.slot.findMany({
      where: {
        stadiumId,
        date: new Date(date),
        status: 'AVAILABLE',
        // استبعاد الساعات المحجوزة
        booking: null,
      },
      include: {
        stadium: {
          select: {
            pricePerHour: true,
            deposit: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // جلب الحجوزات لهذا اليوم لاستبعاد الساعات المحجوزة
    const bookings = await prisma.booking.findMany({
      where: {
        stadiumId,
        date: new Date(date),
        status: {
          in: ['CONFIRMED', 'PENDING'],
        },
      },
      select: {
        slotId: true,
      },
    });

    const bookedSlotIds = bookings.map(b => b.slotId);
    
    // تصفية الساعات المتاحة فقط
    const availableSlots = slots
      .filter(slot => !bookedSlotIds.includes(slot.id))
      .map(slot => ({
        id: slot.id,
        stadiumId: slot.stadiumId,
        date: slot.date.toISOString().split('T')[0],
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status,
        price: slot.price || slot.stadium.pricePerHour,
        capacity: slot.capacity,
        isAvailable: true,
        createdAt: slot.createdAt.toISOString(),
        updatedAt: slot.updatedAt.toISOString(),
      }));

    return NextResponse.json({
      success: true,
      slots: availableSlots,
      date,
      stadiumId,
    });

  } catch (error) {
    console.error('Error fetching stadium slots:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في جلب الساعات' },
      { status: 500 }
    );
  }
}
