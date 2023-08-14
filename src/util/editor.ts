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

import { isNil } from 'lodash';
import * as monaco from 'monaco-editor';

type IEditor = monaco.editor.IStandaloneCodeEditor;

const getMonaco = async function () {
  return monaco;
};
const utils = {
  // 断点管理 - 事件绑定
  initBreakpointEventBind(codeEditor: IEditor, lineNumber: number) {},

  // 断点管理 - 添加断点
  async addBreakPoint(editor: IEditor, lineNumber: number) {
    const monaco = await getMonaco();
    const codeEditor = editor;
    let model = codeEditor.getModel();
    if (!model) {
      return;
    }
    console.log(lineNumber);
    model.deltaDecorations(
      [],
      [
        {
          range: new monaco.Range(lineNumber, 1, lineNumber, 1),
          options: {
            isWholeLine: false,
            linesDecorationsClassName: 'editor-breakpoints',
          },
        },
      ],
    );
  },

  async addBreakPoints(editor: IEditor, lineNumbers: Array<any>) {
    const monaco = await getMonaco();
    const codeEditor = editor;
    let model = codeEditor.getModel();
    if (!model) {
      return;
    }
    const breakpoints = lineNumbers.map((lineNum) => {
      return {
        // @ts-ignore
        range: new monaco.Range(lineNum, 1, lineNum, 1),
        options: {
          isWholeLine: false,
          linesDecorationsClassName: 'editor-breakpoints',
        },
      };
    });
    console.log(breakpoints);

    // 加上当前栈断点
    model.deltaDecorations([], breakpoints);
  },

  // 断点管理 - 删除断点
  removeBreakPoint(editor: IEditor, lineNumber: number) {
    const codeEditor = editor;
    let model = codeEditor.getModel();
    if (!model) return;
    const decorations = model.getLineDecorations(lineNumber);
    const ids = [];
    for (let decoration of decorations) {
      if (decoration.options.linesDecorationsClassName === 'editor-breakpoints') {
        ids.push(decoration.id);
      }
    }
    if (ids && ids.length) {
      model.deltaDecorations(ids, []);
    }
  },

  // 断点管理 - 清除
  clearBreakPoints(editor: IEditor) {
    const codeEditor = editor;
    let model = codeEditor.getModel();
    if (!model) return;
    const decorations = model.getAllDecorations();
    const ids = [];
    for (let decoration of decorations) {
      if (decoration.options.linesDecorationsClassName === 'editor-breakpoints') {
        ids.push(decoration.id);
      }
    }
    if (ids && ids.length) {
      model.deltaDecorations(ids, []);
    }
  },

  hasBreakPoint(editor: IEditor, line: number) {
    const codeEditor = editor;
    let decorations = codeEditor.getLineDecorations(line);
    for (let decoration of decorations) {
      if (decoration.options.linesDecorationsClassName === 'editor-breakpoints') {
        return true;
      }
    }
    return false;
  },

  async addFakeBreakPoint(editor: IEditor, line: number) {
    const monaco = await getMonaco();
    const codeEditor = editor;
    let model = codeEditor.getModel();
    if (!model) return;
    const decorations = model.getAllDecorations();
    const ids = [];
    for (let decoration of decorations) {
      if (decoration.options.linesDecorationsClassName === 'editor-breakpoints-fake') {
        ids.push(decoration.id);
      }
    }
    let value = {
      range: new monaco.Range(line, 1, line, 1),
      options: { isWholeLine: true, linesDecorationsClassName: 'editor-breakpoints-fake' },
    };
    codeEditor.deltaDecorations(ids, [value]);
  },

  removeFakeBreakPoint(editor: IEditor) {
    const codeEditor = editor;
    let model = codeEditor.getModel();
    if (!model) {
      return;
    }
    const decorations = model.getAllDecorations();
    const ids = [];
    for (let decoration of decorations) {
      if (decoration.options.linesDecorationsClassName === 'editor-breakpoints-fake') {
        ids.push(decoration.id);
      }
    }
    codeEditor.deltaDecorations(ids, []);
  },
  async addHighlight(editor: IEditor, begin: number, end: number, type: 'error' | 'info') {
    const monaco = await getMonaco();

    const beginPosition = editor.getModel().getPositionAt(begin);
    const endPosition = editor.getModel().getPositionAt(end + 1);

    const className =
      type === 'error' ? 'editor-selection-stmt-error' : 'editor-selection-stmt-info';

    editor.deltaDecorations(
      [],
      [
        {
          range: new monaco.Range(
            beginPosition.lineNumber,
            beginPosition.column,
            endPosition.lineNumber,
            endPosition.column,
          ),
          options: { inlineClassName: className },
        },
      ],
    );
  },
  async removeHightlight(editor: IEditor) {
    const codeEditor = editor;
    const model = codeEditor.getModel();
    if (!model) {
      return;
    }
    const decorations = model.getAllDecorations();
    const ids = [];
    for (let decoration of decorations) {
      if (decoration.options.inlineClassName?.indexOf('editor-selection-stmt') > -1) {
        ids.push(decoration.id);
      }
    }
    codeEditor.deltaDecorations(ids, []);
  },
  // 行管理 - 添加高亮行
  async addHighLightLine(editor: IEditor, line: number) {
    const monaco = await getMonaco();
    if (isNil(line)) {
      return;
    }
    const lineNum = line - 0;
    const codeEditor = editor;
    const model = codeEditor.getModel();
    if (!model) {
      return;
    }
    const decorations: monaco.editor.IModelDecoration[] = model.getAllDecorations();
    const ids = [];
    let isExist = false;
    for (let decoration of decorations) {
      if (decoration.options.className === 'editor-highlight-line') {
        if (decoration.range.startLineNumber === lineNum) {
          isExist = true;
        }
        ids.push(decoration.id);
      }
    }
    if (!isExist) {
      codeEditor.revealLine(lineNum);
    }
    codeEditor.deltaDecorations(
      ids,
      isNil(line)
        ? []
        : [
            {
              range: new monaco.Range(lineNum, 1, lineNum, 1),
              options: { isWholeLine: true, className: 'editor-highlight-line' },
            },
          ],
    );
  },

  async shineHighLightLine(editor: IEditor, line: number) {
    const monaco = await getMonaco();
    const lineNum = line - 0;
    const codeEditor: monaco.editor.IStandaloneCodeEditor = editor;
    const model = codeEditor.getModel();
    if (!model) {
      return;
    }
    let ids = [];
    codeEditor.revealLine(lineNum);
    ids = codeEditor.deltaDecorations(
      [],
      [
        {
          range: new monaco.Range(lineNum, 1, lineNum, 1),
          options: { isWholeLine: true, className: 'editor-shine-line' },
        },
      ],
    );
    setTimeout(() => {
      codeEditor.deltaDecorations(ids, []);
    }, 1200);
  },

  // 行管理 - 删除高亮行
  clearHighLightLine(editor: IEditor) {
    const codeEditor = editor;
    const model = codeEditor.getModel();
    if (!model) {
      return;
    }
    const decorations = model.getAllDecorations();
    const ids = [];
    for (let decoration of decorations) {
      if (decoration.options.className === 'editor-highlight-line') {
        ids.push(decoration.id);
      }
    }
    codeEditor.deltaDecorations(ids, []);
  },

  // 光标位置 - 通过鼠标坐标更新编辑器光标位置
  async updateEditorCursorPositionByClientPosition(editor: IEditor, { clientX, clientY }) {
    const monaco = await getMonaco();
    if (!editor) {
      return;
    }
    const codeEditor = editor;
    const editorPos = codeEditor.getTargetAtClientPoint(clientX, clientY);
    if (!editorPos || !editorPos.position) {
      return;
    }
    const { position } = editorPos;
    codeEditor.setSelection(
      new monaco.Selection(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column,
      ),
    );
  },

  async setPositionAndScroll(editor: IEditor, offset: number) {
    const codeEditor = editor;
    codeEditor.focus();
    codeEditor.setPosition(codeEditor.getModel().getPositionAt(offset));
    codeEditor.revealPosition(codeEditor.getModel().getPositionAt(offset));
  },
  // snippt - 在编辑器光标处插入 snippt
  insertSnippetTemplate(editor: IEditor, snippetText) {
    if (!editor) {
      return;
    }
    const codeEditor = editor;
    const snippetController = codeEditor.getContribution('snippetController2');
    //@ts-ignore
    snippetController.insert(snippetText);
  },
  // text - 在编辑器光标处插入 text
  async insertTextToCurrectPosition(editor: IEditor, text, targetPosition?: monaco.IPosition) {
    const monaco = await getMonaco();
    if (!editor) {
      return;
    }
    const codeEditor = editor;
    const position = targetPosition || codeEditor.getPosition();
    const { lineNumber, column } = position;
    const range = new monaco.Range(lineNumber, column, lineNumber, column);
    const op = { identifier: { major: 1, minor: 1 }, range, text, forceMoveMarkers: true };
    codeEditor.executeEdits('instert-text', [op]);
  },
  insertTextToNewLine(editor, text) {
    if (!editor) {
      return;
    }
    const codeEditor = editor as IEditor;
    const position = codeEditor.getModel().getPositionAt(codeEditor.getValue().length);
    this.insertTextToCurrectPosition(
      editor,
      '\n' + text,
      position.with(position.lineNumber + 1, 0),
    );
  },
  async replaceText(editor, text) {
    const monaco = await getMonaco();
    if (!editor) {
      return;
    }
    const codeEditor = editor as IEditor;
    const position = codeEditor.getModel().getPositionAt(codeEditor.getValue().length);
    const range = new monaco.Range(0, 0, position.lineNumber, position.column);

    const op = { identifier: { major: 1, minor: 1 }, range, text, forceMoveMarkers: true };
    codeEditor.executeEdits('replace-text', [op]);
  },
  async getCurrentSelectRange(editor: IEditor) {
    const monaco = await getMonaco();
    if (!editor) {
      return;
    }
    const selecttion = (editor as IEditor).getSelection();
    const codeEditor = editor as IEditor;
    return {
      begin: codeEditor.getModel().getOffsetAt(selecttion.getPosition()),
      end: codeEditor.getModel().getOffsetAt(selecttion.getEndPosition()),
    };
  },
};

export default utils;
