import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { validateEmail, validateEgyptianPhone } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, role, primaryRole } = await request.json();

    // التحقق من المدخلات
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من البريد الإلكتروني
    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: 'بريد إلكتروني غير صالح' },
        { status: 400 }
      );
    }

    // التحقق من رقم الهاتف
    if (!validateEgyptianPhone(phone)) {
      return NextResponse.json(
        { message: 'رقم هاتف مصري غير صالح (مثال: 01012345678)' },
        { status: 400 }
      );
    }

    // التحقق من كلمة المرور
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود البريد مسبقاً
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: 'البريد الإلكتروني مستخدم مسبقاً' },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود الهاتف مسبقاً
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      return NextResponse.json(
        { message: 'رقم الهاتف مستخدم مسبقاً' },
        { status: 400 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: role || 'player',
        primaryRole: primaryRole || role || 'player',
        roles: [role || 'player'],
        isActive: true,
        isVerified: false,
      },
    });

    // إزالة كلمة المرور من الاستجابة
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      user: userWithoutPassword,
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
