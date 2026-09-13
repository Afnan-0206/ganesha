import React, { useState, useRef, useEffect } from 'react';

export default function IntroPlaceholder({
  src = '/intro.mp4',
  poster,
  onComplete,
  skipAllowed = true,
  autoPlay = true,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // Configure autoplay & browser audio policy handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = 1.0;

    const attemptPlay = async () => {
      try {
        await video.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
      } catch (err) {
        console.warn('Autoplay with sound restricted by browser policy; falling back to muted playback:', err);
        video.muted = true;
        setIsMuted(true);
        try {
          await video.play();
          setIsPlaying(true);
          setAutoplayBlocked(true);
        } catch (e) {
          console.error('Video autoplay failed:', e);
          setIsPlaying(false);
        }
      }
    };

    if (autoPlay) {
      attemptPlay();
    }
  }, [autoPlay]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
      setDuration(video.duration);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      video.playbackRate = 1.0;
    }
  };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    setAutoplayBlocked(false);
  };

  const toggleFullscreen = (e) => {
    if (e) e.stopPropagation();
    const elem = containerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = Math.max(0, Math.min(pos * video.duration, video.duration));
  };

  const handleUserActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3200);
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      className="cinematic-container"
      onMouseMove={handleUserActivity}
      onTouchStart={handleUserActivity}
      onClick={handleUserActivity}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: '#040002',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'manipulation'
      }}
    >
      {/* Video Element: Full device compatibility, preserves aspect ratio on phones, tablets, & monitors */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onComplete}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          background: '#000'
        }}
      />

      {/* Autoplay Audio Unmute Banner (appears when browser restricts autoplay sound) */}
      {autoplayBlocked && (
        <div
          onClick={toggleMute}
          style={{
            position: 'absolute',
            top: 'max(70px, calc(env(safe-area-inset-top) + 60px))',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1050,
            background: '#F59E0B',
            color: '#1a0308',
            padding: '8px 18px',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 800,
            fontSize: 'clamp(0.78rem, 2vw, 0.85rem)',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            animation: 'modalZoomIn 0.3s ease-out'
          }}
        >
          <span>🔔 Tap here to unmute audio</span>
        </div>
      )}

      {/* Top Header Overlay: Clean title and Skip button */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: 'max(14px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) 16px max(16px, env(safe-area-inset-left))',
          background: 'linear-gradient(to bottom, rgba(5, 0, 2, 0.92) 0%, rgba(5, 0, 2, 0.4) 65%, transparent 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          zIndex: 1020,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: showControls ? 'auto' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--gold-400)',
            fontSize: 'clamp(0.85rem, 2.2vw, 1.05rem)',
            letterSpacing: '1px'
          }}>
            ॥ श्री गणेशाय नमः ॥
          </div>
          <span style={{ color: 'var(--border-medium)', fontSize: '0.8rem' }}>•</span>
          <div style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--marigold-300)',
            fontSize: 'clamp(0.72rem, 1.8vw, 0.84rem)',
            letterSpacing: '1.5px',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            Panch Vighna Prologue
          </div>
        </div>

        {/* SKIP INTRO BUTTON */}
        {skipAllowed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
            className="btn-skip-cinematic"
            style={{
              background: 'linear-gradient(135deg, var(--marigold-500) 0%, var(--saffron-500) 60%, var(--maroon-700) 100%)',
              border: '1.5px solid var(--gold-400)',
              color: '#FFF',
              fontWeight: 800,
              fontSize: 'clamp(0.75rem, 1.8vw, 0.84rem)',
              letterSpacing: '1.2px',
              padding: '7px 20px',
              borderRadius: 'var(--radius-pill)',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <span>SKIP INTRO</span>
            <span>⏭</span>
          </button>
        )}
      </div>

      {/* Bottom Cinematic Control Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px max(16px, env(safe-area-inset-right)) max(18px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))',
          background: 'linear-gradient(to top, rgba(5, 0, 2, 0.95) 0%, rgba(5, 0, 2, 0.5) 70%, transparent 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 1020,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: showControls ? 'auto' : 'none'
        }}
      >
        {/* Progress Scrubber */}
        <div
          onClick={handleSeek}
          style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.18)',
            borderRadius: 'var(--radius-pill)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--gold-500), var(--marigold-400))',
              transition: 'width 0.1s linear'
            }}
          />
        </div>

        {/* Controls Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--gold-300)',
                fontSize: '1.35rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                touchAction: 'manipulation'
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              style={{
                background: 'transparent',
                border: 'none',
                color: isMuted ? 'var(--flow-unstable)' : 'var(--gold-300)',
                fontSize: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                touchAction: 'manipulation'
              }}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>

            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              color: 'var(--gold-400)',
              letterSpacing: '0.8px'
            }}>
              <span style={{ color: '#FFF', fontWeight: 600 }}>{formatTime(currentTime)}</span>
              <span style={{ opacity: 0.5, margin: '0 4px' }}>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              title="Toggle Fullscreen"
              style={{
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--gold-300)',
                fontSize: '1rem',
                padding: '5px 9px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isFullscreen ? '🗗' : '⛶'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
