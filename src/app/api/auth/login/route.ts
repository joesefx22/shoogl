import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        stadiums: true,
      },
    });

    // التحقق من وجود المستخدم
    if (!user) {
      return NextResponse.json(
        { message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // التحقق من كلمة المرور
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // التحقق من حالة الحساب
    if (!user.isActive) {
      return NextResponse.json(
        { message: 'حسابك غير نشط. يرجى التواصل مع الإدارة' },
        { status: 403 }
      );
    }

    // إنشاء التوكن
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.primaryRole,
        roles: user.roles 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // إزالة كلمة المرور من الاستجابة
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
      message: 'تم تسجيل الدخول بنجاح',
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
