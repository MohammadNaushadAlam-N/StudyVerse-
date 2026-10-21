/**
 * StudyVerse 10 — Academic Content & Student Progress Schemas
 * Source of Truth: StudyVerse 10 Science Blueprint v1.0
 * 
 * Strict runtime validation with Zod.
 * Enforces separation between student progress and versioned academic content.
 */

import { z } from 'zod';

// ============================================================================
// 1. Core Enumerations
// ============================================================================

/**
 * Target academic session supported by current syllabus mapping
 */
export const AcademicSessionSchema = z.string().default('2026-27');

/**
 * Required assessment tags per Blueprint Section 4:
 * Distinguishes year-end board exam content from formative/enrichment topics.
 */
export const AssessmentStatusSchema = z.enum([
  'annual_exam_core',                    // Mapped to current official annual-exam content and verified
  'formative_portfolio',                 // Explicitly marked as formative/portfolio-only in official syllabus
  'enrichment_box',                      // Optional info from NCERT boxes noted as not assessed in year-end exam
  'excluded_from_specified_assessment',  // Explicitly excluded from annual assessment scope with source evidence
  'needs_curriculum_review',             // Ambiguous wording, conflict, or unreviewed mapping (held from Board Exam Mode)
  'not_mapped',                          // No official mapping yet (never assume out-of-syllabus without review)
]);
export type AssessmentStatus = z.infer<typeof AssessmentStatusSchema>;

/**
 * Ingestion and verification pipeline status states per Blueprint Section 10:
 * uploaded -> file_validated -> text_extracted -> page_review_needed -> syllabus_mapped -> content_drafted -> academic_review -> approved -> published
 */
export const VerificationStatusSchema = z.enum([
  'draft',                // Initial draft created from ingestion/AI extraction
  'page_review_needed',   // Flagged due to poor scan, OCR required, or table/formula ambiguity
  'syllabus_mapped',      // Mapped to official syllabus unit, awaiting human review
  'academic_review',      // Under active review by human curriculum engineer
  'approved',             // Passed review with verified answer keys, ready for publication
  'rejected',             // Rejected with audit reason
  'published',            // Officially published in student bundle for the session
]);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

/**
 * Supported UI and explanation languages
 */
export const SupportedLanguageSchema = z.enum(['english', 'hindi', 'hinglish']);
export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

// ============================================================================
// 2. Source Documents & Provenance
// ============================================================================

/**
 * Citation reference linking content directly to the source NCERT page/section.
 */
export const SourceRefSchema = z.object({
  sourceDocumentId: z.string().min(1, 'sourceDocumentId is required'),
  chapterIdentifier: z.string().min(1, 'chapterIdentifier is required (e.g., ch01)'),
  pdfPageIndex: z.number().int().nonnegative('pdfPageIndex must be >= 0'),
  printedPageNumber: z.number().int().positive('printedPageNumber must be > 0').optional(),
  sectionHeading: z.string().min(1, 'sectionHeading is required'),
  quotedFragment: z.string().max(300, 'Keep quoted fragment brief to respect IP').optional(),
});
export type SourceRef = z.infer<typeof SourceRefSchema>;

/**
 * Registered textbook or official syllabus source PDF.
 */
