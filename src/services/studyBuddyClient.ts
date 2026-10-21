/**
 * StudyVerse 10 — Client-Side Study Buddy API Connector
 * 
 * Guarantees:
 * 1. Zero API key exposure: all AI requests go through /api/study-buddy/* server proxy.
 * 2. Never called from game movement/RAF render loops.
 * 3. Graceful offline/quota fallback: seamlessly serves approved static content if backend is offline or rate-limited.
 * 4. Supplemental questions are explicitly flagged (isAiGenerated: true, isExamScored: false).
 */

import { TeachingLanguage, TeachingResponse, HintResponse } from '../server/studyBuddyService.ts';
import { CHAPTER_1_PUBLISHED_BUNDLE } from '../content/chapter1PublishedData.ts';

export interface ClientExplainParams {
  chapterId: string;
  conceptId?: string;
  topicQuery?: string;
  language: TeachingLanguage;
  clientId?: string;
}

export interface ClientHintParams {
  chapterId: string;
  conceptId?: string;
  topicQuery?: string;
  language: TeachingLanguage;
  hintLevel: 1 | 2 | 3;
  clientId?: string;
}

class StudyBuddyClient {
  private clientId: string;

  constructor() {
    this.clientId = typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem('studyverse10_client_id') || this.generateClientId()
      : 'cadet_' + Math.random().toString(36).substring(2, 8);
  }

  private generateClientId(): string {
    const id = 'cadet_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('studyverse10_client_id', id);
      } catch {
        // Ignore localStorage error
      }
    }
    return id;
  }

  /**
   * Request concept explanation following the 5-part teaching template.
   */
  public async explainConcept(params: ClientExplainParams): Promise<TeachingResponse> {
    try {
      const res = await fetch('/api/study-buddy/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          clientId: params.clientId || this.clientId,
        }),
      });

      if (res.ok) {
        const data: TeachingResponse = await res.json();
        return data;
      }

      if (res.status === 429) {
        console.warn('[StudyBuddyClient] Rate limit reached. Using approved static content fallback.');
      }
    } catch (err) {
      console.warn('[StudyBuddyClient] Server proxy unreachable, activating local static fallback:', err);
    }

    // Direct client fallback to static approved chapter content
    return this.getLocalStaticFallback(params.chapterId, params.conceptId, params.language);
  }

  /**
   * Request progressive hint.
   */
  public async getHint(params: ClientHintParams): Promise<HintResponse> {
    try {
      const res = await fetch('/api/study-buddy/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          clientId: params.clientId || this.clientId,
        }),
      });

      if (res.ok) {
        const data: HintResponse = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('[StudyBuddyClient] Hint server proxy unreachable:', err);
    }

    return this.getLocalStaticHintFallback(params.hintLevel, params.language);
  }

  /**
   * Client-side fallback that guarantees student learning is never blocked.
   */
  private getLocalStaticFallback(
    chapterId: string,
    conceptId?: string,
    language: TeachingLanguage = 'simpleEnglish'
  ): TeachingResponse {
    const concept = CHAPTER_1_PUBLISHED_BUNDLE.concepts.find((c) => c.conceptId === conceptId) ||
      CHAPTER_1_PUBLISHED_BUNDLE.concepts[0];

    const isBalancing = concept.conceptId === 'concept_ch01_chemical_equations';

    return {
      status: 'success',
      simpleExplanation: concept.explanations[language] || concept.explanations.simpleEnglish,
      realLifeExample: isBalancing
        ? (language === 'hindi'
          ? 'लोहे पर जंग लगना या मैग्नीशियम रिबन का दहन होना रासायनिक समीकरण का प्रत्यक्ष उदाहरण है।'
          : 'Burning a magnesium ribbon in air producing a dazzling white flame and white MgO powder.')
        : (language === 'hindi'
          ? 'सफेदी के लिए बिना बुझे चूने में पानी मिलाने पर तीव्र ऊष्मा निकलती है।'
          : 'Slaking quicklime (CaO) with water vigorously releases heat (exothermic combination).'),
      visualOrModelCue: isBalancing
        ? 'Observe orange Mg atoms combining with crimson O2 diatomic molecules in the 3D Reaction Lab.'
        : 'In the Reaction Type Sorter: notice how two reactant compounds join into one product.',
      misconception: concept.commonMisconceptions[0] || 'Atoms are neither created nor destroyed during chemical rearrangements.',
      checkQuestion: {
        questionText: isBalancing
          ? 'Which law dictates that total mass of reactants must equal total mass of products?'
          : 'What type of reaction releases significant heat into the surroundings?',
        options: isBalancing
          ? ['Law of Conservation of Mass', 'Law of Constant Acceleration', 'Law of Definite Volume', 'Newton First Law']
          : ['Exothermic Reaction', 'Endothermic Reaction', 'Reversible Reaction', 'Photolytic Reaction'],
        correctAnswer: isBalancing ? 'Law of Conservation of Mass' : 'Exothermic Reaction',
        explanation: 'According to the Law of Conservation of Mass, the number of atoms of each element remains unchanged.',
        isAiGenerated: true,
        isExamScored: false,
        label: '[AI-Generated Practice Check — Not for Official Exam Scoring]',
      },
      source: 'approved_static_fallback',
      groundedConceptId: concept.conceptId,
      groundedChapterId: chapterId,
      language,
    };
  }

  private getLocalStaticHintFallback(hintLevel: 1 | 2 | 3, language: TeachingLanguage): HintResponse {
    const hints = {
      1: language === 'hindi'
        ? 'संकेत 1: दोनों पक्षों में प्रत्येक तत्व के परमाणुओं की संख्या की तुलना करें।'
        : 'Hint 1: Compare atom counts of each element on both sides of the equation.',
      2: language === 'hindi'
        ? 'संकेत 2: सबस्क्रिप्ट स्थिर हैं! केवल रासायनिक सूत्रों के आगे के गुणांक बदलें।'
        : 'Hint 2: Subscripts are locked. Only adjust stoichiometric coefficients in front.',
      3: language === 'hindi'
        ? 'संकेत 3: सबसे पहले सबसे बड़े यौगिक के तत्वों (जैसे ऑक्सीजन) को संतुलित करें।'
        : 'Hint 3: Balance the element with the highest atom count first (e.g. Oxygen).',
    };

    return {
      status: 'success',
      hintLevel,
      hintText: hints[hintLevel],
      visualCue: 'Use the locked subscript steppers and check the Live Atom Ledger.',
      source: 'approved_static_fallback',
      language,
    };
  }
}

export const studyBuddyClient = new StudyBuddyClient();
