'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUnlockedHiddenQuestions, PROGRESS_OPTIONS, QUESTIONS, START_OPTIONS, TOTAL_QUIZ_QUESTIONS } from '@/data/questions';
import { feedbackForAnswers, type QuizAnswers } from '@/lib/scoring/answers';
import { clearQuizState, ensureFeedbackPlan, createEmptyQuizState, isQuizComplete, readQuizState, writeQuizState, type QuizState } from '@/lib/storage';
import { markFeedbackShown, shouldShowFeedback } from '@/lib/feedback';
import { ProgressBar } from './ProgressBar';
import { QuestionCard } from './QuestionCard';

function firstUnansweredStep(answers: QuizAnswers): number {
  if (!PROGRESS_OPTIONS.some((option) => option.id === answers.q0)) return 0;
  if (!START_OPTIONS.some((option) => option.id === answers.start)) return 1;
  const index = QUESTIONS.findIndex((question) => !question.options.some((option) => option.id === answers[question.id]));
  if (index !== -1) return index + 2;
  const hiddenIndex = getUnlockedHiddenQuestions(answers).findIndex((question) => !question.options.some((option) => option.id === answers[question.id]));
  return hiddenIndex === -1 ? QUESTIONS.length + 1 : QUESTIONS.length + hiddenIndex + 2;
}

function getFallbackFeedback(step: number): string {
  return ['系统已记录你的精神状态。', '招聘网站感谢你的 DAU 贡献。', '情报部门已经开始超负荷运行。', '科学部分已结束，正在连接宇宙。'][Math.max(0, Math.floor(step / 7)) % 4];
}

