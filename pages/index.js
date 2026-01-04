import Link from 'next/link';
import { useEffect, useState } from 'react';


export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState('68px');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateFontSize = () => {
      if (window.innerWidth <= 480) {
        setFontSize('2.5rem'); // 40px for small phones
      } else if (window.innerWidth <= 768) {
        setFontSize('3.5rem'); // 56px for tablets
      } else {
        setFontSize('68px'); // Desktop
      }
    };
    
    updateFontSize(); // Set initial size
    window.addEventListener('resize', updateFontSize);
    
    return () => window.removeEventListener('resize', updateFontSize);
  }, []);


  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        
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
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes subtle-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>


      <div style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#030712',
        padding: '40px 20px',
        overflow: 'hidden'
      }}>
        
        {/* Grid Pattern Background */}
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
          backgroundSize: '40px 40px',
          zIndex: 0
        }} />


        {/* Animated Scanning Line */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: '-100%',
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%)',
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4)',
          animation: 'scanline 8s linear infinite',
          zIndex: 1
        }} />


        {/* Moving Particles */}
        {mounted && [...Array(20)].map((_, i) => {
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          const endX = (Math.random() - 0.5) * 200;
          const endY = (Math.random() - 0.5) * 200;
          const size = 2 + Math.random() * 3;
          const duration = 8 + Math.random() * 12;
          const delay = Math.random() * 5;
          
          return (
            <div
              key={`particle-${i}`}
              style={{
                position: 'absolute',
                left: `${startX}%`,
                top: `${startY}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: '#3b82f6',
                borderRadius: '50%',
                boxShadow: `0 0 ${size * 3}px #3b82f6`,
                '--tx': `${endX}px`,
                '--ty': `${endY}px`,
                animation: `particle-float ${duration}s ease-in-out ${delay}s infinite`,
                zIndex: 1,
                opacity: 0
              }}
            />
          );
        })}


        {/* Content Container */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '600px',
          width: '100%',
          animation: 'fade-in-up 1s ease-out'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '60px 45px',
            border: '1px solid rgba(59, 130, 246, 0.15)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 50px rgba(59, 130, 246, 0.05)'
          }}>
            
            {/* Top Badge */}
            <div style={{
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '50px',
                padding: '6px 18px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#60a5fa',
                letterSpacing: '1px',
                fontFamily: "'Rajdhani', sans-serif",
                textTransform: 'uppercase'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  background: '#3b82f6',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px #3b82f6',
                  animation: 'subtle-pulse 2s ease-in-out infinite'
                }} />
                Round 1 • Case File Distribution
              </div>
            </div>


            {/* Main Title */}
            <h1 style={{
              fontSize: fontSize,
              fontWeight: '900',
              background: 'linear-gradient(180deg, #ffffff 0%, #3b82f6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '16px',
              textAlign: 'center',
              fontFamily: "'Orbitron', monospace",
              letterSpacing: fontSize === '68px' ? '3px' : '2px',
              lineHeight: '1',
              textShadow: '0 0 80px rgba(59, 130, 246, 0.3)'
            }}>
              ANVAKRIT 2.0
            </h1>


            {/* Tagline */}
            <div style={{
              textAlign: 'center',
              marginBottom: '12px'
            }}>
              <p style={{
                color: '#60a5fa',
                fontSize: '16px',
                margin: 0,
                fontWeight: '600',
                letterSpacing: '4px',
                fontFamily: "'Rajdhani', sans-serif",
                textTransform: 'uppercase'
              }}>
                Unmask Truth in Bytes
              </p>
            </div>


            {/* Subtitle */}
            <p style={{
              color: '#94a3b8',
              fontSize: '15px',
              marginBottom: '40px',
              textAlign: 'center',
              fontWeight: '500',
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: '1px'
            }}>
              Crime Scene Investigation Competition
            </p>
          
            {/* Info Box */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.04)',
              border: '1px solid rgba(59, 130, 246, 0.15)',
              borderRadius: '12px',
              padding: '22px',
              marginBottom: '32px'
            }}>
              <p style={{
                color: '#cbd5e1',
                fontSize: '14px',
                lineHeight: '1.8',
                margin: 0,
                fontFamily: "'Inter', sans-serif"
              }}>
                <span style={{ color: '#60a5fa', fontWeight: '600' }}>Authentication Required</span>
                <br />
                Access the secure portal to receive your classified case file and begin the 24-hour investigation window.
              </p>
            </div>


            {/* CTA Button */}
            <Link href="/scan" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              color: '#ffffff',
              padding: '16px 32px',
              borderRadius: '10px',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '15px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease',
              letterSpacing: '1px',
              border: 'none',
              fontFamily: "'Rajdhani', sans-serif",
              textTransform: 'uppercase'
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Access Portal</span>
            </Link>


            {/* Footer */}
            <div style={{
              marginTop: '32px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(59, 130, 246, 0.08)',
              textAlign: 'center'
            }}>
              <p style={{
                color: '#475569',
                fontSize: '12px',
                margin: 0,
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.3px'
              }}>
                National Forensic Sciences University
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
