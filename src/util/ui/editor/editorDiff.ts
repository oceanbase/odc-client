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

import * as monaco from 'monaco-editor';
import { IEditor } from '@/component/MonacoEditor';
import myers from 'myers-diff';

interface ISeparatedDiffInfo {
  lineInfo: ILineInfo[];
}

export enum LineType {
  ADD = 'add',
  DELETE = 'delete',
  ORIGINAL = 'original',
}

interface ILineInfo {
  lineNumber: number;
  originalLineNumber?: number; // 原始行号，用于删除行显示
  type: LineType;
  content: string;
}

interface ITextPosition {
  line: number;
  column: number;
}

/**
 * 创建编辑器diff装饰器
 */
export function createEditorDiffDecorator(editor: IEditor): EditorDiffDecorator {
  return new EditorDiffDecorator(editor);
}

/**
 * 根据起始位置和文本内容计算 Monaco 编辑器的范围
 * @param startPosition 起始位置
 * @param text 文本内容
 * @returns Monaco Range 对象
 */
function calculateTextRange(startPosition: ITextPosition, text: string): monaco.IRange {
  const lines = text.split('\n');
  const startLine = startPosition.line;
  const startColumn = startPosition.column;

  // 计算结束位置
  const endLine = startLine + lines.length - 1;
  const endColumn =
    lines.length === 1 ? startColumn + text.length : lines[lines.length - 1].length + 1;

  return new monaco.Range(startLine, startColumn, endLine, endColumn);
}

/**
 * 根据前一个范围的结束位置和文本内容计算下一个范围
 * @param previousRange 前一个范围
 * @param text 文本内容
 * @returns Monaco Range 对象
 */
function calculateNextTextRange(previousRange: monaco.IRange, text: string): monaco.IRange {
  const lines = text.split('\n');
  const previousEndLine = previousRange.endLineNumber;
  const previousEndColumn = previousRange.endColumn;

  // 如果前一个范围结束在行尾，下一个范围从新行开始
  const startLine = previousEndLine;
  const startColumn = lines.length === 1 ? previousEndColumn : 1;

  return calculateTextRange({ line: startLine, column: startColumn }, text);
}

/**
 * 编辑器diff装饰管理器
 */
export class EditorDiffDecorator {
  private editor: IEditor;
  private decorationIds: string[] = [];
  private glyphMarginIds: string[] = [];
  private viewZoneIds: string[] = [];
  private separatedDiffInfo: ISeparatedDiffInfo | null = null;

  constructor(editor: IEditor) {
    this.editor = editor;
  }

  /**
   * 插入分离的diff内容到编辑器
   * @param originalText 原始文本
   * @param newText 新文本
   * @param selectionRange 选择范围
   */
  public insertSeparatedDiff(
    originalText: string,
    newText: string,
    selectionRange: monaco.IRange,
  ): ISeparatedDiffInfo | null {
    // 清除之前的装饰
    this.clearDecorations();

    if (!originalText && !newText) return null;

    // 在编辑器中插入分离的内容
    const diffInfo = this.insertSeparatedContent(originalText, newText, selectionRange);

    if (diffInfo) {
      this.separatedDiffInfo = diffInfo;
      // 应用装饰
      this.applySeparatedDecorations(diffInfo);
    }

    return diffInfo;
  }

  /**
   * 获取当前的分离diff信息
   */
  public getSeparatedDiffInfo(): ISeparatedDiffInfo | null {
    return this.separatedDiffInfo;
  }

  /**
   * 清除所有diff装饰
   */
  public clearDecorations() {
    if (this.decorationIds.length > 0) {
      this.decorationIds = this.editor.deltaDecorations(this.decorationIds, []);
    }
    if (this.glyphMarginIds.length > 0) {
      this.glyphMarginIds = this.editor.deltaDecorations(this.glyphMarginIds, []);
    }
    // 清理所有 viewZone
    if (this.viewZoneIds.length > 0) {
      this.editor.changeViewZones((changeAccessor) => {
        this.viewZoneIds.forEach((id) => {
          changeAccessor.removeZone(id);
        });
      });
      this.viewZoneIds = [];
    }
    this.separatedDiffInfo = null;
  }

