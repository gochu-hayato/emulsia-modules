import Anthropic from '@anthropic-ai/sdk';
import { AI_MODELS } from '../config';
import type { AiClient, AiOptions, AiTier } from '../types';

export type { AiClient, AiOptions, AiTier } from '../types';

type ClaudeImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

export function claudeClient(apiKey: string, defaultTier: AiTier = 'balanced'): AiClient {
  const client = new Anthropic({ apiKey });

  function resolveModel(options?: AiOptions): string {
    return AI_MODELS.anthropic[options?.tier ?? defaultTier];
  }

  function buildSystemBlocks(options?: AiOptions): Anthropic.TextBlockParam[] {
    if (!options?.systemPrompt) return [];
    return [{ type: 'text', text: options.systemPrompt, cache_control: { type: 'ephemeral' } }];
  }

  function extractText(response: Anthropic.Message): string {
    const block = response.content[0];
    if (block.type !== 'text') {
      throw new Error('Unexpected response content type from Claude');
    }
    return block.text;
  }

  return {
    async complete(prompt, options) {
      const systemBlocks = buildSystemBlocks(options);
      const response = await client.messages.create({
        model: resolveModel(options),
        max_tokens: options?.maxTokens ?? 1024,
        ...(options?.temperature !== undefined && { temperature: options.temperature }),
        ...(systemBlocks.length > 0 && { system: systemBlocks }),
        messages: [{ role: 'user', content: prompt }],
      });
      return extractText(response);
    },

    async completeWithImage(prompt, imageBase64, mimeType, options) {
      const systemBlocks = buildSystemBlocks(options);
      const response = await client.messages.create({
        model: resolveModel(options),
        max_tokens: options?.maxTokens ?? 1024,
        ...(options?.temperature !== undefined && { temperature: options.temperature }),
        ...(systemBlocks.length > 0 && { system: systemBlocks }),
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType as ClaudeImageMediaType,
                  data: imageBase64,
                },
              },
              { type: 'text', text: prompt },
            ],
          },
        ],
      });
      return extractText(response);
    },
  };
}
