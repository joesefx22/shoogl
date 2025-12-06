export const currencyUtils = {
  // تنسيق العملة العربية
  formatArabicCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  // تنسيق العملة بدون رمز
  formatNumber(amount: number): string {
    return new Intl.NumberFormat('ar-EG').format(amount);
  },

  // حساب النسبة المئوية
  calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  },

  // تقريب المبلغ
  roundAmount(amount: number, decimals: number = 2): number {
    return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  // التحقق من صحة المبلغ
  isValidAmount(amount: any): boolean {
    if (typeof amount !== 'number') return false;
    if (isNaN(amount)) return false;
    if (amount < 0) return false;
    return true;
  },

  // تحويل المبلغ من سنتات
  fromCents(cents: number): number {
    return cents / 100;
  },

  // تحويل المبلغ إلى سنتات
  toCents(amount: number): number {
    return Math.round(amount * 100);
  },
};
