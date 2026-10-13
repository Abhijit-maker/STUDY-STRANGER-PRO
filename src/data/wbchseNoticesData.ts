export interface OfficialNotice {
  id: string;
  title: string;
  text: string;
  category: "Exam Alert" | "WBCHSE Sem 3" | "Study Material" | "Urgent" | "Class Notice";
  timestamp: string;
  author: string;
  isPinned?: boolean;
  pdfName?: string;
  pdfUrl?: string;
  pdfSize?: string;
  badge?: string;
}

export const DEFAULT_WBCHSE_NOTICES: OfficialNotice[] = [
  {
    id: "notice-sem3-routine-2026",
    title: "📢 WBCHSE Class 12 Semester 3 Official Exam Routine & Time Schedule",
    text: "পশ্চিমবঙ্গ উচ্চমাধ্যমিক শিক্ষা সংসদ (WBCHSE) ২০২৬ শিক্ষাবর্ষের ক্লাস ১২ সেমিস্টার ৩ পরীক্ষার চূড়ান্ত নির্ঘণ্ট ও সময়সূচি প্রকাশ করেছে। সকল ছাত্রছাত্রীদের নির্ধারিত সময় অনুযায়ী ওএমআর (OMR) ও এমসিকিউ পরীক্ষার জন্য প্রস্তুতি নিতে নির্দেশ দেওয়া হচ্ছে। পরীক্ষার হলে ৩০ মিনিট পূর্বে প্রবেশ বাধ্যতামূলক।",
    category: "Exam Alert",
    timestamp: new Date().toISOString(),
    author: "WBCHSE Examination Council",
    isPinned: true,
    pdfName: "WBCHSE_Class12_Sem3_Official_Routine_2026.pdf",
    pdfUrl: "https://wbchse.wb.gov.in/routine_sem3.pdf",
    pdfSize: "1.4 MB",
    badge: "URGENT"
  },
  {
    id: "notice-bio-genetics-model",
    title: "🧬 জীববিদ্যা (Biology) Unit I & II উচ্চমাধ্যমিক গুরুত্বপূর্ণ MCQ ও চিত্র সহায়িকা",
    text: "Biology Semester 3 স্পেশাল স্টাডি মেটিরিয়াল: সপুষ্পক উদ্ভিদের দ্বিনিষেক (Double Fertilization), মানব জননে শুক্রাণুর এক্রোসোম ও ZP3 রিসেপ্টর বন্ধন, এবং জেনেটিক্সে ডিএনএ প্রতিরূপ গঠন (SSB প্রোটিন ও ওকাজাকি খণ্ড)। প্রতিটি অধ্যায়ের সমাধানসহ প্রশ্ন ব্যাংক সংযুক্ত।",
    category: "Study Material",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    author: "Abhijit (Admin) • Academic Lead",
    isPinned: true,
    pdfName: "Biology_Sem3_Reproduction_Genetics_Model_Set.pdf",
    pdfUrl: "https://studystranger.ai.studio/bio_sem3.pdf",
    pdfSize: "2.8 MB",
    badge: "HIGH YIELD"
  },
  {
    id: "notice-bengali-adarini-study",
    title: "📖 বাংলা এ (Bengali A) 'আদিরিনী' ও 'বাঙ্গালা ভাষা' সংক্ষিপ্ত প্রশ্নোত্তর সংকলন",
    text: "প্রভাতকুমার মুখোপাধ্যায়ের 'আদিরিনী' গল্পে হাতিটির দাম (২০০০ টাকা), জয়রাম মোক্তারের পারিবারিক সম্পর্ক এবং স্বামী বিবেকানন্দের 'বাঙ্গালা ভাষা' প্রবন্ধের মূলভাব নিয়ে সেমিস্টার ৩ স্পেশাল নোটস ও ১০০% সম্ভাব্য প্রশ্নাবলি।",
    category: "WBCHSE Sem 3",
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    author: "Language Dept • Study Stranger",
    isPinned: false,
    pdfName: "BengaliA_Adarini_BanglaBhasha_Notes.pdf",
    pdfUrl: "https://studystranger.ai.studio/bengali_sem3.pdf",
    pdfSize: "1.9 MB",
    badge: "SYLLABUS"
  },
  {
    id: "notice-english-thebet-ulysses",
    title: "📚 English B: 'The Bet' & 'Ulysses' Critical Quotes & Analysis",
    text: "Anton Chekhov's 'The Bet' (2 Million Rubles wager for 15 years isolation), Tennyson's 'Ulysses' key quotation ('To strive, to seek, to find, and not to yield'), and Ruskin Bond's 'The Night Train at Deoli' thematic summary for Board scoring.",
    category: "Study Material",
    timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
    author: "English Editorial Board",
    isPinned: false,
    pdfName: "EnglishB_TheBet_Ulysses_Deoli_Guide.pdf",
    pdfUrl: "https://studystranger.ai.studio/english_sem3.pdf",
    pdfSize: "2.1 MB",
    badge: "MUST READ"
  },
  {
    id: "notice-omr-guidelines",
    title: "⚡ ওএমআর শিট (OMR Sheet) পূরণ ও নেগেটিভ মার্কিং সতর্কতা নির্দেশিকা",
    text: "উচ্চমাধ্যমিক পরীক্ষার ওএমআর শিটে রোল নম্বর ও সাবজেক্ট কোড পূরণে শুধুমাত্র কালো বা নীল বলপেন ব্যবহার করতে হবে। কোনো প্রকার কাটাকাটি বা ফ্লুইড ব্যবহার নিষিদ্ধ। ১টি প্রশ্নের জন্য একাধিক বৃত্ত ভরাট করলে নম্বর বাতিল হবে।",
    category: "Urgent",
    timestamp: new Date(Date.now() - 3600000 * 50).toISOString(),
    author: "WBCHSE Evaluation Board",
    isPinned: false,
    pdfName: "OMR_Filling_Official_Rules_WBCHSE.pdf",
    pdfUrl: "https://studystranger.ai.studio/omr_guide.pdf",
    pdfSize: "980 KB",
    badge: "RULES"
  }
];
