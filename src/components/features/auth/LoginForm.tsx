'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/toast/useToast';
import { loginUser } from '@/lib/api/auth/authService';
import { setAuthData } from '@/lib/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectPath?: string;
  embedded?: boolean;
}

/**
 * نموذج تسجيل الدخول المعمول به
 */
const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  redirectPath, 
  embedded = false 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await loginUser(email, password);
      
      const { token, user } = response;
      
      // حفظ بيانات المصادقة
      setAuthData(token, user);
      
      // إشعار النجاح
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: `مرحباً بعودتك، ${user.name}!`,
        variant: 'success',
      });

      // Callback عند النجاح
      if (onSuccess) {
        onSuccess();
      }

      // إعادة التوجيه إذا لم يكن embedded
      if (!embedded) {
        setTimeout(() => {
          if (redirectPath) {
            router.push(redirectPath);
          } else {
            // توجيه حسب الدور
            switch (user.primaryRole) {
              case 'player':
                router.push('/player');
                break;
              case 'staff':
                router.push('/staff');
                break;
              case 'owner':
                router.push('/owner');
                break;
              case 'admin':
                router.push('/admin');
                break;
              default:
                router.push('/');
            }
          }
          router.refresh();
        }, 1000);
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول';
      
      toast({
        title: 'فشل تسجيل الدخول',
        description: errorMessage,
        variant: 'destructive',
      });

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
          {errors.general}
        </div>
      )}

      <InputField
        label="البريد الإلكتروني"
        type="email"
        placeholder="example@domain.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
        icon="mail"
      />

      <InputField
        label="كلمة المرور"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
        icon="lock"
      />

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
        variant="primary"
      >
        تسجيل الدخول
      </Button>
    </form>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">تسجيل الدخول</h2>
        <p className="text-gray-600 mt-1">أدخل بيانات حسابك للوصول</p>
      </div>
      
      {formContent}
    </Card>
  );
};

export default LoginForm;
