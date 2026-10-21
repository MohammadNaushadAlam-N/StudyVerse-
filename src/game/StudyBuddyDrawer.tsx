import React, { useState } from 'react';
import {
  studyBuddyClient,
  ClientExplainParams,
} from '../services/studyBuddyClient.ts';
import {
  TeachingLanguage,
  TeachingResponse,
  HintResponse,
  CheckQuestion,
} from '../server/studyBuddyService.ts';
import { Sparkles, HelpCircle, Lightbulb, BookOpen, AlertTriangle, CheckCircle, RefreshCw, X, ShieldAlert } from 'lucide-react';

interface StudyBuddyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chapterId?: string;
  conceptId?: string;
  conceptTitle?: string;
  currentLanguage?: TeachingLanguage;
  onLanguageChange?: (lang: TeachingLanguage) => void;
}

export const StudyBuddyDrawer: React.FC<StudyBuddyDrawerProps> = ({
  isOpen,
  onClose,
  chapterId = 'ch01',
  conceptId = 'concept_ch01_chemical_equations',
  conceptTitle = 'Chemical Reactions & Equations',
  currentLanguage = 'simpleEnglish',
  onLanguageChange,
}) => {
  const [language, setLanguage] = useState<TeachingLanguage>(currentLanguage);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<TeachingResponse | null>(null);
  const [hint, setHint] = useState<HintResponse | null>(null);
  const [customQuery, setCustomQuery] = useState<string>('');
  const [hintLevel, setHintLevel] = useState<1 | 2 | 3>(1);

  // Check question interaction state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswerResult, setShowAnswerResult] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleLanguageSelect = (lang: TeachingLanguage) => {
    setLanguage(lang);
    if (onLanguageChange) onLanguageChange(lang);
    // If response already present, re-fetch in new language
    if (response) {
      fetchExplanation(conceptId, undefined, lang);
    }
  };

  const fetchExplanation = async (cId?: string, query?: string, langOverride?: TeachingLanguage) => {
    setLoading(true);
    setHint(null);
    setSelectedAnswer(null);
    setShowAnswerResult(false);

    try {
      const res = await studyBuddyClient.explainConcept({
        chapterId,
        conceptId: cId,
        topicQuery: query,
        language: langOverride || language,
      });
      setResponse(res);
    } catch {
      // Handled inside studyBuddyClient fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchHint = async () => {
    setLoading(true);
    try {
      const res = await studyBuddyClient.getHint({
        chapterId,
        conceptId,
        language,
        hintLevel,
      });
      setHint(res);
      setHintLevel((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : 1));
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    fetchExplanation(undefined, customQuery);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-700 flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Drawer Header */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">SciBuddy Study Companion</h3>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CBSE 2026-27
                </span>
              </div>
              <p className="text-xs text-slate-400">NCERT Grounded Tutor • {conceptTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trilingual Toggle Bar */}
        <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Tutor Language:</span>
          <div className="flex rounded-md bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => handleLanguageSelect('simpleEnglish')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                language === 'simpleEnglish'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageSelect('hindi')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                language === 'hindi'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              हिन्दी (Hindi)
            </button>
            <button
              onClick={() => handleLanguageSelect('hinglish')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                language === 'hinglish'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hinglish
            </button>
          </div>
        </div>

        {/* Action Controls & Input */}
        <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchExplanation(conceptId)}
              disabled={loading}
              className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <BookOpen className="w-4 h-4" />
              Explain 5-Part Lesson
            </button>
            <button
              onClick={fetchHint}
              disabled={loading}
              className="py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
            >
              <Lightbulb className="w-4 h-4" />
              Hint (L{hintLevel})
            </button>
          </div>

          {/* Custom Question Ask */}
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Ask SciBuddy about reactions, balancing, or CBSE concepts..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !customQuery.trim()}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Ask
            </button>
          </form>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {loading && (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-sm text-slate-300 font-medium">SciBuddy is consulting verified NCERT Class 10 sources...</p>
              <p className="text-xs text-slate-500">Retrieving approved concepts & grounding explanations</p>
            </div>
          )}

          {/* Hint Card */}
          {!loading && hint && (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" />
                  Progressive Hint (Level {hint.hintLevel})
                </span>
                <span className="text-[10px] text-amber-400/80">Approved NCERT Guidance</span>
              </div>
              <p className="text-sm text-amber-100 leading-relaxed">{hint.hintText}</p>
              {hint.visualCue && (
                <p className="text-xs text-amber-300/90 italic pt-1 border-t border-amber-600/20">
                  🔍 Visual Cue: {hint.visualCue}
                </p>
              )}
            </div>
          )}

          {/* Unknown Topic Warning */}
          {!loading && response && response.status === 'unknown_topic' && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/50 text-rose-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                <span>Out of Syllabus / Unverified Topic</span>
              </div>
              <p className="text-xs text-rose-100 leading-relaxed">
                {response.message}
              </p>
              <div className="pt-2 border-t border-rose-800/40 flex items-center justify-between text-[11px] text-rose-300/80">
                <span>Guardrail: Academic Curriculum Safety</span>
                <button
                  onClick={() => fetchExplanation(conceptId)}
                  className="underline hover:text-white"
                >
                  Return to Approved Chapter 1 Concepts
                </button>
              </div>
            </div>
          )}

          {/* Content Unavailable Warning */}
          {!loading && response && response.status === 'unavailable' && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/50 text-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Source Content Unavailable</span>
              </div>
              <p className="text-xs text-amber-100 leading-relaxed">
                {response.message}
              </p>
            </div>
          )}

          {/* 5-Part Teaching Template Display */}
          {!loading && response && response.status === 'success' && (
            <div className="space-y-4">
              
              {/* Provenance Badge */}
              <div className="flex items-center justify-between text-[11px] px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  {response.source === 'gemini_grounded'
                    ? 'Gemini 3.8 Flash • Grounded in Approved NCERT'
                    : 'Verified Static NCERT Textbook Lesson'}
                </span>
                {response.cached && (
                  <span className="text-[10px] text-indigo-400 font-medium">Cached Response</span>
                )}
              </div>

              {/* 1. Simple Explanation */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  1. Simple Explanation (NCERT Core)
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {response.simpleExplanation}
                </p>
              </div>

              {/* 2. Real-Life Example */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  2. Everyday Real-Life Example
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {response.realLifeExample}
                </p>
              </div>

              {/* 3. Model / Visual Cue */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  3. 3D Model & Atomic Visual Cue
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {response.visualOrModelCue}
                </p>
              </div>

              {/* 4. One Misconception */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-600/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  4. Common Misconception (CBSE Caution)
                </div>
                <p className="text-sm text-rose-100 leading-relaxed">
                  {response.misconception}
                </p>
              </div>

              {/* 5. One Check Question */}
              {response.checkQuestion && (
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-600/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                      <HelpCircle className="w-4 h-4 text-indigo-400" />
                      5. Quick Concept Check
                    </div>
                    <span className="text-[10px] font-medium text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                      {response.checkQuestion.label}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-100">
                    {response.checkQuestion.questionText}
                  </p>

                  <div className="space-y-2">
                    {response.checkQuestion.options.map((opt, idx) => {
                      const isSelected = selectedAnswer === opt;
                      const isCorrect = opt === response.checkQuestion?.correctAnswer;

                      let btnStyle = 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500';
                      if (showAnswerResult) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-indigo-900/60 border-indigo-500 text-indigo-200';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (!showAnswerResult) {
                              setSelectedAnswer(opt);
                            }
                          }}
                          className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium transition-all ${btnStyle}`}
                        >
                          <span className="inline-block w-5 font-mono text-slate-400">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {!showAnswerResult && (
                    <button
                      onClick={() => setShowAnswerResult(true)}
                      disabled={!selectedAnswer}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Check Answer
                    </button>
                  )}

                  {showAnswerResult && (
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 font-bold">
                        {selectedAnswer === response.checkQuestion.correctAnswer ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Correct Answer!
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <X className="w-4 h-4" /> Not quite right
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {response.checkQuestion.explanation}
                      </p>
                      <p className="text-[10px] text-slate-500 pt-1 italic">
                        Notice: Practice checks with SciBuddy are non-punitive and do not affect your official board exam score.
                      </p>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* Initial Welcome State */}
          {!loading && !response && !hint && (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 mx-auto flex items-center justify-center text-indigo-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-200">Hi Cadet! I'm SciBuddy.</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                I can teach any Chapter 1 concept using our structured 5-part NCERT lesson format, provide balancing hints, or answer your chemistry doubts.
              </p>
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => fetchExplanation(conceptId)}
                  className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md"
                >
                  Start Chapter 1 Concept Lesson
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Guarantee */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
          <span>CBSE Class X Science 2026-27</span>
          <span>Zero Secret Disclosure • Offline Resilient</span>
        </div>

      </div>
    </div>
  );
};
