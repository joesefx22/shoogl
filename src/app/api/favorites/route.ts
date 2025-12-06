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

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        stadium: {
          select: {
            id: true,
            name: true,
            type: true,
            location: true,
            pricePerHour: true,
            images: true,
            features: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      favorites: favorites.map(fav => ({
        id: fav.id,
        stadiumId: fav.stadiumId,
        stadium: fav.stadium,
        createdAt: fav.createdAt,
      })),
      count: favorites.length,
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في جلب المفضلة' },
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

    const { stadiumId } = await request.json();

    if (!stadiumId) {
      return NextResponse.json(
        { success: false, message: 'معرف الملعب مطلوب' },
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

    // التحقق إذا كان بالفعل في المفضلة
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_stadiumId: {
          userId: session.user.id,
          stadiumId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json({
        success: true,
        message: 'الملعب بالفعل في المفضلة',
        favorite: existingFavorite,
      });
    }

    // إضافة إلى المفضلة
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        stadiumId,
      },
    });

    // سجل المراجعة
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ADD_TO_FAVORITES',
        entityType: 'STADIUM',
        entityId: stadiumId,
        changes: { action: 'added' },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تمت إضافة الملعب إلى المفضلة',
      favorite,
    });

  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في إضافة المفضلة' },
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
    const stadiumId = searchParams.get('stadiumId');

    if (!stadiumId) {
      return NextResponse.json(
        { success: false, message: 'معرف الملعب مطلوب' },
        { status: 400 }
      );
    }

    // حذف من المفضلة
    await prisma.favorite.delete({
      where: {
        userId_stadiumId: {
          userId: session.user.id,
          stadiumId,
        },
      },
    });

    // سجل المراجعة
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'REMOVE_FROM_FAVORITES',
        entityType: 'STADIUM',
        entityId: stadiumId,
        changes: { action: 'removed' },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تمت إزالة الملعب من المفضلة',
    });

  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في إزالة المفضلة' },
      { status: 500 }
    );
  }
}
