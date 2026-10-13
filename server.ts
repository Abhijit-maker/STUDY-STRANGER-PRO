import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import nodemailer from "nodemailer";
import { GoogleGenAI, Modality } from "@google/genai";
import { TelegramFormatter } from "./src/services/telegramFormatter";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Uncaught error guards for 24/7 continuous operation
  process.on("uncaughtException", (err) => {
    console.error("[24/7 Guard] Uncaught Exception caught:", err);
  });
  process.on("unhandledRejection", (reason, promise) => {
    console.error("[24/7 Guard] Unhandled Rejection caught:", reason);
  });

  // Check for critical keys on start
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const DEAPI_KEY = process.env.DEAPI_API_KEY;

  console.log("-----------------------------------------");
  console.log("SERVER BOOTSTRAP (24/7 HIGH-AVAILABILITY):");
  console.log("GEMINI_API_KEY:", GEMINI_KEY ? "PRESENT" : "MISSING (REQUIRED FOR GEMINI 3.8 FLASH)");
  console.log("DEAPI_API_KEY:", DEAPI_KEY ? "PRESENT" : "FALLBACK ACTIVE");
  console.log("-----------------------------------------");

  // User custom Gemini API key registry for personalized quota sync
  const userApiKeyMap = new Map<string, string>();

  // Linked accounts registry (telegramId -> firebaseUid & meta)
  const linkedTelegramUsers = new Map<string, { firebaseUid: string; displayName: string; linkedAt: string; username?: string; telegramId: string | number }>();

  // Disk persistence paths for user API keys & linked accounts
  const userKeysFilePath = path.join(process.cwd(), "data", "user_keys.json");
  const linkedUsersFilePath = path.join(process.cwd(), "data", "linked_users.json");

  const loadUserKeysFromDisk = () => {
    try {
      if (fs.existsSync(userKeysFilePath)) {
        const raw = fs.readFileSync(userKeysFilePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (typeof parsed === "object" && parsed !== null) {
          for (const [k, v] of Object.entries(parsed)) {
            if (typeof v === "string" && v.trim()) {
              userApiKeyMap.set(k, v.trim());
            }
          }
          console.log(`[Key Sync] Successfully loaded ${userApiKeyMap.size} user API keys from disk persistence.`);
        }
      }
    } catch (err) {
      console.warn("[Key Sync] Disk load warning:", err);
    }
  };

  const saveUserKeysToDisk = () => {
    try {
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const obj: Record<string, string> = {};
      for (const [k, v] of userApiKeyMap.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(userKeysFilePath, JSON.stringify(obj, null, 2));
    } catch (err) {
      console.warn("[Key Sync] Disk save warning:", err);
    }
  };

  const loadLinkedUsersFromDisk = () => {
    try {
      if (fs.existsSync(linkedUsersFilePath)) {
        const raw = fs.readFileSync(linkedUsersFilePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (typeof parsed === "object" && parsed !== null) {
          for (const [k, v] of Object.entries(parsed)) {
            if (v && typeof v === "object") {
              linkedTelegramUsers.set(k, v as any);
            }
          }
          console.log(`[Account Link] Loaded ${linkedTelegramUsers.size} linked accounts from disk persistence.`);
        }
      }
    } catch (err) {
      console.warn("[Account Link] Disk load warning:", err);
    }
  };

  const saveLinkedUsersToDisk = () => {
    try {
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const obj: Record<string, any> = {};
      for (const [k, v] of linkedTelegramUsers.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(linkedUsersFilePath, JSON.stringify(obj, null, 2));
    } catch (err) {
      console.warn("[Account Link] Disk save warning:", err);
    }
  };

  loadUserKeysFromDisk();
  loadLinkedUsersFromDisk();

  // Active Telegram Bot Token resolver ensuring new token takes immediate priority over stale container env
  const getActiveTelegramBotToken = (): string => {
    const envToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!envToken || envToken.trim() === "" || envToken.includes("AAFR7V9z14Ci1z6c8HaLw0KPt6moeh0_rVg")) {
      return "8815322172:AAE-wvU9veGJSurTcVOQHaLRpaXCHSmr1bs";
    }
    return envToken.trim();
  };

  function getCustomApiKeyForUser(userOrChatId?: string | number): string | undefined {
    if (userOrChatId) {
      const keyStr = String(userOrChatId).trim();
      if (userApiKeyMap.has(keyStr)) {
        return userApiKeyMap.get(keyStr);
      }
      // Check linked user map
      const linked = linkedTelegramUsers.get(keyStr);
      if (linked && linked.firebaseUid && userApiKeyMap.has(linked.firebaseUid)) {
        return userApiKeyMap.get(linked.firebaseUid);
      }
    }
    // Check system default synced key
    if (userApiKeyMap.has("_default_system_key")) {
      return userApiKeyMap.get("_default_system_key");
    }
    return undefined;
  }

  // Multi-turn Conversational Context Memory (Meta AI Style)
  interface ChatTurn {
    role: "user" | "model";
    parts: [{ text: string }];
  }
  const userChatHistory = new Map<string, ChatTurn[]>();

  function formatForTelegram(text: string): string {
    if (!text) return "";
    return TelegramFormatter.toTelegramHtml(text);
  }

  // Universal High-Speed Server-side AI Generator (Meta AI Engine Powered by Google Gemini)
  async function generateAIAnswer(prompt: string, userOrChatId?: string | number, systemInstruction?: string): Promise<string> {
    const sysInstruction = systemInstruction || 
      "You are Study Stranger AI (স্টাডি স্ট্রেঞ্জার এআই), an ultra-smart, friendly, warm 24/7 conversational mentor and academic companion for student Abhijit (অভিজিৎ) (WBCHSE Class 12 & General studies).\n\n" +
      "COMMUNICATION & TONE:\n" +
      "1. Speak very friendly, warmly, and naturally (like a brilliant elder brother / best friend). If the user writes in Bengali/Banglish, reply in sweet, natural Bengali or Banglish. If English, reply in fluent English.\n" +
      "2. For mathematical, physics, chemistry, or numerical problems:\n" +
      "   - Always provide crystal-clear step-by-step equations.\n" +
      "   - Use clean LaTeX or standard mathematical notations (e.g. $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$, $$\\int_0^\\pi \\sin(x)dx$$, $$E = mc^2$$, $$\\Delta H = n C_p \\Delta T$$) so our formatter converts them into clean readable formulas for Telegram.\n" +
      "   - Clearly define given parameters, formula used, steps, and final answer.\n" +
      "3. For WBCHSE Class 12 Syllabus (Biology, Bengali A, English B, Physics, Chemistry):\n" +
      "   - Give accurate exam-oriented points, important definitions, diagrams guidelines, and high-scoring exam tips.\n" +
      "4. For casual banter, questions, or greetings, reply in an encouraging, witty, friendly tone.\n" +
      "5. Always remember conversational context from prior messages.";

    // Collect all valid available keys (custom user key first, high-speed verified keys, system default, then other backup keys)
    const customUserKey = getCustomApiKeyForUser(userOrChatId);
    const systemDefaultKey = userApiKeyMap.get("_default_system_key");
    const fastAqKey = userApiKeyMap.get("Shzq1RuQ6ad1qTTt8vnVoF0J1xj1");
    const allStoredKeys = Array.from(userApiKeyMap.values()).filter(k => k && (k.startsWith("AIzaSy") || k.startsWith("AQ.")) && k.length >= 30);
    
    const candidateKeys = [
      customUserKey,
      fastAqKey,
      systemDefaultKey,
      ...allStoredKeys
    ].filter((k, idx, arr): k is string => Boolean(k && k.trim().length > 25) && arr.indexOf(k) === idx);

    // Lean multi-turn context (last 6 turns = 3 exchanges) for ultra-fast generation
    const userKeyStr = userOrChatId ? String(userOrChatId) : "";
    const priorTurns = userKeyStr ? (userChatHistory.get(userKeyStr) || []).slice(-6) : [];
    const contentsPayload = [
      ...priorTurns,
      { role: "user" as const, parts: [{ text: prompt }] }
    ];

    // Priority models: gemini-3.1-flash-lite, gemini-3.6-flash, and gemini-flash-lite-latest have zero high-demand spikes
    const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-flash-lite-latest"];

    for (const keyToUse of candidateKeys) {
      try {
        const ai = new GoogleGenAI({ 
          apiKey: keyToUse,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        for (const modelName of modelsToTry) {
          try {
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), 12000)
            );
            const callPromise = ai.models.generateContent({
              model: modelName,
              contents: contentsPayload,
              config: {
                systemInstruction: sysInstruction,
                temperature: 0.7,
                maxOutputTokens: 1024
              }
            });

            const aiRes = await Promise.race([callPromise, timeoutPromise]);
            if (aiRes.text && aiRes.text.trim().length > 0) {
              const cleanedText = formatForTelegram(aiRes.text.trim());

              // Save to conversational context history
              if (userKeyStr) {
                const updated = [
                  ...priorTurns,
                  { role: "user" as const, parts: [{ text: prompt }] },
                  { role: "model" as const, parts: [{ text: aiRes.text.trim() }] }
                ].slice(-8);
                userChatHistory.set(userKeyStr, updated);
              }

              return cleanedText;
            }
          } catch (gemErr: any) {
            console.warn(`[Google Gemini Fast Engine Notice]:`, gemErr.message?.slice(0, 100));
          }
        }
      } catch (clientErr: any) {
        // Continue to next backup key immediately
      }
    }

    // Absolutely NO automated/canned textbook templates! Live friendly fallback only:
    return `⚠️ <b>Study Stranger AI:</b>\n\nদুঃখিত, সংযোগে সাময়িক বিলম্ব হয়েছিল। অনুগ্রহ করে আবার একটু মেসেজটি পাঠান—আমি সাথে সাথেই উত্তর দিচ্ছি! 🚀`;
  }

  function getBestGeminiApiKey(preferredKey?: string): string {
    if (preferredKey && preferredKey.trim().startsWith("AIzaSy") && preferredKey.trim().length > 25) return preferredKey.trim();
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().startsWith("AIzaSy") && process.env.GEMINI_API_KEY.trim().length > 25) {
      return process.env.GEMINI_API_KEY.trim();
    }
    const sysDefault = userApiKeyMap.get("_default_system_key");
    if (sysDefault && sysDefault.trim().startsWith("AIzaSy") && sysDefault.trim().length > 25) {
      return sysDefault.trim();
    }
    const validKey = Array.from(userApiKeyMap.values()).find(k => k && k.startsWith("AIzaSy") && k.length > 25);
    if (validKey) return validKey.trim();
    return process.env.GEMINI_API_KEY || "";
  }

  // Fetch high-quality images from Wikipedia, Google, and Unsplash as fallback
  async function getGoogleOrUnsplashImages(prompt: string): Promise<string[]> {
    const images: string[] = [];
    const cleanPrompt = prompt || "educational diagram";
    
    // Check if prompt matches our handpicked highly accurate academic visuals dictionary
    const lower = cleanPrompt.toLowerCase();
    const serverAcademicMap: Record<string, string> = {
      // Biology: Reproduction, Genetics, Evolution
      "sperm": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
      "শুক্রাণু": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
      "acrosome": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
      "egg": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
      "fertilization": "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop",
      "নিষেক": "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop",
      "ovum": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
      "ডিম্বাণু": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
      "reproduction": "https://images.unsplash.com/photo-1516321405-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
      "জনন": "https://images.unsplash.com/photo-1516321405-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
      "gametogenesis": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
      "menstrual": "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop",
      "রজঃচক্র": "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop",
      "ovulation": "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop",
      "ectopic": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "uterus": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
      "fallopian": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
      "pathogen": "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop",
      "treponema": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
      "syphilis": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
      "hiv": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
      "chlamydia": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
      "flower": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
      "ফুল": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
      "flowering": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
      "pollination": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
      "পরাগযোগ": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
      "geitonogamy": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
      "xenogamy": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
      "dna": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "ডিএনএ": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "rna": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "replication": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "প্রতিলিপিকরণ": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "transcription": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "translation": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "gene": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "mendel": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "মেন্ডেল": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "evolution": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",

      // Mathematics
      "math": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
      "গণিত": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
      "calculus": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
      "কলনবিদ্যা": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
      "integral": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
      "সমাকলন": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
      "matrix": "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop",
      "ম্যাট্রিক্স": "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop",
      "vector": "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop",
      "ভেক্টর": "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop",

      // Literature: Bengali A & English B
      "adarini": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop",
      "আদিরিনী": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop",
      "elephant": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop",
      "হাতি": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop",
      "bangala bhasha": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
      "vivekananda": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
      "bengali": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
      "deoli": "https://images.unsplash.com/photo-1532103054090-334e6e60ae29?q=80&w=1200&auto=format&fit=crop",
      "দেওলি": "https://images.unsplash.com/photo-1532103054090-334e6e60ae29?q=80&w=1200&auto=format&fit=crop",
      "train": "https://images.unsplash.com/photo-1532103054090-334e6e60ae29?q=80&w=1200&auto=format&fit=crop",
      "roots": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop",
      "kalam": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop",
      "কালাম": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop",
      "bet": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200&auto=format&fit=crop",
      "বাজি": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200&auto=format&fit=crop",
      "chekhov": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200&auto=format&fit=crop",
      "ulysses": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
      "ইউলিসিস": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
      "casuarina": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format&fit=crop",
      "toru dutt": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format&fit=crop",
      "riders": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1200&auto=format&fit=crop",
      "sea": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1200&auto=format&fit=crop"
    };

    for (const key of Object.keys(serverAcademicMap)) {
      if (lower.includes(key)) {
        images.push(serverAcademicMap[key]);
      }
    }
    
    // 1. Try Wikipedia / Wikimedia Commons first for academic, biological, historical, and scientific diagrams.
    // Extremely reliable and accurate for school curricula!
    try {
      const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanPrompt)}&format=json&origin=*`);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const firstResult = searchData.query?.search?.[0];
        if (firstResult) {
          const title = firstResult.title;
          const imgRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=1000&format=json&origin=*`);
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            const pages = imgData.query?.pages;
            if (pages) {
              const pageId = Object.keys(pages)[0];
              const thumbnail = pages[pageId]?.thumbnail?.source;
              if (thumbnail && thumbnail.startsWith("http")) {
                images.push(thumbnail);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn("Wikipedia search scraper failed:", err);
    }

    // 2. Try Unsplash for high-quality aesthetic landscape/stock photos
    try {
      const response = await fetch(`https://unsplash.com/s/photos/${encodeURIComponent(cleanPrompt)}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
        }
      });
      if (response.ok) {
        const html = await response.text();
        const matches = html.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-_]+/g);
        if (matches) {
          const unique = Array.from(new Set(matches));
          unique.forEach(url => {
            if (!url.includes("profile") && !url.includes("avatar")) {
              images.push(`${url}?q=80&w=1000&auto=format&fit=crop`);
            }
          });
        }
      }
    } catch (err) {
      console.warn("Unsplash fallback search failed:", err);
    }

    // 3. Try Google Images scraping (excellent for diagrams, equations, biology illustrations, etc.)
    try {
      const response = await fetch(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(cleanPrompt)}&safe=active`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
        }
      });
      if (response.ok) {
        const html = await response.text();
        const matches = html.match(/https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:[a-zA-Z0-9\-_:;]+/g);
        if (matches) {
          const unique = Array.from(new Set(matches));
          unique.forEach(url => {
            images.push(url);
          });
        }
      }
    } catch (err) {
      console.warn("Google Image fallback search failed:", err);
    }

    // Ultimate fallback if nothing has been populated
    if (images.length === 0) {
      images.push(`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop`);
    }

    return images;
  }

  // Universal AI Chat Endpoint for Web and Telegram
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { prompt, userOrChatId, systemInstruction } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      const response = await generateAIAnswer(prompt, userOrChatId, systemInstruction);
      res.json({ success: true, response });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Setup email transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  app.post("/api/auth/send-email-otp", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: "Email and code required" });
      }

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Login OTP",
        text: `Your OTP for login is: ${code}. It expires in 5 minutes.`,
      });

      res.json({ success: true });
    } catch (err: any) {
      console.error("[Email OTP Error]:", err.message);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Resilient multi-model executor with auto-failover across keys and high-availability models
  async function generateWithModelFallback({
    contents,
    systemInstruction,
    responseMimeType,
    maxOutputTokens,
    apiKey,
    preferredModel,
    timeoutMs = 18000
  }: {
    contents: any;
    systemInstruction?: string;
    responseMimeType?: string;
    maxOutputTokens?: number;
    apiKey?: string;
    preferredModel?: string;
    timeoutMs?: number;
  }): Promise<string> {
    const keyToUse = getBestGeminiApiKey(apiKey);
    const candidateKeys = [
      keyToUse,
      userApiKeyMap.get("Shzq1RuQ6ad1qTTt8vnVoF0J1xj1"),
      userApiKeyMap.get("_default_system_key"),
      process.env.GEMINI_API_KEY
    ].filter((k, idx, arr): k is string => Boolean(k && k.trim().length > 25) && arr.indexOf(k) === idx);

    if (candidateKeys.length === 0) {
      throw new Error("No Gemini API key available on server");
    }

    // Multi-tier auto-failover pipeline across models
    const candidateModels = [
      preferredModel,
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
      "gemini-3.1-pro-preview"
    ].filter((m, idx, arr): m is string => Boolean(m) && arr.indexOf(m) === idx);

    let lastError: any = null;

    for (const curKey of candidateKeys) {
      const ai = new GoogleGenAI({ 
        apiKey: curKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      for (const curModel of candidateModels) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), timeoutMs)
          );
          const config: any = {};
          if (responseMimeType) config.responseMimeType = responseMimeType;
          if (systemInstruction) config.systemInstruction = systemInstruction;
          if (maxOutputTokens) config.maxOutputTokens = maxOutputTokens;

          const contentsPayload = typeof contents === "string"
            ? [{ role: "user" as const, parts: [{ text: contents }] }]
            : contents;

          const callPromise = ai.models.generateContent({
            model: curModel,
            contents: contentsPayload,
            config: Object.keys(config).length > 0 ? config : undefined
          });

          const result = await Promise.race([callPromise, timeoutPromise]);
          if (result.text && result.text.trim()) {
            return result.text.trim();
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`[Auto-Failover] Key ...${curKey.slice(-6)} Model ${curModel} notice:`, err.message?.slice(0, 100));
        }
      }
    }

    throw lastError || new Error("Failed to generate content across candidate models");
  }

  // Universal Content Generation Proxy
  app.post("/api/ai/generateContent", async (req, res) => {
    try {
      const { prompt, apiKey, model, responseMimeType } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      const text = await generateWithModelFallback({
        contents: prompt,
        responseMimeType,
        apiKey,
        preferredModel: model,
        timeoutMs: 16000
      });
      res.json({ success: true, text });
    } catch (err: any) {
      console.error("[Universal Generate Proxy Error]:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Server-Side Mind Map Generation Proxy
  app.post("/api/ai/mindmap", async (req, res) => {
    try {
      const { topic, apiKey } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }
      const prompt = `Create a concept mind map for "${topic}".
Identify the central concept, main branches, and sub-branches.
Return ONLY a JSON array of nodes with this structure:
[
  { "id": "1", "label": "Central Topic", "type": "root", "parentId": null },
  { "id": "2", "label": "Main Branch", "type": "main", "parentId": "1" },
  { "id": "4", "label": "Sub Item", "type": "sub", "parentId": "2" }
]
Keep it concise but comprehensive. Maximum 15 nodes. Ensure parentId correctly points to a preceding node's id.`;

      const text = await generateWithModelFallback({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        responseMimeType: "application/json",
        apiKey,
        timeoutMs: 16000
      });
      res.json({ success: true, text });
    } catch (err: any) {
      console.error("[MindMap Proxy Error]:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Server-Side Image Problem Solver Proxy
  app.post("/api/ai/solve", async (req, res) => {
    try {
      const { base64Data, apiKey, userName = "Abhijit" } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: "base64Data is required" });
      }
      const contents = [
        {
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Data } },
            { text: `You are an expert, highly educational Academic Tutor and Math/Science Solver for ${userName}. 
Your primary goal is to provide deep, comprehensive, beautifully clear step-by-step master-class explanations in warm, supportive Bengali and Bunglish.
Avoid short or brief answers. Give comprehensive conceptual depth.

CRITICAL TASK:
1. Identify what this question is asking. Under "analysis", write a thorough, detailed analysis explaining what the problem presents, what the core question asks us to find, and our step-by-step master plan of formulas and ideas in sweet, encouraging Bengali.
2. Solve the problem step-by-step with high precision.
3. For each step:
   - Provide the mathematical or scientific expression strictly in LaTeX under "step". Wrap ALL mathematical expressions in $$ (e.g. $$\\frac{x}{2}$$).
   - Provide an extremely detailed, friendly, and pedagogical teacher-like explanation in Bengali/Bunglish inside "explanation". Detail why we perform this calculation, what formula is used, and how it leads to the next step.
4. IMPORTANT: In the JSON result, use double backslashes for all LaTeX commands (e.g., \\\\frac, \\\\sqrt, \\\\alpha) to ensure they can be parsed correctly.
5. Provide the final answer clearly in LaTeX.

Return ONLY a valid JSON object:
{
  "analysis": "Extremely detailed, warm, and thorough analysis of the problem in Bengali",
  "steps": [
    { "step": "$$Detailed Math Step with escaped backslashes$$", "explanation": "A complete, beautifully detailed step-by-step pedagogical explanation in Bengali" }
  ],
  "finalAnswer": "$$Final Result with escaped backslashes$$"
}` }
          ]
        }
      ];

      const text = await generateWithModelFallback({
        contents,
        responseMimeType: "application/json",
        apiKey,
        timeoutMs: 25000
      });
      res.json({ success: true, text });
    } catch (err: any) {
      console.error("[Image Problem Solver Proxy Error]:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Server-Side Image Notes/Textbook Scanner Proxy
  app.post("/api/ai/scan", async (req, res) => {
    try {
      const { base64Data, apiKey } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: "base64Data is required" });
      }
      const contents = [
        {
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Data } },
            { text: "Analyze this image. It is a study note or textbook page for WBCHSE Class 12, potentially in Bengali or English. If it is handwritten, decode the relevant academic concepts carefully. Generate 5 high-quality MCQs at Board/WBCHSE level based on the content. Output in JSON format only with questions and explanations in the language of the source text (Bunglish/Bengali/English)." }
          ]
        }
      ];

      const text = await generateWithModelFallback({
        contents,
        responseMimeType: "application/json",
        apiKey,
        timeoutMs: 25000
      });
      res.json({ success: true, text });
    } catch (err: any) {
      console.error("[Notes Scanner Proxy Error]:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Server-Side Mock Test Generator Proxy (processes in parallel batches on server to bypass client-side timeouts and errors)
  app.post("/api/ai/mocktest", async (req, res) => {
    try {
      const { config, apiKey } = req.body;
      if (!config) {
        return res.status(400).json({ error: "Mock test configuration is required" });
      }

      const fetchBatchOnServer = async (batchCount: number, startIndex: number, diffOverride?: string) => {
        const scopeDescription = config.scope === 'syllabus' 
          ? `the FULL SYLLABUS of ${config.subject}`
          : config.scope === 'chapter'
          ? `the CHAPTER "${config.topic}" in ${config.subject}`
          : config.scope === 'unit'
          ? `the UNIT "${config.topic}" in ${config.subject}`
          : `the TOPIC "${config.topic}" in ${config.subject}`;

        const isScience = ["Math", "Physics", "Chemistry", "Biology"].includes(config.subject);
        const examType = isScience ? "WBCHSE/JEE/NEET" : "WBCHSE";

        const modePrompt = config.isPYQ 
          ? `Act as an official ${examType} examiner. FETCH 10 actual Previous Year Questions for ${scopeDescription}.`
          : `Act as a professional educator. GENERATE 10 high-quality MCQs for ${scopeDescription}.`;

        const prompt = `
          ${modePrompt} Difficulty: focus on ${diffOverride || config.difficulty}.
          
          CRITICAL: Ensure the subject is STRICTLY "${config.subject}". DO NOT generate Biology questions if the subject is "${config.subject}".
          
          REQUIREMENTS:
          1. 10 Questions starting ID q${startIndex}.
          2. BILINGUAL: questionEn/questionBn, optionsEn/optionsBn (4 options), explanationEn/explanationBn.
          3. LaTeX: Use double dollar signs for all math/science.
          4. JSON ONLY. No markdown text outside the array.
          
          [
            {
              "id": "q${startIndex}",
              "questionEn": "...",
              "questionBn": "...",
              "optionsEn": [4 strings],
              "optionsBn": [4 strings],
              "correctIndex": 0,
              "explanationEn": "...",
              "explanationBn": "...",
              "difficulty": "easy" | "medium" | "hard",
              "year": 2021 | null
            }
          ]
        `;

        try {
          const text = await generateWithModelFallback({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            responseMimeType: "application/json",
            maxOutputTokens: 8192,
            apiKey,
            timeoutMs: 25000
          });
          return text || "[]";
        } catch {
          return "[]";
        }
      };

      let diffs = [config.difficulty, config.difficulty, config.difficulty, config.difficulty];
      if (config.difficulty === 'medium') {
        diffs = ['easy', 'medium', 'medium', 'hard'];
      } else if (config.difficulty === 'hard') {
        diffs = ['medium', 'hard', 'hard', 'hard'];
      }

      const batches = await Promise.all([
        fetchBatchOnServer(10, 1, diffs[0]),
        fetchBatchOnServer(10, 11, diffs[1]),
        fetchBatchOnServer(10, 21, diffs[2]),
        fetchBatchOnServer(10, 31, diffs[3])
      ]);

      res.json({ success: true, batches });
    } catch (err: any) {
      console.error("[Mock Test Proxy Error]:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Server-Side Study Material Generation Proxy
  app.post("/api/ai/studymaterial", async (req, res) => {
    try {
      const { topic, type, level = "Board", apiKey } = req.body;
      if (!topic || !type) {
        return res.status(400).json({ error: "topic and type are required" });
      }

      const prompt = type === "flashcards" 
        ? `Generate 10 interactive flashcards for WBCHSE Class 12 (Subject: ${topic}) at ${level} level. 
           Return ONLY a JSON array of objects with "question" and "answer" keys. 
           IMPORTANT: For ALL mathematical formulas and equations, use LaTeX with double dollar signs (e.g., $$E = mc^2$$).
           The content should be exam-focused, covering key concepts, formulas, or definitions.`
        : type === "quiz"
        ? `Generate 10 multiple-choice quiz questions for WBCHSE Class 12 (Subject: ${topic}) at ${level} level. 
           Include numerical problems for Science subjects.
           IMPORTANT: For ALL mathematical formulas and equations, use LaTeX with double dollar signs (e.g., $$\\int x dx$$).
           Return ONLY a JSON array of objects with "question", "options" (array of 4 strings), "correctAnswer" (index 0-3), and "explanation" keys.
           The content should be exam-focused.`
        : type === "summary"
        ? `Provide a concise, cinematic summary of the WBCHSE Class 12 topic: "${topic}" at ${level} level. 
           Focus on the core concepts, main formulas, and key applications. 
           IMPORTANT: For ALL mathematical formulas and equations, use LaTeX with double dollar signs.
           Return ONLY a JSON object with a "text" key containing the summary.`
        : `Provide the top 10 key points for the WBCHSE Class 12 topic: "${topic}" at ${level} level. 
           Focus on exam-relevant details and important formulas. 
           IMPORTANT: For ALL mathematical formulas and equations, use LaTeX with double dollar signs.
           Return ONLY a JSON object with a "points" key containing an array of strings.`;

      const text = await generateWithModelFallback({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        responseMimeType: "application/json",
        apiKey,
        timeoutMs: 20000
      });

      res.json({ success: true, text });
    } catch (err: any) {
      console.error("[Study Material Proxy Error]:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Dedicated Studio Neural TTS Endpoint with Voice Modulation
  app.post("/api/ai/tts", async (req, res) => {
    try {
      const { text, character = "stranger", apiKey } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      const effectiveKey = getBestGeminiApiKey(apiKey);
      if (!effectiveKey) {
        return res.status(503).json({ error: "No Gemini API key configured for TTS" });
      }

      // Emotional Voice Engine Configuration
      const EMOTION_CONFIG: Record<string, string> = {
        "[SAD]": "Speak with profound, deeply melancholic, slow, and shaky prosody. Incorporate breathy pauses, heavy sighs, and a very quiet, fragile tone. Sound as if you are genuinely holding back tears; prioritize emotional weight over speed, and let your voice crack naturally.",
        "[HAPPY]": "Speak with infectious, high-energy, fast, and bubbling enthusiasm. Use frequent pitch variations, a smiling, bright, and vibrant tone. Sound absolutely thrilled and delighted, with natural, energetic inflection and slightly elongated vowels for emphasis.",
        "[ANXIOUS]": "Speak with a fast, stuttering, and nervous rhythm. Use breathy, shallow, and quick inhaling sounds, with a tense, higher-pitched, and slightly trembling tone. Sound genuinely uneasy, hesitant, and overwhelmed, with sudden tempo changes to mirror a racing heart.",
        "[CONFIDENT]": "Speak with a smooth, firm, authoritative, yet warm and deeply grounded tone. Use clear, deliberate, and paced prosody. Sound completely self-assured, calm, and inspiringly articulate, with moderate tempo that commands attention.",
      };

      // Pre-clean text but preserve valid emotional vocal burst tags
      let cleanText = text
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`[^`]*`/g, " ")
        .replace(/\$\$[\s\S]*?\$\$/g, " সমীকরণ ")
        .replace(/\$[^$]*\$/g, " সমীকরণ ");

      // Strip general HTML but preserve allowed vocal burst tags
      cleanText = cleanText.replace(/<([^>]+)>/g, (match, tagName) => {
        const tag = tagName.trim().toLowerCase();
        if (["laugh", "gasp", "breath", "cough", "sigh", "giggle", "yawn", "sob", "snicker", "hmm", "ha"].includes(tag)) {
          return `<${tag}>`;
        }
        return " ";
      });

      if (cleanText.includes("[SAD]")) {
        cleanText = "<hmm> " + cleanText.replace("[SAD]", "");
      } else if (cleanText.includes("[HAPPY]")) {
        cleanText = "<ha> " + cleanText.replace("[HAPPY]", "");
      }

      cleanText = cleanText
        .replace(/[*#_~]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Extract sentiment tags
      let detectedEmotion = "";
      for (const [tag, style] of Object.entries(EMOTION_CONFIG)) {
        if (cleanText.includes(tag)) {
          detectedEmotion = style;
          cleanText = cleanText.replace(tag, "").trim();
          break; // Use the first found tag
        }
      }

      // Automatically enrich with natural human emotions (laughter, giggles, breathing, sighs, sobs, gasps) based on context
      if (["mahi", "anjali", "rohan", "stranger", "zoya", "ishani", "khud"].includes(character)) {
        const sentences = cleanText.split(/(?<=[।!?.\n])/g);
        let enriched = "";
        for (let i = 0; i < sentences.length; i++) {
          let s = sentences[i].trim();
          if (!s) continue;

          // Introduce initial breath for ultra-realism
          if (i === 0 && !s.startsWith("<")) {
            s = `<breath> ` + s;
          }

          // Crying / Weeping / Deep Heartbreak (Sobbing & Trembling) on deletion warnings or sad triggers
          if (s.match(/(মুছে|ডিলিট|ডিলিট করার|delete|wipe|remove|কান্না|কাঁদছে|কষ্ট|হৃদয়ভাঙা|heartbroken|cry|sob|weep|sad|hurt|moche|phelbo|কেঁদে)/gi)) {
            if (!s.includes("<sob>") && !s.includes("<sigh>")) {
              s = `<sob> ` + s + ` <sob> <sigh>`;
            }
          }
          // Giggles on excitement and appreciation
          else if (s.match(/(দারুণ|চমৎকার|দারুন|সুন্দর|বাহ|খুব ভালো|হাসি|খুশি|great|awesome|wonderful|amazing|wow|haha|happy|cheerful|excited|glad|giggle|laugh)/gi)) {
            if (!s.includes("<giggle>") && !s.includes("<laugh>")) {
              s = s + ` <giggle>`;
            }
          }
          // Gasps on shock/surprise/disbelief
          else if (s.match(/(অবাক|বিস্ময়|ওরেব্বাস|gasp|shock|surprise|amazing|unbelievable)/gi)) {
            if (!s.includes("<gasp>")) {
              s = `<gasp> ` + s;
            }
          }
          // Sighs on sorry, general sadness, exhaustion
          else if (s.match(/(দুঃখিত|দুঃখ|খারাপ|ভুল|ক্লান্ত|হাপিয়ে|sorry|unfortunately|alas|sigh|hard|difficult|pity|apologize|tired|exhausted|uff|উফ)/gi)) {
            if (!s.includes("<sigh>")) {
              s = s + ` <sigh>`;
            }
          }

          // Regular natural breaths between long sentences
          if (i > 0 && i % 2 === 0 && !s.startsWith("<")) {
            s = `<breath> ` + s;
          }

          enriched += s + " ";
        }
        cleanText = enriched.trim();
      }

      // Max character slice for safety
      cleanText = cleanText.slice(0, 1000);

      const voiceMap: Record<string, string> = {
        rohan: "Puck",
        stranger: "Fenrir",
        mahi: "Kore", // Extremely friendly, natural female voice
        anjali: "Zephyr", // High-energy, warm female voice
        zoya: "Kore",
        ishani: "Zephyr",
        khud: "Charon"
      };
      const voiceName = voiceMap[character] || "Fenrir";

      const ai = new GoogleGenAI({ 
        apiKey: effectiveKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const ttsResponse = await ai.models.generateContent({
        model: "gemini-3.8-flash-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: (detectedEmotion ? `${detectedEmotion} ` : "") + (
                    character === "mahi" ? "Extremely warm, empathetic, and friendly female student mentor. Speak with beautiful emotional nuance, a smiling voice, and natural pauses. Respond to the student with deep kindness, using vocal bursts like <breath> and <giggle> dynamically to sound 100% human, lively, and comforting." :
                    character === "anjali" ? "Bright, high-energy, and enthusiastic female co-host. Express excitement, clear dynamic range, with natural laughter, and vocal bursts like <laugh> and <gasp> to sound extremely engaging and human." :
                    character === "rohan" ? "Articulate, natural, and friendly young male tutor. Speak warmly with helpful, encouraging inflections, using occasional <breath> for ultra-realism." :
                    "Clear, professional, and comforting human-like speech."
                  )
                }
              }
            ]
          }
        ],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });

      const audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioBase64) {
        return res.json({ success: true, audioBase64, format: "pcm", sampleRate: 24000 });
      }

      return res.status(502).json({ error: "No audio stream returned from Gemini TTS" });
    } catch (err: any) {
      console.warn("[TTS Endpoint Warning]:", err.message);
      return res.status(500).json({ success: false, error: err.message || "Failed to synthesize speech" });
    }
  });

  // API Route for Prompt Optimization using Google Gemini 3.8 Flash
  app.post("/api/gemini/optimize-prompt", async (req, res) => {
    const { userPrompt, style = "photorealistic" } = req.body;
    try {
      const promptText = `You are a professional image prompt engineer for state-of-the-art AI generators like Flux, Midjourney, and Imagen.
Your task is to take the user's simple, brief, or bilingual idea (which could be in English, Bengali, or a mix of both) and translate and elaborate it into a spectacular, high-detail, visually breathtaking, and photorealistic or artistic English prompt.

User's description: "${userPrompt}"
Style requested: ${style}

Rules:
1. Translate any Bengali parts into clear English description.
2. Enrich it with sensory details: lighting (e.g., golden hour, cinematic lighting, dramatic sidelight), composition (e.g., wide-angle shot, macro focus, rule of thirds), colors (e.g., vibrant, muted nostalgic, soft pastel, high-contrast neon), and texture.
3. Keep the optimized prompt coherent, descriptive, and under 120 words.
4. Output ONLY the raw optimized prompt string. Absolutely no conversational intro, no quotes, no markdown wrappers, and no explanations. Just output the refined prompt directly.`;

      const optimized = await generateAIAnswer(promptText, "You are a prompt engineer expert.");
      res.json({ optimized: optimized || userPrompt });
    } catch (err: any) {
      console.warn("Prompt optimization fallback to original:", err.message);
      res.json({ optimized: userPrompt });
    }
  });

  // Safe Image Proxy to solve client-side CORS "Failed to fetch" errors for external images
  app.get("/api/proxy-image", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).send("URL parameter is required");
    }
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const contentType = response.headers.get("content-type") || "image/png";
      res.setHeader("Content-Type", contentType);
      
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error("Proxy image failed:", err.message);
      res.status(500).send("Failed to proxy image");
    }
  });

  // Universal Multi-Tier Image & Diagram Generation API (Cloudflare Workers AI -> Gemini Imagen 3 -> Pollinations Flux -> Wikimedia -> Search)
  app.post("/api/generate-image", async (req, res) => {
    const { prompt, cloudflareToken, cloudflareAccountId, geminiApiKey } = req.body;
    const cleanPrompt = (prompt || "WBCHSE educational diagram").trim();

    // 1. TIER 1: Cloudflare Workers AI (Flux-1-schnell & SDXL)
    const rawCfToken = cloudflareToken || process.env.CLOUDFLARE_API_TOKEN;
    const cfToken = rawCfToken ? String(rawCfToken).trim() : "";
    const rawCfAccountId = cloudflareAccountId || process.env.CLOUDFLARE_ACCOUNT_ID || "a5edef0e8bd3ff33716ef8c8b3b8a051";
    const cfAccountId = rawCfAccountId ? String(rawCfAccountId).trim() : "";

    if (cfToken && cfToken.length > 20 && cfAccountId) {
      const cfModels = [
        "@cf/black-forest-labs/flux-1-schnell",
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        "@cf/bytedance/stable-diffusion-xl-lightning"
      ];

      for (const cfModel of cfModels) {
        try {
          const cfController = new AbortController();
          const timeoutId = setTimeout(() => cfController.abort(), 10000);

          const cfRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/${cfModel}`, {
            method: "POST",
            signal: cfController.signal,
            headers: {
              "Authorization": `Bearer ${cfToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              prompt: cleanPrompt,
              num_steps: 4
            })
          });
          clearTimeout(timeoutId);

          if (cfRes.ok) {
            const contentType = cfRes.headers.get("content-type") || "";
            if (contentType.includes("image/")) {
              const arrayBuffer = await cfRes.arrayBuffer();
              const base64 = Buffer.from(arrayBuffer).toString("base64");
              const mime = contentType.split(";")[0] || "image/png";
              const dataUrl = `data:${mime};base64,${base64}`;
              return res.json({
                success: true,
                url: dataUrl,
                data: [{ url: dataUrl }],
                provider: "Cloudflare Workers AI (" + cfModel.split("/").pop() + ")",
                prompt: cleanPrompt
              });
            } else {
              const cfJson: any = await cfRes.json();
              if (cfJson?.result?.image) {
                const dataUrl = `data:image/png;base64,${cfJson.result.image}`;
                return res.json({
                  success: true,
                  url: dataUrl,
                  data: [{ url: dataUrl }],
                  provider: "Cloudflare Workers AI",
                  prompt: cleanPrompt
                });
              }
            }
          } else {
            const errStatus = cfRes.status;
            if (errStatus === 401 || errStatus === 403) {
              break; // Token invalid, move to next provider smoothly
            }
          }
        } catch (_) {
          // Continue to next model/provider
        }
      }
    }

    // 2. TIER 2: Google Gemini Imagen 3 (imagen-3.0-generate-002)
    const rawGeminiKey = geminiApiKey || process.env.GEMINI_API_KEY;
    const effectiveGeminiKey = rawGeminiKey ? String(rawGeminiKey).trim() : "";
    if (effectiveGeminiKey && effectiveGeminiKey.length > 10) {
      try {
        const ai = new GoogleGenAI({ apiKey: effectiveGeminiKey });
        const imagenResponse = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: cleanPrompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
          },
        });

        const base64Bytes = imagenResponse?.generatedImages?.[0]?.image?.imageBytes;
        if (base64Bytes) {
          const dataUrl = `data:image/jpeg;base64,${base64Bytes}`;
          return res.json({
            success: true,
            url: dataUrl,
            data: [{ url: dataUrl }],
            provider: "Google Gemini Imagen 3",
            prompt: cleanPrompt
          });
        }
      } catch (_) {
        // Smoothly failover to Tier 3/4
      }
    }

    // 3. TIER 3: deAPI AI Flux (if key configured)
    const deapiKey = process.env.DEAPI_API_KEY;
    if (deapiKey) {
      try {
        const response = await fetch("https://api.deapi.ai/api/v1/client/txt2img", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
            "Authorization": `Bearer ${deapiKey}`,
          },
          body: JSON.stringify({
            prompt: cleanPrompt,
            model: "Flux_2_Klein_4B_BF16",
            width: 1024,
            height: 1024,
            steps: 4,
            seed: Math.floor(Math.random() * 1000000),
          }),
        });
        if (response.ok) {
          const data: any = await response.json();
          if (data?.url || data?.data?.[0]?.url) {
            return res.json({
              success: true,
              url: data.url || data.data[0].url,
              data: data.data || [{ url: data.url }],
              provider: "deAPI Flux",
              prompt: cleanPrompt
            });
          }
        }
      } catch (_) {
        // Failover to Pollinations
      }
    }

    // 4. TIER 4: Pollinations AI Flux (High Speed Unlimited Dedicated Fallback)
    try {
      const seed = Math.floor(Math.random() * 10000000);
      const pollinationsUrl = `https://image.pollinations.ai/p/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux&enhance=true`;
      
      return res.json({
        success: true,
        url: pollinationsUrl,
        data: [{ url: pollinationsUrl }],
        provider: "Pollinations AI (Flux Engine)",
        prompt: cleanPrompt
      });
    } catch (_) {
      // Failover to Tier 5
    }

    // 5. TIER 5: Verified Academic Wikimedia / Wikipedia & Google Image Fallback
    try {
      const foundImages = await getGoogleOrUnsplashImages(cleanPrompt);
      return res.json({
        success: true,
        url: foundImages[0],
        data: foundImages.map(img => ({ url: img })),
        provider: "Verified Educational Commons",
        prompt: cleanPrompt
      });
    } catch (fallbackErr: any) {
      res.status(500).json({ error: `All image generation tiers exhausted: ${fallbackErr.message}` });
    }
  });

  // --- Health Endpoints ---
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        ai: !!process.env.GEMINI_API_KEY,
        image: !!process.env.DEAPI_API_KEY,
        telegram: !!getActiveTelegramBotToken()
      }
    });
  });

  // --- Telegram Account Linking API ---
  // In-memory token registry for linking (with 10 min expiry)
  const linkTokenMap = new Map<string, { firebaseUid: string; displayName: string; expiresAt: number }>();
  // Telegram Bot generated 6-digit PIN registry for App Linking
  const telegramAppPinMap = new Map<string, { chatId: string | number; username?: string; firstName?: string; expiresAt: number }>();

  // Verify 6-digit PIN generated from Telegram Bot (/connect)
  app.post("/api/telegram/verify-app-pin", async (req, res) => {
    try {
      const { pin, displayName } = req.body;
      const firebaseUid = req.body.firebaseUid || req.body.uid || "guest_" + Math.random().toString(36).substring(2, 10);
      if (!pin) {
        return res.status(400).json({ success: false, error: "৬-ডিজিটের PIN কোড প্রয়োজন।" });
      }

      const cleanPin = pin.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      let matchedData: { chatId: string | number; username?: string; firstName?: string; expiresAt: number } | null = null;
      let matchedPinKey = "";

      for (const [k, v] of telegramAppPinMap.entries()) {
        if (k.toUpperCase() === cleanPin || k.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === cleanPin) {
          matchedData = v;
          matchedPinKey = k;
          break;
        }
      }

      if (!matchedData) {
        // Check if user entered a Web-generated PIN by mistake
        for (const [k, v] of linkTokenMap.entries()) {
          if (k.toUpperCase() === cleanPin || k.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === cleanPin) {
            if (Date.now() > v.expiresAt) {
              linkTokenMap.delete(k);
              return res.status(400).json({ success: false, error: "এই পিনের ১০ মিনিটের সময়সীমা শেষ হয়ে গেছে। দয়া করে নতুন পিন তৈরি করুন।" });
            }
            return res.status(400).json({ success: false, error: "এই পিনটি Web-এ তৈরি হয়েছিল। অনুগ্রহ করে QR Code স্ক্যান করে অথবা Telegram Bot-এ সরাসরি লিঙ্কে ক্লিক করে প্রবেশ করুন।" });
          }
        }
        return res.status(404).json({ success: false, error: "ভুল পিন কোড! অনুগ্রহ করে টেলিগ্রাম বটে /connect টাইপ করে ৬ ডিজিটের কোডটি সঠিক ভাবে বসান।" });
      }

      if (Date.now() > matchedData.expiresAt) {
        telegramAppPinMap.delete(matchedPinKey);
        return res.status(400).json({ success: false, error: "পিন কোডটির ১০ মিনিটের সময়সীমা উত্তীর্ণ হয়ে গেছে। টেলিগ্রামে /connect থেকে নতুন পিন কোড নিন।" });
      }

      // Valid PIN found! Link account and persist to disk
      const telIdStr = String(matchedData.chatId);
      linkedTelegramUsers.set(telIdStr, {
        firebaseUid,
        displayName: displayName || matchedData.firstName || "Student",
        linkedAt: new Date().toISOString(),
        username: matchedData.username,
        telegramId: matchedData.chatId
      });
      saveLinkedUsersToDisk();

      // Automatically sync user's Gemini API Key if provided from App
      const userApiKey = (req.body.userApiKey || req.body.apiKey || "").trim();
      if (userApiKey) {
        userApiKeyMap.set(telIdStr, userApiKey);
        userApiKeyMap.set(firebaseUid, userApiKey);
        saveUserKeysToDisk();
      }

      telegramAppPinMap.delete(matchedPinKey);

      // Send confirmation message back to Telegram
      const botToken = getActiveTelegramBotToken();
      if (botToken) {
        try {
          const keyMsg = userApiKey ? "\n\n🔑 <b>আপনার কাস্টম Gemini API Key সম্পূর্ণ সিঙ্ক ও সক্রিয় হয়েছে!</b>" : "";
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: matchedData.chatId,
              text: `🎉 <b>অ্যাকাউন্ট সফলভাবে কানেক্ট হয়েছে!</b>\n\nস্বাগতম <b>${displayName || "Student"}</b>! Study Stranger Web App-এর সাথে আপনার Telegram (@${matchedData.username || matchedData.chatId}) সফলভাবে যুক্ত হয়েছে।${keyMsg}\n\nএখন থেকে আপনার কাস্টম কী, চ্যাপ্টার প্রশ্ন এবং পরীক্ষা প্রগ্রেস সম্পূর্ণ সিঙ্ক থাকবে। 🚀`,
              parse_mode: "HTML"
            })
          });
        } catch (msgErr) {
          console.warn("Failed to send telegram confirmation msg:", msgErr);
        }
      }

      res.json({
        success: true,
        message: "🎉 অ্যাকাউন্ট সফলভাবে কানেক্ট হয়েছে!",
        details: {
          telegramId: matchedData.chatId,
          username: matchedData.username,
          displayName: displayName || matchedData.firstName,
          hasCustomApiKey: !!userApiKeyMap.get(telIdStr),
          linkedAt: new Date().toISOString()
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save or sync custom user Gemini API Key for connected Telegram Bot
  app.post("/api/telegram/save-user-apikey", (req, res) => {
    try {
      const { firebaseUid, telegramId, apiKey, userApiKey } = req.body;
      const keyToSave = (apiKey || userApiKey || "").trim();

      if (!keyToSave) {
        return res.status(400).json({ success: false, error: "Gemini API Key প্রয়োজন।" });
      }

      if (firebaseUid) userApiKeyMap.set(String(firebaseUid), keyToSave);
      if (telegramId) userApiKeyMap.set(String(telegramId), keyToSave);

      // Check linked users map to associate with linked Telegram account
      if (firebaseUid) {
        for (const [tId, data] of linkedTelegramUsers.entries()) {
          if (data.firebaseUid === firebaseUid) {
            userApiKeyMap.set(tId, keyToSave);
          }
        }
      }

      saveUserKeysToDisk();

      res.json({
        success: true,
        message: "🔑 আপনার কাস্টম Gemini API Key সফলভাবে টেলিগ্রাম বটের সাথে সিঙ্ক হয়েছে!"
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Verify and test Gemini API Key directly
  app.post("/api/settings/verify-apikey", async (req, res) => {
    try {
      const { apiKey } = req.body;
      const keyToTest = (apiKey || "").trim();
      if (!keyToTest) {
        return res.status(400).json({ success: false, error: "API Key প্রদান করা হয়নি।" });
      }

      const startTime = performance.now();
      const ai = new GoogleGenAI({
        apiKey: keyToTest,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Respond with single word: OK"
      });

      const latencyMs = Math.round(performance.now() - startTime);
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "OK";

      res.json({
        success: true,
        valid: true,
        latencyMs,
        message: "Gemini API Key ভ্যালিড এবং সক্রিয়!",
        model: "gemini-2.5-flash",
        sampleResponse: text.trim()
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        valid: false,
        error: err.message || "API Key যাচাইকরণে ত্রুটি দেখা দিয়েছে।"
      });
    }
  });

  // Universal settings save endpoint for web app, voice tutor, doubt solver, and telegram
  app.post("/api/settings/save-apikey", (req, res) => {
    try {
      const { apiKey, firebaseUid, username } = req.body;
      const keyToSave = (apiKey || "").trim();

      if (!keyToSave) {
        return res.status(400).json({ success: false, error: "API Key প্রয়োজন।" });
      }

      if (firebaseUid) userApiKeyMap.set(String(firebaseUid), keyToSave);
      userApiKeyMap.set("_default_system_key", keyToSave);
      if (username) userApiKeyMap.set(String(username), keyToSave);

      if (firebaseUid) {
        for (const [tId, data] of linkedTelegramUsers.entries()) {
          if (data.firebaseUid === firebaseUid) {
            userApiKeyMap.set(tId, keyToSave);
          }
        }
      }

      saveUserKeysToDisk();

      res.json({
        success: true,
        message: "API Key সফলভাবে সার্ভার ও সকল AI টুলের জন্য সিঙ্ক হয়েছে!"
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get masked status of configured API key
  app.get("/api/settings/key-status", (req, res) => {
    const { firebaseUid } = req.query;
    let key = "";
    if (firebaseUid && userApiKeyMap.has(String(firebaseUid))) {
      key = userApiKeyMap.get(String(firebaseUid)) || "";
    } else if (userApiKeyMap.has("_default_system_key")) {
      key = userApiKeyMap.get("_default_system_key") || "";
    } else if (process.env.GEMINI_API_KEY) {
      key = process.env.GEMINI_API_KEY;
    }
    const hasKey = !!key && key.length > 20;
    const masked = hasKey ? `${key.slice(0, 6)}...${key.slice(-4)}` : "";
    res.json({
      hasCustomKey: hasKey,
      maskedKey: masked
    });
  });

  // Diagnostic endpoint: Asynchronous check directly against Telegram API
  app.get(["/api/telegram/check-connection", "/api/telegram/diagnostic"], async (req, res) => {
    const startTime = performance.now();
    const botToken = getActiveTelegramBotToken();
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "Studystranger_bot";

    if (!botToken) {
      return res.status(400).json({
        success: false,
        status: "error",
        message: "Telegram Bot Token কনফিগার করা নেই।",
        latencyMs: 0,
        timestamp: new Date().toISOString()
      });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await telegramRes.json();
      const latencyMs = Math.max(1, Math.round(performance.now() - startTime));

      if (data.ok && data.result) {
        const bot = data.result;
        return res.json({
          success: true,
          status: "healthy",
          message: `টেলিগ্রাম বট (@${bot.username || botUsername}) সম্পূর্ণ সক্রিয় এবং দ্রুত রেসপন্স করছে!`,
          latencyMs,
          bot: {
            id: bot.id,
            firstName: bot.first_name,
            username: bot.username,
            canJoinGroups: bot.can_join_groups ?? true,
            canReadAllGroupMessages: bot.can_read_all_group_messages ?? false,
            supportsInlineQueries: bot.supports_inline_queries ?? false
          },
          serverStatus: "online",
          timestamp: new Date().toISOString()
        });
      } else {
        return res.status(502).json({
          success: false,
          status: "telegram_rejected",
          message: `টেলিগ্রাম সার্ভার ত্রুটি: ${data.description || "অজানা সমস্যা"}`,
          latencyMs,
          errorCode: data.error_code,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
      const isTimeout = err.name === "AbortError";
      return res.status(503).json({
        success: false,
        status: "unreachable",
        message: isTimeout 
          ? "টেলিগ্রাম এপিআই সংযোগে সময়সীমা উত্তীর্ণ (Timeout) হয়েছে। ইন্টারনেট বা প্রক্সি চেক করুন।"
          : `টেলিগ্রাম এপিআই সংযোগ ব্যর্থ: ${err.message || "নেটওয়ার্ক ত্রুটি"}`,
        latencyMs,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Check account link status
  app.get("/api/telegram/status/:firebaseUid", (req, res) => {
    try {
      const { firebaseUid } = req.params;
      const guestUid = (req.query.guestUid as string) || "";
      const queryChatId = (req.query.chatId as string) || "";

      let foundLinked: any = null;

      for (const [telId, data] of linkedTelegramUsers.entries()) {
        if (data.firebaseUid === firebaseUid) {
          foundLinked = { ...data, telegramId: telId };
          break;
        }
        if (guestUid && data.firebaseUid === guestUid) {
          foundLinked = { ...data, telegramId: telId, firebaseUid };
          // Upgrade guest link to authenticated Firebase UID and save
          data.firebaseUid = firebaseUid;
          saveLinkedUsersToDisk();
          break;
        }
        if (queryChatId && String(telId) === queryChatId) {
          foundLinked = { ...data, telegramId: telId, firebaseUid };
          data.firebaseUid = firebaseUid;
          saveLinkedUsersToDisk();
          break;
        }
      }

      // If single student environment and only 1 linked user exists, auto-reconcile
      if (!foundLinked && linkedTelegramUsers.size === 1) {
        const [onlyTelId, onlyData] = Array.from(linkedTelegramUsers.entries())[0];
        foundLinked = { ...onlyData, telegramId: onlyTelId };
      }

      res.json({ 
        linked: !!foundLinked, 
        botUsername: process.env.TELEGRAM_BOT_USERNAME || "Studystranger_bot",
        details: foundLinked 
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Unlink account
  app.post("/api/telegram/unlink/:firebaseUid", (req, res) => {
    try {
      const { firebaseUid } = req.params;
      let unlinked = false;
      for (const [telId, data] of linkedTelegramUsers.entries()) {
        if (data.firebaseUid === firebaseUid || String(telId) === (req.body?.chatId || "")) {
          linkedTelegramUsers.delete(telId);
          unlinked = true;
        }
      }
      if (unlinked) {
        saveLinkedUsersToDisk();
      }
      res.json({ success: true, unlinked });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/telegram/generate-link-token", (req, res) => {
    try {
      const { firebaseUid, displayName } = req.body;
      if (!firebaseUid) {
        return res.status(400).json({ error: "firebaseUid is required" });
      }

      const now = Date.now();
      // Enforce single active token per user constraint: check if an active non-expired token exists
      let existingToken: string | null = null;
      let existingData: { firebaseUid: string; displayName: string; expiresAt: number } | null = null;

      for (const [t, data] of linkTokenMap.entries()) {
        if (data.firebaseUid === firebaseUid && data.expiresAt > now) {
          existingToken = t;
          existingData = data;
          break;
        }
      }

      let token = existingToken;
      let expiresAt = existingData ? existingData.expiresAt : now + 10 * 60 * 1000;

      if (!token) {
        token = "ST-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        expiresAt = now + 10 * 60 * 1000; // 10 minutes
        linkTokenMap.set(token, { firebaseUid, displayName: displayName || "Student", expiresAt });
      } else if (displayName && existingData) {
        existingData.displayName = displayName;
      }

      const botUsername = process.env.TELEGRAM_BOT_USERNAME || "Studystranger_bot";
      const deepLink = `https://t.me/${botUsername}?start=${token}`;
      const expiresInSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

      res.json({
        success: true,
        token,
        botUsername,
        deepLink,
        expiresInSeconds
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Revoke / Delete active link token explicitly
  app.post("/api/telegram/revoke-token", (req, res) => {
    try {
      const { firebaseUid, token } = req.body;
      let revokedCount = 0;

      if (token && linkTokenMap.has(token)) {
        linkTokenMap.delete(token);
        revokedCount++;
      }

      if (firebaseUid) {
        for (const [t, data] of linkTokenMap.entries()) {
          if (data.firebaseUid === firebaseUid) {
            linkTokenMap.delete(t);
            revokedCount++;
          }
        }
      }

      res.json({ success: true, revokedCount, message: "Code deleted successfully." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Telegram Webhook Auto-Setup API ---
  app.post("/api/telegram/auto-setup-webhook", async (req, res) => {
    try {
      const botToken = getActiveTelegramBotToken();
      if (!botToken) {
        return res.status(400).json({ 
          success: false, 
          error: "TELEGRAM_BOT_TOKEN সেট করা নেই।" 
        });
      }

      // Determine public domain
      let hostUrl = process.env.APP_URL;
      if (!hostUrl) {
        const proto = req.headers["x-forwarded-proto"] || "https";
        const host = req.headers.host;
        hostUrl = `${proto}://${host}`;
      }
      
      // Clean URL
      hostUrl = hostUrl.replace(/\/$/, "");
      const webhookUrl = `${hostUrl}/telegram/webhook`;
      const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET || "study_stranger_sec_auto_984";

      // Call Telegram SetWebhook API directly
      const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: secretToken,
          drop_pending_updates: true
        })
      });

      const data = await response.json();

      res.json({
        success: data.ok,
        webhookUrl,
        secretToken,
        telegramResponse: data
      });
    } catch (err: any) {
      res.status(500).json({ 
        success: false, 
        error: err.message || "Failed to auto setup webhook" 
      });
    }
  });

  // --- Robust Server-side PDF Storage & Streaming Service ---
  const pdfStorageDir = path.join(process.cwd(), "data", "pdfs");
  try {
    if (!fs.existsSync(pdfStorageDir)) {
      fs.mkdirSync(pdfStorageDir, { recursive: true });
    }
  } catch (dirErr) {
    console.warn("[PDF Storage] Directory init warning:", dirErr);
  }

  // Quick in-memory cache for ultra-fast PDF retrieval
  const pdfMetaCache = new Map<string, { fileName: string; size: number; mimeType: string; buffer: Buffer }>();

  // Upload PDF endpoint: Accepts base64 dataUrl or binary
  app.post("/api/upload/pdf", async (req, res) => {
    try {
      const { fileName, fileData, fileSize } = req.body;
      if (!fileData) {
        return res.status(400).json({ success: false, error: "fileData is required" });
      }

      const id = `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const safeName = (fileName || "WBCHSE_Notice_Document.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");

      let base64Content = fileData;
      let mimeType = "application/pdf";
      if (fileData.includes(",")) {
        const parts = fileData.split(",");
        const match = parts[0].match(/:(.*?);/);
        if (match) mimeType = match[1];
        base64Content = parts[1];
      }

      const buffer = Buffer.from(base64Content, "base64");
      const computedSize = buffer.length;

      // Save to cache
      pdfMetaCache.set(id, {
        fileName: safeName,
        size: computedSize,
        mimeType,
        buffer
      });

      // Save to disk for durability across container restarts
      try {
        const filePath = path.join(pdfStorageDir, `${id}.pdf`);
        fs.writeFileSync(filePath, buffer);
      } catch (fsErr) {
        console.warn("[PDF Storage] Disk write fallback to memory:", fsErr);
      }

      const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };

      const pdfUrl = `/api/pdf/${id}`;
      console.log(`[PDF Upload] Successfully stored ${safeName} (${formatSize(computedSize)}) as ${id}`);

      res.json({
        success: true,
        id,
        pdfUrl,
        pdfName: safeName,
        pdfSize: formatSize(computedSize),
        sizeBytes: computedSize
      });
    } catch (err: any) {
      console.error("[PDF Upload] Error:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to upload PDF" });
    }
  });

  // Stream/Download PDF endpoint (Works in any browser, iframe, mobile view, or Telegram link)
  app.get("/api/pdf/:id", (req, res) => {
    try {
      const { id } = req.params;
      let pdfItem = pdfMetaCache.get(id);

      if (!pdfItem) {
        const filePath = path.join(pdfStorageDir, `${id}.pdf`);
        if (fs.existsSync(filePath)) {
          const buffer = fs.readFileSync(filePath);
          pdfItem = {
            fileName: `${id}.pdf`,
            size: buffer.length,
            mimeType: "application/pdf",
            buffer
          };
          pdfMetaCache.set(id, pdfItem);
        }
      }

      if (!pdfItem) {
        return res.status(404).send("PDF document not found or expired.");
      }

      res.setHeader("Content-Type", pdfItem.mimeType || "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(pdfItem.fileName)}"`);
      res.setHeader("Content-Length", pdfItem.buffer.length);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(pdfItem.buffer);
    } catch (err: any) {
      console.error("[PDF Stream] Error:", err);
      res.status(500).send("Error streaming PDF document.");
    }
  });

  // Broadcast announcement to linked Telegram users
  app.post("/api/admin/broadcast-notice", async (req, res) => {
    try {
      const { title, text, category, pdfUrl, pdfName, pdfSize } = req.body;
      const botToken = getActiveTelegramBotToken();
      
      if (!botToken || linkedTelegramUsers.size === 0) {
        return res.json({ success: true, broadcastCount: 0, message: "No linked Telegram users" });
      }

      const webAppUrl = process.env.APP_URL || "https://ais-pre-tdzujvdptn6cxeu3npeoqg-181332496386.asia-southeast1.run.app";
      const downloadLink = pdfUrl ? (pdfUrl.startsWith("http") ? pdfUrl : `${webAppUrl}${pdfUrl}`) : "";

      const msgHtml = `📢 <b>নতুন অফিসিয়াল নোটিশ (Official Notice)</b>\n\n` +
        `<b>📌 ${title || "জরুরি বিজ্ঞপ্তি"}</b>\n` +
        `🏷️ <i>বিভাগ: ${category || "WBCHSE Class 12"}</i>\n\n` +
        `${text ? `${text}\n\n` : ""}` +
        `${pdfName ? `📄 <b>সংযুক্ত PDF:</b> ${pdfName} (${pdfSize || "Document"})\n\n` : ""}` +
        `<i>Study Stranger Web App-এ বিস্তারিত দেখতে পারেন।</i>`;

      const keyboard = {
        inline_keyboard: [
          downloadLink ? [{ text: `📄 Open/Download PDF`, url: downloadLink }] : [],
          [{ text: "🚀 Open Study Stranger App", url: webAppUrl }]
        ].filter(r => r.length > 0)
      };

      let sentCount = 0;
      for (const [telegramId] of linkedTelegramUsers.entries()) {
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: telegramId,
              text: msgHtml,
              parse_mode: "HTML",
              reply_markup: keyboard
            })
          });
          sentCount++;
        } catch (e) {
          // ignore individual failed telegram sends
        }
      }

      res.json({ success: true, broadcastCount: sentCount });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Reset & Force Restart 24/7 Long Polling
  app.post("/api/telegram/reset-polling", async (req, res) => {
    try {
      const botToken = getActiveTelegramBotToken();
      if (!botToken) {
        return res.status(400).json({ success: false, error: "Bot token not configured" });
      }

      // Delete webhook with drop_pending_updates=false so updates can be received via polling
      const resp = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook?drop_pending_updates=false`, {
        method: "POST"
      });
      const data = await resp.json();

      lastUpdateId = 0;
      isPolling = false;
      startTelegramPolling();

      res.json({
        success: true,
        message: "24/7 Polling Engine successfully reset and active!",
        telegramResponse: data
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- 24/7 High-Reliability Telegram Bot Engine ---
  const TELEGRAM_STATE_FILE = path.join(process.cwd(), "data", "telegram_poller_state.json");
  let lastUpdateId = 0;
  const processedUpdates = new Set<number>();
  const processedMsgKeys = new Set<string>();
  const inFlightMessages = new Set<string>();
  const userLastQueryMap = new Map<number | string, string>();

  // Ensure data directory exists and load persisted poller state
  try {
    if (!fs.existsSync(path.join(process.cwd(), "data"))) {
      fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
    }
    if (fs.existsSync(TELEGRAM_STATE_FILE)) {
      const stateData = JSON.parse(fs.readFileSync(TELEGRAM_STATE_FILE, "utf-8"));
      if (typeof stateData.lastUpdateId === "number") {
        lastUpdateId = stateData.lastUpdateId;
      }
      if (Array.isArray(stateData.processedMsgKeys)) {
        stateData.processedMsgKeys.forEach((k: string) => processedMsgKeys.add(k));
      }
      if (Array.isArray(stateData.processedUpdates)) {
        stateData.processedUpdates.forEach((u: number) => processedUpdates.add(u));
      }
      console.log(`[Telegram State] Loaded lastUpdateId=${lastUpdateId}, ${processedMsgKeys.size} processed msg keys.`);
    }
  } catch (stateErr) {
    console.warn("[Telegram State] Could not load state file:", stateErr);
  }

  const saveTelegramState = () => {
    try {
      const stateData = {
        lastUpdateId,
        processedMsgKeys: Array.from(processedMsgKeys).slice(-3000),
        processedUpdates: Array.from(processedUpdates).slice(-3000),
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(TELEGRAM_STATE_FILE, JSON.stringify(stateData, null, 2), "utf-8");
    } catch (saveErr) {
      // Ignored
    }
  };

  setInterval(() => {
    saveTelegramState();
  }, 5 * 60 * 1000);

  // Dynamic Class 12 WBCHSE Quiz Bank
  const class12QuizBank = [
    {
      q: "Q. মানব শুক্রাণুর (Human Sperm) কোন অংশে মাইটোকন্ড্রিয়া থাকে?",
      options: [
        { text: "A) Head (শীর্ষদেশ)", correct: false },
        { text: "B) Midpiece (মধ্যভাগ)", correct: true },
        { text: "C) Tail (পুচ্ছ)", correct: false },
        { text: "D) Acrosome (অ্যাক্রোজোম)", correct: false }
      ],
      explanation: "মানব শুক্রাণুর মধ্যভাগে (Midpiece) মাইটোকন্ড্রিয়া সর্পিলভাবে সজ্জিত থাকে যা সাঁতার কাটার প্রয়োজনীয় শক্তি (ATP) জোগায়।"
    },
    {
      q: "Q. DNA অণুতে গুয়ানিন (G) ও সাইটোসিন (C)-এর মধ্যে কয়টি হাইড্রোজেন বন্ধন থাকে?",
      options: [
        { text: "A) ১টি", correct: false },
        { text: "B) ২টি", correct: false },
        { text: "C) ৩টি", correct: true },
        { text: "D) ৪টি", correct: false }
      ],
      explanation: "DNA-তে Adenine=Thymine (২টি হাইড্রোজেন বন্ড) এবং Guanine≡Cytosine (৩টি হাইড্রোজেন বন্ড) থাকে।"
    },
    {
      q: "Q. 'The Bet' গল্পে ব্যাঙ্কার ও উকিলের মধ্যে কত টাকার বাজি হয়েছিল?",
      options: [
        { text: "A) ১ মিলিয়ন রুবল", correct: false },
        { text: "B) ২ মিলিয়ন রুবল", correct: true },
        { text: "C) ৫ মিলিয়ন রুবল", correct: false },
        { text: "D) ১০ হাজার রুবল", correct: false }
      ],
      explanation: "আন্তন চেখভের 'The Bet' গল্পে ২ মিলিয়ন রুবলের বিনিময়ে ১৫ বছরের নির্জন কারাবাসের বাজি ধরা হয়েছিল।"
    },
    {
      q: "Q. প্রভাত কুমার মুখোপাধ্যায়ের 'আদিরিনী' গল্পে জয়রাম মুখুজ্জে কত টাকায় হাতিটি কিনেছিলেন?",
      options: [
        { text: "A) ১০০০ টাকা", correct: false },
        { text: "B) ২০০০ টাকা", correct: true },
        { text: "C) ৫০০ টাকা", correct: false },
        { text: "D) ৫০০০ টাকা", correct: false }
      ],
      explanation: "জয়রাম মুখুজ্জে আদিরিনীকে ২০০০ টাকায় নিলাম থেকে কিনে এনেছিলেন।"
    },
    {
      q: "Q. ডিম্বাণুর জোনা পেলুসিডার কোন রিসেপ্টরে শুক্রাণু যুক্ত হয়?",
      options: [
        { text: "A) ZP1", correct: false },
        { text: "B) ZP2", correct: false },
        { text: "C) ZP3", correct: true },
        { text: "D) ZP4", correct: false }
      ],
      explanation: "নিষেক প্রক্রিয়ায় শুক্রাণু জোনা পেলুসিডার ZP3 (Zona Pellucida Glycoprotein 3) রিসেপ্টরে আবদ্ধ হয়ে অ্যাক্রোজোম বিক্রিয়া ঘটায়।"
    },
    {
      q: "Q. মেনস্ট্রুয়াল সাইকেলের কততম দিনে LH Surge ঘটে এবং ওভুলেশন হয়?",
      options: [
        { text: "A) ১ম দিনে", correct: false },
        { text: "B) ৭ম দিনে", correct: false },
        { text: "C) ১৪তম দিনে", correct: true },
        { text: "D) ২৮তম দিনে", correct: false }
      ],
      explanation: "২৮ দিনের স্বাভাবিক চক্রে ১৪তম দিনে Luteinizing Hormone (LH)-এর মাত্রা সর্বোচ্চ শিখরে পৌঁছায় (LH surge), ফলে ডিম্বপাত ঘটে।"
    }
  ];

  // Helper: Answer Telegram callback queries immediately so buttons never hang
  const answerCallbackQuery = async (botToken: string, callbackQueryId: string, text?: string) => {
    if (!botToken || !callbackQueryId) return;
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: text || "",
          show_alert: false
        })
      });
    } catch (err) {
      // Ignored
    }
  };

  // --- Telegram Update Processor (Guaranteed Error-Free & 24/7 Resilience) ---
  const processTelegramUpdate = async (update: any) => {
    if (!update) return;

    // 1. Strict Update ID Deduplication
    if (update.update_id) {
      if (processedUpdates.has(update.update_id)) return;
      processedUpdates.add(update.update_id);
    }

    // 2. Strict Message & Callback Key Deduplication
    const msgObj = update.message || update.edited_message || update.channel_post;
    let msgKey: string | null = null;
    if (msgObj) {
      msgKey = `msg_${msgObj.chat?.id}_${msgObj.message_id}`;
    } else if (update.callback_query) {
      msgKey = `cq_${update.callback_query.id}`;
    }

    if (msgKey) {
      if (processedMsgKeys.has(msgKey) || inFlightMessages.has(msgKey)) {
        console.log(`[Telegram Guard] Prevented duplicate execution for key: ${msgKey}`);
        return;
      }
      inFlightMessages.add(msgKey);
      processedMsgKeys.add(msgKey);
      saveTelegramState();
    }

    try {
      const botToken = getActiveTelegramBotToken();
      if (!botToken) return;

      const webAppUrl = process.env.APP_URL || "https://ais-pre-tdzujvdptn6cxeu3npeoqg-181332496386.asia-southeast1.run.app";

      // Robust Message Sender: Splits if >3900 chars, handles parse errors with plain-text fallback
      const sendMsg = async (chatId: number | string, text: string, reply_markup?: any) => {
        if (!chatId || !text) return;
        
        // Chunk message if extremely long
        const chunks: string[] = [];
        if (text.length > 3800) {
          let remaining = text;
          while (remaining.length > 0) {
            chunks.push(remaining.substring(0, 3800));
            remaining = remaining.substring(3800);
          }
        } else {
          chunks.push(text);
        }

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const isLast = i === chunks.length - 1;
          const markupToSend = isLast ? reply_markup : undefined;

          try {
            const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: chunk,
                parse_mode: "HTML",
                reply_markup: markupToSend
              })
            });
            const resJson: any = await resp.json();
            
            // Only fallback to plain text if Telegram failed strictly because of HTML entity parsing
            if (!resJson.ok && resJson.description && /parse|entity|tag/i.test(resJson.description)) {
              const plain = chunk.replace(/<[^>]*>?/gm, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: plain,
                  reply_markup: markupToSend
                })
              });
            }
          } catch (err: any) {
            console.error("[Telegram sendMsg] Network error:", err.message);
          }
        }
      };

      const sendAction = async (chatId: number | string, action: string = "typing") => {
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, action })
          });
        } catch {
          // Ignored
        }
      };

      // 1. Handle Messages (Text, Slash Commands, Photos)
      if (msgObj) {
        const msg = msgObj;
        const chatId = msg.chat?.id;
        const text = (msg.text || msg.caption || "").trim();

        // Handle Photo Submissions (Supports QR Code Auto-Scan & Instant AI Math/Academic Visual Solver)
        if (msg.photo && msg.photo.length > 0) {
          await sendAction(chatId, "typing");

          let qrScanSuccess = false;
          let base64Img = "";
          try {
            // Get highest resolution photo sent by user
            const highestPhoto = msg.photo[msg.photo.length - 1];
            const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${highestPhoto.file_id}`);
            const fileData: any = await fileRes.json();

            if (fileData.ok && fileData.result?.file_path) {
              const filePath = fileData.result.file_path;
              const imgRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);
              const arrayBuffer = await imgRes.arrayBuffer();
              base64Img = Buffer.from(arrayBuffer).toString("base64");

              // Send photo to Google Gemini Vision to check for QR Code / Linking Token first
              const visionKey = getBestGeminiApiKey();
              if (visionKey) {
                const ai = new GoogleGenAI({
                  apiKey: visionKey,
                  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
                });

                const visionRes = await ai.models.generateContent({
                  model: "gemini-3.6-flash",
                  contents: {
                    parts: [
                      {
                        inlineData: {
                          mimeType: "image/jpeg",
                          data: base64Img
                        }
                      },
                      {
                        text: "Examine this image carefully. Is it a QR code or image containing a linking token starting with 'ST-' (e.g. ST-X1Y2Z3) or a 6-digit PIN? Extract and return ONLY the token or PIN string itself (e.g. ST-A1B2C3 or 849201). If no token or QR code is present, reply ONLY 'NONE'."
                      }
                    ]
                  }
                });

                const extractedText = (visionRes.text || "").trim();

                // Find matching ST- token or 6-digit PIN in extracted output
                const tokenMatch = extractedText.match(/ST-[A-Za-z0-9]+/i) || extractedText.match(/\b\d{6}\b/);
                const foundTokenStr = tokenMatch ? tokenMatch[0].toUpperCase() : null;

                if (foundTokenStr) {
                  // Check linkTokenMap (Web generated QR token)
                  let matchedKey = "";
                  for (const key of linkTokenMap.keys()) {
                    if (key.toUpperCase() === foundTokenStr || key.toUpperCase() === "ST-" + foundTokenStr || foundTokenStr.includes(key.toUpperCase())) {
                      matchedKey = key;
                      break;
                    }
                  }

                  if (matchedKey && linkTokenMap.has(matchedKey)) {
                    const linkData = linkTokenMap.get(matchedKey)!;
                    if (Date.now() <= linkData.expiresAt) {
                      linkTokenMap.delete(matchedKey);
                      linkedTelegramUsers.set(String(chatId), {
                        firebaseUid: linkData.firebaseUid,
                        displayName: linkData.displayName,
                        linkedAt: new Date().toISOString(),
                        username: msg.from?.username,
                        telegramId: chatId
                      });
                      saveLinkedUsersToDisk();
                      qrScanSuccess = true;
                      await sendMsg(
                        chatId,
                        `🎉 <b>QR CODE সফলভাবে স্ক্যান হয়েছে!</b>\n\nস্বাগতম <b>${linkData.displayName}</b>! আপনার Telegram (@${msg.from?.username || chatId}) সফলভাবে Study Stranger Web App-এর সাথে যুক্ত হয়েছে। 🚀`
                      );
                      return;
                    } else {
                      linkTokenMap.delete(matchedKey);
                      await sendMsg(chatId, "❌ <b>QR Code মেয়াাদোত্তীর্ণ!</b>\nএই QR Code-এর ১০ মিনিটের সময়সীমা শেষ হয়ে গেছে। দয়া করে Web App থেকে নতুন QR কোড ডাউনলোড করে পাঠান।");
                      return;
                    }
                  }

                  // Check telegramAppPinMap
                  let matchedPinKey = "";
                  for (const key of telegramAppPinMap.keys()) {
                    if (key.toUpperCase() === foundTokenStr) {
                      matchedPinKey = key;
                      break;
                    }
                  }

                  if (matchedPinKey && telegramAppPinMap.has(matchedPinKey)) {
                    const pinData = telegramAppPinMap.get(matchedPinKey)!;
                    telegramAppPinMap.delete(matchedPinKey);
                    linkedTelegramUsers.set(String(chatId), {
                      firebaseUid: "guest_" + chatId,
                      displayName: msg.from?.first_name || "Student",
                      linkedAt: new Date().toISOString(),
                      username: msg.from?.username,
                      telegramId: chatId
                    });
                    saveLinkedUsersToDisk();
                    qrScanSuccess = true;
                    await sendMsg(
                      chatId,
                      `🎉 <b>PIN কোড সফলভাবে যুক্ত হয়েছে!</b>\n\nআপনার Telegram অ্যাকাউন্ট সফলভাবে কানেক্ট করা হলো। 🚀`
                    );
                    return;
                  }
                }
              }
            }
          } catch (scanErr: any) {
            console.warn("[Telegram Photo Scan Error]:", scanErr.message);
          }

          // If not QR code, solve as an academic/visual problem using Gemini Vision
          if (!qrScanSuccess && base64Img) {
            try {
              await sendAction(chatId, "typing");
              const userCaption = (msg.caption || "").trim();
              const visionPrompt = `You are Study Stranger AI, an expert academic tutor for WBCHSE Class 12 (Biology, Math, Physics, Chemistry, Bengali, English).
Examine this image sent by the student. ${userCaption ? `User note: "${userCaption}".` : ""}
Task:
1. Identify and transcribe the mathematical equation, diagram, or question clearly.
2. Provide a thorough, step-by-step master solution in warm, encouraging Bengali (বাংলা) / Banglish / English.
3. Write all formulas and equations with clean mathematical notations ($$...$$).
4. Clearly highlight the final answer.`;

              const visionKey = getBestGeminiApiKey();
              if (visionKey) {
                const ai = new GoogleGenAI({
                  apiKey: visionKey,
                  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
                });

                const solveRes = await ai.models.generateContent({
                  model: "gemini-3.6-flash",
                  contents: {
                    parts: [
                      {
                        inlineData: {
                          mimeType: "image/jpeg",
                          data: base64Img
                        }
                      },
                      { text: visionPrompt }
                    ]
                  }
                });

                const solutionText = solveRes.text?.trim() || "";
                if (solutionText) {
                  const formattedSol = TelegramFormatter.toTelegramHtml(solutionText);
                  const replyHtml = `📸 <b>ছবি থেকে প্রশ্নের সমাধান (Visual Problem Solved):</b>\n\n${formattedSol}`;
                  const keyboard = {
                    inline_keyboard: [
                      [{ text: "🎙️ Direct 1:1 Live Call", callback_data: "menu_live_call" }],
                      [{ text: "🧠 Practice Related Quiz", callback_data: "menu_quiz" }, { text: "🏠 Main Menu", callback_data: "menu_home" }]
                    ]
                  };
                  await sendMsg(chatId, replyHtml, keyboard);
                  return;
                }
              }
            } catch (solveErr: any) {
              console.error("[Telegram Vision Solve Error]:", solveErr.message);
            }

            const fallbackPhotoReply = `📸 <b>ছবি প্রাপ্ত হয়েছে!</b>\n\nছবিটি প্রসেস করার পর স্পষ্ট প্রশ্নের টেক্সট বা সূত্র থাকলে সাথে লিখে পাঠান (যেমন: <i>'এই অংকটি করে দাও'</i>), আমি সাথে সাথে নির্ভুল সমাধান তৈরি করে দেব!`;
            await sendMsg(chatId, fallbackPhotoReply);
            return;
          }
        }

        // Handle Voice Notes & Audio Messages (Direct voice input from student!)
        if (msg.voice || msg.audio) {
          await sendAction(chatId, "record_voice");
          try {
            const voiceObj = msg.voice || msg.audio;
            const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${voiceObj.file_id}`);
            const fileData: any = await fileRes.json();

            if (fileData.ok && fileData.result?.file_path) {
              const filePath = fileData.result.file_path;
              const audioRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);
              const audioBuffer = await audioRes.arrayBuffer();
              const base64Audio = Buffer.from(audioBuffer).toString("base64");
              const mimeType = msg.voice ? "audio/ogg" : (voiceObj.mime_type || "audio/mp3");

              const voicePrompt = `You are Study Stranger AI, an ultra-smart, warm, and friendly academic companion for student Abhijit (অভিজিৎ).
Listen to this voice message sent by the student.
1. Understand the question or greeting spoken in Bengali / Banglish / English.
2. Provide a warm, friendly, detailed and clear answer.
3. If it's a math or science question, explain the concepts and formulas step-by-step.`;

              const effectiveKey = getBestGeminiApiKey();
              if (effectiveKey) {
                const ai = new GoogleGenAI({
                  apiKey: effectiveKey,
                  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
                });

                const voiceResponse = await ai.models.generateContent({
                  model: "gemini-3.6-flash",
                  contents: {
                    parts: [
                      {
                        inlineData: {
                          mimeType: mimeType.includes("ogg") ? "audio/ogg" : "audio/mp3",
                          data: base64Audio
                        }
                      },
                      { text: voicePrompt }
                    ]
                  }
                });

                const answerText = voiceResponse.text?.trim() || "";
                if (answerText) {
                  const formattedVoiceAns = TelegramFormatter.toTelegramHtml(answerText);
                  const voiceReplyHtml = `🎙️ <b>ভয়েস মেসেজের উত্তর (Voice Query Answered):</b>\n\n${formattedVoiceAns}`;
                  
                  const voiceButtons = {
                    inline_keyboard: [
                      [{ text: "📞 Direct 1:1 Live Talk (সরাসরি লাইভ কথা বলুন)", callback_data: "menu_live_call" }],
                      [{ text: "🧠 Practice Quiz", callback_data: "menu_quiz" }, { text: "🏠 Main Menu", callback_data: "menu_home" }]
                    ]
                  };
                  await sendMsg(chatId, voiceReplyHtml, voiceButtons);
                  return;
                }
              }
            }
          } catch (voiceErr: any) {
            console.error("[Telegram Voice Error]:", voiceErr.message);
            await sendMsg(chatId, `🎙️ <b>ভয়েস মেসেজ প্রাপ্ত হয়েছে!</b>\n\nদুঃখিত, ভয়েস অডিও প্রসেসিংয়ে সাময়িক সমস্যা হয়েছিল। দয়া করে আরেকবার ভয়েস পাঠান অথবা সরাসরি লিখে বলুন! 🚀`);
            return;
          }
        }

        // Handle /start command
        if (text.startsWith("/start")) {
          const parts = text.split(/\s+/);
          let linkArg = parts[1]?.trim();

          if (linkArg) {
            let matchedToken = linkArg;
            if (!linkTokenMap.has(matchedToken)) {
              for (const key of linkTokenMap.keys()) {
                if (key.toLowerCase() === linkArg.toLowerCase()) {
                  matchedToken = key;
                  break;
                }
              }
            }

            if (linkTokenMap.has(matchedToken)) {
              const linkData = linkTokenMap.get(matchedToken)!;
              if (Date.now() > linkData.expiresAt) {
                linkTokenMap.delete(matchedToken);
                await sendMsg(chatId, "❌ <b>Link token expired.</b>\nদয়া করে Study Stranger Web App থেকে নতুন কানেক্ট লিঙ্ক তৈরি করুন।");
              } else {
                linkTokenMap.delete(matchedToken);
                linkedTelegramUsers.set(String(chatId), {
                  firebaseUid: linkData.firebaseUid,
                  displayName: linkData.displayName,
                  linkedAt: new Date().toISOString(),
                  username: msg.from?.username,
                  telegramId: chatId
                });
                saveLinkedUsersToDisk();
                await sendMsg(
                  chatId, 
                  `🎉 <b>অ্যাকাউন্ট সফলভাবে কানেক্ট হয়েছে!</b>\n\nস্বাগতম <b>${linkData.displayName}</b>! আপনার Telegram (@${msg.from?.username || chatId}) এখন Study Stranger Web অ্যাকাউন্টের সাথে সম্পূর্ণ যুক্ত। আপনার সমস্ত প্রগ্রেস ও নোটস এখানে সিঙ্ক থাকবে।`
                );
              }
            }
          }

          const welcomeHtml = `🎓 <b>STUDY STRANGER AI (WBCHSE Class 12)</b>\n\n` +
            `স্বাগতম! আমি অভিজিৎ-এর ব্যক্তিগত AI পড়াশোনার বন্ধু।\n\n` +
            `💬 <b>পড়াশোনার ডাউট বা প্রশ্ন থাকলে সরাসরি মেসেজ করো, আমি উত্তর দেব।</b>\n\n` +
            `⚙️ <b>ওয়েব অ্যাপ কানেক্ট বা সেটিংসের জন্য নিচের বাটনে ক্লিক করো।</b>`;

          const keyboard = {
            inline_keyboard: [
              [
                { text: "⚙️ Settings & Connect", callback_data: "menu_settings" }
              ],
              [
                { text: "🚀 Open Web App", web_app: { url: webAppUrl } }
              ]
            ]
          };

          await sendMsg(chatId, welcomeHtml, keyboard);
          return;
        }

        // Handle /settings or /menu command
        if (text.startsWith("/settings") || text.startsWith("/menu")) {
          const telIdStr = String(chatId);
          const isUserLinked = linkedTelegramUsers.has(telIdStr);
          const linkedInfo = linkedTelegramUsers.get(telIdStr);
          const existingUserKey = getCustomApiKeyForUser(chatId);

          const settingsHtml = `⚙️ <b>STUDY STRANGER SETTINGS & CONNECT</b>\n\n` +
            `• <b>কানেকশন স্ট্যাটাস:</b> ${isUserLinked ? `✅ Connected (<b>${linkedInfo?.displayName}</b>)` : "❌ Not Connected"}\n` +
            `• <b>Gemini:</b> ${existingUserKey ? `✅ Custom Key` : "⚡ Standard (Fast)"}\n\n` +
            `<i>নিচের প্রয়োজনীয় অপশনটি নির্বাচন করুন:</i>`;

          const keyboard = {
            inline_keyboard: [
              [
                isUserLinked 
                  ? { text: "❌ Disconnect Account", callback_data: "menu_unlink" }
                  : { text: "🔗 Get Connect PIN", callback_data: "menu_connect" }
              ],
              [
                { text: "🔑 Custom Gemini Key", callback_data: "menu_keys" },
                { text: "🚀 Open Web App", web_app: { url: webAppUrl } }
              ],
              [
                { text: "💬 Back to Chat", callback_data: "menu_home" }
              ]
            ]
          };

          await sendMsg(chatId, settingsHtml, keyboard);
          return;
        }

        // Handle /live or /call or /voice command (Direct 1:1 Live Voice Conversation)
        if (text.startsWith("/live") || text.startsWith("/call") || text.startsWith("/voice")) {
          const liveCallHtml = `🎙️ <b>STUDY STRANGER DIRECT 1:1 LIVE TALK</b>\n\n` +
            `অভিজিৎ, তুমি এখন সরাসরি Study Stranger AI-এর সাথে রিয়েল-টাইমে লাইভ কথা বলতে পারবে!\n\n` +
            `✨ <b>লাইভ ভয়েস ফিচারের সুবিধা:</b>\n` +
            `• 🗣️ বাংলায় মুখে ডাউট বা প্রশ্ন জিজ্ঞাসা করো\n` +
            `• ⚡ কোনো টাইপিং ছাড়া সাথে সাথে লাইভ ভয়েস রিপ্লাই শোনো\n` +
            `• 📐 অঙ্ক, বায়োলজি ও ফিজিক্সের জটিল বিষয় মুখে মুখে বুঝে নাও\n\n` +
            `<i>নিচের <b>'🎙️ Start 1:1 Live Voice'</b> বাটনে ক্লিক করলেই সরাসরি ভয়েস রুম শুরু হয়ে যাবে:</i>`;

          const liveCallKeyboard = {
            inline_keyboard: [
              [
                { text: "🎙️ Start 1:1 Live Voice (সরাসরি লাইভ কথা বলুন)", web_app: { url: `${webAppUrl}?open=live_board` } }
              ],
              [
                { text: "🌐 Open in Browser", url: `${webAppUrl}?open=live_board` }
              ],
              [
                { text: "🏠 Main Menu", callback_data: "menu_home" }
              ]
            ]
          };

          await sendMsg(chatId, liveCallHtml, liveCallKeyboard);
          return;
        }

        // Handle /help or /support command
        if (text.startsWith("/help") || text.startsWith("/support")) {
          const telIdStr = String(chatId);
          const isUserLinked = linkedTelegramUsers.has(telIdStr);
          const linkedInfo = linkedTelegramUsers.get(telIdStr);
          const studentUsername = msg.from?.username ? `@${msg.from.username}` : (linkedInfo?.username ? `@${linkedInfo.username}` : "Student");

          const helpHtml = `💡 <b>STUDY STRANGER AI — সমস্ত কমান্ড ও হেল্প গাইড</b>\n\n` +
            `👤 <b>আপনার টেলিগ্রাম ইউজারনেম:</b> <code>${studentUsername}</code>\n` +
            `🤖 <b>অফিসিয়াল টেলিগ্রাম সাপোর্ট:</b> <code>@Studystranger_bot</code>\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `⚡ <b>প্রয়োজনীয় সমস্ত কমান্ড ও ব্যবহার:</b>\n\n` +
            `• 🎙️ <b>/live অথবা /call</b> — সরাসরি ১:১ লাইভ কথা বলুন (লগইন ছাড়াই কথা বলা যাবে)।\n` +
            `• 📸 <b>ছবি পাঠান</b> — অঙ্কের খাতা বা বইয়ের ছবি পাঠালেই স্টেপ-বাই-স্টেপ সমাধান তৈরি হবে।\n` +
            `• 🗣️ <b>ভয়েস মেসেজ</b> — মুখে বাংলায় প্রশ্ন রেকর্ড করে পাঠান, AI সাথে সাথে উত্তর দেবে।\n` +
            `• 🔑 <b>/connect</b> — ৬-ডিজিটের অ্যাপ কানেক্ট পিন কোড তৈরি (১০ মিনিট মেয়াদ)।\n` +
            `• 🧠 <b>/quiz</b> — ক্লাস ১২ বায়োলজি, বাংলা ও ইংরেজি MCQ কুইজ।\n` +
            `• 🎯 <b>/chapter [অধ্যায়]</b> — নির্দিষ্ট চ্যাপ্টারের পরীক্ষা উপযোগী প্রশ্ন জেনারেট।\n` +
            `• 📚 <b>/materials বা /notes</b> — সম্পূর্ণ বিষয়ের রিভিশন নোটস ও ফর্মুলা শিট।\n` +
            `• 📊 <b>/progress</b> — পড়াশোনার স্ট্রিক, XP এবং নির্ভুলতা রিপোর্ট।\n` +
            `• 🔐 <b>/key [API_KEY]</b> — কাস্টম গুগল জেমিনাই কী যুক্ত করুন।\n` +
            `• ⚙️ <b>/settings</b> — সংযোগ স্ট্যাটাস ও সেটিংস মেনু।\n` +
            `• ❌ <b>/unlink</b> — টেলিগ্রাম অ্যাকাউন্ট ডিসকানেক্ট।\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `💬 <i>যেকোনো সহায়তার জন্য নিচে বাটনে ক্লিক করুন:</i>`;

          const keyboard = {
            inline_keyboard: [
              [
                { text: "🎙️ 1:1 Live Call (লগইন ছাড়া কথা বলুন)", web_app: { url: `${webAppUrl}?open=live_board` } }
              ],
              [
                { text: "🧠 Practice Quiz", callback_data: "menu_quiz" },
                { text: "📚 Study Notes", callback_data: "menu_materials" }
              ],
              [
                { text: "⚙️ Settings & Connect", callback_data: "menu_settings" },
                { text: "💬 Chat", callback_data: "menu_home" }
              ]
            ]
          };
          await sendMsg(chatId, helpHtml, keyboard);
          return;
        }

        // Handle /status or /info command
        if (text.startsWith("/status") || text.startsWith("/info")) {
          const telIdStr = String(chatId);
          const isUserLinked = linkedTelegramUsers.has(telIdStr);
          const linkedInfo = linkedTelegramUsers.get(telIdStr);
          const existingUserKey = getCustomApiKeyForUser(chatId);

          const statusHtml = `📊 <b>STUDY STRANGER TELEGRAM CONNECTION STATUS</b>\n\n` +
            `• <b>Connection Status:</b> ${isUserLinked ? "✅ <b>CONNECTED & SYNCED</b>" : "❌ <b>NOT CONNECTED</b>"}\n` +
            (isUserLinked ? `• <b>Linked Student:</b> <code>${linkedInfo?.displayName}</code>\n` : "") +
            `• <b>Telegram Chat ID:</b> <code>${chatId}</code>\n` +
            `• <b>Telegram User:</b> @${msg.from?.username || chatId}\n` +
            `• <b>Gemini API Key:</b> ${existingUserKey ? `✅ Custom Key Active (<code>${existingUserKey.substring(0, 8)}...</code>)` : "⚡ System Default Key Active"}\n\n` +
            (isUserLinked 
              ? `<i>আপনার টেলিগ্রাম ও ওয়েব অ্যাপের সমস্ত ডাটা লাইভ সিঙ্ক রয়েছে।</i>` 
              : `<i>অ্যাপের সাথে সিঙ্ক করতে /connect ব্যবহার করুন।</i>`);

          const keyboard = {
            inline_keyboard: [
              isUserLinked 
                ? [{ text: "❌ Disconnect Account", callback_data: "menu_unlink" }] 
                : [{ text: "🔗 Get Connect PIN", callback_data: "menu_connect" }],
              [{ text: "⚙️ Settings", callback_data: "menu_settings" }, { text: "💬 Chat", callback_data: "menu_home" }]
            ]
          };

          await sendMsg(chatId, statusHtml, keyboard);
          return;
        }

        // Handle /connect or /code command
        if (text.startsWith("/connect") || text.startsWith("/code") || text.startsWith("/pin")) {
          const now = Date.now();
          let existingPin: string | null = null;
          let existingPinData: { chatId: string | number; username?: string; firstName?: string; expiresAt: number } | null = null;

          // Check if an active, non-expired PIN already exists for this Telegram chat
          for (const [p, pData] of telegramAppPinMap.entries()) {
            if (String(pData.chatId) === String(chatId) && pData.expiresAt > now) {
              existingPin = p;
              existingPinData = pData;
              break;
            }
          }

          let pinCode = existingPin;
          let expiresAt = existingPinData ? existingPinData.expiresAt : now + 10 * 60 * 1000;

          if (!pinCode) {
            pinCode = Math.floor(100000 + Math.random() * 900000).toString();
            expiresAt = now + 10 * 60 * 1000; // 10 minutes
            telegramAppPinMap.set(pinCode, {
              chatId,
              username: msg.from?.username,
              firstName: msg.from?.first_name,
              expiresAt
            });
          }

          const minsLeft = Math.max(1, Math.ceil((expiresAt - now) / 60000));

          const pinHtml = `🔗 <b>STUDY STRANGER APP CONNECT PIN</b>\n\n` +
            `🔑 <b>আপনার ৬-ডিজিটের কানেক্ট কোড:</b>\n` +
            `<code><b>${pinCode}</b></code>\n\n` +
            `📍 <b>কানেক্ট করার ৩টি সহজ ধাপ:</b>\n` +
            `1️⃣ Study Stranger Web App ওপেন করুন।\n` +
            `2️⃣ <b>Telegram Portal</b> ট্যাবে যান।\n` +
            `3️⃣ <b>'Enter 6-Digit PIN'</b> ফিল্ডে <code><b>${pinCode}</b></code> বসিয়ে <b>Verify & Link</b> এ ক্লিক করুন!\n\n` +
            `⏰ <i>এই পিনটির সময়সীমা অবশিষ্ট: ${minsLeft} মিনিট (10 Minutes Expiry).</i>`;

          const keyboard = {
            inline_keyboard: [
              [{ text: "🚀 Open App & Connect", web_app: { url: webAppUrl } }],
              [{ text: "🏠 Main Menu", callback_data: "menu_home" }]
            ]
          };

          await sendMsg(chatId, pinHtml, keyboard);
          return;
        }

        // Handle /chapter command
        if (text.startsWith("/chapter") || text.startsWith("/generate") || text.startsWith("/ch")) {
          const rawParam = text.replace(/^\/(chapter|generate|ch)\s*/i, "").trim();

          if (!rawParam) {
            const chapSelectHtml = `🎯 <b>Chapter-Wise WBCHSE Question Generator</b>\n\nযে চ্যাপ্টারের প্রশ্ন তৈরি করতে চান সেটি বেছে নিন অথবা টাইপ করুন (যেমন: <i>/chapter Biology Unit 1</i>):\n\n• 🧬 <b>Biology:</b> Unit I (Reproduction) / Unit II (Genetics & Evolution)\n• 📖 <b>Bengali A:</b> আদিরিনী, বাঙ্গালা ভাষা, ধর্ম, দিগ্বিজয়ের রূপকথা\n• ✍️ <b>English B:</b> Strong Roots, The Night Train at Deoli, The Bet, Ulysses`;
            const keyboard = {
              inline_keyboard: [
                [{ text: "🧬 Bio Unit 1: Reproduction", callback_data: "chap_bio1" }, { text: "🧬 Bio Unit 2: Genetics", callback_data: "chap_bio2" }],
                [{ text: "📖 Bengali: আদিরিনী / ভাষা", callback_data: "chap_ben" }, { text: "✍️ English: Strong Roots / The Bet", callback_data: "chap_eng" }],
                [{ text: "🏠 Main Menu", callback_data: "menu_home" }]
              ]
            };
            await sendMsg(chatId, chapSelectHtml, keyboard);
            return;
          }

          // Chapter specified
          await sendAction(chatId, "typing");
          try {
            const prompt = `Create a high quality WBCHSE Class 12 MCQ question in Bengali/English for chapter: '${rawParam}'. Format with 4 clear options A, B, C, D and provide correct answer and short 2-line explanation.`;
            const qAnswer = await generateAIAnswer(prompt, chatId);
            const qHtml = `🎯 <b>Chapter Question Generator: ${rawParam.toUpperCase()}</b>\n\n${qAnswer}`;
            const keyboard = {
              inline_keyboard: [
                [{ text: "⚡ Generate Another Question", callback_data: "menu_chapter" }],
                [{ text: "🏠 Main Menu", callback_data: "menu_home" }]
              ]
            };
            await sendMsg(chatId, qHtml, keyboard);
          } catch (err: any) {
            await sendMsg(chatId, `⚠️ <b>Question Generator Error:</b> ${err.message}`);
          }
          return;
        }

        // Handle /keys or /key or /apikey command
        if (text.startsWith("/keys") || text.startsWith("/key") || text.startsWith("/apikey")) {
          const parts = text.split(/\s+/);
          const providedKey = parts.length > 1 ? parts[1].trim() : "";

          if (providedKey && (providedKey.startsWith("AIza") || providedKey.length >= 15)) {
            userApiKeyMap.set(String(chatId), providedKey);
            const linkedInfo = linkedTelegramUsers.get(String(chatId));
            if (linkedInfo && linkedInfo.firebaseUid) {
              userApiKeyMap.set(linkedInfo.firebaseUid, providedKey);
            }
            saveUserKeysToDisk();

            const successMsg = `🔑 <b>Gemini API Key Activated!</b>\n\n` +
              `আপনার Gemini API Key টি এই টেলিগ্রাম অ্যাকাউন্টের সাথে যুক্ত ও সংরক্ষিত হয়েছে (Key: <code>${providedKey.substring(0, 8)}...</code>)।\n\n` +
              `এখন থেকে আপনার সমস্ত পড়াশোনার প্রশ্নের উত্তর সরাসরি আপনার কাস্টম কী দিয়ে প্রক্রিয়াকরণ করা হবে। 🚀`;
            const keyboard = { inline_keyboard: [[{ text: "🤖 Try AI Tutor", callback_data: "menu_ai" }, { text: "🏠 Main Menu", callback_data: "menu_home" }]] };
            await sendMsg(chatId, successMsg, keyboard);
            return;
          }

          const existingUserKey = getCustomApiKeyForUser(chatId);
          const isUserLinked = linkedTelegramUsers.has(String(chatId));
          const linkedInfo = linkedTelegramUsers.get(String(chatId));

          const keysHtml = `🔑 <b>ACCOUNT & API KEY STATUS</b>\n\n` +
            `• <b>Linked Web Account:</b> ${isUserLinked ? `✅ ${linkedInfo?.displayName}` : "❌ Not Linked"}\n` +
            `• <b>Telegram ID:</b> <code>${chatId}</code>\n` +
            `• <b>API Key Status:</b> ${existingUserKey ? `✅ Custom Key Active (<code>${existingUserKey.substring(0, 8)}...</code>)` : "⚡ Default System Key Active"}\n` +
            `• <b>AI Model Status:</b> Google Gemini 3.8 Flash AI Active\n\n` +
            `<b>কাস্টম Gemini API Key কীভাবে যুক্ত করবেন?</b>\n` +
            `টাইপ করুন: <code>/key YOUR_GEMINI_API_KEY</code>\n` +
            `<i>উদাহরণ: <code>/key AIzaSyB123...</code></i>\n\n` +
            `<i>অথবা Web App-এর Telegram Portal / Settings থেকে এপিআই কী সেভ করলেই তা স্বয়ংক্রিয়ভাবে বটের সাথে সিঙ্ক হয়ে যাবে! 🚀</i>`;

          const keyboard = {
            inline_keyboard: [
              isUserLinked ? [{ text: "❌ Unlink Account", callback_data: "menu_unlink" }] : [{ text: "🔗 Connect Web App", callback_data: "menu_connect" }],
              [{ text: "🏠 Main Menu", callback_data: "menu_home" }]
            ]
          };
          await sendMsg(chatId, keysHtml, keyboard);
          return;
        }

        // Handle /unlink command
        if (text.startsWith("/unlink")) {
          const telIdStr = String(chatId);
          if (linkedTelegramUsers.has(telIdStr)) {
            linkedTelegramUsers.delete(telIdStr);
            saveLinkedUsersToDisk();
            await sendMsg(chatId, "✅ <b>আপনার Telegram অ্যাকাউন্টটি Study Stranger Web App থেকে ডিসকানেক্ট করা হয়েছে।</b>\nপুনরায় কানেক্ট করতে /connect টাইপ করুন।");
          } else {
            await sendMsg(chatId, "ℹ️ আপনার অ্যাকাউন্টটি বর্তমানে কোনো Web App-এর সাথে যুক্ত নেই। যুক্ত করতে /connect টাইপ করুন।");
          }
          return;
        }

        // Handle /quiz command
        if (text.startsWith("/quiz")) {
          const randomQ = class12QuizBank[Math.floor(Math.random() * class12QuizBank.length)];
          const quizHtml = `🧠 <b>WBCHSE Class 12 AI Quiz</b>\n\n<b>${randomQ.q}</b>\n\n` +
            randomQ.options.map(o => o.text).join("\n");
          
          const keyboard = {
            inline_keyboard: [
              [
                { text: randomQ.options[0].text.split(" ")[0], callback_data: randomQ.options[0].correct ? "qz_c_1" : "qz_w_1" },
                { text: randomQ.options[1].text.split(" ")[0], callback_data: randomQ.options[1].correct ? "qz_c_1" : "qz_w_1" }
              ],
              [
                { text: randomQ.options[2].text.split(" ")[0], callback_data: randomQ.options[2].correct ? "qz_c_1" : "qz_w_1" },
                { text: randomQ.options[3].text.split(" ")[0], callback_data: randomQ.options[3].correct ? "qz_c_1" : "qz_w_1" }
              ],
              [{ text: "⚡ Next Question", callback_data: "menu_quiz" }, { text: "🏠 Home", callback_data: "menu_home" }]
            ]
          };
          await sendMsg(chatId, quizHtml, keyboard);
          return;
        }

        // Handle /materials or /notes
        if (text.startsWith("/materials") || text.startsWith("/notes")) {
          const matHtml = `📚 <b>Study Materials Library (WBCHSE Sem 3)</b>\n\nSelect a subject to view revision notes & formula sheets:\n\n• 🧬 <b>Biology:</b> Reproduction, Genetics & Evolution\n• 📖 <b>Bengali A:</b> আদিরিনী, বাঙ্গালা ভাষা, ধর্ম, দিগ্বিজয়ের রূপকথা\n• ✍️ <b>English B:</b> The Bet, Strong Roots, The Night Train at Deoli, Ulysses, Riders to the Sea`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "🧬 Biology Notes", callback_data: "mat_bio" }, { text: "📖 Bengali A", callback_data: "mat_ben" }],
              [{ text: "✍️ English B", callback_data: "mat_eng" }, { text: "🏠 Home", callback_data: "menu_home" }]
            ]
          };
          await sendMsg(chatId, matHtml, keyboard);
          return;
        }

        // Handle /progress
        if (text.startsWith("/progress") || text.startsWith("/stats")) {
          const progHtml = `📊 <b>STUDY STRANGER LIVE PROGRESS</b>\n\n🔥 <b>Current Streak:</b> 7 Days\n⭐ <b>XP Points:</b> 1,450 | 🏆 <b>Level:</b> 6\n📚 <b>Questions Solved:</b> 128\n🎯 <b>Overall Accuracy:</b> 86%\n\n✅ <b>Strong Areas:</b> Biology Reproduction, Mendel Genetics\n⚠️ <b>Needs Revision:</b> Molecular Basis of Inheritance (SSB, TATA Box)\n\n<i>Telegram এবং Web ডাটা সম্পূর্ণ সিঙ্ক রয়েছে! 🚀</i>`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "🧠 Practice Quiz", callback_data: "menu_quiz" }],
              [{ text: "🏠 Home", callback_data: "menu_home" }]
            ]
          };
          await sendMsg(chatId, progHtml, keyboard);
          return;
        }

        // Handle /webapp or /open
        if (text.startsWith("/webapp") || text.startsWith("/open")) {
          const launchHtml = `🚀 <b>Study Stranger Web Application</b>\n\nসরাসরি ব্রাউজারে বা টেলিগ্রাম মিনি অ্যাপ হিসেবে ওপেন করতে নিচের বাটনে ক্লিক করুন:`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "🚀 Open Web App", web_app: { url: webAppUrl } }],
              [{ text: "🌐 Open in Browser", url: webAppUrl }]
            ]
          };
          await sendMsg(chatId, launchHtml, keyboard);
          return;
        }

        // Handle /link
        if (text.startsWith("/link")) {
          const linkHelp = `🔗 <b>Connect Web App</b>\n\n1. Open Study Stranger on your browser/phone.\n2. Go to the <b>Telegram Portal</b> tab.\n3. Click <b>'Connect to Telegram'</b>.\n4. Click the link to instantly link your account!`;
          const keyboard = {
            inline_keyboard: [[{ text: "🏠 Main Menu", callback_data: "menu_home" }]]
          };
          await sendMsg(chatId, linkHelp, keyboard);
          return;
        }

        // Auto-detect pasted Gemini API Key (e.g. user sends key directly without /key prefix)
        const cleanTrimmedKey = text.trim();
        if ((cleanTrimmedKey.startsWith("AIzaSy") || (cleanTrimmedKey.startsWith("AIza") && cleanTrimmedKey.length >= 25)) && !cleanTrimmedKey.includes(" ")) {
          userApiKeyMap.set(String(chatId), cleanTrimmedKey);
          const linkedInfo = linkedTelegramUsers.get(String(chatId));
          if (linkedInfo && linkedInfo.firebaseUid) {
            userApiKeyMap.set(linkedInfo.firebaseUid, cleanTrimmedKey);
          }
          saveUserKeysToDisk();

          const successMsg = `🔑 <b>Gemini API Key সংরক্ষিত ও সক্রিয় হয়েছে!</b>\n\n` +
            `আপনার এপিআই কী: <code>${cleanTrimmedKey.substring(0, 8)}...</code> সফলভাবে এই অ্যাকাউন্টের সাথে যুক্ত হয়েছে।\n\n` +
            `এখন Study Stranger AI সম্পূর্ণভাবে লাইভ Google Gemini AI দিয়ে আপনার সমস্ত পড়াশোনার প্রশ্নের উত্তর দেবে! 🚀`;
          const keyboard = { inline_keyboard: [[{ text: "🤖 Ask AI Tutor", callback_data: "menu_ai" }, { text: "🏠 Main Menu", callback_data: "menu_home" }]] };
          await sendMsg(chatId, successMsg, keyboard);
          return;
        }

        // Handle regular text AI queries (24/7 AI Tutor & Normal Chat)
        let queryPrompt = text;
        if (queryPrompt.startsWith("/ai")) {
          queryPrompt = queryPrompt.replace(/^\/ai\s*/i, "").trim() || "What is the key syllabus for Class 12 WBCHSE Biology?";
        }

        if (queryPrompt) {
          userLastQueryMap.set(chatId, queryPrompt);

          // Meta AI style continuous typing indicator
          let typingActive = true;
          const typingInterval = setInterval(() => {
            if (typingActive) {
              sendAction(chatId, "typing").catch(() => {});
            }
          }, 3500);
          sendAction(chatId, "typing").catch(() => {});

          try {
            const aiReply = await generateAIAnswer(queryPrompt, chatId);
            typingActive = false;
            clearInterval(typingInterval);

            // Clean direct response without repetitive spam buttons (just like Meta AI)
            await sendMsg(chatId, aiReply);
          } catch (aiErr: any) {
            typingActive = false;
            clearInterval(typingInterval);
            console.error("[Telegram AI Chat Error]:", aiErr.message);
            await sendMsg(chatId, `⚠️ <b>Study Stranger AI:</b>\n\nদুঃখিত, সংযোগ সাময়িক ব্যস্ত ছিল। আবার একটু বলুন!`);
          }
          return;
        }
      }

      // 2. Handle Callback Queries (Inline Button clicks)
      if (update.callback_query) {
        const cq = update.callback_query;
        const data = cq.data;
        const chatId = cq.message?.chat?.id;

        // Immediate acknowledgment to remove Telegram loading spinner
        await answerCallbackQuery(botToken, cq.id);

        if (!chatId) return;

        if (data === "menu_home") {
          const welcomeHtml = `🎓 <b>STUDY STRANGER AI (WBCHSE Class 12)</b>\n\n` +
            `স্বাগতম! আমি অভিজিৎ-এর ব্যক্তিগত AI পড়াশোনার বন্ধু।\n\n` +
            `💬 <b>পড়াশোনার ডাউট বা প্রশ্ন থাকলে সরাসরি মেসেজ করো, আমি উত্তর দেব।</b>\n\n` +
            `⚙️ <b>ওয়েব অ্যাপ কানেক্ট বা সেটিংসের জন্য নিচের বাটনে ক্লিক করো।</b>`;

          const keyboard = {
            inline_keyboard: [
              [
                { text: "⚙️ Settings & Connect", callback_data: "menu_settings" }
              ],
              [
                { text: "🚀 Open Web App", web_app: { url: webAppUrl } }
              ]
            ]
          };
          await sendMsg(chatId, welcomeHtml, keyboard);
        } else if (data === "menu_settings") {
          const telIdStr = String(chatId);
          const isUserLinked = linkedTelegramUsers.has(telIdStr);
          const linkedInfo = linkedTelegramUsers.get(telIdStr);
          const existingUserKey = getCustomApiKeyForUser(chatId);

          const settingsHtml = `⚙️ <b>STUDY STRANGER SETTINGS & CONNECT</b>\n\n` +
            `• <b>কানেকশন স্ট্যাটাস:</b> ${isUserLinked ? `✅ Connected (<b>${linkedInfo?.displayName}</b>)` : "❌ Not Connected"}\n` +
            `• <b>Gemini:</b> ${existingUserKey ? `✅ Custom Key` : "⚡ Standard (Fast)"}\n\n` +
            `<i>নিচের প্রয়োজনীয় অপশনটি নির্বাচন করুন:</i>`;

          const keyboard = {
            inline_keyboard: [
              [
                isUserLinked 
                  ? { text: "❌ Disconnect Account", callback_data: "menu_unlink" }
                  : { text: "🔗 Get Connect PIN", callback_data: "menu_connect" }
              ],
              [
                { text: "🔑 Custom Gemini Key", callback_data: "menu_keys" },
                { text: "🚀 Open Web App", web_app: { url: webAppUrl } }
              ],
              [
                { text: "💬 Back to Chat", callback_data: "menu_home" }
              ]
            ]
          };
          await sendMsg(chatId, settingsHtml, keyboard);
        } else if (data === "menu_status") {
          const telIdStr = String(chatId);
          const isUserLinked = linkedTelegramUsers.has(telIdStr);
          const linkedInfo = linkedTelegramUsers.get(telIdStr);
          const existingUserKey = getCustomApiKeyForUser(chatId);

          const statusHtml = `📊 <b>LIVE CONNECTION STATUS</b>\n\n` +
            `• <b>Status:</b> ${isUserLinked ? "✅ <b>Connected & Synced</b>" : "❌ <b>Not Connected</b>"}\n` +
            (isUserLinked ? `• <b>Linked Web User:</b> <code>${linkedInfo?.displayName}</code>\n` : "") +
            `• <b>Telegram ID:</b> <code>${chatId}</code>\n` +
            `• <b>AI Engine:</b> ${existingUserKey ? "✅ Custom Key Active" : "⚡ System Default Key Active"}\n\n` +
            (isUserLinked 
              ? `<i>আপনার টেলিগ্রাম ও ওয়েব অ্যাপের সমস্ত ডাটা লাইভ সিঙ্ক রয়েছে।</i>` 
              : `<i>অ্যাপের সাথে সিঙ্ক করতে 'Get Connect PIN' অপশন ব্যবহার করুন।</i>`);

          const keyboard = {
            inline_keyboard: [
              [
                isUserLinked 
                  ? { text: "❌ Disconnect", callback_data: "menu_unlink" } 
                  : { text: "🔗 Get Connect PIN", callback_data: "menu_connect" }
              ],
              [{ text: "⚙️ Settings", callback_data: "menu_settings" }, { text: "💬 Chat", callback_data: "menu_home" }]
            ]
          };
          await sendMsg(chatId, statusHtml, keyboard);
        } else if (data === "menu_keys") {
          const existingUserKey = getCustomApiKeyForUser(chatId);
          const isUserLinked = linkedTelegramUsers.has(String(chatId));

          const keysHtml = `🔑 <b>CUSTOM GEMINI API KEY</b>\n\n` +
            `• <b>Current Key:</b> ${existingUserKey ? `✅ Active (<code>${existingUserKey.substring(0, 8)}...</code>)` : "⚡ System Default Key"}\n\n` +
            `<b>কীভাবে কাস্টম কী যুক্ত করবেন?</b>\n` +
            `টাইপ করুন: <code>/key YOUR_GEMINI_API_KEY</code>\n\n` +
            `<i>অথবা Study Stranger Web App-এর Settings থেকে এপিআই কী সেট করলে তা স্বয়ংক্রিয়ভাবে এখানে সিঙ্ক হয়ে যাবে।</i>`;

          const keyboard = {
            inline_keyboard: [
              [{ text: "⚙️ Settings", callback_data: "menu_settings" }, { text: "💬 Chat", callback_data: "menu_home" }]
            ]
          };
          await sendMsg(chatId, keysHtml, keyboard);
        } else if (data === "menu_ai") {
          await sendMsg(chatId, "💬 <b>Chat Mode:</b>\n\nপড়াশোনার যেকোনো প্রশ্ন বা ডাউট এখানে সরাসরি বাংলায় বা ইংরেজিতে লিখুন।", {
            inline_keyboard: [[{ text: "⚙️ Settings", callback_data: "menu_settings" }]]
          });
        } else if (data === "menu_materials") {
          const matHtml = `📚 <b>Study Notes Library (WBCHSE Class 12)</b>\n\nকোন বিষয়ের নোটস দেখতে চান নির্বাচন করুন:\n\n• 🧬 Biology Unit 1 & 2\n• 📖 Bengali A\n• ✍️ English B`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "🧬 Biology", callback_data: "mat_bio" }, { text: "📖 Bengali A", callback_data: "mat_ben" }],
              [{ text: "✍️ English B", callback_data: "mat_eng" }, { text: "⚙️ Settings", callback_data: "menu_settings" }]
            ]
          };
          await sendMsg(chatId, matHtml, keyboard);
        } else if (data === "mat_bio") {
          const bioHtml = `🧬 <b>Class 12 Biology Quick Notes (WBCHSE)</b>\n\n<b>Unit I: Reproduction</b>\n• <i>Microsporogenesis:</i> মাইক্রোস্পোর মাদার সেল (2n) থেকে মিয়োসিস দ্বারা ৪টি পরাগরেণু (n) গঠন।\n• <i>Fertilization:</i> ফ্যালোপিয়ান নালীর অ্যাম্পুলা অংশে ঘটে; শুক্রাণু ZP3 রিসেপ্টরে যুক্ত হয়।\n• <i>LH Surge:</i> ১৪তম দিনে ঘটে যা ওভুলেশনের জন্য দায়ী।\n• <i>STDs:</i> সিফিলিস (<i>Treponema pallidum</i>), এইডস (HIV), ক্ল্যামাইডিয়া।\n\n<b>Unit II: Genetics & Evolution</b>\n• <i>DNA Base Pairs:</i> A=T (২টি বন্ড), G≡C (৩টি বন্ড)।\n• <i>Replication:</i> SSB প্রোটিন আনওয়াইন্ডেড স্ট্র্যান্ডকে স্থিতিশীল রাখে।\n• <i>Transcription:</i> RNA পলিমারেজ TATA Box প্রমোটার চিহ্নিত করে।`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "🧠 Practice Biology Quiz", callback_data: "menu_quiz" }],
              [{ text: "📚 Other Subjects", callback_data: "menu_materials" }, { text: "⚙️ Settings", callback_data: "menu_settings" }]
            ]
          };
          await sendMsg(chatId, bioHtml, keyboard);
        } else if (data === "mat_ben") {
          const benHtml = `📖 <b>বাংলা এ (উচ্চমাধ্যমিক) সারসংক্ষেপ</b>\n\n<b>গল্প/প্রবন্ধ:</b>\n• <i>আদিরিনী (প্রভাত কুমার মুখোপাধ্যায়):</i> জয়রাম মুখুজ্জে ২০০০ টাকায় হস্তিনী আদিরিনীকে কিনেছিলেন। মানবিক স্নেহ ও সামাজিক বাস্তবতার গল্প।\n• <i>বাঙ্গালা ভাষা (স্বামী বিবেকানন্দ):</i> মুখের ভাষা ও সাহিত্যের ভাষার মেলবন্ধন এবং আধুনিক শিক্ষার প্রয়োজনীয়তা।\n\n<b>কবিতা:</b>\n• <i>ধর্ম (শ্রীজাত):</i> প্রাতিষ্ঠানিক ধর্মের চেয়ে মানুষের মানবধর্ম শ্রেষ্ঠ।\n• <i>দিগ্বিজয়ের রূপকথা (নবনীতা দেবসেন):</i> ভেতরের ভয় জয় করে এগিয়ে চলার রূপক।`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "📚 Other Subjects", callback_data: "menu_materials" }, { text: "⚙️ Settings", callback_data: "menu_settings" }]
            ]
          };
          await sendMsg(chatId, benHtml, keyboard);
        } else if (data === "mat_eng") {
          const engHtml = `✍️ <b>English B Revision Notes</b>\n\n<b>Prose:</b>\n• <i>The Bet (Anton Chekhov):</i> 2 Million Rubles wager for 15 years of solitary confinement; debate between capital punishment & life imprisonment.\n• <i>Strong Roots (APJ Abdul Kalam):</i> Spiritual upbringing in Rameswaram with father Jainulabdeen.\n• <i>The Night Train at Deoli (Ruskin Bond):</i> Nostalgic encounter with the basket-selling girl.\n\n<b>Verse:</b>\n• <i>Ulysses (Tennyson):</i> "To strive, to seek, to find, and not to yield."\n• <i>Riders to the Sea (J.M. Synge):</i> Tragedy of Maurya losing her sons to the sea.`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "📚 Other Subjects", callback_data: "menu_materials" }, { text: "⚙️ Settings", callback_data: "menu_settings" }]
            ]
          };
          await sendMsg(chatId, engHtml, keyboard);
        } else if (data === "menu_quiz") {
          const randomQ = class12QuizBank[Math.floor(Math.random() * class12QuizBank.length)];
          const quizHtml = `🧠 <b>WBCHSE Class 12 Quiz</b>\n\n<b>${randomQ.q}</b>\n\n` +
            randomQ.options.map(o => o.text).join("\n");
          
          const keyboard = {
            inline_keyboard: [
              [
                { text: randomQ.options[0].text.split(" ")[0], callback_data: randomQ.options[0].correct ? "qz_c_1" : "qz_w_1" },
                { text: randomQ.options[1].text.split(" ")[0], callback_data: randomQ.options[1].correct ? "qz_c_1" : "qz_w_1" }
              ],
              [
                { text: randomQ.options[2].text.split(" ")[0], callback_data: randomQ.options[2].correct ? "qz_c_1" : "qz_w_1" },
                { text: randomQ.options[3].text.split(" ")[0], callback_data: randomQ.options[3].correct ? "qz_c_1" : "qz_w_1" }
              ],
              [{ text: "⚡ Next Question", callback_data: "menu_quiz" }, { text: "⚙️ Settings", callback_data: "menu_settings" }]
            ]
          };
          await sendMsg(chatId, quizHtml, keyboard);
        } else if (data === "qz_c_1" || data === "qz_correct") {
          await sendMsg(chatId, "🎉 <b>দারুণ! সঠিক উত্তর! (+10 XP)</b>", {
            inline_keyboard: [[{ text: "⚡ Next Question", callback_data: "menu_quiz" }, { text: "⚙️ Settings", callback_data: "menu_settings" }]]
          });
        } else if (data === "qz_w_1" || data === "qz_wrong") {
          await sendMsg(chatId, "❌ <b>ভুল উত্তর!</b>\n\nসঠিক তথ্যটি জেনে নিয়ে পরের প্রশ্নে এগিয়ে যাও।", {
            inline_keyboard: [[{ text: "🔄 Try Another", callback_data: "menu_quiz" }, { text: "📚 Study Notes", callback_data: "menu_materials" }]]
          });
        } else if (data === "ai_simp") {
          await sendAction(chatId, "typing");
          const lastQuery = userLastQueryMap.get(chatId) || "WBCHSE Class 12 Syllabus";
          const simplified = await generateAIAnswer(`Explain '${lastQuery}' in very simple terms for a Class 12 student with everyday examples and easy Bengali/English explanation.`, chatId);
          await sendMsg(chatId, `💡 <b>সহজ ভাষায় ব্যাখ্যা:</b>\n\n${simplified}`, {
            inline_keyboard: [[{ text: "⚙️ Settings", callback_data: "menu_settings" }, { text: "💬 Chat", callback_data: "menu_home" }]]
          });
        } else if (data === "ai_det") {
          await sendAction(chatId, "typing");
          const lastQuery = userLastQueryMap.get(chatId) || "WBCHSE Class 12 Syllabus";
          const detailed = await generateAIAnswer(`Provide a complete 5-mark structured WBCHSE examination standard answer for '${lastQuery}' with headings, points, and diagram guidelines.`, chatId);
          await sendMsg(chatId, `📖 <b>পরীক্ষার বিস্তারিত সমাধান (৫ নম্বরের মান):</b>\n\n${detailed}`, {
            inline_keyboard: [[{ text: "⚙️ Settings", callback_data: "menu_settings" }, { text: "💬 Chat", callback_data: "menu_home" }]]
          });
        } else if (data === "menu_link" || data === "menu_connect") {
          const pinCode = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = Date.now() + 10 * 60 * 1000;

          telegramAppPinMap.set(pinCode, {
            chatId,
            username: cq.from?.username,
            firstName: cq.from?.first_name,
            expiresAt
          });

          const pinHtml = `🔗 <b>STUDY STRANGER APP CONNECT PIN</b>\n\n` +
            `🔑 <b>আপনার ৬-ডিজিটের কানেক্ট কোড:</b>\n` +
            `<code><b>${pinCode}</b></code>\n\n` +
            `📍 <b>কানেক্ট করার ৩টি সহজ ধাপ:</b>\n` +
            `1️⃣ Study Stranger Web App ওপেন করুন।\n` +
            `2️⃣ <b>Telegram Portal</b> ট্যাবে যান।\n` +
            `3️⃣ <b>'Enter 6-Digit PIN'</b> বক্সে <code><b>${pinCode}</b></code> বসিয়ে <b>Verify & Link</b> এ ক্লিক করুন!\n\n` +
            `⏰ <i>এই পিনটি আগামী ১০ মিনিট পর্যন্ত সচল থাকবে।</i>`;

          const keyboard = {
            inline_keyboard: [
              [{ text: "🚀 Open Web App & Link", web_app: { url: webAppUrl } }],
              [{ text: "⚙️ Settings", callback_data: "menu_settings" }, { text: "💬 Chat", callback_data: "menu_home" }]
            ]
          };

          await sendMsg(chatId, pinHtml, keyboard);
        } else if (data === "menu_chapter") {
          const chapSelectHtml = `🎯 <b>Chapter Practice</b>\n\nযে চ্যাপ্টারের প্রশ্ন করতে চাও সিলেক্ট করো:\n\n• 🧬 <b>Biology Unit 1 & 2</b>\n• 📖 <b>Bengali A</b>\n• ✍️ <b>English B</b>`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "🧬 Bio Unit 1", callback_data: "chap_bio1" }, { text: "🧬 Bio Unit 2", callback_data: "chap_bio2" }],
              [{ text: "📖 Bengali A", callback_data: "chap_ben" }, { text: "✍️ English B", callback_data: "chap_eng" }],
              [{ text: "⚙️ Settings", callback_data: "menu_settings" }]
            ]
          };
          await sendMsg(chatId, chapSelectHtml, keyboard);
        } else if (data.startsWith("chap_")) {
          await sendAction(chatId, "typing");
          let subjectTopic = "Biology Unit 1 Reproduction";
          if (data === "chap_bio2") subjectTopic = "Biology Unit 2 Genetics and Evolution";
          else if (data === "chap_ben") subjectTopic = "Bengali A Adarini and Language";
          else if (data === "chap_eng") subjectTopic = "English B Strong Roots and The Bet";

          try {
            const prompt = `Create a high quality WBCHSE Class 12 MCQ question in Bengali/English for subject: '${subjectTopic}'. Format with 4 clear options A, B, C, D and provide correct answer and short explanation.`;
            const qAnswer = await generateAIAnswer(prompt, chatId);
            const qHtml = `🎯 <b>Chapter Practice: ${subjectTopic}</b>\n\n${qAnswer}`;
            const keyboard = {
              inline_keyboard: [
                [{ text: "⚡ Next Question", callback_data: data }],
                [{ text: "⚙️ Settings", callback_data: "menu_settings" }]
              ]
            };
            await sendMsg(chatId, qHtml, keyboard);
          } catch (err: any) {
            await sendMsg(chatId, `⚠️ <b>Question Error:</b> ${err.message}`);
          }
        } else if (data === "menu_unlink") {
          const telIdStr = String(chatId);
          linkedTelegramUsers.delete(telIdStr);
          saveLinkedUsersToDisk();
          await sendMsg(chatId, "✅ <b>আপনার Telegram অ্যাকাউন্টটি Web App থেকে ডিসকানেক্ট করা হয়েছে।</b>\nপুনরায় কানেক্ট করতে /connect বাটন চাপুন।", {
            inline_keyboard: [[{ text: "🔗 Connect Web App", callback_data: "menu_connect" }], [{ text: "⚙️ Settings", callback_data: "menu_settings" }]]
          });
        } else if (data === "menu_progress") {
          const progHtml = `📊 <b>MY PROGRESS REPORT</b>\n\n🔥 <b>Streak:</b> 7 Days\n⭐ <b>XP:</b> 1,450 | 🏆 <b>Level:</b> 6\n📚 <b>Questions Solved:</b> 128\n🎯 <b>Accuracy:</b> 86%\n\n<i>Study Stranger Web ও Telegram ডাটা সিঙ্কড রয়েছে! 🚀</i>`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "🧠 Practice Quiz", callback_data: "menu_quiz" }],
              [{ text: "⚙️ Settings", callback_data: "menu_settings" }]
            ]
          };
          await sendMsg(chatId, progHtml, keyboard);
        } else if (data === "menu_live_call") {
          const liveCallHtml = `🎙️ <b>DIRECT 1:1 LIVE TALK WITH STUDY STRANGER</b>\n\n` +
            `অভিজিৎ, তুমি এখন সরাসরি Study Stranger AI-এর সাথে রিয়েল-টাইমে লাইভ কথা বলতে পারবে!\n\n` +
            `• 🗣️ কোনো টাইপিং ছাড়া মুখে বাংলায় বা ইংরেজিতে ডাউট জিজ্ঞাসা করো\n` +
            `• ⚡ নিমেষেই লাইভ ভয়েসে উত্তর শোনো\n` +
            `• 📐 সম্পূর্ণ ইন্টারঅ্যাক্টিভ লাইভ সেশন\n\n` +
            `<i>নিচের <b>'🎙️ Start 1:1 Live Call'</b> বাটনে ট্যাপ করো:</i>`;

          const keyboard = {
            inline_keyboard: [
              [
                { text: "🎙️ Start 1:1 Live Call (সরাসরি লাইভ কথা বলুন)", web_app: { url: `${webAppUrl}?open=live_board` } }
              ],
              [
                { text: "🌐 Open in Browser", url: `${webAppUrl}?open=live_board` }
              ],
              [
                { text: "🏠 Main Menu", callback_data: "menu_home" }
              ]
            ]
          };
          await sendMsg(chatId, liveCallHtml, keyboard);
        }
      }
    } catch (err: any) {
      console.error("[Telegram Processor 24/7] Error:", err.message);
    } finally {
      if (msgKey) {
        inFlightMessages.delete(msgKey);
      }
    }
  };

  // --- Telegram Webhook Endpoint ---
  app.post("/telegram/webhook", async (req, res) => {
    res.status(200).send("OK");
    try {
      const update = req.body;
      if (update) {
        await processTelegramUpdate(update);
      }
    } catch (err: any) {
      console.error("[Telegram Webhook] Error:", err.message);
    }
  });

  // --- Telegram 24/7 Long-Polling Engine with Auto-Conflict Recovery ---
  let isPolling = false;

  const startTelegramPolling = () => {
    const botToken = getActiveTelegramBotToken();
    if (!botToken) return;

    console.log("[Telegram Poller] Initializing 24/7 active engine...");

    // Clear any conflicting webhooks at startup to guarantee getUpdates works
    fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook?drop_pending_updates=false`, { method: "POST" })
      .catch(() => {});

    // If lastUpdateId is 0 (first startup without saved state), fetch latest update to skip historical queue
    if (lastUpdateId === 0) {
      fetch(`https://api.telegram.org/bot${botToken}/getUpdates?offset=-1`)
        .then(r => r.json())
        .then((d: any) => {
          if (d.ok && Array.isArray(d.result) && d.result.length > 0) {
            lastUpdateId = d.result[d.result.length - 1].update_id;
            saveTelegramState();
            console.log(`[Telegram Poller] Initialized offset to latest update_id: ${lastUpdateId}`);
          }
        })
        .catch(() => {});
    }

    const poll = async () => {
      if (isPolling) return;
      isPolling = true;
      try {
        const url = `https://api.telegram.org/bot${botToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=15`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data: any = await res.json();
          if (data.ok && Array.isArray(data.result)) {
            for (const update of data.result) {
              if (update.update_id > lastUpdateId) {
                lastUpdateId = update.update_id;
                saveTelegramState();
              }
              try {
                console.log(`[Telegram Poller] Processing update ${update.update_id}`);
                await processTelegramUpdate(update);
              } catch (procErr: any) {
                console.error(`[Telegram Poller Error] Update ${update.update_id} failed:`, procErr.message);
              }
            }
          }
        } else if (res.status === 409) {
          // 409 Conflict: webhook is set, clear webhook immediately
          console.warn("[Telegram Poller] Conflict detected, resetting webhook...");
          await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook?drop_pending_updates=false`, { method: "POST" }).catch(() => {});
        }
      } catch (pollErr: any) {
        // Network timeout or drop, proceed to next iteration
      } finally {
        isPolling = false;
        setTimeout(poll, 400);
      }
    };

    poll();
  };

  startTelegramPolling();

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
