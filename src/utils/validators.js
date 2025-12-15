/**
 * Input validation utilities
 */

/**
 * Validate that answer is a valid choice (a, b, c, d)
 * @param {string} answer
 * @returns {boolean}
 */
function validateAnswerChoice(answer) {
  return ['a', 'b', 'c', 'd'].includes(answer.toLowerCase());
}

/**
 * Validate that category is a valid user category
 * @param {string} category
 * @returns {boolean}
 */
function validateCategory(category) {
  const validCategories = ['student_6', 'student_9', 'parent', 'teacher'];
  return validCategories.includes(category);
}

/**
 * Sanitize Telegram username
 * @param {string|null|undefined} username
 * @returns {string|null}
 */
function sanitizeUsername(username) {
  if (!username) {
    return null;
  }

  // Remove @ if present
  const cleaned = username.replace(/^@/, '');

  // Basic validation: alphanumeric and underscores only
  if (/^[a-zA-Z0-9_]+$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

/**
 * Format user display name for messages
 * @param {number} userId
 * @param {string|null} [username]
 * @param {string|null} [firstName]
 * @returns {string}
 */
function formatUserDisplayName(userId, username, firstName) {
  if (username) {
    return `@${username}`;
  } else if (firstName) {
    return firstName;
  } else {
    return `کاربر ${userId}`;
  }
}

module.exports = {
  validateAnswerChoice,
  validateCategory,
  sanitizeUsername,
  formatUserDisplayName,
};

