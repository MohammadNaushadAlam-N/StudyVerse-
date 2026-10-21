# StudyVerse 10 — Class 10 CBSE Science 3D Learning Game
## NCERT analysis + product blueprint + Google AI Studio build prompts
**Blueprint version:** 1.0  
**Target curriculum:** CBSE Class X Science, academic session 2026–27 unless changed in Admin Settings  
**Primary goal:** Free-to-use learning experience for students; Science-only; interactive concept clarity rather than a quiz-only app.

---

## 1. Executive decision

Build a mobile-first 3D web game called **StudyVerse 10**. A friendly 3D guide character (working name: **SciBuddy**) takes the student through a central academy and into chapter-specific science spaces. Each lesson follows the learning pattern observed in the uploaded NCERT book:

**Everyday-life hook → predict → explore an activity/simulation → observe evidence → explain the concept → practise → apply → recall/revise.**

The game must not be a static 3D background with quiz buttons. In every playable mission, the student must manipulate something meaningful: particles, a pH indicator, a circuit, a light ray, a body-system pathway, a food web, or another concept-specific variable.

**Initial playable slice:** Chapter 1, *Chemical Reactions and Equations*, because NCERT introduces it through familiar daily-life situations and a range of observable changes. After this vertical slice is tested, extend the content and simulation framework to all 13 uploaded textbook chapters.

**Important distinction:** the game is free for students to use, but hosting, storage and live Gemini requests may have operating costs. Keep static approved lessons playable without a Gemini request, limit/cache AI calls, and do not promise unlimited free AI usage unless the deployed plan and quota support it.

## 2. Inspection of the uploaded ZIP

The uploaded archive contains 15 PDFs:

- `jesc101.pdf`–`jesc113.pdf`: the 13 Class X Science textbook chapters, in order.
- `jesc1ps.pdf`: textbook prelims and contents, explicitly labelled **Science Textbook for Class X — Reprint 2026–27**.
- `jesc1an.pdf`: answer key pages.

The 13 chapter PDFs total 217 pages. I extracted their selectable text and reviewed page-image contact sheets to inspect chapter openings, activity panels, diagrams, tables, ray diagrams, circuit diagrams, model drawings, recaps and exercise layouts.

### Uploaded chapter list

1. Chemical Reactions and Equations
2. Acids, Bases and Salts
3. Metals and Non-metals
4. Carbon and its Compounds
5. Life Processes
6. Control and Coordination
7. How do Organisms Reproduce?
8. Heredity
9. Light — Reflection and Refraction
10. The Human Eye and the Colourful World
11. Electricity
12. Magnetic Effects of Electric Current
13. Our Environment

The answer-key PDF contains selected answers, not a complete verified answer bank for every question and every page. Do not treat it as a complete key for the entire textbook.

## 3. What the NCERT book is doing pedagogically

Across the uploaded chapters, the book repeatedly uses a structured teaching pattern:

1. **Begin with something familiar or a question.** Examples include changes in food or iron, household acids/bases, uses of metals, seeing in the dark, electrical appliances, and organisms’ visible activities.
2. **Invite the learner to predict or investigate.** Blue activity panels often give an activity, apparatus/materials, steps and questions to observe.
3. **Show an observable result.** The result may be a colour change, gas, deposit, temperature change, diagram, table, movement, current reading, image, or pattern.
4. **Explain the mechanism.** The book moves from the visible observation to the underlying concept, particles, body structures, rays, circuit relationships, or ecosystem interactions.
5. **Use labelled diagrams, equations, tables and worked examples.** These are teaching tools, not decoration. The game must keep labels and scientific notation legible.
6. **Check learning.** The book has section questions, “What you have learnt” recaps and end-of-chapter exercises.
7. **Move from recall to application.** Exercises include identifying concepts, explaining observations, interpreting diagrams, balancing equations, numerical problems and reasoning.

### The game’s required lesson loop

Every concept module should implement this sequence unless the concept genuinely needs a different order:

1. **Hook:** one short real-life question or scenario.
2. **Predict:** the learner chooses or states what they think will happen.
3. **Explore:** the learner changes a safe simulation variable or performs a guided virtual activity.
4. **Observe:** the game highlights what changed and records simple evidence.
5. **Explain:** SciBuddy explains what happened in simple English, Hindi or Hinglish.
6. **Model:** learner can switch between a real-world view, a conceptual/microscopic 3D view and a clear labelled scientific diagram.
7. **Practise:** a worked example followed by a guided question.
8. **Apply:** a new context or data-based question checks transfer, not memorisation alone.
9. **Recall:** a 2–4 question exit check plus a one-screen summary.
10. **Review:** wrong or uncertain answers enter the student’s revision list.

If a learning module skips the predict/explore/observe part and only asks MCQs, it does not meet the core StudyVerse teaching goal.

## 4. Critical curriculum finding: the textbook and the current CBSE syllabus must be reconciled

The uploaded book is labelled Reprint 2026–27, but **the book alone must not be treated as the entire official annual-exam specification**. CBSE’s official 2026–27 Class X Science curriculum and reading material distinguish year-end assessment from formative/portfolio learning.

Official sources:

- CBSE Class X curriculum 2026–27: https://cbseacademic.nic.in/curriculum_2027.html
- Official Science syllabus PDF: https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart1/Science_SecP1_2026-27.pdf
- Official Science reading material PDF: https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart1/Science_SecP1IX_2026-27_RM.pdf

The syllabus gives these annual-examination unit weightings: Chemical Substances—Nature and Behaviour, 25 marks; World of Living, 25; Natural Phenomena, 12; Effects of Current, 13; Natural Resources, 5 (80 theory marks overall, plus 20 internal assessment). Its question-paper design states 50% knowledge/understanding, 30% application, and 20% analyse/evaluate/create. Use these as the *unit-level* weightings and question-design guidance; do not invent fixed chapter-wise marks.

