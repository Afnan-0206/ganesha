import React, { useState, useEffect, useMemo } from 'react';
import { Flame, BookOpen, Trophy, Music, RotateCcw, Volume2, VolumeX, PlaySquare, Download, Sliders } from 'lucide-react';
import { isAudioMuted, toggleMute, playClickSound } from '../audio/audioContext';
import { preloadAssets } from '../utils/preload';
import { getCurrentDifficulty } from '../game/difficulty';
import { subscribePwaState } from '../utils/pwaPrompt';

// Generate CSS-based floating particles for the background
function ParticleField() {
  const particles = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => {
      const types = ['petal', 'spark', 'diya'];
      const type = types[i % 3];
      return {
        id: i,
        type,
        left: `${Math.random() * 100}%`,
        animDuration: `${12 + Math.random() * 18}s`,
        animDelay: `${Math.random() * 12}s`,
        size: type === 'spark' ? 3 : type === 'diya' ? 4 : 6,
      };
    });
  }, []);

  return (
    <div className="particle-field">
      {particles.map(p => (
        <div
          key={p.id}
          className={`particle particle--${p.type}`}
          style={{
            left: p.left,
            bottom: '-10px',
            animationDuration: p.animDuration,
            animationDelay: p.animDelay,
          }}
        />
      ))}
    </div>
  );
}

