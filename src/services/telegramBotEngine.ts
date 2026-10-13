import { GoogleGenAI } from "@google/genai";
import { TelegramFormatter } from "./telegramFormatter";
import { getTranslation } from "./telegramI18n";
import { TelegramLanguage } from "../types/telegram";

export class TelegramBotEngine {
  private botToken: string;
  private geminiKey: string;

  constructor(botToken?: string, geminiKey?: string) {
    this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN || "";
    this.geminiKey = geminiKey || process.env.GEMINI_API_KEY || "";
  }

  /**
   * Helper to send raw Telegram Bot API HTTP requests
   */
  public async sendTelegramRequest(method: string, payload: any): Promise<any> {
    if (!this.botToken) {
      console.warn(`[TelegramBotEngine] TELEGRAM_BOT_TOKEN is not set. Mocking response for ${method}`);
      return { ok: true, result: { message_id: Date.now() }, mocked: true };
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      console.error(`[TelegramBotEngine] Error in ${method}:`, err);
      throw err;
    }
  }

  /**
   * Send Main Start Menu
   */
  public async sendMainMenu(chatId: string | number, lang: TelegramLanguage = "bn") {
    const t = getTranslation(lang);
    const text = `🎓 <b>${t.welcomeTitle}</b>\n\n${t.welcomeSubtitle}\n\n<i>Select an option below to get started:</i>`;
    
    const inline_keyboard = [
      [
        { text: t.btnAiTutor, callback_data: "menu_ai" },
        { text: t.btnPhotoSolve, callback_data: "menu_photo" }
      ],
      [
        { text: t.btnMaterials, callback_data: "menu_materials" },
        { text: t.btnPractice, callback_data: "menu_practice" }
      ],
      [
        { text: t.btnQuiz, callback_data: "menu_quiz" },
        { text: t.btnProgress, callback_data: "menu_progress" }
      ],
      [
        { text: t.btnPlanner, callback_data: "menu_planner" },
        { text: t.btnSaved, callback_data: "menu_saved" }
      ],
      [
        { text: t.btnLanguage, callback_data: "menu_lang" },
        { text: t.btnConnectWeb, callback_data: "menu_link" },
        { text: t.btnSettings, callback_data: "menu_settings" }
      ]
    ];

    return this.sendTelegramRequest("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard }
    });
  }

  /**
   * Answer user query with Gemini AI
   */
  public async processAiQuery(prompt: string, mode: "normal" | "simple" | "detailed" | "exam" = "normal", lang: TelegramLanguage = "bn"): Promise<string> {
    if (!this.geminiKey) {
      return "⚠️ <i>Gemini API Key is not configured on the server. Please check settings.</i>";
    }

    try {
      const ai = new GoogleGenAI({ apiKey: this.geminiKey });
      
      let systemInstruction = `You are "Study Stranger AI", a top-tier academic mentor specialized in WBCHSE Class 12 (Biology, Bengali A, English B, Physics, Chemistry) and Competitive Exams.
Language preference: ${lang === 'bn' ? 'Bengali (বাংলিশ/বাংলা)' : lang === 'hi' ? 'Hindi' : 'English'}.
Style mode: ${mode}.
- If simple: Explain like I am 12 years old with crisp analogies.
- If detailed: Provide comprehensive step-by-step concepts.
- If exam: Provide high-scoring structured points with key definitions and keywords.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.6
        }
      });

      return TelegramFormatter.toTelegramHtml(response.text || "No answer generated.");
    } catch (err: any) {
      console.error("[TelegramBotEngine] Gemini error:", err);
      return `⚠️ <i>AI is temporarily unavailable: ${err.message || 'Unknown error'}. Please try again in a few moments.</i>`;
    }
  }
}
