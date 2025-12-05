import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Optional: Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    
    // Extract filters
    const type = searchParams.get('type') as 'FOOTBALL' | 'PADDLE' | undefined;
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const features = searchParams.get('features')?.split(',') || [];
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Build filter query
    const where: any = {
      isActive: true,
    };

    if (type) {
      where.type = type;
    }

    if (city) {
      where.location = {
        path: ['city'],
        equals: city,
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerHour = {};
      if (minPrice !== undefined) {
        where.pricePerHour.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.pricePerHour.lte = maxPrice;
      }
    }

    if (features.length > 0) {
      where.features = {
        hasEvery: features,
      };
    }

    // Get total count for pagination
    const total = await prisma.stadium.count({ where });

    // Get stadiums with pagination
    const stadiums = await prisma.stadium.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
        slots: {
          where: {
            date: {
              gte: new Date().toISOString().split('T')[0],
            },
            status: 'available',
          },
          take: 10,
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data to match frontend types
    const transformedStadiums = stadiums.map(stadium => ({
      id: stadium.id,
      name: stadium.name,
      type: stadium.type.toLowerCase() as 'football' | 'paddle',
      description: stadium.description || '',
      location: {
        lat: stadium.location?.['lat'] || 0,
        lng: stadium.location?.['lng'] || 0,
        address: stadium.location?.['address'] || '',
        city: stadium.location?.['city'] || '',
        district: stadium.location?.['district'] || '',
      },
      pricePerHour: stadium.pricePerHour,
      deposit: stadium.deposit,
      features: stadium.features,
      images: stadium.images,
      amenities: stadium.amenities,
      rules: stadium.rules,
      ownerId: stadium.ownerId,
      staffIds: stadium.staff.map(s => s.id),
      slots: stadium.slots.map(slot => ({
        id: slot.id,
        stadiumId: slot.stadiumId,
        date: slot.date.toISOString().split('T')[0],
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status,
        price: slot.price,
        capacity: slot.capacity,
        createdAt: slot.createdAt.toISOString(),
        updatedAt: slot.updatedAt.toISOString(),
      })),
      isActive: stadium.isActive,
      createdAt: stadium.createdAt.toISOString(),
      updatedAt: stadium.updatedAt.toISOString(),
      capacity: stadium.capacity,
      openingHours: stadium.openingHours,
    }));

    return NextResponse.json({
      stadiums: transformedStadiums,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });

  } catch (error) {
    console.error('Error fetching stadiums:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الملاعب' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Only owners and admins can create stadiums
    if (!session || !['owner', 'admin'].includes(session.user?.role || '')) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'type', 'pricePerHour', 'location', 'features'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `حقل ${field} مطلوب` },
          { status: 400 }
        );
      }
    }

    // Create stadium
    const stadium = await prisma.stadium.create({
      data: {
        name: data.name,
        type: data.type.toUpperCase(),
        description: data.description,
        location: data.location,
        pricePerHour: data.pricePerHour,
        deposit: data.deposit || 0,
        features: data.features,
        images: data.images || [],
        amenities: data.amenities || [],
        rules: data.rules || [],
        capacity: data.capacity || 22,
        openingHours: data.openingHours || { from: '08:00', to: '00:00' },
        ownerId: session.user?.id || data.ownerId,
        staffIds: data.staffIds || [],
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الملعب بنجاح',
      stadium,
    });

  } catch (error) {
    console.error('Error creating stadium:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الملعب' },
      { status: 500 }
    );
  }
}
