import OpenAI from 'openai';
import type { AiClient, AiOptions } from '../types';

export type { AiClient, AiOptions } from '../types';

const MODEL = 'gpt-4o';

export function gptClient(apiKey: string): AiClient {
  const client = new OpenAI({ apiKey });

  return {
    async chat(userMessage: string, options?: AiOptions): Promise<string> {
      const messages: OpenAI.ChatCompletionMessageParam[] = [];

      if (options?.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: userMessage });

      const response = await client.chat.completions.create({
        model: MODEL,
        messages,
        ...(options?.maxTokens !== undefined && { max_tokens: options.maxTokens }),
        ...(options?.temperature !== undefined && { temperature: options.temperature }),
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('GPT から応答コンテンツが返されませんでした');
      }
      return content;
    },
  };
}
