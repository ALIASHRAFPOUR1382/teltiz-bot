/**
 * Database models and TypeScript interfaces
 */

export interface User {
  id?: number;
  user_id: number;
  username?: string | null;
  first_name?: string | null;
  category?: string | null; // 'student_6', 'student_9', 'parent', 'teacher', null
  joined_at?: Date | string;
}

export interface QuizQuestion {
  id?: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string; // 'a', 'b', 'c', 'd'
  is_active: boolean;
  created_at?: Date | string;
}

export interface QuizSession {
  id?: number;
  week_id: string;
  is_active: boolean;
  started_at?: Date | string;
  ended_at?: Date | string | null;
}

export interface QuizResult {
  id?: number;
  user_id: number;
  week_id: string;
  score: number;
  total_questions: number;
  completed_at?: Date | string;
}

export interface UserQuizAnswer {
  id?: number;
  user_id: number;
  question_id: number;
  week_id: string;
  selected_answer: string; // 'a', 'b', 'c', 'd'
  is_correct: boolean;
  answered_at?: Date | string;
}

export interface TopWinner {
  user_id: number;
  score: number;
  username?: string | null;
  first_name?: string | null;
}

