'use client';

import React from 'react';
import { Football, Tennis } from 'lucide-react';

interface SportsToggleProps {
  selectedSport: 'football' | 'paddle';
  onSportChange: (sport: 'football' | 'paddle') => void;
}

/**
 * مكون تبديل بين نوعي الرياضة (كرة قدم / بادل)
 */
const SportsToggle: React.FC<SportsToggleProps> = ({
  selectedSport,
  onSportChange,
}) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-100 p-2 rounded-2xl flex">
        <button
          type="button"
          onClick={() => onSportChange('football')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all duration-300 ${
            selectedSport === 'football'
              ? 'bg-white shadow-lg text-primary'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Football className={`w-6 h-6 ${
            selectedSport === 'football' ? 'text-primary' : 'text-gray-400'
          }`} />
          <span className="text-lg font-semibold">ملاعب كرة قدم</span>
          <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            150+
          </span>
        </button>
        
        <button
          type="button"
          onClick={() => onSportChange('paddle')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all duration-300 ${
            selectedSport === 'paddle'
              ? 'bg-white shadow-lg text-secondary'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Tennis className={`w-6 h-6 ${
            selectedSport === 'paddle' ? 'text-secondary' : 'text-gray-400'
          }`} />
          <span className="text-lg font-semibold">ملاعب بادل</span>
          <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            80+
          </span>
        </button>
      </div>
      
      {/* Sport Description */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {selectedSport === 'football' 
            ? 'استمتع بلعب كرة القدم في أفضل الملاعب المجهزة بأحدث التقنيات'
            : 'جرب لعبة البادل في ملاعب مخصصة مع كافة التجهيزات'}
        </p>
      </div>
    </div>
  );
};

export default SportsToggle;
