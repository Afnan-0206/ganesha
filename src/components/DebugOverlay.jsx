import React from 'react';

export default function DebugOverlay({
  visible,
  audioTime,
  fps,
  flow,
  cantoIndex,
  combo,
  difficultyPressure,
  lastHitDelta
}) {
  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '12px',
      left: '12px',
      background: 'rgba(0, 0, 0, 0.85)',
      border: '1px solid #10B981',
      borderRadius: '8px',
      padding: '8px 12px',
      color: '#34D399',
      fontFamily: 'monospace',
      fontSize: '0.75rem',
      zIndex: 9999,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '3px'
    }}>
      <div>[DEBUG OVERLAY] (Press 'D' to Hide)</div>
      <div>FPS: {fps}</div>
      <div>Audio Clock: {audioTime.toFixed(3)}s</div>
      <div>Canto: {cantoIndex + 1} / 5</div>
      <div>Flow: {flow.toFixed(1)}%</div>
      <div>Combo: {combo}</div>
      <div>Difficulty Pressure: {(difficultyPressure * 100).toFixed(0)}%</div>
      <div>Last Delta: {lastHitDelta !== null ? `${lastHitDelta > 0 ? '+' : ''}${lastHitDelta.toFixed(1)}ms` : '—'}</div>
    </div>
  );
}
