/**
 * StudyVerse 10 — Official CBSE Class X Science Syllabus Registry (2026–27)
 * Source of Truth: StudyVerse 10 Science Blueprint Section 4
 * 
 * Official Sources:
 * - Curriculum Portal: https://cbseacademic.nic.in/curriculum_2027.html
 * - Science Syllabus PDF: https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart1/Science_SecP1_2026-27.pdf
 * - Reading Material PDF: https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart1/Science_SecP1IX_2026-27_RM.pdf
 */

import { AssessmentStatus, SyllabusSource, SyllabusUnit } from '../content/schemas.ts';
import { SecurityContext, SecurityError } from '../services/contentRepository.ts';

export interface SyllabusMappingSuggestion {
  topicTitle: string;
  chapterId: string;
  suggestedStatus: AssessmentStatus;
  matchedUnitId?: string;
  confidenceScore: number; // 0.0 - 1.0 (used ONLY for prioritization, never auto-approval)
  evidenceSourceRef: string;
  officialWordingExcerpt: string;
  isAmbiguous: boolean;
  ambiguityReason?: string;
  reviewDecision: 'pending_human_review' | 'approved_by_reviewer' | 'rejected_by_reviewer';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
}

export class SyllabusRegistryService {
  private officialSyllabus: SyllabusSource;
  private mappings: Map<string, SyllabusMappingSuggestion> = new Map();

  constructor() {
    this.officialSyllabus = this.initOfficial2026Syllabus();
  }

  /**
   * Initializes the verified CBSE Class X Science 2026–27 curriculum data
   */
  private initOfficial2026Syllabus(): SyllabusSource {
    const units: SyllabusUnit[] = [
      {
        unitId: 'unit_1_chemical_substances',
        unitNumber: 1,
        title: 'Chemical Substances — Nature and Behaviour',
        theoryMarksWeight: 25,
        includedChapterIds: ['ch01', 'ch02', 'ch03', 'ch04'],
        coreTopics: [
          'Chemical reactions and equations: chemical equation, balanced chemical equation, implications of a balanced chemical equation',
          'Types of chemical reactions: combination, decomposition, displacement, double displacement, precipitation, endothermic, exothermic reactions, oxidation and reduction',
          'Acids, bases and salts: indicators, reactions with metals and carbonates, neutralisation, H+ and OH- ions, pH scale concept and importance in everyday life',
          'Preparation and uses of sodium hydroxide, bleaching powder, baking soda, washing soda and plaster of paris',
          'Metals and non-metals: properties, reactivity series, formation and properties of ionic compounds, basic metallurgical processes, corrosion and its prevention',
          'Carbon compounds: covalent bonding in carbon compounds, versatile nature of carbon, homologous series, nomenclature of carbon compounds containing functional groups, difference between saturated and unsaturated hydrocarbons',
          'Chemical properties of carbon compounds (combustion, oxidation, addition and substitution), ethanol and ethanoic acid, soaps and detergents',
        ],
        formativeTopics: ['Periodic classification of elements (covered via official reading material for portfolio/formative)'],
        explicitExclusions: [],
        ambiguousClauses: [],
      },
      {
        unitId: 'unit_2_world_of_living',
        unitNumber: 2,
        title: 'World of Living',
        theoryMarksWeight: 25,
        includedChapterIds: ['ch05', 'ch06', 'ch07', 'ch08'],
        coreTopics: [
          'Life processes: Basic concept of nutrition, respiration, transport and excretion in plants and animals',
          'Control and co-ordination: Tropic movements in plants, introduction to plant hormones, control and co-ordination in animals (nervous system, voluntary, involuntary and reflex action, chemical co-ordination, animal hormones)',
          'Reproduction: Reproduction in animals and plants (asexual and sexual), reproductive health - need and methods of family planning, safe sex vs HIV/AIDS, child bearing and women health',
          'Heredity: Heredity, Mendel\'s contribution - laws for inheritance of traits, sex determination (brief introduction)',
        ],
        formativeTopics: [
          'Evolution (not assessed in year-end examination; formative only)',
        ],
        explicitExclusions: ['Detailed evolution theories and speciation excluded from annual examination'],
        ambiguousClauses: [
          {
            clauseText: 'Heredity and Evolution named in formative/non-year-end note',
            flagReason: 'Official note names Heredity and Evolution while syllabus course structure explicitly retains Heredity. Subtopic boundary must be confirmed by human reviewer.',
            resolutionStatus: 'pending_human_review',
          },
        ],
      },
      {
        unitId: 'unit_3_natural_phenomena',
        unitNumber: 3,
        title: 'Natural Phenomena',
        theoryMarksWeight: 12,
        includedChapterIds: ['ch09', 'ch10'],
        coreTopics: [
          'Reflection of light by curved surfaces, images formed by spherical mirrors, centre of curvature, principal axis, principal focus, focal length, mirror formula, magnification',
          'Refraction: laws of refraction, refractive index, refraction of light by spherical lens, image formed by spherical lenses, lens formula, magnification, power of a lens',
          'Refraction of light through a prism, dispersion of light, scattering of light, applications in daily life',
          'Functioning of a lens in human eye, defects of vision and their corrections, applications of spherical mirrors and lenses',
        ],
        formativeTopics: [],
        explicitExclusions: [
          'Colour of the Sun at sunrise and sunset (explicitly excluded from annual examination in official syllabus notes)',
        ],
        ambiguousClauses: [],
      },
      {
        unitId: 'unit_4_effects_of_current',
        unitNumber: 4,
        title: 'Effects of Current',
        theoryMarksWeight: 13,
        includedChapterIds: ['ch11', 'ch12'],
        coreTopics: [
          'Electric current, potential difference and electric current. Ohm\'s law; resistance, resistivity, factors on which the resistance of a conductor depends. Series combination of resistors, parallel combination of resistors and its applications in daily life.',
          'Heating effect of electric current and its applications in daily life. Electric power, interrelation between P, V, I and R.',
          'Magnetic effects of current: Magnetic field, field lines, field due to a current carrying conductor, field due to current carrying coil or solenoid; Force on current carrying conductor, Fleming\'s Left Hand Rule.',
          'Direct current. Alternating current: frequency of AC. Advantage of AC over DC. Domestic electric circuits.',
        ],
        formativeTopics: [
          'Electric Motor (explicitly listed as formative learning topic)',
          'Electromagnetic Induction (explicitly listed as formative learning topic)',
          'Electric Generator (explicitly listed as formative learning topic)',
        ],
        explicitExclusions: [],
        ambiguousClauses: [
          {
            clauseText: 'Broad phrase "Electric Effects of Electric Current" in non-year-end list',
            flagReason: 'Official 2026-27 note uses broad wording "Electric Effects of Electric Current" in non-year-end list, but the same syllabus page specifies 13 marks for Effects of Current with core topics. AI must not silently resolve this contradiction.',
            resolutionStatus: 'pending_human_review',
          },
        ],
      },
      {
        unitId: 'unit_5_natural_resources',
        unitNumber: 5,
        title: 'Natural Resources',
        theoryMarksWeight: 5,
        includedChapterIds: ['ch13'],
        coreTopics: [
          'Our environment: Eco-system, environmental problems, ozone depletion, waste production and their solutions. Biodegradable and non-biodegradable substances.',
        ],
        formativeTopics: [],
        explicitExclusions: [],
        ambiguousClauses: [],
      },
    ];

    return {
      syllabusSourceId: 'cbse_science_10_2026_27_official',
      title: 'CBSE Secondary School Curriculum 2026-27: Class X Science',
      academicSession: '2026-27',
      officialDocumentUrl: 'https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart1/Science_SecP1_2026-27.pdf',
      readingMaterialUrl: 'https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart1/Science_SecP1IX_2026-27_RM.pdf',
      totalTheoryMarks: 80,
      internalAssessmentMarks: 20,
      units,
      verifiedAt: '2026-10-20T00:00:00.000Z',
      verifiedBy: 'Academic_Curriculum_Lead_CBSE',
    };
  }

