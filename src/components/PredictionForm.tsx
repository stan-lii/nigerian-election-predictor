'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { PredictionInput, PredictionResult } from '@/types/election';

export default function PredictionForm() {
  const [formData, setFormData] = useState<PredictionInput>({
    state: '',
    demographic: {
      state: '',
      population: 0,
      youth_ratio: 0.4,
      education_index: 0.5,
      urban_ratio: 0.3,
      literacy_rate: 0.6,
      christian_percentage: 50,
      muslim_percentage: 50,
      home_ownership_rate: 0.4
    },
    economic: {
      state: '',
      year: 2024,
      gdp_growth: 2.5,
      unemployment_rate: 15,
      inflation_rate: 18,
      poverty_rate: 40
    },
    security: {
      state: '',
      year: 2024,
      security_incidents: 10,
      violence_index: 0.3,
      boko_haram_activity: false,
      communal_conflicts: 2
    },
    incumbent_party: '',
    campaign_spending_ratio: 1.0
  });
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
    'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
    'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
    'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result: PredictionResult = await response.json();
      setPrediction(result);
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Election Prediction Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* State Selection */}
            <div>
              <Label htmlFor="state">State</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {nigerianStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Demographic Factors */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Demographics</h3>
              
              <div>
                <Label>Youth Ratio (18-35): {(formData.demographic.youth_ratio * 100).toFixed(0)}%</Label>
                <Slider
                  value={[formData.demographic.youth_ratio]}
                  onValueChange={([value]) => 
                    setFormData(prev => ({
                      ...prev,
                      demographic: { ...prev.demographic, youth_ratio: value }
                    }))
                  }
                  max={1}
                  step={0.01}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Education Index: {(formData.demographic.education_index * 100).toFixed(0)}%</Label>
                <Slider
                  value={[formData.demographic.education_index]}
                  onValueChange={([value]) => 
                    setFormData(prev => ({
                      ...prev,
                      demographic: { ...prev.demographic, education_index: value }
                    }))
                  }
                  max={1}
                  step={0.01}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Urban Population: {(formData.demographic.urban_ratio * 100).toFixed(0)}%</Label>
                <Slider
                  value={[formData.demographic.urban_ratio]}
                  onValueChange={([value]) => 
                    setFormData(prev => ({
                      ...prev,
                      demographic: { ...prev.demographic, urban_ratio: value }
                    }))
                  }
                  max={1}
                  step={0.01}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="christian">Christian %</Label>
                  <Input
                    id="christian"
                    type="number"
                    value={formData.demographic.christian_percentage}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        demographic: { 
                          ...prev.demographic, 
                          christian_percentage: Number(e.target.value),
                          muslim_percentage: 100 - Number(e.target.value)
                        }
                      }))
                    }
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <Label htmlFor="muslim">Muslim %</Label>
                  <Input
                    id="muslim"
                    type="number"
                    value={formData.demographic.muslim_percentage}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        demographic: { 
                          ...prev.demographic, 
                          muslim_percentage: Number(e.target.value),
                          christian_percentage: 100 - Number(e.target.value)
                        }
                      }))
                    }
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            </div>

            {/* Economic Factors */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Economic Indicators</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gdp">GDP Growth %</Label>
                  <Input
                    id="gdp"
                    type="number"
                    value={formData.economic.gdp_growth}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        economic: { ...prev.economic, gdp_growth: Number(e.target.value) }
                      }))
                    }
                    step={0.1}
                  />
                </div>
                <div>
                  <Label htmlFor="unemployment">Unemployment %</Label>
                  <Input
                    id="unemployment"
                    type="number"
                    value={formData.economic.unemployment_rate}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        economic: { ...prev.economic, unemployment_rate: Number(e.target.value) }
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inflation">Inflation %</Label>
                  <Input
                    id="inflation"
                    type="number"
                    value={formData.economic.inflation_rate}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        economic: { ...prev.economic, inflation_rate: Number(e.target.value) }
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="poverty">Poverty Rate %</Label>
                  <Input
                    id="poverty"
                    type="number"
                    value={formData.economic.poverty_rate}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        economic: { ...prev.economic, poverty_rate: Number(e.target.value) }
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Security Factors */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Security Situation</h3>
              
              <div>
                <Label>Violence Index: {(formData.security.violence_index * 100).toFixed(0)}%</Label>
                <Slider
                  value={[formData.security.violence_index]}
                  onValueChange={([value]) => 
                    setFormData(prev => ({
                      ...prev,
                      security: { ...prev.security, violence_index: value }
                    }))
                  }
                  max={1}
                  step={0.01}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incidents">Security Incidents</Label>
                  <Input
                    id="incidents"
                    type="number"
                    value={formData.security.security_incidents}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        security: { ...prev.security, security_incidents: Number(e.target.value) }
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="conflicts">Communal Conflicts</Label>
                  <Input
                    id="conflicts"
                    type="number"
                    value={formData.security.communal_conflicts}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        security: { ...prev.security, communal_conflicts: Number(e.target.value) }
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Political Factors */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Political Context</h3>
              
              <div>
                <Label htmlFor="incumbent">Incumbent Party</Label>
                <Select
                  value={formData.incumbent_party}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, incumbent_party: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select incumbent party" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APC">APC</SelectItem>
                    <SelectItem value="PDP">PDP</SelectItem>
                    <SelectItem value="LP">Labour Party</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Campaign Spending Ratio: {formData.campaign_spending_ratio.toFixed(1)}x</Label>
                <Slider
                  value={[formData.campaign_spending_ratio]}
                  onValueChange={([value]) => 
                    setFormData(prev => ({ ...prev, campaign_spending_ratio: value }))
                  }
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Predicting...' : 'Generate Prediction'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {prediction && (
        <Card>
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-blue-600">
                  Predicted Winner: {prediction.predicted_winner}
                </h3>
                <p className="text-gray-600">
                  Confidence: {(prediction.confidence * 100).toFixed(1)}%
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Vote Share Predictions:</h4>
                {Object.entries(prediction.vote_shares).map(([party, share]) => (
                  <div key={party} className="flex justify-between items-center">
                    <span>{party}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${share * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{(share * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Predicted Turnout:</strong> {(prediction.turnout_prediction * 100).toFixed(1)}%</p>
                <p><strong>Uncertainty Range:</strong> {(prediction.uncertainty_range.min * 100).toFixed(1)}% - {(prediction.uncertainty_range.max * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
