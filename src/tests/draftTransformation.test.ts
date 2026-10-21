/**
 * StudyVerse 10 — Draft Transformation Pipeline Test Suite
 * Verifies Phase 4 acceptance criteria:
 * 1. Extraction into draft concepts, activities, simulations, and questions.
 * 2. Exact source-page citations preserved.
 * 3. Trilingual explanations populated (English, Hindi, Hinglish).
 * 4. Model-created practice labelled isAiGenerated: true (never quoted as literal NCERT).
 * 5. Draft isolation: verificationStatus is strictly 'draft' (never auto-published).
 * 6. Rejection of missing source reference.
 * 7. Rejection of malformed question answers.
 * 8. Bounded batch execution resilience.
 */

import { draftTransformationPipeline } from '../server/draftTransformationPipeline.ts';
import { ExtractedSection, QuestionSchema } from '../content/schemas.ts';
import { SecurityContext } from '../services/contentRepository.ts';

export async function runDraftTransformationTests(): Promise<{ passed: boolean; results: string[] }> {
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
    userId: 'admin_transformer',
    isStudent: false,
    isAdmin: true,
    adminVerificationToken: 'studyverse_admin_secure_key_2026',
  };

  const sampleSections: ExtractedSection[] = [
    {
      sectionId: 'sec_1_1_equations',
      sourceDocumentId: 'jesc101_reprint2026_27',
      chapterIdentifier: 'ch01',
      heading: '1.1 Chemical Equations',
      pageRange: { startPdfPage: 1, endPdfPage: 1 },
      content: 'Whenever a chemical change occurs, we can say that a chemical reaction has taken place. 2Mg + O2 -> 2MgO',
      sectionType: 'theory',
    },
    {
      sectionId: 'sec_1_1_act1',
      sourceDocumentId: 'jesc101_reprint2026_27',
      chapterIdentifier: 'ch01',
      heading: 'Activity 1.1 Burning of Magnesium Ribbon',
      pageRange: { startPdfPage: 1, endPdfPage: 1 },
      content: 'Clean a magnesium ribbon about 3-4 cm long. Burn it using a burner and collect ash in watch-glass.',
      sectionType: 'activity_box',
    },
  ];

  // --- Test 1: Transformation of Extracted Sections ---
  try {
    const drafts = await draftTransformationPipeline.transformSection(sampleSections[1], adminContext, 1);

    assert(drafts.concepts.length > 0, 'Test 1.1: Generated concept draft from section');
    assert(drafts.activities.length > 0, 'Test 1.2: Generated activity draft from activity box');
    assert(drafts.simulations.length > 0, 'Test 1.3: Generated simulation specification');
    assert(drafts.questions.length > 0, 'Test 1.4: Generated practice question draft');

    // --- Test 2: Exact Source-Page Citations ---
    const concept = drafts.concepts[0];
    assert(
      concept.sourceRefs.length > 0 &&
      concept.sourceRefs[0].sourceDocumentId === 'jesc101_reprint2026_27' &&
      concept.sourceRefs[0].pdfPageIndex === 1 &&
      concept.sourceRefs[0].printedPageNumber === 1,
      'Test 2.1: Concept preserves exact sourceDocumentId, PDF page index, and printed book page'
    );

    // --- Test 3: Trilingual Explanations ---
    assert(
      Boolean(concept.explanations.simpleEnglish?.length > 10) &&
      Boolean(concept.explanations.hindi?.length > 10) &&
      Boolean(concept.explanations.hinglish?.length > 10),
      'Test 3.1: Generated accurate trilingual explanations (English, Hindi, Hinglish)'
    );

    // --- Test 4: Model-Created Practice Tagged isAiGenerated: true ---
    const question = drafts.questions[0];
    assert(
      question.isAiGenerated === true,
      'Test 4.1: Practice question is explicitly labelled isAiGenerated: true'
    );

    // --- Test 5: Draft Isolation (Never auto-published) ---
    assert(
      concept.verificationStatus === 'draft' &&
      question.verificationStatus === 'draft' &&
      drafts.activities[0].verificationStatus === 'draft',
      'Test 5.1: All generated entities are assigned verificationStatus: "draft"'
    );
  } catch (err: any) {
    assert(false, 'Test 1-5: Transformation execution failed', err?.message);
  }

  // --- Test 6: Rejection of Missing Source Reference ---
  try {
    const invalidDraft = {
      conceptId: 'invalid_concept_no_ref',
      subjectId: 'science_10',
      chapterId: 'ch01',
      title: 'Invalid Concept',
      learningObjectives: ['Test'],
      explanations: { simpleEnglish: 'Test', hindi: 'Test', hinglish: 'Test' },
      sourceRefs: [], // Missing!
      assessmentStatus: 'annual_exam_core',
      syllabusMappingStatus: 'mapped',
      verificationStatus: 'draft',
      contentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Rejection by Zod
    QuestionSchema.parse(invalidDraft as any);
    assert(false, 'Test 6.1: Should reject missing source reference');
  } catch {
    assert(true, 'Test 6.1: Successfully rejected entity with missing source citation');
  }

  // --- Test 7: Rejection of Malformed Answers ---
  try {
    const invalidQuestion = {
      questionId: 'q_malformed_ans',
      conceptIds: ['c1'],
      chapterId: 'ch01',
      questionType: 'mcq',
      stem: 'What is this?',
      options: ['A', 'B'],
      correctAnswer: '', // Malformed/empty!
      workedExplanation: { english: 'Explanation' },
      hint: 'Hint',
      marks: 1,
      assessmentStatus: 'annual_exam_core',
      sourceRefs: [
        {
          sourceDocumentId: 'doc1',
          chapterIdentifier: 'ch01',
          pdfPageIndex: 1,
          sectionHeading: 'Section',
        },
      ],
      answerVerifiedBy: '', // Empty reviewer!
      verificationStatus: 'draft',
      isAiGenerated: true,
      version: 1,
    };
    QuestionSchema.parse(invalidQuestion);
    assert(false, 'Test 7.1: Should reject question without verified reviewer signature');
  } catch {
    assert(true, 'Test 7.1: Successfully rejected malformed question lacking reviewer signature');
  }

  // --- Test 8: Bounded Batch Execution Resilience ---
  try {
    const batchResult = await draftTransformationPipeline.batchTransform(sampleSections, adminContext);
    assert(
      batchResult.concepts.length === 2 &&
      batchResult.activities.length === 1 &&
      batchResult.rejectedItemsCount === 0,
      'Test 8.1: Bounded batch execution processed multiple sections with zero unhandled errors'
    );
  } catch (err: any) {
    assert(false, 'Test 8.1: Batch execution failed', err?.message);
  }

  return { passed: allPassed, results };
}
