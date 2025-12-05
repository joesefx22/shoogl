'use client';

import React, { useState } from 'react';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Checkbox } from '@/components/ui/Checkbox';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  filters: {
    type: 'football' | 'paddle';
    city: string;
    minPrice: number;
    maxPrice: number;
    features: string[];
  };
  onFilterChange: (filters: Partial<FilterBarProps['filters']>) => void;
}

const FEATURES_OPTIONS = [
  { id: 'lights', label: 'إضاءة' },
  { id: 'turf', label: 'عشب صناعي' },
  { id: 'showers', label: 'دش' },
  { id: 'parking', label: 'موقف سيارات' },
  { id: 'cafe', label: 'كافيه' },
  { id: 'lockers', label: 'خزائن' },
  { id: 'wifi', label: 'واي فاي' },
  { id: 'coaching', label: 'تدريب' },
];

const CITIES = ['القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة', 'أسوان', 'الأقصر'];

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const [priceRange, setPriceRange] = useState([filters.minPrice, filters.maxPrice]);

  const handleFeatureToggle = (featureId: string) => {
    const newFeatures = filters.features.includes(featureId)
      ? filters.features.filter(f => f !== featureId)
      : [...filters.features, featureId];
    onFilterChange({ features: newFeatures });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    onFilterChange({ minPrice: values[0], maxPrice: values[1] });
  };

  const resetFilters = () => {
    onFilterChange({
      city: '',
      minPrice: 0,
      maxPrice: 1000,
      features: [],
    });
    setPriceRange([0, 1000]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-primary mr-2 rtl:ml-2 rtl:mr-0" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">فلترة</h3>
        </div>
        <button
          onClick={resetFilters}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
        >
          <X className="h-4 w-4 ml-1 rtl:mr-1 rtl:ml-0" />
          إعادة ضبط
        </button>
      </div>

      {/* Sport Type */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">نوع الرياضة</h4>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button
            variant={filters.type === 'football' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onFilterChange({ type: 'football' })}
            className="flex-1"
          >
            ⚽ كرة قدم
          </Button>
          <Button
            variant={filters.type === 'paddle' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onFilterChange({ type: 'paddle' })}
            className="flex-1"
          >
            🏓 بادل
          </Button>
        </div>
      </div>

      {/* City */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">المدينة</h4>
        <select
          value={filters.city}
          onChange={(e) => onFilterChange({ city: e.target.value })}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <option value="">كل المدن</option>
          {CITIES.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
          نطاق السعر: {priceRange[0]} - {priceRange[1]} ج.م
        </h4>
        <Slider
          min={0}
          max={1000}
          step={50}
          value={priceRange}
          onValueChange={handlePriceChange}
          className="mt-4"
        />
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
          <span>0 ج.م</span>
          <span>1000 ج.م</span>
        </div>
      </div>

      {/* Features */}
      <div>
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">المميزات</h4>
        <div className="space-y-2">
          {FEATURES_OPTIONS.map((feature) => (
            <div key={feature.id} className="flex items-center">
              <Checkbox
                id={feature.id}
                checked={filters.features.includes(feature.id)}
                onCheckedChange={() => handleFeatureToggle(feature.id)}
              />
              <label
                htmlFor={feature.id}
                className="text-sm text-gray-600 dark:text-gray-400 mr-2 rtl:ml-2 rtl:mr-0 cursor-pointer"
              >
                {feature.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Search Button */}
      <Button
        className="w-full mt-6"
        onClick={() => {/* Filters are applied automatically */}}
      >
        تطبيق الفلتر
      </Button>
    </div>
  );
};

export default FilterBar;
