import { formatMessage } from '@/util/intl';
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

import DropWrapper from '@/component/Dragable/component/DropWrapper';
import EditorToolBar from '@/component/EditorToolBar';
import GrammerHelpSider from '@/component/GrammerHelpSider';
import StatusBar from '@/component/StatusBar';
import { EDITOR_TOOLBAR_HEIGHT, SQL_PAGE_RESULT_HEIGHT } from '@/constant';
import { ConnectionMode, DbObjectType } from '@/d.ts/index';
import SessionSelect from '@/page/Workspace/components/SessionContextWrap/SessionSelect';
import { IDebugStackItem } from '@/store/debug/type';
import SessionStore from '@/store/sessionManager/session';
import { SettingStore } from '@/store/setting';
import { default as snippet, default as snippetStore } from '@/store/snippet';
import editorUtils from '@/util/editor';
import { getUnWrapedSnippetBody } from '@/util/snippet';
import { Layout, message } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react';
import SplitPane from 'react-split-pane';
import CustomDragLayer from '../GrammerHelpSider/component/CustomDragLayer';
import MonacoEditor, { IEditor } from '../MonacoEditor';
import TemplateInsertModal, { CLOSE_INSERT_PROMPT_KEY, getCopyText } from '../TemplateInsertModal';
import styles from './index.less';

const { Content } = Layout;

interface IProps {
  settingStore?: SettingStore;
  ctx: any;
  style?: any;
  language: string;
  editor: any;
  toolbar?: any;
  stackbar?: {
    onClick: any;
    list: IDebugStackItem[] | null;
  };
  statusBar?: any;
  Result?: React.ReactNode;
  Others: any;
  session: SessionStore;
  sessionSelectReadonly?: boolean;
  dialectTypes?: ConnectionMode[];
  showSessionSelect?: boolean;
  handleChangeSplitPane?: (size: number) => void;
}

interface IPageState {
  // esultHeight: number;
  templateInsertModalVisible: boolean;
  templateName: string;
  offset: {
    line: number;
    column: number;
  };
}

@inject('settingStore')
@observer
export default class ScriptPage extends PureComponent<IProps> {
  public readonly state: IPageState = {
    templateInsertModalVisible: false,
    templateName: '',
    offset: null,
    /// resultHeight: RESULT_HEIGHT
  };

  componentDidMount() {
    if (this.props.editor?.enableSnippet) {
      snippet.registerEditor({ language: this.props.language });
      snippet.resetSnippets();
    }
  }
  getSession() {
    return this.props.session;
  }

