/**
 * StudyVerse 10 — Official CBSE 2026–27 Syllabus Registry & Mapping Studio
 * Visualizes:
 * - 5 Official Units with marks weightage (80 Theory marks total)
 * - 50% / 30% / 20% question paper design distribution
 * - Formative-only topics (Electric Motor, Generator, Induction)
 * - Explicit exclusions (Sunrise/sunset scattering)
 * - Ambiguous clauses requiring human review (Electric Effects broad clause)
 * - Interactive Topic Mapping Evaluator with human sign-off simulation
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Ban,
  FileCheck,
} from 'lucide-react';
import {
  syllabusRegistryService,
  SyllabusMappingSuggestion,
} from './syllabusRegistry.ts';
import { AssessmentStatus } from '../content/schemas.ts';

export const SyllabusRegistryView: React.FC = () => {
  const official = syllabusRegistryService.getOfficialSyllabus();

  // Test Topic Mapping state
  const [testTopic, setTestTopic] = useState('Types of Chemical Reactions: Combination & Decomposition');
  const [testChapter, setTestChapter] = useState('ch01');
  const [mappingResult, setMappingResult] = useState<SyllabusMappingSuggestion | null>(null);
  const [reviewerSignoffStatus, setReviewerSignoffStatus] = useState<string | null>(null);

  // Run evaluation
  const handleEvaluate = (topic = testTopic, chapter = testChapter) => {
    const result = syllabusRegistryService.evaluateTopicMapping({
      topicTitle: topic,
      chapterId: chapter,
    });
    setMappingResult(result);
    setReviewerSignoffStatus(null);
  };

  // Sign off as human reviewer
  const handleReviewerSignoff = (status: AssessmentStatus) => {
    if (!mappingResult) return;
    try {
      const approved = syllabusRegistryService.approveMapping(
        {
          userId: 'academic_reviewer_dr_sen',
          isStudent: false,
          isAdmin: true,
          adminVerificationToken: 'studyverse_admin_secure_key_2026',
        },
        'active_demo_map',
        'approved_by_reviewer',
        status,
        'Confirmed against CBSE Class X Science 2026–27 Curriculum guidelines.'
      );
      setMappingResult(approved);
      setReviewerSignoffStatus(`Signed off by Dr. Sen as '${status}' with timestamp.`);
    } catch (err: any) {
      setReviewerSignoffStatus(`Sign-off error: ${err?.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
              Verified Source
            </span>
            <h2 className="text-base font-bold text-white">{official.title}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Academic Session {official.academicSession} &middot; 80 Theory Marks + 20 Internal Assessment &middot; Verified by {official.verifiedBy}
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <a
            href={official.officialDocumentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition"
          >
            <span>Official Syllabus PDF</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 5 Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {official.units.map((unit) => (
          <div
            key={unit.unitId}
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Unit {unit.unitNumber}</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-bold text-xs border border-cyan-800">
                  {unit.theoryMarksWeight} Marks
                </span>
              </div>
              <h3 className="text-xs font-bold text-white mt-1.5 line-clamp-2">{unit.title}</h3>
            </div>
            <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/80">
              Chapters: {unit.includedChapterIds.map((c) => c.toUpperCase()).join(', ')}
            </div>
          </div>
        ))}
      </div>

      {/* Question Paper Design & Formative / Ambiguity Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Paper Design */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Award className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Question Paper Blueprint</h4>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Demonstrate Knowledge & Understanding</span>
              <span className="font-bold text-cyan-400">50%</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Application of Knowledge / Concepts</span>
              <span className="font-bold text-emerald-400">30%</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Formulate, Analyse, Evaluate & Create</span>
              <span className="font-bold text-purple-400">20%</span>
            </div>
          </div>
        </div>

        {/* Formative Only & Exclusions */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400">
            <Ban className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Formative & Excluded Scope</h4>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="font-semibold text-blue-300">Formative / Portfolio Topics:</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Electric Motor, Electromagnetic Induction, Electric Generator, Periodic Classification (Reading Material).
              </p>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="font-semibold text-rose-300">Explicit Exclusions:</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Color of the Sun at sunrise and sunset from atmospheric scattering daily-life questions.
              </p>
            </div>
          </div>
        </div>

        {/* Ambiguous Clauses Under Review */}
        <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-4 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200">Mandatory Human Review Note</h4>
          </div>
          <div className="p-2.5 rounded bg-slate-950/80 border border-amber-800/40 text-xs space-y-1.5">
            <p className="font-semibold text-amber-300">&quot;Electric Effects of Electric Current&quot;</p>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Official non-year-end list contains broad phrase &quot;Electric Effects of Electric Current&quot; while syllabus specifies 13 marks for Effects of Current.
            </p>
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-700">
              Flagged: needs_curriculum_review
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Topic Mapping Simulator */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Topic Syllabus Mapping & Review Workflow
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate matching concepts to official syllabus. AI never auto-approves; human academic reviewer sign-off is required.
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">Strict Human Sign-off</span>
        </div>

        {/* Preset Quick Tests */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">Quick Scenarios:</span>
          <button
            onClick={() => {
              setTestTopic('Balanced Chemical Equations & Conservation of Mass');
              setTestChapter('ch01');
              handleEvaluate('Balanced Chemical Equations & Conservation of Mass', 'ch01');
            }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
          >
            Core Chapter 1
          </button>
          <button
            onClick={() => {
              setTestTopic('Working Principle of Electric Motor');
              setTestChapter('ch12');
              handleEvaluate('Working Principle of Electric Motor', 'ch12');
            }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
          >
            Formative (Motor)
          </button>
          <button
            onClick={() => {
              setTestTopic('Scattering of Light: Colour of Sun at Sunrise/Sunset');
              setTestChapter('ch10');
              handleEvaluate('Scattering of Light: Colour of Sun at Sunrise/Sunset', 'ch10');
            }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
          >
            Excluded (Sunrise)
          </button>
          <button
            onClick={() => {
              setTestTopic('Electric Effects of Electric Current broad note');
              setTestChapter('ch11');
              handleEvaluate('Electric Effects of Electric Current broad note', 'ch11');
            }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
          >
            Ambiguous Clause
          </button>
          <button
            onClick={() => {
              setTestTopic('Quantum Chromodynamics and Particle Quarks');
              setTestChapter('ch03');
              handleEvaluate('Quantum Chromodynamics and Particle Quarks', 'ch03');
            }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
          >
            Unmapped Topic
          </button>
        </div>

        {/* Custom Input */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={testTopic}
              onChange={(e) => setTestTopic(e.target.value)}
              placeholder="Enter chapter topic or concept..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <select
            value={testChapter}
            onChange={(e) => setTestChapter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ch01">Chapter 1: Chemical Reactions</option>
            <option value="ch02">Chapter 2: Acids & Bases</option>
            <option value="ch03">Chapter 3: Metals & Non-metals</option>
            <option value="ch04">Chapter 4: Carbon Compounds</option>
            <option value="ch09">Chapter 9: Light Reflection</option>
            <option value="ch10">Chapter 10: Human Eye</option>
            <option value="ch11">Chapter 11: Electricity</option>
            <option value="ch12">Chapter 12: Magnetic Effects</option>
            <option value="ch13">Chapter 13: Environment</option>
          </select>
          <button
            onClick={() => handleEvaluate()}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition shrink-0"
          >
            Evaluate Mapping
          </button>
        </div>

        {/* Evaluation Result Card */}
        {mappingResult && (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-slate-400">Suggested Assessment Status</span>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase border ${
                      mappingResult.suggestedStatus === 'annual_exam_core'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : mappingResult.suggestedStatus === 'formative_portfolio'
                        ? 'bg-blue-950 text-blue-300 border-blue-800'
                        : mappingResult.suggestedStatus === 'excluded_from_specified_assessment'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : mappingResult.suggestedStatus === 'needs_curriculum_review'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {mappingResult.suggestedStatus}
                  </span>
                  <span className="text-xs text-slate-400">
                    Confidence: {(mappingResult.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400">Review State</span>
                <div className="text-xs font-semibold text-amber-400 capitalize">
                  {mappingResult.reviewDecision.replace(/_/g, ' ')}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Evidence Citation:</span>{' '}
                <span className="text-cyan-300 font-medium">{mappingResult.evidenceSourceRef}</span>
              </div>
              <div>
                <span className="text-slate-400">Official Excerpt:</span>
                <p className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 text-slate-300 italic mt-1 text-[11px]">
                  &quot;{mappingResult.officialWordingExcerpt}&quot;
                </p>
              </div>
              {mappingResult.isAmbiguous && (
                <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/50 text-amber-300 text-[11px]">
                  <strong>Curriculum Conflict:</strong> {mappingResult.ambiguityReason}
                </div>
              )}
            </div>

            {/* Human Sign-Off Actions */}
            <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Sign-off as Academic Reviewer:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReviewerSignoff('annual_exam_core')}
                  className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 text-xs transition"
                >
                  Confirm Annual Exam Core
                </button>
                <button
                  onClick={() => handleReviewerSignoff('formative_portfolio')}
                  className="px-2.5 py-1 rounded bg-blue-950 text-blue-300 hover:bg-blue-900 border border-blue-800 text-xs transition"
                >
                  Mark Formative Only
                </button>
                <button
                  onClick={() => handleReviewerSignoff('needs_curriculum_review')}
                  className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 hover:bg-amber-900 border border-amber-800 text-xs transition"
                >
                  Hold for Review
                </button>
              </div>
            </div>

            {reviewerSignoffStatus && (
              <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/20 p-2 rounded border border-emerald-900/40">
                {reviewerSignoffStatus}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
