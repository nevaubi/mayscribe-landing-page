// Curated clinical reference tables for the demo dictation verifier +
// Quick Lookup fallback. All static, no PHI, no network.

export interface Condition {
  name: string;
  icd10?: string;
  aliases?: string[];
  system:
    | "cardio"
    | "pulm"
    | "gi"
    | "endo"
    | "renal"
    | "neuro"
    | "psych"
    | "id"
    | "heme"
    | "msk"
    | "derm"
    | "onc"
    | "obgyn"
    | "ent"
    | "eye"
    | "other";
}

export const CONDITIONS: Condition[] = [
  // Cardiovascular
  { name: "Essential hypertension", icd10: "I10", aliases: ["HTN"], system: "cardio" },
  { name: "Heart failure, unspecified", icd10: "I50.9", aliases: ["CHF"], system: "cardio" },
  { name: "Heart failure with reduced ejection fraction", icd10: "I50.20", aliases: ["HFrEF"], system: "cardio" },
  { name: "Heart failure with preserved ejection fraction", icd10: "I50.30", aliases: ["HFpEF"], system: "cardio" },
  { name: "Acute decompensated heart failure", icd10: "I50.21", aliases: ["ADHF"], system: "cardio" },
  { name: "Atrial fibrillation", icd10: "I48.91", aliases: ["afib", "AF"], system: "cardio" },
  { name: "Atrial flutter", icd10: "I48.92", system: "cardio" },
  { name: "Coronary artery disease", icd10: "I25.10", aliases: ["CAD"], system: "cardio" },
  { name: "STEMI", icd10: "I21.3", aliases: ["ST-elevation MI"], system: "cardio" },
  { name: "NSTEMI", icd10: "I21.4", aliases: ["non-ST elevation MI"], system: "cardio" },
  { name: "Unstable angina", icd10: "I20.0", system: "cardio" },
  { name: "Cardiogenic shock", icd10: "R57.0", system: "cardio" },
  { name: "Mitral regurgitation", icd10: "I34.0", aliases: ["MR"], system: "cardio" },
  { name: "Aortic stenosis", icd10: "I35.0", aliases: ["AS"], system: "cardio" },
  { name: "Aortic regurgitation", icd10: "I35.1", aliases: ["AR"], system: "cardio" },
  { name: "Deep vein thrombosis", icd10: "I82.40", aliases: ["DVT"], system: "cardio" },
  { name: "Pulmonary embolism", icd10: "I26.99", aliases: ["PE"], system: "cardio" },
  { name: "Peripheral arterial disease", icd10: "I73.9", aliases: ["PAD"], system: "cardio" },
  { name: "Hyperlipidemia", icd10: "E78.5", aliases: ["HLD"], system: "cardio" },
  { name: "Ventricular tachycardia", icd10: "I47.2", aliases: ["VT"], system: "cardio" },
  { name: "Ventricular fibrillation", icd10: "I49.01", aliases: ["VF"], system: "cardio" },
  { name: "Cardiac arrest", icd10: "I46.9", system: "cardio" },
  { name: "Pericarditis", icd10: "I31.9", system: "cardio" },
  { name: "Endocarditis", icd10: "I33.0", system: "cardio" },
  { name: "Cardiomyopathy", icd10: "I42.9", system: "cardio" },

  // Pulmonary
  { name: "Chronic obstructive pulmonary disease", icd10: "J44.9", aliases: ["COPD"], system: "pulm" },
  { name: "COPD exacerbation", icd10: "J44.1", system: "pulm" },
  { name: "Asthma", icd10: "J45.909", system: "pulm" },
  { name: "Asthma exacerbation", icd10: "J45.901", system: "pulm" },
  { name: "Pneumonia", icd10: "J18.9", aliases: ["PNA"], system: "pulm" },
  { name: "Community-acquired pneumonia", icd10: "J18.9", aliases: ["CAP"], system: "pulm" },
  { name: "Hospital-acquired pneumonia", icd10: "J15.9", aliases: ["HAP"], system: "pulm" },
  { name: "Aspiration pneumonia", icd10: "J69.0", system: "pulm" },
  { name: "Acute respiratory failure", icd10: "J96.00", aliases: ["ARF"], system: "pulm" },
  { name: "Acute respiratory distress syndrome", icd10: "J80", aliases: ["ARDS"], system: "pulm" },
  { name: "Obstructive sleep apnea", icd10: "G47.33", aliases: ["OSA"], system: "pulm" },
  { name: "Pulmonary hypertension", icd10: "I27.20", aliases: ["pHTN"], system: "pulm" },
  { name: "Pleural effusion", icd10: "J90", system: "pulm" },
  { name: "Pneumothorax", icd10: "J93.9", system: "pulm" },
  { name: "Pulmonary fibrosis", icd10: "J84.10", system: "pulm" },
  { name: "Bronchitis", icd10: "J40", system: "pulm" },
  { name: "Bronchiectasis", icd10: "J47.9", system: "pulm" },
  { name: "COVID-19", icd10: "U07.1", system: "pulm" },
  { name: "Influenza", icd10: "J11.1", system: "pulm" },
  { name: "Tuberculosis", icd10: "A15.9", aliases: ["TB"], system: "pulm" },

  // Endocrine
  { name: "Type 2 diabetes mellitus", icd10: "E11.9", aliases: ["T2DM", "DM2"], system: "endo" },
  { name: "Type 1 diabetes mellitus", icd10: "E10.9", aliases: ["T1DM", "DM1"], system: "endo" },
  { name: "Diabetic ketoacidosis", icd10: "E11.10", aliases: ["DKA"], system: "endo" },
  { name: "Hyperosmolar hyperglycemic state", icd10: "E11.00", aliases: ["HHS"], system: "endo" },
  { name: "Hypoglycemia", icd10: "E16.2", system: "endo" },
  { name: "Hypothyroidism", icd10: "E03.9", system: "endo" },
  { name: "Hyperthyroidism", icd10: "E05.90", system: "endo" },
  { name: "Graves disease", icd10: "E05.00", system: "endo" },
  { name: "Hashimoto thyroiditis", icd10: "E06.3", system: "endo" },
  { name: "Adrenal insufficiency", icd10: "E27.40", system: "endo" },
  { name: "Cushing syndrome", icd10: "E24.9", system: "endo" },
  { name: "Obesity", icd10: "E66.9", system: "endo" },
  { name: "Metabolic syndrome", icd10: "E88.81", system: "endo" },
  { name: "Hyperkalemia", icd10: "E87.5", system: "endo" },
  { name: "Hypokalemia", icd10: "E87.6", system: "endo" },
  { name: "Hyponatremia", icd10: "E87.1", system: "endo" },
  { name: "Hypernatremia", icd10: "E87.0", system: "endo" },
  { name: "Hypocalcemia", icd10: "E83.51", system: "endo" },
  { name: "Hypercalcemia", icd10: "E83.52", system: "endo" },
  { name: "Vitamin D deficiency", icd10: "E55.9", system: "endo" },

  // Renal
  { name: "Acute kidney injury", icd10: "N17.9", aliases: ["AKI", "ARF"], system: "renal" },
  { name: "Chronic kidney disease stage 3", icd10: "N18.3", aliases: ["CKD 3"], system: "renal" },
  { name: "Chronic kidney disease stage 4", icd10: "N18.4", aliases: ["CKD 4"], system: "renal" },
  { name: "Chronic kidney disease stage 5", icd10: "N18.5", aliases: ["ESRD"], system: "renal" },
  { name: "End-stage renal disease", icd10: "N18.6", aliases: ["ESRD"], system: "renal" },
  { name: "Nephrolithiasis", icd10: "N20.0", aliases: ["kidney stone"], system: "renal" },
  { name: "Urinary tract infection", icd10: "N39.0", aliases: ["UTI"], system: "renal" },
  { name: "Pyelonephritis", icd10: "N10", system: "renal" },
  { name: "Hematuria", icd10: "R31.9", system: "renal" },
  { name: "Nephrotic syndrome", icd10: "N04.9", system: "renal" },
  { name: "Glomerulonephritis", icd10: "N05.9", system: "renal" },

  // GI
  { name: "GERD", icd10: "K21.9", aliases: ["gastroesophageal reflux"], system: "gi" },
  { name: "Peptic ulcer disease", icd10: "K27.9", aliases: ["PUD"], system: "gi" },
  { name: "Upper GI bleed", icd10: "K92.2", aliases: ["UGIB"], system: "gi" },
  { name: "Lower GI bleed", icd10: "K92.2", aliases: ["LGIB"], system: "gi" },
  { name: "Cirrhosis", icd10: "K74.60", system: "gi" },
  { name: "Alcoholic hepatitis", icd10: "K70.10", system: "gi" },
  { name: "Non-alcoholic fatty liver disease", icd10: "K76.0", aliases: ["NAFLD"], system: "gi" },
  { name: "Acute pancreatitis", icd10: "K85.90", system: "gi" },
  { name: "Chronic pancreatitis", icd10: "K86.1", system: "gi" },
  { name: "Cholecystitis", icd10: "K81.9", system: "gi" },
  { name: "Cholelithiasis", icd10: "K80.20", aliases: ["gallstones"], system: "gi" },
  { name: "Diverticulitis", icd10: "K57.92", system: "gi" },
  { name: "Ulcerative colitis", icd10: "K51.90", aliases: ["UC"], system: "gi" },
  { name: "Crohn disease", icd10: "K50.90", system: "gi" },
  { name: "Irritable bowel syndrome", icd10: "K58.9", aliases: ["IBS"], system: "gi" },
  { name: "Small bowel obstruction", icd10: "K56.60", aliases: ["SBO"], system: "gi" },
  { name: "Ileus", icd10: "K56.7", system: "gi" },
  { name: "C. difficile colitis", icd10: "A04.7", aliases: ["c diff", "CDI"], system: "gi" },
  { name: "Constipation", icd10: "K59.00", system: "gi" },
  { name: "Diarrhea", icd10: "R19.7", system: "gi" },

  // Neuro
  { name: "Ischemic stroke", icd10: "I63.9", aliases: ["CVA"], system: "neuro" },
  { name: "Hemorrhagic stroke", icd10: "I61.9", system: "neuro" },
  { name: "Transient ischemic attack", icd10: "G45.9", aliases: ["TIA"], system: "neuro" },
  { name: "Subarachnoid hemorrhage", icd10: "I60.9", aliases: ["SAH"], system: "neuro" },
  { name: "Intracerebral hemorrhage", icd10: "I61.9", aliases: ["ICH"], system: "neuro" },
  { name: "Seizure disorder", icd10: "G40.909", aliases: ["epilepsy"], system: "neuro" },
  { name: "Status epilepticus", icd10: "G41.9", system: "neuro" },
  { name: "Migraine", icd10: "G43.909", system: "neuro" },
  { name: "Alzheimer disease", icd10: "G30.9", system: "neuro" },
  { name: "Dementia", icd10: "F03.90", system: "neuro" },
  { name: "Parkinson disease", icd10: "G20", system: "neuro" },
  { name: "Multiple sclerosis", icd10: "G35", aliases: ["MS"], system: "neuro" },
  { name: "Bell palsy", icd10: "G51.0", system: "neuro" },
  { name: "Peripheral neuropathy", icd10: "G62.9", system: "neuro" },
  { name: "Vertigo", icd10: "R42", system: "neuro" },
  { name: "Delirium", icd10: "F05", system: "neuro" },
  { name: "Meningitis", icd10: "G03.9", system: "neuro" },
  { name: "Encephalitis", icd10: "G04.90", system: "neuro" },

  // Psych
  { name: "Major depressive disorder", icd10: "F33.9", aliases: ["MDD"], system: "psych" },
  { name: "Generalized anxiety disorder", icd10: "F41.1", aliases: ["GAD"], system: "psych" },
  { name: "Bipolar disorder", icd10: "F31.9", system: "psych" },
  { name: "Schizophrenia", icd10: "F20.9", system: "psych" },
  { name: "Post-traumatic stress disorder", icd10: "F43.10", aliases: ["PTSD"], system: "psych" },
  { name: "Alcohol use disorder", icd10: "F10.20", aliases: ["AUD"], system: "psych" },
  { name: "Opioid use disorder", icd10: "F11.20", aliases: ["OUD"], system: "psych" },
  { name: "Suicidal ideation", icd10: "R45.851", aliases: ["SI"], system: "psych" },
  { name: "Insomnia", icd10: "G47.00", system: "psych" },

  // Infectious disease
  { name: "Sepsis", icd10: "A41.9", system: "id" },
  { name: "Septic shock", icd10: "R65.21", system: "id" },
  { name: "Bacteremia", icd10: "R78.81", system: "id" },
  { name: "Cellulitis", icd10: "L03.90", system: "id" },
  { name: "Osteomyelitis", icd10: "M86.9", system: "id" },
  { name: "Endocarditis, infective", icd10: "I33.0", system: "id" },
  { name: "HIV", icd10: "B20", system: "id" },
  { name: "Hepatitis C", icd10: "B18.2", aliases: ["HCV"], system: "id" },
  { name: "Hepatitis B", icd10: "B16.9", aliases: ["HBV"], system: "id" },
  { name: "MRSA infection", icd10: "A49.02", system: "id" },
  { name: "Herpes zoster", icd10: "B02.9", aliases: ["shingles"], system: "id" },

  // Heme
  { name: "Iron deficiency anemia", icd10: "D50.9", aliases: ["IDA"], system: "heme" },
  { name: "Anemia of chronic disease", icd10: "D63.8", system: "heme" },
  { name: "Sickle cell disease", icd10: "D57.1", system: "heme" },
  { name: "Thrombocytopenia", icd10: "D69.6", system: "heme" },
  { name: "Neutropenic fever", icd10: "D70.9", system: "heme" },
  { name: "Leukemia, acute myeloid", icd10: "C92.00", aliases: ["AML"], system: "onc" },
  { name: "Leukemia, chronic lymphocytic", icd10: "C91.10", aliases: ["CLL"], system: "onc" },
  { name: "Lymphoma", icd10: "C85.90", system: "onc" },

  // Onc
  { name: "Breast cancer", icd10: "C50.919", system: "onc" },
  { name: "Prostate cancer", icd10: "C61", system: "onc" },
  { name: "Lung cancer", icd10: "C34.90", system: "onc" },
  { name: "Colon cancer", icd10: "C18.9", system: "onc" },
  { name: "Pancreatic cancer", icd10: "C25.9", system: "onc" },

  // MSK
  { name: "Osteoarthritis", icd10: "M19.90", aliases: ["OA"], system: "msk" },
  { name: "Rheumatoid arthritis", icd10: "M06.9", aliases: ["RA"], system: "msk" },
  { name: "Gout", icd10: "M10.9", system: "msk" },
  { name: "Osteoporosis", icd10: "M81.0", system: "msk" },
  { name: "Low back pain", icd10: "M54.5", system: "msk" },
  { name: "Sciatica", icd10: "M54.30", system: "msk" },
  { name: "Fibromyalgia", icd10: "M79.7", system: "msk" },
  { name: "Fracture, hip", icd10: "S72.90", system: "msk" },

  // Derm
  { name: "Eczema", icd10: "L30.9", aliases: ["atopic dermatitis"], system: "derm" },
  { name: "Psoriasis", icd10: "L40.9", system: "derm" },
  { name: "Pressure ulcer", icd10: "L89.90", aliases: ["decubitus"], system: "derm" },

  // OB/Gyn
  { name: "Preeclampsia", icd10: "O14.90", system: "obgyn" },
  { name: "Gestational diabetes", icd10: "O24.410", aliases: ["GDM"], system: "obgyn" },
  { name: "Postpartum hemorrhage", icd10: "O72.1", aliases: ["PPH"], system: "obgyn" },

  // ENT / Eye
  { name: "Otitis media", icd10: "H66.90", system: "ent" },
  { name: "Sinusitis", icd10: "J32.9", system: "ent" },
  { name: "Pharyngitis", icd10: "J02.9", system: "ent" },
  { name: "Conjunctivitis", icd10: "H10.9", aliases: ["pink eye"], system: "eye" },
  { name: "Glaucoma", icd10: "H40.9", system: "eye" },

  // Other / general
  { name: "Chest pain, unspecified", icd10: "R07.9", aliases: ["CP"], system: "cardio" },
  { name: "Shortness of breath", icd10: "R06.02", aliases: ["SOB", "dyspnea"], system: "pulm" },
  { name: "Fatigue", icd10: "R53.83", system: "other" },
  { name: "Fever", icd10: "R50.9", system: "other" },
  { name: "Syncope", icd10: "R55", system: "other" },
  { name: "Weight loss, unspecified", icd10: "R63.4", system: "other" },
  { name: "Falls", icd10: "R29.6", system: "other" },
];

