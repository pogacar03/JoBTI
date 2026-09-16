'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { aggregateAnswers } from '@/lib/scoring/answers';
import { resolveResult } from '@/lib/scoring/result';
import { clearQuizState, isQuizComplete, readQuizState } from '@/lib/storage';
import type { ResolvedResult } from '@/lib/scoring/types';
import { AttributeBars } from './AttributeBars';
import { SharePoster } from './SharePoster';
import { downloadDataUrl, posterToPng } from '@/lib/share/poster';
import { getPersonalityImage } from '@/lib/personality-images';
import { buildDetailedShareDescription, buildShareCopy } from '@/lib/share/copy';

type Phase = 'loading' | 'ready' | 'revealed';

function AnalysisScreen() {
  return <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center py-24 text-center"><div className="relative mb-8 h-28 w-full border-y border-ink/25"><div className="scan-line absolute left-0 right-0 top-1/2 h-0.5 bg-vermilion" /></div><p className="font-mono text-xs uppercase tracking-[.2em] text-vermilion">正在生成秋招人格档案…</p><div className="mt-7 grid gap-2 text-left font-mono text-[11px] text-ink/65"><span>✓ 分析投递行为</span><span>✓ 检测焦虑指数</span><span>✓ 检查 Offer 浓度</span><span>✓ 扫描牛客依赖</span><span>✓ 判断是否仍为正常人</span></div><p className="mt-8 font-mono text-[10px] uppercase tracking-[.14em] text-ink/45">正在匹配人格……</p></div>;
}

function ReadingScreen() {
  return <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center py-24 text-center"><div className="relative mb-8 h-28 w-full border-y border-ink/25" /><p className="font-mono text-xs uppercase tracking-[.2em] text-ink/55">正在读取候选档案…</p></div>;
}

