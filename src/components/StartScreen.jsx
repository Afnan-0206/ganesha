import React from 'react';
import { isAudioMuted, toggleMute } from '../audio/audioContext';

export default function StartScreen({ onStart, onOpenHowToPlay, onOpenLeaderboard, onWatchCinematic, onOpenJudgeKit }) {
  const [muted, setMuted] = React.useState(isAudioMuted());

  const handleSoundToggle = () => {
    const next = toggleMute();
    setMuted(next);
  };

  const chapters = [
    { title: 'RANGOLI', skill: 'Memory' },
    { title: 'PANDAL', skill: 'Circuits' },
    { title: 'MODAK', skill: 'Precision' },
    { title: 'DHOL', skill: 'Rhythm' },
    { title: 'VISARJAN', skill: 'Strategy' },
  ];

  return (
    <div className="screen-wrapper">
      <div className="mandala-bg" />
      <div className="start-screen ornament-border">
        <div className="sanskrit-invocation">॥ श्री गणेशाय नमः ॥</div>
        
        <div className="title-ornament">
          <span>✦</span>
          <span>FIVE VIGHNAS • ONE FESTIVAL</span>
          <span>✦</span>
        </div>
        
        <h1 className="game-title text-gold-gradient">PANCH VIGHNA</h1>
        <p className="game-tagline">Five Vighnas. One Festival.</p>

        <div className="story-card">
          <p style={{ fontStyle: 'italic', marginBottom: '10px', color: 'var(--marigold-300)', fontSize: '0.92rem' }}>
            "A continuous Ganesh Chaturthi festival journey in five distinct chapters."
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            fontSize: '0.72rem',
            textAlign: 'center',
            margin: '10px 0 6px 0',
          }}>
            {chapters.map((c, i) => (
              <div 
                key={c.title} 
                style={{
                  background: 'rgba(38, 5, 11, 0.65)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 2px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                <span style={{ color: 'var(--parchment-bg)', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.5px' }}>
                  {c.title}
                </span>
                <span style={{ color: 'var(--gold-400)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {c.skill}
                </span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--gold-300)', margin: '8px 0 0 0', opacity: 0.9 }}>
            Every stage exercises a completely different primary skill. Overcome all five Vighnas to fulfill the sacred festival!
          </p>
        </div>

        <div className="start-actions">
          <button 
            className="btn-festival-primary"
            style={{ width: '100%' }}
            onClick={onStart}
            autoFocus
            aria-label="Begin Festival Journey"
          >
            <span className="diya-flame" style={{ fontSize: '1.2rem' }}>🪔</span>
            <span>BEGIN FESTIVAL</span>
          </button>

          <button 
            className="btn-festival-secondary" 
            style={{ width: '100%', borderColor: 'var(--border-prominent)', color: '#FFF' }}
            onClick={onWatchCinematic}
            aria-label="Watch Cinematic Opening: Panch Vighna"
          >
            <span>🎬</span>
            <span>WATCH CINEMATIC INTRO</span>
          </button>

          {/* Official Contest Judge Evaluation Kit */}
          <button 
            className="btn-festival-secondary" 
            style={{ 
              width: '100%', 
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(120, 27, 43, 0.3))', 
              borderColor: 'var(--gold-400)', 
              color: 'var(--gold-200)',
              fontWeight: 700
            }}
            onClick={onOpenJudgeKit}
            aria-label="Open Judge Evaluation Kit & Quick Stage Selector"
          >
            <span>⚖️</span>
            <span>JUDGE EVALUATION KIT & 1-CLICK TESTER</span>
          </button>

          <div className="start-sub-actions">
            <button className="btn-festival-secondary" onClick={onOpenHowToPlay}>
              <span>📜</span>
              <span>THE 5 VIGHNAS</span>
            </button>
            <button className="btn-festival-secondary" onClick={onOpenLeaderboard}>
              <span>🏆</span>
              <span>CAMPUS LEADERBOARD</span>
            </button>
            <button 
              className="btn-festival-secondary" 
              onClick={handleSoundToggle}
              title={muted ? 'Sound is Muted' : 'Sound is Active'}
            >
              <span>{muted ? '🔇' : '🔔'}</span>
              <span>{muted ? 'MUTED' : 'SOUND'}</span>
            </button>
          </div>
        </div>

        <div style={{
          fontSize: '0.72rem',
          color: 'var(--gold-400)',
          marginTop: '2px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          opacity: 0.8
        }}>
          NIAT Ganesh Chaturthi Game Design Contest • Five Chapters • One Festival
        </div>
      </div>
    </div>
  );
}
