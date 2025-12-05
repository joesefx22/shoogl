'use client';

import React, { useState } from 'react';
import { Stadium } from '@/types/stadium.types';
import { MapPin, Navigation, Car, Walking } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MapDirectionsProps {
  location: Stadium['location'];
  stadiumName: string;
}

export const MapDirections: React.FC<MapDirectionsProps> = ({ 
  location, 
  stadiumName 
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  const openGoogleMaps = (mode: 'driving' | 'walking' = 'driving') => {
    const { lat, lng, address } = location;
    const encodedAddress = encodeURIComponent(address || `${lat},${lng}`);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=${mode}`;
    window.open(googleMapsUrl, '_blank');
  };

  const openWaze = () => {
    const { lat, lng } = location;
    const wazeUrl = `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    window.open(wazeUrl, '_blank');
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(location.address);
    alert('تم نسخ العنوان إلى الحافظة');
  };

  return (
    <div className="space-y-4">
      {/* Map Preview */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse">
              <MapPin className="h-12 w-12 text-gray-400" />
            </div>
          </div>
        )}
        
        {/* Google Maps Iframe */}
        <iframe
          src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed&hl=ar`}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setMapLoaded(true)}
          title={`خريطة ${stadiumName}`}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => openGoogleMaps('driving')}
          className="flex items-center justify-center"
        >
          <Car className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
          بالسيارة
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => openGoogleMaps('walking')}
          className="flex items-center justify-center"
        >
          <Walking className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
          سيراً
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={openWaze}
          className="flex items-center justify-center"
        >
          <Navigation className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
          Waze
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={copyAddress}
          className="flex items-center justify-center"
        >
          <MapPin className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
          نسخ العنوان
        </Button>
      </div>

      {/* Address Details */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">العنوان التفصيلي</p>
        <p className="text-gray-900 dark:text-white">{location.address}</p>
        {location.district && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            الحي: {location.district}
          </p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          المدينة: {location.city}
        </p>
      </div>
    </div>
  );
};