  public getOfficialSyllabus(): SyllabusSource {
    return this.officialSyllabus;
  }

  /**
   * Evaluates a concept or query against the official syllabus.
   * STRICT PEDAGOGICAL RULES:
   * 1. Never auto-approves. All suggestions are marked 'pending_human_review'.
   * 2. Missing match is tagged 'not_mapped' — NEVER assumed to be 'out of syllabus'.
   * 3. Ambiguous clauses (like Electric Effects broad note) MUST trigger 'needs_curriculum_review'.
   * 4. Excluded items (like Sunrise/sunset sun color) MUST trigger 'excluded_from_specified_assessment'.
   * 5. Formative topics (like Motor/Generator/Induction) MUST trigger 'formative_portfolio'.
   */
  public evaluateTopicMapping(input: {
    topicTitle: string;
    chapterId: string;
    description?: string;
  }): SyllabusMappingSuggestion {
    const text = `${input.topicTitle} ${input.description || ''}`.toLowerCase();

    // 1. Check for Ambiguous Clauses First
    if (
      text.includes('electric effects of electric current') ||
      (text.includes('magnetic') && text.includes('effects') && text.includes('non-year-end')) ||
      (input.chapterId === 'ch08' && text.includes('evolution') && text.includes('annual exam'))
    ) {
      return {
        topicTitle: input.topicTitle,
        chapterId: input.chapterId,
        suggestedStatus: 'needs_curriculum_review',
        matchedUnitId: 'unit_4_effects_of_current',
        confidenceScore: 0.95,
        evidenceSourceRef: 'CBSE 2026-27 Syllabus Non-Year-End Note p.14',
        officialWordingExcerpt: 'Broad wording "Electric Effects of Electric Current" in non-year-end list conflicts with 13 marks unit structure.',
        isAmbiguous: true,
        ambiguityReason: 'Conflicting official guidance between annual course structure and non-year-end note. Held from Board Exam Mode.',
        reviewDecision: 'pending_human_review',
      };
    }

    // 2. Check for Explicit Exclusions
    if (
      text.includes('sunrise') ||
      text.includes('sunset') ||
      text.includes('colour of the sun at sunrise') ||
      text.includes('color of the sun at sunrise')
    ) {
      return {
        topicTitle: input.topicTitle,
        chapterId: input.chapterId,
        suggestedStatus: 'excluded_from_specified_assessment',
        matchedUnitId: 'unit_3_natural_phenomena',
        confidenceScore: 0.99,
        evidenceSourceRef: 'CBSE 2026-27 Syllabus Unit III Note',
        officialWordingExcerpt: 'Excludes the colour of the Sun at sunrise and sunset from the listed applications.',
        isAmbiguous: false,
        reviewDecision: 'pending_human_review',
      };
    }

    // 3. Check for Formative / Portfolio Topics
    if (
      text.includes('electric motor') ||
      text.includes('motor') ||
      text.includes('generator') ||
      text.includes('electromagnetic induction') ||
      text.includes('periodic classification')
    ) {
      return {
        topicTitle: input.topicTitle,
        chapterId: input.chapterId,
        suggestedStatus: 'formative_portfolio',
        matchedUnitId: input.chapterId === 'ch12' ? 'unit_4_effects_of_current' : 'unit_1_chemical_substances',
        confidenceScore: 0.98,
        evidenceSourceRef: 'CBSE 2026-27 Syllabus Formative Learning Note',
        officialWordingExcerpt: 'Motor, Electromagnetic Induction and Electric Generator are identified as formative topics.',
        isAmbiguous: false,
        reviewDecision: 'pending_human_review',
      };
    }

    // 4. Check for NCERT Box / Enrichment Content
    if (text.includes('ncert box') || text.includes('enrichment') || text.includes('more to know')) {
      return {
        topicTitle: input.topicTitle,
        chapterId: input.chapterId,
        suggestedStatus: 'enrichment_box',
        confidenceScore: 0.9,
        evidenceSourceRef: 'CBSE 2026-27 Syllabus General Note',
        officialWordingExcerpt: 'Information in NCERT boxes is not assessed in the year-end examination.',
        isAmbiguous: false,
        reviewDecision: 'pending_human_review',
      };
    }

    // 5. Match against Unit Core Topics
    for (const unit of this.officialSyllabus.units) {
      if (unit.includedChapterIds.includes(input.chapterId)) {
        for (const core of unit.coreTopics) {
          const coreLower = core.toLowerCase();
          // Check keyword overlap
          const keywords = input.topicTitle.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
          const matchCount = keywords.filter((k) => coreLower.includes(k)).length;

          if (matchCount >= 1 || coreLower.includes(text)) {
            return {
              topicTitle: input.topicTitle,
              chapterId: input.chapterId,
              suggestedStatus: 'annual_exam_core',
              matchedUnitId: unit.unitId,
              confidenceScore: 0.92,
              evidenceSourceRef: `${unit.title} (${unit.theoryMarksWeight} Marks)`,
              officialWordingExcerpt: core.slice(0, 150) + '...',
              isAmbiguous: false,
              reviewDecision: 'pending_human_review',
            };
          }
        }
      }
    }

    // 6. Default: Not Mapped (Never infer as 'out of syllabus' without evidence)
    return {
      topicTitle: input.topicTitle,
      chapterId: input.chapterId,
      suggestedStatus: 'not_mapped',
      confidenceScore: 0.2,
      evidenceSourceRef: 'No direct official match found yet',
      officialWordingExcerpt: 'Topic does not match direct official unit keywords. Must be researched by academic reviewer.',
      isAmbiguous: false,
      reviewDecision: 'pending_human_review',
    };
  }

