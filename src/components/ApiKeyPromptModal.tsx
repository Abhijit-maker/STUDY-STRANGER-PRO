import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Key,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  X,
  Sparkles
} from "lucide-react";

interface ApiKeyPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => Promise<void> | void;
  currentKey?: string;
  userName?: string;
  featureNotice?: string;
}

export const ApiKeyPromptModal: React.FC<ApiKeyPromptModalProps> = ({
  isOpen,
  onClose,
  onSaveKey,
  currentKey = "",
  userName = "Student",
  featureNotice = ""
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(currentKey);
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const studioUrl = "https://aistudio.google.com/app/apikey";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(studioUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSave = async () => {
    const cleanKey = apiKeyInput.trim();
    setErrorMsg("");

    if (!cleanKey) {
      setErrorMsg("Please provide your Gemini API Key (or click 'Skip for now')");
      return;
    }

    if (!cleanKey.startsWith("AIza") && cleanKey.length < 20) {
      setErrorMsg("Please enter a valid Gemini API Key (usually starts with 'AIza')");
      return;
    }

    setIsSaving(true);
    try {
      await onSaveKey(cleanKey);
      setSuccessMsg("API Key saved & activated successfully!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save API Key. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[140] flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/40 backdrop-blur-md select-none"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-white border border-slate-200 text-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl shadow-slate-900/15 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 via-amber-50/40 to-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 border border-orange-200 flex items-center justify-center shadow-xs">
                <Key size={22} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  Gemini API Key Required
                  <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    100% Free
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Welcome {userName}! Unlock unlimited high-speed AI learning
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-sm">
            {/* Feature Notice (English prompt when trying to use feature without key) */}
            {featureNotice ? (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs leading-relaxed flex items-start gap-3 shadow-xs">
                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-950 font-black text-sm block mb-1">
                    Please provide your Gemini API Key to use this feature!
                  </strong>
                  <p className="text-amber-800 font-medium">
                    {featureNotice} You can get your own 100% free API key from Google AI Studio in less than a minute.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 text-xs leading-relaxed flex items-start gap-2.5">
                <Sparkles size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-orange-900 font-bold block mb-0.5">Please provide your Gemini API Key (100% Free)</strong>
                  Connect your Google Gemini API key to enjoy real-time voice mentorship, instant math solutions, and unlimited Class 12 WBCHSE mock tests without waiting or rate limits.
                </div>
              </div>
            )}

            {/* Step by step guide in English & Bengali */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-orange-500" />
                How to get your free API key in 1 minute:
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Open Google AI Studio</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Click the button on the right to open Google's official API Key page.
                    </p>
                  </div>
                  <a
                    href={studioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                  >
                    Open Page <ExternalLink size={11} />
                  </a>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Sign in with your Google account</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Use any standard Gmail account. No credit card or payment needed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Click "Create API Key"</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Click the blue 'Create API key' button and copy your generated key (e.g., AIzaSy...).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Paste and Save below</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Paste your key in the box below and click 'Save & Activate'.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Box */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>আপনার Gemini API Key পেস্ট করুন</span>
                <span className="text-[10px] font-normal text-slate-400">starts with AIzaSy...</span>
              </label>

              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setErrorMsg("");
                  }}
                  placeholder="AIzaSy..."
                  className="w-full bg-white border border-slate-300 focus:border-orange-500 rounded-2xl px-4 py-3.5 pr-11 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors shadow-xs"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium mt-1">
                  <AlertCircle size={13} className="shrink-0" />
                  {errorMsg}
                </p>
              )}

              {successMsg && (
                <p className="text-xs text-emerald-600 flex items-center gap-1.5 font-bold mt-1">
                  <CheckCircle2 size={14} className="shrink-0" />
                  {successMsg}
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all text-center"
            >
              এখন নয় (Skip for now)
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={studioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200 shadow-xs"
              >
                AI Studio লিঙ্ক <ExternalLink size={13} />
              </a>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    সেভ হচ্ছে...
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    Save & Activate
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
