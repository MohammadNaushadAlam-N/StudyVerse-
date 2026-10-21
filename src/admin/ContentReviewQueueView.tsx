/**
 * StudyVerse 10 — Side-by-Side Content Review Queue & Controlled Publishing UI
 * Source of Truth: StudyVerse 10 Science Blueprint Section 5 & 10
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  FileText,
  UploadCloud,
  ShieldCheck,
  AlertTriangle,
  Send,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { contentReviewService, ReviewQueueItem } from './reviewQueueService.ts';
import { SecurityContext } from '../services/contentRepository.ts';
import { AssessmentStatus } from '../content/schemas.ts';

export const ContentReviewQueueView: React.FC = () => {
  const [adminToken, setAdminToken] = useState('studyverse_admin_secure_key_2026');
  const [reviewerName, setReviewerName] = useState('Dr. Meenakshi Sharma (CBSE Curriculum Lead)');
  const [reviewerNotes, setReviewerNotes] = useState('Verified strictly against NCERT Class 10 Science 2026-27.');
  const [selectedItemId, setSelectedItemId] = useState<string>('concept_ch01_chemical_equations');
  const [publishStatusMessage, setPublishStatusMessage] = useState<string | null>(null);
  const [invalidationMessage, setInvalidationMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const adminContext: SecurityContext = {
    userId: 'curriculum_admin_reviewer',
    isStudent: false,
    isAdmin: true,
    adminVerificationToken: adminToken,
  };

  const queueItems = contentReviewService.getReviewQueue(adminContext);
  const selectedItem = queueItems.find((i) => i.task.entityId === selectedItemId) || queueItems[0];

  const handleDecision = (decision: 'approve' | 'reject' | 'request_reprocessing') => {
    if (!selectedItem) return;

    try {
      contentReviewService.reviewEntity(adminContext, {
        entityType: selectedItem.task.entityType as any,
        entityId: selectedItem.task.entityId,
        decision,
        reviewerName,
        reviewerNotes,
        assessmentStatus: 'assessmentStatus' in selectedItem.entity ? selectedItem.entity.assessmentStatus : undefined,
        verifiedAnswerKey: 'correctAnswer' in selectedItem.entity ? (selectedItem.entity as any).correctAnswer : undefined,
      });
      setRefreshTrigger((prev) => prev + 1);
      setPublishStatusMessage(null);
    } catch (err: any) {
      alert(`Review action rejected: ${err?.message}`);
    }
  };

  const handlePublishChapter = async () => {
    setPublishStatusMessage(null);
    try {
      const bundle = await contentReviewService.publishApprovedChapterBundle(
        adminContext,
        '2026-27',
        'ch01'
      );
      setPublishStatusMessage(
        `SUCCESS: Chapter ${bundle.chapterId} bundle (v${bundle.contentVersion}) successfully published to student endpoints! ${bundle.concepts.length} concepts and ${bundle.questions.length} questions are now live.`
      );
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      setPublishStatusMessage(`Publishing Blocked: ${err?.message}`);
    }
  };

  const handleSimulateSourceUpdate = () => {
    try {
      const res = contentReviewService.flagDependentContentOnSourceUpdate(
        adminContext,
        'jesc101_reprint2026_27',
        'Reprint 2027–28 Revised Edition'
      );
      setInvalidationMessage(
        `Source document updated! ${res.flaggedCount} dependent items have been automatically flagged as 'page_review_needed' in the review queue.`
      );
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      alert(err?.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-purple-950 text-purple-300 border border-purple-800">
              Admin Review Queue
            </span>
            <h2 className="text-base font-bold text-white">Side-by-Side Content Review & Publishing Desk</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare raw extracted textbook text directly with draft entities. Enforces checked answer keys, syllabus mapping, and reviewer audit sign-off before publishing.
          </p>
        </div>

        {/* Reviewer Credentials */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 text-xs">
          <input
            type="text"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Reviewer Name"
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 w-64"
          />
        </div>
      </div>

      {/* Main Side-by-Side Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Queue Items List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Pending Review Tasks ({queueItems.length})</span>
            <span className="text-[10px] text-slate-500 font-mono">Chapter 1</span>
          </h3>

          <div className="space-y-2">
            {queueItems.map((item) => (
              <button
                key={item.task.taskId}
                onClick={() => setSelectedItemId(item.task.entityId)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs transition space-y-2 ${
                  selectedItem?.task.entityId === item.task.entityId
                    ? 'bg-cyan-950/40 border-cyan-700 text-cyan-200 shadow-md'
                    : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold truncate max-w-[180px]">
                    {'title' in item.entity ? item.entity.title : ('stem' in item.entity ? (item.entity as any).stem : 'Item')}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                      item.entity.verificationStatus === 'approved'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : item.entity.verificationStatus === 'rejected'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : item.entity.verificationStatus === 'page_review_needed'
                        ? 'bg-purple-950 text-purple-300 border-purple-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {item.entity.verificationStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Type: {item.task.entityType}</span>
                  <span>PDF Pg {item.pdfPageIndex}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Publishing & Invalidation Actions Panel */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <button
              onClick={handlePublishChapter}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Publish Approved Chapter to Students</span>
            </button>

            <button
              onClick={handleSimulateSourceUpdate}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Source Edition Update (Invalidation Test)</span>
            </button>
          </div>

          {publishStatusMessage && (
            <div
              className={`p-3 rounded-lg text-xs leading-relaxed border ${
                publishStatusMessage.startsWith('SUCCESS')
                  ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-800 text-rose-300'
              }`}
            >
              {publishStatusMessage}
            </div>
          )}

          {invalidationMessage && (
            <div className="p-3 rounded-lg text-xs leading-relaxed border bg-amber-950/30 border-amber-800 text-amber-300">
              {invalidationMessage}
            </div>
          )}
        </div>

        {/* Right Columns: Side-by-Side Comparison */}
        {selectedItem && (
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Pane: Extracted Raw Textbook Source */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2 text-cyan-400">
                    <BookOpen className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Original Extracted Source
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedItem.sourceDocId} &middot; Pg {selectedItem.printedPageNumber || selectedItem.pdfPageIndex}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Section Heading</span>
                    <p className="font-semibold text-white mt-0.5">
                      {selectedItem.entity.sourceRefs[0]?.sectionHeading}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Extracted Text Fragment</span>
                    <p className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs leading-relaxed italic">
                      &quot;{selectedItem.sourceTextSnippet}&quot;
                    </p>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                    <div>
                      <strong>Academic Session:</strong> 2026–27
                    </div>
                    <div>
                      <strong>Syllabus Status:</strong>{' '}
                      {'assessmentStatus' in selectedItem.entity ? (selectedItem.entity as any).assessmentStatus : 'N/A'}
                    </div>
                    <div>
                      <strong>Verification Stage:</strong> {selectedItem.entity.verificationStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Pane: Generated Draft Entity & Review Controls */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Draft Entity Under Review
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
                    {selectedItem.entity.verificationStatus}
                  </span>
                </div>

                {/* Concept Fields */}
                {'title' in selectedItem.entity && 'explanations' in selectedItem.entity && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Concept Title</span>
                      <p className="font-bold text-white mt-0.5">{selectedItem.entity.title}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">
                        Simple English Explanation
                      </span>
                      <p className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-200 text-xs mt-0.5">
                        {(selectedItem.entity as any).explanations?.simpleEnglish}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">
                        Hindi Scientific Explanation
                      </span>
                      <p className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-200 text-xs mt-0.5">
                        {(selectedItem.entity as any).explanations?.hindi}
                      </p>
                    </div>
                  </div>
                )}

                {/* Question Fields */}
                {'stem' in selectedItem.entity && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Question Stem</span>
                      <p className="font-semibold text-white mt-0.5">{(selectedItem.entity as any).stem}</p>
                    </div>

                    {(selectedItem.entity as any).options && (
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Options</span>
                        <div className="space-y-1 mt-1">
                          {(selectedItem.entity as any).options.map((opt: string, i: number) => (
                            <div
                              key={i}
                              className={`p-2 rounded text-[11px] border ${
                                opt === (selectedItem.entity as any).correctAnswer
                                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 font-semibold'
                                  : 'bg-slate-900 border-slate-800 text-slate-300'
                              }`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/40 text-xs">
                      <span className="text-emerald-400 font-semibold block mb-0.5">
                        Verified Correct Answer:
                      </span>
                      <span className="text-emerald-200">{String((selectedItem.entity as any).correctAnswer)}</span>
                    </div>
                  </div>
                )}

                {/* Reviewer Notes & Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Reviewer Notes / Sign-Off Justification:
                  </label>
                  <textarea
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    rows={2}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Enter academic review comments..."
                  />

                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      onClick={() => handleDecision('approve')}
                      className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve with Audit Log</span>
                    </button>

                    <button
                      onClick={() => handleDecision('reject')}
                      className="flex items-center justify-center space-x-1 px-3 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold text-xs transition"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleDecision('request_reprocessing')}
                      className="flex items-center justify-center space-x-1 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-xs transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reprocess</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
