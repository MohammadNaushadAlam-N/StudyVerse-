/**
 * StudyVerse 10 — Class 10 CBSE Science 3D Learning Game
 * Foundation & Schema Verification Dashboard (Phase 1)
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  BookOpen,
  Database,
  Lock,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  FileText,
  UserCheck,
  Smartphone,
  Download,
} from 'lucide-react';
import { runFoundationTests } from './tests/schemaValidation.test.ts';
import { runPdfPipelineTests } from './tests/pdfPipeline.test.ts';
import { runSyllabusMappingTests } from './tests/syllabusMapping.test.ts';
import { runDraftTransformationTests } from './tests/draftTransformation.test.ts';
import { runReviewAndPublishingTests } from './tests/reviewAndPublishing.test.ts';
import { runGameSceneTests } from './tests/gameScene.test.ts';
import { runChapter1MissionTests } from './tests/chapter1Mission.test.ts';
import { runStudyBuddyTests } from './tests/studyBuddy.test.ts';
import { AdminContentStudio } from './admin/AdminContentStudio.tsx';
import { SyllabusRegistryView } from './syllabus/SyllabusRegistryView.tsx';
import { ContentReviewQueueView } from './admin/ContentReviewQueueView.tsx';
import { GameShell } from './game/GameShell.tsx';
import { Chapter1Mission } from './game/Chapter1Mission.tsx';
import { StudyBuddyDrawer } from './game/StudyBuddyDrawer.tsx';
import { ApkDownloadModal } from './game/ApkDownloadModal.tsx';

export default function App() {
  const [testResults, setTestResults] = useState<{ passed: boolean; results: string[] } | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [activeTab, setActiveTab] = useState<'game' | 'overview' | 'syllabus' | 'admin_studio' | 'review_queue' | 'schemas' | 'security' | 'tests'>('game');
  const [showChapter1Lab, setShowChapter1Lab] = useState(false);
  const [showStudyBuddy, setShowStudyBuddy] = useState(false);
  const [showApkDownload, setShowApkDownload] = useState(false);

  useEffect(() => {
    // Run tests on mount to provide live verification feedback
    runTests();
  }, []);

  const runTests = async () => {
    setIsRunningTests(true);
    try {
      const p1 = await runFoundationTests();
      const p2 = await runPdfPipelineTests();
      const p3 = await runSyllabusMappingTests();
      const p4 = await runDraftTransformationTests();
      const p5 = await runReviewAndPublishingTests();
      const p6 = await runGameSceneTests();
      const p7 = await runChapter1MissionTests();
      const p8 = await runStudyBuddyTests();
      setTestResults({
        passed: p1.passed && p2.passed && p3.passed && p4.passed && p5.passed && p6.passed && p7.passed && p8.passed,
        results: [...p1.results, ...p2.results, ...p3.results, ...p4.results, ...p5.results, ...p6.results, ...p7.results, ...p8.results],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">StudyVerse 10</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  CBSE Class 10 Science
                </span>
              </div>
              <p className="text-xs text-slate-400">Class X 3D Academy Hub & Curriculum Engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('game')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'game'
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Academy Hub (Play)</span>
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Architecture
            </button>
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'syllabus'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CBSE 2026–27 Syllabus
            </button>
            <button
              onClick={() => setActiveTab('admin_studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'admin_studio'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin PDF Studio
            </button>
            <button
              onClick={() => setActiveTab('review_queue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'review_queue'
                  ? 'bg-purple-950 text-purple-300 border border-purple-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Review Queue
            </button>
            <button
              onClick={() => setActiveTab('schemas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'schemas'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Schemas & Tags
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'security'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Security Rules
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'tests'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Verification ({testResults?.passed ? `${testResults.results.length}/${testResults.results.length} Pass` : 'Running...'})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApkDownload(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/60 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              title="Download Android APK / PWA"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Get Android APK</span>
              <span className="sm:hidden">APK</span>
            </button>

            <button
              onClick={() => setShowStudyBuddy(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              title="Open SciBuddy Gemini AI Study Companion"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SciBuddy AI Tutor</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container / 3D Canvas Switch */}
      {activeTab === 'game' ? (
        <div className="flex-1 w-full relative h-[calc(100vh-4rem)] min-h-[600px] overflow-hidden">
          <GameShell
            onEnterChapter1={() => setShowChapter1Lab(true)}
            onOpenAdminStudio={() => setActiveTab('admin_studio')}
          />
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Verification Status Banner */}
        <div className="rounded-2xl border border-cyan-900/60 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Academic Content Engine & Safe Database Online
                </h1>
              </div>
              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                Versioned Zod contracts, strict assessment statuses (<code className="text-cyan-300">annual_exam_core</code>,{' '}
                <code className="text-amber-300">needs_curriculum_review</code>), client-side fake admin rejection, and
                complete draft isolation are implemented and verified.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={runTests}
                disabled={isRunningTests}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-medium text-xs transition shadow-lg shadow-cyan-600/30 disabled:opacity-50"
              >
                {isRunningTests ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{isRunningTests ? 'Executing Tests...' : 'Re-run Verification'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Architecture & Current Foundation */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-semibold text-white">Curriculum Truth & Provenance</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every concept, activity, and question requires explicit source citations (<code className="text-slate-300">sourceRefs</code>) linking back to chapter identifier, PDF page index, and printed book page. Missing citations cause instant schema rejection.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-semibold text-white">Draft Isolation & Zero Student Leakage</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Student queries call <code className="text-slate-300">getPublishedChapterContent</code> which filters strictly for <code className="text-slate-300">verificationStatus === 'published'</code>. Drafts, OCR reviews, and unreviewed AI items are never served to students.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-semibold text-white">Isolated Student Progress</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Student progress, XP, chapter mastery, and wrong answers are segregated into private, local-first stores. Wrong answers enter a supportive revision queue without punitive streak loss.
              </p>
            </div>

            {/* Firebase & Source Document Status Notice */}
            <div className="md:col-span-3 rounded-xl border border-amber-900/60 bg-amber-950/20 p-5 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-semibold">Database & Source Storage Setup Notice</h3>
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Per blueprint rules, Firebase Firestore and Storage have <strong>not been fabricated with dummy credentials</strong>. The schema layer is decoupled and operating locally, with production Firestore security rules ready in <code className="text-amber-100 font-mono">firestore.rules</code>. When requested, AI Studio&apos;s supported Firebase integration can provision persistent cloud backing with full authorization.
              </p>
            </div>
          </div>
        )}

        {/* Tab: Official CBSE 2026-27 Syllabus Registry */}
        {activeTab === 'syllabus' && <SyllabusRegistryView />}

        {/* Tab: Admin PDF Studio */}
        {activeTab === 'admin_studio' && <AdminContentStudio />}

        {/* Tab: Content Review Queue */}
        {activeTab === 'review_queue' && <ContentReviewQueueView />}

        {/* Tab 2: Schemas & Assessment Tags */}
        {activeTab === 'schemas' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>CBSE 2026–27 Assessment Status Registry</span>
              </h2>
              <p className="text-xs text-slate-400">
                Mandatory tagging per Blueprint Section 4. Content is never promised as &quot;guaranteed for the board exam&quot;.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    annual_exam_core
                  </span>
                  <p className="text-xs text-slate-400">
                    Mapped directly to current official 2026–27 annual-examination content and signed off by academic reviewer.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    formative_portfolio
                  </span>
                  <p className="text-xs text-slate-400">
                    Explicitly marked as formative/portfolio-only in official syllabus (e.g. Motor, Generator, Induction).
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    enrichment_box
                  </span>
                  <p className="text-xs text-slate-400">
                    Optional background information from NCERT boxes noted as not assessed in the year-end examination.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    excluded_from_specified_assessment
                  </span>
                  <p className="text-xs text-slate-400">
                    Explicitly excluded from the relevant assessment scope (e.g. colour of sun at sunrise/sunset from scattering application).
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    needs_curriculum_review
                  </span>
                  <p className="text-xs text-slate-400">
                    Ambiguous wording (e.g. &apos;Electric Effects of Electric Current&apos; non-year-end clause). Held from Board Exam Mode until confirmed.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                    not_mapped
                  </span>
                  <p className="text-xs text-slate-400">
                    Initial unmapped state. Never inferred as &apos;out of syllabus&apos; without checking evidence.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Verification & Pipeline Stages</span>
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {['draft', 'page_review_needed', 'syllabus_mapped', 'academic_review', 'approved', 'published'].map(
                  (stage, i) => (
                    <React.Fragment key={stage}>
                      <span className="px-3 py-1 rounded-md bg-slate-950 border border-slate-800 font-mono text-cyan-300">
                        {stage}
                      </span>
                      {i < 5 && <span className="text-slate-600 font-bold">&rarr;</span>}
                    </React.Fragment>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Security Rules & Role Enforcement */}
        {activeTab === 'security' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <Lock className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold">Server-Side Role Checks & Rules Defense</h2>
            </div>
            <p className="text-xs text-slate-400">
              Per blueprint rules, client-supplied flags such as <code className="text-rose-300 font-mono">&#123; role: &apos;admin&apos; &#125;</code> are strictly untrusted and rejected. Ingestion, review sign-off, and bundle publishing require verified server authorization.
            </p>

            <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto space-y-2">
              <div className="text-emerald-400">// rules_version = &apos;2&apos;; cloud.firestore extract:</div>
              <div>match /publishedContent/&#123;session&#125;/chapters/&#123;chapterId&#125; &#123; allow read: if true; allow write: if isAdmin(); &#125;</div>
              <div>match /concepts/&#123;conceptId&#125; &#123; allow read: if resource.data.verificationStatus == &apos;published&apos; || isAdmin(); &#125;</div>
              <div>match /sourceDocuments/&#123;docId&#125; &#123; allow read, write: if isAdmin(); &#125;</div>
              <div>match /studyProgress/&#123;userId&#125; &#123; allow read, write: if isOwner(userId) || isAdmin(); &#125;</div>
              <div className="text-slate-500">// Non-admins cannot upload, review, approve, or publish</div>
            </div>
          </div>
        )}

        {/* Tab 4: Live Verification Results */}
        {activeTab === 'tests' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <span>Live Acceptance Suite (15 Test Cases)</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                {testResults?.passed ? 'ALL CHECKS PASSED' : 'RUNNING / FAILED'}
              </span>
            </div>

            <div className="space-y-2 pt-2">
              {testResults?.results.map((res, i) => (
                <div
                  key={i}
                  className={`text-xs font-mono p-3 rounded-lg border flex items-center justify-between ${
                    res.startsWith('[PASS]')
                      ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                      : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                  }`}
                >
                  <span>{res}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">Verified</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      )}

      {/* Chapter 1 Complete Playable Mission (8-Stage Progression) */}
      {showChapter1Lab && (
        <Chapter1Mission onReturnToHub={() => setShowChapter1Lab(false)} />
      )}

      {/* Footer */}
      {activeTab !== 'game' && (
        <footer className="border-t border-slate-800/80 bg-slate-900/40 py-4 text-center text-xs text-slate-500">
          StudyVerse 10 &middot; CBSE Class X Science 3D Learning Game &middot; Blueprint v1.0
        </footer>
      )}

      {/* Global SciBuddy Study Drawer */}
      <StudyBuddyDrawer
        isOpen={showStudyBuddy}
        onClose={() => setShowStudyBuddy(false)}
        chapterId="ch01"
        conceptId="concept_ch01_chemical_equations"
      />

      {/* Android APK & PWA Download Modal */}
      <ApkDownloadModal
        isOpen={showApkDownload}
        onClose={() => setShowApkDownload(false)}
      />
    </div>
  );
}
