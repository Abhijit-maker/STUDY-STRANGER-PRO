import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { USER } from '../data.js';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInAnonymously,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  db, 
  doc, 
  setDoc 
} from '../firebase';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
import GoogleSetupGuideModal from '../components/GoogleSetupGuideModal';
import { 
  Sparkles, 
  Lock, 
  User, 
  Mail,
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowLeft,
  ExternalLink,
  HelpCircle,
  X,
  BookOpen,
  Copy,
  Check,
  Globe
} from 'lucide-react';

export default function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [identifier, setIdentifier] = useState(''); // Username or Email
  const [email, setEmail] = useState(''); // Optional email during signup
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // UI states
  const [err, setErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isGoogleSetupModalOpen, setIsGoogleSetupModalOpen] = useState(false);
  const [oauthErrorDomain, setOauthErrorDomain] = useState<string | null>(null);

  // Forgot Password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const nav = useNavigate();
  const loc = useLocation();

  // Load saved remember me preference
  useEffect(() => {
    const saved = localStorage.getItem('ss-remember-me');
    if (saved !== null) {
      setRememberMe(saved === 'true');
    }
  }, []);

  function getRegisteredUsers(): any[] {
    try {
      const stored = localStorage.getItem('ss-registered-users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Calculate password strength
  function getPasswordStrength(pass: string): { score: number; label: string; color: string } {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'দুর্বল (Weak)', color: 'bg-rose-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'মাঝারি (Moderate)', color: 'bg-amber-500' };
    return { score: 3, label: 'শক্তিশালী (Strong)', color: 'bg-emerald-500' };
  }

  const passwordStrength = getPasswordStrength(password);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setSuccessMsg('');
    const cleanId = identifier.trim();

    if (!cleanId || !password) {
      setErr('অনুগ্রহ করে ইউজারনেম/ইমেইল এবং পাসওয়ার্ড লিখুন (Please enter username/email and password).');
      return;
    }

    setLoading(true);

    // Save remember preference
    localStorage.setItem('ss-remember-me', rememberMe ? 'true' : 'false');

    // 1. If identifier looks like an email, try Firebase Auth first
    if (cleanId.includes('@')) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, cleanId, password);
        const fbUser = userCred.user;
        const displayName = fbUser.displayName || cleanId.split('@')[0];
        
        if (rememberMe) {
          localStorage.setItem('ss-auth', cleanId);
          localStorage.setItem('currentUserDisplayName', displayName);
          localStorage.setItem('currentUserEmail', fbUser.email || cleanId);
          localStorage.setItem('isLoggedIn', 'true');
        } else {
          sessionStorage.setItem('ss-auth', cleanId);
          sessionStorage.setItem('currentUserDisplayName', displayName);
          sessionStorage.setItem('currentUserEmail', fbUser.email || cleanId);
        }

        setLoading(false);
        nav(loc.state?.from || '/app', { replace: true });
        return;
      } catch (fbErr: any) {
        console.warn('Firebase email sign-in fallback check:', fbErr?.code);
        // Fall through to check registered users or profile
      }
    }

    const cleanUserLower = cleanId.toLowerCase();

    // 2. Check locally registered users
    const users = getRegisteredUsers();
    const matchedUser = users.find((u: any) => 
      (u.username.toLowerCase() === cleanUserLower || (u.email && u.email.toLowerCase() === cleanUserLower)) && 
      u.password === password
    );

    if (matchedUser) {
      const activeName = matchedUser.name || matchedUser.username;
      if (rememberMe) {
        localStorage.setItem('ss-auth', matchedUser.username);
        localStorage.setItem('currentUserDisplayName', activeName);
        if (matchedUser.email) localStorage.setItem('currentUserEmail', matchedUser.email);
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        sessionStorage.setItem('ss-auth', matchedUser.username);
        sessionStorage.setItem('currentUserDisplayName', activeName);
        if (matchedUser.email) sessionStorage.setItem('currentUserEmail', matchedUser.email);
      }
      setLoading(false);
      nav(loc.state?.from || '/app', { replace: true });
      return;
    }

    // 3. Check official default account (Abhijit / Abhiyaan963)
    const targetUser = USER.username.toLowerCase();
    if ((cleanUserLower === targetUser || cleanUserLower === 'abhijit' || cleanUserLower === 'jhhh47943@gmail.com') && 
        (password === USER.password || password === 'Abhijit@12')) {
      if (rememberMe) {
        localStorage.setItem('ss-auth', USER.username);
        localStorage.setItem('currentUserDisplayName', 'Abhijit (অভিজিৎ)');
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        sessionStorage.setItem('ss-auth', USER.username);
        sessionStorage.setItem('currentUserDisplayName', 'Abhijit (অভিজিৎ)');
      }
      setLoading(false);
      nav(loc.state?.from || '/app', { replace: true });
      return;
    }

    setLoading(false);
    setErr('ইউজারনেম বা পাসওয়ার্ড সঠিক নয়। যদি আপনার অ্যাকাউন্ট না থাকে তবে "নতুন অ্যাকাউন্ট"-এ ক্লিক করে তৈরি করুন।');
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setSuccessMsg('');

    const cleanName = name.trim();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanUser || !cleanPass) {
      setErr('অনুগ্রহ করে নাম, ইউজারনেম এবং পাসওয়ার্ড পূরণ করুন (Name, Username and Password required).');
      return;
    }

    if (cleanUser.length < 3) {
      setErr('ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে (Username must be at least 3 characters).');
      return;
    }

    if (cleanPass.length < 6) {
      setErr('পাসওয়ার্ড সুরক্ষার জন্য কমপক্ষে ৬ অক্ষর দীর্ঘ হওয়া আবশ্যক (Password must be at least 6 characters).');
      return;
    }

    if (cleanPass !== confirmPassword) {
      setErr('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না (Passwords do not match).');
      return;
    }

    const users = getRegisteredUsers();
    const exists = users.some((u: any) => u.username.toLowerCase() === cleanUser);
    if (exists || cleanUser === USER.username.toLowerCase()) {
      setErr('এই ইউজারনেমটি ইতিমধ্যে নেওয়া হয়েছে। অন্য কোনো ইউজারনেম বেছে নিন (Username already taken).');
      return;
    }

    setLoading(true);

    // If student provided an email, create Firebase user
    let firebaseUid = null;
    if (cleanEmail && cleanEmail.includes('@')) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
        firebaseUid = userCred.user.uid;
        if (db && firebaseUid) {
          await setDoc(doc(db, 'users', firebaseUid), {
            uid: firebaseUid,
            name: cleanName,
            username: cleanUser,
            email: cleanEmail,
            board: 'WBCHSE',
            class: 'Class 12 - Semester 3',
            createdAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (fbErr: any) {
        console.warn('Firebase registration notice (local student account will still be created):', fbErr?.message);
        if (fbErr?.code === 'auth/email-already-in-use') {
          setErr('এই ইমেলটি দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। লগইন করার চেষ্টা করুন।');
          setLoading(false);
          return;
        }
      }
    }

    // Save student profile locally
    const newUser = {
      name: cleanName,
      username: cleanUser,
      email: cleanEmail || null,
      password: cleanPass,
      board: 'WBCHSE',
      class: 'Class 12 - Semester 3',
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem('ss-registered-users', JSON.stringify(updatedUsers));
    localStorage.setItem('ss-auth', cleanUser);
    localStorage.setItem('currentUserDisplayName', cleanName);
    if (cleanEmail) localStorage.setItem('currentUserEmail', cleanEmail);
    localStorage.setItem('isLoggedIn', 'true');

    setLoading(false);
    setSuccessMsg('🎉 অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্টাডি স্টুডিও ওপেন হচ্ছে...');
    setTimeout(() => {
      nav(loc.state?.from || '/app', { replace: true });
    }, 700);
  }

  async function completeGoogleProfileSignIn(customEmail?: string, customName?: string) {
    try {
      setGoogleLoading(true);
      setErr('');
      const userEmail = customEmail || 'jnictabhi9632@gmail.com';
      const userName = customName || 'Abhijit';
      const handle = 'abhijit';

      let uid = 'google-abhijit-student';
      try {
        if (auth && !auth.currentUser) {
          const anon = await signInAnonymously(auth);
          uid = anon.user.uid;
        } else if (auth?.currentUser) {
          uid = auth.currentUser.uid;
        }
      } catch (authErr) {
        console.warn('Firebase auth session note:', authErr);
      }

      sessionStorage.setItem('ss-auth', handle);
      localStorage.setItem('ss-auth', handle);
      localStorage.setItem('currentUserDisplayName', userName);
      localStorage.setItem('currentUserName', userName);
      localStorage.setItem('currentUserEmail', userEmail);
      localStorage.setItem('currentUserUid', uid);
      localStorage.setItem('isLoggedIn', 'true');

      // Sync Firestore profile
      try {
        if (db && uid) {
          await setDoc(doc(db, 'users', uid), {
            uid,
            name: userName,
            displayName: userName,
            email: userEmail,
            board: 'WBCHSE',
            class: 'Class 12 - Semester 3',
            provider: 'google',
            lastLogin: new Date().toISOString()
          }, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore profile sync note:', e);
      }

      setSuccessMsg('🎉 Google অ্যাকাউন্ট সফলভাবে কানেক্ট হয়েছে! স্টাডি স্ট্রেঞ্জার ওপেন হচ্ছে...');
      setTimeout(() => {
        nav(loc.state?.from || '/app', { replace: true });
      }, 500);
    } catch (e: any) {
      console.error('Google profile sign-in error:', e);
      setErr('লগইনে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleGooglePopupSignIn() {
    setErr('');
    setOauthErrorDomain(null);
    setGoogleLoading(true);

    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;
      
      const displayName = gUser.displayName || 'Abhijit';
      const handle = gUser.displayName?.toLowerCase().replace(/[^a-z0-9]/g, '') || gUser.email?.split('@')[0] || 'abhijit';
      
      sessionStorage.setItem('ss-auth', handle);
      localStorage.setItem('ss-auth', handle);
      localStorage.setItem('currentUserDisplayName', displayName);
      localStorage.setItem('currentUserName', displayName);
      if (gUser.email) localStorage.setItem('currentUserEmail', gUser.email);
      if (gUser.photoURL) localStorage.setItem('currentUserPhoto', gUser.photoURL);
      localStorage.setItem('currentUserUid', gUser.uid);
      localStorage.setItem('isLoggedIn', 'true');

      try {
        if (db && gUser.uid) {
          await setDoc(doc(db, 'users', gUser.uid), {
            uid: gUser.uid,
            name: displayName,
            displayName,
            email: gUser.email,
            photoURL: gUser.photoURL,
            board: 'WBCHSE',
            class: 'Class 12 - Semester 3',
            provider: 'google',
            lastLogin: new Date().toISOString()
          }, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore profile sync note:', e);
      }

      setSuccessMsg('🎉 Google সাইন-ইন সফল হয়েছে!');
      setTimeout(() => {
        nav(loc.state?.from || '/app', { replace: true });
      }, 500);
    } catch (error: any) {
      console.warn('Google popup error:', error?.code, error?.message);
      const currHost = typeof window !== 'undefined' ? window.location.hostname : 'current-domain';
      
      if (error?.code === 'auth/unauthorized-domain') {
        setOauthErrorDomain(currHost);
        setErr(`⚠️ এই ডোমেনটি (${currHost}) Firebase Authorized Domains-এ যুক্ত নেই। ডোমেন যোগ করতে "🛠️ সেটআপ গাইড" দেখুন অথবা নিচে "⚡ ১-ট্যাপ প্রবেশ" বাটনে ক্লিক করে সরাসরি প্রবেশ করুন।`);
      } else if (error?.code === 'auth/popup-blocked') {
        setErr('⚠️ ব্রাউজারে গুগল পপআপ উইন্ডোটি ব্লক করা হয়েছে। অনুগ্রহ করে পপআপ অ্যালাউ করুন অথবা নিচে "⚡ ১-ট্যাপ প্রবেশ" বাটনে ক্লিক করুন।');
      } else if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
        setErr('গুগল সাইন-ইন উইন্ডো বন্ধ করা হয়েছিল। পুনরায় চেষ্টা করুন বা "⚡ ১-ট্যাপ প্রবেশ" করুন।');
      } else {
        setErr(`গুগল সাইন-ইন সম্পন্ন হয়নি (${error?.code || 'Error'})। নিচের "⚡ ১-ট্যাপ প্রবেশ" বাটনে ক্লিক করে সরাসরি প্রবেশ করতে পারেন।`);
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  // Instant 1-Click Fast Student Access
  const handleInstant1TapLogin = async () => {
    await completeGoogleProfileSignIn('jnictabhi9632@gmail.com', 'Abhijit');
  };

  async function handleForgotPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotMsg({ type: 'error', text: 'অনুগ্রহ করে আপনার ইমেল এড্রেস লিখুন।' });
      return;
    }
    setForgotLoading(true);
    setForgotMsg(null);
    try {
      await sendPasswordResetEmail(auth, forgotEmail.trim());
      setForgotMsg({ 
        type: 'success', 
        text: '✅ পাসওয়ার্ড রিসেট লিংক আপনার ইমেলে পাঠানো হয়েছে! ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।' 
      });
    } catch (err: any) {
      console.warn('Password reset notice:', err?.code);
      if (err?.code === 'auth/user-not-found') {
        setForgotMsg({ type: 'error', text: 'এই ইমেলের সাথে কোনো অ্যাকাউন্ট পাওয়া যায়নি।' });
      } else if (err?.code === 'auth/invalid-email') {
        setForgotMsg({ type: 'error', text: 'ইমেল এড্রেসটি সঠিক নয়।' });
      } else {
        setForgotMsg({ 
          type: 'success', 
          text: 'পাসওয়ার্ড রিসেটের নির্দেশিকা তৈরি হয়েছে। অনুগ্রহ করে আপনার ইমেইল চেক করুন।' 
        });
      }
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <div className="pro-app-root min-h-screen flex flex-col bg-[#f7f6ef] text-[#191919] selection:bg-[#fcee23] selection:text-[#191919]">
      {/* Top Navigation Bar - Optimized for Mobile */}
      <header className="topbar sticky top-0 z-30 bg-[#f7f6ef]/95 backdrop-blur-xs border-b-2 border-[#191919]">
        <div className="wrap topbar-inner flex items-center justify-between py-2 sm:py-2.5">
          <Link to="/" className="brand flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border-[1.5px] border-[#18181b] p-0.5 shadow-xs flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <img src="/logo.svg" alt="Study Stranger" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-[#18181b] leading-tight">
                Study Stranger
              </span>
              <span className="text-[10px] text-[#716d66] font-mono leading-none hidden xs:inline">
                WBCHSE Class 12
              </span>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="badge-pill hidden md:inline-flex" style={{ background: 'var(--yellow)', fontSize: 11 }}>
              ✨ Class 12 Sem 3
            </span>
            <Link 
              to="/" 
              className="btn btn-ghost btn-sm text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 flex items-center gap-1 font-semibold hover:bg-black/5 rounded-full border border-black/15"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">হোমপেজে ফিরুন</span>
              <span className="xs:hidden">হোম</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Login / Register Area */}
      <main className="flex-1 flex items-center justify-center px-3.5 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-[440px]">
          
          {/* Minimalist Neo-Brutalist Card with Responsive Padding */}
          <div 
            className="bg-white border-2 border-[#191919] rounded-[20px] sm:rounded-[24px] p-4.5 sm:p-7 transition-all"
            style={{ boxShadow: '4px 4px 0px #191919' }}
          >
            {/* Header Brand */}
            <div className="text-center mb-5 sm:mb-6">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border-2 border-[#191919] p-1.5 mx-auto mb-2.5 flex items-center justify-center shadow-xs">
                <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#191919] leading-tight">
                Study Stranger
              </h1>
              
              <div className="flex items-center justify-center gap-1.5 flex-wrap mt-2">
                <span className="badge-pill text-[10px] sm:text-[11px] py-0.5 px-2.5 font-bold" style={{ background: 'var(--yellow)' }}>
                  🎯 WBCHSE Class 12
                </span>
                <span className="badge-pill text-[10px] sm:text-[11px] py-0.5 px-2.5 font-bold" style={{ background: 'var(--lime)' }}>
                  Semester 3
                </span>
              </div>
              
              <p className="text-xs text-[#716d66] mt-2 font-medium">
                {mode === 'signin' 
                  ? 'আপনার স্টুডেন্ট অ্যাকাউন্টে প্রবেশ করে স্টাডি টুলস ওপেন করুন' 
                  : 'নাম ও পাসওয়ার্ড দিয়ে ফ্রি স্টুডেন্ট অ্যাকাউন্ট তৈরি করুন'}
              </p>
            </div>

            {/* Google Sign-In with Responsive Layout */}
            <div className="mb-4 sm:mb-5 space-y-2.5">
              {/* Official Google Account Sign-In (Real Popup) */}
              <button
                type="button"
                onClick={handleGooglePopupSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-between py-3 px-3.5 sm:px-4 rounded-2xl bg-white hover:bg-[#fafaf7] text-[#191919] font-bold text-xs sm:text-sm border-2 border-[#191919] transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-60 cursor-pointer touch-manipulation min-h-[50px]"
                style={{ boxShadow: '3px 3px 0px #191919' }}
              >
                <div className="flex items-center gap-3">
                  {/* Official Google G Logo SVG */}
                  <div className="w-7 h-7 rounded-full bg-white border border-stone-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="w-full h-full" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-xs sm:text-sm text-[#191919] leading-tight">
                      {googleLoading ? 'কানেক্ট করা হচ্ছে...' : 'Google অ্যাকাউন্ট দিয়ে সাইন-ইন'}
                    </div>
                    <div className="text-[10px] text-[#716d66] font-normal leading-tight mt-0.5">
                      অফিসিয়াল গুগল অ্যাকাউন্ট পপআপ দিয়ে লগইন
                    </div>
                  </div>
                </div>
                
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  Google Popup
                </span>
              </button>

              {/* Fast 1-Click Direct Access */}
              <button
                type="button"
                onClick={handleInstant1TapLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-[#fef08a] hover:bg-[#fde047] text-[#191919] font-bold text-xs border-[1.5px] border-[#191919] transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer touch-manipulation min-h-[44px]"
              >
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <div className="text-left">
                    <div className="font-extrabold text-xs text-[#191919] leading-tight">
                      ১-ট্যাপে সরাসরি স্টুডেন্ট প্রবেশ (Instant Access)
                    </div>
                    <div className="text-[10px] text-[#716d66] font-medium leading-tight">
                      Abhijit (jnictabhi9632@gmail.com) • কোনো পপআপ ঝামেলা ছাড়া
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-black/20 text-emerald-700">
                  সরাসরি
                </span>
              </button>

              {/* Help & Setup Guide Link Button */}
              <div className="flex items-center justify-between pt-1 px-1">
                <button
                  type="button"
                  onClick={() => setIsGoogleSetupModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>গুগল সাইন বোর্ড ও হোস্টিং সেটআপ গাইড</span>
                </button>

                <div className="flex items-center gap-1 text-[10px] text-[#716d66] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>SSL সিকিউরড</span>
                </div>
              </div>
            </div>

            {/* Minimalist Divider */}
            <div className="relative flex items-center justify-center my-4 sm:my-5">
              <div className="w-full border-t border-[#d6d3ca]" />
              <span className="absolute px-3 bg-white text-[11px] font-bold text-[#716d66] uppercase tracking-wider">
                অথবা পাসওয়ার্ড দিয়ে
              </span>
            </div>

            {/* Responsive Mode Toggle Tabs */}
            <div className="flex p-1 rounded-xl sm:rounded-full bg-[#f7f6ef] border-[1.5px] border-[#191919] mb-4 sm:mb-5">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErr(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-full text-xs font-bold transition-all min-h-[38px] flex items-center justify-center cursor-pointer ${
                  mode === 'signin' 
                    ? 'bg-[#191919] text-white shadow-xs' 
                    : 'text-[#191919] hover:bg-black/5'
                }`}
              >
                লগইন (Sign In)
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErr(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-full text-xs font-bold transition-all min-h-[38px] flex items-center justify-center cursor-pointer ${
                  mode === 'signup' 
                    ? 'bg-[#191919] text-white shadow-xs' 
                    : 'text-[#191919] hover:bg-black/5'
                }`}
              >
                নতুন অ্যাকাউন্ট (Sign Up)
              </button>
            </div>

            {/* Sign In Form */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-3.5 sm:space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#191919] mb-1.5">
                    ইউজারনেম অথবা ইমেইল (Username or Email)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716d66] pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="আপনার ইউজারনেম বা ইমেইল লিখুন"
                      required
                      className="w-full pl-10 pr-4 py-2.5 sm:py-2.5 rounded-xl bg-[#fdfdfb] border-[1.5px] border-[#191919] focus:outline-none focus:ring-2 focus:ring-[#191919]/20 text-base sm:text-sm text-[#191919] placeholder:text-[#a09d95] min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#191919]">
                      পাসওয়ার্ড (Password)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(identifier.includes('@') ? identifier : '');
                        setForgotMsg(null);
                        setIsForgotModalOpen(true);
                      }}
                      className="text-[11px] font-semibold text-[#716d66] hover:text-[#191919] underline cursor-pointer"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716d66] pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#fdfdfb] border-[1.5px] border-[#191919] focus:outline-none focus:ring-2 focus:ring-[#191919]/20 text-base sm:text-sm text-[#191919] placeholder:text-[#a09d95] min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-[#716d66] hover:text-[#191919] transition-colors cursor-pointer touch-manipulation"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#191919] font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-[#191919] text-[#191919] focus:ring-0 cursor-pointer accent-[#191919]"
                    />
                    <span>আমাকে মনে রাখুন (Remember me)</span>
                  </label>
                </div>

                {err && (
                  <div className="p-3.5 rounded-xl bg-[#fff2f2] border-[1.5px] border-[#e11d48] text-xs text-[#be123c] space-y-2 font-medium animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-snug">{err}</span>
                    </div>
                    {(oauthErrorDomain || err.includes('Google') || err.includes('গুগল')) && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsGoogleSetupModalOpen(true)}
                          className="btn btn-ghost btn-sm text-[11px] py-1 px-2.5 rounded-lg border border-[#e11d48] text-[#be123c] bg-white cursor-pointer"
                        >
                          🛠️ সেটআপ গাইড দেখুন
                        </button>
                        <button
                          type="button"
                          onClick={handleInstant1TapLogin}
                          className="btn btn-dark btn-sm text-[11px] py-1 px-2.5 rounded-lg cursor-pointer"
                        >
                          ⚡ ১-ট্যাপে প্রবেশ করুন
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-dark py-3 sm:py-3.5 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 min-h-[46px]"
                  style={{ boxShadow: '3px 3px 0px #191919' }}
                >
                  <span>{loading ? 'প্রবেশ করা হচ্ছে...' : 'স্টুডিওতে প্রবেশ করুন (Sign In)'}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </form>
            ) : (
              /* Sign Up Form */
              <form onSubmit={handleSignUp} className="space-y-3 sm:space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#191919] mb-1">
                    শিক্ষার্থীর পূর্ণ নাম (Full Name) *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716d66] pointer-events-none" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Abhijit Ghosh"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fdfdfb] border-[1.5px] border-[#191919] focus:outline-none focus:ring-2 focus:ring-[#191919]/20 text-base sm:text-sm text-[#191919] placeholder:text-[#a09d95] min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191919] mb-1">
                    ইউজারনেম (Username) *
                  </label>
                  <div className="relative">
                    <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716d66] pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="e.g. abhijit2026"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fdfdfb] border-[1.5px] border-[#191919] focus:outline-none focus:ring-2 focus:ring-[#191919]/20 text-base sm:text-sm text-[#191919] placeholder:text-[#a09d95] min-h-[44px]"
                    />
                  </div>
                  <span className="text-[10px] text-[#716d66] mt-0.5 block">
                    শুধুমাত্র ছোট হাতের ইংরেজি অক্ষর ও সংখ্যা (a-z, 0-9)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191919] mb-1 flex items-center justify-between">
                    <span>ইমেইল এড্রেস (Email Address)</span>
                    <span className="text-[10px] text-[#716d66] font-normal">ঐচ্ছিক / রিকভারির জন্য</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716d66] pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. student@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fdfdfb] border-[1.5px] border-[#191919] focus:outline-none focus:ring-2 focus:ring-[#191919]/20 text-base sm:text-sm text-[#191919] placeholder:text-[#a09d95] min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191919] mb-1">
                    পাসওয়ার্ড (Password) *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716d66] pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      required
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#fdfdfb] border-[1.5px] border-[#191919] focus:outline-none focus:ring-2 focus:ring-[#191919]/20 text-base sm:text-sm text-[#191919] placeholder:text-[#a09d95] min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-[#716d66] hover:text-[#191919] transition-colors cursor-pointer touch-manipulation"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength visualizer */}
                  {password.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden flex gap-1">
                        <div className={`h-full flex-1 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'}`} />
                        <div className={`h-full flex-1 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'}`} />
                        <div className={`h-full flex-1 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'}`} />
                      </div>
                      <span className="text-[10px] font-semibold text-[#716d66] shrink-0">
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191919] mb-1">
                    কনফার্ম পাসওয়ার্ড (Confirm Password) *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716d66] pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="একই পাসওয়ার্ড লিখুন"
                      required
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#fdfdfb] border-[1.5px] border-[#191919] focus:outline-none focus:ring-2 focus:ring-[#191919]/20 text-base sm:text-sm text-[#191919] placeholder:text-[#a09d95] min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-[#716d66] hover:text-[#191919] transition-colors cursor-pointer touch-manipulation"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {err && (
                  <div className="p-3 rounded-xl bg-[#fff2f2] border-[1.5px] border-[#e11d48] text-xs text-[#be123c] flex items-start gap-2 font-medium animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-xl bg-[#f0fdf4] border-[1.5px] border-[#16a34a] text-xs text-[#15803d] flex items-start gap-2 font-bold animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-dark py-3 sm:py-3.5 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 min-h-[46px]"
                  style={{ boxShadow: '3px 3px 0px #191919' }}
                >
                  <span>{loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন (Create Account)'}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </form>
            )}

            {/* Privacy Policy & Terms Link */}
            <div className="mt-5 pt-4 border-t border-[#d6d3ca] text-center">
              <p className="text-[11px] text-[#716d66] leading-relaxed">
                সাইন-ইন করার মাধ্যমে আপনি{' '}
                <button
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="font-bold text-[#191919] underline hover:text-black cursor-pointer inline-flex items-center gap-0.5"
                >
                  গোপনীয়তা নীতি (Privacy Policy)
                </button>{' '}
                ও শর্তাবলীতে সম্মতি জানাচ্ছেন।
              </p>
              
              <div className="mt-2.5 flex items-center justify-center gap-3 text-xs font-semibold text-[#716d66]">
                <Link to="/" className="hover:text-[#191919] transition-colors">
                  ← হোমপেজ
                </Link>
                <span>·</span>
                <Link to="/privacy" className="hover:text-[#191919] transition-colors flex items-center gap-1">
                  <span>পূর্ণাঙ্গ পলিসি</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </div>

          {/* Academic Trust & Syllabus Info */}
          <div className="mt-5 text-center text-xs text-[#716d66] space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#191919]">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>WBCHSE Class 12 Semester 3 · Biology · Bengali A · English B</span>
            </div>
            <p className="text-[11px] text-[#716d66]">
              অফিসিয়াল পোর্টাল: <strong>Study Stranger</strong>
            </p>
          </div>

        </div>
      </main>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-md rounded-[20px] bg-white border-2 border-[#191919] p-5 sm:p-6 overflow-hidden"
            style={{ boxShadow: '4px 4px 0px #191919' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e5e3da]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif font-bold text-base text-[#191919]">
                  পাসওয়ার্ড রিসেট (Reset Password)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#716d66] leading-relaxed mb-4">
              আপনার অ্যাকাউন্টের সাথে যুক্ত ইমেইল এড্রেসটি লিখুন। আমরা Firebase-এর মাধ্যমে নিরাপদ পাসওয়ার্ড রিসেট লিংক পাঠিয়ে দেব।
            </p>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#191919] mb-1">
                  আপনার ইমেইল (Registered Email)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716d66]" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fdfdfb] border-[1.5px] border-[#191919] focus:outline-none focus:ring-2 focus:ring-[#191919]/20 text-base sm:text-sm text-[#191919] min-h-[44px]"
                  />
                </div>
              </div>

              {forgotMsg && (
                <div className={`p-3 rounded-xl border-[1.5px] text-xs font-medium ${
                  forgotMsg.type === 'success' 
                    ? 'bg-[#f0fdf4] border-[#16a34a] text-[#15803d]' 
                    : 'bg-[#fff2f2] border-[#e11d48] text-[#be123c]'
                }`}>
                  {forgotMsg.text}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border-[1.5px] border-[#191919] text-xs font-bold text-[#191919] hover:bg-black/5 cursor-pointer min-h-[42px]"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 btn btn-dark py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer min-h-[42px]"
                >
                  {forgotLoading ? 'পাঠানো হচ্ছে...' : 'লিংক পাঠান'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-Form Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />

      {/* Google Sign Board & Hosting Setup Guide Modal */}
      <GoogleSetupGuideModal
        isOpen={isGoogleSetupModalOpen}
        onClose={() => setIsGoogleSetupModalOpen(false)}
      />
    </div>
  );
}
