import { NextRequest, NextResponse } from 'next/server';
import { electionModel } from '@/lib/ml/model';
import { PredictionInput } from '@/types/election';

export async function POST(request: NextRequest) {
  try {
    const input: PredictionInput = await request.json();
    
    // Validate input
    if (!input.state || !input.demographic || !input.economic || !input.security) {
      return NextResponse.json(
        { error: 'Missing required prediction parameters' },
        { status: 400 }
      );
    }
    
    // Make prediction
    const prediction = electionModel.predict(input);
    
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Prediction API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    );
  }
}
