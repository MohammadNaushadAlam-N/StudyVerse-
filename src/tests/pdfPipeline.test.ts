/**
 * StudyVerse 10 — PDF Ingestion Pipeline Test Suite
 * Verifies Phase 2 acceptance criteria:
 * 1. Valid PDF with text, equations, headings, activities, and printed page numbers.
 * 2. Malformed PDF (invalid signature/magic bytes).
 * 3. Duplicate PDF detection (SHA-256 matching).
 * 4. Scanned/image-heavy page detection (flags ocrRequired and page_review_needed).
 * 5. Batch processing progress tracking.
 */

import { pdfIngestionEngine, IngestionProgress } from '../admin/pdfPipeline.ts';
import { SecurityContext } from '../services/contentRepository.ts';

export async function runPdfPipelineTests(): Promise<{ passed: boolean; results: string[] }> {
  const results: string[] = [];
  let allPassed = true;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      results.push(`[PASS] ${testName}`);
    } else {
      results.push(`[FAIL] ${testName}${detail ? `: ${detail}` : ''}`);
      allPassed = false;
    }
  }

  const adminContext: SecurityContext = {
    userId: 'admin_ingest_bot',
    isStudent: false,
    isAdmin: true,
    adminVerificationToken: 'studyverse_admin_secure_key_2026',
  };

  // Helper to generate a minimal valid PDF byte sequence
  function createPdfBytes(header = '%PDF-1.4\n', body = 'stream\nBT /F1 12 Tf (Hello) Tj ET\nendstream'): Uint8Array {
    const encoder = new TextEncoder();
    const headerBytes = encoder.encode(header);
    const bodyBytes = encoder.encode(body);
    const footerBytes = encoder.encode('\n%%EOF\n');
    const total = new Uint8Array(headerBytes.length + bodyBytes.length + footerBytes.length);
    total.set(headerBytes, 0);
    total.set(bodyBytes, headerBytes.length);
    total.set(footerBytes, headerBytes.length + bodyBytes.length);
    return total;
  }

  // --- Test 1: Valid PDF Ingestion with Structure & Printed Page Number ---
  const validPage1Text = `
    CHAPTER 1
    Chemical Reactions and Equations
    Consider the following situations of daily life:
    - milk is left at room temperature during summers.
    - an iron tawa/pan/nail is left exposed to humid atmosphere.
    
    1.1 Chemical Equations
    Activity 1.1
    Clean a magnesium ribbon about 3-4 cm long by rubbing it with sandpaper.
    Hold it with a pair of tongs. Burn it using a spirit lamp or burner and collect the ash so formed in a watch-glass.
    What do you observe?
    
    2Mg(s) + O2(g) -> 2MgO(s)
    
    1  SCIENCE
  `;

  const validPage2Text = `
    1.2 Types of Chemical Reactions
    We have learnt in Class IX that during a chemical reaction atoms of one element do not change into those of another element.
    
    Activity 1.2
    Take lead nitrate solution in a test tube. Add potassium iodide solution to this.
    What do you observe?
    
    Pb(NO3)2(aq) + 2KI(aq) -> PbI2(s) + 2KNO3(aq)
    
    Table 1.1 Element Atom Counts
    | Element | Reactants | Products |
    | Mg      | 2         | 2        |
    | O       | 2         | 2        |
    
    SCIENCE  2
  `;

  const validPdfBytes = createPdfBytes('%PDF-1.7\n', 'stream\nText\nendstream');

  let progressReached100 = false;
  const progressStages: string[] = [];

  try {
    const result = await pdfIngestionEngine.ingestDocument(
      adminContext,
      validPdfBytes,
      {
        fileName: 'jesc101_sample_ch1.pdf',
        title: 'NCERT Class 10 Science Chapter 1: Chemical Reactions and Equations',
        publisher: 'NCERT',
        editionLabel: 'Reprint 2026–27',
        academicSession: '2026-27',
        chapterIdentifier: 'ch01',
        rawPagesText: [validPage1Text, validPage2Text],
      },
      (p: IngestionProgress) => {
        progressStages.push(p.stage);
        if (p.percent === 100) progressReached100 = true;
      }
    );

    assert(result.document.extractionStatus === 'completed', 'Test 1.1: Valid PDF extracted with completed status');
    assert(result.pages.length === 2, 'Test 1.2: Both pages extracted');
    assert(result.pages[0].printedPageNumber === 1, 'Test 1.3: Page 1 detected printed book page 1');
    assert(result.pages[1].printedPageNumber === 2, 'Test 1.4: Page 2 detected printed book page 2');
    assert(result.pages[0].hasFormulas === true && result.pages[0].hasImages === false, 'Test 1.5: Detected chemical equations on page 1');
    assert(result.pages[1].hasTables === true, 'Test 1.6: Detected tabular data on page 2');
    assert(result.sections.some((s) => s.sectionType === 'activity_box'), 'Test 1.7: Extracted Activity 1.1 box');
    assert(result.document.sha256.length === 64, 'Test 1.8: SHA-256 computed correctly');
    assert(progressReached100, 'Test 1.9: Batch progress reached 100%');
  } catch (err: any) {
    assert(false, 'Test 1: Valid PDF Ingestion failed', err?.message);
  }

  // --- Test 2: Malformed PDF (Missing %PDF- header) ---
  const malformedBytes = new TextEncoder().encode('<html><body>Not a PDF document at all</body></html>');
  try {
    const validation = pdfIngestionEngine.validateFile(malformedBytes, 'invalid.pdf');
    assert(!validation.valid && Boolean(validation.error?.includes('%PDF-')), 'Test 2.1: Rejects malformed file missing %PDF- magic bytes');
  } catch {
    assert(false, 'Test 2.1: Rejects malformed file');
  }

  // --- Test 3: Duplicate PDF Detection ---
  try {
    const hash = await pdfIngestionEngine.computeSha256(validPdfBytes);
    const isDuplicate = pdfIngestionEngine.isDuplicateHash(
      [{ sha256: hash } as any],
      hash
    );
    assert(isDuplicate, 'Test 3.1: Duplicate SHA-256 detection catches duplicate upload');
  } catch (err: any) {
    assert(false, 'Test 3.1: Duplicate detection', err?.message);
  }

  // --- Test 4: Scanned / Degraded Page Detection ---
  const scannedPageText = `[SCANNED_PAGE_IMAGE_ONLY] - raster scan without selectable OCR text`;
  const degradedPdfBytes = createPdfBytes('%PDF-1.4\n', 'stream\nScanned\nendstream');

  try {
    const degradedResult = await pdfIngestionEngine.ingestDocument(
      adminContext,
      degradedPdfBytes,
      {
        fileName: 'scanned_chapter_sample.pdf',
        title: 'Scanned Test Page',
        rawPagesText: [scannedPageText],
      }
    );

    assert(
      degradedResult.document.extractionStatus === 'page_review_needed',
      'Test 4.1: Scanned page marks document extractionStatus as page_review_needed'
    );
    assert(
      degradedResult.pages[0].isScannedOrDegraded === true &&
      degradedResult.pages[0].ocrRequired === true &&
      degradedResult.pages[0].reviewFlag === true,
      'Test 4.2: Scanned page flags ocrRequired and reviewFlag'
    );
  } catch (err: any) {
    assert(false, 'Test 4: Scanned page detection failed', err?.message);
  }

  return { passed: allPassed, results };
}
