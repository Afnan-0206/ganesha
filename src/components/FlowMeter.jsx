import React from 'react';
import { getFlowState } from '../game/gameConfig';

export default function FlowMeter({ flow }) {
  const state = getFlowState(flow);
  const clampedFlow = Math.max(0, Math.min(100, Math.round(flow)));

  return (
    <div className="flow-meter-container" role="status" aria-label={`Flow: ${clampedFlow} percent, ${state.label}`}>
      <div className="flow-header">
        <span style={{ color: 'var(--gold-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="diya-flame" style={{ color: state.color }}>🪔</span>
          FLOW CONTINUITY
        </span>
        <span className={`flow-badge ${state.id}`}>
          {state.label} • {clampedFlow}%
        </span>
      </div>
      <div className="flow-track">
        <div 
          className="flow-fill"
          style={{
            width: `${clampedFlow}%`,
            backgroundColor: state.color,
            boxShadow: `0 0 12px ${state.color}`
          }}
        />
      </div>
    </div>
  );
}
