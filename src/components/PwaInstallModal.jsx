import React, { useState, useEffect } from 'react';
import { X, Download, Share, PlusSquare, Smartphone, Check, WifiOff, Sparkles } from 'lucide-react';
import { promptPwaInstall, subscribePwaState } from '../utils/pwaPrompt';
import { playClickSound } from '../audio/audioContext';
import { playManjira } from '../audio/synthInstruments';

export default function PwaInstallModal({ onClose }) {
  const [pwaState, setPwaState] = useState({
    canInstall: false,
    isInstalled: false,
    isIos: false,
  });
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    return subscribePwaState((state) => {
      setPwaState(state);
    });
  }, []);

  const handleInstallClick = async () => {
    playClickSound();
    const result = await promptPwaInstall();
    if (result && result.outcome === 'accepted') {
      playManjira(0, 1.3);
      setInstallSuccess(true);
    }
  };

  return (
    <div
      className="modal-overlay anim-fade-in"
      onClick={onClose}
      style={{
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(12px, 3vh, 24px) 14px',
        overflowY: 'auto',
      }}
    >
      <div
        className="modal-card anim-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 'clamp(18px, 3vh, 26px) clamp(16px, 3vw, 24px)',
          background: 'linear-gradient(170deg, #2A060E 0%, #150206 100%)',
          border: '2px solid var(--gold-600)',
          borderRadius: '18px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(245, 158, 11, 0.25)',
          color: '#FFF',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/pwa-192x192.png"
              alt="Panch Vighna Icon"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: '1.5px solid var(--gold-400)',
                boxShadow: '0 0 12px rgba(212, 175, 55, 0.4)',
              }}
            />
            <div>
              <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--marigold-400)', textTransform: 'uppercase', fontWeight: 600 }}>
                ॥ उत्सव ऐप ॥
              </div>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: 'clamp(1.15rem, 3vw, 1.45rem)', color: 'var(--gold-200)', margin: 0 }}>
                INSTALL FESTIVAL APP
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              color: 'var(--gold-300)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Status: Already Installed */}
        {(pwaState.isInstalled || installSuccess) ? (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '2px solid #10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                color: '#10B981',
              }}
            >
              <Check size={32} strokeWidth={3} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', color: '#6EE7B7', margin: '0 0 8px 0' }}>
              PANCH VIGHNA IS INSTALLED!
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'rgba(253, 230, 138, 0.85)', lineHeight: 1.4, margin: '0 0 20px 0' }}>
              The festival is saved on your device with full offline capability. You can launch it anytime from your Home Screen with 60 FPS fullscreen immersion!
            </p>
            <button
              onClick={onClose}
              className="btn-festival-primary"
              style={{ width: '100%', padding: '12px 20px' }}
            >
              RETURN TO CELEBRATION
            </button>
          </div>
        ) : (
          <>
            {/* Features Highlight */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                }}
              >
                <div style={{ color: '#F59E0B' }}><WifiOff size={22} /></div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--gold-200)' }}>100% Offline Festival</div>
                  <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.7)' }}>Play all 5 chapters without internet or data connection.</div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                }}
              >
                <div style={{ color: '#10B981' }}><Smartphone size={22} /></div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--gold-200)' }}>Clean Fullscreen App</div>
                  <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.7)' }}>Removes browser search bars for immersive 60 FPS gaming.</div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                }}
              >
                <div style={{ color: '#EC4899' }}><Sparkles size={22} /></div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--gold-200)' }}>One-Tap Launch</div>
                  <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.7)' }}>Instant access directly from your smartphone home screen.</div>
                </div>
              </div>
            </div>

            {/* iOS Instructions */}
            {pwaState.isIos ? (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1.5px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#FDE68A', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Share size={16} />
                  <span>How to install on iOS Safari:</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#FDE68A' }}>1</span>
                    <span>Tap the <strong>Share button</strong> (<Share size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />) at the bottom of Safari.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#FDE68A' }}>2</span>
                    <span>Scroll down and tap <strong>Add to Home Screen</strong> (<PlusSquare size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />).</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#FDE68A' }}>3</span>
                    <span>Tap <strong>Add</strong> in the top-right corner. Done! ✦</span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pwaState.canInstall ? (
                <button
                  onClick={handleInstallClick}
                  className="btn-festival-primary pulse-ring"
                  style={{ width: '100%', padding: '14px 24px', fontSize: '0.92rem' }}
                >
                  <Download size={18} />
                  <span>INSTALL FESTIVAL APP NOW</span>
                </button>
              ) : !pwaState.isIos ? (
                <div style={{ textAlign: 'center', padding: '8px 0', fontSize: '0.78rem', color: 'var(--gold-400)' }}>
                  Tip: In Chrome or Edge, click the <strong>Install</strong> icon in the address bar (or Menu → "Install Panch Vighna").
                </div>
              ) : null}

              <button
                onClick={onClose}
                className="btn-festival-secondary"
                style={{ width: '100%', padding: '10px 18px', fontSize: '0.84rem' }}
              >
                <span>CONTINUE IN BROWSER</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
