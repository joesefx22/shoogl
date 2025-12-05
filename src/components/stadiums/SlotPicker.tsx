'use client';

import React, { useState } from 'react';
import { Stadium, StadiumSlot } from '@/types/stadium.types';
import { Check, Clock, Users, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import BookingModal from './BookingModal';

interface SlotPickerProps {
  slots: StadiumSlot[];
  stadium: Stadium;
  date: string;
  onSlotsUpdate: () => void;
}

const SlotPicker: React.FC<SlotPickerProps> = ({ 
  slots, 
  stadium, 
  date,
  onSlotsUpdate 
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  // Group slots by time period
  const timePeriods = {
    morning: slots.filter(slot => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      return hour >= 6 && hour < 12;
    }),
    afternoon: slots.filter(slot => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      return hour >= 12 && hour < 18;
    }),
    evening: slots.filter(slot => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      return hour >= 18 && hour < 24;
    }),
  };

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId === selectedSlot ? null : slotId);
  };

  const handleBookNow = () => {
    if (selectedSlot) {
      setIsBookingModalOpen(true);
    }
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum < 12 ? 'ص' : 'م';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  };

  const renderTimeSlot = (slot: StadiumSlot) => {
    const isSelected = selectedSlot === slot.id;
    const isAvailable = slot.status === 'available';
    const isBooked = slot.status === 'booked';
    const isReserved = slot.status === 'reserved';

    return (
      <button
        key={slot.id}
        onClick={() => isAvailable && handleSlotSelect(slot.id)}
        disabled={!isAvailable}
        className={`relative p-4 rounded-lg border-2 transition-all ${
          isSelected
            ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
            : isAvailable
            ? 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
            : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
        }`}
      >
        {/* Slot Status Badge */}
        <div className="absolute top-2 left-2 rtl:right-2 rtl:left-auto">
          {isSelected ? (
            <div className="flex items-center text-xs bg-primary text-white px-2 py-1 rounded-full">
              <Check className="h-3 w-3 ml-1 rtl:mr-1 rtl:ml-0" />
              مختار
            </div>
          ) : isBooked ? (
            <div className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
              محجوز
            </div>
          ) : isReserved ? (
            <div className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full">
              محجوز مؤقتاً
            </div>
          ) : (
            <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
              متاح
            </div>
          )}
        </div>

        {/* Slot Time */}
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex items-center text-lg font-bold text-gray-900 dark:text-white mb-2">
            <Clock className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0 text-gray-400" />
            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </div>
          
          {/* Slot Info */}
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Users className="h-4 w-4 ml-1 rtl:mr-1 rtl:ml-0" />
              {slot.capacity} لاعب
            </div>
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 ml-1 rtl:mr-1 rtl:ml-0" />
              {slot.price} ج.م
            </div>
          </div>

          {/* Quick Actions for Available Slots */}
          {isAvailable && (
            <Button
              size="sm"
              className="mt-3 w-full"
              onClick={(e) => {
                e.stopPropagation();
                handleSlotSelect(slot.id);
              }}
            >
              {isSelected ? '✓ تم الاختيار' : 'اختيار'}
            </Button>
          )}
        </div>
      </button>
    );
  };

  return (
    <>
      <div className="space-y-8">
        {/* Morning Slots */}
        {timePeriods.morning.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2 rounded-lg ml-2 rtl:mr-2 rtl:ml-0">
                ☀️
              </span>
              فترات الصباح
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {timePeriods.morning.map(renderTimeSlot)}
            </div>
          </div>
        )}

        {/* Afternoon Slots */}
        {timePeriods.afternoon.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 p-2 rounded-lg ml-2 rtl:mr-2 rtl:ml-0">
                ⛅
              </span>
              فترات الظهيرة
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {timePeriods.afternoon.map(renderTimeSlot)}
            </div>
          </div>
        )}

        {/* Evening Slots */}
        {timePeriods.evening.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg ml-2 rtl:mr-2 rtl:ml-0">
                🌙
              </span>
              فترات المساء
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {timePeriods.evening.map(renderTimeSlot)}
            </div>
          </div>
        )}
      </div>

      {/* Booking Action Bar */}
      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary ml-2 rtl:mr-2 rtl:ml-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatTime(slots.find(s => s.id === selectedSlot)?.startTime || '')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stadium.name} • {new Date(date).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stadium.pricePerHour} ج.م
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    شامل {stadium.deposit} ج.م عربون
                  </p>
                </div>
                <Button
                  size="lg"
                  className="px-8"
                  onClick={handleBookNow}
                  disabled={loading === selectedSlot}
                >
                  {loading === selectedSlot ? (
                    <>
                      <span className="animate-spin ml-2 rtl:mr-2 rtl:ml-0">⟳</span>
                      جاري التأكيد...
                    </>
                  ) : (
                    'تأكيد الحجز'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        stadium={stadium}
        selectedSlot={selectedSlot}
        selectedDate={date}
        onSuccess={() => {
          onSlotsUpdate();
          setSelectedSlot(null);
        }}
      />
    </>
  );
};

export default SlotPicker;
