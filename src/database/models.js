/**
 * Database models and TypeScript interfaces
 * (JSDoc comments for documentation)
 */

/**
 * @typedef {Object} User
 * @property {number} [id]
 * @property {number} user_id
 * @property {string|null} [username]
 * @property {string|null} [first_name]
 * @property {string|null} [category] - 'student_6', 'student_9', 'parent', 'teacher', null
 * @property {Date|string} [joined_at]
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {number} [id]
 * @property {string} question_text
 * @property {string} option_a
 * @property {string} option_b
 * @property {string} option_c
 * @property {string} option_d
 * @property {string} correct_answer - 'a', 'b', 'c', 'd'
 * @property {boolean} is_active
 * @property {Date|string} [created_at]
 */

/**
 * @typedef {Object} QuizSession
 * @property {number} [id]
 * @property {string} week_id
 * @property {boolean} is_active
 * @property {Date|string} [started_at]
 * @property {Date|string|null} [ended_at]
 */

/**
 * @typedef {Object} QuizResult
 * @property {number} [id]
 * @property {number} user_id
 * @property {string} week_id
 * @property {number} score
 * @property {number} total_questions
 * @property {Date|string} [completed_at]
 */

/**
 * @typedef {Object} UserQuizAnswer
 * @property {number} [id]
 * @property {number} user_id
 * @property {number} question_id
 * @property {string} week_id
 * @property {string} selected_answer - 'a', 'b', 'c', 'd'
 * @property {boolean} is_correct
 * @property {Date|string} [answered_at]
 */

/**
 * @typedef {Object} TopWinner
 * @property {number} user_id
 * @property {number} score
 * @property {string|null} [username]
 * @property {string|null} [first_name]
 */

// Export empty object for compatibility
module.exports = {};

