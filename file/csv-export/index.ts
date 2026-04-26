import Papa from 'papaparse';

const UTF8_BOM = '﻿';

export function generateCsvString<T extends object>(data: T[]): string {
  return UTF8_BOM + Papa.unparse(data);
}

export function exportToCsv<T extends object>(data: T[], filename: string): void {
  const csv = generateCsvString(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
