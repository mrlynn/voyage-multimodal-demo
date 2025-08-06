export interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress?: number; // 0-100
  details?: string;
}

export interface ProcessingProgress {
  currentStep: number;
  totalSteps: number;
  steps: ProgressStep[];
  overallProgress: number;
}

export type ProgressCallback = (progress: ProcessingProgress) => void;