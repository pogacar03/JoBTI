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
    <main className="file-grid paper-noise h-[100svh] overflow-hidden sm:h-auto sm:min-h-screen sm:overflow-visible">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-4 py-3 sm:h-auto sm:min-h-screen sm:px-8 sm:py-8">
        <header className="flex items-start justify-between border-b-2 border-ink pb-2 sm:pb-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[.22em] text-ink/60">Candidate intake / 2027</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-.08em] sm:text-4xl">JOBTI<span className="text-vermilion">.</span></h1>
          </div>
          <div className="flex items-start gap-3 text-right font-mono text-[10px] uppercase leading-5 text-ink/60">
            <Link data-gallery-link href="/gallery" className="inline-flex min-h-7 min-w-16 shrink-0 items-center justify-center border border-vermilion bg-paper px-2 text-center text-[9px] font-bold tracking-normal text-vermilion shadow-[2px_2px_0_0_currentColor] focus:outline-none focus:ring-4 focus:ring-mustard">人物图鉴 ↗</Link>
            <div><div>confidential</div><div>case no. 27-0915</div></div>
          </div>
        </header>

        <section className="grid min-h-0 flex-1 grid-cols-[.95fr_1.05fr] items-center gap-3 py-3 sm:grid-cols-1 sm:gap-10 sm:py-12 lg:grid-cols-[1.08fr_.92fr] lg:items-start lg:gap-10 lg:py-6">
          <div className="max-w-xl">
            <div className="stamp stamp-red mb-2 px-2 py-1 text-[8px] sm:mb-7 sm:text-[10px]">秋招人格鉴定 / report 01</div>
            <h2 className="text-[clamp(2.35rem,11vw,3.3rem)] font-bold leading-[.87] tracking-[-.1em] text-ink sm:text-[clamp(3.4rem,14vw,8.5rem)] lg:text-[clamp(3.4rem,8vw,6.2rem)]">测测秋招<br /><span className="text-pine">把你变成了</span><br />什么人格<span className="text-vermilion">。</span></h2>
            <p className="mt-7 hidden max-w-md text-base leading-7 text-ink/75 sm:block sm:text-lg">投了几百份简历以后，你还是原来的你吗？</p>
            <div className="mt-4 flex flex-col items-start gap-2 sm:mt-9 sm:flex-row sm:items-center sm:gap-4">
              <Link href="/quiz?start=1" onClick={() => clearCompletedQuizState()} className="inline-flex min-h-12 w-full items-center justify-center bg-vermilion px-3 text-[11px] font-bold text-paper shadow-stamp transition-transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-mustard sm:min-h-14 sm:w-auto sm:px-7 sm:text-sm">
                开始秋招精神鉴定 <span className="ml-4 text-lg">↗</span>
              </Link>
              <span className="hidden font-mono text-[11px] leading-5 text-ink/60 sm:block">30 道题 · 约 3 分钟<br />无需登录 · 结果可保存</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[190px] lg:max-w-md lg:justify-self-end">
            <div className="absolute -left-2 -top-3 z-10 rotate-[-8deg] bg-mustard px-2 py-1 font-mono text-[8px] font-bold uppercase shadow-stamp sm:-left-4 sm:-top-5 sm:px-3 sm:py-2 sm:text-[10px]">sample file / preview</div>
            <div data-preview-code={personality.code} className="relative rotate-[2deg] border-2 border-ink bg-paper p-3 shadow-file sm:p-5 lg:p-7">
              <div className="hidden items-start justify-between border-b border-ink/30 pb-4 sm:flex">
                <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-ink/60">JOBTI / identity</p><p className="mt-2 font-mono text-xs">APPLICANT NO. 2027-∞</p></div>
                <div className="stamp stamp-green">{personality.rarity}</div>
              </div>
              <div className="py-2 sm:py-6 lg:py-7">
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
                <p className="mt-2 hidden font-mono text-xs text-ink/55 sm:block sm:mt-5">detected type / {personality.code}</p>
                <h3 className="mt-2 text-center text-base font-bold tracking-[-.05em] sm:text-left sm:text-2xl">{personality.name}</h3>
                <p className="mt-3 hidden border-l-4 border-vermilion pl-4 text-base leading-7 sm:block">“{personality.tagline}”</p>
              </div>
              <div className="hidden items-end justify-between border-t border-ink/30 pt-4 sm:flex">
                <div><p className="font-mono text-[10px] uppercase text-ink/55">status</p><p className="mt-1 text-sm font-bold text-vermilion">UNDER REVIEW</p></div>
                <div className="barcode" aria-label="Applicant barcode" />
              </div>
            </div>
            <p className="mt-3 hidden text-center font-mono text-[10px] uppercase tracking-[.18em] text-ink/50 sm:block sm:mt-6">scroll / inspect your current condition</p>
          </div>
        </section>

        <footer className="hidden flex-col gap-3 border-t border-ink/25 pt-4 font-mono text-[10px] uppercase tracking-[.12em] text-ink/55 sm:flex sm:flex-row sm:items-center sm:justify-between">
          <span>JOBTI · autumn recruitment personality test</span>
          <span>not a psychological diagnosis / probably still accurate</span>
        </footer>
      </div>
    </main>
  );
}
