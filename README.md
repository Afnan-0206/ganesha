# PANCH VIGHNA
### *Five Vighnas. One Festival.*

**A Continuous 5-Chapter Ganesh Chaturthi Festival Journey for the NIAT Game Design Contest**

---

## 🌟 Executive Summary & Concept

**PANCH VIGHNA** (*Five Obstacles*) is a purpose-built browser game submission for the **NIAT Ganesh Chaturthi Game Design Contest**.

Rather than a generic mini-game collection or a skin of an existing rhythm/arcade title, **PANCH VIGHNA** is designed as **ONE continuous festival journey** spanning five distinct chapters of Ganesh Chaturthi celebrations.

### The Absolute Game-Design Rule
**Every stage exercises a completely different primary gameplay skill.**
- **Chapter 1: RANGOLI** → Visual Memory + Tracing
- **Chapter 2: PANDAL** → Spatial Circuit Reasoning + Resource Management
- **Chapter 3: MODAK** → Culinary Sequencing + Gauge Precision
- **Chapter 4: DHOL** → Auditory & Visual Call-and-Response Rhythm
- **Chapter 5: VISARJAN** → Route Strategy + Dynamic Obstacle Adaptation

---

## 🪔 Cultural Reverence & Philosophy

In strict alignment with cultural reverence:
1. **Sacred Dignity**: Lord Ganesha is never harmed, attacked, damaged, cracked, or treated as a "health bar".
2. **Systemic Challenges**: All obstacles (*Vighnas*) and failure states belong strictly to environmental, logistical, and craft challenges (electrical generator load, steaming timing window, rhythmic call reproduction, procession street navigation).
3. **Overcoming Obstacles**: As *Vighnaharta* (the Remover of Obstacles), Ganesha inspires the community to overcome every challenge with focus, patience, joy, and devotion.

---

## 📜 The Five Chapters (Vighnas)

### 🌸 Chapter 1: RANGOLI — Pattern & Memory
- **Core Skill**: Visual Memory + Tracing
- **The Challenge**: A morning gust of wind threatens the sacred courtyard pattern.
- **Gameplay**:
  1. **Memorization (2.2s)**: The sacred geometric Kolam illuminates sequentially through numbered sacred nodes.
  2. **Tracing Phase**: The player draws a continuous stroke via pointer or touch through the nodes in the exact sacred sequence.
  3. **Payoff**: Successfully completing the pattern triggers a vibrant blossom of pink and yellow gulal powder across the stones.
- **Scoring**: Node sequence accuracy + stroke completion percentage + speed bonus (0–100 PTS).

---

### 🏛️ Chapter 2: PANDAL — Spatial Circuit Puzzle
- **Core Skill**: Spatial Circuit Reasoning + Capacity Constraint Management
- **The Challenge**: The pandal generator is capped at **75W** under the *Limited Power Vighna*.
- **Gameplay**:
  1. **Circuit Grid**: Interactive schematic wiring between the Main Power Generator and pandal appliances (Toran Entrance Lights [25W], Altar Brass Diyas [15W], Ceiling Canopy [20W], Sound System [25W], Dholak Mic [15W]).
  2. **Resource Constraint**: Essential loads (Entrance Lights + Altar Diyas = 40W) are mandatory. The player must complete the power circuit without exceeding 75W.
  3. **Payoff**: Powering on the grid triggers a warm, golden illumination cascade across the grand pandal.
- **Scoring**: Essential connection fulfillment + non-overload safety margin + aesthetic efficiency (0–100 PTS).

---

### 🥟 Chapter 3: MODAK — Precision Kitchen
- **Core Skill**: Multi-Step Sequencing + Steamer Timing Precision
- **The Challenge**: Devotees await fresh prasad modaks before the grand aarti begins.
- **Gameplay**:
  1. **Dough Press**: Press the freshly kneaded rice flour dough onto the wooden patla.
  2. **Filling Pairing**: Select the matching sacred filling (Coconut Jaggery, Kesar Saffron, or Dry Fruit Pista).
  3. **Apex Pleat**: Pinch the apex into 21 traditional sacred folds.
  4. **Steamer Precision Bar**: An oscillating steam pressure indicator cycles across the dial. The player must lift the steamer lid precisely in the **Golden Zone (60–85%)**—avoiding raw (<60%) or oversteamed (>85%) offerings.
  5. **Payoff**: Plate hot, aromatic modaks onto the sacred banana leaf tray.
