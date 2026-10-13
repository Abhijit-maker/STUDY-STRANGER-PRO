import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Coffee, 
  Brain, 
  Headphones, 
  Flame, 
  BookOpen, 
  Award,
  Bell
} from "lucide-react";
import confetti from "canvas-confetti";
import { db, auth, collection, doc, setDoc, onSnapshot, query, limit } from "../firebase";

interface FocusStudyRoomProps {
  onClose: () => void;
  userName?: string;
  onVoiceSync?: () => void;
}

type SoundType = "rain" | "cafe" | "lofi" | "whitenoise" | "forest" | "none";

export const FocusStudyRoom: React.FC<FocusStudyRoomProps> = ({ 
  onClose, 
  userName = "Abhijit",
  onVoiceSync 
}) => {
  // Timer modes: 25m Focus (Pomodoro), 5m Short Break, 15m Long Break, 45m Deep Study
  const [timerMode, setTimerMode] = useState<"focus" | "shortBreak" | "longBreak" | "deepStudy">("focus");
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [activeSound, setActiveSound] = useState<SoundType>("lofi");
  const [soundVolume, setSoundVolume] = useState<number>(0.6);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [focusSubject, setFocusSubject] = useState<string>("Biology (Unit I: Reproduction)");
  const [realPeers, setRealPeers] = useState<any[]>([]);

  // Real-time Firestore sync: Subscribe to active peer study sessions
  useEffect(() => {
    try {
      const q = query(collection(db, "focus_sessions"), limit(25));
      const unsub = onSnapshot(q, (snapshot) => {
        const peers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setRealPeers(peers);
      }, (err) => {
        console.warn("Focus sessions sync notice:", err);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Focus room error:", e);
    }
  }, []);

  // Broadcast current user's session when timer starts/stops
  useEffect(() => {
    const studentName = auth.currentUser?.displayName || userName || "Abhijit";
    const studentUid = auth.currentUser?.uid || `peer-${studentName.replace(/\s+/g, "")}`;
    const sessionRef = doc(db, "focus_sessions", studentUid);

    if (isRunning) {
      setDoc(sessionRef, {
        userId: studentUid,
        userName: studentName,
        subject: focusSubject,
        status: timerMode.includes("Break") ? "On Break" : "Deep Focus",
        lastPing: new Date().toISOString()
      }, { merge: true }).catch(err => console.warn(err));
    } else {
      setDoc(sessionRef, {
        status: "Paused",
        lastPing: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    }
  }, [isRunning, focusSubject, timerMode, userName]);

  // Web Audio Synthesizer for Ambient Focus Sounds (Rain, Binaural Beats, Cafe murmur)
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<any[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lofiChordTimerRef = useRef<any>(null);

  // Safe gesture-driven AudioContext initialization
  const ensureAudioContext = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  };

  const stopAllAudioNodes = () => {
    if (lofiChordTimerRef.current) {
      clearInterval(lofiChordTimerRef.current);
      lofiChordTimerRef.current = null;
    }
    activeNodesRef.current.forEach(node => {
      try {
        node.stop?.();
        node.disconnect();
      } catch (e) {}
    });
    activeNodesRef.current = [];
  };

  // Initialize or update ambient synthesized background sound
  useEffect(() => {
    stopAllAudioNodes();

    if (activeSound === "none" || isAudioMuted) {
      if (gainNodeRef.current && audioContextRef.current) {
        try {
          gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.05);
        } catch (e) {}
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.value = soundVolume * 0.18;
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (activeSound === "rain") {
        // Soft Monsoon rain pink noise with lowpass filter
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 850;
        noise.connect(filter);
        filter.connect(masterGain);
        noise.start();
        activeNodesRef.current.push(noise, filter, masterGain);
      } else if (activeSound === "lofi") {
        // Relaxing Lo-Fi Study Chords + Soft Binaural Alpha sub-tone
        const subOsc = ctx.createOscillator();
        subOsc.type = "sine";
        subOsc.frequency.value = 108; // Deep warm base
        const subGain = ctx.createGain();
        subGain.gain.value = 0.08;
        subOsc.connect(subGain);
        subGain.connect(masterGain);
        subOsc.start();
        activeNodesRef.current.push(subOsc, subGain);

        // Chord progression: Cmaj7 (261.6, 329.6, 392, 493.88), Am7 (220, 261.6, 329.6, 392), Fmaj7 (174.6, 220, 261.6, 329.6)
        const chords = [
          [261.63, 329.63, 392.00, 493.88], // Cmaj7
          [220.00, 261.63, 329.63, 392.00], // Am7
          [174.61, 220.00, 261.63, 329.63], // Fmaj7
          [196.00, 246.94, 293.66, 349.23]  // G7
        ];
        let chordIdx = 0;

        const playChord = () => {
          if (!audioContextRef.current || isAudioMuted) return;
          const currentChord = chords[chordIdx % chords.length];
          chordIdx++;
          currentChord.forEach(freq => {
            try {
              const osc = ctx.createOscillator();
              const oscGain = ctx.createGain();
              osc.type = "triangle";
              osc.frequency.setValueAtTime(freq, ctx.currentTime);
              
              // Smooth gentle fade envelope
              oscGain.gain.setValueAtTime(0.001, ctx.currentTime);
              oscGain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.6);
              oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.8);

              const filter = ctx.createBiquadFilter();
              filter.type = "lowpass";
              filter.frequency.value = 600;

              osc.connect(filter);
              filter.connect(oscGain);
              oscGain.connect(masterGain);

              osc.start();
              osc.stop(ctx.currentTime + 4.0);
            } catch (e) {}
          });
        };

        playChord();
        lofiChordTimerRef.current = setInterval(playChord, 4200);
      } else if (activeSound === "whitenoise") {
        // Binaural Alpha waves (8Hz difference for alpha focus)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = "sine";
        osc2.type = "triangle";
        osc1.frequency.value = 216;
        osc2.frequency.value = 224; // 8Hz binaural difference (Alpha focus)
        
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 350;

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(masterGain);

        osc1.start();
        osc2.start();
        activeNodesRef.current.push(osc1, osc2, filter, masterGain);
      } else if (activeSound === "forest" || activeSound === "cafe") {
        // Peaceful Solfeggio 528Hz / 174Hz calm harmony
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 528; // Transformation & Clarity tone
        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.05;
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        activeNodesRef.current.push(osc, oscGain, masterGain);
      }
    } catch (e) {
      console.warn("Ambient sound error:", e);
    }

    return () => {
      stopAllAudioNodes();
    };
  }, [activeSound, isAudioMuted, soundVolume]);

  const handleSelectSound = (sound: SoundType) => {
    ensureAudioContext();
    if (activeSound === sound && !isAudioMuted) {
      setIsAudioMuted(true);
    } else {
      setIsAudioMuted(false);
      setActiveSound(sound);
    }
  };

  const handleToggleMute = () => {
    ensureAudioContext();
    setIsAudioMuted(!isAudioMuted);
  };

  // Handle timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
      if (timerMode === "focus" || timerMode === "deepStudy") {
        setCompletedSessions((prev) => prev + 1);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerMode]);

  const setMode = (mode: "focus" | "shortBreak" | "longBreak" | "deepStudy") => {
    setTimerMode(mode);
    setIsRunning(false);
    if (mode === "focus") setTimeLeft(25 * 60);
    else if (mode === "shortBreak") setTimeLeft(5 * 60);
    else if (mode === "longBreak") setTimeLeft(15 * 60);
    else if (mode === "deepStudy") setTimeLeft(45 * 60);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const totalModeDuration = 
    timerMode === "focus" ? 25 * 60 : 
    timerMode === "shortBreak" ? 5 * 60 : 
    timerMode === "longBreak" ? 15 * 60 : 45 * 60;
  
  const progressPercent = ((totalModeDuration - timeLeft) / totalModeDuration) * 100;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2.5 sm:p-6 bg-stone-950/85 backdrop-blur-2xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-gradient-to-b from-[#1c1917] to-[#0c0a09] text-stone-100 rounded-3xl sm:rounded-[2.5rem] border border-stone-800 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[88dvh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800/80 flex items-center justify-between bg-stone-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EF6D2F]/20 text-[#EF6D2F] flex items-center justify-center font-bold">
              <Flame size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Quantum Focus Study Room
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EF6D2F] text-white font-bold tracking-widest uppercase">
                  v3.5
                </span>
              </h2>
              <p className="text-xs text-stone-400 font-medium">
                Deep immersive Pomodoro session for {userName} • WBCHSE Sem 3
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-stone-900/80 rounded-2xl border border-stone-800/60">
            {[
              { id: "focus", label: "25m Focus", icon: <Brain size={14} /> },
              { id: "deepStudy", label: "45m Deep Study", icon: <BookOpen size={14} /> },
              { id: "shortBreak", label: "5m Break", icon: <Coffee size={14} /> },
              { id: "longBreak", label: "15m Recharge", icon: <Sparkles size={14} /> },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  timerMode === m.id
                    ? "bg-[#EF6D2F] text-white shadow-lg shadow-[#EF6D2F]/30"
                    : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Target Subject Selector */}
          <div className="bg-stone-900/50 p-3.5 rounded-2xl border border-stone-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-stone-800 text-indigo-400">
                <BookOpen size={16} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Target Exam Subject</span>
                <p className="text-xs font-extrabold text-white">{focusSubject}</p>
              </div>
            </div>
            <select
              value={focusSubject}
              onChange={(e) => setFocusSubject(e.target.value)}
              className="w-full sm:w-auto bg-stone-800 text-stone-200 text-xs font-semibold px-3 py-2 rounded-xl border border-stone-700 focus:outline-none focus:border-[#EF6D2F]"
            >
              <option value="Biology (Unit I: Reproduction)">Biology: Unit I (Reproduction & Flowering Plants)</option>
              <option value="Biology (Unit II: Genetics & Evolution)">Biology: Unit II (DNA, Transcription, Mendel)</option>
              <option value="Bengali A (আদিরিনী & বাঙ্গালা ভাষা)">Bengali A: আদিরিনী & বাঙ্গালা ভাষা</option>
              <option value="Bengali A (ধর্ম & দিগ্বিজয়ের রূপকথা)">Bengali A: ধর্ম & দিগ্বিজয়ের রূপকথা</option>
              <option value="English B (The Night Train at Deoli)">English B: The Night Train at Deoli (Bond)</option>
              <option value="English B (Strong Roots & The Bet)">English B: Strong Roots & The Bet</option>
              <option value="English B (Ulysses & Our Casuarina Tree)">English B: Ulysses & Our Casuarina Tree</option>
              <option value="English B (Riders to the Sea)">English B: Riders to the Sea</option>
            </select>
          </div>

          {/* Live Peer Study Stranger Presence Bar (Real-Time Firestore Sync) */}
          <div className="bg-stone-900/70 p-3.5 rounded-2xl border border-stone-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-white text-[11px] sm:text-xs">
                  Study Stranger Live Room: {realPeers.length > 0 ? (
                    <span><strong className="text-emerald-400">{realPeers.length} জন সহপাঠী</strong> অনলাইনে লাইভ ফোকাস করছেন</span>
                  ) : (
                    <span>লাইভ ডেটাবেস সক্রিয় • টাইমার চালু করে প্রথম পড়াশোনা শুরু করুন</span>
                  )}
                </span>
              </div>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Firestore
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
              {/* Current Student's live card */}
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 shrink-0 text-left">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-xs text-white font-bold shadow-xs">
                  🎓
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-300 block leading-tight">{userName || "Abhijit"} (You)</span>
                  <span className="text-[9px] text-stone-300 block leading-tight">{isRunning ? "Deep Focus" : "Ready"}</span>
                </div>
              </div>

              {/* Other real-time peers connected via Firestore */}
              {realPeers
                .filter(p => p.userName !== userName && p.userId !== auth.currentUser?.uid)
                .map((peer, pIdx) => (
                  <div 
                    key={peer.id || pIdx} 
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-stone-800/90 border border-stone-700/60 shrink-0 text-left"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs text-white font-bold shadow-xs">
                      ⚡
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-white block leading-tight">{peer.userName || "Student"}</span>
                      <span className="text-[9px] text-stone-400 block leading-tight">{peer.subject || peer.status || "Studying"}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Big Circular Timer Display */}
          <div className="flex flex-col items-center justify-center py-4 relative">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
              {/* Animated Progress Ring SVG */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="text-stone-800"
                  strokeWidth="5"
                  stroke="currentColor"
                  fill="transparent"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="text-[#EF6D2F]"
                  strokeWidth="5"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  initial={false}
                  transition={{ duration: 0.5, ease: "linear" }}
                />
              </svg>

              {/* Center Digital Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-4xl sm:text-5xl font-black text-white tracking-tighter drop-shadow-md">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#EF6D2F] mt-1">
                  {isRunning ? (timerMode.includes("Break") ? "Relaxing..." : "Deep Focus") : "Paused"}
                </span>
                <span className="text-[10px] text-stone-400 mt-1">
                  {completedSessions} {completedSessions === 1 ? "session" : "sessions"} finished today
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-6">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRunning(!isRunning)}
                className={`px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl transition-all ${
                  isRunning 
                    ? "bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700" 
                    : "bg-[#EF6D2F] hover:bg-[#ff7a3b] text-white shadow-[#EF6D2F]/30"
                }`}
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                <span>{isRunning ? "Pause" : "Start Focus"}</span>
              </motion.button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  setMode(timerMode);
                }}
                title="Reset Timer"
                className="w-12 h-12 rounded-2xl bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors border border-stone-700"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>

          {/* Ambient Soundscapes Section */}
          <div className="bg-stone-900/60 p-4 rounded-3xl border border-stone-800/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-stone-300">
                <Headphones size={16} className="text-[#EF6D2F]" />
                <span className="text-xs font-bold">ফোকাস মিউজিক ও ব্যাকগ্রাউন্ড সাউন্ড (Binaural & Lo-Fi)</span>
                {activeSound !== "none" && !isAudioMuted && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" title="শব্দ সক্রিয়" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1 rounded-xl">
                  <span className="text-[10px] text-stone-400 font-bold">ভলিউম:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => {
                      ensureAudioContext();
                      setSoundVolume(parseFloat(e.target.value));
                    }}
                    className="w-16 h-1 accent-[#EF6D2F] cursor-pointer"
                  />
                </div>
                <button
                  onClick={handleToggleMute}
                  className="px-2.5 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {isAudioMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-[#EF6D2F]" />}
                  <span>{isAudioMuted ? "আনমিউট" : "মিউট"}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: "lofi", label: "Lo-Fi Study Beats", icon: "🎵" },
                { id: "rain", label: "শান্ত বর্ষা (Rain)", icon: "🌧️" },
                { id: "forest", label: "শালবন (Zen)", icon: "🍃" },
                { id: "whitenoise", label: "আলফা ওয়েভ (8Hz)", icon: "🧠" },
                { id: "none", label: "নিস্তব্ধ (Mute)", icon: "🔇" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSound(s.id as any)}
                  className={`p-2.5 rounded-2xl text-center flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer active:scale-95 ${
                    activeSound === s.id && !isAudioMuted
                      ? "bg-[#EF6D2F]/20 border-[#EF6D2F] text-white shadow-md shadow-[#EF6D2F]/20 ring-1 ring-[#EF6D2F]"
                      : "bg-stone-800/60 border-stone-700/50 text-stone-400 hover:text-stone-200 hover:border-stone-600"
                  }`}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-[10px] font-bold leading-tight">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Voice Mentor Sync Advice */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-stone-900/60 to-stone-900/40 p-4 rounded-3xl border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Need Live Explanation?</p>
                <p className="text-[11px] text-stone-400">Ask Mahi or Stranger Mentor for 1-minute key concept breakdown</p>
              </div>
            </div>
            {onVoiceSync && (
              <button
                onClick={() => {
                  onClose();
                  onVoiceSync();
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-indigo-600/30"
              >
                Talk to AI
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
