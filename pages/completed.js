import { useEffect, useState } from 'react';

export default function CompletedPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        @keyframes success-scale {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); opacity: 1; }
        }
        @keyframes success-ring {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
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
          animation: 'scanline 8s linear infinite',
          zIndex: 1
        }} />

        {/* Success Particles */}
        {mounted && [...Array(20)].map((_, i) => {
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          const endX = (Math.random() - 0.5) * 300;
          const endY = (Math.random() - 0.5) * 300;
          
          return (
            <div
              key={`particle-${i}`}
              style={{
                position: 'absolute',
                left: `${startX}%`,
                top: `${startY}%`,
                width: `${3 + Math.random() * 4}px`,
                height: `${3 + Math.random() * 4}px`,
                background: i % 2 === 0 ? '#3b82f6' : '#22c55e',
                borderRadius: '50%',
                boxShadow: `0 0 10px ${i % 2 === 0 ? '#3b82f6' : '#22c55e'}`,
                '--tx': `${endX}px`,
                '--ty': `${endY}px`,
                animation: `particle-float ${8 + Math.random() * 8}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
                zIndex: 1,
                opacity: 0
              }}
            />
          );
        })}

        <div style={{
          maxWidth: '650px',
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
            border: '1px solid rgba(34, 197, 94, 0.3)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 50px rgba(34, 197, 94, 0.1)',
            textAlign: 'center'
          }}>
            
            {/* Success Icon with Rings */}
            <div style={{
              position: 'relative',
              width: '140px',
              height: '140px',
              margin: '0 auto 40px'
            }}>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '100%',
                    height: '100%',
                    border: '2px solid #22c55e',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    animation: `success-ring ${1.5 + i * 0.3}s ease-out infinite`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '120px',
                height: '120px',
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'success-scale 0.8s ease-out forwards'
              }}>
                <svg style={{ 
                  width: '70px', 
                  height: '70px', 
                  color: '#22c55e',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  filter: 'drop-shadow(0 0 20px #22c55e)'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div style={{
              background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.15), transparent)',
              padding: '20px',
              borderRadius: '15px',
              marginBottom: '30px'
            }}>
              <h1 style={{
                fontSize: '48px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #22c55e, #86efac)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '12px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '2px',
                lineHeight: '1'
              }}>
                CASE CLOSED
              </h1>
              <p style={{
                color: '#86efac',
                fontSize: '18px',
                margin: 0,
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontWeight: '600'
              }}>
                Investigation Terminated
              </p>
            </div>

            {/* Success Message */}
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '15px',
              padding: '28px',
              marginBottom: '28px'
            }}>
              <p style={{
                color: '#cbd5e1',
                fontSize: '15px',
                lineHeight: '1.9',
                marginBottom: '18px',
                fontFamily: "'Inter', sans-serif"
              }}>
                Your team's investigation window has been <strong style={{ color: '#22c55e' }}>successfully terminated</strong>.
              </p>
              <p style={{
                color: '#94a3b8',
                fontSize: '14px',
                lineHeight: '1.8',
                margin: 0,
                fontFamily: "'Inter', sans-serif"
              }}>
                Thank you for participating in <strong style={{ color: '#60a5fa' }}>ANVAKRIT 2.0</strong>. Your submission has been recorded and will be evaluated by our forensic panel. All team members have been locked out of the investigation portal.
              </p>
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
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '20px', height: '20px', color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 style={{
                  color: '#60a5fa',
                  fontSize: '16px',
                  fontWeight: '700',
                  margin: 0,
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: '0.5px'
                }}>
                  WHAT HAPPENS NEXT?
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
                <li>Your submission is now under forensic review</li>
                <li>Results will be announced via registered email</li>
                <li>Top teams advance to offline finals</li>
                <li>Check your email for further updates</li>
              </ul>
            </div>

            {/* Contact Box */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '28px'
            }}>
              <p style={{
                color: '#60a5fa',
                fontSize: '14px',
                lineHeight: '1.7',
                margin: 0,
                fontFamily: "'Inter', sans-serif"
              }}>
                📧 <strong>Technical Support:</strong><br/>
                For queries or concerns, contact:<br/>
                <strong style={{ fontSize: '15px', color: '#3b82f6' }}>anvakrit@nfsu.ac.in</strong>
              </p>
            </div>

            {/* Footer */}
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.3), transparent)',
              marginBottom: '20px'
            }} />

            <p style={{
              color: '#64748b',
              fontSize: '11px',
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: '1px',
              marginBottom: '6px',
              textTransform: 'uppercase'
            }}>
              ▓▒░ OPERATION COMPLETED ░▒▓
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
