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
