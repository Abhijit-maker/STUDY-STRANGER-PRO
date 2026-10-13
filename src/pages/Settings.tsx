import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  Sparkles, 
  ShieldCheck, 
  Save, 
  RotateCcw, 
  ExternalLink, 
  User, 
  BookOpen, 
  Activity, 
  Play, 
  Square,
  HelpCircle,
  Copy,
  Check,
  Globe
} from "lucide-react";
import { voiceService } from "../services/voiceService";
import { soundEffects } from "../services/soundEffectsService";
import { db, auth, doc, getDoc, setDoc } from "../firebase";
import { USER } from "../data.js";
import GoogleSetupGuideModal from "../components/GoogleSetupGuideModal";

export default function Settings() {
  const nav = useNavigate();

  // API Key State
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("gemini_api_key") || 
           localStorage.getItem("custom_gemini_api_key") || 
           localStorage.getItem("ss-gemini-key") || "";
  });
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyStatus, setVerifyStatus] = useState<{
    tested: boolean;
    valid: boolean;
    latencyMs?: number;
    message?: string;
  }>({ tested: false, valid: false });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Voice AI Configuration
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    return localStorage.getItem("pref_voice_character") || "mahi";
  });
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(() => {
    const s = localStorage.getItem("pref_voice_rate");
    return s ? parseFloat(s) : 1.15;
  });
  const [isEmotionalPersona, setIsEmotionalPersona] = useState<boolean>(() => {
    return localStorage.getItem("pref_voice_persona") !== "false";
  });
  const [isPlayingSample, setIsPlayingSample] = useState<boolean>(false);
  const [isGoogleGuideOpen, setIsGoogleGuideOpen] = useState<boolean>(false);

  // Student Profile
  const [displayName, setDisplayName] = useState<string>(() => {
    return localStorage.getItem("currentUserName") || USER.name || "Abhijit";
  });
  const [district, setDistrict] = useState<string>(() => {
    return localStorage.getItem("userDistrict") || "Kolkata";
  });
  const [targetGoal, setTargetGoal] = useState<string>(() => {
    return localStorage.getItem("userTargetGoal") || "95%+ Board Score";
  });

  // Real-time Cloud Stats
  const [cloudStats, setCloudStats] = useState({
    points: parseInt(localStorage.getItem("ss_student_xp") || "0", 10),
    streak: parseInt(localStorage.getItem("ss_study_streak") || "0", 10),
    mistakesCount: 0,
    firestoreConnected: false
  });

  useEffect(() => {
    // Count saved mistakes in localStorage
    try {
      const savedM = localStorage.getItem("study_stranger_mistakes_v1");
      if (savedM) {
        const parsed = JSON.parse(savedM);
        setCloudStats(prev => ({ ...prev, mistakesCount: Array.isArray(parsed) ? parsed.length : 0 }));
      }
    } catch {}

    // Fetch real-time user stats from Firestore
    if (auth.currentUser?.uid) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      getDoc(userRef).then((snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setCloudStats(prev => ({
            ...prev,
            points: typeof d.points === "number" ? d.points : prev.points,
            streak: typeof d.streak === "number" ? d.streak : prev.streak,
            firestoreConnected: true
          }));
        } else {
          setCloudStats(prev => ({ ...prev, firestoreConnected: true }));
        }
      }).catch(() => {
        setCloudStats(prev => ({ ...prev, firestoreConnected: false }));
      });
    } else {
      setCloudStats(prev => ({ ...prev, firestoreConnected: true }));
    }
  }, []);

  // Verify API Key via server endpoint
  const handleVerifyKey = async () => {
    const clean = apiKey.trim();
    if (!clean) {
      setVerifyStatus({
        tested: true,
        valid: false,
        message: "দয়া করে প্রথমে আপনার Gemini API Key ইনপুট করুন।"
      });
      return;
    }

    setIsVerifying(true);
    setVerifyStatus({ tested: false, valid: false });

    try {
      const res = await fetch("/api/settings/verify-apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: clean })
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        soundEffects.play("correct");
        setVerifyStatus({
          tested: true,
          valid: true,
          latencyMs: data.latencyMs,
          message: `ভেরিফিকেশন সফল! লেটেন্সি: ${data.latencyMs}ms (Gemini 2.5/3.8 Flash সক্রিয়)`
        });
      } else {
        soundEffects.play("incorrect");
        setVerifyStatus({
          tested: true,
          valid: false,
          message: data.error || "API Key ভেরিফাই করা যায়নি। অনুগ্রহ করে কি সঠিক আছে কিনা যাচাই করুন।"
        });
      }
    } catch (err: any) {
      soundEffects.play("incorrect");
      setVerifyStatus({
        tested: true,
        valid: false,
        message: "সার্ভারের সাথে সংযোগে সমস্যা হয়েছে।"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Save Settings & Sync API Key
  const handleSaveAllSettings = async () => {
    soundEffects.play("click");
    const cleanKey = apiKey.trim();

    // 1. Save to LocalStorage across all standard keys
    if (cleanKey) {
      localStorage.setItem("gemini_api_key", cleanKey);
      localStorage.setItem("custom_gemini_api_key", cleanKey);
      localStorage.setItem("ss-gemini-key", cleanKey);
    } else {
      localStorage.removeItem("gemini_api_key");
      localStorage.removeItem("custom_gemini_api_key");
      localStorage.removeItem("ss-gemini-key");
    }

    localStorage.setItem("pref_voice_character", selectedVoice);
    localStorage.setItem("pref_voice_rate", playbackSpeed.toString());
    localStorage.setItem("pref_voice_persona", isEmotionalPersona ? "true" : "false");
    localStorage.setItem("currentUserName", displayName);
    localStorage.setItem("userDistrict", district);
    localStorage.setItem("userTargetGoal", targetGoal);

    voiceService.setPlaybackRate(playbackSpeed);
    voiceService.setVoicePersonaEnabled(isEmotionalPersona);

    // 2. Sync to Backend Server & Linked Telegram Bot
    try {
      await fetch("/api/settings/save-apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: cleanKey,
          firebaseUid: auth.currentUser?.uid || "student-guest",
          username: displayName
        })
      });
    } catch (e) {
      console.warn("Backend API key sync notice:", e);
    }

    // 3. Save profile updates to Firestore if logged in
    if (auth.currentUser?.uid) {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, {
          displayName,
          district,
          targetGoal,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn("Firestore profile save:", e);
      }
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Clear API Key
  const handleClearKey = () => {
    soundEffects.play("click");
    setApiKey("");
    localStorage.removeItem("gemini_api_key");
    localStorage.removeItem("custom_gemini_api_key");
    localStorage.removeItem("ss-gemini-key");
    setVerifyStatus({ tested: false, valid: false });
  };

  // Play Sample Voice Audio
  const handlePlayVoiceSample = () => {
    if (isPlayingSample) {
      voiceService.stop();
      setIsPlayingSample(false);
      return;
    }

    setIsPlayingSample(true);
    const sampleText = selectedVoice === "mahi"
      ? "নমস্কার অভিজিৎ! আমি তোমার মিষ্টি মাহি দিদি। তোমার ক্লাস টুয়েলভ জীববিদ্যা ও বাংলা পরীক্ষার প্রস্তুতি কেমন চলছে?"
      : selectedVoice === "anjali"
      ? "হ্যালো ফ্রেন্ড! আমি অঞ্জলি! আজকে আমরা একসাথে দারুণ পড়াশোনা করব আর বোর্ডে সেরা নম্বর তুলব!"
      : selectedVoice === "rohan"
      ? "হ্যালো দোস্ত! আমি রোহন দাদা। কোনো ডাউট থাকলে নির্ভয়ে জিজ্ঞেস কর, আমরা একসাথে সমাধান করব!"
      : "নমস্কার! আমি স্টাডি স্ট্রেঞ্জার। একাগ্রতার সাথে অধ্যয়ন করো, সাফল্য তোমারই হবে।";

    voiceService.speak(sampleText, {
      character: selectedVoice as any,
      rate: playbackSpeed,
      apiKey: apiKey.trim() || undefined,
      onStart: () => setIsPlayingSample(true),
      onEnd: () => setIsPlayingSample(false),
      onError: () => setIsPlayingSample(false)
    });
  };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "10px 0 60px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="badge-pill" style={{ background: "var(--yellow)", fontSize: 11, padding: "4px 8px" }}>
              ⚙️ Settings & Configuration
            </span>
            <span className="badge-pill" style={{ background: "#dcfce7", color: "#166534", fontSize: 11, padding: "4px 8px" }}>
              🟢 WBCHSE Sem 3
            </span>
          </div>
          <h1 style={{ margin: "4px 0", fontSize: 26, fontFamily: "var(--font-serif)" }}>
            সেটিংস ও এআই কনফিগারেশন (Settings)
          </h1>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
            Google Gemini API Key যুক্ত করুন, এআই ভয়েস ও মেন্টর নির্বাচন করুন এবং রিয়েল-টাইম প্রোফাইল নিয়ন্ত্রণ করুন।
          </p>
        </div>

        <button 
          onClick={() => nav("/app")}
          className="btn btn-ghost btn-sm"
          style={{ borderColor: "var(--line)" }}
        >
          ← ড্যাশবোর্ডে ফিরুন
        </button>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div style={{
          background: "#ecfdf5",
          border: "1.5px solid #10b981",
          borderRadius: 14,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
          color: "#065f46",
          fontSize: 14,
          fontWeight: 600
        }}>
          <CheckCircle2 size={20} color="#10b981" />
          <span>সকল সেটিংস ও Gemini API Key সফলভাবে সেভ হয়েছে! ভয়েস এআই ও সকল টুল তাৎক্ষণিকভাবে নতুন সেটিংসে চালু হবে।</span>
        </div>
      )}

      {/* SECTION 1: GEMINI API KEY CONFIGURATION */}
      <div className="panel" style={{ marginBottom: 24, border: "2px solid var(--ink)", background: "#fff", boxShadow: "4px 4px 0 var(--ink)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--yellow)", border: "1.5px solid var(--ink)", display: "grid", placeItems: "center", fontSize: 20 }}>
              <Key size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontFamily: "var(--font-serif)" }}>
                Google Gemini API Key
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
                ভয়েস এআই, নিউরাল টিটিএস (Voice TTS), ডাউট সলভার এবং টেলিগ্রাম বটের সম্পূর্ণ কোটা নিশ্চিত করতে নিজের কি ব্যবহার করুন
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {apiKey.trim() ? (
              <span className="badge-pill" style={{ background: "#dcfce7", color: "#166534", fontSize: 11, border: "1px solid #86efac" }}>
                ✓ Custom Key Active
              </span>
            ) : (
              <span className="badge-pill" style={{ background: "#fef3c7", color: "#92400e", fontSize: 11, border: "1px solid #fde68a" }}>
                ⚠️ Using System Key
              </span>
            )}
          </div>
        </div>

        {/* Input Field with Show/Hide & Paste */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            আপনার Gemini API Key ইনপুট করুন (Enter Google Gemini API Key):
          </label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setVerifyStatus({ tested: false, valid: false });
                }}
                placeholder="AIzaSy..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 44px 12px 14px",
                  borderRadius: 12,
                  border: "1.5px solid var(--ink)",
                  fontFamily: showKey ? "monospace" : "inherit",
                  fontSize: 14,
                  background: "#fafaf9",
                  outline: "none"
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  padding: 4
                }}
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              onClick={handleVerifyKey}
              disabled={isVerifying || !apiKey.trim()}
              className="btn btn-sm"
              style={{
                background: "var(--lime)",
                border: "1.5px solid var(--ink)",
                color: "var(--ink)",
                whiteSpace: "nowrap",
                height: 44,
                padding: "0 16px"
              }}
            >
              {isVerifying ? "যাচাই হচ্ছে..." : "যাচাই করুন (Test)"}
            </button>

            {apiKey && (
              <button
                onClick={handleClearKey}
                className="btn btn-sm btn-ghost"
                style={{
                  border: "1.5px solid var(--line)",
                  height: 44,
                  padding: "0 14px"
                }}
                title="API Key মুছুন"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--muted)" }}>
            সাধারণত Google API Key <code>AIzaSy</code> দিয়ে শুরু হয় এবং ৩৯ অক্ষরের হয়ে থাকে। এটি আপনার ব্রাউজারের লোকাল স্টোরেজে নিরাপদে সংরক্ষিত থাকে।
          </p>
        </div>

        {/* Verification Status Feedback Box */}
        {verifyStatus.tested && (
          <div style={{
            background: verifyStatus.valid ? "#ecfdf5" : "#fef2f2",
            border: `1.5px solid ${verifyStatus.valid ? "#10b981" : "#ef4444"}`,
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: verifyStatus.valid ? "#065f46" : "#991b1b"
          }}>
            {verifyStatus.valid ? <CheckCircle2 size={18} color="#10b981" /> : <AlertTriangle size={18} color="#ef4444" />}
            <div>
              <strong>{verifyStatus.valid ? "API Key সক্রিয় ও প্রস্তুত!" : "যাচাইকরণ ব্যর্থ:"}</strong>{" "}
              <span>{verifyStatus.message}</span>
            </div>
          </div>
        )}

        {/* Guide: How to get free API key */}
        <div style={{
          background: "var(--bg)",
          border: "1px dashed var(--line)",
          borderRadius: 12,
          padding: "14px 16px",
          marginTop: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={16} color="var(--ink)" />
              কিভাবে বিনামূল্যে Google Gemini API Key পাবেন? (How to get free key)
            </span>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", textDecoration: "underline", display: "flex", alignItems: "center", gap: 4 }}
            >
              Google AI Studio খুলুন <ExternalLink size={12} />
            </a>
          </div>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.6 }}>
            <li><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)", fontWeight: 600 }}>aistudio.google.com</a> লিঙ্কে যান এবং আপনার Google একাউন্ট দিয়ে লগ ইন করুন।</li>
            <li><strong>"Create API key"</strong> বাটনে ক্লিক করুন এবং একটি নতুন প্রজেক্ট সিলেক্ট বা তৈরি করুন।</li>
            <li>উত্পন্ন হওয়া কি-টি কপি করে এনে উপরের ইনপুট বক্সে পেস্ট করুন এবং <strong>"Save All Settings"</strong> বাটনে চাপুন।</li>
            <li>বিনামূল্যে প্রতি মিনিটে ১৫টি রিকোয়েস্ট পাওয়া যায়, যা আপনার সারাদিনের পড়াশোনার জন্য যথেষ্ট!</li>
          </ol>
        </div>
      </div>

      {/* SECTION 2: VOICE AI & MENTOR CONFIGURATION */}
      <div className="panel" style={{ marginBottom: 24, border: "2px solid var(--ink)", background: "#fff", boxShadow: "4px 4px 0 var(--ink)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--pink)", border: "1.5px solid var(--ink)", display: "grid", placeItems: "center", fontSize: 20 }}>
              <Volume2 size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontFamily: "var(--font-serif)" }}>
                AI Voice Tutor & Audio Settings
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
                ভয়েস মেন্টরের চরিত্র, কথা বলার গতি এবং আবেগীয় উচ্চারণ (Emotional Prosody) কাস্টমাইজ করুন
              </p>
            </div>
          </div>

          <button
            onClick={handlePlayVoiceSample}
            className="btn btn-sm"
            style={{
              background: isPlayingSample ? "#fee2e2" : "var(--yellow)",
              color: isPlayingSample ? "#991b1b" : "var(--ink)",
              border: "1.5px solid var(--ink)",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            {isPlayingSample ? <Square size={14} /> : <Play size={14} />}
            {isPlayingSample ? "অডিও বন্ধ করুন" : "কণ্ঠের নমুনা শুনুন (Test Voice)"}
          </button>
        </div>

        {/* Mentor Selection Cards */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            পছন্দের AI মেন্টর নির্বাচন করুন (Select AI Mentor):
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {[
              { id: "mahi", name: "মিষ্টি মাহি দিদি (Mahi)", role: "উষ্ণ ও যত্নশীল দিদি", voice: "Kore (Sweet Female)", icon: "🌸", bg: "#fce7f3" },
              { id: "anjali", name: "অঞ্জলি দিদি (Anjali)", role: "উচ্ছ্বসিত ৩ডি কো-হোস্ট", voice: "Zephyr (Bubbly Female)", icon: "💃", bg: "#fef08a" },
              { id: "rohan", name: "রোহন দাদা (Rohan)", role: "বন্ধুসুলভ তরুণ শিক্ষক", voice: "Puck (Natural Male)", icon: "⚡", bg: "#e0e7ff" },
              { id: "stranger", name: "স্টাডি স্ট্রেঞ্জার (Stranger)", role: "গম্ভীর ও ধৈর্যশীল গাইড", voice: "Fenrir (Deep Male)", icon: "🌌", bg: "#dcfce7" }
            ].map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedVoice(m.id);
                  soundEffects.play("click");
                }}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: selectedVoice === m.id ? "2.5px solid var(--ink)" : "1.5px solid var(--line)",
                  background: selectedVoice === m.id ? m.bg : "#fafaf9",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: selectedVoice === m.id ? "2px 2px 0 var(--ink)" : "none"
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>{m.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2 }}>{m.role}</div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>Voice: {m.voice}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Speed Slider & Persona Toggle */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700 }}>
                কথা বলার গতি (Playback Speed):
              </label>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{playbackSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.05"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "var(--ink)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              <span>ধীর (0.8x)</span>
              <span>স্বাভাবিক (1.15x)</span>
              <span>দ্রুত (1.5x)</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={isEmotionalPersona}
                onChange={(e) => setIsEmotionalPersona(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "var(--ink)" }}
              />
              <span>প্রাকৃতিক মানুষের মত আবেগীয় উচ্চারণ (Emotional Breaths & Tone)</span>
            </label>
            <p style={{ margin: "4px 0 0 28px", fontSize: 11, color: "var(--muted)" }}>
              সক্রিয় থাকলে এআই মেন্টর স্বাভাবিক শ্বাসপ্রশ্বাস, হাসি ও সহানুভূতির সাথে কথা বলবে।
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: STUDENT PROFILE & BOARD PREFERENCES */}
      <div className="panel" style={{ marginBottom: 24, border: "2px solid var(--ink)", background: "#fff", boxShadow: "4px 4px 0 var(--ink)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--teal)", border: "1.5px solid var(--ink)", display: "grid", placeItems: "center", fontSize: 20 }}>
            <User size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontFamily: "var(--font-serif)" }}>
              শিক্ষার্থীর প্রোফাইল ও বোর্ড তথ্য (Student Profile)
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
              WBCHSE সেমিস্টার ৩ পরীক্ষার জন্য আপনার লক্ষ্য ও ব্যক্তিগত বিবরণ
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              আপনার নাম (Student Name):
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Abhijit"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1.5px solid var(--ink)",
                fontSize: 14,
                background: "#fafaf9"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              জেলা / অঞ্চল (District):
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1.5px solid var(--ink)",
                fontSize: 14,
                background: "#fafaf9"
              }}
            >
              <option value="Kolkata">Kolkata (কলকাতা)</option>
              <option value="North 24 Parganas">North 24 Parganas (উত্তর ২৪ পরগনা)</option>
              <option value="South 24 Parganas">South 24 Parganas (দক্ষিণ ২৪ পরগনা)</option>
              <option value="Howrah">Howrah (হাওড়া)</option>
              <option value="Hooghly">Hooghly (হুগলি)</option>
              <option value="Nadia">Nadia (নদীয়া)</option>
              <option value="Murshidabad">Murshidabad (মুর্শিদাবাদ)</option>
              <option value="Purba Bardhaman">Purba Bardhaman (পূর্ব বর্ধমান)</option>
              <option value="Paschim Medinipur">Paschim Medinipur (পশ্চিম মেদিনীপুর)</option>
              <option value="Darjeeling & Siliguri">Darjeeling & Siliguri (শিলিগুড়ি)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              পরীক্ষার লক্ষ্য (Target Board Goal):
            </label>
            <input
              type="text"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              placeholder="95%+ in Sem 3 MCQs"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1.5px solid var(--ink)",
                fontSize: 14,
                background: "#fafaf9"
              }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: REAL-TIME DATA STATS & SYSTEM DIAGNOSTIC */}
      <div className="panel" style={{ marginBottom: 28, border: "2px solid var(--ink)", background: "#fafaf9" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={18} color="var(--ink)" />
            <span style={{ fontWeight: 700, fontSize: 14 }}>রিয়েল-টাইম ডেটা ও ক্লাউড স্টোরেজ স্ট্যাটাস</span>
          </div>

          <span className="badge-pill" style={{ background: cloudStats.firestoreConnected ? "#dcfce7" : "#fee2e2", color: cloudStats.firestoreConnected ? "#166534" : "#991b1b", fontSize: 11 }}>
            {cloudStats.firestoreConnected ? "🟢 Cloud Firestore Connected" : "⚠️ Local Storage Only"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
          <div style={{ background: "#fff", padding: "10px 14px", borderRadius: 12, border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>বর্তমান স্ট্রিক</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>🔥 {cloudStats.streak} দিন</div>
          </div>
          <div style={{ background: "#fff", padding: "10px 14px", borderRadius: 12, border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>অর্জিত XP / Points</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>⚡ {cloudStats.points} pts</div>
          </div>
          <div style={{ background: "#fff", padding: "10px 14px", borderRadius: 12, border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>ভুল উত্তর ব্যাংক</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>🧠 {cloudStats.mistakesCount} টি প্রশ্ন</div>
          </div>
          <div style={{ background: "#fff", padding: "10px 14px", borderRadius: 12, border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>বোর্ড সিলেবাস</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>WBCHSE Sem 3</div>
          </div>
        </div>

        {/* Google OAuth & Hosting Guide Trigger Card */}
        <div style={{
          marginTop: 14,
          padding: "12px 16px",
          background: "#fff",
          borderRadius: 14,
          border: "1.5px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "#fef08a", border: "1px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Globe size={18} color="var(--ink)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>গুগল সাইন বোর্ড ও ফ্রি হোস্টিং সেটআপ গাইড</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>OAuth Consent Screen, Authorized Domains ও Vercel/Firebase Hosting নির্দেশিকা</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsGoogleGuideOpen(true)}
            className="btn btn-dark btn-sm"
            style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}
          >
            <span>🛠️ গাইড ওপেন করুন</span>
          </button>
        </div>
      </div>

      {/* Floating Save Actions Bar */}
      <div style={{
        position: "sticky",
        bottom: 20,
        zIndex: 40,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        padding: "14px 20px",
        borderRadius: 20,
        border: "2px solid var(--ink)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12), 4px 4px 0 var(--ink)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={20} color="#16a34a" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            আপনার সেটিংস তাৎক্ষণিকভাবে সকল পেজ ও টুলে কার্যকর হবে।
          </span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => nav("/app")}
            className="btn btn-ghost btn-sm"
            style={{ border: "1.5px solid var(--line)" }}
          >
            বাতিল করুন (Cancel)
          </button>
          <button
            onClick={handleSaveAllSettings}
            className="btn btn-dark"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 22px" }}
          >
            <Save size={16} />
            <span>সব সেভ করুন (Save All Settings)</span>
          </button>
        </div>
      </div>

      {/* Google Sign Board & Hosting Setup Guide Modal */}
      <GoogleSetupGuideModal
        isOpen={isGoogleGuideOpen}
        onClose={() => setIsGoogleGuideOpen(false)}
      />
    </div>
  );
}
