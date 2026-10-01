# Graph Report - Ganesha  (2026-10-02)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 385 nodes · 895 edges · 18 communities (15 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `18f607c3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.jsx
- GameScreen.jsx
- package.json
- FlowSystem
- scroll-locked-video-hero.tsx
- ModakGame.jsx
- VisarjanGame.jsx
- ResultScreen.jsx
- AartiGame.jsx
- PandalGame.jsx
- RangoliGame.jsx
- FestivalState
- generate_pwa_icons.cjs
- ManuscriptView.jsx
- CinematicOpening.jsx
- DifficultyEngine
- .oxlintrc.json
- manuscriptVerses.js

## God Nodes (most connected - your core abstractions)
1. `react` - 32 edges
2. `playManjira()` - 25 edges
3. `getAudioContext()` - 23 edges
4. `App()` - 20 edges
5. `playFlowRestoredSound()` - 19 edges
6. `GameScreen()` - 19 edges
7. `getMasterGain()` - 17 edges
8. `FestivalState` - 16 edges
9. `MusicHero()` - 16 edges
10. `FlowSystem` - 15 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `FestivalState`  [EXTRACTED]
  src/App.jsx → src/game/festivalState.js
- `GameScreen()` --calls--> `DifficultyEngine`  [EXTRACTED]
  src/components/GameScreen.jsx → src/game/difficulty.js
- `GameScreen()` --calls--> `FlowSystem`  [EXTRACTED]
  src/components/GameScreen.jsx → src/game/flowSystem.js
- `GameScreen()` --calls--> `ScoreKeeper`  [EXTRACTED]
  src/components/GameScreen.jsx → src/game/scoring.js
- `App()` --calls--> `LeaderboardModal()`  [EXTRACTED]
  src/App.jsx → src/components/LeaderboardModal.jsx

## Import Cycles
- None detected.

## Communities (18 total, 3 thin omitted)

### Community 0 - "App.jsx"
Cohesion: 0.09
Nodes (36): lucide-react, react, App(), ambientOscillators, isAudioMuted(), playClickSound(), startAmbientDrone(), toggleMute() (+28 more)

### Community 1 - "GameScreen.jsx"
Cohesion: 0.12
Nodes (35): getAudioContext(), getAuthoritativeTime(), getMasterGain(), activeCinematicNodes, playGrandBell(), startCinematicAudio(), playDhol(), playFlowRestoredSound() (+27 more)

### Community 2 - "package.json"
Cohesion: 0.06
Nodes (32): dependencies, canvas-confetti, lucide-react, react, react-dom, @supabase/supabase-js, devDependencies, oxlint (+24 more)

### Community 3 - "FlowSystem"
Cohesion: 0.10
Nodes (9): FlowMeter(), FlowSystem, calculateRating(), FLOW_CONFIG, getFlowState(), RATINGS, SCORE_WEIGHTS, TIMING_WINDOWS (+1 more)

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

### Community 9 - "PandalGame.jsx"
Cohesion: 0.20
Nodes (12): getItemsForRound(), PANDAL_ITEMS, ROUND_TIME_LIMITS, TOTAL_ROUNDS, drawCompletionEffect(), drawPandalBackground(), drawPandalStructure(), drawPlacedItem() (+4 more)

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
Cohesion: 0.32
Nodes (11): stopCinematicAudio(), CinematicOpening(), drawFloatingParticles(), drawScene1TheFirstDiya(), drawScene2NeighborhoodWakes(), drawScene3FestivalMontage(), drawScene4PeacefulGanesha(), drawScene5FiveVighnas() (+3 more)

### Community 16 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

## Knowledge Gaps
- **60 isolated node(s):** `MusicHeroProps`, `Track`, `ambientOscillators`, `MUSHAK_LORE`, `STAGE_ICONS` (+55 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 89 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.jsx` to `GameScreen.jsx`, `package.json`, `FlowSystem`, `scroll-locked-video-hero.tsx`, `ModakGame.jsx`, `VisarjanGame.jsx`, `ResultScreen.jsx`, `AartiGame.jsx`, `PandalGame.jsx`, `RangoliGame.jsx`, `ManuscriptView.jsx`, `CinematicOpening.jsx`?**
  _High betweenness centrality (0.486) - this node is a cross-community bridge._
- **Why does `FestivalState` connect `FestivalState` to `App.jsx`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `FlowSystem` connect `FlowSystem` to `GameScreen.jsx`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `MusicHeroProps`, `Track`, `ambientOscillators` to the rest of the system?**
  _60 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09285714285714286 - nodes in this community are weakly interconnected._
- **Should `GameScreen.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11529411764705882 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05873015873015873 - nodes in this community are weakly interconnected._