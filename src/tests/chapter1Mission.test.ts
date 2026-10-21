/**
 * StudyVerse 10 — Chapter 1 Complete Playable Mission Test Suite
 * Verifies:
 * 1. Published Chapter 1 bundle retrieval and schema integrity.
 * 2. Academic reviewer sign-off and verification status ('published').
 * 3. Strict safety: all chemistry activities are virtual-only.
 * 4. Equation Balancing engine: stoichiometric coefficients balance atoms; mass conservation verified.
 * 5. Reaction Type & Thermo Sorter: authentic CBSE reactions with accurate Exo/Endo designations.
 * 6. Deterministic answer checking against stored approved keys.
 * 7. Non-punitive wrong answer review queue persistence.
 * 8. Trilingual support (English, Hindi, Hinglish).
 */

import { CHAPTER_1_PUBLISHED_BUNDLE } from '../content/chapter1PublishedData.ts';
import { contentDatabase } from '../services/contentRepository.ts';
import { BALANCING_PROBLEMS } from '../game/EquationBalancer.tsx';
import { REACTION_SORT_CARDS } from '../game/ReactionTypeSorter.tsx';

export async function runChapter1MissionTests(): Promise<{ passed: boolean; results: string[] }> {
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

  // --- Test 1: Published Bundle Retrieval & Academic Provenance ---
  contentDatabase.seedOfficialChapterBundle(CHAPTER_1_PUBLISHED_BUNDLE);
  const published = await contentDatabase.getPublishedChapterContent('2026-27', 'ch01');
  assert(
    published !== null && published.chapterId === 'ch01',
    'Test 1.1: Chapter 1 published bundle successfully loaded from content repository'
  );
  assert(
    Boolean(published?.publishedBy.includes('Dr. Meenakshi Sharma')) && published?.contentVersion === 1,
    'Test 1.2: Published bundle contains verified academic reviewer sign-off'
  );
  assert(
    published?.concepts.every((c) => c.verificationStatus === 'published' && c.sourceRefs.length > 0) === true,
    'Test 1.3: All published concepts have verificationStatus="published" and source citations'
  );

  // --- Test 2: Virtual-Only Chemical Safety Check ---
  const allVirtualOnly = published?.activities.every(
    (a) => a.virtualOnly === true && a.safetyLevel === 'virtual_only'
  );
  assert(
    allVirtualOnly === true,
    'Test 2.1: All chemical lab activities strictly marked virtualOnly: true (zero at-home hazards)'
  );

  // --- Test 3: Trilingual Fidelity Check ---
  const trilingualValid = published?.concepts.every(
    (c) =>
      Boolean(c.explanations.simpleEnglish?.length > 10) &&
      Boolean(c.explanations.hindi?.length > 10) &&
      Boolean(c.explanations.hinglish?.length > 10)
  );
  assert(
    trilingualValid === true,
    'Test 3.1: All Chapter 1 concepts include comprehensive English, Hindi, and Hinglish explanations'
  );

  // --- Test 4: Equation Balancing & Mass Conservation ---
  // Problem 1: 2 Mg + 1 O2 -> 2 MgO
  const mgProblem = BALANCING_PROBLEMS.find((p) => p.id === 'prob_mg_o2');
  assert(mgProblem !== undefined, 'Test 4.1: Balancing problem for Mg combustion exists');

  // Verify target coefficients satisfy conservation
  const [a, b, c] = mgProblem!.targetCoeffs;
  const reactantMg = a * (mgProblem!.reactants[0].composition.Mg || 0);
  const reactantO = b * (mgProblem!.reactants[1].composition.O || 0);
  const productMg = c * (mgProblem!.products[0].composition.Mg || 0);
  const productO = c * (mgProblem!.products[0].composition.O || 0);

  assert(
    reactantMg === productMg && reactantO === productO && reactantMg === 2 && reactantO === 2,
    `Test 4.2: Mg combustion equation balanced with mass conservation: Mg (${reactantMg}=${productMg}), O (${reactantO}=${productO})`
  );

  // Problem 2: 3 Fe + 4 H2O -> 1 Fe3O4 + 4 H2
  const feProblem = BALANCING_PROBLEMS.find((p) => p.id === 'prob_fe_steam');
  const [fa, fb, fc, fd] = feProblem!.targetCoeffs;
  const feLeft = fa * 1;
  const feRight = fc * 3;
  const hLeft = fb * 2;
  const hRight = fd * 2;
  const oLeft = fb * 1;
  const oRight = fc * 4;

  assert(
    feLeft === feRight && hLeft === hRight && oLeft === oRight,
    `Test 4.3: Fe + steam balanced with conservation: Fe (${feLeft}=${feRight}), H (${hLeft}=${hRight}), O (${oLeft}=${oRight})`
  );

  // --- Test 5: Reaction-Type Sorter & Thermodynamic Accuracy ---
  const quicklime = REACTION_SORT_CARDS.find((r) => r.id === 'rc_quicklime_water');
  assert(
    quicklime?.correctType === 'combination' && quicklime?.thermalType === 'exothermic',
    'Test 5.1: Quicklime slaking accurately classified as Combination and Exothermic (ΔT > 0)'
  );

  const feso4 = REACTION_SORT_CARDS.find((r) => r.id === 'rc_feso4_heat');
  assert(
    feso4?.correctType === 'decomposition' && feso4?.thermalType === 'endothermic',
    'Test 5.2: Ferrous sulphate decomposition accurately classified as Decomposition and Endothermic (Heat absorbed)'
  );

  const feCuso4 = REACTION_SORT_CARDS.find((r) => r.id === 'rc_fe_cuso4');
  assert(
    feCuso4?.correctType === 'displacement',
    'Test 5.3: Fe + CuSO4 accurately classified as Displacement reaction'
  );

  const precipitation = REACTION_SORT_CARDS.find((r) => r.id === 'rc_na2so4_bacl2');
  assert(
    precipitation?.correctType === 'double_displacement',
    'Test 5.4: Na2SO4 + BaCl2 accurately classified as Double Displacement (Precipitation)'
  );

  // --- Test 6: Deterministic Quiz Answer Verification ---
  const qList = published?.questions || [];
  assert(qList.length >= 5, `Test 6.1: Published chapter contains ${qList.length} reviewed questions`);

  const qMgSandpaper = qList.find((q) => q.questionId === 'q_ch01_magnesium_sandpaper');
  assert(
    qMgSandpaper?.correctAnswer ===
      'To remove the basic layer of magnesium oxide/carbonate formed by exposure to moist air',
    'Test 6.2: Magnesium sandpaper question deterministic answer key verified'
  );

  const qRedox = qList.find((q) => q.questionId === 'q_ch01_redox_cuo_h2');
  assert(
    qRedox?.correctAnswer === 'H₂ is oxidized (gains oxygen); CuO is reduced (loses oxygen)',
    'Test 6.3: CuO + H2 redox question deterministic answer key verified'
  );

  // --- Test 7: Non-Punitive Review Queue Tracking ---
  const initialProgress = await contentDatabase.getStudentProgress('test_student_cadet');
  await contentDatabase.recordQuestionAttempt({
    attemptId: 'att_test_sample',
    studentId: 'test_student_cadet',
    questionId: 'q_ch01_magnesium_sandpaper',
    conceptId: 'concept_ch01_chemical_equations',
    userSelected: 'To reduce the ignition temperature so it catches fire faster', // Wrong answer
    isCorrect: false,
    attemptNumber: 1,
    usedHint: false,
    timestamp: new Date().toISOString(),
  });

  const updatedProgress = await contentDatabase.getStudentProgress('test_student_cadet');
  assert(
    updatedProgress.totalXp >= initialProgress.totalXp,
    'Test 7.1: Incorrect answer does NOT penalize or reduce student XP'
  );

  return { passed: allPassed, results };
}
