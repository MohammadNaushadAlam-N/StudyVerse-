import { runFoundationTests } from './src/tests/schemaValidation.test.ts';
import { runPdfPipelineTests } from './src/tests/pdfPipeline.test.ts';
import { runSyllabusMappingTests } from './src/tests/syllabusMapping.test.ts';
import { runDraftTransformationTests } from './src/tests/draftTransformation.test.ts';
import { runReviewAndPublishingTests } from './src/tests/reviewAndPublishing.test.ts';
import { runGameSceneTests } from './src/tests/gameScene.test.ts';
import { runChapter1MissionTests } from './src/tests/chapter1Mission.test.ts';
import { runStudyBuddyTests } from './src/tests/studyBuddy.test.ts';

async function main() {
  console.log('--- Starting StudyVerse 10 Automated Test Suite ---');
  
  console.log('\n[Phase 1: Academic Schemas & Foundation]');
  const phase1 = await runFoundationTests();
  for (const res of phase1.results) {
    console.log(res);
  }

  console.log('\n[Phase 2: PDF Ingestion & Extraction Pipeline]');
  const phase2 = await runPdfPipelineTests();
  for (const res of phase2.results) {
    console.log(res);
  }

  console.log('\n[Phase 3: Official Syllabus Registry & Mapping]');
  const phase3 = await runSyllabusMappingTests();
  for (const res of phase3.results) {
    console.log(res);
  }

  console.log('\n[Phase 4: Schema-Constrained Draft Transformation]');
  const phase4 = await runDraftTransformationTests();
  for (const res of phase4.results) {
    console.log(res);
  }

  console.log('\n[Phase 5: Content Review Queue & Controlled Publishing]');
  const phase5 = await runReviewAndPublishingTests();
  for (const res of phase5.results) {
    console.log(res);
  }

  console.log('\n[Phase 6: 3D Academy Hub & Movement]');
  const phase6 = await runGameSceneTests();
  for (const res of phase6.results) {
    console.log(res);
  }

  console.log('\n[Phase 7: Chapter 1 Complete Playable Mission & Balancing Engine]');
  const phase7 = await runChapter1MissionTests();
  for (const res of phase7.results) {
    console.log(res);
  }

  console.log('\n[Phase 8: Server-Side Gemini Study Buddy & Fixed Teaching Template]');
  const phase8 = await runStudyBuddyTests();
  for (const res of phase8.results) {
    console.log(res);
  }

  const allPassed =
    phase1.passed &&
    phase2.passed &&
    phase3.passed &&
    phase4.passed &&
    phase5.passed &&
    phase6.passed &&
    phase7.passed &&
    phase8.passed;
  console.log(`\nFinal Test Result: ${allPassed ? 'ALL TESTS PASSED' : 'TESTS FAILED'}`);
  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
