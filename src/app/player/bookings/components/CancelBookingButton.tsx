'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { InputField } from '@/components/ui/InputField';
import { X, AlertTriangle } from 'lucide-react';

interface CancelBookingButtonProps {
  bookingId: string;
  onCancel: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'destructive';
}

const CancelBookingButton: React.FC<CancelBookingButtonProps> = ({
  bookingId,
  onCancel,
  size = 'md',
  variant = 'outline',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCancelBooking = async () => {
    if (!cancellationReason.trim()) {
      setError('يرجى إدخال سبب الإلغاء');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: cancellationReason,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsModalOpen(false);
        setCancellationReason('');
        onCancel();
        
        // Show success message
        alert('تم إلغاء الحجز بنجاح');
      } else {
        setError(data.message || 'حدث خطأ في إلغاء الحجز');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
      console.error('Cancel booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRefundPolicy = () => {
    return {
      before24h: '100% استرجاع',
      before12h: '50% استرجاع',
      before6h: '25% استرجاع',
      after6h: 'لا يوجد استرجاع',
    };
  };

  const refundPolicy = getRefundPolicy();

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
        onClick={() => setIsModalOpen(true)}
      >
        <X className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
        إلغاء الحجز
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إلغاء الحجز"
        size="md"
      >
        <div className="space-y-6">
          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 ml-2 rtl:mr-2 rtl:ml-0" />
              <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                تحذير: إلغاء الحجز
              </h4>
            </div>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
              تأكد من رغبتك في إلغاء هذا الحجز. قد ينطبق على الإلغاء سياسة استرجاع.
            </p>
          </div>

          {/* Refund Policy */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 dark:text-white mb-3">
              سياسة الاسترجاع
            </h5>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">قبل 24 ساعة:</span>
                <span className="text-green-600 dark:text-green-400">{refundPolicy.before24h}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">قبل 12 ساعة:</span>
                <span className="text-yellow-600 dark:text-yellow-400">{refundPolicy.before12h}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">قبل 6 ساعات:</span>
                <span className="text-orange-600 dark:text-orange-400">{refundPolicy.before6h}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">بعد 6 ساعات:</span>
                <span className="text-red-600 dark:text-red-400">{refundPolicy.after6h}</span>
              </li>
            </ul>
          </div>

          {/* Cancellation Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              سبب الإلغاء <span className="text-red-500">*</span>
            </label>
            <textarea
              value={cancellationReason}
              onChange={(e) => {
                setCancellationReason(e.target.value);
                setError('');
              }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              placeholder="يرجى كتابة سبب الإلغاء..."
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={loading}
            >
              تراجع
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              loading={loading}
              disabled={loading || !cancellationReason.trim()}
            >
              تأكيد الإلغاء
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CancelBookingButton;
