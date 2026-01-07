import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function SuccessPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
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
    if (!session) {
      router.push('/scan');
      return;
    }

    const processQRScan = async () => {
      try {
        const response = await fetch('/api/track-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scanTimestamp: new Date().toISOString()
          }),
        });

        const data = await response.json();

        console.log('✅ API Response:', data); // DEBUG

        if (!response.ok) {
  if (data.locked) {
    router.push({
      pathname: '/locked',
      query: {
        teamName: data.teamName,
        status: data.status
      }
    });
    return;
  }

          throw new Error(data.message || 'Failed to process scan');
        }

        if (data.success) {
          // ✅ CRITICAL FIX: Pass endTimeISO to dashboard
          console.log('🔍 Data being passed to dashboard:', {
            teamName: data.teamName,
            startTime: data.startTime,
            endTime: data.endTime,
            endTimeISO: data.endTimeISO,
            firstScanner: data.firstScanner,
          });

          setTimeout(() => {
            router.push({
              pathname: '/dashboard',
              query: {
                teamName: data.teamName,
                startTime: data.startTime,
                endTime: data.endTime,
                endTimeISO: data.endTimeISO,  // ✅ MUST HAVE THIS
                firstScanner: data.firstScanner,
                isFirst: !data.alreadyStarted,
                currentUser: session.user.email
              }
            });
          }, 2000); // 2 second delay to show success message
        }
      } catch (error) {
        console.error('❌ Error:', error);
        alert('An error occurred: ' + error.message);
        router.push('/scan');
      } finally {
        setLoading(false);
      }
    };

    processQRScan();
  }, [session, router]);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        
        @keyframes success-pop {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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

        <div style={{
          maxWidth: '600px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: isMobile ? '30px 20px' : '50px 40px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          zIndex: 10,
          animation: 'fade-in 0.6s ease-out'
        }}>
          
          {/* Success Icon */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '25px' : '35px' }}>
            <div style={{
              width: isMobile ? '70px' : '100px',
              height: isMobile ? '70px' : '100px',
              margin: '0 auto 20px',
              background: 'rgba(34, 197, 94, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'success-pop 0.8s ease-out',
              border: '2px solid rgba(34, 197, 94, 0.3)'
            }}>
              <svg style={{ 
                width: isMobile ? '35px' : '50px', 
                height: isMobile ? '35px' : '50px', 
                color: '#22c55e',
                filter: 'drop-shadow(0 0 10px #22c55e)'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 style={{
              fontSize: isMobile ? '24px' : '36px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #22c55e, #86efac)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '12px',
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '1px'
            }}>
              ✅ QR CODE SCANNED
            </h1>
            <p style={{
              color: '#60a5fa',
              fontSize: isMobile ? '14px' : '16px',
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: '600'
            }}>
              Redirecting to Investigation Portal...
            </p>
          </div>

          {/* Loading Animation */}
          {loading && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: isMobile ? '20px' : '30px',
              textAlign: 'center',
              marginBottom: isMobile ? '20px' : '30px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '15px'
              }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: '12px',
                      height: '12px',
                      background: '#3b82f6',
                      borderRadius: '50%',
                      animation: 'pulse 1.5s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`,
                      boxShadow: '0 0 10px #3b82f6'
                    }}
                  />
                ))}
              </div>
              <p style={{
                color: '#cbd5e1',
                fontSize: isMobile ? '13px' : '14px',
                margin: 0,
                fontFamily: "'Inter', sans-serif"
              }}>
                Initializing investigation session...
              </p>
            </div>
          )}

          {/* Info Box */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderLeft: '4px solid #3b82f6',
            borderRadius: '12px',
            padding: isMobile ? '18px' : '24px',
            marginBottom: isMobile ? '20px' : '25px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'rgba(59, 130, 246, 0.15)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg style={{ width: '18px', height: '18px', color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 style={{
                color: '#60a5fa',
                fontSize: isMobile ? '14px' : '15px',
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
              fontSize: isMobile ? '12px' : '13px',
              lineHeight: '2',
              paddingLeft: '20px',
              margin: 0,
              fontFamily: "'Inter', sans-serif"
            }}>
              <li>Your team's 24-hour timer has been activated</li>
              <li>All team members share the same deadline</li>
              <li>Access the investigation dashboard to submit answers</li>
              <li>Only one submission permitted per team</li>
            </ul>
          </div>

          {/* User Info */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: isMobile ? '16px' : '20px',
            marginBottom: isMobile ? '20px' : '25px'
          }}>
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
                Scanned by:
              </span>
              <span style={{ 
                color: '#60a5fa', 
                fontWeight: '600', 
                fontSize: isMobile ? '12px' : '13px',
                fontFamily: "'Inter', sans-serif",
                wordBreak: 'break-all',
                maxWidth: isMobile ? '60%' : 'auto',
                textAlign: 'right'
              }}>
                {session?.user?.email}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            paddingTop: isMobile ? '16px' : '20px',
            borderTop: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
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
    </>
  );
}
