import OpenAI from 'openai';
import type { AiClient, AiOptions, Tier } from '../types';
import { resolveGptModel } from '../config';

export type { AiClient, AiOptions, Tier } from '../types';

export function gptClient(apiKey: string, defaultTier: Tier = 'balanced'): AiClient {
  const client = new OpenAI({ apiKey });

  function buildMessages(prompt: string, options?: AiOptions): OpenAI.ChatCompletionMessageParam[] {
    const messages: OpenAI.ChatCompletionMessageParam[] = [];
    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });
    return messages;
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
      const response = await client.chat.completions.create({
        model: resolveGptModel(options?.tier ?? defaultTier),
        messages: buildMessages(prompt, options),
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
        model: resolveGptModel(options?.tier ?? defaultTier),
        messages,
        ...(options?.maxTokens !== undefined && { max_tokens: options.maxTokens }),
        ...(options?.temperature !== undefined && { temperature: options.temperature }),
      });
      return extractContent(response);
    },
  };
}
