export const USER = {
  username: 'Abhiyaan963',
  password: 'Abhijit@12',
  name: 'Abhijit',
  classLabel: 'WBCHSE Class 12 • Semester 3'
}

export const MENTORS = [
  { id: 'stranger', name: 'Stranger Dada', bn: 'জাদু দাদা', role: 'Lead mentor', tone: 'Calm, cinematic, exam-first', color: 'var(--pink)' },
  { id: 'mahi', name: 'Mahi Didi', bn: 'মাহি দিদি', role: 'WBCHSE mentor', tone: 'Warm, syllabus-tight, encouraging', color: 'var(--yellow)' },
  { id: 'anjali', name: 'Anjali Didi', bn: 'অঞ্জলি দিদি', role: 'Biology peer', tone: 'Friendly, reproduction & genetics', color: 'var(--lime)' },
  { id: 'zoya', name: 'Zoya Didi', bn: 'জয়া দিদি', role: 'Classmate coach', tone: 'Fast, quiz energy, English B', color: 'var(--teal)' }
]

export const TOOLS = [
  { id: 'mock', to: '/app/mock', title: 'Mock Test AI', desc: 'Full-length timed exam simulation', tag: 'Exam Sim', color: 'var(--yellow)' },
  { id: 'doubt', to: '/app/doubt', title: 'AI Doubt Solver', desc: 'Instant step-by-step solutions', tag: 'AI Mentor', color: 'var(--teal)' },
  { id: 'voice', to: '/app/voice', title: 'Voice Tutor', desc: 'Real-time voice discussions for Class 12', tag: 'Voice AI', color: 'var(--lime)' },
  { id: 'flash', to: '/app/flashcards', title: '3D Flashcards', desc: 'Spaced-repetition concept cards', tag: 'Flashcards', color: 'var(--pink)' },
  { id: 'notes', to: '/app/notes', title: 'Revision Notes', desc: 'Bengali & English chapter notes for Sem 3', tag: 'Notes Hub', color: 'var(--peach)' },
  { id: 'mind', to: '/app/mindmap', title: 'Concept Mind Maps', desc: 'Interactive visual knowledge trees', tag: 'Visualizer', color: 'var(--blue)' },
  { id: 'mcq', to: '/app/mcq', title: 'WBCHSE MCQ Bank', desc: 'Sem 3 MCQs with Bengali explanations', tag: 'MCQ Bank', color: 'var(--teal)' },
  { id: 'blitz', to: '/app/blitz', title: 'Speed Blitz', desc: '60-second rapid fire MCQ sprints', tag: 'Fast Quiz', color: 'var(--peach)' },
  { id: 'focus', to: '/app/focus', title: 'Focus Study Room', desc: 'Pomodoro timer + binaural study audio', tag: 'Focus', color: 'var(--yellow)' },
  { id: 'notices', to: '/app/notices', title: 'Notice Board PDFs', desc: 'WBCHSE official notices & routine PDFs', tag: 'PDF Board', color: 'var(--lime)' },
  { id: 'scanner', to: '/app/scanner', title: 'Question Scanner', desc: 'Scan textbook pages & photos instantly', tag: 'OCR AI', color: 'var(--pink)' },
  { id: 'math', to: '/app/formulas', title: 'Formula Cheat Sheet', desc: 'Maths, Physics & Chemistry solver', tag: 'Formulas', color: 'var(--lime)' },
  { id: 'mistakes', to: '/app/mistakes', title: 'Mistake Bank', desc: 'Review incorrect answers & fix errors', tag: 'Fix Errors', color: 'var(--peach)' },
  { id: 'syllabus', to: '/app/syllabus', title: 'Class 12 Roadmap', desc: 'Semester 3 syllabus tracker checklist', tag: 'Syllabus', color: 'var(--teal)' },
  { id: 'memory', to: '/app/memory', title: 'AI Memory Vault', desc: 'Persistent account-synced study memory', tag: 'Vault', color: 'var(--pink)' },
  { id: 'lab', to: '/app/lab', title: '3D Science Lab', desc: 'Interactive Chemistry, Physics, Math in 3D', tag: '3D Studio', color: 'var(--blue)' },
  { id: 'autopsy', to: '/app/autopsy', title: 'AI Weak Area Autopsy', desc: 'Diagnostic mistake analysis & 5-min fix', tag: 'Diagnostic', color: 'var(--peach)' },
  { id: 'voicequiz', to: '/app/voice-quiz', title: 'Voice MCQ Challenge', desc: 'Speak answers aloud to AI mentor', tag: 'Voice AI', color: 'var(--teal)' },
  { id: 'duel', to: '/app/duel', title: '1v1 Friend Quiz Duel', desc: 'Battle classmates on chat rooms', tag: '1v1 Arena', color: 'var(--yellow)' },
  { id: 'pdf', to: '/app/model-paper', title: 'Model Paper OMR PDF', desc: '1-click printable question & OMR sheet', tag: 'Printable', color: 'var(--lime)' },
  { id: 'diary', to: '/app/diary', title: 'Formula Quote Diary', desc: 'Personal sticky equations & literary quotes', tag: 'Bookmarks', color: 'var(--pink)' },
  { id: 'telegram', to: '/app/telegram', title: 'Telegram AI Bot', desc: 'Study reminders & quizzes on Telegram', tag: 'Bot Hub', color: 'var(--blue)' },
  { id: 'calls', to: '/app/vigilance', title: 'Daily Calls & Parent Vigilance', desc: 'Morning/night calls and study proof reports', tag: 'Vigilance', color: 'var(--peach)' },
  { id: 'mentors', to: '/app/mentors', title: 'AI Mentors', desc: 'Stranger, Mahi, Anjali and Zoya on call', tag: 'Companions', color: 'var(--yellow)' }
]

