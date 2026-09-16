import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({ apiKey });
};

const enhanceDesc = async (description: string) => {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: `
Rewrite this project description to make it clear, professional, and suitable for a developer portfolio.
Correct grammar and improve readability without changing the meaning or adding new information.
Return only the improved description.

Description:
${description}
`.trim(),
  });

  const enhancedDescription = response.text?.trim();

  if (!enhancedDescription) {
    throw new Error("Gemini returned an empty response");
  }

  return enhancedDescription;
};

export { enhanceDesc };
