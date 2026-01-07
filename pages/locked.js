import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';

export default function LockedPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  const { teamName, submittedAt, status } = router.query;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent going back
  useEffect(() => {
    const preventBack = () => {
      window.history.pushState(null, '', window.location.href);
    };
    
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', preventBack);
    
    return () => {
      window.removeEventListener('popstate', preventBack);
    };
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const getStatusInfo = () => {
    if (status === 'Completed') {
      return {
        icon: '✅',
        title: 'INVESTIGATION TERMINATED',
        subtitle: 'Response Successfully Recorded',
        color: '#22c55e',
        bgColor: 'rgba(34, 197, 94, 0.15)',
        message: 'Your team has successfully submitted the investigation report.'
      };
    } else {
      return {
        icon: '⏱️',
        title: 'TIME EXPIRED',
        subtitle: 'Investigation Window Closed',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.15)',
        message: 'The 24-hour investigation deadline has passed.'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes lock-pop {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px ${statusInfo.color}40; }
          50% { box-shadow: 0 0 35px ${statusInfo.color}60; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#030712',
        padding: isMobile ? '20px 12px' : '40px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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

        {/* Scanning Line Animation */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: '-100%',
          width: '100%',
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${statusInfo.color} 50%, transparent 100%)`,
          boxShadow: `0 0 30px ${statusInfo.color}80`,
          animation: 'scanline 8s linear infinite',
          zIndex: 1
        }} />

        <div style={{
          maxWidth: '650px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: isMobile ? '40px 24px' : '60px 50px',
          border: `1px solid ${statusInfo.color}40`,
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.5)`,
          position: 'relative',
          zIndex: 10,
          animation: 'fade-in 0.6s ease-out, pulse-glow 3s ease-in-out infinite',
          textAlign: 'center'
        }}>
          
          {/* Lock Icon */}
          <div style={{
            width: isMobile ? '90px' : '120px',
            height: isMobile ? '90px' : '120px',
            margin: '0 auto 25px',
            background: statusInfo.bgColor,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'lock-pop 0.8s ease-out',
            border: `3px solid ${statusInfo.color}60`,
            boxShadow: `0 0 40px ${statusInfo.color}30`
          }}>
            <div style={{
              fontSize: isMobile ? '50px' : '65px',
              filter: `drop-shadow(0 0 15px ${statusInfo.color})`
            }}>
              {statusInfo.icon}
            </div>
          </div>

          {/* Title */}
          <div style={{
            marginBottom: '12px'
          }}>
            <div style={{
              fontSize: isMobile ? '10px' : '12px',
              color: '#60a5fa',
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              [STATUS: {status?.toUpperCase()}]
            </div>
            <h1 style={{
              fontSize: isMobile ? '26px' : '36px',
              fontWeight: '800',
              background: `linear-gradient(135deg, ${statusInfo.color}, ${statusInfo.color}CC)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '2px',
              textShadow: `0 0 30px ${statusInfo.color}40`
            }}>
              {statusInfo.title}
            </h1>
            <p style={{
              color: '#94a3b8',
              fontSize: isMobile ? '13px' : '15px',
              margin: 0,
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              {statusInfo.subtitle}
            </p>
          </div>

          {/* Team Name Badge */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: isMobile ? '12px 20px' : '16px 28px',
            marginBottom: '30px',
            display: 'inline-block'
          }}>
            <p style={{
              color: '#60a5fa',
              fontSize: isMobile ? '15px' : '18px',
              margin: 0,
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '1px',
              fontWeight: '700'
            }}>
              TEAM: {teamName || 'N/A'}
            </p>
          </div>

          {/* Message */}
          <p style={{
            color: '#cbd5e1',
            fontSize: isMobile ? '14px' : '16px',
            lineHeight: '1.9',
            marginBottom: '30px',
            fontFamily: "'Inter', sans-serif"
          }}>
            {statusInfo.message}
          </p>

          {/* Details Box */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: isMobile ? '24px 20px' : '30px',
            marginBottom: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{
              color: '#60a5fa',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '700',
              marginBottom: '20px',
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '1px',
              textAlign: 'center'
            }}>
              📊 SUBMISSION DETAILS
            </h3>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '16px',
              marginBottom: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{
                color: '#94a3b8',
                fontSize: isMobile ? '12px' : '13px',
                fontFamily: "'Rajdhani', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Investigation Status
              </span>
              <span style={{
                color: statusInfo.color,
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '700',
                fontFamily: "'Inter', sans-serif",
                background: `${statusInfo.color}15`,
                padding: '4px 12px',
                borderRadius: '6px',
                border: `1px solid ${statusInfo.color}40`
              }}>
                {status}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '16px',
              marginBottom: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{
                color: '#94a3b8',
                fontSize: isMobile ? '12px' : '13px',
                fontFamily: "'Rajdhani', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Closed At
              </span>
              <span style={{
                color: '#cbd5e1',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: '600',
                fontFamily: "'Inter', sans-serif",
                wordBreak: 'break-word',
                textAlign: 'right',
                maxWidth: '60%'
              }}>
                {submittedAt || new Date().toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                color: '#94a3b8',
                fontSize: isMobile ? '12px' : '13px',
                fontFamily: "'Rajdhani', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Current User
              </span>
              <span style={{
                color: '#cbd5e1',
                fontSize: isMobile ? '11px' : '12px',
                fontWeight: '600',
                fontFamily: "'Inter', sans-serif",
                wordBreak: 'break-all',
                textAlign: 'right',
                maxWidth: '60%'
              }}>
                {session?.user?.email || 'N/A'}
              </span>
            </div>
          </div>

          {/* Results Announcement Box */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderLeft: '4px solid #3b82f6',
            borderRadius: '12px',
            padding: isMobile ? '20px' : '24px',
            marginBottom: '25px',
            textAlign: 'left'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '14px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'rgba(59, 130, 246, 0.15)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '18px' }}>📧</span>
              </div>
              <h3 style={{
                color: '#60a5fa',
                fontSize: isMobile ? '14px' : '15px',
                fontWeight: '700',
                margin: 0,
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '0.5px'
              }}>
                RESULTS NOTIFICATION
              </h3>
            </div>
            <p style={{
              color: '#cbd5e1',
              fontSize: isMobile ? '13px' : '14px',
              lineHeight: '1.9',
              margin: 0,
              fontFamily: "'Inter', sans-serif"
            }}>
              Competition results will be announced on your <strong style={{ color: '#60a5fa' }}>registered email address</strong>. Please check your inbox regularly for updates.
            </p>
          </div>

          {/* Lock Warning */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderLeft: '4px solid #ef4444',
            borderRadius: '12px',
            padding: isMobile ? '18px' : '22px',
            marginBottom: '30px'
          }}>
            <p style={{
              color: '#fca5a5',
              fontSize: isMobile ? '12px' : '13px',
              lineHeight: '1.8',
              margin: 0,
              fontFamily: "'Inter', sans-serif"
            }}>
              <strong style={{ color: '#ef4444' }}>🔒 ACCESS PERMANENTLY LOCKED</strong><br/>
              The investigation portal is now closed for your team. You cannot re-enter the dashboard or modify your submission. All responses have been recorded in our database.
            </p>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              padding: isMobile ? '14px 28px' : '16px 40px',
              borderRadius: '12px',
              border: 'none',
              fontSize: isMobile ? '14px' : '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease',
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: '1px',
              textTransform: 'uppercase',
              width: isMobile ? '100%' : 'auto'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3)';
            }}
          >
            ← Sign Out
          </button>

          {/* Footer */}
          <div style={{
            marginTop: '35px',
            paddingTop: '25px',
            borderTop: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <p style={{
              color: '#475569',
              fontSize: isMobile ? '10px' : '11px',
              marginBottom: '8px',
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: '0.5px'
            }}>
              TECHNICAL SUPPORT: csi_dc@nfsu.ac.in
            </p>
            <p style={{
              color: '#64748b',
              fontSize: isMobile ? '11px' : '12px',
              margin: 0,
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: '0.5px'
            }}>
              ▓▒░ ANVAKRIT 2.0 - NFSU ░▒▓
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </>
  );
}
