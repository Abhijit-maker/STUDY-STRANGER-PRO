import { CharacterType } from "./liveService";
import { playPCM, stopPCM } from "../utils/audioUtils";

export interface VoiceOptions {
  character?: CharacterType;
  rate?: number;
  pitch?: number;
  apiKey?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export interface SpeechRecognitionCallbacks {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  onEnd?: () => void;
  onStart?: () => void;
  lang?: string;
}

class VoiceService {
  private activeAudioSource: AudioBufferSourceNode | null = null;
  private isCurrentlySpeaking = false;
  private recognitionInstance: any = null;
  private currentPlaybackRate = 1.0;
  private isVoicePersonaEnabled = false;
  private isStopping = false;
  private currentSessionId = 0;

  private splitIntoSentences(text: string): string[] {
    if (!text) return [];
    // Split by common delimiters (., ?, !, ;, ।) preserving the punctuation
    const matches = text.match(/[^.!?।?;]+[.!?।?;]*|\s*$/g);
    if (!matches) return [text];
    return matches
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  // Group sentences into chunks of reasonable size for instant synthesis and prefetching
  private chunkTextIntoGroups(text: string): string[] {
    const sentences = this.splitIntoSentences(text);
    const chunks: string[] = [];
    let currentChunk = "";

    for (let sentence of sentences) {
      sentence = sentence.trim();
      if (!sentence) continue;

      if (currentChunk && (currentChunk + " " + sentence).length > 200) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk = currentChunk ? currentChunk + " " + sentence : sentence;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    return chunks;
  }

  constructor() {
    if (typeof window !== "undefined") {
      const savedRate = localStorage.getItem("pref_voice_rate");
      if (savedRate) {
        this.currentPlaybackRate = parseFloat(savedRate) || 1.0;
      }
      this.isVoicePersonaEnabled = localStorage.getItem("pref_voice_persona") === "true";
    }
  }

  public isVoicePersonaActive(): boolean {
    return this.isVoicePersonaEnabled;
  }

  public setVoicePersonaEnabled(enabled: boolean) {
    this.isVoicePersonaEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("pref_voice_persona", enabled.toString());
    }
  }

  public getPlaybackRate(): number {
    return this.currentPlaybackRate;
  }

  public setPlaybackRate(rate: number) {
    this.currentPlaybackRate = rate;
    if (typeof window !== "undefined") {
      localStorage.setItem("pref_voice_rate", rate.toString());
    }
  }

  private getRateForSentiment(text: string): number {
    if (!this.isVoicePersonaEnabled) return this.currentPlaybackRate;
    if (text.includes("[SAD]")) return 0.8;
    if (text.includes("[HAPPY]")) return 1.2;
    return this.currentPlaybackRate;
  }

  /**
   * Cleans raw text for high-fidelity speech synthesis
   * Removes markdown tags, code blocks, LaTeX delimiters, URLs, and excessive punctuation
   */
  public cleanTextForSpeech(raw: string): string {
    if (!raw) return "";
    let clean = raw
      .replace(/```[\s\S]*?```/g, " ") // Remove multi-line code blocks
      .replace(/`[^`]*`/g, " ") // Remove inline code
      .replace(/\$\$[\s\S]*?\$\$/g, " গাণিতিক সমীকরণ ") // Replace LaTeX blocks
      .replace(/\$[^$]*\$/g, " সমীকরণ ") // Replace inline LaTeX
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // Simplify markdown links

    // Strip general HTML but preserve allowed vocal burst tags
    clean = clean.replace(/<([^>]+)>/g, (match, tagName) => {
      const tag = tagName.trim().toLowerCase();
      if (["laugh", "gasp", "breath", "cough", "sigh", "giggle", "yawn", "sob", "snicker", "hmm", "ha"].includes(tag)) {
        return `<${tag}>`;
      }
      return " ";
    });

    clean = clean
      .replace(/[*#_~]/g, "") // Remove bold, italic, heading symbols
      .replace(/https?:\/\/\S+/g, "") // Remove raw URLs
      .replace(/[•\-\–\—]/g, " ") // Replace bullets and dashes
      .replace(/\s+/g, " ") // Collapse whitespace
      .trim();

    return clean;
  }

  /**
   * Universal Speak Engine with a High-Performance Streaming & Prefetching Queue.
   * Splits input text into small conversational sentence groups, synthesizes
   * the first chunk immediately for instant response, and prefetches subsequent chunks
   * in the background while the current chunk plays.
   */
  public async speak(text: string, options: VoiceOptions = {}): Promise<void> {
    this.stop(); // Stops any currently playing audio and increments session id
    
    const session = ++this.currentSessionId;
    const cleaned = this.cleanTextForSpeech(text);
    if (!cleaned) return;

    this.isCurrentlySpeaking = true;
    options.onStart?.();

    const chunks = this.chunkTextIntoGroups(cleaned);
    if (chunks.length === 0) {
      this.isCurrentlySpeaking = false;
      options.onEnd?.();
      return;
    }

    // Start recursive playback queue
    this.speakQueue(session, chunks, 0, options, null);
  }

  /**
   * Recursive prefetching playback queue executor ensuring zero-overlap and ultra-low latency
   */
  private async speakQueue(
    sessionId: number,
    chunks: string[],
    index: number,
    options: VoiceOptions,
    preFetchedAudio: string | null = null
  ): Promise<void> {
    if (sessionId !== this.currentSessionId) return;
    if (index >= chunks.length) {
      this.isCurrentlySpeaking = false;
      options.onEnd?.();
      return;
    }

    const currentText = chunks[index];
    let audioBase64 = preFetchedAudio;

    const effectiveApiKey = options.apiKey || (typeof window !== "undefined" ? (localStorage.getItem("gemini_api_key") || localStorage.getItem("custom_gemini_api_key") || localStorage.getItem("ss-gemini-key") || "") : "");

    // 1. Synthesize current chunk if not already pre-fetched
    if (!audioBase64) {
      try {
        const res = await fetch("/api/ai/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: currentText,
            character: options.character || "stranger",
            apiKey: effectiveApiKey || undefined
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.audioBase64) {
            audioBase64 = data.audioBase64;
          }
        }
      } catch (err) {
        console.warn("[VoiceService] Chunk synthesis failed, falling back to Web Speech", err);
      }
    }

    // Check if user interrupted during synthesis
    if (sessionId !== this.currentSessionId) return;

    // 2. Pre-fetch the NEXT chunk in background *while* playing current chunk
    let nextFetchPromise: Promise<string | null> | null = null;
    if (index + 1 < chunks.length) {
      const nextText = chunks[index + 1];
      nextFetchPromise = (async () => {
        try {
          const res = await fetch("/api/ai/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: nextText,
              character: options.character || "stranger",
              apiKey: effectiveApiKey || undefined
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.audioBase64) {
              return data.audioBase64;
            }
          }
        } catch {}
        return null;
      })();
    }

    // 3. Play current chunk audio
    if (audioBase64) {
      try {
        const rate = this.getRateForSentiment(currentText);
        await playPCM(audioBase64, rate);
      } catch (playErr) {
        console.error("[VoiceService] playPCM error:", playErr);
      }
    } else {
      // Direct Web Speech synthesis fallback for this chunk
      await new Promise<void>((resolve) => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(currentText);
          utterance.rate = (options.rate || this.currentPlaybackRate) * 0.95;
          utterance.pitch = options.pitch || (options.character === "mahi" ? 1.15 : options.character === "rohan" ? 1.05 : 1.0);
          
          const voices = window.speechSynthesis.getVoices();
          const bnVoice = voices.find(v => 
            v.lang.toLowerCase().startsWith("bn") || 
            v.name.toLowerCase().includes("bengali") || 
            v.name.toLowerCase().includes("bangla")
          );
          if (bnVoice && /[\u0980-\u09FF]/.test(currentText)) {
            utterance.voice = bnVoice;
            utterance.lang = bnVoice.lang;
          }
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          window.speechSynthesis.speak(utterance);
        } else {
          resolve();
        }
      });
    }

    // Check if user interrupted during playback
    if (sessionId !== this.currentSessionId) return;

    // 4. Wait for next pre-fetched chunk and recurse
    const nextAudio = nextFetchPromise ? await nextFetchPromise : null;
    this.speakQueue(sessionId, chunks, index + 1, options, nextAudio);
  }

  /**
   * Stop any active audio playback immediately and cancel pending queue
   */
  public stop(): void {
    this.currentSessionId++; // Invalidate current speech session queue
    this.isCurrentlySpeaking = false;
    if (typeof window !== "undefined") {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
    stopPCM();
    if (this.activeAudioSource) {
      try {
        this.activeAudioSource.stop();
      } catch {}
      this.activeAudioSource = null;
    }
  }

  public isSpeaking(): boolean {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      return this.isCurrentlySpeaking || window.speechSynthesis.speaking;
    }
    return this.isCurrentlySpeaking;
  }

  /**
   * Web Speech Recognition (Mic Voice Input)
   */
  public isRecognitionSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public startRecognition(callbacks: SpeechRecognitionCallbacks): () => void {
    if (!this.isRecognitionSupported()) {
      callbacks.onError?.(new Error("Speech recognition not supported on this browser."));
      return () => {};
    }

    this.stopRecognition();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    this.recognitionInstance = recognition;

    // Use Bengali or user language preference
    recognition.lang = callbacks.lang || (navigator.language.startsWith("bn") ? "bn-IN" : "en-IN");
    recognition.continuous = true;
    recognition.interimResults = true;
    let manualStop = false;

    recognition.onstart = () => {
      callbacks.onStart?.();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        callbacks.onResult(finalTranscript.trim(), true);
      } else if (interimTranscript) {
        callbacks.onResult(interimTranscript.trim(), false);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.warn("[VoiceService] Speech Recognition notice:", event.error);
        callbacks.onError?.(event);
      }
    };

    recognition.onend = () => {
      if (!manualStop && this.recognitionInstance) {
        try {
          recognition.start();
          return;
        } catch (e) {}
      }
      this.recognitionInstance = null;
      callbacks.onEnd?.();
    };

    try {
      recognition.start();
    } catch (startErr) {
      console.warn("[VoiceService] Error starting recognition:", startErr);
    }

    return () => {
      manualStop = true;
      this.stopRecognition();
    };
  }

  public stopRecognition(): void {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch {}
      this.recognitionInstance = null;
    }
  }
}

export const voiceService = new VoiceService();
