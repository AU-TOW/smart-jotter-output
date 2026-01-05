'use client';

import React from 'react';
import { ParsedBookingData } from '@/types/smart-jotter';

interface ParsedDataPreviewProps {
  data: ParsedBookingData;
  onEdit: () => void;
}

const ParsedDataPreview: React.FC<ParsedDataPreviewProps> = ({
  data,
  onEdit,
}) => {
  const fields = [
    { key: 'customer_name', label: 'Customer Name', icon: '👤' },
    { key: 'phone', label: 'Phone Number', icon: '📞' },
    { key: 'vehicle', label: 'Vehicle', icon: '🚗' },
    { key: 'year', label: 'Year', icon: '📅' },
    { key: 'registration', label: 'Registration', icon: '🔖' },
    { key: 'issue', label: 'Issue Description', icon: '⚠️' },
  ];

  const getFieldValue = (key: keyof ParsedBookingData): string => {
    const value = data[key];
    if (value === undefined || value === null) return 'Not provided';
    return String(value);
  };

  const hasRequiredData = () => {
    return data.customer_name || data.phone || data.vehicle || data.issue;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-green-50 border-b border-green-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-900">
              ✅ Data Extracted Successfully
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Review the extracted information below
            </p>
          </div>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-md hover:bg-green-50 transition-colors"
          >
            ✏️ Edit Input
          </button>
        </div>
      </div>

      {/* Data Fields */}
      <div className="p-6">
        {hasRequiredData() ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => {
              const value = getFieldValue(field.key as keyof ParsedBookingData);
              const isEmpty = !data[field.key as keyof ParsedBookingData];

              return (
                <div
                  key={field.key}
                  className={`p-4 rounded-lg border-2 ${
                    isEmpty
                      ? 'border-gray-200 bg-gray-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{field.icon}</span>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        isEmpty ? 'text-gray-500' : 'text-gray-900'
                      }`}>
                        {field.label}
                      </h4>
                      <p className={`mt-1 ${
                        isEmpty ? 'text-gray-400 italic' : 'text-gray-700'
                      }`}>
                        {value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⚠️</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Limited Data Extracted
            </h4>
            <p className="text-gray-600">
              We couldn't extract much information from your input. 
              You may want to try again with more detailed information.
            </p>
          </div>
        )}
      </div>

      {/* Confidence Score */}
      {data.confidence_score && (
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Confidence Score:</span>
            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded text-sm font-medium ${
                data.confidence_score >= 0.8
                  ? 'bg-green-100 text-green-800'
                  : data.confidence_score >= 0.6
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {Math.round(data.confidence_score * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border-t border-blue-200 px-6 py-3">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> If any information is missing or incorrect, 
          you can edit it when creating the booking.
        </p>
      </div>
    </div>
  );
};

export default ParsedDataPreview;