CBSE’s document says some content is for formative learning rather than year-end assessment. It names Periodic Classification of Elements and Heredity and Evolution in the non-year-end note, identifies Motor, Electromagnetic Induction and Electric Generator as formative topics, excludes the colour of the Sun at sunrise/sunset from the listed scattering application, and says information in NCERT boxes is not assessed in the year-end examination.

**Potential ambiguity requiring academic review:** the official note also uses the broad wording “Electric Effects of Electric Current” in its non-year-end list, while the same syllabus page lists electricity and magnetic-effects topics in the annual course structure and separately names motor/induction/generator as formative material. Do not let an AI agent silently resolve this contradiction. Store the official wording, flag the affected exam-status mappings for review, and require a human curriculum reviewer to approve the exact “Board Exam” labels. The content may still be taught in Concept Explorer mode.

The uploaded chapter list does not contain a separate chapter named *Periodic Classification of Elements* or a separate *Evolution* chapter. The official CBSE 2026–27 Reading Material PDF contains material for Periodic Classification and related formative content. Add that official PDF as a separate source record if the game is to cover these topics. Do not claim the uploaded book contains material it does not contain.

### Required assessment tags

Every concept/question must have an `assessmentStatus` field chosen from:

- `annual_exam_core` — mapped to current official annual-exam content and reviewed.
- `formative_portfolio` — explicitly marked as formative/portfolio-only by the current official syllabus.
- `enrichment_box` — optional information from NCERT boxes noted as not assessed at year-end.
- `excluded_from_specified_assessment` — explicitly excluded from the relevant assessment scope, with source evidence.
- `needs_curriculum_review` — syllabus wording is ambiguous, conflicting, missing, or not yet reviewed.
- `not_mapped` — no official mapping yet. Never treat this as “definitely out of syllabus” without checking evidence.

Keep “what a student may learn” separate from “what will be assessed in the year-end exam”. The game can teach beyond annual-exam-only content, but it must label the purpose honestly.

## 5. Product scope and default decisions

These are defaults for the first build. They are not claims that the user has separately approved every choice.

- **Audience:** CBSE Class 10 students.
- **Subject:** Science only, covering the 13 uploaded chapters and separately approved official reading material where required.
- **Price:** No student paywall for core learning, simulation, approved questions and revision.
- **Platform:** Mobile-first responsive web app first; consider native Android only after the web prototype works.
- **3D style:** lightweight stylised low-poly 3D, clear scientific visuals and readable labels.
- **Camera:** third-person follow camera in the academy; closer/orthographic or schematic camera in lessons where precision matters.
- **Guide:** friendly visible 3D guide called SciBuddy (working name). Its speech/text panel must also work with audio muted.
- **Language:** simple English plus Hindi/Hinglish explanations; technical terms remain visible in English, with simple explanations alongside.
- **Progress:** playable as a guest; save local progress first. Optional login/cloud sync can be added later.
- **Game world:** central academy hub with subject portals, but Science is the only active subject. Other subject worlds must not appear as active features.
- **First full mission:** Chapter 1, Chemical Reactions and Equations.
- **Assets:** generate safe, lightweight procedural geometry first; allow replaceable, legally usable GLB assets later. Do not depend on unavailable remote models or paid assets.

## 6. Experience and screens

### Screen 1 — Welcome / setup

- Title, “Start Learning” and “Continue”.
- Language preference: English / Hindi / Hinglish.
- Audio, captions, reduced-motion and graphics-quality controls.
- Short notice: virtual experiments are simulations; real chemical/electrical experiments require teacher supervision and proper equipment.

### Screen 2 — Central Academy Hub (real 3D scene)

- Walkable ground and bounded academy courtyard.
- Visible student avatar from behind, not just a first-person camera.
- SciBuddy appears in a safe tutorial position and points to interactive objects.
- Thirteen chapter portal/door entries can be shown in a chapter gallery or grouped by theme, but only implemented, reviewed missions are playable. Locked/unbuilt content must say “Coming later”; never fake a completed feature.
- One active portal in the first prototype: “Chapter 1 — Chemical Reactions”.

### Screen 3 — Chapter map

- Chapter title, concept sequence, estimated time, status (Not started / Learning / Review / Mastered).
- Correct assessment tag: Board Exam / Formative / Enrichment / Review required.
- Show prerequisites where relevant.

### Screen 4 — Concept studio

- Left/central area: 3D model or simulation.
- Side panel: short explanation with term definitions and step-by-step captions.
- Controls: Play / Pause / Step / Reset / Show labels / Focus view / Switch language.
- Student can pause at any step. Animation must never move too quickly for reading.

### Screen 5 — Activity / virtual lab

- Goal and prediction first.
- Safe interactive controls for only the relevant variables.
- Observation panel records what changed (for example colour, gas bubbles, ray direction, meter reading, or food-web energy flow).
- Conclusion explains the observed result. Avoid fake precision: show qualitative results where the model is illustrative rather than quantitatively calibrated.

### Screen 6 — Challenge

- Start with guided question, then application question, then a final mixed challenge.
- Some challenges can be integrated into the 3D space (unlock a door, place a part, align a ray, complete a circuit); others should use precise 2D diagrams beside/over the 3D scene if that better supports learning.
- Wrong answer: no shame, no harsh penalty. Explain the misconception and offer a hint or a smaller sub-step.

### Screen 7 — Results and revision

- Concepts understood, questions attempted, hints used, uncertain/wrong topics, and next recommended review.
- XP rewards time spent doing meaningful learning tasks, not random clicks or speed alone.
- A chapter should not be marked “Mastered” merely because a student clicked through it. Require a minimum evidence rule such as a reviewed exit check and a repeat check on weak concepts.

### Screen 8 — Admin Content Studio (private)

