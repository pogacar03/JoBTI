'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { PERSONALITIES } from '@/data/personalities';
import { getPersonalityImage } from '@/lib/personality-images';
import type { Personality } from '@/lib/scoring/types';

const SQUARE_IMAGE_CODES = new Set(['BARG', 'FLEX', 'HOLD', 'JUMP', 'LATE', 'REFR', 'RTRY', 'SPIN']);

function GalleryArt({ personality }: { personality: Personality }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden border border-ink/20 bg-ink/5">
      {personality.code === 'LATE' ? (
        <>
          <div className="relative aspect-square w-full">
            <Image src={getPersonalityImage(personality.code)} alt={`${personality.code} ${personality.name} 人物图`} fill sizes="(max-width: 640px) 45vw, (max-width: 1280px) 25vw, 220px" className="object-contain object-top" unoptimized />
          </div>
          <div data-gallery-art-caption aria-hidden="true" className="absolute inset-x-0 bottom-0 flex h-1/5 items-center justify-center border-t border-ink/15 bg-paper px-1 text-center text-[clamp(9px,1.5vw,17px)] font-bold text-ink">
            <span className="border-b-2 border-[#2d7ed7] pb-0.5" style={{ fontFamily: 'Kaiti SC, STKaiti, cursive' }}>开场迟到，也能抢戏。</span>
          </div>
        </>
      ) : (
        <Image src={getPersonalityImage(personality.code)} alt={`${personality.code} ${personality.name} 人物图`} fill sizes="(max-width: 640px) 45vw, (max-width: 1280px) 25vw, 220px" className="object-cover object-center" unoptimized />
      )}
      <span className="absolute left-1 top-1 bg-mustard px-1.5 py-1 font-mono text-[8px] font-bold uppercase shadow-stamp sm:left-2 sm:top-2 sm:px-2 sm:text-[9px]">{personality.rarity}</span>
    </div>
  );
}

export function GalleryCollection() {
  const [selected, setSelected] = useState<Personality | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selected && !dialog.open) dialog.showModal();
    if (!selected && dialog.open) dialog.close();
  }, [selected]);

  return (
    <>
      <section className="grid grid-cols-2 items-stretch gap-3 py-6 sm:gap-5 sm:py-8 lg:grid-cols-3 xl:grid-cols-4" aria-label="人格角色列表">
        {PERSONALITIES.map((personality) => (
          <article key={personality.code} data-gallery-card={personality.code} className="min-w-0 border-2 border-ink bg-paper p-2 shadow-file transition-transform hover:-translate-y-1 sm:p-4">
            <button type="button" onClick={() => setSelected(personality)} aria-label={`查看 ${personality.code} ${personality.name} 人物档案`} className="block h-full w-full text-left focus:outline-none focus:ring-4 focus:ring-mustard">
              <GalleryArt personality={personality} />
              <div className="pt-3 sm:pt-4">
                <div className="flex items-center justify-between gap-1 font-mono text-[9px] uppercase tracking-[.08em] text-vermilion sm:text-[10px] sm:tracking-[.16em]"><span>{personality.code}</span><span className="hidden sm:block">{personality.family.replace('_', ' ')}</span></div>
                <h2 className="mt-1.5 text-sm font-bold leading-5 tracking-[-.05em] sm:mt-2 sm:text-xl">{personality.name}</h2>
                <p className="mt-2 hidden border-l-2 border-vermilion pl-3 text-sm leading-6 text-ink/75 sm:block">“{personality.tagline}”</p>
              </div>
            </button>
          </article>
        ))}
      </section>

      <dialog ref={dialogRef} onClose={() => setSelected(null)} onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }} aria-label={selected ? `${selected.name} 人物档案` : '人物档案'} className="max-h-[calc(100svh-2rem)] w-[min(92vw,760px)] max-w-none overflow-y-auto border-2 border-ink bg-paper p-0 text-ink shadow-file backdrop:bg-ink/75">
        {selected ? (
          <div>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-ink bg-paper px-4 py-3 sm:px-6">
              <span className="font-mono text-[10px] uppercase tracking-[.16em] text-vermilion">JOBTI / {selected.code}</span>
              <button type="button" onClick={() => dialogRef.current?.close()} aria-label="关闭人物档案" className="inline-flex h-10 w-10 items-center justify-center border border-ink text-xl focus:outline-none focus:ring-4 focus:ring-mustard">×</button>
            </div>
            <div className="grid gap-5 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,.8fr)] sm:gap-7 sm:p-6">
              <div className={`relative mx-auto w-full max-w-[390px] overflow-hidden border border-ink/25 bg-paper ${SQUARE_IMAGE_CODES.has(selected.code) ? 'aspect-square' : 'aspect-[4/5]'}`}>
                <Image src={getPersonalityImage(selected.code)} alt={`${selected.code} ${selected.name} 完整人物图`} fill sizes="(max-width: 640px) 85vw, 390px" className="object-contain object-center" unoptimized />
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-mono text-xs font-bold uppercase tracking-[.18em] text-vermilion">{selected.code} / {selected.rarity}</p>
                <h2 className="mt-3 text-3xl font-bold tracking-[-.07em]">{selected.name}</h2>
                <p className="mt-4 border-l-4 border-vermilion pl-3 text-lg font-bold leading-7">“{selected.tagline}”</p>
                <p className="mt-5 text-sm leading-7 text-ink/75">{selected.description}</p>
                <Link href="/quiz?start=1" className="mt-7 inline-flex min-h-11 items-center justify-center bg-vermilion px-5 text-sm font-bold text-paper shadow-stamp focus:outline-none focus:ring-4 focus:ring-mustard">测测我的秋招人格 ↗</Link>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
