import React from 'react';
import CinematicOpening from './CinematicOpening';

export default function IntroPlaceholder({ src, poster, onComplete, skipAllowed = true }) {
  // If an external video file source is provided, render native HTML5 video
  if (src) {
    return (
      <div className="cinematic-container">
        <video
          src={src}
          poster={poster}
          autoPlay
          playsInline
          onEnded={onComplete}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {skipAllowed && (
          <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 100 }}>
            <button className="btn-skip-cinematic" onClick={onComplete}>
              SKIP INTRO ⏭
            </button>
          </div>
        )}
      </div>
    );
  }

  // Otherwise, render the custom procedural 20-second cinematic experience
  return <CinematicOpening onComplete={onComplete} />;
}
