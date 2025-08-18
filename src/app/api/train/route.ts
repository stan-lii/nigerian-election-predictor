// src/app/api/train/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { electionModel } from '@/lib/ml/model';
import { PredictionInput, EconomicData, SecurityData } from '@/types/election';

export async function POST(request: NextRequest) {
  try {
    const { inputs, outputs, modelType = 'random-forest' } = await request.json();
    
    if (!inputs || !outputs || inputs.length !== outputs.length) {
      return NextResponse.json(
        { error: 'Invalid training data format' },
        { status: 400 }
      );
    }

    // Validate that inputs are properly structured
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      
      if (!input.state || !input.demographic || !input.economic || !input.security) {
        return NextResponse.json(
          { error: `Input ${i} is missing required fields (state, demographic, economic, security)` },
          { status: 400 }
        );
      }

      // Check if economic/security are arrays (old format) and transform them
      if (Array.isArray(input.economic)) {
        console.log(`Transforming economic data for ${input.state}`);
        // Get the most recent data (2023 or first item) with explicit typing
        const recentEconomic = input.economic.find((e: EconomicData) => e.year === 2023) || input.economic[0];
        inputs[i].economic = recentEconomic;
      }

      if (Array.isArray(input.security)) {
        console.log(`Transforming security data for ${input.state}`);
        // Get the most recent data (2023 or first item) with explicit typing
        const recentSecurity = input.security.find((s: SecurityData) => s.year === 2023) || input.security[0];
        inputs[i].security = recentSecurity;
      }

      // Validate required fields exist after transformation
      if (!inputs[i].economic.unemployment_rate && inputs[i].economic.unemployment_rate !== 0) {
        return NextResponse.json(
          { error: `Input ${i} has invalid economic data structure - missing unemployment_rate` },
          { status: 400 }
        );
      }

      if (!inputs[i].security.violence_index && inputs[i].security.violence_index !== 0) {
        return NextResponse.json(
          { error: `Input ${i} has invalid security data structure - missing violence_index` },
          { status: 400 }
        );
      }
    }

    console.log(`Training with ${inputs.length} examples`);
    
    let metrics;
    if (modelType === 'tensorflow') {
      metrics = await electionModel.trainTensorFlow({ inputs, outputs });
    } else {
      metrics = await electionModel.trainRandomForest({ inputs, outputs });
    }
    
    console.log('Training completed successfully');
    
    return NextResponse.json({
      message: 'Model trained successfully',
      metrics,
      trainingData: {
        examples: inputs.length,
        states: Array.from(new Set(inputs.map((i: PredictionInput) => i.state))).length,
        parties: Array.from(new Set(outputs))
      }
    });
  } catch (error) {
    console.error('Training API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to train model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
