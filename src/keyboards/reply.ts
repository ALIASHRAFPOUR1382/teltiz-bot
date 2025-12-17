/**
 * Reply keyboard builders
 */

import { Keyboard } from 'grammy';

// Currently not used, but kept for future use
export function getMainMenuKeyboard(): Keyboard {
  return new Keyboard()
    .text('منوی اصلی')
    .row()
    .text('کوئیز')
    .text('راهنما');
}


