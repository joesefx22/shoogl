import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { isFavorite: false, message: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const stadiumId = searchParams.get('stadiumId');

    if (!stadiumId) {
      return NextResponse.json(
        { isFavorite: false, message: 'معرف الملعب مطلوب' },
        { status: 400 }
      );
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_stadiumId: {
          userId: session.user.id,
          stadiumId,
        },
      },
    });

    return NextResponse.json({
      isFavorite: !!favorite,
      favoriteId: favorite?.id,
    });

  } catch (error) {
    console.error('Error checking favorite:', error);
    return NextResponse.json(
      { isFavorite: false, message: 'حدث خطأ في التحقق من المفضلة' },
      { status: 500 }
    );
  }
}
