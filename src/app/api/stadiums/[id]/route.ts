import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: جلب تفاصيل ملعب معين مع الساعات المتاحة
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stadiumId = params.id;
    
    if (!stadiumId) {
      return NextResponse.json(
        { error: 'معرف الملعب مطلوب' },
        { status: 400 }
      );
    }

    // جلب الملعب مع العلاقات
    const stadium = await prisma.stadium.findUnique({
      where: {
        id: stadiumId,
        isActive: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'PENDING'],
            },
          },
          select: {
            date: true,
            slot: true,
            status: true,
          },
        },
      },
    });

    if (!stadium) {
      return NextResponse.json(
        { error: 'الملعب غير موجود' },
        { status: 404 }
      );
    }

    // جلب الساعات المتاحة للملعب
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);

    const availableSlots = await prisma.slot.findMany({
      where: {
        stadiumId,
        date: {
          gte: today.toISOString().split('T')[0],
          lte: sevenDaysLater.toISOString().split('T')[0],
        },
        status: 'AVAILABLE',
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });

    // تجميع الساعات حسب التاريخ
    const slotsByDate: Record<string, any[]> = {};
    availableSlots.forEach(slot => {
      const dateKey = slot.date.toISOString().split('T')[0];
      if (!slotsByDate[dateKey]) {
        slotsByDate[dateKey] = [];
      }
      
      // التحقق إذا كانت الساعة محجوزة
      const isBooked = stadium.bookings.some(booking => {
        const bookingDate = new Date(booking.date).toISOString().split('T')[0];
        return bookingDate === dateKey && booking.slot === slot.id;
      });

      slotsByDate[dateKey].push({
        id: slot.id,
        stadiumId: slot.stadiumId,
        date: slot.date.toISOString().split('T')[0],
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: isBooked ? 'BOOKED' : slot.status,
        price: slot.price,
        capacity: slot.capacity,
        isAvailable: !isBooked && slot.status === 'AVAILABLE',
        createdAt: slot.createdAt,
        updatedAt: slot.updatedAt,
      });
    });

    // توليد الأيام السبعة القادمة مع الساعات
    const nextSevenDays = generateNextSevenDays();
    const daysWithSlots = nextSevenDays.map(day => ({
      ...day,
      slots: slotsByDate[day.date] || [],
      hasAvailableSlots: (slotsByDate[day.date] || []).some((slot: any) => slot.isAvailable),
    }));

    // تحويل البيانات إلى التنسيق المطلوب
    const response = {
      stadium: {
        id: stadium.id,
        name: stadium.name,
        type: stadium.type.toLowerCase(),
        description: stadium.description,
        location: stadium.location as any,
        pricePerHour: stadium.pricePerHour,
        deposit: stadium.deposit,
        features: stadium.features,
        images: stadium.images,
        amenities: stadium.amenities,
        rules: stadium.rules,
        capacity: stadium.capacity,
        openingHours: stadium.openingHours as any,
        contact: {
          phone: stadium.owner.phone,
          email: stadium.owner.email,
        },
        owner: {
          id: stadium.owner.id,
          name: stadium.owner.name,
        },
        staff: stadium.staff,
        rating: stadium.averageRating || 0,
        totalRatings: stadium.totalRatings || 0,
      },
      days: daysWithSlots,
      statistics: {
        totalSlots: availableSlots.length,
        availableSlots: availableSlots.filter(s => 
          !stadium.bookings.some(b => b.slot === s.id)
        ).length,
        bookedSlots: stadium.bookings.length,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching stadium details:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب تفاصيل الملعب' },
      { status: 500 }
    );
  }
}

// وظيفة مساعدة: توليد الأيام السبعة القادمة
function generateNextSevenDays() {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dateString = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('ar-EG', { weekday: 'long' });
    const dayNumber = date.getDate();
    const monthName = date.toLocaleDateString('ar-EG', { month: 'long' });
    const monthShort = date.toLocaleDateString('ar-EG', { month: 'short' });
    const year = date.getFullYear();
    
    days.push({
      date: dateString,
      dayName,
      dayNumber,
      monthName,
      monthShort,
      year,
      isToday: i === 0,
      isTomorrow: i === 1,
      isWeekend: date.getDay() === 5 || date.getDay() === 6, // الجمعة أو السبت
    });
  }
  
  return days;
}
