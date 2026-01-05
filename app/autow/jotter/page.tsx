'use client';

import React from 'react';
import SmartJotter from '@/components/smart-jotter/SmartJotter';
import { ParsedBookingData } from '@/types/smart-jotter';

export default function SmartJotterPage() {
  const handleBookingCreate = async (data: ParsedBookingData) => {
    try {
      console.log('Creating booking with data:', data);
      // Navigation to booking form with pre-filled data will be handled by SmartJotter
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const handleEstimateCreate = async (data: ParsedBookingData) => {
    try {
      console.log('Creating estimate with data:', data);
      // Future feature - currently disabled
    } catch (error) {
      console.error('Error creating estimate:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Smart Jotter
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Convert handwritten notes or typed text into booking data
            </p>
          </div>
          
          <div className="p-6">
            <SmartJotter
              onBookingCreate={handleBookingCreate}
              onEstimateCreate={handleEstimateCreate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}