  /**
   * Human Review Sign-Off (Server-enforced, rejecting unauthenticated client actions)
   */
  public approveMapping(
    context: SecurityContext,
    mappingId: string,
    decision: 'approved_by_reviewer' | 'rejected_by_reviewer',
    finalStatus: AssessmentStatus,
    reviewerNotes: string
  ): SyllabusMappingSuggestion {
    if (!context || !context.isAdmin) {
      throw new SecurityError('Only verified curriculum engineers can sign off on syllabus mappings.');
    }

    const existing = this.mappings.get(mappingId);
    if (!existing) {
      throw new Error(`Mapping ${mappingId} not found.`);
    }

    const updated: SyllabusMappingSuggestion = {
      ...existing,
      suggestedStatus: finalStatus,
      reviewDecision: decision,
      reviewedBy: context.userId,
      reviewedAt: new Date().toISOString(),
      reviewerNotes,
    };

    this.mappings.set(mappingId, updated);
    return updated;
  }

  public registerDraftMapping(id: string, mapping: SyllabusMappingSuggestion): void {
    this.mappings.set(id, mapping);
  }

  public getMapping(id: string): SyllabusMappingSuggestion | undefined {
    return this.mappings.get(id);
  }
}

export const syllabusRegistryService = new SyllabusRegistryService();
