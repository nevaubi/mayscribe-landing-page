// Static clinical lexicon for the demo dictation verifier.
// No network. Everything here is deterministic.

export interface MedEntry {
  name: string;
  aliases: string[];
  typicalDoseRange: { min: number; max: number; unit: string };
  routes: string[];
  freqs: string[];
}

// eslint-disable-next-line prettier/prettier
export const MEDS: MedEntry[] = [
  // ── Cardiovascular ───────────────────────────────────────────────
  { name: "Furosemide", aliases: ["lasix"], typicalDoseRange: { min: 20, max: 160, unit: "mg" }, routes: ["PO","IV"], freqs: ["daily","BID"] },
  { name: "Bumetanide", aliases: ["bumex"], typicalDoseRange: { min: 0.5, max: 10, unit: "mg" }, routes: ["PO","IV"], freqs: ["daily","BID"] },
  { name: "Torsemide", aliases: ["demadex"], typicalDoseRange: { min: 5, max: 200, unit: "mg" }, routes: ["PO","IV"], freqs: ["daily"] },
  { name: "Hydrochlorothiazide", aliases: ["hctz","microzide"], typicalDoseRange: { min: 12.5, max: 50, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Chlorthalidone", aliases: [], typicalDoseRange: { min: 12.5, max: 100, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Spironolactone", aliases: ["aldactone"], typicalDoseRange: { min: 12.5, max: 100, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Eplerenone", aliases: ["inspra"], typicalDoseRange: { min: 25, max: 50, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Lisinopril", aliases: ["prinivil","zestril"], typicalDoseRange: { min: 2.5, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Enalapril", aliases: ["vasotec"], typicalDoseRange: { min: 2.5, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Ramipril", aliases: ["altace"], typicalDoseRange: { min: 1.25, max: 20, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Benazepril", aliases: ["lotensin"], typicalDoseRange: { min: 5, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Captopril", aliases: [], typicalDoseRange: { min: 6.25, max: 150, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Losartan", aliases: ["cozaar"], typicalDoseRange: { min: 25, max: 100, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Valsartan", aliases: ["diovan"], typicalDoseRange: { min: 40, max: 320, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Olmesartan", aliases: ["benicar"], typicalDoseRange: { min: 20, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Irbesartan", aliases: ["avapro"], typicalDoseRange: { min: 75, max: 300, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Telmisartan", aliases: ["micardis"], typicalDoseRange: { min: 20, max: 80, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Sacubitril-valsartan", aliases: ["entresto"], typicalDoseRange: { min: 24, max: 200, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Metoprolol", aliases: ["lopressor","toprol","toprol-xl"], typicalDoseRange: { min: 12.5, max: 400, unit: "mg" }, routes: ["PO","IV"], freqs: ["BID","daily"] },
  { name: "Carvedilol", aliases: ["coreg"], typicalDoseRange: { min: 3.125, max: 50, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Atenolol", aliases: ["tenormin"], typicalDoseRange: { min: 25, max: 100, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Propranolol", aliases: ["inderal"], typicalDoseRange: { min: 10, max: 320, unit: "mg" }, routes: ["PO","IV"], freqs: ["BID","TID"] },
  { name: "Bisoprolol", aliases: ["zebeta"], typicalDoseRange: { min: 2.5, max: 20, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Labetalol", aliases: ["trandate","normodyne"], typicalDoseRange: { min: 100, max: 800, unit: "mg" }, routes: ["PO","IV"], freqs: ["BID"] },
  { name: "Nadolol", aliases: ["corgard"], typicalDoseRange: { min: 20, max: 240, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Esmolol", aliases: ["brevibloc"], typicalDoseRange: { min: 50, max: 300, unit: "mcg" }, routes: ["IV"], freqs: ["continuous"] },
  { name: "Amlodipine", aliases: ["norvasc"], typicalDoseRange: { min: 2.5, max: 10, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Nifedipine", aliases: ["procardia","adalat"], typicalDoseRange: { min: 30, max: 90, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Diltiazem", aliases: ["cardizem","tiazac"], typicalDoseRange: { min: 30, max: 360, unit: "mg" }, routes: ["PO","IV"], freqs: ["daily","QID"] },
  { name: "Verapamil", aliases: ["calan","isoptin"], typicalDoseRange: { min: 40, max: 480, unit: "mg" }, routes: ["PO","IV"], freqs: ["TID","daily"] },
  { name: "Nicardipine", aliases: ["cardene"], typicalDoseRange: { min: 5, max: 15, unit: "mg" }, routes: ["IV"], freqs: ["continuous"] },
  { name: "Nitroglycerin", aliases: ["nitrostat","ntg"], typicalDoseRange: { min: 0.3, max: 0.6, unit: "mg" }, routes: ["SL","IV","topical"], freqs: ["PRN"] },
  { name: "Isosorbide mononitrate", aliases: ["imdur","monoket"], typicalDoseRange: { min: 30, max: 240, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Isosorbide dinitrate", aliases: ["isordil"], typicalDoseRange: { min: 5, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Hydralazine", aliases: [], typicalDoseRange: { min: 10, max: 300, unit: "mg" }, routes: ["PO","IV"], freqs: ["QID"] },
  { name: "Clonidine", aliases: ["catapres"], typicalDoseRange: { min: 0.1, max: 2.4, unit: "mg" }, routes: ["PO","TD"], freqs: ["BID","TID"] },
  { name: "Doxazosin", aliases: ["cardura"], typicalDoseRange: { min: 1, max: 16, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Terazosin", aliases: ["hytrin"], typicalDoseRange: { min: 1, max: 20, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Prazosin", aliases: ["minipress"], typicalDoseRange: { min: 1, max: 20, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Digoxin", aliases: ["lanoxin"], typicalDoseRange: { min: 0.125, max: 0.25, unit: "mg" }, routes: ["PO","IV"], freqs: ["daily"] },
  { name: "Amiodarone", aliases: ["cordarone","pacerone"], typicalDoseRange: { min: 100, max: 400, unit: "mg" }, routes: ["PO","IV"], freqs: ["daily"] },
  { name: "Sotalol", aliases: ["betapace"], typicalDoseRange: { min: 40, max: 320, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Flecainide", aliases: ["tambocor"], typicalDoseRange: { min: 50, max: 400, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Propafenone", aliases: ["rythmol"], typicalDoseRange: { min: 150, max: 900, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Dofetilide", aliases: ["tikosyn"], typicalDoseRange: { min: 0.125, max: 0.5, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Ivabradine", aliases: ["corlanor"], typicalDoseRange: { min: 2.5, max: 7.5, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Ranolazine", aliases: ["ranexa"], typicalDoseRange: { min: 500, max: 1000, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },

  // Lipid
  { name: "Atorvastatin", aliases: ["lipitor"], typicalDoseRange: { min: 10, max: 80, unit: "mg" }, routes: ["PO"], freqs: ["QHS","daily"] },
  { name: "Rosuvastatin", aliases: ["crestor"], typicalDoseRange: { min: 5, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Simvastatin", aliases: ["zocor"], typicalDoseRange: { min: 5, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Pravastatin", aliases: ["pravachol"], typicalDoseRange: { min: 10, max: 80, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Pitavastatin", aliases: ["livalo"], typicalDoseRange: { min: 1, max: 4, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Lovastatin", aliases: ["mevacor"], typicalDoseRange: { min: 10, max: 80, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Ezetimibe", aliases: ["zetia"], typicalDoseRange: { min: 10, max: 10, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Fenofibrate", aliases: ["tricor","trilipix"], typicalDoseRange: { min: 48, max: 200, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Gemfibrozil", aliases: ["lopid"], typicalDoseRange: { min: 600, max: 1200, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Niacin", aliases: ["niaspan"], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Icosapent ethyl", aliases: ["vascepa"], typicalDoseRange: { min: 2, max: 4, unit: "g" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Evolocumab", aliases: ["repatha"], typicalDoseRange: { min: 140, max: 420, unit: "mg" }, routes: ["SQ"], freqs: ["monthly"] },
  { name: "Alirocumab", aliases: ["praluent"], typicalDoseRange: { min: 75, max: 150, unit: "mg" }, routes: ["SQ"], freqs: ["BID"] },

  // Antiplatelet / Anticoagulant
  { name: "Aspirin", aliases: ["asa","ecotrin","bayer"], typicalDoseRange: { min: 81, max: 325, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Clopidogrel", aliases: ["plavix"], typicalDoseRange: { min: 75, max: 300, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Prasugrel", aliases: ["effient"], typicalDoseRange: { min: 5, max: 60, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Ticagrelor", aliases: ["brilinta"], typicalDoseRange: { min: 60, max: 180, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Warfarin", aliases: ["coumadin","jantoven"], typicalDoseRange: { min: 1, max: 10, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Apixaban", aliases: ["eliquis"], typicalDoseRange: { min: 2.5, max: 10, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Rivaroxaban", aliases: ["xarelto"], typicalDoseRange: { min: 10, max: 20, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Dabigatran", aliases: ["pradaxa"], typicalDoseRange: { min: 75, max: 150, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Edoxaban", aliases: ["savaysa"], typicalDoseRange: { min: 30, max: 60, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Heparin", aliases: [], typicalDoseRange: { min: 5000, max: 30000, unit: "units" }, routes: ["IV","SQ"], freqs: ["BID","continuous"] },
  { name: "Enoxaparin", aliases: ["lovenox"], typicalDoseRange: { min: 30, max: 150, unit: "mg" }, routes: ["SQ"], freqs: ["daily","BID"] },
  { name: "Fondaparinux", aliases: ["arixtra"], typicalDoseRange: { min: 2.5, max: 10, unit: "mg" }, routes: ["SQ"], freqs: ["daily"] },

  // ── Endocrine ────────────────────────────────────────────────────
  { name: "Metformin", aliases: ["glucophage","glumetza","fortamet"], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["PO"], freqs: ["daily","BID"] },
  { name: "Glipizide", aliases: ["glucotrol"], typicalDoseRange: { min: 2.5, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["daily","BID"] },
  { name: "Glyburide", aliases: ["diabeta","micronase"], typicalDoseRange: { min: 1.25, max: 20, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Glimepiride", aliases: ["amaryl"], typicalDoseRange: { min: 1, max: 8, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Pioglitazone", aliases: ["actos"], typicalDoseRange: { min: 15, max: 45, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Sitagliptin", aliases: ["januvia"], typicalDoseRange: { min: 25, max: 100, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Linagliptin", aliases: ["tradjenta"], typicalDoseRange: { min: 5, max: 5, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Saxagliptin", aliases: ["onglyza"], typicalDoseRange: { min: 2.5, max: 5, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Empagliflozin", aliases: ["jardiance"], typicalDoseRange: { min: 10, max: 25, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Dapagliflozin", aliases: ["farxiga"], typicalDoseRange: { min: 5, max: 10, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Canagliflozin", aliases: ["invokana"], typicalDoseRange: { min: 100, max: 300, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Ertugliflozin", aliases: ["steglatro"], typicalDoseRange: { min: 5, max: 15, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Semaglutide", aliases: ["ozempic","wegovy","rybelsus"], typicalDoseRange: { min: 0.25, max: 2.4, unit: "mg" }, routes: ["SQ","PO"], freqs: ["weekly"] },
  { name: "Dulaglutide", aliases: ["trulicity"], typicalDoseRange: { min: 0.75, max: 4.5, unit: "mg" }, routes: ["SQ"], freqs: ["weekly"] },
  { name: "Liraglutide", aliases: ["victoza","saxenda"], typicalDoseRange: { min: 0.6, max: 3, unit: "mg" }, routes: ["SQ"], freqs: ["daily"] },
  { name: "Tirzepatide", aliases: ["mounjaro","zepbound"], typicalDoseRange: { min: 2.5, max: 15, unit: "mg" }, routes: ["SQ"], freqs: ["weekly"] },
  { name: "Exenatide", aliases: ["byetta","bydureon"], typicalDoseRange: { min: 5, max: 10, unit: "mcg" }, routes: ["SQ"], freqs: ["BID"] },
  { name: "Insulin glargine", aliases: ["lantus","basaglar","toujeo"], typicalDoseRange: { min: 10, max: 100, unit: "units" }, routes: ["SQ"], freqs: ["QHS","daily"] },
  { name: "Insulin detemir", aliases: ["levemir"], typicalDoseRange: { min: 10, max: 100, unit: "units" }, routes: ["SQ"], freqs: ["daily","BID"] },
  { name: "Insulin degludec", aliases: ["tresiba"], typicalDoseRange: { min: 10, max: 160, unit: "units" }, routes: ["SQ"], freqs: ["daily"] },
  { name: "Insulin NPH", aliases: ["humulin n","novolin n"], typicalDoseRange: { min: 5, max: 100, unit: "units" }, routes: ["SQ"], freqs: ["BID"] },
  { name: "Insulin regular", aliases: ["humulin r","novolin r"], typicalDoseRange: { min: 2, max: 100, unit: "units" }, routes: ["SQ","IV"], freqs: ["TID"] },
  { name: "Insulin lispro", aliases: ["humalog","admelog"], typicalDoseRange: { min: 1, max: 50, unit: "units" }, routes: ["SQ"], freqs: ["TID"] },
  { name: "Insulin aspart", aliases: ["novolog","fiasp"], typicalDoseRange: { min: 1, max: 50, unit: "units" }, routes: ["SQ"], freqs: ["TID"] },
  { name: "Insulin glulisine", aliases: ["apidra"], typicalDoseRange: { min: 1, max: 50, unit: "units" }, routes: ["SQ"], freqs: ["TID"] },

  { name: "Levothyroxine", aliases: ["synthroid","levoxyl","unithroid"], typicalDoseRange: { min: 25, max: 200, unit: "mcg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Liothyronine", aliases: ["cytomel"], typicalDoseRange: { min: 5, max: 100, unit: "mcg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Methimazole", aliases: ["tapazole"], typicalDoseRange: { min: 5, max: 60, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Propylthiouracil", aliases: ["ptu"], typicalDoseRange: { min: 50, max: 600, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },

  { name: "Prednisone", aliases: [], typicalDoseRange: { min: 5, max: 80, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Prednisolone", aliases: [], typicalDoseRange: { min: 5, max: 60, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Methylprednisolone", aliases: ["solu-medrol","medrol"], typicalDoseRange: { min: 4, max: 1000, unit: "mg" }, routes: ["PO","IV"], freqs: ["daily"] },
  { name: "Dexamethasone", aliases: ["decadron"], typicalDoseRange: { min: 0.5, max: 40, unit: "mg" }, routes: ["PO","IV"], freqs: ["daily","BID"] },
  { name: "Hydrocortisone", aliases: ["cortef","solu-cortef"], typicalDoseRange: { min: 5, max: 300, unit: "mg" }, routes: ["PO","IV"], freqs: ["daily","BID"] },
  { name: "Fludrocortisone", aliases: ["florinef"], typicalDoseRange: { min: 0.05, max: 0.2, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },

  // ── Pulmonary ────────────────────────────────────────────────────
  { name: "Albuterol", aliases: ["proventil","ventolin","proair"], typicalDoseRange: { min: 90, max: 180, unit: "mcg" }, routes: ["inhalation"], freqs: ["PRN","QID"] },
  { name: "Levalbuterol", aliases: ["xopenex"], typicalDoseRange: { min: 45, max: 90, unit: "mcg" }, routes: ["inhalation"], freqs: ["QID"] },
  { name: "Salmeterol", aliases: ["serevent"], typicalDoseRange: { min: 50, max: 50, unit: "mcg" }, routes: ["inhalation"], freqs: ["BID"] },
  { name: "Formoterol", aliases: ["foradil","perforomist"], typicalDoseRange: { min: 12, max: 24, unit: "mcg" }, routes: ["inhalation"], freqs: ["BID"] },
  { name: "Ipratropium", aliases: ["atrovent"], typicalDoseRange: { min: 17, max: 68, unit: "mcg" }, routes: ["inhalation"], freqs: ["QID"] },
  { name: "Tiotropium", aliases: ["spiriva"], typicalDoseRange: { min: 18, max: 18, unit: "mcg" }, routes: ["inhalation"], freqs: ["daily"] },
  { name: "Umeclidinium", aliases: ["incruse"], typicalDoseRange: { min: 62.5, max: 62.5, unit: "mcg" }, routes: ["inhalation"], freqs: ["daily"] },
  { name: "Fluticasone", aliases: ["flonase","flovent","arnuity"], typicalDoseRange: { min: 50, max: 500, unit: "mcg" }, routes: ["inhalation","IN"], freqs: ["BID"] },
  { name: "Budesonide", aliases: ["pulmicort","rhinocort"], typicalDoseRange: { min: 90, max: 800, unit: "mcg" }, routes: ["inhalation"], freqs: ["BID"] },
  { name: "Mometasone", aliases: ["asmanex","nasonex"], typicalDoseRange: { min: 100, max: 400, unit: "mcg" }, routes: ["inhalation","IN"], freqs: ["BID"] },
  { name: "Beclomethasone", aliases: ["qvar"], typicalDoseRange: { min: 40, max: 320, unit: "mcg" }, routes: ["inhalation"], freqs: ["BID"] },
  { name: "Montelukast", aliases: ["singulair"], typicalDoseRange: { min: 4, max: 10, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Zafirlukast", aliases: ["accolate"], typicalDoseRange: { min: 10, max: 20, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Theophylline", aliases: ["theo-24","uniphyl"], typicalDoseRange: { min: 100, max: 600, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Roflumilast", aliases: ["daliresp"], typicalDoseRange: { min: 250, max: 500, unit: "mcg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Omalizumab", aliases: ["xolair"], typicalDoseRange: { min: 75, max: 600, unit: "mg" }, routes: ["SQ"], freqs: ["monthly"] },
  { name: "Mepolizumab", aliases: ["nucala"], typicalDoseRange: { min: 100, max: 100, unit: "mg" }, routes: ["SQ"], freqs: ["monthly"] },

  // ── GI ───────────────────────────────────────────────────────────
  { name: "Omeprazole", aliases: ["prilosec"], typicalDoseRange: { min: 10, max: 80, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Pantoprazole", aliases: ["protonix"], typicalDoseRange: { min: 20, max: 80, unit: "mg" }, routes: ["PO","IV"], freqs: ["daily","BID"] },
  { name: "Esomeprazole", aliases: ["nexium"], typicalDoseRange: { min: 20, max: 40, unit: "mg" }, routes: ["PO","IV"], freqs: ["daily"] },
  { name: "Lansoprazole", aliases: ["prevacid"], typicalDoseRange: { min: 15, max: 60, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Rabeprazole", aliases: ["aciphex"], typicalDoseRange: { min: 20, max: 20, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Dexlansoprazole", aliases: ["dexilant"], typicalDoseRange: { min: 30, max: 60, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Famotidine", aliases: ["pepcid"], typicalDoseRange: { min: 10, max: 40, unit: "mg" }, routes: ["PO","IV"], freqs: ["BID"] },
  { name: "Ranitidine", aliases: ["zantac"], typicalDoseRange: { min: 75, max: 300, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Sucralfate", aliases: ["carafate"], typicalDoseRange: { min: 1, max: 1, unit: "g" }, routes: ["PO"], freqs: ["QID"] },
  { name: "Ondansetron", aliases: ["zofran"], typicalDoseRange: { min: 4, max: 24, unit: "mg" }, routes: ["PO","IV"], freqs: ["QID","PRN"] },
  { name: "Promethazine", aliases: ["phenergan"], typicalDoseRange: { min: 12.5, max: 50, unit: "mg" }, routes: ["PO","IV","IM","PR"], freqs: ["QID","PRN"] },
  { name: "Prochlorperazine", aliases: ["compazine"], typicalDoseRange: { min: 5, max: 40, unit: "mg" }, routes: ["PO","IV","IM"], freqs: ["QID"] },
  { name: "Metoclopramide", aliases: ["reglan"], typicalDoseRange: { min: 5, max: 40, unit: "mg" }, routes: ["PO","IV"], freqs: ["QID"] },
  { name: "Loperamide", aliases: ["imodium"], typicalDoseRange: { min: 2, max: 16, unit: "mg" }, routes: ["PO"], freqs: ["PRN"] },
  { name: "Bismuth subsalicylate", aliases: ["pepto-bismol"], typicalDoseRange: { min: 262, max: 524, unit: "mg" }, routes: ["PO"], freqs: ["QID"] },
  { name: "Polyethylene glycol", aliases: ["miralax","peg 3350"], typicalDoseRange: { min: 17, max: 17, unit: "g" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Docusate", aliases: ["colace"], typicalDoseRange: { min: 100, max: 500, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Senna", aliases: ["senokot"], typicalDoseRange: { min: 8.6, max: 100, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Lactulose", aliases: [], typicalDoseRange: { min: 10, max: 60, unit: "g" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Mesalamine", aliases: ["asacol","pentasa","lialda"], typicalDoseRange: { min: 800, max: 4800, unit: "mg" }, routes: ["PO","PR"], freqs: ["TID"] },

  // ── Neuro / Psych ────────────────────────────────────────────────
  { name: "Sertraline", aliases: ["zoloft"], typicalDoseRange: { min: 25, max: 200, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Fluoxetine", aliases: ["prozac"], typicalDoseRange: { min: 10, max: 80, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Paroxetine", aliases: ["paxil"], typicalDoseRange: { min: 10, max: 60, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Citalopram", aliases: ["celexa"], typicalDoseRange: { min: 10, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Escitalopram", aliases: ["lexapro"], typicalDoseRange: { min: 5, max: 20, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Fluvoxamine", aliases: ["luvox"], typicalDoseRange: { min: 50, max: 300, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Venlafaxine", aliases: ["effexor"], typicalDoseRange: { min: 37.5, max: 375, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Duloxetine", aliases: ["cymbalta"], typicalDoseRange: { min: 20, max: 120, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Desvenlafaxine", aliases: ["pristiq"], typicalDoseRange: { min: 25, max: 100, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Bupropion", aliases: ["wellbutrin","zyban"], typicalDoseRange: { min: 100, max: 450, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Mirtazapine", aliases: ["remeron"], typicalDoseRange: { min: 7.5, max: 45, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Trazodone", aliases: [], typicalDoseRange: { min: 25, max: 400, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Amitriptyline", aliases: ["elavil"], typicalDoseRange: { min: 10, max: 300, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Nortriptyline", aliases: ["pamelor"], typicalDoseRange: { min: 10, max: 150, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Buspirone", aliases: ["buspar"], typicalDoseRange: { min: 5, max: 60, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Alprazolam", aliases: ["xanax"], typicalDoseRange: { min: 0.25, max: 4, unit: "mg" }, routes: ["PO"], freqs: ["TID","PRN"] },
  { name: "Lorazepam", aliases: ["ativan"], typicalDoseRange: { min: 0.5, max: 10, unit: "mg" }, routes: ["PO","IV","IM"], freqs: ["QID","PRN"] },
  { name: "Diazepam", aliases: ["valium"], typicalDoseRange: { min: 2, max: 40, unit: "mg" }, routes: ["PO","IV"], freqs: ["QID"] },
  { name: "Clonazepam", aliases: ["klonopin"], typicalDoseRange: { min: 0.25, max: 4, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Temazepam", aliases: ["restoril"], typicalDoseRange: { min: 7.5, max: 30, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Zolpidem", aliases: ["ambien"], typicalDoseRange: { min: 5, max: 10, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Eszopiclone", aliases: ["lunesta"], typicalDoseRange: { min: 1, max: 3, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Zaleplon", aliases: ["sonata"], typicalDoseRange: { min: 5, max: 20, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Olanzapine", aliases: ["zyprexa"], typicalDoseRange: { min: 2.5, max: 20, unit: "mg" }, routes: ["PO","IM"], freqs: ["daily"] },
  { name: "Quetiapine", aliases: ["seroquel"], typicalDoseRange: { min: 25, max: 800, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Risperidone", aliases: ["risperdal"], typicalDoseRange: { min: 0.5, max: 16, unit: "mg" }, routes: ["PO","IM"], freqs: ["BID"] },
  { name: "Aripiprazole", aliases: ["abilify"], typicalDoseRange: { min: 2, max: 30, unit: "mg" }, routes: ["PO","IM"], freqs: ["daily"] },
  { name: "Ziprasidone", aliases: ["geodon"], typicalDoseRange: { min: 20, max: 160, unit: "mg" }, routes: ["PO","IM"], freqs: ["BID"] },
  { name: "Clozapine", aliases: ["clozaril"], typicalDoseRange: { min: 12.5, max: 900, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Haloperidol", aliases: ["haldol"], typicalDoseRange: { min: 0.5, max: 30, unit: "mg" }, routes: ["PO","IM","IV"], freqs: ["BID","PRN"] },
  { name: "Lithium", aliases: [], typicalDoseRange: { min: 300, max: 1800, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Valproic acid", aliases: ["depakote","depakene"], typicalDoseRange: { min: 250, max: 3000, unit: "mg" }, routes: ["PO","IV"], freqs: ["BID"] },
  { name: "Lamotrigine", aliases: ["lamictal"], typicalDoseRange: { min: 25, max: 400, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Carbamazepine", aliases: ["tegretol"], typicalDoseRange: { min: 100, max: 1600, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Oxcarbazepine", aliases: ["trileptal"], typicalDoseRange: { min: 300, max: 2400, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Levetiracetam", aliases: ["keppra"], typicalDoseRange: { min: 250, max: 3000, unit: "mg" }, routes: ["PO","IV"], freqs: ["BID"] },
  { name: "Phenytoin", aliases: ["dilantin"], typicalDoseRange: { min: 100, max: 600, unit: "mg" }, routes: ["PO","IV"], freqs: ["TID"] },
  { name: "Topiramate", aliases: ["topamax"], typicalDoseRange: { min: 25, max: 400, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Gabapentin", aliases: ["neurontin"], typicalDoseRange: { min: 100, max: 3600, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Pregabalin", aliases: ["lyrica"], typicalDoseRange: { min: 25, max: 600, unit: "mg" }, routes: ["PO"], freqs: ["BID","TID"] },
  { name: "Carbidopa-levodopa", aliases: ["sinemet"], typicalDoseRange: { min: 25, max: 100, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Ropinirole", aliases: ["requip"], typicalDoseRange: { min: 0.25, max: 24, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Pramipexole", aliases: ["mirapex"], typicalDoseRange: { min: 0.125, max: 4.5, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Donepezil", aliases: ["aricept"], typicalDoseRange: { min: 5, max: 23, unit: "mg" }, routes: ["PO"], freqs: ["QHS"] },
  { name: "Memantine", aliases: ["namenda"], typicalDoseRange: { min: 5, max: 28, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Methylphenidate", aliases: ["ritalin","concerta"], typicalDoseRange: { min: 5, max: 72, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Amphetamine-dextroamphetamine", aliases: ["adderall"], typicalDoseRange: { min: 5, max: 60, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Lisdexamfetamine", aliases: ["vyvanse"], typicalDoseRange: { min: 10, max: 70, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },

  // ── Pain ────────────────────────────────────────────────────────
  { name: "Acetaminophen", aliases: ["tylenol","apap","paracetamol"], typicalDoseRange: { min: 325, max: 1000, unit: "mg" }, routes: ["PO","IV","PR"], freqs: ["QID"] },
  { name: "Ibuprofen", aliases: ["motrin","advil"], typicalDoseRange: { min: 200, max: 800, unit: "mg" }, routes: ["PO","IV"], freqs: ["TID"] },
  { name: "Naproxen", aliases: ["naprosyn","aleve"], typicalDoseRange: { min: 220, max: 1000, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Ketorolac", aliases: ["toradol"], typicalDoseRange: { min: 10, max: 30, unit: "mg" }, routes: ["PO","IV","IM"], freqs: ["QID"] },
  { name: "Celecoxib", aliases: ["celebrex"], typicalDoseRange: { min: 100, max: 400, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Meloxicam", aliases: ["mobic"], typicalDoseRange: { min: 7.5, max: 15, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Diclofenac", aliases: ["voltaren"], typicalDoseRange: { min: 25, max: 150, unit: "mg" }, routes: ["PO","topical"], freqs: ["TID"] },
  { name: "Indomethacin", aliases: ["indocin"], typicalDoseRange: { min: 25, max: 200, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Morphine", aliases: ["ms contin","roxanol"], typicalDoseRange: { min: 2, max: 60, unit: "mg" }, routes: ["PO","IV","IM","SQ"], freqs: ["QID","PRN"] },
  { name: "Hydromorphone", aliases: ["dilaudid"], typicalDoseRange: { min: 0.2, max: 8, unit: "mg" }, routes: ["PO","IV","IM"], freqs: ["QID","PRN"] },
  { name: "Oxycodone", aliases: ["oxycontin","roxicodone"], typicalDoseRange: { min: 2.5, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["QID","PRN"] },
  { name: "Hydrocodone", aliases: ["vicodin","norco","lortab"], typicalDoseRange: { min: 2.5, max: 10, unit: "mg" }, routes: ["PO"], freqs: ["QID","PRN"] },
  { name: "Fentanyl", aliases: ["duragesic","sublimaze"], typicalDoseRange: { min: 12, max: 100, unit: "mcg" }, routes: ["TD","IV","IN"], freqs: ["q72h"] },
  { name: "Methadone", aliases: ["dolophine","methadose"], typicalDoseRange: { min: 2.5, max: 120, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Tramadol", aliases: ["ultram"], typicalDoseRange: { min: 25, max: 400, unit: "mg" }, routes: ["PO"], freqs: ["QID","PRN"] },
  { name: "Tapentadol", aliases: ["nucynta"], typicalDoseRange: { min: 50, max: 600, unit: "mg" }, routes: ["PO"], freqs: ["QID"] },
  { name: "Buprenorphine-naloxone", aliases: ["suboxone"], typicalDoseRange: { min: 2, max: 24, unit: "mg" }, routes: ["SL"], freqs: ["daily"] },
  { name: "Naloxone", aliases: ["narcan"], typicalDoseRange: { min: 0.4, max: 4, unit: "mg" }, routes: ["IV","IM","IN"], freqs: ["PRN"] },
  { name: "Cyclobenzaprine", aliases: ["flexeril"], typicalDoseRange: { min: 5, max: 30, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Baclofen", aliases: ["lioresal"], typicalDoseRange: { min: 5, max: 80, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Tizanidine", aliases: ["zanaflex"], typicalDoseRange: { min: 2, max: 36, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Methocarbamol", aliases: ["robaxin"], typicalDoseRange: { min: 500, max: 1500, unit: "mg" }, routes: ["PO","IV"], freqs: ["QID"] },

  // ── Antihistamines / Allergy ────────────────────────────────────
  { name: "Diphenhydramine", aliases: ["benadryl"], typicalDoseRange: { min: 12.5, max: 50, unit: "mg" }, routes: ["PO","IV","IM"], freqs: ["QID","PRN"] },
  { name: "Cetirizine", aliases: ["zyrtec"], typicalDoseRange: { min: 5, max: 10, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Loratadine", aliases: ["claritin"], typicalDoseRange: { min: 5, max: 10, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Fexofenadine", aliases: ["allegra"], typicalDoseRange: { min: 30, max: 180, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Hydroxyzine", aliases: ["vistaril","atarax"], typicalDoseRange: { min: 10, max: 100, unit: "mg" }, routes: ["PO","IM"], freqs: ["QID","PRN"] },
  { name: "Meclizine", aliases: ["antivert"], typicalDoseRange: { min: 12.5, max: 100, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },

  // ── Infectious disease ──────────────────────────────────────────
  { name: "Amoxicillin", aliases: ["amoxil"], typicalDoseRange: { min: 250, max: 1000, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Amoxicillin-clavulanate", aliases: ["augmentin"], typicalDoseRange: { min: 250, max: 875, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Penicillin V", aliases: ["pen vk"], typicalDoseRange: { min: 250, max: 500, unit: "mg" }, routes: ["PO"], freqs: ["QID"] },
  { name: "Ampicillin", aliases: [], typicalDoseRange: { min: 250, max: 2000, unit: "mg" }, routes: ["PO","IV"], freqs: ["QID"] },
  { name: "Ampicillin-sulbactam", aliases: ["unasyn"], typicalDoseRange: { min: 1.5, max: 3, unit: "g" }, routes: ["IV"], freqs: ["QID"] },
  { name: "Piperacillin-tazobactam", aliases: ["zosyn"], typicalDoseRange: { min: 3.375, max: 4.5, unit: "g" }, routes: ["IV"], freqs: ["QID"] },
  { name: "Nafcillin", aliases: [], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["IV"], freqs: ["QID"] },
  { name: "Oxacillin", aliases: [], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["IV"], freqs: ["QID"] },
  { name: "Cefazolin", aliases: ["ancef","kefzol"], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["IV","IM"], freqs: ["TID"] },
  { name: "Cephalexin", aliases: ["keflex"], typicalDoseRange: { min: 250, max: 1000, unit: "mg" }, routes: ["PO"], freqs: ["QID"] },
  { name: "Cefdinir", aliases: ["omnicef"], typicalDoseRange: { min: 300, max: 600, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Cefpodoxime", aliases: ["vantin"], typicalDoseRange: { min: 100, max: 400, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Ceftriaxone", aliases: ["rocephin"], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["IV","IM"], freqs: ["daily"] },
  { name: "Cefepime", aliases: ["maxipime"], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["IV"], freqs: ["BID"] },
  { name: "Ceftazidime", aliases: ["fortaz"], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["IV"], freqs: ["TID"] },
  { name: "Meropenem", aliases: ["merrem"], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["IV"], freqs: ["TID"] },
  { name: "Ertapenem", aliases: ["invanz"], typicalDoseRange: { min: 1, max: 1, unit: "g" }, routes: ["IV"], freqs: ["daily"] },
  { name: "Imipenem-cilastatin", aliases: ["primaxin"], typicalDoseRange: { min: 250, max: 1000, unit: "mg" }, routes: ["IV"], freqs: ["QID"] },
  { name: "Aztreonam", aliases: ["azactam"], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["IV"], freqs: ["QID"] },
  { name: "Ciprofloxacin", aliases: ["cipro"], typicalDoseRange: { min: 250, max: 750, unit: "mg" }, routes: ["PO","IV"], freqs: ["BID"] },
  { name: "Levofloxacin", aliases: ["levaquin"], typicalDoseRange: { min: 250, max: 750, unit: "mg" }, routes: ["PO","IV"], freqs: ["daily"] },
  { name: "Moxifloxacin", aliases: ["avelox"], typicalDoseRange: { min: 400, max: 400, unit: "mg" }, routes: ["PO","IV"], freqs: ["daily"] },
  { name: "Azithromycin", aliases: ["zithromax","z-pak"], typicalDoseRange: { min: 250, max: 500, unit: "mg" }, routes: ["PO","IV"], freqs: ["daily"] },
  { name: "Clarithromycin", aliases: ["biaxin"], typicalDoseRange: { min: 250, max: 500, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Erythromycin", aliases: [], typicalDoseRange: { min: 250, max: 500, unit: "mg" }, routes: ["PO","IV"], freqs: ["QID"] },
  { name: "Doxycycline", aliases: ["vibramycin"], typicalDoseRange: { min: 50, max: 200, unit: "mg" }, routes: ["PO","IV"], freqs: ["BID"] },
  { name: "Minocycline", aliases: ["minocin"], typicalDoseRange: { min: 50, max: 200, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Tetracycline", aliases: [], typicalDoseRange: { min: 250, max: 500, unit: "mg" }, routes: ["PO"], freqs: ["QID"] },
  { name: "Trimethoprim-sulfamethoxazole", aliases: ["bactrim","septra","tmp-smx"], typicalDoseRange: { min: 80, max: 160, unit: "mg" }, routes: ["PO","IV"], freqs: ["BID"] },
  { name: "Nitrofurantoin", aliases: ["macrobid","macrodantin"], typicalDoseRange: { min: 50, max: 100, unit: "mg" }, routes: ["PO"], freqs: ["QID"] },
  { name: "Metronidazole", aliases: ["flagyl"], typicalDoseRange: { min: 250, max: 500, unit: "mg" }, routes: ["PO","IV"], freqs: ["TID"] },
  { name: "Clindamycin", aliases: ["cleocin"], typicalDoseRange: { min: 150, max: 900, unit: "mg" }, routes: ["PO","IV"], freqs: ["QID"] },
  { name: "Linezolid", aliases: ["zyvox"], typicalDoseRange: { min: 600, max: 600, unit: "mg" }, routes: ["PO","IV"], freqs: ["BID"] },
  { name: "Daptomycin", aliases: ["cubicin"], typicalDoseRange: { min: 4, max: 10, unit: "mg" }, routes: ["IV"], freqs: ["daily"] },
  { name: "Vancomycin", aliases: ["vancocin"], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["IV","PO"], freqs: ["BID"] },
  { name: "Gentamicin", aliases: [], typicalDoseRange: { min: 1, max: 7, unit: "mg" }, routes: ["IV","IM"], freqs: ["daily","TID"] },
  { name: "Tobramycin", aliases: [], typicalDoseRange: { min: 1, max: 7, unit: "mg" }, routes: ["IV","inhalation"], freqs: ["daily"] },
  { name: "Amikacin", aliases: [], typicalDoseRange: { min: 5, max: 20, unit: "mg" }, routes: ["IV","IM"], freqs: ["daily"] },
  { name: "Fluconazole", aliases: ["diflucan"], typicalDoseRange: { min: 100, max: 800, unit: "mg" }, routes: ["PO","IV"], freqs: ["daily"] },
  { name: "Micafungin", aliases: ["mycamine"], typicalDoseRange: { min: 50, max: 150, unit: "mg" }, routes: ["IV"], freqs: ["daily"] },
  { name: "Caspofungin", aliases: ["cancidas"], typicalDoseRange: { min: 35, max: 70, unit: "mg" }, routes: ["IV"], freqs: ["daily"] },
  { name: "Voriconazole", aliases: ["vfend"], typicalDoseRange: { min: 200, max: 400, unit: "mg" }, routes: ["PO","IV"], freqs: ["BID"] },
  { name: "Posaconazole", aliases: ["noxafil"], typicalDoseRange: { min: 100, max: 400, unit: "mg" }, routes: ["PO","IV"], freqs: ["BID"] },
  { name: "Amphotericin B", aliases: ["ambisome"], typicalDoseRange: { min: 3, max: 6, unit: "mg" }, routes: ["IV"], freqs: ["daily"] },
  { name: "Nystatin", aliases: [], typicalDoseRange: { min: 100000, max: 600000, unit: "units" }, routes: ["PO","topical"], freqs: ["QID"] },
  { name: "Acyclovir", aliases: ["zovirax"], typicalDoseRange: { min: 200, max: 800, unit: "mg" }, routes: ["PO","IV"], freqs: ["QID"] },
  { name: "Valacyclovir", aliases: ["valtrex"], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["PO"], freqs: ["BID","TID"] },
  { name: "Oseltamivir", aliases: ["tamiflu"], typicalDoseRange: { min: 30, max: 75, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Remdesivir", aliases: ["veklury"], typicalDoseRange: { min: 100, max: 200, unit: "mg" }, routes: ["IV"], freqs: ["daily"] },
  { name: "Isoniazid", aliases: ["inh"], typicalDoseRange: { min: 5, max: 300, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Rifampin", aliases: [], typicalDoseRange: { min: 600, max: 600, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },

  // ── Renal / Fluids / Electrolytes ───────────────────────────────
  { name: "Sodium bicarbonate", aliases: [], typicalDoseRange: { min: 650, max: 3900, unit: "mg" }, routes: ["PO","IV"], freqs: ["QID"] },
  { name: "Calcium carbonate", aliases: ["tums"], typicalDoseRange: { min: 500, max: 3000, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Calcium gluconate", aliases: [], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["IV","PO"], freqs: ["PRN"] },
  { name: "Potassium chloride", aliases: ["k-dur","klor-con"], typicalDoseRange: { min: 10, max: 100, unit: "mEq" }, routes: ["PO","IV"], freqs: ["daily"] },
  { name: "Magnesium oxide", aliases: [], typicalDoseRange: { min: 400, max: 800, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Magnesium sulfate", aliases: [], typicalDoseRange: { min: 1, max: 4, unit: "g" }, routes: ["IV","IM"], freqs: ["PRN"] },
  { name: "Phosphorus", aliases: ["k-phos","neutra-phos"], typicalDoseRange: { min: 250, max: 500, unit: "mg" }, routes: ["PO"], freqs: ["QID"] },
  { name: "Sevelamer", aliases: ["renvela","renagel"], typicalDoseRange: { min: 800, max: 4800, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Calcium acetate", aliases: ["phoslo"], typicalDoseRange: { min: 667, max: 2001, unit: "mg" }, routes: ["PO"], freqs: ["TID"] },
  { name: "Cinacalcet", aliases: ["sensipar"], typicalDoseRange: { min: 30, max: 180, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Epoetin alfa", aliases: ["epogen","procrit"], typicalDoseRange: { min: 50, max: 300, unit: "units" }, routes: ["IV","SQ"], freqs: ["weekly"] },
  { name: "Darbepoetin", aliases: ["aranesp"], typicalDoseRange: { min: 25, max: 200, unit: "mcg" }, routes: ["IV","SQ"], freqs: ["weekly"] },

  // ── OB / Women's health ─────────────────────────────────────────
  { name: "Oxytocin", aliases: ["pitocin"], typicalDoseRange: { min: 1, max: 40, unit: "units" }, routes: ["IV","IM"], freqs: ["continuous"] },
  { name: "Misoprostol", aliases: ["cytotec"], typicalDoseRange: { min: 100, max: 800, unit: "mcg" }, routes: ["PO","PR","vaginal"], freqs: ["QID"] },
  { name: "Methylergonovine", aliases: ["methergine"], typicalDoseRange: { min: 0.2, max: 0.2, unit: "mg" }, routes: ["PO","IM"], freqs: ["QID"] },
  { name: "Terbutaline", aliases: ["brethine"], typicalDoseRange: { min: 0.25, max: 5, unit: "mg" }, routes: ["SQ","PO"], freqs: ["PRN"] },

  // ── Reversal / Emergency ────────────────────────────────────────
  { name: "Flumazenil", aliases: ["romazicon"], typicalDoseRange: { min: 0.2, max: 3, unit: "mg" }, routes: ["IV"], freqs: ["PRN"] },
  { name: "Glucagon", aliases: [], typicalDoseRange: { min: 0.5, max: 1, unit: "mg" }, routes: ["IM","SQ","IV"], freqs: ["PRN"] },
  { name: "Protamine", aliases: [], typicalDoseRange: { min: 1, max: 50, unit: "mg" }, routes: ["IV"], freqs: ["PRN"] },
  { name: "Vitamin K", aliases: ["phytonadione","mephyton"], typicalDoseRange: { min: 1, max: 10, unit: "mg" }, routes: ["PO","IV","SQ"], freqs: ["daily"] },
  { name: "Dextrose 50", aliases: ["d50"], typicalDoseRange: { min: 12.5, max: 25, unit: "g" }, routes: ["IV"], freqs: ["PRN"] },
  { name: "Epinephrine", aliases: ["adrenalin","epipen"], typicalDoseRange: { min: 0.1, max: 1, unit: "mg" }, routes: ["IV","IM","SQ"], freqs: ["PRN"] },
  { name: "Norepinephrine", aliases: ["levophed"], typicalDoseRange: { min: 2, max: 40, unit: "mcg" }, routes: ["IV"], freqs: ["continuous"] },
  { name: "Dopamine", aliases: [], typicalDoseRange: { min: 2, max: 20, unit: "mcg" }, routes: ["IV"], freqs: ["continuous"] },
  { name: "Dobutamine", aliases: [], typicalDoseRange: { min: 2, max: 20, unit: "mcg" }, routes: ["IV"], freqs: ["continuous"] },
  { name: "Vasopressin", aliases: [], typicalDoseRange: { min: 0.01, max: 0.04, unit: "units" }, routes: ["IV"], freqs: ["continuous"] },

  // ── Other commonly seen ─────────────────────────────────────────
  { name: "Allopurinol", aliases: ["zyloprim"], typicalDoseRange: { min: 100, max: 800, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Colchicine", aliases: ["colcrys"], typicalDoseRange: { min: 0.6, max: 1.8, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Febuxostat", aliases: ["uloric"], typicalDoseRange: { min: 40, max: 80, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Alendronate", aliases: ["fosamax"], typicalDoseRange: { min: 5, max: 70, unit: "mg" }, routes: ["PO"], freqs: ["weekly"] },
  { name: "Denosumab", aliases: ["prolia","xgeva"], typicalDoseRange: { min: 60, max: 120, unit: "mg" }, routes: ["SQ"], freqs: ["monthly"] },
  { name: "Tamsulosin", aliases: ["flomax"], typicalDoseRange: { min: 0.4, max: 0.8, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Finasteride", aliases: ["proscar","propecia"], typicalDoseRange: { min: 1, max: 5, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Sildenafil", aliases: ["viagra","revatio"], typicalDoseRange: { min: 20, max: 100, unit: "mg" }, routes: ["PO"], freqs: ["PRN"] },
  { name: "Tadalafil", aliases: ["cialis"], typicalDoseRange: { min: 2.5, max: 20, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Methotrexate", aliases: [], typicalDoseRange: { min: 2.5, max: 25, unit: "mg" }, routes: ["PO","SQ","IM"], freqs: ["weekly"] },
  { name: "Hydroxychloroquine", aliases: ["plaquenil"], typicalDoseRange: { min: 200, max: 400, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Sulfasalazine", aliases: ["azulfidine"], typicalDoseRange: { min: 500, max: 3000, unit: "mg" }, routes: ["PO"], freqs: ["BID"] },
  { name: "Hydroxyurea", aliases: ["hydrea"], typicalDoseRange: { min: 500, max: 2000, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Tamoxifen", aliases: ["nolvadex"], typicalDoseRange: { min: 10, max: 40, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Letrozole", aliases: ["femara"], typicalDoseRange: { min: 2.5, max: 2.5, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
  { name: "Anastrozole", aliases: ["arimidex"], typicalDoseRange: { min: 1, max: 1, unit: "mg" }, routes: ["PO"], freqs: ["daily"] },
];

// Look-alike / sound-alike pairs (bidirectional)
export const LASA: [string, string][] = [
  ["hydroxyzine", "hydralazine"],
  ["clonidine", "klonopin"],
  ["clonidine", "clonazepam"],
  ["metoprolol", "misoprostol"],
  ["celebrex", "celexa"],
  ["tramadol", "trazodone"],
  ["prednisone", "prednisolone"],
  ["zyrtec", "zyprexa"],
  ["lamictal", "lamisil"],
  ["lamictal", "labetalol"],
  ["adderall", "inderal"],
  ["glipizide", "glyburide"],
  ["hydrocodone", "oxycodone"],
  ["hydromorphone", "morphine"],
  ["cycloserine", "cyclosporine"],
  ["chlorpromazine", "chlorpropamide"],
  ["epinephrine", "ephedrine"],
  ["bupropion", "buspirone"],
  ["novolin", "novolog"],
  ["humalog", "humulin"],
  ["toradol", "tramadol"],
  ["xeljanz", "xarelto"],
  ["neurontin", "norvasc"],
  ["prilosec", "prozac"],
  ["fentanyl", "sufentanil"],
  ["diazepam", "diltiazem"],
  ["sitagliptin", "saxagliptin"],
  ["losartan", "valsartan"],
];

// Units — canonical + high-risk confusion set
export const UNITS = {
  canonical: ["mg", "mcg", "g", "mL", "L", "units", "IU", "mEq", "mmol"],
  confusions: [
    ["mg", "mcg"],
    ["mcg", "g"],
    ["mg", "g"],
    ["units", "mL"],
    ["IU", "units"],
    ["mEq", "mg"],
  ] as [string, string][],
};

// -------------- detectors --------------

export type DetectedType =
  | "med"
  | "dose"
  | "numeric"
  | "age"
  | "quantity"
  | "laterality"
  | "negation"
  | "frequency"
  | "route";

export interface Detected {
  start: number;
  end: number;
  text: string;
  type: DetectedType;
  meta?: Record<string, unknown>;
}

function levenshtein(a: string, b: string, cap = 3): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const dp: number[] = Array(b.length + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    let minRow = dp[0];
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
      if (dp[j] < minRow) minRow = dp[j];
    }
    if (minRow > cap) return cap + 1;
  }
  return dp[b.length];
}

const MED_TOKENS: { canonical: string; token: string }[] = [];
for (const m of MEDS) {
  MED_TOKENS.push({ canonical: m.name, token: m.name.toLowerCase() });
  for (const a of m.aliases) MED_TOKENS.push({ canonical: m.name, token: a.toLowerCase() });
}

export function findMed(word: string): MedEntry | null {
  const w = word.toLowerCase();
  for (const t of MED_TOKENS) {
    if (t.token === w) return MEDS.find((m) => m.name === t.canonical) ?? null;
  }
  for (const t of MED_TOKENS) {
    if (Math.abs(t.token.length - w.length) <= 2 && levenshtein(t.token, w, 2) <= 2) {
      return MEDS.find((m) => m.name === t.canonical) ?? null;
    }
  }
  return null;
}

export function findLASA(word: string): string[] | null {
  const w = word.toLowerCase();
  for (const [a, b] of LASA) {
    if (w === a) return [a, b];
    if (w === b) return [b, a];
  }
  return null;
}

export function detectAll(text: string): Detected[] {
  const out: Detected[] = [];

  // dose+unit — expanded units
  const doseRe = /(\d+(?:\.\d+)?)\s*(mg|mcg|g|mL|L|units?|IU|mEq|mmol|kg)\b/gi;
  for (let m: RegExpExecArray | null; (m = doseRe.exec(text)); ) {
    out.push({
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
      type: "dose",
      meta: { value: parseFloat(m[1]), unit: m[2] },
    });
  }

  const latRe = /\b(left|right|bilateral|unilateral)\b/gi;
  for (let m: RegExpExecArray | null; (m = latRe.exec(text)); ) {
    out.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "laterality" });
  }

  const negRe = /\b(no|denies|without|negative for|absent)\b/gi;
  for (let m: RegExpExecArray | null; (m = negRe.exec(text)); ) {
    out.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "negation" });
  }

  // frequency — expanded
  const freqRe = /\b(BID|TID|QID|QHS|QAM|QPM|PRN|STAT|QD|daily|nightly|weekly|monthly|q[24468]h|q12h|q24h|qod|ac|pc|hs)\b/gi;
  for (let m: RegExpExecArray | null; (m = freqRe.exec(text)); ) {
    out.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "frequency" });
  }

  // route
  const routeRe = /\b(PO|IV|IM|SC|SQ|SL|PR|IN|TD|topical|inhalation|nebulized|ophthalmic|otic|buccal|rectal|vaginal|intranasal|transdermal)\b/gi;
  for (let m: RegExpExecArray | null; (m = routeRe.exec(text)); ) {
    out.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "route" });
  }

  const wordRe = /\b[A-Za-z][A-Za-z-]{2,}\b/g;
  for (let m: RegExpExecArray | null; (m = wordRe.exec(text)); ) {
    const tok = m[0];
    const med = findMed(tok);
    if (med) {
      out.push({
        start: m.index,
        end: m.index + tok.length,
        text: tok,
        type: "med",
        meta: { med: med.name },
      });
    }
  }

  return out.sort((a, b) => a.start - b.start);
}
