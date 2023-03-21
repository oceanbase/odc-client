import { newScript, updateScript } from '@/common/network';
import { executeSQL, runSQLLint } from '@/common/network/sql';
import { executeTaskManager } from '@/common/network/sql/executeSQL';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import ExportResultSetModal from '@/component/ExportResultSetModal';
import SaveSQLModal from '@/component/SaveSQLModal';
import ScriptPage from '@/component/ScriptPage';
import SQLConfigContext from '@/component/SQLConfig/SQLConfigContext';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import { SQL_PAGE_RESULT_HEIGHT } from '@/constant';
import {
  ConnectionMode,
  DbObjectType,
  IPage,
  ISqlExecuteResult,
  ISqlExecuteResultStatus,
  ISQLScript,
  ITableColumn,
  PageType,
  SqlType,
} from '@/d.ts';
import type { ConnectionStore } from '@/store/connection';
import connection from '@/store/connection';
import {
  debounceUpdatePageScriptText,
  openFunctionViewPage,
  openTableViewPage,
  openViewViewPage,
  updatePage,
} from '@/store/helper/page';
import { generatePageKey } from '@/store/helper/pageKeyGenerate';
import type { UserStore } from '@/store/login';
import type { PageStore } from '@/store/page';
import type { SchemaStore } from '@/store/schema';
import type { SQLStore } from '@/store/sql';
import utils from '@/util/editor';
import { formatMessage } from '@/util/intl';
import notification from '@/util/notification';
import { getRealTableName, splitSql } from '@/util/sql';
import { generateAndDownloadFile, getCurrentSQL } from '@/util/utils';
import type { IEditor } from '@alipay/ob-editor';
import { message, Spin } from 'antd';
import { debounce, isNil } from 'lodash';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { wrapRow } from '../DDLResultSet/util';
import ExecDetail from '../SQLExplain/ExecDetail';
import ExecPlan from '../SQLExplain/ExecPlan';
import SQLResultSet, { recordsTabKey, sqlLintTabKey } from '../SQLResultSet';
import styles from './index.less';
interface ISQLPageState {
  resultHeight: number;
  initialSQL: string;
  showSaveSQLModal: boolean;
  resultSetTabActiveKey: string;
  showExportResuleSetModal: boolean;
  resultSetIndexToExport: number;
  // SQL 计划
  showExplainDrawer: boolean;

  showExecuteDetailDrawer: boolean;
  execDetailSql: string;
  execDetailTraceId: string;
  selectedSQL: string; // 结果集编辑
  executeSQL: string; // 当前执行的SQL

  showDataExecuteSQLModal: boolean;
  updateDataDML: string;
  tipToShow: string;
  executePLLoading: boolean;
  pageLoading?: boolean;
  resultSetIndex: number;
  isSavingScript?: boolean;
  editingMap: {
    [key: string]: boolean;
  };

  lintResultSet: ISQLLintReuslt[];
}

@inject('sqlStore', 'userStore', 'pageStore', 'connectionStore', 'schemaStore')
@observer
class SQLPage extends Component<
  {
    params?: any;
    sqlStore?: SQLStore;
    userStore?: UserStore;
    pageStore?: PageStore;
    connectionStore?: ConnectionStore;
    schemaStore?: SchemaStore;
    pageKey?: string;
    isSaved?: boolean;
    page?: IPage;
    startSaving?: boolean;
    isShow?: boolean;
    onUnsavedChange?: (pageKey: string) => void;
    onChangeSaved?: (pageKey: string) => void;
    onSetUnsavedModalTitle?: (title: string) => void;
    onSetUnsavedModalContent?: (title: string) => void;
  },
  ISQLPageState