export function QuizFlow() {
  const router = useRouter();
  const [state, setState] = useState<QuizState>(() => createEmptyQuizState());
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const questionTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const startIntent = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('start') === '1';
    const stored = ensureFeedbackPlan(readQuizState());
    const semanticallyComplete = isQuizComplete(stored);
    let restored: QuizState = { ...stored, complete: semanticallyComplete };
    if (startIntent && semanticallyComplete) {
      clearQuizState();
      restored = createEmptyQuizState();
    }
    setState(restored);
    setStep(firstUnansweredStep(restored.answers));
    setReady(true);
    writeQuizState(restored);
    if (startIntent) router.replace('/quiz');
    else if (semanticallyComplete) router.replace('/result');
  }, [router]);

  useEffect(() => {
    if (ready) questionTitleRef.current?.focus();
  }, [ready, step]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2400);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const selectedCount = useMemo(() => Object.keys(state.answers).length, [state.answers]);
  const hiddenQuestions = useMemo(() => getUnlockedHiddenQuestions(state.answers), [state.answers]);
  const allQuestions = useMemo(() => [...QUESTIONS, ...hiddenQuestions], [hiddenQuestions]);
  const totalScreens = allQuestions.length + 2;
  const progressQuestion = Math.max(0, Math.min(TOTAL_QUIZ_QUESTIONS, step - 1));
  const currentQuestion = step >= 2 ? allQuestions[step - 2] : null;
  const currentOptions = step === 0 ? PROGRESS_OPTIONS : step === 1 ? START_OPTIONS : currentQuestion?.options ?? [];
  const selectedId = step === 0 ? state.answers.q0 : step === 1 ? state.answers.start : currentQuestion ? state.answers[currentQuestion.id] : undefined;

  if (!ready) {
    return <main className="flex min-h-screen items-center justify-center bg-paper p-6"><p className="font-mono text-xs uppercase tracking-[.18em] text-ink/55">retrieving candidate file…</p></main>;
  }

  function selectAnswer(answerId: string) {
    const key = step === 0 ? 'q0' : step === 1 ? 'start' : currentQuestion?.id;
    if (!key) return;
    const answers = { ...state.answers, [key]: answerId };
    const lastQuestion = step === totalScreens - 1;
    const currentState = ensureFeedbackPlan(state);
    const currentPlan = {
      milestones: currentState.feedbackMilestones ?? [],
      shown: currentState.feedbackShown ?? [],
    };
    const nextFormalCount = QUESTIONS.filter((question) => Boolean(answers[question.id])).length;
    const willShowFeedback = shouldShowFeedback(currentPlan, nextFormalCount);
    const nextPlan = willShowFeedback ? markFeedbackShown(currentPlan, nextFormalCount) : currentPlan;
    const nextState: QuizState = { ...currentState, answers, complete: lastQuestion, feedbackMilestones: nextPlan.milestones, feedbackShown: nextPlan.shown, updatedAt: Date.now() };
    setState(nextState);
    writeQuizState(nextState);
    const nextFeedback = feedbackForAnswers(answers);
    if (willShowFeedback) setFeedback(nextFeedback ?? getFallbackFeedback(nextFormalCount));
    if (lastQuestion) {
      router.push('/result');
      return;
    }
    setStep((current) => Math.min(totalScreens - 1, current + 1));
  }

  function goBack() {
    setFeedback(null);
    setStep((current) => Math.max(0, current - 1));
  }

  return (
    <main className="file-grid paper-noise min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-5 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between border-b-2 border-ink pb-4">
          <button type="button" onClick={() => router.push('/')} className="font-bold tracking-[-.08em] focus:outline-none focus:ring-4 focus:ring-mustard">JOBTI<span className="text-vermilion">.</span></button>
          <span className="font-mono text-[10px] uppercase tracking-[.16em] text-ink/55">candidate file / in progress</span>
        </header>

        <div className="flex items-center gap-4 py-5">
          <button type="button" onClick={goBack} disabled={step === 0} className="inline-flex min-h-10 items-center border border-ink/35 px-3 font-mono text-[10px] uppercase tracking-[.12em] text-ink/65 transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30 focus:outline-none focus:ring-4 focus:ring-mustard">← 返回</button>
          <div className="flex-1"><ProgressBar current={progressQuestion} total={TOTAL_QUIZ_QUESTIONS} /></div>
          <span className="min-w-[52px] text-right font-mono text-[11px] font-bold">{step < 2 ? 'Q0' : currentQuestion?.hidden ? '支线' : `${String(progressQuestion).padStart(2, '0')} / 30`}</span>
        </div>

        {feedback ? <div role="status" aria-live="polite" className="mb-4 border-l-4 border-mustard bg-mint px-4 py-3 font-mono text-xs text-ink reveal-in">{feedback}</div> : null}

        <div className="flex flex-1 items-start py-8 sm:py-12">
          {step === 0 ? <QuestionCard headingRef={questionTitleRef} eyebrow="秋招进度 / Q0" prompt="你现在处于秋招的哪一格？" intro="先让系统知道你的当前战场。没有标准答案，只有不同程度的“还在流程里”。" options={PROGRESS_OPTIONS} selectedId={selectedId} onSelect={(option) => selectAnswer(option.id)} /> : null}
          {step === 1 ? <QuestionCard headingRef={questionTitleRef} eyebrow="开始时间 / Q-START" prompt="你是什么时候开始认真投秋招的？" intro="时间线会影响档案里的迟到指数，但不会影响你的尊严。" options={START_OPTIONS} selectedId={selectedId} onSelect={(option) => selectAnswer(option.id)} /> : null}
          {step >= 2 && currentQuestion ? <QuestionCard headingRef={questionTitleRef} eyebrow={currentQuestion.eyebrow} prompt={currentQuestion.prompt} intro={currentQuestion.hidden ? '你刚刚的选择触发了一条隐藏记录。它不计入主线进度，但会影响最终鉴定。' : undefined} options={currentOptions} selectedId={selectedId} onSelect={(option) => selectAnswer(option.id)} /> : null}
        </div>

        <footer className="border-t border-ink/25 pt-4 font-mono text-[10px] uppercase tracking-[.12em] text-ink/50">
          <div className="flex items-center justify-between gap-4"><span>autosaved to candidate file</span><span>{selectedCount} answers logged</span></div>
        </footer>
      </div>
    </main>
  );
}
