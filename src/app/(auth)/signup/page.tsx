'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { InputField } from '@/components/ui/InputField';
import { SelectField } from '@/components/ui/SelectField';
import { useToast } from '@/components/ui/toast/useToast';
import { signupUser } from '@/lib/api/auth/authService';
import { UserRole } from '@/types';

/**
 * صفحة إنشاء حساب جديد
 */
export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'player' as UserRole,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'الاسم يجب أن يكون على الأقل حرفين';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'بريد إلكتروني غير صالح';
    }

    // Phone validation (Egyptian numbers)
    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^(?:\+20|0)?1[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'رقم هاتف مصري غير صالح (مثال: 01012345678)';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
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
      const response = await signupUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        primaryRole: formData.role,
      });
      
      // إشعار النجاح
      toast({
        title: 'تم إنشاء الحساب بنجاح',
        description: 'تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول.',
        variant: 'success',
      });

      // توجيه إلى صفحة تسجيل الدخول
      setTimeout(() => {
        router.push('/login?message=signup_success');
      }, 1500);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب';
      
      toast({
        title: 'فشل إنشاء الحساب',
        description: errorMessage,
        variant: 'destructive',
      });

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'player', label: 'لاعب', description: 'يمكنك حجز الملاعب والانضمام للمباريات' },
    { value: 'owner', label: 'مالك ملعب', description: 'إدارة ملاعبك وعرض إحصائيات الحجوزات' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-100 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">أنشئ حسابك الجديد</h1>
          <p className="text-gray-600 mt-2">
            انضم إلى مجتمعنا وابدأ حجز ملاعبك المفضلة
          </p>
        </div>

        {/* Signup Card */}
        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Input */}
              <InputField
                label="الاسم الكامل"
                name="name"
                type="text"
                placeholder="محمد أحمد"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                required
                icon="user"
              />

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

              {/* Phone Input */}
              <InputField
                label="رقم الهاتف"
                name="phone"
                type="tel"
                placeholder="01012345678"
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
                required
                icon="phone"
              />

              {/* Role Select */}
              <SelectField
                label="نوع الحساب"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                options={roleOptions}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                helperText="6 أحرف على الأقل"
              />

              {/* Confirm Password Input */}
              <InputField
                label="تأكيد كلمة المرور"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                required
                icon="lock"
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="mr-2 block text-sm text-gray-900">
                أوافق على{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                  الشروط والأحكام
                </Link>{' '}
                و{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                  سياسة الخصوصية
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              variant="success"
              size="lg"
            >
              إنشاء حساب
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

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link 
                href="/login" 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                سجّل الدخول
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
