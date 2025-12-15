/**
 * Reply keyboard builders
 */

const { Keyboard } = require('grammy');

// Currently not used, but kept for future use
function getMainMenuKeyboard() {
  return new Keyboard()
    .text('منوی اصلی')
    .row()
    .text('کوئیز')
    .text('راهنما');
}

module.exports = {
  getMainMenuKeyboard,
};