  /**
   * 在编辑器中插入分离的内容
   */
  private insertSeparatedContent(
    originalText: string,
    newText: string,
    selectionRange: monaco.IRange,
  ): ISeparatedDiffInfo | null {
    const model = this.editor.getModel();
    if (!model) return null;

    // 创建分离的内容
    const diffResult = myers?.diff(originalText, newText);
    const operationsMap = new Map<number, { del: number; add: number }>();
    for (const change of diffResult) {
      if (myers?.changed(change.lhs)) {
        // deleted
        const { at, del } = change.lhs;
        const preOperation = operationsMap.get(at);
        if (preOperation) {
          preOperation.del = del;
        } else {
          operationsMap.set(at, { del: del, add: 0 });
        }
      }
      if (myers?.changed(change.rhs)) {
        // added
        const { at, add, text } = change.rhs;
        if (!text) return;
        const preOperation = operationsMap.get(at);
        if (preOperation) {
          preOperation.add = add;
        } else {
          operationsMap.set(at, { del: 0, add: add });
        }
      }
    }

    const originalTextArr = originalText.split('\n');
    const newTextArr = newText.split('\n');
    const separatedContents: string[] = [];
    let lineInfo: ILineInfo[] = [];
    let currentLineNumber = selectionRange.startLineNumber;
    let originalLineNumber = 1; // 跟踪原始文本的行号
    let line = 0;

    while (line < originalTextArr.length || line < newTextArr.length) {
      const operation = operationsMap.get(line);

      if (operation) {
        // 处理删除的行，保留原始行号，但不插入到编辑器内容中
        originalTextArr.slice(line, line + operation.del).forEach((content, index) => {
          if (!content) return;
          lineInfo.push({
            lineNumber: currentLineNumber, // 删除行使用当前行号作为参考位置
            originalLineNumber: originalLineNumber + index,
            type: LineType.DELETE,
            content,
          });
        });

        // 处理新增的行
        newTextArr.slice(line, line + operation.add).forEach((content) => {
          if (!content) return;
          separatedContents.push(content);
          lineInfo.push({ lineNumber: currentLineNumber++, type: LineType.ADD, content });
        });

        // 更新原始行号
        originalLineNumber += operation.del;
        line += Math.max(operation.del, operation.add);
      } else {
        const content = originalTextArr[line];
        if (content) {
          separatedContents.push(content);
          lineInfo.push({
            lineNumber: currentLineNumber++,
            originalLineNumber: originalLineNumber,
            type: LineType.ORIGINAL,
            content,
          });
        }
        originalLineNumber++;
        line++;
      }
    }

    const separatedContent = separatedContents.join('\n');

    // 替换选中的内容
    this.editor.executeEdits('separated-diff', [
      {
        range: selectionRange,
        text: separatedContent,
      },
    ]);

    return {
      lineInfo,
    };
  }

  /**
   * 应用分离的装饰到编辑器
   */
  private applySeparatedDecorations(diffInfo: ISeparatedDiffInfo) {
    const decorations: monaco.editor.IModelDeltaDecoration[] = [];
    const deletedLines: ILineInfo[] = [];

    if (diffInfo?.lineInfo?.length > 0) {
      // 分离删除行和其他行的处理
      for (const lineInfo of diffInfo.lineInfo) {
        switch (lineInfo.type) {
          case LineType.ADD:
            decorations.push({
              range: new monaco.Range(
                lineInfo.lineNumber,
                1,
                lineInfo.lineNumber,
                Number.MAX_SAFE_INTEGER,
              ),
              options: {
                className: 'editor-diff-added',
                isWholeLine: true,
              },
            });
            break;
          case LineType.DELETE:
            // 收集删除行，稍后创建 viewZone
            deletedLines.push(lineInfo);
            break;
          case LineType.ORIGINAL:
            decorations.push({
              range: new monaco.Range(
                lineInfo.lineNumber,
                1,
                lineInfo.lineNumber,
                Number.MAX_SAFE_INTEGER,
              ),
              options: {
                className: 'editor-diff-original',
                isWholeLine: true,
              },
            });
            break;
        }
      }

      // 为删除行创建 viewZone
      this.createDeletedViewZones(deletedLines);
    }

    // 应用装饰
    this.decorationIds = this.editor.deltaDecorations([], decorations);
  }

  /**
   * 为删除行创建 viewZone
   */
  private createDeletedViewZones(deletedLines: ILineInfo[]) {
    if (deletedLines.length === 0) return;

    // 按位置分组删除行
    const groupedDeletes = new Map<number, ILineInfo[]>();
    deletedLines.forEach((line) => {
      const key = line.lineNumber;
      if (!groupedDeletes.has(key)) {
        groupedDeletes.set(key, []);
      }
      groupedDeletes.get(key)!.push(line);
    });

    // 为每组删除行创建 viewZone
    groupedDeletes.forEach((lines, lineNumber) => {
      this.editor.changeViewZones((changeAccessor) => {
        const domNode = document.createElement('div');
        domNode.className = 'editor-diff-deleted-zone';
        this.editor.applyFontInfo(domNode);

        lines.forEach((line) => {
          const lineElement = document.createElement('div');
          lineElement.className = 'editor-diff-deleted-line';

          // 创建内容显示
          const contentEl = document.createElement('span');
          contentEl.className = 'deleted-line-content';
          contentEl.textContent = line.content;

          lineElement.appendChild(contentEl);
          domNode.appendChild(lineElement);
        });
        const heightInLines = lines.length;

        const viewZoneId = changeAccessor.addZone({
          afterLineNumber: lineNumber - 1,
          heightInLines,
          domNode: domNode,
        });

        this.viewZoneIds.push(viewZoneId);
      });
    });
  }

  /**
   * 销毁装饰器
   */
  public dispose() {
    this.clearDecorations();
  }
}