> {
  public readonly state: ISQLPageState = {
    resultHeight: SQL_PAGE_RESULT_HEIGHT,
    initialSQL: this.props.params?.scriptText || '',
    showSaveSQLModal: false,
    resultSetTabActiveKey: recordsTabKey,
    showExportResuleSetModal: false,
    resultSetIndexToExport: -1,
    showExplainDrawer: false,
    showExecuteDetailDrawer: false,
    execDetailSql: null,
    execDetailTraceId: null,
    selectedSQL: '',
    executeSQL: '',
    showDataExecuteSQLModal: false,
    updateDataDML: '',
    tipToShow: '',
    executePLLoading: false,
    pageLoading: true,
    resultSetIndex: 0,
    editingMap: {},
    lintResultSet: null,
    isSavingScript: false,
  };

  public editor: IEditor;

  public chartContainer: HTMLDivElement | null = null;

  private timer: number | undefined;

  constructor(props) {
    super(props);
    const resultSetKey: string = props.sqlStore.getFirstUnlockedResultKey(props.pageKey);
    this.state = {
      ...this.state,
      resultSetTabActiveKey: resultSetKey ? resultSetKey : this.state.resultSetTabActiveKey,
    };
  }

  public async componentDidMount() {
    const { params, pageKey, onSetUnsavedModalTitle, onSetUnsavedModalContent, connectionStore } =
      this.props;
    const pageName = pageKey.replace('spl-new-', '');
    await this.initSession();
    onSetUnsavedModalTitle(
      formatMessage({
        id: 'workspace.window.sql.modal.close.title',
      }),
    );

    onSetUnsavedModalContent(
      formatMessage(
        {
          id: 'workspace.window.sql.modal.close.content',
        },

        {
          name:
            params.scriptName ||
            formatMessage(
              {
                id: 'odc.components.SQLPage.SqlWindowPagename',
              },

              { pageName },
            ),

          // `SQL 窗口_${pageName}`
        },
      ),
    );

    const resultSetKey = this.props.sqlStore.getFirstUnlockedResultKey(this.props.pageKey);
    this.setState((state) => {
      return {
        ...state,
        resultSetTabActiveKey: resultSetKey ? resultSetKey : state.resultSetTabActiveKey,
      };
    });
  }

  handleDownload = () => {
    const sql = this.editor.getValue();
    generateAndDownloadFile(this.props.page.title, sql);
  };

  public getSession() {
    const { connectionStore, pageKey } = this.props;
    return connectionStore.subSessions.get(pageKey);
  }

  public async initSession() {
    const { connectionStore, pageStore, pageKey } = this.props;
    const session = this.getSession();
    if (!session) {
      const sessionId = await connectionStore.createSubSessions(pageKey);
      if (sessionId) {
        this.setState({
          pageLoading: false,
        });

        return;
      } else {
        /**
         * 申请session id 失败，关闭页面
         */
        pageStore.close(pageKey);
        return;
      }
    }
    this.setState({
      pageLoading: false,
    });
  }

  public async UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps) {
      if (nextProps.startSaving) {
        this.handleClickSaveButton();
      }
    }

    if (
      nextProps.params?.scriptText != this.props.params?.scriptText &&
      nextProps.params?.scriptText != this.editor.getValue()
    ) {
      this.setState({
        initialSQL: nextProps.params?.scriptText,
      });
    }
  }

  public async componentDidUpdate(prevProps) {
    if (this.props.isShow && !prevProps.isShow) {
      this.editor?.focus();
    }
  }

  public componentWillUnmount() {
    const { pageKey, sqlStore, connectionStore } = this.props;
    const session = this.getSession();

    if (this.timer) {
      clearInterval(this.timer);
    }

    sqlStore.clear(pageKey);
    if (session) {
      executeTaskManager.stopTask(session.sessionId);
      connectionStore.closeSubSession(pageKey);
    }
  }

  public handleChangeSplitPane = debounce((size: number) => {
    this.setState({
      resultHeight: size,
    });

    // 手动触发 resize 事件

    window.dispatchEvent(new Event('resize'));
  }, 500);
  /**
   * ======== SQL相关 ===========
   */

  public handleEditorCreated = (editor: IEditor) => {
    this.editor = editor; // 快捷键绑定
    this.editor.addCommand('CTRLCMD+KEY_D', () => {
      this.handleDownload();
    });
    this.editor.addCommand('CTRLCMD+KEY_S', () => {
      this.saveScript();
    });
    this.editor.addCommand('f8', this.handleExecuteSQL);
    this.editor.addCommand('f9', this.handleExecuteSelectedSQL);
    this.debounceHighlightSelectionLine();
    this.editor.UNSAFE_getCodeEditor().onDidChangeCursorPosition(() => {
      this.debounceHighlightSelectionLine();
    });
  };

  public handleSQLChanged = (sql: string) => {
    const { pageKey, onUnsavedChange, isSaved } = this.props;
    debounceUpdatePageScriptText(pageKey, sql);
    this.debounceHighlightSelectionLine();
    if (isSaved) {
      onUnsavedChange(pageKey);
    }
  };

  public handleExecuteSQL = async () => {
    const { params } = this.props;

    const selectedSQL = this.editor.getSelection();
    const sqlToExecute = selectedSQL || params.scriptText;
    await this.executeSQL(
      sqlToExecute,
      false,
      selectedSQL ? await utils.getCurrentSelectRange(this.editor) : null,
    );
  }; // 执行选中的 SQL

  public handleExecuteSelectedSQL = async () => {
    const { connectionStore, sqlStore } = this.props;

    let selectedSQL = this.editor.getSelection(); // 如果没有选中，尝试获取当前语句
    let begin, end;
    if (!selectedSQL) {
      const offset = this.editor
        .UNSAFE_getCodeEditor()
        .getModel()
        .getOffsetAt(this.editor.getPosition());

      if (offset > -1) {
        const result = await getCurrentSQL(
          this.editor.getValue(),
          offset,
          connectionStore.connection.dbMode == ConnectionMode.OB_MYSQL,
        );

        if (result) {
          selectedSQL = result.sql;
          begin = result.begin;
          end = result.end;
        }
      }
    } else {
      const range = this.editor.getSelectionRange();
      begin = this.editor.UNSAFE_getCodeEditor().getModel().getOffsetAt(range.getStartPosition());
      end = this.editor.UNSAFE_getCodeEditor().getModel().getOffsetAt(range.getEndPosition());
    }

    if (!selectedSQL) {
      return;
    }
    await this.executeSQL(selectedSQL, true, { begin, end });
  };

  public async saveScript() {
    const { userStore, params, onChangeSaved, pageKey } = this.props;
    if (this.state.isSavingScript) {
      return;
    }
    this.setState({
      isSavingScript: true,
    });

    try {
      if (params.scriptId) {
        // 仅更新 SQL 内容
        const file = await updateScript(params.scriptId, params.scriptText, params.objectName);

        if (file) {
          message.success(
            formatMessage({
              id: this.getLocaleConfig().success,
            }),
          );

          await userStore.scriptStore.getScriptList();
          updatePage(pageKey, file, false);
          onChangeSaved(pageKey);
        }
      } else {
        // 新窗口，弹出创建脚本弹窗
        this.setState({
          showSaveSQLModal: true,
        });
      }
    } finally {
      this.setState({
        isSavingScript: false,
      });
    }
  } // 点击“保存”按钮

  public handleClickSaveButton = async () => {
    await this.saveScript();
  }; // 保存 SQL

  public handleCreateSQL = async (script: ISQLScript) => {
    const { userStore, pageStore, pageKey, onSetUnsavedModalContent, onChangeSaved, params } =
      this.props;
    let existedScriptId;
    const newFiles = await newScript(
      [new File([params.scriptText], script.objectName)],
      'UploadScript',
    );

    const newFile = newFiles?.[0];
    const isError = !newFile;

    if (!isError) {
      existedScriptId = newFile.id;
      await userStore.scriptStore.getScriptList(); // 更新页面标题 & url

      pageStore.updatePage(
        pageKey,
        {
          title: newFile.objectName,
          updateKey: true,
          updatePath: true,
          isSaved: true,
          startSaving: false,
        },

        { ...newFile, scriptId: newFile.id },
      );

      onSetUnsavedModalContent(
        formatMessage(
          {
            id: 'workspace.window.sql.modal.close.content',
          },

          {
            name: script.objectName,
          },
        ),
      );

      onChangeSaved(pageKey);
      message.success(
        formatMessage({
          id: this.getLocaleConfig().success,
        }),
      );

      this.setState({
        showSaveSQLModal: false,
      });
    }
  };
  /**
   * ======== 结果集操作相关 ===========
   */
  public doSQLLint = async () => {
    if (this.state.lintResultSet) {
      this.hanldeCloseLintPage();
    }
    const selectted = this.editor.getSelection();
    const value = selectted || this.editor.getValue();
    if (!value) {
      return;
    }
    const result = await runSQLLint(
      this.getSession()?.sessionId,
      this.getSession()?.delimiter,
      value,
    );

    if (result) {
      if (!result.length) {
        /**
         * 无规则
         */
        message.success(
          formatMessage({ id: 'odc.components.SQLPage.SqlCheckPassed' }), //SQL 检查通过
        );
        return;
      }
      this.setState({
        resultSetTabActiveKey: sqlLintTabKey,
        lintResultSet: result,
      });
    }
  };
  public handleRefreshResultSet = async (resultSetIndex: number) => {
    const { sqlStore, pageKey } = this.props;
    await sqlStore.refreshResultSet(pageKey, resultSetIndex);
    this.triggerTableLayout();
  };

  public hanldeCloseLintPage = () => {
    this.setState({
      lintResultSet: null,
      resultSetTabActiveKey:
        this.state.resultSetTabActiveKey === sqlLintTabKey
          ? recordsTabKey
          : this.state.resultSetTabActiveKey,
    });
  };

  public handleCloseResultSet = (resultSetKey: string) => {
    const { sqlStore, pageKey } = this.props;
    const oldLastIndex = sqlStore.resultSets.get(pageKey).length - 1;
    const resultSetIndex = sqlStore.resultSets.get(pageKey)?.findIndex((set) => {
      return set.uniqKey === resultSetKey;
    });
    sqlStore.closeResultSet(pageKey, resultSetIndex);
    const resultSet = sqlStore.resultSets.get(pageKey); // 如果已经关闭了全部结果集，只剩下历史记录，需要切换

    if (resultSet && resultSet.length === 0) {
      this.setState({
        resultSetTabActiveKey: recordsTabKey,
      });
    } else if (this.state.resultSetTabActiveKey === resultSetKey) {
      /**
       * 关闭自身
       */
      let openIndex = 0;

      if (resultSetIndex === oldLastIndex) {
        /**
         * 最后一个的话，选择前一个
         */
        openIndex = resultSetIndex - 1;
      } else {
        openIndex = resultSetIndex;
      }

      this.setState({
        resultSetTabActiveKey: resultSet[openIndex].uniqKey,
      });
    }

    this.triggerTableLayout();
  };

  public handleLockResultSet = (key: string) => {
    const { sqlStore, pageKey } = this.props;
    sqlStore.lockResultSet(pageKey, key);
  };

  public onUpdateEditing = (resultSetIndex: number, editing: boolean) => {
    const resultSets = this.props.sqlStore.resultSets.get(this.props.pageKey);
    this.setState({
      editingMap: {
        ...this.state.editingMap,
        [resultSets[resultSetIndex].uniqKey]: editing,
      },
    });
  };

  public handleUnLockResultSet = (key: string) => {
    const { sqlStore, pageKey } = this.props;
    sqlStore.unlockResultSet(pageKey, key);
  };

  public handleChangeResultSetTab = (activeKey: string) => {
    this.setState({
      resultSetTabActiveKey: activeKey,
    });
  };

  public handleSaveRowData = async (
    resultSetIndex: number,
    newRows: any[],
    limit: number,
    autoCommit: boolean,
    columnList: ITableColumn[],
    dbName: string,
  ) => {
    const { schemaStore, sqlStore, pageKey } = this.props;
    const resultSets = sqlStore.resultSets.get(pageKey);

    if (resultSets) {
      const resultSet = resultSets[resultSetIndex]; // 尝试从 结果集是否可编辑接口 中获取表名（存储在每个字段中）

      const tableName = columnList[0]?.tableName || '';
      let tipToShow = '';
      /**
       * 校验空行
       * aone/issue/32812674
       */
      for (let i = 0; i < newRows?.length; i++) {
        const _row = newRows[i];
        if (_row._created) {
          let isEmpty = true;
          resultSet?.columns?.forEach((column) => {
            if (!isNil(_row[column.key])) {
              isEmpty = false;
            }
          });
          if (isEmpty) {
            message.warn(
              formatMessage({
                id: 'odc.TablePage.TableData.DoNotSubmitBlankLines',
              }),

              // 请不要提交空行
            );
            return;
          }
        }
      }
      const editRows = newRows
        .map((row, i) => {
          let type: 'INSERT' | 'UPDATE' | 'DELETE';
          if (row._deleted) {
            type = 'DELETE';
          } else if (row.modified || row._originRow) {
            type = 'UPDATE';
          } else if (row._created) {
            type = 'INSERT';
          } else {
            return null;
          }
          return {
            type,
            row: wrapRow(row, resultSet.columns),
            initialRow: wrapRow(resultSet.rows[i], resultSet.columns),
            enableRowId: type !== 'INSERT',
          };
        })
        .filter(Boolean);
      if (!editRows?.length) {
        message.warn(
          formatMessage({ id: 'odc.TablePage.TableData.NoContentToSubmit' }), // 无内容可提交
        );
        return;
      }
      const res = await schemaStore.batchGetDataModifySQL(
        dbName,
        tableName,
        columnList,
        true,
        editRows,
      );

      if (!res) {
        return;
      }

      let { sql, tip } = res;
      if (tip) {
        tipToShow = tip;
      }

      if (!sql) {
        message.warn(
          formatMessage({ id: 'odc.TablePage.TableData.NoContentToSubmit' }), // 无内容可提交
        );
        return;
      }

      if (autoCommit) {
        sql = sql + '\ncommit;';
      }

      this.setState({
        showDataExecuteSQLModal: true,
        updateDataDML: sql,
        tipToShow,
        resultSetIndex,
      });
    }
  };

  public handleExecuteDataDML = async () => {
    const {
      sqlStore,
      params: { tableName },
      connectionStore,
      pageKey,
    } = this.props;
    const { resultSetIndex } = this.state;

    try {
      const result = await executeSQL(this.state.updateDataDML, this.getSession()?.sessionId);
      /**
       * 这里只需要第一个错误的节点，因为一个报错，后面的都会取消执行，没必要把取消执行的错误也抛出去
       */
      const errorResult = result?.find((item) => item.status !== ISqlExecuteResultStatus.SUCCESS);

      if (!errorResult) {
        let msg;

        if (connectionStore.autoCommit) {
          msg = formatMessage({
            id: 'odc.components.SQLPage.SubmittedSuccessfully',
          });

          // 提交成功
        } else if (!/commit;$/.test(this.state.updateDataDML)) {
          msg = formatMessage({
            id: 'odc.components.SQLPage.TheModificationIsSuccessfulAnd',
          });

          // 修改成功，手动提交后生效
        } else {
          msg = formatMessage({
            id: 'odc.components.SQLPage.SubmittedSuccessfully',
          });

          // 提交成功
        } // 关闭对话框

        this.setState({
          showDataExecuteSQLModal: false,
          updateDataDML: '',
          tipToShow: '',
          editingMap: {
            ...this.state.editingMap,
            [sqlStore.resultSets?.get(pageKey)?.[resultSetIndex]?.uniqKey]: false,
          },
        });

        await this.handleRefreshResultSet(resultSetIndex);
        message.success(msg);
      } else {
        notification.error(errorResult);
      }
    } catch (e) {
      //
    }
  };

  public handleStartExportResultSet = (resultSetIndex: number, limit: number) => {
    this.setState({
      showExportResuleSetModal: true,
      resultSetIndexToExport: resultSetIndex,
    });
  };

  public handleExplain = async () => {
    const { connectionStore } = this.props;
    let selectedSQL = this.editor.getSelection(); // 如果没有选中，尝试获取当前语句

    if (!selectedSQL) {
      const offset = this.editor
        .UNSAFE_getCodeEditor()
        .getModel()
        .getOffsetAt(this.editor.getPosition());

      if (offset > -1) {
        selectedSQL = (
          await getCurrentSQL(
            this.editor.getValue(),
            offset,
            connectionStore.connection.dbMode == ConnectionMode.OB_MYSQL,
          )
        )?.sql;
        let trimSQL = selectedSQL?.trim();
        if (trimSQL?.endsWith(this.getSession()?.delimiter)) {
          selectedSQL = trimSQL?.slice(0, trimSQL.length - connection.delimiter.length);
        }
      }
    }

    if (!selectedSQL) {
      return;
    }
    this.setState({
      selectedSQL,
      showExplainDrawer: true,
    });
  };

  public handleShowExecuteDetail = async (sql: string, traceId: string) => {
    this.setState({
      execDetailSql: sql,
      execDetailTraceId: traceId,
      showExecuteDetailDrawer: true,
    });
  };

  outOfLimitTipHaveShow = false;

  public highlightSelectionLine = async (
    type: 'error' | 'info' = 'info',
    sectionRange?: { begin: number; end: number },
  ) => {
    const { connectionStore } = this.props;
    const editor = this.editor;
    utils.removeHightlight(editor);
    const value = editor.getValue();
    const MAX_LIMIT = 10000 * 500;
    if (!value) {
      return;
    } else if (value?.length > MAX_LIMIT) {
      !this.outOfLimitTipHaveShow &&
        message.warn(
          formatMessage({ id: 'odc.components.SQLPage.BecauseTheSqlIsToo' }), //由于 SQL 过长，编辑器将只支持预览
        );
      this.outOfLimitTipHaveShow = true;
      console.log('MAX_LIMIT: ', MAX_LIMIT, 'size:', value.length);
      return;
    }
    this.outOfLimitTipHaveShow = false;
    const selection = editor.getSelection();
    if (selection?.length) {
      return;
    }
    if (sectionRange) {
      utils.addHighlight(editor, sectionRange.begin, sectionRange.end, type);
      return;
    }
    const offset = editor.UNSAFE_getCodeEditor().getModel().getOffsetAt(editor.getPosition());
    const result = await getCurrentSQL(
      value,
      offset,
      connectionStore.connection.dbMode == ConnectionMode.OB_MYSQL,
    );

    if (!result) {
      return;
    }
    const { sql, begin, end } = result;
    console.log(begin, end);
    utils.addHighlight(editor, begin, end, type);
  };

  public debounceHighlightSelectionLine = debounce(this.highlightSelectionLine, 200);

  public onOpenObjDetail = (obj) => {
    import('@alipay/ob-editor').then((module) => {
      const SQL_OBJECT_TYPE = module.SQL_OBJECT_TYPE;
      switch (obj.objType) {
        case SQL_OBJECT_TYPE.TABLE: {
          openTableViewPage(
            getRealTableName(obj.name, connection?.connection?.dbMode === ConnectionMode.OB_ORACLE),
          );

          break;
        }
        case SQL_OBJECT_TYPE.VIEW: {
          openViewViewPage(
            getRealTableName(obj.name, connection?.connection?.dbMode === ConnectionMode.OB_ORACLE),
          );

          break;
        }
        case SQL_OBJECT_TYPE.FUNCTION: {
          openFunctionViewPage(obj.name);
          break;
        }
        default:
          break;
      }
    });
  };

  public render() {
    const {
      pageKey,
      pageStore,
      sqlStore: { resultSets, runningPageKey },
      connectionStore,
      params,
    } = this.props;
    const isMySQL = connectionStore.connection.dbMode === ConnectionMode.OB_MYSQL;
    const {
      initialSQL,
      showSaveSQLModal,
      resultSetTabActiveKey,
      showExportResuleSetModal,
      resultSetIndexToExport,
      showExplainDrawer,
      showExecuteDetailDrawer,
      execDetailSql,
      execDetailTraceId,
      selectedSQL,
      updateDataDML,
      showDataExecuteSQLModal,
      resultHeight,
      editingMap,
      pageLoading,
      lintResultSet,
    } = this.state;
    const session = this.getSession();
    return (
      <SQLConfigContext.Provider value={{ session, pageKey }}>
        <ScriptPage
          ctx={this}
          language={`sql-oceanbase-${isMySQL ? 'mysql' : 'oracle'}`}
          toolbar={{
            loading: pageLoading,
            actionGroupKey: 'SQL_DEFAULT_ACTION_GROUP',
            query: {
              isHideText: {
                maxWidth: 780,
              },

              isShrinkLeft: {
                maxWidth: 580,
              },
            },
          }}
          editor={{
            readOnly: this.editor?.getValue()?.length > 10000 * 500,
            initialValue: initialSQL,
            enableSnippet: true,
            onValueChange: this.handleSQLChanged,
            onEditorCreated: this.handleEditorCreated,
            onOpenObjDetail: this.onOpenObjDetail,
          }}
          handleChangeSplitPane={this.handleChangeSplitPane}
          Result={
            <Spin wrapperClassName={styles.spinWidth100} spinning={runningPageKey.has(pageKey)}>
              <SQLResultSet
                pageKey={pageKey}
                resultHeight={resultHeight}
                activeKey={resultSetTabActiveKey}
                onChangeResultSetTab={this.handleChangeResultSetTab}
                onCloseResultSet={this.handleCloseResultSet}
                onLockResultSet={this.handleLockResultSet}
                onUnLockResultSet={this.handleUnLockResultSet}
                onExportResultSet={this.handleStartExportResultSet}
                onShowExecuteDetail={this.handleShowExecuteDetail}
                onSubmitRows={this.handleSaveRowData}
                onUpdateEditing={this.onUpdateEditing}
                editingMap={editingMap}
                session={session}
                lintResultSet={lintResultSet}
                hanldeCloseLintPage={this.hanldeCloseLintPage}
              />
            </Spin>
          }
          Others={[
            <SaveSQLModal
              key="savesqlmodal"
              visible={showSaveSQLModal}
              onCancel={() => {
                pageStore.cancelSaving(pageKey);
                this.setState({ showSaveSQLModal: false });
              }}
              onSave={this.handleCreateSQL}
            />,

            <ExportResultSetModal
              key="exportResultSetModal"
              visible={showExportResuleSetModal}
              sql={resultSets.get(pageKey)?.[resultSetIndexToExport]?.originSql}
              tableName={
                resultSets.get(pageKey)?.[resultSetIndexToExport]?.resultSetMetaData?.table
                  ?.tableName
              }
              schemaName={resultSets.get(pageKey)?.[resultSetIndexToExport]?.schemaName}
              onClose={() => this.setState({ showExportResuleSetModal: false })}
              sessionId={session?.sessionId}
            />,

            <ExecPlan
              key="execPlan"
              visible={showExplainDrawer}
              selectedSQL={selectedSQL}
              onClose={() => {
                this.setState({
                  showExplainDrawer: false,
                  selectedSQL: null,
                });
              }}
            />,

            <ExecDetail
              key="execDetail"
              visible={showExecuteDetailDrawer}
              sql={execDetailSql}
              traceId={execDetailTraceId}
              onClose={() => {
                this.setState({
                  showExecuteDetailDrawer: false,
                  execDetailSql: null,
                  execDetailTraceId: null,
                });
              }}
            />,

            <ExecuteSQLModal
              key="executeSQLModal"
              tip={this.state.tipToShow}
              sql={updateDataDML}
              visible={showDataExecuteSQLModal}
              onSave={this.handleExecuteDataDML}
              onCancel={() => this.setState({ showDataExecuteSQLModal: false })}
              onChange={(sql) => this.setState({ updateDataDML: sql })}
            />,
          ]}
        />
      </SQLConfigContext.Provider>
    );
  }

  private triggerTableLayout() {
    setTimeout(() => {
      // 手动触发 resize 事件
      window.dispatchEvent(new Event('resize'));
    });
  }

  private executeSQL = async (
    sql: string,
    isSection?: boolean,
    sectionRange?: { begin: number; end: number },
  ) => {
    const { sqlStore, pageKey, connectionStore } = this.props;
    this.debounceHighlightSelectionLine();
    if (!sql || !sql.replace(/\s/g, '')) {
      return;
    }
    sql = sql.replace(/\r\n/g, '\n');

    const results = await sqlStore.executeSQL(
      sql,
      pageKey,
      isSection,
      this.getSession()?.sessionId,
    );

    connectionStore.initSessionTransaction(this.getSession()?.sessionId);
    if (!results) {
      return;
    }
    if (results?.find((result) => result.status !== ISqlExecuteResultStatus.SUCCESS)) {
      this.showFirrstErrorStmt(results, sectionRange);
    }
    /**
     * 装填一下额外数据,详细的列名
     */

    const firstResultKey = sqlStore.getFirstUnlockedResultKey(pageKey);

    this.setState({
      resultSetTabActiveKey: firstResultKey ? firstResultKey : recordsTabKey,
    });

    // TODO: 刷新左侧资源树

    await this.refreshResourceTree(results);
    this.triggerTableLayout();
  };

  private async showFirrstErrorStmt(
    results: ISqlExecuteResult[],
    sectionRange?: { begin: number; end: number },
  ) {
    if (sectionRange) {
      utils.setPositionAndScroll(this.editor, sectionRange.begin);
      this.debounceHighlightSelectionLine('error', sectionRange);
      return;
    }
    for (let i = 0; i < results?.length; i++) {
      const result = results[i];
      if (result.status !== ISqlExecuteResultStatus.SUCCESS) {
        const sqlIndexs = await splitSql(this.editor.getValue());
        const endOffset = sqlIndexs[i];
        const result = await getCurrentSQL(
          this.editor.getValue(),
          endOffset,
          this.props.connectionStore.connection?.dialectType === ConnectionMode.MYSQL,
        );

        if (result) {
          utils.setPositionAndScroll(this.editor, endOffset);
          this.debounceHighlightSelectionLine('error', {
            begin: result.begin,
            end: result.end,
          });
        }
        return;
      }
    }
  }
  /**
   * 按需刷新数据库资源，后端负责根据语法文件解析 SQL
   * @see aone/issue/23994679
   */

  private refreshResourceTree = async (results: ISqlExecuteResult[]) => {
    const { schemaStore, pageStore } = this.props; // DDL 需要刷新

    const resultsToRefresh = results?.filter((r) =>
      [SqlType.create, SqlType.drop, SqlType.alter].includes(r.sqlType),
    );

    if (resultsToRefresh?.length && schemaStore.enablePackage) {
      /**
       * 后端解析不出来，所以不管怎么样，都刷一遍程序包列表。
       */
      schemaStore.getPackageList();
    }

    if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.table)) {
      await schemaStore.getTableList();
      schemaStore.setLoadedTableKeys([]); // 如果 drop 掉了已经打开的 table，需要关闭 table 详情页

      const tablesToDrop = resultsToRefresh.filter(
        (r) => r.sqlType === SqlType.drop && r.dbObjectType === DbObjectType.table,
      );

      tablesToDrop.forEach(async ({ dbObjectName: tableName }) => {
        const pageKey = await generatePageKey(PageType.TABLE, {
          tableName,
        });

        pageStore.close(pageKey);
      });
    } else if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.database)) {
      await schemaStore.getDatabaseList(); // 如果 drop 当前的数据库，需要切换到空数据库并关闭掉所有已打开的页面

      const isCurrentDBBeingDropped = resultsToRefresh.filter(
        (r) =>
          r.sqlType === SqlType.drop &&
          r.dbObjectType === DbObjectType.database &&
          r.dbObjectName === schemaStore.database.name &&
          r.status === ISqlExecuteResultStatus.SUCCESS, // 且执行成功
      ).length;

      if (isCurrentDBBeingDropped) {
        await schemaStore.selectDatabase(schemaStore.databases?.[0]?.name);
        pageStore.clearExceptResidentPages();
        message.info(
          formatMessage({
            id: 'workspace.window.sql.modal.reselect.database',
          }),
        );
      }
    } else if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.view)) {
      schemaStore!.setLoadedViewKeys([]);
      await schemaStore!.getViewList();
    } else if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.function)) {
      await schemaStore.refreshFunctionList();
    } else if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.procedure)) {
      await schemaStore.getProcedureList();
    } else if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.sequence)) {
      await schemaStore.getSequenceList();
    } else if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.trigger)) {
      await schemaStore.getTriggerList();
    } else if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.synonym)) {
      await schemaStore.getSynonymList();
    } else if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.type)) {
      await schemaStore.refreshTypeList();
    }
  };

  private isDbObjectTypeExists(resultsToRefresh: ISqlExecuteResult[], type: DbObjectType) {
    return resultsToRefresh.some((r) => r.dbObjectType === type);
  }

  private getLocaleConfig = () => {
    return {
      success: 'workspace.window.sql.modal.saveSQL.success',
    };
  };
}

export default SQLPage;
