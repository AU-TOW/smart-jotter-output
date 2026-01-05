'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Edit2, Save, X, Phone, Car, Calendar, FileText, User, Hash } from 'lucide-react';

// Types for parsed booking data
export interface ParsedBookingData {
  customer_name?: string;
  phone?: string;
  vehicle?: string;
  year?: string;
  registration?: string;
  issue?: string;
  confidence_score?: number;
}

export interface FieldConfidence {
  customer_name?: number;
  phone?: number;
  vehicle?: number;
  year?: number;
  registration?: number;
  issue?: number;
}

interface JotterPreviewProps {
  parsedData: ParsedBookingData;
  fieldConfidences?: FieldConfidence;
  onDataChange?: (updatedData: ParsedBookingData) => void;
  className?: string;
}

interface EditableFieldProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  placeholder: string;
  confidence?: number;
  onSave: (newValue: string) => void;
  type?: 'text' | 'tel' | 'number';
  maxLength?: number;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  icon,
  placeholder,
  confidence,
  onSave,
  type = 'text',
  maxLength
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditValue(value || '');
    setHasChanges(false);
  }, [value]);

  const handleSave = () => {
    if (editValue.trim() !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    setHasChanges(newValue.trim() !== value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Determine confidence color
  const getConfidenceColor = (conf?: number) => {
    if (!conf) return 'text-gray-400';
    if (conf >= 0.8) return 'text-green-500';
    if (conf >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceIcon = (conf?: number) => {
    if (!conf) return null;
    if (conf >= 0.8) return <CheckCircle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  // Check if field is empty
  const isEmpty = !value || value.trim() === '';

  return (
    <div className={`p-4 border rounded-lg transition-all duration-200 ${
      isEmpty ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-white'
    } ${isEditing ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-400'}`}>
      {/* Field Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`${isEmpty ? 'text-gray-400' : 'text-gray-600'}`}>
            {icon}
          </div>
          <span className={`font-medium text-sm ${isEmpty ? 'text-gray-400' : 'text-gray-700'}`}>
            {label}
          </span>
          {confidence !== undefined && (
            <div className={`flex items-center gap-1 ${getConfidenceColor(confidence)}`}>
              {getConfidenceIcon(confidence)}
              <span className="text-xs">
                {Math.round(confidence * 100)}%
              </span>
            </div>
          )}
        </div>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            aria-label={`Edit ${label.toLowerCase()}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Field Content */}
      {isEditing ? (
        <div className="space-y-2">
          {label === 'Issue/Description' ? (
            <textarea
              value={editValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              maxLength={maxLength}
              autoFocus
            />
          ) : (
            <input
              type={type}
              value={editValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={maxLength}
              autoFocus
            />
          )}
          
          {/* Edit Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-3 h-3" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
            
            {maxLength && (
              <span className="text-xs text-gray-500">
                {editValue.length}/{maxLength}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="min-h-[24px] flex items-center">
          {isEmpty ? (
            <span className="text-gray-400 italic text-sm">
              {placeholder}
            </span>
          ) : (
            <span className="text-gray-900">
              {value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const JotterPreview: React.FC<JotterPreviewProps> = ({
  parsedData,
  fieldConfidences,
  onDataChange,
  className = ''
}) => {
  const [localData, setLocalData] = useState<ParsedBookingData>(parsedData);

  // Update local data when parsedData changes
  useEffect(() => {
    setLocalData(parsedData);
  }, [parsedData]);

  const handleFieldUpdate = (field: keyof ParsedBookingData) => (newValue: string) => {
    const updatedData = {
      ...localData,
      [field]: newValue
    };
    setLocalData(updatedData);
    onDataChange?.(updatedData);
  };

  // Calculate overall confidence
  const overallConfidence = fieldConfidences 
    ? Object.values(fieldConfidences).reduce((acc, conf) => acc + (conf || 0), 0) / Object.values(fieldConfidences).length
    : undefined;

  // Check if we have any data at all
  const hasAnyData = Object.values(localData).some(value => value && value.toString().trim() !== '');

  if (!hasAnyData && !parsedData.confidence_score && !overallConfidence) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No Data Parsed</h3>
        <p className="text-gray-500">
          Write or type your booking details to see the parsed information here.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Parsed Booking Data</h3>
          <p className="text-sm text-gray-600">Review and edit the extracted information</p>
        </div>
        
        {(overallConfidence || parsedData.confidence_score) && (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
            <span className="text-sm text-gray-600">Overall Confidence:</span>
            <div className={`flex items-center gap-1 ${
              (overallConfidence || parsedData.confidence_score || 0) >= 0.8 
                ? 'text-green-600' 
                : (overallConfidence || parsedData.confidence_score || 0) >= 0.6 
                ? 'text-yellow-600' 
                : 'text-red-600'
            }`}>
              {(overallConfidence || parsedData.confidence_score || 0) >= 0.8 ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {Math.round((overallConfidence || parsedData.confidence_score || 0) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Editable Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EditableField
          label="Customer Name"
          value={localData.customer_name || ''}
          icon={<User className="w-4 h-4" />}
          placeholder="Enter customer name"
          confidence={fieldConfidences?.customer_name}
          onSave={handleFieldUpdate('customer_name')}
          maxLength={100}
        />

        <EditableField
          label="Phone Number"
          value={localData.phone || ''}
          icon={<Phone className="w-4 h-4" />}
          placeholder="Enter phone number"
          confidence={fieldConfidences?.phone}
          onSave={handleFieldUpdate('phone')}
          type="tel"
          maxLength={20}
        />

        <EditableField
          label="Vehicle Make/Model"
          value={localData.vehicle || ''}
          icon={<Car className="w-4 h-4" />}
          placeholder="Enter vehicle make and model"
          confidence={fieldConfidences?.vehicle}
          onSave={handleFieldUpdate('vehicle')}
          maxLength={100}
        />

        <EditableField
          label="Vehicle Year"
          value={localData.year || ''}
          icon={<Calendar className="w-4 h-4" />}
          placeholder="Enter vehicle year"
          confidence={fieldConfidences?.year}
          onSave={handleFieldUpdate('year')}
          type="number"
          maxLength={4}
        />

        <EditableField
          label="Registration Number"
          value={localData.registration || ''}
          icon={<Hash className="w-4 h-4" />}
          placeholder="Enter registration number"
          confidence={fieldConfidences?.registration}
          onSave={handleFieldUpdate('registration')}
          maxLength={20}
        />
      </div>

      {/* Issue Description - Full Width */}
      <EditableField
        label="Issue/Description"
        value={localData.issue || ''}
        icon={<FileText className="w-4 h-4" />}
        placeholder="Enter issue description"
        confidence={fieldConfidences?.issue}
        onSave={handleFieldUpdate('issue')}
        maxLength={500}
      />

      {/* Data Quality Indicators */}
      {hasAnyData && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Review Parsed Data
              </h4>
              <p className="text-sm text-blue-800">
                Please review all fields for accuracy. Click the edit icon to modify any incorrect information.
                Fields with low confidence scores (below 80%) should be double-checked.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JotterPreview;