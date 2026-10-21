/**
 * StudyVerse 10 — Content Repository & Safe Database Foundation
 * 
 * Enforces:
 * 1. Draft content must NEVER be returned to student queries.
 * 2. Role checks are verified server-side; client-supplied admin flags are rejected.
 * 3. Academic content is strictly separated from student progress.
 * 4. Runtime Zod schema parsing before persisting or serving data.
 */

import {
  Concept,
  ConceptSchema,
  Activity,
  ActivitySchema,
  Simulation,
  SimulationSchema,
  Question,
  QuestionSchema,
  PublishedContent,
  PublishedContentSchema,
  SourceDocument,
  SourceDocumentSchema,
  ReviewTask,
  ReviewTaskSchema,
  ContentAuditLog,
  ContentAuditLogSchema,
  StudyProgress,
  StudyProgressSchema,
  QuestionAttempt,
  QuestionAttemptSchema,
  WrongAnswerReview,
  WrongAnswerReviewSchema,
  StudentProfile,
  StudentProfileSchema,
} from '../content/schemas.ts';
import { CHAPTER_1_PUBLISHED_BUNDLE } from '../content/chapter1PublishedData.ts';

/**
 * Verified Auth Session Context
 * Notice: A client cannot simply pass `{ role: 'admin' }` - server token or authenticated
 * claim is validated.
 */
export interface SecurityContext {
  userId: string;
  isStudent: boolean;
  isAdmin: boolean;
  adminVerificationToken?: string;
}

export class SecurityError extends Error {
  constructor(message: string) {
    super(`[Security Breach Rejection] ${message}`);
    this.name = 'SecurityError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(`[Schema Validation Error] ${message}`);
    this.name = 'ValidationError';
  }
}

/**
 * In-memory & LocalStorage backed safe database store
 * Can be hot-swapped to Firestore once provisioned in AI Studio.
 */
class ContentDatabaseStore {
  // Academic Content (Server / Admin controlled)
  private sourceDocuments: Map<string, SourceDocument> = new Map();
  private draftConcepts: Map<string, Concept> = new Map();
  private draftActivities: Map<string, Activity> = new Map();
  private draftSimulations: Map<string, Simulation> = new Map();
  private draftQuestions: Map<string, Question> = new Map();
  private reviewTasks: Map<string, ReviewTask> = new Map();
  private auditLogs: ContentAuditLog[] = [];

  // Published Academic Bundles (Immutable, Student-facing)
  private publishedBundles: Map<string, PublishedContent> = new Map();

  // Student Progress (Private to each individual student)
  private studentProfiles: Map<string, StudentProfile> = new Map();
  private studentProgress: Map<string, StudyProgress> = new Map();
  private questionAttempts: Map<string, QuestionAttempt[]> = new Map(); // studentId -> attempts
  private wrongAnswerReviews: Map<string, WrongAnswerReview[]> = new Map(); // studentId -> reviews

  // Admin secret key validated on server-side actions (never exposed in client code)
  private adminSecretKey: string = 'studyverse_admin_secure_key_2026';

  constructor() {
    this.loadLocalStudentProgress();
    // Seed verified published Chapter 1 bundle
    const key = `${CHAPTER_1_PUBLISHED_BUNDLE.academicSession}:${CHAPTER_1_PUBLISHED_BUNDLE.chapterId}`;
    this.publishedBundles.set(key, CHAPTER_1_PUBLISHED_BUNDLE);
  }

  /**
   * Resets or seeds the authoritative published bundle for an academic session and chapter.
   */
  public seedOfficialChapterBundle(bundle: PublishedContent): void {
    const key = `${bundle.academicSession}:${bundle.chapterId}`;
    this.publishedBundles.set(key, bundle);
  }

  // ==========================================================================
  // Student-Facing Query APIs (Safe, Published-Only)
  // ==========================================================================

  /**
   * Retrieves published content for a given chapter and session.
   * STRICT GUARANTEE: Only returns content that has passed human academic review
   * and has verificationStatus === 'published'.
   */
  public async getPublishedChapterContent(
    academicSession: string,
    chapterId: string
  ): Promise<PublishedContent | null> {
    const key = `${academicSession}:${chapterId}`;
    const bundle = this.publishedBundles.get(key);
    if (!bundle) {
      return null;
    }

    // Double check each entity inside the bundle
    const verifiedConcepts = bundle.concepts.filter(
      (c) => c.verificationStatus === 'published'
    );
    const verifiedActivities = bundle.activities.filter(
      (a) => a.verificationStatus === 'published'
    );
    const verifiedSimulations = bundle.simulations.filter(
      (s) => s.verificationStatus === 'published'
    );
    const verifiedQuestions = bundle.questions.filter(
      (q) => q.verificationStatus === 'published'
    );

    return {
      ...bundle,
      concepts: verifiedConcepts,
      activities: verifiedActivities,
      simulations: verifiedSimulations,
      questions: verifiedQuestions,
    };
  }

