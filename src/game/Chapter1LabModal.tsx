/**
 * StudyVerse 10 — Chapter 1: Chemical Reactions & Equations
 * First Playable Slice (Mission Lab)
 * Source of Truth: NCERT Class 10 Science Chapter 1 (Activity 1.1)
 * 
 * Features:
 * - Real-world apparatus view vs conceptual particle view vs balanced equation
 * - Everyday hook -> Learner prediction -> Virtual activity observation -> Scientific explanation
 * - Trilingual SciBuddy narration (English, Hindi, Hinglish)
 * - Formative recall check with supportive retry
 * - Return to Academy Hub portal button
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { audioSynth } from './audioSynth.ts';

interface Chapter1LabModalProps {
  onClose: () => void;
  language?: 'english' | 'hindi' | 'hinglish';
}

export const Chapter1LabModal: React.FC<Chapter1LabModalProps> = ({
  onClose,
  language = 'english',
}) => {
  const [activeStep, setActiveStep] = useState<'hook' | 'prediction' | 'experiment' | 'model' | 'quiz'>('hook');
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isBurning, setIsBurning] = useState(false);
  const [burnCompleted, setBurnCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<'apparatus' | 'particle' | 'equation'>('apparatus');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [activeLang, setActiveLang] = useState<'english' | 'hindi' | 'hinglish'>(language);

  const handleStartBurn = () => {
    setIsBurning(true);
    audioSynth.playInteract();
    setTimeout(() => {
      setIsBurning(false);
      setBurnCompleted(true);
      audioSynth.playSuccess();
    }, 2500);
  };

  const handleReset = () => {
    setIsBurning(false);
    setBurnCompleted(false);
    audioSynth.playRespawn();
  };

  // Trilingual text mappings
  const t = {
    english: {
      chapterTag: 'NCERT Class 10 &middot; Chapter 1',
      title: 'Chemical Reactions & Equations: Activity 1.1',
      subtitle: 'Burning of Magnesium Ribbon in Air',
      hookTitle: '1. The Everyday Observation (Hook)',
      hookDesc:
        'Have you noticed how metals change when heated strongly? Take a piece of magnesium ribbon. When cleaned with sandpaper and ignited over a flame, something extraordinary happens. What will you see?',
      predictPrompt: 'Make your scientific prediction before igniting:',
      options: [
        'It will simply melt into liquid magnesium without any flame.',
        'It will burn with a dazzling white flame and turn into white powder.',
        'It will turn black and emit green toxic smoke.',
      ],
      apparatusView: 'Real Apparatus View',
      particleView: '3D Particle Lattice View',
      equationView: 'Chemical Equation',
      igniteBtn: 'Ignite Magnesium Ribbon over Burner',
      burningText: 'Burning in air with intense white flame...',
      burnedResult: 'Magnesium has reacted with atmospheric oxygen to form Magnesium Oxide (MgO) powder!',
      sandpaperNote:
        'NCERT Key Fact: The magnesium ribbon is rubbed with sandpaper before burning to remove the protective layer of basic magnesium carbonate/oxide formed by exposure to moist air.',
      balancedEq: '2Mg (s) + O₂ (g) ➔ 2MgO (s) + Heat + Light',
      quizTitle: 'Quick Concept Check',
      quizQuestion: 'Why is the burning of magnesium ribbon classified as a Chemical Change and Combination Reaction?',
      quizOptions: [
        'Because only the shape of the metal changes without new substances forming.',
        'Because two reactants (Mg and O₂) combine to form a single new product (MgO) with completely new chemical properties.',
        'Because magnesium can easily be reversed back to ribbon with a magnet.',
      ],
      correctFeedback: 'Correct! Two elements combine into a single substance (Combination reaction), producing heat and light (Exothermic).',
      incorrectFeedback: 'Try again! Notice how Magnesium and Oxygen combine to form a new chemical compound (MgO) with white powdery properties.',
    },
    hindi: {
      chapterTag: 'एनसीईआरटी कक्षा 10 &middot; अध्याय 1',
      title: 'रासायनिक अभिक्रियाएँ एवं समीकरण: क्रियाकलाप 1.1',
      subtitle: 'वायु में मैग्नीशियम रिबन का दहन',
      hookTitle: '1. दैनिक जीवन का अनुभव (हुक)',
      hookDesc:
        'क्या आपने कभी देखा है कि तीव्र गर्म करने पर धातुएँ कैसे बदलती हैं? लगभग 3-4 सेमी लंबा मैग्नीशियम रिबन लें। रेगमाल (sandpaper) से रगड़कर साफ करने के बाद जब इसे बर्नर पर जलाया जाता है, तो क्या होता है?',
      predictPrompt: 'दहन करने से पहले अपना वैज्ञानिक अनुमान (Prediction) चुनें:',
      options: [
        'यह बिना किसी लौ के केवल पिघल जाएगा।',
        'यह चमकदार श्वेत (सफेद) लौ के साथ जलकर सफेद चूर्ण में बदल जाएगा।',
        'यह काला पड़ जाएगा और जहरीला धुआँ छोड़ेगा।',
      ],
      apparatusView: 'उपकरण दृश्य (Apparatus)',
      particleView: 'कण मॉडल (3D Particles)',
      equationView: 'संतुलित समीकरण',
      igniteBtn: 'मैग्नीशियम रिबन को बर्नर पर प्रज्वलित करें',
      burningText: 'तीव्र चमकदार सफेद लौ के साथ जल रहा है...',
      burnedResult: 'मैग्नीशियम ने वायु में उपस्थित ऑक्सीजन से अभिक्रिया कर मैग्नीशियम ऑक्साइड (MgO) का सफेद चूर्ण बनाया!',
      sandpaperNote:
        'एनसीईआरटी मुख्य बिंदु: मैग्नीशियम रिबन को जलाने से पहले रेगमाल से रगड़ा जाता है ताकि उस पर जमी क्षारीय मैग्नीशियम ऑक्साइड/कार्बोनेट की परत हट सके।',
      balancedEq: '2Mg (ठोस) + O₂ (गैस) ➔ 2MgO (ठोस) + ऊष्मा + प्रकाश',
      quizTitle: 'अवधारणा जाँच (Concept Check)',
      quizQuestion: 'मैग्नीशियम रिबन का जलना एक संयोजन अभिक्रिया (Combination Reaction) क्यों है?',
      quizOptions: [
        'क्योंकि केवल धातु का आकार बदलता है, कोई नया पदार्थ नहीं बनता।',
        'क्योंकि दो अभिकारक (Mg और O₂) मिलकर एक एकल उत्पाद (MgO) बनाते हैं जिसके गुण बिल्कुल नए हैं।',
        'क्योंकि इसे चुंबक से वापस रिबन बनाया जा सकता है।',
      ],
      correctFeedback: 'बिल्कुल सही! दो अभिकारक मिलकर एक उत्पाद (MgO) बनाते हैं, अतः यह संयोजन एवं ऊष्माक्षेपी अभिक्रिया है।',
      incorrectFeedback: 'पुनः प्रयास करें! ध्यान दें कि मैग्नीशियम और ऑक्सीजन जुड़कर एक नया रासायनिक यौगिक बना रहे हैं।',
    },
    hinglish: {
      chapterTag: 'NCERT Class 10 &middot; Chapter 1',
      title: 'Chemical Reactions & Equations: Activity 1.1',
      subtitle: 'Burning of Magnesium Ribbon in Air',
      hookTitle: '1. Everyday Observation (Hook)',
      hookDesc:
        'Jab magnesium ribbon ko flame me heat karte hain, toh kya hota hai? Sandpaper se clean karne ke baad jab ise burner par ignite kiya jaata hai, toh scientific observation kya hoga?',
      predictPrompt: 'Ignite karne se pehle apna prediction choose karein:',
      options: [
        'Yeh bina kisi flame ke melt hokar liquid ban jaayega.',
        'Yeh dazzling white flame ke saath jalega aur white powder MgO banayega.',
        'Yeh black ho jaayega aur green smoke release karega.',
      ],
      apparatusView: 'Real Apparatus View',
      particleView: '3D Particle Lattice View',
      equationView: 'Balanced Chemical Equation',
      igniteBtn: 'Burner par Magnesium Ribbon ignite karein',
      burningText: 'Intense dazzling white flame ke saath jal raha hai...',
      burnedResult: 'Magnesium ne air ki Oxygen ke saath react karke Magnesium Oxide (MgO) powder banaya!',
      sandpaperNote:
        'NCERT Fact: Jalane se pehle ribbon ko sandpaper se clean karte hain taaki moist air se bani basic magnesium oxide/carbonate layer remove ho sake.',
      balancedEq: '2Mg (s) + O₂ (g) ➔ 2MgO (s) + Heat + Light',
      quizTitle: 'Quick Recall Check',
      quizQuestion: 'Magnesium ka jalna Combination Reaction kyu kehlata hai?',
      quizOptions: [
        'Kyunki metal ka physical shape change hota hai.',
        'Kyunki do reactants (Mg + O₂) judkar ek single product (MgO) banate hain.',
        'Kyunki ise magnet se wapas reverse kiya ja sakta hai.',
      ],
      correctFeedback: 'Bilkul sahi! Two reactants combine to give one single product (Combination reaction).',
      incorrectFeedback: 'Dubara try karein! Observe karein ki do alag substances judkar ek single new product bana rahe hain.',
    },
  }[activeLang];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="Return to Academy Hub"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block" dangerouslySetInnerHTML={{ __html: t.chapterTag }} />
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>{t.title}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Annual Exam Core
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
              {(['english', 'hindi', 'hinglish'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-2.5 py-1 rounded-md capitalize transition font-medium ${
                    activeLang === lang ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              Back to Hub
            </button>
          </div>
        </div>

        {/* Step Navigation Bar */}
        <div className="bg-slate-950/50 px-5 py-2.5 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto text-xs">
          {[
            { id: 'hook', label: '1. Hook & Observation' },
            { id: 'prediction', label: '2. Your Prediction' },
            { id: 'experiment', label: '3. Interactive Burning' },
            { id: 'model', label: '4. Scientific Model & Equation' },
            { id: 'quiz', label: '5. Concept Check' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStep(st.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                activeStep === st.id
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* STEP 1: HOOK */}
          {activeStep === 'hook' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-amber-400 flex items-center space-x-2">
                  <Flame className="w-4 h-4" />
                  <span>{t.hookTitle}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{t.hookDesc}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">NCERT Activity 1.1 Caution</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This activity needs the teacher’s assistance. It would be suitable for students to wear suitable eye protection (safety glasses), because magnesium burns with an intense UV white flame.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">Key NCERT Reasoning Question</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    &quot;Why should a magnesium ribbon be cleaned before burning in air?&quot; (Direct CBSE Board Exam Question).
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveStep('prediction')}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition shadow-lg shadow-cyan-600/30"
                >
                  Proceed to Prediction &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PREDICTION */}
          {activeStep === 'prediction' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-cyan-400 flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>{t.predictPrompt}</span>
                </h3>
                <div className="space-y-2">
                  {t.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrediction(opt)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between ${
                        prediction === opt
                          ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <span>{opt}</span>
                      {prediction === opt && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {prediction && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200">
                  Hypothesis logged! Now let us run the 3D experiment to verify your scientific intuition against actual observations.
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveStep('hook')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 transition"
                >
                  &larr; Back
                </button>
                <button
                  onClick={() => setActiveStep('experiment')}
                  disabled={!prediction}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition shadow-lg shadow-cyan-600/30 disabled:opacity-40"
                >
                  Open Interactive Lab &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: EXPERIMENT & APPARATUS */}
          {activeStep === 'experiment' && (
            <div className="space-y-5">
              {/* Representation View Tabs */}
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setViewMode('apparatus')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    viewMode === 'apparatus'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.apparatusView}
                </button>
                <button
                  onClick={() => setViewMode('particle')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    viewMode === 'particle'
                      ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.particleView}
                </button>
                <button
                  onClick={() => setViewMode('equation')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    viewMode === 'equation'
                      ? 'bg-slate-800 text-emerald-300 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.equationView}
                </button>
              </div>

              {/* View 1: Real Apparatus View */}
              {viewMode === 'apparatus' && (
                <div className="relative rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[260px] overflow-hidden">
                  {/* Bunsen Burner Flame & Tongs Graphic */}
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Burner Base */}
                    <div className="absolute bottom-2 w-16 h-8 bg-slate-700 rounded-t-lg border border-slate-600" />
                    <div className="absolute bottom-10 w-4 h-16 bg-slate-600" />

                    {/* Flame */}
                    <div
                      className={`absolute bottom-24 transition-all duration-300 flex items-center justify-center ${
                        isBurning ? 'scale-150' : 'scale-100'
                      }`}
                    >
                      <div className="w-8 h-16 bg-gradient-to-t from-blue-600 via-amber-400 to-yellow-200 rounded-full blur-[2px] animate-pulse" />
                      {isBurning && (
                        <div className="absolute w-24 h-24 bg-white rounded-full blur-md opacity-90 animate-ping" />
                      )}
                    </div>

                    {/* Magnesium Ribbon & Tongs */}
                    <div className="absolute top-8 right-6 flex items-center">
                      <div className="w-20 h-1.5 bg-slate-400 rounded-l" />
                      <div
                        className={`w-12 h-2.5 rounded transition-all duration-700 ${
                          burnCompleted
                            ? 'bg-slate-200 shadow-inner'
                            : isBurning
                            ? 'bg-white shadow-[0_0_25px_#fff]'
                            : 'bg-gradient-to-r from-zinc-300 to-zinc-400 border border-zinc-200'
                        }`}
                      />
                    </div>

                    {/* Watch glass collecting MgO powder */}
                    <div className="absolute bottom-0 right-4 w-24 h-5 bg-cyan-900/40 border border-cyan-500/50 rounded-b-full flex items-center justify-center">
                      {burnCompleted && (
                        <div className="w-12 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff] animate-fade-in" />
                      )}
                    </div>
                  </div>

                  {/* Dynamic Status Banner */}
                  <div className="mt-4 text-center space-y-1">
                    {isBurning && (
                      <span className="text-xs font-bold text-white bg-amber-500/30 px-3 py-1 rounded-full border border-amber-400/50 animate-pulse">
                        {t.burningText}
                      </span>
                    )}
                    {burnCompleted && (
                      <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500">
                        {t.burnedResult}
                      </span>
                    )}
                    {!isBurning && !burnCompleted && (
                      <span className="text-xs text-slate-400">
                        Ready. Click the button below to burn the magnesium ribbon.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* View 2: Conceptual 3D Particle View */}
              {viewMode === 'particle' && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
                    <span>Atomic Level Representation</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Ionic Lattice</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-slate-200">Reactants (Before Burning):</span>
                      <div className="flex items-center space-x-3 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-[9px] text-black">
                            Mg
                          </div>
                          <span className="text-slate-400">Metallic Lattice</span>
                        </div>
                        <span className="text-slate-500">+</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center font-bold text-[8px] text-white">
                            O
                          </div>
                          <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center font-bold text-[8px] text-white -ml-1">
                            O
                          </div>
                          <span className="text-slate-400">O₂ Gas</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-emerald-300">Product (After Burning):</span>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded border border-slate-700">
                          <div className="w-4 h-4 rounded-full bg-cyan-400 text-[8px] font-bold text-black flex items-center justify-center">
                            Mg²⁺
                          </div>
                          <div className="w-4 h-4 rounded-full bg-rose-400 text-[8px] font-bold text-white flex items-center justify-center">
                            O²⁻
                          </div>
                        </div>
                        <span className="text-slate-300 font-mono text-[11px]">Ionic MgO Crystal Lattice</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 italic">
                    Electrons are transferred from Magnesium to Oxygen, forming magnesium cations (Mg²⁺) and oxide anions (O²⁻).
                  </p>
                </div>
              )}

              {/* View 3: Chemical Equation */}
              {viewMode === 'equation' && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Balanced Chemical Equation</div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-emerald-900/50 text-center font-mono text-base sm:text-lg font-bold text-emerald-200">
                    {t.balancedEq}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="font-bold text-cyan-300 block">Combination Reaction:</span>
                      <span className="text-slate-400">Two reactants produce a single product.</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="font-bold text-amber-300 block">Oxidation:</span>
                      <span className="text-slate-400">Magnesium gains oxygen to form magnesium oxide.</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="font-bold text-rose-300 block">Exothermic:</span>
                      <span className="text-slate-400">Energy is released as dazzling light and heat.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleStartBurn}
                    disabled={isBurning}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white transition shadow-lg shadow-amber-600/30 flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Flame className="w-4 h-4" />
                    <span>{t.igniteBtn}</span>
                  </button>
                  {burnCompleted && (
                    <button
                      onClick={handleReset}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveStep('prediction')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 transition"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setActiveStep('model')}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition shadow-lg shadow-cyan-600/30"
                  >
                    Explanation & Scientific Model &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SCIENTIFIC MODEL & NCERT REASONING */}
          {activeStep === 'model' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>NCERT Scientific Explanation & Board Reasoning</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{t.sandpaperNote}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <span className="text-cyan-400 font-bold">Key Characteristics Observed:</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>Change in state and colour (silver solid ribbon ➔ white powder).</li>
                  <li>Evolution of light and heat (dazzling white flame).</li>
                  <li>Formation of completely new chemical substance (Magnesium Oxide, MgO).</li>
                </ul>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveStep('experiment')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 transition"
                >
                  &larr; Back to Lab
                </button>
                <button
                  onClick={() => setActiveStep('quiz')}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition shadow-lg shadow-cyan-600/30"
                >
                  Take Recall Check &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CONCEPT CHECK (QUIZ) */}
          {activeStep === 'quiz' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>{t.quizTitle}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-200">{t.quizQuestion}</p>

                <div className="space-y-2 pt-1">
                  {t.quizOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuizAnswer(idx);
                        setQuizSubmitted(true);
                        if (idx === 1) {
                          audioSynth.playSuccess();
                        } else {
                          audioSynth.playLocked();
                        }
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between ${
                        quizSubmitted
                          ? idx === 1
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                            : quizAnswer === idx
                            ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                          : quizAnswer === idx
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <span>{opt}</span>
                      {quizSubmitted && idx === 1 && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      )}
                      {quizSubmitted && quizAnswer === idx && idx !== 1 && (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {quizSubmitted && (
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    quizAnswer === 1
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                      : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                  }`}
                >
                  {quizAnswer === 1 ? t.correctFeedback : t.incorrectFeedback}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveStep('model')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 transition"
                >
                  &larr; Back
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Complete Mission & Return to Hub</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
