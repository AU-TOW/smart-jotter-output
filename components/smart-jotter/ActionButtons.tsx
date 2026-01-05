'use client';

import React from 'react';

interface ActionButtonsProps {
  onCreateBooking: () => void;
  onCreateEstimate: () => void;
  onStartOver: () => void;
  isEstimateDisabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCreateBooking,
  onCreateEstimate,
  onStartOver,
  isEstimateDisabled = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
      <button
        onClick={onCreateBooking}
        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
      >
        Create Booking
      </button>

      <button
        onClick={onCreateEstimate}
        disabled={isEstimateDisabled}
        className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
          isEstimateDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        Create Estimate
        {isEstimateDisabled && <span className="text-xs ml-1">(Coming Soon)</span>}
      </button>

      <button
        onClick={onStartOver}
        className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
      >
        Start Over
      </button>
    </div>
  );
};

export default ActionButtons;
