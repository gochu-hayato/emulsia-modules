import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_MODELS } from '../config';
import type { AiClient, AiOptions, AiTier } from '../types';

export type { AiClient, AiOptions, AiTier } from '../types';

export function geminiClient(apiKey: string, defaultTier: AiTier = 'balanced'): AiClient {
  const genAI = new GoogleGenerativeAI(apiKey);

  function getModel(options?: AiOptions) {
    return genAI.getGenerativeModel({
      model: AI_MODELS.gemini[options?.tier ?? defaultTier],
      ...(options?.systemPrompt ? { systemInstruction: options.systemPrompt } : {}),
      generationConfig: {
        ...(options?.maxTokens !== undefined ? { maxOutputTokens: options.maxTokens } : {}),
        ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
      },
    });
  }

  return {
    async complete(prompt, options) {
      const result = await getModel(options).generateContent(prompt);
      return result.response.text();
    },

    async completeWithImage(prompt, imageBase64, mimeType, options) {
      const result = await getModel(options).generateContent([
        { text: prompt },
        { inlineData: { data: imageBase64, mimeType } },
      ]);
      return result.response.text();
    },
  };
}
