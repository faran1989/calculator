// app/tools/financial-taste/engine/financialTaste.q32.v1.ts
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

export type Q32OptionKey =
  | "security"
  | "freedom"
  | "luxury"
  | "giving"
  | "status"
  | "growth";

export interface Q32Vector {
  axis: Partial<Record<Axis, number>>;
}

export const Q32_VECTORS_V1: Record<Q32OptionKey, Q32Vector> = {
  security: { axis: { money_motivation: 1.0, money_vigilance: 0.7, risk_tolerance: -0.2 } },
  freedom: { axis: { money_motivation: 1.0, risk_tolerance: 0.2, money_vigilance: 0.1 } },
  luxury:  { axis: { money_motivation: 1.0, spending_taste: 0.6, money_worship: 0.5, money_status: 0.3 } },
  giving:  { axis: { money_motivation: 1.0, money_vigilance: 0.1 } },
  status:  { axis: { money_motivation: 1.0, money_status: 0.9, spending_taste: 0.2, money_worship: 0.3 } },
  growth:  { axis: { money_motivation: 1.0, risk_tolerance: 0.4, money_vigilance: 0.2 } },
};

export interface Q32ComputeConfig {
  clampMin?: number;
  clampMax?: number;
  motivationBoostPerSelection?: number;
  motivationBoostCap?: number;
  aggregation?: "mean" | "sumNormalized";
}

const DEFAULT_CFG: Required<Q32ComputeConfig> = {
  clampMin: 0,
  clampMax: 100,
  motivationBoostPerSelection: 3,
  motivationBoostCap: 12,
  aggregation: "mean",
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function computeQ32AxisInjection(
  selected: Q32OptionKey[],
  cfg?: Q32ComputeConfig
): Partial<Record<Axis, number>> {
  const C = { ...DEFAULT_CFG, ...(cfg ?? {}) };
  if (!selected || selected.length === 0) return {};

  const acc: Partial<Record<Axis, number>> = {};
  let count = 0;

  for (const key of selected) {
    const vec = Q32_VECTORS_V1[key];
    if (!vec) continue;
    count += 1;
    for (const [axis, w] of Object.entries(vec.axis) as [Axis, number][]) {
      acc[axis] = (acc[axis] ?? 0) + w;
    }
  }
  if (count === 0) return {};

  const out: Partial<Record<Axis, number>> = {};
  for (const [axis, v] of Object.entries(acc) as [Axis, number][]) {
    const unit = C.aggregation === "mean" ? v / count : v / count;
    let score = Math.round(unit * 100);
    score = clamp(score, -100, 100);
    out[axis] = score;
  }

  const boost = clamp(count * C.motivationBoostPerSelection, 0, C.motivationBoostCap);
  if (typeof out.money_motivation === "number") {
    out.money_motivation = clamp(out.money_motivation + boost, C.clampMin, C.clampMax);
  } else {
    out.money_motivation = clamp(60 + boost, C.clampMin, C.clampMax);
  }

  return out;
}

export interface CombineQ32Config {
  alpha?: number; // اثر نرم
}

export function applyQ32InjectionToAxes(
  baseAxes: Record<Axis, number>,
  injection: Partial<Record<Axis, number>>,
  cfg?: CombineQ32Config
): Record<Axis, number> {
  const alpha = cfg?.alpha ?? 0.25;
  const out = { ...baseAxes };

  for (const [axis, inj] of Object.entries(injection) as [Axis, number][]) {
    if (typeof inj !== "number") continue;
    const base = out[axis] ?? 0;
    out[axis] = clamp(Math.round(base + inj * alpha), 0, 100);
  }

  return out;
}
