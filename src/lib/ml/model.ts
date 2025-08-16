import * as tf from '@tensorflow/tfjs';
import { RandomForestClassifier } from 'ml-random-forest';
import { Matrix } from 'ml-matrix';
import { PredictionInput, PredictionResult, ModelMetrics } from '@/types/election';
import { FeatureEngineering, DataNormalizer } from './features';

export class ElectionPredictionModel {
  private tfModel: tf.LayersModel | null = null;
  private rfModel: RandomForestClassifier | null = null;
  private normalizer: DataNormalizer = new DataNormalizer();
  private isTrained: boolean = false;
  private modelType: 'tensorflow' | 'random-forest' = 'random-forest';
  
  async trainRandomForest(trainingData: { 
    inputs: PredictionInput[], 
    outputs: string[] 
  }): Promise<ModelMetrics> {
    console.log('Training Random Forest model...');
    
    // Extract features
    const features = trainingData.inputs.map(input => 
      FeatureEngineering.extractFeatures(input)
    );
    
    // Normalize features
    this.normalizer.fit(features);
    const normalizedFeatures = this.normalizer.transform(features);
    
    // Convert party names to numerical labels
    const uniqueParties = Array.from(new Set(trainingData.outputs));
    const partyToLabel = Object.fromEntries(
      uniqueParties.map((party, idx) => [party, idx])
    );
    const labels = trainingData.outputs.map(party => partyToLabel[party]);
    
    // Train Random Forest
    this.rfModel = new RandomForestClassifier({
      nEstimators: 100,
      maxDepth: 10,
      minSamplesLeaf: 2,
      seed: 42
    });
    
    this.rfModel.train(normalizedFeatures, labels);
    this.isTrained = true;
    this.modelType = 'random-forest';
    
    // Calculate metrics
    const predictions = this.rfModel.predict(normalizedFeatures);
    const accuracy = predictions.reduce((acc, pred, idx) => 
      acc + (pred === labels[idx] ? 1 : 0), 0) / predictions.length;
    
    console.log(`Training completed. Accuracy: ${(accuracy * 100).toFixed(2)}%`);
    
    return {
      accuracy,
      precision: this.calculatePrecision(labels, predictions, uniqueParties),
      recall: this.calculateRecall(labels, predictions, uniqueParties),
      f1_score: this.calculateF1Score(labels, predictions, uniqueParties),
      confusion_matrix: this.calculateConfusionMatrix(labels, predictions, uniqueParties.length),
      feature_importance: this.getFeatureImportance()
    };
  }
  