- Upload source PDF, view extraction status, inspect extracted text by page, map to official syllabus, generate draft concepts/questions, review evidence and approve/publish.
- Admin-only controls must be enforced by server/database rules, not merely hidden in the UI.
- Student-facing queries return only published content.

## 7. The 3D model system

### 7.1 SciBuddy guide character

- Clearly visible full-body, stylised low-poly 3D guide with friendly neutral design, simple backpack/lab accessory, readable silhouette and no distracting detail.
- Required states: idle, point-to-object, explain/gesture, think, celebrate, and supportive “try again”. These can be simple joint animations; full cinematic motion is not required.
- SciBuddy’s explanation appears as synchronised captions/speech bubbles with a replay button. Audio/TTS is optional and must not be the only way to receive information.
- The character should not cover equation labels, small scientific objects or diagrams. In focus mode it can move aside or shrink to a guide portrait.
- Keep the character asset separate from game rules so a better rigged GLB can replace it later.

### 7.2 World geometry

Use actual Three.js meshes/materials or imported model assets, not a flat image pretending to be 3D.

Core reusable components:

- `HubScene`
- `PlayerAvatar`
- `PlayerController`
- `ThirdPersonCamera`
- `InteractablePortal`
- `SciBuddy`
- `LessonScene`
- `SimulationController`
- `ConceptLabel`
- `HintPanel`
- `QuestionPanel`
- `ResultsPanel`

The 3D hub should include a spawn marker, bounded walkable surfaces, buildings, paths, portals, lighting and a small number of props. Add collision boundaries, safe respawn, and interaction range checks. A player must not walk through walls or into locked/unbuilt scenes.

### 7.3 Three modes of scientific viewing

For each concept where relevant, support:

1. **Visible/world mode:** real-world object or apparatus.
2. **Conceptual model mode:** molecules, electron flow, light paths, organ pathways, magnetic fields, etc.
3. **Scientific diagram mode:** labelled textbook-style schematic, equation, circuit symbol, ray diagram, flow chart or table.

These representations should reinforce one another. A 3D analogy is a model, not literal proof of what an atom or biological process looks like. Label simplified/illustrative models when applicable.

### 7.4 Exact model behaviour requirements

- Every interactive object has a real state and real action.
- Use controlled simulation variables and deterministic results where the science permits.
- Use units and labels for numerical quantities.
- Reset restores the initial state.
- Pause stops time-dependent animation.
- Labels remain legible on phone/tablet screens.
- Respect movement boundaries and provide fallback controls.
- If WebGL is unsupported or fails, offer a clean 2D scientific diagram/simulation fallback rather than a blank screen.
- Keep the page responsive and avoid unnecessary animation when the lesson is paused.

## 8. Chapter-by-chapter educational and 3D blueprint

The following is the planned content map. Use the uploaded NCERT chapter as the primary source for explanation sequence and activity ideas. Match each concept to page/section references during ingestion. Do not bulk-copy long textbook passages; create original clear explanations and short references to the source.

### Chapter 1 — Chemical Reactions and Equations
**NCERT teaching pattern:** familiar changes in food, iron, fermentation, cooking and digestion lead into observations and chemical equations; then balancing and types of reactions; recap/exercises.

**Main concepts:** signs of chemical change; word/skeletal/balanced equation; conservation of atoms during balancing; physical states; combination; decomposition; displacement; double displacement; precipitation; exothermic/endothermic; oxidation/reduction.

**3D space:** “Reaction Lab” with safe virtual bench, labelled flasks, particle models and an equation wall.

**Interactions:** predict the observation; trigger an approved virtual demo; inspect colour/gas/precipitate/energy change; drag atom counters to balance equations; classify reaction cards; toggle energy released/absorbed; complete a final mixed challenge.

**Misconceptions to target:** balancing changes coefficients, not the chemical formula/subscripts; a visible sign alone is evidence to interpret, not an excuse to claim every example has the same mechanism; oxidation/reduction must use the textbook definition appropriate to this chapter.

**Safety:** burning magnesium, reactive substances, heating and gases are virtual-only unless performed in a properly supervised lab. Never give unsupervised instructions to reproduce hazardous reactions at home.

### Chapter 2 — Acids, Bases and Salts
**NCERT teaching pattern:** everyday sour/bitter examples and neutralisation; indicator-based activities; reactions and pH scale; salt preparation/use.

**Main concepts:** indicators; acids/bases in aqueous solution; reactions with metals and carbonates/hydrogencarbonates; neutralisation; H+/H3O+ and OH− ions at this level; pH 0–14; importance of pH; dilution heat/safety; salts; water of crystallisation; everyday salts.

**3D space:** “pH Garden + Ion Lab”. Sample containers have labels; an indicator changes colour; an ion-view shows a simplified explanation of the solution.

**Interactions:** choose indicator; add a virtual sample; observe colour; compare pH; neutralise a virtual acid/base; identify carbon dioxide in a reaction; inspect crystals/water of crystallisation.

**Misconceptions:** never taste substances; colour mapping should be labelled as the chosen indicator model; do not imply the pH number alone tells every chemical property; water-dilution heat needs a visible safety warning.

### Chapter 3 — Metals and Non-metals
**NCERT teaching pattern:** uses of familiar materials introduce physical properties, then activity-driven reactions and the activity series; ionic compound properties, extraction and corrosion follow.

**Main concepts:** lustre, malleability, ductility, conductivity; exceptions; reactions with oxygen, water, acids and salt solutions; reactivity series; electron transfer and ion formation; ionic compound properties; ores/metallurgy/refining; alloys; corrosion and prevention.

**3D space:** “Materials Mine + Reactivity Lab”. A sorting table for properties and reaction chambers containing only safe virtual demonstrations.

