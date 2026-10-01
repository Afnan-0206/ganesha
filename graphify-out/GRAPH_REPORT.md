# Graph Report - Ganesha  (2026-10-02)

## Corpus Check
- 66 files · ~94,420 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: .css 6, (none) 2, .example 1)

## Summary
- 413 nodes · 920 edges · 21 communities (16 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `18f607c3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.jsx
- synthInstruments.js
- package.json
- GameScreen.jsx
- scroll-locked-video-hero.tsx
- ModakGame.jsx
- VisarjanGame.jsx
- ResultScreen.jsx
- AartiGame.jsx
- PandalBoard.jsx
- RangoliGame.jsx
- FestivalState
- generate_pwa_icons.cjs
- ManuscriptView.jsx
- CinematicOpening.jsx
- PANCH VIGHNA (पंच विघ्न)
- .oxlintrc.json
- manuscriptVerses.js
- FlowSystem
- rules/graphify.md
- workflows/graphify.md

## God Nodes (most connected - your core abstractions)
1. `react` - 32 edges
2. `playManjira()` - 25 edges
3. `getAudioContext()` - 23 edges
4. `App()` - 20 edges
5. `playFlowRestoredSound()` - 19 edges
6. `GameScreen()` - 19 edges
7. `getMasterGain()` - 17 edges
8. `MusicHero()` - 16 edges
9. `FestivalState` - 16 edges
10. `playInkBlotSound()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `unlockAudio()`  [EXTRACTED]
  src/App.jsx → src/audio/audioContext.js
- `App()` --calls--> `LeaderboardModal()`  [EXTRACTED]
  src/App.jsx → src/components/LeaderboardModal.jsx
- `App()` --calls--> `ResultScreen()`  [EXTRACTED]
  src/App.jsx → src/components/ResultScreen.jsx
- `App()` --calls--> `FestivalState`  [EXTRACTED]
  src/App.jsx → src/game/festivalState.js
- `App()` --calls--> `AartiGame()`  [EXTRACTED]
  src/App.jsx → src/stages/aarti/AartiGame.jsx

## Import Cycles
- None detected.

## Communities (21 total, 5 thin omitted)

### Community 0 - "App.jsx"
Cohesion: 0.09
Nodes (35): lucide-react, react, App(), ambientOscillators, isAudioMuted(), playClickSound(), startAmbientDrone(), toggleMute() (+27 more)

### Community 1 - "synthInstruments.js"
Cohesion: 0.13
Nodes (32): getAudioContext(), getMasterGain(), activeCinematicNodes, playGrandBell(), startCinematicAudio(), playDhol(), playFlowRestoredSound(), playInkBlotSound() (+24 more)

### Community 2 - "package.json"
Cohesion: 0.06
Nodes (32): dependencies, canvas-confetti, lucide-react, react, react-dom, @supabase/supabase-js, devDependencies, oxlint (+24 more)

### Community 3 - "GameScreen.jsx"
Cohesion: 0.08
Nodes (18): getAuthoritativeTime(), stopTanpuraDrone(), DebugOverlay(), FlowMeter(), GameScreen(), MushakBonus(), CANTOS, BeatScheduler (+10 more)

### Community 4 - "scroll-locked-video-hero.tsx"
Cohesion: 0.14
Nodes (22): cardVar(), clamp(), DEFAULT_SIGNATURE, DEFAULT_TRACKS, fgMutedVar(), MinimalBackdrop(), MobileTrackList(), mod() (+14 more)

### Community 5 - "ModakGame.jsx"
Cohesion: 0.17
Nodes (16): drawBowl(), drawCatchEffect(), drawCatchZone(), drawCombo(), drawFallingItem(), drawKitchenBG(), drawRecipeHUD(), drawSteamGauge() (+8 more)

### Community 6 - "VisarjanGame.jsx"
Cohesion: 0.17
Nodes (17): CityMap(), drawBanks(), drawBoat(), drawCollectible(), drawHUD(), drawObstacle(), drawRiver(), drawSky() (+9 more)

### Community 7 - "ResultScreen.jsx"
Cohesion: 0.24
Nodes (16): @supabase/supabase-js, LeaderboardModal(), ResultScreen(), ScoreSubmissionForm(), DEFAULT_LEADERBOARD, fetchCloudLeaderboard(), getLeaderboard(), getPersonalBest() (+8 more)

### Community 8 - "AartiGame.jsx"
Cohesion: 0.20
Nodes (14): AartiAltar(), drawAartiThali(), drawAartiTrack(), drawBlessingLightRays(), drawDivineHalo(), drawGaneshaMurti(), drawSanctumBackground(), updateAndDrawFlameSparks() (+6 more)

### Community 9 - "PandalBoard.jsx"
Cohesion: 0.52
Nodes (6): drawCompletionEffect(), drawPandalBackground(), drawPandalStructure(), drawPlacedItem(), drawTargetZone(), PandalBoard()

### Community 10 - "RangoliGame.jsx"
Cohesion: 0.23
Nodes (13): drawBackground(), drawDot(), drawGridGuide(), drawPlayerConnections(), drawPreviewPattern(), drawTargetGhost(), RangoliCanvas(), updateAndDrawParticles() (+5 more)

### Community 12 - "generate_pwa_icons.cjs"
Cohesion: 0.17
Nodes (9): createPng(), crc32(), makeChunk(), fs, path, png192, png512, publicDir (+1 more)

### Community 13 - "ManuscriptView.jsx"
Cohesion: 0.29
Nodes (12): drawActiveStrokeHit(), drawActiveWritingLine(), drawCalligraphicGlyphStream(), drawHitFeedbacks(), drawInscribedStrokes(), drawManuscriptDisorders(), drawManuscriptFolium(), drawManuscriptMargins() (+4 more)

### Community 14 - "CinematicOpening.jsx"
Cohesion: 0.29
Nodes (12): unlockAudio(), stopCinematicAudio(), CinematicOpening(), drawFloatingParticles(), drawScene1TheFirstDiya(), drawScene2NeighborhoodWakes(), drawScene3FestivalMontage(), drawScene4PeacefulGanesha() (+4 more)

### Community 15 - "PANCH VIGHNA (पंच विघ्न)"
Cohesion: 0.08
Nodes (23): 🌸 Chapter 1: RANGOLI — Pattern & Sacred Geometry, 🪔 Chapter 2: AARTI — Maha Aarti & Bal Ganesha's Secret Whisper, 🥟 Chapter 3: MODAK — Culinary Kitchen & Steaming Precision, 🥁 Chapter 4: DHOL — Call-and-Response Rhythm Engine, 🌊 Chapter 5: VISARJAN — Route Strategy & Eco-Friendly Immersion, 🎮 Controls Reference, 🪔 Cultural Reverence & Philosophy, 🌟 Executive Summary & Concept (+15 more)

### Community 16 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

## Knowledge Gaps
- **80 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `fs` (+75 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 112 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.jsx` to `synthInstruments.js`, `package.json`, `GameScreen.jsx`, `scroll-locked-video-hero.tsx`, `ModakGame.jsx`, `VisarjanGame.jsx`, `ResultScreen.jsx`, `AartiGame.jsx`, `PandalBoard.jsx`, `RangoliGame.jsx`, `ManuscriptView.jsx`, `CinematicOpening.jsx`?**
  _High betweenness centrality (0.422) - this node is a cross-community bridge._
- **Why does `FestivalState` connect `FestivalState` to `App.jsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `FlowSystem` connect `FlowSystem` to `GameScreen.jsx`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _80 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09225589225589226 - nodes in this community are weakly interconnected._
- **Should `synthInstruments.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13178294573643412 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05873015873015873 - nodes in this community are weakly interconnected._