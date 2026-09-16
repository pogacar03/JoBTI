'use client';

import { forwardRef, useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import type { ResolvedResult } from '@/lib/scoring/types';
import { getPersonalityImage } from '@/lib/personality-images';
import { buildDetailedShareDescription } from '@/lib/share/copy';

export const SharePoster = forwardRef<HTMLDivElement, { result: ResolvedResult }>(({ result }, ref) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const bar = (value: number) => '█'.repeat(Math.max(1, Math.round(value / 10))) + '░'.repeat(Math.max(0, 10 - Math.round(value / 10)));
  const score = Math.min(100, Math.round(result.primaryScore.total));

  useEffect(() => {
    let active = true;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    QRCode.toDataURL(siteUrl, {
      width: 280,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#18221f', light: '#f4efe5' },
    }).then((dataUrl) => {
      if (active) setQrCode(dataUrl);
    }).catch(() => {
      if (active) setQrCode(null);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" style={{ position: 'fixed', left: '-100000px', top: 0, width: 1080, height: 1920, overflow: 'hidden', background: '#f4efe5', color: '#18221f', padding: 86, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ height: '100%', border: '4px solid #18221f', padding: 56, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid rgba(24,34,31,.28)', paddingBottom: 28 }}>
          <div><div style={{ fontSize: 26, letterSpacing: 6, fontWeight: 700 }}>JOBTI<span style={{ color: '#c85136' }}>.</span></div><div style={{ fontSize: 17, marginTop: 14, letterSpacing: 3 }}>2027 秋招人格鉴定书</div></div>
          <div style={{ border: '3px solid #c85136', padding: '14px 20px', fontSize: 17, letterSpacing: 4, alignSelf: 'flex-start' }}>{result.primary.rarity}</div>
        </div>
        <div style={{ paddingTop: 70, display: 'flex', gap: 38, alignItems: 'flex-start' }}><Image data-poster-primary-image unoptimized src={getPersonalityImage(result.primary.code)} alt={`${result.primary.code} ${result.primary.name} 主人格人物图`} width={360} height={450} style={{ width: 360, height: 450, objectFit: 'contain', objectPosition: 'center', flexShrink: 0, border: '3px solid #18221f' }} /><div style={{ minWidth: 0, paddingTop: 10 }}><div style={{ fontSize: 20, color: '#c85136', letterSpacing: 4 }}>DETECTED TYPE</div><div style={{ color: '#184b3c', fontSize: 142, lineHeight: .9, fontWeight: 700, letterSpacing: -10, marginTop: 16 }}>{result.primary.code}</div><div style={{ fontSize: 47, fontWeight: 700, letterSpacing: -3, marginTop: 30 }}>{result.primary.name}</div><div style={{ borderLeft: '8px solid #c85136', paddingLeft: 20, fontSize: 24, lineHeight: 1.45, marginTop: 28 }}>“{result.primary.tagline}”</div></div></div>
        <div style={{ marginTop: 76, borderTop: '2px solid rgba(24,34,31,.28)', borderBottom: '2px solid rgba(24,34,31,.28)', padding: '38px 0', fontFamily: 'monospace', fontSize: 22, lineHeight: 2 }}>
          <div>投递欲　{bar(result.normalizedScores.P)} {Math.round(result.normalizedScores.P)}</div><div>焦虑值　{bar(result.normalizedScores.A)} {Math.round(result.normalizedScores.A)}</div><div>等待耐力　{bar(result.normalizedScores.W)} {Math.round(result.normalizedScores.W)}</div><div>匹配度　{score}%</div>
        </div>
        <div style={{ marginTop: 42, border: '3px solid #18221f', padding: '24px 28px', fontSize: 22, lineHeight: 1.55, whiteSpace: 'pre-line' }}><div style={{ color: '#c85136', fontFamily: 'monospace', fontSize: 17, letterSpacing: 3, marginBottom: 12 }}>你是一个什么样的人</div>{buildDetailedShareDescription(result.primary).replace('你是一个什么样的人？\n', '')}</div>
        <div style={{ marginTop: 34, fontSize: 25, lineHeight: 1.65 }}><div style={{ color: '#c85136', fontFamily: 'monospace', fontSize: 17, letterSpacing: 3 }}>FINAL DIAGNOSIS</div><div style={{ marginTop: 10 }}>“{result.primary.diagnosis}”</div></div>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid rgba(24,34,31,.28)', paddingTop: 28 }}><div style={{ fontSize: 22, fontWeight: 700 }}>测测秋招把你变成了什么东西</div><div style={{ width: 140, height: 140, border: '5px solid #18221f', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>{qrCode ? <Image data-poster-qr-image unoptimized src={qrCode} alt="扫码进入 JOBTI" width={130} height={130} style={{ width: 130, height: 130, display: 'block' }} /> : <span style={{ fontFamily: 'monospace', fontSize: 16, textAlign: 'center' }}>QR<br />LOADING</span>}</div></div>
      </div>
    </div>
  );
});

SharePoster.displayName = 'SharePoster';
