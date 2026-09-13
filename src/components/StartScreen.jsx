import React, { useState, useEffect } from 'react';
import { isAudioMuted, toggleMute, playClickSound } from '../audio/audioContext';
import { preloadAssets } from '../utils/preload';

export default function StartScreen({
  onStart,
  onResume,
  hasSavedGame,
  onOpenHowToPlay,
  onOpenLeaderboard,
  onWatchCinematic
}) {
  const [muted, setMuted] = useState(isAudioMuted());

  useEffect(() => {
    preloadAssets();
  }, []);

  const handleSoundToggle = () => {
    const next = toggleMute();
    setMuted(next);
  };


  const chapters = [
    { num: 'I', title: 'RANGOLI', skill: 'Visual Memory', icon: '🌸' },
    { num: 'II', title: 'PANDAL', skill: 'Power Circuits', icon: '🏛️' },
    { num: 'III', title: 'MODAK', skill: 'Rhythm & Fold', icon: '🥟' },
    { num: 'IV', title: 'DHOL', skill: 'Tasha Beats', icon: '🥁' },
    { num: 'V', title: 'VISARJAN', skill: 'Route Flow', icon: '🌊' },
  ];

  return (
    <div className="screen-wrapper">
      <div className="mandala-bg" />

      <div className="start-screen ornament-border">
        {/* Sacred Devanagari Invocation - Crisp and Clean */}
        <div className="sanskrit-invocation">
          ॥ श्री गणेशाय नमः ॥
        </div>

        <div className="title-ornament">
          <span>✦</span>
          <span>FIVE VIGHNAS • ONE SACRED FESTIVAL</span>
          <span>✦</span>
        </div>

        <h1 className="game-title">PANCH VIGHNA</h1>
        <p className="game-tagline">Overcome the Five Obstacles to Complete the Sacred Festival</p>

        {/* Five Festive Chapters Interactive Showcase */}
        <div className="story-card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
            borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
            paddingBottom: '6px'
          }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.76rem',
              color: 'var(--gold-400)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: 700
            }}>
              ✨ The 5 Ceremonial Chapters
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--marigold-300)', fontWeight: 600 }}>
              Continuous Journey • 500 Pts
            </span>
          </div>

          <div className="chapters-card-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            margin: '6px 0 10px 0',
          }}>
            {chapters.map((c) => (
              <div
                key={c.title}
                onClick={onOpenHowToPlay}
                title={`Learn about Chapter ${c.num}: ${c.title}`}
                style={{
                  background: 'rgba(38, 5, 12, 0.75)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gold-400)';
                  e.currentTarget.style.background = 'rgba(61, 10, 19, 0.9)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)';
                  e.currentTarget.style.background = 'rgba(38, 5, 12, 0.75)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{c.icon}</span>
                <span style={{
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  letterSpacing: '0.6px',
                  marginTop: '2px'
                }}>
                  {c.title}
                </span>
                <span className="chapter-skill-badge" style={{
                  color: 'var(--gold-400)',
                  fontSize: '0.58rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  {c.skill}
                </span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--parchment-surface)', margin: 0, opacity: 0.92, lineHeight: 1.45 }}>
            Each chapter challenges a distinct cognitive skill — from tracing sacred geometry to wiring altars and matching dhol rhythm.
          </p>
        </div>

        {/* Start Screen Actions */}
        <div className="start-actions">
          {/* Main Primary Button: BEGIN FESTIVAL */}
          <button
            id="btn-start-festival"
            className="btn-festival-primary"
            style={{ width: '100%', padding: '14px 28px' }}
            onClick={hasSavedGame ? onResume : onStart}
            autoFocus
            aria-label={hasSavedGame ? "Resume Festival Journey" : "Begin Full Festival Journey"}
          >
            <span style={{ fontSize: '1.2rem' }}>🪔</span>
            <span>{hasSavedGame ? "RESUME FESTIVAL" : "BEGIN FESTIVAL JOURNEY"}</span>
          </button>
          
          {hasSavedGame && (
            <button
              id="btn-start-new-festival"
              className="btn-festival-secondary"
              style={{ width: '100%', padding: '10px 20px', marginTop: '-4px' }}
              onClick={onStart}
              aria-label="Start New Festival Journey"
            >
              <span>🔄</span>
              <span>START NEW JOURNEY</span>
            </button>
          )}

          {/* Sacred Intro Video Launch */}
          <button
            id="btn-watch-intro-video"
            className="btn-festival-secondary"
            style={{
              width: '100%',
              background: 'rgba(43, 7, 14, 0.85)',
              borderColor: 'rgba(212, 175, 55, 0.4)',
              color: '#FFF',
              padding: '11px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
            }}
            onClick={onWatchCinematic}
            aria-label="Watch Sacred Animated Intro Video"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem' }}>🎬</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.86rem', letterSpacing: '0.6px', color: 'var(--marigold-300)' }}>
                  WATCH INTRO VIDEO
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--parchment-surface)', opacity: 0.85 }}>
                  Ganesha Invocation Animation
                </div>
              </div>
            </div>
            <span style={{
              background: 'rgba(212, 175, 55, 0.2)',
              border: '1px solid var(--gold-400)',
              borderRadius: 'var(--radius-pill)',
              padding: '4px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: 'var(--gold-300)',
              letterSpacing: '0.5px'
            }}>
              ▶ PLAY
            </span>
          </button>

          {/* Sub-actions Row: The 5 Chapters, Leaderboard, Sound */}
          <div className="start-sub-actions">
            <button
              id="btn-how-to-play"
              className="btn-festival-secondary"
              onClick={onOpenHowToPlay}
              aria-label="Open The Five Vighnas Guide"
              style={{ fontSize: '0.82rem', padding: '10px 14px' }}
            >
              <span>📜</span>
              <span>CHAPTERS</span>
            </button>

            <button
              id="btn-leaderboard"
              className="btn-festival-secondary"
              onClick={onOpenLeaderboard}
              aria-label="Open Leaderboard"
              style={{ fontSize: '0.82rem', padding: '10px 14px' }}
            >
              <span>🏆</span>
              <span>LEADERBOARD</span>
            </button>

            <button
              id="btn-sound-toggle"
              className="btn-festival-secondary"
              onClick={handleSoundToggle}
              title={muted ? 'Sound is Muted' : 'Sound is Active'}
              aria-label={muted ? 'Unmute Audio' : 'Mute Audio'}
              style={{ fontSize: '0.82rem', padding: '10px 14px' }}
            >
              <span>{muted ? '🔇' : '🔔'}</span>
              <span>{muted ? 'MUTED' : 'AUDIO'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
