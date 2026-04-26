export type Tier = 'heavy' | 'balanced' | 'lite';

export interface AiOptions {
  tier?: Tier;
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
