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
import { FileSearchOutlined, OneToOneOutlined } from '@ant-design/icons';
import * as monaco from 'monaco-editor';
// @ts-ignore
import { ReactComponent as RedoSvg } from '@/svgr/Redo.svg'; // @ts-ignore

import { IEditor } from '@/component/MonacoEditor';
import SessionStore from '@/store/sessionManager/session';
import { ReactComponent as UndoSvg } from '@/svgr/Undo.svg';
import { textExpaste } from '@/util/data/sql';
import type { ToolBarActions } from '..';
import { getStatus } from './pl';

async function getMonaco() {
  return monaco;
}

const textActions: ToolBarActions = {
  TEXT_FORMAT: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.text.Formatting',
      defaultMessage: '格式化',
    }),
    icon: 'FORMAT',
    statusFunc: getStatus,
    async action(ctx: any) {
      const monaco = await getMonaco();
      try {
        await ctx.editor.doFormat();
        /**
         * monaco 自动选取存在 bug，会漏选第一个字符，所以这边默认取消选择
         */
        ctx.editor?.setSelection(new monaco.Selection(0, 0, 0, 0));
      } catch (e) {
        console.trace(e);
      }
    },
  },

  TEXT_FIND_OR_REPLACE: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.text.FindReplace',
      defaultMessage: '查找/替换',
    }),
    icon: FileSearchOutlined,
    statusFunc: getStatus,
    async action(ctx: any) {
      const codeEditor: IEditor = ctx.editor;
      codeEditor.trigger('FIND_OR_REPLACE', 'actions.find', null);
    },
  },

  TEXT_UNDO: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.text.Revocation',
      defaultMessage: '撤销',
    }),

    icon: UndoSvg,
    statusFunc: getStatus,
    async action(ctx: any) {
      const codeEditor = ctx.editor;
      codeEditor.trigger('xxx', 'undo');
      ctx.editor?.focus();
    },
  },

  TEXT_REDO: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.text.Redo',
      defaultMessage: '重做',
    }),

    icon: RedoSvg,
    statusFunc: getStatus,
    async action(ctx: any) {
      const codeEditor: IEditor = ctx.editor;
      codeEditor.trigger('xxx', 'redo', null);
      ctx.editor?.focus();
    },
  },

  TEXT_CASE: {
    name: formatMessage({ id: 'odc.EditorToolBar.actions.text.Case', defaultMessage: '大小写' }), // 大小写
    icon: 'TEXT_UPPERCASE',
    statusFunc: getStatus,
    menu: ['TEXT_UPPERCASE', 'TEXT_LOWERCASE', 'TEXT_CAPITALIZE'],
  },

  TEXT_UPPERCASE: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.text.AllUppercase',
      defaultMessage: '全部大写',
    }), // 全部大写
    icon: 'TEXT_UPPERCASE',

    async action(ctx: any) {
      const codeEditor: IEditor = ctx.editor;
      const monaco = await getMonaco();
      const selectText = codeEditor.getSelectionContent();

      if (!selectText) {
        return;
      }

      const selection = codeEditor.getSelection();
      const range = new monaco.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn,
      );

      const op = {
        identifier: {
          major: 1,
          minor: 1,
        },

        range,
        text: selectText.toUpperCase(),
        forceMoveMarkers: true,
      };

      codeEditor.executeEdits('UPPERCASE', [op]);
      codeEditor.setSelection(range);
      ctx.editor?.focus();
    },
  },

  TEXT_LOWERCASE: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.text.AllLowercase',
      defaultMessage: '全部小写',
    }), // 全部小写
    icon: 'TEXT_LOWERCASE',

    async action(ctx: any) {
      const monaco = await getMonaco();
      const codeEditor: IEditor = ctx.editor;
      const selectText = codeEditor.getSelectionContent();

      if (!selectText) {
        return;
      }

      const selection = codeEditor.getSelection();
      const range = new monaco.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn,
      );

      const op = {
        identifier: {
          major: 1,
          minor: 1,
        },

        range,
        text: selectText.toLowerCase(),
        forceMoveMarkers: true,
      };

      codeEditor.executeEdits('LOWERCASE', [op]);
      codeEditor.setSelection(range);
      ctx.editor?.focus();
    },
  },

  TEXT_CAPITALIZE: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.text.UppercaseLetters',
      defaultMessage: '首字母大写',
    }),

    icon: 'TEXT_FIRST_UPPERCASE',

    async action(ctx: any) {
      const monaco = await getMonaco();
      const codeEditor: IEditor = ctx.editor;
      const selectText = codeEditor.getSelectionContent();

      if (!selectText) {
        return;
      }

      const capitalizeText = selectText.replace(/\w+/g, (match: string) => {
        return match.toUpperCase()[0] + match.toLowerCase().slice(1);
      });
      const selection = codeEditor.getSelection();
      const range = new monaco.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn,
      );

      const op = {
        identifier: {
          major: 1,
          minor: 1,
        },

        range,
        text: capitalizeText,
        forceMoveMarkers: true,
      };

      codeEditor.executeEdits('CAPITALIZE', [op]);
      codeEditor.setSelection(range);
      ctx.editor?.focus();
    },
  },

  TEXT_INDENT_GROUP: {
    name: formatMessage({ id: 'odc.EditorToolBar.actions.text.Indent', defaultMessage: '缩进' }), // 缩进
    icon: 'TEXT_INDENT',
    statusFunc: getStatus,
    menu: ['TEXT_INDENT', 'TEXT_UN_INDENT'],
  },

  TEXT_INDENT: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.text.AddIndentation',
      defaultMessage: '添加缩进',
    }),

    icon: 'TEXT_INDENT',

    async action(ctx: any) {
      const codeEditor: IEditor = ctx.editor;
      codeEditor.trigger('xxx', 'editor.action.indentLines', null);
      codeEditor?.focus();
    },
  },

  TEXT_UN_INDENT: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.text.DeleteIndentation',
      defaultMessage: '删除缩进',
    }),

    icon: 'TEXT_UN_INDENT',

    async action(ctx: any) {
      const codeEditor: IEditor = ctx.editor;
      codeEditor.trigger('xxx', 'editor.action.outdentLines', null);
      ctx.editor?.focus();
    },
  },

  TEXT_COMMENT_GROUP: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.text.Annotation',
      defaultMessage: '注释',
    }), // 注释
    icon: 'TEXT_COMMENT',
    statusFunc: getStatus,
    menu: ['TEXT_COMMENT', 'TEXT_UN_COMMENT'],
  },

  TEXT_COMMENT: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.text.AddComments',
      defaultMessage: '添加注释',
    }),

    icon: 'TEXT_COMMENT',

    async action(ctx: any) {
      const codeEditor: IEditor = ctx.editor;
      codeEditor.trigger('xxx', 'editor.action.addCommentLine', null);
      ctx.editor?.focus();
    },
  },

  TEXT_UN_COMMENT: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.text.DeleteComments',
      defaultMessage: '删除注释',
    }),

    icon: 'TEXT_UN_COMMENT',

    async action(ctx: any) {
      const codeEditor: IEditor = ctx.editor;
      codeEditor.trigger('xxx', 'editor.action.removeCommentLine', null);
      ctx.editor?.focus();
    },
  },

  TEXT_EXPASTE: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.text.InValueConversion',
      defaultMessage: 'IN 值转化',
    }), // IN 值转化
    icon: OneToOneOutlined,
    async action(ctx: any) {
      const codeEditor: IEditor = ctx.editor;
      const selectText = codeEditor.getSelectionContent();

      const monaco = await getMonaco();
      if (!selectText) {
        return;
      }

      const selection = codeEditor.getSelection();
      const range = new monaco.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn,
      );

      const op = {
        identifier: {
          major: 1,
          minor: 1,
        },

        range,
        text: textExpaste(
          selectText,
          ((ctx.getSession?.() || ctx.session) as SessionStore)?.connection?.dialectType,
        ),
        forceMoveMarkers: true,
      };

      codeEditor.executeEdits('INCONVERT', [op]);
      ctx.editor?.focus();
    },
  },
};

export default textActions;