export default function StartScreen({
  onStart,
  onResume,
  hasSavedGame,
  onOpenHowToPlay,
  onOpenLeaderboard,
  onWatchCinematic,
  onOpenDifficulty,
  onOpenPwaInstall,
}) {
  const [muted, setMuted] = useState(isAudioMuted());
  const [difficulty, setDifficulty] = useState(getCurrentDifficulty());
  const [pwaState, setPwaState] = useState({ canInstall: false, isInstalled: false, isIos: false });

  useEffect(() => {
    preloadAssets();
    const handleDiff = (e) => setDifficulty(e.detail);
    window.addEventListener('panch_vighna_difficulty_changed', handleDiff);
    const unsub = subscribePwaState(setPwaState);
    return () => {
      window.removeEventListener('panch_vighna_difficulty_changed', handleDiff);
      unsub();
    };
  }, []);

  const handleSoundToggle = () => {
    const next = toggleMute();
    setMuted(next);
  };

  const chapters = [
    { num: 'I', title: 'RANGOLI', skill: 'Visual Memory', icon: '🌸' },
    { num: 'II', title: 'AARTI', skill: 'Devotion & Whisper', icon: '🪔' },
    { num: 'III', title: 'MODAK', skill: 'Rhythm & Fold', icon: '🥟' },
    { num: 'IV', title: 'DHOL', skill: 'Tasha Beats', icon: '🥁' },
    { num: 'V', title: 'VISARJAN', skill: 'Route Flow', icon: '🌊' },
  ];

  return (
    <div className="screen-wrapper">
      {/* Animated Sacred Background */}
      <div className="sacred-bg">
        <div className="mandala-bg" />
        <ParticleField />
      </div>

      <div className="start-screen ornament-border">
        {/* Orbiting Mandala Ring (decorative) */}
        <div className="mandala-ring" />

        {/* Sacred Devanagari Invocation */}
        <div className="sanskrit-invocation anim-fade-up anim-delay-1">
          ॥ श्री गणेशाय नमः ॥
        </div>

        <div className="title-ornament anim-fade-up anim-delay-2">
          <span>✦</span>
          <span>FIVE VIGHNAS • ONE SACRED FESTIVAL</span>
          <span>✦</span>
        </div>

        <h1 className="game-title anim-fade-up anim-delay-3">PANCH VIGHNA</h1>
        <p className="game-tagline anim-fade-up anim-delay-3">Overcome the Five Obstacles to Complete the Sacred Festival</p>

        {/* Five Festive Chapters Interactive Showcase */}
        <div className="story-card anim-fade-up anim-delay-4">
          <div className="story-card-header">
            <span className="story-card-label">
              ✨ The 5 Ceremonial Chapters
            </span>
            <span className="story-card-meta">
              Continuous Journey • 500 Pts
            </span>
          </div>

          <div className="chapters-grid">
            {chapters.map((c, i) => (
              <div
                key={c.title}
                className="chapter-card"
                onClick={onOpenHowToPlay}
                title={`Learn about Chapter ${c.num}: ${c.title}`}
              >
                <span className="chapter-card-icon">{c.icon}</span>
                <span className="chapter-card-title">{c.title}</span>
                <span className="chapter-skill-badge">{c.skill}</span>
              </div>
            ))}
          </div>

          <p className="story-card-footer">
            Each chapter challenges a distinct cognitive skill — from tracing sacred geometry to wiring altars and matching dhol rhythm.
          </p>
        </div>

        {/* Start Screen Actions */}
        <div className="start-actions anim-fade-up anim-delay-5">
          <div className="headphones-hint">
            <Music size={14} color="var(--gold-400)" />
            <span>Headphones Highly Recommended</span>
          </div>

          {/* Interactive Cadence & Difficulty Bar */}
          <button
            id="btn-open-difficulty"
            onClick={() => {
              playClickSound();
              if (onOpenDifficulty) onOpenDifficulty();
            }}
            className="btn-difficulty-selector"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: difficulty.badgeBg,
              border: `1.5px solid ${difficulty.badgeBorder}`,
              borderRadius: '14px',
              cursor: 'pointer',
              width: '100%',
              color: '#FFF',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            }}
            aria-label="Change Festival Cadence and Speed"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.3rem' }}>{difficulty.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 600 }}>
                  CADENCE & DIFFICULTY
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: difficulty.badgeColor }}>
                  {difficulty.name} <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 500 }}>({difficulty.sanskritName})</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: '999px',
                background: 'rgba(0, 0, 0, 0.45)',
                color: 'var(--gold-200)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
              }}>
                {difficulty.scoreMult > 1 ? `+${Math.round((difficulty.scoreMult - 1) * 100)}% PTS` : '1.0× PTS'}
              </span>
              <Sliders size={15} color="var(--gold-300)" />
            </div>
          </button>

          {/* Main Primary Button: BEGIN FESTIVAL */}
          <button
            id="btn-start-festival"
            className="btn-festival-primary pulse-ring"
            style={{ width: '100%', padding: '15px 28px' }}
            onClick={hasSavedGame ? onResume : onStart}
            autoFocus
            aria-label={hasSavedGame ? "Resume Festival Journey" : "Begin Full Festival Journey"}
          >
            <Flame size={20} color="#0A0203" />
            <span>{hasSavedGame ? "RESUME FESTIVAL" : "BEGIN FESTIVAL JOURNEY"}</span>
          </button>

          {hasSavedGame && (
            <button
              id="btn-start-new-festival"
              className="btn-festival-secondary"
              style={{ width: '100%', padding: '10px 20px' }}
              onClick={onStart}
              aria-label="Start New Festival Journey"
            >
              <RotateCcw size={16} />
              <span>START NEW JOURNEY</span>
            </button>
          )}

          {/* Sacred Intro Video Launch */}
          <button
            id="btn-watch-intro-video"
            className="btn-intro-video"
            onClick={onWatchCinematic}
            aria-label="Watch Sacred Animated Intro Video"
          >
            <div className="intro-video-info">
              <PlaySquare size={24} color="var(--marigold-300)" />
              <div style={{ textAlign: 'left' }}>
                <div className="intro-video-title">WATCH INTRO VIDEO</div>
                <div className="intro-video-sub">Ganesha Invocation Animation</div>
              </div>
            </div>
            <span className="intro-play-badge">▶ PLAY</span>
          </button>

          {/* Install Festival PWA Button */}
          <button
            id="btn-open-pwa-install"
            className="btn-festival-secondary"
            onClick={() => {
              playClickSound();
              if (onOpenPwaInstall) onOpenPwaInstall();
            }}
            aria-label="Install Panch Vighna Festival App"
            style={{
              width: '100%',
              padding: '10px 18px',
              fontSize: '0.84rem',
              justifyContent: 'center',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              background: 'rgba(212, 175, 55, 0.08)',
            }}
          >
            <Download size={16} color="var(--gold-300)" />
            <span>{pwaState.isInstalled ? "✦ FESTIVAL APP INSTALLED (OFFLINE READY)" : "INSTALL APP • OFFLINE PLAY"}</span>
          </button>

          {/* Sub-actions Row */}
          <div className="start-sub-actions anim-fade-up anim-delay-6">
            <button
              id="btn-how-to-play"
              className="btn-festival-secondary"
              onClick={onOpenHowToPlay}
              aria-label="Open The Five Vighnas Guide"
              style={{ fontSize: '0.82rem', padding: '10px 14px' }}
            >
              <BookOpen size={16} />
              <span>CHAPTERS</span>
            </button>

            <button
              id="btn-leaderboard"
              className="btn-festival-secondary"
              onClick={onOpenLeaderboard}
              aria-label="Open Leaderboard"
              style={{ fontSize: '0.82rem', padding: '10px 14px' }}
            >
              <Trophy size={16} />
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
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{muted ? 'MUTED' : 'AUDIO'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