- **Scoring**: Recipe accuracy + golden-zone steaming accuracy + consecutive perfection streak (0–100 PTS).

---

### 🥁 Chapter 4: DHOL — Rhythm Call-and-Response
- **Core Skill**: Auditory & Visual Pattern Memory + Rhythm Reproduction
- **The Challenge**: The procession drummers sound out festive talam calls that the player must echo with precision.
- **Gameplay**:
  1. **The Call**: The Master Dholak plays a syncopated rhythmic motif (Dha, Tak, Dhum). Expanding visual pulse rings radiate from the instrument head to guarantee **100% sound-off accessibility**.
  2. **The Response**: The player reproduces the pattern on the Dhol and Tasha with matching timing and beat values.
  3. **Payoff**: Harmonious drum rolls, rising crowd cheers, and golden resonance waves.
- **Scoring**: Hit accuracy delta (|t_player - t_expected| in ms) across 5 progressive rounds (0–100 PTS).

---

### 🌊 Chapter 5: VISARJAN — Route Strategy
- **Core Skill**: Strategic Route Planning + Mid-Procession Adaptation
- **The Challenge**: Guide the grand Chariot procession to the Sacred Ghat through the crowded city streets.
- **Gameplay**:
  1. **Route Selection**: Choose between 3 paths with distinct length, crowd density, and blessing multipliers (Main Bazaar Avenue, Lake Promenade, Temple Garden Lanes).
  2. **Dynamic Vighna Event**: Halfway through the route, a sudden obstacle strikes (e.g. *Sudden Monsoon Showers* or *Aarti Crowd Surge*).
  3. **Real-time Adaptation**: Decide whether to take a quick sheltered bypass detour or hold steady with tarpaulins.
  4. **Payoff**: The chariot reaches the illuminated riverside ghat amidst floating diyas, conch fanfares, and celebratory chants.
- **Scoring**: Route clearance efficiency + dynamic obstacle response bonus (0–100 PTS).

---

## 🏆 Global Session & Scoring System

- **Continuous Festival Journey**: All five chapters are bridged by seamless marigold petal wipe transitions, carrying forward the player's momentum.
- **Global Festival Flow (0–100%)**: Reflects the collective spiritual harmony and festive energy of the neighborhood.
- **Contest Score**: Exactly normalized across all 5 stages:
  $$\text{Total Festival Score} = \sum_{i=1}^{5} \text{Stage Score}_i \quad (\text{Max: } 500 \text{ PTS})$$

### Festival Rank Tiers:
| Total Score | Rank Title | Badge |
| :--- | :--- | :--- |
| **450 – 500 PTS** | **FESTIVAL MASTER** | ✦✦✦✦✦ |
| **380 – 449 PTS** | **DEVOTED ORGANIZER** | ✦✦✦✦ |
| **300 – 379 PTS** | **STEADFAST CELEBRANT** | ✦✦✦ |
| **200 – 299 PTS** | **DEDICATED SEVAK** | ✦✦ |
| **< 200 PTS** | **FESTIVAL SEEDLING** | ✦ |

### Dynamic Weakest Vighna Diagnosis & Practice Mode
At the end of the 5-stage festival run, the engine automatically diagnoses the player's **Weakest Vighna** (e.g., *DHOL: 85 PTS*) and presents an instant **"🎯 PRACTICE THIS VIGHNA"** button. Players and judges can also test or practice any individual stage directly from **THE 5 VIGHNAS** guide!

---

## 🎬 Cinematic Opening: Panch Vighna

A procedural, 20-second cinematic opening sequence introduces the dawn of the festival:
1. **Scene 1 (0–3s)**: Brass diya flame lights in the darkness with floating marigolds.
2. **Scene 2 (3–6s)**: Morning neighborhood awakening as a sacred Rangoli is laid.
3. **Scene 3 (6–9s)**: Festive montage of sweet modaks and dhol lacing.
4. **Scene 4 (9–12s)**: Peaceful, radiant presence of Ganesha with golden prabhavali halo.
5. **Scene 5 (12–15s)**: Assembly of the five symbolic Vighnas in a revolving sacred mandala.
6. **Scene 6–7 (15–20s)**: Grand title reveal of **PANCH VIGHNA** fading into the Start Screen.
- **Full Player Agency**: Instant skip anytime via `SKIP INTRO »` or replay anytime from the start screen.

---

## 🎵 Sound & Accessibility

