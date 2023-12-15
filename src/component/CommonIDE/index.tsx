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

import { TAB_HEADER_HEIGHT } from '@/constant';
import { IResultSet, ISqlExecuteResultStatus } from '@/d.ts';
import DDLResultSet from '@/page/Workspace/components/DDLResultSet';
import SQLResultLog from '@/page/Workspace/components/SQLResultSet/SQLResultLog';
import SessionStore from '@/store/sessionManager/session';
import { IEditor } from '@/util/editor';
import { formatMessage } from '@/util/intl';
import { Tabs, Tooltip } from 'antd';
import classnames from 'classnames';
import { debounce } from 'lodash';
import * as monaco from 'monaco-editor';
import React, { ReactNode } from 'react';
import SplitPane from 'react-split-pane';
import EditorToolBar from '../EditorToolBar';
import MonacoEditor from '../MonacoEditor';
import styles from './index.less';
const RESULT_HEIGHT = 230;
export enum ITabType {
  /**
   * 运行结果
   */
  LOG,

  /**
   * 结果（预留）
   */
  RESULT,
}
interface ICommonIDEProps {
  /**
   * toolbar 对应的 group key，默认：COMMON_EDITOR_GROUP
   */
  toolbarGroupKey?: string;
  /**
   * 编辑器语言类型
   */

  language: string;
  /**
   * 初始化 SQL
   */

  initialSQL?: string;
  onSQLChange?: (sql: string) => void;
  /**
   * editor 的自定义 props
   */

  editorProps?: Partial<any>;
  /**
   * 运行结果
   */

  log?: ReactNode;
  /**
   * 结果集
   */
  resultSets?: IResultSet[];
  /**
   * toolbar 右侧按钮
   */

  toolbarActions?: ReactNode;
  /**
   * 是否添加边框
   */
  bordered?: boolean;
  session?: SessionStore;

  /**
   * 创建后监听事件
   */
  onEditorAfterCreatedCallback?: (editor: IEditor) => void;
}
interface ICommonIDEState {
  resultHeight: number;
}

class CommonIDE extends React.PureComponent<ICommonIDEProps, ICommonIDEState> {
  state: ICommonIDEState = {
    resultHeight: RESULT_HEIGHT,
  };

  public editor: monaco.editor.IStandaloneCodeEditor;
  public model: monaco.editor.IModel;

  private handleChangeSplitPane = debounce((size: number) => {
    this.setState({
      resultHeight: size,
    });
    this.emitResize();
  }, 200);

  public getSession() {
    return this.props.session;
  }

  private emitResize = debounce(() => {
    window.dispatchEvent(new Event('resize'));
  }, 500);

  private onEditorCreated = (editor) => {
    this.editor = editor;
    if (!this.model) {
      this.model = monaco.editor.createModel(this.props.initialSQL, this.props.language);
      this.editor.setModel(this.model);
    } else {
      this.editor.setModel(this.model);
    }
    this.props?.onEditorAfterCreatedCallback?.(this.editor);
  };

  private onSQLChange = (sql: string) => {
    this.props.onSQLChange?.(sql);
  };

  public componentWillUnmount() {
    this.model?.dispose();
  }

  private getResultSetTitle = (executeSql: string, title) => {
    return <Tooltip title={executeSql}>{title}</Tooltip>;
  };

  render() {
    const {
      toolbarGroupKey,
      language,
      initialSQL,
      bordered,
      editorProps = {},
      log,
      resultSets,
      toolbarActions,
      session,
    } = this.props;

    const { resultHeight } = this.state;
    return (
      <div
        className={classnames(styles.main, {
          [styles.bordered]: bordered,
        })}
      >
        <div className={styles.toolbar}>
          <EditorToolBar
            loading={false}
            ctx={this}
            actionGroupKey={toolbarGroupKey || 'COMMON_EDITOR_GROUP'}
            rightExtra={toolbarActions}
          />
        </div>
        <div className={styles.content}>
          {log || resultSets?.length ? (
            <SplitPane
              split="horizontal"
              primary={'second'}
              minSize={30}
              maxSize={-100}
              size={resultHeight}
              onChange={this.handleChangeSplitPane}
            >
              <div className={styles.editorBox}>
                <MonacoEditor
                  language={language}
                  defaultValue={initialSQL}
                  onValueChange={this.onSQLChange}
                  onEditorCreated={this.onEditorCreated}
                  {...editorProps}
                />
              </div>
              <div className={styles.resultTabs}>
                <Tabs className={styles.tabs} animated={false}>
                  {log ? (
                    <Tabs.TabPane
                      style={{
                        padding: 16,
                      }}
                      tab={formatMessage({
                        id: 'odc.component.CommonIDE.Result',
                      })}
                      /*运行结果*/
                      key={ITabType.LOG}
                    >
                      {log}
                    </Tabs.TabPane>
                  ) : null}
                  {resultSets?.map((set, i) => {
                    return (
                      <Tabs.TabPane
                        tab={this.getResultSetTitle(
                          set.executeSql,
                          `${formatMessage({
                            id: 'workspace.window.sql.result',
                          })}${i + 1}`,
                        )}
                        key={`resultset-${set.uniqKey}`}
                      >
                        {!!set.columns?.length && set.status === ISqlExecuteResultStatus.SUCCESS ? (
                          <DDLResultSet
                            session={session}
                            key={set.uniqKey || i}
                            showExplain={false}
                            showPagination={true}
                            autoCommit={true}
                            columns={set.columns}
                            sqlId={set.sqlId}
                            rows={set.rows}
                            enableRowId={true}
                            originSql={set.originSql}
                            resultHeight={resultHeight - TAB_HEADER_HEIGHT - 1}
                            generalSqlType={set.generalSqlType}
                            traceId={set.traceId}
                            isEditing={false}
                            disableEdit={true}
                            onExport={null}
                          />
                        ) : (
                          <SQLResultLog resultHeight={resultHeight} resultSet={set} />
                        )}
                      </Tabs.TabPane>
                    );
                  })}
                </Tabs>
              </div>
            </SplitPane>
          ) : (
            <div className={styles.editorBox}>
              <MonacoEditor
                language={language}
                defaultValue={initialSQL}
                onValueChange={this.onSQLChange}
                onEditorCreated={this.onEditorCreated}
                {...editorProps}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default CommonIDE;