export function ResultView() {
  const router = useRouter();
  const [result, setResult] = useState<ResolvedResult | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [copied, setCopied] = useState(false);
  const [posterBusy, setPosterBusy] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const state = readQuizState();
    if (!isQuizComplete(state)) {
      setPhase('ready');
      return;
    }
    setResult(resolveResult(aggregateAnswers(state.answers)));
    const timer = window.setTimeout(() => setPhase('ready'), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  const text = useMemo(() => (result ? buildShareCopy(result) : ''), [result]);

  async function copyText() {
    if (!text) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function savePoster() {
    if (!posterRef.current || !result) return;
    setPosterBusy(true);
    try {
      const dataUrl = await posterToPng(posterRef.current);
      downloadDataUrl(dataUrl, `jobti-${result.primary.code.toLowerCase()}-report.png`);
    } finally {
      setPosterBusy(false);
    }
  }

  function restart() {
    clearQuizState();
    router.push('/quiz');
  }

  if (!result && phase === 'loading') {
    return <main className="file-grid paper-noise min-h-screen"><div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-5 sm:px-8 sm:py-8"><header className="border-b-2 border-ink pb-4 font-bold tracking-[-.08em]">JOBTI<span className="text-vermilion">.</span></header><ReadingScreen /></div></main>;
  }

  if (!result) {
    return <main className="file-grid paper-noise flex min-h-screen items-center justify-center p-6"><div className="max-w-md border-2 border-ink bg-paper p-8 text-center shadow-file"><div className="stamp stamp-red">档案未完成</div><h1 className="mt-6 text-3xl font-bold tracking-[-.07em]">先完成 30 道题，报告才会出现。</h1><Link href="/quiz" className="mt-8 inline-flex min-h-12 items-center justify-center bg-vermilion px-6 font-bold text-paper focus:outline-none focus:ring-4 focus:ring-mustard">返回测试 ↗</Link></div></main>;
  }

  if (phase === 'loading') return <main className="file-grid paper-noise min-h-screen"><div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-5 sm:px-8 sm:py-8"><header className="border-b-2 border-ink pb-4 font-bold tracking-[-.08em]">JOBTI<span className="text-vermilion">.</span></header><AnalysisScreen /></div></main>;

  if (phase === 'ready') {
    return <main className="file-grid paper-noise min-h-screen"><div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-5 sm:px-8 sm:py-8"><header className="border-b-2 border-ink pb-4 font-bold tracking-[-.08em]">JOBTI<span className="text-vermilion">.</span></header><div className="flex flex-1 flex-col items-center justify-center py-24 text-center"><div className="stamp stamp-green">检测完成</div><h1 className="mt-7 text-[clamp(2.8rem,10vw,6rem)] font-bold leading-[.9] tracking-[-.1em]">你的秋招档案<br /><span className="text-pine">已经出炉。</span></h1><p className="mt-6 max-w-md text-sm leading-6 text-ink/65">一份由投递、焦虑、比较、情报和一点点玄学共同完成的报告。</p><button type="button" onClick={() => setPhase('revealed')} className="mt-9 min-h-14 bg-vermilion px-8 font-bold text-paper shadow-stamp transition-transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-mustard">查看我的 JOBTI ↗</button></div></div></main>;
  }

  const score = Math.min(100, Math.round(result.primaryScore.total));
  return (
    <main className="file-grid paper-noise min-h-screen">
      <div className="mx-auto w-full max-w-5xl px-5 py-5 sm:px-8 sm:py-8">
        <header className="flex items-start justify-between border-b-2 border-ink pb-4"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-ink/55">2027 autumn recruitment / report</p><h1 className="mt-2 text-3xl font-bold tracking-[-.08em]">JOBTI<span className="text-vermilion">.</span></h1></div><div className="stamp stamp-red">confidential</div></header>
        <section className="reveal-in border-b-2 border-ink py-10 sm:py-16"><div className="flex flex-wrap items-center gap-3"><span className="stamp stamp-green">{result.primary.rarity}</span><span className="font-mono text-[10px] uppercase tracking-[.18em] text-ink/45">algorithmic match / not a population percentile</span></div><div className="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(220px,.72fr)_minmax(300px,1fr)_auto] lg:items-end lg:gap-9"><figure className="m-0"><div className="relative aspect-[4/5] w-full overflow-hidden border-2 border-ink bg-ink/5 shadow-file"><Image data-result-primary-image src={getPersonalityImage(result.primary.code)} alt={`${result.primary.code} ${result.primary.name} 主人格人物图`} width={1122} height={1402} priority unoptimized sizes="(max-width: 1024px) 100vw, 300px" className="h-full w-full object-contain object-center" /></div><figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[.16em] text-ink/50">primary visual / {result.primary.code}</figcaption></figure><div><div className="text-[clamp(4rem,17vw,10rem)] font-bold leading-[.8] tracking-[-.12em] text-pine">{result.primary.code}</div><h2 className="mt-7 text-[clamp(2rem,7vw,4.5rem)] font-bold leading-[.95] tracking-[-.09em]">{result.primary.name}</h2><p className="mt-5 max-w-xl border-l-4 border-vermilion pl-4 text-xl leading-8">“{result.primary.tagline}”</p></div><div className="border-2 border-ink bg-mustard p-5 text-center shadow-stamp"><div className="font-mono text-[10px] uppercase tracking-[.12em]">人格匹配度</div><div className="mt-2 text-5xl font-bold tracking-[-.08em]">{score}<span className="text-2xl">%</span></div><div className="mt-1 max-w-[150px] font-mono text-[9px] leading-4">仅表示本次答案与人格规则的匹配度</div></div></div></section>

        <div className="grid gap-8 py-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-12">
          <div className="space-y-8">
            <section className="border-2 border-ink bg-paper p-6 shadow-file sm:p-8"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-vermilion">01 / 你是一个什么样的人</p><p className="mt-5 whitespace-pre-line text-lg leading-8">{buildDetailedShareDescription(result.primary)}</p></section>
            <section className="border-t-2 border-ink py-7"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-vermilion">02 / 突出属性</p><div className="mt-6"><AttributeBars scores={result.normalizedScores} /></div></section>
            <section className="grid gap-5 sm:grid-cols-2"><div className="border-t-2 border-ink pt-5"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-vermilion">03 / 典型症状</p><ul className="mt-4 space-y-3 text-sm leading-6">{result.primary.symptoms.map((symptom) => <li key={symptom} className="flex gap-2"><span className="text-vermilion">✳</span><span>{symptom}</span></li>)}</ul></div><div className="border-t-2 border-ink pt-5"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-vermilion">04 / 秋招口头禅</p><p className="mt-4 text-2xl font-bold leading-9 tracking-[-.04em]">“{result.primary.catchphrase}”</p></div></section>
            <section className="grid gap-5 sm:grid-cols-3"><div className="border-2 border-pine p-5"><p className="font-mono text-[10px] uppercase">特殊能力</p><p className="mt-4 text-sm leading-6">{result.primary.strength}</p></div><div className="border-2 border-vermilion p-5"><p className="font-mono text-[10px] uppercase">致命弱点</p><p className="mt-4 text-sm leading-6">{result.primary.weakness}</p></div><div className="border-2 border-ink p-5"><p className="font-mono text-[10px] uppercase">天敌</p><p className="mt-4 text-sm leading-6">{result.primary.enemy}</p></div></section>
          </div>
          <aside className="space-y-7 lg:pt-0"><section className="border-2 border-ink bg-pine p-6 text-paper shadow-file sm:p-8"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-mustard">05 / 最终诊断</p><p className="mt-6 text-2xl font-bold leading-9 tracking-[-.05em]">“{result.primary.diagnosis}”</p></section><section className="border-2 border-ink bg-mint p-6 sm:p-8"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-vermilion">06 / 分享提示</p><p className="mt-4 text-sm leading-7">这份结果适合配上人物卡发到小红书或群里。复制分享文案时，会自动带上你的性格描述、秋招状态、优势和提醒。</p></section></aside>
        </div>

        <section className="border-t-2 border-ink py-10"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-vermilion">08 / 分享你的档案</p><h2 className="mt-3 text-3xl font-bold tracking-[-.07em]">这份结果，值得发到群里。</h2></div><span className="font-mono text-[10px] text-ink/50">poster format / 1080 × 1920</span></div><div className="mt-7 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={savePoster} disabled={posterBusy} className="min-h-12 bg-vermilion px-6 font-bold text-paper shadow-stamp transition-transform hover:-translate-y-1 disabled:cursor-wait disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-mustard">{posterBusy ? '正在生成…' : '保存人格卡 ↓'}</button><button type="button" onClick={copyText} className="min-h-12 border-2 border-ink px-6 font-bold transition-colors hover:bg-ink hover:text-paper focus:outline-none focus:ring-4 focus:ring-mustard">{copied ? '已复制 ✓' : '复制分享文案'}</button><button type="button" onClick={restart} className="min-h-12 border border-ink/35 px-6 font-mono text-xs transition-colors hover:border-ink focus:outline-none focus:ring-4 focus:ring-mustard">重新测试 ↻</button></div></section>
        <footer className="flex flex-col gap-3 border-t border-ink/25 pt-5 font-mono text-[10px] uppercase tracking-[.12em] text-ink/50 sm:flex-row sm:justify-between"><span>JOBTI / end of report</span><span>not a psychological diagnosis / probably still accurate</span></footer>
        <SharePoster ref={posterRef} result={result} />
      </div>
    </main>
  );
}
