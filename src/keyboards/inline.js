/**
 * Inline keyboard builders
 */

const { InlineKeyboard } = require('grammy');

/**
 * Create inline keyboard for user category selection
 * @returns {InlineKeyboard}
 */
function getCategorySelectionKeyboard() {
  return new InlineKeyboard()
    .text('🎒 دانش‌آموز پایه ششم', 'category_student_6')
    .row()
    .text('🎓 دانش‌آموز پایه نهم', 'category_student_9')
    .row()
    .text('👨‍👩‍👧‍👦 والدین گرامی', 'category_parent')
    .row()
    .text('👩‍🏫 معلم / مشاور', 'category_teacher');
}

/**
 * Create inline keyboard for starting quiz
 * @returns {InlineKeyboard}
 */
function getQuizStartKeyboard() {
  return new InlineKeyboard().text('شروع آزمون', 'start_quiz_user');
}

/**
 * Create inline keyboard for quiz question answers
 * @param {number} questionId
 * @returns {InlineKeyboard}
 */
function getQuizAnswerKeyboard(questionId) {
  return new InlineKeyboard()
    .text('گزینه الف', `quiz_answer_${questionId}_a`)
    .text('گزینه ب', `quiz_answer_${questionId}_b`)
    .row()
    .text('گزینه ج', `quiz_answer_${questionId}_c`)
    .text('گزینه د', `quiz_answer_${questionId}_d`);
}

module.exports = {
  getCategorySelectionKeyboard,
  getQuizStartKeyboard,
  getQuizAnswerKeyboard,
};

