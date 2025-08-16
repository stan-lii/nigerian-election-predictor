import PredictionForm from '@/components/PredictionForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Nigerian Election Predictor
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Advanced machine learning model for predicting Nigerian presidential election outcomes
          based on demographic, economic, and political factors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comprehensive Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Analyzes 25+ factors including demographics, economics, security, and political context
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Real-time Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Generate instant predictions with confidence intervals and uncertainty ranges
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historical Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Trained on election data from 1999-2023 with validated performance metrics
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <PredictionForm />

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Data Sources</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>INEC Historical Results (1999-2023)</li>
              <li>National Bureau of Statistics</li>
              <li>Central Bank of Nigeria</li>
              <li>Security & Conflict Tracking</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Key Factors</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Demographic composition & education</li>
              <li>Economic indicators & employment</li>
              <li>Security situation & violence</li>
              <li>Political context & incumbent performance</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
