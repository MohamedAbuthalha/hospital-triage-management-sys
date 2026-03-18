/**
 * MEDICAL KNOWLEDGE BASE
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the single source of truth for symptom → specialization mapping.
 *
 * HOW TO EXTEND:
 *   1. Add a new entry to SPECIALIZATION_RULES with a unique key.
 *   2. Populate its `symptoms`, `keywords`, and `contextClues` arrays.
 *   3. Done — no other file needs changing.
 *
 * FUTURE AI / NLP PLUG-IN POINT:
 *   The analyzeWithAI() hook in specializationEngine.js will bypass this file
 *   when an external model is wired in, so this file remains as the fallback.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Each rule entry:
 * {
 *   specialization : string   – must match Doctor.specialization (lowercase)
 *   weight         : number   – base score added when any term hits (1-10)
 *   symptoms       : string[] – exact / partial symptom phrases
 *   keywords       : string[] – free-text keywords found in description
 *   contextClues   : {        – age / gender modifiers
 *     minAge?, maxAge?, gender?, bonusWeight?
 *   }[]
 * }
 */
const SPECIALIZATION_RULES = [
  // ─── Cardiology ───────────────────────────────────────────────────────────
  {
    specialization: "cardiology",
    weight: 9,
    symptoms: [
      "chest pain",
      "chest tightness",
      "chest pressure",
      "palpitations",
      "heart pounding",
      "irregular heartbeat",
      "racing heart",
      "shortness of breath",
      "pain radiating to arm",
      "jaw pain",
      "left arm pain",
    ],
    keywords: [
      "heart attack",
      "cardiac arrest",
      "myocardial",
      "angina",
      "arrhythmia",
      "atrial fibrillation",
      "heart failure",
      "coronary",
      "tachycardia",
      "bradycardia",
      "ecg",
      "ekg",
    ],
    contextClues: [
      { minAge: 40, bonusWeight: 2 },
      { gender: "male", minAge: 35, bonusWeight: 1 },
    ],
  },

  // ─── Neurology ────────────────────────────────────────────────────────────
  {
    specialization: "neurology",
    weight: 9,
    symptoms: [
      "seizure",
      "convulsions",
      "stroke",
      "facial drooping",
      "sudden numbness",
      "arm weakness",
      "slurred speech",
      "loss of balance",
      "severe headache",
      "worst headache of life",
      "sudden confusion",
      "memory loss",
      "tremors",
      "paralysis",
      "vision loss",
    ],
    keywords: [
      "epilepsy",
      "migraine",
      "multiple sclerosis",
      "parkinson",
      "dementia",
      "alzheimer",
      "neuropathy",
      "brain",
      "tia",
      "transient ischemic",
      "cerebral",
      "meningitis",
    ],
    contextClues: [],
  },

  // ─── Pulmonology ──────────────────────────────────────────────────────────
  {
    specialization: "pulmonology",
    weight: 8,
    symptoms: [
      "difficulty breathing",
      "shortness of breath",
      "wheezing",
      "coughing blood",
      "chronic cough",
      "persistent cough",
      "coughing up blood",
      "breathlessness",
      "rapid breathing",
      "labored breathing",
    ],
    keywords: [
      "asthma",
      "copd",
      "pneumonia",
      "bronchitis",
      "tuberculosis",
      "emphysema",
      "pulmonary",
      "lung",
      "respiratory",
      "inhaler",
      "oxygen saturation",
      "pleural",
      "pleural effusion",
    ],
    contextClues: [{ minAge: 50, bonusWeight: 1 }],
  },

  // ─── Orthopedics ──────────────────────────────────────────────────────────
  {
    specialization: "orthopedics",
    weight: 7,
    symptoms: [
      "fracture",
      "broken bone",
      "joint pain",
      "knee pain",
      "back pain",
      "neck pain",
      "shoulder pain",
      "hip pain",
      "spine pain",
      "limping",
      "swollen joint",
      "cannot walk",
      "deformity",
      "bone pain",
    ],
    keywords: [
      "sprain",
      "strain",
      "dislocation",
      "arthritis",
      "osteoporosis",
      "tendon",
      "ligament",
      "cartilage",
      "scoliosis",
      "herniated disc",
      "sciatica",
      "cast",
      "orthopedic",
    ],
    contextClues: [
      { minAge: 60, bonusWeight: 2 },
      { minAge: 15, maxAge: 30, bonusWeight: 1 }, // sports injuries
    ],
  },

  // ─── Gastroenterology ─────────────────────────────────────────────────────
  {
    specialization: "gastroenterology",
    weight: 7,
    symptoms: [
      "abdominal pain",
      "stomach pain",
      "nausea",
      "vomiting",
      "diarrhea",
      "constipation",
      "blood in stool",
      "rectal bleeding",
      "bloating",
      "heartburn",
      "acid reflux",
      "indigestion",
      "difficulty swallowing",
      "jaundice",
    ],
    keywords: [
      "crohn",
      "colitis",
      "ibs",
      "ulcer",
      "gastritis",
      "hepatitis",
      "cirrhosis",
      "pancreatitis",
      "appendicitis",
      "gallstones",
      "colon",
      "bowel",
      "liver",
      "stomach",
      "intestinal",
    ],
    contextClues: [],
  },

  // ─── Endocrinology ────────────────────────────────────────────────────────
  {
    specialization: "endocrinology",
    weight: 6,
    symptoms: [
      "excessive thirst",
      "frequent urination",
      "unexplained weight loss",
      "unexplained weight gain",
      "chronic fatigue",
      "persistent fatigue",
      "hair loss",
      "cold intolerance",
      "heat intolerance",
      "excessive sweating",
      "trembling",
      "blurred vision",
    ],
    keywords: [
      "diabetes",
      "thyroid",
      "hyperthyroidism",
      "hypothyroidism",
      "insulin",
      "glucose",
      "blood sugar",
      "adrenal",
      "hormone",
      "metabolic",
      "obesity",
      "pituitary",
    ],
    contextClues: [{ minAge: 30, bonusWeight: 1 }],
  },

  // ─── Psychiatry ───────────────────────────────────────────────────────────
  {
    specialization: "psychiatry",
    weight: 6,
    symptoms: [
      "depression",
      "anxiety",
      "panic attack",
      "suicidal thoughts",
      "hallucinations",
      "paranoia",
      "mood swings",
      "insomnia",
      "eating disorder",
      "self harm",
    ],
    keywords: [
      "mental health",
      "bipolar",
      "schizophrenia",
      "ptsd",
      "ocd",
      "phobia",
      "psychosis",
      "mania",
      "depressive",
      "anxious",
      "psychiatric",
    ],
    contextClues: [],
  },

  // ─── Dermatology ──────────────────────────────────────────────────────────
  {
    specialization: "dermatology",
    weight: 5,
    symptoms: [
      "rash",
      "hives",
      "itching",
      "skin lesion",
      "acne",
      "eczema",
      "psoriasis",
      "blisters",
      "discoloration",
      "mole change",
      "nail problem",
      "hair thinning",
    ],
    keywords: [
      "dermatitis",
      "urticaria",
      "fungal infection",
      "cellulitis",
      "melanoma",
      "skin cancer",
      "rosacea",
      "vitiligo",
      "alopecia",
    ],
    contextClues: [],
  },

  // ─── Ophthalmology ────────────────────────────────────────────────────────
  {
    specialization: "ophthalmology",
    weight: 7,
    symptoms: [
      "eye pain",
      "red eye",
      "blurred vision",
      "double vision",
      "vision loss",
      "eye discharge",
      "light sensitivity",
      "floaters",
      "halos around lights",
      "eye swelling",
    ],
    keywords: [
      "conjunctivitis",
      "glaucoma",
      "cataract",
      "retinal",
      "corneal",
      "stye",
      "uveitis",
      "macular",
      "optic",
    ],
    contextClues: [{ minAge: 50, bonusWeight: 2 }],
  },

  // ─── ENT (Otolaryngology) ─────────────────────────────────────────────────
  {
    specialization: "ent",
    weight: 5,
    symptoms: [
      "ear pain",
      "hearing loss",
      "tinnitus",
      "ringing in ear",
      "nasal congestion",
      "chronic nasal congestion",
      "sore throat",
      "hoarseness",
      "difficulty swallowing",
      "sinus pain",
      "sinus pressure",
      "nosebleed",
      "loss of smell",
      "loss of taste",
      "dizziness",
      "vertigo",
      "throat pain",
    ],
    keywords: [
      "sinusitis",
      "tonsillitis",
      "otitis",
      "ear infection",
      "laryngitis",
      "pharyngitis",
      "epistaxis",
      "deviated septum",
      "snoring",
      "sleep apnea",
    ],
    contextClues: [],
  },

  // ─── Urology ──────────────────────────────────────────────────────────────
  {
    specialization: "urology",
    weight: 7,
    symptoms: [
      "painful urination",
      "burning urination",
      "blood in urine",
      "frequent urination",
      "difficulty urinating",
      "urinary incontinence",
      "lower back pain",
      "flank pain",
      "pelvic pain",
      "kidney pain",
      "testicular pain",
    ],
    keywords: [
      "uti",
      "urinary tract infection",
      "kidney stone",
      "bladder",
      "prostate",
      "nephrolithiasis",
      "cystitis",
      "urethritis",
      "renal",
      "incontinence",
    ],
    contextClues: [
      { gender: "male", minAge: 50, bonusWeight: 2 }, // prostate issues
    ],
  },

  // ─── Gynecology ───────────────────────────────────────────────────────────
  {
    specialization: "gynecology",
    weight: 8,
    symptoms: [
      "vaginal discharge",
      "irregular periods",
      "missed period",
      "pelvic pain",
      "heavy bleeding",
      "painful periods",
      "breast lump",
      "breast pain",
      "pregnancy symptoms",
    ],
    keywords: [
      "menstrual",
      "ovarian",
      "uterine",
      "cervical",
      "endometriosis",
      "fibroids",
      "pcos",
      "pregnancy",
      "prenatal",
      "gynecologic",
      "menopause",
      "contraception",
    ],
    contextClues: [{ gender: "female", bonusWeight: 3 }],
  },

  // ─── Pediatrics ───────────────────────────────────────────────────────────
  {
    specialization: "pediatrics",
    weight: 9,
    symptoms: [
      "child fever",
      "infant crying",
      "growth problem",
      "vaccination",
      "colic",
      "teething",
    ],
    keywords: [
      "child",
      "infant",
      "newborn",
      "toddler",
      "pediatric",
      "developmental delay",
      "vaccination",
    ],
    contextClues: [
      { maxAge: 16, bonusWeight: 15 }, // strong age-based override
    ],
  },

  // ─── Hematology ───────────────────────────────────────────────────────────
  {
    specialization: "hematology",
    weight: 7,
    symptoms: [
      "easy bruising",
      "prolonged bleeding",
      "unexplained bruising",
      "pale skin",
      "swollen lymph nodes",
      "night sweats",
      "bone pain",
    ],
    keywords: [
      "anemia",
      "leukemia",
      "lymphoma",
      "blood disorder",
      "hemophilia",
      "thrombosis",
      "platelet",
      "coagulation",
      "sickle cell",
    ],
    contextClues: [],
  },

  // ─── Oncology ─────────────────────────────────────────────────────────────
  {
    specialization: "oncology",
    weight: 8,
    symptoms: [
      "unexplained weight loss",
      "lump",
      "mass",
      "persistent fatigue",
      "night sweats",
      "blood in sputum",
    ],
    keywords: [
      "cancer",
      "tumor",
      "malignant",
      "chemotherapy",
      "radiation",
      "biopsy",
      "metastasis",
      "carcinoma",
      "lymphoma",
      "oncology",
    ],
    contextClues: [{ minAge: 40, bonusWeight: 1 }],
  },

  // ─── General Practice / Internal Medicine (catch-all) ─────────────────────
  {
    specialization: "general",
    weight: 1,
    symptoms: [
      "fever",
      "cold",
      "cough",
      "runny nose",
      "body aches",
      "weakness",
      "tiredness",
      "loss of appetite",
      "mild headache",
    ],
    keywords: [
      "flu",
      "cold",
      "viral",
      "infection",
      "general checkup",
      "routine",
      "wellness",
    ],
    contextClues: [],
  },
];

