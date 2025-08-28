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

import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';
import { newScript, updateScript } from '@/common/network';
import { executeSQL, runSQLLint } from '@/common/network/sql';
import { executeTaskManager } from '@/common/network/sql/executeSQL';
import { IExecuteTaskResult } from '@/common/network/sql/preHandle';
import { batchGetDataModifySQL } from '@/common/network/table';
import { ProfileType } from '@/component/ExecuteSqlDetailModal/constant';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import { getKeyCodeValue } from '@/component/Input/Keymap/keycodemap';
import { IEditor, IFullEditor } from '@/component/MonacoEditor';
import SaveSQLModal from '@/component/SaveSQLModal';
import ScriptPage from '@/component/ScriptPage';
import SQLConfigContext from '@/component/SQLConfig/SQLConfigContext';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import { getPageTitleText } from '@/component/WindowManager/helper';
import { SQL_PAGE_RESULT_HEIGHT } from '@/constant';
import {
  ConnectionMode,
  DbObjectType,
  EStatus,
  IPage,
  ISqlExecuteResult,
  ISqlExecuteResultStatus,
  ISQLScript,
  ITableColumn,
  IUserConfig,
} from '@/d.ts';
import { IUnauthorizedDBResources } from '@/d.ts/table';
import { debounceUpdatePageScriptText, ISQLPageParams, updatePage } from '@/store/helper/page';
import { SQLPage as SQLPageModel } from '@/store/helper/page/pages';
import type { UserStore } from '@/store/login';
import modal, { ModalStore } from '@/store/modal';
import type { PageStore } from '@/store/page';
import sessionManager, { SessionManagerStore } from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import setting, { SettingStore } from '@/store/setting';
import type { SQLStore } from '@/store/sql';
import { isConnectionModeBeMySQLType } from '@/util/connection';
import { isLogicalDatabase } from '@/util/database';
import utils, { EHighLight } from '@/util/editor';
import { formatMessage } from '@/util/intl';
import notification from '@/util/notification';
import { splitSqlForHighlight } from '@/util/sql';
import { generateAndDownloadFile, getCurrentSQL } from '@/util/utils';
import { getModelProviders, getProviderModels } from '@/util/request/largeModel';
import { IModel } from '@/d.ts/llm';
import { message, Spin } from 'antd';
import { debounce, isNil } from 'lodash';
import { inject, observer } from 'mobx-react';
import { IDisposable, KeyCode, KeyMod } from 'monaco-editor/esm/vs/editor/editor.api';
import { Component, forwardRef } from 'react';
import { wrapRow } from '../DDLResultSet/util';
import SessionContextWrap from '../SessionContextWrap';
import SQLResultSet, { recordsTabKey, sqlLintTabKey } from '../SQLResultSet';
import Trace from '../Trace';
import ExecDetail from './ExecDetail';
import ExecPlan from './ExecPlan';
import styles from './index.less';
import {
  addAIAction,
  addAIContextMenu,
  addAIIcon,
  addAIHint,
  createStore,
} from './InlineChat/util';

interface ISQLPageState {
  resultHeight: number;
  initialSQL: string;
  showSaveSQLModal: boolean;
  resultSetIndexToExport: number;
  // SQL 计划
  showExplainDrawer: boolean;

  showExecuteDetailDrawer: boolean;
  showTrace: boolean;
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
  // SQL拦截开发规则集，传递给LintResultTable以及modalStore.changeCreateAsyncTaskModal使用
  lintResultSet: ISQLLintReuslt[];
  // 记录当前编辑器中的sql内容
  executeOrPreCheckSql: string;
  unauthorizedResource?: IUnauthorizedDBResources[];
  unauthorizedSql?: string;
  sqlChanged: boolean;
  baseOffset: number;
  status: EStatus;
  hasExecuted: boolean;
  // AI Models 相关状态
  allModels: IModel[];
  modelsLoading: boolean;
  modelsLoaded: boolean;
  lastModelsLoadTime: number;
}

interface IProps {
  params?: ISQLPageParams;
  sqlStore?: SQLStore;
  settingStore?: SettingStore;
  userStore?: UserStore;
  pageStore?: PageStore;
  sessionManagerStore?: SessionManagerStore;
  modalStore?: ModalStore;
  sessionId?: string;
  pageKey?: string;
  isSaved?: boolean;
  page?: IPage;
  startSaving?: boolean;
  isShow?: boolean;
  onUnsavedChange?: (pageKey: string) => void;
  onChangeSaved?: (pageKey: string) => void;
  onSetUnsavedModalTitle?: (title: string) => void;
  onSetUnsavedModalContent?: (title: string) => void;
}

