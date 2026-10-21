/**
 * StudyVerse 10 — Equation Balancing Engine
 * Source of Truth: NCERT Class 10 Science Section 1.1.2
 * 
 * Strict Scientific Constraints:
 * 1. Subscripts are PERMANENTLY IMMUTABLE (cannot change chemical identity).
 * 2. Only stoichiometric coefficients (a, b, c, d) may be adjusted.
 * 3. Dynamic Atom-Count Panel verifies Conservation of Mass in real time.
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Scale,
  Plus,
  Minus,
  Info,
} from 'lucide-react';
import { audioSynth } from './audioSynth.ts';

export interface EquationBalancingProblem {
  id: string;
  title: string;
  equationString: string;
  reactants: { formula: string; composition: Record<string, number> }[];
  products: { formula: string; composition: Record<string, number> }[];
  targetCoeffs: number[];
  elements: string[];
  explanation: string;
}

export const BALANCING_PROBLEMS: EquationBalancingProblem[] = [
  {
    id: 'prob_mg_o2',
    title: 'Combustion of Magnesium (Activity 1.1)',
    equationString: 'a Mg + b O₂ ➔ c MgO',
    reactants: [
      { formula: 'Mg', composition: { Mg: 1 } },
      { formula: 'O₂', composition: { O: 2 } },
    ],
    products: [{ formula: 'MgO', composition: { Mg: 1, O: 1 } }],
    targetCoeffs: [2, 1, 2],
    elements: ['Mg', 'O'],
    explanation: '2Mg + 1O₂ ➔ 2MgO balances 2 atoms of Magnesium and 2 atoms of Oxygen on both sides.',
  },
  {
    id: 'prob_fe_steam',
    title: 'Reaction of Iron with Steam (NCERT Exemplar)',
    equationString: 'a Fe + b H₂O ➔ c Fe₃O₄ + d H₂',
    reactants: [
      { formula: 'Fe', composition: { Fe: 1 } },
      { formula: 'H₂O', composition: { H: 2, O: 1 } },
    ],
    products: [
      { formula: 'Fe₃O₄', composition: { Fe: 3, O: 4 } },
      { formula: 'H₂', composition: { H: 2 } },
    ],
    targetCoeffs: [3, 4, 1, 4],
    elements: ['Fe', 'H', 'O'],
    explanation: '3Fe + 4H₂O ➔ 1Fe₃O₄ + 4H₂: Fe (3=3), H (8=8), O (4=4). All conserved!',
  },
  {
    id: 'prob_n2_h2',
    title: 'Synthesis of Ammonia',
    equationString: 'a N₂ + b H₂ ➔ c NH₃',
    reactants: [
      { formula: 'N₂', composition: { N: 2 } },
      { formula: 'H₂', composition: { H: 2 } },
    ],
    products: [{ formula: 'NH₃', composition: { N: 1, H: 3 } }],
    targetCoeffs: [1, 3, 2],
    elements: ['N', 'H'],
    explanation: '1N₂ + 3H₂ ➔ 2NH₃: Nitrogen (2=2), Hydrogen (6=6).',
  },
];

interface EquationBalancerProps {
  onAllCompleted?: () => void;
  language?: 'english' | 'hindi' | 'hinglish';
}

export const EquationBalancer: React.FC<EquationBalancerProps> = ({
  onAllCompleted,
  language = 'english',
}) => {
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const problem = BALANCING_PROBLEMS[activeProblemIdx];

  const totalTerms = problem.reactants.length + problem.products.length;
  const [coeffs, setCoeffs] = useState<number[]>(new Array(totalTerms).fill(1));
  const [hasSolvedCurrent, setHasSolvedCurrent] = useState(false);

  // Compute live atom counts
  const computeAtomCounts = () => {
    const reactantCounts: Record<string, number> = {};
    const productCounts: Record<string, number> = {};

    problem.elements.forEach((el) => {
      reactantCounts[el] = 0;
      productCounts[el] = 0;
    });

    // Reactants
    problem.reactants.forEach((r, idx) => {
      const coeff = coeffs[idx] || 1;
      Object.entries(r.composition).forEach(([el, count]) => {
        reactantCounts[el] = (reactantCounts[el] || 0) + coeff * count;
      });
    });

    // Products
    const reactantCountOffset = problem.reactants.length;
    problem.products.forEach((p, idx) => {
      const coeff = coeffs[reactantCountOffset + idx] || 1;
      Object.entries(p.composition).forEach(([el, count]) => {
        productCounts[el] = (productCounts[el] || 0) + coeff * count;
      });
    });

    const isBalanced = problem.elements.every(
      (el) => reactantCounts[el] === productCounts[el]
    );

    return { reactantCounts, productCounts, isBalanced };
  };

  const { reactantCounts, productCounts, isBalanced } = computeAtomCounts();

  const handleCoeffChange = (termIdx: number, delta: number) => {
    const updated = [...coeffs];
    const newVal = Math.max(1, Math.min(6, (updated[termIdx] || 1) + delta));
    updated[termIdx] = newVal;
    setCoeffs(updated);

    // Check if new state balances
    let reactantOffset = problem.reactants.length;
    const rCounts: Record<string, number> = {};
    const pCounts: Record<string, number> = {};
    problem.elements.forEach((el) => {
      rCounts[el] = 0;
      pCounts[el] = 0;
    });

    problem.reactants.forEach((r, idx) => {
      const c = updated[idx];
      Object.entries(r.composition).forEach(([el, cnt]) => {
        rCounts[el] = (rCounts[el] || 0) + c * cnt;
      });
    });

    problem.products.forEach((p, idx) => {
      const c = updated[reactantOffset + idx];
      Object.entries(p.composition).forEach(([el, cnt]) => {
        pCounts[el] = (pCounts[el] || 0) + c * cnt;
      });
    });

    const nowBalanced = problem.elements.every((el) => rCounts[el] === pCounts[el]);
    if (nowBalanced && !hasSolvedCurrent) {
      setHasSolvedCurrent(true);
      audioSynth.playSuccess();
    }
  };

  const handleNextProblem = () => {
    if (activeProblemIdx < BALANCING_PROBLEMS.length - 1) {
      const nextIdx = activeProblemIdx + 1;
      setActiveProblemIdx(nextIdx);
      const nextProb = BALANCING_PROBLEMS[nextIdx];
      const count = nextProb.reactants.length + nextProb.products.length;
      setCoeffs(new Array(count).fill(1));
      setHasSolvedCurrent(false);
      audioSynth.playInteract();
    } else {
      onAllCompleted?.();
    }
  };

  const handleResetCoeffs = () => {
    setCoeffs(new Array(totalTerms).fill(1));
    setHasSolvedCurrent(false);
    audioSynth.playRespawn();
  };

  return (
    <div className="space-y-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-2xl text-slate-100">
      {/* Header & Subscript Lock Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
            Guided Practice &middot; Challenge {activeProblemIdx + 1} of {BALANCING_PROBLEMS.length}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
            <Scale className="w-5 h-5 text-cyan-400" />
            <span>{problem.title}</span>
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-800/80 text-[11px] text-amber-300">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Subscripts Locked (Change Coefficients Only)</span>
          </div>
          <button
            onClick={handleResetCoeffs}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Reset Coefficients"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Chemical Equation Formulator */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-center font-mono text-base sm:text-lg">
        {/* Reactants */}
        {problem.reactants.map((r, idx) => (
          <React.Fragment key={`r_${idx}`}>
            <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700/80 px-2.5 py-1.5 rounded-xl shadow-inner">
              {/* Coefficient Modifier Controls */}
              <div className="flex flex-col space-y-0.5">
                <button
                  onClick={() => handleCoeffChange(idx, 1)}
                  className="p-0.5 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition"
                  title="Increase coefficient"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleCoeffChange(idx, -1)}
                  className="p-0.5 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition"
                  title="Decrease coefficient"
                >
                  <Minus className="w-3 h-3" />
                </button>
              </div>

              {/* Coefficient Value */}
              <span className="text-cyan-400 font-extrabold text-xl px-1">
                {coeffs[idx] || 1}
              </span>

              {/* Subscript-locked formula */}
              <span className="text-white font-bold tracking-wider">{r.formula}</span>
            </div>

            {idx < problem.reactants.length - 1 && (
              <span className="text-slate-500 font-bold text-xl">+</span>
            )}
          </React.Fragment>
        ))}

        {/* Reaction Yield Arrow */}
        <span className="text-emerald-400 font-bold text-2xl px-2">➔</span>

        {/* Products */}
        {problem.products.map((p, idx) => {
          const termIdx = problem.reactants.length + idx;
          return (
            <React.Fragment key={`p_${idx}`}>
              <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700/80 px-2.5 py-1.5 rounded-xl shadow-inner">
                {/* Coefficient Modifier Controls */}
                <div className="flex flex-col space-y-0.5">
                  <button
                    onClick={() => handleCoeffChange(termIdx, 1)}
                    className="p-0.5 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition"
                    title="Increase coefficient"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleCoeffChange(termIdx, -1)}
                    className="p-0.5 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition"
                    title="Decrease coefficient"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                </div>

                {/* Coefficient Value */}
                <span className="text-cyan-400 font-extrabold text-xl px-1">
                  {coeffs[termIdx] || 1}
                </span>

                {/* Subscript-locked formula */}
                <span className="text-white font-bold tracking-wider">{p.formula}</span>
              </div>

              {idx < problem.products.length - 1 && (
                <span className="text-slate-500 font-bold text-xl">+</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Live Atom-Count Comparison Panel */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Scale className="w-4 h-4 text-cyan-400" />
            <span>Live Atom-Count Ledger (Conservation of Mass)</span>
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center space-x-1 ${
              isBalanced
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-950'
                : 'bg-amber-950/60 text-amber-300 border-amber-700/80'
            }`}
          >
            {isBalanced ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>MASS CONSERVED &middot; BALANCED</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>UNBALANCED LEDGER</span>
              </>
            )}
          </span>
        </div>

        {/* Atom Table */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {problem.elements.map((el) => {
            const rCount = reactantCounts[el];
            const pCount = productCounts[el];
            const match = rCount === pCount;

            return (
              <div
                key={el}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                  match
                    ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400">
                    {el}
                  </span>
                  <span className="font-mono">
                    Reactants: <strong>{rCount}</strong> vs Products: <strong>{pCount}</strong>
                  </span>
                </div>
                {match ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="text-[10px] text-amber-400 font-mono">Δ {Math.abs(rCount - pCount)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Success Banner and Next Button */}
      {isBalanced && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-200">
          <div className="space-y-1">
            <span className="font-bold flex items-center space-x-1.5 text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Equation Perfectly Balanced!</span>
            </span>
            <p className="text-slate-300 leading-relaxed">{problem.explanation}</p>
          </div>

          <button
            onClick={handleNextProblem}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition shadow-lg shadow-emerald-600/30 shrink-0"
          >
            {activeProblemIdx < BALANCING_PROBLEMS.length - 1 ? 'Next Reaction Challenge →' : 'Complete Balancing Step →'}
          </button>
        </div>
      )}
    </div>
  );
};
