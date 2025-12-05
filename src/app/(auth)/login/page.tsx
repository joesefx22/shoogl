'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { InputField } from '@/components/ui/InputField';
import { useToast } from '@/components/ui/toast/useToast';
import { loginUser } from '@/lib/api/auth/authService';
import { setAuthData } from '@/lib/auth';
import { UserRole } from '@/types';

/**
 * صفحة تسجيل الدخول
 * تقود المستخدم إلى dashboard المناسب حسب الدور
 */
export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'بريد إلكتروني غير صالح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'خطأ في المدخلات',
        description: 'يرجى تصحيح الأخطاء في النموذج',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser(formData.email, formData.password);
      
      const { token, user } = response;
      
      // حفظ بيانات المصادقة
      setAuthData(token, user);
      
      // توجيه حسب الدور
      let redirectPath = '/';
      
      switch (user.primaryRole) {
        case 'player':
          redirectPath = '/player';
          break;
        case 'staff':
          redirectPath = '/staff';
          break;
        case 'owner':
          redirectPath = '/owner';
          break;
        case 'admin':
          redirectPath = '/admin';
          break;
      }

      // إشعار النجاح
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: `مرحباً بعودتك، ${user.name}!`,
        variant: 'success',
      });

      // إعادة التوجيه
      setTimeout(() => {
        router.push(redirectPath);
        router.refresh();
      }, 1000);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول';
      
      toast({
        title: 'فشل تسجيل الدخول',
        description: errorMessage,
        variant: 'destructive',
      });

      // عرض خطأ عام
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">أهلاً بعودتك</h1>
          <p className="text-gray-600 mt-2">
            سجّل الدخول للوصول إلى حسابك
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
                {errors.general}
              </div>
            )}

            {/* Email Input */}
            <InputField
              label="البريد الإلكتروني"
              name="email"
              type="email"
              placeholder="example@domain.com"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
              icon="mail"
            />

            {/* Password Input */}
            <InputField
              label="كلمة المرور"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              required
              icon="lock"
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-900">
                  تذكرني
                </label>
              </div>

              <Link 
                href="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              variant="primary"
              size="lg"
            >
              تسجيل الدخول
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">أو</span>
              </div>
            </div>
          </div>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{' '}
              <Link 
                href="/signup" 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </Card>

        {/* Guest Access */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/stadiums')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            أو تصفح الملاعب كزائر
          </button>
        </div>
      </div>
    </div>
  );
}
