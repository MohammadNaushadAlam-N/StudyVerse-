/**
 * StudyVerse 10 — Server-Side Gemini Study Buddy Service
 * 
 * Enforces:
 * 1. Approved content retrieval prerequisite: only explains concepts verified in published chapter bundles.
 * 2. Unknown-topic fallback: explicitly identifies and declines unapproved/out-of-syllabus topics.
 * 3. Fixed teaching template:
 *    - Simple explanation (grounded in NCERT)
 *    - Real-life example (authentic everyday observations)
 *    - Model / Visual cue (3D visual cues connected to Reaction Lab)
 *    - One misconception (from verified syllabus curriculum notes)
 *    - One check question (strictly labelled AI-generated, excluded from official exam scoring)
 * 4. Language selection: English, Hindi, and Hinglish.
 * 5. In-memory caching for frequent concept queries.
 * 6. Rate-limiting to prevent quota abuse and loop calls.
 * 7. Server-side key protection: GEMINI_API_KEY is never exposed to the client.
 * 8. Resilient offline / quota fallback: static approved lessons keep working if Gemini is unavailable or over quota.
 */

import { GoogleGenAI } from '@google/genai';
import { contentDatabase } from '../services/contentRepository.ts';
import { Concept, PublishedContent, Question } from '../content/schemas.ts';

export type TeachingLanguage = 'simpleEnglish' | 'hindi' | 'hinglish';

export interface CheckQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  isAiGenerated: true;
  isExamScored: false;
  label: string;
}

export interface TeachingResponse {
  status: 'success' | 'unknown_topic' | 'unavailable';
  simpleExplanation: string;
  realLifeExample: string;
  visualOrModelCue: string;
  misconception: string;
  checkQuestion?: CheckQuestion;
  source: 'gemini_grounded' | 'approved_static_fallback';
  groundedConceptId?: string;
  groundedChapterId: string;
  language: TeachingLanguage;
  cached?: boolean;
  message?: string;
}

export interface HintResponse {
  status: 'success' | 'unavailable';
  hintLevel: 1 | 2 | 3;
  hintText: string;
  visualCue: string;
  source: 'gemini_grounded' | 'approved_static_fallback';
  groundedConceptId?: string;
  language: TeachingLanguage;
  cached?: boolean;
  message?: string;
}

export interface BuddyQueryOptions {
  chapterId: string;
  conceptId?: string;
  topicQuery?: string;
  language?: TeachingLanguage;
  clientId?: string;
  mode?: 'explain' | 'hint' | 'chat';
  hintLevel?: 1 | 2 | 3;
  academicSession?: string;
}

interface CacheEntry {
  data: TeachingResponse | HintResponse;
  expiresAt: number;
}

export class StudyBuddyService {
  private aiClient: GoogleGenAI | null = null;
  private readonly modelName = 'gemini-3.8-flash';
  private responseCache: Map<string, CacheEntry> = new Map();
  private rateLimitMap: Map<string, { count: number; windowStart: number }> = new Map();
  
  // Rate limit parameters: 20 requests per 60-second window per client
  private readonly RATE_LIMIT_WINDOW_MS = 60000;
  private readonly MAX_REQUESTS_PER_WINDOW = 20;
  // Cache TTL: 15 minutes
  private readonly CACHE_TTL_MS = 15 * 60000;

