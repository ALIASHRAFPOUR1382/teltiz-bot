/**
 * Input validation utilities
 */

/**
 * Validate that answer is a valid choice (a, b, c, d)
 */
export function validateAnswerChoice(answer: string): boolean {
  return ['a', 'b', 'c', 'd'].includes(answer.toLowerCase());
}

/**
 * Validate that category is a valid user category
 */
export function validateCategory(category: string): boolean {
  const validCategories = ['student_6', 'student_9', 'parent', 'teacher'];
  return validCategories.includes(category);
}

/**
 * Sanitize Telegram username
 */
export function sanitizeUsername(username: string | null | undefined): string | null {
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
 */
export function formatUserDisplayName(
  userId: number,
  username?: string | null,
  firstName?: string | null
): string {
  if (username) {
    return `@${username}`;
  } else if (firstName) {
    return firstName;
  } else {
    return `کاربر ${userId}`;
  }
}


