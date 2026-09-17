import React, { useEffect } from 'react';
import { playFlowRestoredSound } from '../audio/synthInstruments';
import { ArrowRight, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
import { STAGES } from '../game/festivalState';

const STAGE_ICONS = {
  rangoli: '🌸',
  aarti: '🪔',
  pandal: '🪔',
  modak: '🥟',
  dhol: '🥁',
  visarjan: '🌊'
};

export default function StageTransition({
  completedStageName,
  nextStage,
  earnedScore,
  totalScore,
  onTransitionEnd
}) {
  useEffect(() => {
    playFlowRestoredSound();
  }, []);

  // Keyboard shortcut: Press Enter or Space to begin next stage
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onTransitionEnd();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTransitionEnd]);

  const targetStage = nextStage || STAGES[1] || { id: 'aarti', name: 'AARTI', title: 'The Next Vighna', subtitle: 'Offer the Sacred Flame & Receive the Whisper', skill: 'Devotion & Flow' };
  const nextIcon = STAGE_ICONS[targetStage.id] || '🪔';
  const completedIdx = STAGES.findIndex(s => s.name.toUpperCase() === (completedStageName || '').toUpperCase());
  const displayCompletedIndex = completedIdx !== -1 ? completedIdx + 1 : 1;

  return (
    <div className="stage-transition-overlay">
      <div className="transition-card ornament-border anim-scale-in" style={{ maxWidth: '540px' }}>
        
        {/* Sacred Sanskrit Invocation */}
        <div className="anim-fade-up anim-delay-1" style={{ fontSize: '0.82rem', color: 'var(--gold-400)', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700 }}>
          ॥ विघ्न निवारण ॥
        </div>

        {/* 5-Step Visual Progression Pills */}
        <div className="anim-fade-up anim-delay-1" style={{ display: 'flex', gap: '8px', margin: '4px 0 8px 0', alignItems: 'center' }}>
          {STAGES.map((stg, idx) => {
            const isDone = idx < displayCompletedIndex;
            const isCurrent = idx === displayCompletedIndex;
            return (
              <div
                key={stg.id}
                title={`${stg.name} (${isDone ? 'Completed' : isCurrent ? 'Next Game' : 'Upcoming'})`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: isDone 
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : isCurrent 
                    ? 'rgba(245, 158, 11, 0.3)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isDone 
                    ? '1px solid #10B981' 
                    : isCurrent 
                    ? '1.5px solid var(--gold-400)' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: isDone ? '#6EE7B7' : isCurrent ? 'var(--marigold-300)' : 'rgba(255, 255, 255, 0.4)',
                  boxShadow: isCurrent ? '0 0 12px rgba(245, 158, 11, 0.4)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <span>{STAGE_ICONS[stg.id]}</span>
                {isDone && <CheckCircle2 size={12} color="#10B981" />}
              </div>
            );
          })}
        </div>

        {/* Stage Overcome Title */}
        <div className="transition-title text-gold-gradient anim-fade-up anim-delay-2" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          {completedStageName || 'VIGHNA'} OVERCOME!
        </div>

        <p className="anim-fade-up anim-delay-2" style={{ fontSize: '0.82rem', color: 'var(--parchment-dim)', margin: '0 0 6px 0' }}>
          Lord Ganesha's blessings shine upon your devotion.
        </p>

        {/* Score & Points Grid */}
        <div className="stats-grid anim-fade-up anim-delay-3" style={{ width: '100%', gap: '10px' }}>
          <div className="stat-box">
            <span className="stat-box-label">STAGE SCORE</span>
            <span className="stat-box-value" style={{ color: '#34D399' }}>+{earnedScore} PTS</span>
          </div>
          <div className="stat-box">
            <span className="stat-box-label">TOTAL FESTIVAL SCORE</span>
            <span className="stat-box-value tabular-nums" style={{ color: 'var(--marigold-300)' }}>{totalScore} / 500</span>
          </div>
        </div>

        <div className="golden-divider" style={{ margin: '8px 0' }} />

        {/* Next Game Preview Card */}
        <div className="anim-fade-up anim-delay-4" style={{
          width: '100%',
          background: 'rgba(15, 118, 110, 0.15)',
          border: '1.5px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 18px',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            fontSize: '32px',
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {nextIcon}
          </div>

          <div style={{ flex: 1 }}>
            <span style={{
              fontSize: '0.68rem',
              color: 'var(--gold-400)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontWeight: 700
            }}>
              UP NEXT • {targetStage.title || `VIGHNA ${displayCompletedIndex + 1}`}
            </span>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--marigold-300)',
              fontFamily: 'var(--font-title)',
              margin: '2px 0'
            }}>
              {targetStage.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.75)' }}>
              {targetStage.subtitle} • <strong style={{ color: '#FDE68A' }}>{targetStage.skill}</strong>
            </div>
          </div>
        </div>

        {/* Big Action Button */}
        <button
          className="btn-festival-primary anim-fade-up anim-delay-5"
          style={{
            width: '100%',
            marginTop: '10px',
            padding: '14px',
            fontSize: '1rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onClick={onTransitionEnd}
          autoFocus
        >
          <span>PLAY NEXT GAME: {targetStage.name}</span>
          <ArrowRight size={18} />
        </button>

        <span style={{ fontSize: '0.7rem', color: 'var(--gold-500)', opacity: 0.8 }}>
          Press [ENTER] or [SPACE] to start immediately
        </span>
      </div>
    </div>
  );
}
