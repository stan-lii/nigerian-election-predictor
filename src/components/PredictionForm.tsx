// src/components/PredictionForm.tsx - IMPROVED VERSION
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
  const [error, setError] = useState<string>('');

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
    'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
    'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
    'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  const validateForm = () => {
    if (!formData.state.trim()) {
      return 'Please select a state';
    }
    if (!formData.incumbent_party) {
      return 'Please select an incumbent party';
    }
    if (formData.demographic.christian_percentage + formData.demographic.muslim_percentage !== 100) {
      return 'Christian and Muslim percentages must add up to 100%';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPrediction(null);
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      // Ensure all nested state fields are set
      const cleanedFormData = {
        ...formData,
        demographic: { ...formData.demographic, state: formData.state },
        economic: { ...formData.economic, state: formData.state },
        security: { ...formData.security, state: formData.state }
      };

      console.log('Sending prediction request:', cleanedFormData);
      
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedFormData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result: PredictionResult = await response.json();
      
      // Additional validation of result
      if (!result || !result.vote_shares) {
        throw new Error('Invalid prediction result received');
      }

      // Ensure all required parties are present
      const requiredParties = ['APC', 'PDP', 'LP', 'Other'];
      for (const party of requiredParties) {
        if (typeof result.vote_shares[party] !== 'number') {
          console.warn(`Missing or invalid vote share for ${party}`);
          result.vote_shares[party] = 0;
        }
      }
      
      console.log('Prediction received:', result);
      setPrediction(result);
    } catch (error) {
      console.error('Prediction error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
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
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
                <h4 className="font-semibold">❌ Error</h4>
                <p className="mt-1">{error}</p>
              </div>
            )}

            {/* State Selection */}
            <div>
              <Label htmlFor="state">State *</Label>
              <div className="space-y-2">
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="max-h-[300px] overflow-y-auto">
                      {nigerianStates.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Alternative: Type state name in the field below
                </p>
                <Input
                  placeholder="Or type state name here..."
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  list="states-list"
                />
                <datalist id="states-list">
                  {nigerianStates.map(state => (
                    <option key={state} value={state} />
                  ))}
                </datalist>
              </div>
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
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        demographic: { 
                          ...prev.demographic, 
                          christian_percentage: value,
                          muslim_percentage: Math.max(0, 100 - value)
                        }
                      }));
                    }}
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
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        demographic: { 
                          ...prev.demographic, 
                          muslim_percentage: value,
                          christian_percentage: Math.max(0, 100 - value)
                        }
                      }));
                    }}
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
                <Label htmlFor="incumbent">Incumbent Party *</Label>
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
                    <SelectItem value="APGA">APGA</SelectItem>
                    <SelectItem value="NNPP">NNPP</SelectItem>
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
            
            <div className="text-xs text-gray-500 text-center mt-2">
              <p>⚡ Demo mode: Make sure to train the model first on the training page</p>
            </div>
          </form>
        </CardContent>
      </Card>

      {prediction && prediction.vote_shares && (
        <Card>
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-blue-600">
                  Predicted Winner: {prediction.predicted_winner || 'Unknown'}
                </h3>
                <p className="text-gray-600">
                  Confidence: {((prediction.confidence || 0) * 100).toFixed(1)}%
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Vote Share Predictions:</h4>
                {Object.entries(prediction.vote_shares || {}).map(([party, share]) => (
                  <div key={party} className="flex justify-between items-center">
                    <span className="font-medium">{party}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            party === 'APC' ? 'bg-red-500' :
                            party === 'PDP' ? 'bg-green-500' :
                            party === 'LP' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${(share || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono">{((share || 0) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Predicted Turnout:</strong> {((prediction.turnout_prediction || 0) * 100).toFixed(1)}%</p>
                <p><strong>Uncertainty Range:</strong> {((prediction.uncertainty_range?.min || 0) * 100).toFixed(1)}% - {((prediction.uncertainty_range?.max || 0) * 100).toFixed(1)}%</p>
              </div>

              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> This prediction is based on the trained model using available data. 
                  Results should be interpreted as educational estimates only.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