@inject('sqlStore', 'userStore', 'pageStore', 'sessionManagerStore', 'modalStore', 'settingStore')
@observer
export class SQLPage extends Component<IProps, ISQLPageState> {
  public readonly state: ISQLPageState = {
    resultHeight: SQL_PAGE_RESULT_HEIGHT,
    initialSQL: this.props.params?.scriptText || '',
    showSaveSQLModal: false,
    resultSetIndexToExport: -1,
    showExplainDrawer: false,
    showExecuteDetailDrawer: false,
    showTrace: false,
    execDetailSql: null,
    execDetailTraceId: null,
    selectedSQL: '',
    executeSQL: '',
    showDataExecuteSQLModal: false,
    updateDataDML: '',
    tipToShow: '',
    executePLLoading: false,
    pageLoading: false,
    resultSetIndex: 0,
    editingMap: {},
    lintResultSet: null,
    unauthorizedResource: null,
    unauthorizedSql: '',
    executeOrPreCheckSql: null,
    sqlChanged: false,
    baseOffset: 0,
    status: null,
    hasExecuted: false,
    isSavingScript: false,
    // AI Models 初始状态
    allModels: [],
    modelsLoading: false,
    modelsLoaded: false,
    lastModelsLoadTime: 0,
  };

  public editor: IEditor;

  public fullEditor: IFullEditor;

  public chartContainer: HTMLDivElement | null = null;

  private timer: number | undefined;

  private _session: SessionStore;

  private actions: IDisposable[];
  private config: Partial<IUserConfig>;
  private disposes: (() => void)[] = [];

  constructor(props) {
    super(props);
    const resultSetKey: string = props.sqlStore.getFirstUnlockedResultKey(props.pageKey);
    props.sqlStore.setActiveTab(props.pageKey, resultSetKey ? resultSetKey : recordsTabKey);
  }

  public async componentDidMount() {
    const { pageKey, sqlStore, onSetUnsavedModalTitle, onSetUnsavedModalContent, page } =
      this.props;

    onSetUnsavedModalTitle(
      formatMessage({
        id: 'workspace.window.sql.modal.close.title',
        defaultMessage: '是否保存脚本？',
      }),
    );

    onSetUnsavedModalContent(
      formatMessage(
        {
          id: 'workspace.window.sql.modal.close.content',
          defaultMessage: '“{name}” 已经被修改，如不保存，修改将丢失',
        },

        {
          name: getPageTitleText(page),

          // `SQL 窗口_${pageName}`
        },
      ),
    );

    const resultSetKey = this.props.sqlStore.getFirstUnlockedResultKey(this.props.pageKey);
    sqlStore.setActiveTab(pageKey, resultSetKey ? resultSetKey : recordsTabKey);
  }

  handleDownload = () => {
    const sql = this.editor.getValue();
    generateAndDownloadFile(this.props.page.title, sql);
  };

  public getSession() {
    return this.props.sessionManagerStore?.sessionMap?.get(this.props.sessionId);
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
    if (this.props.sessionId != prevProps.sessionId && this.props.sessionId) {
      // update dbid
      this.props.pageStore.updatePage(
        this.props.pageKey,
        {},
        { cid: this.getSession()?.odcDatabase?.id, dbName: this.getSession()?.odcDatabase?.name },
      );
      /**
       * 异步加载内置片段
       */
      if (!isLogicalDatabase(this.getSession()?.odcDatabase)) {
        this.getSession()?.addBuiltinSnippets();
      }
    } else if (this.props.settingStore.configurations !== this.config) {
      this.bindEditorKeymap();
    }
  }