**Interactions:** test conductivity/malleability in a simulation; place metal samples into labelled solutions; compare predicted and observed reactivity; visualise transfer of electrons; assemble an ionic lattice; choose a corrosion-prevention strategy.

**Misconceptions:** don’t imply all metals react equally; show that reaction outcomes depend on the metal/reactant; represent electron transfer as a simplified model; never simulate an unsafe reaction as a recommended home activity.

### Chapter 4 — Carbon and its Compounds
**NCERT teaching pattern:** everyday things made of carbon lead into covalent bonding, the variety of carbon structures, functional groups, compound reactions, ethanol/ethanoic acid, and cleaning action of soaps/detergents.

**Main concepts:** covalent bonding; tetravalency; catenation; single/double/triple bonds; straight/branched/ring chains; saturated/unsaturated compounds; homologous series; nomenclature as required by syllabus; functional groups; combustion, oxidation, addition/substitution; ethanol/ethanoic acid properties and uses; soap/detergent action.

**3D space:** “Molecular Builder Studio” with atoms as labelled spheres and bonds as connectors, alongside a clean 2D structural formula.

**Interactions:** construct molecules, rotate the 3D model, compare saturated/unsaturated structures, attach functional groups, predict reaction products using approved rules, and build a soap micelle showing hydrophilic/hydrophobic regions.

**Misconceptions:** use correct valency and formulas; a colourful 3D sphere model is a representation, not a literal atomic scale; don’t allow chemically impossible bonds just because the UI allows dragging.

### Chapter 5 — Life Processes
**NCERT teaching pattern:** asks what distinguishes living things, then explains nutrition, respiration, transportation and excretion using organisms, systems, labelled diagrams, activities and comparisons.

**Main concepts:** living processes; autotrophic and heterotrophic nutrition; photosynthesis and stomata; human digestion and absorption; respiration and ATP; aerobic/anaerobic respiration; circulation/heart/blood/vessels; plant transport through xylem/phloem; kidney/nephron and waste removal; plant waste strategies.

**3D space:** “Life Systems Explorer” with three connected areas: leaf, digestive/circulatory body pathway and excretion pathway.

**Interactions:** route water/CO2/light to a simplified leaf model; trace food through digestive organs; compare gas exchange/energy pathways; move a clearly labelled blood-flow marker through heart and vessels; trace filtration in a simplified nephron; use plant xylem/phloem pathway visualisation.

**Misconceptions:** don’t mix up respiration with breathing; don’t portray ATP as a visible magical fluid; clearly label simplified pathways; biological models need accurate organ labels and direction arrows.

### Chapter 6 — Control and Coordination
**NCERT teaching pattern:** movement and response examples lead to the nervous system, neuron/reflex arc/brain, plant responses and hormone coordination.

**Main concepts:** stimulus/response; neurons and synapse; sensory/relay/motor pathways; reflex and voluntary/involuntary action; brain/spinal cord protection and functions; plant tropic responses; plant hormones; animal hormones and feedback.

**3D space:** “Signal City” — a safe transparent body model plus a plant-light response scene.

**Interactions:** send a signal from receptor to the spinal cord and back to a muscle; compare reflex with a voluntary pathway; rotate/zoom neuron parts; change light direction and observe a plant’s growth response; trace a hormone message to a target tissue.

**Misconceptions:** explain that the 3D neural signal is a simplified educational representation; separate nervous impulses from hormone transport; distinguish immediate movement from growth-based tropic movement.

### Chapter 7 — How do Organisms Reproduce?
**NCERT teaching pattern:** starts with why reproduction occurs, compares copying/variation, demonstrates different modes, and then covers sexual reproduction in plants and humans, puberty and reproductive health.

**Main concepts:** DNA copying and variation; fission, fragmentation, regeneration, budding, vegetative propagation and spore formation; sexual reproduction; flower structures, pollination and fertilisation; human reproductive systems; puberty; contraception/family planning; reproductive health and HIV/AIDS as covered in the textbook/syllabus.

**3D space:** “Life Continuity Gallery” with separate age-appropriate stations: asexual reproduction, flowering plant, and a carefully labelled human biology model.

**Interactions:** arrange the stages of a reproductive process; match reproduction mode to the organism; move pollen from anther to stigma; trace fertilisation in a plant; use a neutral anatomical cutaway to identify scientifically relevant structures; explore reproductive-health choices through accurate, non-judgmental information.

**Safeguards:** keep all models scientific, non-sexualised and age-appropriate; never use jokes, shame or exploitative imagery; answer health questions factually and sensitively; for personal medical concerns, encourage a trusted adult/qualified health professional. Don’t fabricate details beyond the approved source.

### Chapter 8 — Heredity
**NCERT teaching pattern:** variation leads into inherited traits, Mendel’s pea-plant studies, gene copies/dominant/recessive traits, combinations and sex determination.

**Main concepts:** inherited variation; dominant/recessive alleles; Mendel’s crosses; trait combinations; genotype/phenotype as used at this level; sex determination in humans according to the text.

**3D space:** “Inheritance Garden” where pea-plant traits are represented by tokens and a large Punnett-style grid.

**Interactions:** choose parental alleles; drag alleles into offspring cells; count possible outcomes; compare observed/predicted ratios; distinguish a single example from a universal rule.

**Assessment label:** because the CBSE 2026–27 document has a note naming “Heredity and Evolution” among topics not assessed in the year-end exam, keep this in `needs_curriculum_review` until an academic reviewer confirms the exact subtopic boundary, then tag it according to the verified mapping. It can still be taught in Concept Explorer mode.

### Chapter 9 — Light — Reflection and Refraction
**NCERT teaching pattern:** begins with seeing objects/light travel; moves through reflection, mirrors, ray diagrams, sign convention and mirror formula; then refraction, refractive index, slabs, lenses, ray diagrams, formulae and power.

