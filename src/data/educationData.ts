import { BoardId, BoardInfo, ClassLevel, StreamType, MediumType, Subject, Chapter } from '../types/education';

export const INDIAN_BOARDS: BoardInfo[] = [
  {
    id: 'WBCHSE',
    name: 'West Bengal Council of Higher Secondary Education',
    shortName: 'WBCHSE',
    nativeName: 'পশ্চিমবঙ্গ উচ্চমাধ্যমিক শিক্ষা সংসদ',
    state: 'West Bengal',
    description: 'Higher Secondary education (Semester 1–4 / Class 11–12) for West Bengal',
    minClass: 11,
    maxClass: 12,
    badgeColor: '#FF7A30'
  },
  {
    id: 'WBBSE',
    name: 'West Bengal Board of Secondary Education',
    shortName: 'WBBSE (Madhyamik)',
    nativeName: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ',
    state: 'West Bengal',
    description: 'Primary and Secondary curriculum (Class 1–10) including Madhyamik Pariksha',
    minClass: 1,
    maxClass: 10,
    badgeColor: '#10B981'
  },
  {
    id: 'CBSE',
    name: 'Central Board of Secondary Education',
    shortName: 'CBSE',
    nativeName: 'केन्द्रीय माध्यमिक शिक्षा बोर्ड',
    state: 'National / All India',
    description: 'National standard curriculum across India for Class 1 to 12',
    minClass: 1,
    maxClass: 12,
    badgeColor: '#3B82F6'
  },
  {
    id: 'ICSE_ISC',
    name: 'Council for the Indian School Certificate Examinations (CISCE)',
    shortName: 'ICSE / ISC',
    nativeName: 'CISCE Board',
    state: 'National / All India',
    description: 'ICSE for Class 1–10 and ISC for Class 11–12 with comprehensive English curriculum',
    minClass: 1,
    maxClass: 12,
    badgeColor: '#8B5CF6'
  },
  {
    id: 'MAHARASHTRA',
    name: 'Maharashtra State Board of Secondary and Higher Secondary Education (MSBSHSE)',
    shortName: 'Maharashtra Board',
    nativeName: 'महाराष्ट्र राज्य माध्यमिक व उच्च माध्यमिक शिक्षण मंडळ',
    state: 'Maharashtra',
    description: 'State board curriculum for SSC (Class 10) & HSC (Class 12)',
    minClass: 1,
    maxClass: 12,
    badgeColor: '#F59E0B'
  },
  {
    id: 'TAMILNADU',
    name: 'Tamil Nadu State Board of School Examination',
    shortName: 'Tamil Nadu Board (TNBSE)',
    nativeName: 'தமிழ்நாடு அரசு தேர்வுத்துறை',
    state: 'Tamil Nadu',
    description: 'Samacheer Kalvi state curriculum for Class 1 to 12',
    minClass: 1,
    maxClass: 12,
    badgeColor: '#EC4899'
  },
  {
    id: 'KARNATAKA',
    name: 'Karnataka School Examination and Assessment Board (KSEAB)',
    shortName: 'Karnataka Board (KSEEB/PUC)',
    nativeName: 'ಕರ್ನಾಟಕ ಶಾಲಾ ಪರೀಕ್ಷೆ ಮತ್ತು ಮೌಲ್ಯನಿರ್ಣಯ ಮಂಡಳಿ',
    state: 'Karnataka',
    description: 'State SSLC (Class 10) and Pre-University Course (1st & 2nd PUC)',
    minClass: 1,
    maxClass: 12,
    badgeColor: '#06B6D4'
  },
  {
    id: 'UP_BOARD',
    name: 'Uttar Pradesh Madhyamik Shiksha Parishad (UPMSP)',
    shortName: 'UP Board',
    nativeName: 'उत्तर प्रदेश माध्यमिक शिक्षा परिषद्',
    state: 'Uttar Pradesh',
    description: 'High School (Class 10) and Intermediate (Class 12) education in UP',
    minClass: 1,
    maxClass: 12,
    badgeColor: '#E11D48'
  },
  {
    id: 'BIHAR_BOARD',
    name: 'Bihar School Examination Board (BSEB)',
    shortName: 'Bihar Board (BSEB)',
    nativeName: 'बिहार विद्यालय परीक्षा समिति',
    state: 'Bihar',
    description: 'Matric (Class 10) and Inter (Class 12) examination board',
    minClass: 1,
    maxClass: 12,
    badgeColor: '#14B8A6'
  },
  {
    id: 'OTHER_STATE',
    name: 'Other Indian Recognized State Board',
    shortName: 'State Board',
    nativeName: 'রাজ্য শিক্ষা পর্ষদ / राज्य बोर्ड',
    state: 'India',
    description: 'Standard state board syllabus customized for the student',
    minClass: 1,
    maxClass: 12,
    badgeColor: '#6366F1'
  }
];

