import Link from 'next/link';
import type { Metadata } from 'next';
import { GalleryCollection } from '@/components/GalleryCollection';

export const metadata: Metadata = {
  title: '人物图鉴 · JOBTI',
  description: '浏览 24 种秋招人格人物档案，看看你会是哪一种。',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'JOBTI',
    url: 'https://qiuzhao.site/gallery',
    title: 'JOBTI 人物图鉴 · 24 种秋招人格',
    description: '24 种秋招人格人物档案，看看你会是哪一种。',
    images: [{ url: 'https://qiuzhao.site/og-card.png', width: 1200, height: 630, alt: 'JOBTI 秋招人格测试人物档案' }],
  },
};

export default function GalleryPage() {
  return (
    <main className="file-grid paper-noise min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-10">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-5">
          <div>
            <Link href="/" className="font-bold tracking-[-.08em] focus:outline-none focus:ring-4 focus:ring-mustard">JOBTI<span className="text-vermilion">.</span></Link>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[.2em] text-vermilion">archive / character index</p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-.08em] sm:text-6xl">JOBTI 人物图鉴</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/65">24 种秋招人格，来自同一套招聘流程，但没有一种精神状态完全相同。</p>
          </div>
          <Link href="/quiz?start=1" className="inline-flex min-h-11 items-center justify-center bg-vermilion px-5 text-sm font-bold text-paper shadow-stamp focus:outline-none focus:ring-4 focus:ring-mustard">开始鉴定 ↗</Link>
        </header>

        <GalleryCollection />

        <footer className="border-t border-ink/25 pt-5 font-mono text-[10px] uppercase tracking-[.12em] text-ink/50">JOBTI · character archive · not a psychological diagnosis</footer>
      </div>
    </main>
  );
}