/**
 * Severity classification keywords (order = priority).
 * Used to determine case urgency independently of specialization.
 */
const SEVERITY_RULES = {
  critical: [
    "chest pain",
    "cardiac arrest",
    "heart attack",
    "not breathing",
    "stopped breathing",
    "severe bleeding",
    "unresponsive",
    "unconscious",
    "seizure",
    "stroke",
    "anaphylaxis",
    "anaphylactic shock",
    "severe allergic reaction",
    "overdose",
    "suicide attempt",
    "coughing blood",
    "blood in sputum",
    "severe head injury",
    "spinal injury",
  ],
  high: [
    "high fever",
    "fever above 39",
    "difficulty breathing",
    "shortness of breath",
    "fracture",
    "broken bone",
    "head injury",
    "persistent vomiting",
    "blood in urine",
    "blood in stool",
    "severe abdominal pain",
    "suicidal thoughts",
    "loss of consciousness",
    "sudden vision loss",
    "sudden numbness",
    "slurred speech",
    "heavy bleeding",
    "heavy vaginal bleeding",
  ],
  medium: [
    "moderate pain",
    "infection",
    "dizziness",
    "nausea",
    "vomiting",
    "rash",
    "mild fever",
    "ear pain",
    "eye pain",
    "joint pain",
    "back pain",
  ],
};

module.exports = { SPECIALIZATION_RULES, SEVERITY_RULES };
