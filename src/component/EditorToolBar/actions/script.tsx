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

import { IEditor } from '@/component/MonacoEditor';
import { IConStatus } from '@/component/Toolbar/statefulIcon';
import { PLType } from '@/constant/plType';
import { PLPage } from '@/page/Workspace/components/PLPage';
import { PLPageType } from '@/store/helper/page/pages/pl';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { CloudDownloadOutlined } from '@ant-design/icons';
import { Modal } from 'antd'; // @ts-ignore
import { ToolBarActions } from '..';

const { confirm } = Modal;
const scriptActions: ToolBarActions = {
  SNIPPET: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.script.SyntaxHelp',
      defaultMessage: '代码片段',
    }), // 代码片段
    icon: 'SNIPPET',
    statusFunc: (ctx) => {
      return ctx.state.showGrammerHelpSider ? IConStatus.ACTIVE : IConStatus.INIT;
    },

    async action(ctx: any) {
      ctx.setState({
        showGrammerHelpSider: !ctx.state.showGrammerHelpSider,
      });
    },
  },

  SNIPPET_SECTION_GROUP: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.script.Placeholder',
      defaultMessage: '占位符',
    }), // 占位符
    icon: 'ADD_SNIPPET_SECTION',
    menu: ['ADD_SNIPPET_SECTION', 'REMOVE_SNIPPET_SECTION'],
  },

  ADD_SNIPPET_SECTION: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.script.AddPlaceholder',
      defaultMessage: '添加占位符',
    }),
    // 添加占位符
    icon: 'ADD_SNIPPET_SECTION',
    async action(ctx: any) {
      const codeEditor: IEditor = ctx.editor;
      const value = codeEditor.getValue();
      const snippetSections = value.match(/\$\{\d\:(.*?)\}/g) || [];
      const snipptSectionText = `\${${snippetSections.length + 1}:string}`;
      const position = codeEditor.getPosition();
      codeEditor.executeEdits('ADD_SNIPPET_SECTION', [
        {
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },

          text: snipptSectionText,
        },
      ]);
      import('monaco-editor').then((monaco) => {
        const range = new monaco.Range(
          position.lineNumber,
          position.column + 4,
          position.lineNumber,
          position.column + 10,
        );

        codeEditor.setSelection(range);
        ctx.editor?.focus();
      });
    },
  },

  REMOVE_SNIPPET_SECTION: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.script.DeletePlaceholder',
      defaultMessage: '删除占位符',
    }),
    // 删除占位符
    icon: 'REMOVE_SNIPPET_SECTION',
    async action(ctx: any) {
      const codeEditor: IEditor = ctx.editor;
      const selectText = ctx.editor.getSelection();
      if (!selectText) {
        return;
      }
      const capitalizeText = selectText.replace(/\$\{\d\:(.*?)\}/g, '$1');
      const selection = codeEditor.getSelection();
      import('monaco-editor').then((monaco) => {
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

        codeEditor.executeEdits('REMOVE_SNIPPET_SECTION', [op]);
        ctx.editor?.focus();
      });
    },
  },

  DOWNLOAD: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.script.Download',
      defaultMessage: '下载',
    }), //下载
    icon: CloudDownloadOutlined,
    async action(ctx: PLPage) {
      const text = ctx?.props?.params?.scriptText || '';
      const params = ctx?.props.params;
      const dbName = ctx?.getSession()?.database?.dbName;
      if (params?.plPageType === PLPageType.anonymous) {
        downloadPLDDL(params?.objectName, PLType.ANONYMOUSBLOCK, text, dbName);
      } else if (params?.plPageType === PLPageType.plEdit) {
        downloadPLDDL(params?.plName, params?.plType, text, dbName);
      } else {
        downloadPLDDL(params?.plSchema?.plName, params?.plSchema?.plType, text, dbName);
      }
    },
  },
};

export default scriptActions;
