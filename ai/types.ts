import type { AiTier } from './config';

export type { AiTier, AiProvider } from './config';

export interface AiOptions {
  tier?: AiTier;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AiClient {
  complete(prompt: string, options?: AiOptions): Promise<string>;
  completeWithImage(
    prompt: string,
    imageBase64: string,
    mimeType: string,
    options?: AiOptions,
  ): Promise<string>;
}
