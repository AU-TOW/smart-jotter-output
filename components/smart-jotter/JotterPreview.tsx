'use client';

import React, { useState } from 'react';
import { JotterPreviewProps, ParsedBookingData } from '@/types/smart-jotter';
import { 
  User, 
  Phone, 
  Car, 
  Calendar, 
  Hash, 
  AlertTriangle,
  Edit3,
  Check,
  X,
  BookOpen,
  FileText
} from 'lucide-react';

const JotterPreview: React.FC<JotterPreviewProps> = ({
  data,
  fieldConfidence,
  onDataChange,
  onCreateBooking,
  onCreateEstimate,
  isLoading = false
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Partial<ParsedBookingData>>({});

  // Handle field edit start
  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValues({ ...tempValues, [field]: currentValue });
  };

  // Handle field edit save
  const saveEdit = (field: string) => {
    const newValue = tempValues[field as keyof ParsedBookingData] || '';
    onDataChange({
      ...data,
      [field]: newValue
    });
    setEditingField(null);
    setTempValues({});
  };

  // Handle field edit cancel
  const cancelEdit = () => {
    setEditingField(null);
    setTempValues({});
  };

  // Get confidence color class
  const getConfidenceColor = (confidence?: number): string => {
    if (!confidence) return 'text-gray-400';
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get confidence text
  const getConfidenceText = (confidence?: number): string => {
    if (!confidence) return 'No confidence data';
    return `${Math.round(confidence * 100)}% confident`;
  };

  // Check if data is sufficient for booking/estimate
  const hasRequiredFields = (): boolean => {
    return !!(data.customer_name && data.phone && data.issue);
  };

  // Check if data has vehicle info for full booking
  const hasVehicleInfo = (): boolean => {
    return !!(data.vehicle || data.registration);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Parsed Information</h2>
        <div className="text-sm text-gray-500">
          {data.confidence_score && (
            <span className={getConfidenceColor(data.confidence_score)}>
              Overall: {getConfidenceText(data.confidence_score)}
            </span>
          )}
        </div>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
        {/* Customer Name */}
        <EditableField
          icon={<User className="w-5 h-5" />}
          label="Customer Name"
          field="customer_name"
          value={data.customer_name || ''}
          placeholder="Enter customer name"
          confidence={fieldConfidence?.customer_name}
          editingField={editingField}
          tempValue={tempValues.customer_name || ''}
          onStartEdit={startEditing}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onTempValueChange={(value) => setTempValues({ ...tempValues, customer_name: value })}
          required
        />

        {/* Phone Number */}
        <EditableField
          icon={<Phone className="w-5 h-5" />}
          label="Phone Number"
          field="phone"
          value={data.phone || ''}
          placeholder="Enter phone number"
          confidence={fieldConfidence?.phone}
          editingField={editingField}
          tempValue={tempValues.phone || ''}
          onStartEdit={startEditing}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onTempValueChange={(value) => setTempValues({ ...tempValues, phone: value })}
          type="tel"
          required
        />

        {/* Vehicle */}
        <EditableField
          icon={<Car className="w-5 h-5" />}
          label="Vehicle"
          field="vehicle"
          value={data.vehicle || ''}
          placeholder="Enter vehicle make/model"
          confidence={fieldConfidence?.vehicle}
          editingField={editingField}
          tempValue={tempValues.vehicle || ''}
          onStartEdit={startEditing}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onTempValueChange={(value) => setTempValues({ ...tempValues, vehicle: value })}
        />

        {/* Year */}
        <EditableField
          icon={<Calendar className="w-5 h-5" />}
          label="Year"
          field="year"
          value={data.year || ''}
          placeholder="Enter vehicle year"
          confidence={fieldConfidence?.year}
          editingField={editingField}
          tempValue={tempValues.year || ''}
          onStartEdit={startEditing}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onTempValueChange={(value) => setTempValues({ ...tempValues, year: value })}
        />

        {/* Registration */}
        <EditableField
          icon={<Hash className="w-5 h-5" />}
          label="Registration"
          field="registration"
          value={data.registration || ''}
          placeholder="Enter vehicle registration"
          confidence={fieldConfidence?.registration}
          editingField={editingField}
          tempValue={tempValues.registration || ''}
          onStartEdit={startEditing}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onTempValueChange={(value) => setTempValues({ ...tempValues, registration: value })}
        />

        {/* Issue - Full width */}
        <div className="md:col-span-2">
          <EditableField
            icon={<AlertTriangle className="w-5 h-5" />}
            label="Issue Description"
            field="issue"
            value={data.issue || ''}
            placeholder="Enter issue description"
            confidence={fieldConfidence?.issue}
            editingField={editingField}
            tempValue={tempValues.issue || ''}
            onStartEdit={startEditing}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            onTempValueChange={(value) => setTempValues({ ...tempValues, issue: value })}
            type="textarea"
            required
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        
        {/* Create Booking Button */}
        <button
          onClick={() => onCreateBooking(data)}
          disabled={!hasRequiredFields() || isLoading}
          className={`
            flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all
            ${hasRequiredFields() 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <BookOpen className="w-5 h-5" />
          {isLoading ? 'Creating...' : 'Create Booking'}
        </button>

        {/* Create Estimate Button */}
        <button
          onClick={() => onCreateEstimate(data)}
          disabled={!hasRequiredFields() || isLoading}
          className={`
            flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all
            ${hasRequiredFields() 
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <FileText className="w-5 h-5" />
          {isLoading ? 'Creating...' : 'Create Estimate'}
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-4 text-sm text-gray-600">
        {!hasRequiredFields() && (
          <p className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Please fill in customer name, phone number, and issue description to proceed.
          </p>
        )}
        {hasRequiredFields() && !hasVehicleInfo() && (
          <p className="text-green-600">
            ✓ Ready to create estimate. Add vehicle details for full booking.
          </p>
        )}
        {hasRequiredFields() && hasVehicleInfo() && (
          <p className="text-green-600">
            ✓ All information complete. Ready to create booking or estimate.
          </p>
        )}
      </div>
    </div>
  );
};

// Editable Field Component
interface EditableFieldProps {
  icon: React.ReactNode;
  label: string;
  field: string;
  value: string;
  placeholder: string;
  confidence?: number;
  editingField: string | null;
  tempValue: string;
  onStartEdit: (field: string, value: string) => void;
  onSaveEdit: (field: string) => void;
  onCancelEdit: () => void;
  onTempValueChange: (value: string) => void;
  type?: 'text' | 'tel' | 'textarea';
  required?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  icon,
  label,
  field,
  value,
  placeholder,
  confidence,
  editingField,
  tempValue,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onTempValueChange,
  type = 'text',
  required = false
}) => {
  const isEditing = editingField === field;
  const isEmpty = !value || value.trim() === '';
  
  const getConfidenceColor = (confidence?: number): string => {
    if (!confidence) return 'text-gray-400';
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-2">
      {/* Label with confidence */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {icon}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        {confidence && (
          <span className={`text-xs ${getConfidenceColor(confidence)}`}>
            {Math.round(confidence * 100)}%
          </span>
        )}
      </div>

      {/* Value display or edit input */}
      <div className="relative">
        {isEditing ? (
          <div className="flex items-center gap-2">
            {type === 'textarea' ? (
              <textarea
                value={tempValue}
                onChange={(e) => onTempValueChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                autoFocus
              />
            ) : (
              <input
                type={type}
                value={tempValue}
                onChange={(e) => onTempValueChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            )}
            <button
              onClick={() => onSaveEdit(field)}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Save"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={onCancelEdit}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => onStartEdit(field, value)}
            className={`
              group relative p-3 border rounded-lg cursor-pointer transition-all
              ${isEmpty 
                ? 'border-dashed border-gray-300 bg-gray-50 hover:border-gray-400' 
                : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-sm'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className={isEmpty ? 'text-gray-400 italic' : 'text-gray-900'}>
                {isEmpty ? placeholder : value}
              </span>
              <Edit3 className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
            
            {/* Confidence indicator */}
            {confidence && !isEmpty && (
              <div className="absolute top-1 right-1">
                <div className={`w-2 h-2 rounded-full ${getConfidenceColor(confidence).replace('text-', 'bg-')}`} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JotterPreview;