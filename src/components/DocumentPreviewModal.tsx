import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Download, Printer, Copy, Check, ZoomIn, ZoomOut, RotateCcw, 
  FileText, BookOpen, Eye, Share2, Sparkles, ChevronLeft, ChevronRight,
  ExternalLink, Maximize2, Minimize2, FileCode, AlertCircle
} from "lucide-react";
import "katex/dist/katex.min.css";
import { MathText } from "./MathText";
import { triggerPdfDownload } from "../services/pdfStorageService";

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  content?: string | { title: string; body: string }[];
  pdfData?: string;
  pdfUrl?: string;
  pdfName?: string;
  type?: "notes" | "pdf" | "summary" | "flashcard" | "doc";
  subject?: string;
  date?: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle = "WBCHSE Class 12 Study Material • Document Viewer",
  content = "",
  pdfData = "",
  pdfUrl = "",
  pdfName = "",
  type = "notes",
  subject = "Biology",
  date = new Date().toLocaleDateString()
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string>("");

  const hasPdfBinary = !!pdfData;
  const hasPdfLink = !!pdfUrl;
  const isDirectPdf = hasPdfBinary || hasPdfLink || type === "pdf";

  useEffect(() => {
    if (pdfData && pdfData.startsWith("data:application/pdf")) {
      try {
        const arr = pdfData.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "application/pdf";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.warn("Failed to create blob url for PDF:", err);
      }
    }
  }, [pdfData]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      const textToCopy = typeof content === "string" 
        ? content 
        : Array.isArray(content) ? content.map(c => `${c.title}\n${c.body}`).join("\n\n") : "";
      await navigator.clipboard.writeText(textToCopy || title);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const downloadSource = blobUrl || pdfData || pdfUrl;
    const finalName = pdfName || `${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    
    if (downloadSource) {
      triggerPdfDownload(downloadSource, finalName);
    } else {
      // Fallback text notes download
      const textToSave = typeof content === "string" 
        ? content 
        : Array.isArray(content) ? content.map(c => `${c.title}\n${c.body}`).join("\n\n") : title;
      const blob = new Blob([textToSave], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_Notes.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 font-sans text-slate-800 dark:text-slate-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`w-full ${
            isFullscreen ? "max-w-[98vw] h-[96vh]" : "max-w-5xl h-[92vh]"
          } stranger-modal flex flex-col overflow-hidden relative transition-all duration-300`}
        >
          {/* Header */}
          <header className="px-6 py-4 bg-stone-50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                <FileText size={22} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-black text-stone-900 dark:text-white tracking-tight truncate max-w-md">
                    {title}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 shrink-0">
                    {subject}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-stone-400 dark:text-stone-500 mt-0.5 truncate">
                  {subtitle} • {date}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-300 flex items-center justify-center transition-all border border-stone-200 dark:border-stone-700/60 cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950 text-stone-500 dark:text-stone-400 flex items-center justify-center transition-all border border-stone-200 dark:border-stone-700/60 cursor-pointer"
                title="Close Document"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          {/* Document Toolbar */}
          <div className="px-6 py-2.5 bg-stone-100/80 dark:bg-stone-900/80 border-b border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            {/* Zoom Controls */}
            {!blobUrl && !pdfUrl && (
              <div className="flex items-center gap-1 bg-white dark:bg-stone-950 p-1 rounded-xl border border-stone-200 dark:border-stone-800">
                <button 
                  onClick={() => setZoom(z => Math.max(70, z - 10))} 
                  className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-600 dark:text-stone-300"
                  title="Zoom Out"
                >
                  <ZoomOut size={15} />
                </button>
                <span className="text-[11px] font-mono font-black px-2 min-w-[50px] text-center text-orange-600">
                  {zoom}%
                </span>
                <button 
                  onClick={() => setZoom(z => Math.min(150, z + 10))} 
                  className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-600 dark:text-stone-300"
                  title="Zoom In"
                >
                  <ZoomIn size={15} />
                </button>
                <button 
                  onClick={() => setZoom(100)} 
                  className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-400"
                  title="Reset Zoom"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            )}

            {/* If PDF link is external */}
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white dark:bg-stone-950 text-sky-500 hover:text-sky-400 rounded-xl font-bold border border-stone-200 dark:border-stone-800 flex items-center gap-1.5 text-[11px]"
              >
                <ExternalLink size={13} />
                <span>Open in Web Tab</span>
              </a>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleCopy}
                className="stranger-btn-secondary px-3 py-1.5 flex items-center gap-1.5 text-[11px]"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Copy Info"}</span>
              </button>

              <button
                onClick={handlePrint}
                className="stranger-btn-secondary px-3 py-1.5 flex items-center gap-1.5 text-[11px]"
              >
                <Printer size={14} />
                <span>Print</span>
              </button>

              <button
                onClick={handleDownload}
                className="stranger-btn-primary px-4 py-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider"
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Document Content Viewport */}
          <div className="flex-1 overflow-y-auto bg-stone-200/50 dark:bg-stone-950/60 flex flex-col justify-start items-center p-2 sm:p-6">
            {/* Embedded Live PDF Viewer */}
            {(blobUrl || (pdfUrl && !content)) ? (
              <div className="w-full h-full min-h-[550px] bg-stone-900 rounded-[2rem] overflow-hidden border border-stone-700/80 shadow-2xl flex flex-col relative">
                <iframe
                  src={blobUrl || pdfUrl}
                  title={title || "PDF Document"}
                  className="w-full h-full flex-1 border-0 rounded-[2rem]"
                />
              </div>
            ) : (
              /* Rich Formatted Study Notes & Document Viewer */
              <div 
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
                className="w-full max-w-3xl stranger-card bg-white dark:bg-stone-900 min-h-[700px] p-8 sm:p-12 rounded-[2.5rem] border border-stone-200/80 dark:border-stone-800 shadow-xl space-y-6 transition-transform duration-200 my-auto"
              >
                {/* Cover Banner */}
                <div className="pb-6 border-b border-stone-200 dark:border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">
                    <span>Study Stranger Official Study Document</span>
                    <span>WBCHSE Sem 3</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white leading-tight">
                    {title}
                  </h1>
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    Prepared for WBCHSE Class 12 Students • Official Syllabus Standard
                  </p>
                </div>

                {/* Render String or Structured Body */}
                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-stone-800 dark:text-stone-200 font-sans">
                  {typeof content === "string" ? (
                    <MathText text={content || "No document body available."} className="whitespace-pre-wrap block" />
                  ) : Array.isArray(content) ? (
                    content.map((section, idx) => (
                      <div key={idx} className="space-y-2 p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700">
                        <h3 className="text-base font-black text-orange-600 dark:text-orange-400 flex items-center gap-2">
                          <span>{idx + 1}.</span> {section.title}
                        </h3>
                        <MathText text={section.body} className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 leading-relaxed block" />
                      </div>
                    ))
                  ) : null}
                </div>

                {/* Document Footer */}
                <div className="pt-8 border-t border-stone-200 dark:border-stone-800 text-center text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                  Verified with Study Stranger AI & Academic System • Dark Mode Enabled
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
