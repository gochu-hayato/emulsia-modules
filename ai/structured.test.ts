/**
 * @module ai/structured.test
 *
 * geminiClient / claudeClient の completeWithDocumentStructured が、同一インターフェースで
 * AI SDK の generateObject を正しく呼び出すことを検証する。AI SDK・各プロバイダーSDK は
 * モックに差し替えて実 API には到達しない。GPT は未対応 throw であることも確認する。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// AI SDK と各プロバイダーをモック化する（vi.mock はファイル先頭へ巻き上げられる）。
vi.mock('ai', () => ({
  generateObject: vi.fn(async () => ({ object: { ok: true } })),
}));
vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: () => (modelId: string) => ({ modelId }),
}));
vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: () => (modelId: string) => ({ modelId }),
}));

import { generateObject } from 'ai';
import { geminiClient } from './gemini';
import { claudeClient } from './claude';
import { gptClient } from './gpt';
import { AI_MODELS } from './config';

const schema = z.object({ ok: z.boolean() });

beforeEach(() => {
  vi.mocked(generateObject).mockClear();
});

describe('completeWithDocumentStructured（AI SDK 構造化抽出）', () => {
  it('gemini: config 由来のモデルで generateObject を呼び、object を返す', async () => {
    const client = geminiClient('test-key', 'balanced');
    const result = await client.completeWithDocumentStructured('抽出', 'ZGF0YQ==', 'image/png', schema);

    expect(result).toEqual({ ok: true });
    expect(generateObject).toHaveBeenCalledTimes(1);

    const arg = vi.mocked(generateObject).mock.calls[0][0];
    expect(arg.model).toEqual({ modelId: AI_MODELS.gemini.balanced });
    expect((arg as { schema?: unknown }).schema).toBe(schema);
  });

  it('claude: config 由来のモデルで generateObject を呼び、object を返す', async () => {
    const client = claudeClient('test-key', 'heavy');
    const result = await client.completeWithDocumentStructured('抽出', 'ZGF0YQ==', 'application/pdf', schema);

    expect(result).toEqual({ ok: true });
    expect(generateObject).toHaveBeenCalledTimes(1);

    const arg = vi.mocked(generateObject).mock.calls[0][0];
    expect(arg.model).toEqual({ modelId: AI_MODELS.anthropic.heavy });
  });

  it('gemini / claude が同一の file メッセージ構造を組み立てる', async () => {
    const gemini = geminiClient('k', 'balanced');
    await gemini.completeWithDocumentStructured('p', 'ZGF0YQ==', 'application/pdf', schema);
    const geminiArg = vi.mocked(generateObject).mock.calls[0][0];

    vi.mocked(generateObject).mockClear();

    const claude = claudeClient('k', 'balanced');
    await claude.completeWithDocumentStructured('p', 'ZGF0YQ==', 'application/pdf', schema);
    const claudeArg = vi.mocked(generateObject).mock.calls[0][0];

    expect(geminiArg.messages).toEqual(claudeArg.messages);
    expect(geminiArg.messages?.[0]).toMatchObject({
      role: 'user',
      content: [
        { type: 'text', text: 'p' },
        { type: 'file', data: 'ZGF0YQ==', mediaType: 'application/pdf' },
      ],
    });
  });

  it('gpt: completeWithDocumentStructured は当面未対応で throw する', async () => {
    const client = gptClient('test-key', 'balanced');
    await expect(
      client.completeWithDocumentStructured('抽出', 'ZGF0YQ==', 'image/png', schema),
    ).rejects.toThrow(/未対応/);
  });
});
