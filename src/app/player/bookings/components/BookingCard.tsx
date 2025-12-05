'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Calendar, Clock, MapPin, Users, CreditCard, ChevronDown, ChevronUp, Receipt } from 'lucide-react';
import CancelBookingButton from './CancelBookingButton';
import { Booking } from '@/types/stadium.types';

interface BookingCardProps {
  booking: Booking;
  onUpdated: () => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onUpdated }) => {
  const [expanded, setExpanded] = useState(false);
  const [processing, setProcessing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'refunded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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

  const handlePay = async () => {
    try {
      setProcessing(true);
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.totalPaid - booking.depositPaid,
        }),
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.message || 'حدث خطأ في إنشاء طلب الدفع');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('حدث خطأ في عملية الدفع');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadReceipt = () => {
    // Generate and download receipt
    alert('سيتم تنزيل الفاتورة قريباً');
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {booking.stadium?.name || 'حجز ملعب'}
              </h3>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status === 'confirmed' ? 'مؤكدة' : 
                   booking.status === 'pending' ? 'قيد الانتظار' : 
                   booking.status === 'cancelled' ? 'ملغية' : 
                   booking.status === 'completed' ? 'مكتملة' : booking.status}
                </Badge>
                <Badge className={getPaymentColor(booking.paymentStatus)}>
                  {booking.paymentStatus === 'paid' ? 'مدفوع' : 
                   booking.paymentStatus === 'pending' ? 'قيد الدفع' : 
                   booking.paymentStatus === 'failed' ? 'فشل' : 
                   booking.paymentStatus === 'refunded' ? 'تم الاسترجاع' : booking.paymentStatus}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                <span>{formatDate(booking.date)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                <span>{booking.playersCount} لاعب</span>
              </div>
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                <span>{booking.totalPaid} ج.م</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">تفاصيل الحجز</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">رقم الحجز:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{booking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">تاريخ الإنشاء:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(booking.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">طريقة الدفع:</span>
                  <span className="text-gray-900 dark:text-white">{booking.paymentMethod}</span>
                </div>
                {booking.voucherCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">كود الخصم:</span>
                    <span className="text-green-600 dark:text-green-400">{booking.voucherCode}</span>
                  </div>
                )}
                {booking.notes && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 block mb-1">ملاحظات:</span>
                    <p className="text-gray-900 dark:text-white">{booking.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">تفاصيل السعر</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">سعر الساعة:</span>
                  <span>{booking.price} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">العربون المدفوع:</span>
                  <span className="text-green-600 dark:text-green-400">-{booking.depositPaid} ج.م</span>
                </div>
                {booking.totalPaid > booking.depositPaid && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">المتبقي للدفع:</span>
                    <span className="text-red-600 dark:text-red-400">
                      {booking.totalPaid - booking.depositPaid} ج.م
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 font-bold">
                  <span>الإجمالي:</span>
                  <span className="text-lg">{booking.totalPaid} ج.م</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
            {booking.paymentStatus !== 'paid' && booking.status !== 'cancelled' && (
              <Button
                onClick={handlePay}
                loading={processing}
                disabled={processing}
              >
                <CreditCard className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                {booking.depositPaid > 0 ? 'ادفع الباقي' : 'ادفع الآن'}
              </Button>
            )}

            {booking.paymentStatus === 'paid' && (
              <Button
                variant="outline"
                onClick={handleDownloadReceipt}
              >
                <Receipt className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                تحميل الفاتورة
              </Button>
            )}

            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <CancelBookingButton
                bookingId={booking.id}
                onCancel={onUpdated}
              />
            )}

            <Button
              variant="outline"
              onClick={() => window.location.href = `/stadiums/${booking.stadiumId}`}
            >
              <MapPin className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
              عرض الملعب
            </Button>
          </div>
        </div>
      )}

      {/* Collapsed Actions */}
      {!expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              العربون: {booking.depositPaid} ج.م • الإجمالي: {booking.totalPaid} ج.م
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {booking.paymentStatus !== 'paid' && booking.status !== 'cancelled' && (
                <Button
                  size="sm"
                  onClick={handlePay}
                  loading={processing}
                  disabled={processing}
                >
                  دفع
                </Button>
              )}
              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                <CancelBookingButton
                  bookingId={booking.id}
                  onCancel={onUpdated}
                  size="sm"
                  variant="outline"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default BookingCard;
