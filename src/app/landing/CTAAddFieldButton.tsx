'use client';

import React from 'react';
import { PlusCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/toast/useToast';

/**
 * زر إضافة ملعب جديد - يفتح Google Form
 */
const CTAAddFieldButton: React.FC = () => {
  const { toast } = useToast();

  // رابط Google Form لإضافة ملعب جديد
  const GOOGLE_FORM_URL = process.env.NEXT_PUBLIC_ADD_FIELD_FORM_URL || 
    'https://docs.google.com/forms/d/e/1FAIpQLSe...';

  const handleAddField = () => {
    // فتح Google Form في نافذة جديدة
    window.open(GOOGLE_FORM_URL, '_blank', 'noopener,noreferrer');
    
    // إظهار إشعار للمستخدم
    toast({
      title: 'فتح نموذج إضافة ملعب',
      description: 'سيتم فتح نموذج Google في نافذة جديدة',
      variant: 'info',
      duration: 3000,
    });
    
    // تتبع الحدث (اختياري)
    // analytics.track('add_field_clicked');
  };

  return (
    <div className="relative">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl blur-xl"></div>
      
      {/* Main Card */}
      <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Content */}
          <div className="flex-1 text-center md:text-right">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <PlusCircle className="w-8 h-8 text-primary" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              هل لديك ملعب وتريد إضافته؟
            </h3>
            
            <p className="text-gray-600 mb-6 max-w-2xl">
              انضم إلى منصتنا كمالك ملعب واربح من وقت فراغ ملعبك. 
              نوفر لك نظام حجز كامل، دفع آمن، وإدارة سهلة للحجوزات والموظفين.
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="px-4 py-2 bg-primary/5 text-primary rounded-lg text-sm font-medium">
                🎯 زيادة الإيرادات
              </div>
              <div className="px-4 py-2 bg-primary/5 text-primary rounded-lg text-sm font-medium">
                📊 إحصائيات مفصلة
              </div>
              <div className="px-4 py-2 bg-primary/5 text-primary rounded-lg text-sm font-medium">
                👥 إدارة الموظفين
              </div>
            </div>
          </div>
          
          {/* Right Content - CTA Button */}
          <div className="flex flex-col items-center">
            <Button
              onClick={handleAddField}
              variant="primary"
              size="lg"
              className="px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <PlusCircle className="ml-2 w-6 h-6" />
              أضف ملعبك الآن
              <ExternalLink className="mr-2 w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="mt-4 text-sm text-gray-500 text-center max-w-xs">
              سيتم فتح نموذج Google لإضافة ملعبك. 
              سنتواصل معك خلال ٢٤ ساعة
            </p>
            
            {/* Owner Benefits */}
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">لا رسوم إضافة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">دعم فني 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">مدفوعات آمنة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">تطبيق مخصص</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Success Stories (Optional) */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            انضم إلى أكثر من 200 مالك ملعب
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-primary mb-1">+40%</div>
              <div className="text-gray-600">زيادة في الإيرادات</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-primary mb-1">95%</div>
              <div className="text-gray-600">رضا العملاء</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-primary mb-1">24 س</div>
              <div className="text-gray-600">متوسط وقت التفعيل</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTAAddFieldButton;
