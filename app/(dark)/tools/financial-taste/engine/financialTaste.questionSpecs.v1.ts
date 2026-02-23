// app/tools/financial-taste/engine/financialTaste.questionSpecs.v1.ts
export type Axis =
  | "risk_capacity"
  | "risk_tolerance"
  | "spending_taste"
  | "behavioral_bias"
  | "money_avoidance"
  | "money_worship"
  | "money_status"
  | "money_vigilance"
  | "money_motivation";

export type LikertScale = 4 | 5;

export interface QuestionSpec {
  id: number;
  scale: LikertScale;
  axisWeights: Partial<Record<Axis, number>>;
  reverse?: boolean;
  note?: string;
}

export const FINANCIAL_TASTE_QUESTION_SPECS_V1: QuestionSpec[] = [
  // Risk Capacity
  { id: 1, scale: 4, axisWeights: { risk_capacity: 0.9 }, reverse: true },
  { id: 2, scale: 4, axisWeights: { risk_capacity: 1.2 } },
  { id: 3, scale: 4, axisWeights: { risk_capacity: 0.8, money_vigilance: 0.4 } },
  { id: 4, scale: 4, axisWeights: { risk_capacity: 1.0 }, reverse: true },
  { id: 5, scale: 4, axisWeights: { risk_capacity: 1.1 }, reverse: true },

  // Risk Tolerance
  { id: 6, scale: 4, axisWeights: { risk_tolerance: 1.3 } },
  { id: 7, scale: 4, axisWeights: { risk_tolerance: 1.1, behavioral_bias: 0.3 }, reverse: true },
  { id: 8, scale: 4, axisWeights: { risk_tolerance: 1.0 } },
  { id: 9, scale: 4, axisWeights: { risk_tolerance: 0.9, behavioral_bias: 0.4 } },

  // Spending Taste
  { id: 10, scale: 4, axisWeights: { spending_taste: 1.2 } },
  { id: 11, scale: 4, axisWeights: { spending_taste: 1.0, money_status: 0.6 } },
  { id: 12, scale: 4, axisWeights: { spending_taste: 1.0 } },

  // Behavioral Bias (محوری)
  // Q13/Q14 در محوردهی نیامده‌اند (فقط flags)
  { id: 15, scale: 4, axisWeights: { behavioral_bias: 1.2 }, reverse: true },
  { id: 16, scale: 4, axisWeights: { behavioral_bias: 0.8 } },

  // Money Personality (Likert)
  { id: 17, scale: 5, axisWeights: { money_avoidance: 1.0 } },
  { id: 18, scale: 5, axisWeights: { money_avoidance: 1.0 } },
  { id: 19, scale: 5, axisWeights: { money_avoidance: 1.0 } },

  { id: 20, scale: 5, axisWeights: { money_worship: 1.0 } },
  { id: 21, scale: 5, axisWeights: { money_worship: 1.0 } },
  { id: 22, scale: 5, axisWeights: { money_worship: 1.0 } },

  { id: 23, scale: 5, axisWeights: { money_status: 1.0 } },
  { id: 24, scale: 5, axisWeights: { money_status: 1.0 } },
  { id: 25, scale: 5, axisWeights: { money_status: 1.0 } },

  { id: 26, scale: 5, axisWeights: { money_vigilance: 1.0 } },
  { id: 27, scale: 5, axisWeights: { money_vigilance: 1.0 } },
  { id: 28, scale: 5, axisWeights: { money_vigilance: 1.0 } },

  // Past experience
  { id: 29, scale: 4, axisWeights: { behavioral_bias: 0.7, risk_tolerance: 0.4 } },
  { id: 30, scale: 4, axisWeights: { behavioral_bias: 0.6 } },
  { id: 31, scale: 4, axisWeights: { behavioral_bias: 1.0 }, reverse: true },

  // Motivation
  // Q32 جدا
  { id: 33, scale: 4, axisWeights: { money_motivation: 1.0 } },
  { id: 34, scale: 4, axisWeights: { money_motivation: 1.0, money_vigilance: 0.3 } },

  // Extra
  { id: 35, scale: 5, axisWeights: { money_vigilance: 1.0 } },
  { id: 36, scale: 5, axisWeights: { money_avoidance: 1.0 } },
  { id: 37, scale: 5, axisWeights: { money_worship: 1.0 } },
  { id: 38, scale: 5, axisWeights: { money_status: 1.0 } },
  { id: 39, scale: 5, axisWeights: { money_vigilance: 0.9 } },
  { id: 40, scale: 5, axisWeights: { money_status: 0.9 } },
];
