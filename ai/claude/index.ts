import Anthropic from '@anthropic-ai/sdk';
import type { AiClient, AiOptions } from '../types';

export type { AiClient, AiOptions } from '../types';

const MODEL = 'claude-sonnet-4-6';

export function claudeClient(apiKey: string): AiClient {
  const client = new Anthropic({ apiKey });

  return {
    async chat(userMessage: string, options?: AiOptions): Promise<string> {
      const systemBlocks: Anthropic.TextBlockParam[] = options?.systemPrompt
        ? [
            {
              type: 'text',
              text: options.systemPrompt,
              cache_control: { type: 'ephemeral' },
            },
          ]
        : [];

      const response = await client.messages.create({
        model: MODEL,
        max_tokens: options?.maxTokens ?? 1024,
        ...(options?.temperature !== undefined && { temperature: options.temperature }),
        ...(systemBlocks.length > 0 && { system: systemBlocks }),
        messages: [{ role: 'user', content: userMessage }],
      });

      const block = response.content[0];
      if (block.type !== 'text') {
        throw new Error('Unexpected response content type from Claude');
      }
      return block.text;
    },
  };
}
