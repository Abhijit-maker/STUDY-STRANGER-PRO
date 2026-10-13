import { MCQQuestion, QuizDifficulty } from "../types";

export interface DefaultMockTest {
  id: string;
  title: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  description: string;
  isOfficial: boolean;
  isAdminUploaded?: boolean;
  uploadedAt?: string;
  questions: MCQQuestion[];
}

export const BUILTIN_DEFAULT_MOCK_TESTS: DefaultMockTest[] = [
  {
    id: "wbchse-bio-sem3-official-01",
    title: "Biology Sem 3 Council Board Mock (Reproduction & Genetics)",
    subject: "Biology",
    topic: "Unit I & II: Reproduction and Molecular Genetics",
    durationMinutes: 20,
    description: "Official WBCHSE Semester 3 standard test covering ZP3 receptor, Microsporogenesis, Menstrual Cycle, DNA Replication & Mendel's Laws.",
    isOfficial: true,
    questions: [
      {
        id: "bio-q1",
        questionEn: "During human fertilization, the sperm binds specifically to which glycoprotein receptor on the zona pellucida?",
        questionBn: "মানুষের নিষেকের সময় শুক্রাণু জোনা পেলুসিডার কোন নির্দিষ্ট গ্লাইকোপ্রোটিন রিসেপ্টরের সাথে যুক্ত হয়?",
        optionsEn: ["ZP1", "ZP2", "ZP3", "ZP4"],
        optionsBn: ["ZP1", "ZP2", "ZP3", "ZP4"],
        correctIndex: 2,
        explanationEn: "ZP3 (Zona Pellucida Glycoprotein 3) functions as the primary sperm receptor and triggers the acrosome reaction.",
        explanationBn: "ZP3 হল প্রাথমিক শুক্রাণু গ্রাহক যা শুক্রাণুর অ্যাক্রোসোম বিক্রিয়াকে সক্রিয় করে।",
        difficulty: "medium"
      },
      {
        id: "bio-q2",
        questionEn: "In the human menstrual cycle, the LH (Luteinizing Hormone) surge occurs typically on which day?",
        questionBn: "মানব স্ত্রী জনন চক্রে (Menstrual Cycle) LH সার্জ সাধারণত কোন দিনে ঘটে?",
        optionsEn: ["Day 5", "Day 10", "Day 14", "Day 28"],
        optionsBn: ["৫ম দিন", "১০ম দিন", "১৪শ দিন", "২৮শ দিন"],
        correctIndex: 2,
        explanationEn: "The LH surge peaks around day 14 of a 28-day cycle, inducing ovulation of the secondary oocyte.",
        explanationBn: "২৮ দিনের ঋতুচক্রে প্রায় ১৪তম দিনে LH সার্জ ঘটে, যার ফলে ডিম্বাণু নির্গমন (ওভুলেশন) সম্পন্ন হয়।",
        difficulty: "easy"
      },
      {
        id: "bio-q3",
        questionEn: "Which of the following is the causative bacterial pathogen for Syphilis?",
        questionBn: "নিচের কোনটি সিফিলিস (Syphilis) রোগের জন্য দায়ী ব্যাকটেরিয়াল জীবাণু?",
        optionsEn: ["Treponema pallidum", "Neisseria gonorrhoeae", "Chlamydia trachomatis", "Haemophilus ducreyi"],
        optionsBn: ["ট্রেপোনেমা প্যালিডাম (Treponema pallidum)", "নিসেরিয়া গনোরি", "ক্ল্যামাইডিয়া ট্র্যাকোমাটিস", "হিমোফিলাস ডুক্রেই"],
        correctIndex: 0,
        explanationEn: "Treponema pallidum is a spirochete bacterium responsible for the sexually transmitted disease Syphilis.",
        explanationBn: "ট্রেপোনেমা প্যালিডাম হলো স্পাইরোকিট ব্যাকটেরিয়া যা সিফিলিস রোগের মূল কারণ।",
        difficulty: "medium"
      },
      {
        id: "bio-q4",
        questionEn: "What is ectopic pregnancy/implantation?",
        questionBn: "একটোপিক ইমপ্লান্টেশন (Ectopic Implantation) বলতে কী বোঝায়?",
        optionsEn: [
          "Implantation in the uterine fundus",
          "Implantation outside the uterine cavity (e.g., fallopian tube)",
          "Delayed implantation past 40 weeks",
          "Multiple blastocyst formation in uterus"
        ],
        optionsBn: [
          "জরায়ুর ফান্ডাসে রোপণ",
          "জরায়ুর স্বাভাবিক গহ্বরের বাইরে রোপণ (যেমন ফ্যালোপিয়ান টিউব)",
          "৪০ সপ্তাহের পর বিলম্বে রোপণ",
          "জরায়ুতে একাধিক ব্লাস্টোসিস্ট তৈরি হওয়া"
        ],
        correctIndex: 1,
        explanationEn: "Ectopic implantation occurs when a fertilized egg implants outside the uterus, most commonly in the ampulla of the Fallopian tube.",
        explanationBn: "নিষিক্ত ডিম্বাণু জরায়ুর বাইরে (যেমন ফ্যালোপিয়ান নালীতে) রোপিত হলে তাকে একটোপিক প্রেগন্যান্সি বলা হয়।",
        difficulty: "medium"
      },
      {
        id: "bio-q5",
        questionEn: "According to Chargaff's rules of DNA base pairing, what are the hydrogen bonds formed between bases?",
        questionBn: "ডিএনএ বেস পেয়ারিং নিয়মে বেসগুলির মধ্যে হাইড্রোজেন বন্ধন সংখ্যা কত?",
        optionsEn: ["A=T (2 bonds), G≡C (3 bonds)", "A≡T (3 bonds), G=C (2 bonds)", "A=T (1 bond), G=C (1 bond)", "A=G (2 bonds), T=C (2 bonds)"],
        optionsBn: ["A=T (২টি বন্ধন), G≡C (৩টি বন্ধন)", "A≡T (৩টি বন্ধন), G=C (২টি বন্ধন)", "A=T (১টি বন্ধন), G=C (১টি বন্ধন)", "A=G (২টি বন্ধন), T=C (২টি বন্ধন)"],
        correctIndex: 0,
        explanationEn: "Adenine pairs with Thymine via 2 hydrogen bonds (A=T), and Guanine pairs with Cytosine via 3 hydrogen bonds (G≡C).",
        explanationBn: "অ্যাডেনিন ও থাইমিন ২টি হাইড্রোজেন বন্ধন এবং গুয়ানিন ও সাইটোসিন ৩টি হাইড্রোজেন বন্ধন দ্বারা যুক্ত থাকে।",
        difficulty: "easy"
      },
      {
        id: "bio-q6",
        questionEn: "Which protein binds to single-stranded DNA during replication to prevent re-annealing?",
        questionBn: "প্রতিলিপিকরণের (Replication) সময় কোন প্রোটিন উন্মুক্ত একক তন্তুর সাথে যুক্ত হয়ে পুনরায় জোড়া লাগা রোধ করে?",
        optionsEn: ["SSB (Single-Stranded Binding) protein", "DNA Helicase", "DNA Ligase", "Topoisomerase"],
        optionsBn: ["SSB প্রোটিন", "ডিএনএ হেলিকেজ", "ডিএনএ লাইগেজ", "টপোআইসোমারেজ"],
        correctIndex: 0,
        explanationEn: "SSB (Single-Stranded Binding) protein stabilizes unwound single strands and prevents premature hairpin formation or re-annealing.",
        explanationBn: "SSB প্রোটিন একক তন্তুকে স্থিতিশীল রাখে এবং পুনরায় দ্বি-তন্ত্রী হতে বাধা দেয়।",
        difficulty: "medium"
      },
      {
        id: "bio-q7",
        questionEn: "Pollination between flowers of the same plant is technically termed as:",
        questionBn: "একই গাছের দুটি ভিন্ন ফুলের মধ্যে পরাগযোগকে কী বলা হয়?",
        optionsEn: ["Geitonogamy", "Autogamy", "Xenogamy", "Cleistogamy"],
        optionsBn: ["গেইটোনোগ্যামি (Geitonogamy)", "অটোগ্যামি", "জেনোগ্যামি", "ক্লাইস্টোগ্যামি"],
        correctIndex: 0,
        explanationEn: "Geitonogamy is functionally cross-pollination involving a pollinator, but genetically equivalent to autogamy since pollen comes from the same plant.",
        explanationBn: "একই উদ্ভিদের দুটি ভিন্ন ফুলের মধ্যে পরাগযোগকে গেইটোনোগ্যামি বলা হয়।",
        difficulty: "medium"
      },
      {
        id: "bio-q8",
        questionEn: "The promoter consensus sequence located approximately 25-30 base pairs upstream of transcription start site in eukaryotes is:",
        questionBn: "ইউক্যারিওটে ট্রান্সক্রিপশন শুরুর প্রায় ২৫-৩০ বেস পূর্বে অবস্থিত প্রোমোটার সিকোয়েন্সকে কী বলা হয়?",
        optionsEn: ["TATA Box (Goldberg-Hogness box)", "Pribnow Box", "CAAT Box", "GC Box"],
        optionsBn: ["TATA বক্স (Goldberg-Hogness box)", "প্রিবনাও বক্স", "CAAT বক্স", "GC বক্স"],
        correctIndex: 0,
        explanationEn: "The TATA box is a conserved eukaryotic promoter element bound by TBP (TATA-binding protein).",
        explanationBn: "TATA বক্স হলো ইউক্যারিওটের প্রধান প্রোমোটার অংশ যেখানে আরএনএ পলিমারেজ যুক্ত হওয়ার সূচনা হয়।",
        difficulty: "hard"
      }
    ]
  },
  {
    id: "wbchse-ben-sem3-official-01",
    title: "বাংলা এ (Bengali A) সেমিস্টার ৩ অফিশিয়াল কাউন্সিল টেস্ট",
    subject: "Bengali",
    topic: "আদিরিনী, বাঙ্গালা ভাষা ও ধর্ম কবিতা",
    durationMinutes: 15,
    description: "প্রভাতকুমার মুখোপাধ্যায়ের 'আদিরিনী', স্বামী বিবেকানন্দের 'বাঙ্গালা ভাষা' এবং শ্রীজাতের 'ধর্ম' ভিত্তিক বোর্ড পরীক্ষার প্রশ্নপত্র।",
    isOfficial: true,
    questions: [
      {
        id: "ben-q1",
        questionEn: "In the story 'Adarini' by Prabhat Kumar Mukhopadhyay, who is Jayram Mokhtar?",
        questionBn: "'আদিরিনী' গল্পে জয়রাম মুখুয্যের পেশা কী ছিল?",
        optionsEn: ["Mokhtar (Legal Practitioner)", "Zamindar", "Doctor", "Teacher"],
        optionsBn: ["মোক্তার (আইনজীবী)", "জমিদার", "ডাক্তার", "বিদ্যালয়ের শিক্ষক"],
        correctIndex: 0,
        explanationEn: "Jayram was a Mokhtar (legal attorney) who deeply loved the female elephant named Adarini.",
        explanationBn: "জয়রাম বাবু ছিলেন একজন মোক্তার, যিনি আদিরিনী হস্তিনীকে অপত্য স্নেহে লালন করতেন।",
        difficulty: "easy"
      },
      {
        id: "ben-q2",
        questionEn: "What was the purchase price of the elephant Adarini in the story?",
        questionBn: "গল্পে হস্তিনী আদিরিনীর মূল্য কত ছিল?",
        optionsEn: ["2000 Rupees", "1500 Rupees", "5000 Rupees", "1000 Rupees"],
        optionsBn: ["২০০০ টাকা", "১৫০০ টাকা", "৫০০০ টাকা", "১০০০ টাকা"],
        correctIndex: 0,
        explanationEn: "Jayram Mokhtar purchased Adarini for 2000 rupees.",
        explanationBn: "জয়রাম মোক্তার আদিরিনীকে ২০০০ টাকার বিনিময়ে ক্রয় করেছিলেন।",
        difficulty: "medium"
      },
      {
        id: "ben-q3",
        questionEn: "In 'Bangala Bhasha', what primary educational principle did Swami Vivekananda emphasize?",
        questionBn: "'বাঙ্গালা ভাষা' প্রবন্ধে স্বামী বিবেকানন্দ কোন বিষয়ের ওপর সর্বাধিক জোর দিয়েছিলেন?",
        optionsEn: [
          "Living language of the masses (চলিত ভাষা ও লোকশিক্ষা)",
          "Pure classical Sanskrit without compromise",
          "English-only medium instruction",
          "Poetry above scientific learning"
        ],
        optionsBn: [
          "জনসাধারণের মুখের চলিত ভাষা ও গণশিক্ষা",
          "কঠোর সংস্কৃত ব্যাকরণসম্মত সাধু ভাষা",
          "শুধুমাত্র ইংরেজি ভাষায় শিক্ষাদান",
          "বিজ্ঞানের পরিবর্তে শুধু কাব্যচর্চা"
        ],
        correctIndex: 0,
        explanationEn: "Swami Vivekananda championed colloquial, living Bengali language to educate the common masses effectively.",
        explanationBn: "স্বামী বিবেকানন্দ জনসাধারণের মধ্যে জ্ঞানবিস্তারের জন্য সজীব ও চলিত মুখের ভাষার পক্ষে মত প্রকাশ করেন।",
        difficulty: "medium"
      },
      {
        id: "ben-q4",
        questionEn: "In Srijato's poem 'Dharma', what is central to the poet's philosophy of religion?",
        questionBn: "শ্রীজাতের 'ধর্ম' কবিতায় কবির প্রধান বক্তব্য কী?",
        optionsEn: [
          "Manush-er Dharma / Humanity above institutional sectarian division",
          "Strict adherence to rituals",
          "Religious warfare",
          "Renouncing society"
        ],
        optionsBn: [
          "মানুষের ধর্ম ও সাম্প্রদায়িক ভেদাভেদের ঊর্ধ্বে মানবতা",
          "কঠোর আচার-অনুষ্ঠান পালন",
          "ধর্মীয় যুদ্ধ",
          "সমাজ পরিত্যাগ"
        ],
        correctIndex: 0,
        explanationEn: "The poem argues that human empathy and harmony constitute real religion beyond temple-mosque barriers.",
        explanationBn: "কবিতাটিতে জাতি-ধর্মের প্রাতিষ্ঠানিক সংকীর্ণতার বদলে মানুষের ভালোবাসা ও মানবধর্মকে প্রাধান্য দেওয়া হয়েছে।",
        difficulty: "easy"
      },
      {
        id: "ben-q5",
        questionEn: "Pablo Neruda's poem was translated into Bengali by which famous poet under the title 'Tar Songe'?",
        questionBn: "পাবলো নেরুদার কবিতা 'তার সঙ্গে' বাংলায় অনুবাদ করেছেন কোন কবি?",
        optionsEn: ["Shakti Chattopadhyay", "Sankha Ghosh", "Jibanananda Das", "Subhash Mukhopadhyay"],
        optionsBn: ["শক্তি চট্টোপাধ্যায়", "শঙ্খ ঘোষ", "জীবনানন্দ দাশ", "সুভাষ মুখোপাধ্যায়"],
        correctIndex: 0,
        explanationEn: "Shakti Chattopadhyay translated Pablo Neruda's poetry into Bengali.",
        explanationBn: "শক্তি চট্টোপাধ্যায় পাবলো নেরুদার কবিতা বাংলায় অনুবাদ করেছিলেন।",
        difficulty: "medium"
      }
    ]
  },
  {
    id: "wbchse-eng-sem3-official-01",
    title: "English B Semester 3 Council Model Test",
    subject: "English",
    topic: "The Bet, Strong Roots & Ulysses",
    durationMinutes: 15,
    description: "Curated WBCHSE Class 12 English B examination paper based on Chekhov's 'The Bet', Kalam's 'Strong Roots' and Tennyson's 'Ulysses'.",
    isOfficial: true,
    questions: [
      {
        id: "eng-q1",
        questionEn: "In Anton Chekhov's short story 'The Bet', what was the wager amount and the duration of solitary confinement?",
        questionBn: "অ্যান্টন চেখভের 'The Bet' গল্পে বাজির অর্থের পরিমাণ এবং নির্জন কারাবাসের সময়সীমা কত ছিল?",
        optionsEn: [
          "2 million rubles for 15 years",
          "1 million rubles for 10 years",
          "5 million rubles for 20 years",
          "500,000 rubles for 5 years"
        ],
        optionsBn: [
          "১৫ বছরের জন্য ২০ লক্ষ (২ মিলিয়ন) রুবল",
          "১০ বছরের জন্য ১০ লক্ষ রুবল",
          "২০ বছরের জন্য ৫০ লক্ষ রুবল",
          "৫ বছরের জন্য ৫ লক্ষ রুবল"
        ],
        correctIndex: 0,
        explanationEn: "The banker and the lawyer agreed upon a wager of 2 million rubles for voluntary solitary confinement of 15 years.",
        explanationBn: "ব্যাংকার এবং তরুণ আইনজীবী ১৫ বছরের স্বেচ্ছানির্বাসন ও নির্জন কারাবাসের জন্য ২ মিলিয়ন রুবলের বাজি ধরেছিলেন।",
        difficulty: "easy"
      },
      {
        id: "eng-q2",
        questionEn: "In 'Strong Roots', what was APJ Abdul Kalam's father's name?",
        questionBn: "'Strong Roots' আত্মজীবনীমূলক প্রবন্ধে এ.পি.জে আব্দুল কালামের বাবার নাম কী ছিল?",
        optionsEn: ["Jainulabdeen", "Pakshi Lakshmana Sastry", "Ahmed Jalaluddin", "Sivasubramania Iyer"],
        optionsBn: ["জয়নুল আবেদিন (Jainulabdeen)", "পক্ষী লক্ষ্মণ শাস্ত্রী", "আহমেদ জালালুদ্দিন", "শিবসুব্রমনিয়া আইয়ার"],
        correctIndex: 0,
        explanationEn: "Kalam's father was Jainulabdeen, a devout, wise, and disciplined boat-owner in Rameswaram.",
        explanationBn: "কালামের পিতার নাম ছিল জয়নুল আবেদিন, যিনি রামেশ্বরমের একজন ধার্মিক ও প্রজ্ঞাবান মানুষ ছিলেন।",
        difficulty: "easy"
      },
      {
        id: "eng-q3",
        questionEn: "In Tennyson's Victorian dramatic monologue 'Ulysses', what is the immortal final line?",
        questionBn: "টেনিসনের 'Ulysses' কবিতার অমর শেষ চরণটি কী?",
        optionsEn: [
          "'To strive, to seek, to find, and not to yield.'",
          "'To sleep, perchance to dream.'",
          "'Life is but a walking shadow.'",
          "'I cannot rest from travel.'"
        ],
        optionsBn: [
          "'To strive, to seek, to find, and not to yield.'",
          "'To sleep, perchance to dream.'",
          "'Life is but a walking shadow.'",
          "'I cannot rest from travel.'"
        ],
        correctIndex: 0,
        explanationEn: "The famous heroic conclusion of Ulysses is: 'To strive, to seek, to find, and not to yield.'",
        explanationBn: "ইউলিসিস কবিতার অমর উদ্দীপনাময় সমাপ্তি বাণী হলো: 'To strive, to seek, to find, and not to yield.'",
        difficulty: "medium"
      },
      {
        id: "eng-q4",
        questionEn: "In Ruskin Bond's 'The Night Train at Deoli', what was the girl at the station selling?",
        questionBn: "'The Night Train at Deoli' গল্পে দেওলি স্টেশনের মেয়েটি কী বিক্রি করছিল?",
        optionsEn: ["Cane baskets", "Wild flowers", "Earthen toys", "Fresh tea"],
        optionsBn: ["বেতের তৈরি ঝুড়ি (Cane baskets)", "বুনো ফুল", "মাটির খেলনা", "চা"],
        correctIndex: 0,
        explanationEn: "The young girl with dark eyes was selling handmade cane baskets across the platform.",
        explanationBn: "দেওলি স্টেশনের প্লাটফর্মে মেয়েটি সুন্দর বেতের ঝুড়ি বিক্রি করছিল।",
        difficulty: "easy"
      },
      {
        id: "eng-q5",
        questionEn: "In Toru Dutt's poem 'Our Casuarina Tree', with which beloved memories is the tree eternally intertwined?",
        questionBn: "তরু দত্তের 'Our Casuarina Tree' কবিতায় গাছটির সাথে কবির কোন স্মৃতি চিরস্মরণীয় হয়ে জড়িয়ে আছে?",
        optionsEn: [
          "Memories of beloved childhood companions and siblings (Aru and Abju)",
          "The victory of a national battle",
          "Her travels across Europe",
          "A myth of ancient India"
        ],
        optionsBn: [
          "শৈশবের প্রিয় ভাইবোন (অরু ও অবজু)-এর সাথে কাটানো অমূল্য স্মৃতি",
          "জাতীয় যুদ্ধের বিজয়",
          "ইউরোপ ভ্রমণের দিনগুলি",
          "প্রাচীন ভারতের পৌরাণিক কাহিনী"
        ],
        correctIndex: 0,
        explanationEn: "The tree is dear to Toru Dutt not merely for its grandeur, but because her deceased siblings played beneath it in their happy childhood.",
        explanationBn: "কবির প্রয়াত প্রিয় ভাইবোনদের শৈশবের স্মৃতি জড়িয়ে থাকার কারণে ক্যাসুয়ারিনা গাছটি কবির হৃদয়ে বিশেষ স্থান দখল করে আছে।",
        difficulty: "medium"
      }
    ]
  }
];

const ADMIN_STORAGE_KEY = "ss_admin_custom_mock_tests";

export function getAdminCustomMockTests(): DefaultMockTest[] {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to load admin mock tests:", err);
    return [];
  }
}

export function saveAdminCustomMockTest(test: DefaultMockTest): void {
  try {
    const existing = getAdminCustomMockTests();
    const updated = [test, ...existing.filter(t => t.id !== test.id)];
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save admin mock test:", err);
  }
}

export function deleteAdminCustomMockTest(testId: string): void {
  try {
    const existing = getAdminCustomMockTests();
    const filtered = existing.filter(t => t.id !== testId);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to delete admin mock test:", err);
  }
}

export function getAllAvailableMockTests(): DefaultMockTest[] {
  const adminTests = getAdminCustomMockTests();
  return [...adminTests, ...BUILTIN_DEFAULT_MOCK_TESTS];
}