export const FEATURES = [
  {
    kicker: 'Study Plan',
    title: 'Know exactly what comes next',
    body: 'Stranger builds a Semester 3 schedule around Biology, Bengali A and English B, breaking chapters into clear milestones before board day.',
    color: 'var(--pink)'
  },
  {
    kicker: 'Stranger',
    title: 'Meet a student’s best friend',
    body: 'Your AI powered tutor who keeps you moving from first lecture to final exam, helping you find every answer yourself in Bangla and English.',
    color: 'var(--yellow)'
  },
  {
    kicker: 'Tutor Me',
    title: 'Personalized help, available 24/7',
    body: 'From genetics diagrams to Adarini prose, get help in ways that match how you actually learn — voice, notes, or timed drills.',
    color: 'var(--teal)'
  },
  {
    kicker: 'Live Lecture',
    title: 'Ask questions in real-time',
    body: 'While you study, Stranger generates notes, flags likely MCQs, and tells you what WBCHSE usually asks next.',
    color: 'var(--lime)'
  },
  {
    kicker: 'Notes',
    title: 'Your materials, organized and ready',
    body: 'Upload PDFs, photos of class notes, or textbook pages and get clean, bilingual notes in seconds.',
    color: 'var(--peach)'
  },
  {
    kicker: 'Arcade',
    title: 'Study hard, play harder',
    body: 'Speed Blitz, 1v1 duels and voice MCQs turn Sem 3 chapters into games you will actually finish.',
    color: '#eceae0'
  }
]

export const SYLLABUS = [
  {
    subject: 'Biology',
    color: 'var(--lime)',
    chapters: [
      { name: 'Sexual Reproduction in Flowering Plants', bn: 'সপুষ্পক উদ্ভিদের যৌন জনন', done: true },
      { name: 'Human Reproduction', bn: 'মানব জনন', done: true },
      { name: 'Reproductive Health', bn: 'প্রজনন স্বাস্থ্য', done: false },
      { name: 'Principles of Inheritance & Variation', bn: 'বংশাণুগতিকতা ও প্রকরণ', done: false },
      { name: 'Molecular Basis of Inheritance', bn: 'বংশাণুর আণবিক ভিত্তি', done: false },
      { name: 'Evolution', bn: 'বিবর্তন', done: false }
    ]
  },
  {
    subject: 'Bengali A',
    color: 'var(--peach)',
    chapters: [
      { name: 'Adarini', bn: 'আদরিণী', done: true },
      { name: 'Bangla Bhasha', bn: 'বাংলা ভাষা', done: false },
      { name: 'Srijato — Dharma', bn: 'সৃজাতো — ধর্ম', done: false },
      { name: 'Digbijoy', bn: 'দিগ্বিজয়', done: false }
    ]
  },
  {
    subject: 'English B',
    color: 'var(--teal)',
    chapters: [
      { name: 'Night Train at Deoli', bn: 'নাইট ট্রেন অ্যাট ডিওলি', done: true },
      { name: 'Strong Roots', bn: 'স্ট্রং রুটস', done: false },
      { name: 'The Bet', bn: 'দ্য বেট', done: false },
      { name: 'Ulysses', bn: 'ইউলিসিস', done: false },
      { name: 'Our Casuarina Tree', bn: 'আওয়ার ক্যাসুয়ারিনা ট্রি', done: false }
    ]
  }
]

