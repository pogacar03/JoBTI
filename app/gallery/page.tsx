import Image from 'next/image';
import Link from 'next/link';
import { PERSONALITIES } from '@/data/personalities';
import { getPersonalityImage } from '@/lib/personality-images';

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

        <section className="grid gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="人格角色列表">
          {PERSONALITIES.map((personality) => (
            <article key={personality.code} data-gallery-card={personality.code} className="border-2 border-ink bg-paper p-3 shadow-file transition-transform hover:-translate-y-1 sm:p-4">
              <div className="relative aspect-[4/5] overflow-hidden border border-ink/20 bg-ink/5">
                <Image src={getPersonalityImage(personality.code)} alt={`${personality.code} ${personality.name} 人物图`} fill sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 220px" className="object-contain object-center" unoptimized />
                <span className="absolute left-2 top-2 bg-mustard px-2 py-1 font-mono text-[9px] font-bold uppercase shadow-stamp">{personality.rarity}</span>
              </div>
              <div className="pt-4">
                <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[.16em] text-vermilion"><span>{personality.code}</span><span>{personality.family.replace('_', ' ')}</span></div>
                <h2 className="mt-2 text-xl font-bold tracking-[-.05em]">{personality.name}</h2>
                <p className="mt-2 border-l-2 border-vermilion pl-3 text-sm leading-6 text-ink/75">“{personality.tagline}”</p>
              </div>
            </article>
          ))}
        </section>

        <footer className="border-t border-ink/25 pt-5 font-mono text-[10px] uppercase tracking-[.12em] text-ink/50">JOBTI · character archive · not a psychological diagnosis</footer>
      </div>
    </main>
  );
}
