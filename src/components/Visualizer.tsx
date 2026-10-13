import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, Sparkles, Volume2, Mic, Brain, Heart, Smile, Zap, Radio, Box, Image as ImageIcon } from "lucide-react";
import mahiAvatar from "../assets/images/mahi_avatar_1780353082547.png";
import { Anjali3DViewer, AnjaliAnimationState } from "./Anjali3DViewer";

type VisualizerState = "idle" | "listening" | "processing" | "speaking";

interface VisualizerProps {
  state: VisualizerState;
  characterName: string;
  currentVisual?: string;
  expression?: string;
  onSelectExpression?: (expr: string) => void;
  anjali3DAnimation?: AnjaliAnimationState;
  onAnjaliAnimationChange?: (anim: AnjaliAnimationState) => void;
  userName?: string;
  userId?: string;
}

const MAHI_EXPRESSION_MAP: Record<string, string> = {
  greeting: "https://i.ibb.co/WWHh1m2V/hay.jpg",
  thinking: "https://i.ibb.co/Mx8HBnh3/thinking.jpg",
  studying: "https://i.ibb.co/Mx8HBnh3/thinking.jpg",
  wink: "https://i.ibb.co/fzg90pKT/wink.jpg",
  teasing: "https://i.ibb.co/fzg90pKT/wink.jpg",
  blush: "https://i.ibb.co/k6zJ0Rby/blush.jpg",
  shy: "https://i.ibb.co/k6zJ0Rby/blush.jpg",
  caring: "https://i.ibb.co/rK9HRgg5/nervous2.jpg",
  sad: "https://i.ibb.co/rK9HRgg5/nervous2.jpg",
  pout: "https://i.ibb.co/rBPqMhQ/pout.jpg",
  smirk: "https://i.ibb.co/VWnmW51k/smirk.jpg",
  heart_eyes: "https://i.ibb.co/mVMvKSpt/heart-eyes.jpg",
  starry_eyes: "https://i.ibb.co/Q7dWVLNg/starry-eyes.jpg",
  nervous: "https://i.ibb.co/LX29jXmW/nervous1.jpg",
  angry: "https://i.ibb.co/23v3Jh0y/angry.jpg",
  hair_swirl: "https://i.ibb.co/BVSHQHBB/hair-swirl.jpg",
  default: "https://i.ibb.co/WWHh1m2V/hay.jpg"
};

