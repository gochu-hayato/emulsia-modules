import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AiClient, AiOptions } from '../types';

export type { AiClient, AiOptions } from '../types';

export function geminiClient(apiKey: string): AiClient {
  const genAI = new GoogleGenerativeAI(apiKey);

  return {
    async chat(userMessage: string, options?: AiOptions): Promise<string> {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: options?.systemPrompt,
        generationConfig: {
          maxOutputTokens: options?.maxTokens,
          temperature: options?.temperature,
        },
      });

      const result = await model.generateContent(userMessage);
      return result.response.text();
    },
  };
}
