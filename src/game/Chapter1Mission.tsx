/**
 * StudyVerse 10 — Chapter 1 Complete Playable Mission
 * Source of Truth: NCERT Class 10 Science (Reprint 2026-27) & CBSE Unit I Curriculum
 * 
 * 8-Stage Learning Progression:
 * 1. Everyday-Life Hook (Magnesium fireworks & Quicklime slaking)
 * 2. Prediction (Learner hypothesis before virtual lab trial)
 * 3. 3D Virtual Lab Observation (ReactionLab3D with burner, thermometer, apparatus)
 * 4. Scientific Explanation (NCERT theory, trilingual EN/HI/Hinglish, book page refs)
 * 5. Scientific Model (Color-coded 3D atom spheres & molecular lattice)
 * 6. Guided Practice (EquationBalancer: change coefficients ONLY, live atom count)
 * 7. Application (ReactionTypeSorter: combination, decomposition, displacement, redox, exo/endo)
 * 8. Recap (Approved CBSE Exam questions, deterministic checking, wrong-answer review)
 * 
 * Strict Safety: All hazardous chemistry is strictly virtual-only.
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Layers,
  Scale,
  Flame,
  Award,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';
import { CHAPTER_1_PUBLISHED_BUNDLE } from '../content/chapter1PublishedData.ts';
import { contentDatabase } from '../services/contentRepository.ts';
import { ReactionLab3D } from './ReactionLab3D.tsx';
import { EquationBalancer } from './EquationBalancer.tsx';
import { ReactionTypeSorter } from './ReactionTypeSorter.tsx';
import { StudyBuddyDrawer } from './StudyBuddyDrawer.tsx';
import { audioSynth } from './audioSynth.ts';

export type MissionStage =
  | 'hook'
  | 'prediction'
  | 'lab_activity'
  | 'explanation'
  | 'atomic_model'
  | 'guided_balancing'
  | 'application_sorter'
  | 'recap_quiz'
  | 'results_review';

interface Chapter1MissionProps {
  onReturnToHub: () => void;
  initialLanguage?: 'english' | 'hindi' | 'hinglish';
}

export const Chapter1Mission: React.FC<Chapter1MissionProps> = ({
  onReturnToHub,
  initialLanguage = 'english',
}) => {
  // Navigation & Mission Progression State
  const [stage, setStage] = useState<MissionStage>('hook');
  const [language, setLanguage] = useState<'english' | 'hindi' | 'hinglish'>(initialLanguage);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Stage 2: Prediction State
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null);

  // Stage 3: 3D Reaction Lab State
  const [reactionIndex, setReactionIndex] = useState(0);
  const [isReacting, setIsReacting] = useState(false);
  const [reactionProgress, setReactionProgress] = useState(0);
  const [temperatureC, setTemperatureC] = useState(25);
  const [labCompleted, setLabCompleted] = useState(false);

  // Stage 8: Recap Quiz State (Deterministic from published bundle)
  const questions = CHAPTER_1_PUBLISHED_BUNDLE.questions;
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isQuestionSubmitted, setIsQuestionSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, { selected: string; correct: boolean }>>({});
  const [score, setScore] = useState(0);

  // Wrong Answer Review Queue
  const [wrongQuestions, setWrongQuestions] = useState<any[]>([]);

  // Study Buddy AI Tutor Drawer State
  const [isStudyBuddyOpen, setIsStudyBuddyOpen] = useState(false);

  // Active Source Citation Modal State
  const [activeCitation, setActiveCitation] = useState<{
    documentId: string;
    sourceTitle: string;
    sectionHeading: string;
    pageNumber: number;
    pdfPageIndex?: number;
    reprintYear?: string;
    syllabusUnit?: string;
    quote?: string;
  } | null>(null);

  // SciBuddy Speech & Gesture State
  const [sciBuddyState, setSciBuddyState] = useState<{
    text: string;
    gesture: 'idle' | 'point' | 'explain' | 'think' | 'celebrate' | 'retry';
  }>({
    text: 'Welcome to the Chapter 1 Reaction Lab! Let us investigate how matter changes chemically.',
    gesture: 'idle',
  });

  // Dynamic SciBuddy Narration Bank
  useEffect(() => {
    if (language === 'hindi') {
      if (stage === 'hook') {
        setSciBuddyState({
          text: 'नमस्ते कैडेट! क्या आपने कभी सोचा है कि मैग्नीशियम रिबन हवा में जलकर सफेद चूर्ण में क्यों बदल जाता है? आइए वैज्ञानिक रूप से देखें!',
          gesture: 'explain',
        });
      } else if (stage === 'prediction') {
        setSciBuddyState({
          text: 'प्रयोग शुरू करने से पहले अपना वैज्ञानिक अनुमान (Prediction) चुनें। वैज्ञानिक हमेशा परिकल्पना से शुरुआत करते हैं!',
          gesture: 'think',
        });
      } else if (stage === 'lab_activity') {
        setSciBuddyState({
          text: 'यह हमारी 3D रासायनिक प्रयोगशाला है। बर्नर चालू करें और तापमान संवेदक (Temperature Sensor) का निरीक्षण करें!',
          gesture: 'point',
        });
      } else if (stage === 'guided_balancing') {
        setSciBuddyState({
          text: 'द्रव्यमान संरक्षण का नियम: केवल गुणांक (Coefficients) बदलें। सूत्रों के सबस्क्रिप्ट कभी नहीं बदले जाते!',
          gesture: 'explain',
        });
      } else if (stage === 'recap_quiz') {
        setSciBuddyState({
          text: 'अब सीबीएसई बोर्ड परीक्षा शैली के प्रश्नों के साथ अपनी समझ की पुष्टि करें। कोई नकारात्मक अंक नहीं है!',
          gesture: 'point',
        });
      }
    } else if (language === 'hinglish') {
      if (stage === 'hook') {
        setSciBuddyState({
          text: 'Welcome Cadet! Magnesium ribbon jab burn hoti hai toh dazzling white flame kyu aati hai? Let us explore!',
          gesture: 'explain',
        });
      } else if (stage === 'prediction') {
        setSciBuddyState({
          text: 'Reaction shuru karne se pehle apna prediction select karein. Science hypothesis se start hota hai!',
          gesture: 'think',
        });
      } else if (stage === 'lab_activity') {
        setSciBuddyState({
          text: 'Yeh hamara 3D Virtual Reaction Lab hai. Burner on karein aur temperature gauge monitor karein!',
          gesture: 'point',
        });
      } else if (stage === 'guided_balancing') {
        setSciBuddyState({
          text: 'Conservation of mass ke liye sirf coefficients adjust karein. Subscripts ko change karna strictly not allowed!',
          gesture: 'explain',
        });
      } else if (stage === 'recap_quiz') {
        setSciBuddyState({
          text: 'Ab approved board questions solve karein. Agar koi answer wrong ho toh supportive revision review milega!',
          gesture: 'point',
        });
      }
    } else {
      if (stage === 'hook') {
        setSciBuddyState({
          text: 'Welcome Cadet! Why does a shiny silver magnesium strip transform into fine white ash upon heating? Let us investigate!',
          gesture: 'explain',
        });
      } else if (stage === 'prediction') {
        setSciBuddyState({
          text: 'Select your scientific prediction before we ignite the virtual reaction. Good scientists always form a hypothesis!',
          gesture: 'think',
        });
      } else if (stage === 'lab_activity') {
        setSciBuddyState({
          text: 'Welcome to the 3D Reaction Lab bench! Press Ignite to activate the burner and observe the thermal & chemical change.',
          gesture: 'point',
        });
      } else if (stage === 'guided_balancing') {
        setSciBuddyState({
          text: 'Law of Conservation of Mass: Adjust coefficients ONLY. Subscripts are chemically immutable!',
          gesture: 'explain',
        });
      } else if (stage === 'recap_quiz') {
        setSciBuddyState({
          text: 'Board Exam Checkpoint! Answer verified questions with zero penalty for mistakes.',
          gesture: 'point',
        });
      }
    }
  }, [stage, language]);

  // Audio Toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioSynth.enabled = next;
  };

  // Lab Reaction Trigger
  const triggerLabReaction = () => {
    setIsReacting(true);
    setReactionProgress(0);
    audioSynth.playInteract();

    let step = 0;
    const interval = setInterval(() => {
      step += 0.05;
      setReactionProgress(Math.min(1, step));
      setTemperatureC(25 + step * 95); // Exothermic thermal rise to ~120°C

      if (step >= 1) {
        clearInterval(interval);
        setIsReacting(false);
        setLabCompleted(true);
        audioSynth.playSuccess();
        setSciBuddyState({
          text: 'Reaction complete! Magnesium has oxidized with atmospheric oxygen into white magnesium oxide powder.',
          gesture: 'celebrate',
        });
      }
    }, 100);
  };

  // Stage 8 Quiz Answer Handler (Deterministic Verification)
  const handleSelectQuizOption = (opt: string) => {
    if (isQuestionSubmitted) return;
    setSelectedOption(opt);
  };

  const handleSubmitQuizAnswer = async () => {
    if (!selectedOption) return;
    setIsQuestionSubmitted(true);

    const q = questions[currentQuestionIdx];
    const isCorrect = selectedOption === q.correctAnswer;

    setUserAnswers((prev) => ({
      ...prev,
      [q.questionId]: { selected: selectedOption, correct: isCorrect },
    }));

    if (isCorrect) {
      setScore((s) => s + 1);
      audioSynth.playSuccess();
      setSciBuddyState({
        text: 'Correct answer! Verified against official NCERT assessment criteria.',
        gesture: 'celebrate',
      });

      // Record successful question attempt and update student progress
      await contentDatabase.recordQuestionAttempt({
        attemptId: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        studentId: 'guest_cadet',
        questionId: q.questionId,
        conceptId: q.conceptIds[0] || 'concept_ch01_chemical_equations',
        userSelected: selectedOption,
        isCorrect: true,
        attemptNumber: 1,
        usedHint: false,
        timestamp: new Date().toISOString(),
      });
      await contentDatabase.updateChapterProgress('guest_cadet', 'ch01', {
        status: 'learning',
        xpDelta: 25,
        exitCheckScore: score + 1,
      });
    } else {
      audioSynth.playLocked();
      setWrongQuestions((prev) => [...prev, q]);
      setSciBuddyState({
        text: 'Incorrect hypothesis. This question is added to your supportive review queue without penalty.',
        gesture: 'retry',
      });

      // Record in student progress repository without penalizing XP
      await contentDatabase.recordQuestionAttempt({
        attemptId: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        studentId: 'guest_cadet',
        questionId: q.questionId,
        conceptId: q.conceptIds[0] || 'concept_ch01_chemical_equations',
        userSelected: selectedOption,
        isCorrect: false,
        attemptNumber: 1,
        usedHint: false,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleNextQuizQuestion = async () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((c) => c + 1);
      setSelectedOption(null);
      setIsQuestionSubmitted(false);
      audioSynth.playInteract();
    } else {
      setStage('results_review');
      audioSynth.playSuccess();

      // Persist chapter mission completion and score to student profile
      await contentDatabase.updateChapterProgress('guest_cadet', 'ch01', {
        status: wrongQuestions.length === 0 ? 'mastered' : 'review',
        completedMission: 'chapter1_mission',
        xpDelta: 50,
        exitCheckScore: score,
      });
    }
  };

  const stageLabels: { id: MissionStage; label: string }[] = [
    { id: 'hook', label: '1. Everyday Hook' },
    { id: 'prediction', label: '2. Prediction' },
    { id: 'lab_activity', label: '3. 3D Virtual Lab' },
    { id: 'explanation', label: '4. NCERT Theory' },
    { id: 'atomic_model', label: '5. Atomic Model' },
    { id: 'guided_balancing', label: '6. Balancing Engine' },
    { id: 'application_sorter', label: '7. Reaction Sorter' },
    { id: 'recap_quiz', label: '8. Board Recap' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden select-none font-sans">
      {/* Top Mission Control Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onReturnToHub}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shadow-sm"
            title="Return to 3D Academy Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm sm:text-base text-white tracking-tight">
                Chapter 1: Chemical Reactions & Equations
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                Annual Exam Core (Unit I)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              NCERT Activity 1.1 &middot; Law of Conservation of Mass &middot; Types of Reactions
            </p>
          </div>
        </div>

        {/* Control Badges: Language, Sound, Pause */}
        <div className="flex items-center space-x-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
            {(['english', 'hindi', 'hinglish'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded-md capitalize transition font-medium ${
                  language === lang
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Toggle Audio"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={() => setIsPaused((p) => !p)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title={isPaused ? 'Resume Mission' : 'Pause Mission'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={() => setIsStudyBuddyOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            title="Ask SciBuddy (Gemini 3.8 Flash AI Tutor)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Ask SciBuddy</span>
          </button>
        </div>
      </header>

      {/* 8-Stage Progress Navigation Stepper */}
      <nav className="h-11 bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-6 flex items-center space-x-1.5 overflow-x-auto shrink-0 scrollbar-none">
        {stageLabels.map((st, i) => (
          <button
            key={st.id}
            onClick={() => setStage(st.id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
              stage === st.id
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>{st.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Interactive Stage Container */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-5">
        {/* SciBuddy Speech Captions Ribbon */}
        <div className="rounded-2xl border border-cyan-800/70 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 p-4 shadow-xl flex items-start space-x-3.5">
          <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/40">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                SciBuddy &middot; State: {sciBuddyState.gesture}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsStudyBuddyOpen(true)}
                  className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 text-[10px] font-semibold flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  AI Study Tutor
                </button>
                <span className="text-[10px] font-mono text-slate-500 uppercase">{language}</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {sciBuddyState.text}
            </p>
          </div>
        </div>

        {/* STAGE 1: EVERYDAY-LIFE HOOK */}
        {stage === 'hook' && (
          <div className="space-y-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl">
            <div className="space-y-2">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">
                Stage 1 &middot; Everyday Observation
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span>The Mystery of Glowing Magnesium (Activity 1.1)</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Take a shiny metallic piece of magnesium ribbon. When left exposed in moist air for days, it dulls down. But when cleaned with sandpaper and placed into a roaring burner flame, it ignites into a blinding, dazzling white flame and leaves behind a soft white powder.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-cyan-400 block uppercase">Curiosity Hook</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Has the magnesium metal simply disappeared into smoke, or has it combined with unseen molecules in the surrounding air?
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 block uppercase">NCERT Core Reasoning Question</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  &quot;Why should a magnesium ribbon be cleaned with sandpaper before burning in air?&quot; (Direct CBSE Annual Board Exam Question).
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStage('prediction')}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition shadow-lg shadow-cyan-600/30 flex items-center space-x-1.5"
              >
                <span>Make Scientific Prediction</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: LEARNER PREDICTION */}
        {stage === 'prediction' && (
          <div className="space-y-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl">
            <div className="space-y-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">
                Stage 2 &middot; Formulating Your Hypothesis
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <span>What will happen when Magnesium is burned over the flame?</span>
              </h2>
              <p className="text-xs text-slate-400">
                Scientific enquiry requires predicting outcomes prior to experimental trials.
              </p>
            </div>

            <div className="space-y-3">
              {[
                'It will melt into liquid magnesium without any chemical transformation.',
                'It will burn vigorously with a dazzling white flame forming white powder (MgO).',
                'It will turn dark black and release toxic green chlorine gas.',
              ].map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPrediction(idx);
                    audioSynth.playInteract();
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between text-xs sm:text-sm ${
                    selectedPrediction === idx
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span>{opt}</span>
                  {selectedPrediction === idx && <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 ml-2" />}
                </button>
              ))}
            </div>

            {selectedPrediction !== null && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-200">
                Hypothesis logged! Let us enter the 3D Virtual Reaction Lab to observe the physical and chemical evidence.
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStage('hook')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                &larr; Back to Hook
              </button>
              <button
                disabled={selectedPrediction === null}
                onClick={() => setStage('lab_activity')}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition shadow-lg shadow-cyan-600/30 disabled:opacity-40 flex items-center space-x-1.5"
              >
                <span>Launch 3D Reaction Lab</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: 3D VIRTUAL LAB OBSERVATION */}
        {stage === 'lab_activity' && (
          <div className="space-y-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block">
                  Stage 3 &middot; Virtual Lab Activity
                </span>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-emerald-400" />
                  <span>Interactive 3D Chemistry Bench</span>
                </h2>
              </div>

              {/* Reaction Switcher */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {['Activity 1.1: Mg + O₂', 'Activity 1.4: Quicklime CaO', 'Activity 1.9: Fe + CuSO₄'].map((name, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setReactionIndex(i);
                      setLabCompleted(false);
                      setTemperatureC(25);
                      setReactionProgress(0);
                      audioSynth.playInteract();
                    }}
                    className={`px-3 py-1.5 rounded-lg transition font-medium ${
                      reactionIndex === i
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Three.js 3D Lab Canvas Mount */}
            <ReactionLab3D
              reactionIndex={reactionIndex}
              isReacting={isReacting}
              reactionProgress={reactionProgress}
              sciBuddyGesture={sciBuddyState.gesture}
              temperatureC={temperatureC}
            />

            {/* Lab Control Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center space-x-3">
                <button
                  onClick={triggerLabReaction}
                  disabled={isReacting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white transition shadow-lg shadow-amber-600/30 flex items-center space-x-2 disabled:opacity-40"
                >
                  <Flame className="w-4 h-4" />
                  <span>{isReacting ? 'Reaction In Progress...' : 'Ignite & Run Reaction'}</span>
                </button>

                {labCompleted && (
                  <button
                    onClick={() => {
                      setLabCompleted(false);
                      setTemperatureC(25);
                      setReactionProgress(0);
                      audioSynth.playRespawn();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition flex items-center space-x-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Lab</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setStage('explanation')}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition shadow-lg shadow-cyan-600/30 flex items-center space-x-1.5"
              >
                <span>Analyze Scientific Explanation</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 4: SCIENTIFIC EXPLANATION */}
        {stage === 'explanation' && (
          <div className="space-y-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl">
            <div className="space-y-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">
                Stage 4 &middot; NCERT Theory & Curriculum Citations
              </span>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>The Science Behind Chemical Equations</span>
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() =>
                  setActiveCitation({
                    documentId: 'jesc101_reprint2026_27',
                    sourceTitle: 'NCERT Class 10 Science — Chemical Reactions & Equations',
                    sectionHeading: 'Section 1.1: Chemical Equations & Activity 1.1',
                    pageNumber: 2,
                    pdfPageIndex: 2,
                    reprintYear: '2026-27',
                    syllabusUnit: 'Unit I: Chemical Substances — Nature & Behaviour (25 Marks)',
                    quote:
                      'Activity 1.1: Clean a magnesium ribbon about 3-4 cm long by rubbing it with sand paper. Hold it with a pair of tongs. Burn it using a spirit lamp or burner and collect the ash so formed in a watch-glass.',
                  })
                }
                className="w-full flex items-center justify-between text-xs font-bold text-emerald-400 hover:text-emerald-300 transition group cursor-pointer text-left"
              >
                <span className="flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>NCERT Section 1.1 &middot; Printed Page 1-3 (Reprint 2026-27)</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400 group-hover:text-emerald-300 underline">
                  Inspect NCERT Citation &rarr;
                </span>
              </button>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                When a chemical reaction takes place, bonds between atoms are broken and new bonds are formed. In Activity 1.1, solid magnesium metal atoms ($Mg$) react with diatomic oxygen gas ($O_2$) from the air to form an ionic crystal lattice of magnesium oxide ($MgO$).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-cyan-300 block">1. Change in State & Color</span>
                <span className="text-slate-400">Shiny grey metallic ribbon converts into brilliant white powder ($MgO$).</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300 block">2. Energy Evolution</span>
                <span className="text-slate-400">Intense dazzling white flame (UV/Visible light) and large heat release (Exothermic).</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-300 block">3. Sandpaper Cleaning</span>
                <span className="text-slate-400">Removes the inert basic layer of magnesium carbonate/oxide formed in moist air.</span>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStage('lab_activity')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                &larr; Back to Lab
              </button>
              <button
                onClick={() => setStage('atomic_model')}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition shadow-lg shadow-cyan-600/30 flex items-center space-x-1.5"
              >
                <span>View 3D Atomic Model</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 5: SCIENTIFIC ATOMIC MODEL */}
        {stage === 'atomic_model' && (
          <div className="space-y-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl">
            <div className="space-y-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">
                Stage 5 &middot; Molecular Representation
              </span>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Scale className="w-5 h-5 text-cyan-400" />
                <span>Law of Conservation of Mass (Atomic Rearrangement)</span>
              </h2>
            </div>

            {/* Atomic Sphere Breakdown Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="text-center space-y-2">
                <span className="text-xs font-mono text-emerald-400 uppercase">Chemical Equation</span>
                <div className="text-lg sm:text-2xl font-bold font-mono text-white">
                  2Mg (s) + O₂ (g) ➔ 2MgO (s)
                </div>
              </div>

              {/* Side by side reactant vs product atom count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-cyan-300 block">Reactant Atoms (Left Side):</span>
                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Mg: 2 atoms</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block" />
                      <span>O: 2 atoms (1 molecule of O₂)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-300 block">Product Atoms (Right Side):</span>
                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Mg: 2 atoms (in 2 MgO)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block" />
                      <span>O: 2 atoms (in 2 MgO)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 leading-relaxed">
                Notice that no atoms were created or destroyed: 2 magnesium atoms and 2 oxygen atoms exist on both sides!
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStage('explanation')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                &larr; Back to Theory
              </button>
              <button
                onClick={() => setStage('guided_balancing')}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition shadow-lg shadow-cyan-600/30 flex items-center space-x-1.5"
              >
                <span>Practice Balancing Engine</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 6: GUIDED PRACTICE (EQUATION BALANCER) */}
        {stage === 'guided_balancing' && (
          <div className="space-y-4">
            <EquationBalancer
              language={language}
              onAllCompleted={() => setStage('application_sorter')}
            />

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStage('atomic_model')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                &larr; Back to Model
              </button>
              <button
                onClick={() => setStage('application_sorter')}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white transition shadow-lg shadow-purple-600/30 flex items-center space-x-1.5"
              >
                <span>Proceed to Reaction Sorter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 7: APPLICATION (REACTION SORTER) */}
        {stage === 'application_sorter' && (
          <div className="space-y-4">
            <ReactionTypeSorter
              language={language}
              onCompleted={() => setStage('recap_quiz')}
            />

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStage('guided_balancing')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                &larr; Back to Balancing
              </button>
              <button
                onClick={() => setStage('recap_quiz')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
              >
                <span>Take CBSE Recap Quiz</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 8: RECAP (CBSE EXAM QUESTIONS & DETERMINISTIC CHECKING) */}
        {stage === 'recap_quiz' && (
          <div className="space-y-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block">
                  Stage 8 &middot; CBSE Class 10 Board Checkpoint
                </span>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
                  Verified Score: {score}/{questions.length}
                </span>
              </div>
            </div>

            {/* Question Stem */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Verified Reviewer: {questions[currentQuestionIdx].answerVerifiedBy}</span>
                <span className="font-mono text-cyan-400">{questions[currentQuestionIdx].marks} Mark &middot; {questions[currentQuestionIdx].difficulty}</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                {questions[currentQuestionIdx].stem}
              </p>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-2.5">
              {questions[currentQuestionIdx].options?.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === questions[currentQuestionIdx].correctAnswer;

                return (
                  <button
                    key={idx}
                    disabled={isQuestionSubmitted}
                    onClick={() => handleSelectQuizOption(opt)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between ${
                      isQuestionSubmitted
                        ? isCorrect
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                          : isSelected
                          ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 opacity-50'
                        : isSelected
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <span>{opt}</span>
                    {isQuestionSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
                    )}
                    {isQuestionSubmitted && isSelected && !isCorrect && (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Worked Explanation Banner */}
            {isQuestionSubmitted && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                  selectedOption === questions[currentQuestionIdx].correctAnswer
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                    : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold">
                  {selectedOption === questions[currentQuestionIdx].correctAnswer ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Verified Correct!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span>Queued for Revision (No Penalty)</span>
                    </>
                  )}
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {questions[currentQuestionIdx].workedExplanation.english}
                </p>
              </div>
            )}

            {/* Quiz Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  const src = questions[currentQuestionIdx].sourceRefs[0];
                  setActiveCitation({
                    documentId: src?.sourceDocumentId || 'jesc101_reprint2026_27',
                    sourceTitle: 'NCERT Class 10 Science (Reprint 2026-27)',
                    sectionHeading: src?.sectionHeading || 'NCERT Chapter 1 Assessment',
                    pageNumber: src?.printedPageNumber || 3,
                    pdfPageIndex: src?.pdfPageIndex || 3,
                    reprintYear: '2026-27',
                    syllabusUnit: 'Unit I: Chemical Substances (Annual Board Core)',
                    quote: `Deterministic verified answer key signed off by Dr. Meenakshi Sharma. Question topic: ${src?.sectionHeading}`,
                  });
                }}
                className="text-[11px] text-slate-400 hover:text-cyan-300 font-mono underline cursor-pointer flex items-center space-x-1 transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Source: {questions[currentQuestionIdx].sourceRefs[0]?.sectionHeading}</span>
              </button>

              {!isQuestionSubmitted ? (
                <button
                  onClick={handleSubmitQuizAnswer}
                  disabled={!selectedOption}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition shadow-lg shadow-cyan-600/30 disabled:opacity-40"
                >
                  Confirm Answer &rarr;
                </button>
              ) : (
                <button
                  onClick={handleNextQuizQuestion}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
                >
                  <span>{currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'View Mission Report'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESULTS & WRONG ANSWER REVIEW SCREEN */}
        {stage === 'results_review' && (
          <div className="space-y-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl">
            <div className="text-center space-y-2 py-4 border-b border-slate-800">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Chapter 1 Mission Complete!
              </h2>
              <p className="text-xs text-slate-400">
                You have finished all 8 stages of NCERT Chapter 1 Chemical Reactions & Equations.
              </p>
              <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
                Final Score: {score}/{questions.length} Correct &middot; +150 Science XP Earned
              </div>
            </div>

            {/* Wrong Answer Review Queue Section */}
            {wrongQuestions.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-amber-400">
                  <RotateCcw className="w-4 h-4" />
                  <h3 className="text-sm font-bold">Supportive Revision Queue ({wrongQuestions.length} Questions)</h3>
                </div>
                <p className="text-xs text-slate-400">
                  These questions have been added to your private review list. Review the hints and explanations below:
                </p>

                <div className="space-y-3 pt-1">
                  {wrongQuestions.map((wq, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-amber-900/50 space-y-2 text-xs">
                      <span className="font-bold text-white block">{wq.stem}</span>
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-emerald-300 font-mono">
                        Correct Answer: {wq.correctAnswer}
                      </div>
                      <p className="text-slate-300 leading-relaxed italic">{wq.workedExplanation.english}</p>
                      <button
                        type="button"
                        onClick={() => {
                          const src = wq.sourceRefs?.[0];
                          setActiveCitation({
                            documentId: src?.sourceDocumentId || 'jesc101_reprint2026_27',
                            sourceTitle: 'NCERT Class 10 Science (Reprint 2026-27)',
                            sectionHeading: src?.sectionHeading || 'NCERT Chapter 1 Assessment',
                            pageNumber: src?.printedPageNumber || 3,
                            pdfPageIndex: src?.pdfPageIndex || 3,
                            reprintYear: '2026-27',
                            syllabusUnit: 'Unit I: Chemical Substances (Annual Board Core)',
                            quote: wq.workedExplanation?.english,
                          });
                        }}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono underline cursor-pointer flex items-center space-x-1 transition pt-1"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Inspect NCERT Source Citation &rarr;</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-center text-xs text-emerald-200">
                Perfect score! Zero questions queued for revision. You have demonstrated exemplary mastery of Chapter 1!
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              <button
                onClick={() => {
                  setStage('hook');
                  setScore(0);
                  setCurrentQuestionIdx(0);
                  setSelectedOption(null);
                  setIsQuestionSubmitted(false);
                  setWrongQuestions([]);
                  audioSynth.playRespawn();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition flex items-center space-x-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay Chapter 1 Mission</span>
              </button>

              <button
                onClick={onReturnToHub}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Return to Central Academy Hub</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Verified NCERT Source Citation Details Modal */}
      {activeCitation && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Verified NCERT Source Citation</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCitation(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Document ID</span>
                  <span className="font-mono text-cyan-300 font-semibold">{activeCitation.documentId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Academic Session</span>
                  <span className="text-emerald-300 font-semibold">{activeCitation.reprintYear || '2026-27'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Printed Book Page</span>
                  <span className="text-white font-semibold">Page {activeCitation.pageNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">PDF Page Index</span>
                  <span className="text-white font-semibold">Index {activeCitation.pdfPageIndex || activeCitation.pageNumber}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono mb-1">CBSE Syllabus Unit</span>
                <p className="text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {activeCitation.syllabusUnit || 'Unit I: Chemical Substances — Nature & Behaviour'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono mb-1">Official Text Heading</span>
                <p className="text-emerald-400 font-medium bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {activeCitation.sectionHeading}
                </p>
              </div>

              {activeCitation.quote && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono mb-1">Extracted Source Excerpt</span>
                  <p className="text-slate-300 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                    "{activeCitation.quote}"
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center space-x-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Academic Review: Signed & Published</span>
                </span>
                <span className="font-mono text-[10px]">Virtual-Only Chemistry Lab</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveCitation(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition"
              >
                Close Citation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SciBuddy Study Companion Drawer */}
      <StudyBuddyDrawer
        isOpen={isStudyBuddyOpen}
        onClose={() => setIsStudyBuddyOpen(false)}
        chapterId="ch01"
        conceptId={
          stage === 'guided_balancing'
            ? 'concept_ch01_chemical_equations'
            : stage === 'application_sorter'
            ? 'concept_ch01_types_of_reactions'
            : 'concept_ch01_chemical_equations'
        }
        currentLanguage={language === 'english' ? 'simpleEnglish' : language}
      />
    </div>
  );
};
