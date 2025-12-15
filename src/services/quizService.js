/**
 * Quiz service for quiz logic and scoring
 */

const { DatabaseManager } = require('../database/dbManager');
const { DateTime } = require('luxon');

class QuizService {
  constructor() {
    this.dbManager = new DatabaseManager();
  }

  /**
   * Get all active quiz questions
   * @returns {Promise<Array>}
   */
  async getActiveQuestions() {
    return await this.dbManager.getActiveQuizQuestions();
  }

  /**
   * Get quiz question by ID
   * @param {number} questionId
   * @returns {Promise<Object|null>}
   */
  async getQuestionById(questionId) {
    return await this.dbManager.getQuizQuestionById(questionId);
  }

  /**
   * Create a new quiz session
   * @returns {Promise<Object>}
   */
  async createQuizSession() {
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
   * @returns {Promise<Object|null>}
   */
  async getActiveSession() {
    return await this.dbManager.getActiveQuizSession();
  }

  /**
   * End a quiz session
   * @param {string} weekId
   * @returns {Promise<boolean>}
   */
  async endQuizSession(weekId) {
    return await this.dbManager.endQuizSession(weekId);
  }

  /**
   * Save user's answer to a question
   * @param {number} userId
   * @param {string} quizWeekId
   * @param {number} questionId
   * @param {string} answer
   * @returns {Promise<boolean>}
   */
  async saveUserAnswer(userId, quizWeekId, questionId, answer) {
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
   * @param {number} userId
   * @param {string} quizWeekId
   * @returns {Promise<Object|null>}
   */
  async calculateAndSaveScore(userId, quizWeekId) {
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
   * @param {string} quizWeekId
   * @param {number} [limit=3]
   * @returns {Promise<Array>}
   */
  async getTopWinners(quizWeekId, limit = 3) {
    return await this.dbManager.getTopQuizResults(quizWeekId, limit);
  }

  /**
   * Check if user has already completed a quiz
   * @param {number} userId
   * @param {string} quizWeekId
   * @returns {Promise<boolean>}
   */
  async userHasCompletedQuiz(userId, quizWeekId) {
    return await this.dbManager.userHasCompletedQuiz(userId, quizWeekId);
  }
}

module.exports = { QuizService };

