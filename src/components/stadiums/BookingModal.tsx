'use client';

import React, { useState } from 'react';
import { Stadium } from '@/types/stadium.types';
import { Modal } from '@/components/ui/Modal';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { CreditCard, User, Phone, Mail, Users, Calendar, Clock, MapPin } from 'lucide-react';
import { bookingService } from '@/lib/services/booking.service';
import { useAuth } from '@/hooks/auth/useAuth';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stadium: Stadium;
  selectedSlot: string | null;
  selectedDate: string;
  onSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  stadium,
  selectedSlot,
  selectedDate,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    playersCount: 0,
    notes: '',
    paymentMethod: 'online' as 'online' | 'cash' | 'code',
    voucherCode: '',
  });

  const selectedSlotData = stadium.slots?.find(s => s.id === selectedSlot);

  const handleInputChange = (field: keyof typeof bookingData, value: string | number) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!bookingData.name.trim()) {
      setError('الاسم مطلوب');
      return false;
    }
    if (!bookingData.phone.trim()) {
      setError('رقم الهاتف مطلوب');
      return false;
    }
    if (bookingData.phone.length < 10) {
      setError('رقم الهاتف غير صحيح');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const bookingPayload = {
        stadiumId: stadium.id,
        slotId: selectedSlot!,
        date: selectedDate,
        user: {
          name: bookingData.name,
          phone: bookingData.phone,
          email: bookingData.email || undefined,
        },
        playersCount: bookingData.playersCount || 0,
        notes: bookingData.notes || undefined,
        paymentMethod: bookingData.paymentMethod,
        voucherCode: bookingData.voucherCode || undefined,
      };

      const result = await bookingService.createBooking(bookingPayload);
      
      if (result.success) {
        onSuccess();
        onClose();
        // Show success message or redirect to payment page
        if (result.data.requiresPayment) {
          window.location.href = `/payment/${result.data.bookingId}`;
        } else {
          // Show success notification
          alert('تم الحجز بنجاح! سيصلك تأكيد عبر رسالة SMS');
        }
      } else {
        setError(result.message || 'حدث خطأ أثناء الحجز');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`حجز ${stadium.name}`}
      size="lg"
    >
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
            1
          </div>
          <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
            2
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-primary ml-2 rtl:mr-2 rtl:ml-0" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">التاريخ</p>
              <p className="font-medium">{formatDate(selectedDate)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-primary ml-2 rtl:mr-2 rtl:ml-0" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">الوقت</p>
              <p className="font-medium">
                {selectedSlotData ? `${formatTime(selectedSlotData.startTime)} - ${formatTime(selectedSlotData.endTime)}` : '--'}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-primary ml-2 rtl:mr-2 rtl:ml-0" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">المكان</p>
              <p className="font-medium truncate">{stadium.name}</p>
            </div>
          </div>
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-primary ml-2 rtl:mr-2 rtl:ml-0" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">السعر</p>
              <p className="font-medium">{stadium.pricePerHour} ج.م</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">معلومات الحاجز</h3>
          
          <InputField
            label="الاسم الكامل"
            icon={<User className="h-5 w-5" />}
            value={bookingData.name}
            onChange={(value) => handleInputChange('name', value)}
            required
          />
          
          <InputField
            label="رقم الهاتف"
            icon={<Phone className="h-5 w-5" />}
            value={bookingData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            type="tel"
            required
            placeholder="مثال: 01234567890"
          />
          
          <InputField
            label="البريد الإلكتروني (اختياري)"
            icon={<Mail className="h-5 w-5" />}
            value={bookingData.email}
            onChange={(value) => handleInputChange('email', value)}
            type="email"
            placeholder="example@email.com"
          />
          
          <InputField
            label="عدد اللاعبين (اختياري)"
            icon={<Users className="h-5 w-5" />}
            value={bookingData.playersCount.toString()}
            onChange={(value) => handleInputChange('playersCount', parseInt(value) || 0)}
            type="number"
            min="0"
            max="22"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ملاحظات إضافية (اختياري)
            </label>
            <textarea
              value={bookingData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              placeholder="أي ملاحظات أو طلبات خاصة..."
            />
          </div>
        </div>
      )}

      {/* Step 2: Payment Method */}
      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">طريقة الدفع</h3>
          
          <div className="space-y-3">
            <label className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-all">
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={bookingData.paymentMethod === 'online'}
                onChange={() => handleInputChange('paymentMethod', 'online')}
                className="ml-2 rtl:mr-2 rtl:ml-0"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-primary ml-2 rtl:mr-2 rtl:ml-0" />
                  <span className="font-medium">دفع إلكتروني</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  الدفع عبر البطاقة الإئتمانية أو فواتير المحمول
                </p>
              </div>
            </label>

            <label className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-all">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={bookingData.paymentMethod === 'cash'}
                onChange={() => handleInputChange('paymentMethod', 'cash')}
                className="ml-2 rtl:mr-2 rtl:ml-0"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-xl ml-2 rtl:mr-2 rtl:ml-0">💵</span>
                  <span className="font-medium">دفع نقدي في الملعب</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  الدفع عند الوصول للملعب
                </p>
              </div>
            </label>

            <label className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-all">
              <input
                type="radio"
                name="paymentMethod"
                value="code"
                checked={bookingData.paymentMethod === 'code'}
                onChange={() => handleInputChange('paymentMethod', 'code')}
                className="ml-2 rtl:mr-2 rtl:ml-0"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-xl ml-2 rtl:mr-2 rtl:ml-0">🎫</span>
                  <span className="font-medium">كود خصم أو كوبون</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  استخدام كود خصم أو كوبون حجز
                </p>
              </div>
            </label>
          </div>

          {bookingData.paymentMethod === 'code' && (
            <InputField
              label="أدخل الكود"
              value={bookingData.voucherCode}
              onChange={(value) => handleInputChange('voucherCode', value)}
              placeholder="مثال: SUMMER2024"
            />
          )}

          {/* Price Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">تفاصيل السعر</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">سعر الساعة</span>
                <span>{stadium.pricePerHour} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">العربون ({stadium.deposit}%)</span>
                <span className="text-red-600 dark:text-red-400">-{stadium.pricePerHour * (stadium.deposit / 100)} ج.م</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <span className="font-bold text-gray-900 dark:text-white">المبلغ المطلوب</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {stadium.pricePerHour - (stadium.pricePerHour * (stadium.deposit / 100))} ج.م
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Footer */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div>
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              رجوع
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          
          {step === 1 ? (
            <Button onClick={handleNext}>
              التالي: طريقة الدفع
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={loading}
            >
              {loading ? 'جاري الحجز...' : 'تأكيد الحجز والدفع'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default BookingModal;
