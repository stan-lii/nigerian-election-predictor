// src/types/election.ts - UPDATED WITH BETTER TYPE SAFETY
export interface ElectionData {
  state: string;
  geopolitical_zone: 'NW' | 'NE' | 'NC' | 'SW' | 'SE' | 'SS';
  year: number;
  winning_party: 'APC' | 'PDP' | 'LP' | 'Other';
  vote_share_apc: number;
  vote_share_pdp: number;
  vote_share_lp: number;
  voter_turnout: number;
  total_votes: number;
  registered_voters: number;
}

export interface DemographicData {
  state: string;
  population: number;
  youth_ratio: number;
  education_index: number;
  urban_ratio: number;
  literacy_rate: number;
  christian_percentage: number;
  muslim_percentage: number;
  home_ownership_rate: number;
}

export interface EconomicData {
  state: string;
  year: number;
  gdp_growth: number;
  unemployment_rate: number;
  inflation_rate: number;
  poverty_rate: number;
  oil_production?: number;
}

export interface SecurityData {
  state: string;
  year: number;
  security_incidents: number;
  violence_index: number;
  boko_haram_activity: boolean;
  communal_conflicts: number;
}

export interface PredictionInput {
  state: string;
  demographic: DemographicData;
  economic: EconomicData;
  security: SecurityData;
  incumbent_party: string;
  campaign_spending_ratio: number;
}

// Define valid party types
export type PartyType = 'APC' | 'PDP' | 'LP' | 'Other';

// More type-safe vote shares interface
export interface VoteShares {
  APC: number;
  PDP: number;
  LP: number;
  Other: number;
}

export interface PredictionResult {
  predicted_winner: string;
  confidence: number;
  vote_shares: VoteShares;
  turnout_prediction: number;
  uncertainty_range: {
    min: number;
    max: number;
  };
}

export interface ModelMetrics {
  accuracy: number;
  precision: Record<string, number>;
  recall: Record<string, number>;
  f1_score: Record<string, number>;
  confusion_matrix: number[][];
  feature_importance: Record<string, number>;
}

// Helper type for API responses
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Training data structure
export interface TrainingData {
  inputs: PredictionInput[];
  outputs: string[];
}
