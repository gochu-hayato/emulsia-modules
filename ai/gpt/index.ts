import OpenAI from 'openai';
import { AI_MODELS } from '../config';
import type { AiClient, AiOptions, AiTier } from '../types';

export type { AiClient, AiOptions, AiTier } from '../types';

export function gptClient(apiKey: string, defaultTier: AiTier = 'balanced'): AiClient {
  const client = new OpenAI({ apiKey });

  function resolveModel(options?: AiOptions): string {
    return AI_MODELS.openai[options?.tier ?? defaultTier];
  }

  function extractContent(response: OpenAI.ChatCompletion): string {
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('GPT から応答コンテンツが返されませんでした');
    }
    return content;
  }

  return {
    async complete(prompt, options) {
      const messages: OpenAI.ChatCompletionMessageParam[] = [];
      if (options?.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await client.chat.completions.create({
        model: resolveModel(options),
        messages,
        ...(options?.maxTokens !== undefined && { max_tokens: options.maxTokens }),
        ...(options?.temperature !== undefined && { temperature: options.temperature }),
      });
      return extractContent(response);
    },

    async completeWithImage(prompt, imageBase64, mimeType, options) {
      const messages: OpenAI.ChatCompletionMessageParam[] = [];
      if (options?.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${imageBase64}` },
          },
        ],
      });

      const response = await client.chat.completions.create({
        model: resolveModel(options),
        messages,
        ...(options?.maxTokens !== undefined && { max_tokens: options.maxTokens }),
        ...(options?.temperature !== undefined && { temperature: options.temperature }),
      });
      return extractContent(response);
    },
  };
}
