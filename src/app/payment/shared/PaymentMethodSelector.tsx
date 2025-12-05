import React, { useState } from 'react';
import { CreditCard, Tag, DollarSign, Check, X } from 'lucide-react';
import { InputField } from '@/components/ui/InputField';

interface PaymentMethodSelectorProps {
  selectedMethod: 'paymob' | 'code' | 'cash';
  onMethodChange: (method: 'paymob' | 'code' | 'cash') => void;
  voucherCode: string;
  onVoucherCodeChange: (code: string) => void;
  onVoucherApply: () => void;
  discount: number;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  voucherCode,
  onVoucherCodeChange,
  onVoucherApply,
  discount,
}) => {
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState('');

  const handleVoucherApply = async () => {
    setVoucherLoading(true);
    setVoucherError('');
    try {
      await onVoucherApply();
    } catch (error) {
      setVoucherError('فشل في تطبيق الكود');
    } finally {
      setVoucherLoading(false);
    }
  };

  const paymentMethods = [
    {
      id: 'paymob',
      icon: <CreditCard className="h-5 w-5" />,
      title: 'دفع إلكتروني',
      description: 'الدفع بالبطاقة أو المحفظة الإلكترونية',
      features: ['بطاقات ائتمانية', 'فواتير المحمول', 'محافظ إلكترونية'],
    },
    {
      id: 'code',
      icon: <Tag className="h-5 w-5" />,
      title: 'كود خصم / كوبون',
      description: 'استخدام كود خصم أو كوبون حجز',
      features: ['خصم فوري', 'أكواد مخصصة', 'كوبونات هدايا'],
    },
    {
      id: 'cash',
      icon: <DollarSign className="h-5 w-5" />,
      title: 'دفع نقدي في الملعب',
      description: 'الدفع عند الوصول للملعب',
      features: ['بدون رسوم', 'تأكيد فوري', 'مناسب للجميع'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedMethod === method.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => onMethodChange(method.id as any)}
              className="absolute opacity-0"
            />
            
            <div className="flex items-start">
              <div className={`p-2 rounded-lg ${
                selectedMethod === method.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {method.icon}
              </div>
              
              <div className="mr-3 rtl:ml-3 rtl:mr-0 flex-1">
                <h4 className="font-bold text-gray-900 dark:text-white">
                  {method.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {method.description}
                </p>
                
                <ul className="mt-3 space-y-1">
                  {method.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Check className="h-3 w-3 ml-1 rtl:mr-1 rtl:ml-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedMethod === method.id && (
                <div className="absolute top-2 left-2 rtl:right-2 rtl:left-auto">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* Voucher Code Input (only for code method) */}
      {selectedMethod === 'code' && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Tag className="h-5 w-5 text-primary ml-2 rtl:mr-2 rtl:ml-0" />
            <h4 className="font-bold text-gray-900 dark:text-white">
              أدخل كود الخصم
            </h4>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <InputField
                  placeholder="أدخل الكود هنا..."
                  value={voucherCode}
                  onChange={onVoucherCodeChange}
                  error={voucherError}
                />
              </div>
              <button
                onClick={handleVoucherApply}
                disabled={voucherLoading || !voucherCode.trim()}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {voucherLoading ? 'جاري التطبيق...' : 'تطبيق'}
              </button>
            </div>

            {discount > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400 ml-2 rtl:mr-2 rtl:ml-0" />
                    <span className="text-green-700 dark:text-green-300">
                      تم تطبيق خصم بقيمة {discount} ج.م
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onVoucherCodeChange('');
                      onVoucherApply();
                    }}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>• يمكن استخدام الكود مرة واحدة فقط</p>
              <p>• بعض الأكواد لها تاريخ صلاحية</p>
              <p>• الخصم يطبق على الإجمالي النهائي</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Info (for paymob) */}
      {selectedMethod === 'paymob' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400 ml-2 rtl:mr-2 rtl:ml-0" />
            <div>
              <h4 className="font-bold text-blue-800 dark:text-blue-300">
                بوابة دفع آمنة
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                سيتم تحويلك لبوابة Paymob الآمنة لإتمام الدفع
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-2xl">💳</div>
              <p className="text-xs mt-1">بطاقات</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-2xl">📱</div>
              <p className="text-xs mt-1">فواتير</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-2xl">🏦</div>
              <p className="text-xs mt-1">محافظ</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-2xl">🔒</div>
              <p className="text-xs mt-1">آمن</p>
            </div>
          </div>
        </div>
      )}

      {/* Cash Payment Info */}
      {selectedMethod === 'cash' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 ml-2 rtl:mr-2 rtl:ml-0" />
            <div>
              <h4 className="font-bold text-green-800 dark:text-green-300">
                تعليمات الدفع النقدي
              </h4>
              <p className="text-sm text-green-600 dark:text-green-400">
                اتبع هذه الخطوات لإتمام الحجز
              </p>
            </div>
          </div>

          <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full w-6 h-6 flex items-center justify-center ml-3 rtl:mr-3 rtl:ml-0 flex-shrink-0">
                1
              </span>
              <span>احجز الموعد عبر الموقع</span>
            </li>
            <li className="flex items-start">
              <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full w-6 h-6 flex items-center justify-center ml-3 rtl:mr-3 rtl:ml-0 flex-shrink-0">
                2
              </span>
              <span>اذهب للملعب في الموعد المحدد</span>
            </li>
            <li className="flex items-start">
              <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full w-6 h-6 flex items-center justify-center ml-3 rtl:mr-3 rtl:ml-0 flex-shrink-0">
                3
              </span>
              <span>ادفع المبلغ نقداً لإدارة الملعب</span>
            </li>
            <li className="flex items-start">
              <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full w-6 h-6 flex items-center justify-center ml-3 rtl:mr-3 rtl:ml-0 flex-shrink-0">
                4
              </span>
              <span>استلم تأكيد الحجز</span>
            </li>
          </ol>

          <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ⚠️ ملاحظة: يجب الحضور قبل الموعد بـ 15 دقيقة
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