**Main concepts:** rectilinear travel of light; laws of reflection/refraction; spherical mirrors and key points; image nature/position/size; sign convention; mirror formula and magnification; rectangular slab; refractive index; convex/concave lenses; lens formula, magnification and power.

**3D space:** “Optics Workshop” with object, mirror/lens, principal axis, focal points, draggable object distance and animated rays.

**Interactions:** move an object; see rays change; inspect real/virtual image position; toggle a ray diagram; measure u, v and f; calculate and cross-check formula results; trace a ray through a slab.

**Misconceptions:** keep sign convention visible; distinguish a virtual ray extension from a real ray; don’t show physically inconsistent image positions; numerical values must be derived deterministically from the chosen model and formulas.

### Chapter 10 — The Human Eye and the Colourful World
**NCERT teaching pattern:** connects lens ideas to the eye, then explains accommodation and vision defects/correction, prism dispersion, atmospheric refraction and scattering.

**Main concepts:** eye parts and image at retina; accommodation; near point; myopia, hypermetropia, presbyopia and suitable correction; prism; dispersion; atmospheric refraction; scattering of light.

**3D space:** “Vision Lab” with a transparent eye, adjustable lens, retina, corrective lenses and a prism chamber.

**Interactions:** focus near/far objects by changing lens state; see where the image falls relative to retina; add a correcting lens; pass white light through a prism; compare qualitative scattering paths.

**Assessment note:** the 2026–27 syllabus excludes the colour of the Sun at sunrise/sunset from the listed daily-life scattering application. Tag that example accordingly rather than marking the entire scattering concept as excluded.

**Misconceptions:** don’t confuse iris, pupil, lens and retina; model myopia/hypermetropia with the correct focus locations and correction lenses; label scattering as simplified.

### Chapter 11 — Electricity
**NCERT teaching pattern:** asks what electric current is and how circuits work; explains charge/current/potential difference, symbols, Ohm’s law, resistance, series/parallel combinations, heating, power and energy using diagrams, activities and numericals.

**Main concepts:** electric current and conventional current direction; cell/battery and potential difference; circuit symbols; current/voltage/resistance; Ohm’s law; factors affecting resistance; series and parallel combinations; heating effect; power; electrical energy and kWh.

**3D space:** “Interactive Circuit Workshop” with a circuit board, batteries, resistors, switch, bulb, ammeter and voltmeter.

**Interactions:** connect components; open/close a switch; change voltage/resistance; read meters; plot V–I values; compare series and parallel circuits; change wire length/area/material in a simplified model; estimate bulb power/energy and household usage.

**Misconceptions:** conventional current direction differs from electron drift direction; current is not “used up” at a bulb; use consistent units; show idealised circuit laws and clearly identify model assumptions. All circuitry is virtual—never ask the learner to touch mains electricity.

### Chapter 12 — Magnetic Effects of Electric Current
**NCERT teaching pattern:** begins from the magnetic effect of current, uses compass/iron filings and diagrams, proceeds through field patterns around wires/coils/solenoids, force on a conductor, and domestic-circuit safety.

**Main concepts:** magnetic field and field lines; compass response; straight conductor and circular field lines; coil/solenoid and electromagnet; force on a current-carrying conductor; Fleming’s left-hand rule; AC/DC and domestic circuits/fuse/earthing at the level present in the syllabus.

**3D space:** “Magnetic Field Observatory” with a conductor, coil, solenoid, compass arrows and a switchable field visualisation.

**Interactions:** turn current on/off; rotate the conductor; move a compass; reverse current; change coil turns; compare field patterns; apply the left-hand rule using labelled direction vectors; identify household wiring safety features.

**Curriculum warning:** motor, electromagnetic induction and generator are explicitly named as formative topics. The official note’s broader phrase about “Electric Effects of Electric Current” is potentially ambiguous when read beside the unit content; keep affected exam tags under academic review instead of inventing an interpretation.

### Chapter 13 — Our Environment
**NCERT teaching pattern:** begins with familiar use of “environment”, then introduces ecosystem components, food chains/webs, energy transfer, ozone, waste types and human impact.

**Main concepts:** ecosystem and interdependence; producers/consumers/decomposers as covered; food chain/web; trophic levels and energy loss; ozone layer and depletion; biodegradable/non-biodegradable waste; waste disposal and human impact.

**3D space:** “Ecosystem Explorer” with an interactive habitat and a visible food web.

**Interactions:** place organisms in the correct role; connect feeding relationships; see energy flow decrease through trophic levels; test how removing one organism affects the food web; sort example waste and observe long-term qualitative consequences; explore ozone protection using a labelled atmosphere model.

**Misconceptions:** don’t present an ecosystem as a simple one-way chain in every case; show that food webs have interconnected paths; label visual energy units as illustrative unless the simulation is quantitatively calibrated.

### Extra official reading material

Create optional/portfolio missions for Periodic Classification and Evolution only after the official CBSE 2026–27 Reading Material PDF has been added, extracted and reviewed as a separate source. Do not fabricate these chapters from the uploaded textbook’s table of contents.

## 9. First playable vertical slice: Chapter 1

The first chapter must be complete from entry to recap; a polished but non-functional science hub is not enough.

### Mission 1 — What counts as a chemical change?

- SciBuddy presents a brief everyday scenario drawn from the chapter’s opening approach.
- Student predicts whether a chemical change may have occurred and selects an observable clue.
- Virtual observation shows only supported outcomes (for example a colour change, gas, temperature/energy indicator, precipitate, or new substance representation where appropriate).
- Student records the observation and receives an explanation.

### Mission 2 — Balance the reaction

- Show reactants and products with a clear equation.
- A 3D particle model uses colour-coded atoms, paired with the actual chemical symbols.
- Student changes **coefficients** to make atom counts equal on both sides.
- The game must prevent changing chemical subscripts as a shortcut.
- An atom-counter panel lists element counts on each side and highlights mismatches.