- **Procedural Web Audio Engine**: Zero copyrighted music or heavy static audio assets. All sound effects (shehnai drone, conch blasts, resonant brass bells, dhol/tasha percussion, and ambient temple tones) are synthesized mathematically in real-time.
- **100% Sound-Off Playable**: Every auditory cue (especially Chapter 4's call-and-response rhythm) is accompanied by unmistakable high-contrast visual pulses and on-screen rhythm rings.
- **One-Click Mute**: Instant audio toggle available on the start screen, HUD, and pause menu.

---

## 🎮 Controls

| Chapter | Desktop Controls | Mobile / Touch Controls |
| :--- | :--- | :--- |
| **Start & Modals** | Mouse click / Enter | Thumb tap |
| **Chapter 1 (Rangoli)** | Click & Drag through nodes | Finger swipe / touch drag |
| **Chapter 2 (Pandal)** | Click switches / conduits to toggle | Tap conduits / appliance switches |
| **Chapter 3 (Modak)** | Click Dough → Filling → Shape → Steam Button | Tap workbench stations & Lift Steam Lid |
| **Chapter 4 (Dhol)** | Space / 'D' (Dhol), 'F' (Tasha), or On-Screen Drum Heads | Tap Left Drum (Dhol) / Right Drum (Tasha) |
| **Chapter 5 (Visarjan)**| Click Route Card / Adaptation Choice | Tap Route Card / Detour Option |

---

## 🛠 Tech Stack

- **Frontend Core**: React 19 + Vite 8
- **Graphics & Canvas**: HTML5 Canvas (High-DPI responsive rendering) + Modular SVG schematics
- **Audio Architecture**: Web Audio API (real-time procedural synthesis oscillators, bandpass filters, envelope shapers)
- **Design System**: Vanilla CSS3 with custom Indian festival tokens (Deep Maroon `#3B0A11`, Imperial Saffron `#D96B27`, Radiant Gold `#F59E0B`, Sacred Turmeric, Gulal Pink)
- **Effects**: Custom procedural petal particles, WebGL/canvas confetti for festival completion
- **Typography**: *Cinzel Decorative*, *Rozha One*, *Kalam*, *Outfit* (via Google Fonts)

---

## 🚀 Running Locally

```bash
# 1. Clone the repository
git clone <repo-url>
cd Ganesha

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```
Open `http://localhost:5173/` in your browser.

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 🏆 Official Contest Features & Innovations

1. **Official Judge Evaluation Kit & 1-Click Stage Tester**:
   - Direct button `⚖️ JUDGE EVALUATION KIT` on the Start Screen.
   - Comprehensive breakdown of all 6 official judging criteria (Reverence, 5 Distinct Skills, Completeness, Cross-Campus play, Sound-Off accessibility, Responsiveness).
   - 1-click stage jump buttons allowing judges to inspect any of the 5 Vighna chapters immediately.

2. **Cross-Campus Filtered Leaderboard**:
   - Live campus filter pills across top Indian engineering colleges (IIT Bombay, BITS Pilani, NIT Trichy, IIIT Hyderabad, COEP Pune, etc.).
   - Dynamic Leading Campus Honor Banner celebrating college pride and healthy student competition.

3. **Mushak's Divine Blessing (Interactive Companion / Easter Egg)**:
   - Ganesha's loyal mouse companion carrying a golden glowing modak.
   - Tapping Mushak awards an auspicious temple manjira chime, golden confetti burst, and +5 Flow blessing with speech bubble: *"✨ मूषक कृपा! MUSHAK'S BLESSING!"*

4. **Eco-Friendly Clay Murti (शाडूची माती) Visarjan Immersion**:
   - Replaces artificial immersion with an authentic, poignant ecological celebration.
   - Traditional clay murti gently merges with the sacred water, releasing floating brass diyas, marigold petals, and celebratory chants (*"गणपती बाप्पा मोरया, पुढच्या वर्षी लवकर या!"*).

5. **Festive Micro-Juiciness & Audio Visual Feedback**:
   - High-energy Marathi/Hindi celebratory hit toasts: *"शाब्बास! SHABASH!"*, *"उत्कृष्ट प्रसाद! PERFECT STEAM!"*, and *"मोरया! FLAWLESS CADENCE"*.

---

## 📜 Submission Details
- **Contest**: NIAT Ganesh Chaturthi Game Design Contest
- **Submission Title**: **PANCH VIGHNA: Five Vighnas. One Festival.**
- **Repository**: [github.com/Afnan-0206/ganesha](https://github.com/Afnan-0206/ganesha)
- **License**: MIT

