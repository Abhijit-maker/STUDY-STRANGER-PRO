# Android Native Migration Guide (GPT-6 Astra Study App)

This document contains the prompt and instructions you need to give to Google IDX (or any other AI assistant) to convert this React web application into a **100% Native Android App** using **Kotlin and Jetpack Compose**.

## How to use this:
1. Export this project to GitHub.
2. Open the GitHub repository in Google IDX.
3. Open a new AI chat in IDX and paste the **"Prompt for Google IDX"** section below.

---

## 📋 PROMPT FOR GOOGLE IDX (Copy & Paste this)

```text
Hello Jules/IDX! I have a React/Vite web application codebase that I want to completely rewrite into a 100% Native Android Application. I do NOT want a WebView wrapper or Capacitor. I want a pure Native Android app built with Kotlin and Jetpack Compose.

Here is the context of my current app:
- **App Name:** GPT-6 Astra Premium Study App (WBCHSE)
- **Architecture:** It's an AI-powered study companion with an interactive 3D avatar (Anjali), voice interaction, MCQ testing, flashcards, a Pomodoro focus room, and a PDF Notice Board.
- **Current Stack:** React, Tailwind CSS, Three.js (React Three Fiber), @google/genai SDK.

Please initialize a new Android Gradle project (Jetpack Compose) and port the entire functionality over. 
DO NOT REMOVE ANY FEATURES. Everything must work exactly as it does in the web version.

**Crucial Migration Requirements:**

1. **UI & Navigation (Jetpack Compose):**
   - Translate all Tailwind CSS designs into Jetpack Compose `Modifier` equivalents. Keep the "Astra Pro Premium" dark luxury aesthetic (Dark background, Starlight Silver accents, Glassmorphism using `Modifier.background(Brush.linearGradient(...))`).
   - Implement bottom navigation or a Compose Navigation graph for routing between the Dashboard, MCQ Bank, Focus Room, Flashcards, and Notice Board.

2. **3D Avatar & Rendering (Filament / Sceneform):**
   - The web app uses Three.js. You MUST implement the 3D Anime School Girl (Anjali) using Google's **Filament** engine or **Sceneview/Sceneform** for Android.
   - The 3D model must be fully rigged and respond to programmatic commands (Dance, Laugh, Cry, Run, Walk, Talk) via Kotlin.
   - Ensure the cinematic lighting and post-processing (Bloom, Depth of Field) are replicated in the native 3D engine.

3. **Live Voice Interaction (Speech-to-Text & Text-to-Speech):**
   - Replace the browser's `SpeechRecognition` with Android's native `SpeechRecognizer` API.
   - Replace `speechSynthesis` with Android's native `TextToSpeech` (TTS) engine.
   - Maintain the logic that listens to user speech and extracts commands (e.g., if the user says "dance", trigger the 3D dance animation; if they say "aste bolo", slow down the TTS speed).

4. **Gemini/GPT-6 Astra API Integration:**
   - Use the official Google AI client SDK for Android (`com.google.ai.client.generativeai:generativeai`) to handle all LLM calls.
   - The API key should be securely handled, preferably via DataStore or EncryptedSharedPreferences (from the user settings hub).

5. **Local Database & Storage (Room):**
   - The web app uses local storage for memory, scores, and flashcard progress. You MUST implement a **Room Database** in Android to persistently store all user data (Memory Vault, MCQ Scores, Settings).

6. **Audio & Pomodoro (ExoPlayer/MediaPlayer):**
   - Use Android's `MediaPlayer` or `ExoPlayer` to handle the Binaural Beats and Focus Music in the Focus Room and Audio Booster sections.

Please start by setting up the `build.gradle.kts` files with all necessary dependencies (Compose, Room, Generative AI SDK, Sceneview/Filament, Navigation), and then generate the core `MainActivity.kt` and `DashboardScreen.kt`. Make sure every single feature is preserved!
```
