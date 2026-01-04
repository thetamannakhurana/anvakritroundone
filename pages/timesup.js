import { useEffect, useState } from 'react';

export default function TimesUpPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        @keyframes alarm-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes warning-flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes particle-float {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)); opacity: 0; }
        }
                  /* MOBILE RESPONSIVE */
        @media (max-width: 768px) {
          div[style*="padding: '60px 50px'"] {
            padding: 2rem 1.25rem !important;
          }

          h1 {
            font-size: 2rem !important;
          }

          p {
            font-size: 0.95rem !important;
          }

          /* Success icon smaller */
          div[style*="width: '140px'"][style*="height: '140px'"] {
            width: 100px !important;
            height: 100px !important;
          }

          div[style*="width: '120px'"][style*="height: '120px'"] {
            width: 80px !important;
            height: 80px !important;
          }

          svg {
            width: 45px !important;
            height: 45px !important;
          }

          /* Info boxes */
          div[style*="padding: '28px'"] {
            padding: 1.25rem !important;
          }

          div[style*="padding: '24px'"] {
            padding: 1.25rem !important;
          }

          ul {
            font-size: 0.85rem !important;
            padding-left: 1.25rem !important;
          }
        }

        @media (max-width: 480px) {
          h1 {
            font-size: 1.75rem !important;
          }

          div[style*="fontSize: '48px'"] h1 {
            font-size: 1.75rem !important;
          }
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
        {/* Grid Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(rgba(239, 68, 68, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239, 68, 68, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />

        {/* Warning Scanning Line */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: '-100%',
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, #ef4444 50%, transparent 100%)',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.6)',
          animation: 'scanline 6s linear infinite',
          zIndex: 1
        }} />

        {/* Flashing Warning Indicators */}
        {mounted && [0, 1].map((idx) => (
          <div
            key={`warning-${idx}`}
            style={{
              position: 'absolute',
              [idx === 0 ? 'left' : 'right']: '50px',
              top: '50px',
              width: '24px',
              height: '24px',
              background: '#ef4444',
              borderRadius: '50%',
              boxShadow: '0 0 30px #ef4444',
              animation: 'warning-flash 1s ease-in-out infinite',
              animationDelay: `${idx * 0.5}s`
            }}
          />
        ))}

        {/* Particles */}
        {mounted && [...Array(15)].map((_, i) => {
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
                background: '#ef4444',
                borderRadius: '50%',
                boxShadow: '0 0 6px #ef4444',
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
          maxWidth: '700px',
          width: '100%',
          position: 'relative',
          zIndex: 10,
          animation: 'fade-in 0.8s ease-out'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '60px 50px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 50px rgba(239, 68, 68, 0.1)',
            textAlign: 'center'
          }}>
            
            {/* Alarm Icon */}
            <div style={{
              position: 'relative',
              width: '140px',
              height: '140px',
              margin: '0 auto 40px'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '120px',
                height: '120px',
                background: 'rgba(239, 68, 68, 0.15)',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'alarm-pulse 1.5s ease-in-out infinite'
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '140px',
                height: '140px',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'alarm-pulse 1.5s ease-in-out infinite 0.2s'
              }} />
              <svg style={{ 
                width: '80px', 
                height: '80px', 
                color: '#ef4444',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                filter: 'drop-shadow(0 0 20px #ef4444)',
                animation: 'alarm-pulse 1.5s ease-in-out infinite'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Title */}
            <div style={{
              background: 'linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.15), transparent)',
              padding: '20px',
              borderRadius: '15px',
              marginBottom: '30px'
            }}>
              <h1 style={{
                fontSize: '52px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #ef4444, #fca5a5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '12px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '2px',
                lineHeight: '1'
              }}>
                TIME EXPIRED
              </h1>
              <p style={{
                color: '#fca5a5',
                fontSize: '18px',
                margin: 0,
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: '2px',
                animation: 'warning-flash 1.5s ease-in-out infinite',
                textTransform: 'uppercase',
                fontWeight: '600'
              }}>
                ⚠️ 24-Hour Window Closed
              </p>
            </div>

            {/* Main Message */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '15px',
              padding: '28px',
              marginBottom: '28px'
            }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
                padding: '10px 24px',
                marginBottom: '18px'
              }}>
                <p style={{
                  color: '#fca5a5',
                  fontSize: '14px',
                  fontWeight: '700',
                  margin: 0,
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
                  INVESTIGATION WINDOW: TERMINATED
                </p>
              </div>
              <p style={{
                color: '#cbd5e1',
                fontSize: '15px',
                lineHeight: '1.9',
                marginBottom: '16px',
                fontFamily: "'Inter', sans-serif"
              }}>
                The 24-hour investigation period has concluded. All access to case materials has been <strong style={{ color: '#fca5a5' }}>permanently revoked</strong>.
              </p>
              <p style={{
                color: '#94a3b8',
                fontSize: '14px',
                lineHeight: '1.8',
                margin: 0,
                fontFamily: "'Inter', sans-serif"
              }}>
                If your team submitted findings via the secured form, your entry has been recorded. Only submissions received within the active window will be evaluated.
              </p>
            </div>

            {/* Status Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '14px',
              marginBottom: '28px'
            }}>
              {[
                { icon: '🔒', label: 'Portal Status', value: 'LOCKED' },
                { icon: '⏱️', label: 'Time Remaining', value: '00:00:00' },
                { icon: '📊', label: 'Case Status', value: 'ARCHIVED' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px',
                    padding: '20px 16px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                >
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>{item.icon}</div>
                  <div style={{
                    color: '#94a3b8',
                    fontSize: '11px',
                    marginBottom: '8px',
                    fontFamily: "'Rajdhani', sans-serif",
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    color: '#fca5a5',
                    fontSize: '14px',
                    fontWeight: '700',
                    fontFamily: "'Orbitron', sans-serif"
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderLeft: '4px solid #3b82f6',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '28px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '14px',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '22px', height: '22px', color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 style={{
                  color: '#60a5fa',
                  fontSize: '16px',
                  fontWeight: '700',
                  margin: 0,
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: '0.5px'
                }}>
                  WHAT HAPPENS NOW?
                </h3>
              </div>
              <ul style={{
                color: '#cbd5e1',
                fontSize: '13px',
                lineHeight: '2.2',
                paddingLeft: '20px',
                margin: 0,
                textAlign: 'left',
                fontFamily: "'Inter', sans-serif"
              }}>
                <li>If submitted: Your entry is under evaluation</li>
                <li>Results will be announced via email</li>
                <li>Late submissions cannot be accepted</li>
                <li>Check your registered email for updates</li>
              </ul>
            </div>

            {/* Contact Box */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <p style={{
                color: '#60a5fa',
                fontSize: '14px',
                lineHeight: '1.7',
                margin: 0,
                fontFamily: "'Inter', sans-serif"
              }}>
                📧 <strong>Support Contact:</strong><br/>
                For queries or technical issues:<br/>
                <strong style={{ fontSize: '15px', color: '#3b82f6' }}>anvakrit@nfsu.ac.in</strong>
              </p>
            </div>

            {/* Footer */}
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.3), transparent)',
              marginBottom: '20px'
            }} />

            <p style={{
              color: '#64748b',
              fontSize: '11px',
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: '1px',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              ▓▒░ INVESTIGATION TERMINATED ░▒▓
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
