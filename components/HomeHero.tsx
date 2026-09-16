'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { PERSONALITIES } from '@/data/personalities';
import { type PreviewCode } from '@/lib/preview';
import { clearCompletedQuizState } from '@/lib/storage';
import { getPersonalityImage } from '@/lib/personality-images';

interface HomeHeroProps {
  initialOrder: PreviewCode[];
}

export function HomeHero({ initialOrder }: HomeHeroProps) {
  const [previewOrder] = useState<PreviewCode[]>(initialOrder);
  const [index, setIndex] = useState(0);
  const personality = PERSONALITIES.find((item) => item.code === previewOrder[index]) ?? PERSONALITIES[0];
  const indexRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let loading = false;

    async function preloadPortrait(code: PreviewCode): Promise<boolean> {
      const image = new window.Image();
      const loaded = new Promise<boolean>((resolve) => {
        const finish = (success: boolean) => {
          image.removeEventListener('load', onLoad);
          image.removeEventListener('error', onError);
          resolve(success);
        };
        const onLoad = () => finish(true);
        const onError = () => finish(false);
        image.addEventListener('load', onLoad, { once: true });
        image.addEventListener('error', onError, { once: true });
        image.src = getPersonalityImage(code);
        if (image.complete) finish(image.naturalWidth > 0);
      });
      if (!(await loaded)) return false;
      if (typeof image.decode === 'function') await image.decode().catch(() => undefined);
      return image.naturalWidth > 0;
    }

    const timer = window.setInterval(() => {
      if (loading) return;
      loading = true;
      const nextIndex = (indexRef.current + 1) % previewOrder.length;
      const nextCode = previewOrder[nextIndex];
      void preloadPortrait(nextCode).then((ready) => {
        if (!cancelled && ready) {
          indexRef.current = nextIndex;
          setIndex(nextIndex);
        }
      }).finally(() => {
        loading = false;
      });
    }, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [previewOrder]);

  return (
    <main className="file-grid paper-noise min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 sm:py-8">
        <header className="flex items-start justify-between border-b-2 border-ink pb-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[.22em] text-ink/60">Candidate intake / 2027</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-.08em] sm:text-4xl">JOBTI<span className="text-vermilion">.</span></h1>
          </div>
          <div className="text-right font-mono text-[10px] uppercase leading-5 text-ink/60">
            <div>confidential</div><div>case no. 27-0915</div>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.08fr_.92fr] lg:items-start lg:gap-10 lg:py-6">
          <div className="max-w-xl">
            <div className="stamp stamp-red mb-7">秋招人格鉴定 / report 01</div>
            <h2 className="text-[clamp(3.4rem,14vw,8.5rem)] font-bold leading-[.87] tracking-[-.1em] text-ink lg:text-[clamp(3.4rem,8vw,6.2rem)]">测测秋招<br /><span className="text-pine">把你变成了</span><br />什么人格<span className="text-vermilion">。</span></h2>
            <p className="mt-7 max-w-md text-base leading-7 text-ink/75 sm:text-lg">投了几百份简历以后，你还是原来的你吗？</p>
            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link href="/quiz?start=1" onClick={() => clearCompletedQuizState()} className="inline-flex min-h-14 w-full items-center justify-center bg-vermilion px-7 text-sm font-bold text-paper shadow-stamp transition-transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-mustard sm:w-auto">
                开始秋招精神鉴定 <span className="ml-4 text-lg">↗</span>
              </Link>
              <span className="font-mono text-[11px] leading-5 text-ink/60">30 道题 · 约 3 分钟<br />无需登录 · 结果可保存</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:justify-self-end">
            <div className="absolute -left-4 -top-5 z-10 rotate-[-8deg] bg-mustard px-3 py-2 font-mono text-[10px] font-bold uppercase shadow-stamp">sample file / preview</div>
            <div data-preview-code={personality.code} className="relative rotate-[2deg] border-2 border-ink bg-paper p-5 shadow-file sm:p-7">
              <div className="flex items-start justify-between border-b border-ink/30 pb-4">
                <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-ink/60">JOBTI / identity</p><p className="mt-2 font-mono text-xs">APPLICANT NO. 2027-∞</p></div>
                <div className="stamp stamp-green">{personality.rarity}</div>
              </div>
              <div className="py-6 sm:py-7">
                <div className="relative aspect-[4/5] w-full overflow-hidden border border-ink/20 bg-ink/5">
                  <Image
                    data-personality-image
                    src={getPersonalityImage(personality.code)}
                    alt={`${personality.code} ${personality.name} 人物图`}
                    width={1122}
                    height={1402}
                    priority
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 420px"
                    className="h-full w-full object-contain object-center"
                  />
                </div>
                <p className="mt-5 font-mono text-xs text-ink/55">detected type / {personality.code}</p>
                <h3 className="mt-2 text-2xl font-bold tracking-[-.05em]">{personality.name}</h3>
                <p className="mt-3 border-l-4 border-vermilion pl-4 text-base leading-7">“{personality.tagline}”</p>
              </div>
              <div className="flex items-end justify-between border-t border-ink/30 pt-4">
                <div><p className="font-mono text-[10px] uppercase text-ink/55">status</p><p className="mt-1 text-sm font-bold text-vermilion">UNDER REVIEW</p></div>
                <div className="barcode" aria-label="Applicant barcode" />
              </div>
            </div>
            <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[.18em] text-ink/50">scroll / inspect your current condition</p>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-ink/25 pt-4 font-mono text-[10px] uppercase tracking-[.12em] text-ink/55 sm:flex-row sm:items-center sm:justify-between">
          <span>JOBTI · autumn recruitment personality test</span>
          <span>not a psychological diagnosis / probably still accurate</span>
        </footer>
      </div>
    </main>
  );
}
