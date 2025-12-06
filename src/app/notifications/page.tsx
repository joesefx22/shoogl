import React from 'react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الإشعارات - احجزلي',
  description: 'إدارة إشعارات الحجوزات والعروض',
};

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            الإشعارات
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة جميع إشعارات الحجوزات والعروض والأنشطة
          </p>
        </div>
        
        <NotificationCenter />
      </div>
    </div>
  );
}
