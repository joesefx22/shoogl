'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Download, Share2, Home, Calendar } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const bookingId = searchParams.get('bookingId');
  const method = searchParams.get('method');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    }
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBooking(data.booking);
        }
      }
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    // Generate and download receipt
    alert('سيتم تنزيل الفاتورة قريباً');
  };

  const handleShare = () => {
    const message = `حجزت ملعب ${booking?.stadiumName} عبر احجزلي!\nالموعد: ${booking?.date} الساعة: ${booking?.startTime}\nرقم الحجز: ${bookingId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'تأكيد الحجز',
        text: message,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(message);
      alert('تم نسخ تفاصيل الحجز إلى الحافظة');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum < 12 ? 'ص' : 'م';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-900/10 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              تم الدفع بنجاح! 🎉
            </h1>
            <p className="text-green-100">
              {method === 'cash' 
                ? 'تم تأكيد حجزك بنجاح. يرجى الحضور في الموعد المحدد.' 
                : 'تم تأكيد حجزك ودفع العربون بنجاح.'}
            </p>
          </div>

          {/* Booking Details */}
          <div className="p-8">
            {booking && !loading ? (
              <div className="space-y-6">
                {/* Booking Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                    تفاصيل الحجز
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">الملعب</p>
                        <p className="font-bold text-gray-900 dark:text-white">{booking.stadiumName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">التاريخ</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(booking.date)}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">الوقت</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">رقم الحجز</p>
                        <p className="font-mono text-gray-900 dark:text-white">{bookingId}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                    تفاصيل الدفع
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">طريقة الدفع</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {method === 'cash' ? 'نقدي' : 'إلكتروني'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">المبلغ المدفوع</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {booking.totalAmount} ج.م
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">حالة الدفع</span>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                        مكتمل
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                  <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3">
                    الخطوات التالية
                  </h4>
                  <ol className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                    <li className="flex items-center">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center ml-2 rtl:mr-2 rtl:ml-0">
                        1
                      </span>
                      سيصلك تأكيد عبر SMS وEmail
                    </li>
                    <li className="flex items-center">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center ml-2 rtl:mr-2 rtl:ml-0">
                        2
                      </span>
                      احضر قبل الموعد بـ 15 دقيقة
                    </li>
                    <li className="flex items-center">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center ml-2 rtl:mr-2 rtl:ml-0">
                        3
                      </span>
                      عرض رمز الحجز عند الوصول
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">جاري تحميل تفاصيل الحجز...</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={() => router.push('/player/bookings')}
                className="flex items-center justify-center"
              >
                <Calendar className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                حجوزاتي
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownloadReceipt}
                className="flex items-center justify-center"
              >
                <Download className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                فاتورة
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center justify-center"
              >
                <Share2 className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                مشاركة
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="flex items-center justify-center"
              >
                <Home className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                الرئيسية
              </Button>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                للحصول على مساعدة أو استفسار:
              </p>
              <p className="text-gray-900 dark:text-white">
                📞 01234567890 | ✉️ support@ehgzly.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