  renderPanels = () => {
    const {
      ctx,
      language,
      toolbar,
      stackbar,
      editor,
      statusBar,
      settingStore,
      session,
      sessionSelectReadonly,
      dialectTypes,
      showSessionSelect = true,
    } = this.props;
    const isShowDebugStackBar = !!stackbar?.list?.length;
    return (
      <Layout
        style={{
          minHeight: 'auto',
          height: '100%',
          background: 'var(--background-primary-color)',
        }}
      >
        <Content style={{ position: 'relative' }}>
          {toolbar && <EditorToolBar {...toolbar} ctx={ctx} />}
          {showSessionSelect && (
            <SessionSelect dialectTypes={dialectTypes} readonly={sessionSelectReadonly} />
          )}

          {isShowDebugStackBar ? (
            <div className={styles.stackList}>
              {stackbar.list.map((stack) => {
                return (
                  <div
                    className="stack-item"
                    onClick={() => {
                      stackbar.onClick(stack);
                    }}
                    title={stack.plName}
                  >
                    {stack.plName} {stack.isActive && <i className="icon-active" />}
                  </div>
                );
              })}
            </div>
          ) : null}
          <DropWrapper
            style={{
              position: 'absolute',
              top:
                EDITOR_TOOLBAR_HEIGHT +
                (isShowDebugStackBar ? 28 : 0) +
                (showSessionSelect ? 32 : 0),
              bottom: statusBar && statusBar.status ? 32 : 0,
              left: 0,
              right: 0,
            }}
            onHover={(item, monitor) => {
              ctx.editor?.focus();
              const clientOffset = monitor.getClientOffset();
              editorUtils.updateEditorCursorPositionByClientPosition(ctx.editor, {
                clientX: clientOffset.x,
                clientY: clientOffset.y,
              });
            }}
            onDrop={async (item, monitor) => {
              const snippetBody = snippetStore.snippetDragging?.body;
              if (!snippetBody) {
                return;
              }
              const snippetTemplate = getUnWrapedSnippetBody(snippetBody);
              if (snippetTemplate) {
                editorUtils.insertSnippetTemplate(ctx.editor, snippetTemplate);
              } else if (
                [DbObjectType.table, DbObjectType.view].includes(
                  snippetStore.snippetDragging?.objType,
                )
              ) {
                const position = (ctx.editor as IEditor)?.getPosition();
                if (!position) {
                  return;
                }
                if (snippetStore.snippetDragging.databaseId !== session.database.databaseId) {
                  message.warn(
                    formatMessage({
                      id: 'src.component.ScriptPage.D0B6C37B' /*'该对象不属于当前数据库'*/,
                    }),
                  );
                  return;
                }
                const CLOSE_INSERT_PROMPT = localStorage.getItem(CLOSE_INSERT_PROMPT_KEY);
                if (CLOSE_INSERT_PROMPT === 'true') {
                  const name = snippetBody;
                  const type = snippetStore.snippetDragging?.objType;
                  const value =
                    settingStore.configurations['odc.sqlexecute.default.objectDraggingOption'];
                  const insertText = await getCopyText(name, type, value, true, session.sessionId);
                  const editor = ctx.editor as IEditor;
                  editor.focus();
                  editorUtils.insertSnippetTemplate(ctx.editor, insertText);
                } else {
                  this.setState({
                    templateInsertModalVisible: true,
                    templateName: snippetBody,
                    offset: {
                      line: position.lineNumber,
                      column: position.column,
                    },
                  });
                }
              } else {
                editorUtils.insertTextToCurrectPosition(ctx.editor, snippetBody);
              }
            }}
          >
            <MonacoEditor {...editor} language={language} sessionStore={this.props.session} />
          </DropWrapper>
          {this.props.Others}
        </Content>
        {editor?.enableSnippet && ctx.state.showGrammerHelpSider ? (
          <GrammerHelpSider
            collapsed={!ctx.state.showGrammerHelpSider}
            onCollapse={() => {
              ctx.setState({ showGrammerHelpSider: false });
            }}
          />
        ) : null}
      </Layout>
    );
  };

  render() {
    const { statusBar, style, Result, ctx, session } = this.props;
    const { templateInsertModalVisible, templateName, offset } = this.state;
    return (
      <Layout
        style={{
          ...{
            minHeight: 'auto',
            height: '100%',
            background: 'var(--background-primary-color)',
          },
          ...style,
        }}
      >
        {Result ? (
          <SplitPane
            split="horizontal"
            primary={'second'}
            minSize={statusBar?.status ? 66 : 32}
            maxSize={-100}
            defaultSize={SQL_PAGE_RESULT_HEIGHT}
            onChange={this.props.handleChangeSplitPane}
          >
            {this.renderPanels()}
            {Result}
          </SplitPane>
        ) : (
          this.renderPanels()
        )}

        <StatusBar statusBar={statusBar} />
        <TemplateInsertModal
          session={session}
          visible={templateInsertModalVisible}
          name={templateName}
          type={snippetStore.snippetDragging?.objType}
          onClose={() => {
            this.setState({
              templateInsertModalVisible: false,
              templateName: '',
              offset: null,
            });
          }}
          onOk={(insertText) => {
            const editor = ctx.editor as IEditor;
            editor.focus();
            // editor.setPosition({
            //   lineNumber: offset?.line,
            //   column: offset?.column
            // });
            this.setState(
              {
                templateInsertModalVisible: false,
                templateName: '',
                offset: null,
              },
              () => {
                editorUtils.insertSnippetTemplate(ctx.editor, insertText);
              },
            );
          }}
        />

        <CustomDragLayer />
      </Layout>
    );
  }
}