// Clinical abbreviation expansions (used as verifier candidates, never auto-rewritten).
export const ABBREVIATIONS: Record<string, string> = {
  SOB: "shortness of breath",
  CP: "chest pain",
  "N/V": "nausea and vomiting",
  NV: "nausea and vomiting",
  HTN: "hypertension",
  DM: "diabetes mellitus",
  DM2: "type 2 diabetes mellitus",
  T2DM: "type 2 diabetes mellitus",
  T1DM: "type 1 diabetes mellitus",
  CAD: "coronary artery disease",
  CHF: "congestive heart failure",
  HFrEF: "heart failure with reduced ejection fraction",
  HFpEF: "heart failure with preserved ejection fraction",
  COPD: "chronic obstructive pulmonary disease",
  PNA: "pneumonia",
  CAP: "community-acquired pneumonia",
  HAP: "hospital-acquired pneumonia",
  UTI: "urinary tract infection",
  AKI: "acute kidney injury",
  CKD: "chronic kidney disease",
  ESRD: "end-stage renal disease",
  MI: "myocardial infarction",
  STEMI: "ST-elevation myocardial infarction",
  NSTEMI: "non-ST-elevation myocardial infarction",
  CVA: "cerebrovascular accident",
  TIA: "transient ischemic attack",
  SAH: "subarachnoid hemorrhage",
  ICH: "intracerebral hemorrhage",
  DVT: "deep vein thrombosis",
  PE: "pulmonary embolism",
  GERD: "gastroesophageal reflux disease",
  PUD: "peptic ulcer disease",
  UGIB: "upper GI bleed",
  LGIB: "lower GI bleed",
  SBO: "small bowel obstruction",
  IBS: "irritable bowel syndrome",
  UC: "ulcerative colitis",
  OA: "osteoarthritis",
  RA: "rheumatoid arthritis",
  MDD: "major depressive disorder",
  GAD: "generalized anxiety disorder",
  PTSD: "post-traumatic stress disorder",
  AUD: "alcohol use disorder",
  OUD: "opioid use disorder",
  OSA: "obstructive sleep apnea",
  DKA: "diabetic ketoacidosis",
  HHS: "hyperosmolar hyperglycemic state",
  ARDS: "acute respiratory distress syndrome",
  ADHF: "acute decompensated heart failure",
  AF: "atrial fibrillation",
  AS: "aortic stenosis",
  MR: "mitral regurgitation",
  AR: "aortic regurgitation",
  BPH: "benign prostatic hyperplasia",
  HLD: "hyperlipidemia",
  TB: "tuberculosis",
};

export const ROUTES = [
  "PO", "IV", "IM", "SC", "SQ", "SL", "PR", "IN", "TD",
  "inhalation", "nebulized", "topical", "ophthalmic", "otic",
  "buccal", "rectal", "vaginal", "intranasal", "transdermal",
];

export const FREQUENCIES = [
  "daily", "BID", "TID", "QID", "QHS", "QAM", "QPM",
  "PRN", "STAT", "once", "x1", "nightly", "weekly", "monthly",
  "q4h", "q6h", "q8h", "q12h", "q24h", "qod", "ac", "pc", "hs",
];

export const UNITS_EXTRA = [
  "IU", "mEq", "mmol", "L", "kg", "cm", "mm", "bpm", "mmHg",
  "puffs", "tabs", "caps", "sprays", "gtts", "drops",
];
