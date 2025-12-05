import React from 'react';
import { Stadium } from '@/types/stadium.types';
import StadiumCard from './StadiumCard';
import { useRouter } from 'next/navigation';

interface StadiumListProps {
  stadiums: Stadium[];
}

const StadiumList: React.FC<StadiumListProps> = ({ stadiums }) => {
  const router = useRouter();

  const handleBookStadium = (stadiumId: string) => {
    router.push(`/booking?stadiumId=${stadiumId}`);
  };

  const handleViewDetails = (stadiumId: string) => {
    router.push(`/stadiums/${stadiumId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stadiums.map((stadium) => (
        <StadiumCard
          key={stadium.id}
          stadium={stadium}
          onBook={handleBookStadium}
          onViewDetails={handleViewDetails}
        />
      ))}
    </div>
  );
};

export default StadiumList;