### Mission 3 — Reaction-type challenge

- Match approved example reactions to combination, decomposition, displacement, double displacement/precipitation, and oxidation/reduction categories according to the source.
- Add a simple energy indicator for exothermic/endothermic examples only where the chosen example supports that classification.
- Do not invent unverified equations or answer keys. Store the correct classification in the approved content record.

### Chapter completion

- 3–5 mixed questions (selected from approved content).
- One explain-your-reasoning prompt with a structured rubric or approved expected points.
- Summary of the key ideas, sources used and concepts needing another look.
- Award XP for activity completion and evidence of understanding; no punitive streak loss.

## 10. Hybrid NCERT source pipeline

### Pipeline states

`uploaded → file_validated → text_extracted → page_review_needed (if applicable) → syllabus_mapped → content_drafted → academic_review → approved → published`

A failed or ambiguous state must remain visible; never silently jump to `approved`.

### Admin upload and extraction requirements

- Accept PDF only with size limits, MIME/signature validation and safe file naming.
- Compute SHA-256 to detect duplicate versions.
- Store originals in private, access-controlled file storage; never expose a public unauthenticated PDF URL by default.
- Record source title, publisher, edition/session if verified, source URL where available, upload time, page count, hash and uploader.
- Extract text with **PDF page index and printed book page number separately**; these may differ in split chapter PDFs.
- Preserve headings, figure captions, equations, tables, activity panels and page relationships as much as possible.
- If a PDF page is scanned/image-only or the equation/table extraction is unreliable, mark it for visual/OCR review. Do not pretend extraction succeeded.
- A new source version invalidates or flags dependent mappings for review; never silently overwrite published concepts.

### Suggested Firestore collections

- `academicSessions`
- `syllabusSources`
- `syllabusUnits`
- `sourceDocuments`
- `sourcePages`
- `extractedSections`
- `concepts`
- `activities`
- `simulations`
- `questions`
- `reviewTasks`
- `publishedContent`
- `contentAuditLog`
- `studentProfiles` (if accounts are enabled)
- `studyProgress`
- `questionAttempts`
- `wrongAnswerReviews`

Keep academic content separate from student progress. Use stable IDs and versions. Student-facing queries must fetch only published records matching the selected academic session and chapter.

### Minimum fields

**sourceDocuments:** `sourceDocumentId`, `title`, `publisher`, `editionLabel`, `academicSession`, `originUrl`, `storagePath`, `sha256`, `pageCount`, `extractionStatus`, `uploadedBy`, timestamps.

**concepts:** `conceptId`, `subjectId`, `chapterId`, `title`, `learningObjectives`, `simpleEnglish`, `hindi`, `hinglish`, `prerequisiteIds`, `commonMisconceptions`, `sourceRefs`, `assessmentStatus`, `syllabusMappingStatus`, `verificationStatus`, `contentVersion`.

**activities:** `activityId`, `conceptId`, `goal`, `predictionPrompt`, `steps`, `variables`, `expectedObservations`, `conclusion`, `safetyLevel`, `virtualOnly`, `sourceRefs`, review status.

**simulations:** `simulationId`, `conceptId`, `sceneComponent`, `initialState`, `controllableVariables`, `allowedRanges`, `stateTransitions`, `equationsOrRules`, `visualLabels`, `knownSimplifications`, `resetBehaviour`, `sourceRefs`, test status.

**questions:** `questionId`, `conceptIds`, `questionType`, `stem`, `options`, `correctAnswer`, `workedExplanation`, `hint`, `marks`, `difficulty`, `assessmentStatus`, `sourceRefs`, `answerVerifiedBy`, review status and version.

**sourceRefs:** source document ID, chapter identifier, PDF page index, printed page number when known, section heading and optional short quoted fragment needed for review.

### Review rules

- AI may suggest a chapter/topic mapping but cannot approve it.
- A missing syllabus match does not automatically mean “out of syllabus”.
- Model confidence is a prioritisation signal, not evidence of correctness.
- A question cannot be published without a reviewed correct answer and explanation.
- All current-session exam tags need a source reference and reviewer decision.
- Any ambiguous official syllabus instruction becomes `needs_curriculum_review`.
- Keep an audit trail of who approved what, when, with which source/version.

## 11. AI Study Buddy rules

- Gemini calls run on the server. Never expose API keys in browser code.
- The tutor retrieves only relevant approved concepts for the active chapter and selected language.
- The tutor follows a fixed teaching template: (1) direct simple explanation, (2) everyday example, (3) step-by-step visual/model cue, (4) one misconception to avoid, (5) one short check question.
- It may explain a verified concept and give hints. It must not make up an “official NCERT answer” when no approved source answer exists.
- Supplemental AI questions must be labelled AI-generated, validated, and must not enter board-exam scoring until reviewed.
- If approved content is not available, say “This topic is pending academic review” rather than inventing a lesson.
- Never guarantee what will appear in the board exam.
- Cache repeated explanations, rate-limit requests, and do not call the model from every animation frame, player movement or ordinary UI render.
- Static reviewed explanation and quiz functions must still work if the Gemini service is unavailable.

## 12. Technical architecture

Use the existing project stack if there is a functioning project already. If starting fresh, preferred web stack:

- React + TypeScript
- Three.js, preferably React Three Fiber and Drei where compatible
- Firebase Authentication (optional guest-first path), Firestore and private file storage, if configured
- Server-side Node.js functions/routes for Gemini calls and privileged admin actions
- Runtime schema validation (for example Zod) for every generated or imported JSON object

Keep the architecture modular:

- `src/game/` — scene setup, player, camera, collisions, portals and game state
- `src/scenes/` — hub, chapter lab and mission scenes
- `src/simulations/` — one module per scientific simulation
- `src/content/` — schemas, types, lesson access and fallback demo content
- `src/admin/` — private PDF ingestion and review UI
- `src/server/` — secure AI/content-processing routes
- `src/services/` — database, storage, source retrieval, caching
- `src/accessibility/` — captions, language selection, reduced motion

Do not create every chapter’s full 3D level in one massive change. Build the reusable hub and first complete chapter, test, then add content through data and modular scene components.

## 13. Security, student privacy and free-to-use requirement

- Core learning and approved simulations have no paywall.
- Do not require a student account just to test the game.
- If account/cloud sync is added, collect the minimum data needed and make progress private to the student.
- Admin upload, review and publish privileges are enforced at the server/database layer. A client field such as `role: admin` is not sufficient.
- The student client can read published academic content and only its own progress.
- No public listing of uploaded textbooks or private source documents.
- Keep source attribution and respect rights in source PDFs. Prefer original explanations, concise references and original question wording over reproducing large stretches of textbook text.
- The app should run with AI features temporarily disabled. If AI service quota is exhausted, show a clear message and continue offering static reviewed lessons.

## 14. Accessibility and mobile performance

- Touch targets are large enough for a phone/tablet.
- On-screen movement joystick and a visible interact button; desktop keyboard support where practical.
- Captions/text always accompany voice or animation.
- Pause, replay, reset and reduced-motion controls.
- High-contrast labels and readable equation/diagram text.
- Quality setting: Low / Balanced. Disable expensive shadows and particle effects at low quality.
- Lazy-load chapter scenes and models; dispose of unused geometries/materials and event listeners when leaving a scene.
- Provide a WebGL error fallback and a simplified diagram mode.
- Avoid large remote assets and unnecessary downloads; show progress while a scene loads.

## 15. Implementation phases and copy-paste prompts

**Important:** use these prompts in separate Build-mode turns. Do not paste them all as one instruction. After each phase, review the report and preview before proceeding.

### Prompt 0 — Audit only (no changes)

```text
Before changing any code, inspect the existing StudyVerse 10 project and report its architecture, current working features, files, dependencies, build/type-check status, storage/database configuration and blockers. Treat the attached StudyVerse 10 Science Blueprint as the source of truth. Do not edit/delete files or build a new app yet. Do not claim anything was tested unless you ran the check. Wait for approval before implementation.
```

### Prompt 1 — Establish schemas and source of truth

```text
Implement only the academic content schema and safe database foundation described in the StudyVerse 10 Science Blueprint. Preserve all existing working features. If Firebase is already configured, reuse it; otherwise ask for the supported Firebase integration/setup step and do not fabricate credentials. Create versioned schemas for source documents, syllabus sources/units, extracted sections/pages, concepts, activities, simulations, questions, review tasks, published content and audit logs. Keep student progress separate. Add assessmentStatus and verificationStatus exactly as defined in the blueprint. Draft content must never be returned to student queries. Add strict security rules and server-side role checks; never trust a client-supplied admin flag. Do not upload or generate textbook content yet. Run available checks and report actual results, changed files, issues and unresolved setup requirements.
```

### Prompt 2 — Admin-only PDF ingestion

```text
Implement the private admin-only PDF upload and extraction pipeline in the blueprint. Validate file type/signature and size, compute SHA-256, detect duplicates, store originals privately, and extract text with PDF page index, printed page number where available, headings, equations, tables and figure captions. Keep uploaded files as drafts; do not publish anything. If a page is scanned or text extraction is poor, mark it for review/OCR rather than silently accepting it. Store extraction status and errors. Add progress and retry-safe batch processing. Test one valid PDF, one malformed PDF and one duplicate; test a scanned/image-heavy page if a fixture is available. Report exact files and actual test results.
```

### Prompt 3 — Official syllabus registry and mapping

```text
Implement the versioned official-syllabus registry and syllabus mapping workflow from the blueprint. Seed or import only the officially sourced CBSE Class X Science 2026-27 content after checking source URLs and text. Store unit marks, included topics, formative-only content, explicit exclusions, source wording and review date. The uploaded NCERT book is not the only syllabus authority. Create statuses annual_exam_core, formative_portfolio, enrichment_box, excluded_from_specified_assessment, needs_curriculum_review and not_mapped. Do not interpret a missing match as out of syllabus. Flag the official 2026-27 note’s ambiguous wording about 'Electric Effects of Electric Current' for human academic review. Never auto-approve AI mappings. Add tests for a matched, formative-only, excluded and ambiguous topic.
```

### Prompt 4 — Extract structured learning drafts

```text
Create a server-side, schema-constrained Gemini transformation pipeline that converts extracted source sections into draft concepts, activities, simulation specifications and questions. Keep exact source-page references. Use runtime validation, stable IDs, deduplication, bounded batches and safe retries. Preserve equations/units carefully. Each draft must contain English, Hindi and Hinglish explanations where appropriate, learning objectives, misconceptions, sourceRefs, assessmentStatus and contentVersion. Model-created practice must be labelled AI-generated, not quoted as NCERT. Do not publish. Reject missing/unsupported source references and malformed answers. Run schema/content tests and report actual results.
```

### Prompt 5 — Admin review and controlled publishing

```text
Implement the content review queue described in the blueprint. Show extracted source content beside each concept, activity, simulation and question. Let an authorized reviewer edit, approve, reject or request reprocessing. Require a reviewed answer key, source verification, syllabus mapping, assessment tag, version and reviewer audit record. Enforce checks server-side. Publish only approved content. A new source version should flag dependent content for review. Test that students cannot read drafts and non-admin users cannot approve/publish. Do not claim security passed without running a meaningful rule/authorization test.
```

### Prompt 6 — Build the actual 3D academy and movement

