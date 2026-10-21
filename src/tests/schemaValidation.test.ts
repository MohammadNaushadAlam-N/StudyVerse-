/**
 * StudyVerse 10 — Schema & Database Foundation Test Suite
 * Verifies Phase 1 acceptance criteria:
 * 1. Zod schema validation for all academic & student entities.
 * 2. Rejection of malformed assessmentStatus / verificationStatus.
 * 3. Enforcing sourceRefs requirements.
 * 4. Rejection of client-supplied fake admin credentials.
 * 5. Draft isolation: Student queries never return draft records.
 * 6. Student progress isolation.
 */

import {
  AssessmentStatusSchema,
  VerificationStatusSchema,
  ConceptSchema,
  QuestionSchema,
  PublishedContentSchema,
} from '../content/schemas.ts';
import { contentDatabase, SecurityContext } from '../services/contentRepository.ts';

export async function runFoundationTests(): Promise<{ passed: boolean; results: string[] }> {
  const results: string[] = [];
  let allPassed = true;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      results.push(`[PASS] ${testName}`);
    } else {
      results.push(`[FAIL] ${testName}`);
      allPassed = false;
    }
  }

  // --- Test 1: AssessmentStatus Enum Validation ---
  try {
    AssessmentStatusSchema.parse('annual_exam_core');
    AssessmentStatusSchema.parse('formative_portfolio');
    AssessmentStatusSchema.parse('enrichment_box');
    AssessmentStatusSchema.parse('excluded_from_specified_assessment');
    AssessmentStatusSchema.parse('needs_curriculum_review');
    AssessmentStatusSchema.parse('not_mapped');
    assert(true, 'Test 1.1: AssessmentStatus valid enum values accepted');
  } catch {
    assert(false, 'Test 1.1: AssessmentStatus valid enum values accepted');
  }

  try {
    AssessmentStatusSchema.parse('board_exam_guaranteed'); // Illegal tag
    assert(false, 'Test 1.2: Illegal assessment status rejected');
  } catch {
    assert(true, 'Test 1.2: Illegal assessment status rejected');
  }

  // --- Test 2: VerificationStatus Enum Validation ---
  try {
    VerificationStatusSchema.parse('draft');
    VerificationStatusSchema.parse('page_review_needed');
    VerificationStatusSchema.parse('syllabus_mapped');
    VerificationStatusSchema.parse('academic_review');
    VerificationStatusSchema.parse('approved');
    VerificationStatusSchema.parse('published');
    assert(true, 'Test 2.1: VerificationStatus pipeline states accepted');
  } catch {
    assert(false, 'Test 2.1: VerificationStatus pipeline states accepted');
  }

  // --- Test 3: Concept Schema & Source Ref Requirement ---
  const validConcept = {
    conceptId: 'c1_chemical_change',
    subjectId: 'science_10',
    chapterId: 'ch01',
    title: 'Characteristics of a Chemical Reaction',
    learningObjectives: ['Identify observable indicators of chemical reactions: gas, precipitate, color, temperature.'],
    explanations: {
      simpleEnglish: 'A chemical reaction happens when one or more substances change to form new substances.',
      hindi: 'रासायनिक अभिक्रिया वह प्रक्रिया है जिसमें एक या अधिक पदार्थ नए पदार्थों में परिवर्तित होते हैं।',
      hinglish: 'Jab substances react karke nayi properties wale naye substances banate hain, usse chemical reaction kehte hain.',
    },
    prerequisiteIds: ['physical_vs_chemical_change_basics'],
    commonMisconceptions: ['Change in physical state alone is not proof of chemical reaction unless new substance is formed.'],
    sourceRefs: [
      {
        sourceDocumentId: 'jesc101_reprint2026_27',
        chapterIdentifier: 'ch01',
        pdfPageIndex: 1,
        printedPageNumber: 1,
        sectionHeading: '1.1 Chemical Equations',
        quotedFragment: 'Whenever a chemical change occurs, we can say that a chemical reaction has taken place.',
      },
    ],
    assessmentStatus: 'annual_exam_core',
    syllabusMappingStatus: 'mapped',
    verificationStatus: 'approved',
    contentVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    ConceptSchema.parse(validConcept);
    assert(true, 'Test 3.1: Valid Concept accepted with proper citations');
  } catch (e: any) {
    assert(false, `Test 3.1: Valid Concept accepted (${e?.message})`);
  }

  // Rejection when sourceRefs is empty
  try {
    ConceptSchema.parse({ ...validConcept, sourceRefs: [] });
    assert(false, 'Test 3.2: Rejects concept missing sourceRefs');
  } catch {
    assert(true, 'Test 3.2: Rejects concept missing sourceRefs');
  }

  // --- Test 4: Question Verification & Answer Review Requirement ---
  const validQuestion = {
    questionId: 'q_ch01_balancing_01',
    conceptIds: ['c1_chemical_change'],
    chapterId: 'ch01',
    questionType: 'mcq',
    stem: 'Why is it mandatory to balance a skeletal chemical equation?',
    options: [
      'To follow the Law of Conservation of Mass',
      'To ensure the temperature remains constant',
      'To change the molecular formulas of reactants',
      'To make the number of molecules identical on both sides',
    ],
    correctAnswer: 'To follow the Law of Conservation of Mass',
    workedExplanation: {
      english: 'According to the Law of Conservation of Mass, matter can neither be created nor destroyed in a chemical reaction. Hence total mass of elements present in products must equal total mass of elements present in reactants.',
      hindi: 'द्रव्यमान संरक्षण के नियम के अनुसार किसी रासायनिक अभिक्रिया में द्रव्यमान का न तो निर्माण होता है न ही विनाश।',
      hinglish: 'Mass conservation rule ke anusaar reactants aur products me har element ke total atoms barabar hone chahiye.',
    },
    hint: 'Recall the fundamental law of chemistry regarding conservation of mass.',
    marks: 1,
    difficulty: 'medium',
    assessmentStatus: 'annual_exam_core',
    sourceRefs: [
      {
        sourceDocumentId: 'jesc101_reprint2026_27',
        chapterIdentifier: 'ch01',
        pdfPageIndex: 3,
        printedPageNumber: 3,
        sectionHeading: '1.1.2 Balanced Chemical Equations',
      },
    ],
    answerVerifiedBy: 'Academic_Reviewer_DrSharma',
    verificationStatus: 'approved',
    isAiGenerated: false,
    version: 1,
  };

  try {
    QuestionSchema.parse(validQuestion);
    assert(true, 'Test 4.1: Valid verified Question schema accepted');
  } catch (e: any) {
    assert(false, `Test 4.1: Valid verified Question schema accepted (${e?.message})`);
  }

  // Rejection when answerVerifiedBy is empty
  try {
    QuestionSchema.parse({ ...validQuestion, answerVerifiedBy: '' });
    assert(false, 'Test 4.2: Rejects question without verified reviewer signature');
  } catch {
    assert(true, 'Test 4.2: Rejects question without verified reviewer signature');
  }

  // --- Test 5: Role-based Access & Rejection of Client-Supplied Admin Flag ---
  const fakeAdminContext: SecurityContext = {
    userId: 'student_123',
    isStudent: true,
    isAdmin: true, // Fake client-supplied flag
    adminVerificationToken: 'unauthorized_token_xyz',
  };

  try {
    await contentDatabase.registerSourceDocument(fakeAdminContext, {
      sourceDocumentId: 'test_doc',
      title: 'Hacked Document',
      storagePath: '/uploads/hacked.pdf',
      sha256: 'a'.repeat(64),
      pageCount: 10,
      extractionStatus: 'pending',
      uploadedBy: 'hacker',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    assert(false, 'Test 5.1: Client-supplied fake admin flag rejected');
  } catch {
    assert(true, 'Test 5.1: Client-supplied fake admin flag rejected');
  }

  // Real verified admin context
  const validAdminContext: SecurityContext = {
    userId: 'admin_curriculum_lead',
    isStudent: false,
    isAdmin: true,
    adminVerificationToken: 'studyverse_admin_secure_key_2026',
  };

  try {
    await contentDatabase.registerSourceDocument(validAdminContext, {
      sourceDocumentId: 'ncert_class10_science_reprint2026',
      title: 'Science Textbook for Class X — Reprint 2026–27',
      publisher: 'NCERT',
      editionLabel: 'Reprint 2026–27',
      academicSession: '2026-27',
      storagePath: '/private/sources/jesc101.pdf',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      pageCount: 16,
      extractionStatus: 'completed',
      uploadedBy: 'admin_curriculum_lead',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    assert(true, 'Test 5.2: Verified admin action succeeded');
  } catch (e: any) {
    assert(false, `Test 5.2: Verified admin action succeeded (${e?.message})`);
  }

  // --- Test 6: Draft Isolation (Student queries never return drafts) ---
  // Save a draft concept
  try {
    await contentDatabase.saveDraftConcept(validAdminContext, {
      ...validConcept,
      conceptId: 'draft_c2_unreviewed',
      verificationStatus: 'draft',
    });
    assert(true, 'Test 6.1: Draft concept saved in admin queue');
  } catch (e: any) {
    assert(false, `Test 6.1: Draft concept saved in admin queue (${e?.message})`);
  }

  // Student queries chapter content
  const studentResult = await contentDatabase.getPublishedChapterContent('2026-27', 'ch01');
  assert(
    studentResult === null || !studentResult.concepts.some((c) => c.conceptId === 'draft_c2_unreviewed'),
    'Test 6.2: Draft concept NEVER exposed to student chapter queries'
  );

  // Now publish an approved bundle
  const bundlePayload = {
    publishedId: 'bundle_2026-27_ch01_v1',
    academicSession: '2026-27',
    chapterId: 'ch01',
    contentVersion: 1,
    publishedAt: new Date().toISOString(),
    publishedBy: 'admin_curriculum_lead',
    concepts: [validConcept],
    activities: [],
    simulations: [],
    questions: [validQuestion],
  };

  try {
    await contentDatabase.publishChapterBundle(validAdminContext, bundlePayload);
    assert(true, 'Test 6.3: Valid bundle published by admin');
  } catch (e: any) {
    assert(false, `Test 6.3: Valid bundle published by admin (${e?.message})`);
  }

  const studentPublishedResult = await contentDatabase.getPublishedChapterContent('2026-27', 'ch01');
  assert(
    studentPublishedResult !== null &&
      studentPublishedResult.concepts.length === 1 &&
      studentPublishedResult.concepts[0].verificationStatus === 'published',
    'Test 6.4: Student query receives strictly verified published content'
  );

  // --- Test 7: Student Progress & Wrong Answer Isolation ---
  const studentId = 'cadet_student_001';
  await contentDatabase.updateChapterProgress(studentId, 'ch01', {
    status: 'learning',
    completedMission: 'mission_1_chemical_change',
    xpDelta: 50,
  });

  const progress = await contentDatabase.getStudentProgress(studentId);
  assert(
    progress.chapters['ch01']?.xp === 50 &&
      progress.chapters['ch01']?.missionsCompleted.includes('mission_1_chemical_change'),
    'Test 7.1: Student progress updates and persists isolated state'
  );

  // Record an incorrect attempt
  await contentDatabase.recordQuestionAttempt({
    attemptId: 'att_01',
    studentId,
    questionId: validQuestion.questionId,
    conceptId: validConcept.conceptId,
    userSelected: 'To ensure the temperature remains constant',
    isCorrect: false,
    attemptNumber: 1,
    usedHint: false,
    timestamp: new Date().toISOString(),
  });

  const wrongAnswers = await contentDatabase.getWrongAnswersForStudent(studentId);
  assert(
    wrongAnswers.length === 1 && wrongAnswers[0].questionId === validQuestion.questionId,
    'Test 7.2: Wrong answer automatically queues for revision review without penalization'
  );

  return { passed: allPassed, results };
}
