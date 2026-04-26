export interface AiOptions {
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AiClient {
  chat(userMessage: string, options?: AiOptions): Promise<string>;
}
