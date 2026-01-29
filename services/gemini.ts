
import { GoogleGenAI, Type } from "@google/genai";
import { Habit } from "../types";

export async function getHabitReflections(habits: Habit[]): Promise<any> {
  // Always create a new GoogleGenAI instance right before the call to ensure up-to-date configuration
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  // Format habit data for the prompt
  const habitSummary = habits.map(h => {
    const last7Days = Object.keys(h.completions)
      .sort()
      .slice(-7)
      .map(date => `${date}: ${h.completions[date] ? 'Done' : 'Missed'}`);
    return {
      name: h.name,
      frequency: h.frequency,
      recentHistory: last7Days
    };
  });

  const prompt = `Act as a minimalist habit coach. Analyze the following habit data for the past week:
  ${JSON.stringify(habitSummary)}
  
  Provide a concise reflection on progress, one actionable improvement tip, and a short motivational phrase.
  Be encouraging but practical.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reflection: { type: Type.STRING, description: "A concise summary of recent progress." },
            improvementTip: { type: Type.STRING, description: "One specific tip to improve consistency." },
            motivation: { type: Type.STRING, description: "A short, punchy motivational phrase." }
          },
          required: ["reflection", "improvementTip", "motivation"]
        }
      }
    });

    // Access .text property directly as it is a getter (not a method) in @google/genai
    const jsonStr = response.text;
    if (!jsonStr) {
      throw new Error("Empty response from AI");
    }
    
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      reflection: "You've been active this week. Keep showing up!",
      improvementTip: "Try to complete your most important habit first thing in the morning.",
      motivation: "Every day is a new opportunity."
    };
  }
}
