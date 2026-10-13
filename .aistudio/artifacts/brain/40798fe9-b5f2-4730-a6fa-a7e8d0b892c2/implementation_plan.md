# Study Stranger: Comprehensive Feature Upgrade & Exam Prep Plan

## Overview
This implementation plan outlines a major feature upgrade for **Study Stranger**, specifically customized for **Abhijit and WBCHSE Class 12 Semester 3** students (covering **Biology**, **Bengali A**, and **English B**). The upgrades transform the platform from a simple mock test tool into an all-in-one, highly engaging, gamified study suite featuring bilingual explanations (Bengali + English).

---

## User Review Required

> [!NOTE]
> All features will run with zero disruption to existing authentication and mock test data. Local storage and Firestore will be leveraged seamlessly for study streaks and flashcard progress. No external API keys or paid third-party dependencies are required.

---

## Proposed Changes & Architecture

### 1. AI Mistake Analyzer & Weakness Diagnostic (`src/components/MistakeAnalyzer.tsx`)
- **Direct Integration in Mock Test Results**: In the test result page, students can click **"Analyze Mistakes" (ভুল উত্তর বিশ্লেষণ)**.
- **Chapter-Level Weakness Detection**:
  - Highlights weak areas across Biology (Reproduction, Genetics & Evolution), Bengali A (Adarini, Bangla Bhasha, Poems), and English B (The Night Train at Deoli, Strong Roots, The Bet).
  - Diagnostic radar/bar indicating accuracy percentage per subtopic.
- **Bilingual Deep-Dive Explanations**:
  - Shows why the chosen option was wrong and why the correct answer is right.
  - Bengali and English explanation side-by-side with key memory mnemonics and exact syllabus citations (e.g., ZP3 receptor, LH Surge Day 14, Adarini 2000 rupees price).

---

### 2. Interactive Chapter Flashcards & Spaced Repetition (`src/components/ChapterFlashcards.tsx`)
- **3D Flip Cards**:
  - Interactive tactile cards with flipping animation (`motion/react`).
  - Covers critical board facts, scientific definitions, author contexts, and word notes.
- **Syllabus Organization**:
  - **Biology**: Gametogenesis, Menstrual Cycle, Double Fertilization, Mendel's Crosses, DNA Replication enzymes (SSB, Helicase, Polymerase), Human Evolution (*Australopithecus*, *Homo erectus*).
  - **Bengali A**: আদিরিনী চরিত্র চিত্রণ, স্বামী বিবেকানন্দের ভাষা দর্শন, শ্রীজাতের 'ধর্ম' ভাবার্থ, শব্দার্থতত্ত্ব ও ধ্বনিতত্ত্ব।
  - **English B**: Chekhov's 'The Bet' 2 million rubles / 15 years, Ruskin Bond's Deoli basket girl symbolism, Ulysses quote analysis.
- **Spaced Repetition Rating**:
  - "Again" (আবার দেখুন), "Hard" (কঠিন), "Good" (মোটামুটি), "Easy" (সহজ) buttons to repeat difficult cards automatically.

---

### 3. Daily Study Streak, XP Level & Achievement Badges (`src/components/StudyStreakTracker.tsx` & `src/components/BadgeSystem.tsx`)
- **Daily Streak Counter**:
  - Track consecutive active study days with streak flames (🔥).
  - Daily micro-challenges (e.g., "Complete 1 Mock Test", "Review 10 Flashcards").
- **XP Progression & Student Tiers**:
  - **Level 1**: Novice Stranger (নবাগত শিক্ষার্থী)
  - **Level 2**: Dedicated Aspirant (মনোযোগী পরীক্ষার্থী)
  - **Level 3**: Subject Specialist (বিষয় বিশেষজ্ঞ)
  - **Level 4**: Board Master (বোর্ড চ্যাম্পিয়ন)
  - **Level 5**: WBCHSE Topper (WBCHSE শীর্ষস্থানাধিকারী)