export const MEDIUMS: { id: MediumType; label: string; nativeLabel: string }[] = [
  { id: 'bengali', label: 'Bengali Medium', nativeLabel: 'বাংলা মাধ্যম' },
  { id: 'english', label: 'English Medium', nativeLabel: 'English Medium' },
  { id: 'hindi', label: 'Hindi Medium', nativeLabel: 'हिन्दी माध्यम' },
  { id: 'marathi', label: 'Marathi Medium', nativeLabel: 'मराठी माध्यम' },
  { id: 'tamil', label: 'Tamil Medium', nativeLabel: 'தமிழ் வழி' },
  { id: 'kannada', label: 'Kannada Medium', nativeLabel: 'ಕನ್ನಡ ಮಾಧ್ಯಮ' },
  { id: 'other', label: 'Other Language', nativeLabel: 'অন্যান্য ভাষা' }
];

export const STREAMS: { id: StreamType; name: string; nameBn: string; nameHi: string; icon: string; color: string; description: string }[] = [
  {
    id: 'science',
    name: 'Science',
    nameBn: 'বিজ্ঞান বিভাগ (Science)',
    nameHi: 'विज्ञान संकाय (Science)',
    icon: 'Atom',
    color: '#10B981',
    description: 'Physics, Chemistry, Mathematics, Biology, Computer Science, etc.'
  },
  {
    id: 'commerce',
    name: 'Commerce',
    nameBn: 'বাণিজ্য বিভাগ (Commerce)',
    nameHi: 'वाणिज्य संकाय (Commerce)',
    icon: 'TrendingUp',
    color: '#3B82F6',
    description: 'Accountancy, Business Studies, Economics, Commercial Law, Math, etc.'
  },
  {
    id: 'arts',
    name: 'Arts / Humanities',
    nameBn: 'কলা / মানববিদ্যা (Arts / Humanities)',
    nameHi: 'कला / मानविकी (Arts / Humanities)',
    icon: 'BookOpen',
    color: '#F59E0B',
    description: 'History, Political Science, Geography, Philosophy, Sociology, Psychology, etc.'
  }
];

/**
 * Returns the subjects dynamically based on Board, Class level, and Stream (if Class 11-12)
 */
