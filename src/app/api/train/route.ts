import { NextRequest, NextResponse } from 'next/server';
import { electionModel } from '@/lib/ml/model';
import { PredictionInput } from '@/types/election';

export async function POST(request: NextRequest) {
  try {
    const { inputs, outputs, modelType = 'random-forest' } = await request.json();
    
    if (!inputs || !outputs || inputs.length !== outputs.length) {
      return NextResponse.json(
        { error: 'Invalid training data format' },
        { status: 400 }
      );
    }
    
    let metrics;
    if (modelType === 'tensorflow') {
      metrics = await electionModel.trainTensorFlow({ inputs, outputs });
    } else {
      metrics = await electionModel.trainRandomForest({ inputs, outputs });
    }
    
    return NextResponse.json({
      message: 'Model trained successfully',
      metrics
    });
  } catch (error) {
    console.error('Training API error:', error);
    return NextResponse.json(
      { error: 'Failed to train model' },
      { status: 500 }
    );
  }
}
