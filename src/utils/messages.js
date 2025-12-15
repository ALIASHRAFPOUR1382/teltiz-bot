/**
 * Message templates for bot responses
 */

const { Config } = require('../config/config');

function getWelcomeMessage(channelName = 'کانال تیزهوشان') {
  return `سلام! 👋 به خانواده بزرگ «${channelName}» خوش اومدی.

اینجا مسیر موفقیت تو در آزمون تیزهوشان رو هموار می‌کنیم.

برای اینکه بتونیم بهترین و مرتبط‌ترین محتوا رو بهت نمایش بدیم، لطفاً دسته‌بندی خودت رو انتخاب کن:`;
}

function getCategoryConfirmationMessage(categoryName) {
  return `عالی! اطلاعات شما با موفقیت ثبت شد. از این به بعد محتوای ویژه‌ای برای شما ارسال می‌شود.

🎁 هدیه خوشامدگویی ما به شما:

«چک‌لیست ۲۰ موردی آمادگی برای آزمون تیزهوشان در یک هفته آخر»

برای دانلود روی لینک زیر کلیک کن:

${Config.WELCOME_GIFT_LINK}

به خانواده ما خوش آمدی! 🚀`;
}

function getQuizAnnouncementMessage(channelName = 'کانال تیزهوشان') {
  return `🚀 کوئیز هفتگی «${channelName}» شروع شد!

آماده‌ای تا دانش خودت رو محک بزنی؟

۱۰ سوال هیجان‌انگیز در انتظار توئه.

برای شروع، روی دکمه زیر کلیک کن! 👇`;
}

function getQuizQuestionMessage(questionNumber, totalQuestions, questionText) {
  return `سوال ${questionNumber} از ${totalQuestions}:

${questionText}`;
}

function getQuizCompletionMessage(score, totalQuestions) {
  return `🏁 آزمون شما به پایان رسید!

نمره شما از ${totalQuestions}: ${score}

برای دیدن نتایج کامل و برندگان، کانال را دنبال کن.

موفق باشی! 🌟`;
}

function getQuizWinnersMessage(weekId, winners, channelName = 'کانال تیزهوشان') {
  let message = `🏆 نتایج کوئیز هفته «${channelName}» اعلام شد!

از همه شرکت‌کنندگان عزیز سپاسگزاریم.

تبریک به ۳ نفر برتر این هفته که بالاترین نمرات رو کسب کردن:

`;

  const medals = ['🥇', '🥈', '🥉'];
  const positions = ['مقام اول', 'مقام دوم', 'مقام سوم'];

  for (let i = 0; i < Math.min(winners.length, 3); i++) {
    const winner = winners[i];
    const medal = medals[i] || '🏅';
    const position = positions[i] || `مقام ${i + 1}`;

    // Format user display name
    let userDisplay;
    if (winner.username) {
      userDisplay = `@${winner.username}`;
    } else if (winner.first_name) {
      userDisplay = winner.first_name;
    } else {
      userDisplay = `کاربر ${winner.user_id}`;
    }

    message += `${medal} ${position}: ${userDisplay} با نمره ${winner.score}\n`;
  }

  message += '\nقهرمانان برای دریافت جایزه خود با ادمین کانال در ارتباط باشید.\n\nتا هفته بعد! 👋';

  return message;
}

function getStartCommandMessage() {
  return `سلام! 👋

به ربات مدیریت کانال تیزهوشان خوش آمدی.

این ربات برای مدیریت و تعامل با اعضای کانال طراحی شده است.

اگر عضو کانال هستی، پیام‌های ویژه‌ای برای تو ارسال می‌شه!`;
}

function getAdminHelpMessage() {
  return `دستورات مدیریتی:

/startquiz - شروع کوئیز هفتگی جدید
/endquiz - پایان کوئیز و اعلام برندگان
/broadcast <پیام> - ارسال پیام به تمام کاربران

برای استفاده از دستورات، لطفاً دستور را به همراه پارامترهای لازم ارسال کنید.`;
}

module.exports = {
  getWelcomeMessage,
  getCategoryConfirmationMessage,
  getQuizAnnouncementMessage,
  getQuizQuestionMessage,
  getQuizCompletionMessage,
  getQuizWinnersMessage,
  getStartCommandMessage,
  getAdminHelpMessage,
};

