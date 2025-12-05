import React from 'react';
import { Calendar, Clock, MapPin, Users, CreditCard } from 'lucide-react';

interface PaymentSummaryProps {
  booking: any;
  discount: number;
  paymentMethod: string;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  booking,
  discount,
  paymentMethod,
}) => {
  if (!booking) return null;

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

  const totalAmount = booking.totalAmount - discount;
  const depositAmount = booking.depositAmount || 0;
  const remainingAmount = totalAmount - depositAmount;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-24">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        ملخص الطلب
      </h3>

      {/* Booking Details */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center ml-3 rtl:mr-3 rtl:ml-0">
            <span className="text-primary font-bold">⚽</span>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">
              {booking.stadiumName}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {booking.stadiumType === 'football' ? 'ملعب كرة قدم' : 'ملعب بادل'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 text-gray-400 ml-2 rtl:mr-2 rtl:ml-0" />
            <span className="text-gray-600 dark:text-gray-400 ml-1 rtl:mr-1 rtl:ml-0">التاريخ:</span>
            <span className="font-medium text-gray-900 dark:text-white mr-auto rtl:ml-auto rtl:mr-0">
              {formatDate(booking.date)}
            </span>
          </div>

          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 text-gray-400 ml-2 rtl:mr-2 rtl:ml-0" />
            <span className="text-gray-600 dark:text-gray-400 ml-1 rtl:mr-1 rtl:ml-0">الوقت:</span>
            <span className="font-medium text-gray-900 dark:text-white mr-auto rtl:ml-auto rtl:mr-0">
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </span>
          </div>

          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 text-gray-400 ml-2 rtl:mr-2 rtl:ml-0" />
            <span className="text-gray-600 dark:text-gray-400 ml-1 rtl:mr-1 rtl:ml-0">اللاعبين:</span>
            <span className="font-medium text-gray-900 dark:text-white mr-auto rtl:ml-auto rtl:mr-0">
              {booking.playersCount || 0} لاعب
            </span>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
          تفاصيل السعر
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">سعر الحجز</span>
            <span className="text-gray-900 dark:text-white">{booking.totalAmount} ج.م</span>
          </div>

          {booking.depositAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">العربون المدفوع</span>
              <span className="text-green-600 dark:text-green-400">-{booking.depositAmount} ج.م</span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">خصم</span>
              <span className="text-green-600 dark:text-green-400">-{discount} ج.م</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">رسوم الخدمة</span>
            <span className="text-gray-900 dark:text-white">0 ج.م</span>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <span className="font-bold text-gray-900 dark:text-white">المبلغ المطلوب</span>
              <span className="font-bold text-lg text-primary">
                {remainingAmount > 0 ? remainingAmount : 0} ج.م
              </span>
            </div>
            {remainingAmount <= 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                ✓ تم دفع كامل المبلغ
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Order Info */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">رقم الحجز</span>
            <span className="font-mono text-gray-900 dark:text-white">{booking.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">طريقة الدفع</span>
            <span className="text-gray-900 dark:text-white">
              {paymentMethod === 'paymob' ? 'دفع إلكتروني' :
               paymentMethod === 'code' ? 'كود خصم' :
               paymentMethod === 'cash' ? 'نقدي' : '--'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">تاريخ الإنشاء</span>
            <span className="text-gray-900 dark:text-white">
              {new Date(booking.createdAt).toLocaleDateString('ar-EG')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