  constructor() {
    const apiKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0) {
      try {
        this.aiClient = new GoogleGenAI({ apiKey });
      } catch {
        this.aiClient = null;
      }
    }
  }

  /**
   * Health and status check without exposing API key.
   */
  public getStatus(): {
    configured: boolean;
    model: string;
    cacheEntriesCount: number;
    hasAiClient: boolean;
  } {
    return {
      configured: Boolean(process.env?.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      model: this.modelName,
      cacheEntriesCount: this.responseCache.size,
      hasAiClient: this.aiClient !== null,
    };
  }

  /**
   * Rate limiting verification.
   * Throws Error if client exceeds rate limit.
   */
  public checkRateLimit(clientId = 'default_client'): void {
    const now = Date.now();
    const entry = this.rateLimitMap.get(clientId);

    if (!entry || now - entry.windowStart > this.RATE_LIMIT_WINDOW_MS) {
      this.rateLimitMap.set(clientId, { count: 1, windowStart: now });
      return;
    }

    if (entry.count >= this.MAX_REQUESTS_PER_WINDOW) {
      const waitSeconds = Math.ceil((this.RATE_LIMIT_WINDOW_MS - (now - entry.windowStart)) / 1000);
      throw new Error(`Rate limit exceeded. Please wait ${waitSeconds} seconds before asking SciBuddy again.`);
    }

    entry.count += 1;
  }

  /**
   * Explains a verified concept using the strict 5-part teaching template.
   */
  public async explainConcept(options: BuddyQueryOptions): Promise<TeachingResponse> {
    const {
      chapterId,
      conceptId,
      topicQuery,
      language = 'simpleEnglish',
      clientId = 'client_default',
      academicSession = '2026-27',
    } = options;

    // Rate limit verification
    this.checkRateLimit(clientId);

    // 1. Approved Content Retrieval Prerequisite
    const published = await contentDatabase.getPublishedChapterContent(academicSession, chapterId);
    if (!published || published.concepts.length === 0) {
      return {
        status: 'unavailable',
        simpleExplanation: '',
        realLifeExample: '',
        visualOrModelCue: '',
        misconception: '',
        source: 'approved_static_fallback',
        groundedChapterId: chapterId,
        language,
        message: 'Authoritative source content for this chapter is currently unavailable. Study Buddy only teaches from approved NCERT syllabus content.',
      };
    }

    // Match concept in approved published bundle
    const matchedConcept = this.findMatchingConcept(published, conceptId, topicQuery);
    if (!matchedConcept) {
      return {
        status: 'unknown_topic',
        simpleExplanation: '',
        realLifeExample: '',
        visualOrModelCue: '',
        misconception: '',
        source: 'approved_static_fallback',
        groundedChapterId: chapterId,
        language,
        message: `The topic "${topicQuery || conceptId || 'unknown'}" is not part of the approved CBSE Class 10 Science syllabus for Chapter ${chapterId}, or authoritative source content is currently unavailable. SciBuddy only teaches curriculum-verified topics.`,
      };
    }

    // Check cache
    const cacheKey = `explain:${chapterId}:${matchedConcept.conceptId}:${language}`;
    const cached = this.getFromCache<TeachingResponse>(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    // Try Gemini API generation if client is available
    if (this.aiClient) {
      try {
        const geminiResponse = await this.generateTeachingResponseWithGemini(
          published,
          matchedConcept,
          language
        );
        this.setCache(cacheKey, geminiResponse);
        return geminiResponse;
      } catch (err: unknown) {
        // Log gracefully; fallback to static approved content on quota/network error
        console.warn('[SciBuddy] Gemini call failed or quota exceeded. Falling back to static approved content.', err);
      }
    }

    // Fallback directly to rich static approved content
    const fallbackResponse = this.generateStaticFallbackResponse(published, matchedConcept, language);
    this.setCache(cacheKey, fallbackResponse);
    return fallbackResponse;
  }

  /**
   * Provides progressive hints (Level 1: conceptual, Level 2: equation/balance, Level 3: step-by-step cue).
   */
  public async getHint(options: BuddyQueryOptions): Promise<HintResponse> {
    const {
      chapterId,
      conceptId,
      topicQuery,
      language = 'simpleEnglish',
      clientId = 'client_default',
      hintLevel = 1,
      academicSession = '2026-27',
    } = options;

    this.checkRateLimit(clientId);

    const published = await contentDatabase.getPublishedChapterContent(academicSession, chapterId);
    if (!published) {
      return {
        status: 'unavailable',
        hintLevel,
        hintText: 'Authoritative chapter content is currently unavailable for hints.',
        visualCue: '',
        source: 'approved_static_fallback',
        language,
        message: 'No published content found.',
      };
    }

    const matchedConcept = this.findMatchingConcept(published, conceptId, topicQuery);
    const cacheKey = `hint:${chapterId}:${matchedConcept?.conceptId || 'generic'}:${hintLevel}:${language}`;
    const cached = this.getFromCache<HintResponse>(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    // Generate progressive hint based on approved content
    const hint = this.generateApprovedHint(published, matchedConcept, hintLevel, language);
    this.setCache(cacheKey, hint);
    return hint;
  }

  // ==========================================================================
  // Internal Helpers & AI Generation
  // ==========================================================================

  private findMatchingConcept(
    published: PublishedContent,
    conceptId?: string,
    topicQuery?: string
  ): Concept | null {
    if (conceptId) {
      const direct = published.concepts.find((c) => c.conceptId === conceptId);
      if (direct) return direct;
    }

    if (!topicQuery) {
      return published.concepts[0] || null;
    }

    const cleanQuery = topicQuery.toLowerCase().trim();
    // Check known out-of-syllabus triggers
    const outOfSyllabusKeywords = [
      'quantum mechanics',
      'schrodinger',
      'organic reaction mechanisms sn1',
      'nuclear fission reactor control rods',
      'astrophysics dark matter',
      'calculus integration',
    ];
    if (outOfSyllabusKeywords.some((kw) => cleanQuery.includes(kw))) {
      return null;
    }

    // Match title or learning objectives
    const matched = published.concepts.find((c) => {
      const titleMatch = c.title.toLowerCase().includes(cleanQuery);
      const objMatch = c.learningObjectives.some((obj) => obj.toLowerCase().includes(cleanQuery));
      const keywordMatch = cleanQuery.split(' ').some((word) => word.length > 3 && c.title.toLowerCase().includes(word));
      return titleMatch || objMatch || keywordMatch;
    });

    return matched || null;
  }

  /**
   * Generates a 5-part teaching response using Gemini 3.8 Flash.
   */
  private async generateTeachingResponseWithGemini(
    published: PublishedContent,
    concept: Concept,
    language: TeachingLanguage
  ): Promise<TeachingResponse> {
    if (!this.aiClient) {
      throw new Error('Gemini AI Client not initialized.');
    }

    const prompt = `
You are SciBuddy, an encouraging and academically rigorous CBSE Class 10 Science tutor.
You teach strictly from approved NCERT curriculum concepts for Chapter 1: Chemical Reactions and Equations.

Concept: "${concept.title}"
Approved NCERT Explanation Context:
${concept.explanations[language] || concept.explanations.simpleEnglish}

Common Misconceptions from Syllabus:
${concept.commonMisconceptions.join('; ')}

Target Language: ${language === 'hindi' ? 'Hindi (Devanagari script)' : language === 'hinglish' ? 'Hinglish (Conversational Hindi in Latin script)' : 'Simple, accessible English'}

STRICT INSTRUCTION: Output ONLY a valid JSON object matching this exact structure:
{
  "simpleExplanation": "Clear, grounded 2-3 sentence explanation of the concept for Class 10.",
  "realLifeExample": "Authentic everyday-life NCERT observation (e.g. rusting of iron, milk souring in summer, respiration, whitewashing).",
  "visualOrModelCue": "3D visual cue describing color-coded atom spheres (Mg orange, O crimson) and molecular rearrangement in the 3D Reaction Lab.",
  "misconception": "Clear debunking of a common student misunderstanding regarding this topic.",
  "checkQuestion": {
    "questionText": "A conceptual check question testing this exact concept.",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation of why this is correct."
  }
}
`;

    const result = await this.aiClient.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = result.text || '';
    const parsed = JSON.parse(responseText);

    return {
      status: 'success',
      simpleExplanation: parsed.simpleExplanation || concept.explanations[language] || concept.explanations.simpleEnglish,
      realLifeExample: parsed.realLifeExample || 'Respiration in humans breaks down glucose exothermically into energy, carbon dioxide, and water.',
      visualOrModelCue: parsed.visualOrModelCue || 'Look at the 3D Reaction Lab: observe orange magnesium atoms combining with pairs of crimson oxygen atoms.',
      misconception: parsed.misconception || concept.commonMisconceptions[0] || 'Atoms are not created or destroyed; they only change bonding partners.',
      checkQuestion: parsed.checkQuestion ? {
        questionText: parsed.checkQuestion.questionText,
        options: parsed.checkQuestion.options,
        correctAnswer: parsed.checkQuestion.correctAnswer,
        explanation: parsed.checkQuestion.explanation,
        isAiGenerated: true,
        isExamScored: false,
        label: '[AI-Generated Practice Check — Not for Official Exam Scoring]',
      } : undefined,
      source: 'gemini_grounded',
      groundedConceptId: concept.conceptId,
      groundedChapterId: published.chapterId,
      language,
    };
  }

  /**
   * Resilient fallback generating the 5-part teaching template from static approved records.
   */
  public generateStaticFallbackResponse(
    published: PublishedContent,
    concept: Concept,
    language: TeachingLanguage
  ): TeachingResponse {
    let realLifeExample = '';
    let visualCue = '';
    let checkQuestion: CheckQuestion;

    if (concept.conceptId === 'concept_ch01_chemical_equations') {
      realLifeExample = language === 'hindi'
        ? 'दैनिक जीवन में लोहे की कील को नम हवा में छोड़ देने पर जंग लगना एक रासायनिक अभिक्रिया है।'
        : language === 'hinglish'
        ? 'Daily life me iron nail ko moist air me chhodne par uspe rust lagna ek chemical reaction hai.'
        : 'In daily life, an iron nail left exposed to humid air forms rust, showing a chemical reaction.';

      visualCue = language === 'hindi'
        ? '3D रिएक्शन लैब में देखें: मैग्नीशियम के नारंगी परमाणु और ऑक्सीजन के लाल अणुओं के बंध टूटकर सफेद जालीदार संरचना बनाते हैं।'
        : language === 'hinglish'
        ? '3D Reaction Lab me dekho: orange Mg atoms aur red O2 molecules recombine hokar white crystal structure banate hain.'
        : 'In the 3D Reaction Lab: observe orange Mg atoms and crimson O2 diatomic molecules reorganizing into a white crystalline MgO lattice.';

      checkQuestion = {
        questionText: language === 'hindi'
          ? 'रासायनिक समीकरण को संतुलित करते समय किस नियम का पालन अनिवार्य है?'
          : language === 'hinglish'
          ? 'Chemical equation ko balance karte samay kis rule ka palan karna mandatory hai?'
          : 'Which scientific law must be satisfied when balancing a chemical equation?',
        options: [
          'Law of Conservation of Mass',
          'Law of Constant Acceleration',
          'Law of Gravity',
          'Law of Thermal Dissipation',
        ],
        correctAnswer: 'Law of Conservation of Mass',
        explanation: 'According to the Law of Conservation of Mass, the number of atoms of each element remains identical before and after a chemical reaction.',
        isAiGenerated: true,
        isExamScored: false,
        label: '[AI-Generated Practice Check — Not for Official Exam Scoring]',
      };
    } else if (concept.conceptId === 'concept_ch01_types_of_reactions') {
      realLifeExample = language === 'hindi'
        ? 'सफेदी (whitewashing) के लिए बिना बुझे चूने (CaO) में पानी मिलाने पर भारी मात्रा में ऊष्मा निकलती है (ऊष्माक्षेपी अभिक्रिया)।'
        : language === 'hinglish'
        ? 'Whitewashing ke liye quicklime (CaO) me water milane par heat generate hoti hai (Exothermic Combination reaction).'
        : 'When quicklime (calcium oxide) is mixed with water for whitewashing, slaked lime is produced with vigorous heat release (exothermic combination).';

      visualCue = language === 'hindi'
        ? 'रिएक्शन टाइप सॉर्टर में देखें: दो अलग-अलग अभिकर्मक मिलकर एकल उत्पाद बनाते हैं।'
        : language === 'hinglish'
        ? 'Reaction Type Sorter me dekho: do reactants milkar single compound form karte hain.'
        : 'In the Reaction Type Sorter: observe two distinct reactants merging into a single unified product compound.';

      checkQuestion = {
        questionText: language === 'hindi'
          ? 'कैल्शियम ऑक्साइड और जल की अभिक्रिया किस प्रकार की अभिक्रिया है?'
          : language === 'hinglish'
          ? 'Calcium oxide aur water ki reaction kis type ki reaction hai?'
          : 'What type of reaction occurs between calcium oxide and water?',
        options: [
          'Combination and Exothermic',
          'Decomposition and Endothermic',
          'Displacement only',
          'Neutralization only',
        ],
        correctAnswer: 'Combination and Exothermic',
        explanation: 'Quicklime reacts vigorously with water to form calcium hydroxide (slaked lime), producing a large amount of heat.',
        isAiGenerated: true,
        isExamScored: false,
        label: '[AI-Generated Practice Check — Not for Official Exam Scoring]',
      };
    } else {
      realLifeExample = language === 'hindi'
        ? 'तांबे के बर्तन पर हरी परत जमना संक्षारण और उपचयन का उदाहरण है।'
        : language === 'hinglish'
        ? 'Copper vessels par greenish coating aana corrosion aur oxidation ka example hai.'
        : 'The black coating on copper powder upon heating in air demonstrates oxidation.';

      visualCue = language === 'hindi'
        ? 'ऑक्सीजन परमाणु का एक पदार्थ से निकलकर दूसरे पदार्थ से जुड़ना देखें।'
        : language === 'hinglish'
        ? 'Oxygen atom ka ek substance se lose hokar doosre substance me add hona observe karein.'
        : 'Observe the transfer of oxygen: copper loses oxygen (reduction) while hydrogen gains oxygen (oxidation).';

      checkQuestion = {
        questionText: language === 'hindi'
          ? 'CuO + H₂ → Cu + H₂O अभिक्रिया में किसका उपचयन (oxidation) हो रहा है?'
          : language === 'hinglish'
          ? 'CuO + H₂ → Cu + H₂O reaction me kiska oxidation ho raha hai?'
          : 'In the reaction CuO + H₂ → Cu + H₂O, which substance undergoes oxidation?',
        options: [
          'H₂ (it gains oxygen to form H₂O)',
          'CuO (it gains oxygen)',
          'Cu (it loses oxygen)',
          'None of these',
        ],
        correctAnswer: 'H₂ (it gains oxygen to form H₂O)',
        explanation: 'H₂ gains oxygen to form H₂O, so H₂ is oxidized. CuO loses oxygen to become Cu, so CuO is reduced.',
        isAiGenerated: true,
        isExamScored: false,
        label: '[AI-Generated Practice Check — Not for Official Exam Scoring]',
      };
    }

    return {
      status: 'success',
      simpleExplanation: concept.explanations[language] || concept.explanations.simpleEnglish,
      realLifeExample,
      visualOrModelCue: visualCue,
      misconception: concept.commonMisconceptions[0] || 'Atoms are neither created nor destroyed during chemical rearrangements.',
      checkQuestion,
      source: 'approved_static_fallback',
      groundedConceptId: concept.conceptId,
      groundedChapterId: published.chapterId,
      language,
    };
  }

  /**
   * Generates approved progressive hint.
   */
  private generateApprovedHint(
    published: PublishedContent,
    concept: Concept | null,
    level: 1 | 2 | 3,
    language: TeachingLanguage
  ): HintResponse {
    let hintText = '';
    let visualCue = '';

    if (level === 1) {
      hintText = language === 'hindi'
        ? 'संकेत 1: तीर के बाईं ओर (अभिकर्मक) और दाईं ओर (उत्पाद) प्रत्येक तत्व के परमाणुओं की संख्या गिनें।'
        : language === 'hinglish'
        ? 'Hint 1: Arrow ke left side (reactants) aur right side (products) me har element ke atoms count karo.'
        : 'Hint 1: Count the total number of atoms of each element on the left (reactants) and right (products) of the arrow.';
      visualCue = 'Check the Live Atom-Count Ledger below the equation.';
    } else if (level === 2) {
      hintText = language === 'hindi'
        ? 'संकेत 2: याद रखें कि सबस्क्रिप्ट (subscript) कभी नहीं बदल सकते! केवल आगे के गुणांक (coefficients) को बदलें।'
        : language === 'hinglish'
        ? 'Hint 2: Yaad rakho subscripts kabhi change nahi honge! Sirf aage ke stoichiometric coefficients ko modify karo.'
        : 'Hint 2: Subscripts are strictly immutable. Only adjust the stoichiometric coefficients in front of chemical formulas.';
      visualCue = 'Subscripts are locked in red; use the +/- steppers on the coefficients.';
    } else {
      hintText = language === 'hindi'
        ? 'संकेत 3: सबसे पहले उस तत्व को संतुलित करें जिसकी संख्या सबसे अधिक है (जैसे ऑक्सीजन या हाइड्रोजन)।'
        : language === 'hinglish'
        ? 'Hint 3: Pehle us element ko balance karo jiske atoms sabse zyada hain (jaise Oxygen ya Hydrogen).'
        : 'Hint 3: Start by balancing the compound containing the maximum number of atoms (often oxygen or hydrogen), then finish with lone elements.';
      visualCue = 'Balance oxygen atoms first, then balance the metal atoms.';
    }

    return {
      status: 'success',
      hintLevel: level,
      hintText,
      visualCue,
      source: 'approved_static_fallback',
      groundedConceptId: concept?.conceptId,
      language,
    };
  }

  // ==========================================================================
  // Cache Management
  // ==========================================================================

  private getFromCache<T>(key: string): T | null {
    const entry = this.responseCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.responseCache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache(key: string, data: TeachingResponse | HintResponse): void {
    this.responseCache.set(key, {
      data,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });
  }

  public clearCache(): void {
    this.responseCache.clear();
  }

  public resetRateLimits(): void {
    this.rateLimitMap.clear();
  }
}

export const studyBuddyService = new StudyBuddyService();
