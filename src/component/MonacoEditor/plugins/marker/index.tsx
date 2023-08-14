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
import * as monaco from 'monaco-editor';

export function apply(model) {
  function scanModel() {
    const markers = [];
    const value = model.getValue();
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      if (char === '\u00a0') {
        const position = model.getPositionAt(i);
        markers.push({
          startColumn: position.column,
          endColumn: position.column + 1,
          endLineNumber: position.lineNumber,
          startLineNumber: position.lineNumber,
          severity: 4,
          message: formatMessage({
            id: 'odc.component.SQLCodeEditor.InvalidCharacterUAThis',
          }), // 非法字符(\u00a0)，该字符有可能造成运行报错
        });
      }
    }
    monaco.editor.setModelMarkers(model, model.id, markers);
  }
  const contentDispose = model.onDidChangeContent((e) => {
    scanModel();
  });
  const modelDispose = model.onWillDispose((e) => {
    contentDispose.dispose();
    modelDispose.dispose();
  });
  scanModel();
}
