export enum UnitType {
  PHYSICAL = 'PHYSICAL', // Q
  MONETARY = 'MONETARY'  // V ($)
}

export enum GraphType {
  CONVENTIONAL = 'CONVENTIONAL', // IT vs CT
  CONTRIBUTION = 'CONTRIBUTION',  // MC vs CF (Triangular)
  VOLUME_RESULTS = 'VOLUME_RESULTS' // Ro vs Q (Profit/Volume)
}

export interface SimulationData {
  q: number; // Quantity
  v: number; // Sales Volume ($)
  totalRevenue: number;
  totalCost: number;
  fixedCost: number;
  variableCost: number;
  negativeVariableCost: number; // For plotting downwards
  totalContributionMargin: number; // MC total
  operatingResult: number; // Ro
  profitRange?: [number, number]; // [min, max] for filling
  lossRange?: [number, number]; // [min, max] for filling
  roProfit?: number; // Ro > 0
  roLoss?: number;   // Ro < 0
}

export interface AnalysisMetrics {
  breakEvenQ: number; // Qn
  breakEvenV: number; // Vn
  safetyMarginQ: number; // Qs
  safetyMarginV: number; // Vs
  safetyMarginPercent: number; // %
  contributionMarginUnit: number; // mc
  contributionMarginRatio: number; // rc
}