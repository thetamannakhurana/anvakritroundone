import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function SuccessPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [timeRemaining, setTimeRemaining] = useState(null);
  
  const { teamName, startTime, endTime, firstScanner, isFirst } = router.query;

  useEffect(() => {
    if (!endTime) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(endTime);
      const difference = end - now;

      if (difference <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds, expired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  if (!teamName) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e3a8a 100%)'
      }}>
        <div style={{ color: 'white' }}>Loading...</div>
      </div>
    );
  }

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e3a8a 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        
        {/* Success Icon */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            background: 'rgba(34, 197, 94, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg style={{ width: '40px', height: '40px', color: '#86efac' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '8px'
          }}>
            {isFirst === 'true' ? '✅ Timer Started!' : '✅ Receipt Confirmed!'}
          </h1>
          <p style={{
            color: '#93c5fd',
            fontSize: '18px'
          }}>
            Team: <strong>{teamName}</strong>
          </p>
        </div>

        {/* Countdown Timer */}
        {timeRemaining && !timeRemaining.expired && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
            border: '2px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '30px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{
                color: '#93c5fd',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '15px'
              }}>
                ⏰ TEAM DEADLINE - SHARED COUNTDOWN
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '15px',
                marginBottom: '15px'
              }}>
                {['hours', 'minutes', 'seconds'].map((unit) => (
                  <div key={unit} style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '10px',
                    padding: '15px',
                    minWidth: '80px'
                  }}>
                    <div style={{
                      fontSize: '36px',
                      fontWeight: 'bold',
                      color: 'white'
                    }}>
                      {String(timeRemaining[unit]).padStart(2, '0')}
                    </div>
                    <div style={{
                      color: '#93c5fd',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      marginTop: '5px'
                    }}>
                      {unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Details */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '25px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '15px',
            marginBottom: '15px'
          }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
              Timer Started By:
            </span>
            <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
              {firstScanner}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '15px',
            marginBottom: '15px'
          }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
              Start Time:
            </span>
            <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
              {formatDate(startTime)}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
              Deadline:
            </span>
            <span style={{ color: '#fca5a5', fontWeight: 'bold', fontSize: '14px' }}>
              {formatDate(endTime)}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: 'rgba(251, 191, 36, 0.1)',
          borderLeft: '4px solid #fbbf24',
          borderRadius: '0 10px 10px 0',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <p style={{
            color: '#fcd34d',
            fontWeight: '600',
            marginBottom: '10px',
            fontSize: '14px'
          }}>
            📋 Important Information:
          </p>
          <ul style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '13px',
            lineHeight: '1.8',
            paddingLeft: '20px',
            margin: 0
          }}>
            <li>All team members share the same 24-hour deadline</li>
            <li>Case file has been provided to you offline</li>
            <li>Submit your solution before the deadline expires</li>
            <li>Only one submission per team will be accepted</li>
          </ul>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '13px',
            marginBottom: '15px'
          }}>
            Scanned by: <strong>{session?.user?.email}</strong>
          </p>
          <Link href="/" style={{
            color: '#93c5fd',
            fontSize: '14px',
            textDecoration: 'underline'
          }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
