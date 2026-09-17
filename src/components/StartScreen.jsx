import React, { useState, useEffect, useMemo } from 'react';
import { Flame, BookOpen, Trophy, Music, RotateCcw, Volume2, VolumeX, PlaySquare } from 'lucide-react';
import { isAudioMuted, toggleMute, playClickSound } from '../audio/audioContext';
import { preloadAssets } from '../utils/preload';

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

          {/* Sub-actions Row: The 5 Chapters, Leaderboard, Sound */}
          <div className="start-sub-actions">
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
