'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TrainPage() {
  const [isTraining, setIsTraining] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTrain = async () => {
    setIsTraining(true);
    
    // Sample training data for Nigerian states
    const trainingData = {
      inputs: [
        // Lagos - Urban, educated, mixed religion
        {
          state: 'Lagos',
          demographic: {
            state: 'Lagos', population: 15000000, youth_ratio: 0.6, education_index: 0.8,
            urban_ratio: 0.9, literacy_rate: 0.85, christian_percentage: 60, 
            muslim_percentage: 40, home_ownership_rate: 0.3
          },
          economic: { state: 'Lagos', year: 2023, gdp_growth: 3.5, unemployment_rate: 12, 
                     inflation_rate: 15, poverty_rate: 25 },
          security: { state: 'Lagos', year: 2023, security_incidents: 20, violence_index: 0.2,
                     boko_haram_activity: false, communal_conflicts: 1 },
          incumbent_party: 'APC', campaign_spending_ratio: 1.2
        },
        // Kano - Traditional, less urban, Muslim majority  
        {
          state: 'Kano',
          demographic: {
            state: 'Kano', population: 13000000, youth_ratio: 0.5, education_index: 0.4,
            urban_ratio: 0.5, literacy_rate: 0.45, christian_percentage: 10,
            muslim_percentage: 90, home_ownership_rate: 0.6
          },
          economic: { state: 'Kano', year: 2023, gdp_growth: 2.0, unemployment_rate: 18,
                     inflation_rate: 20, poverty_rate: 45 },
          security: { state: 'Kano', year: 2023, security_incidents: 15, violence_index: 0.3,
                     boko_haram_activity: false, communal_conflicts: 3 },
          incumbent_party: 'APC', campaign_spending_ratio: 1.0
        },
        // Rivers - Oil state, Southern
        {
          state: 'Rivers',
          demographic: {
            state: 'Rivers', population: 7000000, youth_ratio: 0.55, education_index: 0.7,
            urban_ratio: 0.7, literacy_rate: 0.75, christian_percentage: 85,
            muslim_percentage: 15, home_ownership_rate: 0.5
          },
          economic: { state: 'Rivers', year: 2023, gdp_growth: 4.0, unemployment_rate: 14,
                     inflation_rate: 16, poverty_rate: 30, oil_production: 500000 },
          security: { state: 'Rivers', year: 2023, security_incidents: 25, violence_index: 0.4,
                     boko_haram_activity: false, communal_conflicts: 5 },
          incumbent_party: 'PDP', campaign_spending_ratio: 1.5
        },
        // Anambra - Igbo heartland
        {
          state: 'Anambra',
          demographic: {
            state: 'Anambra', population: 5500000, youth_ratio: 0.5, education_index: 0.85,
            urban_ratio: 0.6, literacy_rate: 0.9, christian_percentage: 95,
            muslim_percentage: 5, home_ownership_rate: 0.7
          },
          economic: { state: 'Anambra', year: 2023, gdp_growth: 3.2, unemployment_rate: 10,
                     inflation_rate: 14, poverty_rate: 20 },
          security: { state: 'Anambra', year: 2023, security_incidents: 12, violence_index: 0.2,
                     boko_haram_activity: false, communal_conflicts: 2 },
          incumbent_party: 'LP', campaign_spending_ratio: 0.8
        }
      ],
      outputs: ['APC', 'APC', 'PDP', 'LP'] // Historical winners
    };

    try {
      const response = await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingData)
      });
      
      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error('Training failed:', error);
      setResult({ error: 'Training failed' });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Train Election Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Click below to train the model with sample Nigerian election data:</p>
            
            <Button 
              onClick={handleTrain} 
              disabled={isTraining}
              className="w-full"
            >
              {isTraining ? 'Training Model...' : 'Train Model with Sample Data'}
            </Button>

            {result && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <h3 className="font-semibold">Training Results:</h3>
                <pre className="text-sm mt-2 overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <h4 className="font-semibold">Training Data Includes:</h4>
              <ul className="list-disc list-inside mt-2">
                <li>4 Nigerian states with different characteristics</li>
                <li>Demographics (education, religion, urbanization)</li>
                <li>Economic indicators (GDP, unemployment, poverty)</li>
                <li>Security metrics (incidents, violence index)</li>
                <li>Political context (incumbent party, spending)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
