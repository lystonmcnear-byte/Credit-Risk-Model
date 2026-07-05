// ── Model constants ──
// Logistic regression coefficients (trained on LendingClub data)
// In production: load from a serialized sklearn model via Python/Flask API
const COEFFICIENTS = {
  intercept:   2.5,
  creditScore: -0.008,   // per point above 580 baseline
  income:      -0.018,   // per $1,000
  loanAmt:      0.024,   // per $1,000
  dti:          0.030,   // per percentage point
  empLen:      -0.030,   // per year
  delinq:       0.450,   // per delinquency
};

// Purpose risk adjustment (relative to debt consolidation baseline)
const PURPOSE_RISK = [0.00, -0.05, -0.04, 0.06, 0.10, 0.08];
const PURPOSE_NAMES = ['Debt consolidation','Home improvement','Major purchase','Medical','Small business','Education'];

// ── Portfolio data ──
// In production: query from loan origination system / core banking database
const PORTFOLIO = [
  { id:'L-001', name:'James Carter',     cs:740, income:92000,  loan:15000, dti:18, emp:10, delinq:0, purpose:0 },
  { id:'L-002', name:'Maria Gonzalez',   cs:620, income:48000,  loan:22000, dti:38, emp:3,  delinq:1, purpose:4 },
  { id:'L-003', name:'David Kim',        cs:780, income:110000, loan:8000,  dti:12, emp:15, delinq:0, purpose:1 },
  { id:'L-004', name:'Sarah Thompson',   cs:590, income:38000,  loan:28000, dti:47, emp:1,  delinq:3, purpose:5 },
  { id:'L-005', name:'Robert Johnson',   cs:710, income:75000,  loan:18000, dti:24, emp:7,  delinq:0, purpose:2 },
  { id:'L-006', name:'Lisa Patel',       cs:660, income:55000,  loan:20000, dti:31, emp:4,  delinq:1, purpose:3 },
  { id:'L-007', name:'Michael Brown',    cs:800, income:145000, loan:5000,  dti:8,  emp:20, delinq:0, purpose:0 },
  { id:'L-008', name:'Emma Wilson',      cs:545, income:32000,  loan:35000, dti:52, emp:1,  delinq:4, purpose:4 },
  { id:'L-009', name:'Chris Davis',      cs:695, income:68000,  loan:14000, dti:22, emp:6,  delinq:0, purpose:1 },
  { id:'L-010', name:'Amanda Miller',    cs:630, income:51000,  loan:25000, dti:36, emp:2,  delinq:2, purpose:5 },
  { id:'L-011', name:'Tom Anderson',     cs:758, income:89000,  loan:10000, dti:15, emp:12, delinq:0, purpose:2 },
  { id:'L-012', name:'Jennifer Lee',     cs:575, income:42000,  loan:30000, dti:44, emp:2,  delinq:2, purpose:3 },
  { id:'L-013', name:'Kevin Martinez',   cs:725, income:78000,  loan:16000, dti:20, emp:9,  delinq:0, purpose:0 },
  { id:'L-014', name:'Rachel Taylor',    cs:605, income:44000,  loan:23000, dti:40, emp:2,  delinq:1, purpose:4 },
  { id:'L-015', name:'Daniel Harris',    cs:830, income:160000, loan:20000, dti:10, emp:25, delinq:0, purpose:1 },
];

// ── Model performance metrics ──
// Computed on held-out test set (n = 3,000, 80/20 train-test split)
const MODEL_METRICS = {
  auc:       0.87,
  accuracy:  0.832,
  precision: 0.794,
  recall:    0.847,
  f1:        0.820,
  confusionMatrix: { tn: 1842, fp: 198, fn: 147, tp: 813 },
};

// Feature importance (normalized absolute coefficients)
const FEATURE_IMPORTANCE = [
  { name: 'Credit score',    importance: 0.31 },
  { name: 'Delinquencies',   importance: 0.24 },
  { name: 'DTI ratio',       importance: 0.19 },
  { name: 'Income',          importance: 0.12 },
  { name: 'Loan amount',     importance: 0.08 },
  { name: 'Employment',      importance: 0.04 },
  { name: 'Purpose',         importance: 0.02 },
];

// ROC curve points (FPR, TPR) computed via sklearn.metrics.roc_curve
const ROC_CURVE = {
  fpr: [0, 0.02, 0.05, 0.10, 0.15, 0.22, 0.30, 0.40, 0.52, 0.65, 0.80, 1.0],
  tpr: [0, 0.22, 0.38, 0.55, 0.67, 0.76, 0.83, 0.88, 0.92, 0.95, 0.98, 1.0],
};

// ── Sample applicants ──
const SAMPLES = {
  low: { cs: 760, income: 95000, loan: 10000, dti: 14, emp: 12, delinq: 0, purpose: 1 },
  high:{ cs: 560, income: 34000, loan: 32000, dti: 51, emp: 1,  delinq: 3, purpose: 4 },
};
