import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function ScanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };
  
  handleResize();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      handleTrackScan();
    }
  }, [status, session]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress(prev => prev >= 90 ? 90 : prev + 10);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleTrackScan = async () => {
    setLoading(true);
    setProgress(0);
    try {
      const scanTimestamp = new Date().toISOString();
      
      const response = await fetch('/api/track-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanTimestamp }),
      });

      const data = await response.json();
      setProgress(100);

      if (data.success) {
        setTimeout(() => {
          router.push({
            pathname: '/dashboard',
            query: {
              teamName: data.teamName,
              startTime: data.startTime,
              endTime: data.endTime,
              firstScanner: data.firstScanner,
              isFirst: !data.alreadyStarted,
              currentUser: session.user.email,
            }
          });
        }, 500);
      } else {
        setError(data.message || 'Failed to process scan');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <>
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&family=Rajdhani:wght@500;600&display=swap');
          @keyframes radar-sweep {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.6; }
            50% { transform: scale(1.1); opacity: 0.3; }
            100% { transform: scale(0.8); opacity: 0.6; }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}</style>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#030712',
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

          {/* Radar Animation */}
          <div style={{
            position: 'relative',
            width: '180px',
            height: '180px',
            marginBottom: '40px'
          }}>
            {/* Pulse Rings */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '100%',
                  height: '100%',
                  border: '2px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  animation: `pulse-ring ${2 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
            {/* Radar Circle */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '130px',
              height: '130px',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              {/* Sweeping Line */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '2px',
                height: '65px',
                background: 'linear-gradient(to bottom, #3b82f6, transparent)',
                transformOrigin: 'top center',
                transform: 'translate(-50%, 0)',
                animation: 'radar-sweep 3s linear infinite',
                boxShadow: '0 0 10px #3b82f6'
              }} />
            </div>
            {/* Center Dot */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '16px',
              height: '16px',
              background: '#3b82f6',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 25px rgba(59, 130, 246, 0.8)',
              zIndex: 1
            }} />
          </div>

          <div style={{
            textAlign: 'center',
            color: 'white',
            maxWidth: '400px'
          }}>
            <p style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#60a5fa',
              marginBottom: '12px',
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '2px',
              textShadow: '0 0 20px rgba(96, 165, 250, 0.5)'
            }}>
              AUTHENTICATING
            </p>
            <p style={{
              fontSize: '14px',
              color: '#94a3b8',
              marginBottom: '30px',
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: '0.5px'
            }}>
              Verifying credentials • Initializing secure connection
            </p>

            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '6px',
              background: 'rgba(59, 130, 246, 0.15)',
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '15px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #0ea5e9 100%)',
                backgroundSize: '200% 100%',
                borderRadius: '10px',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)',
                transition: 'width 0.3s ease',
                animation: 'shimmer 2s linear infinite'
              }} />
            </div>
            <p style={{
              fontSize: '12px',
              color: '#60a5fa',
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: '600',
              letterSpacing: '1px'
            }}>
              {progress}% COMPLETE
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        @keyframes shield-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes fingerprint {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.2); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#030712',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Grid */}
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
          animation: 'scanline 8s linear infinite',
          zIndex: 1
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '520px',
          width: '100%',
          animation: 'fade-in 0.8s ease-out'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '50px 40px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 50px rgba(59, 130, 246, 0.05)'
          }}>
            <div style={{ textAlign: 'center' }}>
              {/* Security Icon */}
              <div style={{
                width: '90px',
                height: '90px',
                margin: '0 auto 30px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                animation: 'shield-pulse 3s ease-in-out infinite'
              }}>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      width: '55px',
                      height: '55px',
                      border: '2px solid #3b82f6',
                      borderRadius: '50%',
                      animation: `fingerprint ${2 + i * 0.5}s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`
                    }}
                  />
                ))}
                <svg style={{ 
                  width: '45px', 
                  height: '45px', 
                  color: '#3b82f6', 
                  filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.6))', 
                  zIndex: 1 
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              {/* Header */}
              <div style={{
                background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.08), transparent)',
                padding: '12px',
                marginBottom: '24px',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.1)'
              }}>
                <h1 style={{
  fontSize: isMobile ? '1.5rem' : '32px',
  fontWeight: '700',
  background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: '8px',
  fontFamily: "'Orbitron', sans-serif",
  letterSpacing: isMobile ? '0.5px' : '1px'
}}>
  AUTHENTICATION
</h1>

                <p style={{
                  color: '#94a3b8',
                  marginBottom: '0',
                  fontSize: '14px',
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: '0.5px'
                }}>
                  Anvakrit 2.0 › Round 1 › Verification Protocol
                </p>
              </div>

              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderLeft: '4px solid #ef4444',
                  borderRadius: '12px',
                  padding: '18px',
                  marginBottom: '24px'
                }}>
                  <p style={{ 
                    color: '#fca5a5', 
                    fontSize: '14px', 
                    margin: 0, 
                    fontWeight: '600',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    ⚠️ {error}
                  </p>
                </div>
              )}

              {/* Instructions */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                borderLeft: '4px solid #3b82f6',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '28px',
                textAlign: 'left'
              }}>
                <p style={{
                  color: '#60a5fa',
                  fontWeight: '600',
                  marginBottom: '14px',
                  fontSize: '13px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontFamily: "'Rajdhani', sans-serif"
                }}>
                  Security Protocol
                </p>
                <ul style={{
                  color: '#cbd5e1',
                  fontSize: '14px',
                  lineHeight: '2',
                  paddingLeft: '20px',
                  margin: 0,
                  fontFamily: "'Inter', sans-serif"
                }}>
                  <li>Authenticate using <strong style={{ color: '#60a5fa' }}>registered email</strong></li>
                  <li>First member initiates <strong style={{ color: '#3b82f6' }}>24-hour timer</strong></li>
                  <li>All team members share <strong>unified deadline</strong></li>
                  <li>Timer activation is <strong style={{ color: '#fca5a5' }}>irreversible</strong></li>
                </ul>
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={() => signIn('google')}
                disabled={error !== null}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                  color: '#ffffff',
                  fontWeight: '600',
                  padding: '16px 28px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: error ? 'not-allowed' : 'pointer',
                  opacity: error ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  fontSize: '15px',
                  boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  fontFamily: "'Rajdhani', sans-serif"
                }}
                onMouseOver={(e) => {
                  if (!error) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!error) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3)';
                  }
                }}
              >
                <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Initialize with Google</span>
              </button>

              {/* Footer */}
              <p style={{
                color: '#64748b',
                fontSize: '12px',
                marginTop: '24px',
                lineHeight: '1.7',
                fontFamily: "'Inter', sans-serif",
                borderTop: '1px solid rgba(59, 130, 246, 0.1)',
                paddingTop: '20px'
              }}>
                › By proceeding, you confirm receipt of case materials<br/>
                › System will activate 24-hour investigation window<br/>
                › National Forensic Sciences University
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