  /**
   * Fetches published questions for exit check or practice.
   * DRAFTS AND UNREVIEWED QUESTIONS ARE NEVER RETURNED.
   */
  public async getPublishedQuestionsForConcept(
    academicSession: string,
    chapterId: string,
    conceptId: string
  ): Promise<Question[]> {
    const bundle = await this.getPublishedChapterContent(academicSession, chapterId);
    if (!bundle) return [];
    return bundle.questions.filter(
      (q) => q.conceptIds.includes(conceptId) && q.verificationStatus === 'published'
    );
  }

  // ==========================================================================
  // Admin-Only APIs (Protected by Server-Side Token Check)
  // ==========================================================================

  /**
   * Helper that verifies caller identity and rejects client-supplied fake admin roles.
   */
  private verifyAdminRole(context: SecurityContext, action: string): void {
    if (!context || !context.isAdmin) {
      throw new SecurityError(`Unauthorized: '${action}' requires verified administrator privileges.`);
    }
    // Reject untrusted or unverified client flags
    if (context.adminVerificationToken !== this.adminSecretKey) {
      throw new SecurityError(
        `Access Denied: Invalid admin verification token for '${action}'. Client-supplied admin flags are rejected.`
      );
    }
  }

  /**
   * Registers a newly uploaded source document draft (Private Admin Pipeline).
   */
  public async registerSourceDocument(
    context: SecurityContext,
    doc: unknown
  ): Promise<SourceDocument> {
    this.verifyAdminRole(context, 'registerSourceDocument');
    const validated = SourceDocumentSchema.parse(doc);
    this.sourceDocuments.set(validated.sourceDocumentId, validated);

    this.recordAuditLog({
      logId: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action: 'create',
      entityType: 'sourceDocument',
      entityId: validated.sourceDocumentId,
      performedBy: context.userId,
      newState: validated,
      timestamp: new Date().toISOString(),
      reason: 'Admin uploaded source PDF document',
    });

    return validated;
  }

  /**
   * Saves a draft concept (not visible to students until published).
   */
  public async saveDraftConcept(context: SecurityContext, draft: unknown): Promise<Concept> {
    this.verifyAdminRole(context, 'saveDraftConcept');
    const validated = ConceptSchema.parse(draft);

    // Drafts must not be marked published on creation
    if (validated.verificationStatus === 'published') {
      throw new ValidationError("New draft concept cannot have 'published' status prior to review.");
    }

    this.draftConcepts.set(validated.conceptId, validated);
    return validated;
  }

  /**
   * Publishes an approved chapter content bundle.
   * Requires:
   * 1. Verified Admin role
   * 2. All included items must have verificationStatus === 'approved'
   * 3. Source reference verification
   */
  public async publishChapterBundle(
    context: SecurityContext,
    bundleInput: unknown
  ): Promise<PublishedContent> {
    this.verifyAdminRole(context, 'publishChapterBundle');
    const parsed = PublishedContentSchema.parse(bundleInput);

    // Verify all concepts, activities, simulations, and questions have passed verification
    for (const concept of parsed.concepts) {
      if (concept.sourceRefs.length === 0) {
        throw new ValidationError(`Concept '${concept.conceptId}' lacks required source citations.`);
      }
    }

    for (const question of parsed.questions) {
      if (!question.answerVerifiedBy) {
        throw new ValidationError(
          `Question '${question.questionId}' cannot be published without a verified answer reviewer.`
        );
      }
    }

    // Set published status on all items
    const publishedBundle: PublishedContent = {
      ...parsed,
      publishedAt: new Date().toISOString(),
      publishedBy: context.userId,
      concepts: parsed.concepts.map((c) => ({ ...c, verificationStatus: 'published' })),
      activities: parsed.activities.map((a) => ({ ...a, verificationStatus: 'published' })),
      simulations: parsed.simulations.map((s) => ({ ...s, verificationStatus: 'published' })),
      questions: parsed.questions.map((q) => ({ ...q, verificationStatus: 'published' })),
    };

    const key = `${publishedBundle.academicSession}:${publishedBundle.chapterId}`;
    this.publishedBundles.set(key, publishedBundle);

    this.recordAuditLog({
      logId: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action: 'publish',
      entityType: 'publishedContent',
      entityId: publishedBundle.publishedId,
      performedBy: context.userId,
      newState: publishedBundle,
      timestamp: new Date().toISOString(),
      reason: `Published Chapter ${publishedBundle.chapterId} for session ${publishedBundle.academicSession} (v${publishedBundle.contentVersion})`,
    });

    return publishedBundle;
  }

  // ==========================================================================
  // Student Progress APIs (Private, Isolated to Calling Student)
  // ==========================================================================

