import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stadiumId = searchParams.get('stadiumId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'APPROVED',
    };

    if (stadiumId) {
      where.stadiumId = stadiumId;
    }

    if (userId) {
      where.userId = userId;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          stadium: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    // حساب متوسط التقييمات
    let averageRating = 0;
    let ratingStats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (stadiumId) {
      const stadiumReviews = await prisma.review.findMany({
        where: {
          stadiumId,
          status: 'APPROVED',
        },
        select: {
          rating: true,
        },
      });

      if (stadiumReviews.length > 0) {
        averageRating = stadiumReviews.reduce((sum, review) => sum + review.rating, 0) / stadiumReviews.length;
        
        // إحصائيات التقييمات
        stadiumReviews.forEach(review => {
          ratingStats[review.rating as keyof typeof ratingStats]++;
        });
      }
    }

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: total,
        ratingStats,
      },
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في جلب التقييمات' },
      { status: 500 }
    );
  }
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

    const { stadiumId, rating, comment, bookingId } = await request.json();

    if (!stadiumId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'تقييم صالح مطلوب (1-5)' },
        { status: 400 }
      );
    }

    // التحقق من وجود الملعب
    const stadium = await prisma.stadium.findUnique({
      where: { id: stadiumId },
    });

    if (!stadium) {
      return NextResponse.json(
        { success: false, message: 'الملعب غير موجود' },
        { status: 404 }
      );
    }

    // التحقق إذا كان المستخدم قد حجز في هذا الملعب
    if (bookingId) {
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          userId: session.user.id,
          stadiumId,
          status: 'COMPLETED',
        },
      });

      if (!booking) {
        return NextResponse.json(
          { success: false, message: 'يجب إكمال حجز في الملعب لتقييمه' },
          { status: 403 }
        );
      }
    }

    // التحقق إذا كان المستخدم قد قام بتقييم هذا الملعب من قبل
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        stadiumId,
      },
    });

    if (existingReview) {
      return NextResponse.json({
        success: false,
        message: 'لقد قمت بتقييم هذا الملعب من قبل',
        review: existingReview,
      });
    }

    // إنشاء التقييم
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        stadiumId,
        bookingId,
        rating,
        comment,
        status: 'PENDING', // يحتاج موافقة الإدارة
      },
    });

    // تحديث إحصائيات الملعب
    const approvedReviews = await prisma.review.findMany({
      where: {
        stadiumId,
        status: 'APPROVED',
      },
    });

    const totalReviews = approvedReviews.length + 1;
    const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) + rating;
    const averageRating = totalRating / totalReviews;

    await prisma.stadium.update({
      where: { id: stadiumId },
      data: {
        averageRating,
        totalRatings: totalReviews,
      },
    });

    // إشعار للمالك
    await prisma.notification.create({
      data: {
        userId: stadium.ownerId,
        type: 'NEW_REVIEW',
        title: 'تقييم جديد',
        message: `تمت إضافة تقييم جديد لملعب ${stadium.name}`,
        data: {
          reviewId: review.id,
          stadiumId,
          rating,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إضافة التقييم بنجاح وجاري المراجعة',
      review,
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في إضافة التقييم' },
      { status: 500 }
    );
  }
}
