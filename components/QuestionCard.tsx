import type { RefObject } from 'react';
import type { QuestionOption } from '@/lib/scoring/types';

interface QuestionCardProps {
  eyebrow: string;
  prompt: string;
  options: QuestionOption[];
  selectedId?: string;
  onSelect: (option: QuestionOption) => void;
  intro?: string;
  headingRef?: RefObject<HTMLHeadingElement>;
}

export function QuestionCard({ eyebrow, prompt, options, selectedId, onSelect, intro, headingRef }: QuestionCardProps) {
  return (
    <section className="mx-auto w-full max-w-2xl" aria-labelledby="question-title">
      {intro ? <p className="mb-5 max-w-lg text-sm leading-6 text-ink/65">{intro}</p> : null}
      <p className="font-mono text-[11px] uppercase tracking-[.18em] text-vermilion">{eyebrow}</p>
      <h2 id="question-title" ref={headingRef} tabIndex={-1} aria-live="polite" className="mt-4 max-w-2xl text-[clamp(2rem,8vw,4rem)] font-bold leading-[.98] tracking-[-.08em]">{prompt}</h2>
      <div className="mt-8 grid gap-3">
        {options.map((option, index) => {
          const selected = option.id === selectedId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option)}
              aria-pressed={selected}
              className={`group flex min-h-[76px] w-full items-start gap-4 border-2 p-4 text-left transition-[transform,background-color,border-color] focus:outline-none focus:ring-4 focus:ring-mustard sm:min-h-[86px] sm:p-5 ${selected ? 'border-vermilion bg-mint shadow-stamp' : 'border-ink/55 bg-paper hover:-translate-y-0.5 hover:border-pine'}`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center border font-mono text-sm font-bold ${selected ? 'border-vermilion bg-vermilion text-paper' : 'border-ink/40 text-ink/70 group-hover:border-pine group-hover:text-pine'}`}>{String.fromCharCode(65 + index)}</span>
              <span className="min-w-0">
                <span className="block text-base font-medium leading-6 sm:text-lg">{option.label}</span>
                {option.note ? <span className="mt-1 block font-mono text-[10px] leading-4 text-ink/55">{option.note}</span> : null}
              </span>
              <span aria-hidden="true" className={`ml-auto pt-1 text-lg ${selected ? 'text-vermilion' : 'text-ink/25 group-hover:text-pine'}`}>↗</span>
            </button>
          );
        })}
      </div>
      <p className="mt-5 font-mono text-[10px] uppercase tracking-[.12em] text-ink/45">点击选项后自动进入下一题 · 可返回修改</p>
    </section>
  );
}
