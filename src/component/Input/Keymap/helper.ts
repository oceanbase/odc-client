/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
