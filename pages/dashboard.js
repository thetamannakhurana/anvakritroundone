import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { teamName, startTime, endTime, firstScanner, isFirst, currentUser } = router.query;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!endTime) return;

    const updateTimer = () => {
      const now = new Date();
      
      let end;
      if (typeof endTime === 'string' && !endTime.includes('T')) {
        end = new Date(endTime);
      } else {
        end = new Date(endTime);
      }
      
      const difference = end - now;

      if (difference <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, expired: true });
        router.push('/timesup');
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

  const handleFinishEarly = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/finish-early', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/completed');
      } else {
        alert('Failed to finish timer. Please try again.');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  if (!teamName) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#030712'
      }}>
        <div style={{ color: '#60a5fa', fontFamily: "'Rajdhani', sans-serif", fontSize: '18px', letterSpacing: '2px' }}>
          LOADING CLASSIFIED DATA...
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
  if (typeof dateString === 'string' && !dateString.includes('T')) {
    return dateString;
  }
  
  const date = new Date(dateString);
  
  // Get day with suffix (1st, 2nd, 3rd, 4th, etc.)
  const day = date.getDate();
  const suffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  // Format time (12-hour with AM/PM)
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const minuteStr = minutes.toString().padStart(2, '0');
  
  // Get month (short form)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  
  // Get year
  const year = date.getFullYear();
  
  // Final format: "2:52 PM, 4th Jan 2026"
  return `${hour12}:${minuteStr} ${ampm}, ${day}${suffix(day)} ${month} ${year}`;
};


  const getTimerColor = () => {
    if (!timeRemaining) return '#3b82f6';
    const totalSeconds = timeRemaining.hours * 3600 + timeRemaining.minutes * 60 + timeRemaining.seconds;
    if (totalSeconds < 3600) return '#ef4444';
    if (totalSeconds < 10800) return '#f59e0b';
    return '#3b82f6';
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px ${getTimerColor()}40; }
          50% { box-shadow: 0 0 35px ${getTimerColor()}60; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes particle-float {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)); opacity: 0; }
        }
        /* MOBILE TIMER FIX - SPECIFIC */
        @media (max-width: 768px) {
          /* Container */
          div[style*="maxWidth: '600px'"][style*="gridTemplateColumns"] {
            max-width: 100% !important;
            padding: 0 10px !important;
            gap: 8px !important;
          }

          /* Timer number - SMALLER */
          div[style*="fontSize: '52px'"][style*="fontWeight: '800'"] {
            font-size: 2.25rem !important;
            line-height: 1 !important;
          }

          /* Timer box - LESS PADDING */
          div[style*="padding: '28px 20px'"][style*="borderRadius: '16px'"] {
            padding: 1rem 0.5rem !important;
          }

          /* Timer label - TINY */
          div[style*="fontSize: '12px'"][style*="letterSpacing: '1.5px'"] {
            font-size: 0.6rem !important;
            letter-spacing: 0.5px !important;
          }
        }

        @media (max-width: 480px) {
          div[style*="fontSize: '52px'"][style*="fontWeight: '800'"] {
            font-size: 1.85rem !important;
          }

          div[style*="padding: '28px 20px'"][style*="borderRadius: '16px'"] {
            padding: 0.85rem 0.35rem !important;
          }
        }

        @media (max-width: 380px) {
          /* Very small phones */
          div[style*="fontSize: '52px'"][style*="fontWeight: '800'"] {
            font-size: 1.65rem !important;
          }

          div[style*="gridTemplateColumns"][style*="gap: '20px'"] {
            gap: 6px !important;
          }
        }

      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#030712',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Grid Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />

        {/* Scanning Line */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: '-100%',
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%)',
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)',
          animation: 'scanline 10s linear infinite',
          zIndex: 1
        }} />

        {/* Moving Particles */}
        {mounted && [...Array(12)].map((_, i) => {
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          const endX = (Math.random() - 0.5) * 200;
          const endY = (Math.random() - 0.5) * 200;
          
          return (
            <div
              key={`particle-${i}`}
              style={{
                position: 'absolute',
                left: `${startX}%`,
                top: `${startY}%`,
                width: '2px',
                height: '2px',
                background: '#3b82f6',
                borderRadius: '50%',
                boxShadow: '0 0 6px #3b82f6',
                '--tx': `${endX}px`,
                '--ty': `${endY}px`,
                animation: `particle-float ${12 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
                zIndex: 1,
                opacity: 0
              }}
            />
          );
        })}

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10
        }}>
          
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
            animation: 'fade-in 0.6s ease-out'
          }}>
            <div style={{
  display: 'inline-block',
  background: 'rgba(15, 23, 42, 0.7)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  borderRadius: '20px',
  padding: typeof window !== 'undefined' && window.innerWidth <= 768 ? '20px 16px' : '30px 50px',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
  width: typeof window !== 'undefined' && window.innerWidth <= 768 ? '95%' : 'auto',
  maxWidth: typeof window !== 'undefined' && window.innerWidth <= 768 ? '100%' : 'none'
}}>

              <div style={{
  fontSize: typeof window !== 'undefined' && window.innerWidth <= 768 ? '0.75rem' : '13px',
  color: '#60a5fa',
  fontFamily: "'Rajdhani', sans-serif",
  marginBottom: '12px',
  letterSpacing: typeof window !== 'undefined' && window.innerWidth <= 768 ? '1px' : '2px',
  textTransform: 'uppercase',
  fontWeight: '600'
}}>

                [OPERATION: ACTIVE]
              </div>
              <h1 style={{
  fontSize: typeof window !== 'undefined' && window.innerWidth <= 768 ? '2rem' : '48px',
  fontWeight: '800',
  background: 'linear-gradient(135deg, #ffffff, #60a5fa)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: '12px',
  fontFamily: "'Orbitron', sans-serif",
  letterSpacing: typeof window !== 'undefined' && window.innerWidth <= 768 ? '1px' : '2px',
  lineHeight: '1'
}}>

                ANVAKRIT 2.0
              </h1>
              <div style={{
  display: 'inline-block',
  background: 'rgba(59, 130, 246, 0.15)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  borderRadius: '10px',
  padding: typeof window !== 'undefined' && window.innerWidth <= 768 ? '6px 12px' : '8px 20px',
  color: '#60a5fa',
  fontSize: typeof window !== 'undefined' && window.innerWidth <= 768 ? '0.85rem' : '15px',
  fontWeight: '600',
  fontFamily: "'Rajdhani', sans-serif",
  letterSpacing: '1px',
  wordBreak: 'break-word',
  maxWidth: typeof window !== 'undefined' && window.innerWidth <= 768 ? '100%' : 'none'
}}>

                TEAM: {teamName}
              </div>
            </div>
          </div>

          {/* First Access Alert */}
          {isFirst === 'true' && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderLeft: '4px solid #3b82f6',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px',
              textAlign: 'center',
              animation: 'fade-in 0.8s ease-out'
            }}>
              <p style={{
                color: '#60a5fa',
                fontSize: '16px',
                fontWeight: '600',
                margin: 0,
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: '1px'
              }}>
                ✅ TIMER INITIATED • YOU ARE PRIMARY INVESTIGATOR
              </p>
            </div>
          )}

          {/* Countdown Timer */}
          {timeRemaining && !timeRemaining.expired && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '40px',
              border: `1px solid ${getTimerColor()}40`,
              boxShadow: `0 25px 50px rgba(0, 0, 0, 0.5)`,
              marginBottom: '30px',
              animation: `fade-in 1s ease-out, pulse-glow 3s ease-in-out infinite`
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginBottom: '30px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: getTimerColor(),
                    borderRadius: '50%',
                    boxShadow: `0 0 15px ${getTimerColor()}`,
                    animation: 'pulse-glow 1.5s ease-in-out infinite'
                  }} />
                  <p style={{
                    color: getTimerColor(),
                    fontSize: '16px',
                    fontWeight: '700',
                    margin: 0,
                    letterSpacing: '2px',
                    fontFamily: "'Rajdhani', sans-serif",
                    textTransform: 'uppercase'
                  }}>
                    Investigation Window • Shared Deadline
                  </p>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: getTimerColor(),
                    borderRadius: '50%',
                    boxShadow: `0 0 15px ${getTimerColor()}`,
                    animation: 'pulse-glow 1.5s ease-in-out infinite',
                    animationDelay: '0.75s'
                  }} />
                </div>

                <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: typeof window !== 'undefined' && window.innerWidth <= 768 ? '8px' : '20px',
  marginBottom: '30px',
  maxWidth: typeof window !== 'undefined' && window.innerWidth <= 768 ? '100%' : '600px',
  margin: '0 auto 30px',
  padding: typeof window !== 'undefined' && window.innerWidth <= 768 ? '0 8px' : '0'
}}>

                  {[
                    { value: timeRemaining.hours, label: 'HOURS' },
                    { value: timeRemaining.minutes, label: 'MINUTES' },
                    { value: timeRemaining.seconds, label: 'SECONDS' }
                  ].map((unit, idx) => (
                    <div
                      key={unit.label}
                      style={{
  background: `rgba(59, 130, 246, 0.05)`,
  borderRadius: '16px',
  padding: typeof window !== 'undefined' && window.innerWidth <= 768 ? '14px 8px' : '28px 20px',
  border: `1px solid rgba(59, 130, 246, 0.2)`,
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
}}

                    >
                      <div style={{
  fontSize: typeof window !== 'undefined' && window.innerWidth <= 480 ? '1.75rem' : 
           (typeof window !== 'undefined' && window.innerWidth <= 768 ? '2.25rem' : '52px'),
  fontWeight: '800',
  color: getTimerColor(),
  fontFamily: "'Orbitron', sans-serif",
  lineHeight: '1',
  marginBottom: '12px'
}}>

                        {String(unit.value).padStart(2, '0')}
                      </div>
                      <div style={{
  color: '#94a3b8',
  fontSize: typeof window !== 'undefined' && window.innerWidth <= 768 ? '0.65rem' : '12px',
  letterSpacing: typeof window !== 'undefined' && window.innerWidth <= 768 ? '0.5px' : '1.5px',
  fontWeight: '600',
  fontFamily: "'Rajdhani', sans-serif"
}}>

                        {unit.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'inline-block'
                }}>
                  <p style={{ 
                    color: '#60a5fa', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    margin: 0,
                    fontFamily: "'Rajdhani', sans-serif",
                    letterSpacing: '0.5px'
                  }}>
                    📅 DEADLINE: {formatDate(endTime)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Two Column Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '30px'
          }}>
            {/* Team Status Panel */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '30px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
              animation: 'fade-in 1.2s ease-out'
            }}>
              <h2 style={{
                color: '#60a5fa',
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '24px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px'
              }}>
                📊 ACCESS REGISTRY
              </h2>
              <div style={{ display: 'grid', gap: '14px' }}>
                {[
                  { label: 'Primary Investigator', value: firstScanner },
                  { label: 'Session Started', value: typeof startTime === 'string' ? startTime : formatDate(startTime) },
                  { label: 'Current User', value: `${currentUser} (YOU)` }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(59, 130, 246, 0.08)',
                      borderLeft: `3px solid #3b82f6`,
                      borderRadius: '8px',
                      padding: '14px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{
                      color: '#94a3b8',
                      fontSize: '11px',
                      marginBottom: '6px',
                      fontFamily: "'Rajdhani', sans-serif",
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      color: '#60a5fa',
                      fontWeight: '600',
                      fontSize: '13px',
                      fontFamily: "'Inter', sans-serif",
                      wordBreak: 'break-all'
                    }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission Brief Panel */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '30px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
              animation: 'fade-in 1.4s ease-out'
            }}>
              <h2 style={{
                color: '#60a5fa',
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '20px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px'
              }}>
                🎯 MISSION OBJECTIVES
              </h2>
              <ul style={{
                color: '#cbd5e1',
                fontSize: '13px',
                lineHeight: '2',
                paddingLeft: '20px',
                margin: 0,
                listStyleType: 'none',
                fontFamily: "'Inter', sans-serif"
              }}>
                {[
                  'Analyze complete case file documentation',
                  'Reconstruct event timeline & sequence',
                  'Evaluate suspect motives & opportunities',
                  'Cross-reference forensic evidence',
                  'Identify perpetrator with justification',
                  'Submit findings via secured form'
                ].map((item, idx) => (
                  <li key={idx} style={{ position: 'relative', paddingLeft: '22px' }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      color: '#3b82f6',
                      fontWeight: '700',
                      fontFamily: "'Rajdhani', sans-serif"
                    }}>
                      [{idx + 1}]
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Investigation Protocol */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '35px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
            marginBottom: '30px',
            animation: 'fade-in 1.6s ease-out'
          }}>
            <h2 style={{
              color: '#60a5fa',
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '24px',
              fontFamily: "'Orbitron', sans-serif",
              textAlign: 'center',
              letterSpacing: '1px'
            }}>
              📋 INVESTIGATION PROTOCOL
            </h2>
            
            <div style={{
              color: '#cbd5e1',
              fontSize: '14px',
              lineHeight: '1.9',
              marginBottom: '28px',
              fontFamily: "'Inter', sans-serif"
            }}>
              <p style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#60a5fa' }}>ANVAKRIT 2.0</strong> is a high-stakes forensic investigation simulation designed to evaluate your <strong style={{ color: '#3b82f6' }}>analytical reasoning</strong>, <strong style={{ color: '#3b82f6' }}>evidence synthesis</strong>, and <strong style={{ color: '#3b82f6' }}>investigative methodology</strong> under temporal constraints.
              </p>
              <p style={{ marginBottom: '0' }}>
                You have received a <strong style={{ color: '#60a5fa' }}>classified case file</strong> containing: witness statements, forensic reports, psychological profiles, financial records, and supplementary documentation mirroring real-world criminal investigations.
              </p>
            </div>

            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                color: '#60a5fa',
                fontSize: '15px',
                fontWeight: '700',
                marginBottom: '14px',
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                📤 SUBMISSION PROTOCOL
              </h3>
              <p style={{
                color: '#cbd5e1',
                fontSize: '14px',
                lineHeight: '1.8',
                margin: 0,
                fontFamily: "'Inter', sans-serif"
              }}>
                Upon case closure, locate the <strong style={{ color: '#60a5fa' }}>secondary QR code</strong> at the end of your case file. This will authenticate access to the <strong style={{ color: '#3b82f6' }}>secured submission portal</strong> (Google Form). Only entries submitted within the active investigation window will be processed.
              </p>
            </div>

            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderLeft: '4px solid #3b82f6',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{
                color: '#60a5fa',
                fontSize: '15px',
                fontWeight: '700',
                marginBottom: '14px',
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                ⚠️ CRITICAL CONSTRAINTS
              </h3>
              <ul style={{
                color: '#cbd5e1',
                fontSize: '14px',
                lineHeight: '2',
                paddingLeft: '20px',
                margin: 0,
                fontFamily: "'Inter', sans-serif"
              }}>
                <li><strong>Unified deadline</strong> applies to all team members</li>
                <li><strong>Timer cannot be suspended</strong> or recalibrated</li>
                <li><strong>Automatic case closure</strong> upon expiration</li>
                <li><strong>Single submission</strong> permitted per team</li>
                <li><strong>Post-deadline entries</strong> are void</li>
              </ul>
            </div>
          </div>

          {/* Early Completion Panel */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '40px',
            marginBottom: '30px',
            textAlign: 'center',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
            animation: 'fade-in 1.8s ease-out'
          }}>
            <h3 style={{
              color: '#60a5fa',
              fontSize: '22px',
              fontWeight: '700',
              marginBottom: '18px',
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '1px'
            }}>
              ✅ INVESTIGATION COMPLETE?
            </h3>
            <p style={{
              color: '#cbd5e1',
              fontSize: '14px',
              lineHeight: '1.8',
              marginBottom: '24px',
              maxWidth: '700px',
              margin: '0 auto 24px',
              fontFamily: "'Inter', sans-serif"
            }}>
              If your team has successfully submitted the final report via the <strong style={{ color: '#60a5fa' }}>Google Form</strong> (accessed through the QR code in your case file), you may terminate the investigation window early.
            </p>
            
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderLeft: '4px solid #ef4444',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '28px',
              maxWidth: '650px',
              margin: '0 auto 28px'
            }}>
              <p style={{
                color: '#fca5a5',
                fontSize: '13px',
                lineHeight: '1.8',
                margin: 0,
                fontFamily: "'Inter', sans-serif"
              }}>
                <strong style={{ color: '#ef4444' }}>⚠️ WARNING:</strong> This action will <strong>immediately terminate</strong> the 24-hour investigation window for your <strong>entire team</strong>. Proceed only after confirmed form submission. <strong>This action is irreversible.</strong>
              </p>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#ffffff',
                padding: '16px 40px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '15px',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.5 : 1,
                boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)',
                transition: 'all 0.3s ease',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontFamily: "'Rajdhani', sans-serif",
                maxWidth: '400px',
                width: '100%'
              }}
              onMouseOver={(e) => {
                if (!submitting) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(34, 197, 94, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!submitting) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(34, 197, 94, 0.3)';
                }
              }}
            >
              {submitting ? '⚙️ PROCESSING...' : '✓ TERMINATE INVESTIGATION'}
            </button>
          </div>

          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '50px 40px',
                maxWidth: '550px',
                width: '100%',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8)',
                animation: 'fade-in 0.3s ease-out'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 30px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '40px', height: '40px', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <h2 style={{
                  color: 'white',
                  fontSize: '26px',
                  fontWeight: '700',
                  marginBottom: '20px',
                  textAlign: 'center',
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: '1px'
                }}>
                  ⚠️ CONFIRM TERMINATION
                </h2>
                
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '30px'
                }}>
                  <p style={{
                    color: '#cbd5e1',
                    fontSize: '15px',
                    lineHeight: '1.8',
                    marginBottom: '16px',
                    textAlign: 'center',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    You are about to <strong style={{ color: '#60a5fa' }}>permanently close</strong> the investigation window for:
                  </p>
                  <p style={{
                    color: '#60a5fa',
                    fontSize: '20px',
                    fontWeight: '700',
                    textAlign: 'center',
                    margin: '16px 0',
                    fontFamily: "'Orbitron', sans-serif"
                  }}>
                    TEAM {teamName}
                  </p>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '13px',
                    lineHeight: '1.8',
                    textAlign: 'center',
                    margin: 0,
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    This will immediately lock out all team members.<br/>
                    Only proceed if submission is confirmed.<br/>
                    <strong>THIS ACTION CANNOT BE UNDONE.</strong>
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '14px',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    disabled={submitting}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: 'white',
                      padding: '14px 32px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: "'Rajdhani', sans-serif",
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}
                    onMouseOver={(e) => !submitting && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleFinishEarly}
                    disabled={submitting}
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      color: 'white',
                      padding: '14px 32px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.6 : 1,
                      transition: 'all 0.2s',
                      boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)',
                      fontFamily: "'Rajdhani', sans-serif",
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}
                    onMouseOver={(e) => !submitting && (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    {submitting ? 'TERMINATING...' : 'CONFIRM'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            padding: '30px',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            marginBottom: '20px',
            animation: 'fade-in 2s ease-out'
          }}>
            <p style={{
              color: '#60a5fa',
              fontSize: '16px',
              fontStyle: 'italic',
              lineHeight: '1.8',
              marginBottom: '16px',
              fontFamily: "'Inter', sans-serif"
            }}>
              "Approach the case with rigor, objectivity, and precision—<br/>
              because in <strong style={{ color: '#3b82f6', fontFamily: "'Orbitron', sans-serif" }}>ANVAKRIT 2.0</strong>, the truth is buried in the bytes."
            </p>
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
              margin: '20px 0'
            }} />
            <p style={{
              color: '#64748b',
              fontSize: '12px',
              marginBottom: '6px',
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: '0.5px'
            }}>
              TECHNICAL SUPPORT: csi_dc@nfsu.ac.in
            </p>
            <p style={{
              color: '#475569',
              fontSize: '11px',
              fontFamily: "'Inter', sans-serif"
            }}>
              NATIONAL FORENSIC SCIENCES UNIVERSITY
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
