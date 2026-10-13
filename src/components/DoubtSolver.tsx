import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Bot, Sparkles, User, Brain, BookOpen, AlertCircle, Bookmark, Zap, Mic, Camera } from "lucide-react";
import { getStrangerResponse } from "../services/geminiService";
import { AIMemoryVault } from "./AIMemoryVault";
import { TypewriterText } from "./TypewriterText";
import { AIMascot } from "./aurora/AIMascot";
import { PremiumButton } from "./aurora/PremiumButton";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

interface DoubtSolverProps {
  onClose: () => void;
  initialSubject?: string;
  apiKey?: string;
  userName?: string;
  userId?: string;
}

export const DoubtSolver: React.FC<DoubtSolverProps> = ({ 
  onClose, 
  initialSubject = "Bengali", 
  apiKey, 
  userName = "Abhijit",
  userId = "default"
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: `Hello ${userName}! Ami tomar ${initialSubject} AI Study Companion. Ki jante chao? (I'm your ${initialSubject} AI tutor. What would you like to understand today?)`
    }
  ]);
  const [input, setInput] = useState(() => localStorage.getItem("draft_doubt_input") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [showMemoryVault, setShowMemoryVault] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    `Explain ZP3 receptor in Fertilization`,
    `Kirchhoff's Laws formula & summary`,
    `Strong Roots - Spiritual Upbringing`,
    `আদিরিনী গল্পের জয়রাম মোক্তারের মূল ভাব`
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sender: "user",
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    localStorage.removeItem("draft_doubt_input");
    setIsLoading(true);

    try {
      const response = await getStrangerResponse(
        `Answer as a helpful tutor for WBCHSE Class 12 Semester 3. Subject: ${initialSubject}. Question: ${textToSend}. Provide clear, friendly, and structured guidance in Bengali & English where helpful.`,
        messages.map(m => ({ id: m.id, sender: m.sender === 'bot' ? 'stranger' : 'user', text: m.text })),
        "stranger",
        apiKey,
        userName,
        userId
      );

      const botMsg: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender: "bot",
        text: response
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Doubt Solver Error:", error);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender: "bot",
        text: "Sorry, an issue occurred while retrieving the response. Please try asking again!"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AIMemoryVault 
        isOpen={showMemoryVault} 
        onClose={() => setShowMemoryVault(false)} 
        userId={userId} 
        userName={userName} 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md"
      >
        <div className="stranger-modal w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden relative">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between relative z-10 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <AIMascot 
                state={isLoading ? "thinking" : "idle"}
                size="sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-white leading-none">
                    Study Stranger AI
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 text-[10px] font-black">
                    {initialSubject}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-orange-600 dark:text-orange-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  <span>WBCHSE Sem 3 Companion</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMemoryVault(true)}
                className="stranger-btn-secondary px-3 py-1.5 flex items-center gap-1.5 text-xs"
                title="Manage AI Account Memory"
              >
                <Brain size={14} className="text-orange-500" />
                <span className="hidden sm:inline">Memory</span>
              </button>

              <a
                href="/app/settings"
                className="stranger-btn-secondary px-3 py-1.5 flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300"
                title="Configure Gemini API Key in Settings"
              >
                <Sparkles size={14} className="text-purple-500" />
                <span className="hidden sm:inline">API Key</span>
              </a>

              <button 
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors flex items-center justify-center cursor-pointer border border-stone-200 dark:border-stone-700"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-4 py-2.5 bg-stone-50/50 dark:bg-stone-950/20 border-b border-stone-100 dark:border-stone-800 flex gap-2 overflow-x-auto scrollbar-hide">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="text-[11px] font-bold px-3.5 py-1.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-orange-500/50 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50 shadow-sm"
              >
                <Zap size={12} className="text-orange-500" />
                <span>{q}</span>
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/30 dark:bg-stone-900/20">
            {messages.map((msg, idx) => (
              <motion.div
                key={`doubt-${msg.id}-${idx}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  msg.sender === "user" 
                    ? "bg-orange-500 text-white" 
                    : "bg-white dark:bg-stone-800 text-orange-600 border border-stone-100 dark:border-stone-700"
                }`}>
                  {msg.sender === "user" ? <User size={15} /> : <Sparkles size={15} />}
                </div>
                
                <div className={`max-w-[84%] p-4 rounded-2xl text-xs sm:text-sm font-medium shadow-sm transition-all leading-relaxed ${
                  msg.sender === "user" 
                    ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-tr-none font-semibold" 
                    : "bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 rounded-tl-none border border-stone-100 dark:border-stone-700 shadow-xl shadow-stone-200/50 dark:shadow-none"
                }`}>
                  {msg.sender === "user" ? (
                    msg.text
                  ) : (
                    <TypewriterText
                      text={msg.text}
                      enabled={idx === messages.length - 1}
                      speed={12}
                      chunkSize={3}
                      onComplete={scrollToBottom}
                      cursorClassName="inline-block w-1.5 h-3.5 bg-orange-500 ml-0.5 align-middle animate-pulse"
                    />
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-stone-800 text-orange-500 border border-stone-100 dark:border-stone-700 flex items-center justify-center animate-pulse shadow-md">
                  <Brain size={15} />
                </div>
                <div className="bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 p-4 rounded-2xl rounded-tl-none border border-stone-100 dark:border-stone-700 italic text-xs shadow-sm flex items-center gap-2">
                  <Sparkles size={14} className="animate-spin text-orange-500" />
                  <span className="font-semibold">Thinking &amp; analyzing question...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input */}
          <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 relative z-10">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }} 
              className="flex items-center gap-2.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  const val = e.target.value;
                  setInput(val);
                  localStorage.setItem("draft_doubt_input", val);
                }}
                placeholder="Ask anything about your Class 12 syllabus..."
                className="stranger-input flex-1"
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="stranger-btn-primary p-3.5 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>

            <div className="mt-3 flex items-center gap-4 text-[10px] font-bold text-stone-400 justify-center">
              <span className="flex items-center gap-1.5 text-stone-400">
                <BookOpen size={12} className="text-orange-500" />
                WBCHSE Syllabus Grounded
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-stone-400">
                <Zap size={12} className="text-orange-500" />
                Instant Gemini AI Solutions
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
