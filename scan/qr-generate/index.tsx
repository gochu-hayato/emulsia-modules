import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export async function generateQrPng(text: string, size = 200): Promise<string> {
  return QRCode.toDataURL(text, { width: size, margin: 1 });
}

export async function generateQrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: 'svg' });
}

export const QrCodeDisplay: React.FC<{ text: string; size?: number }> = ({ text, size = 200 }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    generateQrPng(text, size).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [text, size]);

  if (!dataUrl) return null;

  return (
    <img
      src={dataUrl}
      alt={`QR: ${text}`}
      width={size}
      height={size}
      style={{ display: 'block' }}
    />
  );
};
