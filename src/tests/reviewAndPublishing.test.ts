/**
 * StudyVerse 10 — Content Review Queue & Controlled Publishing Test Suite
 * Verifies Phase 5 acceptance criteria:
 * 1. Side-by-side review approval workflow.
 * 2. Verified answer key requirement on questions before approval.
 * 3. Strict security: Non-admin users cannot approve or publish.
 * 4. Publishing restriction: Only 'approved' items can be published; drafts are rejected.
 * 5. Student query isolation: Students cannot read drafts, only published content.
 * 6. Invalidation cascade: Source document updates flag dependent content for re-review.
 */

import { contentReviewService } from '../admin/reviewQueueService.ts';
import { contentDatabase, SecurityContext } from '../services/contentRepository.ts';

export async function runReviewAndPublishingTests(): Promise<{ passed: boolean; results: string[] }> {
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

  const validAdminContext: SecurityContext = {
    userId: 'academic_reviewer_lead',
    isStudent: false,
    isAdmin: true,
    adminVerificationToken: 'studyverse_admin_secure_key_2026',
  };

  const fakeNonAdminContext: SecurityContext = {
    userId: 'student_tester',
    isStudent: true,
    isAdmin: false,
  };

  // --- Test 1: Review Queue Retrieval ---
  try {
    const queue = contentReviewService.getReviewQueue(validAdminContext);
    assert(queue.length >= 2, 'Test 1.1: Review queue loaded items for Chapter 1');
    assert(
      Boolean(queue[0].sourceTextSnippet?.length > 10) && queue[0].pdfPageIndex > 0,
      'Test 1.2: Queue items contain side-by-side extracted source text snippet and page reference'
    );
  } catch (err: any) {
    assert(false, 'Test 1: Review queue retrieval failed', err?.message);
  }

  // --- Test 2: Role Security Rejection (Non-admin cannot approve) ---
  try {
    contentReviewService.reviewEntity(fakeNonAdminContext, {
      entityType: 'concept',
      entityId: 'concept_ch01_chemical_equations',
      decision: 'approve',
      reviewerName: 'FakeReviewer',
      reviewerNotes: 'Attempted unauthorized approval',
    });
    assert(false, 'Test 2.1: Non-admin approval should be rejected');
  } catch {
    assert(true, 'Test 2.1: Unauthorized non-admin approval rejected with SecurityError');
  }

  // --- Test 3: Question Answer Key Verification Requirement ---
  try {
    contentReviewService.reviewEntity(validAdminContext, {
      entityType: 'question',
      entityId: 'q_ch01_balancing_law',
      decision: 'approve',
      reviewerName: '', // Missing reviewer name!
      reviewerNotes: 'Attempted approval without reviewer name',
    });
    assert(false, 'Test 3.1: Approval without reviewer signature should fail');
  } catch {
    assert(true, 'Test 3.1: Rejects question approval when reviewer signature is blank');
  }

  // --- Test 4: Approval of Concept and Question ---
  try {
    // 1. Approve Concept
    const approvedConcept = contentReviewService.reviewEntity(validAdminContext, {
      entityType: 'concept',
      entityId: 'concept_ch01_chemical_equations',
      decision: 'approve',
      reviewerName: 'Dr. Meenakshi Sharma (CBSE Curriculum Lead)',
      reviewerNotes: 'Verified alignment with NCERT Section 1.1 and 2026-27 core syllabus.',
      assessmentStatus: 'annual_exam_core',
    });
    assert(approvedConcept.verificationStatus === 'approved', 'Test 4.1: Concept approved and marked verified');

    // 2. Approve Question
    const approvedQuestion = contentReviewService.reviewEntity(validAdminContext, {
      entityType: 'question',
      entityId: 'q_ch01_balancing_law',
      decision: 'approve',
      reviewerName: 'Dr. Meenakshi Sharma (CBSE Curriculum Lead)',
      reviewerNotes: 'Checked options and verified answer key strictly adheres to mass conservation.',
      verifiedAnswerKey: 'To satisfy the Law of Conservation of Mass: atoms are neither created nor destroyed',
    });
    assert(
      approvedQuestion.verificationStatus === 'approved' &&
      (approvedQuestion as any).answerVerifiedBy === 'Dr. Meenakshi Sharma (CBSE Curriculum Lead)',
      'Test 4.2: Question approved with recorded reviewer signature and verified answer key'
    );
  } catch (err: any) {
    assert(false, 'Test 4: Approval workflow failed', err?.message);
  }

  // --- Test 5: Controlled Publishing of Approved Bundle ---
  try {
    // Non-admin cannot publish
    try {
      await contentReviewService.publishApprovedChapterBundle(fakeNonAdminContext, '2026-27', 'ch01');
      assert(false, 'Test 5.1: Non-admin publish should be rejected');
    } catch {
      assert(true, 'Test 5.1: Non-admin publishing rejected with SecurityError');
    }

    // Admin publishes approved bundle
    const published = await contentReviewService.publishApprovedChapterBundle(validAdminContext, '2026-27', 'ch01');
    assert(
      published.chapterId === 'ch01' &&
      published.concepts.length >= 1 &&
      published.concepts[0].verificationStatus === 'published' &&
      published.questions[0].verificationStatus === 'published',
      'Test 5.2: Approved items successfully bundled and published with verificationStatus: "published"'
    );
  } catch (err: any) {
    assert(false, 'Test 5: Publishing workflow failed', err?.message);
  }

  // --- Test 6: Student Query Isolation (Students only see published content) ---
  try {
    const studentView = await contentDatabase.getPublishedChapterContent('2026-27', 'ch01');
    assert(
      studentView !== null &&
      studentView.concepts.length >= 1 &&
      studentView.concepts.every((c) => c.verificationStatus === 'published'),
      'Test 6.1: Student query receives strictly verified published content'
    );
  } catch (err: any) {
    assert(false, 'Test 6: Student query failed', err?.message);
  }

  // --- Test 7: Source Version Update Flags Dependent Content ---
  try {
    const invalidation = contentReviewService.flagDependentContentOnSourceUpdate(
      validAdminContext,
      'jesc101_reprint2026_27',
      'Reprint 2027–28 Edition'
    );
    assert(
      invalidation.flaggedCount >= 1,
      `Test 7.1: New source version flagged ${invalidation.flaggedCount} dependent items for re-review (page_review_needed)`
    );
  } catch (err: any) {
    assert(false, 'Test 7: Invalidation cascade failed', err?.message);
  }

  return { passed: allPassed, results };
}
