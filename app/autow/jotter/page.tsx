import React from 'react';
import SmartJotter from '@/components/smart-jotter/SmartJotter';
import { ParsedBookingData } from '@/types/smart-jotter';

export default function JotterPage() {
  // Handle booking creation
  const handleBookingCreate = (data: ParsedBookingData) => {
    console.log('Creating booking with data:', data);
    // TODO: Implement booking creation logic
  };

  // Handle estimate creation
  const handleEstimateCreate = (data: ParsedBookingData) => {
    console.log('Creating estimate with data:', data);
    // TODO: Implement estimate creation logic
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <SmartJotter 
          onBookingCreate={handleBookingCreate}
          onEstimateCreate={handleEstimateCreate}
        />
      </div>
    </div>
  );
}