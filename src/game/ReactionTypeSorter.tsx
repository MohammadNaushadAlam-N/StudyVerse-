/**
 * StudyVerse 10 — Reaction-Type Classification & Thermo-Indicator Engine
 * Source of Truth: NCERT Class 10 Science Section 1.2
 * 
 * Features:
 * - Reaction-Type Sorting: Combination, Decomposition, Displacement, Double Displacement, Redox
 * - Exothermic vs Endothermic Thermal Energy Indicator (ΔT > 0 vs ΔT < 0 / Heat absorbed Δ)
 * - Supported interactive classification with NCERT feedback
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Layers,
  Thermometer,
  ArrowRight,
} from 'lucide-react';
import { audioSynth } from './audioSynth.ts';

export type ReactionTypeKey =
  | 'combination'
  | 'decomposition'
  | 'displacement'
  | 'double_displacement'
  | 'redox';

export interface ReactionSortCard {
  id: string;
  equation: string;
  reactantsNote: string;
  correctType: ReactionTypeKey;
  thermalType: 'exothermic' | 'endothermic';
  thermalExplanation: string;
  conceptReasoning: string;
}

export const REACTION_SORT_CARDS: ReactionSortCard[] = [
  {
    id: 'rc_mg_burn',
    equation: '2Mg(s) + O₂(g) ➔ 2MgO(s)',
    reactantsNote: 'Two elements combine to form a single solid compound',
    correctType: 'combination',
    thermalType: 'exothermic',
    thermalExplanation: 'Intense heat and dazzling white light are liberated (ΔT > 0).',
    conceptReasoning: 'Two reactants produce a single product: Combination Reaction.',
  },
  {
    id: 'rc_quicklime_water',
    equation: 'CaO(s) + H₂O(l) ➔ Ca(OH)₂(aq) + Heat',
    reactantsNote: 'Quicklime reacting vigorously with water in beaker',
    correctType: 'combination',
    thermalType: 'exothermic',
    thermalExplanation: 'Beaker temperature rises markedly (ΔT > 0).',
    conceptReasoning: 'Calcium oxide and water combine into a single product, slaked lime.',
  },
  {
    id: 'rc_feso4_heat',
    equation: '2FeSO₄(s) ──(Δ)──➔ Fe₂O₃(s) + SO₂(g) + SO₃(g)',
    reactantsNote: 'Single green crystal breaks down upon continuous heating',
    correctType: 'decomposition',
    thermalType: 'endothermic',
    thermalExplanation: 'Requires external thermal energy input to break chemical bonds (Δ).',
    conceptReasoning: 'A single reactant decomposes into three simpler products: Decomposition Reaction.',
  },
  {
    id: 'rc_fe_cuso4',
    equation: 'Fe(s) + CuSO₄(aq) ➔ FeSO₄(aq) + Cu(s)',
    reactantsNote: 'Iron nail displaces copper from blue solution',
    correctType: 'displacement',
    thermalType: 'exothermic',
    thermalExplanation: 'Mildly exothermic displacement of less reactive metal.',
    conceptReasoning: 'Iron is more reactive than copper in the reactivity series and displaces it.',
  },
  {
    id: 'rc_na2so4_bacl2',
    equation: 'Na₂SO₄(aq) + BaCl₂(aq) ➔ BaSO₄(s)↓ + 2NaCl(aq)',
    reactantsNote: 'Mutual exchange of ions forming insoluble white precipitate',
    correctType: 'double_displacement',
    thermalType: 'exothermic',
    thermalExplanation: 'Precipitation lattice energy released upon crystal formation.',
    conceptReasoning: 'Exchange of Ba²⁺ and SO₄²⁻ ions forms an insoluble precipitate of barium sulphate.',
  },
  {
    id: 'rc_cuo_h2',
    equation: 'CuO(s) + H₂(g) ──(Δ)──➔ Cu(s) + H₂O(g)',
    reactantsNote: 'Simultaneous loss and gain of oxygen under heat',
    correctType: 'redox',
    thermalType: 'endothermic',
    thermalExplanation: 'Requires heat to drive reduction of copper(II) oxide.',
    conceptReasoning: 'CuO loses oxygen (reduced) while H₂ gains oxygen (oxidized).',
  },
];

const REACTION_CATEGORIES: { key: ReactionTypeKey; label: string; description: string }[] = [
  { key: 'combination', label: 'Combination (A + B ➔ AB)', description: 'Two or more reactants form a single product.' },
  { key: 'decomposition', label: 'Decomposition (AB ➔ A + B)', description: 'A single reactant breaks down into simpler products.' },
  { key: 'displacement', label: 'Displacement (A + BC ➔ AC + B)', description: 'A more reactive element replaces a less reactive one.' },
  { key: 'double_displacement', label: 'Double Displacement (Precipitation)', description: 'Exchange of ions between reactants forming precipitate.' },
  { key: 'redox', label: 'Redox (Oxidation & Reduction)', description: 'Simultaneous gain and loss of oxygen / electrons.' },
];

interface ReactionTypeSorterProps {
  onCompleted?: () => void;
  language?: 'english' | 'hindi' | 'hinglish';
}

export const ReactionTypeSorter: React.FC<ReactionTypeSorterProps> = ({
  onCompleted,
  language = 'english',
}) => {
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const card = REACTION_SORT_CARDS[currentCardIdx];

  const [selectedType, setSelectedType] = useState<ReactionTypeKey | null>(null);
  const [selectedThermal, setSelectedThermal] = useState<'exothermic' | 'endothermic' | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    if (!selectedType || !selectedThermal) return;
    setIsAnswerSubmitted(true);

    const isTypeCorrect = selectedType === card.correctType;
    const isThermalCorrect = selectedThermal === card.thermalType;

    if (isTypeCorrect && isThermalCorrect) {
      setScore((s) => s + 1);
      audioSynth.playSuccess();
    } else {
      audioSynth.playLocked();
    }
  };

  const handleNextCard = () => {
    if (currentCardIdx < REACTION_SORT_CARDS.length - 1) {
      setCurrentCardIdx((c) => c + 1);
      setSelectedType(null);
      setSelectedThermal(null);
      setIsAnswerSubmitted(false);
      audioSynth.playInteract();
    } else {
      onCompleted?.();
    }
  };

  const handleReset = () => {
    setCurrentCardIdx(0);
    setSelectedType(null);
    setSelectedThermal(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    audioSynth.playRespawn();
  };

  const isTypeCorrect = selectedType === card.correctType;
  const isThermalCorrect = selectedThermal === card.thermalType;
  const bothCorrect = isTypeCorrect && isThermalCorrect;

  return (
    <div className="space-y-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider block">
            Application Phase &middot; Reaction {currentCardIdx + 1} of {REACTION_SORT_CARDS.length}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Reaction Classification & Thermal Energy Indicator</span>
          </h3>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono text-cyan-300">
            Score: {score}/{REACTION_SORT_CARDS.length}
          </span>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Reset Quiz"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Reaction Card */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-purple-900/40 space-y-3 shadow-inner">
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400">Target Reaction Equation</span>
          <div className="text-base sm:text-xl font-bold font-mono text-purple-200">
            {card.equation}
          </div>
          <p className="text-xs text-slate-400 italic">{card.reactantsNote}</p>
        </div>
      </div>

      {/* Part 1: Select Reaction Type */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
          <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-300 border border-purple-700 flex items-center justify-center text-[10px] font-bold">
            1
          </span>
          <span>Select Reaction Mechanism Category:</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {REACTION_CATEGORIES.map((cat) => {
            const isSelected = selectedType === cat.key;
            return (
              <button
                key={cat.key}
                disabled={isAnswerSubmitted}
                onClick={() => setSelectedType(cat.key)}
                className={`p-3 rounded-xl border text-left transition space-y-1 ${
                  isAnswerSubmitted
                    ? cat.key === card.correctType
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                      : isSelected
                      ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                      : 'bg-slate-950 border-slate-800 opacity-40'
                    : isSelected
                    ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-md shadow-purple-950'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="text-xs font-bold">{cat.label}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{cat.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Part 2: Select Thermal Energy Exchange (Exo vs Endo) */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
          <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-300 border border-purple-700 flex items-center justify-center text-[10px] font-bold">
            2
          </span>
          <span>Thermal Energy Exchange (Exothermic vs Endothermic Indicator):</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            disabled={isAnswerSubmitted}
            onClick={() => setSelectedThermal('exothermic')}
            className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
              isAnswerSubmitted
                ? card.thermalType === 'exothermic'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : selectedThermal === 'exothermic'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                  : 'bg-slate-950 border-slate-800 opacity-40'
                : selectedThermal === 'exothermic'
                ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Flame className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <span className="text-xs font-bold block">Exothermic Reaction</span>
                <span className="text-[10px] text-slate-400">Releases thermal energy &middot; ΔT &gt; 0</span>
              </div>
            </div>
            {isAnswerSubmitted && card.thermalType === 'exothermic' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          <button
            disabled={isAnswerSubmitted}
            onClick={() => setSelectedThermal('endothermic')}
            className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
              isAnswerSubmitted
                ? card.thermalType === 'endothermic'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : selectedThermal === 'endothermic'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                  : 'bg-slate-950 border-slate-800 opacity-40'
                : selectedThermal === 'endothermic'
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Thermometer className="w-5 h-5 text-cyan-400" />
              <div className="text-left">
                <span className="text-xs font-bold block">Endothermic Reaction</span>
                <span className="text-[10px] text-slate-400">Absorbs energy &middot; Requires continuous heating (Δ)</span>
              </div>
            </div>
            {isAnswerSubmitted && card.thermalType === 'endothermic' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {isAnswerSubmitted && (
        <div
          className={`p-4 rounded-xl border text-xs space-y-1.5 ${
            bothCorrect
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
              : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
          }`}
        >
          <div className="flex items-center space-x-1.5 font-bold">
            {bothCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Excellent Scientific Classification!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Reviewing Scientific Reasoning:</span>
              </>
            )}
          </div>
          <p className="text-slate-300 leading-relaxed">{card.conceptReasoning}</p>
          <p className="text-slate-400 text-[11px] font-mono">{card.thermalExplanation}</p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        {!isAnswerSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedType || !selectedThermal}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white transition shadow-lg shadow-purple-600/30 disabled:opacity-40"
          >
            Verify Classification &rarr;
          </button>
        ) : (
          <button
            onClick={handleNextCard}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
          >
            <span>{currentCardIdx < REACTION_SORT_CARDS.length - 1 ? 'Next Reaction' : 'Finish Sorter Mission'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
