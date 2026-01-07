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
  const [isMobile, setIsMobile] = useState(false);
  const [answers, setAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
    q7: ''
  });
  
  const { teamName, startTime, endTime, endTimeISO, firstScanner, isFirst, currentUser } = router.query;

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Timer - works with or without endTimeISO
useEffect(() => {
  // If endTimeISO missing, parse from formatted endTime
  let endTimeToUse = endTimeISO;
  
  if (!endTimeToUse && endTime) {
    console.log('⚠️ endTimeISO missing, parsing from formatted endTime:', endTime);
    
    // Parse: "12:43 AM, 9th Jan 2026"
    const match = endTime.match(/(\d+):(\d+)\s*(AM|PM),\s*(\d+)(st|nd|rd|th)\s*(\w+)\s*(\d+)/);
    
    if (match) {
      const [, hour, minute, ampm, day, , month, year] = match;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = months.indexOf(month);
      
      let hour24 = parseInt(hour);
      if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
      if (ampm === 'AM' && hour24 === 12) hour24 = 0;
      
      // Create date in IST, convert to UTC
      const endDateIST = new Date(year, monthIndex, day, hour24, parseInt(minute));
      const istOffset = 5.5 * 60 * 60 * 1000;
      endTimeToUse = new Date(endDateIST.getTime() - istOffset).toISOString();
      
      console.log('✅ Calculated endTimeISO:', endTimeToUse);
    }
  }
  
  if (!endTimeToUse) {
    console.log('❌ No valid end time available');
    return;
  }

  const updateTimer = () => {
    const now = new Date();
    const end = new Date(endTimeToUse);
    
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
}, [endTimeISO, endTime]);


  // ✅ Handle "Terminate Investigation" - Submits answers + stops timer
  const handleFinishEarly = async () => {
    // Validate all fields are filled
    if (!answers.q1 || !answers.q2 || !answers.q3 || !answers.q4 || !answers.q5 || !answers.q6 || !answers.q7) {
      alert('⚠️ Please answer all questions before terminating the investigation.');
      setShowConfirmModal(false);
      return;
    }

    setSubmitting(true);
    try {
      // First, submit answers
      const submitResponse = await fetch('/api/submit-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName, answers }),
      });

      const submitData = await submitResponse.json();

      if (!submitData.success) {
        alert('Failed to submit answers. Please try again.');
        setSubmitting(false);
        setShowConfirmModal(false);
        return;
      }

      // Then, finish the timer
      const finishResponse = await fetch('/api/finish-early', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName }),
      });

      const finishData = await finishResponse.json();

      if (finishData.success) {
        router.push('/completed');
      } else {
        alert('Answers submitted but failed to stop timer. Please contact support.');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
      setSubmitting(false);
      setShowConfirmModal(false);
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
    if (!dateString) return 'N/A';
    if (typeof dateString === 'string' && (dateString.includes('AM') || dateString.includes('PM'))) {
      return dateString;
    }
    return dateString;
  };

  const getTimerColor = () => {
    if (!timeRemaining) return '#3b82f6';
    const totalSeconds = timeRemaining.hours * 3600 + timeRemaining.minutes * 60 + timeRemaining.seconds;
    if (totalSeconds < 3600) return '#ef4444'; // Red: < 1 hour
    if (totalSeconds < 10800) return '#f59e0b'; // Yellow: < 3 hours
    return '#3b82f6'; // Blue: > 3 hours
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
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
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#030712',
        padding: isMobile ? '20px 12px' : '40px 20px',
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
        {mounted && [...Array(isMobile ? 6 : 12)].map((_, i) => {
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
            marginBottom: isMobile ? '24px' : '40px',
            animation: 'fade-in 0.6s ease-out'
          }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '20px',
              padding: isMobile ? '20px 16px' : '30px 50px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
              width: isMobile ? '100%' : 'auto'
            }}>
              <div style={{
                fontSize: isMobile ? '0.7rem' : '13px',
                color: '#60a5fa',
                fontFamily: "'Rajdhani', sans-serif",
                marginBottom: '12px',
                letterSpacing: isMobile ? '1px' : '2px',
                textTransform: 'uppercase',
                fontWeight: '600'
              }}>
                [OPERATION: ACTIVE]
              </div>
              <h1 style={{
                fontSize: isMobile ? '1.75rem' : '48px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #ffffff, #60a5fa)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '12px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: isMobile ? '1px' : '2px',
                lineHeight: '1'
              }}>
                ANVAKRIT 2.0
              </h1>
              <div style={{
                display: 'inline-block',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '10px',
                padding: isMobile ? '6px 12px' : '8px 20px',
                color: '#60a5fa',
                fontSize: isMobile ? '0.8rem' : '15px',
                fontWeight: '600',
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: '1px',
                wordBreak: 'break-word',
                maxWidth: '100%'
              }}>
                TEAM: {teamName}
              </div>
            </div>
          </div>
{/* 🔍 DEBUG - Remove after testing */}
<div style={{
  background: 'rgba(255, 0, 0, 0.2)',
  border: '2px solid red',
  borderRadius: '10px',
  padding: '20px',
  marginBottom: '20px',
  color: 'white',
  fontSize: '14px',
  fontFamily: 'monospace'
}}>
  <strong>🔍 DEBUG INFO:</strong><br/>
  endTimeISO: {endTimeISO || '❌ MISSING'}<br/>
  timeRemaining: {timeRemaining ? `✅ ${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s` : '❌ NULL'}<br/>
  Timer Color: {getTimerColor()}<br/>
</div>

          {/* First Access Alert */}
          {isFirst === 'true' && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderLeft: '4px solid #3b82f6',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              marginBottom: isMobile ? '20px' : '30px',
              textAlign: 'center',
              animation: 'fade-in 0.8s ease-out'
            }}>
              <p style={{
                color: '#60a5fa',
                fontSize: isMobile ? '13px' : '16px',
                fontWeight: '600',
                margin: 0,
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: '1px'
              }}>
                ✅ TIMER INITIATED • YOU ARE PRIMARY INVESTIGATOR
              </p>
            </div>
          )}

          {/* ✅ COUNTDOWN TIMER - REMOVED !timeRemaining.expired CONDITION */}
          {timeRemaining && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: isMobile ? '24px 16px' : '40px',
              border: `1px solid ${getTimerColor()}40`,
              boxShadow: `0 25px 50px rgba(0, 0, 0, 0.5)`,
              marginBottom: isMobile ? '20px' : '30px',
              animation: `fade-in 1s ease-out, pulse-glow 3s ease-in-out infinite`
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isMobile ? '8px' : '12px',
                  marginBottom: isMobile ? '20px' : '30px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    width: isMobile ? '6px' : '8px',
                    height: isMobile ? '6px' : '8px',
                    background: getTimerColor(),
                    borderRadius: '50%',
                    boxShadow: `0 0 15px ${getTimerColor()}`,
                    animation: 'pulse-glow 1.5s ease-in-out infinite'
                  }} />
                  <p style={{
                    color: getTimerColor(),
                    fontSize: isMobile ? '13px' : '16px',
                    fontWeight: '700',
                    margin: 0,
                    letterSpacing: isMobile ? '1px' : '2px',
                    fontFamily: "'Rajdhani', sans-serif",
                    textTransform: 'uppercase'
                  }}>
                    Investigation Window • Shared Deadline
                  </p>
                  <div style={{
                    width: isMobile ? '6px' : '8px',
                    height: isMobile ? '6px' : '8px',
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
                  gap: isMobile ? '8px' : '20px',
                  marginBottom: isMobile ? '20px' : '30px',
                  maxWidth: isMobile ? '100%' : '600px',
                  margin: '0 auto',
                  marginBottom: isMobile ? '20px' : '30px'
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
                        borderRadius: isMobile ? '12px' : '16px',
                        padding: isMobile ? '12px 8px' : '28px 20px',
                        border: `1px solid rgba(59, 130, 246, 0.2)`,
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      <div style={{
                        fontSize: isMobile ? '1.75rem' : '52px',
                        fontWeight: '800',
                        color: getTimerColor(),
                        fontFamily: "'Orbitron', sans-serif",
                        lineHeight: '1',
                        marginBottom: isMobile ? '6px' : '12px'
                      }}>
                        {String(unit.value).padStart(2, '0')}
                      </div>
                      <div style={{
                        color: '#94a3b8',
                        fontSize: isMobile ? '0.6rem' : '12px',
                        letterSpacing: isMobile ? '0.5px' : '1.5px',
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
                  padding: isMobile ? '12px' : '16px',
                  display: 'inline-block',
                  maxWidth: '100%'
                }}>
                  <p style={{ 
                    color: '#60a5fa', 
                    fontSize: isMobile ? '12px' : '14px', 
                    fontWeight: '600',
                    margin: 0,
                    fontFamily: "'Rajdhani', sans-serif",
                    letterSpacing: '0.5px',
                    wordBreak: 'break-word'
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
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: isMobile ? '16px' : '24px',
            marginBottom: isMobile ? '20px' : '30px'
          }}>
            {/* Team Status Panel */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: isMobile ? '20px' : '30px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
              animation: 'fade-in 1.2s ease-out'
            }}>
              <h2 style={{
                color: '#60a5fa',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                marginBottom: isMobile ? '16px' : '24px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px'
              }}>
                📊 ACCESS REGISTRY
              </h2>
              <div style={{ display: 'grid', gap: isMobile ? '10px' : '14px' }}>
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
                      padding: isMobile ? '12px' : '14px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      color: '#94a3b8',
                      fontSize: isMobile ? '10px' : '11px',
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
                      fontSize: isMobile ? '12px' : '13px',
                      fontFamily: "'Inter', sans-serif",
                      wordBreak: 'break-all'
                    }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission Objective */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: isMobile ? '20px' : '30px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
              animation: 'fade-in 1.4s ease-out'
            }}>
              <h2 style={{
                color: '#60a5fa',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                marginBottom: isMobile ? '16px' : '20px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px'
              }}>
                🎯 PRIMARY OBJECTIVE
              </h2>
              <div style={{
                color: '#cbd5e1',
                fontSize: isMobile ? '13px' : '14px',
                lineHeight: '1.9',
                fontFamily: "'Inter', sans-serif"
              }}>
                <p style={{ margin: 0 }}>
                  Answer the questions asked below based on your analysis of the provided case file materials.
                </p>
              </div>
            </div>
          </div>

          {/* Investigation Protocol */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: isMobile ? '24px 20px' : '35px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
            marginBottom: isMobile ? '20px' : '30px',
            animation: 'fade-in 1.5s ease-out'
          }}>
            <h2 style={{
              color: '#60a5fa',
              fontSize: isMobile ? '18px' : '24px',
              fontWeight: '700',
              marginBottom: isMobile ? '18px' : '24px',
              fontFamily: "'Orbitron', sans-serif",
              textAlign: 'center',
              letterSpacing: '1px'
            }}>
              📋 INVESTIGATION PROTOCOL
            </h2>
            
            <div style={{
              color: '#cbd5e1',
              fontSize: isMobile ? '13px' : '14px',
              lineHeight: '1.9',
              marginBottom: isMobile ? '20px' : '28px',
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
              padding: isMobile ? '18px' : '24px',
              marginBottom: isMobile ? '18px' : '24px'
            }}>
              <h3 style={{
                color: '#60a5fa',
                fontSize: isMobile ? '14px' : '15px',
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
                fontSize: isMobile ? '13px' : '14px',
                lineHeight: '1.8',
                margin: 0,
                fontFamily: "'Inter', sans-serif"
              }}>
                Answer the questions below and click <strong style={{ color: '#f59e0b' }}>"Terminate Investigation"</strong> to submit your responses.
              </p>
            </div>

            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderLeft: '4px solid #3b82f6',
              borderRadius: '12px',
              padding: isMobile ? '18px' : '24px'
            }}>
              <h3 style={{
                color: '#60a5fa',
                fontSize: isMobile ? '14px' : '15px',
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
                fontSize: isMobile ? '13px' : '14px',
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

          {/* ✅ INVESTIGATION QUESTIONS SECTION */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: isMobile ? '20px 16px' : '35px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
            marginBottom: isMobile ? '20px' : '30px',
            animation: 'fade-in 1.6s ease-out'
          }}>
            <h2 style={{
              color: '#60a5fa',
              fontSize: isMobile ? '18px' : '24px',
              fontWeight: '700',
              marginBottom: isMobile ? '20px' : '24px',
              fontFamily: "'Orbitron', sans-serif",
              textAlign: 'center',
              letterSpacing: '1px'
            }}>
              📋 INVESTIGATION QUESTIONS
            </h2>

            <div style={{ display: 'grid', gap: isMobile ? '16px' : '24px' }}>
              {/* Question 1 */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px'
              }}>
                <label style={{
                  color: '#60a5fa',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  display: 'block',
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: '1px'
                }}>
                  1) Mode of Victim's Detention
                </label>
                <p style={{
                  color: '#cbd5e1',
                  fontSize: isMobile ? '12px' : '13px',
                  marginBottom: '16px',
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: '1.6'
                }}>
                  Vivek was brought to the police station under which circumstances?
                </p>
                <select
                  value={answers.q1}
                  onChange={(e) => setAnswers({...answers, q1: e.target.value})}
                  style={{
                    width: '100%',
                    padding: isMobile ? '10px' : '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    fontSize: isMobile ? '13px' : '14px',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  <option value="">Select an answer</option>
                  <option value="A">A. Arrest under warrant</option>
                  <option value="B">B. Voluntary appearance</option>
                  <option value="C">C. Preventive custody</option>
                  <option value="D">D. Summons for questioning</option>
                </select>
              </div>

              {/* Question 2 */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px'
              }}>
                <label style={{
                  color: '#60a5fa',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  display: 'block',
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: '1px'
                }}>
                  2) Official Case Description
                </label>
                <p style={{
                  color: '#cbd5e1',
                  fontSize: isMobile ? '12px' : '13px',
                  marginBottom: '16px',
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: '1.6'
                }}>
                  How is the case officially described in police records?
                </p>
                <select
                  value={answers.q2}
                  onChange={(e) => setAnswers({...answers, q2: e.target.value})}
                  style={{
                    width: '100%',
                    padding: isMobile ? '10px' : '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    fontSize: isMobile ? '13px' : '14px',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  <option value="">Select an answer</option>
                  <option value="A">A. Accidental death</option>
                  <option value="B">B. Natural death in custody</option>
                  <option value="C">C. Suicide under inquiry</option>
                  <option value="D">D. Suspicious / custodial death under inquiry</option>
                </select>
              </div>

              {/* Question 3 */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px'
              }}>
                <label style={{
                  color: '#60a5fa',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  display: 'block',
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: '1px'
                }}>
                  3) Chemical Examination Unit
                </label>
                <p style={{
                  color: '#cbd5e1',
                  fontSize: isMobile ? '12px' : '13px',
                  marginBottom: '16px',
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: '1.6'
                }}>
                  Which unit received the stomach contents for chemical examination?
                </p>
                <select
                  value={answers.q3}
                  onChange={(e) => setAnswers({...answers, q3: e.target.value})}
                  style={{
                    width: '100%',
                    padding: isMobile ? '10px' : '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    fontSize: isMobile ? '13px' : '14px',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  <option value="">Select an answer</option>
                  <option value="A">A. Digital Forensics Lab</option>
                  <option value="B">B. Criminal Psychology Division</option>
                  <option value="C">C. Toxicology Unit</option>
                  <option value="D">D. Cyber Crime Cell</option>
                </select>
              </div>

              {/* Question 4 */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px'
              }}>
                <label style={{
                  color: '#60a5fa',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  display: 'block',
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: '1px'
                }}>
                  4) Ethylene Glycol Source
                </label>
                <p style={{
                  color: '#cbd5e1',
                  fontSize: isMobile ? '12px' : '13px',
                  marginBottom: '16px',
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: '1.6'
                }}>
                  Which of the following items listed in the bar bill would likely be a direct source of ethylene glycol?
                </p>
                <select
                  value={answers.q4}
                  onChange={(e) => setAnswers({...answers, q4: e.target.value})}
                  style={{
                    width: '100%',
                    padding: isMobile ? '10px' : '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    fontSize: isMobile ? '13px' : '14px',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  <option value="">Select an answer</option>
                  <option value="A">A. Absinthe</option>
                  <option value="B">B. Single Malt Scotch</option>
                  <option value="C">C. Old Fashioned cocktail</option>
                  <option value="D">D. Craft Beer</option>
                </select>
              </div>

              {/* Question 5 */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px'
              }}>
                <label style={{
                  color: '#60a5fa',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  display: 'block',
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: '1px'
                }}>
                  5) Psychological Assessment Theme
                </label>
                <p style={{
                  color: '#cbd5e1',
                  fontSize: isMobile ? '12px' : '13px',
                  marginBottom: '16px',
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: '1.6'
                }}>
                  Which behavioural theme was repeatedly observed in Arun Kothari's psychological assessment?
                </p>
                <select
                  value={answers.q5}
                  onChange={(e) => setAnswers({...answers, q5: e.target.value})}
                  style={{
                    width: '100%',
                    padding: isMobile ? '10px' : '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    fontSize: isMobile ? '13px' : '14px',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  <option value="">Select an answer</option>
                  <option value="A">A. Empathy and remorse</option>
                  <option value="B">B. Emotional detachment</option>
                  <option value="C">C. Suppressed aggression and need for dominance</option>
                  <option value="D">D. Cognitive impairment</option>
                </select>
              </div>

              {/* Question 6 - Long Answer */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px'
              }}>
                <label style={{
                  color: '#60a5fa',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  display: 'block',
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: '1px'
                }}>
                  6) Modus Operandi Analysis
                </label>
                <p style={{
                  color: '#cbd5e1',
                  fontSize: isMobile ? '12px' : '13px',
                  marginBottom: '16px',
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: '1.6'
                }}>
                  Considering the FSL toxicology report indicating ethylene glycol presence along with traces of ethanol, what is your expert opinion on the modus operandi, timeline, and manner of ingestion in relation to the documented events?
                </p>
                <textarea
                  value={answers.q6}
                  onChange={(e) => setAnswers({...answers, q6: e.target.value})}
                  rows={isMobile ? 5 : 6}
                  placeholder="Enter your detailed analysis..."
                  style={{
                    width: '100%',
                    padding: isMobile ? '10px' : '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    fontSize: isMobile ? '13px' : '14px',
                    fontFamily: "'Inter', sans-serif",
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Question 7 - Long Answer */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px'
              }}>
                <label style={{
                  color: '#60a5fa',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  display: 'block',
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: '1px'
                }}>
                  7) Explanatory Hypotheses
                </label>
                <p style={{
                  color: '#cbd5e1',
                  fontSize: isMobile ? '12px' : '13px',
                  marginBottom: '16px',
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: '1.6'
                }}>
                  Considering the available documentation, what plausible explanatory hypotheses emerge regarding the sequence of events and possible suspects along with evidence-based justification?
                </p>
                <textarea
                  value={answers.q7}
                  onChange={(e) => setAnswers({...answers, q7: e.target.value})}
                  rows={isMobile ? 5 : 6}
                  placeholder="Enter your detailed hypothesis and justification..."
                  style={{
                    width: '100%',
                    padding: isMobile ? '10px' : '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    fontSize: isMobile ? '13px' : '14px',
                    fontFamily: "'Inter', sans-serif",
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* ✅ TERMINATE INVESTIGATION SECTION */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: isMobile ? '28px 20px' : '40px',
            marginBottom: isMobile ? '20px' : '30px',
            textAlign: 'center',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
            animation: 'fade-in 1.8s ease-out'
          }}>
            <h3 style={{
              color: '#f59e0b',
              fontSize: isMobile ? '18px' : '22px',
              fontWeight: '700',
              marginBottom: isMobile ? '14px' : '18px',
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '1px'
            }}>
              ✅ INVESTIGATION COMPLETE?
            </h3>
            <p style={{
              color: '#cbd5e1',
              fontSize: isMobile ? '13px' : '14px',
              lineHeight: '1.8',
              marginBottom: isMobile ? '20px' : '24px',
              maxWidth: '700px',
              margin: '0 auto',
              marginBottom: isMobile ? '20px' : '24px',
              fontFamily: "'Inter', sans-serif"
            }}>
              If you have answered all questions above, you may terminate the investigation window and submit your final answers.
            </p>
            
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderLeft: '4px solid #ef4444',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              marginBottom: isMobile ? '20px' : '28px',
              maxWidth: '650px',
              margin: '0 auto',
              marginBottom: isMobile ? '20px' : '28px'
            }}>
              <p style={{
                color: '#fca5a5',
                fontSize: isMobile ? '12px' : '13px',
                lineHeight: '1.8',
                margin: 0,
                fontFamily: "'Inter', sans-serif"
              }}>
                <strong style={{ color: '#ef4444' }}>⚠️ WARNING:</strong> This action will <strong>immediately terminate</strong> the 24-hour investigation window for your <strong>entire team</strong>. Proceed only after all questions are answered. <strong>This action is irreversible.</strong>
              </p>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#ffffff',
                padding: isMobile ? '14px 24px' : '16px 40px',
                borderRadius: '12px',
                border: 'none',
                fontSize: isMobile ? '14px' : '15px',
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
                padding: isMobile ? '40px 24px' : '50px 40px',
                maxWidth: '550px',
                width: '100%',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8)',
                animation: 'fade-in 0.3s ease-out'
              }}>
                <div style={{
                  width: isMobile ? '60px' : '80px',
                  height: isMobile ? '60px' : '80px',
                  margin: '0 auto 30px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: isMobile ? '30px' : '40px', height: isMobile ? '30px' : '40px', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <h2 style={{
                  color: 'white',
                  fontSize: isMobile ? '20px' : '26px',
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
                  padding: isMobile ? '20px' : '24px',
                  marginBottom: isMobile ? '24px' : '30px'
                }}>
                  <p style={{
                    color: '#cbd5e1',
                    fontSize: isMobile ? '14px' : '15px',
                    lineHeight: '1.8',
                    marginBottom: '16px',
                    textAlign: 'center',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    You are about to <strong style={{ color: '#60a5fa' }}>permanently close</strong> the investigation window for:
                  </p>
                  <p style={{
                    color: '#60a5fa',
                    fontSize: isMobile ? '16px' : '20px',
                    fontWeight: '700',
                    textAlign: 'center',
                    margin: '16px 0',
                    fontFamily: "'Orbitron', sans-serif",
                    wordBreak: 'break-word'
                  }}>
                    TEAM {teamName}
                  </p>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: isMobile ? '12px' : '13px',
                    lineHeight: '1.8',
                    textAlign: 'center',
                    margin: 0,
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    This will immediately lock out all team members.<br/>
                    Only proceed if all answers are complete.<br/>
                    <strong>THIS ACTION CANNOT BE UNDONE.</strong>
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '14px',
                  justifyContent: 'center',
                  flexDirection: isMobile ? 'column' : 'row'
                }}>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    disabled={submitting}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: 'white',
                      padding: isMobile ? '12px 24px' : '14px 32px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      fontSize: isMobile ? '14px' : '15px',
                      fontWeight: '600',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: "'Rajdhani', sans-serif",
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      width: isMobile ? '100%' : 'auto'
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
                      padding: isMobile ? '12px 24px' : '14px 32px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: isMobile ? '14px' : '15px',
                      fontWeight: '600',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.6 : 1,
                      transition: 'all 0.2s',
                      boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)',
                      fontFamily: "'Rajdhani', sans-serif",
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      width: isMobile ? '100%' : 'auto'
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
            padding: isMobile ? '20px' : '30px',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            marginBottom: '20px',
            animation: 'fade-in 2s ease-out'
          }}>
            <p style={{
              color: '#60a5fa',
              fontSize: isMobile ? '14px' : '16px',
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
              fontSize: isMobile ? '11px' : '12px',
              marginBottom: '6px',
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: '0.5px'
            }}>
              TECHNICAL SUPPORT: csi_dc@nfsu.ac.in
            </p>
            <p style={{
              color: '#475569',
              fontSize: isMobile ? '10px' : '11px',
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
