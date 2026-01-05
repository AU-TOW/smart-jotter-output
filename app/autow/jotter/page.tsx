'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import SmartJotter from '@/components/smart-jotter/SmartJotter';
import { ParsedBookingData } from '@/types/smart-jotter';

export default function SmartJotterPage() {
  const router = useRouter();

  const handleBookingCreate = async (data: ParsedBookingData) => {
    try {
      console.log('Creating booking with data:', data);
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const handleEstimateCreate = async (data: ParsedBookingData) => {
    try {
      console.log('Creating estimate with data:', data);
    } catch (error) {
      console.error('Error creating estimate:', error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <img
            src="https://autow-services.co.uk/logo.png"
            alt="AUTOW"
            style={styles.logo}
          />
          <div style={styles.headerText}>
            <h1 style={styles.title}>Smart Jotter</h1>
            <p style={styles.subtitle}>Convert handwritten notes or typed text into booking data</p>
          </div>
        </div>
        <div style={styles.headerButtons}>
          <button onClick={() => router.push('/autow/welcome')} style={styles.backBtn}>
            ← Menu
          </button>
          <button onClick={() => router.push('/autow/dashboard')} style={styles.dashboardBtn}>
            Dashboard
          </button>
        </div>
      </div>

      <div style={styles.mainCard}>
        <SmartJotter
          onBookingCreate={handleBookingCreate}
          onEstimateCreate={handleEstimateCreate}
        />
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: '#000',
    minHeight: '100vh',
    padding: '20px',
  },
  header: {
    background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)',
    padding: '30px',
    borderRadius: '24px',
    marginBottom: '30px',
    boxShadow: '0 25px 50px -12px rgba(48, 255, 55, 0.25), 0 0 0 1px rgba(48, 255, 55, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: '20px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  logo: {
    width: '180px',
    height: 'auto',
    filter: 'drop-shadow(0 4px 12px rgba(48, 255, 55, 0.3))',
  },
  headerText: {},
  title: {
    fontSize: '28px',
    color: '#30ff37',
    marginBottom: '5px',
    margin: '0 0 5px 0',
  },
  subtitle: {
    color: '#888',
    fontSize: '14px',
    margin: '0',
  },
  headerButtons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  backBtn: {
    background: 'rgba(48, 255, 55, 0.1)',
    border: '2px solid rgba(48, 255, 55, 0.2)',
    color: '#30ff37',
    padding: '12px 24px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    fontSize: '14px',
    transition: 'all 0.3s',
  },
  dashboardBtn: {
    background: 'linear-gradient(135deg, #30ff37 0%, #28cc2f 100%)',
    border: 'none',
    color: '#000',
    padding: '12px 24px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    fontSize: '14px',
    transition: 'all 0.3s',
  },
  mainCard: {
    background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)',
    borderRadius: '24px',
    padding: '30px',
    boxShadow: '0 25px 50px -12px rgba(48, 255, 55, 0.15), 0 0 0 1px rgba(48, 255, 55, 0.1)',
  },
};
