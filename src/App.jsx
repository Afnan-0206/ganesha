import React, { useState, useRef } from 'react';
import './styles/globals.css';
import './styles/game.css';
import StartScreen from './components/StartScreen';
import FestivalHUD from './components/FestivalHUD';
import StageTransition from './components/StageTransition';
import ResultScreen from './components/ResultScreen';
import HowToPlay from './components/HowToPlay';
import LeaderboardModal from './components/LeaderboardModal';
import IntroPlaceholder from './components/IntroPlaceholder';
import PauseModal from './components/PauseModal';
import MushakCompanion from './components/MushakCompanion';
import DifficultyModal from './components/DifficultyModal';
import PwaInstallModal from './components/PwaInstallModal';

// Five Vighna Stages
import RangoliGame from './stages/rangoli/RangoliGame';
import AartiGame from './stages/aarti/AartiGame';
import ModakGame from './stages/modak/ModakGame';
import DholGame from './stages/dhol/DholGame';
import VisarjanGame from './stages/visarjan/VisarjanGame';

import { FestivalState, STAGES } from './game/festivalState';
import { unlockAudio } from './audio/audioContext';

export default function App() {
  const [screen, setScreen] = useState('start'); // 'start' | 'playing' | 'transition' | 'result'
  const [modal, setModal] = useState(null); // 'how_to_play' | 'leaderboard' | 'pause' | null
  const [showCinematic, setShowCinematic] = useState(true); // Open intro video immediately on site load
  const [isPractice, setIsPractice] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  const festivalStateRef = useRef(new FestivalState());
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [festivalFlow, setFestivalFlow] = useState(100);
  const [totalScore, setTotalScore] = useState(0);
  const [completedStageName, setCompletedStageName] = useState('');
  const [earnedStageScore, setEarnedStageScore] = useState(0);

  const [pendingNextStageIdx, setPendingNextStageIdx] = useState(null);

  // Initialize saved state on mount
  React.useEffect(() => {
    const hasSave = festivalStateRef.current.loadFromStorage();
    if (hasSave && festivalStateRef.current.currentStageIndex > 0 && festivalStateRef.current.currentStageIndex < STAGES.length) {
      setHasSavedGame(true);
    }
  }, []);

  // Start Festival from Chapter 1 (RANGOLI) - Full Continuous Journey
  const handleStartFestival = async () => {
    await unlockAudio();
    festivalStateRef.current.clearStorage();
    festivalStateRef.current.reset();
    setIsPractice(false);
    setCurrentStageIdx(0);
    setPendingNextStageIdx(null);
    setFestivalFlow(100);
    setTotalScore(0);
    setHasSavedGame(false);
    setModal(null);
    setScreen('playing');
  };

  const handleResumeFestival = async () => {
    await unlockAudio();
    setIsPractice(false);
    const resumeIdx = Math.min(festivalStateRef.current.currentStageIndex || 0, STAGES.length - 1);
    setCurrentStageIdx(resumeIdx);
    setPendingNextStageIdx(null);
    setFestivalFlow(festivalStateRef.current.festivalFlow);
    setTotalScore(festivalStateRef.current.getTotalFestivalScore());
    setModal(null);
    setScreen('playing');
  };

  // Launch festival starting from any chosen chapter
  const handleStartPractice = async (stageId) => {
    await unlockAudio();
    festivalStateRef.current.clearStorage();
    festivalStateRef.current.reset();
    setIsPractice(false); // Play full remaining sequence!
    const idx = STAGES.findIndex(s => s.id === stageId);
    const startIdx = idx !== -1 ? idx : 0;
    festivalStateRef.current.currentStageIndex = startIdx;
    setCurrentStageIdx(startIdx);
    setPendingNextStageIdx(null);
    setFestivalFlow(100);
    setTotalScore(0);
    setModal(null);
    setScreen('playing');
  };

  // Called when any of the 5 stages completes
  const handleStageComplete = ({ stageId, score, accuracy, details }) => {
    festivalStateRef.current.recordStageResult(stageId, score, accuracy, details);
    setTotalScore(festivalStateRef.current.getTotalFestivalScore());
    setFestivalFlow(festivalStateRef.current.festivalFlow);

    // Identify strictly by stageId
    const completedIdx = STAGES.findIndex(s => s.id === stageId);
    const validCompletedIdx = completedIdx !== -1 ? completedIdx : currentStageIdx;
    const completedStage = STAGES[validCompletedIdx];

    setCompletedStageName(completedStage.name);
    setEarnedStageScore(score);

    const nextIdx = validCompletedIdx + 1;

    // Check if more stages remain in full festival journey (Stages 0 to 4: Rangoli -> Pandal -> Modak -> Dhol -> Visarjan)
    if (nextIdx < STAGES.length) {
      // More games remain! ALWAYS show transition to the next game!
      festivalStateRef.current.currentStageIndex = nextIdx;
      festivalStateRef.current.saveToStorage();
      setPendingNextStageIdx(nextIdx);
      setScreen('transition');
    } else {
      // ONLY AFTER ALL 5 GAMES ARE FINISHED (Stage 5 - Visarjan completes)!
      festivalStateRef.current.clearStorage();
      setPendingNextStageIdx(null);
      setScreen('result');
    }
  };

  // Transition overlay finishes -> advance to next stage
  const handleTransitionEnd = () => {
    const nextIdx = pendingNextStageIdx !== null 
      ? pendingNextStageIdx 
      : Math.min(currentStageIdx + 1, STAGES.length - 1);
    setCurrentStageIdx(nextIdx);
    festivalStateRef.current.currentStageIndex = nextIdx;
    setPendingNextStageIdx(null);
    setScreen('playing');
  };

  const handleQuitToTitle = () => {
    setScreen('start');
    setModal(null);
  };

  const activeStage = STAGES[currentStageIdx] || STAGES[0];

  return (
    <main className="app-container" role="main">
      {/* High-Impact 1.7x Intro Video / Cinematic Opening */}
      {showCinematic && (
        <IntroPlaceholder
          src="/intro.mp4"
          onComplete={() => setShowCinematic(false)}
          skipAllowed={true}
        />
      )}

      {/* START SCREEN */}
      {screen === 'start' && (
        <StartScreen
          onStart={handleStartFestival}
          onResume={hasSavedGame ? handleResumeFestival : null}
          hasSavedGame={hasSavedGame}
          onOpenHowToPlay={() => setModal('how_to_play')}
          onOpenLeaderboard={() => setModal('leaderboard')}
          onWatchCinematic={() => setShowCinematic(true)}
          onOpenDifficulty={() => setModal('difficulty')}
          onOpenPwaInstall={() => setModal('pwa_install')}
        />
      )}

      {/* ACTIVE FESTIVAL STAGE (1 to 5) */}
      {screen === 'playing' && (
        <div className="festival-stage-container">
          <FestivalHUD
            currentStage={activeStage}
            festivalFlow={festivalFlow}
            totalScore={totalScore}
            onPause={() => setModal('pause')}
            isPractice={isPractice}
            onOpenDifficulty={() => setModal('difficulty')}
          />

          {/* Render Active Stage */}
          {activeStage.id === 'rangoli' && (
            <RangoliGame
              onStageComplete={handleStageComplete}
              festivalFlow={festivalFlow}
            />
          )}

          {activeStage.id === 'aarti' && (
            <AartiGame
              onStageComplete={handleStageComplete}
              festivalFlow={festivalFlow}
            />
          )}

          {activeStage.id === 'modak' && (
            <ModakGame
              onStageComplete={handleStageComplete}
              festivalFlow={festivalFlow}
            />
          )}

          {activeStage.id === 'dhol' && (
            <DholGame
              onStageComplete={handleStageComplete}
              festivalFlow={festivalFlow}
            />
          )}

          {activeStage.id === 'visarjan' && (
            <VisarjanGame
              onStageComplete={handleStageComplete}
              festivalFlow={festivalFlow}
            />
          )}
        </div>
      )}

      {/* STAGE TRANSITION OVERLAY */}
      {screen === 'transition' && (
        <StageTransition
          completedStageName={completedStageName}
          nextStage={STAGES[pendingNextStageIdx !== null ? pendingNextStageIdx : festivalStateRef.current.currentStageIndex]}
          earnedScore={earnedStageScore}
          totalScore={totalScore}
          onTransitionEnd={handleTransitionEnd}
        />
      )}

      {/* FINAL FESTIVAL RESULT SCREEN */}
      {screen === 'result' && (
        <ResultScreen
          summary={festivalStateRef.current.getSummary()}
          onPlayAgain={handleStartFestival}
          onViewLeaderboard={() => setModal('leaderboard')}
          onPracticeStage={handleStartPractice}
          onReturnToTitle={handleQuitToTitle}
        />
      )}

      {/* MODALS */}
      {modal === 'how_to_play' && (
        <HowToPlay
          onClose={() => setModal(null)}
          onStartGame={handleStartFestival}
          onPracticeStage={handleStartPractice}
        />
      )}

      {modal === 'leaderboard' && (
        <LeaderboardModal
          onClose={() => setModal(null)}
          onStartGame={handleStartFestival}
          onReturnToTitle={handleQuitToTitle}
        />
      )}

      {modal === 'pause' && (
        <PauseModal
          onResume={() => setModal(null)}
          onRestart={handleStartFestival}
          onQuit={handleQuitToTitle}
          onOpenDifficulty={() => setModal('difficulty')}
        />
      )}

      {modal === 'difficulty' && (
        <DifficultyModal
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'pwa_install' && (
        <PwaInstallModal
          onClose={() => setModal(null)}
        />
      )}

      {/* Ganesha's Loyal Companion: Mushak (Lore / Modak Digging) */}
      <MushakCompanion
        onBlessing={(bonus) => {
          setFestivalFlow(f => Math.min(100, f + bonus));
        }}
        onScoreBonus={(bonus) => {
          setTotalScore(s => s + bonus);
        }}
      />
    </main>
  );
}