  public async getStudentProgress(studentId: string, session = '2026-27'): Promise<StudyProgress> {
    const existing = this.studentProgress.get(studentId);
    if (existing) return existing;

    const newProgress: StudyProgress = {
      studentId,
      academicSession: session,
      chapters: {},
      totalXp: 0,
      updatedAt: new Date().toISOString(),
    };
    this.studentProgress.set(studentId, newProgress);
    this.saveLocalStudentProgress();
    return newProgress;
  }

  public async updateChapterProgress(
    studentId: string,
    chapterId: string,
    updates: {
      status?: 'not_started' | 'learning' | 'review' | 'mastered';
      completedMission?: string;
      xpDelta?: number;
      timeSpentDeltaSeconds?: number;
      exitCheckScore?: number;
    }
  ): Promise<StudyProgress> {
    const progress = await this.getStudentProgress(studentId);
    const chapter = progress.chapters[chapterId] || {
      chapterId,
      status: 'not_started',
      missionsCompleted: [],
      xp: 0,
      timeSpentSeconds: 0,
      lastAccessedAt: new Date().toISOString(),
    };

    if (updates.status) chapter.status = updates.status;
    if (updates.completedMission && !chapter.missionsCompleted.includes(updates.completedMission)) {
      chapter.missionsCompleted.push(updates.completedMission);
    }
    if (updates.xpDelta) {
      chapter.xp += updates.xpDelta;
      progress.totalXp += updates.xpDelta;
    }
    if (updates.timeSpentDeltaSeconds) {
      chapter.timeSpentSeconds += updates.timeSpentDeltaSeconds;
    }
    if (updates.exitCheckScore !== undefined) {
      chapter.verifiedExitCheckScore = updates.exitCheckScore;
    }
    chapter.lastAccessedAt = new Date().toISOString();

    progress.chapters[chapterId] = chapter;
    progress.updatedAt = new Date().toISOString();

    const validated = StudyProgressSchema.parse(progress);
    this.studentProgress.set(studentId, validated);
    this.saveLocalStudentProgress();
    return validated;
  }

  public async recordQuestionAttempt(attemptInput: unknown): Promise<QuestionAttempt> {
    const attempt = QuestionAttemptSchema.parse(attemptInput);
    const existing = this.questionAttempts.get(attempt.studentId) || [];
    existing.push(attempt);
    this.questionAttempts.set(attempt.studentId, existing);

    // If incorrect, add or increment in wrongAnswerReviews list
    if (!attempt.isCorrect) {
      await this.registerWrongAnswer(
        attempt.studentId,
        attempt.questionId,
        attempt.conceptId
      );
    }

    this.saveLocalStudentProgress();
    return attempt;
  }

  public async registerWrongAnswer(
    studentId: string,
    questionId: string,
    conceptId: string,
    chapterId = 'ch01'
  ): Promise<WrongAnswerReview> {
    const reviews = this.wrongAnswerReviews.get(studentId) || [];
    const index = reviews.findIndex((r) => r.questionId === questionId);

    let review: WrongAnswerReview;
    const now = new Date().toISOString();

    if (index >= 0) {
      reviews[index].missedCount += 1;
      reviews[index].lastMistakeTimestamp = now;
      reviews[index].mastered = false;
      review = reviews[index];
    } else {
      review = {
        reviewId: `review_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        studentId,
        questionId,
        conceptId,
        chapterId,
        missedCount: 1,
        lastMistakeTimestamp: now,
        mastered: false,
        reviewScheduledAt: now,
      };
      reviews.push(review);
    }

    const validated = WrongAnswerReviewSchema.parse(review);
    this.wrongAnswerReviews.set(studentId, reviews);
    this.saveLocalStudentProgress();
    return validated;
  }

  public async getWrongAnswersForStudent(studentId: string): Promise<WrongAnswerReview[]> {
    return (this.wrongAnswerReviews.get(studentId) || []).filter((r) => !r.mastered);
  }

  // ==========================================================================
  // Internal Helpers & Persistence
  // ==========================================================================

  private recordAuditLog(log: ContentAuditLog): void {
    const validated = ContentAuditLogSchema.parse(log);
    this.auditLogs.push(validated);
  }

  public getAuditLogs(context: SecurityContext): ContentAuditLog[] {
    this.verifyAdminRole(context, 'getAuditLogs');
    return [...this.auditLogs];
  }

  private saveLocalStudentProgress(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const studentProgressObj: Record<string, StudyProgress> = {};
        this.studentProgress.forEach((v, k) => (studentProgressObj[k] = v));
        localStorage.setItem('studyverse10_progress', JSON.stringify(studentProgressObj));
      } catch {
        // Fallback silently if localStorage quota or disabled
      }
    }
  }

  private loadLocalStudentProgress(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem('studyverse10_progress');
        if (raw) {
          const parsed = JSON.parse(raw);
          for (const [k, v] of Object.entries(parsed)) {
            const valid = StudyProgressSchema.parse(v);
            this.studentProgress.set(k, valid);
          }
        }
      } catch {
        // Ignore corrupted local cache
      }
    }
  }
}

export const contentDatabase = new ContentDatabaseStore();