```text
Build the mobile-first StudyVerse 10 3D foundation from the blueprint. Use the existing compatible stack; otherwise React, TypeScript, Three.js and React Three Fiber/Drei where appropriate. Create a real walkable low-poly academy scene with bounded ground, a visible student avatar, a friendly SciBuddy guide character, third-person follow camera, collision boundaries, working touch joystick/interact controls and desktop controls. Use actual 3D meshes/materials or bundled legally usable assets; do not use a flat image as a fake 3D world. Keep the character and scene logic modular. Add safe spawn/respawn, pause, reset, loading errors and WebGL fallback. Only the Chapter 1 portal should be active. Other chapters should display as locked/unbuilt, not simulate completion. Do not implement all chapters in this phase. Test movement, camera, collisions, touch controls, portal range and return to hub. Report actual results and limitations.
```

### Prompt 7 — Complete Chapter 1 mission

```text
Build a complete playable Chapter 1 mission using only reviewed/published content records or clearly labelled temporary demo content pending review. Follow the source’s learning progression: everyday-life hook, prediction, observation/activity, explanation, model, guided practice, application and recap. Create a real 3D Reaction Lab with labelled containers/bench, colour-coded atom spheres, molecule arrangements, a reaction equation panel and an atom-count panel. Implement balancing by changing coefficients only, reaction-type sorting, and a simple supported exothermic/endothermic indicator. Use deterministic answer checking from stored approved question data. All hazardous chemistry is virtual-only; never instruct unsupervised at-home chemical experiments. Add English/Hindi/Hinglish explanation panels, SciBuddy gestures/captions, reset/pause/replay, results and wrong-answer review. Do not add inaccurate or unsupported reactions. Run checks and report what was actually tested.
```

### Prompt 8 — Grounded AI Study Buddy

```text
Integrate the server-side Gemini Study Buddy only after the approved content retrieval path works. Retrieve approved concepts for the active chapter and selected language. Use the fixed teaching template: simple explanation, real-life example, model/visual cue, one misconception, and one check question. The tutor may explain or hint using approved content; it must say when source content is unavailable. Do not call Gemini from game movement/render loops. Never expose API keys. Cache common outputs and rate-limit calls. If the AI service is unavailable or over quota, static lessons and approved questions must keep working. Label supplemental generated questions and do not use them for exam scoring unless reviewed. Test grounded answers, unknown-topic fallback, language selection, server-side key protection and quota/error state.
```

### Prompt 9 — Expand chapters using the shared engine

```text
Use the same lesson, simulation, review and content pipeline to add the next chapter only after Chapter 1 acceptance tests pass. Do not clone the entire app per chapter. Add one modular simulation at a time according to the chapter map in the blueprint, with sourceRefs and assessmentStatus. Use a chapter-specific test plan for each new model. Do not generate missing chapter content from general knowledge if the official source is not ingested and reviewed. Preserve game performance and existing missions. Stop and report blockers before starting another chapter.
```

### Prompt 10 — release audit

```text
Before release, audit StudyVerse 10 against the entire blueprint. Report files changed, features implemented versus scaffolded, commands/tests actually executed, test results, known issues, security-rule tests, curriculum/source mappings, mobile/low-quality performance, WebGL fallback, and unresolved dependencies. Test that only approved content is shown, source references open correctly, wrong answers provide accurate feedback, progress persists, and the game remains usable without live AI. Fix only verified regressions introduced by the current phase. Do not remove unrelated working features. Do not state “complete” for any untested or unimplemented capability. Stop and identify any blocker requiring user action.
```

## 16. Acceptance checklist — a phase is not complete until it passes

### Academic correctness

- [ ] Every published concept has a source page/section reference.
- [ ] Every published question has a checked correct answer and explanation.
- [ ] The academic session and official syllabus version are explicit.
- [ ] Formative/enrichment/excluded topics are not mislabeled as annual-exam core.
- [ ] The ambiguous syllabus note has a recorded human review decision.
- [ ] No question is advertised as guaranteed to appear in the board exam.

### Teaching effectiveness

- [ ] Lesson starts with a clear question/scenario.
- [ ] Student makes a prediction or choice before seeing the explanation.
- [ ] Learner can manipulate a concept-relevant variable or complete an activity.
- [ ] The observed result and scientific explanation agree.
- [ ] SciBuddy captions and language controls work.
- [ ] Wrong answers trigger helpful feedback and a review record.
- [ ] Exit check tests concept understanding, not clicks alone.

### Real 3D functionality

- [ ] Character is actually visible and controllable.
- [ ] Camera follows the character and can be adjusted as specified.
- [ ] Collisions prevent walking through walls/objects.
- [ ] Portal only activates in interaction range and transitions to a real scene.
- [ ] Interactive simulation state changes visibly and deterministically.
- [ ] Reset/pause works; leaving a scene cleans up resources.
- [ ] 3D objects are real geometry or actual loaded 3D assets, not just a background image.
- [ ] WebGL failure has a useful fallback.

### Data/security/performance

- [ ] Original PDFs are private.
- [ ] Drafts are not available to students.
- [ ] Non-admins cannot upload/approve/publish via direct requests.
- [ ] Students cannot read other students’ progress.
- [ ] No Gemini API key is included in the client bundle.
- [ ] Core reviewed lessons run without a live Gemini request.
- [ ] Low graphics setting, touch targets and small-screen labels are usable.
- [ ] Build/type checks and relevant tests have been run; results are recorded honestly.

## 17. The first action in Google AI Studio

1. Open Build mode: https://aistudio.google.com/
2. Attach or provide this blueprint in the project context.
3. Paste **Prompt 0 — Audit only**.
4. Review the audit report before any code is changed.
5. Proceed one phase at a time and use the release audit prompt after every substantial phase.

The blueprint is the project’s source of truth. When a detail is unknown, the build agent must ask or flag it for review; it must not silently invent academic content, functionality, asset availability or test results.