export const NOTES = [
  {
    id: 'bio-1',
    subject: 'Biology',
    title: 'Microsporogenesis & Pollination',
    bn: 'মাইক্রোস্পোরোজেনেসিস ও পরাগযোগ',
    points: [
      'Microsporogenesis produces haploid microspores from diploid microspore mother cells by meiosis.',
      'Geitonogamy is transfer of pollen to another flower of the same plant; genetically similar to autogamy.',
      'ZP3 on the zona pellucida is the primary sperm receptor in humans.'
    ]
  },
  {
    id: 'ben-1',
    subject: 'Bengali A',
    title: 'Adarini — character & theme',
    bn: 'আদরিণী — চরিত্র ও ভাব',
    points: [
      'The prose explores affection, social expectation and the quiet strength of the central woman.',
      'Board answers score when you quote a line and then explain its social meaning in your own Bangla.',
      'Keep a 4-point structure: intro, character, conflict, concluding insight.'
    ]
  },
  {
    id: 'eng-1',
    subject: 'English B',
    title: 'Night Train at Deoli',
    bn: 'ডিওলি স্টেশনের মেয়ে',
    points: [
      'Ruskin Bond’s narrator is changed by a brief, unfinished meeting — longing over possession.',
      'The girl selling baskets becomes a symbol of a moment that cannot be repeated.',
      'For SAQ: mention Deoli, the basket, the last look, and the decision not to get down again.'
    ]
  }
]

export const FLASHCARDS = [
  { q: 'What is geitonogamy?', a: 'Pollen transfer to a different flower on the same plant. Genetically like autogamy, ecologically like xenogamy.', subject: 'Biology' },
  { q: 'ZP3 function?', a: 'Primary sperm receptor on the zona pellucida; binding starts the acrosome reaction.', subject: 'Biology' },
  { q: 'Who wrote Dharma in the Sem 3 selection?', a: 'Contemporary Bengali poet Srijato.', subject: 'Bengali A' },
  { q: 'Central feeling in Night Train at Deoli?', a: 'Tender, unfinished longing — the narrator never speaks to the girl again.', subject: 'English B' },
  { q: 'LH surge occurs around?', a: 'Day 14 of a 28-day cycle; it triggers ovulation.', subject: 'Biology' },
  { q: 'The Bet — what does the lawyer learn?', a: 'That life, books and inner freedom outweigh two million and empty years of confinement.', subject: 'English B' }
]

