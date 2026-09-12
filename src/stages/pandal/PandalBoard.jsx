import React from 'react';

export default function PandalBoard({
  nodes,
  connectedNodeIds,
  onToggleNode,
  vighna,
  isCompleted
}) {
  const maxCap = vighna?.maxCapacity || 100;
  const disabled = vighna?.disabledIds || [];

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at 50% 50%, #3D0A13 0%, #1F0308 100%)',
      overflow: 'hidden',
      padding: '16px'
    }}>
      {/* SVG Connecting Conduits */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {nodes.filter(n => n.id !== 'generator').map(load => {
          const gen = nodes.find(n => n.id === 'generator');
          const isConnected = connectedNodeIds.includes(load.id);
          const strokeColor = isConnected ? '#F59E0B' : 'rgba(212, 175, 55, 0.2)';
          const strokeWidth = isConnected ? 3.5 : 1.5;

          return (
            <g key={`wire_${load.id}`}>
              <line
                x1={`${gen.x * 100}%`}
                y1={`${gen.y * 100}%`}
                x2={`${load.x * 100}%`}
                y2={`${load.y * 100}%`}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={isConnected ? 'none' : '6, 4'}
              />
              {isConnected && (
                <circle
                  cx={`${(gen.x + load.x) * 50}%`}
                  cy={`${(gen.y + load.y) * 50}%`}
                  r={3.5}
                  fill="#FFFBEB"
                  className="diya-flame"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map(node => {
        const isGen = node.type === 'source';
        const isConnected = connectedNodeIds.includes(node.id);
        const isDisabled = disabled.includes(node.id);

        return (
          <div
            key={node.id}
            onClick={() => !isGen && !isDisabled && !isCompleted && onToggleNode(node.id)}
            style={{
              position: 'absolute',
              left: `${node.x * 100}%`,
              top: `${node.y * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: isGen ? '96px' : '84px',
              height: isGen ? '96px' : '84px',
              borderRadius: isGen ? '16px' : '50%',
              background: isGen
                ? 'linear-gradient(135deg, #781B2B, #3D0A13)'
                : isConnected
                ? 'linear-gradient(135deg, #B45309, #78350F)'
                : 'rgba(26, 4, 8, 0.85)',
              border: `2px solid ${isGen ? '#D4AF37' : isConnected ? '#FBBF24' : 'rgba(212, 175, 55, 0.4)'}`,
              boxShadow: isConnected || isGen
                ? `0 0 20px ${isGen ? 'rgba(212, 175, 55, 0.6)' : 'rgba(245, 158, 11, 0.7)'}`
                : '0 4px 12px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isGen || isDisabled ? 'default' : 'pointer',
              opacity: isDisabled ? 0.35 : 1,
              transition: 'all 0.25s ease',
              zIndex: 10
            }}
          >
            <span style={{ fontSize: isGen ? '26px' : '22px' }}>{node.icon}</span>
            <span style={{
              fontFamily: 'var(--font-title)',
              fontSize: '0.62rem',
              color: isConnected || isGen ? '#FFF' : 'var(--gold-300)',
              textAlign: 'center',
              marginTop: '3px',
              fontWeight: 700
            }}>
              {node.name.split(' ')[0]}
            </span>
            <span style={{
              fontSize: '0.58rem',
              color: isGen ? 'var(--gold-300)' : isConnected ? '#FEF08A' : 'var(--gold-400)'
            }}>
              {isGen ? `${maxCap}W CAP` : `${node.powerCost}W`}
            </span>
          </div>
        );
      })}

      {/* Completion Aura */}
      {isCompleted && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle, rgba(254, 240, 138, 0.15) 0%, transparent 80%)',
          pointerEvents: 'none',
          animation: 'diyaFlicker 2s infinite'
        }} />
      )}
    </div>
  );
}