export const SourceDocumentSchema = z.object({
  sourceDocumentId: z.string().min(1),
  title: z.string().min(1),
  publisher: z.string().default('NCERT'),
  editionLabel: z.string().default('Reprint 2026–27'),
  academicSession: z.string().default('2026-27'),
  originUrl: z.string().url().optional(),
  storagePath: z.string().min(1),
  sha256: z.string().length(64, 'SHA-256 must be exactly 64 hexadecimal characters'),
  pageCount: z.number().int().positive(),
  extractionStatus: z.enum(['pending', 'extracting', 'completed', 'failed', 'page_review_needed']),
  uploadedBy: z.string().min(1),
  uploadedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type SourceDocument = z.infer<typeof SourceDocumentSchema>;

/**
 * Individual extracted page record with OCR/quality flags.
 */
export const SourcePageSchema = z.object({
  pageId: z.string().min(1),
  sourceDocumentId: z.string().min(1),
  pdfPageIndex: z.number().int().nonnegative(),
  printedPageNumber: z.number().int().positive().optional(),
  rawText: z.string(),
  hasImages: z.boolean().default(false),
  hasTables: z.boolean().default(false),
  hasFormulas: z.boolean().default(false),
  isScannedOrDegraded: z.boolean().default(false),
  ocrRequired: z.boolean().default(false),
  reviewFlag: z.boolean().default(false),
  reviewNotes: z.string().optional(),
});
export type SourcePage = z.infer<typeof SourcePageSchema>;

/**
 * Extracted logical section (headings, blue activity boxes, recaps).
 */
export const ExtractedSectionSchema = z.object({
  sectionId: z.string().min(1),
  sourceDocumentId: z.string().min(1),
  chapterIdentifier: z.string().min(1),
  heading: z.string().min(1),
  pageRange: z.object({
    startPdfPage: z.number().int().nonnegative(),
    endPdfPage: z.number().int().nonnegative(),
  }),
  content: z.string(),
  sectionType: z.enum([
    'hook',
    'theory',
    'activity_box',
    'model_diagram',
    'in_text_question',
    'chapter_end_exercise',
    'summary',
    'enrichment_box',
  ]),
});
export type ExtractedSection = z.infer<typeof ExtractedSectionSchema>;

// ============================================================================
// 3. Official CBSE Syllabus Registry
// ============================================================================

export const SyllabusUnitSchema = z.object({
  unitId: z.string().min(1),
  unitNumber: z.number().int().positive(),
  title: z.string().min(1),
  theoryMarksWeight: z.number().nonnegative(),
  includedChapterIds: z.array(z.string()),
  coreTopics: z.array(z.string()),
  formativeTopics: z.array(z.string()).default([]),
  explicitExclusions: z.array(z.string()).default([]),
  ambiguousClauses: z.array(
    z.object({
      clauseText: z.string(),
      flagReason: z.string(),
      resolutionStatus: z.enum(['pending_human_review', 'resolved_core', 'resolved_formative']),
      reviewedBy: z.string().optional(),
      reviewedAt: z.string().datetime().optional(),
    })
  ).default([]),
});
export type SyllabusUnit = z.infer<typeof SyllabusUnitSchema>;

export const SyllabusSourceSchema = z.object({
  syllabusSourceId: z.string().min(1),
  title: z.string().default('CBSE Class X Science Curriculum 2026-27'),
  academicSession: z.string().default('2026-27'),
  officialDocumentUrl: z.string().url(),
  readingMaterialUrl: z.string().url().optional(),
  totalTheoryMarks: z.number().int().default(80),
  internalAssessmentMarks: z.number().int().default(20),
  units: z.array(SyllabusUnitSchema),
  verifiedAt: z.string().datetime(),
  verifiedBy: z.string().min(1),
});
export type SyllabusSource = z.infer<typeof SyllabusSourceSchema>;

// ============================================================================
// 4. Academic Learning Entities (Concepts, Activities, Simulations, Questions)
// ============================================================================

/**
 * Trilingual explanation bundle (direct, relatable, scientifically sound).
 */
export const TrilingualContentSchema = z.object({
  simpleEnglish: z.string().min(1, 'English explanation is required'),
  hindi: z.string().min(1, 'Hindi explanation is required'),
  hinglish: z.string().min(1, 'Hinglish explanation is required'),
});
export type TrilingualContent = z.infer<typeof TrilingualContentSchema>;

/**
 * Pedagogical Concept Entity
 */
export const ConceptSchema = z.object({
  conceptId: z.string().min(1),
  subjectId: z.literal('science_10').default('science_10'),
  chapterId: z.string().min(1),
  title: z.string().min(1),
  learningObjectives: z.array(z.string()).min(1),
  explanations: TrilingualContentSchema,
  prerequisiteIds: z.array(z.string()).default([]),
  commonMisconceptions: z.array(z.string()).default([]),
  sourceRefs: z.array(SourceRefSchema).min(1, 'At least one source citation is required'),
  assessmentStatus: AssessmentStatusSchema,
  syllabusMappingStatus: z.enum(['mapped', 'unmapped', 'conflict_flagged']),
  verificationStatus: VerificationStatusSchema,
  contentVersion: z.number().int().positive().default(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Concept = z.infer<typeof ConceptSchema>;

/**
 * Virtual Lab Activity Entity (follows Predict -> Explore -> Observe -> Explain loop)
 */
export const ActivitySchema = z.object({
  activityId: z.string().min(1),
  conceptId: z.string().min(1),
  chapterId: z.string().min(1),
  title: z.string().min(1),
  goal: z.string().min(1),
  everydayHook: z.string().min(1),
  predictionPrompt: z.object({
    question: z.string().min(1),
    options: z.array(z.string()).min(2),
    scientificReasoningHint: z.string(),
  }),
  steps: z.array(z.string()).min(1),
  variables: z.array(
    z.object({
      name: z.string(),
      label: z.string(),
      type: z.enum(['slider', 'select', 'toggle', 'reagent_drop']),
      allowedValues: z.array(z.union([z.string(), z.number()])),
      defaultValue: z.union([z.string(), z.number()]),
      unit: z.string().optional(),
    })
  ),
  expectedObservations: z.array(z.string()).min(1),
  conclusion: z.string().min(1),
  safetyLevel: z.enum(['virtual_only', 'low_hazard_school_lab', 'classroom_demonstration']),
  virtualOnly: z.literal(true).default(true), // Strictly virtual-only for safety
  sourceRefs: z.array(SourceRefSchema).min(1),
  verificationStatus: VerificationStatusSchema,
  contentVersion: z.number().int().positive().default(1),
});
export type Activity = z.infer<typeof ActivitySchema>;

/**
 * Simulation Specification Entity
 */
export const SimulationSchema = z.object({
  simulationId: z.string().min(1),
  conceptId: z.string().min(1),
  chapterId: z.string().min(1),
  sceneComponent: z.string().min(1),
  initialState: z.record(z.string(), z.any()),
  controllableVariables: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      min: z.number().optional(),
      max: z.number().optional(),
      step: z.number().optional(),
      options: z.array(z.string()).optional(),
    })
  ),
  allowedRanges: z.record(z.string(), z.object({ min: z.number(), max: z.number() })).default({}),
  stateTransitions: z.array(
    z.object({
      trigger: z.string(),
      from: z.string(),
      to: z.string(),
      resultSummary: z.string(),
    })
  ),
  equationsOrRules: z.array(z.string()),
  visualLabels: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      positionHint: z.string().optional(),
    })
  ),
  knownSimplifications: z.array(z.string()), // Honest scientific disclaimers
  resetBehaviour: z.string().default('restore_initial_state'),
  sourceRefs: z.array(SourceRefSchema).min(1),
  testStatus: z.enum(['untested', 'automated_pass', 'manual_verified', 'failed']).default('untested'),
  verificationStatus: VerificationStatusSchema,
  contentVersion: z.number().int().positive().default(1),
});
export type Simulation = z.infer<typeof SimulationSchema>;