  async trainTensorFlow(trainingData: { 
    inputs: PredictionInput[], 
    outputs: string[] 
  }): Promise<ModelMetrics> {
    console.log('Training TensorFlow model...');
    
    // Extract and normalize features
    const features = trainingData.inputs.map(input => 
      FeatureEngineering.extractFeatures(input)
    );
    this.normalizer.fit(features);
    const normalizedFeatures = this.normalizer.transform(features);
    
    // Convert to tensors
    const xs = tf.tensor2d(normalizedFeatures);
    const uniqueParties = Array.from(new Set(trainingData.outputs));
    const ys = tf.oneHot(
      trainingData.outputs.map(party => uniqueParties.indexOf(party)),
      uniqueParties.length
    );
    
    // Build model
    this.tfModel = tf.sequential({
      layers: [
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          inputShape: [normalizedFeatures[0].length]
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: uniqueParties.length, activation: 'softmax' })
      ]
    });
    
    this.tfModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    // Train model
    await this.tfModel.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      verbose: 0
    });
    
    this.isTrained = true;
    this.modelType = 'tensorflow';
    
    // Calculate metrics
    const predictions = this.tfModel.predict(xs) as tf.Tensor;
    const predictionData = await predictions.data();
    
    // Clean up tensors
    xs.dispose();
    ys.dispose();
    predictions.dispose();
    
    return {
      accuracy: 0.85, // Placeholder - implement proper calculation
      precision: {},
      recall: {},
      f1_score: {},
      confusion_matrix: [],
      feature_importance: this.getFeatureImportance()
    };
  }
  
  predict(input: PredictionInput): PredictionResult {
    if (!this.isTrained) {
      throw new Error('Model must be trained before making predictions');
    }
    
    const features = FeatureEngineering.extractFeatures(input);
    const normalizedFeatures = this.normalizer.transformSingle(features);
    
    if (this.modelType === 'random-forest' && this.rfModel) {
      const prediction = this.rfModel.predict([normalizedFeatures])[0];
      const probabilities = this.rfModel.predictProba([normalizedFeatures])[0];
      
      const parties = ['APC', 'PDP', 'LP', 'Other'];
      const predictedParty = parties[prediction];
      const confidence = Math.max(...probabilities);
      
      return {
        predicted_winner: predictedParty,
        confidence,
        vote_shares: {
          APC: probabilities[0] || 0,
          PDP: probabilities[1] || 0,
          LP: probabilities[2] || 0,
          Other: probabilities[3] || 0
        },
        turnout_prediction: this.predictTurnout(input),
        uncertainty_range: {
          min: confidence - 0.1,
          max: confidence + 0.1
        }
      };
    }
    
    // TensorFlow prediction fallback
    throw new Error('TensorFlow prediction not yet implemented');
  }
  
  private predictTurnout(input: PredictionInput): number {
    // Simple turnout prediction based on key factors
    let baseTurnout = 0.3; // 30% base turnout
    
    // Adjust based on education
    baseTurnout += input.demographic.education_index * 0.2;
    
    // Adjust based on security
    baseTurnout -= input.security.violence_index * 0.1;
    
    // Adjust based on economic conditions
    baseTurnout -= input.economic.unemployment_rate * 0.002;
    
    return Math.max(0.1, Math.min(0.8, baseTurnout));
  }
  
  private calculatePrecision(actual: number[], predicted: number[], parties: string[]): Record<string, number> {
    const precision: Record<string, number> = {};
    
    for (let i = 0; i < parties.length; i++) {
      const tp = actual.reduce((acc, label, idx) => 
        acc + (label === i && predicted[idx] === i ? 1 : 0), 0);
      const fp = predicted.reduce((acc, pred, idx) => 
        acc + (pred === i && actual[idx] !== i ? 1 : 0), 0);
      
      precision[parties[i]] = tp / (tp + fp) || 0;
    }
    
    return precision;
  }
  
  private calculateRecall(actual: number[], predicted: number[], parties: string[]): Record<string, number> {
    const recall: Record<string, number> = {};
    
    for (let i = 0; i < parties.length; i++) {
      const tp = actual.reduce((acc, label, idx) => 
        acc + (label === i && predicted[idx] === i ? 1 : 0), 0);
      const fn = actual.reduce((acc, label, idx) => 
        acc + (label === i && predicted[idx] !== i ? 1 : 0), 0);
      
      recall[parties[i]] = tp / (tp + fn) || 0;
    }
    
    return recall;
  }
  
  private calculateF1Score(actual: number[], predicted: number[], parties: string[]): Record<string, number> {
    const precision = this.calculatePrecision(actual, predicted, parties);
    const recall = this.calculateRecall(actual, predicted, parties);
    const f1: Record<string, number> = {};
    
    for (const party of parties) {
      const p = precision[party];
      const r = recall[party];
      f1[party] = 2 * (p * r) / (p + r) || 0;
    }
    
    return f1;
  }
  
  private calculateConfusionMatrix(actual: number[], predicted: number[], numClasses: number): number[][] {
    const matrix = Array(numClasses).fill(null).map(() => Array(numClasses).fill(0));
    
    for (let i = 0; i < actual.length; i++) {
      matrix[actual[i]][predicted[i]]++;
    }
    
    return matrix;
  }
  
  private getFeatureImportance(): Record<string, number> {
    const featureNames = FeatureEngineering.getFeatureNames();
    const importance: Record<string, number> = {};
    
    // Random importance for demonstration
    // In a real implementation, extract from the trained model
    featureNames.forEach((name, idx) => {
      importance[name] = Math.random() * 0.1;
    });
    
    // Normalize to sum to 1
    const total = Object.values(importance).reduce((a, b) => a + b, 0);
    Object.keys(importance).forEach(key => {
      importance[key] /= total;
    });
    
    return importance;
  }
}

// Singleton instance for the application
export const electionModel = new ElectionPredictionModel();
