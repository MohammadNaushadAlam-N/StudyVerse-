/**
 * StudyVerse 10 — Syllabus Registry & Mapping Test Suite
 * Verifies Phase 3 acceptance criteria:
 * 1. Matched topic (annual_exam_core).
 * 2. Formative-only topic (formative_portfolio).
 * 3. Excluded topic (excluded_from_specified_assessment).
 * 4. Ambiguous topic (needs_curriculum_review with official conflict flag).
 * 5. Unmapped topic (not_mapped, not assumed to be out of syllabus).
 * 6. Never auto-approves: requires human academic review sign-off.
 * 7. Security rejection of client-supplied fake admin approvals.
 */

import { syllabusRegistryService } from '../syllabus/syllabusRegistry.ts';
import { SecurityContext } from '../services/contentRepository.ts';

export async function runSyllabusMappingTests(): Promise<{ passed: boolean; results: string[] }> {
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

  // --- Test 1: Matched Core Annual Exam Topic ---
  const coreResult = syllabusRegistryService.evaluateTopicMapping({
    topicTitle: 'Balanced Chemical Equations and Conservation of Mass',
    chapterId: 'ch01',
    description: 'Implications of a balanced chemical equation and types of reactions',
  });

  assert(
    coreResult.suggestedStatus === 'annual_exam_core' &&
    coreResult.matchedUnitId === 'unit_1_chemical_substances',
    'Test 1.1: Core Chapter 1 topic maps to annual_exam_core in Unit I (25 Marks)'
  );
  assert(
    coreResult.reviewDecision === 'pending_human_review',
    'Test 1.2: AI mapping is never auto-approved; defaults to pending_human_review'
  );

  // --- Test 2: Formative-Only Topic ---
  const formativeResult = syllabusRegistryService.evaluateTopicMapping({
    topicTitle: 'Working Principle of Electric Motor and Generator',
    chapterId: 'ch12',
    description: 'Electromagnetic induction and rotating devices',
  });

  assert(
    formativeResult.suggestedStatus === 'formative_portfolio',
    'Test 2.1: Electric Motor correctly identified as formative_portfolio'
  );
  assert(
    formativeResult.officialWordingExcerpt.includes('formative'),
    'Test 2.2: Formative mapping cites official syllabus wording'
  );

  // --- Test 3: Explicit Exclusion ---
  const excludedResult = syllabusRegistryService.evaluateTopicMapping({
    topicTitle: 'Atmospheric Scattering: Colour of the Sun at Sunrise and Sunset',
    chapterId: 'ch10',
    description: 'Daily life applications of scattering of light',
  });

  assert(
    excludedResult.suggestedStatus === 'excluded_from_specified_assessment',
    'Test 3.1: Sunrise/Sunset scattering example correctly tagged excluded_from_specified_assessment'
  );

  // --- Test 4: Ambiguous Topic Flagging ---
  const ambiguousResult = syllabusRegistryService.evaluateTopicMapping({
    topicTitle: 'Electric Effects of Electric Current',
    chapterId: 'ch11',
    description: 'Non-year-end clause interpretation',
  });

  assert(
    ambiguousResult.suggestedStatus === 'needs_curriculum_review' &&
    ambiguousResult.isAmbiguous === true,
    'Test 4.1: Ambiguous clause flagged as needs_curriculum_review'
  );
  assert(
    Boolean(ambiguousResult.ambiguityReason?.includes('Held from Board Exam Mode')),
    'Test 4.2: Ambiguous item held from Board Exam Mode pending human review'
  );

  // --- Test 5: Unmapped Topic (Never assumed out of syllabus) ---
  const unmappedResult = syllabusRegistryService.evaluateTopicMapping({
    topicTitle: 'Quantum Superconductivity and Cryogenic Levitations',
    chapterId: 'ch11',
    description: 'Advanced modern physics concept',
  });

  assert(
    unmappedResult.suggestedStatus === 'not_mapped',
    'Test 5.1: Missing match tagged not_mapped, avoiding false out-of-syllabus assumption'
  );

  // --- Test 6: Human Review Sign-Off & Role Check ---
  const mappingId = 'map_ch01_test';
  syllabusRegistryService.registerDraftMapping(mappingId, coreResult);

  const fakeContext: SecurityContext = {
    userId: 'student_attacker',
    isStudent: true,
    isAdmin: false,
  };

  try {
    syllabusRegistryService.approveMapping(
      fakeContext,
      mappingId,
      'approved_by_reviewer',
      'annual_exam_core',
      'Unauthorized sign-off attempt'
    );
    assert(false, 'Test 6.1: Non-admin sign-off rejected');
  } catch {
    assert(true, 'Test 6.1: Non-admin sign-off rejected');
  }

  const validAdminContext: SecurityContext = {
    userId: 'dr_kapoor_cbse_curriculum_reviewer',
    isStudent: false,
    isAdmin: true,
    adminVerificationToken: 'studyverse_admin_secure_key_2026',
  };

  try {
    const approved = syllabusRegistryService.approveMapping(
      validAdminContext,
      mappingId,
      'approved_by_reviewer',
      'annual_exam_core',
      'Verified against official CBSE 2026-27 Unit 1 syllabus specifications.'
    );
    assert(
      approved.reviewDecision === 'approved_by_reviewer' &&
      approved.reviewedBy === 'dr_kapoor_cbse_curriculum_reviewer',
      'Test 6.2: Verified human academic sign-off recorded with reviewer audit log'
    );
  } catch (err: any) {
    assert(false, 'Test 6.2: Human academic sign-off failed', err?.message);
  }

  // --- Test 7: Official Weightings Consistency ---
  const official = syllabusRegistryService.getOfficialSyllabus();
  const totalUnitMarks = official.units.reduce((acc, u) => acc + u.theoryMarksWeight, 0);
  assert(
    totalUnitMarks === 80,
    `Test 7.1: Total theory marks across all 5 units equals 80 (Actual: ${totalUnitMarks})`
  );

  return { passed: allPassed, results };
}