export function getSubjectsForProfile(board: BoardId, classLevel: ClassLevel, stream?: StreamType): Subject[] {
  // CLASS 1 - 5 (Primary School)
  if (classLevel >= 1 && classLevel <= 5) {
    return [
      { id: 'primary-math', name: 'Mathematics', nativeName: 'গণিত (Maths)', category: 'elementary', iconName: 'Calculator', color: '#10B981', chaptersCount: 14 },
      { id: 'primary-english', name: 'English', nativeName: 'ইংরেজি (English)', category: 'language', iconName: 'BookOpen', color: '#3B82F6', chaptersCount: 12 },
      { id: 'primary-second-lang', name: board === 'WBCHSE' || board === 'WBBSE' ? 'Bengali (1st/2nd Lang)' : 'Hindi / Regional Language', nativeName: board === 'WBCHSE' || board === 'WBBSE' ? 'বাংলা (Bengali)' : 'हिन्दी / मातृभाषा', category: 'language', iconName: 'FileText', color: '#FF7A30', chaptersCount: 12 },
      { id: 'primary-evs', name: 'Environmental Studies (EVS)', nativeName: 'পরিবেশ বিদ্যা (EVS)', category: 'elementary', iconName: 'Sparkles', color: '#14B8A6', chaptersCount: 10 },
      { id: 'primary-gk', name: 'General Knowledge & Science', nativeName: 'সাধারণ জ্ঞান ও বিজ্ঞান', category: 'elementary', iconName: 'Lightbulb', color: '#F59E0B', chaptersCount: 8 }
    ];
  }

  // CLASS 6 - 8 (Middle School)
  if (classLevel >= 6 && classLevel <= 8) {
    return [
      { id: 'mid-math', name: 'Mathematics', nativeName: 'গণিত (Mathematics)', category: 'core', iconName: 'Calculator', color: '#10B981', chaptersCount: 16 },
      { id: 'mid-science', name: 'General Science', nativeName: 'পরিবেশ ও বিজ্ঞান (Science)', category: 'science', iconName: 'Atom', color: '#06B6D4', chaptersCount: 15 },
      { id: 'mid-english', name: 'English', nativeName: 'English (First/Second Language)', category: 'language', iconName: 'BookOpen', color: '#3B82F6', chaptersCount: 12 },
      { id: 'mid-bengali-hindi', name: board === 'WBCHSE' || board === 'WBBSE' ? 'Bengali Language & Lit' : 'Hindi / 2nd Language', nativeName: board === 'WBCHSE' || board === 'WBBSE' ? 'বাংলা সাহিত্য ও ব্যাকরণ' : 'हिन्दी साहित्य व व्याकरण', category: 'language', iconName: 'FileText', color: '#FF7A30', chaptersCount: 14 },
      { id: 'mid-history', name: 'History & Civics', nativeName: 'ইতিহাস ও সামাজিক বিজ্ঞান', category: 'arts', iconName: 'Compass', color: '#8B5CF6', chaptersCount: 10 },
      { id: 'mid-geography', name: 'Geography & Environment', nativeName: 'ভূগোল ও পরিবেশ', category: 'arts', iconName: 'Layers', color: '#F59E0B', chaptersCount: 10 },
      { id: 'mid-computer', name: 'Computer Science & ICT', nativeName: 'কম্পিউটার শিক্ষা', category: 'core', iconName: 'Cpu', color: '#EC4899', chaptersCount: 8 }
    ];
  }

  // CLASS 9 - 10 (Secondary / Madhyamik / CBSE 10 / ICSE 10) - NO STREAM RULE!
  if (classLevel === 9 || classLevel === 10) {
    const isWB = board === 'WBBSE' || board === 'WBCHSE';
    return [
      { id: 'sec-math', name: 'Mathematics', nativeName: 'গণিত (Mathematics)', category: 'core', iconName: 'Calculator', color: '#10B981', chaptersCount: 20 },
      { id: 'sec-phys-sci', name: isWB ? 'Physical Science (Physics & Chem)' : 'Science (Physics, Chem, Bio)', nativeName: isWB ? 'ভৌতবিজ্ঞান ও পরিবেশ' : 'Science (Physics, Chem, Bio)', category: 'science', iconName: 'Atom', color: '#3B82F6', chaptersCount: 18 },
      { id: 'sec-life-sci', name: isWB ? 'Life Science & Environment' : 'Biology & Environmental Science', nativeName: isWB ? 'জীবনবিজ্ঞান ও পরিবেশ' : 'Biology & Environmental Science', category: 'science', iconName: 'Dna', color: '#14B8A6', chaptersCount: 15 },
      { id: 'sec-english', name: 'English (First/Second Language)', nativeName: 'English (Reading, Writing, Grammar)', category: 'language', iconName: 'BookOpen', color: '#6366F1', chaptersCount: 12 },
      { id: 'sec-bengali-hindi', name: isWB ? 'Bengali (1st/2nd Language)' : 'Hindi / Regional Language', nativeName: isWB ? 'বাংলা প্রথম/দ্বিতীয় ভাষা' : 'हिन्दी प्रथम/द्वितीय भाषा', category: 'language', iconName: 'FileText', color: '#FF7A30', chaptersCount: 14 },
      { id: 'sec-history', name: 'History & Social Studies', nativeName: 'ইতিহাস ও সামাজিক প্রেক্ষাপট', category: 'arts', iconName: 'Compass', color: '#8B5CF6', chaptersCount: 12 },
      { id: 'sec-geography', name: 'Geography & Environment', nativeName: 'ভূগোল ও পরিবেশ', category: 'arts', iconName: 'Layers', color: '#F59E0B', chaptersCount: 12 },
      { id: 'sec-computer', name: 'Computer Applications / IT', nativeName: 'কম্পিউটার অ্যাপ্লিকেশন', category: 'core', iconName: 'Cpu', color: '#EC4899', chaptersCount: 10 }
    ];
  }

  // CLASS 11 - 12 (Higher Secondary) - STRICT STREAM LOGIC!
  const effectiveStream = stream || 'science';

  if (effectiveStream === 'science') {
    return [
      { id: 'hs-physics', name: 'Physics', nativeName: 'পদার্থবিদ্যা (Physics)', category: 'science', iconName: 'Zap', color: '#3B82F6', chaptersCount: 15, description: 'Electrostatics, Current, Optics, Modern Physics, Mechanics' },
      { id: 'hs-chemistry', name: 'Chemistry', nativeName: 'রসায়নবিদ্যা (Chemistry)', category: 'science', iconName: 'FlaskConical', color: '#EC4899', chaptersCount: 16, description: 'Physical, Inorganic (p/d/f Block), Organic Chemistry, Biomolecules' },
      { id: 'hs-math', name: 'Mathematics', nativeName: 'গণিত (Mathematics)', category: 'science', iconName: 'Calculator', color: '#10B981', chaptersCount: 18, description: 'Calculus, Algebra, Coordinate Geometry, Vectors, Probability' },
      { id: 'hs-biology', name: 'Biology', nativeName: 'জীববিদ্যা (Biology)', category: 'science', iconName: 'Dna', color: '#14B8A6', chaptersCount: 16, description: 'Reproduction, Genetics, Evolution, Biotechnology, Ecology' },
      { id: 'hs-computer-sci', name: 'Computer Science / Application', nativeName: 'কম্পিউটার অ্যাপ্লিকেশন / সায়েন্স', category: 'science', iconName: 'Cpu', color: '#8B5CF6', chaptersCount: 12, description: 'Python, DBMS, Networking, Web Tech, Data Structures' },
      { id: 'hs-english-b', name: 'English (Core / Elective)', nativeName: 'English B (Literature, Grammar, Writing)', category: 'language', iconName: 'BookOpen', color: '#FF7A30', chaptersCount: 10, description: 'Prose, Verse, Drama, Comprehension & Composition' },
      { id: 'hs-bengali-a', name: 'Bengali A / Hindi / 1st Language', nativeName: 'বাংলা এ (সাহিত্য ও ভাষাতত্ত্ব)', category: 'language', iconName: 'FileText', color: '#EF4444', chaptersCount: 12, description: 'গল্প, প্রবন্ধ, কবিতা, আন্তর্জাতিক সাহিত্য, ব্যাকরণ ও ভাষাতত্ত্ব' },
      { id: 'hs-statistics', name: 'Statistics', nativeName: 'পরিসংখ্যান (Statistics)', category: 'science', iconName: 'BarChart3', color: '#F59E0B', chaptersCount: 10, description: 'Probability Distributions, Sampling, Index Numbers, Time Series' }
    ];
  }

  if (effectiveStream === 'commerce') {
    return [
      { id: 'hs-accountancy', name: 'Accountancy', nativeName: 'হিসাবশাস্ত্র (Accountancy)', category: 'commerce', iconName: 'Coins', color: '#10B981', chaptersCount: 14, description: 'Partnership, Company Accounts, Financial Statements, Cash Flow' },
      { id: 'hs-business-studies', name: 'Business Studies / Organization', nativeName: 'কারবার শিক্ষা (Business Studies)', category: 'commerce', iconName: 'Briefcase', color: '#3B82F6', chaptersCount: 12, description: 'Principles of Management, Marketing, Finance, Business Environment' },
      { id: 'hs-economics', name: 'Economics', nativeName: 'অর্থনীতি (Economics)', category: 'commerce', iconName: 'TrendingUp', color: '#F59E0B', chaptersCount: 14, description: 'Microeconomics, Macroeconomics, Indian Economic Development' },
      { id: 'hs-commercial-law', name: 'Commercial Law & Auditing / Costing', nativeName: 'বাণিজ্যিক আইন ও হিসাব নিরীক্ষণ', category: 'commerce', iconName: 'Shield', color: '#8B5CF6', chaptersCount: 10, description: 'Contract Law, Sale of Goods, Partnership Law, Costing & Tax' },
      { id: 'hs-applied-math', name: 'Applied Mathematics / Commercial Math', nativeName: 'বাণিজ্যিক গণিত ও পরিসংখ্যান', category: 'commerce', iconName: 'Calculator', color: '#06B6D4', chaptersCount: 12, description: 'Financial Mathematics, Linear Programming, Probability, Statistics' },
      { id: 'hs-english-b', name: 'English (Core / Elective)', nativeName: 'English (Literature & Business Writing)', category: 'language', iconName: 'BookOpen', color: '#FF7A30', chaptersCount: 10 },
      { id: 'hs-bengali-a', name: 'Bengali / Hindi / 1st Language', nativeName: 'বাংলা / মাতৃভাষা', category: 'language', iconName: 'FileText', color: '#EF4444', chaptersCount: 12 }
    ];
  }

  // Arts / Humanities
  return [
    { id: 'hs-history', name: 'History', nativeName: 'ইতিহাস (History)', category: 'arts', iconName: 'Compass', color: '#F59E0B', chaptersCount: 12, description: 'World History, Colonialism, Indian Freedom Struggle, Modern Era' },
    { id: 'hs-pol-science', name: 'Political Science', nativeName: 'রাষ্ট্রবিজ্ঞান (Political Science)', category: 'arts', iconName: 'Shield', color: '#3B82F6', chaptersCount: 12, description: 'Indian Constitution, Political Theory, International Relations, Judiciary' },
    { id: 'hs-geography', name: 'Geography', nativeName: 'ভূগোল (Geography)', category: 'arts', iconName: 'Layers', color: '#10B981', chaptersCount: 14, description: 'Physical Geography, Human Geography, Economic Geography of India' },
    { id: 'hs-philosophy', name: 'Philosophy', nativeName: 'দর্শন (Philosophy)', category: 'arts', iconName: 'Brain', color: '#8B5CF6', chaptersCount: 10, description: 'Western Epistemology, Indian Philosophy (Nyaya, Vedanta), Logic, Ethics' },
    { id: 'hs-sociology', name: 'Sociology', nativeName: 'সমাজতত্ত্ব (Sociology)', category: 'arts', iconName: 'Users', color: '#EC4899', chaptersCount: 10, description: 'Indian Society, Social Change, Institutions, Stratification' },
    { id: 'hs-psychology', name: 'Psychology / Education', nativeName: 'মনোবিজ্ঞান / শিক্ষাবিজ্ঞান (Education)', category: 'arts', iconName: 'Lightbulb', color: '#06B6D4', chaptersCount: 11, description: 'Human Development, Learning Theories, Motivation, Mental Health' },
    { id: 'hs-english-b', name: 'English (Core / Elective)', nativeName: 'English (Prose, Poetry, Composition)', category: 'language', iconName: 'BookOpen', color: '#FF7A30', chaptersCount: 10 },
    { id: 'hs-bengali-a', name: 'Bengali / Hindi / 1st Language', nativeName: 'বাংলা / মাতৃভাষা সাহিত্য', category: 'language', iconName: 'FileText', color: '#EF4444', chaptersCount: 12 }
  ];
}

/**
 * Returns default selected subjects for a given board, class and stream
 */
export function getDefaultSubjects(board: BoardId, classLevel: ClassLevel, stream?: StreamType): string[] {
  const subjects = getSubjectsForProfile(board, classLevel, stream);
  return subjects.map(s => s.id);
}
