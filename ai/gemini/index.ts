import { GoogleGenerativeAI } from '@google/generative-ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject, type ModelMessage } from 'ai';
import { AI_MODELS } from '../config';
import type { AiClient, AiOptions, AiTier } from '../types';

export type { AiClient, AiOptions, AiTier } from '../types';

export function geminiClient(apiKey: string, defaultTier: AiTier = 'balanced'): AiClient {
  const genAI = new GoogleGenerativeAI(apiKey);
  // 構造化抽出（completeWithDocumentStructured）専用の AI SDK プロバイダー。
  // 既存の complete / completeWithImage は @google/generative-ai のまま据え置く。
  const sdkProvider = createGoogleGenerativeAI({ apiKey });

  function resolveModelId(options?: AiOptions): string {
    return AI_MODELS.gemini[options?.tier ?? defaultTier];
  }

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

    async completeWithDocumentStructured(prompt, data, mimeType, schema, options) {
      const messages: ModelMessage[] = [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'file', data, mediaType: mimeType },
          ],
        },
      ];
      const { object } = await generateObject({
        model: sdkProvider(resolveModelId(options)),
        schema,
        messages,
        ...(options?.systemPrompt !== undefined && { system: options.systemPrompt }),
        ...(options?.maxTokens !== undefined && { maxOutputTokens: options.maxTokens }),
        ...(options?.temperature !== undefined && { temperature: options.temperature }),
      });
      return object;
    },
  };
}
