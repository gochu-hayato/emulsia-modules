import type { Tier } from './types';

// モデル名は .dev/references/ai-models.md を正として管理する
export const CLAUDE_MODELS: Record<Tier, string> = {
  heavy: 'claude-opus-4-7',
  balanced: 'claude-sonnet-4-6',
  lite: 'claude-haiku-4-5-20251001',
};

export const GEMINI_MODELS: Record<Tier, string> = {
  heavy: 'gemini-3-1-pro',
  balanced: 'gemini-3-flash',
  lite: 'gemini-3-1-flash-lite',
};

export const GPT_MODELS: Record<Tier, string> = {
  heavy: 'o3-pro',
  balanced: 'gpt-5-5',
  lite: 'gpt-5-4-mini',
};

export function resolveClaudeModel(tier: Tier): string {
  return process.env.AI_MODEL_CLAUDE ?? CLAUDE_MODELS[tier];
}

export function resolveGeminiModel(tier: Tier): string {
  return process.env.AI_MODEL_GEMINI ?? GEMINI_MODELS[tier];
}

export function resolveGptModel(tier: Tier): string {
  return process.env.AI_MODEL_GPT ?? GPT_MODELS[tier];
}
