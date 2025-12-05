'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { SelectField } from '@/components/ui/SelectField';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/toast/useToast';
import { signupUser } from '@/lib/api/auth/authService';
import { UserRole } from '@/types';

interface SignupFormProps {
  onSuccess?: () => void;
  redirectPath?: string;
  embedded?: boolean;
  showRoleSelector?: boolean;
}

/**
 * نموذج إنشاء حساب جديد
 */
const SignupForm: React.FC<SignupFormProps> = ({ 
  onSuccess, 
  redirectPath, 
  embedded = false,
  showRoleSelector = true 
}) => {
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
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'بريد إلكتروني غير صالح';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
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
      await signupUser({
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

      // Callback عند النجاح
      if (onSuccess) {
        onSuccess();
      }

      // إعادة التوجيه إذا لم يكن embedded
      if (!embedded) {
        setTimeout(() => {
          router.push(redirectPath || '/login?message=signup_success');
        }, 1500);
      }

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
    { value: 'player', label: 'لاعب' },
    { value: 'owner', label: 'مالك ملعب' },
  ];

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
          {errors.general}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {showRoleSelector && (
          <SelectField
            label="نوع الحساب"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            options={roleOptions}
            required
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
        variant="success"
      >
        إنشاء حساب
      </Button>
    </form>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">إنشاء حساب جديد</h2>
        <p className="text-gray-600 mt-1">انضم إلى مجتمعنا وابدأ رحلة الحجز</p>
      </div>
      
      {formContent}
    </Card>
  );
};

export default SignupForm;