  public componentWillUnmount() {
    const { pageKey, sqlStore } = this.props;
    const session = this.getSession();
    this.disposes.forEach((d) => d());

    if (this.timer) {
      clearInterval(this.timer);
    }

    sqlStore.clear(pageKey);
    if (session) {
      executeTaskManager.stopTask(session.sessionId);
      if (sqlStore.runningPageKey[pageKey]) {
        sqlStore.stopExec(pageKey, session?.sessionId);
      }
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

  public bindEditorKeymap = () => {
    if (!this.editor) {
      return;
    }
    const {
      'odc.editor.shortcut.executeCurrentStatement': executeCurrentStatement,
      'odc.editor.shortcut.executeStatement': executeStatement,
    } = setting.configurations;
    this.actions?.forEach((action) => {
      action.dispose();
    });
    this.actions = [
      this.editor.addAction({
        id: 'sql_download',
        label: 'download',
        keybindings: [KeyMod.WinCtrl | KeyCode.KeyD],
        run: () => this.handleDownload(),
      }),
      this.editor.addAction({
        id: 'sql_save',
        label: 'save',
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
        run: () => this.saveScript(),
      }),
      this.editor.addAction({
        id: 'sql_executeSql',
        label: 'execute',
        keybindings: executeStatement ? [getKeyCodeValue(executeStatement)] : [],
        run: () => this.handleExecuteSQL(),
      }),
      this.editor.addAction({
        id: 'sql_executeSelectedSql',
        label: 'executeSelected',
        keybindings: executeCurrentStatement ? [getKeyCodeValue(executeCurrentStatement)] : [],
        run: () => this.handleExecuteSelectedSQL(),
      }),
    ];

    this.config = setting.configurations;
  };

  public handleEditorCreated = (editor: IEditor, fullEditor: IFullEditor) => {
    this.editor = editor; // 快捷键绑定
    this.fullEditor = fullEditor;
    this.bindEditorKeymap();
    this.debounceHighlightSelectionLine();
    //  编辑光标位置变化事件
    this.editor.onDidChangeCursorPosition(() => {
      this.debounceHighlightSelectionLine();
    });
    this.initAI();
  };

  /**
   * 加载模型列表
   * @param forceRefresh 是否强制刷新，忽略缓存
   */
  private loadModels = async (forceRefresh: boolean = false): Promise<void> => {
    // 检查是否需要重新加载（缓存策略：5分钟内不重复加载）
    const now = Date.now();
    const cacheExpiration = 5 * 60 * 1000; // 5分钟
    const shouldUseCache =
      this.state.modelsLoaded &&
      now - this.state.lastModelsLoadTime < cacheExpiration &&
      !forceRefresh;

    if (shouldUseCache) {
      return;
    }

    if (this.state.modelsLoading) {
      return; // 避免重复加载
    }

    try {
      this.setState({ modelsLoading: true });
      const providersData = await getModelProviders();

      // 获取所有提供商的所有模型
      const allModelsPromises = (providersData || []).map(async (provider) => {
        try {
          const models = await getProviderModels(provider.provider);
          return (models || []).map((model) => ({
            ...model,
            providerName: provider.provider,
          }));
        } catch (error) {
          console.warn(`Failed to fetch models for provider ${provider.provider}:`, error);
          return [];
        }
      });

      const modelsResults = await Promise.all(allModelsPromises);
      const flattenedModels = modelsResults.flat();

      this.setState({
        allModels: flattenedModels,
        modelsLoaded: true,
        lastModelsLoadTime: now,
        modelsLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      this.setState({ modelsLoading: false });
    }
  };

  /**
   * AI 功能挂载
   */
  public initAI = async () => {
    // 初始化时加载模型
    if (!this.state.modelsLoaded && !this.state.modelsLoading) {
      await this.loadModels();
    }
    const store = createStore();
    const modelsData = {
      allModels: this.state.allModels,
      modelsLoading: this.state.modelsLoading,
      onRefreshModels: () => this.loadModels(true),
    };
    const show = addAIAction(
      this.editor,
      () => this.getSession(),
      store,
      this.fullEditor,
      modelsData,
    );
    const { dispose } = addAIIcon(this.editor, store, show, this.fullEditor);
    const disposeMenu = addAIContextMenu(
      this.editor,
      store,
      show,
      this.fullEditor,
      () => this.getSession(),
      dispose,
    );
    const disposeHint = addAIHint(this.editor);
    this.disposes.push(() => {
      dispose();
      disposeHint();
      disposeMenu();
      this.editor.setSelection({
        startLineNumber: this.editor.getSelection()?.startLineNumber,
        startColumn: this.editor.getSelection()?.startColumn,
        endLineNumber: this.editor.getSelection()?.startLineNumber,
        endColumn: this.editor.getSelection()?.startColumn,
      });
    });
  };

  public handleSQLChanged = (sql: string) => {
    const { pageKey, onUnsavedChange, isSaved } = this.props;
    const { executeOrPreCheckSql } = this.state;
    debounceUpdatePageScriptText(pageKey, sql);
    this.debounceHighlightSelectionLine();
    if (isSaved) {
      onUnsavedChange(pageKey);
    }
    if (executeOrPreCheckSql && executeOrPreCheckSql !== sql) {
      this.setState({
        sqlChanged: true,
      });
    } else {
      this.setState({
        sqlChanged: false,
      });
    }
  };

  public handleExecuteSQL = async () => {
    const { params, sqlStore, pageKey } = this.props;

    const selectedSQL = this.editor.getSelectionContent();
    const sqlToExecute = selectedSQL || params.scriptText;
    const range = await utils.getCurrentSelectRange(this.editor);
    const result = await this.executeSQL(
      sqlToExecute,
      false,
      selectedSQL ? await utils.getCurrentSelectRange(this.editor) : null,
    );
    if (selectedSQL) {
      if (range.begin === range.end) {
        this.setState({
          baseOffset: selectedSQL ? range.begin - this.editor?.getSelectionContent()?.length : 0,
        });
      } else if (range.begin < range.end) {
        this.setState({
          baseOffset: selectedSQL ? range.begin : 0,
        });
      }
    } else {
      this.setState({
        baseOffset: 0,
      });
    }
    if (result?.hasLintResults) {
      if (
        result?.executeResult &&
        Array.isArray(result?.executeResult) &&
        result?.executeResult?.find((result) => result.status !== ISqlExecuteResultStatus.SUCCESS)
      ) {
        const lastResultKey = sqlStore.getLastUnlockedResultKey(pageKey);
        sqlStore.setActiveTab(pageKey, lastResultKey ? lastResultKey : recordsTabKey);
      } else if (result?.status !== EStatus.SUBMIT) {
        sqlStore.setActiveTab(pageKey, sqlLintTabKey);
      }
      this.setState({
        lintResultSet: result?.lintResultSet,
        executeOrPreCheckSql: sqlToExecute,
        sqlChanged: false,
      });
    } else {
      this.setState({
        baseOffset: 0,
        lintResultSet: null,
        executeOrPreCheckSql: sqlToExecute,
        sqlChanged: false,
      });
    }
  };
  // 执行选中的 SQL
  public handleExecuteSelectedSQL = async () => {
    const { sqlStore, pageKey } = this.props;
    let selectedSQL = this.editor.getModel().getValueInRange(this.editor.getSelection()); // 如果没有选中，尝试获取当前语句
    let begin, end;
    if (!selectedSQL) {
      const offset = this.editor.getModel().getOffsetAt(this.editor.getPosition());

      if (offset > -1) {
        const result = await getCurrentSQL(
          this.editor.getValue(),
          offset,
          isConnectionModeBeMySQLType(this.getSession()?.connection.dialectType),
          this.getSession()?.params?.delimiter,
        );

        if (result) {
          selectedSQL = result.sql;
          begin = result.begin;
          end = result.end;
        }
      }
    } else {
      const range = this.editor.getSelection();
      begin = this.editor.getModel().getOffsetAt(range.getStartPosition());
      end = this.editor.getModel().getOffsetAt(range.getEndPosition());
    }

    if (!selectedSQL) {
      return;
    }
    const results = await this.executeSQL(selectedSQL, true, { begin, end });
    const range = await utils.getCurrentSelectRange(this.editor);
    if (range.begin === range.end) {
      this.setState({
        baseOffset: range.begin - this.editor?.getSelectionContent()?.length || 0,
      });
    } else if (range.begin < range.end) {
      this.setState({
        baseOffset: range.begin || 0,
      });
    }
    if (results?.hasLintResults) {
      if (
        results?.executeResult &&
        Array.isArray(results?.executeResult) &&
        results?.executeResult?.find((result) => result.status !== ISqlExecuteResultStatus.SUCCESS)
      ) {
        const lastResultKey = sqlStore.getLastUnlockedResultKey(pageKey);
        sqlStore.setActiveTab(pageKey, lastResultKey ? lastResultKey : recordsTabKey);
      } else if (results?.status !== EStatus.SUBMIT) {
        sqlStore.setActiveTab(pageKey, sqlLintTabKey);
      }
      this.setState({
        lintResultSet: results?.lintResultSet,
        executeOrPreCheckSql: selectedSQL,
        sqlChanged: false,
      });
    } else {
      this.setState({
        baseOffset: 0,
        lintResultSet: null,
        executeOrPreCheckSql: selectedSQL,
        sqlChanged: false,
      });
    }
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
              id: 'workspace.window.sql.modal.saveSQL.success',
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
      const sqlPage = new SQLPageModel(params?.cid, {
        scriptMeta: newFile,
        content: params?.scriptText,
      });
      pageStore.updatePage(
        pageKey,
        {
          title: newFile.objectName,
          updateKey: sqlPage.pageKey,
          isSaved: true,
          startSaving: false,
        },

        { ...newFile, scriptId: newFile.id },
      );

      onSetUnsavedModalContent(
        formatMessage(
          {
            id: 'workspace.window.sql.modal.close.content',
            defaultMessage: '“{name}” 已经被修改，如不保存，修改将丢失',
          },

          {
            name: script.objectName,
          },
        ),
      );

      onChangeSaved(pageKey);
      message.success(
        formatMessage({
          id: 'workspace.window.sql.modal.saveSQL.success',
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
    if (!this.getSession()) {
      return;
    }
    if (this.state.lintResultSet) {
      this.hanldeCloseLintPage();
    }
    const selectted = this.editor.getSelectionContent();
    const value = selectted || this.editor.getValue();
    if (!value) {
      return;
    }
    utils.removeHighlight(this.editor);
    const range = await utils.getCurrentSelectRange(this.editor);
    const result = await runSQLLint(
      this.getSession()?.sessionId,
      this.getSession()?.params?.delimiter,
      value,
    );
    if (selectted) {
      if (range.begin === range.end) {
        this.setState({
          baseOffset: range.begin - this.editor?.getSelectionContent()?.length || 0,
        });
      } else if (range.begin < range.end) {
        this.setState({
          baseOffset: range.begin || 0,
        });
      }
    } else {
      this.setState({
        baseOffset: 0,
      });
    }
    this.setState({
      executeOrPreCheckSql: value,
      sqlChanged: false,
    });
    if (result?.checkResults) {
      if (!result.checkResults.length) {
        /**
         * 无规则
         */
        message.success(
          formatMessage({
            id: 'odc.components.SQLPage.SqlCheckPassed',
            defaultMessage: 'SQL 检查通过',
          }), //SQL 检查通过
        );
        this.setState({
          baseOffset: 0,
        });
        return;
      }

      this.setState(
        {
          lintResultSet: result?.checkResults,
        },
        () => this.props.sqlStore.setActiveTab(this.props.pageKey, sqlLintTabKey),
      );
    }
  };
  public handleRefreshResultSet = async (resultSetIndex: number) => {
    const { sqlStore, pageKey } = this.props;
    await sqlStore.refreshResultSet(pageKey, resultSetIndex, this.getSession()?.sessionId);
    this.triggerTableLayout();
  };

  public hanldeCloseLintPage = () => {
    const { pageKey, sqlStore } = this.props;
    this.setState(
      {
        baseOffset: 0,
        lintResultSet: null,
      },
      () =>
        this.props.sqlStore.setActiveTab(
          pageKey,
          sqlStore.activeTab[pageKey] === sqlLintTabKey
            ? recordsTabKey
            : sqlStore.activeTab[pageKey],
        ),
    );
  };

  public handleCloseResultSet = (resultSetKey: string) => {
    const { sqlStore, pageKey } = this.props;
    const oldLastIndex = sqlStore.resultSets.get(pageKey).length - 1;
    const resultSetIndex = sqlStore.resultSets.get(pageKey)?.findIndex((set) => {
      return set.uniqKey === resultSetKey;
    });
    sqlStore.closeResultSet(pageKey, resultSetKey);
    const resultSet = sqlStore.resultSets.get(pageKey); // 如果已经关闭了全部结果集，只剩下历史记录，需要切换

    if (resultSet && resultSet.length === 0) {
      sqlStore.setActiveTab(pageKey, recordsTabKey);
    } else if (sqlStore.activeTab[pageKey] === resultSetKey) {
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
      sqlStore.setActiveTab(pageKey, resultSet[openIndex].uniqKey);
    }

    this.triggerTableLayout();
  };

  public handleLockResultSet = (key: string) => {
    const { sqlStore, pageKey } = this.props;
    sqlStore.lockResultSet(pageKey, key);
  };

  public handleCheckDatabasePermission = (result: IExecuteTaskResult) => {
    this.setState({
      unauthorizedResource: result?.unauthorizedDBResources,
      unauthorizedSql: result?.unauthorizedSql,
    });
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

  public handleCloseOtherResultSets = (currentKey: string) => {
    const { sqlStore, pageKey } = this.props;
    const resultSets = sqlStore.resultSets.get(pageKey);

    // 关闭其它结果集
    sqlStore.closeOtherResultSets(pageKey, currentKey);

    // 检查当前激活tab是否被关闭，如果被关闭则切换到当前结果集
    const updatedResultSets = sqlStore.resultSets.get(pageKey);
    if (
      updatedResultSets &&
      !updatedResultSets.find((set) => set.uniqKey === sqlStore.activeTab[pageKey])
    ) {
      sqlStore.setActiveTab(pageKey, currentKey);
    }

    this.triggerTableLayout();
  };

  public handleCloseAllResultSets = () => {
    const { sqlStore, pageKey } = this.props;

    // 关闭所有结果集
    sqlStore.closeAllResultSets(pageKey);

    // 切换到执行记录tab
    const updatedResultSets = sqlStore.resultSets.get(pageKey);
    if (!updatedResultSets || updatedResultSets.length === 0) {
      sqlStore.setActiveTab(pageKey, 'records');
    } else {
      // 优先定位到日志tab
      const logTab = updatedResultSets.find((set) => set.type === 'LOG');
      if (logTab) {
        sqlStore.setActiveTab(pageKey, logTab.uniqKey);
      } else {
        // 如果没有日志tab，则定位到第一个（固定的结果集）
        sqlStore.setActiveTab(pageKey, updatedResultSets[0].uniqKey);
      }
    }

    this.triggerTableLayout();
  };

  public handleChangeResultSetTab = (activeKey: string) => {
    const { sqlStore, pageKey } = this.props;
    sqlStore.setActiveTab(pageKey, activeKey);
  };

  public handleSaveRowData = async (
    resultSetIndex: number,
    newRows: any[],
    limit: number,
    autoCommit: boolean,
    columnList: ITableColumn[],
    dbName: string,
  ) => {
    const { sqlStore, pageKey } = this.props;
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
            message.warning(
              formatMessage({
                id: 'odc.TablePage.TableData.DoNotSubmitBlankLines',
                defaultMessage: '请不要提交空行',
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
        message.warning(
          formatMessage({
            id: 'odc.TablePage.TableData.NoContentToSubmit',
            defaultMessage: '无内容可提交',
          }), // 无内容可提交
        );
        return;
      }
      const res = await batchGetDataModifySQL(
        dbName,
        tableName,
        columnList,
        true,
        editRows,
        this.getSession()?.sessionId,
        this.getSession()?.database?.dbName,
        resultSet.whereColumns,
      );

      if (!res) {
        return;
      }

      let { sql, tip } = res;
      if (tip) {
        tipToShow = tip;
      }

      if (!sql) {
        message.warning(
          formatMessage({
            id: 'odc.TablePage.TableData.NoContentToSubmit',
            defaultMessage: '无内容可提交',
          }), // 无内容可提交
        );
        return;
      }

      if (autoCommit) {
        sql = sql + '\ncommit;';
      }

      this.setState({
        showDataExecuteSQLModal: true,
        updateDataDML: sql,
        lintResultSet: [],
        tipToShow,
        resultSetIndex,
      });
    }
  };

  public handleExecuteDataDML = async () => {
    const { sqlStore, pageKey } = this.props;
    const { resultSetIndex, updateDataDML, hasExecuted, status, lintResultSet } = this.state;

    try {
      const result = await executeSQL(
        updateDataDML,
        this.getSession()?.sessionId,
        this.getSession()?.database?.dbName,
        false,
      );
      if (!result) {
        return;
      }
      this.handleCheckDatabasePermission(result);
      /**
       * 这里只需要第一个错误的节点，因为一个报错，后面的都会取消执行，没必要把取消执行的错误也抛出去
       */
      const errorResult = result?.executeResult?.find(
        (item) => item.status !== ISqlExecuteResultStatus.SUCCESS,
      );
      if (!hasExecuted) {
        /**
         * status为submit时，即SQL内容没有被拦截，继续执行后续代码，完成相关交互
         * status为其他情况时，中断操作
         */
        if (result?.status !== EStatus.SUBMIT) {
          this.setState({
            lintResultSet: result?.lintResultSet,
            status: result?.status,
            hasExecuted: true,
          });
          return;
        }
      } else {
        if (result?.status === EStatus.APPROVAL) {
          modal.changeCreateAsyncTaskModal(true, {
            sql: updateDataDML,
            databaseId: sessionManager.sessionMap.get(this.getSession()?.sessionId).odcDatabase?.id,
            rules: lintResultSet,
          });
        }
        this.setState({
          lintResultSet: null,
          status: null,
          hasExecuted: false,
        });
      }
      if (result?.invalid) {
        this.setState({
          showDataExecuteSQLModal: false,
          updateDataDML: '',
          tipToShow: '',
          editingMap: {
            ...this.state.editingMap,
            [sqlStore.resultSets?.get(pageKey)?.[resultSetIndex]?.uniqKey]: false,
          },
        });
        return;
      }
      if (!errorResult) {
        let msg;

        if (this.getSession()?.params?.autoCommit) {
          msg = formatMessage({
            id: 'odc.components.SQLPage.SubmittedSuccessfully',
            defaultMessage: '提交成功',
          });

          // 提交成功
        } else if (!/commit;$/.test(this.state.updateDataDML)) {
          msg = formatMessage({
            id: 'odc.components.SQLPage.TheModificationIsSuccessfulAnd',
            defaultMessage: '修改成功，手动提交后生效',
          });

          // 修改成功，手动提交后生效
        } else {
          msg = formatMessage({
            id: 'odc.components.SQLPage.SubmittedSuccessfully',
            defaultMessage: '提交成功',
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

  public handleStartExportResultSet = (
    resultSetIndex: number,
    limit: number,
    tableName: string,
  ) => {
    this.setState(
      {
        resultSetIndexToExport: resultSetIndex,
      },
      () => {
        this.showExportResuleSetModal(tableName);
      },
    );
  };

  public handleExplain = async () => {
    const { modalStore } = this.props;
    let selectedSQL = this.editor.getSelectionContent(); // 如果没有选中，尝试获取当前语句

    if (!selectedSQL) {
      const offset = this.editor.getModel().getOffsetAt(this.editor.getPosition());

      if (offset > -1) {
        selectedSQL = (
          await getCurrentSQL(
            this.editor.getValue(),
            offset,
            isConnectionModeBeMySQLType(this.getSession()?.connection.dialectType),
            this.getSession()?.params?.delimiter,
          )
        )?.sql;
        let trimSQL = selectedSQL?.trim();
        if (trimSQL?.endsWith(this.getSession()?.params?.delimiter)) {
          selectedSQL = trimSQL?.slice(
            0,
            trimSQL.length - this.getSession()?.params?.delimiter.length,
          );
        }
      }
    }

    if (!selectedSQL) {
      return;
    }
    // 区分版本
    const session = this?.getSession();
    if (session?.supportFeature?.enableProfile) {
      modalStore.changeExecuteSqlDetailModalVisible(
        true,
        null,
        this?.state?.initialSQL,
        this?.getSession(),
        selectedSQL,
        ProfileType.Plan,
      );
    } else {
      this.setState({
        selectedSQL,
        showExplainDrawer: true,
      });
    }
  };

  public handleShowExecuteDetail = async (sql: string, traceId: string) => {
    this.setState({
      execDetailSql: sql,
      execDetailTraceId: traceId,
      showExecuteDetailDrawer: true,
    });
  };
  public handleShowTrace = async (sql: string, traceId: string) => {
    this.setState({
      execDetailSql: sql,
      execDetailTraceId: traceId,
      showTrace: true,
    });
  };

  outOfLimitTipHaveShow = false;

  public highlightSelectionLine = async (
    type: 'error' | 'info' = 'info',
    sectionRange?: { begin: number; end: number },
  ) => {
    const editor = this.editor;
    utils.removeHighlight(editor);
    const value = editor.getValue();
    const MAX_LIMIT = 10000 * 500;
    if (!value) {
      return;
    } else if (value?.length > MAX_LIMIT) {
      !this.outOfLimitTipHaveShow &&
        message.warning(
          formatMessage({
            id: 'odc.components.SQLPage.BecauseTheSqlIsToo',
            defaultMessage: '由于 SQL 过长，编辑器将只支持预览',
          }), //由于 SQL 过长，编辑器将只支持预览
        );
      this.outOfLimitTipHaveShow = true;
      console.log('MAX_LIMIT: ', MAX_LIMIT, 'size:', value.length);
      return;
    }
    this.outOfLimitTipHaveShow = false;
    const selection = editor.getSelectionContent();
    if (selection?.length) {
      return;
    }
    if (sectionRange) {
      utils.addHighlight(editor, sectionRange.begin, sectionRange.end, type as EHighLight);
      return;
    }
    const offset = editor.getModel().getOffsetAt(editor.getPosition());
    const result = await getCurrentSQL(
      value,
      offset,
      isConnectionModeBeMySQLType(this.getSession()?.connection.dialectType),
      this.getSession()?.params?.delimiter,
    );

    if (!result) {
      return;
    }
    const { sql, begin, end } = result;
    utils.addHighlight(editor, begin, end, type as EHighLight);
  };

  public debounceHighlightSelectionLine = debounce(this.highlightSelectionLine, 200);

  // public onOpenObjDetail = (obj) => {
  //   const session = this.getSession()
  //   switch (obj.objType) {
  //     case SQL_OBJECT_TYPE.TABLE: {
  //       openTableViewPage(
  //         getRealTableName(obj.name, session?.connection?.dialectType === ConnectionMode.OB_ORACLE),

  //       );

  //       break;
  //     }
  //     case SQL_OBJECT_TYPE.VIEW: {
  //       openViewViewPage(
  //         getRealTableName(obj.name, session?.connection?.dialectType === ConnectionMode.OB_ORACLE),
  //       );

  //       break;
  //     }
  //     case SQL_OBJECT_TYPE.FUNCTION: {
  //       openFunctionViewPage(obj.name);
  //       break;
  //     }
  //     default:
  //       break;
  //   }
  // };

  showExportResuleSetModal = (tableName: string) => {
    const {
      modalStore,
      pageKey,
      sqlStore: { resultSets },
    } = this.props;
    const { resultSetIndexToExport } = this.state;
    const session = this.getSession();
    const sql = resultSets.get(pageKey)?.[resultSetIndexToExport]?.originSql;
    modalStore.changeCreateResultSetExportTaskModal(true, {
      sql,
      databaseId: session?.database.databaseId,
      tableName,
    });
  };

  public render() {
    const { pageKey, pageStore, sqlStore, params } = this.props;
    const session = this.getSession();
    const config = getDataSourceModeConfigByConnectionMode(session?.connection?.dialectType);
    const {
      initialSQL,
      showSaveSQLModal,
      showExplainDrawer,
      showExecuteDetailDrawer,
      showTrace,
      execDetailSql,
      execDetailTraceId,
      selectedSQL,
      updateDataDML,
      showDataExecuteSQLModal,
      resultHeight,
      editingMap,
      pageLoading,
      lintResultSet,
      status,
      sqlChanged,
      baseOffset,
      unauthorizedResource,
      unauthorizedSql,
    } = this.state;
    const getKey = () => {
      return sqlStore.activeTab[pageKey];
    };
    return (
      <SQLConfigContext.Provider value={{ session, pageKey }}>
        <ScriptPage
          session={session}
          ctx={this}
          language={config?.sql?.language}
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
            defaultValue: initialSQL,
            enableSnippet: true,
            onValueChange: this.handleSQLChanged,
            onEditorCreated: this.handleEditorCreated,
            // onOpenObjDetail: this.onOpenObjDetail,
          }}
          handleChangeSplitPane={this.handleChangeSplitPane}
          Result={
            <Spin wrapperClassName={styles.spinWidth100} spinning={false}>
              <SQLResultSet
                pageKey={pageKey}
                ctx={this}
                resultHeight={resultHeight}
                activeKey={getKey()}
                onChangeResultSetTab={this.handleChangeResultSetTab}
                onCloseResultSet={this.handleCloseResultSet}
                onLockResultSet={this.handleLockResultSet}
                onUnLockResultSet={this.handleUnLockResultSet}
                onCloseOtherResultSets={this.handleCloseOtherResultSets}
                onCloseAllResultSets={this.handleCloseAllResultSets}
                onExportResultSet={this.handleStartExportResultSet}
                onShowExecuteDetail={this.handleShowExecuteDetail}
                onShowTrace={this.handleShowTrace}
                onSubmitRows={this.handleSaveRowData}
                onUpdateEditing={this.onUpdateEditing}
                editingMap={editingMap}
                session={session}
                baseOffset={baseOffset}
                lintResultSet={lintResultSet}
                unauthorizedResource={unauthorizedResource}
                unauthorizedSql={unauthorizedSql}
                sqlChanged={sqlChanged}
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

            <ExecPlan
              session={this.getSession()}
              key={'execPlan' + this.getSession()?.sessionId}
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
              key={'execDetail' + this.getSession()?.sessionId}
              visible={showExecuteDetailDrawer}
              sql={execDetailSql}
              session={this.getSession()}
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
              sessionStore={this.getSession()}
              key="executeSQLModal"
              tip={this.state.tipToShow}
              sql={updateDataDML}
              visible={showDataExecuteSQLModal}
              status={status}
              lintResultSet={lintResultSet}
              onSave={this.handleExecuteDataDML}
              onCancel={() =>
                this.setState({
                  showDataExecuteSQLModal: false,
                  hasExecuted: false,
                  status: null,
                  lintResultSet: null,
                })
              }
              onChange={(sql) => this.setState({ updateDataDML: sql })}
            />,

            <Trace
              key={'trace' + this.getSession()?.sessionId}
              open={showTrace}
              sql={execDetailSql}
              session={this.getSession()}
              traceId={execDetailTraceId}
              setOpen={() => this.setState({ showTrace: false })}
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
    if (!this.getSession()) {
      return;
    }
    const { sqlStore, pageKey } = this.props;
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
      this.getSession()?.database?.dbName,
      false,
    );
    this.handleCheckDatabasePermission(results);
    if ((!results || results?.invalid) && !results?.hasLintResults) {
      return;
    }
    this.getSession()?.initSessionStatus();
    if (!results?.executeResult) {
      return;
    }
    if (
      results?.executeResult?.find((result) => result.status !== ISqlExecuteResultStatus.SUCCESS)
    ) {
      this.showFirrstErrorStmt(results?.executeResult, sectionRange);
    }
    /**
     * 装填一下额外数据,详细的列名
     */
    const lastResultKey = sqlStore.getLastUnlockedResultKey(pageKey);
    sqlStore.setActiveTab(pageKey, lastResultKey ? lastResultKey : recordsTabKey);

    // TODO: 刷新左侧资源树

    // await this.refreshResourceTree(results);
    this.triggerTableLayout();
    if (results?.hasLintResults) {
      return results;
    }
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
    const session = this.getSession();
    for (let i = 0; i < results?.length; i++) {
      const result = results[i];
      if (result.status !== ISqlExecuteResultStatus.SUCCESS) {
        const sqlIndexs = await splitSqlForHighlight(
          this.editor.getValue(),
          session.connection?.dialectType === ConnectionMode.MYSQL,
          session?.params?.delimiter,
        );
        const endOffset = sqlIndexs[i];
        const result = await getCurrentSQL(
          this.editor.getValue(),
          endOffset,
          session.connection?.dialectType === ConnectionMode.MYSQL,
          session?.params?.delimiter,
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

  // private refreshResourceTree = async (results: ISqlExecuteResult[]) => {
  //   const { pageStore } = this.props; // DDL 需要刷新
  //   const session = this.getSession();
  //   const resultsToRefresh = results?.filter((r) =>
  //     [SqlType.create, SqlType.drop, SqlType.alter].includes(r.sqlType),
  //   );

  //   if (resultsToRefresh?.length && session?.supportFeature?.enablePackage) {
  //     /**
  //      * 后端解析不出来，所以不管怎么样，都刷一遍程序包列表。
  //      */
  //     schemaStore.getPackageList();
  //   }

  //   if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.table)) {
  //     await schemaStore.getTableList();
  //     schemaStore.setLoadedTableKeys([]); // 如果 drop 掉了已经打开的 table，需要关闭 table 详情页

  //     const tablesToDrop = resultsToRefresh.filter(
  //       (r) => r.sqlType === SqlType.drop && r.dbObjectType === DbObjectType.table,
  //     );

  //     tablesToDrop.forEach(async ({ dbObjectName: tableName }) => {
  //       const pageKey = await generatePageKey(PageType.TABLE, {
  //         tableName,
  //       });

  //       pageStore.close(pageKey);
  //     });
  //   } else if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.database)) {
  //     await schemaStore.getDatabaseList(); // 如果 drop 当前的数据库，需要切换到空数据库并关闭掉所有已打开的页面

  //     const isCurrentDBBeingDropped = resultsToRefresh.filter(
  //       (r) =>
  //         r.sqlType === SqlType.drop &&
  //         r.dbObjectType === DbObjectType.database &&
  //         r.dbObjectName === schemaStore.database.name &&
  //         r.status === ISqlExecuteResultStatus.SUCCESS, // 且执行成功
  //     ).length;

  //     if (isCurrentDBBeingDropped) {
  //       await schemaStore.selectDatabase(schemaStore.databases?.[0]?.name);
  //       pageStore.clearExceptResidentPages();
  //       message.info(
  //         formatMessage({
  //           id: 'workspace.window.sql.modal.reselect.database',
  //         }),
  //       );
  //     }
  //   } else if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.view)) {
  //     schemaStore!.setLoadedViewKeys([]);
  //     await schemaStore!.getViewList();
  //   } else if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.function)) {
  //     await schemaStore.refreshFunctionList();
  //   } else if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.procedure)) {
  //     await schemaStore.getProcedureList();
  //   } else if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.sequence)) {
  //     await schemaStore.getSequenceList();
  //   } else if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.trigger)) {
  //     await schemaStore.getTriggerList();
  //   } else if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.synonym)) {
  //     await schemaStore.getSynonymList();
  //   } else if (this.isDbObjectTypeExists(resultsToRefresh, DbObjectType.type)) {
  //     await schemaStore.refreshTypeList();
  //   }
  // };

  private isDbObjectTypeExists(resultsToRefresh: ISqlExecuteResult[], type: DbObjectType) {
    return resultsToRefresh.some((r) => r.dbObjectType === type);
  }
}

export default forwardRef(function (props: IProps, ref: React.ForwardedRef<SQLPage>) {
  return (
    <SessionContextWrap defaultDatabaseId={props.params?.cid} warnIfNotFound={false}>
      {({ session }) => {
        return <SQLPage sessionId={session?.sessionId} {...props} ref={ref} />;
      }}
    </SessionContextWrap>
  );
});
