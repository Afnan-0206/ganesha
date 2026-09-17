import React, { useRef, useEffect } from 'react';

export default function CityMap({
  boatY,          // 0 to 1 normalized
  riverObjects,   // Array of objects with x, y, icon, kind, etc.
  health,         // 0 to 100
  score,          // Current score
  progress,       // 0 to 1 journey progress
  hitFlash,       // true when just hit obstacle
  collectEffects, // Array of { x, y, time }
}) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at 50% 50%, #2D080E 0%, #170205 100%)',
      overflow: 'hidden',
      padding: '16px'
    }}>
      {/* SVG City Map Roads */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {routes.map(r => {
          const isSelected = selectedRoute?.id === r.id;
          const pts = r.pathPoints;
          const d = `M ${pts[0].x * 100}% ${pts[0].y * 100}% C ${pts[1].x * 100}% ${pts[1].y * 100}%, ${pts[2].x * 100}% ${pts[2].y * 100}%, ${pts[3].x * 100}% ${pts[3].y * 100}%`;

          return (
            <g key={r.id} onClick={() => !isMoving && onSelectRoute(r)} style={{ cursor: isMoving ? 'default' : 'pointer' }}>
              {/* Road bed */}
              <path
                d={d}
                stroke={isSelected ? '#D4AF37' : 'rgba(212, 175, 55, 0.2)'}
                strokeWidth={isSelected ? 10 : 6}
                strokeLinecap="round"
                fill="none"
              />
              {/* Center dashed guideline */}
              <path
                d={d}
                stroke={isSelected ? '#FEF08A' : 'rgba(255, 255, 255, 0.15)'}
                strokeWidth={2}
                strokeDasharray="8, 6"
                fill="none"
              />
            </g>
          );
        })}
      </svg>

      {/* Start Node: Pandal */}
      <div style={{
        position: 'absolute',
        left: '15%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #781B2B, #3D0A13)',
          border: '2px solid #D4AF37',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)'
        }}>
          🏛️
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--gold-300)', fontWeight: 700 }}>PANDAL</span>
      </div>

      {/* Destination Node: Riverbank Ghat */}
      <div style={{
        position: 'absolute',
        left: '88%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0284C7, #0369A1)',
          border: '2px solid #38BDF8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 0 15px rgba(56, 189, 248, 0.6)'
        }}>
          🌊
        </div>
        <span style={{ fontSize: '0.72rem', color: '#7DD3FC', fontWeight: 700 }}>SACRED GHAT</span>
      </div>

      {/* Moving Procession Chariot */}
      {isMoving && selectedRoute && (
        <div style={{
          position: 'absolute',
          left: `${(0.15 + (0.88 - 0.15) * processionProgress) * 100}%`,
          top: `${(selectedRoute.pathPoints[1].y + (selectedRoute.pathPoints[2].y - selectedRoute.pathPoints[1].y) * 0.5) * 100}%`,
          transform: 'translate(-50%, -50%)',
          fontSize: '32px',
          animation: 'diyaFlicker 1.2s infinite',
          zIndex: 20
        }}>
          🛕
        </div>
      )}

      {/* Dynamic Vighna Alert Modal */}
      {activeVighna && (
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(38, 5, 11, 0.95)',
          border: '2px solid #F59E0B',
          borderRadius: '16px',
          padding: '16px 22px',
          maxWidth: '440px',
          width: '90%',
          textAlign: 'center',
          zIndex: 50,
          boxShadow: '0 12px 32px rgba(0,0,0,0.8)'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>⛈️</div>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', color: 'var(--marigold-300)' }}>
            DYNAMIC VIGHNA: {activeVighna.name}
          </span>
          <p style={{ fontSize: '0.8rem', color: 'var(--parchment-surface)', margin: '8px 0 14px 0' }}>
            {activeVighna.description}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="btn-festival-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => onAdaptRoute(true)}>
              TAKE DETOUR
            </button>
            <button className="btn-festival-secondary" style={{ padding: '8px 14px', fontSize: '0.78rem' }} onClick={() => onAdaptRoute(false)}>
              HOLD STEADY
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
