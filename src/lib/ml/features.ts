import { PredictionInput, DemographicData, EconomicData, SecurityData } from '@/types/election';

export class FeatureEngineering {
  static extractFeatures(input: PredictionInput): number[] {
    const features: number[] = [];
    
    // Demographic features
    features.push(
      input.demographic.youth_ratio,
      input.demographic.education_index,
      input.demographic.urban_ratio,
      input.demographic.literacy_rate,
      input.demographic.christian_percentage,
      input.demographic.muslim_percentage,
      input.demographic.home_ownership_rate
    );
    
    // Economic features
    features.push(
      input.economic.gdp_growth,
      input.economic.unemployment_rate,
      input.economic.inflation_rate,
      input.economic.poverty_rate
    );
    
    // Security features
    features.push(
      input.security.security_incidents / 100, // Normalize
      input.security.violence_index,
      input.security.boko_haram_activity ? 1 : 0,
      input.security.communal_conflicts / 10 // Normalize
    );
    
    // Political features
    features.push(
      input.incumbent_party === 'APC' ? 1 : 0,
      input.incumbent_party === 'PDP' ? 1 : 0,
      input.campaign_spending_ratio
    );
    
    // Regional encoding (one-hot)
    const zones = ['NW', 'NE', 'NC', 'SW', 'SE', 'SS'];
    const stateToZone = this.getStateGeopoliticalZone(input.state);
    zones.forEach(zone => {
      features.push(stateToZone === zone ? 1 : 0);
    });
    
    // Derived features
    features.push(
      // Economic pressure index
      (input.economic.unemployment_rate + input.economic.inflation_rate + input.economic.poverty_rate) / 3,
      // Religious dominance
      Math.abs(input.demographic.christian_percentage - input.demographic.muslim_percentage),
      // Development index
      (input.demographic.education_index + input.demographic.urban_ratio + input.demographic.literacy_rate) / 3,
      // Security threat level
      input.security.security_incidents > 50 ? 1 : 0
    );
    
    return features;
  }
  
  static getFeatureNames(): string[] {
    return [
      'youth_ratio', 'education_index', 'urban_ratio', 'literacy_rate',
      'christian_percentage', 'muslim_percentage', 'home_ownership_rate',
      'gdp_growth', 'unemployment_rate', 'inflation_rate', 'poverty_rate',
      'security_incidents', 'violence_index', 'boko_haram_activity', 'communal_conflicts',
      'incumbent_apc', 'incumbent_pdp', 'campaign_spending_ratio',
      'zone_nw', 'zone_ne', 'zone_nc', 'zone_sw', 'zone_se', 'zone_ss',
      'economic_pressure', 'religious_dominance', 'development_index', 'high_security_threat'
    ];
  }
  
  private static getStateGeopoliticalZone(state: string): string {
    const zoneMapping: Record<string, string> = {
      // North-West
      'Kano': 'NW', 'Kaduna': 'NW', 'Katsina': 'NW', 'Kebbi': 'NW',
      'Jigawa': 'NW', 'Sokoto': 'NW', 'Zamfara': 'NW',
      // North-East
      'Borno': 'NE', 'Yobe': 'NE', 'Bauchi': 'NE', 'Gombe': 'NE',
      'Adamawa': 'NE', 'Taraba': 'NE',
      // North-Central
      'Niger': 'NC', 'Kwara': 'NC', 'Kogi': 'NC', 'Benue': 'NC',
      'Plateau': 'NC', 'Nasarawa': 'NC', 'FCT': 'NC',
      // South-West
      'Lagos': 'SW', 'Ogun': 'SW', 'Oyo': 'SW', 'Osun': 'SW',
      'Ondo': 'SW', 'Ekiti': 'SW',
      // South-East
      'Abia': 'SE', 'Anambra': 'SE', 'Ebonyi': 'SE', 'Enugu': 'SE',
      'Imo': 'SE',
      // South-South
      'Akwa Ibom': 'SS', 'Bayelsa': 'SS', 'Cross River': 'SS',
      'Delta': 'SS', 'Edo': 'SS', 'Rivers': 'SS'
    };
    
    return zoneMapping[state] || 'NC';
  }
}

export class DataNormalizer {
  private mean: number[] = [];
  private std: number[] = [];
  
  fit(data: number[][]): void {
    const numFeatures = data[0].length;
    this.mean = new Array(numFeatures).fill(0);
    this.std = new Array(numFeatures).fill(1);
    
    // Calculate mean
    for (let i = 0; i < numFeatures; i++) {
      this.mean[i] = data.reduce((sum, row) => sum + row[i], 0) / data.length;
    }
    
    // Calculate standard deviation
    for (let i = 0; i < numFeatures; i++) {
      const variance = data.reduce((sum, row) => 
        sum + Math.pow(row[i] - this.mean[i], 2), 0) / data.length;
      this.std[i] = Math.sqrt(variance) || 1;
    }
  }
  
  transform(data: number[][]): number[][] {
    return data.map(row => 
      row.map((value, i) => (value - this.mean[i]) / this.std[i])
    );
  }
  
  transformSingle(row: number[]): number[] {
    return row.map((value, i) => (value - this.mean[i]) / this.std[i]);
  }
}
