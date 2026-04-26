export const AI_MODELS = {
  anthropic: {
    heavy: 'claude-opus-4-7',
    balanced: 'claude-sonnet-4-6',
    lite: 'claude-haiku-4-5-20251001',
  },
  gemini: {
    heavy: 'gemini-3-1-pro',
    balanced: 'gemini-3-flash',
    lite: 'gemini-3-1-flash-lite',
  },
  openai: {
    heavy: 'o3-pro',
    balanced: 'gpt-5-5',
    lite: 'gpt-5-4-mini',
  },
} as const;

export type AiTier = 'heavy' | 'balanced' | 'lite';
export type AiProvider = keyof typeof AI_MODELS;
