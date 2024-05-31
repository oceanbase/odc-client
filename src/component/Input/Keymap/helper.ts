import { formatMessage } from '@/util/intl';
import { KeyCode } from 'monaco-editor';

/**
 * 校验是否为合法的editor keymap
 * 1. 不能全部为shift，alt，meta，ctrl
 */
export const validForEditorKeymap = (value: string) => {
  if (!value) {
    return Promise.resolve();
  }
  const keys = value.split(',');
  for (const key of keys) {
    if (![KeyCode.Ctrl, KeyCode.Shift, KeyCode.Alt, KeyCode.Meta].includes(parseInt(key))) {
      return Promise.resolve();
    }
  }
  return Promise.reject(
    new Error(
      formatMessage({
        id: 'src.component.Input.Keymap.A2ADE368',
        defaultMessage: '快捷键不能全部为辅助键',
      }),
    ),
  );
};
