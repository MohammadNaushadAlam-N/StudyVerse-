/**
 * StudyVerse 10 — Private Admin Content Studio (PDF Ingestion & Review)
 * Blueprint Screen 8: Private admin upload, verification status, extracted text inspector
 */

import React, { useState } from 'react';
import {
  FileUp,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Hash,
  Eye,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { pdfIngestionEngine, IngestionResult, IngestionProgress } from './pdfPipeline.ts';
import { draftTransformationPipeline, TransformationResult } from '../server/draftTransformationPipeline.ts';
import { SecurityContext } from '../services/contentRepository.ts';
import { Concept, Activity, Simulation, Question } from '../content/schemas.ts';

export const AdminContentStudio: React.FC = () => {
  const [adminToken, setAdminToken] = useState('studyverse_admin_secure_key_2026');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<IngestionProgress | null>(null);
  const [ingestionResult, setIngestionResult] = useState<IngestionResult | null>(null);
  const [transformationResult, setTransformationResult] = useState<TransformationResult | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'upload' | 'extracted_pages' | 'sections' | 'drafts'>('upload');
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'hindi' | 'hinglish'>('english');

  const adminContext: SecurityContext = {
    userId: 'admin_content_lead',
    isStudent: false,
    isAdmin: true,
    adminVerificationToken: adminToken,
  };

  // Preset Fixtures for Live Admin Testing
  const runPresetTest = async (preset: 'valid' | 'malformed' | 'duplicate' | 'scanned') => {
    setIsProcessing(true);
    setErrorMessage(null);
    setIngestionResult(null);

    try {
      if (preset === 'malformed') {
        // Rejects non-PDF file
        const malformedBytes = new TextEncoder().encode('<html><body>Corrupted HTML file masquerading as PDF</body></html>');
        const validation = pdfIngestionEngine.validateFile(malformedBytes, 'corrupt_sample.pdf');
        if (!validation.valid) {
          throw new Error(`File Validation Error: ${validation.error}`);
        }
      }

      if (preset === 'duplicate') {
        const dummyValidBytes = new TextEncoder().encode('%PDF-1.4\nstream\nDuplicate Payload\nendstream\n%%EOF');
        const hash = await pdfIngestionEngine.computeSha256(dummyValidBytes);
        const isDupe = pdfIngestionEngine.isDuplicateHash([{ sha256: hash } as any], hash);
        if (isDupe) {
          throw new Error(`Duplicate File Detected: SHA-256 [${hash.slice(0, 16)}...] matches an existing registered draft.`);
        }
      }

      if (preset === 'scanned') {
        const scannedBytes = new TextEncoder().encode('%PDF-1.4\nstream\nScanned\nendstream\n%%EOF');
        const result = await pdfIngestionEngine.ingestDocument(
          adminContext,
          scannedBytes,
          {
            fileName: 'jesc101_scanned_degraded_page.pdf',
            title: 'NCERT Chapter 1 (Scanned Archival Page)',
            rawPagesText: ['[SCANNED_PAGE_IMAGE_ONLY] - raster scan without selectable OCR text stream.'],
          },
          setProgress
        );
        setIngestionResult(result);
        setActiveTab('extracted_pages');
        return;
      }

      // Valid Chapter 1 Ingestion
      const validBytes = new TextEncoder().encode('%PDF-1.7\nstream\nValid NCERT Ch1\nendstream\n%%EOF');
      const page1Text = `CHAPTER 1
Chemical Reactions and Equations
Consider the following situations of daily life and think what happens when:
- milk is left at room temperature during summers.
- an iron tawa/pan/nail is left exposed to humid atmosphere.
- grapes get fermented.
- food is cooked.
- food gets digested in our body.
- we respire.

1.1 Chemical Equations
Activity 1.1
Clean a magnesium ribbon about 3-4 cm long by rubbing it with sandpaper.
Hold it with a pair of tongs. Burn it using a spirit lamp or burner and collect the ash so formed in a watch-glass.
What do you observe?
You must have observed that magnesium ribbon burns with a dazzling white flame and changes into a white powder. This powder is magnesium oxide.

2Mg(s) + O2(g) -> 2MgO(s)

1  SCIENCE`;

      const page2Text = `1.1.2 Balanced Chemical Equations
Recall the law of conservation of mass that you studied in Class IX: mass can neither be created nor destroyed in a chemical reaction.
That is, the total mass of the elements present in the products of a chemical reaction has to be equal to the total mass of the elements present in the reactants.

Zinc + Sulphuric acid -> Zinc sulphate + Hydrogen
Zn + H2SO4 -> ZnSO4 + H2

Table 1.1 Element Atom Counts
| Element | Number of atoms in reactants (LHS) | Number of atoms in products (RHS) |
| Zn      | 1                                  | 1                                 |
| H       | 2                                  | 2                                 |
| S       | 1                                  | 1                                 |
| O       | 4                                  | 4                                 |

SCIENCE  2`;

      const page3Text = `1.2 Types of Chemical Reactions
We have learnt in Class IX that during a chemical reaction atoms of one element do not change into those of another element.
Nor do atoms disappear from the mixture or appear from elsewhere.

1.2.1 Combination Reaction
Activity 1.4
Take a small amount of calcium oxide or quick lime in a beaker.
Slowly add water to this.
Touch the beaker as shown in Fig. 1.3. Do you feel any change in temperature?
Calcium oxide reacts vigorously with water to produce slaked lime (calcium hydroxide) releasing a large amount of heat.

CaO(s) + H2O(l) -> Ca(OH)2(aq) + Heat

SCIENCE  6`;

      const result = await pdfIngestionEngine.ingestDocument(
        adminContext,
        validBytes,
        {
          fileName: 'jesc101_reprint2026_27.pdf',
          title: 'NCERT Class X Science — Chapter 1: Chemical Reactions and Equations',
          publisher: 'NCERT',
          editionLabel: 'Reprint 2026–27',
          academicSession: '2026-27',
          chapterIdentifier: 'ch01',
          rawPagesText: [page1Text, page2Text, page3Text],
        },
        setProgress
      );

      setIngestionResult(result);
      setActiveTab('extracted_pages');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ingestion failure');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setIngestionResult(null);

    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const result = await pdfIngestionEngine.ingestDocument(
        adminContext,
        buffer,
        {
          fileName: file.name,
          title: file.name.replace(/\.[^/.]+$/, ''),
          publisher: 'NCERT',
          editionLabel: 'Reprint 2026–27',
          academicSession: '2026-27',
          chapterIdentifier: 'ch01',
        },
        setProgress
      );
      setIngestionResult(result);
      setActiveTab('extracted_pages');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to ingest uploaded PDF file.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-rose-950 text-rose-300 border border-rose-800">
              Admin Only
            </span>
            <h2 className="text-base font-bold text-white">Private PDF Ingestion & Extraction Studio</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Accepts textbook PDFs, enforces magic byte checks (%PDF-), computes SHA-256 deduplication, extracts printed page numbers, and routes low-text pages to OCR review.
          </p>
        </div>

        {/* Security Token Input (Simulating server-authenticated session) */}
        <div className="flex items-center space-x-2 text-xs">
          <label className="text-slate-400 font-medium">Auth Key:</label>
          <input
            type="password"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs w-48 focus:border-cyan-500 focus:outline-none"
            placeholder="Admin Secret Key"
          />
        </div>
      </div>

      {/* Preset Test Scenarios */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Curriculum Ingestion Scenarios (Blueprint Acceptance Tests)
          </h3>
          <span className="text-[11px] text-slate-500">Select any scenario to execute live</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => runPresetTest('valid')}
            disabled={isProcessing}
            className="p-3.5 rounded-xl border border-emerald-900/40 bg-emerald-950/20 hover:bg-emerald-950/40 text-left transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">1. Valid NCERT Chapter 1</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Extracts 3 pages, detects printed pages 1, 2, 6, chemical equations, and Activity 1.1.
            </p>
          </button>

          <button
            onClick={() => runPresetTest('malformed')}
            disabled={isProcessing}
            className="p-3.5 rounded-xl border border-rose-900/40 bg-rose-950/20 hover:bg-rose-950/40 text-left transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300">2. Malformed File</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Verifies rejection when %PDF- magic bytes header is missing.
            </p>
          </button>

          <button
            onClick={() => runPresetTest('duplicate')}
            disabled={isProcessing}
            className="p-3.5 rounded-xl border border-amber-900/40 bg-amber-950/20 hover:bg-amber-950/40 text-left transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">3. Duplicate SHA-256</span>
              <Copy className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Validates that uploading identical content flags duplicate file hash.
            </p>
          </button>

          <button
            onClick={() => runPresetTest('scanned')}
            disabled={isProcessing}
            className="p-3.5 rounded-xl border border-cyan-900/40 bg-cyan-950/20 hover:bg-cyan-950/40 text-left transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300">4. Scanned/Degraded Page</span>
              <AlertTriangle className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Detects low text density and flags ocrRequired & page_review_needed.
            </p>
          </button>
        </div>

        {/* Custom Upload Dropzone */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
          <label className="inline-flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-cyan-400 cursor-pointer transition">
            <FileUp className="w-4 h-4 text-cyan-500" />
            <span>Upload custom source PDF from local disk</span>
            <input type="file" accept=".pdf,application/pdf" onChange={handleCustomUpload} className="hidden" />
          </label>
          <span className="text-[10px] text-slate-500">Max limit: 50 MB &middot; Stored privately</span>
        </div>
      </div>

      {/* Progress & Error Notification */}
      {isProcessing && progress && (
        <div className="rounded-xl border border-cyan-900 bg-cyan-950/30 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-cyan-300 capitalize">{progress.currentTask}</span>
            <span className="font-mono text-cyan-400">{progress.percent}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-rose-900/80 bg-rose-950/30 p-4 flex items-start space-x-3 text-xs text-rose-300">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Pipeline Rejection Alert</p>
            <p className="text-rose-200/90">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Extracted Document View */}
      {ingestionResult && (
        <div className="space-y-4">
          {/* Metadata Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                  ingestionResult.document.extractionStatus === 'completed'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}>
                  Status: {ingestionResult.document.extractionStatus}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{ingestionResult.document.title}</h3>
                <p className="text-xs text-slate-400">
                  {ingestionResult.document.publisher} &middot; {ingestionResult.document.editionLabel} &middot; Session {ingestionResult.document.academicSession}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">SHA-256 Provenance</div>
                  <div className="font-mono text-xs text-cyan-400 flex items-center space-x-1">
                    <Hash className="w-3.5 h-3.5" />
                    <span>{ingestionResult.document.sha256.substring(0, 16)}...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warnings Alert if scanned page detected */}
            {ingestionResult.warnings.length > 0 && (
              <div className="rounded-lg border border-amber-900/60 bg-amber-950/20 p-3 text-xs text-amber-300 space-y-1">
                <div className="font-semibold flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Curriculum Quality Warning: Scanned Page Requiring Human/OCR Review</span>
                </div>
                {ingestionResult.warnings.map((w, i) => (
                  <p key={i} className="text-amber-200/80 text-[11px]">{w}</p>
                ))}
              </div>
            )}

            {/* Sub-tabs & Action */}
            <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('extracted_pages')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    activeTab === 'extracted_pages'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pages ({ingestionResult.pages.length})
                </button>
                <button
                  onClick={() => setActiveTab('sections')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    activeTab === 'sections'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Extracted Sections ({ingestionResult.sections.length})
                </button>
                <button
                  onClick={() => setActiveTab('drafts')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    activeTab === 'drafts'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Draft Learning Units ({transformationResult ? transformationResult.concepts.length : 0})
                </button>
              </div>

              {/* Transform Action */}
              <button
                onClick={async () => {
                  if (!ingestionResult) return;
                  setIsTransforming(true);
                  try {
                    const res = await draftTransformationPipeline.batchTransform(
                      ingestionResult.sections,
                      adminContext
                    );
                    setTransformationResult(res);
                    setActiveTab('drafts');
                  } catch (err: any) {
                    setErrorMessage(err?.message || 'Transformation failed');
                  } finally {
                    setIsTransforming(false);
                  }
                }}
                disabled={isTransforming}
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isTransforming ? 'Transforming Sections...' : 'Run Gemini Draft Pipeline'}</span>
              </button>
            </div>
          </div>

          {/* Page-by-Page Inspector */}
          {activeTab === 'extracted_pages' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Page list column */}
              <div className="space-y-2">
                {ingestionResult.pages.map((p, idx) => (
                  <button
                    key={p.pageId}
                    onClick={() => setSelectedPageIndex(idx)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition ${
                      selectedPageIndex === idx
                        ? 'bg-cyan-950/50 border-cyan-700 text-cyan-200 shadow-md'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>PDF Page {p.pdfPageIndex + 1}</span>
                      {p.printedPageNumber && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                          Book Pg {p.printedPageNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-2 text-[10px] text-slate-400">
                      {p.hasFormulas && <span className="text-emerald-400">Formulas</span>}
                      {p.hasTables && <span className="text-cyan-400">Table</span>}
                      {p.ocrRequired && <span className="text-amber-400">OCR Needed</span>}
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Page Content Inspector */}
              <div className="md:col-span-3 rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
                {ingestionResult.pages[selectedPageIndex] && (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">
                            PDF Page {ingestionResult.pages[selectedPageIndex].pdfPageIndex + 1}
                          </span>
                          {ingestionResult.pages[selectedPageIndex].printedPageNumber && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                              Printed Textbook Page: {ingestionResult.pages[selectedPageIndex].printedPageNumber}
                            </span>
                          )}
                          {ingestionResult.pages[selectedPageIndex].ocrRequired && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                              OCR Flagged
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Citation ID: <code className="text-slate-300">{ingestionResult.pages[selectedPageIndex].pageId}</code>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {ingestionResult.pages[selectedPageIndex].rawText.length} characters
                        </span>
                      </div>
                    </div>

                    <pre className="text-xs font-mono text-slate-200 bg-slate-900/60 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800/80 max-h-96">
                      {ingestionResult.pages[selectedPageIndex].rawText}
                    </pre>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Extracted Sections List */}
          {activeTab === 'sections' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Parsed Pedagogical Sections ({ingestionResult.sections.length})
              </h4>
              <div className="space-y-3">
                {ingestionResult.sections.map((sec) => (
                  <div key={sec.sectionId} className="p-3.5 rounded-lg border border-slate-800 bg-slate-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300">{sec.heading}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 capitalize">
                        {sec.sectionType.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{sec.content}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      PDF Page {sec.pageRange.startPdfPage + 1} &middot; Section ID: {sec.sectionId}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Draft Learning Units List */}
          {activeTab === 'drafts' && (
            <div className="space-y-6">
              {!transformationResult || transformationResult.concepts.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-cyan-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No Drafts Generated Yet</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Click &quot;Run Gemini Draft Pipeline&quot; above to transform extracted sections into schema-validated draft concepts, activities, and questions.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Language Selector for Concepts */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Generated Draft Concepts ({transformationResult.concepts.length})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 uppercase font-mono font-bold">
                        Draft (Unpublished)
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-400">Explanation Language:</span>
                      {(['english', 'hindi', 'hinglish'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setSelectedLanguage(lang)}
                          className={`px-2.5 py-1 rounded capitalize font-medium transition ${
                            selectedLanguage === lang
                              ? 'bg-cyan-900 text-cyan-200 border border-cyan-700'
                              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Concept Cards */}
                  <div className="space-y-4">
                    {transformationResult.concepts.map((concept) => (
                      <div key={concept.conceptId} className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">{concept.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {concept.assessmentStatus}
                          </span>
                        </div>

                        {/* Selected Language Explanation */}
                        <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 text-xs text-slate-200 leading-relaxed">
                          <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide mb-1">
                            {selectedLanguage} Explanation
                          </div>
                          {selectedLanguage === 'english' && concept.explanations.simpleEnglish}
                          {selectedLanguage === 'hindi' && concept.explanations.hindi}
                          {selectedLanguage === 'hinglish' && concept.explanations.hinglish}
                        </div>

                        {/* Learning Objectives & Misconceptions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-2.5 rounded bg-slate-900/30 border border-slate-800/60">
                            <span className="font-semibold text-slate-300 block mb-1">Learning Objectives:</span>
                            <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                              {concept.learningObjectives.map((obj, i) => (
                                <li key={i}>{obj}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-2.5 rounded bg-amber-950/20 border border-amber-900/30">
                            <span className="font-semibold text-amber-300 block mb-1">Targeted Misconception:</span>
                            <p className="text-amber-200/80 text-[11px]">
                              {concept.commonMisconceptions[0] || 'None specified'}
                            </p>
                          </div>
                        </div>

                        {/* Source Citation */}
                        <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-800/60 pt-2">
                          <span>
                            Source Citation: {concept.sourceRefs[0]?.sourceDocumentId} &middot; PDF Pg {concept.sourceRefs[0]?.pdfPageIndex + 1}
                            {concept.sourceRefs[0]?.printedPageNumber && ` (Book Pg ${concept.sourceRefs[0]?.printedPageNumber})`}
                          </span>
                          <span className="text-amber-400">verificationStatus: draft</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Practice Questions with AI Label */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Model-Generated Practice Questions ({transformationResult.questions.length})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 uppercase font-mono font-bold">
                        AI-Generated
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Model-created practice items are explicitly flagged as <code className="text-purple-300">isAiGenerated: true</code> and cannot be used for official board exam scoring until signed off by a reviewer.
                    </p>

                    <div className="space-y-3 pt-2">
                      {transformationResult.questions.map((q) => (
                        <div key={q.questionId} className="p-4 rounded-lg border border-slate-800 bg-slate-950 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-200">{q.stem}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-700/60 font-mono">
                              AI Generated
                            </span>
                          </div>

                          {q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {q.options.map((opt, i) => (
                                <div
                                  key={i}
                                  className={`p-2 rounded border text-[11px] ${
                                    opt === q.correctAnswer
                                      ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300 font-medium'
                                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                                  }`}
                                >
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-800/60">
                            <span className="font-semibold text-slate-300">Worked Explanation:</span>{' '}
                            {q.workedExplanation.english}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
