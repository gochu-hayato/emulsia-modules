import type { ZodType } from 'zod';
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
  /**
   * ドキュメント（画像 or PDF）をスキーマに従って構造化抽出する。
   *
   * 内部は AI SDK の `generateObject` を用いており、プロバイダー差異の吸収・
   * JSON 検証・リトライは AI SDK に委譲する。返り値は Zod スキーマで型付けされた値。
   *
   * @typeParam T 抽出結果の型（`schema` から推論される）
   * @param prompt 抽出指示プロンプト
   * @param data 画像または PDF の base64 文字列
   * @param mimeType `image/*` または `application/pdf`
   * @param schema 抽出結果を検証する Zod スキーマ
   * @param options ティア・温度などの呼び出しオプション
   * @returns スキーマで検証済みの型付きデータ
   */
  completeWithDocumentStructured<T>(
    prompt: string,
    data: string,
    mimeType: string,
    schema: ZodType<T>,
    options?: AiOptions,
  ): Promise<T>;
}
