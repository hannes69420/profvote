import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ProfVote — Anonyme Professor:innen-Bewertungen';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 100%)',
          padding: '80px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {/* Subtle gradient glow */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,113,227,0.3) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)',
          }}
        />

        {/* Cap icon */}
        <div style={{ display: 'flex', marginBottom: 32 }}>
          <svg width="64" height="64" viewBox="0 0 100 100" fill="white">
            <path d="M50 10 L95 35 L50 60 L5 35 Z" />
            <path d="M20 45 L20 70 Q50 85 80 70 L80 45 L50 60 Z" opacity="0.85" />
            <rect x="92" y="35" width="4" height="22" rx="2" fill="white" opacity="0.7" />
            <circle cx="94" cy="60" r="5" fill="white" opacity="0.7" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            color: 'white',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            marginBottom: 24,
          }}
        >
          ProfVote
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            maxWidth: 700,
          }}
        >
          Anonyme, verifizierte Bewertungen von Professor:innen an deutschen Unis.
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: 12, marginTop: 48 }}>
          {['Uni Stuttgart', 'KIT', 'Anonym', 'Verifiziert'].map((label) => (
            <div
              key={label}
              style={{
                padding: '10px 20px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.8)',
                fontSize: 22,
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
