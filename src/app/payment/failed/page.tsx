'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { XCircle, RefreshCw, CreditCard, Home } from 'lucide-react';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const errorCode = searchParams.get('code');
  const bookingId = searchParams.get('bookingId');
  const message = searchParams.get('message');

  const getErrorMessage = () => {
    switch (errorCode) {
      case 'insufficient_funds':
        return 'رصيدك غير كافي لإتمام الدفع';
      case 'card_declined':
        return 'تم رفض بطاقتك من قبل البنك';
      case 'expired_card':
        return 'بطاقتك منتهية الصلاحية';
      case 'network_error':
        return 'حدث خطأ في الشبكة، يرجى المحاولة مرة أخرى';
      default:
        return message || 'حدث خطأ غير متوقع أثناء عملية الدفع';
    }
  };

  const handleRetry = () => {
    if (bookingId) {
      router.push(`/payment/${bookingId}`);
    } else {
      router.push('/player/bookings');
    }
  };

  const handleTryOtherMethod = () => {
    if (bookingId) {
      router.push(`/payment/${bookingId}?method=cash`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-red-900/10 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Error Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              فشل في الدفع ❌
            </h1>
            <p className="text-red-100">
              لم نتمكن من إتمام عملية الدفع
            </p>
          </div>

          {/* Error Details */}
          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-lg text-gray-900 dark:text-white mb-4">
                {getErrorMessage()}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                رقم الخطأ: {errorCode || 'غير معروف'}
              </p>
            </div>

            {/* Solutions */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-8">
              <h4 className="font-bold text-yellow-800 dark:text-yellow-300 mb-3">
                حلول مقترحة
              </h4>
              <ul className="space-y-2 text-sm text-yellow-700 dark:text-yellow-400">
                <li className="flex items-start">
                  <span className="ml-2 rtl:mr-2 rtl:ml-0">•</span>
                  <span>تأكد من صحة بيانات البطاقة</span>
                </li>
                <li className="flex items-start">
                  <span className="ml-2 rtl:mr-2 rtl:ml-0">•</span>
                  <span>تحقق من رصيد بطاقتك</span>
                </li>
                <li className="flex items-start">
                  <span className="ml-2 rtl:mr-2 rtl:ml-0">•</span>
                  <span>جرب بطاقة أو طريقة دفع أخرى</span>
                </li>
                <li className="flex items-start">
                  <span className="ml-2 rtl:mr-2 rtl:ml-0">•</span>
                  <span>انتظر قليلاً وحاول مرة أخرى</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleRetry}
                className="w-full py-3 flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                حاول مرة أخرى
              </Button>
              
              <Button
                variant="outline"
                onClick={handleTryOtherMethod}
                className="w-full py-3 flex items-center justify-center"
              >
                <CreditCard className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                جرب طريقة دفع أخرى
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => router.push('/player/bookings')}
                className="w-full py-3 flex items-center justify-center"
              >
                <Home className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                العودة للحجوزات
              </Button>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                إذا استمرت المشكلة، تواصل مع الدعم:
              </p>
              <p className="text-gray-900 dark:text-white">
                📞 01234567890
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                أو راسلنا على support@ehgzly.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
