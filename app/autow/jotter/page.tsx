import React from 'react';
import SmartJotter from '@/components/smart-jotter/SmartJotter';

export default function JotterPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Jotter</h1>
        <p className="text-gray-600">
          Convert handwritten notes or typed text into structured booking information
        </p>
      </div>

      {/* Smart Jotter Component */}
      <SmartJotter />
    </div>
  );
}