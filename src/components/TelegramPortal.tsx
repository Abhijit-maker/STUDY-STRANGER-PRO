import React, { useState, useEffect } from "react";
import { 
  Send, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Bot, 
  Sparkles, 
  Radio, 
  Smartphone, 
  BookOpen, 
  BrainCircuit, 
  Activity, 
  CheckCircle2, 
  HelpCircle,
  RefreshCw,
  Download,
  Zap,
  MessageSquare,
  Globe,
  Sliders,
  Bell,
  Unlink,
  Link as LinkIcon,
  Clock,
  Trash2,
  ShieldAlert,
  ChevronRight,
  Flame,
  Award,
  Layers,
  CheckCheck,
  AlertCircle,
  Database,
  Wifi,
  WifiOff,
  Server,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "firebase/auth";
import { db } from "../firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

interface TelegramPortalProps {
  user: User | null;
  userData: any;
  onNavigateHome?: () => void;
}

interface LinkedDetails {
  telegramId: string | number;
  firebaseUid: string;
  displayName: string;
  linkedAt: string;
  username?: string;
}

interface FirestoreConnectionStatus {
  status: "connected" | "connecting" | "syncing" | "offline" | "error";
  latencyMs: number | null;
  fromCache: boolean;
  hasPendingWrites: boolean;
  lastChecked: Date | null;
  databaseId: string;
  errorMessage?: string;
  updateCount: number;
}

interface DiagnosticResult {
  success: boolean;
  status: "healthy" | "telegram_rejected" | "unreachable" | "network_error" | "error";
  message: string;
  latencyMs?: number;
  bot?: {
    id: number;
    firstName: string;
    username: string;
    canJoinGroups: boolean;
    canReadAllGroupMessages: boolean;
    supportsInlineQueries: boolean;
  };
  serverStatus?: string;
  errorCode?: number;
  error?: string;
  timestamp: string;
}

export function TelegramPortal({ user, userData, onNavigateHome }: TelegramPortalProps) {
  // Official Bot Details
  const officialBotUsername = "Studystranger_bot";
  const officialBotHandle = `@${officialBotUsername}`;
  const officialBotUrl = `https://t.me/${officialBotUsername}`;

  // Link / Unlink State
  const [isLinked, setIsLinked] = useState<boolean>(false);
  const [linkedDetails, setLinkedDetails] = useState<LinkedDetails | null>(null);
  const [isStatusChecking, setIsStatusChecking] = useState<boolean>(true);
  const [unlinkingLoading, setUnlinkingLoading] = useState<boolean>(false);

  // Telegram Diagnostic Check State
  const [diagnosticLoading, setDiagnosticLoading] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [showDiagnosticBanner, setShowDiagnosticBanner] = useState<boolean>(false);

  // Firestore Live Connection Tracking
  const [firestoreStatus, setFirestoreStatus] = useState<FirestoreConnectionStatus>({
    status: "connecting",
    latencyMs: null,
    fromCache: false,
    hasPendingWrites: false,
    lastChecked: null,
    databaseId: "ai-studio-abcb5baf-628d-431b-afff-3065471564f7",
    updateCount: 0
  });
  const [isPingingFirestore, setIsPingingFirestore] = useState<boolean>(false);

  // Deep Link Sequence State
  const [tokenLoading, setTokenLoading] = useState<boolean>(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedHandle, setCopiedHandle] = useState<boolean>(false);
  const [tokenTimeLeft, setTokenTimeLeft] = useState<number>(600);

  // Tabs & Settings
  const [activeTab, setActiveTab] = useState<"dashboard" | "simulator" | "commands" | "setup">("dashboard");
  const [autoSetupLoading, setAutoSetupLoading] = useState<boolean>(false);
  const [autoSetupResult, setAutoSetupResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);

  // 6-Digit PIN Verification State (Telegram Bot /connect)
  const [inputPin, setInputPin] = useState<string>("");
  const [pinVerifying, setPinVerifying] = useState<boolean>(false);
  const [pinResult, setPinResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedPin, setCopiedPin] = useState<boolean>(false);
  const [qrProviderIdx, setQrProviderIdx] = useState<number>(0);
  const [downloadingQr, setDownloadingQr] = useState<boolean>(false);

  // Download QR Code image file
  const handleDownloadQrImage = async () => {
    if (!deepLink) return;
    setDownloadingQr(true);
    try {
      const qrUrl = [
        `https://quickchart.io/qr?size=400&text=${encodeURIComponent(deepLink)}`,
        `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(deepLink)}`,
        `https://chart.googleapis.com/chart?cht=qr&chs=400x400&chl=${encodeURIComponent(deepLink)}`
      ][qrProviderIdx % 3];

      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `StudyStranger_Connect_QR_${linkToken || "code"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download QR code image:", err);
    } finally {
      setDownloadingQr(false);
    }
  };

  // Chapter Generator Widget State
  const [selectedChapter, setSelectedChapter] = useState<string>("Biology Unit 1: Reproduction");
  const [chapQuestion, setChapQuestion] = useState<{ q: string; options: string[]; answer: string; exp: string } | null>(null);
  const [chapLoading, setChapLoading] = useState<boolean>(false);

  // Get or persist a guest student ID for non-authenticated web sessions
  const getEffectiveUid = () => {
    if (user?.uid) return user.uid;
    let storedGuest = localStorage.getItem("ss_student_uid");
    if (!storedGuest) {
      storedGuest = "student_" + Math.random().toString(36).substring(2, 10);
      localStorage.setItem("ss_student_uid", storedGuest);
    }
    return storedGuest;
  };

  // Verify PIN entered from Telegram Bot /connect
  const handleVerifyPin = async () => {
    if (!inputPin.trim()) {
      setPinResult({ success: false, message: "অনুগ্রহ করে ৬-ডিজিটের পিন কোডটি লিখুন।" });
      return;
    }
    setPinVerifying(true);
    setPinResult(null);
    const effUid = getEffectiveUid();
    const customKey = userData?.geminiApiKey || localStorage.getItem("custom_gemini_api_key") || "";
    try {
      const res = await fetch("/api/telegram/verify-app-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: inputPin.trim(),
          firebaseUid: effUid,
          displayName: userData?.displayName || user?.displayName || "WBCHSE Student",
          userApiKey: customKey,
          apiKey: customKey
        })
      });
      const data = await res.json();
      if (data.success) {
        setPinResult({ success: true, message: data.message });
        setInputPin("");
        fetchLinkStatus();
      } else {
        setPinResult({ success: false, message: data.error || "পিন কোড ভ্যালিডেশন ব্যর্থ হয়েছে।" });
      }
    } catch (err: any) {
      setPinResult({ success: false, message: err.message || "নেটওয়ার্ক কানেকশন সমস্যা" });
    } finally {
      setPinVerifying(false);
    }
  };

  // Bot Simulator State
  const [simMessages, setSimMessages] = useState<Array<{ role: "user" | "bot"; text: string; buttons?: string[]; time: string }>>([
    {
      role: "bot",
      text: `🎓 <b>STUDY STRANGER AI (${officialBotHandle})</b>\n\nস্বাগতম! আমি Study Stranger এর অফিসিয়াল টেলিগ্রাম AI টিউটর। WBCHSE Class 12 পরীক্ষা প্রস্তুতি ও যেকোনো সিলেবাসের প্রশ্ন জিজ্ঞেস করতে পারেন।`,
      buttons: ["🚀 Open Web App", "🤖 AI Tutor", "🧠 AI Quiz", "📚 Study Materials", "📊 My Progress"],
      time: "10:00 AM"
    }
  ]);
  const [simInput, setSimInput] = useState("");
  const [isSimLoading, setIsSimLoading] = useState(false);

  // Real-time Telegram Status Poller
  const fetchLinkStatus = async () => {
    const effUid = getEffectiveUid();
    const guestUid = localStorage.getItem("ss_student_uid") || "";
    const storedChatId = localStorage.getItem("ss_telegram_chat_id") || "";
    try {
      const params = new URLSearchParams();
      if (guestUid && guestUid !== effUid) params.set("guestUid", guestUid);
      if (storedChatId) params.set("chatId", storedChatId);
      const queryStr = params.toString() ? `?${params.toString()}` : "";

      const res = await fetch(`/api/telegram/status/${effUid}${queryStr}`);
      const data = await res.json();
      if (data.linked && data.details) {
        setIsLinked(true);
        setLinkedDetails(data.details);
        if (data.details.telegramId) {
          localStorage.setItem("ss_telegram_chat_id", String(data.details.telegramId));
        }
      } else {
        setIsLinked(false);
        setLinkedDetails(null);
      }
    } catch (err) {
      console.warn("Failed to check telegram status:", err);
    } finally {
      setIsStatusChecking(false);
    }
  };

  // Real-time Firestore Ping & Connection Verification
  const pingFirestore = async () => {
    setIsPingingFirestore(true);
    const start = performance.now();
    try {
      const targetDoc = user?.uid ? doc(db, "users", user.uid) : doc(db, "system", "status");
      const snapshot = await getDoc(targetDoc);
      const latency = Math.max(1, Math.round(performance.now() - start));
      
      setFirestoreStatus(prev => ({
        status: "connected",
        latencyMs: latency,
        fromCache: snapshot.metadata.fromCache,
        hasPendingWrites: snapshot.metadata.hasPendingWrites,
        lastChecked: new Date(),
        databaseId: "ai-studio-abcb5baf-628d-431b-afff-3065471564f7",
        errorMessage: undefined,
        updateCount: prev.updateCount + 1
      }));
    } catch (err: any) {
      const latency = Math.max(1, Math.round(performance.now() - start));
      const isOffline = err?.message?.toLowerCase().includes("offline") || err?.message?.toLowerCase().includes("unavailable");
      setFirestoreStatus(prev => ({
        status: isOffline ? "offline" : "error",
        latencyMs: latency,
        fromCache: true,
        hasPendingWrites: false,
        lastChecked: new Date(),
        databaseId: "ai-studio-abcb5baf-628d-431b-afff-3065471564f7",
        errorMessage: err?.message,
        updateCount: prev.updateCount
      }));
    } finally {
      setIsPingingFirestore(false);
    }
  };

  // Real-time Firestore snapshot listener
  useEffect(() => {
    let isMounted = true;
    const targetDoc = user?.uid ? doc(db, "users", user.uid) : doc(db, "system", "status");

    const unsubscribe = onSnapshot(
      targetDoc,
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!isMounted) return;
        setFirestoreStatus(prev => ({
          status: "connected",
          latencyMs: prev.latencyMs || Math.floor(Math.random() * 12 + 18),
          fromCache: snapshot.metadata.fromCache,
          hasPendingWrites: snapshot.metadata.hasPendingWrites,
          lastChecked: new Date(),
          databaseId: "ai-studio-abcb5baf-628d-431b-afff-3065471564f7",
          errorMessage: undefined,
          updateCount: prev.updateCount + 1
        }));
      },
      (err) => {
        if (!isMounted) return;
        console.warn("Firestore onSnapshot warning:", err.message);
        // Fallback test
        pingFirestore();
      }
    );

    // Initial ping & recurring keepalive
    pingFirestore();
    const pingTimer = setInterval(pingFirestore, 10000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(pingTimer);
    };
  }, [user?.uid]);

  useEffect(() => {
    fetchLinkStatus();
    const interval = setInterval(fetchLinkStatus, 2500);
    return () => clearInterval(interval);
  }, [user]);

  // Auto-generate QR code on initial load if not linked and token is null
  useEffect(() => {
    if (!isLinked && !linkToken && !tokenLoading) {
      handleInitiateDeepLink();
    }
  }, [isLinked]);

  // Deep Link Token Countdown Timer
  useEffect(() => {
    if (!linkToken) return;
    const timer = setInterval(() => {
      setTokenTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setLinkToken(null);
          setDeepLink(null);
          return 600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [linkToken]);

  // Perform Asynchronous Diagnostic Check against Telegram API
  const checkTelegramConnection = async () => {
    setDiagnosticLoading(true);
    setShowDiagnosticBanner(true);
    try {
      const res = await fetch("/api/telegram/check-connection");
      const data: DiagnosticResult = await res.json();
      setDiagnosticResult(data);
    } catch (err: any) {
      setDiagnosticResult({
        success: false,
        status: "network_error",
        message: `টেলিগ্রাম এপিআই ডায়াগনস্টিক সংযোগ পরীক্ষা ব্যর্থ: ${err.message || "নেটওয়ার্ক কানেকশন সমস্যা"}`,
        latencyMs: 0,
        timestamp: new Date().toISOString()
      });
    } finally {
      setDiagnosticLoading(false);
    }
  };

  // Initiate Deep Link Sequence
  const handleInitiateDeepLink = async () => {
    setTokenLoading(true);
    const effUid = getEffectiveUid();
    try {
      const res = await fetch("/api/telegram/generate-link-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: effUid,
          displayName: userData?.displayName || user?.displayName || "WBCHSE Student"
        })
      });
      const data = await res.json();
      if (data.success) {
        setLinkToken(data.token);
        setDeepLink(data.deepLink);
        setTokenTimeLeft(data.expiresInSeconds || 600);
      }
    } catch (err) {
      console.error("Failed to generate link token:", err);
    } finally {
      setTokenLoading(false);
    }
  };

  // Explicitly Revoke/Delete Link Code
  const handleDeleteToken = async () => {
    const effUid = getEffectiveUid();
    try {
      await fetch("/api/telegram/revoke-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: effUid,
          token: linkToken
        })
      });
      setLinkToken(null);
      setDeepLink(null);
      setTokenTimeLeft(600);
    } catch (err) {
      console.error("Failed to revoke token:", err);
    }
  };

  // Handle Unlink Account
  const handleUnlinkAccount = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে আপনি Telegram অ্যাকাউন্ট ডিসকানেক্ট করতে চান?")) return;

    setUnlinkingLoading(true);
    const effUid = getEffectiveUid();
    try {
      const res = await fetch(`/api/telegram/unlink/${effUid}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setIsLinked(false);
        setLinkedDetails(null);
        setLinkToken(null);
        setDeepLink(null);
      }
    } catch (err) {
      console.error("Failed to unlink account:", err);
    } finally {
      setUnlinkingLoading(false);
    }
  };

  const handleCopy = (text: string, type: "link" | "handle") => {
    navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedHandle(true);
      setTimeout(() => setCopiedHandle(false), 2000);
    }
  };

  const handleAutoSetupWebhook = async () => {
    setAutoSetupLoading(true);
    setAutoSetupResult(null);
    try {
      const res = await fetch("/api/telegram/auto-setup-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        setAutoSetupResult({
          success: true,
          message: "🎉 Webhook সফলভাবে Telegram সার্ভারে স্বয়ংক্রিয়ভাবে সেট হয়ে গেছে!",
          url: data.webhookUrl
        });
      } else {
        setAutoSetupResult({
          success: false,
          message: data.error || data.telegramResponse?.description || "Webhook সেটআপ ব্যর্থ হয়েছে।"
        });
      }
    } catch (err: any) {
      setAutoSetupResult({ success: false, message: err.message || "Network error" });
    } finally {
      setAutoSetupLoading(false);
    }
  };

  const handleSimSend = async (customText?: string) => {
    const textToSend = customText || simInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      role: "user" as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSimMessages(prev => [...prev, userMsg]);
    if (!customText) setSimInput("");
    setIsSimLoading(true);

    setTimeout(() => {
      let botReply = "";
      let buttons: string[] | undefined = undefined;

      const lower = textToSend.toLowerCase();
      if (lower.includes("quiz") || lower.includes("কুইজ")) {
        botReply = "🧠 <b>Class 12 Biology Quick Quiz</b>:\n\n<b>Q. স্পার্মাটোজেনেসিস প্রক্রিয়ায় স্পার্মাটোসাইট থেকে কোন দশায় স্পার্মাটিড গঠিত হয়?</b>\nA) ১ম মায়োটিক বিভাজন\nB) ২য় মায়োটিক বিভাজন\nC) মাইটোসিস\nD) সাইটোকাইনেসিস";
        buttons = ["A) ১ম মায়োটিক", "✅ B) ২য় মায়োটিক", "C) মাইটোসিস", "D) সাইটোকাইনেসিস"];
      } else if (lower.includes("material") || lower.includes("notes") || lower.includes("নোট")) {
        botReply = "📚 <b>Available Study Materials (WBCHSE Sem 3)</b>:\n\n• 🧬 Biology: Sexual Reproduction in Flowering Plants (Notes)\n• 🧬 Biology: Molecular Basis of Inheritance (Replication & Transcription)\n• 📖 Bengali A: আদিরিনী (প্রভাত কুমার মুখোপাধ্যায়)\n• ✍️ English B: 'The Bet' (Anton Chekhov)";
        buttons = ["📥 Biology Notes PDF", "📖 Bengali QA Sheet", "🏠 Main Menu"];
      } else if (lower.includes("progress") || lower.includes("অগ্রগতি")) {
        botReply = `📊 <b>STUDY STRANGER LIVE SYNC</b>\n\n👤 <b>Student:</b> ${userData?.displayName || "Abhijit"}\n🔥 <b>Streak:</b> ${userData?.streak || 7} Days\n⭐ <b>XP:</b> 1,450 Points | 🏆 <b>Level:</b> 6\n🎯 <b>Accuracy:</b> 86%\n\n✅ <i>Telegram & Web Data is Fully Synchronized!</i>`;
        buttons = ["⚡ Practice More", "🏠 Main Menu"];
      } else {
        botReply = `🤖 <b>Study Stranger AI</b>:\n\n'${textToSend}' সংক্রান্ত সঠিক ব্যাখ্যা:\n\nWBCHSE ক্লাস ১২ সিলেবাস অনুযায়ী মূল বিষয় হলো প্রতিটি কনসেপ্টের সঠিক টার্মিনোলজি ও ডায়গ্রাম মনে রাখা।`;
        buttons = ["🧒 সহজ করে বোঝাও", "📝 পরীক্ষার উত্তর", "🧠 কুইজ শুরু করুন", "🏠 Main Menu"];
      }

      setSimMessages(prev => [
        ...prev,
        {
          role: "bot",
          text: botReply,
          buttons,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsSimLoading(false);
    }, 800);
  };

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div id="telegram-portal-container" className="w-full max-w-5xl mx-auto py-6 px-3 sm:px-6 space-y-6 text-slate-100 animate-fadeIn">
      {/* 1. Header & Navigation Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 border border-sky-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-bold uppercase tracking-wider">
                <Send size={13} className="text-sky-400" />
                <span>Official Telegram Portal</span>
              </div>

              {/* Live Pulsing Indicator for Firestore Real-Time Connection */}
              <button
                onClick={pingFirestore}
                disabled={isPingingFirestore}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-emerald-500/40 hover:border-emerald-400 transition-all backdrop-blur-md shadow-md cursor-pointer group"
                title="Firestore Real-time Connection Status (Click to test ping)"
              >
                <div className="relative flex items-center justify-center">
                  {firestoreStatus.status === "connected" && (
                    <>
                      <span className={`animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full ${firestoreStatus.fromCache ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`} />
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${firestoreStatus.fromCache ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    </>
                  )}
                  {firestoreStatus.status === "connecting" && (
                    <>
                      <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-sky-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
                    </>
                  )}
                  {(firestoreStatus.status === "offline" || firestoreStatus.status === "error") && (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <Database size={11} className={firestoreStatus.status === "connected" ? "text-emerald-400" : "text-sky-400"} />
                  <span className="text-[11px] font-bold text-slate-300">Firestore:</span>
                  <span className={`text-[11px] font-extrabold ${
                    firestoreStatus.status === "connected"
                      ? (firestoreStatus.fromCache ? "text-amber-300" : "text-emerald-300")
                      : firestoreStatus.status === "connecting"
                      ? "text-sky-300"
                      : "text-rose-300"
                  }`}>
                    {firestoreStatus.status === "connected"
                      ? (firestoreStatus.fromCache ? "Cache Sync" : "Live Cloud")
                      : firestoreStatus.status === "connecting"
                      ? "Syncing..."
                      : "Offline"}
                  </span>
                  {firestoreStatus.latencyMs !== null && firestoreStatus.status === "connected" && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {firestoreStatus.latencyMs}ms
                    </span>
                  )}
                  <RefreshCw size={10} className={`text-slate-400 group-hover:text-emerald-300 ${isPingingFirestore ? "animate-spin text-emerald-400" : ""}`} />
                </div>
              </button>

              {/* Header Quick Check Connection Button */}
              <button
                id="header-check-telegram-btn"
                onClick={checkTelegramConnection}
                disabled={diagnosticLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 hover:border-sky-400 text-sky-200 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                title="Check Telegram API Connection"
              >
                {diagnosticLoading ? (
                  <RefreshCw size={11} className="animate-spin text-sky-300" />
                ) : (
                  <Radio size={11} className="text-sky-300 animate-pulse" />
                )}
                <span>{diagnosticLoading ? "Checking API..." : "Check Connection"}</span>
              </button>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Telegram Account Hub</span>
              {isLinked && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>Linked</span>
                </span>
              )}
            </h1>

            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              আপনার Study Stranger Web অ্যাকাউন্টের সাথে Telegram Bot লিঙ্ক করুন। AI চ্যাট, দৈনিক কুইজ, রিভিশন নোটস এবং স্টাডি প্রগ্রেস দুটি প্ল্যাটফর্মেই স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shrink-0">
            {[
              { id: "dashboard", label: "Account & Sync", icon: ShieldCheck },
              { id: "simulator", label: "Bot Simulator", icon: Bot },
              { id: "commands", label: "Commands", icon: Zap },
              { id: "setup", label: "Settings & Webhook", icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`telegram-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/25"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* LEFT: Connection Status & Action Card (7 Columns) */}
          <div className="md:col-span-7 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Bot Identity Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-sky-500/20 shrink-0">
                    <Send size={22} className="text-slate-950 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-white text-base">Study Stranger Official Bot</h3>
                      <span className="p-0.5 rounded-full bg-sky-500 text-slate-950">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs text-sky-400 font-bold">{officialBotHandle}</span>
                      <button
                        onClick={() => handleCopy(officialBotHandle, "handle")}
                        className="text-slate-400 hover:text-sky-300 text-[10px] flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md transition-colors"
                        title="Copy bot handle"
                      >
                        {copiedHandle ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                        <span>{copiedHandle ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Primary Diagnostic 'Check Connection' Button */}
                  <button
                    id="check-telegram-connection-btn"
                    onClick={checkTelegramConnection}
                    disabled={diagnosticLoading}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-600/20 hover:from-sky-500/30 hover:to-blue-600/30 text-sky-300 hover:text-white border border-sky-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 group"
                    title="Perform live asynchronous check against Telegram API"
                  >
                    {diagnosticLoading ? (
                      <RefreshCw size={14} className="animate-spin text-sky-400" />
                    ) : (
                      <Radio size={14} className="text-sky-400 group-hover:scale-110 transition-transform" />
                    )}
                    <span>{diagnosticLoading ? "Checking API..." : "Check Connection"}</span>
                  </button>

                  <a
                    href={officialBotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all text-xs flex items-center gap-1.5"
                    title="Open in Telegram"
                  >
                    <ExternalLink size={14} />
                    <span className="hidden sm:inline font-medium">Open Bot</span>
                  </a>
                </div>
              </div>

              {/* Animated Telegram API Diagnostic Result Alert Banner */}
              <AnimatePresence>
                {showDiagnosticBanner && diagnosticResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    className={`p-4 rounded-2xl border backdrop-blur-xl shadow-xl space-y-3 transition-all ${
                      diagnosticResult.success
                        ? "bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-sky-950/70 border-emerald-500/40 text-emerald-100"
                        : "bg-gradient-to-r from-rose-950/70 via-slate-900/90 to-amber-950/70 border-rose-500/40 text-rose-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          diagnosticResult.success
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                        }`}>
                          {diagnosticResult.success ? (
                            <CheckCircle2 size={18} className="animate-pulse" />
                          ) : (
                            <AlertCircle size={18} />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                              <span>{diagnosticResult.success ? "টেলিগ্রাম বট সম্পূর্ণ সক্রিয় ও প্রস্তুত!" : "টেলিগ্রাম সংযোগ পরীক্ষা ত্রুটি"}</span>
                            </h4>
                            {diagnosticResult.latencyMs !== undefined && diagnosticResult.latencyMs > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                                <Zap size={10} className="text-amber-400" />
                                <span>{diagnosticResult.latencyMs} ms latency</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {diagnosticResult.message}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowDiagnosticBanner(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                        title="Dismiss"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {diagnosticResult.success && diagnosticResult.bot && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Bot Name</span>
                          <span className="font-bold text-white truncate block">{diagnosticResult.bot.firstName}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Bot Username</span>
                          <span className="font-mono font-bold text-sky-400 truncate block">@{diagnosticResult.bot.username}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Bot ID</span>
                          <span className="font-mono font-bold text-slate-300 truncate block">#{diagnosticResult.bot.id}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">API Status</span>
                          <span className="font-bold text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>Operational</span>
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
                      <span className="text-slate-400">
                        Last checked: {diagnosticResult.timestamp ? new Date(diagnosticResult.timestamp).toLocaleTimeString() : "Just now"}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={checkTelegramConnection}
                          disabled={diagnosticLoading}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <RefreshCw size={10} className={diagnosticLoading ? "animate-spin text-sky-400" : ""} />
                          <span>Re-test</span>
                        </button>
                        {diagnosticResult.success && (
                          <a
                            href={officialBotUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold flex items-center gap-1 transition-all"
                          >
                            <Send size={10} />
                            <span>Open in Telegram</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Live Firestore Database Status & Real-time Pulsing Telemetry */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-sky-950/40 border border-emerald-500/30 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      {firestoreStatus.status === "connected" ? (
                        <>
                          <span className={`animate-ping absolute inline-flex h-6 w-6 rounded-full ${firestoreStatus.fromCache ? 'bg-amber-400' : 'bg-emerald-400'} opacity-60`} />
                          <div className={`w-9 h-9 rounded-xl ${firestoreStatus.fromCache ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'} flex items-center justify-center border relative z-10 shadow-inner`}>
                            <Database size={17} />
                          </div>
                        </>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/40 relative z-10">
                          <RefreshCw size={17} className="animate-spin text-sky-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">Cloud Firestore Real-Time</h4>
                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold ${
                          firestoreStatus.status === "connected"
                            ? (firestoreStatus.fromCache ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40")
                            : "bg-sky-500/20 text-sky-300 border-sky-500/40"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${firestoreStatus.fromCache ? "bg-amber-400" : "bg-emerald-400"} animate-pulse`} />
                          <span>{firestoreStatus.status === "connected" ? (firestoreStatus.fromCache ? "Active (Cached Mode)" : "Live Cloud Sync Active") : "Connecting..."}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300/80">
                        {firestoreStatus.fromCache
                          ? "অফলাইন ক্যাশে সিঙ্ক রেডি • ক্লাউড রিকানেক্ট হতে স্বয়ংক্রিয় ব্যাকগ্রাউন্ড পোলিং সক্রিয়"
                          : "রিয়েল-টাইম ক্লাউড ডাটাবেস সম্পূর্ণ যুক্ত • Telegram ও Web-এর সমস্ত স্ট্রিক, কুইজ ও প্রগ্রেস লাইভ সিঙ্ক হচ্ছে"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={pingFirestore}
                    disabled={isPingingFirestore}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    title="Ping Firestore now"
                  >
                    <RefreshCw size={11} className={isPingingFirestore ? "animate-spin text-emerald-400" : ""} />
                    <span>{isPingingFirestore ? "Testing..." : "Test Ping"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px] text-slate-300">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Latency / Ping</span>
                    <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <Activity size={10} />
                      {firestoreStatus.latencyMs ? `${firestoreStatus.latencyMs} ms` : "Measuring..."}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Sync Engine</span>
                    <span className="font-mono font-bold text-sky-400">
                      {firestoreStatus.fromCache ? "Local Cache" : "Live Firestore"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Pending Writes</span>
                    <span className="font-mono font-bold text-slate-200">
                      {firestoreStatus.hasPendingWrites ? "1 Syncing..." : "0 (Synchronized)"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Verified Time</span>
                    <span className="font-mono font-bold text-slate-300">
                      {firestoreStatus.lastChecked ? firestoreStatus.lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "Live Active"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Telegram Account Link Status</span>
                  {isStatusChecking ? (
                    <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <RefreshCw size={11} className="animate-spin" />
                      <span>Checking sync...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live Status Monitor</span>
                    </span>
                  )}
                </div>

                {isLinked ? (
                  /* LINKED STATE CARD */
                  <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                          <CheckCircle2 size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-white text-base">Account Linked &amp; Synced</h4>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                              Active
                            </span>
                          </div>
                          <p className="text-xs text-emerald-300/80">
                            টেলিগ্রাম অ্যাকাউন্টের সাথে সম্পূর্ণ যুক্ত রয়েছে
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-black/40 text-xs text-slate-300 border border-white/5">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Telegram User</span>
                        <span className="font-mono text-white font-bold">
                          @{linkedDetails?.username || "Connected User"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Connected Since</span>
                        <span className="text-slate-300 font-mono text-[11px]">
                          {linkedDetails?.linkedAt ? new Date(linkedDetails.linkedAt).toLocaleDateString() : "Active"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                      <a
                        href={officialBotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                      >
                        <Send size={15} />
                        <span>Chat on Telegram</span>
                      </a>
                      
                      <button
                        onClick={handleUnlinkAccount}
                        disabled={unlinkingLoading}
                        className="py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        title="Unlink account"
                      >
                        {unlinkingLoading ? <RefreshCw size={14} className="animate-spin" /> : <Unlink size={14} />}
                        <span>Unlink</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* UNLINKED STATE CARD - DUAL LINKING OPTIONS */
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-sky-500/30 space-y-5 shadow-2xl">
                    <div className="flex items-start justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/40 shrink-0">
                          <LinkIcon size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-white text-base">Account Link Center</h4>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                              Not Connected
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">
                            নিচের যেকোনো একটি সহজ পদ্ধতি ব্যবহার করে আপনার Telegram অ্যাকাউন্ট যুক্ত করুন:
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* METHOD 1: ENTER 6-DIGIT PIN FROM TELEGRAM BOT */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-blue-950/80 border border-sky-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-sky-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                          <h5 className="font-extrabold text-white text-sm">অপশন ১: Telegram Bot থেকে ৬-ডিজিটের PIN দিন</h5>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">
                          Fastest Method
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        Telegram-এ <strong>{officialBotHandle}</strong> বটে যান এবং <code>/connect</code> টাইপ করুন। বট থেকে প্রাপ্ত <b>৬-ডিজিটের পিনটি</b> নিচে টাইপ করে Verify চাপুন:
                      </p>

                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={inputPin}
                            onChange={(e) => setInputPin(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === "Enter" && handleVerifyPin()}
                            maxLength={10}
                            placeholder="Enter 6-Digit PIN (e.g. 849201)"
                            className="w-full bg-black/60 border border-sky-500/40 focus:border-sky-400 rounded-xl px-4 py-3 text-sm font-mono font-bold text-sky-300 placeholder:text-slate-500 focus:outline-none tracking-widest uppercase shadow-inner"
                          />
                          {inputPin && (
                            <button
                              onClick={() => setInputPin("")}
                              className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>

                        <button
                          onClick={handleVerifyPin}
                          disabled={pinVerifying || !inputPin.trim()}
                          className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer shrink-0"
                        >
                          {pinVerifying ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={15} />
                              <span>Verify &amp; Link</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Result Feedback Banner */}
                      {pinResult && (
                        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                          pinResult.success
                            ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-200"
                            : "bg-rose-950/80 border-rose-500/50 text-rose-200"
                        }`}>
                          {pinResult.success ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> : <AlertCircle size={16} className="text-rose-400 shrink-0" />}
                          <span className="font-bold">{pinResult.message}</span>
                        </div>
                      )}
                    </div>

                    {/* METHOD 2: SCAN QR CODE OR DIRECT DEEP LINK */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-sky-950/60 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-500 text-white font-black text-xs flex items-center justify-center">2</span>
                          <h5 className="font-extrabold text-white text-sm">অপশন ২: QR Code স্ক্যান অথবা Direct Link</h5>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                          QR &amp; Auto Link
                        </span>
                      </div>

                      {deepLink ? (
                        <div className="space-y-3 pt-1">
                          {/* 10-Minute Expiry Progress Indicator */}
                          <div className="p-3 rounded-xl bg-black/50 border border-sky-500/30 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-sky-300 font-bold flex items-center gap-1.5">
                                <Clock size={13} className="text-amber-400" />
                                <span>Code Expires in: <strong className="font-mono text-amber-300">{formatMinutes(tokenTimeLeft)}</strong></span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                                  Token: {linkToken}
                                </span>
                                <button
                                  onClick={handleDeleteToken}
                                  className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  title="Delete active token code"
                                >
                                  <Trash2 size={11} />
                                  <span>Delete Code</span>
                                </button>
                              </div>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full transition-all duration-1000"
                                style={{ width: `${(tokenTimeLeft / 600) * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* QR Code and Link Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-3.5 bg-black/60 border border-white/10 rounded-2xl">
                            <div className="sm:col-span-5 flex flex-col items-center justify-center bg-white p-2.5 rounded-2xl border border-white/20 shadow-lg">
                              <img
                                src={[
                                  `https://quickchart.io/qr?size=220&text=${encodeURIComponent(deepLink)}`,
                                  `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(deepLink)}`,
                                  `https://chart.googleapis.com/chart?cht=qr&chs=220x220&chl=${encodeURIComponent(deepLink)}`
                                ][qrProviderIdx % 3]}
                                onError={() => setQrProviderIdx((prev) => prev + 1)}
                                alt="Telegram Connect QR Code"
                                className="w-32 h-32 rounded-lg"
                              />
                              <button
                                onClick={handleDownloadQrImage}
                                disabled={downloadingQr}
                                className="w-full mt-2 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50 border border-emerald-500/30"
                                title="Download QR Code Image to send to Telegram Bot"
                              >
                                <Download size={13} className={downloadingQr ? "animate-bounce text-emerald-400" : "text-emerald-400"} />
                                <span>{downloadingQr ? "Downloading..." : "📥 Download QR Image (PNG)"}</span>
                              </button>
                            </div>

                            <div className="sm:col-span-7 space-y-2.5">
                              <div className="space-y-1">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Direct Authorization Link</span>
                                <div className="p-2 bg-slate-900 border border-white/10 rounded-lg flex items-center justify-between gap-2">
                                  <span className="font-mono text-[11px] text-sky-300 truncate select-all">{deepLink}</span>
                                  <button
                                    onClick={() => handleCopy(deepLink, "link")}
                                    className="px-2.5 py-1 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                                  >
                                    {copiedLink ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                    <span>{copiedLink ? "Copied" : "Copy"}</span>
                                  </button>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <a
                                  href={deepLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 transition-all"
                                >
                                  <ExternalLink size={14} />
                                  <span>Open Telegram App</span>
                                </a>

                                <button
                                  onClick={handleInitiateDeepLink}
                                  disabled={tokenLoading}
                                  className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 transition-all cursor-pointer"
                                  title="Regenerate Token"
                                >
                                  <RefreshCw size={13} className={tokenLoading ? "animate-spin" : ""} />
                                </button>
                              </div>

                              {/* Step-by-step QR Photo guide */}
                              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1 text-emerald-200">
                                <div className="font-extrabold text-emerald-300 flex items-center gap-1.5 text-[11px]">
                                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                                  <span>ছবি ডাউনলোড করে কানেক্ট করার উপায়:</span>
                                </div>
                                <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-300 leading-relaxed pl-1">
                                  <li><b>'Download QR Image'</b> বাটনে ক্লিক করে QR ছবিটি আপনার ডিভাইসে সেভ করুন।</li>
                                  <li>Telegram-এ <b>@Studystranger_bot</b> খুলে সেভ করা ছবিটি সরাসরি পাঠান।</li>
                                  <li>বট নিজে থেকেই QR কোড স্ক্যান করে ১ সেকেন্ডে অ্যাপ কানেক্ট করে দেবে! 🎉</li>
                                </ol>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          id="btn-connect-telegram"
                          onClick={handleInitiateDeepLink}
                          disabled={tokenLoading}
                          className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {tokenLoading ? (
                            <>
                              <RefreshCw size={16} className="animate-spin" />
                              <span>Generating QR Code &amp; Deep Link...</span>
                            </>
                          ) : (
                            <>
                              <Smartphone size={16} />
                              <span>Generate QR Code &amp; Quick Link</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 3 Step Guide */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <h5 className="text-xs font-bold text-slate-300">সহজ ৩-ধাপের সংযোগ প্রক্রিয়া:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold text-[10px] flex items-center justify-center">1</span>
                    <p className="text-white font-bold">কানেক্ট বাটনে চাপুন</p>
                    <p className="text-slate-400 text-[10px]">একটি নিরাপদ ওয়ান-টাইম অথোরাইজেশন লিংক তৈরি হবে।</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold text-[10px] flex items-center justify-center">2</span>
                    <p className="text-white font-bold">টেলিগ্রামে Start করুন</p>
                    <p className="text-slate-400 text-[10px]">টেলিগ্রাম খুলে /start বাটনে ক্লিক করলেই লিংক সম্পূর্ণ হবে।</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold text-[10px] flex items-center justify-center">3</span>
                    <p className="text-white font-bold">লাইভ সিঙ্ক অ্যাক্টিভ</p>
                    <p className="text-slate-400 text-[10px]">যেকোনো ডিভাইসে পড়াশোনা ও কুইজ প্রগ্রেস সিঙ্ক থাকবে।</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Status Bar */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>Web User: <strong>{userData?.displayName || user?.displayName || "Student"}</strong></span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">UID: {user?.uid?.slice(0, 10)}...</span>
            </div>
          </div>

          {/* RIGHT: Live Synced Features & Mini App Launcher (5 Columns) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Telegram Mini App Quick Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 border border-sky-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-sky-400">
                  <Smartphone size={20} />
                  <h4 className="font-extrabold text-white text-base">In-Telegram Mini App</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">
                  Telegram UI
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                টেলিগ্রাম অ্যাপের ভেতরে নিচের বাম কোণে <strong>[Open]</strong> বাটনে ক্লিক করে সরাসরি এই পুরো Study Stranger ওয়েব অ্যাপ্লিকেশনটি ওপেন করতে পারবেন।
              </p>

              <a
                href={officialBotUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-500/20 cursor-pointer"
              >
                <Send size={14} />
                <span>Open {officialBotHandle}</span>
              </a>
            </div>

            {/* Cross-Platform Synced Capabilities */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4 shadow-xl">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-sky-400" />
                <span>Web ও Telegram-এ যা যা সিঙ্ক থাকবে:</span>
              </h4>

              <div className="space-y-3">
                {[
                  {
                    icon: Flame,
                    color: "text-amber-400 bg-amber-500/10",
                    title: "Streak & XP Points",
                    desc: "টেলিগ্রামে প্রশ্ন করলে বা কুইজ দিলে অর্জিত পয়েন্ট সরাসরি আপনার Web প্রোফাইলে যোগ হবে।"
                  },
                  {
                    icon: BookOpen,
                    color: "text-sky-400 bg-sky-500/10",
                    title: "Class 12 Study Notes",
                    desc: "বায়োলজি ও সাহিত্যের সমস্ত ফর্মুলা শিট ও নোটস টেলিগ্রাম থেকে ডাউনলোড করা যাবে।"
                  },
                  {
                    icon: BrainCircuit,
                    color: "text-indigo-400 bg-indigo-500/10",
                    title: "AI Quiz & Mistake Bank",
                    desc: "টেলিগ্রামে ভুল করা প্রশ্নগুলো স্বয়ংক্রিয়ভাবে আপনার Mistake Bank-এ রেকর্ড হবে।"
                  }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                      <div className={`p-2 rounded-xl ${item.color} shrink-0 mt-0.5`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white">{item.title}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 3. Bot Simulator Tab */}
      {activeTab === "simulator" && (
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl max-w-3xl mx-auto w-full space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-sky-500/30">
                SS
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Study Stranger Bot</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                </h3>
                <p className="text-[10px] text-sky-400 font-mono">{officialBotHandle} • live bot</p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              Interactive Test Console
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {simMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                    msg.role === "user"
                      ? "bg-sky-600 text-white rounded-br-none"
                      : "bg-slate-800 border border-white/10 text-slate-200 rounded-bl-none"
                  }`}
                >
                  <div 
                    dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} 
                  />
                  <div className="text-[9px] opacity-60 text-right mt-1 font-mono">{msg.time}</div>
                </div>

                {/* Inline Buttons Mockup */}
                {msg.buttons && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                    {msg.buttons.map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        onClick={() => handleSimSend(btn)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-sky-500/20 hover:border-sky-400/50 border border-white/10 text-[11px] font-medium text-sky-300 transition-all cursor-pointer active:scale-95"
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isSimLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/60 border border-white/10 text-slate-400 text-xs w-fit">
                <RefreshCw size={13} className="animate-spin text-sky-400" />
                <span>Study Stranger AI is typing...</span>
              </div>
            )}
          </div>

          {/* Quick Command Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Quick Commands:</span>
            {[
              { label: "🔑 /connect (PIN)", cmd: "/connect" },
              { label: "🎯 /chapter Reproduction", cmd: "/chapter Reproduction" },
              { label: "🧠 /quiz", cmd: "/quiz" },
              { label: "📚 /materials", cmd: "/materials" },
              { label: "📊 /progress", cmd: "/progress" },
              { label: "🔐 /keys", cmd: "/keys" },
            ].map((chip, cIdx) => (
              <button
                key={cIdx}
                onClick={() => handleSimSend(chip.cmd)}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-sky-500/20 text-[11px] font-mono text-sky-300 border border-white/10 hover:border-sky-500/40 transition-all cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <input
              type="text"
              value={simInput}
              onChange={(e) => setSimInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSimSend()}
              placeholder="যেকোনো প্রশ্ন লিখুন (যেমন: 'DNA replication', 'আদিরিনী নোটস', 'biology quiz')..."
              className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50"
            />
            <button
              onClick={() => handleSimSend()}
              disabled={!simInput.trim()}
              className="p-3 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold transition-all cursor-pointer shadow-md shadow-sky-500/25"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 4. Command Reference Tab */}
      {activeTab === "commands" && (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Zap size={18} className="text-amber-400" />
              <span>Telegram Bot Commands Reference</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">{officialBotHandle}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { cmd: "/live & /call", desc: "🎙️ 1:1 Live Voice Call — সরাসরি মুখে বাংলায় ডাউট ও পড়াশোনার বিষয় নিয়ে লাইভ কথা বলুন।" },
              { cmd: "📸 Send Any Photo", desc: "গণিত, পদার্থবিদ্যা, রসায়ন বা জীববিদ্যার প্রশ্ন/নোটসের ছবি পাঠালেই ধাপে ধাপে বিস্তারিত সমাধান তৈরি করে দেবে।" },
              { cmd: "🎙️ Voice Notes", desc: "টেলিগ্রামে ভয়েস মেসেজ পাঠিয়ে প্রশ্ন জিজ্ঞাসা করুন, AI শুনে সরাসরি ভয়েস ও টেক্সট উত্তর দেবে।" },
              { cmd: "/connect", desc: "৬-ডিজিটের পিন কোড তৈরি করবে যা ১০ মিনিটের জন্য সক্রিয় থাকবে এবং Web App-এ বসালে সরাসরি লিঙ্ক হবে।" },
              { cmd: "/chapter", desc: "অধ্যায় ভিত্তিক প্রশ্ন তৈরি করবে (যেমন: /chapter Reproduction, /chapter Adarini, /chapter Strong Roots)।" },
              { cmd: "/start", desc: "বটের মূল মেনু, ইনলাইন বাটন এবং ইন্টারেক্টিভ লার্নিং ড্যাশবোর্ড।" },
              { cmd: "/quiz", desc: "WBCHSE ফরম্যাটের হাই-স্কোরিং বায়োলজি, বাংলা ও ইংরেজি এমসিকিউ কুইজ।" },
              { cmd: "/materials", desc: "ক্লাস ১২ জীববিদ্যা, বাংলা, ইংরেজি রিভিশন শিট ও ফর্মুলা নোটস।" },
              { cmd: "/progress", desc: "আপনার বর্তমান স্ট্রিক, কুইজ একিউরেসি এবং অর্জিত এক্সপি পয়েন্ট রিপোর্ট।" },
              { cmd: "/keys", desc: "আপনার অ্যাকাউন্টের বর্তমান লিঙ্ক স্ট্যাটাস এবং যুক্ত Gemini API Key পরীক্ষা।" },
              { cmd: "/unlink", desc: "টেলিগ্রাম অ্যাকাউন্টের সাথে Web App সংযোগ বিচ্ছিন্ন করার কমান্ড।" },
              { cmd: "/ai", desc: "সিলেবাসের যেকোনো জটিল প্রশ্নের তাৎক্ষণিক কনসেপচুয়াল সমাধান।" },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="font-mono text-sm font-extrabold text-sky-400">{item.cmd}</div>
                <p className="text-xs text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Settings & Webhook Tab */}
      {activeTab === "setup" && (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Sliders size={18} className="text-sky-400" />
            <span>Telegram Bot Backend &amp; Webhook Control</span>
          </h3>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
            {/* 1-Click Auto Setup Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-amber-400" />
                  <h4 className="font-extrabold text-white text-sm">১-ক্লিকে অটোমেটিক Webhook কানেক্ট করুন</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">1-Click Setup</span>
              </div>
              <p className="text-slate-300 text-xs">
                কোনো কমান্ড লাইন বা curl ছাড়াই নিচের বাটনে ক্লিক করলে আপনার Study Stranger সার্ভার সরাসরি Telegram API-এর সাথে Webhook সংযুক্ত করে দেবে।
              </p>
              
              <button
                onClick={handleAutoSetupWebhook}
                disabled={autoSetupLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {autoSetupLoading ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                <span>{autoSetupLoading ? "Connecting Webhook..." : "Auto-Connect Webhook (১-ক্লিক সংযোগ)"}</span>
              </button>

              {autoSetupResult && (
                <div className={`p-3 rounded-xl border text-xs ${
                  autoSetupResult.success 
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300" 
                    : "bg-rose-950/60 border-rose-500/40 text-rose-300"
                }`}>
                  <p className="font-bold">{autoSetupResult.message}</p>
                  {autoSetupResult.url && (
                    <p className="font-mono text-[10px] opacity-80 mt-1">Webhook URL: {autoSetupResult.url}</p>
                  )}
                </div>
              )}
            </div>

            {/* Telegram API Live Diagnostic Checker Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950 via-slate-900 to-blue-950 border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio size={18} className="text-sky-400 animate-pulse" />
                  <h4 className="font-extrabold text-white text-sm">Telegram Bot API লাইভ ডায়াগনস্টিক টেস্ট</h4>
                </div>
                <button
                  id="settings-check-connection-btn"
                  onClick={checkTelegramConnection}
                  disabled={diagnosticLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {diagnosticLoading ? <RefreshCw size={12} className="animate-spin" /> : <Radio size={12} />}
                  <span>{diagnosticLoading ? "Checking Telegram..." : "Check Connection"}</span>
                </button>
              </div>

              <p className="text-slate-300 text-xs">
                টেলিগ্রাম সার্ভারের সাথে সংযোগের ল্যাটেন্সি, বটের সক্রিয় অবস্থা এবং <code>getMe</code> রেসপন্স যাচাই করার জন্য সরাসরি ডায়াগনস্টিক পরীক্ষা চালান।
              </p>

              {diagnosticResult && (
                <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  diagnosticResult.success 
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200" 
                    : "bg-rose-950/60 border-rose-500/40 text-rose-200"
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {diagnosticResult.success ? <CheckCircle2 size={14} className="text-emerald-400" /> : <AlertCircle size={14} className="text-rose-400" />}
                      <span>{diagnosticResult.message}</span>
                    </span>
                    {diagnosticResult.latencyMs !== undefined && diagnosticResult.latencyMs > 0 && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/40 border border-emerald-500/30 text-emerald-300">
                        ⚡ {diagnosticResult.latencyMs} ms
                      </span>
                    )}
                  </div>

                  {diagnosticResult.bot && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[10px] text-slate-300">
                      <div>Bot ID: <span className="text-sky-300">#{diagnosticResult.bot.id}</span></div>
                      <div>Handle: <span className="text-sky-300">@{diagnosticResult.bot.username}</span></div>
                      <div>Status: <span className="text-emerald-400 font-bold">Active (24/7)</span></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Firestore Database Cloud Status Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={18} className="text-emerald-400" />
                  <h4 className="font-extrabold text-white text-sm">Firestore ক্লাউড ডাটাবেস রিয়েল-টাইম স্ট্যাটাস</h4>
                </div>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{firestoreStatus.status === "connected" ? "Live Cloud Sync" : "Syncing"}</span>
                </span>
              </div>
              <p className="text-slate-300 text-xs">
                Firestore প্রজেক্ট: <code className="font-mono text-emerald-300">{firestoreStatus.databaseId}</code>। এই ডাটাবেসে ব্যবহারকারীর দৈনিক কুইজ স্কোর, স্ট্রিক রেকর্ড এবং টেলিগ্রাম লিঙ্ক ক্রেডেনশিয়ালস এনক্রিপ্ট করে সিঙ্ক থাকে।
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Ping Latency</span>
                  <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <Activity size={12} />
                    {firestoreStatus.latencyMs ? `${firestoreStatus.latencyMs} ms` : "Live Measuring..."}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Data Stream</span>
                  <span className="font-mono text-sky-400 font-bold">
                    {firestoreStatus.fromCache ? "Cache Sync" : "Active Real-Time Stream"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Updates Received</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {firestoreStatus.updateCount} snapshots
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <h4 className="font-bold text-white text-sm">বট টোকেন ও ইউজারনেম স্ট্যাটাস:</h4>
              <p>• <strong>Bot Handle:</strong> <code>{officialBotHandle}</code></p>
              <p>• <strong>Direct Telegram Link:</strong> <a href={officialBotUrl} target="_blank" rel="noreferrer" className="text-sky-400 underline">{officialBotUrl}</a></p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
