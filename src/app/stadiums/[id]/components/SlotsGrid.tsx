import React from 'react';
import { Stadium, StadiumSlot } from '@/types/stadium.types';
import { Clock, Check, X, Users, CreditCard } from 'lucide-react';

interface SlotsGridProps {
  slots: StadiumSlot[];
  selectedSlot: StadiumSlot | null;
  onSelectSlot: (slot: StadiumSlot | null) => void;
  stadium: Stadium;
}

export const SlotsGrid: React.FC<SlotsGridProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  stadium,
}) => {
  if (slots.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          لا توجد أوقات متاحة
        </h4>
        <p className="text-gray-600 dark:text-gray-400">
          لا توجد أوقات متاحة للعب في هذا اليوم
        </p>
      </div>
    );
  }

  const availableSlots = slots.filter(slot => slot.isAvailable);
  const bookedSlots = slots.filter(slot => !slot.isAvailable);

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum < 12 ? 'ص' : 'م';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  };

  const renderSlot = (slot: StadiumSlot) => {
    const isSelected = selectedSlot?.id === slot.id;
    const isAvailable = slot.isAvailable;

    return (
      <button
        key={slot.id}
        onClick={() => isAvailable && onSelectSlot(isSelected ? null : slot)}
        disabled={!isAvailable}
        className={`relative p-4 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
          isSelected
            ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
            : isAvailable
            ? 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
            : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
        }`}
      >
        {/* Slot Status */}
        <div className="absolute top-3 left-3 rtl:right-3 rtl:left-auto">
          {isSelected ? (
            <div className="flex items-center text-xs bg-primary text-white px-2 py-1 rounded-full">
              <Check className="h-3 w-3 ml-1 rtl:mr-1 rtl:ml-0" />
              مختار
            </div>
          ) : !isAvailable ? (
            <div className="flex items-center text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
              <X className="h-3 w-3 ml-1 rtl:mr-1 rtl:ml-0" />
              محجوز
            </div>
          ) : null}
        </div>

        {/* Slot Content */}
        <div className="flex flex-col items-center">
          {/* Time */}
          <div className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 w-full text-sm">
            <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <CreditCard className="h-4 w-4 text-gray-600 dark:text-gray-400 mb-1" />
              <span className="font-medium text-gray-900 dark:text-white">
                {slot.price} ج.م
              </span>
            </div>
            <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Users className="h-4 w-4 text-gray-600 dark:text-gray-400 mb-1" />
              <span className="font-medium text-gray-900 dark:text-white">
                {slot.capacity}
              </span>
            </div>
          </div>

          {/* Action Button */}
          {isAvailable && (
            <button
              className={`mt-4 w-full py-2 rounded-lg font-medium transition-colors ${
                isSelected
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSlot(isSelected ? null : slot);
              }}
            >
              {isSelected ? '✓ تم الاختيار' : 'اختيار هذا الوقت'}
            </button>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Available Slots */}
      {availableSlots.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            الأوقات المتاحة ({availableSlots.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {availableSlots.map(renderSlot)}
          </div>
        </div>
      )}

      {/* Booked Slots (Optional - can be hidden) */}
      {bookedSlots.length > 0 && (
        <div className="opacity-75">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            الأوقات المحجوزة ({bookedSlots.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {bookedSlots.map(renderSlot)}
          </div>
        </div>
      )}
    </div>
  );
};
