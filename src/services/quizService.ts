/**
 * Quiz service for quiz logic and scoring
 */

import { DatabaseManager } from '../database/dbManager';
import { QuizQuestion, QuizSession, QuizResult, TopWinner } from '../database/models';
import { DateTime } from 'luxon';

export class QuizService {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = new DatabaseManager();
  }

  /**
   * Get all active quiz questions
   */
  async getActiveQuestions(): Promise<QuizQuestion[]> {
    return await this.dbManager.getActiveQuizQuestions();
  }

  /**
   * Get quiz question by ID
   */
  async getQuestionById(questionId: number): Promise<QuizQuestion | null> {
    return await this.dbManager.getQuizQuestionById(questionId);
  }

  /**
   * Create a new quiz session
   */
  async createQuizSession(): Promise<QuizSession> {
    // Generate week_id based on current date (format: week_YYYY_WW)
    const now = DateTime.now();
    const weekId = `week_${now.year}_${now.weekNumber.toString().padStart(2, '0')}`;

    // Check if session already exists
    const existing = await this.dbManager.getQuizSessionByWeekId(weekId);
    if (existing) {
      return existing;
    }

    return await this.dbManager.createQuizSession(weekId);
  }

  /**
   * Get currently active quiz session
   */
  async getActiveSession(): Promise<QuizSession | null> {
    return await this.dbManager.getActiveQuizSession();
  }

  /**
   * End a quiz session
   */
  async endQuizSession(weekId: string): Promise<boolean> {
    return await this.dbManager.endQuizSession(weekId);
  }

  /**
   * Save user's answer to a question
   */
  async saveUserAnswer(
    userId: number,
    quizWeekId: string,
    questionId: number,
    answer: string
  ): Promise<boolean> {
    try {
      // Get question to check correct answer
      const question = await this.dbManager.getQuizQuestionById(questionId);
      if (!question) {
        return false;
      }

      const isCorrect = answer.toLowerCase() === question.correct_answer.toLowerCase();

      await this.dbManager.saveUserAnswer(
        userId,
        quizWeekId,
        questionId,
        answer,
        isCorrect
      );
      return true;
    } catch (error) {
      console.error('Error saving user answer:', error);
      return false;
    }
  }

  /**
   * Calculate user's score for a quiz and save it
   */
  async calculateAndSaveScore(
    userId: number,
    quizWeekId: string
  ): Promise<QuizResult | null> {
    try {
      // Get all user answers for this quiz
      const userAnswers = await this.dbManager.getUserAnswersForQuiz(userId, quizWeekId);

      if (userAnswers.length === 0) {
        console.warn(`No answers found for user ${userId} in quiz ${quizWeekId}`);
        return null;
      }

      // Get all questions for this quiz
      const questions = await this.dbManager.getActiveQuizQuestions();

      // Calculate score based on is_correct field
      let score = 0;
      const totalQuestions = questions.length;

      for (const answer of userAnswers) {
        if (answer.is_correct) {
          score++;
        }
      }

      // Save result
      const result = await this.dbManager.saveQuizResult(
        userId,
        score,
        totalQuestions,
        quizWeekId
      );

      console.log(`Score calculated for user ${userId}: ${score}/${totalQuestions}`);
      return result;
    } catch (error) {
      console.error('Error calculating score:', error);
      return null;
    }
  }

  /**
   * Get top winners for a quiz
   */
  async getTopWinners(quizWeekId: string, limit: number = 3): Promise<TopWinner[]> {
    return await this.dbManager.getTopQuizResults(quizWeekId, limit);
  }

  /**
   * Check if user has already completed a quiz
   */
  async userHasCompletedQuiz(userId: number, quizWeekId: string): Promise<boolean> {
    return await this.dbManager.userHasCompletedQuiz(userId, quizWeekId);
  }
}

