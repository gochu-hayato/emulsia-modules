/**
 * @module ai/ocr/normalize
 *
 * 補正関数（correct）で使える汎用ヘルパー集。
 * OCR 結果は全角数字・和暦・区切り記号などが混在しがちなため、
 * 検証前にここで素値を整える。案件固有の補正は案件側で組み合わせて使う。
 */

/**
 * 全角英数字・記号を半角に変換する。
 *
 * @param value 変換対象文字列
 * @returns 半角化した文字列
 */
export function toHalfWidth(value: string): string {
  return value
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/　/g, ' ');
}

/**
 * 金額文字列（"¥1,234"、"１，２３４円" など）を数値に変換する。
 * 変換できない場合は NaN を返す（呼び出し側で扱いを決める）。
 *
 * @param value 金額を表す文字列
 * @returns 数値、または変換不能時は NaN
 */
export function parseAmount(value: string): number {
  const halfWidth = toHalfWidth(value);
  const digits = halfWidth.replace(/[^0-9.\-]/g, '');
  if (digits === '' || digits === '-' || digits === '.') return NaN;
  return Number(digits);
}

/**
 * 日付文字列を `YYYY-MM-DD` 形式に整形する。
 * 対応例: "2026/6/2"、"2026年6月2日"、"2026.06.02"。
 * 解釈できない場合は入力をそのまま返す。
 *
 * @param value 日付を表す文字列
 * @returns `YYYY-MM-DD` 形式、または整形不能時は入力そのまま
 */
export function normalizeDate(value: string): string {
  const halfWidth = toHalfWidth(value);
  const match = halfWidth.match(/(\d{4})\s*[年/.\-]\s*(\d{1,2})\s*[月/.\-]\s*(\d{1,2})/);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