export default function Visualizer({ 
  state, 
  characterName, 
  currentVisual, 
  expression,
  onSelectExpression,
  anjali3DAnimation,
  onAnjaliAnimationChange,
  userName = "Student",
  userId
}: VisualizerProps) {
  const isAnjali = characterName.toLowerCase() === "anjali";
  const [use3DMode, setUse3DMode] = useState<boolean>(false);

  // Double-buffering state to guarantee ZERO flicker or white gaps on image changes
  const [displayedSrc, setDisplayedSrc] = useState<string>(() => {
    return currentVisual || mahiAvatar;
  });
  const [nextSrc, setNextSrc] = useState<string | null>(null);
  const [isNextLoaded, setIsNextLoaded] = useState<boolean>(false);
  const [showMoodTray, setShowMoodTray] = useState<boolean>(false);

  // Preload all expression images once in background memory cache
  useEffect(() => {
    Object.values(MAHI_EXPRESSION_MAP).forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  // Determine target image source based on character and visual url
  const getTargetAvatar = () => {
    const char = characterName.toLowerCase();
    if (char === "mahi") {
      if (currentVisual) return currentVisual;
      if (expression && MAHI_EXPRESSION_MAP[expression.toLowerCase()]) {
        return MAHI_EXPRESSION_MAP[expression.toLowerCase()];
      }
      return mahiAvatar;
    }
    const avatarMapping: Record<string, string> = {
      stranger: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
      anjali: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
      zoya: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
      khud: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=600&auto=format&fit=crop",
      rohan: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
      ishani: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop"
    };
    return avatarMapping[char] || mahiAvatar;
  };

  const targetAvatar = getTargetAvatar();

  // Smooth double-buffer swap: load nextSrc first, then promote to displayedSrc
  useEffect(() => {
    if (targetAvatar === displayedSrc) return;

    setNextSrc(targetAvatar);
    setIsNextLoaded(false);

    const img = new Image();
    img.src = targetAvatar;
    img.onload = () => {
      setIsNextLoaded(true);
      setDisplayedSrc(targetAvatar);
      setNextSrc(null);
    };
    img.onerror = () => {
      // Fallback safely to mahiAvatar without blank flash
      setDisplayedSrc(mahiAvatar);
      setNextSrc(null);
    };
  }, [targetAvatar, displayedSrc]);

  // Color theme per state
  const getTheme = () => {
    switch (state) {
      case "listening": 
        return { 
          color: "#10b981", 
          glow: "rgba(16, 185, 129, 0.4)", 
          border: "border-emerald-500", 
          ring: "ring-emerald-500/50",
          text: "text-emerald-400",
          label: userName ? `Listening to ${userName}...` : "Listening..."
        };
      case "processing": 
        return { 
          color: "#6366f1", 
          glow: "rgba(99, 102, 241, 0.5)", 
          border: "border-indigo-500", 
          ring: "ring-indigo-500/50",
          text: "text-indigo-400",
          label: "Thinking & Solving..."
        };
      case "speaking": 
        return { 
          color: "#f43f5e", 
          glow: "rgba(244, 63, 94, 0.5)", 
          border: "border-rose-500", 
          ring: "ring-rose-500/50",
          text: "text-rose-400",
          label: "Speaking Realtime..."
        };
      default: 
        return { 
          color: "#EF6D2F", 
          glow: "rgba(239, 109, 47, 0.25)", 
          border: "border-stone-700", 
          ring: "ring-[#EF6D2F]/20",
          text: "text-stone-400",
          label: "Live Partner Ready"
        };
    }
  };

  const theme = getTheme();

  if (isAnjali && use3DMode) {
    return (
      <div className="relative w-full h-full max-w-md flex flex-col items-center justify-center p-2">
        {/* Toggle Mode Button */}
        <div className="absolute top-2 right-4 z-30 flex items-center gap-1.5">
          <button
            onClick={() => setUse3DMode(false)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-[10px] font-bold text-white/80 hover:text-white backdrop-blur-md transition-all shadow-md active:scale-95"
            title="Switch to 2D Photo Mode"
          >
            <ImageIcon size={11} className="text-amber-400" />
            <span>2D Photo</span>
          </button>
        </div>

        <div className="w-full h-full flex items-center justify-center">
          <Anjali3DViewer
            state={state}
            animationState={anjali3DAnimation}
            onAnimationChange={onAnjaliAnimationChange}
            characterName="Anjali"
            isAudioPlaying={state === "speaking"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto select-none px-4 py-2 overflow-hidden">
      {/* 3D Mode Switcher for Anjali in 2D Mode */}
      {isAnjali && !use3DMode && (
        <div className="absolute top-2 right-4 z-30 flex items-center gap-1.5">
          <button
            onClick={() => setUse3DMode(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 text-[10px] font-extrabold shadow-lg shadow-orange-500/25 backdrop-blur-md transition-all active:scale-95"
            title="Switch to Interactive 3D Model"
          >
            <Box size={12} className="text-stone-950" />
            <span>Switch to 3D Anjali 💃</span>
          </button>
        </div>
      )}

      {/* Background Radial Glow */}
      <div 
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-[100px] pointer-events-none transition-all duration-700"
        style={{ backgroundColor: theme.glow }}
      />

      {/* Main Avatar Container */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Central Card with Anti-Fluctuation Fixed Geometry */}
        <div 
          className={`relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[380px] md:h-[380px] rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden border-2 bg-stone-900 shadow-2xl transition-all duration-500 flex items-center justify-center ${theme.border}`}
          style={{ boxShadow: `0 20px 60px ${theme.glow}` }}
        >
          {/* Base Layer: Currently displayed image */}
          <img 
            src={displayedSrc} 
            alt={`${characterName} Partner`}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center select-none"
            onError={(e) => {
              (e.target as HTMLImageElement).src = mahiAvatar;
            }}
          />

          {/* Preloading Buffer Layer: Smooth fade-in overlay when transitioning */}
          {nextSrc && (
            <img 
              src={nextSrc} 
              alt="Transitioning Expression"
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover object-center select-none transition-opacity duration-300 ${
                isNextLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* Cinematic Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-stone-950/20 pointer-events-none" />

          {/* Audio Waveform Equalizer HUD (Floating at bottom inside avatar card) */}
          <div className="absolute bottom-4 inset-x-4 flex flex-col items-center justify-center gap-1.5 pointer-events-none">
            {/* Live Audio Reactive Frequency Bars */}
            <div className="flex items-center gap-1 h-5 px-3 py-1 rounded-full bg-stone-950/70 backdrop-blur-md border border-white/10">
              {[0.4, 0.9, 0.6, 1.0, 0.7, 0.5, 0.8, 0.3].map((heightRatio, i) => (
                <motion.span
                  key={i}
                  animate={
                    state === "speaking" 
                      ? { scaleY: [heightRatio, 1.2, 0.3, heightRatio] }
                      : state === "listening"
                      ? { scaleY: [0.3, 0.8, 0.3] }
                      : { scaleY: 0.25 }
                  }
                  transition={
                    state === "speaking"
                      ? { duration: 0.35 + (i * 0.05), repeat: Infinity, ease: "easeInOut" }
                      : state === "listening"
                      ? { duration: 1.0, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.2 }
                  }
                  className="w-1 h-3 rounded-full"
                  style={{ backgroundColor: theme.color }}
                />
              ))}
              <span className={`text-[9px] font-black font-mono tracking-wider ml-1 uppercase ${theme.text}`}>
                {expression || (state === "idle" ? "READY" : state)}
              </span>
            </div>

            {/* Sub-label */}
            <span className="text-[8px] text-stone-300 font-bold uppercase tracking-[0.2em] drop-shadow-md">
              {characterName} • WBCHSE AI
            </span>
          </div>
        </div>

        {/* Live Audio Status Floating Pill */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 bg-stone-900/90 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-stone-800 shadow-lg">
          <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: theme.color }} />
          <span className="text-xs font-bold text-stone-200">
            {theme.label}
          </span>
          {userId && (
            <span className="px-2 py-0.5 rounded-md bg-stone-800 border border-stone-700/80 text-[10px] font-mono font-semibold text-stone-400">
              UID: {userId.length > 8 ? `${userId.slice(0, 8)}...` : userId}
            </span>
          )}
          {characterName.toLowerCase() === "mahi" && (
            <button
              onClick={() => setShowMoodTray(!showMoodTray)}
              className="ml-1 px-2 py-0.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-[10px] font-extrabold text-stone-300 hover:text-white transition-colors"
            >
              Moods ✨
            </button>
          )}
        </div>

        {/* Interactive Mood Quick-Tester Tray */}
        <AnimatePresence>
          {showMoodTray && characterName.toLowerCase() === "mahi" && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="mt-3 p-2.5 bg-stone-900/95 backdrop-blur-xl border border-stone-800 rounded-2xl shadow-2xl flex flex-wrap items-center justify-center gap-1.5 max-w-sm z-30"
            >
              {[
                { label: "Thinking", id: "thinking", icon: "🤔" },
                { label: "Blush", id: "blush", icon: "😳" },
                { label: "Wink", id: "wink", icon: "😉" },
                { label: "Smirk", id: "smirk", icon: "😏" },
                { label: "Pout", id: "pout", icon: "😤" },
                { label: "Starry", id: "starry_eyes", icon: "🤩" },
                { label: "Heart", id: "heart_eyes", icon: "🥰" },
                { label: "Caring", id: "caring", icon: "🥺" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    if (onSelectExpression) onSelectExpression(m.id);
                    setDisplayedSrc(MAHI_EXPRESSION_MAP[m.id] || mahiAvatar);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-stone-800 hover:bg-[#EF6D2F] text-stone-300 hover:text-white text-[10px] font-bold transition-colors flex items-center gap-1"
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
