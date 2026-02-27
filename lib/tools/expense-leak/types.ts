export type ExpenseLeakHousingProfile = 'renter' | 'owned_mortgage' | 'owned_paid';

export type ExpenseLeakFamilyProfile = 'single' | 'couple' | 'family4' | 'family5';

export type ExpenseLeakCityProfile = 'tehran' | 'big' | 'mid' | 'small';

export interface ExpenseLeakProfile {
  housing: ExpenseLeakHousingProfile;
  family: ExpenseLeakFamilyProfile;
  city: ExpenseLeakCityProfile;
}

export type ExpenseLeakCategoryId =
  | 'saving'
  | 'housing'
  | 'food'
  | 'transport'
  | 'lifestyle'
  | 'health'
  | 'bills'
  | 'finance';

export type ExpenseLeakMode = 'quick' | 'detailed' | 'mixed';

export type ExpenseLeakDetailedFieldId =
  | 'rent'
  | 'mortgage'
  | 'charge'
  | 'grocery'
  | 'restaurant'
  | 'cafe'
  | 'delivery'
  | 'lunch_out'
  | 'fuel'
  | 'taxi'
  | 'public'
  | 'clothing'
  | 'entertain'
  | 'small'
  | 'medicine'
  | 'doctor'
  | 'beauty'
  | 'gym'
  | 'hygiene'
  | 'utilities'
  | 'internet'
  | 'subs'
  | 'loan'
  | 'installment'
  | 'credit_inst';

export interface ExpenseLeakAnnualItemInput {
  id: string;
  label?: string;
  amount: number;
  monthName: string;
}

export interface ExpenseLeakCustomItemInput {
  name: string;
  amount: number;
}

export interface ExpenseLeakQuickInputs {
  byCategory: Partial<Record<ExpenseLeakCategoryId, number>>;
}

export interface ExpenseLeakDetailedInputs {
  byField: Partial<Record<ExpenseLeakDetailedFieldId, number>>;
}

export interface ExpenseLeakInput {
  profile: ExpenseLeakProfile;
  monthlyIncome: number;
  monthlySaving: number;
  emergencyFundBalance: number;
  inflationRatePercent: number;
  mode: ExpenseLeakMode;
  quick?: ExpenseLeakQuickInputs;
  detailed?: ExpenseLeakDetailedInputs;
  annualItems: ExpenseLeakAnnualItemInput[];
  customItems: ExpenseLeakCustomItemInput[];
}

export type ExpenseLeakHealthLevel = 'excellent' | 'good' | 'average' | 'weak' | 'critical';

export interface ExpenseLeakHealthScore {
  score: number;
  level: ExpenseLeakHealthLevel;
  levelLabel: string;
  factors: {
    label: string;
    severity: 'positive' | 'neutral' | 'warning' | 'critical';
  }[];
}

export type ExpenseLeakCategoryStatus =
  | 'not_set'
  | 'ok'
  | 'slightly_high'
  | 'high'
  | 'very_high'
  | 'too_low'
  | 'informational';

export interface ExpenseLeakCategoryBreakdown {
  id: ExpenseLeakCategoryId;
  label: string;
  amount: number;
  percentOfIncome: number;
  idealRangePercent?: [number, number];
  warnRangePercent?: [number, number];
  status: ExpenseLeakCategoryStatus;
  tagText?: string;
}

export interface ExpenseLeakLeakItem {
  fieldId?: ExpenseLeakDetailedFieldId;
  label: string;
  amount: number;
  percentOfCategory: number;
}

export type ExpenseLeakLeakSeverity = 'mild' | 'moderate' | 'severe';

export interface ExpenseLeakDetectedLeak {
  categoryId: ExpenseLeakCategoryId;
  categoryLabel: string;
  totalAmount: number;
  percentOfIncome: number;
  severity: ExpenseLeakLeakSeverity;
  topItems: ExpenseLeakLeakItem[];
  note?: string;
}

export interface ExpenseLeakPeerCard {
  categoryId: ExpenseLeakCategoryId;
  label: string;
  userPercent: number;
  peerAveragePercent: number;
  peerRangePercent: [number, number];
  status: 'much_higher' | 'higher' | 'similar' | 'lower' | 'much_lower';
  statusLabel: string;
}

export interface ExpenseLeak5030RuleSlice {
  label: string;
  targetPercent: number;
  actualPercent: number;
  gapPercent: number;
}

export interface ExpenseLeak5030Result {
  slices: ExpenseLeak5030RuleSlice[];
  note?: string;
}

export interface ExpenseLeakFragilityResult {
  fixedExpensePercent: number;
  ratio: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  label: string;
}

export interface ExpenseLeakDarkMoneyResult {
  darkAmount: number;
  percentOfIncome: number;
  label: string;
  note?: string;
}

export interface ExpenseLeakHeatmapMonth {
  monthLabel: string;
  amount: number;
  percentOfAnnual?: number;
}

export interface ExpenseLeakHeatmapResult {
  months: ExpenseLeakHeatmapMonth[];
  peakMonthLabel?: string;
}

export interface ExpenseLeakOutputSummary {
  income: number;
  totalExpenses: number;
  totalCustomExpenses: number;
  totalAnnualAmount: number;
  annualMonthly: number;
  saving: number;
  balance: number;
  balanceWithAnnual: number;
}

export interface ExpenseLeakOutput {
  input: ExpenseLeakInput;
  summary: ExpenseLeakOutputSummary;
  health: ExpenseLeakHealthScore;
  categories: ExpenseLeakCategoryBreakdown[];
  leaks: ExpenseLeakDetectedLeak[];
  peers: ExpenseLeakPeerCard[];
  rule5030?: ExpenseLeak5030Result;
  fragility?: ExpenseLeakFragilityResult;
  darkMoney?: ExpenseLeakDarkMoneyResult;
  heatmap?: ExpenseLeakHeatmapResult;
}

export interface ExpenseLeakToolRunSummary {
  mode: ExpenseLeakMode;
  income: number;
  totalExpenses: number;
  balance: number;
  balanceWithAnnual: number;
  healthScore: number;
  healthLevel: ExpenseLeakHealthLevel;
  mainLeakCategories: ExpenseLeakCategoryId[];
}

export interface ExpenseLeakToolRunRawData {
  version: string;
  input: ExpenseLeakInput;
  output: ExpenseLeakOutput;
  summary: ExpenseLeakToolRunSummary;
}