- **Gamified Badges**:
  - 🧬 **Geneticist**: Score 100% in Genetics questions.
  - 📚 **Sahitya Ratna**: Perfect score in Bengali Prose & Poetry.
  - ⚡ **Speed Blitz**: Complete mock test under 5 minutes with >90% accuracy.
  - 🛡️ **Consistency Shield**: Maintain a 7-day study streak.

---

### 4. WBCHSE Chapter-Wise Question Bank & Model Solutions (`src/components/QuestionBank.tsx`)
- **Searchable, Categorized Repository**:
  - Filter questions by Subject, Chapter, Difficulty (Easy, Medium, Board Exam Level).
  - Mark questions as "Bookmarked" (সংরক্ষিত) for last-minute revision.
- **Bilingual Solution Sheet**:
  - Step-by-step breakdown with key keywords required for WBCHSE evaluation.
  - "Common Traps" (যেখানে সাধারণ ছাত্রছাত্রীরা ভুল করে) warning tips.

---

### 5. Study Stranger Peer Focus Room & Pomodoro Timer (`src/components/PeerFocusRoom.tsx`)
- **Interactive Focus Timer**:
  - 25-minute study sprint + 5-minute break Pomodoro intervals with start/pause/reset controls.
- **Ambient Study Audio**:
  - Built-in atmospheric soundscapes: Kolkata Rain (বৃষ্টির শব্দ), Library Ambience (শান্ত পাঠাগার), White Noise (হোয়াইট নয়েজ).
- **Study Buddy / Stranger Presence**:
  - Virtual study stranger companion avatar displaying "Currently Studying: Genetics Chapter 2" to create motivating accountability.
  - Shared commitment counter: "1,240 Class 12 students are studying right now".

---

### 6. Navigation & Layout Integration
- **Dashboard / App Navigation**:
  - Add quick access cards and tabs in `src/pages/Tools.tsx` and main student navigation for:
    1. 📝 **Mock Tests & Leaderboard**
    2. 🧠 **AI Mistake Analyzer**
    3. 🗂️ **Chapter Flashcards**
    4. 📖 **WBCHSE Question Bank**
    5. ⏳ **Peer Focus Room**
- **Mobile-Responsive & Clean UI**:
  - Smooth bottom navigation or clean drawer for mobile devices.
  - Minimalist, distraction-free styling matching Study Stranger's aesthetic.

---

## Verification Plan

### Automated Verification
- Run `npm run lint` (`lint_applet`): **PASSED** (zero syntax or TypeScript errors).
- Run `compile_applet`: **PASSED** (production bundle built successfully).

### Implementation Status
- [x] **AI Mistake Analyzer & Chapter Weakness Diagnostic** (`src/components/MistakeAnalyzer.tsx`): Integrated into Mock Test results and Mistake Bank with bilingual Bengali/English explanations, weakness breakdown, and re-attempt functionality.
- [x] **Interactive Chapter Flashcards** (`src/components/ChapterFlashcards.tsx`): Spaced repetition revision, 3D flip cards, Web Speech audio, and high-yield WBCHSE Class 12 key points.
- [x] **Daily Study Streak, XP Level & Achievement Badges** (`src/components/StudyStreakTracker.tsx`): Persistent streak counter, daily focus goals, XP leveling, and unlockable student badges.
- [x] **WBCHSE Chapter-Wise Question Bank** (`src/components/QuestionBank.tsx`): Searchable repository with model answers, examiner tips, and common traps.
- [x] **Study Stranger Peer Focus Room** (`src/components/FocusStudyRoom.tsx`): Live peer sync presence strip, Pomodoro intervals, and Web Audio synthesizer soundscapes.
- [x] **Dashboard & Navigation Integration** (`src/pages/Dashboard.tsx`, `src/pages/AppShell.tsx`, `src/pages/Tools.tsx`): Integrated seamless routing and quick access pills.
