'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Bell, X, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface PermissionRequestProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export const PermissionRequest: React.FC<PermissionRequestProps> = ({
  onPermissionGranted,
  onPermissionDenied,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        // Show permission request after 5 seconds
        setTimeout(() => {
          setIsOpen(true);
        }, 5000);
      }
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('متصفحك لا يدعم الإشعارات');
      return;
    }

    setIsRequesting(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        console.log('Notification permission granted');
        
        // تسجيل الـ Service Worker
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);
            
            // الاشتراك في Push Notifications
            await subscribeToPush(registration);
          } catch (error) {
            console.error('Service Worker registration failed:', error);
          }
        }

        onPermissionGranted?.();
        setIsOpen(false);
      } else {
        onPermissionDenied?.();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const subscribeToPush = async (registration: ServiceWorkerRegistration) => {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''),
      });

      // إرسال الاشتراك للخادم
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      console.log('Push subscription successful');
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleClose = () => {
    setIsOpen(false);
    onPermissionDenied?.();
  };

  if (permission !== 'default' || !isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="إشعارات التطبيق"
      size="sm"
    >
      <div className="text-center py-4">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Bell className="h-8 w-8 text-blue-600" />
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          تمكين الإشعارات
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          احصل على تحديثات فورية حول حجوزاتك، العروض، والإشعارات المهمة
        </p>

        <div className="space-y-3">
          <Button
            onClick={requestPermission}
            loading={isRequesting}
            className="w-full"
          >
            <Check className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
            تمكين الإشعارات
          </Button>

          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full"
          >
            <X className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
            لاحقاً
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          يمكنك تعديل الإعدادات لاحقاً من إعدادات الملف الشخصي
        </p>
      </div>
    </Modal>
  );
};
