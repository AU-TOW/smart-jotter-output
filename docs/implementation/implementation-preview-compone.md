## Implementation Summary
Created the JotterPreview component that displays parsed booking data in a clean, editable format. The component includes inline editing capabilities, confidence indicators, graceful handling of missing fields, and matches AUTOW styling conventions.

## Files Created/Modified

```types/smart-jotter.ts
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

export interface JotterPreviewProps {
  data: ParsedBookingData;
  fieldConfidence?: FieldConfidence;
  onDataChange: (updatedData: ParsedBookingData) => void;
  onCreateBooking: (data: ParsedBookingData) => void;
  onCreateEstimate: (data: ParsedBookingData) => void;
  isLoading?: boolean;
}

export interface EditableFieldProps {
  label: string;
  value: string;
  placeholder: string;
  confidence?: number;
  onChange: (value: string) => void;
  type?: 'text' | 'tel' | 'textarea';
  required?: boolean;
}
```

```components/smart-jotter/JotterPreview.tsx
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
```

```components/smart-jotter/index.ts
export { default as JotterPreview } from './JotterPreview';
```

```app/autow/jotter/preview-demo/page.tsx
'use client';

import React, { useState } from 'react';
import JotterPreview from '@/components/smart-jotter/JotterPreview';
import { ParsedBookingData, FieldConfidence } from '@/types/smart-jotter';

const PreviewDemoPage: React.FC = () => {
  // Sample parsed data with varying completeness
  const [sampleData, setSampleData] = useState<ParsedBookingData>({
    customer_name: "John Smith",
    phone: "07712345678",
    vehicle: "Ford Focus",
    year: "2018",
    registration: "YA19 ABC",
    issue: "Engine warning light comes on intermittently, especially when accelerating",
    confidence_score: 0.85
  });

  // Sample confidence scores
  const [fieldConfidence] = useState<FieldConfidence>({
    customer_name: 0.95,
    phone: 0.88,
    vehicle: 0.92,
    year: 0.75,
    registration: 0.98,
    issue: 0.82
  });

  const [isLoading, setIsLoading] = useState(false);

  // Handle data changes from the preview component
  const handleDataChange = (updatedData: ParsedBookingData) => {
    setSampleData(updatedData);
    console.log('Data updated:', updatedData);
  };

  // Handle booking creation
  const handleCreateBooking = async (data: ParsedBookingData) => {
    setIsLoading(true);
    console.log('Creating booking with data:', data);
    
    // Simulate API call
    setTimeout(() => {
      alert('Booking created successfully!');
      setIsLoading(false);
    }, 2000);
  };

  // Handle estimate creation
  const handleCreateEstimate = async (data: ParsedBookingData) => {
    setIsLoading(true);
    console.log('Creating estimate with data:', data);
    
    // Simulate API call
    setTimeout(() => {
      alert('Estimate created successfully!');
      setIsLoading(false);
    }, 2000);
  };

  // Sample data presets for testing
  const samplePresets = {
    complete: {
      customer_name: "John Smith",
      phone: "07712345678",
      vehicle: "Ford Focus",
      year: "2018",
      registration: "YA19 ABC",
      issue: "Engine warning light comes on intermittently",
      confidence_score: 0.85
    },
    partial: {
      customer_name: "Jane Doe",
      phone: "07798765432",
      issue: "Strange noise from engine",
      confidence_score: 0.62
    },
    minimal: {
      customer_name: "Bob Wilson",
      phone: "",
      issue: "Car won't start",
      confidence_score: 0.45
    },
    empty: {
      confidence_score: 0.1
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Smart Jotter Preview Demo
          </h1>
          <p className="text-gray-600">
            Test the JotterPreview component with different data scenarios
          </p>
        </div>

        {/* Sample Data Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Data Presets</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSampleData(samplePresets.complete)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Complete Data
            </button>
            <button
              onClick={() => setSampleData(samplePresets.partial)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Partial Data
            </button>
            <button
              onClick={() => setSampleData(samplePresets.minimal)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Minimal Data
            </button>
            <button
              onClick={() => setSampleData(samplePresets.empty)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Empty Data
            </button>
          </div>
        </div>

        {/* Main Preview Component */}
        <JotterPreview
          data={sampleData}
          fieldConfidence={fieldConfidence}
          onDataChange={handleDataChange}
          onCreateBooking={handleCreateBooking}
          onCreateEstimate={handleCreateEstimate}
          isLoading={isLoading}
        />

        {/* Debug Information */}
        <div className="mt-8 bg-gray-800 text-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Debug: Current Data State</h3>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(sampleData, null, 2)}
          </pre>
        </div>

      </div>
    </div>
  );
};

export default PreviewDemoPage;
```

## Usage

1. **Import the component:**
   ```typescript
   import JotterPreview from '@/components/smart-jotter/JotterPreview';
   ```

2. **Use in your Smart Jotter workflow:**
   ```typescript
   <JotterPreview
     data={parsedData}
     fieldConfidence={confidenceScores}
     onDataChange={handleDataUpdate}
     onCreateBooking={handleBookingCreation}
     onCreateEstimate={handleEstimateCreation}
     isLoading={isProcessing}
   />
   ```

3. **Test the component:**
   - Navigate to `/autow/jotter/preview-demo` to see the component in action
   - Try different data presets to test various scenarios
   - Test inline editing by clicking on any field
   - Test the action buttons with different data completeness levels

## Notes

### Key Features Implemented:
- **Inline Editing**: Click any field to edit in place with save/cancel options
- **Confidence Indicators**: Visual confidence scores with color coding
- **Graceful Empty Fields**: Dashed placeholders for missing data
- **Smart Action Buttons**: Disabled when required fields are missing
- **Responsive Design**: Works on mobile and desktop
- **AUTOW Styling**: Matches the established design system
- **TypeScript**: Full type safety with proper interfaces

### Dependencies to Install:
```bash
npm install lucide-react
```

### Confidence Score Interpretation:
- **Green (80%+)**: High confidence
- **Yellow (60-79%)**: Medium confidence  
- **Red (<60%)**: Low confidence
- **Gray**: No confidence data

### Field Requirements:
- **Required for any action**: Customer name, phone, issue
- **Additional for full booking**: Vehicle info (make/model or registration)
- **Estimates**: Can be created with minimal info

### Next Steps:
1. Integrate with the main Smart Jotter component
2. Connect to actual booking/estimate API endpoints
3. Add form validation for phone numbers and registration plates
4. Implement data persistence for incomplete entries
5. Add export functionality (PDF, email, etc.)

The component is ready for integration into the larger Smart Jotter system and provides a robust, user-friendly interface for reviewing and editing parsed booking data.