import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://qiuzhao.site'),
  title: 'JOBTI · 秋招人格测试',
  description: '30 道题，测测秋招把你变成了什么人格。',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'JOBTI',
    url: 'https://qiuzhao.site',
    title: 'JOBTI · 秋招人格测试',
    description: '30 道题，测测秋招把你变成了什么人格。',
    images: [{ url: 'https://qiuzhao.site/og-card.png', width: 1200, height: 630, alt: 'JOBTI 秋招人格测试人物档案' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JOBTI · 秋招人格测试',
    description: '30 道题，测测秋招把你变成了什么人格。',
    images: ['https://qiuzhao.site/og-card.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
