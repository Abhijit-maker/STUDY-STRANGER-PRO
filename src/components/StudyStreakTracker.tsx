import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, 
  Award, 
  Trophy, 
  Zap, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  Star, 
  ShieldCheck, 
  TrendingUp,
  Share2,
  ChevronRight,
  Target
} from "lucide-react";
import confetti from "canvas-confetti";
import { soundEffects } from "../services/soundEffectsService";
import { db, auth, doc, getDoc } from "../firebase";

interface Badge {
  id: string;
  title: string;
  titleBn: string;
  desc: string;
  descBn: string;
  icon: string;
  category: "streak" | "accuracy" | "subject" | "speed";
  reqPoints: number;
  unlocked: boolean;
}

export const StudyStreakTracker: React.FC<{ userName?: string; onExplore?: () => void }> = ({
  userName = "Abhijit",
  onExplore
}) => {
  // Persistence state with real-time defaults (NO fake default numbers)
  const [streakDays, setStreakDays] = useState<number>(() => {
    const s = localStorage.getItem("ss_study_streak");
    return s ? parseInt(s, 10) : 0;
  });

  const [totalXp, setTotalXp] = useState<number>(() => {
    const s = localStorage.getItem("ss_student_xp") || localStorage.getItem("user_points");
    return s ? parseInt(s, 10) : 0;
  });

  // Sync real-time points & streak from Firestore
  useEffect(() => {
    if (auth.currentUser?.uid) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      getDoc(userRef).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (typeof data.points === "number") {
            setTotalXp(data.points);
            localStorage.setItem("ss_student_xp", data.points.toString());
          }
          if (typeof data.streak === "number") {
            setStreakDays(data.streak);
            localStorage.setItem("ss_study_streak", data.streak.toString());
          }
        }
      }).catch((e) => console.warn("Real-time profile fetch notice:", e));
    }
  }, []);

  const [dailyGoals, setDailyGoals] = useState<{ id: string; titleBn: string; xp: number; done: boolean }[]>(() => {
    const saved = localStorage.getItem("ss_daily_goals");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    const today = new Date().toISOString().slice(0, 10);
    const lastActive = localStorage.getItem("ss_last_active_date");
    const testTakenToday = lastActive === today;

    return [
      { id: "g-1", titleBn: "১টি WBCHSE মক টেস্ট সম্পূর্ণ করা", xp: 50, done: testTakenToday },
      { id: "g-2", titleBn: "১০টি বায়োলজি ও বাংলা ফ্ল্যাশকার্ড রিভিশন", xp: 30, done: false },
      { id: "g-3", titleBn: "ভুল উত্তর ব্যাংক (Mistake Bank) পরিদর্শন", xp: 20, done: false },
      { id: "g-4", titleBn: "২৫ মিনিট ফোকাস পোমোডোরো সেশন সম্পন্ন", xp: 40, done: false }
    ];
  });

  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Calculate Level
  // Level 1: 0-200 XP, Level 2: 201-500 XP, Level 3: 501-1000 XP, Level 4: 1001-2000 XP, Level 5: 2000+ XP
  const levelInfo = React.useMemo(() => {
    if (totalXp < 200) {
      return { level: 1, title: "নবাগত শিক্ষার্থী (Novice Stranger)", nextReq: 200, progress: (totalXp / 200) * 100 };
    } else if (totalXp < 600) {
      return { level: 2, title: "মনোযোগী পরীক্ষার্থী (Dedicated Aspirant)", nextReq: 600, progress: ((totalXp - 200) / 400) * 100 };
    } else if (totalXp < 1200) {
      return { level: 3, title: "বিষয় বিশেষজ্ঞ (Subject Specialist)", nextReq: 1200, progress: ((totalXp - 600) / 600) * 100 };
    } else if (totalXp < 2000) {
      return { level: 4, title: "বোর্ড চ্যাম্পিয়ন (Board Champion)", nextReq: 2000, progress: ((totalXp - 1200) / 800) * 100 };
    } else {
      return { level: 5, title: "WBCHSE শীর্ষস্থানাধিকারী (Board Topper)", nextReq: 3000, progress: 100 };
    }
  }, [totalXp]);

  const badges: Badge[] = [
    {
      id: "b-1",
      title: "Bio Prodigy",
      titleBn: "জীববিদ্যা বিশারদ",
      desc: "Scored 100% in Reproduction or Genetics",
      descBn: "জনন বা বংশগতিতে ১০০% সঠিক উত্তর প্রদান",
      icon: "🧬",
      category: "subject",
      reqPoints: 100,
      unlocked: true
    },
    {
      id: "b-2",
      title: "Sahitya Ratna",
      titleBn: "সাহিত্য রত্ন",
      desc: "Mastered Adarini and Vivekananda's prose",
      descBn: "আদিরিনী ও বিবেকানন্দের প্রবন্ধ নিখুঁত সমাধান",
      icon: "📚",
      category: "subject",
      reqPoints: 200,
      unlocked: true
    },
    {
      id: "b-3",
      title: "Streak Master",
      titleBn: "৭-দিনের বহ্নিশিখা",
      desc: "Maintained a 7-day continuous study streak",
      descBn: "টানা ৭ দিন নিয়মিত পড়াশোনা ও পরীক্ষা সম্পন্ন",
      icon: "🔥",
      category: "streak",
      reqPoints: 300,
      unlocked: streakDays >= 7
    },
    {
      id: "b-4",
      title: "Speed Blitz Maestro",
      titleBn: "তড়িৎ গতি পরীক্ষক",
      desc: "Completed mock test in under 5 minutes with >90% accuracy",
      descBn: "৫ মিনিটের মধ্যে ৯০% এর বেশি নম্বরে টেস্ট শেষ",
      icon: "⚡",
      category: "speed",
      reqPoints: 450,
      unlocked: totalXp >= 400
    },
    {
      id: "b-5",
      title: "Chekhov Scholar",
      titleBn: "ইংরেজি বিশেষজ্ঞ",
      desc: "Perfect score in 'The Bet' & 'Deoli'",
      descBn: "The Bet এবং Ruskin Bond-এর প্রশ্নে পূর্ণমান",
      icon: "📜",
      category: "subject",
      reqPoints: 600,
      unlocked: totalXp >= 600
    },
    {
      id: "b-6",
      title: "Board Topper Shield",
      titleBn: "WBCHSE শ্রেষ্ঠ শিল্ড",
      desc: "Reached Level 5 and top 1% state leaderboard",
      descBn: "বোর্ড লেডারবোর্ডের শীর্ষ ১% তে স্থান অর্জন",
      icon: "👑",
      category: "accuracy",
      reqPoints: 1200,
      unlocked: totalXp >= 1200
    }
  ];

  const handleToggleGoal = (id: string, goalXp: number) => {
    soundEffects.play("click");
    setDailyGoals((prev) => {
      const next = prev.map((g) => {
        if (g.id === id) {
          const willBeDone = !g.done;
          if (willBeDone) {
            soundEffects.play("correct");
            setTotalXp((curr) => {
              const newXp = curr + goalXp;
              localStorage.setItem("ss_student_xp", newXp.toString());
              return newXp;
            });
            confetti({ particleCount: 25, spread: 50 });
          } else {
            setTotalXp((curr) => {
              const newXp = Math.max(0, curr - goalXp);
              localStorage.setItem("ss_student_xp", newXp.toString());
              return newXp;
            });
          }
          return { ...g, done: willBeDone };
        }
        return g;
      });
      localStorage.setItem("ss_daily_goals", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-900 dark:border-slate-800 shadow-[6px_6px_0px_#0f172a] overflow-hidden text-left">
      {/* Top Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider">
              <Flame size={14} className="text-yellow-200 fill-current" /> Daily Study Streak & Rewards
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              দৈনিক স্ট্রিক ও লেভেল সিস্টেম
            </h2>
            <p className="text-xs md:text-sm text-white/90">
              {userName} • WBCHSE Class 12 Semester 3 প্রিপারেশন
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/20 self-start md:self-auto">
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-white/70 block uppercase">স্ট্রিক</span>
              <div className="flex items-center gap-1 justify-center">
                <Flame size={18} className="text-yellow-400 fill-current animate-pulse" />
                <span className="text-xl md:text-2xl font-black text-white">{streakDays} দিন</span>
              </div>
            </div>
            <div className="w-[1px] h-8 bg-white/20" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-white/70 block uppercase">মোট পয়েন্ট (XP)</span>
              <span className="text-xl md:text-2xl font-black text-amber-300">+{totalXp} XP</span>
            </div>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="mt-6 p-4 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-400 text-black font-black text-[10px] uppercase">
                Level {levelInfo.level}
              </span>
              <span>{levelInfo.title}</span>
            </div>
            <span className="text-white/80 font-mono text-[11px]">
              {totalXp} / {levelInfo.nextReq} XP
            </span>
          </div>
          <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(5, levelInfo.progress))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* DAILY GOALS & CHALLENGES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-orange-500" />
              <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                আজকের লক্ষ্যমাত্রা (Daily Focus Goals)
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              সম্পন্ন: {dailyGoals.filter(g => g.done).length}/{dailyGoals.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dailyGoals.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => handleToggleGoal(goal.id, goal.xp)}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  goal.done
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/50 text-slate-800 dark:text-slate-200"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-orange-500/50 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    goal.done ? "bg-emerald-500 text-white" : "border-2 border-slate-300 dark:border-slate-600"
                  }`}>
                    {goal.done && <CheckCircle2 size={16} />}
                  </div>
                  <div>
                    <span className={`text-xs md:text-sm font-bold block ${goal.done ? "line-through text-slate-400 dark:text-slate-500" : ""}`}>
                      {goal.titleBn}
                    </span>
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                      +{goal.xp} XP বোনাস
                    </span>
                  </div>
                </div>

                <ChevronRight size={16} className="text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* ACHIEVEMENT BADGES GRID */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                অর্জন ও মেডেলসমূহ (Achievement Badges)
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              আনলকড: {badges.filter(b => b.unlocked).length}/{badges.length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {badges.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBadge(b)}
                className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-2 select-none ${
                  b.unlocked
                    ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-400/60 shadow-sm hover:scale-105"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-50 grayscale"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-2xl border border-slate-100 dark:border-slate-700">
                  {b.icon}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    {b.titleBn}
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-0.5">
                    {b.title}
                  </span>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  b.unlocked 
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                }`}>
                  {b.unlocked ? "আনলকড ✓" : "লকড"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Badge Detail Modal / Drawer */}
        <AnimatePresence>
          {selectedBadge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedBadge.icon}</span>
                <div>
                  <h4 className="text-sm font-black text-amber-300">{selectedBadge.titleBn} ({selectedBadge.title})</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{selectedBadge.descBn}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold shrink-0 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
