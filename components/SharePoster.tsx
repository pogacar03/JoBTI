'use client';

import { forwardRef, useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import type { ResolvedResult } from '@/lib/scoring/types';
import { getPersonalityImage } from '@/lib/personality-images';
import { buildPosterSummary, SHARE_SITE_URL } from '@/lib/share/copy';

export const SharePoster = forwardRef<HTMLDivElement, { result: ResolvedResult }>(({ result }, ref) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const score = Math.min(100, Math.round(result.primaryScore.total));

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(SHARE_SITE_URL, {
      width: 320,
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

  const metrics = [
    ['投递欲', Math.round(result.normalizedScores.P)],
    ['焦虑值', Math.round(result.normalizedScores.A)],
    ['等待耐力', Math.round(result.normalizedScores.W)],
    ['匹配度', `${score}%`],
  ];

  return (
    <div
      ref={ref}
      data-share-poster
      aria-hidden="true"
      style={{ position: 'fixed', left: '-100000px', top: 0, width: 1080, height: 1920, overflow: 'hidden', background: '#f4efe5', color: '#18221f', padding: 64, fontFamily: 'Arial, sans-serif' }}
    >
      <div style={{ height: '100%', border: '4px solid #18221f', padding: 50, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid rgba(24,34,31,.28)', paddingBottom: 24 }}>
          <div>
            <div style={{ fontSize: 26, letterSpacing: 6, fontWeight: 700 }}>JOBTI<span style={{ color: '#c85136' }}>.</span></div>
            <div style={{ fontSize: 16, marginTop: 12, letterSpacing: 3 }}>2027 秋招人格鉴定书</div>
          </div>
          <div style={{ border: '3px solid #c85136', padding: '12px 18px', fontSize: 16, letterSpacing: 4, alignSelf: 'flex-start' }}>{result.primary.rarity}</div>
        </div>

        <div style={{ paddingTop: 44, display: 'flex', gap: 32, alignItems: 'center' }}>
          <Image
            data-poster-primary-image
            unoptimized
            src={getPersonalityImage(result.primary.code)}
            alt={`${result.primary.code} ${result.primary.name} 主人格人物图`}
            width={440}
            height={550}
            style={{ width: 440, height: 550, objectFit: 'contain', objectPosition: 'center', flexShrink: 0, border: '3px solid #18221f' }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 17, color: '#c85136', letterSpacing: 4 }}>DETECTED TYPE</div>
            <div style={{ color: '#184b3c', fontSize: 112, lineHeight: .9, fontWeight: 700, letterSpacing: -8, marginTop: 18 }}>{result.primary.code}</div>
            <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: -3, marginTop: 28 }}>{result.primary.name}</div>
            <div style={{ borderLeft: '7px solid #c85136', paddingLeft: 18, fontSize: 22, lineHeight: 1.45, marginTop: 24 }}>“{result.primary.tagline}”</div>
          </div>
        </div>

        <div style={{ marginTop: 38, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '2px solid rgba(24,34,31,.28)', borderBottom: '2px solid rgba(24,34,31,.28)', padding: '24px 0', fontFamily: 'monospace' }}>
          {metrics.map(([label, value]) => (
            <div key={label} style={{ textAlign: 'center', borderRight: label === '匹配度' ? 'none' : '1px solid rgba(24,34,31,.2)' }}>
              <div style={{ fontSize: 15, letterSpacing: 2, color: '#c85136' }}>{label}</div>
              <div style={{ marginTop: 10, fontSize: 30, fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 34, border: '3px solid #18221f', padding: '24px 28px', fontSize: 23, lineHeight: 1.55, whiteSpace: 'pre-line' }}>
          <div style={{ color: '#c85136', fontFamily: 'monospace', fontSize: 16, letterSpacing: 3, marginBottom: 12 }}>你是一个什么样的人</div>
          {buildPosterSummary(result.primary)}
        </div>

        <div style={{ marginTop: 26, background: '#184b3c', color: '#f4efe5', padding: '24px 28px' }}>
          <div style={{ color: '#e6b94d', fontFamily: 'monospace', fontSize: 16, letterSpacing: 3 }}>毒舌鉴定</div>
          <div style={{ marginTop: 10, fontSize: 26, lineHeight: 1.5, fontWeight: 700 }}>“{result.primary.diagnosis}”</div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid rgba(24,34,31,.28)', paddingTop: 24 }}>
          <div style={{ maxWidth: 430, fontSize: 28, lineHeight: 1.35, fontWeight: 700 }}>测测秋招把你变成了什么人格</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 166, height: 166, border: '5px solid #18221f', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
              {qrCode ? (
                <Image
                  data-poster-qr-image
                  data-poster-qr-target={SHARE_SITE_URL}
                  unoptimized
                  src={qrCode}
                  alt="扫码进入 JOBTI"
                  width={156}
                  height={156}
                  style={{ width: 156, height: 156, display: 'block' }}
                />
              ) : (
                <span style={{ fontFamily: 'monospace', fontSize: 16, textAlign: 'center' }}>QR<br />LOADING</span>
              )}
            </div>
            <div style={{ marginTop: 12, fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap' }}>来 qiuzhao.site 测测你的秋招人格</div>
          </div>
        </div>
      </div>
    </div>
  );
});

SharePoster.displayName = 'SharePoster';
