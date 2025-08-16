'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TrainPage() {
  const [isTraining, setIsTraining] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [dataSource, setDataSource] = useState<'sample' | 'upload'>('sample');

  // Sample data as fallback
  const sampleTrainingData = {
    inputs: [
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
    outputs: ['APC', 'APC', 'PDP', 'LP']
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        if (!data.inputs || !data.outputs) {
          throw new Error('Data must have "inputs" and "outputs" arrays');
        }
        
        if (data.inputs.length !== data.outputs.length) {
          throw new Error('Inputs and outputs must have the same length');
        }

        // Validate each input has required fields
        for (let i = 0; i < data.inputs.length; i++) {
          const input = data.inputs[i];
          if (!input.state || !input.demographic || !input.economic || !input.security) {
            throw new Error(`Input ${i} is missing required fields (state, demographic, economic, security)`);
          }
        }

        setUploadedData(data);
        setDataSource('upload');
        setResult(null); // Clear previous results
        
      } catch (error) {
        alert(`Invalid data file: ${error.message}`);
        setUploadedData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleTrain = async () => {
    setIsTraining(true);
    
    // Use uploaded data if available, otherwise use sample data
    const trainingData = dataSource === 'upload' && uploadedData ? uploadedData : sampleTrainingData;

    try {
      const response = await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingData)
      });
      
      if (!response.ok) {
        throw new Error(`Training failed: ${response.status}`);
      }
      
      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error('Training failed:', error);
      setResult({ error: `Training failed: ${error.message}` });
    } finally {
      setIsTraining(false);
    }
  };

  const downloadSampleData = () => {
    const dataStr = JSON.stringify(sampleTrainingData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'sample-training-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Training Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="data-upload">Upload Training Data (JSON)</Label>
              <Input
                id="data-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500">
                Upload a JSON file with Nigerian election training data
              </p>
            </div>

            {/* Data Status */}
            {uploadedData && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800">✅ Data Loaded Successfully</h4>
                <div className="text-sm text-green-700 mt-2">
                  <p><strong>Training Examples:</strong> {uploadedData.inputs?.length || 0}</p>
                  <p><strong>States Covered:</strong> {Array.from(new Set(uploadedData.inputs?.map(i => i.state))).length}</p>
                  <p><strong>Parties:</strong> {Array.from(new Set(uploadedData.outputs)).join(', ')}</p>
                </div>
              </div>
            )}

            {/* Sample Data Option */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="sample-data"
                  name="data-source"
                  checked={dataSource === 'sample'}
                  onChange={() => setDataSource('sample')}
                />
                <Label htmlFor="sample-data">Use Sample Data (4 states)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="upload-data"
                  name="data-source"
                  checked={dataSource === 'upload'}
                  onChange={() => setDataSource('upload')}
                  disabled={!uploadedData}
                />
                <Label htmlFor="upload-data">Use Uploaded Data</Label>
              </div>
            </div>

            {/* Download Sample */}
            <Button 
              variant="outline" 
              onClick={downloadSampleData}
              className="w-full"
            >
              📥 Download Sample Data Template
            </Button>

            {/* Train Button */}
            <Button 
              onClick={handleTrain} 
              disabled={isTraining || (dataSource === 'upload' && !uploadedData)}
              className="w-full"
              size="lg"
            >
              {isTraining ? 'Training Model...' : `Train Model ${dataSource === 'upload' ? 'with Uploaded Data' : 'with Sample Data'}`}
            </Button>
          </CardContent>
        </Card>

        {/* Data Format Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Data Format Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <h4 className="font-semibold mb-2">Required JSON Structure:</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
{`{
  "inputs": [
    {
      "state": "Lagos",
      "demographic": {
        "state": "Lagos",
        "population": 15000000,
        "youth_ratio": 0.6,
        "education_index": 0.8,
        "urban_ratio": 0.9,
        "literacy_rate": 0.85,
        "christian_percentage": 60,
        "muslim_percentage": 40,
        "home_ownership_rate": 0.3
      },
      "economic": {
        "state": "Lagos",
        "year": 2023,
        "gdp_growth": 3.5,
        "unemployment_rate": 12,
        "inflation_rate": 15,
        "poverty_rate": 25
      },
      "security": {
        "state": "Lagos",
        "year": 2023,
        "security_incidents": 20,
        "violence_index": 0.2,
        "boko_haram_activity": false,
        "communal_conflicts": 1
      },
      "incumbent_party": "APC",
      "campaign_spending_ratio": 1.2
    }
  ],
  "outputs": ["APC"]
}`}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Field Explanations:</h4>
              <div className="text-sm space-y-1">
                <p><strong>youth_ratio:</strong> 0.0-1.0 (18-35 age group percentage)</p>
                <p><strong>education_index:</strong> 0.0-1.0 (education level)</p>
                <p><strong>violence_index:</strong> 0.0-1.0 (security threat level)</p>
                <p><strong>incumbent_party:</strong> APC, PDP, LP, or Other</p>
                <p><strong>outputs:</strong> Winning party for each input</p>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-1">💡 Pro Tips:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Include all 36 states + FCT for best results</li>
                <li>• Use data from multiple election cycles (2015, 2019, 2023)</li>
                <li>• Ensure data quality and consistency</li>
                <li>• Download the sample template as a starting point</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Training Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
                <h4 className="font-semibold">❌ Training Failed</h4>
                <p className="mt-1">{result.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <h4 className="font-semibold text-green-800">✅ Model Trained Successfully!</h4>
                  <p className="text-green-700 mt-1">You can now make predictions on the main page.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <h5 className="font-semibold">Accuracy</h5>
                    <p className="text-2xl font-bold text-blue-600">
                      {(result.metrics?.accuracy * 100 || 0).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <h5 className="font-semibold">Training Examples</h5>
                    <p className="text-2xl font-bold text-green-600">
                      {dataSource === 'upload' ? uploadedData?.inputs?.length || 0 : 4}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <h5 className="font-semibold">Model Type</h5>
                    <p className="text-lg font-semibold text-purple-600">Random Forest</p>
                  </div>
                </div>
                
                <details className="border rounded p-3">
                  <summary className="cursor-pointer font-semibold">View Detailed Metrics</summary>
                  <pre className="text-xs mt-2 overflow-auto bg-gray-100 p-2 rounded">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
