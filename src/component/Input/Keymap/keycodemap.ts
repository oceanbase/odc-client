import { isMac } from '@/util/env';
import { KeyCode, KeyMod } from 'monaco-editor';

export const KEY_CODE_MAP: Record<number, KeyCode> = {
  3: KeyCode.PauseBreak,
  8: KeyCode.Backspace,
  9: KeyCode.Tab,
  13: KeyCode.Enter,
  16: KeyCode.Shift,
  17: KeyCode.Ctrl,
  18: KeyCode.Alt,
  19: KeyCode.PauseBreak,
  20: KeyCode.CapsLock,
  27: KeyCode.Escape,
  32: KeyCode.Space,
  33: KeyCode.PageUp,
  34: KeyCode.PageDown,
  35: KeyCode.End,
  36: KeyCode.Home,
  37: KeyCode.LeftArrow,
  38: KeyCode.UpArrow,
  39: KeyCode.RightArrow,
  40: KeyCode.DownArrow,
  45: KeyCode.Insert,
  46: KeyCode.Delete,
  48: KeyCode.Digit0,
  49: KeyCode.Digit1,
  50: KeyCode.Digit2,
  51: KeyCode.Digit3,
  52: KeyCode.Digit4,
  53: KeyCode.Digit5,
  54: KeyCode.Digit6,
  55: KeyCode.Digit7,
  56: KeyCode.Digit8,
  57: KeyCode.Digit9,
  65: KeyCode.KeyA,
  66: KeyCode.KeyB,
  67: KeyCode.KeyC,
  68: KeyCode.KeyD,
  69: KeyCode.KeyE,
  70: KeyCode.KeyF,
  71: KeyCode.KeyG,
  72: KeyCode.KeyH,
  73: KeyCode.KeyI,
  74: KeyCode.KeyJ,
  75: KeyCode.KeyK,
  76: KeyCode.KeyL,
  77: KeyCode.KeyM,
  78: KeyCode.KeyN,
  79: KeyCode.KeyO,
  80: KeyCode.KeyP,
  81: KeyCode.KeyQ,
  82: KeyCode.KeyR,
  83: KeyCode.KeyS,
  84: KeyCode.KeyT,
  85: KeyCode.KeyU,
  86: KeyCode.KeyV,
  87: KeyCode.KeyW,
  88: KeyCode.KeyX,
  89: KeyCode.KeyY,
  90: KeyCode.KeyZ,
  91: KeyCode.Meta,
  92: KeyCode.Meta,
  93: KeyCode.Meta,
  96: KeyCode.Numpad0,
  97: KeyCode.Numpad1,
  98: KeyCode.Numpad2,
  99: KeyCode.Numpad3,
  100: KeyCode.Numpad4,
  101: KeyCode.Numpad5,
  102: KeyCode.Numpad6,
  103: KeyCode.Numpad7,
  104: KeyCode.Numpad8,
  105: KeyCode.Numpad9,
  106: KeyCode.NumpadMultiply,
  107: KeyCode.NumpadAdd,
  108: KeyCode.NUMPAD_SEPARATOR,
  109: KeyCode.NumpadSubtract,
  110: KeyCode.NumpadDecimal,
  111: KeyCode.NumpadDivide,
  112: KeyCode.F1,
  113: KeyCode.F2,
  114: KeyCode.F3,
  115: KeyCode.F4,
  116: KeyCode.F5,
  117: KeyCode.F6,
  118: KeyCode.F7,
  119: KeyCode.F8,
  120: KeyCode.F9,
  121: KeyCode.F10,
  122: KeyCode.F11,
  123: KeyCode.F12,
  124: KeyCode.F13,
  125: KeyCode.F14,
  126: KeyCode.F15,
  127: KeyCode.F16,
  128: KeyCode.F17,
  129: KeyCode.F18,
  130: KeyCode.F19,
  144: KeyCode.NumLock,
  145: KeyCode.ScrollLock,
  186: KeyCode.Semicolon,
  187: KeyCode.Equal,
  188: KeyCode.Comma,
  189: KeyCode.Minus,
  190: KeyCode.Period,
  191: KeyCode.Slash,
  192: KeyCode.Backquote,
  193: KeyCode.ABNT_C1,
  194: KeyCode.ABNT_C2,
  219: KeyCode.BracketLeft,
  220: KeyCode.Backslash,
  221: KeyCode.BracketRight,
  222: KeyCode.Quote,
  223: KeyCode.OEM_8,
  226: KeyCode.IntlBackslash,
  229: KeyCode.KEY_IN_COMPOSITION,
};

const convertMap = {
  [KeyCode.Ctrl]: KeyMod.WinCtrl,
  [KeyCode.Meta]: KeyMod.CtrlCmd,
  [KeyCode.Shift]: KeyMod.Shift,
  [KeyCode.Alt]: KeyMod.Alt,
};

export function getKeyCodeText(code: string) {
  const splitValues = code?.split(',')?.filter(Boolean) || [];
  return splitValues.reduce((acc, cur) => {
    if (acc.length) {
      acc.push('+');
    }
    if (parseInt(cur) === KeyCode.Meta) {
      if (isMac()) {
        acc.push('⌘');
      } else {
        acc.push('Win');
      }
      return acc;
    }
    acc.push(KeyCode[cur]);
    return acc;
  }, []);
}

export function getKeyCodeValue(code: string) {
  const splitValues = code?.split(',')?.filter(Boolean) || [];
  return splitValues.reduce((prev, cur) => {
    let code = parseInt(cur);
    code = convertMap[code] || code;
    return code | prev;
  }, 0);
}
