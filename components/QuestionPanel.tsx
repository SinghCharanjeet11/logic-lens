'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Question, Answer } from '@/lib/types';
import { Tag, SkipForward, ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';

const VoiceInput = dynamic(() => import('./VoiceInput'), { ssr: false });

interface QuestionPanelProps {
  questions: Question[];
  onSubmit: (answers: Answer[]) => void;
  language?: 'en' | 'hi';
  isLoading?: boolean;
}

export default function QuestionPanel({
  questions,
  onSubmit,
  language = 'en',
  isLoading = false
}: QuestionPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [isSliding, setIsSliding] = useState(false);
  const isHindi = language === 'hi';

  // Safety check for empty questions
  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">
          {isHindi ? 'कोई सवाल नहीं मिला' : 'No questions available'}
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentQuestionId = currentQuestion.id;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionId]: value
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setSlideDirection('left');
      setIsSliding(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsSliding(false);
      }, 150);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSlideDirection('right');
      setIsSliding(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setIsSliding(false);
      }, 150);
    }
  };

  const handleSkip = () => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionId]: ''
    }));
    if (!isLastQuestion) {
      handleNext();
    }
  };

  const handleSubmit = () => {
    const formattedAnswers: Answer[] = questions.map(q => ({
      questionId: q.id,
      answer: answers[q.id] || '',
      skipped: !answers[q.id] || answers[q.id].trim() === ''
    }));
    onSubmit(formattedAnswers);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {isHindi ? 'सवाल' : 'Question'} {currentIndex + 1} {isHindi ? 'का' : 'of'} {questions.length}
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card with Slide Transition */}
      <div className={`flex-1 transition-all duration-200 ease-out ${isSliding
        ? `opacity-0 ${slideDirection === 'left' ? '-translate-x-4' : 'translate-x-4'}`
        : 'opacity-100 translate-x-0'
        }`}>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-4 shadow-sm h-full">
          {/* Focus tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-medium mb-4 border border-indigo-100 dark:border-indigo-800">
            <Tag className="w-3 h-3" />
            {currentQuestion.focus?.replace('_', ' ') || 'General'}
          </div>

          {/* Question text */}
          <h3 className="text-[17px] font-medium text-slate-800 dark:text-slate-200 leading-[1.7] mb-6 tracking-[-0.01em]">
            {currentQuestion.question}
          </h3>

          {/* Answer area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                {isHindi ? 'आपका सोचना:' : 'What do you think?'}
              </label>
              <VoiceInput
                language={language}
                disabled={isLoading}
                onTranscript={(text) => {
                  const current = answers[currentQuestionId] || '';
                  handleAnswerChange(current ? `${current} ${text}` : text);
                }}
              />
            </div>
            <textarea
              value={answers[currentQuestionId] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={isHindi
                ? 'बताइए कि आपके हिसाब से यहाँ क्या होगा और क्यों...'
                : 'Explain what you think happens here and why...'}
              className="w-full h-36 px-4 py-3.5 bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 text-[15px] leading-relaxed
                placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:text-sm
                focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800
                resize-none transition-all duration-200"
              disabled={isLoading}
            />
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <SkipForward className="w-3 h-3 text-slate-300" />
              <span>
                {isHindi
                  ? 'पक्का नहीं? कोई बात नहीं — '
                  : "Not sure? That's okay — "}
              </span>
              <button
                type="button"
                onClick={handleSkip}
                className="text-indigo-500 hover:text-indigo-600 hover:underline font-medium transition-colors"
                disabled={isLoading}
              >
                {isHindi ? 'आगे बढ़ें' : 'skip ahead'}
              </button>
              <span className="text-slate-300">
                {isHindi ? '— हम फिर भी समझाएंगे' : "— we'll still explain it"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center gap-3">
        {/* Previous button */}
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentIndex === 0 || isLoading}
          className="px-4 py-2.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700
            disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium
            flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          {isHindi ? 'पिछला' : 'Previous'}
        </button>

        {/* Question dots */}
        <div className="flex gap-2">
          {questions.map((q, idx) => {
            const questionId = q.id;
            const hasAnswer = answers[questionId];
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                title={`Question ${idx + 1}${hasAnswer ? ' ✓' : ''}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentIndex
                  ? 'bg-indigo-500 w-8'
                  : hasAnswer
                    ? 'bg-indigo-200 w-2.5 hover:bg-indigo-300'
                    : 'bg-slate-200 dark:bg-slate-700 w-2.5 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                aria-label={`Question ${idx + 1}${hasAnswer ? ', answered' : ', not answered'}`}
              />
            );
          })}
        </div>

        {/* Next / Submit button */}
        {isLastQuestion ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl
              shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-[1.02]
              disabled:opacity-50 disabled:shadow-none disabled:scale-100 
              transition-all font-semibold text-sm flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isHindi ? 'विश्लेषण...' : 'Analyzing...'}
              </>
            ) : (
              <>
                {isHindi ? 'मेरी सोच जमा करें' : 'See My Results'}
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 
              disabled:opacity-50 transition-all duration-200 text-sm font-semibold 
              flex items-center gap-1.5 shadow-sm hover:shadow-md"
          >
            {isHindi ? 'अगला' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