export const BANK = [
  {
    id: 1,
    subject: 'Biology',
    q: 'The primary sperm receptor on zona pellucida is',
    options: ['ZP1', 'ZP2', 'ZP3', 'ZP4'],
    ans: 2,
    why: 'ZP3 is the primary receptor; binding initiates the acrosome reaction.',
    bn: 'জোনা পেলুসিডার প্রাথমিক শুক্রাণু রিসেপ্টর ZP3।'
  },
  {
    id: 2,
    subject: 'Biology',
    q: 'Transfer of pollen to another flower of the same plant is called',
    options: ['Xenogamy', 'Geitonogamy', 'Cleistogamy', 'Autogamy only'],
    ans: 1,
    why: 'Geitonogamy is genetically autogamy but needs a pollinating agent.',
    bn: 'একই উদ্ভিদের অন্য ফুলে পরাগ স্থানান্তর = গেইটোনোগ্যামি।'
  },
  {
    id: 3,
    subject: 'English B',
    q: 'Night Train at Deoli is written by',
    options: ['Ruskin Bond', 'R. K. Narayan', 'Khushwant Singh', 'A. G. Gardiner'],
    ans: 0,
    why: 'Ruskin Bond; the story is a memory of Deoli station and a girl selling baskets.',
    bn: 'লেখক রাскিন বন্ড।'
  },
  {
    id: 4,
    subject: 'Bengali A',
    q: 'The poem Dharma in the selection is by',
    options: ['Jibanananda Das', 'Srijato', 'Sankha Ghosh', 'Sunil Gangopadhyay'],
    ans: 1,
    why: 'Srijato’s Dharma is in the Semester 3 Bengali A poetry set.',
    bn: 'কবিতাটি সৃজাতোর।'
  },
  {
    id: 5,
    subject: 'Biology',
    q: 'LH surge is mainly responsible for',
    options: ['Menstruation', 'Ovulation', 'Implantation', 'Lactation'],
    ans: 1,
    why: 'A mid-cycle LH peak causes rupture of the Graafian follicle.',
    bn: 'LH সাurge ডিম্বস্ফোটন ঘটায়।'
  },
  {
    id: 6,
    subject: 'English B',
    q: 'In The Bet, the lawyer agrees to stay in confinement for',
    options: ['5 years', '10 years', '15 years', '20 years'],
    ans: 2,
    why: 'He raises the banker’s 5-year wager to 15 years.',
    bn: 'আইনজীবী ১৫ বছরের শর্ত মানেন।'
  }
]

export const FORMULAS = [
  { sub: 'Physics', name: 'Lorentz force', body: 'F = q(E + v × B)' },
  { sub: 'Physics', name: 'Speed of EM wave', body: 'c = 1 / √(μ₀ε₀)' },
  { sub: 'Chemistry', name: 'pH', body: 'pH = −log₁₀[H⁺]' },
  { sub: 'Math', name: 'Integration by parts', body: '∫u dv = uv − ∫v du' },
  { sub: 'Biology', name: 'Hardy–Weinberg', body: 'p² + 2pq + q² = 1' }
]

export const NOTICES = [
  { date: '12 Sep 2026', title: 'HS 2026 Semester 3 routine (provisional)', type: 'Routine' },
  { date: '28 Aug 2026', title: 'Project / practical submission window', type: 'Notice' },
  { date: '04 Aug 2026', title: 'Model question pattern — Biology MCQ + SAQ', type: 'Paper' },
  { date: '19 Jul 2026', title: 'Bengali A & English B reduced notes list', type: 'Syllabus' }
]

export const FAQ = [
  { q: 'What file types work?', a: 'PDF, photos of notes, textbook pages, and typed questions. Scanner turns a page into a solved doubt in seconds.' },
  { q: 'How does Stranger guide learning?', a: 'It stays inside WBCHSE Sem 3. Mentors ask first, then explain, with citations back to your chapter — not random web answers.' },
  { q: 'Can I use this for any subject?', a: 'The hub is built for Biology, Bengali A and English B, with Physics, Chemistry and Math formula tools for board extras.' },
  { q: 'How fast do study tools generate?', a: 'Flashcards, MCQs and notes appear instantly from the chapter bank. Timed mocks start the moment you pick a subject.' },
  { q: 'Is my data private?', a: 'Your login, mistake bank and memory vault stay on this device in local storage. Nothing is posted publicly.' }
]

export const QUOTES = [
  { name: 'Ananya, HS Science', text: 'I went from guessing MCQs to explaining ZP3 in Bangla. Mock Test AI felt like the real paper.' },
  { name: 'Ritam, HS Arts', text: 'Adarini used to scare me. Mahi Didi made me write 4-point answers I could actually remember.' },
  { name: 'Sneha, HS Commerce + English B', text: 'If I got The Bet wrong, Stranger told me why. That click is the whole product.' }
]

export function loadStore() {
  try {
    return JSON.parse(localStorage.getItem('ss-store') || '{}')
  } catch {
    return {}
  }
}

export function saveStore(partial) {
  const next = { ...loadStore(), ...partial }
  localStorage.setItem('ss-store', JSON.stringify(next))
  return next
}
