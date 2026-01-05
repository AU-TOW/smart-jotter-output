'use client';

import React, { useState, useCallback } from 'react';
import { ParsedBookingData, OCRResponse, ProcessingStep } from '@/types/smart-jotter';
import { useRouter } from 'next/navigation';

interface SmartJotterProps {
  onBookingCreate?: (data: ParsedBookingData) => void;
  onEstimateCreate?: (data: ParsedBookingData) => void;
}

const SmartJotter: React.FC<SmartJotterProps> = ({
  onBookingCreate,
  onEstimateCreate,
}) => {
  const router = useRouter();
  const [inputType, setInputType] = useState<'canvas' | 'text'>('text');
  const [inputData, setInputData] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('input');
  const [error, setError] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedBookingData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processInput = useCallback(async (data: string, type: 'canvas' | 'text') => {
    try {
      setIsProcessing(true);
      setError('');
      setCurrentStep('processing');

      let textToProcess = data;

      if (type === 'canvas') {
        setCurrentStep('ocr');

        const ocrResponse = await fetch('/api/autow/jotter/recognize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: data }),
        });

        if (!ocrResponse.ok) {
          throw new Error('OCR processing failed');
        }

        const ocrResult: OCRResponse = await ocrResponse.json();
        textToProcess = ocrResult.text;

        if (!textToProcess.trim()) {
          throw new Error('No text could be extracted from the handwriting');
        }
      }

      setCurrentStep('parsing');

      const parseResponse = await fetch('/api/autow/jotter/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToProcess }),
      });

      if (!parseResponse.ok) {
        throw new Error('Text parsing failed');
      }

      const parseResult = await parseResponse.json();

      if (!parseResult.success) {
        throw new Error(parseResult.error || 'Failed to parse booking data');
      }

      setParsedData(parseResult.data);
      setCurrentStep('preview');

    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setCurrentStep('error');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!inputData.trim()) {
      setError('Please provide some input before processing');
      return;
    }
    processInput(inputData, inputType);
  }, [inputData, inputType, processInput]);

  const handleCreateBooking = useCallback(() => {
    if (!parsedData) return;

    try {
      const params = new URLSearchParams({
        customer_name: parsedData.customer_name || '',
        phone: parsedData.phone || '',
        vehicle: parsedData.vehicle || '',
        year: parsedData.year || '',
        registration: parsedData.registration || '',
        issue: parsedData.issue || '',
        from_jotter: 'true'
      });

      router.push(`/autow/booking?${params.toString()}`);
      onBookingCreate?.(parsedData);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    }
  }, [parsedData, router, onBookingCreate]);

  const handleCreateEstimate = useCallback(() => {
    if (!parsedData) return;
    setError('Estimate creation feature is coming soon!');
    onEstimateCreate?.(parsedData);
  }, [parsedData, onEstimateCreate]);

  const resetForm = useCallback(() => {
    setInputData('');
    setParsedData(null);
    setCurrentStep('input');
    setError('');
    setIsProcessing(false);
  }, []);

  return (
    <div>
      {/* Mode Toggle */}
      {(currentStep === 'input' || currentStep === 'error') && (
        <div style={styles.modeToggle}>
          <button
            onClick={() => setInputType('text')}
            style={{
              ...styles.modeBtn,
              ...(inputType === 'text' ? styles.modeBtnActive : styles.modeBtnInactive),
            }}
          >
            ⌨️ Type Text
          </button>
          <button
            onClick={() => setInputType('canvas')}
            style={{
              ...styles.modeBtn,
              ...(inputType === 'canvas' ? styles.modeBtnActive : styles.modeBtnInactive),
            }}
          >
            ✏️ Handwrite
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={styles.error}>
          ⚠️ {error}
        </div>
      )}

      {/* Input Section */}
      {(currentStep === 'input' || currentStep === 'error') && (
        <div style={styles.inputSection}>
          {inputType === 'text' ? (
            <div>
              <label style={styles.label}>Enter booking details:</label>
              <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="Example: John Smith, 07712345678, Ford Focus 2018, YA19 ABC, Engine warning light on dashboard"
                style={styles.textarea}
                disabled={isProcessing}
                rows={6}
              />
              <p style={styles.hint}>
                💡 Include: Customer name, phone, vehicle make/model, year, registration, and issue description
              </p>
            </div>
          ) : (
            <div style={styles.canvasPlaceholder}>
              <div style={styles.canvasIcon}>✏️</div>
              <p style={styles.canvasText}>Canvas handwriting input</p>
              <p style={styles.canvasHint}>Coming soon - use text mode for now</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isProcessing || !inputData.trim()}
            style={{
              ...styles.submitBtn,
              ...(isProcessing || !inputData.trim() ? styles.submitBtnDisabled : {}),
            }}
          >
            {isProcessing ? '🔄 Processing...' : '🚀 Parse Data'}
          </button>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div style={styles.processingCard}>
          <div style={styles.processingSpinner}>🔄</div>
          <p style={styles.processingText}>
            {currentStep === 'ocr' && 'Recognizing handwriting...'}
            {currentStep === 'parsing' && 'Extracting booking data...'}
            {currentStep === 'processing' && 'Processing...'}
          </p>
        </div>
      )}

      {/* Parsed Data Preview */}
      {currentStep === 'preview' && parsedData && (
        <div style={styles.previewCard}>
          <div style={styles.previewHeader}>
            <span style={styles.previewTitle}>✅ Data Extracted</span>
            <button onClick={() => setCurrentStep('input')} style={styles.editBtn}>
              ✏️ Edit Input
            </button>
          </div>

          <div style={styles.dataGrid}>
            {parsedData.customer_name && (
              <div style={styles.dataItem}>
                <span style={styles.dataLabel}>👤 Customer</span>
                <span style={styles.dataValue}>{parsedData.customer_name}</span>
              </div>
            )}
            {parsedData.phone && (
              <div style={styles.dataItem}>
                <span style={styles.dataLabel}>📞 Phone</span>
                <span style={styles.dataValue}>{parsedData.phone}</span>
              </div>
            )}
            {parsedData.vehicle && (
              <div style={styles.dataItem}>
                <span style={styles.dataLabel}>🚗 Vehicle</span>
                <span style={styles.dataValue}>{parsedData.vehicle}</span>
              </div>
            )}
            {parsedData.year && (
              <div style={styles.dataItem}>
                <span style={styles.dataLabel}>📅 Year</span>
                <span style={styles.dataValue}>{parsedData.year}</span>
              </div>
            )}
            {parsedData.registration && (
              <div style={styles.dataItem}>
                <span style={styles.dataLabel}>🔖 Registration</span>
                <span style={styles.dataValue}>{parsedData.registration}</span>
              </div>
            )}
            {parsedData.issue && (
              <div style={{ ...styles.dataItem, gridColumn: '1 / -1' }}>
                <span style={styles.dataLabel}>🔧 Issue</span>
                <span style={styles.dataValue}>{parsedData.issue}</span>
              </div>
            )}
          </div>

          {parsedData.confidence_score && (
            <div style={styles.confidence}>
              Confidence: {Math.round(parsedData.confidence_score * 100)}%
            </div>
          )}

          {/* Action Buttons */}
          <div style={styles.actionButtons}>
            <button onClick={handleCreateBooking} style={styles.bookingBtn}>
              📅 Create Booking
            </button>
            <button onClick={handleCreateEstimate} style={styles.estimateBtn} disabled>
              📋 Create Estimate (Soon)
            </button>
            <button onClick={resetForm} style={styles.resetBtn}>
              🔄 Start Over
            </button>
          </div>
        </div>
      )}

      {/* Error State Reset */}
      {currentStep === 'error' && (
        <div style={styles.errorActions}>
          <button onClick={resetForm} style={styles.resetBtn}>
            🔄 Start Over
          </button>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  modeToggle: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  modeBtn: {
    flex: 1,
    padding: '16px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: 'none',
  },
  modeBtnActive: {
    background: 'linear-gradient(135deg, #30ff37 0%, #28cc2f 100%)',
    color: '#000',
    boxShadow: '0 4px 16px rgba(48, 255, 55, 0.4)',
  },
  modeBtnInactive: {
    background: 'rgba(48, 255, 55, 0.1)',
    color: '#30ff37',
    border: '2px solid rgba(48, 255, 55, 0.2)',
  },
  error: {
    background: 'rgba(244, 67, 54, 0.1)',
    border: '2px solid rgba(244, 67, 54, 0.3)',
    color: '#f44336',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '600' as const,
  },
  inputSection: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    color: '#30ff37',
    fontSize: '14px',
    fontWeight: '600' as const,
    marginBottom: '12px',
    letterSpacing: '0.5px',
  },
  textarea: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: '2px solid rgba(48, 255, 55, 0.2)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    fontSize: '15px',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    minHeight: '150px',
    boxSizing: 'border-box' as const,
  },
  hint: {
    color: '#888',
    fontSize: '13px',
    marginTop: '12px',
    margin: '12px 0 0 0',
  },
  canvasPlaceholder: {
    background: 'rgba(48, 255, 55, 0.05)',
    border: '2px dashed rgba(48, 255, 55, 0.3)',
    borderRadius: '12px',
    padding: '60px 20px',
    textAlign: 'center' as const,
  },
  canvasIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  canvasText: {
    color: '#30ff37',
    fontSize: '18px',
    fontWeight: '600' as const,
    margin: '0 0 8px 0',
  },
  canvasHint: {
    color: '#888',
    fontSize: '14px',
    margin: '0',
  },
  submitBtn: {
    width: '100%',
    padding: '18px',
    marginTop: '20px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '700' as const,
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #30ff37 0%, #28cc2f 100%)',
    color: '#000',
    boxShadow: '0 4px 16px rgba(48, 255, 55, 0.4)',
    transition: 'all 0.3s',
  },
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  processingCard: {
    background: 'rgba(48, 255, 55, 0.05)',
    border: '2px solid rgba(48, 255, 55, 0.2)',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center' as const,
  },
  processingSpinner: {
    fontSize: '48px',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  processingText: {
    color: '#30ff37',
    fontSize: '18px',
    fontWeight: '600' as const,
    margin: '0',
  },
  previewCard: {
    background: 'rgba(48, 255, 55, 0.05)',
    border: '2px solid rgba(48, 255, 55, 0.3)',
    borderRadius: '16px',
    padding: '24px',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid rgba(48, 255, 55, 0.1)',
  },
  previewTitle: {
    color: '#30ff37',
    fontSize: '20px',
    fontWeight: '700' as const,
  },
  editBtn: {
    background: 'rgba(48, 255, 55, 0.1)',
    border: '2px solid rgba(48, 255, 55, 0.2)',
    color: '#30ff37',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600' as const,
  },
  dataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  dataItem: {
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    padding: '16px',
  },
  dataLabel: {
    display: 'block',
    color: '#888',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  dataValue: {
    display: 'block',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600' as const,
  },
  confidence: {
    color: '#888',
    fontSize: '13px',
    textAlign: 'right' as const,
    marginBottom: '20px',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
    paddingTop: '20px',
    borderTop: '2px solid rgba(48, 255, 55, 0.1)',
  },
  bookingBtn: {
    flex: 1,
    minWidth: '150px',
    padding: '16px 24px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700' as const,
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #30ff37 0%, #28cc2f 100%)',
    color: '#000',
    boxShadow: '0 4px 16px rgba(48, 255, 55, 0.4)',
  },
  estimateBtn: {
    flex: 1,
    minWidth: '150px',
    padding: '16px 24px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700' as const,
    cursor: 'not-allowed',
    background: 'rgba(156, 39, 176, 0.3)',
    color: '#ce93d8',
    opacity: 0.6,
  },
  resetBtn: {
    flex: 1,
    minWidth: '150px',
    padding: '16px 24px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700' as const,
    cursor: 'pointer',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
  },
  errorActions: {
    textAlign: 'center' as const,
    marginTop: '20px',
  },
};

export default SmartJotter;
