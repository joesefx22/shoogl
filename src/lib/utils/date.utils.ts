export const dateUtils = {
  // تنسيق التاريخ العربي
  formatArabicDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  // تنسيق الوقت العربي
  formatArabicTime(time: string): string {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum < 12 ? 'ص' : 'م';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  },

  // توليد الأيام السبعة القادمة
  generateNextSevenDays(): Array<{
    date: string;
    dayName: string;
    dayNumber: number;
    monthName: string;
    monthShort: string;
    year: number;
    isToday: boolean;
    isTomorrow: boolean;
    isWeekend: boolean;
  }> {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('ar-EG', { weekday: 'long' });
      const dayNumber = date.getDate();
      const monthName = date.toLocaleDateString('ar-EG', { month: 'long' });
      const monthShort = date.toLocaleDateString('ar-EG', { month: 'short' });
      const year = date.getFullYear();
      
      days.push({
        date: dateString,
        dayName,
        dayNumber,
        monthName,
        monthShort,
        year,
        isToday: i === 0,
        isTomorrow: i === 1,
        isWeekend: date.getDay() === 5 || date.getDay() === 6, // الجمعة أو السبت
      });
    }
    
    return days;
  },

  // حساب الفرق بين تاريخين بالساعات
  getHoursDifference(date1: Date, date2: Date): number {
    const diff = Math.abs(date1.getTime() - date2.getTime());
    return Math.floor(diff / (1000 * 60 * 60));
  },

  // التحقق إذا كان التاريخ في المستقبل
  isFutureDate(date: Date | string): boolean {
    return new Date(date) > new Date();
  },

  // إضافة أيام لتاريخ
  addDays(date: Date | string, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  // تنسيق التاريخ للعرض في الجداول
  formatTableDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('ar-EG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  },
};
