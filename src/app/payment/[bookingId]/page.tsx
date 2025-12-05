'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PaymentSummary from '../shared/PaymentSummary';
import PaymentMethodSelector from '../shared/PaymentMethodSelector';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Shield, Lock, CreditCard } from 'lucide-react';
import { paymentService } from '@/lib/services/payment.service';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paymob' | 'code' | 'cash'>('paymob');
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookingDetails();
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
    if (!voucherCode.trim()) {
      setError('يرجى إدخال كود الخصم');
      return;
    }

    try {
      const response = await fetch('/api/payments/validate-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode, amount: booking.totalAmount }),
      });

      const data = await response.json();

      if (data.valid) {
        setDiscount(data.discountAmount);
        setError('');
        alert(`تم تطبيق خصم بقيمة ${data.discountAmount} ج.م`);
      } else {
        setError(data.message || 'كود الخصم غير صالح');
        setDiscount(0);
      }
    } catch (err) {
      setError('حدث خطأ في التحقق من الكود');
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      setError('يرجى اختيار طريقة الدفع');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      let result;

      if (paymentMethod === 'paymob') {
        // Paymob integration
        result = await paymentService.createPaymobOrder({
          bookingId,
          amount: booking.totalAmount - discount,
          items: [{
            name: `حجز ${booking.stadiumName}`,
            amount: booking.totalAmount - discount,
            description: `حجز من ${booking.startTime} إلى ${booking.endTime}`,
          }],
        });

        if (result.success && result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else {
          throw new Error(result.message || 'فشل في إنشاء طلب الدفع');
        }
      } else if (paymentMethod === 'code') {
        // Voucher payment
        if (!voucherCode.trim()) {
          throw new Error('يرجى إدخال كود الخصم');
        }

        result = await paymentService.payWithVoucher({
          bookingId,
          voucherCode,
          amount: booking.totalAmount,
        });

        if (result.success) {
          router.push(`/payment/success?bookingId=${bookingId}`);
        } else {
          throw new Error(result.message || 'فشل في استخدام الكود');
        }
      } else if (paymentMethod === 'cash') {
        // Cash payment
        result = await paymentService.markAsCashPayment(bookingId);

        if (result.success) {
          router.push(`/payment/success?bookingId=${bookingId}&method=cash`);
        } else {
          throw new Error(result.message || 'فشل في تأكيد الدفع النقدي');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في عملية الدفع');
      console.error('Payment error:', err);
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
            {/* Security Badge */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 ml-3 rtl:mr-3 rtl:ml-0" />
                <div>
                  <h4 className="font-bold text-blue-800 dark:text-blue-300">
                    دفع آمن 100%
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    جميع عمليات الدفع مشفرة ومحمية
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center mb-6">
                <CreditCard className="h-5 w-5 text-primary ml-2 rtl:mr-2 rtl:ml-0" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  طريقة الدفع
                </h3>
              </div>

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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    تأكيد الدفع
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    سيتم تحويلك لبوابة الدفع بعد التأكيد
                  </p>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Lock className="h-4 w-4 ml-1 rtl:mr-1 rtl:ml-0" />
                  آمن ومشفر
                </div>
              </div>

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
                disabled={processing || totalAmount <= 0}
              >
                {processing ? 'جاري المعالجة...' : `ادفع الآن ${totalAmount} ج.م`}
              </Button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                بالضغط على "ادفع الآن" فأنت توافق على{' '}
                <a href="/terms" className="text-primary hover:underline">
                  الشروط والأحكام
                </a>
              </p>
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="space-y-6">
            <PaymentSummary
              booking={booking}
              discount={discount}
              paymentMethod={paymentMethod}
            />

            {/* Help & Support */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                🆘 مساعدة
              </h4>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  تواصل معنا إذا واجهتك أي مشكلة:
                </p>
                <div className="text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    📞 الهاتف: 01234567890
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    ✉️ البريد: support@ehgzly.com
                  </p>
                </div>
                <button className="w-full py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                  طلب المساعدة
                </button>
              </div>
            </div>

            {/* Payment Methods Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                💳 وسائل الدفع المقبولة
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                  <div className="text-xl">💳</div>
                  <p className="text-xs mt-1">بطاقات</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                  <div className="text-xl">📱</div>
                  <p className="text-xs mt-1">محفظة</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                  <div className="text-xl">🏦</div>
                  <p className="text-xs mt-1">فواتير</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
