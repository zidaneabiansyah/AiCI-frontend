/**
 * Placement Test Types
 */

export type EducationLevel = 'sd_mi' | 'smp_mts' | 'sma_ma' | 'umum';
export type TestStatus = 'in_progress' | 'completed' | 'expired';
export type QuestionType = 'multiple_choice' | 'essay' | 'true_false';
export type DifficultyLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced';
export type TestCategory = 'logical_thinking' | 'problem_solving' | 'creativity' | 'technical_skills';

export interface PlacementTest {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructions: string;
  education_level: EducationLevel;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  allow_retake: boolean;
  retake_cooldown_days: number;
}

export interface TestAttempt {
  id: string;
  status: TestStatus;
  started_at: string;
  expires_at: string;
  completed_at?: string;
  score?: number;
  level_result?: DifficultyLevel;
  answered_questions: number;
  correct_answers: number;
  total_questions: number;
  time_spent_seconds: number;
}

export interface TestQuestion {
  id: string;
  question: string;
  type: QuestionType;
  category: TestCategory;
  difficulty: DifficultyLevel;
  options?: string[];
  image?: string;
  time_limit_seconds?: number;
  is_answered: boolean;
  user_answer?: string;
}

export interface TestProgress {
  answered: number;
  total: number;
  percentage: number;
}

export interface PreAssessmentData {
  full_name: string;
  email: string;
  age: number;
  education_level: EducationLevel;
  current_grade?: string;
  experience: {
    ai?: boolean;
    robotics?: boolean;
    programming?: boolean;
  };
  interests?: string[];
}

export interface TestResult {
  attempt: TestAttempt;
  result: {
    overall_score: number;
    level_achieved: DifficultyLevel;
    category_scores: Record<string, number>;
    strengths: string[];
    weaknesses: string[];
    performance_summary: string;
    next_steps: string[];
  };
  recommendations: ClassRecommendation[];
  recommendedClasses: RecommendedClass[];
}

export interface ClassRecommendation {
  class_id: string;
  match_percentage: number;
  reason: string;
}

export interface RecommendedClass {
  id: string;
  name: string;
  slug: string;
  level: DifficultyLevel;
  price: number;
  duration_hours: number;
  description: string;
  program_name: string;
}