/**
 * Formative & Summative Question Entity
 */
export const QuestionSchema = z.object({
  questionId: z.string().min(1),
  conceptIds: z.array(z.string()).min(1),
  chapterId: z.string().min(1),
  questionType: z.enum([
    'mcq',
    'assertion_reason',
    'equation_balancing',
    'classification',
    'numerical',
    'short_reasoning',
  ]),
  stem: z.string().min(1),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.number(), z.array(z.string()), z.record(z.string(), z.any())]),
  workedExplanation: z.object({
    english: z.string().min(1),
    hindi: z.string().optional(),
    hinglish: z.string().optional(),
  }),
  hint: z.string().min(1),
  marks: z.number().int().positive().default(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  assessmentStatus: AssessmentStatusSchema,
  sourceRefs: z.array(SourceRefSchema).min(1),
  answerVerifiedBy: z.string().min(1, 'Questions must be verified by a reviewer before publication'),
  verificationStatus: VerificationStatusSchema,
  isAiGenerated: z.boolean().default(false),
  version: z.number().int().positive().default(1),
});
export type Question = z.infer<typeof QuestionSchema>;

// ============================================================================
// 5. Review Workflow & Auditing
// ============================================================================

export const ReviewTaskSchema = z.object({
  taskId: z.string().min(1),
  entityType: z.enum(['concept', 'activity', 'simulation', 'question', 'page']),
  entityId: z.string().min(1),
  sourceDocumentId: z.string().min(1),
  assignedTo: z.string().optional(),
  status: z.enum(['pending', 'in_review', 'approved', 'rejected']),
  reviewerNotes: z.string().optional(),
  createdTimestamp: z.string().datetime(),
  reviewedTimestamp: z.string().datetime().optional(),
  reviewedBy: z.string().optional(),
});
export type ReviewTask = z.infer<typeof ReviewTaskSchema>;

