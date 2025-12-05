import { useState, useEffect, useCallback } from 'react';
import { Stadium, StadiumSlot } from '@/types/stadium.types';

interface Day {
  date: string;
  dayName: string;
  dayNumber: number;
  monthName: string;
  monthShort: string;
  year: number;
  isToday: boolean;
  isTomorrow: boolean;
  isWeekend: boolean;
  slots: StadiumSlot[];
  hasAvailableSlots: boolean;
}

interface StadiumDetailResponse {
  stadium: Stadium;
  days: Day[];
  statistics: {
    totalSlots: number;
    availableSlots: number;
    bookedSlots: number;
  };
}

export const useStadiumDetail = (stadiumId: string) => {
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<StadiumSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStadiumData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/stadiums/${stadiumId}`);
      
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات الملعب');
      }

      const data: StadiumDetailResponse = await response.json();

      setStadium(data.stadium);
      setDays(data.days);
      
      // اختيار اليوم الأول تلقائياً إذا لم يكن هناك يوم محدد
      if (!selectedDay && data.days.length > 0) {
        setSelectedDay(data.days[0].date);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      console.error('Error loading stadium data:', err);
    } finally {
      setLoading(false);
    }
  }, [stadiumId, selectedDay]);

  useEffect(() => {
    if (stadiumId) {
      loadStadiumData();
    }
  }, [stadiumId, loadStadiumData]);

  const selectDay = (date: string) => {
    setSelectedDay(date);
    setSelectedSlot(null); // إعادة تعيين الساعة المختارة عند تغيير اليوم
  };

  const selectSlot = (slot: StadiumSlot | null) => {
    setSelectedSlot(slot);
  };

  // الحصول على الساعات المتاحة لليوم المحدد فقط
  const getAvailableSlotsForSelectedDay = () => {
    const day = days.find(d => d.date === selectedDay);
    return day ? day.slots.filter(slot => slot.isAvailable) : [];
  };

  return {
    stadium,
    days,
    selectedDay,
    selectedSlot,
    loading,
    error,
    selectDay,
    selectSlot,
    loadStadiumData,
    availableSlots: getAvailableSlotsForSelectedDay(),
  };
};
