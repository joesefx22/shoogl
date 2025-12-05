'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Download, Share2, Home, Calendar, Mail, Phone } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface BookingDetails {
  id: string;
  stadiumName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  depositPaid: number;
  paymentMethod: string;
  status: string;
  stadium: {
    location: string;
    contactPhone: string;
  };
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const bookingId = searchParams.get('bookingId');
  const transactionId = searchParams.get('transactionId');
  const method = searchParams.get('method') || 'electronic';
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    }
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/${bookingId}`);
      
      if (!response.ok) {
        throw new Error('فشل في تحميل تفاصيل الحجز');
      }

      const data = await response.json();
      
      if (data.success) {
        setBooking(data.booking);
        
        // تحديث حالة الحجز إذا لزم الأمر
        if (method === 'electronic' && transactionId) {
          await verifyPayment();
        }
      } else {
        throw new Error(data.message || 'الحجز غير موجود');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async () => {
    try {
      await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          transactionId,
        }),
      });
    } catch (error) {
      console.error('Payment verification error:', error);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/receipt`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${bookingId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('فشل في تحميل الفاتورة');
      }
    } catch (error) {
      console.error('Download receipt error:', error);
      alert('حدث خطأ في تحميل الفاتورة');
    }
  };

  const handleShare = () => {
    if (!booking) return;

    const message = `✅ حجزت ملعب ${booking.stadiumName} عبر احجزلي!\n📅 الموعد: ${formatDate(booking.date)}\n⏰ الساعة: ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}\n📍 المكان: ${booking.stadium.location}\n📞 للتواصل: ${booking.stadium.contactPhone}\n🔢 رقم الحجز: ${bookingId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'تأكيد حجز ملعب',
        text: message,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(message);
      alert('تم نسخ تفاصيل الحجز إلى الحافظة 📋');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'حدث خطأ'}
          </h2>
          <Button
            onClick={() => router.push('/player/bookings')}
            variant="outline"
            className="mt-4"
          >
            العودة للحجوزات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-900/10 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 md:p-12 text-center relative">
            {/* Confetti Effect */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-8">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                تم الدفع بنجاح! 🎉
              </h1>
              <p className="text-green-100 text-lg">
                {method === 'cash' 
                  ? 'تم تأكيد حجزك بنجاح. يرجى الحضور في الموعد المحدد.' 
                  : 'تم تأكيد حجزك ودفع العربون بنجاح.'}
              </p>
              <div className="mt-6 inline-flex items-center px-4 py-2 bg-white/20 rounded-full">
                <span className="text-white font-mono">#{bookingId}</span>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Booking Info */}
              <div className="space-y-8">
                {/* Stadium Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center ml-4 rtl:mr-4 rtl:ml-0">
                      <span className="text-primary text-xl">⚽</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-xl">
                        {booking.stadiumName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {booking.stadium.location}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 ml-3 rtl:mr-3 rtl:ml-0" />
                      <div className="mr-3 rtl:ml-3 rtl:mr-0">
                        <p className="text-sm text-gray-500 dark:text-gray-400">التاريخ</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(booking.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 ml-3 rtl:mr-3 rtl:ml-0" />
                      <div className="mr-3 rtl:ml-3 rtl:mr-0">
                        <p className="text-sm text-gray-500 dark:text-gray-400">وقت الحجز</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 ml-3 rtl:mr-3 rtl:ml-0" />
                      <div className="mr-3 rtl:ml-3 rtl:mr-0">
                        <p className="text-sm text-gray-500 dark:text-gray-400">هاتف الملعب</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {booking.stadium.contactPhone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                    تفاصيل الدفع
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">طريقة الدفع</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {method === 'cash' ? 'نقدي في الملعب' : 'دفع إلكتروني'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">المبلغ الإجمالي</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">العربون المدفوع</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        -{formatCurrency(booking.depositPaid)}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between font-bold">
                        <span className="text-gray-900 dark:text-white">المتبقي للدفع</span>
                        <span className="text-primary">
                          {formatCurrency(booking.totalAmount - booking.depositPaid)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Next Steps & Actions */}
              <div className="space-y-8">
                {/* Next Steps */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                  <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-6 text-xl">
                    📋 تعليمات مهمة
                  </h4>
                  <ol className="space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center ml-4 rtl:mr-4 rtl:ml-0">
                        <span className="text-blue-600 dark:text-blue-300 font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          تأكيد عبر SMS وEmail
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          سيصلك تأكيد خلال دقائق على هاتفك وبريدك
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center ml-4 rtl:mr-4 rtl:ml-0">
                        <span className="text-blue-600 dark:text-blue-300 font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          الحضور قبل الموعد
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          احضر قبل الموعد بـ 15 دقيقة على الأقل
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center ml-4 rtl:mr-4 rtl:ml-0">
                        <span className="text-blue-600 dark:text-blue-300 font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          عرض رمز الحجز
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          أظهر رمز الحجز أو QR Code لإدارة الملعب
                        </p>
                      </div>
                    </li>
                    {method === 'cash' && (
                      <li className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center ml-4 rtl:mr-4 rtl:ml-0">
                          <span className="text-blue-600 dark:text-blue-300 font-bold">4</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            الدفع النقدي
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            ادفع المبلغ المتبقي نقداً عند الوصول
                          </p>
                        </div>
                      </li>
                    )}
                  </ol>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-6">
                    🚀 إجراءات سريعة
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={handleDownloadReceipt}
                      variant="outline"
                      className="h-12 flex flex-col items-center justify-center"
                    >
                      <Download className="h-5 w-5 mb-1" />
                      <span className="text-xs">فاتورة</span>
                    </Button>
                    
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="h-12 flex flex-col items-center justify-center"
                    >
                      <Share2 className="h-5 w-5 mb-1" />
                      <span className="text-xs">مشاركة</span>
                    </Button>
                    
                    <Button
                      onClick={() => router.push('/player/bookings')}
                      variant="outline"
                      className="h-12 flex flex-col items-center justify-center"
                    >
                      <Calendar className="h-5 w-5 mb-1" />
                      <span className="text-xs">حجوزاتي</span>
                    </Button>
                    
                    <Button
                      onClick={() => router.push('/stadiums')}
                      variant="outline"
                      className="h-12 flex flex-col items-center justify-center"
                    >
                      <Home className="h-5 w-5 mb-1" />
                      <span className="text-xs">ملاعب جديدة</span>
                    </Button>
                  </div>
                </div>

                {/* Support Card */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                  <h4 className="font-bold text-green-800 dark:text-green-300 mb-4">
                    🆘 المساعدة والدعم
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-green-600 dark:text-green-400 ml-2 rtl:mr-2 rtl:ml-0" />
                      <span className="text-gray-700 dark:text-gray-300">01234567890</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-green-600 dark:text-green-400 ml-2 rtl:mr-2 rtl:ml-0" />
                      <span className="text-gray-700 dark:text-gray-300">support@ehgzly.com</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      خدمة العملاء متاحة 24/7
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="mt-12 text-center">
              <Button
                size="lg"
                className="px-12 py-4 text-lg"
                onClick={() => router.push(`/bookings/${bookingId}`)}
              >
                عرض تفاصيل الحجز الكاملة
              </Button>
              <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
                يمكنك متابعة حجزك وتعديله من صفحة "حجوزاتي"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti Animation CSS */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