export const ContentAuditLogSchema = z.object({
  logId: z.string().min(1),
  action: z.enum(['create', 'update', 'review', 'approve', 'reject', 'publish', 'rollback']),
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  performedBy: z.string().min(1),
  previousState: z.record(z.string(), z.any()).optional(),
  newState: z.record(z.string(), z.any()),
  timestamp: z.string().datetime(),
  reason: z.string().min(1),
});
export type ContentAuditLog = z.infer<typeof ContentAuditLogSchema>;

// ============================================================================
// 6. Published Content Bundle (Student-Facing Only)
// ============================================================================

/**
 * Immutable published bundle served to students.
 * Student queries ONLY read published records for their selected session and chapter.
 */
export const PublishedContentSchema = z.object({
  publishedId: z.string().min(1),
  academicSession: z.string().default('2026-27'),
  chapterId: z.string().min(1),
  contentVersion: z.number().int().positive(),
  publishedAt: z.string().datetime(),
  publishedBy: z.string().min(1),
  concepts: z.array(ConceptSchema),
  activities: z.array(ActivitySchema),
  simulations: z.array(SimulationSchema),
  questions: z.array(QuestionSchema),
});
export type PublishedContent = z.infer<typeof PublishedContentSchema>;

// ============================================================================
// 7. Student Progress & Learning Analytics (Strictly Separated)
// ============================================================================

export const StudentProfileSchema = z.object({
  studentId: z.string().min(1),
  isGuest: z.boolean().default(true),
  displayName: z.string().default('Cadet Scientist'),
  preferredLanguage: SupportedLanguageSchema.default('english'),
  graphicsQuality: z.enum(['low', 'balanced']).default('balanced'),
  soundEnabled: z.boolean().default(true),
  reducedMotion: z.boolean().default(false),
  createdAt: z.string().datetime(),
  lastActiveAt: z.string().datetime(),
});
export type StudentProfile = z.infer<typeof StudentProfileSchema>;

export const ChapterProgressItemSchema = z.object({
  chapterId: z.string().min(1),
  status: z.enum(['not_started', 'learning', 'review', 'mastered']).default('not_started'),
  missionsCompleted: z.array(z.string()).default([]),
  xp: z.number().int().nonnegative().default(0),
  timeSpentSeconds: z.number().int().nonnegative().default(0),
  lastAccessedAt: z.string().datetime(),
  verifiedExitCheckScore: z.number().optional(),
});
export type ChapterProgressItem = z.infer<typeof ChapterProgressItemSchema>;

export const StudyProgressSchema = z.object({
  studentId: z.string().min(1),
  academicSession: z.string().default('2026-27'),
  chapters: z.record(z.string(), ChapterProgressItemSchema).default({}),
  totalXp: z.number().int().nonnegative().default(0),
  updatedAt: z.string().datetime(),
});
export type StudyProgress = z.infer<typeof StudyProgressSchema>;

export const QuestionAttemptSchema = z.object({
  attemptId: z.string().min(1),
  studentId: z.string().min(1),
  questionId: z.string().min(1),
  conceptId: z.string().min(1),
  userSelected: z.any(),
  isCorrect: z.boolean(),
  attemptNumber: z.number().int().positive(),
  usedHint: z.boolean().default(false),
  timestamp: z.string().datetime(),
});
export type QuestionAttempt = z.infer<typeof QuestionAttemptSchema>;

export const WrongAnswerReviewSchema = z.object({
  reviewId: z.string().min(1),
  studentId: z.string().min(1),
  questionId: z.string().min(1),
  conceptId: z.string().min(1),
  chapterId: z.string().min(1),
  missedCount: z.number().int().positive(),
  lastMistakeTimestamp: z.string().datetime(),
  mastered: z.boolean().default(false),
  reviewScheduledAt: z.string().datetime(),
});
export type WrongAnswerReview = z.infer<typeof WrongAnswerReviewSchema>;
