'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PaymentSummary from '../shared/PaymentSummary';
import PaymentMethodSelector from '../shared/PaymentMethodSelector';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Shield, Lock, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import { getNotificationService } from '@/lib/services/notification.service';

interface BookingDetails {
  id: string;
  stadiumId: string;
  stadiumName: string;
  stadiumType: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  depositAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  stadium: {
    location: string;
    contactPhone: string;
  };
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const bookingId = params.bookingId as string;
  const voucherCodeParam = searchParams.get('voucher');

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paymob' | 'code' | 'cash'>('paymob');
  const [voucherCode, setVoucherCode] = useState(voucherCodeParam || '');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bookingId && user) {
      loadBookingDetails();
    }
  }, [bookingId, user]);

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
        
        // إذا كان هناك كود خصم في الرابط، تحقق منه
        if (voucherCodeParam) {
          handleVoucherApply();
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

  const handleVoucherApply = async () => {
    if (!voucherCode.trim() || !booking) {
      setError('يرجى إدخال كود الخصم');
      return;
    }

    try {
      const response = await fetch('/api/payments/validate-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: voucherCode, 
          amount: booking.totalAmount,
          bookingId: booking.id 
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setDiscount(data.discountAmount);
        setError('');
      } else {
        setError(data.message || 'كود الخصم غير صالح');
        setDiscount(0);
      }
    } catch (err) {
      setError('حدث خطأ في التحقق من الكود');
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod || !booking || !user) {
      setError('يرجى اختيار طريقة الدفع');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      let result;

      if (paymentMethod === 'paymob') {
        // Paymob integration
        const response = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: booking.id }),
        });

        result = await response.json();

        if (result.success && result.paymentUrl) {
          // تسجيل محاولة الدفع
          await fetch('/api/payments/log-attempt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: booking.id,
              method: 'paymob',
              amount: booking.totalAmount - discount,
            }),
          });

          // إشعار الدفع
          const notificationService = getNotificationService();
          await notificationService.createNotification(user.id, {
            type: 'PAYMENT_INITIATED',
            title: 'بدأت عملية الدفع',
            message: `بدأت عملية دفع بقيمة ${booking.totalAmount - discount} ج.م`,
            sendEmail: true,
          });

          window.location.href = result.paymentUrl;
        } else {
          throw new Error(result.message || 'فشل في إنشاء طلب الدفع');
        }
      } else if (paymentMethod === 'code') {
        // Voucher payment
        if (!voucherCode.trim()) {
          throw new Error('يرجى إدخال كود الخصم');
        }

        const response = await fetch('/api/payments/use-voucher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking.id,
            voucherCode,
            userId: user.id,
            amount: booking.totalAmount,
          }),
        });

        result = await response.json();

        if (result.success) {
          // إشعار الدفع الناجح
          const notificationService = getNotificationService();
          await notificationService.createNotification(user.id, {
            type: 'PAYMENT_SUCCESS',
            title: 'تم الدفع باستخدام الكود',
            message: `تم دفع ${result.discountAmount} ج.م باستخدام كود الخصم`,
            sendEmail: true,
          });

          router.push(`/payment/success?bookingId=${booking.id}&method=code`);
        } else {
          throw new Error(result.message || 'فشل في استخدام الكود');
        }
      } else if (paymentMethod === 'cash') {
        // Cash payment
        const response = await fetch(`/api/bookings/${booking.id}/cash-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        result = await response.json();

        if (result.success) {
          // إشعار الحجز النقدي
          const notificationService = getNotificationService();
          await notificationService.createNotification(user.id, {
            type: 'BOOKING_CREATED',
            title: 'تم إنشاء حجز نقدي',
            message: `تم إنشاء حجز في ${booking.stadiumName} للدفع نقداً`,
            sendEmail: true,
          });

          router.push(`/payment/success?bookingId=${booking.id}&method=cash`);
        } else {
          throw new Error(result.message || 'فشل في تأكيد الدفع النقدي');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في عملية الدفع');
      console.error('Payment error:', err);
      
      // إشعار فشل الدفع
      if (user) {
        const notificationService = getNotificationService();
        await notificationService.createNotification(user.id, {
          type: 'PAYMENT_FAILED',
          title: 'فشل في عملية الدفع',
          message: 'حدث خطأ أثناء محاولة الدفع',
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error}
          </h2>
          <Button
            onClick={() => router.push('/player/bookings')}
            variant="outline"
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
            العودة للحجوزات
          </Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            الحجز غير موجود
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

  const totalAmount = booking.totalAmount - discount;
  const depositAmount = booking.depositAmount || 0;
  const remainingAmount = totalAmount - depositAmount;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                إتمام الدفع
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                أكمل عملية الدفع لتأكيد حجزك
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/player/bookings`)}
            >
              <ArrowLeft className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
              العودة
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Details - Left Column */}
          <div className="lg:col-span-2">
            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
              <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
                voucherCode={voucherCode}
                onVoucherCodeChange={setVoucherCode}
                onVoucherApply={handleVoucherApply}
                discount={discount}
              />
            </div>

            {/* Payment Button */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
                </div>
              )}

              <Button
                size="lg"
                className="w-full py-4 text-lg"
                onClick={handlePayment}
                loading={processing}
                disabled={processing || remainingAmount <= 0}
              >
                {processing ? 'جاري المعالجة...' : `ادفع الآن ${remainingAmount} ج.م`}
              </Button>
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="space-y-6">
            <PaymentSummary
              booking={booking}
              discount={discount}
              paymentMethod={paymentMethod}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
