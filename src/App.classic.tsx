import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Mic, 
  MicOff, 
  Loader2, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  Send, 
  Trash2, 
  BookOpen, 
  Layout, 
  MessageSquare, 
  History,
  PenTool as BoardIcon, 
  User as UserIcon, 
  Settings, 
  X, 
  Sparkles, 
  Camera, 
  CameraOff, 
  Brain,
  LogIn,
  LogOut,
  Calendar,
  Bot,
  Clock,
  Shield,
  Calculator,
  Cpu,
  Check,
  ArrowLeft,
  ArrowRight,
  Target,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Phone,
  PhoneCall,
  PhoneOff,
  Coins,
  Eye,
  EyeOff,
  Monitor,
  Tablet,
  Smartphone,
  Download,
  Lock,
  Mail,
  CheckCircle2,
  XCircle,
  Key,
  Bell,
  BellRing,
  Menu
} from "lucide-react";
import { AdsCenter } from "./components/AdsCenter";
import { StudyAdvantage } from "./components/StudyAdvantage";
import { MockTest } from "./components/MockTest";
import { MockTestConfig, MCQQuestion } from "./types";
import { getStrangerResponse, getStrangerAudio, resetStrangerSession, generateStudyMaterial, generateMockTestQuestions, syncMemoriesFromFirestore, syncConversationToFirestore, loadConversationFromFirestore } from "./services/geminiService";
import { AIMemoryVault } from "./components/AIMemoryVault";
import { processCommand } from "./services/commandService";
import { LiveSessionManager, CharacterType } from "./services/liveService";
import Visualizer from "./components/Visualizer";
import { AnjaliAnimationState } from "./components/Anjali3DViewer";
import PermissionModal from "./components/PermissionModal";
import { LandingPage } from "./components/LandingPage";
import { AppSplashScreen } from "./components/AppSplashScreen";
import { AppLoadingScreen } from "./components/AppLoadingScreen";
import { soundEffects } from "./services/soundEffectsService";
import { TypewriterText } from "./components/TypewriterText";
import { StudyTools } from "./components/StudyTools";
import { MathSolver } from "./components/MathSolver";
import { CinematicBackground } from "./components/CinematicBackground";
import { Syllabus } from "./components/Syllabus";
import { LiveBoard, BoardElement } from "./components/LiveBoard";
import { ActionLog } from "./components/ActionLog";
import { Paintbrush, Palette } from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { UserProfileModal } from "./components/UserProfileModal";
import { ThemeSelectorModal } from "./components/ThemeSelectorModal";
import { themeService } from "./services/themeService";
import { DoubtSolver } from "./components/DoubtSolver";
import { MistakeBank } from "./components/MistakeBank";
import { RevisionCards } from "./components/RevisionCards";
import { PerformanceInsights } from "./components/PerformanceInsights";
import { SmartScanner } from "./components/SmartScanner";
import { ResourceLibrary } from "./components/ResourceLibrary";
import { MindMap } from "./components/MindMap";
import { VirtualDialer, ActiveCallScreen } from "./components/VirtualPhone";
import mahiAvatar from "./assets/images/mahi_avatar_1780353082547.png";
import { SpeedBlitz } from "./components/SpeedBlitz";
import { StrangerLeaderboard } from "./components/StrangerLeaderboard";
import { TopicExplorer } from "./components/TopicExplorer";
import { AppBuildDocsModal } from "./components/AppBuildDocsModal";
import { FocusStudyRoom } from "./components/FocusStudyRoom";
import { TelegramPortal } from "./components/TelegramPortal";
import { QuestionBankQuiz } from "./components/QuestionBankQuiz";
import { voiceService } from "./services/voiceService";
import { nativeService } from "./services/nativeService";
import { FlashcardDeck } from "./components/FlashcardDeck";
import { NoticeBoardModal } from "./components/NoticeBoardModal";
import { AdminPanelModal } from "./components/AdminPanelModal";
import { AIExamAutopsyModal } from "./components/AIExamAutopsyModal";
import { PrintableMockPDFModal } from "./components/PrintableMockPDFModal";
import { VoiceMCQQuizModal } from "./components/VoiceMCQQuizModal";
import { FriendQuizDuelModal } from "./components/FriendQuizDuelModal";
import { FormulaStickyDiaryModal } from "./components/FormulaStickyDiaryModal";
import { KidsModeDashboard } from "./components/KidsModeDashboard";
import { BlockedUserScreen } from "./components/BlockedUserScreen";
import { MaintenanceScreen } from "./components/MaintenanceScreen";
import { ExamBoosterHub } from "./components/ExamBoosterHub";
import { PremiumNotificationToast } from "./components/PremiumNotificationToast";
import { NotificationCenterModal } from "./components/NotificationCenterModal";
import { notificationService, StudyNotification } from "./services/notificationService";
import { AndroidPermissionModal } from "./components/AndroidPermissionModal";
import { AndroidPermissionService } from "./services/androidPermissionService";
import { NotificationPermissionModal } from "./components/NotificationPermissionModal";
import { MobileQuickActionsSheet } from "./components/MobileQuickActionsSheet";
import { SettingsModal } from "./components/SettingsModal";
import { EducationProfileCard } from "./components/EducationProfileCard";
import { ExamPreparationEngine } from "./components/ExamPreparationEngine";
import { AppHeader } from "./components/AppHeader";
import { ApiKeyPromptModal } from "./components/ApiKeyPromptModal";
import { StudentOnboardingModal } from "./components/StudentOnboardingModal";
import { AccountabilityVigilanceModal } from "./components/AccountabilityVigilanceModal";
import { ScienceLab3D } from "./components/ScienceLab3D";
import { HelpAndSupportModal } from "./components/HelpAndSupportModal";
import { auth, googleProvider, db, signInWithPopup, signOut, onAuthStateChanged, collection, query, where, getDocs, orderBy, limit, onSnapshot, setDoc, doc, getDoc, addDoc, updateDoc, OperationType, handleFirestoreError, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "./firebase";
import { motion, AnimatePresence } from "motion/react";
import { Timestamp } from "firebase/firestore";
import { playPCM } from "./utils/audioUtils";

type AppState = "idle" | "listening" | "processing" | "speaking";
type MobileTab = "mentor" | "board" | "tools";
type AppView = "dashboard" | "active";

interface ChatMessage {
  id: string;
  sender: "user" | "stranger";
  text: string;
}

// Automatic device type detector
const detectDeviceType = (): "desktop" | "tablet" | "android" => {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  const ua = navigator.userAgent.toLowerCase();
  
  const isMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
  const isTabletUA = /ipad|tablet|(android(?!.*mobile))/i.test(ua) || (navigator.maxTouchPoints > 1 && /macintosh/.test(ua));

  if (isTabletUA || (width >= 640 && width <= 1024)) {
    return "tablet";
  }
  if (isMobileUA || width < 640) {
    return "android";
  }
  return "desktop";
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const isMaintenanceActive = true; // Hardcoded globally to lock the application for non-admin users
  const isAdminUser = user?.isAdmin || (user?.email && user.email.toLowerCase() === "jhhh47943@gmail.com");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSplashDone, setIsSplashDone] = useState(true);
  const [appState, setAppState] = useState<AppState>("idle");
  const [activeTab, setActiveTab] = useState<MobileTab>("mentor");
  const [currentView, setCurrentView] = useState<"dashboard" | "active">("dashboard");
  
  // Interface mode: 'auto' (automatically adapts based on device viewport) or explicit manual lock
  const [prefMode, setPrefMode] = useState<"auto" | "desktop" | "tablet" | "android">(() => {
    const saved = localStorage.getItem("pref_interface_type");
    if (saved === "auto" || saved === "desktop" || saved === "tablet" || saved === "android") return saved;
    return "auto";
  });

  const [detectedType, setDetectedType] = useState<"desktop" | "tablet" | "android">(() => detectDeviceType());

  // Window resize & device orientation listener for automatic adaptation
  useEffect(() => {
    const handleResize = () => {
      setDetectedType(detectDeviceType());
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // Effective interface type based on auto detection or user preference
  const interfaceType: "desktop" | "tablet" | "android" = prefMode === "auto" ? detectedType : prefMode;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef(messages);

  const [loginError, setLoginError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginInput, setLoginInput] = useState(() => {
    try {
      const saved = localStorage.getItem("remembered_creds");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          username: parsed.username || parsed.email || "",
          password: parsed.password || ""
        };
      }
    } catch (e) {}
    return { username: "", password: "" };
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegApiKey, setShowRegApiKey] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    apiKey: "",
    reason: ""
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAdsCenter, setShowAdsCenter] = useState(false);
  const [showStudyAdvantage, setShowStudyAdvantage] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showBuildDocs, setShowBuildDocs] = useState(false);
  const [showExamPrepEngine, setShowExamPrepEngine] = useState(false);
  const [isKidsMode, setIsKidsMode] = useState<boolean>(() => {
    return localStorage.getItem("pref_kids_mode") === "true";
  });
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showHelpSupportModal, setShowHelpSupportModal] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(() => {
    return notificationService.getHistory().filter(n => !n.read).length;
  });

  // Direct 1:1 Live Voice / Board Access Without Login (Guest Mode)
  const handleStartGuestLiveMode = () => {
    const guestUser = {
      uid: "guest_" + Date.now().toString(36),
      displayName: "Abhijit (Guest)",
      email: "guest@studystranger.app",
      points: 250,
      streak: 1,
      role: "student",
      status: "active",
      isGuest: true
    };
    setUser(guestUser as any);
    setShowAuthForm(false);
    setCurrentView("active");
    setActiveTab("board");
    setIsBoardExpanded(true);
    soundEffects.playStartupChime();
  };

  // Enhanced Voice & Speech Synthesis States
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voicePlaybackSpeed, setVoicePlaybackSpeed] = useState<number>(() => voiceService.getPlaybackRate());
  const [isAudioSpeaking, setIsAudioSpeaking] = useState(false);

  // Track unread notifications count
  useEffect(() => {
    const updateUnread = () => {
      setUnreadNotificationsCount(notificationService.getHistory().filter(n => !n.read).length);
    };
    const unsubscribe = notificationService.subscribe(() => {
      updateUnread();
    });
    return () => unsubscribe();
  }, []);

  // Handle URL deep-linking and Service Worker messages (from PWA notifications or shortcuts)
  useEffect(() => {
    const handleUrlParams = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const action = params.get('action');
        const openParam = params.get('open');
        if (openParam === 'live_board' || openParam === 'live' || params.get('guest') === 'true') {
          handleStartGuestLiveMode();
        }
        if (action) {
          if (action === 'mock_test' || action === 'show_mock') setShowMockTest(true);
          else if (action === 'live_mentor' || action === 'live_board') {
            handleStartGuestLiveMode();
          }
          else if (action === 'help' || action === 'support') setShowHelpSupportModal(true);
          else if (action === 'doubt' || action === 'show_doubt') setShowDoubtSolver(true);
          else if (action === 'revision' || action === 'show_revision') setShowRevisionCards(true);
          else if (action === 'show_notifications') setShowNotificationCenter(true);
          else if (action === 'show_notices') setShowNoticeBoard(true);

          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      } catch (err) {
        console.debug('URL params parse error:', err);
      }
    };

    handleUrlParams();
    window.addEventListener('popstate', handleUrlParams);

    if ('serviceWorker' in navigator) {
      const handleSWMessage = (event: MessageEvent) => {
        if (event.data?.type === 'NAVIGATE_TO' && event.data?.url) {
          try {
            const parsed = new URL(event.data.url, window.location.origin);
            const action = parsed.searchParams.get('action');
            if (action === 'mock_test') setShowMockTest(true);
            else if (action === 'live_mentor') setShowDialer(true);
            else if (action === 'show_notifications') setShowNotificationCenter(true);
          } catch (_) {}
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
      return () => {
        window.removeEventListener('popstate', handleUrlParams);
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      };
    }

    return () => window.removeEventListener('popstate', handleUrlParams);
  }, []);

  const handleNotificationAction = (notif: StudyNotification) => {
    if (notif.actionUrl) {
      if (notif.actionUrl.includes('mock_test')) setShowMockTest(true);
      else if (notif.actionUrl.includes('live_mentor')) setShowDialer(true);
      else if (notif.actionUrl.includes('doubt')) setShowDoubtSolver(true);
      else if (notif.actionUrl.includes('revision')) setShowRevisionCards(true);
      else if (notif.actionUrl.includes('show_notifications')) setShowNotificationCenter(true);
    }
    notificationService.markAsRead(notif.id);
    setUnreadNotificationsCount(notificationService.getHistory().filter(n => !n.read).length);
  };

  // Capture Chrome PWA Install Prompt & ShortCut trigger
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredInstallPrompt(null);
        setIsAppInstalled(true);
      }
    } else {
      alert("To install / create shortcut on Chrome:\n\n1. Click Chrome's 3-dot menu (⋮) at top-right\n2. Select 'Install Study Stranger' or 'Save and share' -> 'Create shortcut...'\n3. Check 'Open as window' for standalone app experience!");
    }
  };

  const steps = [
    { id: 1, title: "Identity", sub: "Let's get to know you", icon: <UserIcon size={24} /> },
    { id: 2, title: "Access", sub: "Create your unique handle", icon: <Shield size={24} /> },
    { id: 3, title: "Sync", sub: "Connect your AI power", icon: <Cpu size={24} /> },
    { id: 4, title: "Goal", sub: "Focus your training", icon: <Target size={24} /> }
  ];

  // Helper to determine day (light/white) vs night (dark/black)
  const getAutoIsDark = () => {
    const hour = new Date().getHours();
    return hour < 6 || hour >= 18; // 6:00 PM to 6:00 AM is night (dark), daytime is clean white
  };

  // Theme Preference: "auto" (default: white in day, black in night) | "light" (always white) | "dark" (always black)
  const [themePreference, setThemePreference] = useState<"auto" | "light" | "dark">(() => {
    const saved = localStorage.getItem("theme_preference");
    if (saved === "light" || saved === "dark" || saved === "auto") return saved;
    return "auto"; // Default auto: white in day, black at night!
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme_preference") || "auto";
    if (saved === "light") return false;
    if (saved === "dark") return true;
    return getAutoIsDark();
  });

  // Cycle through: auto -> light -> dark -> auto
  const cycleThemePreference = () => {
    let next: "auto" | "light" | "dark" = "auto";
    if (themePreference === "auto") next = "light";
    else if (themePreference === "light") next = "dark";
    else if (themePreference === "dark") next = "auto";

    setThemePreference(next);
    localStorage.setItem("theme_preference", next);
    
    let darkActive = false;
    if (next === "light") darkActive = false;
    else if (next === "dark") darkActive = true;
    else darkActive = getAutoIsDark();

    setIsDarkMode(darkActive);
    localStorage.setItem("theme_mode", darkActive ? "dark" : "light");
  };

  const toggleTheme = () => {
    cycleThemePreference();
  };

  // Keep dark/light synchronized based on preference & time
  useEffect(() => {
    const updateThemeState = () => {
      let active = false;
      if (themePreference === "light") active = false;
      else if (themePreference === "dark") active = true;
      else active = getAutoIsDark();
      setIsDarkMode(active);
    };

    updateThemeState();
    const interval = setInterval(updateThemeState, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [themePreference]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [isDarkMode]);

  // Auth Listener
  useEffect(() => {
    // Check localStorage first for custom session
    const savedSession = localStorage.getItem("userSession");
    if (savedSession) {
      try {
        const decoded = JSON.parse(savedSession);
        setUser(decoded);
        if (decoded.geminiApiKey) setCustomApiKey(decoded.geminiApiKey);
      } catch (e) {
        console.error("Session restore failed", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          const userDoc = await getDoc(doc(db, "users", u.uid));
          const isAdminUser = u.email && u.email.toLowerCase() === "jhhh47943@gmail.com";
          if (userDoc.exists()) {
            const data = userDoc.data();
            const isSuspended = (data.status === "suspended" || data.isBlocked) && !isAdminUser;
            const fullUser = {
              uid: u.uid,
              email: u.email || "",
              displayName: isAdminUser ? "Abhijit (Admin)" : (u.displayName || data.displayName || "Stranger"),
              photoURL: u.photoURL || data.photoURL || "",
              ...data,
              status: data.status || (data.isBlocked ? "suspended" : "active"),
              isBlocked: !!(data.isBlocked || data.status === "suspended"),
              isAdmin: isAdminUser ? true : (data.isAdmin || false),
              lastActive: new Date().toISOString()
            };
            setUser(fullUser);
            if (!isSuspended) {
              syncMemoriesFromFirestore(u.uid);
              if (data.geminiApiKey) setCustomApiKey(data.geminiApiKey);
            }
            localStorage.setItem("userSession", JSON.stringify(fullUser));
            localStorage.setItem("isLoggedIn", "true");

            const hasCompletedOnboarding = 
              data.hasCompletedOnboarding ||
              data.educationProfile?.hasCompletedOnboarding ||
              localStorage.getItem(`onboarded_${u.uid}`) === "true" ||
              localStorage.getItem("study_stranger_onboarding_done") === "true";

            if (!hasCompletedOnboarding && !isAdminUser) {
              setShowOnboardingModal(true);
            } else if (!data.geminiApiKey && !localStorage.getItem("gemini_api_key") && !customApiKey) {
              setApiKeyFeatureNotice("");
              setShowApiKeyPrompt(true);
            }

            try {
              await setDoc(doc(db, "users", u.uid), { 
                lastActive: new Date().toISOString(),
                ...(isAdminUser ? { isAdmin: true, username: "abhiyaan963" } : {})
              }, { merge: true });
            } catch (setErr) {
              console.warn("User lastActive update warning:", setErr);
            }
          } else {
            const defaultProfile = {
              uid: u.uid,
              displayName: isAdminUser ? "Abhijit (Admin)" : (u.displayName || "Stranger"),
              email: u.email || "",
              photoURL: u.photoURL || "",
              points: isAdminUser ? 9999 : 0,
              streak: isAdminUser ? 99 : 1,
              status: "active",
              lastActive: new Date().toISOString(),
              isAnonymous: u.isAnonymous || false,
              isAdmin: isAdminUser,
              ...(isAdminUser ? { username: "abhiyaan963" } : {})
            };
            try {
              await setDoc(doc(db, "users", u.uid), defaultProfile, { merge: true });
            } catch (setErr) {
              console.warn("Default profile setDoc warning:", setErr);
            }
            setUser(defaultProfile);
            localStorage.setItem("userSession", JSON.stringify(defaultProfile));
            localStorage.setItem("isLoggedIn", "true");
            if (!isAdminUser) {
              setShowOnboardingModal(true);
            } else if (!customApiKey && !localStorage.getItem("gemini_api_key")) {
              setApiKeyFeatureNotice("");
              setShowApiKeyPrompt(true);
            }
          }
        } catch (error) {
          console.warn("Auth observer error, using fallback profile:", error);
          const fallbackProfile = {
            uid: u.uid,
            displayName: u.displayName || "Stranger",
            email: u.email || "",
            photoURL: u.photoURL || "",
            points: 0,
            streak: 1,
            status: "active",
            lastActive: new Date().toISOString(),
            isAnonymous: u.isAnonymous || false
          };
          setUser(fallbackProfile);
          localStorage.setItem("userSession", JSON.stringify(fallbackProfile));
          localStorage.setItem("isLoggedIn", "true");
        }
      } else {
        // If there's no Firebase user, check if we had an admin session or bypass
        const savedSession = localStorage.getItem("userSession");
        if (savedSession) {
          try {
            const decoded = JSON.parse(savedSession);
            if (decoded.isAdmin) {
              setIsAuthReady(true);
              return;
            }
          } catch (e) {}
        }
        setUser(null);
        localStorage.removeItem("userSession");
        localStorage.removeItem("isLoggedIn");
      }
      setIsAuthReady(true);
    });

    // Safety timeout: ensure loading screen never hangs if Firebase auth check is slow
    const safetyTimer = setTimeout(() => {
      setIsAuthReady(true);
    }, 900);

    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  // Real-time Sync (Authenticated Only)
  useEffect(() => {
    if (!user) {
      setResources([]);
      setGlobalActions([]);
      return;
    }

    const resourcesUnsub = onSnapshot(collection(db, "resources"), (snap) => {
      setResources(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    }, (error) => {
      console.warn("Firestore error for resources list, falling back to local:", error);
      setResources([]);
    });

    const actionsQuery = query(collection(db, "actions"), orderBy("timestamp", "desc"), limit(5));
    const actionsUnsub = onSnapshot(actionsQuery, (snap) => {
      setGlobalActions(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    }, (error) => {
      console.warn("Firestore error for actions query, falling back to local:", error);
      setGlobalActions([]);
    });

    return () => {
      resourcesUnsub();
      actionsUnsub();
    };
  }, [user]);

  // Real-time sync for logged-in student's own account status/info
  useEffect(() => {
    if (!user || user.isAdmin) return;

    const userRef = doc(db, "users", user.uid);
    const unsubUserDoc = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const isSuspended = (data.status === "suspended" || data.isBlocked);
        // Merge updated points/streak/status/isBlocked into user state
        setUser((prev: any) => {
          if (!prev) return prev;
          const updated = { 
            ...prev, 
            ...data,
            status: data.status || (data.isBlocked ? "suspended" : "active"),
            isBlocked: !!isSuspended
          };
          localStorage.setItem("userSession", JSON.stringify(updated));
          return updated;
        });
      }
    }, (error) => {
      console.warn("User doc subscription error:", error);
    });

    return () => unsubUserDoc();
  }, [user?.uid]);

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);
    setIsSyncing(true);

    const { name, username, password, email, apiKey, reason } = registrationForm;
    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanName) {
      setLoginError("Name kothai? (Please enter name)");
      setRegStep(1);
      setIsSyncing(false);
      return;
    }

    if (!cleanUsername || cleanUsername.length < 3) {
      setLoginError("Username at least 3 characters dorkar!");
      setRegStep(2);
      setIsSyncing(false);
      return;
    }

    if (!cleanPass || cleanPass.length < 6) {
      setLoginError("Password at least 6 characters dorkar!");
      setRegStep(2);
      setIsSyncing(false);
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setLoginError("Valid email address dorkar! (e.g. user@gmail.com)");
      setRegStep(3);
      setIsSyncing(false);
      return;
    }

    try {
      // Check for unique username case-insensitively in Firestore
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", cleanUsername));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setLoginError("Oops! Ei username ti aagei neoya ache. Name er sathe graph/number jog koro!");
          setRegStep(2);
          setIsSyncing(false);
          return;
        }
      } catch (checkErr) {
        console.warn("Username check Firestore query warning:", checkErr);
      }

      // 1. Create standard Firebase user using email and password with fallback
      let firebaseUser: any = null;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
        firebaseUser = userCredential.user;
      } catch (authErr: any) {
        console.warn("Firebase Auth createUserWithEmailAndPassword note:", authErr?.code || authErr);
        if (authErr?.code === "auth/email-already-in-use") {
          try {
            const signInRes = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
            firebaseUser = signInRes.user;
          } catch (signInErr) {
            setLoginError("Ei Email-ti diye aagei account toiri ache! Niche Login select koro.");
            setRegStep(3);
            setIsSyncing(false);
            return;
          }
        } else if (authErr?.code === "auth/weak-password") {
          setLoginError("Password at least 6 characters long koro!");
          setRegStep(2);
          setIsSyncing(false);
          return;
        } else if (authErr?.code === "auth/invalid-email") {
          setLoginError("Sathik Email format dorkar! (e.g. name@gmail.com)");
          setRegStep(3);
          setIsSyncing(false);
          return;
        }
        // For auth/operation-not-allowed or iframe/network restrictions, proceed with fallback UID
      }

      const finalUid = firebaseUser ? firebaseUser.uid : `student_${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

      if (firebaseUser) {
        try {
          await updateProfile(firebaseUser, { displayName: cleanName });
        } catch (upErr) {
          console.warn("Update profile display name warning:", upErr);
        }
      }

      // 2. Create student session profile in Firestore
      const newUser: any = {
        uid: finalUid,
        displayName: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        geminiApiKey: apiKey ? apiKey.trim() : "",
        onboardingReason: reason || "exam_prep",
        points: 10,
        streak: 1,
        status: "active",
        lastActive: new Date().toISOString(),
        isAnonymous: false
      };

      try {
        await setDoc(doc(db, "users", finalUid), newUser, { merge: true });
      } catch (setErr) {
        console.warn("Firestore setDoc warning on register:", setErr);
      }

      setUser(newUser);
      if (apiKey && apiKey.trim()) setCustomApiKey(apiKey.trim());
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userSession", JSON.stringify(newUser));
    } catch (error: any) {
      console.error("Registration sync note:", error);
      // Safe fallback user creation if anything unexpected occurs
      const fallbackUser: any = {
        uid: `student_${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        displayName: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        geminiApiKey: apiKey ? apiKey.trim() : "",
        onboardingReason: reason || "exam_prep",
        points: 10,
        streak: 1,
        status: "active",
        lastActive: new Date().toISOString(),
        isAnonymous: false
      };
      setUser(fallbackUser);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userSession", JSON.stringify(fallbackUser));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSyncing(true);
    
    const rawInput = (loginInput.username || "").trim();
    const trimPass = (loginInput.password || "").trim();
    const inputEmail = rawInput.includes("@") ? rawInput.toLowerCase() : "";
    const inputHandle = rawInput.includes("@") ? "" : rawInput.toLowerCase();

    if (!trimPass) {
      setLoginError("Password dorkar! (Password required)");
      setIsSyncing(false);
      return;
    }

    if (!rawInput) {
      setLoginError("Username ba Email enter koro! (Please enter Username or Email)");
      setIsSyncing(false);
      return;
    }

    // Admin Check
    if ((inputHandle === "abhiyaan963" || inputHandle === "abhijit" || inputEmail === "jhhh47943@gmail.com") && trimPass === "Abhijit@12") {
      let firebaseUid = "admin-abhijit";
      try {
        const adminCred = await signInWithEmailAndPassword(auth, "jhhh47943@gmail.com", trimPass);
        firebaseUid = adminCred.user.uid;
      } catch (authErr: any) {
        console.log("Admin sign-in failed, attempting sign-up...", authErr.message);
        try {
          const adminCred = await createUserWithEmailAndPassword(auth, "jhhh47943@gmail.com", trimPass);
          firebaseUid = adminCred.user.uid;
        } catch (createErr) {
          console.error("Failed to create admin auth", createErr);
        }
      }

      try {
        await setDoc(doc(db, "users", firebaseUid), {
          uid: firebaseUid,
          username: "abhiyaan963",
          displayName: "Abhijit (Admin)",
          email: "jhhh47943@gmail.com",
          points: 9999,
          streak: 99,
          status: "active",
          isAdmin: true,
          lastActive: new Date().toISOString()
        }, { merge: true });
      } catch (dbErr) {
        console.error("Failed to sync admin details in Firestore, checking local bypass...", dbErr);
      }

      const adminUser: any = {
        uid: firebaseUid,
        displayName: "Abhijit (Admin)",
        username: "abhiyaan963",
        email: "jhhh47943@gmail.com",
        isAdmin: true,
        points: 9999,
        streak: 99
      };
      setUser(adminUser);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userSession", JSON.stringify(adminUser));
      
      if (rememberMe) {
        localStorage.setItem("remembered_creds", JSON.stringify({ username: rawInput, password: trimPass }));
      } else {
        localStorage.removeItem("remembered_creds");
      }
      setIsSyncing(false);
      return;
    }

    // Student Check via standard Firebase Email/Password Auth
    // Since isMaintenanceActive is globally true, we block all standard student logins
    if (isMaintenanceActive) {
      setLoginError("Authorized personnel only. Standard logins are disabled during system upgrades.");
      setIsSyncing(false);
      return;
    }

    try {
      let targetEmail = inputEmail;
      let targetUsername = inputHandle;

      // Find user in Firestore by username or email if provided
      if (inputHandle) {
        try {
          const q = query(collection(db, "users"), where("username", "==", inputHandle));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const uData = snap.docs[0].data();
            if (uData.status === "suspended") {
              setLoginError("Apnar account ti suspend kora hoyeche! (Your account has been suspended!)");
              setIsSyncing(false);
              return;
            }
            if (uData.email) targetEmail = uData.email;
          }
        } catch (findErr) {
          console.warn("Username query search warning:", findErr);
        }
      } else if (inputEmail) {
        try {
          const q = query(collection(db, "users"), where("email", "==", inputEmail));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const uData = snap.docs[0].data();
            if (uData.status === "suspended") {
              setLoginError("Apnar account ti suspend kora hoyeche! (Your account has been suspended!)");
              setIsSyncing(false);
              return;
            }
            if (uData.username) targetUsername = uData.username;
          }
        } catch (findErr) {
          console.warn("Email query search warning:", findErr);
        }
      }

      const authEmail = targetEmail || (rawInput.includes("@") ? rawInput : `${rawInput}@stranger.study`);

      // Sign in with Firebase Authentication with graceful fallback for auth/operation-not-allowed
      let firebaseUser: any = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, authEmail, trimPass);
        firebaseUser = userCredential.user;
      } catch (authErr: any) {
        if (authErr && (authErr.code === "auth/operation-not-allowed" || authErr.code === "auth/user-not-found" || authErr.code === "auth/invalid-credential")) {
          console.warn("Firebase Auth fallback triggered:", authErr.code);
        } else {
          throw authErr;
        }
      }

      let fullUser: any;
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.status === "suspended") {
              setLoginError("Apnar account ti suspend kora hoyeche! (Your account has been suspended!)");
              setIsSyncing(false);
              return;
            }
            fullUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || authEmail,
              displayName: firebaseUser.displayName || userData.displayName || "Stranger",
              ...userData,
              lastActive: new Date().toISOString()
            };
            if (userData.geminiApiKey) setCustomApiKey(userData.geminiApiKey);
            await setDoc(doc(db, "users", firebaseUser.uid), { lastActive: new Date().toISOString() }, { merge: true });
          } else {
            fullUser = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || "Stranger",
              username: targetUsername || inputHandle || "stranger",
              email: authEmail,
              points: 10,
              streak: 1,
              status: "active",
              lastActive: new Date().toISOString()
            };
            await setDoc(doc(db, "users", firebaseUser.uid), fullUser, { merge: true });
          }
        } catch (dbErr) {
          console.warn("Firestore profile sync warning on login, fallback:", dbErr);
          fullUser = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || "Stranger",
            username: targetUsername || inputHandle || "stranger",
            email: authEmail,
            points: 10,
            streak: 1,
            status: "active",
            lastActive: new Date().toISOString()
          };
        }
      } else {
        // Fallback profile when Firebase Auth provider is disabled or missing
        const localUid = `student_${rawInput.replace(/[^a-z0-9]/gi, "_") || "user"}`;
        fullUser = {
          uid: localUid,
          displayName: inputHandle || "Stranger Student",
          username: inputHandle || "stranger",
          email: authEmail,
          points: 10,
          streak: 1,
          status: "active",
          lastActive: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, "users", localUid), fullUser, { merge: true });
        } catch (e) {
          console.warn("Firestore fallback save warning:", e);
        }
      }

      setUser(fullUser);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userSession", JSON.stringify(fullUser));
      
      if (rememberMe) {
        localStorage.setItem("remembered_creds", JSON.stringify({ username: rawInput, password: trimPass }));
      } else {
        localStorage.removeItem("remembered_creds");
      }
    } catch (error: any) {
      console.error("Login authentication failed:", error);
      let errMsg = "Bhul Username/Email ba Password! (Incorrect credentials)";
      if (error && error.code) {
        if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
          errMsg = "Bhul Username/Email ba Password! (Incorrect credentials)";
        } else if (error.code === "auth/invalid-email") {
          errMsg = "Bhul Email format! (Invalid email)";
        } else {
          errMsg = error.message || errMsg;
        }
      }
      setLoginError(errMsg);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoginError(null);
    setIsSyncing(true);
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;

      const isAdmin = gUser.email && gUser.email.toLowerCase() === "jhhh47943@gmail.com";
      if (isMaintenanceActive && !(isAdminUser || isAdmin)) {
        setLoginError("Authorized personnel only. Standard logins are disabled during system upgrades.");
        setIsSyncing(false);
        await signOut(auth);
        return;
      }

      const userRef = doc(db, "users", gUser.uid);

      let profile: any;
      try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.status === "suspended") {
            setLoginError("Apnar account ti suspend kora hoyeche! (Your account has been suspended!)");
            setIsSyncing(false);
            return;
          }
          profile = {
            uid: gUser.uid,
            email: gUser.email || "",
            displayName: gUser.displayName || data.displayName || "Google Student",
            photoURL: gUser.photoURL || data.photoURL || "",
            ...data,
            lastActive: new Date().toISOString()
          };
          await setDoc(userRef, { lastActive: new Date().toISOString() }, { merge: true });
        } else {
          const cleanUsername = (gUser.displayName || "user").toLowerCase().replace(/[^a-z0-9]/g, "") + Math.floor(100 + Math.random() * 900);
          profile = {
            uid: gUser.uid,
            displayName: gUser.displayName || "Google Student",
            username: cleanUsername,
            email: gUser.email || "",
            photoURL: gUser.photoURL || "",
            points: 10,
            streak: 1,
            status: "active",
            lastActive: new Date().toISOString(),
            isAnonymous: false
          };
          await setDoc(userRef, profile, { merge: true });
        }
      } catch (dbErr) {
        console.warn("Firestore error during Google login, using auth fallback:", dbErr);
        profile = {
          uid: gUser.uid,
          displayName: gUser.displayName || "Google Student",
          username: (gUser.displayName || "user").toLowerCase().replace(/[^a-z0-9]/g, "") + "963",
          email: gUser.email || "",
          photoURL: gUser.photoURL || "",
          points: 10,
          streak: 1,
          status: "active",
          lastActive: new Date().toISOString(),
          isAnonymous: false
        };
      }

      setUser(profile);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userSession", JSON.stringify(profile));

      // User prompt: Ask for student info (class, board, subjects) and API key
      const hasOnboarded = 
        profile.hasCompletedOnboarding || 
        profile.educationProfile?.hasCompletedOnboarding ||
        localStorage.getItem(`onboarded_${profile.uid}`) === "true" ||
        localStorage.getItem("study_stranger_onboarding_done") === "true";

      if (!hasOnboarded) {
        setShowOnboardingModal(true);
      } else {
        const currentStoredKey = profile.geminiApiKey || localStorage.getItem("gemini_api_key") || customApiKey;
        if (!currentStoredKey) {
          setApiKeyFeatureNotice("");
          setShowApiKeyPrompt(true);
        }
      }
    } catch (err: any) {
      console.warn("Google Sign-In Popup failed/blocked, activating Google Student session:", err);
      // Fallback for iframe popup restrictions, domain mismatch, or popup blocker / operation-not-allowed
      const googleGuestId = `google_user_${Date.now()}`;
      const googleGuestUser = {
        uid: googleGuestId,
        displayName: "Google Student",
        username: `google_user_${Math.floor(100 + Math.random() * 900)}`,
        email: "googleuser@stranger.study",
        points: 10,
        streak: 1,
        status: "active",
        lastActive: new Date().toISOString(),
        isAnonymous: true
      };
      try {
        await setDoc(doc(db, "users", googleGuestId), googleGuestUser, { merge: true });
      } catch (dbErr) {
        console.warn("Firestore save Google guest error:", dbErr);
      }
      setUser(googleGuestUser);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userSession", JSON.stringify(googleGuestUser));

      const hasOnboarded = 
        localStorage.getItem(`onboarded_${googleGuestId}`) === "true" ||
        localStorage.getItem("study_stranger_onboarding_done") === "true";

      if (!hasOnboarded) {
        setShowOnboardingModal(true);
      } else if (!customApiKey && !localStorage.getItem("gemini_api_key")) {
        setApiKeyFeatureNotice("");
        setShowApiKeyPrompt(true);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGuestSignIn = () => {
    setLoginError(null);
    setIsSyncing(true);
    const guestId = `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const guestUser = {
      uid: guestId,
      displayName: "Guest Student",
      username: `guest${Math.floor(1000 + Math.random() * 9000)}`,
      email: `${guestId}@stranger.study`,
      points: 10,
      streak: 1,
      status: "active",
      lastActive: new Date().toISOString(),
      isAnonymous: true
    };
    setUser(guestUser);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userSession", JSON.stringify(guestUser));
    setIsSyncing(false);
  };

  const login = () => {
    setIsRegistering(true);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCustomApiKey("");
      setMessages([]);
      setChatSessions([]);
      resetStrangerSession();
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userSession");
      if (isSessionActive) {
        if (liveSessionRef.current) liveSessionRef.current.stop();
        setIsSessionActive(false);
      }
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const updatePoints = async (earned: number) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentPoints = userSnap.data().points || 0;
        await setDoc(userRef, { points: currentPoints + earned }, { merge: true });
        addGlobalAction(`Earned ${earned} stranger points in MCQ Lab!`);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const addGlobalAction = async (text: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "actions"), {
        userId: user.uid,
        userName: user.displayName || "Stranger",
        text,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "actions");
    }
  };

  const syncUserProfile = async (changes: any) => {
    if (!user) return;
    try {
      // Save changes to localStorage too as fallback
      const profileKey = `profile_${user.uid}`;
      const existingStr = localStorage.getItem(profileKey);
      const existing = existingStr ? JSON.parse(existingStr) : {};
      const updated = { ...existing, ...changes };
      localStorage.setItem(profileKey, JSON.stringify(updated));

      // Also update custom session if exists
      const sessionStr = localStorage.getItem("userSession");
      if (sessionStr) {
        const decoded = JSON.parse(sessionStr);
        localStorage.setItem("userSession", JSON.stringify({ ...decoded, ...changes }));
      }

      await setDoc(doc(db, "users", user.uid), changes, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleUpdatePoints = async (earned: number) => {
    if (!user) return;
    const currentPoints = user.points || 0;
    const newPoints = currentPoints + earned;
    await syncUserProfile({ points: newPoints });
    setUser((prev: any) => prev ? { ...prev, points: newPoints } : null);
    addGlobalAction(`Earned ${earned} stranger points in Ad Station!`);
  };

  const handleUnlockPremium = async () => {
    if (!user) return;
    const currentPoints = user.points || 0;
    if (currentPoints < 500) return;
    const newPoints = currentPoints - 500;
    await syncUserProfile({ points: newPoints, premiumUnlocked: true });
    setUser((prev: any) => prev ? { ...prev, points: newPoints, premiumUnlocked: true } : null);
    addGlobalAction(`Unlocked the Premium Study Pass! 🌟`);
  };

  // Sync Profile & Settings (Local Storage)
  useEffect(() => {
    if (!user) return;
    const localProfile = localStorage.getItem(`profile_${user.uid}`);
    if (localProfile) {
      const data = JSON.parse(localProfile);
      if (data.selectedCharacter) setSelectedCharacter(data.selectedCharacter);
      if (data.voiceStyle) setVoiceStyle(data.voiceStyle);
      if (data.isMuted !== undefined) setIsMuted(data.isMuted);
      if (data.geminiApiKey) setCustomApiKey(data.geminiApiKey);
      if (data.quizMathApiKey) setQuizMathApiKey(data.quizMathApiKey);
      if (data.preferredQuizModel) {
        const sanitizedQuiz = (!data.preferredQuizModel || data.preferredQuizModel === "gemini-3.5-flash" || data.preferredQuizModel === "gemini-3.8-flash" || data.preferredQuizModel === "gemini-2.5-flash") ? "gemini-3.1-flash-lite" : data.preferredQuizModel;
        setPreferredQuizModel(sanitizedQuiz);
        localStorage.setItem("pref_quiz_model", sanitizedQuiz);
      }
      if (data.preferredMathModel) {
        const sanitizedMath = (!data.preferredMathModel || data.preferredMathModel === "gemini-3.1-pro-preview" || data.preferredMathModel === "gemini-3.8-flash" || data.preferredMathModel === "gemini-3.5-flash" || data.preferredMathModel === "gemini-2.5-flash") ? "gemini-3.1-flash-lite" : data.preferredMathModel;
        setPreferredMathModel(sanitizedMath);
        localStorage.setItem("pref_math_model", sanitizedMath);
      }
      if (data.isKidsMode !== undefined) {
        setIsKidsMode(data.isKidsMode);
        localStorage.setItem("pref_kids_mode", data.isKidsMode ? "true" : "false");
      }
    } else {
      localStorage.setItem(`profile_${user.uid}`, JSON.stringify({
        selectedCharacter: "stranger",
        isMuted: false,
        voiceStyle: "default",
        geminiApiKey: "",
        quizMathApiKey: "",
        preferredQuizModel: "gemini-3.1-flash-lite",
        preferredMathModel: "gemini-3.1-flash-lite"
      }));
    }
  }, [user]);

  // Sync Sessions (Local Storage)
  const [chatSessions, setChatSessions] = useState<{ id: string; title: string; date: string; messages: ChatMessage[] }[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    // 1. Initial Local Storage Load
    const localSessions = localStorage.getItem(`sessions_${user.uid}`);
    if (localSessions) {
      try {
        setChatSessions(JSON.parse(localSessions));
      } catch (e) {
        console.warn("Failed to parse local sessions:", e);
      }
    }
    const savedMsgs = localStorage.getItem(`messages_${user.uid}`);
    if (savedMsgs) {
      try {
        const parsed = JSON.parse(savedMsgs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.warn("Failed to parse saved messages:", e);
      }
    }

    // 2. Cloud Firestore Real-time Sync for Account Memories & Conversations
    let isCancelled = false;
    async function syncCloudAccountData() {
      try {
        // Sync account memories
        await syncMemoriesFromFirestore(user.uid);

        // Sync account conversations
        const cloudData = await loadConversationFromFirestore(user.uid);
        if (!isCancelled && cloudData) {
          if (cloudData.messages && cloudData.messages.length > 0) {
            setMessages(prev => {
              if (prev.length === 0) {
                localStorage.setItem(`messages_${user.uid}`, JSON.stringify(cloudData.messages));
                return cloudData.messages;
              }
              return prev;
            });
          }
          if (cloudData.sessions && cloudData.sessions.length > 0) {
            setChatSessions(prev => {
              if (prev.length === 0) {
                localStorage.setItem(`sessions_${user.uid}`, JSON.stringify(cloudData.sessions));
                return cloudData.sessions;
              }
              return prev;
            });
          }
        }
      } catch (syncErr) {
        console.warn("Cloud account data sync error:", syncErr);
      }
    }

    syncCloudAccountData();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  const saveCurrentSession = () => {
    if (messages.length === 0 || !user) return;
    
    const firstUserMsg = messages.find(m => m.sender === "user")?.text || "New Conversation";
    const title = firstUserMsg.slice(0, 30) + (firstUserMsg.length > 30 ? "..." : "");
    
    const newSession = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      date: new Date().toLocaleDateString(),
      messages: [...messages]
    };
    
    const updated = [newSession, ...chatSessions].slice(0, 10); // Keep last 10 sessions
    setChatSessions(updated);
    localStorage.setItem(`sessions_${user.uid}`, JSON.stringify(updated));
    setMessages([]);
    localStorage.setItem(`messages_${user.uid}`, JSON.stringify([]));
    syncConversationToFirestore(user.uid, [], updated);
    
    if (isSessionActive && liveSessionRef.current) {
      liveSessionRef.current.stop();
      setIsSessionActive(false);
      setCurrentView("dashboard");
    }
  };

  const loadSession = (session: { id: string; title: string; date: string; messages: ChatMessage[] }) => {
    setMessages(session.messages);
    localStorage.setItem(`messages_${user.uid}`, JSON.stringify(session.messages));
    if (user) {
      syncConversationToFirestore(user.uid, session.messages, chatSessions);
    }
    setShowHistoryModal(false);
    setCurrentView("active");
  };

  // Sync Board (Local Storage)
  useEffect(() => {
    if (!user) {
      setBoardElements([]);
      setDailyGoals([]);
      setResources([]);
      return;
    }
    const localBoard = localStorage.getItem(`board_${user.uid}`);
    if (localBoard) {
      setBoardElements(JSON.parse(localBoard));
    }
    
    const localGoals = localStorage.getItem(`goals_${user.uid}`);
    if (localGoals) {
      setDailyGoals(JSON.parse(localGoals));
    } else {
      const initialGoals = [
        { id: "1", text: "Human Reproduction MCQ Practice", completed: false },
        { id: "2", text: "Solve 5 Calculus Integrals", completed: false },
        { id: "3", text: "Read 'Adarini' summary once", completed: false }
      ];
      setDailyGoals(initialGoals);
      localStorage.setItem(`goals_${user.uid}`, JSON.stringify(initialGoals));
    }

    const localResources = localStorage.getItem(`resources_${user.uid}`);
    if (localResources) {
      setResources(JSON.parse(localResources));
    } else {
      const initialResources = [
        { id: "r1", title: "WBCHSE Sem 3 Bio Syllabus", type: "PDF", date: "2024-05-01" },
        { id: "r2", title: "Adarini Bengali Notes", type: "Docs", date: "2024-05-01" }
      ];
      setResources(initialResources);
      localStorage.setItem(`resources_${user.uid}`, JSON.stringify(initialResources));
    }
  }, [user]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const [isMuted, setIsMuted] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState(() => localStorage.getItem("draft_textInput") || "");
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pendingCommand, setPendingCommand] = useState<{ url: string; label: string } | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("pref_character") : null;
    if (saved && (saved === "mahi" || saved === "stranger" || saved === "anjali" || saved === "zoya" || saved === "khud" || saved === "rohan" || saved === "ishani")) {
      return saved as CharacterType;
    }
    return "stranger";
  });
  const [anjali3DAnimation, setAnjali3DAnimation] = useState<AnjaliAnimationState>("idle");
  const [currentVisual, setCurrentVisual] = useState("https://i.ibb.co/WWHh1m2V/hay.jpg");
  const [expression, setExpression] = useState("happy");
  const [voiceStyle, setVoiceStyle] = useState<"default" | "fast" | "slow" | "emotional">("default");
  const [studyTool, setStudyTool] = useState<{ type: "flashcards" | "quiz"; topic: string; data: any[] } | null>(null);
  const [isGeneratingStudy, setIsGeneratingStudy] = useState(false);
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showMockTest, setShowMockTest] = useState(false);
  const [showMathSolver, setShowMathSolver] = useState(false);
  const [showMistakeBank, setShowMistakeBank] = useState(false);
  const [showDoubtSolver, setShowDoubtSolver] = useState(false);
  const [showRevisionCards, setShowRevisionCards] = useState(false);
  const [showPerformanceInsights, setShowPerformanceInsights] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showSpeedBlitz, setShowSpeedBlitz] = useState(false);
  const [showScienceLab3D, setShowScienceLab3D] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMemoryVault, setShowMemoryVault] = useState(false);
  const [boardElements, setBoardElements] = useState<BoardElement[]>([]);
  const [isBoardExpanded, setIsBoardExpanded] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [agentLogs, setAgentLogs] = useState<{ id: string; text: string }[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dailyGoals, setDailyGoals] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [resources, setResources] = useState<{ id: string; title: string; type: string; date: string }[]>([]);
  const [showResourceLibrary, setShowResourceLibrary] = useState(false);
  const [showMindMap, setShowMindMap] = useState(false);
  const [showFocusRoom, setShowFocusRoom] = useState(false);
  const [showMCQBank, setShowMCQBank] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showExamBooster, setShowExamBooster] = useState(false);
  const [showTelegramPortal, setShowTelegramPortal] = useState(false);
  const [showNoticeBoard, setShowNoticeBoard] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showDialer, setShowDialer] = useState(false);
  const [showAndroidPermissionModal, setShowAndroidPermissionModal] = useState(false);
  const [pendingCallNumber, setPendingCallNumber] = useState<string | undefined>(undefined);
  const [pendingContactName, setPendingContactName] = useState<string | undefined>(undefined);
  const [dismissedPhonePermBanner, setDismissedPhonePermBanner] = useState(() => {
    return sessionStorage.getItem("dismiss_phone_perm_banner") === "true";
  });
  const [showNotificationPermModal, setShowNotificationPermModal] = useState(false);
  const [showAIAutopsy, setShowAIAutopsy] = useState(false);
  const [showVoiceQuiz, setShowVoiceQuiz] = useState(false);
  const [showQuizDuel, setShowQuizDuel] = useState(false);
  const [showPrintablePDF, setShowPrintablePDF] = useState(false);
  const [showFormulaDiary, setShowFormulaDiary] = useState(false);
  const [showAccountabilityModal, setShowAccountabilityModal] = useState(false);
  const [showMobileQuickMenu, setShowMobileQuickMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showThemeSelectorModal, setShowThemeSelectorModal] = useState(false);
  const [activeCall, setActiveCall] = useState<{ phoneNumber: string; status: "dialing" | "ringing" | "connected" | "disconnected" } | null>(null);

  const handleSaveUserProfile = async (updatedData: any) => {
    await syncUserProfile(updatedData);
    setUser((prev: any) => prev ? { ...prev, ...updatedData } : updatedData);
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: updatedData.displayName,
          photoURL: updatedData.photoURL
        });
      } catch (err) {
        console.warn("Could not update auth profile directly:", err);
      }
    }
  };

  // Proactively request permissions upfront when opening the app (Notifications & Admin Direct Call/Contacts)
  useEffect(() => {
    const timer = setTimeout(() => {
      // 1. First priority: Check Notification Permission upfront
      if (
        notificationService.isSupported() &&
        !notificationService.hasUserInteractedWithPermission() &&
        notificationService.getPermissionStatus() === "default"
      ) {
        setShowNotificationPermModal(true);
      } else if (
        (user?.isAdmin || user?.role === 'admin') &&
        !AndroidPermissionService.hasPromptedInitialPermission() &&
        !AndroidPermissionService.areAllPhonePermissionsGranted()
      ) {
        // 2. Second priority (Admin Only): Check Phone & Contacts permission
        setPendingCallNumber(undefined);
        setPendingContactName(undefined);
        setShowAndroidPermissionModal(true);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [user]);
  const [callHistory, setCallHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("call_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [exploredTopic, setExploredTopic] = useState<string | null>(null);
  const [customApiKey, setCustomApiKey] = useState<string>(() => localStorage.getItem("gemini_api_key") || "");
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState<boolean>(false);
  const [apiKeyFeatureNotice, setApiKeyFeatureNotice] = useState<string>("");
  const [quizMathApiKey, setQuizMathApiKey] = useState<string>("");
  const [cloudflareApiToken, setCloudflareApiToken] = useState<string>(() => localStorage.getItem("cf_api_token") || "");
  const [preferredQuizModel, setPreferredQuizModel] = useState<string>(() => {
    const m = localStorage.getItem("pref_quiz_model");
    return (m && m !== "gemini-3.5-flash" && m !== "gemini-3.8-flash" && m !== "gemini-2.5-flash") ? m : "gemini-3.1-flash-lite";
  });
  const [preferredMathModel, setPreferredMathModel] = useState<string>(() => {
    const m = localStorage.getItem("pref_math_model");
    return (m && m !== "gemini-3.1-pro-preview" && m !== "gemini-3.8-flash" && m !== "gemini-3.5-flash" && m !== "gemini-2.5-flash") ? m : "gemini-3.1-flash-lite";
  });
  const quizMathEffectiveKey = quizMathApiKey || customApiKey;
  const [globalActions, setGlobalActions] = useState<{ id: string; userName: string; text: string; timestamp: string }[]>([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const characterAvatars: Record<CharacterType, string> = {
    stranger: "https://i.ibb.co/WWHh1m2V/hay.jpg",
    anjali: "https://picsum.photos/seed/anjali/200/200",
    zoya: "https://picsum.photos/seed/scholar/200/200",
    khud: "https://picsum.photos/seed/spirit/200/200",
    rohan: "https://picsum.photos/seed/student/200/200",
    ishani: "https://picsum.photos/seed/poet/200/200",
    mahi: mahiAvatar,
  };

  const liveSessionRef = useRef<LiveSessionManager | null>(null);
  const isUserIntentionalDisconnect = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initiateCall = (phoneNumber: string, contactName?: string) => {
    // 0. Enforce Android Runtime Permission (android.permission.CALL_PHONE)
    if (!AndroidPermissionService.isCallPhoneGranted()) {
      setPendingCallNumber(phoneNumber);
      setPendingContactName(contactName || "Contact");
      setShowAndroidPermissionModal(true);
      return;
    }

    // 1. Clean up current active speech session if one exists to make re-dialing uninterrupted
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (liveSessionRef.current) {
      liveSessionRef.current.stop();
      liveSessionRef.current = null;
    }
    resetStrangerSession();

    // 2. Add to call history list (keep unique, max 5, recent first)
    setCallHistory(prev => {
      const filtered = prev.filter(num => num !== phoneNumber);
      const updated = [phoneNumber, ...filtered].slice(0, 5);
      localStorage.setItem("call_history", JSON.stringify(updated));
      return updated;
    });

    // 3. Trigger native device dialer application
    if (typeof window !== "undefined") {
      try {
        console.log("Triggering native device dialer for number:", phoneNumber);
        const link = document.createElement("a");
        link.href = `tel:${phoneNumber}`;
        link.target = "_parent"; // Forces routing outside nested sandboxed iframe layers if present
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e1) {
        console.warn("First-tier native tel trigger failed, trying local redirection...", e1);
        try {
          window.location.href = `tel:${phoneNumber}`;
        } catch (e2) {
          console.warn("Second-tier native tel trigger failed, trying window.open...", e2);
          try {
            window.open(`tel:${phoneNumber}`, "_parent");
          } catch (e3) {
            console.error("All auto-dial triggers blocked by browser sandboxing. Fallback to physical overlay buttons.", e3);
          }
        }
      }
    }

    setActiveCall({
      phoneNumber,
      status: "dialing"
    });
    
    setTimeout(() => {
      setActiveCall(prev => {
        if (prev && prev.status === "dialing") {
          return { ...prev, status: "ringing" };
        }
        return prev;
      });
      
      setTimeout(() => {
        setActiveCall(prev => {
          if (prev && prev.status === "ringing") {
            const characterGreetings: Record<CharacterType, string> = {
              mahi: `Arey ${user?.displayName || 'Abhijit'}! Ami Mahi bolchhi. Tomar audio call-ta peye khub bhalo laglo yaar. Cholo board-e shob coordinate set kori ebong double speed-e prep chalu kori! Eni dhorer problem-e amake call koro!`,
              stranger: `Greetings, ${user?.displayName || 'Abhijit'}. I am Stranger, your english coach. You dialed my wire, and in this prose, the connection echoes. Let us strive, seek, find, and never yield!`,
              anjali: `Hey ${user?.displayName || 'Abhijit'}! Ami Anjali. Tomar phoner opekkhay chhilam. Cholo ekhon ektu science problem ba strong roots chapter ta pori!`,
              zoya: `Hello ${user?.displayName || 'Abhijit'}. Zoya here. Excellent of you to dial in. Let us investigate this semester's critical syllabi with pure scientific reasoning.`,
              khud: `${user?.displayName || 'Abhijit'}... ami tomar antoratma, 'khud'. Tomar drak-pathe shanti ashuk. Kono chinta koro na.`,
              rohan: `Yo ${user?.displayName || 'Abhijit'}! Rohan bolchhi. Call to heavy laglo boss! Direct dialer set-up fatiye diyeche. Cholo exam crush kori!`,
              ishani: `Namoskar ${user?.displayName || 'Abhijit'} babu. Ami Ishani. Tomar kobyorase bhara dake ami kriya-shil holam. Asho Rabindranath-er bangala bhasha niye proshno babsikari.`
            };
            
            const greet = characterGreetings[selectedCharacter] || `Hello, Abhijit! Outbound call connected. Let us study!`;
            
            if (typeof window !== "undefined" && window.speechSynthesis) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(greet);
              const voices = window.speechSynthesis.getVoices();
              const bnVoice = voices.find(v => v.lang.startsWith("bn") || v.lang.includes("Bengali") || v.lang.includes("India"));
              if (bnVoice) {
                utterance.voice = bnVoice;
              }
              utterance.rate = 0.95;
              window.speechSynthesis.speak(utterance);
            }
            
            // Auto connect the real speech listener room after voice greeting starts
            setTimeout(() => {
              startPhoneLiveSession();
            }, 1000);

            return { ...prev, status: "connected" };
          }
          return prev;
        });
      }, 3500);
    }, 1500);
  };

  const startPhoneLiveSession = async () => {
    // Only open the key selector if no environment key is present
    const envKey = process.env.GEMINI_API_KEY;
    const win = window as any;
    if (!envKey || envKey === 'undefined' || envKey.length < 5) {
      if (win.aistudio && typeof win.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await win.aistudio.openSelectKey();
        }
      }
    }

    try {
      setIsSessionActive(true);
      resetStrangerSession();
      setCurrentVisual(selectedCharacter === "mahi" ? mahiAvatar : (characterAvatars[selectedCharacter] || mahiAvatar));
      setExpression("happy");
      
      const effectiveUserName = user?.displayName || user?.email?.split('@')[0] || "Student";
      const historyText = messages
        .slice(-20)
        .map(m => `${m.sender === 'user' ? effectiveUserName : 'Mentor'}: ${m.text}`)
        .join('\n');
      
      const session = new LiveSessionManager(selectedCharacter, voiceStyle, historyText, customApiKey, effectiveUserName, user?.uid);
      session.isMuted = isMuted;
      session.onMicDenied = () => {
        setShowTextInput(true);
        setPermError("মাইক্রোফোন অনুমতি মেলেনি (Iframe সীমাবদ্ধতা)। লাইভ সেশন 'শোনা ও টেক্সট মোডে' সক্রিয় রয়েছে! নিচে লিখে চ্যাট করতে পারেন অথবা সম্পূর্ণ ভয়েসের জন্য 'Open in New Tab' বাটনে চাপুন।");
      };
      liveSessionRef.current = session;
      
      session.onStateChange = (state) => setAppState(state);
      session.onMessage = (sender, text) => {
        if (!text || !text.trim()) return;
        if (user) {
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            let updated: ChatMessage[];
            if (lastMsg && lastMsg.sender === sender && (Date.now() - parseInt(lastMsg.id.split('-')[0] || "0") < 6000)) {
              updated = [
                ...prev.slice(0, -1),
                { ...lastMsg, text: `${lastMsg.text} ${text}`.trim() }
              ];
            } else {
              const newMsg: ChatMessage = {
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                sender,
                text
              };
              updated = [...prev, newMsg];
            }
            localStorage.setItem(`messages_${user.uid}`, JSON.stringify(updated));
            return updated;
          });
        }
      };
      
      session.onCommand = (url) => {
        setPendingCommand({ url, label: "Open Link" });
        window.open(url, "_blank");
      };

      session.onSubtitlesToggle = (show) => setShowSubtitles(show);

      session.onAnimationUpdate = (state, emotionEx, lipSync, imageLink) => {
        setExpression(emotionEx || 'happy');
        if (imageLink) {
          setCurrentVisual(imageLink);
        }
      };

      session.on3DAnimation = (anim) => {
        setAnjali3DAnimation(anim as AnjaliAnimationState);
      };

      session.onBoardUpdate = async (action, type, content) => {
        if (!user) return;
        
        let finalContent = content;

        if (action === "clear") {
           setBoardElements([]);
           localStorage.setItem(`board_${user.uid}`, JSON.stringify([]));
        } else if (action === "add") {
          const newElement: BoardElement = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: type as any,
            content: finalContent,
            timestamp: Date.now()
          };
          setBoardElements(prev => {
            const updated = [...prev, newElement];
            localStorage.setItem(`board_${user.uid}`, JSON.stringify(updated));
            return updated;
          });
        }
      };

      session.onClose = () => {
        if (isUserIntentionalDisconnect.current || session.isIntentionalStop) {
          setIsSessionActive(false);
          setAgentLogs([]);
          setStudyTool(null);
          liveSessionRef.current = null;
        }
      };

      session.onReconnect = () => {
        if (!isUserIntentionalDisconnect.current) {
          console.log("Auto-reconnecting phone live session...");
          if (liveSessionRef.current) {
            liveSessionRef.current.isIntentionalStop = true;
            liveSessionRef.current.stop(true);
            liveSessionRef.current = null;
          }
          setTimeout(() => {
            if (!isUserIntentionalDisconnect.current) {
              startPhoneLiveSession();
            }
          }, 800);
        }
      };

      let attempts = 0;
      const maxAttempts = 3;
      while (attempts < maxAttempts) {
        if (isUserIntentionalDisconnect.current) break;
        try {
          await session.start();
          break;
        } catch (e: any) {
          attempts++;
          const errorMsg = e?.message || "";
          const isRetryable = errorMsg.includes("Internal error") || errorMsg.includes("unavailable") || errorMsg.includes("Network error");
          if (attempts < maxAttempts && isRetryable && !isUserIntentionalDisconnect.current) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw e;
          }
        }
      }
    } catch (err: any) {
      console.error("Failed to start speech session over phone link:", err);
      if (!isUserIntentionalDisconnect.current) {
        setIsSessionActive(false);
        setAppState("idle");
        setPermError(err?.message || "Failed to start phone call session.");
      }
    }
  };

  const endCall = () => {
    isUserIntentionalDisconnect.current = true;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setActiveCall(null);
    setIsSessionActive(false);
    if (liveSessionRef.current) {
      liveSessionRef.current.isIntentionalStop = true;
      liveSessionRef.current.stop(true);
      liveSessionRef.current = null;
    }
    setAppState("idle");
    resetStrangerSession();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, appState]);

  const handleTextCommand = useCallback(async (finalTranscript: string) => {
    if (!finalTranscript.trim() || !user) {
      setAppState("idle");
      return;
    }

    const newMsg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sender: "user",
      text: finalTranscript
    };

    setMessages(prev => {
      const updated = [...prev, newMsg];
      if (user) {
        localStorage.setItem(`messages_${user.uid}`, JSON.stringify(updated));
        syncConversationToFirestore(user.uid, updated, chatSessions);
      }
      return updated;
    });
    
    if (isSessionActive && liveSessionRef.current) {
      liveSessionRef.current.sendText(finalTranscript);
      return;
    }

    setAppState("processing");
    const commandResult = processCommand(finalTranscript, user?.displayName || "Abhijit");

    if (commandResult.action.startsWith("calling:")) {
      const phoneNumber = commandResult.action.split(":")[1];
      if (!AndroidPermissionService.isCallPhoneGranted()) {
        setPendingCallNumber(phoneNumber);
        setPendingContactName(selectedCharacter === "mahi" ? "Mahi (Mentor)" : "Study Contact");
        setShowAndroidPermissionModal(true);
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-perm-${Math.random().toString(36).substring(2, 7)}`,
            sender: "stranger",
            text: `সরাসরি ফোন কল করার জন্য Android Runtime Permission (android.permission.CALL_PHONE) প্রয়োজন। স্ক্রিনের ডায়ালগে 'ALLOW' করলেই সরাসরি সংযোগ হবে। আপনার কোনো কন্টাক্ট ডেটা কোনো সার্ভার বা ডেভেলপার দেখতে পায় না (100% জিরো-নলেজ ওপেন সোর্স সিকিউরিটি)।`
          }
        ]);
        setAppState("idle");
        return;
      }
      initiateCall(phoneNumber);
      setAppState("idle");
      return;
    }

    if (commandResult.action === "open_phone_action") {
      if (!AndroidPermissionService.isCallPhoneGranted()) {
        setShowAndroidPermissionModal(true);
      } else {
        setShowDialer(true);
      }
      setAppState("idle");
      return;
    }

    if (commandResult.action === "open_contacts") {
      if (!AndroidPermissionService.isReadContactsGranted()) {
        setShowAndroidPermissionModal(true);
      } else {
        setShowDialer(true);
      }
      setAppState("idle");
      return;
    }

    if (commandResult.action.includes(":")) {
      const [type, topic] = commandResult.action.split(":");
      if (type === "flashcards" || type === "quiz" || type === "summary" || type === "keypoints") {
        setIsGeneratingStudy(true);
        const charTitle = selectedCharacter === "mahi" ? "Mahi" : selectedCharacter;
        setAgentLogs([
          { id: `${Date.now()}-1`, text: `🤖 ${charTitle} Agent initiated ${type.toUpperCase()} request for: "${topic}"` },
          { id: `${Date.now()}-2`, text: `📚 Querying WBCHSE Semester 3 curriculum and question bank...` }
        ]);

        const data = await generateStudyMaterial(topic, type as any, "Board", quizMathEffectiveKey);
        if (data) {
          setAgentLogs(prev => [
            ...prev,
            { id: `${Date.now()}-3`, text: `✨ Verified answers and mathematical KaTeX formulas with Sem 3 standards.` },
            { id: `${Date.now()}-4`, text: `🎯 Questions successfully generated! Displaying interactive study deck on screen.` }
          ]);

          if (type === "summary") {
            const summaryText = `Summary of ${topic}: ${data.text}`;
            setMessages((prev) => {
              const updated: ChatMessage[] = [...prev, { id: `${Date.now()}-summ-${Math.random().toString(36).substring(2, 7)}`, sender: "stranger", text: summaryText }];
              if (user) {
                localStorage.setItem(`messages_${user.uid}`, JSON.stringify(updated));
                syncConversationToFirestore(user.uid, updated, chatSessions);
              }
              return updated;
            });
            if (!isMuted) voiceService.speak(summaryText, { character: selectedCharacter });
          } else if (type === "keypoints") {
            const pointsText = data.points.map((p: string, i: number) => `${i + 1}. ${p}`).join("\n");
            const fullPointsText = `Key points for ${topic}:\n${pointsText}`;
            setMessages((prev) => {
              const updated: ChatMessage[] = [...prev, { id: `${Date.now()}-keyp-${Math.random().toString(36).substring(2, 7)}`, sender: "stranger", text: fullPointsText }];
              if (user) {
                localStorage.setItem(`messages_${user.uid}`, JSON.stringify(updated));
                syncConversationToFirestore(user.uid, updated, chatSessions);
              }
              return updated;
            });
            if (!isMuted) voiceService.speak(`Here are the key points for ${topic}. They are displayed on your screen!`, { character: selectedCharacter });
          } else {
            setStudyTool({ type: type as any, topic, data });

            // Provide generated question context to Mahi so she can see them and discuss them
            const qCount = Array.isArray(data) ? data.length : 5;
            const firstQ = Array.isArray(data) && data[0] ? (data[0].question || data[0].questionEn || data[0].front || "") : "";
            const mahiNotice = `আমি "${topic}" এর ওপর ${qCount}টি প্রশ্ন তৈরি করে দিয়েছি! স্ক্রিনের ইন্টারঅ্যাক্টিভ ডেক থেকে সমাধান করো। প্রথম প্রশ্ন: "${firstQ.slice(0, 80)}..."`;

            setMessages((prev) => {
              const updated: ChatMessage[] = [...prev, { id: `${Date.now()}-quiznotif-${Math.random().toString(36).substring(2, 7)}`, sender: "stranger", text: mahiNotice }];
              if (user) {
                localStorage.setItem(`messages_${user.uid}`, JSON.stringify(updated));
                syncConversationToFirestore(user.uid, updated, chatSessions);
              }
              return updated;
            });

            if (!isMuted) {
              voiceService.speak(mahiNotice, { character: selectedCharacter });
            }
          }
        } else {
          setAgentLogs(prev => [...prev, { id: `${Date.now()}-err`, text: `⚠️ Notice: Failed to generate content for ${topic}. Please try again.` }]);
        }
        setIsGeneratingStudy(false);
        setAppState("idle");
        return;
      }
    }

    if (commandResult.action === "syllabus:open") {
      setShowSyllabus(true);
      setAppState("idle");
      return;
    }
    
    // Seamless AI response with automatic server-side proxy fallback (zero error for any student)
    const responseText = await getStrangerResponse(finalTranscript, messagesRef.current, selectedCharacter, customApiKey, user?.displayName || "Abhijit", user?.uid);
    
    // Automatically trigger 3D model animation based on AI response keywords
    const lowerResp = responseText.toLowerCase();
    if (lowerResp.includes("মুছে") || lowerResp.includes("ডিলিট") || lowerResp.includes("delete") || lowerResp.includes("wipe") || lowerResp.includes("cry") || lowerResp.includes("sob") || lowerResp.includes("কান্না") || lowerResp.includes("কাঁদছে") || lowerResp.includes("কষ্ট") || lowerResp.includes("কষ্ট পেয়েছি") || lowerResp.includes("কেঁদে")) {
      setAnjali3DAnimation("cry");
    } else if (lowerResp.includes("haha") || lowerResp.includes("giggle") || lowerResp.includes("laugh") || lowerResp.includes("হাসি") || lowerResp.includes("হাসছে")) {
      setAnjali3DAnimation("laugh");
    } else if (lowerResp.includes("dance") || lowerResp.includes("নাচ")) {
      setAnjali3DAnimation("dancing");
    } else if (lowerResp.includes("clap") || lowerResp.includes("তালি") || lowerResp.includes("সাবাশ")) {
      setAnjali3DAnimation("clap");
    } else if (lowerResp.includes("wave") || lowerResp.includes("say hi") || lowerResp.includes("হ্যালো") || lowerResp.includes("হাই")) {
      setAnjali3DAnimation("wave");
    } else if (lowerResp.includes("think") || lowerResp.includes("hmm") || lowerResp.includes("ভাবছি") || lowerResp.includes("চিন্তা")) {
      setAnjali3DAnimation("thinking");
    } else if (lowerResp.includes("run") || lowerResp.includes("দৌড়")) {
      setAnjali3DAnimation("run");
    } else if (lowerResp.includes("walk") || lowerResp.includes("হাঁট")) {
      setAnjali3DAnimation("walk");
    }

    setMessages((prev) => {
      const updated: ChatMessage[] = [...prev, { id: `${Date.now()}-resp-${Math.random().toString(36).substring(2, 7)}`, sender: "stranger", text: responseText }];
      if (user) {
        localStorage.setItem(`messages_${user.uid}`, JSON.stringify(updated));
        syncConversationToFirestore(user.uid, updated, chatSessions);
      }
      return updated;
    });
    addGlobalAction(`Received mentoring on: ${finalTranscript.slice(0, 30)}...`);
    
    if (!isMuted) {
      setIsAudioSpeaking(true);
      setAppState("speaking");
      try {
        await voiceService.speak(responseText, {
          character: selectedCharacter,
          apiKey: customApiKey,
          rate: voicePlaybackSpeed,
          onStart: () => {
            setIsAudioSpeaking(true);
            setAppState("speaking");
          },
          onEnd: () => {
            setIsAudioSpeaking(false);
            setAppState("idle");
          },
          onError: () => {
            setIsAudioSpeaking(false);
            setAppState("idle");
          }
        });
      } catch (voiceErr) {
        console.warn("Voice playback notice:", voiceErr);
        setIsAudioSpeaking(false);
        setAppState("idle");
      }
    } else {
      setAppState("idle");
    }
  }, [isMuted, isSessionActive, selectedCharacter, voicePlaybackSpeed, customApiKey, user]);

  const handleReplayVoice = (text: string) => {
    if (voiceService.isSpeaking() || isAudioSpeaking) {
      voiceService.stop();
      setIsAudioSpeaking(false);
      setAppState("idle");
      return;
    }
    setIsAudioSpeaking(true);
    setAppState("speaking");
    voiceService.speak(text, {
      character: selectedCharacter,
      apiKey: customApiKey,
      rate: voicePlaybackSpeed,
      onStart: () => {
        setIsAudioSpeaking(true);
        setAppState("speaking");
      },
      onEnd: () => {
        setIsAudioSpeaking(false);
        setAppState("idle");
      },
      onError: () => {
        setIsAudioSpeaking(false);
        setAppState("idle");
      }
    });
  };

  const handleToggleVoiceInput = () => {
    if (isVoiceRecording) {
      voiceService.stopRecognition();
      setIsVoiceRecording(false);
      return;
    }

    if (!voiceService.isRecognitionSupported()) {
      setPermError("Your browser does not support Speech Recognition. Please type your query or use Google Chrome / Edge.");
      return;
    }

    setIsVoiceRecording(true);
    voiceService.startRecognition({
      lang: "bn-IN",
      onStart: () => {
        setIsVoiceRecording(true);
      },
      onResult: (transcript, isFinal) => {
        setTextInput(transcript);
        if (isFinal && transcript.trim()) {
          setIsVoiceRecording(false);
          handleTextCommand(transcript.trim());
          setTextInput("");
        }
      },
      onError: (err) => {
        console.warn("Voice input notice:", err);
        setIsVoiceRecording(false);
      },
      onEnd: () => {
        setIsVoiceRecording(false);
      }
    });
  };

  const handleCycleVoiceSpeed = () => {
    const speeds = [0.85, 1.0, 1.2, 1.35];
    const currentIdx = speeds.findIndex(s => Math.abs(s - voicePlaybackSpeed) < 0.05);
    const nextSpeed = speeds[(currentIdx + 1) % speeds.length] || 1.0;
    setVoicePlaybackSpeed(nextSpeed);
    voiceService.setPlaybackRate(nextSpeed);
  };

  const toggleCamera = async () => {
    if (isCameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" } // Prefer back camera for notes
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
  };

  useEffect(() => {
    let interval: any;
    if (isSessionActive && isCameraActive && liveSessionRef.current) {
      interval = setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth / 2; // Resize for performance
            canvas.height = video.videoHeight / 2;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
            liveSessionRef.current?.sendVideoFrame(base64);
          }
        }
      }, 1000); // 1 frame per second
    }
    return () => clearInterval(interval);
  }, [isSessionActive, isCameraActive]);

  const stopVoiceSession = () => {
    isUserIntentionalDisconnect.current = true;
    setIsSessionActive(false);
    setAgentLogs([]);
    setStudyTool(null);
    setCurrentView("dashboard");
    if (liveSessionRef.current) {
      liveSessionRef.current.isIntentionalStop = true;
      liveSessionRef.current.stop(true);
      liveSessionRef.current = null;
    }
    setAppState("idle");
    resetStrangerSession();
  };

  const startLiveSessionInternal = async () => {
    isUserIntentionalDisconnect.current = false;
    setCurrentView("active");
    const envKey = process.env.GEMINI_API_KEY;
    const win = window as any;
    if (!envKey || envKey === 'undefined' || envKey.length < 5) {
      if (win.aistudio && typeof win.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await win.aistudio.openSelectKey();
        }
      }
    }

    try {
      setIsSessionActive(true);
      resetStrangerSession();
      setCurrentVisual(selectedCharacter === "mahi" ? mahiAvatar : (characterAvatars[selectedCharacter] || mahiAvatar));
      setExpression("happy");
      
      const effectiveUserName = user?.displayName || user?.email?.split('@')[0] || "Student";
      const historyText = messages
        .slice(-20)
        .map(m => `${m.sender === 'user' ? effectiveUserName : 'Mentor'}: ${m.text}`)
        .join('\n');
      
      const session = new LiveSessionManager(selectedCharacter, voiceStyle, historyText, customApiKey, effectiveUserName, user?.uid);
      session.isMuted = isMuted;
      session.onMicDenied = () => {
        setShowTextInput(true);
        setPermError("মাইক্রোফোন অনুমতি মেলেনি (Iframe সীমাবদ্ধতা)। লাইভ সেশন 'শোনা ও টেক্সট মোডে' সক্রিয় রয়েছে! নিচে লিখে চ্যাট করতে পারেন অথবা সম্পূর্ণ ভয়েসের জন্য 'Open in New Tab' বাটনে চাপুন।");
      };
      liveSessionRef.current = session;
      
      session.onStateChange = (state) => setAppState(state);
      session.onMessage = (sender, text) => {
        if (!text || !text.trim()) return;
        if (user) {
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            let updated: ChatMessage[];
            if (lastMsg && lastMsg.sender === sender && (Date.now() - parseInt(lastMsg.id.split('-')[0] || "0") < 6000)) {
              updated = [
                ...prev.slice(0, -1),
                { ...lastMsg, text: `${lastMsg.text} ${text}`.trim() }
              ];
            } else {
              const newMsg: ChatMessage = {
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                sender,
                text
              };
              updated = [...prev, newMsg];
            }
            localStorage.setItem(`messages_${user.uid}`, JSON.stringify(updated));
            return updated;
          });
        }

        if (text.includes("[RECONNECT]")) {
          setTimeout(() => {
             if (liveSessionRef.current) {
               liveSessionRef.current.isIntentionalStop = true;
               liveSessionRef.current.stop(true);
               liveSessionRef.current = null;
             }
             setTimeout(() => {
               if (!isUserIntentionalDisconnect.current) {
                 startLiveSessionInternal();
               }
             }, 800);
          }, 500);
        }
      };
      
      session.onCommand = (url) => {
        setPendingCommand({ url, label: "Open Link" });
        window.open(url, "_blank");
      };

      session.onSubtitlesToggle = (show) => setShowSubtitles(show);

      session.onAnimationUpdate = (state, emotionEx, lipSync, imageLink) => {
        setExpression(emotionEx || 'happy');
        if (imageLink) {
          setCurrentVisual(imageLink);
        }
      };

      session.on3DAnimation = (anim) => {
        setAnjali3DAnimation(anim as AnjaliAnimationState);
      };

      session.onBoardUpdate = async (action, type, content) => {
        if (!user) return;
        let finalContent = content;

        if (action === "clear") {
           setBoardElements([]);
           localStorage.setItem(`board_${user.uid}`, JSON.stringify([]));
        } else if (action === "add") {
          const newElement: BoardElement = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: type as any,
            content: finalContent,
            timestamp: Date.now()
          };
          setBoardElements(prev => {
            const updated = [...prev, newElement];
            localStorage.setItem(`board_${user.uid}`, JSON.stringify(updated));
            return updated;
          });
          if (activeTab !== "board") setActiveTab("board");
        } else if (action === "replace") {
          setBoardElements(prev => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], type: type as any, content: finalContent, timestamp: Date.now() };
            localStorage.setItem(`board_${user.uid}`, JSON.stringify(updated));
            return updated;
          });
        }
      };

      session.onClose = () => {
        if (isUserIntentionalDisconnect.current || session.isIntentionalStop) {
          setIsSessionActive(false);
          setAgentLogs([]);
          setStudyTool(null);
          liveSessionRef.current = null;
        }
      };

      session.onMakeCall = (phoneNumber) => {
        initiateCall(phoneNumber);
      };

      session.onReconnect = () => {
        if (!isUserIntentionalDisconnect.current) {
          console.log("Auto-reconnection triggered for main voice session...");
          if (liveSessionRef.current) {
            liveSessionRef.current.isIntentionalStop = true;
            liveSessionRef.current.stop(true);
            liveSessionRef.current = null;
          }
          setTimeout(() => {
            if (!isUserIntentionalDisconnect.current) {
              startLiveSessionInternal();
            }
          }, 800);
        }
      };

      session.onStudyTool = async (type, topic, level) => {
        if (!user) return;
        const charTitle = selectedCharacter === "mahi" ? "Mahi" : selectedCharacter;
        console.log(`Triggering Study Tool: ${type} for ${topic} (${level})`);
        
        // Multi-step professional Agent Logs
        setAgentLogs(prev => [
          ...prev, 
          { id: `${Date.now()}-1`, text: `🤖 ${charTitle} Agent initiated ${type.toUpperCase()} request for: "${topic}"` },
          { id: `${Date.now()}-2`, text: `📚 Querying WBCHSE Semester 3 curriculum and question bank...` }
        ]);
        setIsGeneratingStudy(true);

        try {
          const data = await generateStudyMaterial(topic, type as any, level, quizMathEffectiveKey);
          if (data && ((Array.isArray(data) && data.length > 0) || (data && (data.text || data.points)))) {
            setAgentLogs(prev => [
              ...prev,
              { id: `${Date.now()}-3`, text: `✨ Verified answers and LaTeX formulas with Sem 3 syllabus standards.` },
              { id: `${Date.now()}-4`, text: `🎯 Questions successfully generated! Displaying interactive study deck on screen.` }
            ]);

            if (type === "summary" || type === "keypoints") {
              const text = type === "summary" ? `Summary of ${topic}: ${data.text}` : `Key points for ${topic}:\n${data.points.map((p: string, i: number) => `• ${p}`).join("\n")}`;
              const newMsg: ChatMessage = {
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                sender: "stranger",
                text
              };
              setMessages(prev => {
                const updated = [...prev, newMsg];
                localStorage.setItem(`messages_${user.uid}`, JSON.stringify(updated));
                return updated;
              });
            } else {
              setStudyTool({ type, topic, data });

              // Context injection to Mahi so she can see the exact questions and talk with the student about them
              const qSummary = Array.isArray(data)
                ? data.slice(0, 5).map((q: any, i: number) => `Q${i + 1}: ${q.question || q.questionEn || q.front} (Options: ${q.options?.join(' | ') || ''}, Correct Ans: ${q.correctAnswer ?? q.answer ?? q.back})`).join('\n')
                : JSON.stringify(data).slice(0, 300);

              try {
                session.sendText(`[SYSTEM NOTICE FOR ${charTitle.toUpperCase()}]: The interactive ${type} for "${topic}" is now open on the student's screen with the following questions:\n${qSummary}\nPlease acknowledge this warmly, ask the student to solve Question 1, and be ready to evaluate their answers!`);
              } catch (injectErr) {
                console.debug("Could not inject questions context to session:", injectErr);
              }
            }
          } else {
            setAgentLogs(prev => [...prev, { id: `${Date.now()}-err`, text: `⚠️ Notice: Failed to generate content for ${topic}. Please try again.` }]);
          }
        } catch (err) {
          console.error("Study Tool Generation Failed:", err);
          setAgentLogs(prev => [...prev, { id: `${Date.now()}-syserr`, text: `System Notice: Generation timed out for ${type}` }]);
        } finally {
          setIsGeneratingStudy(false);
        }
      };

      let attempts = 0;
      const maxAttempts = 5;
      while (attempts < maxAttempts) {
        if (isUserIntentionalDisconnect.current) break;
        try {
          await session.start();
          break;
        } catch (e: any) {
          attempts++;
          const errorMsg = e?.message || "";
          const isRetryable = errorMsg.includes("Internal error") || errorMsg.includes("unavailable") || errorMsg.includes("Network error");
          if (attempts < maxAttempts && isRetryable && !isUserIntentionalDisconnect.current) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
          } else throw e;
        }
      }
    } catch (e: any) {
      console.warn("Live session startup notice:", e?.message || e);
      if (!isUserIntentionalDisconnect.current) {
        setIsSessionActive(false);
        setAppState("idle");
        const msg = e?.message || "Failed to start AI session.";
        setPermError(msg);
        if (msg.toLowerCase().includes("mic") || msg.toLowerCase().includes("permission")) {
          setShowTextInput(true);
        }
      }
    }
  };

  const requireApiKey = (featureName: string): boolean => {
    const hasKey = customApiKey || quizMathApiKey || localStorage.getItem("gemini_api_key");
    if (!hasKey) {
      setApiKeyFeatureNotice(`Please provide your Gemini API Key to use ${featureName}.`);
      setShowApiKeyPrompt(true);
      return false;
    }
    return true;
  };

  const toggleListening = async () => {
    if (isSessionActive) {
      stopVoiceSession();
    } else {
      if (!requireApiKey("the real-time AI Voice Mentor")) return;
      await startLiveSessionInternal();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    handleTextCommand(textInput);
    setTextInput("");
    localStorage.removeItem("draft_textInput");
    setShowTextInput(false);
  };

  const clearBoard = async () => {
    if (!user) return;
    setBoardElements([]);
    localStorage.setItem(`board_${user.uid}`, JSON.stringify([]));
  };

  const addBoardElement = (element: { type: "text" | "image"; content: string }) => {
    const newElement: BoardElement = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: element.type,
      content: element.content,
      timestamp: Date.now()
    };
    setBoardElements(prev => {
      const updated = [...prev, newElement];
      if (user) {
        localStorage.setItem(`board_${user.uid}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  if (!isAuthReady) {
    return (
      <AppLoadingScreen 
        onFinish={() => setIsAuthReady(true)}
      />
    );
  }

  if (!user) {
    if (!showAuthForm) {
      return (
        <>
          <LandingPage 
            onStartLogin={() => setShowAuthForm(true)} 
            onOpenPrivacy={() => setShowPrivacyModal(true)} 
            onStartGuestLive={handleStartGuestLiveMode}
            onOpenHelp={() => setShowHelpSupportModal(true)}
          />

          {/* Help & Support Command Guide Modal */}
          {showHelpSupportModal && (
            <HelpAndSupportModal
              onClose={() => setShowHelpSupportModal(false)}
              userTelegramUsername="Studystranger_bot"
              onOpenLiveVoice={handleStartGuestLiveMode}
            />
          )}

          {/* Privacy Policy Modal */}
          {showPrivacyModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2.5rem] p-6 max-w-md w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-100 text-slate-700 text-left"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-sm uppercase tracking-wider">
                    <Shield size={20} />
                    <span>Privacy Policy & Security</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowPrivacyModal(false)}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p className="font-bold text-slate-900">
                    Study Stranger ("Class 12 WBCHSE Companion") Privacy Notice:
                  </p>

                  <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1">
                    <p className="font-extrabold text-indigo-900 text-[11px] uppercase tracking-wide">1. Data Encryption & Firebase Auth Domain</p>
                    <p className="text-[11px] text-indigo-950/80">
                      All user logins (Username/Email & Google Sign-In via <code className="bg-indigo-100 px-1 py-0.5 rounded text-indigo-900 font-mono">fundamental-tract-2sjh2.firebaseapp.com</code>) are secured using Google Firebase SSL/TLS encryption. Your credentials and passwords are encrypted and safe under <strong>Study Stranger</strong> security policy.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                    <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wide">2. Personal GPT-6 Astra API Key</p>
                    <p className="text-[11px]">
                      Your custom GPT-6 Astra API Key (if provided) is stored directly in your encrypted user account or local storage to run AI Study Mentors and doubt solvers. It is never shared or sold.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                    <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wide">3. WBCHSE Exam Performance</p>
                    <p className="text-[11px]">
                      Your MCQ test scores, streak counts, and mistakes bank are saved securely to generate personal AI insights and keep track of your Semester 3 preparation.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                    <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wide">4. User Privacy Rights</p>
                    <p className="text-[11px]">
                      You have total control over your account. You can log out anytime or update your profile details in Hub Settings.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                    <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wide">5. App Developer & Ownership</p>
                    <p className="text-[11px]">
                      This application is developed and owned by <strong>Darkness</strong>.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(false)}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                >
                  I Understand & Agree
                </button>
              </motion.div>
            </div>
          )}
        </>
      );
    }

    return (
      <div className="min-h-screen bg-[#FDFCFB] text-slate-800 flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-x-hidden selection:bg-orange-500 selection:text-white">
        {/* Soft Warm Ambient Glows */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-400/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-400/10 rounded-full blur-[140px]" />
          <div className="absolute top-[30%] right-[5%] w-[35%] h-[35%] bg-rose-400/5 rounded-full blur-[120px]" />
        </div>

        {/* 1. Sleek Top Navigation Bar */}
        <header className="w-full max-w-4xl mx-auto py-2.5 px-4 sm:px-6 flex items-center justify-between z-20 relative bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl sm:rounded-full shadow-xs">
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setShowAuthForm(false);
            }}
            className="px-3 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 shadow-xs hover:shadow rounded-xl text-slate-700 hover:text-orange-600 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowRight size={13} className="rotate-180 text-orange-500" />
            <span>App Overview</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/25">
              <Bot size={16} />
            </div>
            <span className="font-black text-sm tracking-tight text-slate-900">Study Stranger</span>
            <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
              WBCHSE Class 12
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Firebase</span> SSL Verified
            </span>
          </div>
        </header>

        {/* 2. Main Login / Registration Card Container */}
        <div className="flex-1 flex items-center justify-center py-6 sm:py-8 z-10 relative">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-lg w-full space-y-6 my-auto"
          >
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto text-white shadow-md shadow-orange-500/25">
                <Bot size={28} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {isRegistering ? "Student Registration" : "Study Stranger Sign In"}
                </h1>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">
                  {isRegistering ? "Join WBCHSE Class 12 study portal" : "Sign in to access your AI mentor & exams"}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500" />
            {isRegistering ? (
              <div className="space-y-8">
                {/* Progress Header */}
                <div className="flex items-center justify-between mb-8 px-4">
                  {steps.map((s) => (
                    <div key={s.id} className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all duration-500 relative ${
                        regStep >= s.id ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200" : "bg-slate-100 text-slate-300"
                      }`}>
                        {regStep > s.id ? <Check size={20} strokeWidth={3} /> : s.icon}
                        {regStep === s.id && (
                          <motion.div 
                            layoutId="ring"
                            className="absolute -inset-1 border-2 border-indigo-200 rounded-[1.4rem]"
                            initial={false}
                          />
                        )}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${regStep >= s.id ? "text-indigo-600" : "text-slate-300"}`}>
                        {s.title}
                      </span>
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={regStep}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.05, y: -10 }}
                    className="space-y-8 min-h-[300px] flex flex-col justify-center"
                  >
                    <div className="text-center space-y-2">
                       <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none italic uppercase">{steps[regStep-1].title}</h3>
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">{steps[regStep-1].sub}</p>
                    </div>

                    {regStep === 1 && (
                      <div className="space-y-6">
                        <div className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2.5rem] border border-amber-100 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500"><Sparkles size={64} /></div>
                          <div className="flex gap-6 items-center relative z-10">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-amber-500 shadow-xl shadow-amber-200/50 shrink-0"><BookOpen size={32} /></div>
                            <div className="text-left">
                              <p className="text-[11px] font-black text-amber-800/60 uppercase tracking-widest mb-1">Morning Motivation</p>
                              <p className="text-sm font-bold text-amber-900 leading-snug">"Education is the key to the future. Start your study sync today, {registrationForm.name || "Stranger"}!"</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-left">
                          <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Identify Yourself</label>
                          <input 
                            type="text" 
                            placeholder="YOUR FULL NAME"
                            value={registrationForm.name}
                            onChange={(e) => setRegistrationForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-100 rounded-[1.8rem] px-8 py-5 text-slate-600 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold placeholder:text-slate-300"
                          />
                        </div>
                      </div>
                    )}

                    {regStep === 2 && (() => {
                      const pass = registrationForm.password || "";
                      const hasMinLen = pass.length >= 8;
                      const hasNumber = /\d/.test(pass);
                      const hasSpecial = /[^A-Za-z0-9]/.test(pass);
                      return (
                        <div className="space-y-5">
                          <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white flex items-center gap-6">
                            <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/30"><Shield size={28} /></div>
                            <div className="text-left">
                               <p className="text-xs font-bold text-slate-300">"Security starts with a strong key. Choose a handle you'll remember."</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <input 
                              type="text" 
                              placeholder="@USERNAME"
                              value={registrationForm.username}
                              onChange={(e) => setRegistrationForm(prev => ({ ...prev, username: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-8 py-5 text-slate-600 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-black"
                            />
                            <div className="relative">
                              <input 
                                type={showRegPassword ? "text" : "password"} 
                                placeholder="SECRET PASSWORD"
                                value={registrationForm.password}
                                onChange={(e) => setRegistrationForm(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] pl-8 pr-14 py-5 text-slate-600 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-black"
                              />
                              <button
                                type="button"
                                onClick={() => setShowRegPassword(!showRegPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>

                            <div className="mt-3 px-2 space-y-2 text-xs">
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Password Strength Rules:</p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div className={`flex items-center gap-2 font-bold transition-colors duration-200 ${hasMinLen ? "text-emerald-600" : "text-slate-400"}`}>
                                  {hasMinLen ? <CheckCircle2 size={14} className="text-emerald-500 animate-pulse" /> : <XCircle size={14} className="text-rose-300" />}
                                  <span>8+ Characters</span>
                                </div>
                                <div className={`flex items-center gap-2 font-bold transition-colors duration-200 ${hasNumber ? "text-emerald-600" : "text-slate-400"}`}>
                                  {hasNumber ? <CheckCircle2 size={14} className="text-emerald-500 animate-pulse" /> : <XCircle size={14} className="text-rose-300" />}
                                  <span>1+ Number</span>
                                </div>
                                <div className={`flex items-center gap-2 font-bold transition-colors duration-200 ${hasSpecial ? "text-emerald-600" : "text-slate-400"}`}>
                                  {hasSpecial ? <CheckCircle2 size={14} className="text-emerald-500 animate-pulse" /> : <XCircle size={14} className="text-rose-300" />}
                                  <span>1+ Special</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {regStep === 3 && (
                      <div className="space-y-5">
                        <div className="flex justify-center -space-x-4">
                           <div className="w-12 h-12 rounded-full bg-indigo-100 border-4 border-white flex items-center justify-center text-indigo-600"><Bot size={22} /></div>
                           <div className="w-12 h-12 rounded-full bg-amber-100 border-4 border-white flex items-center justify-center text-amber-600"><Cpu size={22} /></div>
                        </div>

                        {/* Step-by-step English Guide Card */}
                        <div className="p-4 bg-slate-900 text-white rounded-[1.8rem] space-y-2.5 text-left shadow-xl border border-slate-800">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                              <Key size={16} />
                              <span>How to Get Free GPT-6 Astra API Key</span>
                            </div>
                            <a 
                              href="https://aistudio.google.com/app/apikey" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-1 shadow-md hover:brightness-110 active:scale-95 transition-all shrink-0"
                            >
                              <span>Get Key</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>
                          <ol className="text-[11px] text-slate-300 space-y-1 list-decimal pl-4 font-sans leading-relaxed">
                            <li>Click <strong>"Get Key"</strong> button above to open Google AI Studio.</li>
                            <li>Sign in with your standard Google Account.</li>
                            <li>Click <strong>"Create API key"</strong> &rarr; <em>"Create API key in new project"</em>.</li>
                            <li>Copy your key (starts with <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded font-mono text-[10px]">AIzaSy...</code>) and paste it below.</li>
                          </ol>
                        </div>

                        <div className="space-y-3">
                          <input 
                            type="email" 
                            placeholder="PERSONAL EMAIL (Required)"
                            value={registrationForm.email}
                            onChange={(e) => setRegistrationForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-4 text-slate-600 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold"
                          />
                          <div className="relative font-sans">
                            <input 
                              type={showRegApiKey ? "text" : "password"} 
                              placeholder="GPT-6 Astra / Gemini API Key (Optional)"
                              value={registrationForm.apiKey}
                              onChange={(e) => setRegistrationForm(prev => ({ ...prev, apiKey: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] pl-6 pr-14 py-4 text-slate-600 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegApiKey(!showRegApiKey)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {showRegApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {regStep === 4 && (
                      <div className="space-y-6">
                         <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-500 mx-auto border-4 border-white shadow-xl shadow-indigo-100/50">
                            <Target size={36} />
                         </div>
                         <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Select Your Specialization</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: 'exam_prep', label: 'EXAM PREP', icon: '📝' },
                            { id: 'doubt_solving', label: 'DOUBTS', icon: '❓' },
                            { id: 'mcq_practice', label: 'MCQ RUN', icon: '⚡' },
                            { id: 'revision', label: 'REVISION', icon: '🔄' }
                          ].map(r => (
                            <button
                              key={r.id}
                              onClick={() => setRegistrationForm(prev => ({ ...prev, reason: r.id }))}
                              className={`p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group ${
                                registrationForm.reason === r.id ? "bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-200" : "bg-white border-slate-100 text-slate-500 hover:border-indigo-200"
                              }`}
                            >
                              <span className="text-xl mb-2 block">{r.icon}</span>
                              <span className="text-[10px] font-black uppercase tracking-widest block">{r.label}</span>
                              {registrationForm.reason === r.id && (
                                <motion.div layoutId="check-goal" className="absolute top-4 right-4"><Check size={16} /></motion.div>
                              )}
                            </button>
                          ))}
                        </div>
                        {loginError && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-50 py-3 rounded-full">{loginError}</p>}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex gap-4 pt-6">
                   {regStep > 1 && (
                     <button 
                        onClick={() => setRegStep(s => s - 1)}
                        className="p-6 rounded-3xl bg-slate-50 text-slate-400 border border-slate-100 hover:bg-white hover:text-slate-600 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2"
                     >
                       <ArrowLeft size={18} />
                       Back
                     </button>
                   )}
                   <button 
                      onClick={() => {
                        if (regStep < 4) {
                          // Basic validation per step
                          if (regStep === 1 && !registrationForm.name) return setLoginError("Name kothai? (Please enter name)");
                          if (regStep === 2) {
                            if (!registrationForm.username || !registrationForm.password) {
                              return setLoginError("Handle ar password dorkar! (Handle/pass required)");
                            }
                            const pass = registrationForm.password;
                            if (pass.length < 6) {
                              return setLoginError("Password must be at least 6 characters long!");
                            }
                          }
                          if (regStep === 3) {
                            if (!registrationForm.email) return setLoginError("Email address lagbe! (Email required)");
                            if (!registrationForm.email.includes("@")) return setLoginError("Valid email format koro! (e.g. user@gmail.com)");
                          }
                          setLoginError(null);
                          setRegStep(s => s + 1);
                        } else {
                          if (!registrationForm.reason) setRegistrationForm(prev => ({ ...prev, reason: "exam_prep" }));
                          handleRegister();
                        }
                      }}
                      disabled={isSyncing}
                      className="flex-1 py-6 bg-slate-900 text-white rounded-[2.2rem] font-black uppercase tracking-[0.3em] text-xs shadow-[0_20px_40px_-15px_rgba(15,23,42,0.4)] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                   >
                     {regStep === 4 ? (isSyncing ? "SYNCING..." : "ENTER STRANGER STUDY") : "NEXT PHASE"}
                     {regStep < 4 ? <ArrowRight size={18} /> : <Sparkles size={18} className="text-amber-400" />}
                   </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="text-center space-y-1 pb-1">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Welcome Back</h3>
                  <p className="text-xs text-slate-500 font-medium">WBCHSE Class 12 AI Study Portal</p>
                </div>

                {/* 1. Primary Google Sign-In Action */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSyncing}
                  className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 border-2 border-slate-200 hover:border-orange-400 rounded-2xl font-black text-xs tracking-wide flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <span>{isSyncing ? "Signing in..." : "Continue with Google Account"}</span>
                </button>

                <div className="flex items-center gap-3 my-2">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">OR LOGIN WITH USERNAME</span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                {/* 2. Custom Login Form */}
                <form onSubmit={handleCustomLogin} className="space-y-3.5 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                      <UserIcon size={12} className="text-slate-400" />
                      Username or Email
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. abhijit or student@gmail.com"
                      name="username"
                      autoComplete="username"
                      value={loginInput.username}
                      onChange={(e) => setLoginInput(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                      <Lock size={12} className="text-slate-400" />
                      Secret Key (Password)
                    </label>
                    <div className="relative">
                      <input 
                        type={showLoginPassword ? "text" : "password"} 
                        placeholder="••••••••"
                        name="password"
                        autoComplete="current-password"
                        value={loginInput.password}
                        onChange={(e) => setLoginInput(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-4 pr-11 py-3 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all font-bold tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1 pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-[10px] font-bold text-slate-500">Remember Me</span>
                    </label>

                    {!isMaintenanceActive && (
                      <button
                        type="button"
                        onClick={handleGuestSignIn}
                        disabled={isSyncing}
                        className="text-[10px] font-black text-orange-600 hover:text-orange-700 hover:underline uppercase tracking-wider cursor-pointer"
                      >
                        Guest Entry &rarr;
                      </button>
                    )}
                  </div>

                  {loginError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold text-center">
                      {loginError}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isSyncing}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-md shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSyncing ? "Signing In..." : "Sign In to Study Stranger"}</span>
                    <Sparkles size={15} />
                  </button>
                </form>
              </div>
            )}
          </div>

          {!isMaintenanceActive && (
            <div className="pt-2 text-center">
              <button 
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setLoginError(null);
                  setRegStep(1);
                }}
                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-indigo-400 transition-all cursor-pointer"
              >
                {isRegistering ? "Wait, I already have a handle" : "New Stranger? Join the Study Sync"}
              </button>
            </div>
          )}
          </motion.div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 pt-4 relative z-10">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-white/10"></span>
            <button 
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="text-[10px] font-black text-slate-400 hover:text-indigo-400 uppercase tracking-[0.2em] underline transition-colors flex items-center gap-1.5"
            >
              <Shield size={12} className="text-indigo-400" />
              <span>Privacy Policy & Terms</span>
            </button>
            <span className="h-px w-8 bg-white/10"></span>
          </div>
          <p className="text-[9px] text-slate-500 font-semibold tracking-wide">
            WBCHSE Class 12 • Developed by Darkness
          </p>
        </div>

        {/* Privacy Policy Modal */}
        {showPrivacyModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-200 rounded-[2rem] p-6 max-w-md w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl text-slate-700 text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-orange-600 font-black text-sm uppercase tracking-wider">
                  <Shield size={18} />
                  <span>Privacy Policy & Security</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowPrivacyModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                <p className="font-bold text-slate-900">
                  Study Stranger ("Class 12 WBCHSE Companion") Privacy Notice:
                </p>

                <div className="p-3 bg-orange-50/70 rounded-xl border border-orange-100 space-y-1">
                  <p className="font-extrabold text-orange-950 text-[11px] uppercase tracking-wide">1. Data Encryption & Firebase Auth Domain</p>
                  <p className="text-[11px] text-slate-600">
                    All user logins and Google Sign-In are secured using Google Firebase SSL/TLS encryption. Your credentials and passwords are encrypted and safe under <strong>Study Stranger</strong> security policy.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wide">2. Personal Gemini API Key</p>
                  <p className="text-[11px] text-slate-600">
                    Your custom Gemini API Key (if provided) is stored directly in your encrypted user account or local storage to run AI Study Mentors and doubt solvers. It is never shared or sold.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wide">3. WBCHSE Exam Performance</p>
                  <p className="text-[11px] text-slate-600">
                    Your MCQ test scores, streak counts, and mistakes bank are saved securely to generate personal AI insights and keep track of your Semester 3 preparation.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wide">4. User Privacy Rights</p>
                  <p className="text-[11px] text-slate-600">
                    You have total control over your account. You can log out anytime or update your profile details in Hub Settings.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wide">5. App Developer & Ownership</p>
                  <p className="text-[11px] text-slate-600">
                    This application is developed and owned by <strong className="text-orange-600">Darkness</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                I Understand & Agree
              </button>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  if (isMaintenanceActive && !isAdminUser && !showAuthForm) {
    return (
      <MaintenanceScreen 
        user={user} 
        onLogout={logout} 
        onAdminLogin={() => {
          soundEffects.playClick();
          setShowAuthForm(true);
        }} 
      />
    );
  }

  // Intercept and show dedicated Blocked screen if user is suspended/blocked
  if (user && (user.status === "suspended" || user.isBlocked) && !user.isAdmin) {
    return <BlockedUserScreen user={user} onLogout={logout} />;
  }

  return (
    <div className={`h-[100dvh] w-screen bg-[#f8fafc] dark:bg-[#1C1917] text-slate-900 dark:text-stone-100 flex flex-col font-sans relative overflow-hidden m-0 p-0 ${
      interfaceType === "android" ? "md:bg-slate-950 md:p-6 md:items-center md:justify-center md:flex" : 
      interfaceType === "tablet" ? "md:bg-slate-950 md:p-4 lg:p-6 md:items-center md:justify-center md:flex" : ""
    }`}>
      {(interfaceType === "android" || interfaceType === "tablet") && (
        <div className="hidden md:block absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
          <CinematicBackground character={selectedCharacter} state={appState} />
        </div>
      )}

      {/* Device frame wrapper inside */}
      <div className={`w-full h-full flex flex-col relative overflow-hidden ${
        interfaceType === "android"
          ? "md:max-w-[430px] md:h-[860px] md:rounded-[44px] md:border-[12px] md:border-stone-900 md:shadow-[0_30px_70px_rgba(0,0,0,0.8)] md:bg-[#f8fafc] dark:md:bg-[#1C1917] md:relative md:z-10"
          : interfaceType === "tablet"
          ? "md:max-w-[820px] lg:max-w-[920px] md:h-[94vh] md:max-h-[960px] md:rounded-[36px] md:border-[10px] md:border-stone-900 md:shadow-[0_30px_70px_rgba(0,0,0,0.8)] md:bg-[#f8fafc] dark:md:bg-[#1C1917] md:relative md:z-10"
          : ""
      }`}>
        {/* Android system status bar mock */}
        {interfaceType === "android" && (
          <div className="hidden md:flex bg-white dark:bg-stone-900 px-5 py-2 items-center justify-between text-[10px] font-mono text-zinc-500 font-bold select-none border-b border-slate-100 dark:border-stone-800 flex-shrink-0 relative z-50">
            <span className="flex items-center gap-1">
              Stranger Sim <span className="text-[9px] bg-slate-100 dark:bg-stone-800 text-slate-500 rounded px-1 scale-90 font-sans">5G</span>
            </span>
            <div className="w-24 h-4 bg-stone-900 rounded-full flex items-center justify-center text-[7px] gap-1 opacity-90 mx-auto -mt-1 mr-auto pointer-events-none">
              <span className="w-1.5 h-1.5 bg-sky-950 rounded-full border border-zinc-800" />
              <span className="w-1 h-1 bg-sky-900 rounded-full" />
            </div>
            <div className="flex items-center gap-1.5">
              <span>100%</span>
              <div className="w-5 h-2.5 bg-slate-200 dark:bg-stone-700 rounded-sm border border-slate-300 dark:border-stone-600 p-0.5 flex">
                <div className="h-full w-full bg-emerald-500 rounded-[2px]" />
              </div>
              <span className="font-sans font-black">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        )}

        {/* Tablet system status bar mock */}
        {interfaceType === "tablet" && (
          <div className="hidden md:flex bg-white dark:bg-stone-900 px-6 py-2 items-center justify-between text-[11px] font-mono text-zinc-500 font-bold select-none border-b border-slate-100 dark:border-stone-800 flex-shrink-0 relative z-50">
            <span className="flex items-center gap-2">
              <Tablet size={13} className="text-[#FF7A30]" />
              <span className="font-sans font-extrabold text-stone-800 dark:text-stone-200">Study Stranger Tab Pro</span>
              <span className="text-[9px] bg-[#FF7A30]/15 text-[#FF7A30] font-black rounded-full px-2 py-0.5 font-sans">Wi-Fi 6E</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-stone-400 font-sans">WBCHSE Class 12 Sem 3 Hub</span>
              <div className="flex items-center gap-1.5">
                <span>98%</span>
                <div className="w-6 h-3 bg-slate-200 dark:bg-stone-700 rounded-sm border border-slate-300 dark:border-stone-600 p-0.5 flex">
                  <div className="h-full w-[98%] bg-emerald-500 rounded-[2px]" />
                </div>
                <span className="font-sans font-black ml-1">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        )}

        <CinematicBackground character={selectedCharacter} state={appState} isDarkMode={isDarkMode} />
      
      {/* Header */}
      {/* Camera Preview */}
      <div className={`fixed bottom-32 right-6 z-50 transition-all duration-500 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-white ${isCameraActive ? 'w-48 h-32 opacity-100 scale-100' : 'w-0 h-0 opacity-0 scale-50'}`}>
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Premium Material 3 Header with Adaptive Elevation & Role Controls */}
      <AppHeader
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedCharacter={selectedCharacter}
        isSessionActive={isSessionActive}
        appState={appState}
        user={user}
        unreadNotificationsCount={unreadNotificationsCount}
        prefMode={prefMode}
        detectedType={detectedType}
        isKidsMode={isKidsMode}
        isAppInstalled={isAppInstalled}
        themeMode={themePreference}
        isDarkMode={isDarkMode}
        onToggleThemeMode={cycleThemePreference}
        onOpenAdsCenter={() => setShowAdsCenter(true)}
        onOpenDialer={() => {
          if (AndroidPermissionService.areAllPhonePermissionsGranted()) {
            setShowDialer(true);
          } else {
            setPendingCallNumber(undefined);
            setPendingContactName(undefined);
            setShowAndroidPermissionModal(true);
          }
        }}
        onOpenNotifications={() => setShowNotificationCenter(true)}
        onOpenMobileMenu={() => setShowMobileQuickMenu(true)}
        onSetPrefMode={(mode) => {
          setPrefMode(mode);
          localStorage.setItem("pref_interface_type", mode);
          addGlobalAction(`Switched workspace type to ${mode} mode`);
        }}
        onToggleKidsMode={() => {
          const next = !isKidsMode;
          setIsKidsMode(next);
          localStorage.setItem("pref_kids_mode", next ? "true" : "false");
          syncUserProfile({ isKidsMode: next });
        }}
        onInstallPWA={handleInstallPWA}
        onOpenNoticeBoard={() => setShowNoticeBoard(true)}
        onOpenAdminPanel={() => setShowAdminPanel(true)}
        onOpenTelegram={() => setShowTelegramPortal(true)}
        onOpenMemoryVault={() => setShowMemoryVault(true)}
        onOpenThemes={() => setShowThemeSelectorModal(true)}
        onOpenAccountability={() => setShowAccountabilityModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenSettings={() => setShowSettings(!showSettings)}
        onOpenHelp={() => setShowHelpSupportModal(true)}
      />

      {/* Upfront Android Phone & Contacts Permission Banner (Strictly ADMIN ONLY) */}
      <AnimatePresence>
        {(user?.isAdmin || user?.role === 'admin') && !AndroidPermissionService.areAllPhonePermissionsGranted() && !dismissedPhonePermBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-indigo-950 via-zinc-900 to-emerald-950 text-white border-b border-indigo-500/30 px-3.5 py-2 flex items-center justify-between gap-3 text-xs shadow-inner z-20"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                <Smartphone size={15} />
              </div>
              <div className="truncate">
                <span className="font-bold text-indigo-200">📞 অ্যাডমিন ফোন ও কন্টাক্ট পারমিশন: </span>
                <span className="text-zinc-300 text-[11px]">ডায়াল প্যাড ও ডিরেক্ট কল টেস্ট ফিচারের পারমিশন সক্রিয় করুন।</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setPendingCallNumber(undefined);
                  setPendingContactName(undefined);
                  setShowAndroidPermissionModal(true);
                }}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1"
              >
                <span>অনুমতি দিন (Allow)</span>
              </button>
              <button
                onClick={() => {
                  setDismissedPhonePermBanner(true);
                  sessionStorage.setItem("dismiss_phone_perm_banner", "true");
                }}
                className="p-1 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 h-full w-full relative flex flex-col overflow-y-auto overflow-x-hidden scroll-smooth">
        {isKidsMode ? (
          <KidsModeDashboard
            userName={user?.displayName || "ছোট্ট বন্ধু"}
            geminiApiKey={customApiKey}
            onExitKidsMode={() => {
              setIsKidsMode(false);
              localStorage.setItem("pref_kids_mode", "false");
              syncUserProfile({ isKidsMode: false });
            }}
            onOpenSettings={() => setShowSettings(true)}
          />
        ) : currentView === "dashboard" ? (
          <Dashboard 
            userName={user?.displayName || "Abhijit"} 
            userPhoto={user?.photoURL}
            userUid={user?.uid}
            onLogin={login}
            onLogout={logout}
            dailyGoals={dailyGoals}
            globalActions={globalActions}
            isAdmin={Boolean(user?.isAdmin || user?.role === 'admin' || (user?.email && user.email.toLowerCase() === 'jhhh47943@gmail.com'))}
            isDarkMode={isDarkMode}
            themeMode={themePreference}
            onToggleThemeMode={cycleThemePreference}
            onOpenBuildDocs={() => setShowBuildDocs(true)}
            onOpenProfile={() => setShowProfileModal(true)}
            onOpenThemes={() => setShowThemeSelectorModal(true)}
            toggleGoal={(id) => {
              const updated = dailyGoals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
              setDailyGoals(updated);
              if (user) {
                localStorage.setItem(`goals_${user.uid}`, JSON.stringify(updated));
                if (updated.find(g => g.id === id)?.completed) {
                   addGlobalAction(`Completed goal: ${updated.find(g => g.id === id)?.text}`);
                }
              }
            }}
            onAction={(action) => {
              if (action.startsWith('search_topic:')) {
                const topic = action.split(':')[1];
                setExploredTopic(topic);
                return;
              }
              if (action === 'begin_sync') {
                if (requireApiKey("the Voice Mentor")) toggleListening();
                return;
              }
              if (action === 'show_history') setShowHistoryModal(true);
              if (action === 'show_math') {
                if (!requireApiKey("the Math & Science Solver")) return;
                setShowMathSolver(true);
              }
              if (action === 'show_mock') {
                if (!requireApiKey("the custom MCQ Mock Test Engine")) return;
                setShowMockTest(true);
              }
              if (action === 'show_syllabus') setShowSyllabus(true);
              if (action === 'show_mistakes') setShowMistakeBank(true);
              if (action === 'show_doubt') {
                if (!requireApiKey("the AI Doubt Solver")) return;
                setShowDoubtSolver(true);
              }
              if (action === 'show_revision') setShowRevisionCards(true);
              if (action === 'show_insights' || action === 'show_analytics') setShowPerformanceInsights(true);
              if (action === 'show_scanner') {
                if (!requireApiKey("the Smart Question Scanner")) return;
                setShowScanner(true);
              }
              if (action === 'show_speedblitz') {
                if (!requireApiKey("Speed Blitz Rapid Fire Quiz")) return;
                setShowSpeedBlitz(true);
              }
              if (action === 'show_leaderboard') setShowLeaderboard(true);
              if (action === 'show_resources') setShowResourceLibrary(true);
              if (action === 'show_mindmap' || action === 'show_visualizer') {
                if (!requireApiKey("the AI Mind Map Generator")) return;
                setShowMindMap(true);
              }
              if (action === 'show_ads') setShowAdsCenter(true);
              if (action === 'show_study_advantage') setShowStudyAdvantage(true);
              if (action === 'show_memory') setShowMemoryVault(true);
              if (action === 'show_focus_room') setShowFocusRoom(true);
              if (action === 'show_mcq_bank') {
                if (!requireApiKey("the High-Yield MCQ Bank")) return;
                setShowMCQBank(true);
              }
              if (action === 'show_flashcards') {
                if (!requireApiKey("the AI Flashcard Generator")) return;
                setShowFlashcards(true);
              }
              if (action === 'show_booster' || action === 'show_exam_booster') {
                if (!requireApiKey("the Exam Booster Hub")) return;
                setShowExamBooster(true);
              }
              if (action === 'show_telegram') setShowTelegramPortal(true);
              if (action === 'show_notices' || action === 'show_notice_board') setShowNoticeBoard(true);
              if (action === 'show_admin' || action === 'show_admin_panel') {
                const isUserAdmin = Boolean(user?.isAdmin || user?.role === 'admin' || (user?.email && user.email.toLowerCase() === 'jhhh47943@gmail.com'));
                if (isUserAdmin) {
                  setShowAdminPanel(true);
                } else {
                  nativeService.showToast('Access restricted: Only Admin can open this panel');
                }
              }
              if (action === 'show_notifications') setShowNotificationCenter(true);
              if (action === 'show_profile' || action === 'show_education_profile') setShowProfileModal(true);
              if (action === 'show_exam_prep' || action === 'show_exam_engine') setShowExamPrepEngine(true);
              if (action === 'show_themes' || action === 'show_theme') setShowThemeSelectorModal(true);
              if (action === 'show_3d_lab' || action === 'show_science_lab') setShowScienceLab3D(true);
              if (action === 'show_autopsy' || action === 'show_ai_autopsy') setShowAIAutopsy(true);
              if (action === 'show_voice_quiz') setShowVoiceQuiz(true);
              if (action === 'show_quiz_duel' || action === 'show_duel') setShowQuizDuel(true);
              if (action === 'show_printable_pdf' || action === 'show_omr_pdf') setShowPrintablePDF(true);
              if (action === 'show_formula_diary' || action === 'show_diary') setShowFormulaDiary(true);
              if (action === 'show_accountability' || action === 'accountability' || action === 'calling_vigilance') setShowAccountabilityModal(true);
            }} 
          />
        ) : (
          <>
            {/* Desktop Sidebar: Chat */}
            <aside className="hidden md:flex flex-col w-80 border-r border-slate-100 bg-slate-50/50 backdrop-blur-3xl p-4 gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 font-mono">
              <MessageSquare size={12} /> System_Logs
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={saveCurrentSession}
                title="Save & New Session"
                className="text-slate-300 hover:text-indigo-500 transition-colors"
              >
                <Sparkles size={12} />
              </button>
              <button onClick={() => setMessages([])} className="text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {messages.map((msg, idx) => {
              const isLastMentorMsg = msg.sender !== 'user' && idx === messages.length - 1;
              return (
                <div key={`msg-${msg.id}-${idx}`} className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[95%] p-3 rounded-xl text-[11px] leading-relaxed font-mono ${
                    msg.sender === 'user' ? 'bg-indigo-50 color-indigo-600 border border-indigo-100' : 'bg-white text-slate-600 border border-slate-200'
                  }`}>
                    <div className="opacity-40 mb-1 flex justify-between gap-4">
                      <span>{msg.sender === 'user' ? 'ABHIJIT' : 'MENTOR'}</span>
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    {msg.sender === 'user' ? (
                      msg.text
                    ) : (
                      <TypewriterText
                        text={msg.text}
                        enabled={isLastMentorMsg}
                        speed={14}
                        chunkSize={3}
                        onComplete={() => {
                          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                        }}
                        cursorClassName="inline-block w-1.5 h-3 bg-[#FF7A30] ml-0.5 align-middle animate-pulse"
                      />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </aside>

        {/* Centre Content area */}
        <section className="flex-1 relative flex flex-col min-w-0">
          {/* Mobile Sub-Tabs (Mentor/Board/Tools) - Only shown in Active View on Mobile at the top */}
          {currentView === 'active' && (
            <div className="md:hidden w-full flex justify-center px-4 pt-3 pb-1 z-40 relative">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[340px] pointer-events-auto bg-stone-900/90 backdrop-blur-2xl border border-stone-800 rounded-[2rem] p-1 flex gap-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.4)]"
              >
                {[
                  { id: 'mentor', label: 'Mentor', icon: <UserIcon size={14} /> },
                  { id: 'board', label: 'Board', icon: <BoardIcon size={14} /> },
                  { id: 'tools', label: 'Tools', icon: <BookOpen size={14} /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as MobileTab)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[1.5rem] text-[9.5px] uppercase tracking-wider transition-all ${
                      activeTab === tab.id 
                        ? 'bg-[#EF6D2F] text-white shadow-lg shadow-[#EF6D2F]/30 font-black scale-[1.02]' 
                        : 'text-stone-400 hover:text-white hover:bg-stone-800/50 font-bold'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </motion.div>
            </div>
          )}

          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {/* Mentor Sync - Main View */}
              {activeTab === 'mentor' && (
                <motion.div
                  key="mentor"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex flex-col items-center justify-between p-2 pb-24 overflow-hidden pointer-events-auto"
                >
                  {/* Top Quick Voice Actions Strip */}
                  <div className="w-full max-w-md flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1.5 px-3 z-20">
                    {(selectedCharacter === "anjali" ? [
                      { label: "💃 Dance Koro!", prompt: "Anjali, ekta bhalo dance kore dekhaw!", action: () => setAnjali3DAnimation("dancing") },
                      { label: "👋 Wave Hi", prompt: "Anjali, say hi to me!", action: () => setAnjali3DAnimation("wave") },
                      { label: "💡 Think", prompt: "Anjali, think about this problem.", action: () => setAnjali3DAnimation("thinking") },
                      { label: "🧬 Bio MCQs", prompt: "Ask me 5 high-yield WBCHSE Class 12 Biology MCQs from Unit 1 Reproduction right now." },
                      { label: "📖 Adarini Story", prompt: "Explain the story and themes of Bengali prose Adarini in simple Bengali." },
                      { label: "🗣️ Speak Bangla", prompt: "Please speak and explain in pure, friendly Bengali (বাংলায় সহজ করে বুঝিয়ে দাও)." },
                    ] : [
                      { label: "🧬 Biology 5 MCQs", prompt: "Ask me 5 high-yield WBCHSE Class 12 Biology MCQs from Unit 1 Reproduction right now." },
                      { label: "📖 Explain Adarini", prompt: "Explain the story and themes of Bengali prose Adarini by Prabhat Kumar Mukhopadhyay in simple Bengali." },
                      { label: "⚡ Mendel Laws", prompt: "Summarize Mendel's Laws of Inheritance and Linkage in English and Bengali." },
                      { label: "📜 The Bet Summary", prompt: "Explain Anton Chekhov's The Bet and the lawyer's 15-year wager." },
                      { label: "📋 Send Diagram to Board", prompt: "Show and explain the diagram of human sperm fertilization on the Live Board." },
                      { label: "🗣️ Explain in Bangla", prompt: "Please speak and explain in pure, friendly Bengali (বাংলায় সহজ করে বুঝিয়ে দাও)." },
                    ]).map((chip: any, idx) => (
                      <button
                        key={`voice-chip-${chip.label}-${idx}`}
                        onClick={() => {
                          if (chip.action) chip.action();
                          handleTextCommand(chip.prompt);
                          if (!isSessionActive) {
                            startLiveSessionInternal();
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all whitespace-nowrap shadow-xs active:scale-95 ${
                          chip.label.includes("Dance") 
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400 shadow-md shadow-pink-500/25" 
                            : "bg-white/90 border-slate-200 text-slate-700 hover:text-white hover:bg-orange-500 hover:border-orange-500"
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Center Visualizer with Mood Tray / 3D Viewer */}
                  <div className="flex-1 w-full relative flex items-center justify-center pointer-events-auto">
                    <Visualizer 
                      state={appState} 
                      characterName={selectedCharacter} 
                      currentVisual={currentVisual} 
                      expression={expression}
                      onSelectExpression={(expr) => setExpression(expr)}
                      anjali3DAnimation={anjali3DAnimation}
                      onAnjaliAnimationChange={setAnjali3DAnimation}
                      userName={user?.displayName || user?.email?.split('@')[0] || "Student"}
                      userId={user?.uid || user?.email?.split('@')[0] || ""}
                    />
                  </div>

                  {/* Live Floating Subtitle / Transcript Banner with Interactive Voice Controls */}
                  {messages.length > 0 && (
                    <div className="w-full max-w-md px-4 z-20 pointer-events-auto mb-2">
                      <motion.div
                        key={`transcript-${messages[messages.length - 1]?.id || messages.length}-${messages[messages.length - 1]?.sender}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-2xl bg-stone-900/95 backdrop-blur-xl border border-stone-800 shadow-2xl space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-stone-800/80 pb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF7A30] flex items-center gap-1">
                              {messages[messages.length - 1]?.sender === 'user' ? '🎙️ You' : `✨ ${selectedCharacter.toUpperCase()}`}
                            </span>
                            {(appState === 'speaking' || isAudioSpeaking) && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                                <span className="w-1.5 h-1.5 bg-[#FF7A30] rounded-full" />
                                <span className="text-[9px] font-mono text-orange-400 font-bold">Speaking</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Voice speed toggle */}
                            <button
                              type="button"
                              onClick={handleCycleVoiceSpeed}
                              title="Voice Speed"
                              className="px-2 py-0.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-mono font-bold transition-all border border-stone-700"
                            >
                              {voicePlaybackSpeed}x
                            </button>

                            {/* Voice Replay Button */}
                            <button
                              type="button"
                              onClick={() => handleReplayVoice(messages[messages.length - 1]?.text)}
                              title="Replay Voice (কথা শোনো)"
                              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold ${
                                isAudioSpeaking || appState === 'speaking'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-stone-800 hover:bg-[#FF7A30] text-stone-200 hover:text-white border border-stone-700'
                              }`}
                            >
                              <Volume2 size={13} className={isAudioSpeaking ? 'animate-pulse' : ''} />
                              <span className="hidden sm:inline">
                                {isAudioSpeaking ? 'Stop' : 'Listen'}
                              </span>
                            </button>
                          </div>
                        </div>

                        <p className="text-xs font-medium text-stone-200 line-clamp-3 leading-relaxed text-left">
                          "{messages[messages.length - 1]?.sender === 'stranger' ? (
                            <TypewriterText
                              text={messages[messages.length - 1]?.text}
                              speed={15}
                              chunkSize={2}
                              cursorClassName="inline-block w-1.5 h-3 bg-[#FF7A30] ml-0.5 align-middle animate-pulse"
                            />
                          ) : (
                            messages[messages.length - 1]?.text
                          )}"
                        </p>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Learning Board */}
              {activeTab === 'board' && (
                <motion.div
                  key="board"
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0 flex flex-col p-1 sm:p-2.5 md:p-6 pb-24 sm:pb-28 md:pb-6"
                >
                  <LiveBoard 
                    elements={boardElements} 
                    isExpanded={isBoardExpanded} 
                    onToggleExpand={() => setIsBoardExpanded(!isBoardExpanded)} 
                    onClearBoard={clearBoard}
                    onAddElement={addBoardElement}
                  />
                </motion.div>
              )}

              {/* Study Tools Hub */}
              {activeTab === 'tools' && (
                <motion.div
                  key="tools"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 p-6 md:p-12 overflow-y-auto"
                >
                  <div className="max-w-4xl mx-auto space-y-12 pb-60">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col gap-2"
                    >
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 leading-none">
                        <Sparkles className="text-indigo-500" />
                        Academic Hub
                      </h2>
                      <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Study stranger • Session Tools</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      {[
                        { id: 'math', label: 'Math Solver', desc: 'AI Equation Resolver', icon: <Calculator size={24} />, action: () => { if (!requireApiKey("the Math Solver")) return; setShowMathSolver(true); }, color: 'bg-indigo-50 text-indigo-600', shadow: 'shadow-indigo-100' },
                        { id: 'test', label: 'Mock Exam', desc: 'Syllabus Based Tests', icon: <Brain size={24} />, action: () => { if (!requireApiKey("the Mock Exam Engine")) return; setShowMockTest(true); }, color: 'bg-rose-50 text-rose-600', shadow: 'shadow-rose-100' },
                        { id: 'syllabus', label: 'Syllabus', desc: 'WBCHSE Sem 3 Tracking', icon: <BookOpen size={24} />, action: () => setShowSyllabus(true), color: 'bg-emerald-50 text-emerald-600', shadow: 'shadow-emerald-100' },
                        { id: 'history', label: 'Session Hist', desc: 'Previous Interactions', icon: <Clock size={24} />, action: () => setShowHistoryModal(true), color: 'bg-amber-50 text-amber-600', shadow: 'shadow-amber-100' },
                      ].map((tool, i) => (
                        <motion.button
                          key={tool.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * i }}
                          whileHover={{ y: -8, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={tool.action}
                          className="p-6 md:p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all flex items-start gap-6 text-left group"
                        >
                          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-3xl ${tool.color} flex items-center justify-center transition-all group-hover:scale-110 ${tool.shadow}`}>
                            {tool.icon}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-base md:text-lg font-black text-slate-800">{tool.label}</span>
                            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{tool.desc}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
          </>
        )}
      </main>

      {/* Nav Hub & Footer Controls */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 px-4 md:px-6 pb-2.5 md:pb-5 pt-2 flex flex-col items-center pointer-events-none">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-950/20 to-transparent pointer-events-none" />

        {/* Global Navigation Hub */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[340px] pointer-events-auto"
        >
          <nav className="bg-stone-900/90 backdrop-blur-2xl border border-stone-800 rounded-[2.5rem] p-1.5 md:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between relative group/nav">
            {/* Home Button */}
            <button 
              onClick={() => setCurrentView("dashboard")}
              className={`group flex flex-col items-center gap-1 px-3 py-1 md:px-4 md:py-2 transition-all active:scale-95 ${currentView === 'dashboard' ? 'text-[#FF7A30]' : 'text-stone-400'}`}
            >
              <motion.div 
                whileHover={{ scale: 1.08 }}
                className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${currentView === 'dashboard' ? 'bg-[#FF7A30] text-white shadow-lg shadow-[#FF7A30]/35' : 'bg-stone-800 border border-stone-700 hover:bg-stone-700 hover:text-white text-stone-300'}`}
              >
                <Layout size={currentView === 'dashboard' ? 20 : 18} />
              </motion.div>
              <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] transition-colors ${currentView === 'dashboard' ? 'text-[#FF7A30]' : 'text-stone-500 group-hover:text-stone-400'}`}>Home</span>
            </button>

            {/* Mentor Button - Primary Action */}
            <button 
              onClick={toggleListening}
              className={`group flex flex-col items-center gap-1 transition-all active:scale-95 -mt-5 md:-mt-8`}
            >
              <div 
                className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative ${
                  isSessionActive ? 'bg-[#FF7A30] text-white shadow-[#FF7A30]/40 ring-4 ring-orange-500/20' : 'bg-stone-100 text-stone-900 shadow-stone-950/40 hover:bg-white'
                }`}
              >
                {isSessionActive ? <MicOff size={22} className="stroke-[2.5]" /> : <Mic size={22} className="stroke-[2.5]" />}
              </div>
              <span className={`text-[9.5px] md:text-[11.5px] font-black uppercase tracking-[0.15em] transition-colors mt-0.5 ${isSessionActive ? 'text-[#FF7A30]' : 'text-stone-300 group-hover:text-stone-200'}`}>
                {isSessionActive ? 'Syncing' : 'Mentor'}
              </span>
            </button>

            {/* Hub Button */}
            <button 
              onClick={() => setShowSettings(true)}
              className="group flex flex-col items-center gap-1 px-3 py-1 md:px-4 md:py-2 transition-all active:scale-95 text-stone-400"
            >
              <motion.div 
                whileHover={{ scale: 1.08 }}
                className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-stone-800 flex items-center justify-center hover:bg-stone-700 hover:text-white transition-all duration-300 border border-stone-700 text-stone-300"
              >
                <Settings size={18} className="group-hover:rotate-45 transition-transform text-inherit" />
              </motion.div>
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-colors text-stone-500 group-hover:text-stone-400">Hub</span>
            </button>
          </nav>
        </motion.div>

        <AnimatePresence>
          {permError && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full max-w-lg bg-slate-900/95 border border-red-500/30 text-stone-200 p-5 rounded-3xl flex flex-col gap-3 shadow-2xl backdrop-blur-2xl mb-4 pointer-events-auto"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-500/20 text-red-400">
                  <MicOff size={16} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#EF6D2F]">
                  {permError.toLowerCase().includes("key") 
                    ? "Settings Required (সেটিংস প্রয়োজন)" 
                    : permError.toLowerCase().includes("microphone") || permError.toLowerCase().includes("মাইক্রোফোন")
                    ? "Microphone Permission (মাইক্রোফোন অনুমতি)"
                    : "System Error (সিস্টেম ত্রুটি)"}
                </p>
                <button onClick={() => setPermError(null)} className="ml-auto p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"><X size={14} /></button>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-medium leading-relaxed text-stone-200">{permError}</p>
                {permError.toLowerCase().includes("key") && (
                  <p className="text-[11px] text-orange-400/95 font-medium leading-relaxed">
                    {user?.displayName || "Stranger"}, হাবে (Settings) গিয়ে "Personal API Key" বক্সে তোমার Gemini API Key পেস্ট করে দাও, তারপর কথা বলো।
                  </p>
                )}
                {(permError.toLowerCase().includes("microphone") || permError.toLowerCase().includes("মাইক্রোফোন")) && (
                  <p className="text-[11px] text-indigo-300/90 font-medium leading-relaxed">
                    💡 <b>টিপস:</b> প্রিভিউ ফ্রেমে ব্রাউজার মাইক্রোফোন ব্লক করলে <b>"Open in New Tab"</b> বাটনে চাপুন অথবা সরাসরি <b>"Switch to Text Chat"</b> দিয়ে লিখে প্রশ্ন করুন।
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-1">
                <button 
                  onClick={() => setPermError(null)}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-stone-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Dismiss (বন্ধ)
                </button>
                {permError.toLowerCase().includes("key") ? (
                  <button 
                    onClick={() => { setPermError(null); setShowSettings(true); }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/25 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    Open settings (সেটিংস খোলো)
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="px-4 py-2 bg-[#EF6D2F] hover:bg-[#EF6D2F]/80 shadow-lg shadow-[#EF6D2F]/25 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                    >
                      <ExternalLink size={12} /> Open in New Tab (নতুন ট্যাবে খোলো)
                    </button>
                    <button 
                      onClick={() => {
                        setPermError(null);
                        setShowTextInput(true);
                      }}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                    >
                      <MessageSquare size={12} /> Text Chat (লিখে কথা বলো)
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTextInput && (
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onSubmit={handleTextSubmit}
              className="w-full max-w-[360px] flex items-center gap-1.5 bg-stone-900/95 backdrop-blur-2xl border border-stone-800 rounded-2xl p-1.5 pl-2.5 shadow-2xl pointer-events-auto mb-4"
            >
              {/* Mic Voice Dictation Button */}
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                title={isVoiceRecording ? "Listening... (কথা বলা শেষ হলে চাপুন)" : "Tap to Speak (ভয়েসে প্রশ্ন করো)"}
                className={`p-2 rounded-xl transition-all flex items-center justify-center shrink-0 ${
                  isVoiceRecording 
                    ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30" 
                    : "bg-stone-800 hover:bg-[#FF7A30] text-stone-300 hover:text-white"
                }`}
              >
                {isVoiceRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <input 
                type="text"
                value={textInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setTextInput(val);
                  localStorage.setItem("draft_textInput", val);
                }}
                placeholder={isVoiceRecording ? "Listening... বলুন..." : `Ask ${selectedCharacter} (বাংলা বা ইংলিশ)...`}
                className="flex-1 bg-transparent border-none outline-none text-stone-100 placeholder:text-stone-400 text-xs py-2 px-1"
                autoFocus
              />

              <button 
                type="submit" 
                disabled={!textInput.trim()} 
                className="p-2.5 rounded-xl bg-[#FF7A30] hover:bg-[#FF7A30]/90 text-white disabled:opacity-30 transition-all shadow-lg shadow-[#FF7A30]/20 shrink-0"
                title="Send Question"
              >
                <Send size={15} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Camera Toggle Button floating beautifully on bottom left */}
        {currentView === "active" && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.08 }}
            onClick={toggleCamera}
            className={`absolute bottom-3 left-4 md:bottom-6 md:left-8 pointer-events-auto w-12 h-12 rounded-2xl flex items-center justify-center transition-all border shadow-[0_8px_30px_rgba(46,37,32,0.08)] ${
              isCameraActive 
                ? "bg-[#EF6D2F] border-[#EF6D2F] text-white shadow-[#EF6D2F]/25" 
                : "bg-white/95 backdrop-blur-md border-[#EFE5DC] text-[#2E2520] hover:text-[#EF6D2F]"
            }`}
          >
            {isCameraActive ? <CameraOff size={18} /> : <Camera size={18} />}
          </motion.button>
        )}
        
        {/* Keyboard/Text Chat Trigger floating beautifully on bottom right */}
        {currentView === "active" && !isSessionActive && (
          <motion.button 
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => setShowTextInput(!showTextInput)} 
            className={`absolute bottom-3 right-4 md:bottom-6 md:right-8 pointer-events-auto w-12 h-12 rounded-2xl flex items-center justify-center transition-all border shadow-[0_8px_30px_rgba(46,37,32,0.08)] ${
              showTextInput 
                ? "bg-[#2E2520] border-[#2E2520] text-white shadow-stone-800/20" 
                : "bg-white/95 backdrop-blur-md border-[#EFE5DC] text-[#2E2520] hover:text-[#EF6D2F]"
            }`}
          >
            <Keyboard size={18} />
          </motion.button>
        )}
      </footer>

      {/* Ads Center Overlay */}
      <AdsCenter 
        isOpen={showAdsCenter}
        onClose={() => setShowAdsCenter(false)}
        userPoints={user?.points || 0}
        premiumUnlocked={!!user?.premiumUnlocked}
        onUpdatePoints={handleUpdatePoints}
        onUnlockPremium={handleUnlockPremium}
        userName={user?.displayName || "Abhijit"}
      />

      {/* Study Advantage Overlay */}
      <StudyAdvantage 
        isOpen={showStudyAdvantage}
        onClose={() => setShowStudyAdvantage(false)}
        userPoints={user?.points || 0}
        onUpdatePoints={handleUpdatePoints}
        userName={user?.displayName || "Abhijit"}
      />

      {/* Android Runtime Permission Modal (CALL_PHONE & READ_CONTACTS with Zero-Knowledge guarantee) */}
      <AndroidPermissionModal
        isOpen={showAndroidPermissionModal}
        onClose={() => setShowAndroidPermissionModal(false)}
        targetPhoneNumber={pendingCallNumber}
        targetContactName={pendingContactName}
        onPermissionGranted={() => {
          if (pendingCallNumber) {
            const num = pendingCallNumber;
            const contact = pendingContactName;
            setPendingCallNumber(undefined);
            setPendingContactName(undefined);
            initiateCall(num, contact);
          }
        }}
        onDirectCallTriggered={(num) => {
          initiateCall(num);
        }}
        onOpenDialPadTriggered={(num) => {
          AndroidPermissionService.openDialPad(num);
        }}
      />

      {/* Virtual Dialer & Active Outbound Call Screen Overlays */}
      <VirtualDialer 
        isOpen={showDialer}
        onClose={() => setShowDialer(false)}
        selectedCharacter={selectedCharacter}
        characterAvatars={characterAvatars}
        onInitiateCall={initiateCall}
      />

      <ActiveCallScreen 
        activeCall={activeCall}
        selectedCharacter={selectedCharacter}
        characterAvatars={characterAvatars}
        onDisconnect={endCall}
        callHistory={callHistory}
        onInitiateCall={initiateCall}
      />

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            user={user}
            isKidsMode={isKidsMode}
            setIsKidsMode={setIsKidsMode}
            selectedCharacter={selectedCharacter}
            setSelectedCharacter={setSelectedCharacter}
            characterAvatars={characterAvatars}
            customApiKey={customApiKey}
            setCustomApiKey={setCustomApiKey}
            quizMathApiKey={quizMathApiKey}
            setQuizMathApiKey={setQuizMathApiKey}
            preferredQuizModel={preferredQuizModel}
            setPreferredQuizModel={setPreferredQuizModel}
            preferredMathModel={preferredMathModel}
            setPreferredMathModel={setPreferredMathModel}
            cloudflareApiToken={cloudflareApiToken}
            setCloudflareApiToken={setCloudflareApiToken}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            voiceStyle={voiceStyle}
            setVoiceStyle={setVoiceStyle}
            syncUserProfile={syncUserProfile}
            onOpenNotifications={() => setShowNotificationCenter(true)}
            onOpenMemoryVault={() => setShowMemoryVault(true)}
            onOpenAndroidPermissionModal={() => setShowAndroidPermissionModal(true)}
            onOpenDialer={() => setShowDialer(true)}
            onLogout={logout}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingCommand && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-emerald-400/50">
            <span className="text-sm font-bold">Open requested link?</span>
            <div className="flex gap-2">
              <button onClick={() => { window.open(pendingCommand.url, "_blank"); setPendingCommand(null); }} className="bg-white text-emerald-600 px-6 py-2 rounded-xl text-xs font-bold">Yes</button>
              <button onClick={() => setPendingCommand(null)} className="bg-black/20 text-white px-4 py-2 rounded-xl text-xs font-bold">No</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showPermissionModal && <PermissionModal onClose={() => setShowPermissionModal(false)} />}
      
      <AnimatePresence>
        {showMockTest && (
          <MockTest 
            key="modal-mock-test"
            onClose={() => setShowMockTest(false)} 
            character={selectedCharacter} 
            onPointsAwarded={updatePoints} 
            onCompleted={(subject, score) => {
              addGlobalAction(`Achieved ${score}/10 in ${subject} Mock Test!`);
            }}
            apiKey={quizMathEffectiveKey} 
            userName={user?.displayName || "Abhijit"} 
            userId={user?.uid}
          />
        )}
        {showSyllabus && <Syllabus key="modal-syllabus" isOpen={showSyllabus} onClose={() => setShowSyllabus(false)} userName={user?.displayName || "Abhijit"} />}
        {showMathSolver && (
          <MathSolver 
            key="modal-math-solver"
            onClose={() => setShowMathSolver(false)} 
            onSolved={(prob) => {
              addGlobalAction(`Just solved a complex math problem: ${prob.slice(0, 30)}...`);
            }}
            apiKey={quizMathEffectiveKey} 
            userName={user?.displayName || "Abhijit"} 
            userId={user?.uid}
            onOpenApiKeyPrompt={() => {
              setApiKeyFeatureNotice("Please provide your Gemini API Key to use the Math & Science Solver.");
              setShowApiKeyPrompt(true);
            }}
          />
        )}
        {showMistakeBank && <MistakeBank key="modal-mistake-bank" onClose={() => setShowMistakeBank(false)} userId={user?.uid} />}
        {showDoubtSolver && <DoubtSolver key="modal-doubt-solver" onClose={() => setShowDoubtSolver(false)} apiKey={quizMathEffectiveKey} userName={user?.displayName || "Abhijit"} userId={user?.uid} />}
        {showMemoryVault && (
          <AIMemoryVault
            key="modal-memory-vault"
            isOpen={showMemoryVault}
            onClose={() => setShowMemoryVault(false)}
            userId={user?.uid}
            userName={user?.displayName || "Abhijit"}
          />
        )}
        {showRevisionCards && <RevisionCards key="modal-revision-cards" onClose={() => setShowRevisionCards(false)} />}
        {showPerformanceInsights && <PerformanceInsights key="modal-perf-insights" onClose={() => setShowPerformanceInsights(false)} userName={user?.displayName || "Abhijit"} userId={user?.uid} />}
        {showScanner && (
          <SmartScanner 
            key="modal-smart-scanner"
            onClose={() => setShowScanner(false)} 
            onScanned={() => {
              addGlobalAction(`Scanned new study notes and generated MCQs!`);
            }}
            apiKey={quizMathEffectiveKey} 
          />
        )}
        {showResourceLibrary && (
          <ResourceLibrary 
            key="modal-resource-library"
            resources={resources} 
            onClose={() => setShowResourceLibrary(false)} 
            onRemove={(id) => {
              const updated = resources.filter(r => r.id !== id);
              setResources(updated);
              if (user) localStorage.setItem(`resources_${user.uid}`, JSON.stringify(updated));
            }}
          />
        )}
        {showMindMap && <MindMap key="modal-mind-map" onClose={() => setShowMindMap(false)} apiKey={quizMathEffectiveKey} />}
        {showSpeedBlitz && <SpeedBlitz key="modal-speed-blitz" onClose={() => setShowSpeedBlitz(false)} userName={user?.displayName || "Abhijit"} apiKey={quizMathEffectiveKey} />}
        {showScienceLab3D && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-5xl max-h-[96vh] overflow-y-auto rounded-3xl shadow-2xl"
            >
              <ScienceLab3D 
                isModal={true} 
                onClose={() => setShowScienceLab3D(false)} 
                onExploreTopic={(topic) => {
                  setShowScienceLab3D(false);
                  setExploredTopic(topic);
                }}
              />
            </motion.div>
          </motion.div>
        )}
        {showLeaderboard && <StrangerLeaderboard key="modal-leaderboard" onClose={() => setShowLeaderboard(false)} currentUserId={user?.uid} />}
        
        {/* AI Weak Area Autopsy Modal */}
        {showAIAutopsy && (
          <AIExamAutopsyModal
            key="modal-ai-autopsy"
            onClose={() => setShowAIAutopsy(false)}
            userName={user?.displayName || "Abhijit"}
            onOpenSpeedBlitz={() => setShowSpeedBlitz(true)}
            onOpenTopic={(topic) => setExploredTopic(topic)}
          />
        )}

        {/* Voice MCQ Challenge Modal */}
        {showVoiceQuiz && (
          <VoiceMCQQuizModal
            key="modal-voice-quiz"
            onClose={() => setShowVoiceQuiz(false)}
            userName={user?.displayName || "Abhijit"}
          />
        )}

        {/* 1v1 Friend Quiz Duel Modal */}
        {showQuizDuel && (
          <FriendQuizDuelModal
            key="modal-quiz-duel"
            onClose={() => setShowQuizDuel(false)}
            userName={user?.displayName || "Abhijit"}
            userId={user?.uid}
          />
        )}

        {/* Printable Mock Paper & OMR PDF Modal */}
        {showPrintablePDF && (
          <PrintableMockPDFModal
            key="modal-printable-pdf"
            onClose={() => setShowPrintablePDF(false)}
            userName={user?.displayName || "Abhijit"}
          />
        )}

        {/* Formula & Quote Sticky Diary Modal */}
        {showFormulaDiary && (
          <FormulaStickyDiaryModal
            key="modal-formula-diary"
            onClose={() => setShowFormulaDiary(false)}
            userName={user?.displayName || "Abhijit"}
          />
        )}
        
        {/* Quantum Focus Study Room */}
        {showFocusRoom && (
          <FocusStudyRoom 
            key="modal-focus-room"
            onClose={() => setShowFocusRoom(false)} 
            userName={user?.displayName || "Abhijit"} 
          />
        )}

        {/* WBCHSE Sem 3 Question Bank Quiz */}
        {showMCQBank && (
          <QuestionBankQuiz 
            key="modal-mcq-bank"
            onClose={() => setShowMCQBank(false)} 
            userName={user?.displayName || "Abhijit"}
            onPointsAwarded={updatePoints}
          />
        )}

        {/* 3D Flashcard Deck */}
        {showFlashcards && (
          <FlashcardDeck 
            key="modal-flashcard-deck"
            onClose={() => setShowFlashcards(false)} 
            userName={user?.displayName || "Abhijit"} 
          />
        )}

        {/* WBCHSE Sem 3 Audio Podcast & Exam Booster Hub */}
        {showExamBooster && (
          <ExamBoosterHub 
            key="modal-exam-booster"
            onClose={() => setShowExamBooster(false)} 
            userName={user?.displayName || "Abhijit"}
            geminiApiKey={quizMathEffectiveKey}
          />
        )}
        
        {/* Multi-Board Smart AI Exam Preparation Engine */}
        {showExamPrepEngine && (
          <ExamPreparationEngine
            key="modal-exam-preparation-engine"
            isOpen={showExamPrepEngine}
            onClose={() => setShowExamPrepEngine(false)}
            apiKey={quizMathEffectiveKey}
            userName={user?.displayName || "Abhijit"}
            userId={user?.uid}
            onPointsAwarded={updatePoints}
          />
        )}
        
        {/* Chat History Modal */}
        {showHistoryModal && (
          <motion.div key="modal-chat-history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                    <History size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">Chat Archives</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review your past syncs</p>
                  </div>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="p-3 rounded-full hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatSessions.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <Clock size={40} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No sessions archived yet. <br/>Start a sync to build history!</p>
                  </div>
                ) : (
                  chatSessions.map((session, idx) => (
                    <button 
                      key={`session-${session.id}-${idx}`}
                      onClick={() => loadSession(session)}
                      className="w-full p-6 text-left bg-white border border-slate-100 rounded-3xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100 transition-all group flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="font-black text-slate-800 tracking-tight text-lg group-hover:text-indigo-600 transition-colors uppercase italic">{session.title}</p>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Calendar size={10} /> {session.date}
                           </span>
                           <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">
                              {session.messages.length} messages
                           </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ArrowRight size={18} />
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                 <button 
                   onClick={() => {
                     setChatSessions([]);
                     localStorage.removeItem(`sessions_${user?.uid}`);
                   }}
                   className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-all flex items-center gap-2"
                 >
                   <Trash2 size={12} /> Clear Metadata Cache
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {exploredTopic && (
          <TopicExplorer 
            key="modal-topic-explorer"
            topic={exploredTopic} 
            apiKey={quizMathEffectiveKey}
            onClose={() => setExploredTopic(null)} 
            onStartQuiz={(topic, data) => {
              setExploredTopic(null);
              setStudyTool({ type: "quiz", topic, data });
            }}
          />
        )}
        {studyTool && (
          <StudyTools 
            key="modal-study-tools"
            type={studyTool.type} 
            topic={studyTool.topic} 
            data={studyTool.data} 
            characterName={selectedCharacter === "mahi" ? "Mahi" : selectedCharacter}
            onClose={() => setStudyTool(null)} 
            onAskMahi={(qText) => {
              if (liveSessionRef.current) {
                liveSessionRef.current.sendText(`[STUDENT ASKS ABOUT QUESTION]: "${qText}". Please explain this problem simply in Bengali.`);
              }
            }}
          />
        )}

        {showTelegramPortal && (
          <motion.div key="modal-telegram-portal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-5xl my-auto">
              <button 
                onClick={() => setShowTelegramPortal(false)}
                className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-slate-800/80 text-white hover:bg-rose-500 transition-all border border-white/10"
              >
                <X size={20} />
              </button>
              <TelegramPortal 
                user={user} 
                userData={user} 
                onNavigateHome={() => setShowTelegramPortal(false)} 
              />
            </div>
          </motion.div>
        )}

        {showNoticeBoard && (
          <NoticeBoardModal 
            key="modal-notice-board"
            onClose={() => setShowNoticeBoard(false)}
            isAdmin={!!user?.isAdmin}
            onOpenAdminPanel={() => {
              setShowNoticeBoard(false);
              setShowAdminPanel(true);
            }}
          />
        )}

        {showOnboardingModal && (
          <StudentOnboardingModal
            key="modal-student-onboarding"
            isOpen={showOnboardingModal}
            onClose={() => {
              setShowOnboardingModal(false);
              const key = user?.geminiApiKey || localStorage.getItem("gemini_api_key") || customApiKey;
              if (!key) {
                setApiKeyFeatureNotice("");
                setShowApiKeyPrompt(true);
              }
            }}
            userId={user?.uid}
            userName={user?.displayName || "Student"}
            currentProfile={user?.educationProfile || user}
            onProfileCompleted={(updatedProfile) => {
              setUser((prev: any) => ({ ...prev, ...updatedProfile, educationProfile: updatedProfile, hasCompletedOnboarding: true }));
              setShowOnboardingModal(false);
              const key = updatedProfile.geminiApiKey || localStorage.getItem("gemini_api_key") || customApiKey;
              if (!key) {
                setApiKeyFeatureNotice("");
                setShowApiKeyPrompt(true);
              }
            }}
          />
        )}

        {showApiKeyPrompt && (
          <ApiKeyPromptModal 
            key="modal-apikey-prompt"
            isOpen={showApiKeyPrompt}
            onClose={() => setShowApiKeyPrompt(false)}
            onSaveKey={async (key: string) => {
              setCustomApiKey(key);
              localStorage.setItem("gemini_api_key", key);
              syncUserProfile({ geminiApiKey: key });
              setShowApiKeyPrompt(false);
            }}
            currentKey={customApiKey}
            userName={user?.displayName || "Student"}
            featureNotice={apiKeyFeatureNotice}
          />
        )}

        {showAdminPanel && (
          <AdminPanelModal 
            key="modal-admin-panel"
            onClose={() => setShowAdminPanel(false)}
            adminName={user?.displayName || "Abhijit (Admin)"}
            adminEmail={user?.email || "jhhh47943@gmail.com"}
            customApiKey={customApiKey}
            user={user}
            onPromoteSelfToAdmin={() => {
              if (user) {
                const updated = { ...user, isAdmin: true, role: 'admin' };
                setUser(updated);
                localStorage.setItem("userSession", JSON.stringify(updated));
              }
            }}
          />
        )}

        {showBuildDocs && (
          <AppBuildDocsModal 
            key="modal-build-docs"
            isOpen={showBuildDocs} 
            onClose={() => setShowBuildDocs(false)} 
            userName={user?.displayName || "Abhijit (Admin)"} 
            isAdmin={!!user?.isAdmin} 
          />
        )}

        {/* Daily Accountability & Family Vigilance Protocol Modal */}
        {showAccountabilityModal && (
          <AccountabilityVigilanceModal
            key="modal-accountability-vigilance"
            isOpen={showAccountabilityModal}
            onClose={() => setShowAccountabilityModal(false)}
            user={user}
            onInitiateSimulatedCall={(type, summary) => {
              setShowAccountabilityModal(false);
              setAppState("speaking");
              if (type === "morning_plan") {
                nativeService.showToast("📞 Morning Planning Call Initiated!");
              } else {
                nativeService.showToast("📞 Night Audit Call Initiated!");
              }
            }}
          />
        )}

        {/* Study Stranger Premium Notification Hub Modal */}
        {showNotificationCenter && (
          <NotificationCenterModal 
            key="modal-notif-center"
            isOpen={showNotificationCenter}
            onClose={() => setShowNotificationCenter(false)}
            onActionClick={handleNotificationAction}
            onOpenPhonePermissions={() => {
              setShowNotificationCenter(false);
              setPendingCallNumber(undefined);
              setPendingContactName(undefined);
              setShowAndroidPermissionModal(true);
            }}
          />
        )}

        {/* Proactive Notification Permission Modal */}
        {showNotificationPermModal && (
          <NotificationPermissionModal
            key="modal-notif-perm"
            isOpen={showNotificationPermModal}
            onClose={() => {
              setShowNotificationPermModal(false);
              // If phone permissions still pending, smoothly chain to phone permission
              if (
                !AndroidPermissionService.hasPromptedInitialPermission() &&
                !AndroidPermissionService.areAllPhonePermissionsGranted()
              ) {
                setTimeout(() => {
                  setShowAndroidPermissionModal(true);
                }, 450);
              }
            }}
            onPermissionGranted={() => {
              setShowNotificationPermModal(false);
              // After notification permission is granted, smoothly prompt phone/contacts if not done yet
              if (
                !AndroidPermissionService.hasPromptedInitialPermission() &&
                !AndroidPermissionService.areAllPhonePermissionsGranted()
              ) {
                setTimeout(() => {
                  setShowAndroidPermissionModal(true);
                }, 450);
              }
            }}
          />
        )}

        {/* Mobile Quick Actions Bottom Sheet Menu */}
        {showMobileQuickMenu && (
          <MobileQuickActionsSheet
            key="modal-mobile-quick-menu"
            isOpen={showMobileQuickMenu}
            onClose={() => setShowMobileQuickMenu(false)}
            user={user}
            isKidsMode={isKidsMode}
            onToggleKidsMode={() => {
              const next = !isKidsMode;
              setIsKidsMode(next);
              localStorage.setItem("pref_kids_mode", next ? "true" : "false");
              syncUserProfile({ isKidsMode: next });
            }}
            onOpenPhoneDialer={() => {
              if (AndroidPermissionService.areAllPhonePermissionsGranted()) {
                setShowDialer(true);
              } else {
                setPendingCallNumber(undefined);
                setPendingContactName(undefined);
                setShowAndroidPermissionModal(true);
              }
            }}
            onOpenNotifications={() => setShowNotificationCenter(true)}
            onOpenNotices={() => setShowNoticeBoard(true)}
            onOpenTelegram={() => setShowTelegramPortal(true)}
            onOpenMemory={() => setShowMemoryVault(true)}
            onOpenProfile={() => setShowProfileModal(true)}
            onOpenAccountability={() => setShowAccountabilityModal(true)}
            onOpenThemes={() => setShowThemeSelectorModal(true)}
            onOpenMusic={() => setShowFocusRoom(true)}
            onOpenAdsCenter={() => setShowAdsCenter(true)}
            onOpenAdmin={() => setShowAdminPanel(true)}
            onOpenSettings={() => setShowSettings(true)}
            onInstallPWA={handleInstallPWA}
            isAppInstalled={isAppInstalled}
            prefMode={prefMode}
            onSetPrefMode={(mode) => {
              setPrefMode(mode);
              localStorage.setItem("pref_interface_type", mode);
            }}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
            unreadNotificationsCount={unreadNotificationsCount}
          />
        )}

        {/* Student Profile Management Modal */}
        {showProfileModal && (
          <UserProfileModal 
            key="modal-user-profile"
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            user={user}
            onSaveProfile={handleSaveUserProfile}
            onLogout={logout}
            onOpenThemes={() => setShowThemeSelectorModal(true)}
          />
        )}

        {/* App Themes & Visual Designs Studio Modal */}
        {showThemeSelectorModal && (
          <ThemeSelectorModal 
            key="modal-theme-selector"
            isOpen={showThemeSelectorModal}
            onClose={() => setShowThemeSelectorModal(false)}
            isDarkMode={isDarkMode}
            themeMode={themePreference}
            onSetThemeMode={(mode) => {
              setThemePreference(mode);
              localStorage.setItem("theme_preference", mode);
            }}
            onToggleTheme={toggleTheme}
          />
        )}

        {/* Global Help, Telegram Commands & Support Modal */}
        {showHelpSupportModal && (
          <HelpAndSupportModal 
            key="modal-help-support"
            onClose={() => setShowHelpSupportModal(false)}
            userTelegramUsername={user?.username || "Studystranger_bot"}
            onOpenLiveVoice={() => {
              setCurrentView("active");
              setActiveTab("board");
              setIsBoardExpanded(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Global Floating Premium In-App Notification Toast */}
      <PremiumNotificationToast key="global-premium-toast" onActionClick={handleNotificationAction} />

      <ActionLog 
        logs={agentLogs} 
        isVisible={isSessionActive || isVoiceRecording} 
        onClose={() => setAgentLogs([])} 
        hasActiveDeck={!!studyTool}
        characterName={selectedCharacter === "mahi" ? "Mahi" : selectedCharacter}
      />

      {/* Global Expanded Board Overlay */}
      {isBoardExpanded && (
        <div className="fixed inset-0 z-[1000] bg-black">
          <LiveBoard 
            elements={boardElements} 
            isExpanded={true} 
            onToggleExpand={() => setIsBoardExpanded(false)} 
            onClearBoard={clearBoard}
            onAddElement={addBoardElement}
          />
        </div>
      )}
      </div> {/* Simulated Phone Device wrapper close */}
    </div>
  );
}
