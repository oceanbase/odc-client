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

import EditorToolBar from '@/component/EditorToolBar';
import PL_ACTIONS from '@/component/EditorToolBar/actions/pl';
import EditPLParamsModal from '@/component/EditPLParamsModal';
import SaveSQLModal from '@/component/SaveSQLModal';
import ScriptPage from '@/component/ScriptPage';
import { UserStore } from '@/store/login';
import { PageStore } from '@/store/page';
import { SQLStore } from '@/store/sql';
import editorUtils from '@/util/editor';
import { formatMessage } from '@/util/intl';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Checkbox, message, Modal, Typography } from 'antd';
import EventBus from 'eventbusjs';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import PLDebugResultSet from '../PLDebugResultSet';
import {
  ConnectionMode,
  IFormatPLSchema,
  IFunction,
  IPage,
  IPLCompileResult,
  IPLExecResult,
  IPLParam,
  IProcedure,
  ISqlExecuteResultStatus,
  ISQLScript,
} from '@/d.ts';
import {
  getFunctionByFuncName,
  getProcedureByProName,
  newScript,
  updateScript,
} from '@/common/network';
import { executeSQL } from '@/common/network/sql';
import { IEditor } from '@/component/MonacoEditor';
import PL_TYPE, { PLType } from '@/constant/plType';
import { DebugStore } from '@/store/debug';
import { DebugStatus, IDebugStackItem } from '@/store/debug/type';
import { debounceUpdatePageScriptText, updatePage } from '@/store/helper/page';
import {
  AnonymousPage,
  PackageBodyPage,
  PackageHeadPage,
  PLEditPage,
  PLPageType,
} from '@/store/helper/page/pages/pl';
import { SessionManagerStore } from '@/store/sessionManager';
import { IPLPageActionData, IPLPageCreatedEventData, ODCEventType } from '@/util/events/type';
import notification from '@/util/notification';
import { getPLEntryName } from '@/util/parser';
import { checkPLNameChanged } from '@/util/pl';
import { debounce } from 'lodash';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import SessionContextWrap from '../SessionContextWrap';
import { getDataSourceModeConfig } from '@/common/datasource';
const RESULT_HEIGHT = 230;
const VERSION_324 = '3.2.4.0';
const PL_DEBUG_TIP_VSIBLE_KEY = 'odc_pl_debug_visible';
export interface IDebugStack {
  plName: string;
  active: boolean;
  ddl: string;
  lineNum?: number;
  breakpointMap: object;
  packageName?: string;
}
export interface IStatusBar {
  type?: 'COMPILE' | 'RUN' | 'DEBUG';
  status: 'SUCCESS' | 'FAIL' | 'RUNNING' | 'WARNING' | '';
  startTime?: number;
  endTime?: number;
}
interface IProps {
  params:
    | PLEditPage['pageParams']
    | PackageHeadPage['pageParams']
    | PackageBodyPage['pageParams']
    | AnonymousPage['pageParams'];
  sqlStore: SQLStore;
  userStore: UserStore;
  pageStore: PageStore;
  sessionManagerStore: SessionManagerStore;
  sessionId: string;
  debugStore?: DebugStore;
  pageKey: string;
  page: IPage;
  startSaving: boolean;
  onUnsavedChange: (pageKey: string) => void;
  onChangeSaved: (pageKey: string) => void;
  onSetUnsavedModalTitle: (title: string) => void;
  onSetUnsavedModalContent: (title: string) => void;
}
export type IResultType = 'COMPILE' | 'EXEC' | 'DEBUG' | '';
export interface IResultData {
  // 编译结果
  COMPILE?: IPLCompileResult;
  // 运行结果
  EXEC?: IPLExecResult;
  //  DBMS
  DBMS?: IPLExecResult['dbms'];
}
interface ISQLPageState {
  isReady: boolean;
  plAction?: 'DEBUG' | 'EXEC' | '' | 'COMPILE';
  scriptType?: 'SQL' | 'PL';
  resultHeight: number;
  initialSQL: string;
  showSaveSQLModal: boolean;
  executeSQLLoading: boolean;
  showEditPLParamsModal: boolean;
  showGrammerHelpSider: boolean;
  debug: boolean;
  toolBarLoading: boolean;
  statusBar: IStatusBar;
  isSavingScript: boolean;
  defaultAnonymousBlockDdl: string;
  result: {
    type: IResultType;
    data: IResultData;
  };
  /**
   * 当前显示的编辑器PL对象
   */
  currentDebugObj: {
    packageName: string;
    plName: string;
    plType: PLType;
  };
}
@inject('sqlStore', 'userStore', 'pageStore', 'debugStore', 'sessionManagerStore')
@observer
export class PLPage extends Component<IProps, ISQLPageState> {
  public readonly state: ISQLPageState = {
    isReady: false,
    resultHeight: RESULT_HEIGHT,
    initialSQL: this.props.params?.scriptText || '',
    showSaveSQLModal: false,
    executeSQLLoading: false,
    showEditPLParamsModal: false,
    showGrammerHelpSider: false,
    isSavingScript: false,
    debug: false,
    statusBar: {
      status: '',
      startTime: null,
      endTime: null,
    },
    toolBarLoading: false,
    plAction: '',
    defaultAnonymousBlockDdl: '',
    result: {
      type: '',
      data: null,
    },
    currentDebugObj: {
      packageName: '',
      plName: '',
      plType: null,
    },
  };
  public editor: IEditor;
  public chartContainer: HTMLDivElement | null = null;
  private timer: number | undefined;
  private timerAutoRunPLAction: any;
  debugMode: monaco.editor.IContextKey<boolean>;
  public async componentDidMount() {
    this.registerUnSavedModal();
    this.setState({
      isReady: true,
    });
  }
  public registerUnSavedModal() {
    const { params, pageKey, onSetUnsavedModalTitle, onSetUnsavedModalContent } = this.props;
    onSetUnsavedModalTitle(
      formatMessage({
        id: 'workspace.window.sql.modal.close.title',
      }),
    );
    switch (params?.plPageType) {
      case PLPageType.anonymous: {
        onSetUnsavedModalContent(
          formatMessage(
            {
              id: 'workspace.window.sql.modal.close.content',
            },
            {
              name:
                params.scriptName ||
                formatMessage({
                  id: 'odc.src.page.Workspace.components.PLPage.PLWindow',
                }) + //'PL 窗口_'
                  pageKey.replace('pl-new-', ''),
            },
          ),
        );
        return;
      }
      case PLPageType.plEdit: {
        onSetUnsavedModalContent(
          formatMessage(
            {
              id: 'workspace.window.sql.modal.close.content',
            },
            {
              name: params.plName,
            },
          ),
        );
        return;
      }
      case PLPageType.pkgBody:
      case PLPageType.pkgHead: {
        onSetUnsavedModalContent(
          formatMessage(
            {
              id: 'workspace.window.sql.modal.close.content',
            },
            {
              name: params.packageName,
            },
          ),
        );
        return;
      }
    }
  }
  public registerEventBus() {
    EventBus.addEventListener(ODCEventType.PLPageAction, this.listenAction);
    EventBus.dispatch(ODCEventType.PLPageCreated, null, {
      pageKey: this.props.pageKey,
    } as IPLPageCreatedEventData);
  }
  public async UNSAFE_componentWillReceiveProps(nextProps, prevProps) {
    if (nextProps) {
      if (nextProps.startSaving) {
        this.handleSave();
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
  componentDidUpdate(
    prevProps: Readonly<IProps>,
    prevState: Readonly<ISQLPageState>,
    snapshot?: any,
  ): void {
    /**
     * 注册eventbus
     */
    if (
      !this.props.sessionManagerStore.sessionMap.has(prevProps.sessionId) &&
      this.props.sessionManagerStore.sessionMap.has(this.props.sessionId)
    ) {
      this.registerEventBus();
    }
  }
  public listenAction = (e, data: IPLPageActionData) => {
    const { sessionManagerStore, sessionId, params } = this.props;
    const { action, databaseId, plName, plType } = data;
    const session = sessionManagerStore.sessionMap.get(sessionId);
    if (!session) {
      return;
    }
    const { odcDatabase } = session;
    if (odcDatabase?.id !== databaseId) {
      return;
    }
    switch (params?.plPageType) {
      case PLPageType.plEdit: {
        if (params?.plName === plName && params?.plType === plType) {
          this.autoRunPLAction(data);
        }
        return;
      }
      case PLPageType.pkgBody: {
        if (params?.plSchema?.plName === plName && plType === PLType.PKG_BODY) {
          this.autoRunPLAction(data);
        }
        return;
      }
      default: {
        return;
      }
    }
  };
  public componentWillUnmount() {
    const { pageKey, sqlStore, debugStore } = this.props;
    const { debug } = this.state;
    if (debug) {
      debugStore.removeDebug(pageKey);
    }
    if (this.timerAutoRunPLAction) {
      clearTimeout(this.timerAutoRunPLAction);
    }
    sqlStore.clear(pageKey);
    if (this.getSession()) {
      this.props.sessionManagerStore.destorySession(this.getSession().sessionId);
    }
    EventBus.removeEventListener(ODCEventType.PLPageAction, this.listenAction);
  }

  // 操作集 - 自动运行操作
  public async autoRunPLAction(params: IPLPageActionData) {
    const { action } = params;
    if (!action) {
      return;
    }
    clearTimeout(this.timerAutoRunPLAction);
    this.timerAutoRunPLAction = setTimeout(async () => {
      if (this.state.debug || this.props.sqlStore.runningPageKey.has(this.props.pageKey)) {
        /**
         * 当前正在调试或者运行编译的时候，不能继续触发
         */
        return;
      }
      switch (action) {
        case 'compile': {
          await EditorToolBar.triggler(this, `PL_COMPILE`);
          return;
        }
        case 'run': {
          await EditorToolBar.triggler(this, `PL_EXEC`);
          return;
        }
        case 'debug': {
          await EditorToolBar.triggler(this, `PL_DEBUG`);
          return;
        }
      }
    }, 500);
  }
  public handleEditorCreated = (editor: IEditor) => {
    const self = this;
    this.editor = editor;
    // 快捷键绑定
    this.editor.addAction({
      id: 'pl_executeSql',
      label: 'execute',
      keybindings: [monaco.KeyCode.F8],
      run: this.handleExecuteSQL,
    });
    const codeEditor = editor;
    this.debugMode = codeEditor.createContextKey('debugMode', false);
    import('monaco-editor').then((module) => {
      const monaco = module;
      this.editor.addAction({
        id: 'debug_step_in',
        label: 'stepIn',
        keybindings: [monaco.KeyCode.KeyI | monaco.KeyMod.CtrlCmd],
        // @ts-ignore
        run: () => (this.debugMode.get() ? PL_ACTIONS.PL_DEBUG_STEP_IN.action(self) : null),
      });
      this.editor.addAction({
        id: 'debug_step_out',
        label: 'stepOut',
        keybindings: [monaco.KeyCode.KeyO | monaco.KeyMod.CtrlCmd],
        // @ts-ignore
        run: () => (this.debugMode.get() ? PL_ACTIONS.PL_DEBUG_STEP_OUT.action(self) : null),
      });
      this.editor.addAction({
        id: 'debug_step_skip',
        label: 'stepSkip',
        keybindings: [monaco.KeyCode.KeyP | monaco.KeyMod.CtrlCmd],
        // @ts-ignore
        run: () => (this.debugMode.get() ? PL_ACTIONS.PL_DEBUG_STEP_SKIP.action(self) : null),
      });
    });
    // 调试断点事件绑定
    this.initBreakpointEventBind(editor);
  };
  public getFormatPLSchema(): IFormatPLSchema {
    const { params } = this.props;
    // 程序包内部 PL 加程序包名前缀
    switch (params?.plPageType) {
      case PLPageType.plEdit: {
        return {
          plName: params?.plName,
          plType: params?.plType,
          packageName: params.fromPackage ? params?.plSchema?.packageName : null,
          ddl: params?.plSchema?.ddl,
          params: 'params' in params?.plSchema ? params?.plSchema?.params : null,
          function: params?.plType === PLType.FUNCTION ? (params?.plSchema as IFunction) : null,
          procedure: params?.plType === PLType.PROCEDURE ? (params?.plSchema as IProcedure) : null,
        };
      }
      case PLPageType.anonymous: {
        return {
          plType: PLType.ANONYMOUSBLOCK,
          ddl: params?.scriptText,
        };
      }
      case PLPageType.pkgBody:
      case PLPageType.pkgHead: {
        return {
          plType: params?.plSchema?.plType,
          packageName: params?.packageName,
          ddl: params?.scriptText,
          plName: params?.packageName,
        };
      }
      default: {
        return null;
      }
    }
  }
  private isInMode(paramMode: string) {
    return /IN/.test(paramMode.toUpperCase());
  }

  // 调试 - 是否 PL 调试需要输入入参
  private isPLNeedFillParams() {
    const { params } = this.props;
    const config = getDataSourceModeConfig(this.getSession()?.connection?.type);
    const paramInputMode = config?.sql?.plParamMode || 'list';
    switch (params?.plPageType) {
      case PLPageType.anonymous: {
        return false;
      }
      case PLPageType.plEdit: {
        if ('params' in params?.plSchema) {
          if (paramInputMode === 'list') {
            return params?.plSchema?.params?.find(
              (param) => param.paramMode && this.isInMode(param.paramMode),
            );
          }
          /**
           * oracle 始终需要弹ddl输入框
           */
          return true;
        }
        return false;
      }
      default: {
        return false;
      }
    }
  }

  // 检查 PL 入参，如果需要填充，弹出弹层填充
  public fillPLINParams = async (plAction: any) => {
    const plSchema = this.getFormatPLSchema();
    const isNeedFillParams = this.isPLNeedFillParams();
    const stateObj = {
      plAction,
      defaultAnonymousBlockDdl: this.getDebug()?.anonymousBlock,
    };
    if (isNeedFillParams) {
      this.setState({
        ...stateObj,
        showEditPLParamsModal: true,
      });
    } else {
      this.setState(stateObj, async () => {
        await this.handleUpdatedPLParams(plSchema?.params);
      });
    }
  };
  public isShowDebugTip(plAction: any) {
    const tipVisible = localStorage.getItem(PL_DEBUG_TIP_VSIBLE_KEY);
    if (!this.getSession()?.params?.obVersion || plAction !== 'DEBUG') {
      return false;
    }
    const getVersionNumbers = (value: string) => {
      const versions = value?.split('.')?.map((item) => Number(item));
      if (versions?.length < 4) {
        versions?.push(0);
      }
      return versions;
    };
    const isLessThan324 = (value: string) => {
      let res = false;
      const version324 = getVersionNumbers(VERSION_324);
      const version = getVersionNumbers(value);
      for (let i = 0; i < version324.length; i++) {
        if (version[i] < version324[i]) {
          res = true;
          break;
        } else if (version[i] > version324[i]) {
          res = false;
          break;
        } else {
          continue;
        }
      }
      return res;
    };
    return isLessThan324(this.getSession()?.params?.obVersion) && tipVisible !== 'no';
  }
  public checkAndFillPLINParams = async (plAction: any) => {
    if (this.isShowDebugTip(plAction)) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.PLPage.TheCurrentDatabaseVersionIs',
        }),
        //当前数据库版本较低，是否继续调试？
        icon: <ExclamationCircleOutlined />,
        content: (
          <>
            <Typography.Paragraph>
              {
                formatMessage({
                  id: 'odc.components.PLPage.WeRecommendThatYouUpgrade',
                }) /*建议将 OceanBase 数据库升级至 3.2.4 及以上版本，获取更优的调试能力和稳定性*/
              }
            </Typography.Paragraph>
            <Checkbox
              onChange={(e) => {
                const value = e.target.checked ? 'no' : 'yes';
                localStorage.setItem(PL_DEBUG_TIP_VSIBLE_KEY, value);
              }}
            >
              {
                formatMessage({
                  id: 'odc.components.PLPage.NoMorePrompt',
                }) /*不再提示*/
              }
            </Checkbox>
          </>
        ),
        okText: formatMessage({
          id: 'odc.components.PLPage.Continue',
        }),
        //继续
        cancelText: formatMessage({
          id: 'odc.components.PLPage.Cancel',
        }),
        //取消
        onOk: () => {
          this.fillPLINParams(plAction);
        },
      });
    } else {
      this.fillPLINParams(plAction);
    }
  };
  public onDebugContextChange = (newContext: IDebugStackItem[], oldContext: IDebugStackItem[]) => {
    const activePl = newContext.find((context) => context.isActive);
    if (activePl) {
      this.updateEditorOfStack(activePl);
    }
    this.forceUpdate(this.syncEditorStatus);
  };

  // 提交 PL 参数, 在运行和调试前，如果有入参需要填写入参参数
  public handleUpdatedPLParams = async (plParams?: IPLParam[], anonymousBlockDdl?: string) => {
    const { sqlStore, debugStore, pageKey } = this.props;
    const plFormatSchema = this.getFormatPLSchema();
    const { plAction } = this.state;
    const isExec = plAction === 'EXEC';
    const isDebug = plAction === 'DEBUG';
    const isDebugRecover = isDebug && !!this.state.debug;
    const isOracle = this.getSession()?.connection?.dialectType === ConnectionMode.OB_ORACLE;
    const result: ISQLPageState['result'] = {
      type: plAction,
      data: {},
    };
    if (isDebugRecover) {
      /**
       * 已经处于debug状态，说明是重新调试，只需要设置一下参数就行了
       */
      this.getDebug()?.recoverDebug(
        plParams,
        plFormatSchema.plType === PLType.ANONYMOUSBLOCK ? plFormatSchema.ddl : anonymousBlockDdl,
      );
      this.setState({
        showEditPLParamsModal: false,
        defaultAnonymousBlockDdl: '',
      });
      return;
    } else if (isExec) {
      this.setState({
        showEditPLParamsModal: false,
        result: {
          type: '',
          data: null,
        },
        statusBar: {
          ...this.state.statusBar,
          type: 'RUN',
          status: 'RUNNING',
          startTime: Date.now(),
          endTime: 0,
        },
      });
      sqlStore.runningPageKey.add(pageKey);
      const resExec = await sqlStore.execPL(
        // oracle plSchema.params为空，需要取原值
        {
          ...plFormatSchema,
          params: isOracle ? plFormatSchema?.params : plParams,
        },
        anonymousBlockDdl,
        true,
        this.getSession()?.sessionId,
        this.getSession()?.database?.dbName,
      );
      if (resExec.status === 'FAIL') {
        this.setState({
          toolBarLoading: false,
          statusBar: {
            ...this.state.statusBar,
            status: 'FAIL',
            endTime: Date.now(),
          },
          result: {
            type: plAction,
            data: {
              EXEC: {
                status: 'FAIL',
                errorMessage: resExec.errorMessage,
              },
              DBMS: resExec.dbms,
            },
          },
        });
        sqlStore.runningPageKey.delete(pageKey);
        return;
      }
      result.data = {
        EXEC: resExec,
        DBMS: resExec.dbms,
      };
    } else if (isDebug) {
      const debug = await debugStore.newDebug(
        {
          packageName: plFormatSchema.packageName,
          plType: plFormatSchema.plType,
          content: plFormatSchema.ddl,
          function: plFormatSchema?.function,
          procedure: plFormatSchema?.procedure,
          session: this.getSession(),
          anonymousBlock:
            plFormatSchema.plType === PLType.ANONYMOUSBLOCK
              ? plFormatSchema.ddl
              : anonymousBlockDdl,
          onContextChange: this.onDebugContextChange,
        },
        pageKey,
      );
      if (debug) {
        const activePl = debug.getActivePl();
        this.setState({
          toolBarLoading: false,
          showEditPLParamsModal: false,
          debug: true,
          result: {
            type: '',
            data: null,
          },
          currentDebugObj: {
            packageName: activePl.packageName,
            plType: activePl.plType,
            plName: activePl.plName,
          },
        });
        // await this.initPLDebugContext(plSchema);
        setTimeout(() => {
          this.debugMode?.set(true);
          this.editor.setValue(activePl.content);
          this.editor?.focus();
        }, 300);
      } else {
        result.type = '';
      }
    }
    sqlStore.runningPageKey.delete(pageKey);
    this.setState({
      toolBarLoading: false,
      showEditPLParamsModal: false,
      statusBar: !isDebug
        ? {
            ...this.state.statusBar,
            status: 'SUCCESS',
            endTime: isExec ? Date.now() : 0,
          }
        : undefined,
      result,
    });
  };

  // 断点管理 - 交互绑定
  public initBreakpointEventBind(editor: IEditor) {
    this.editor = editor;
    const codeEditor = this.editor;
    codeEditor.onMouseDown(async (e) => {
      // 非调试状态 或者 lineNumber 左侧空白
      if (!this.state.debug || e.target.type !== 3 || this.getDebug().isDebugEnd()) {
        return;
      }
      const { lineNumber } = e.target.position;
      const hasBreakPoint = editorUtils.hasBreakPoint(this.editor, lineNumber);
      if (hasBreakPoint) {
        const { currentDebugObj } = this.state;
        await this.removeBreakPoints([
          {
            line: lineNumber,
            plName: currentDebugObj.plName,
            plType: currentDebugObj.plType,
            packageName: currentDebugObj.packageName,
          },
        ]);
      } else {
        await this.addBreakpoint(lineNumber);
      }
    });
    codeEditor.onMouseMove((e) => {
      if (!e.target.element || !this.state.debug || this.getDebug().isDebugEnd()) {
        return;
      }
      const { lineNumber } = e.target.position;
      const isLineNumberArea = e.target.type === 3;
      isLineNumberArea
        ? editorUtils.addFakeBreakPoint(editor, lineNumber)
        : editorUtils.removeFakeBreakPoint(editor);
    });
    codeEditor.onMouseLeave((e) => {
      if (!this.state.debug || this.getDebug().isDebugEnd()) {
        return;
      }
      editorUtils.removeFakeBreakPoint(editor);
    });
  }
  public getDebug() {
    const { debugStore, pageKey } = this.props;
    return debugStore.getDebug(pageKey);
  }
  public addBreakpoint = async (lineNum: number) => {
    const { currentDebugObj } = this.state;
    const debug = this.getDebug();
    if (debug) {
      const isSuccess = await debug.addBreakpoint(
        currentDebugObj.packageName,
        currentDebugObj.plName,
        currentDebugObj.plType,
        lineNum,
      );
      if (isSuccess) {
        this.syncEditorStatus();
      }
    }
  };

  // 断点管理 - 删除断点
  public removeBreakPoints = async (
    points: {
      line: number;
      plName: string;
      plType: PLType;
      packageName: string;
    }[],
  ) => {
    const debug = this.getDebug();
    const isSuccess = await debug.removeBreakpoints(points);
    if (isSuccess) {
      this.syncEditorStatus();
    }
    return isSuccess;
  };
  public clearBreakPoints() {
    editorUtils.clearBreakPoints(this.editor);
  }
  public syncEditorStatus = () => {
    const debug = this.getDebug();
    if (!debug) {
      return;
    }
    const { currentDebugObj } = this.state;
    const { plType, plName, packageName } = currentDebugObj;
    const pl = debug.getPlInfo(packageName, plName, plType);
    const codeEditor = this.editor;
    const value = codeEditor.getValue();
    if (value !== pl.content) {
      codeEditor.setValue(pl.content);
    }
    editorUtils.clearBreakPoints(this.editor);
    editorUtils.addBreakPoints(
      this.editor,
      pl.breakpoints.map((b) => b.line),
    );
    if (!pl.isActive) {
      editorUtils.clearHighLightLine(this.editor);
      codeEditor.revealLine(0);
    } else {
      editorUtils.addHighLightLine(this.editor, pl.activeLine);
    }
  };

  // 栈管理 - 更新当前栈到编辑器
  private updateEditorOfStack = (currectStack: {
    plName: string;
    packageName?: string;
    plType: PLType;
  }) => {
    const { currentDebugObj } = this.state;
    const { plType, plName, packageName } = currectStack;
    if (
      currentDebugObj.packageName === packageName &&
      currentDebugObj.plName === plName &&
      currentDebugObj.plType === plType
    ) {
      return;
    }
    this.setState(
      {
        currentDebugObj: {
          packageName,
          plType,
          plName,
        },
      },
      this.syncEditorStatus,
    );
  };
  public handleSQLChanged = (sql: string) => {
    const { pageKey, onUnsavedChange, page, params } = this.props;
    if (this.state.debug || sql === params?.scriptText) {
      return;
    }
    debounceUpdatePageScriptText(pageKey, sql);
    if (page.isSaved) {
      onUnsavedChange(pageKey);
    }
  };
  public handleExecuteSQL = async () => {
    await this.checkAndFillPLINParams('EXEC');
  };
  public handleSave = async () => {
    const plSchema = this.getFormatPLSchema();
    // 非匿名 PL 对象的保存，调用运行 PL
    if (plSchema.plName) {
      await this.savePL();
      return;
    }
    await this.saveScript();
  };

  /**
   * 是否为程序包子程序
   */
  private isPackageProgram() {
    return this.props.params?.plPageType === PLPageType.plEdit && this.props.params.fromPackage;
  }

  /**
   * 提交PL DDL更改
   */
  private async savePL(opts?: any) {
    const { pageStore, params, onChangeSaved, pageKey, page } = this.props;
    const plSchema = this.getFormatPLSchema();
    const { plName, plType, packageName } = plSchema;
    const newPLEntryName = getPLEntryName(params.scriptText);
    if (!this.isPackageProgram()) {
      /** 暂时还检测不了程序包内的函数等 */
      const plChanged = checkPLNameChanged(
        plName,
        newPLEntryName,
        plType,
        false,
        this.getSession()?.database?.dbName,
      );
      if (plChanged) {
        message.error(
          formatMessage(
            {
              id: 'odc.components.PLPage.TheObjectNameCannotBe',
            },
            {
              plChanged0: plChanged[0],
              plChanged1: plChanged[1],
            },
          ),
        );
        return;
      }
    }
    const data = await executeSQL(
      {
        sql: params.scriptText,
        split: false,
      },
      this.getSession()?.sessionId,
      this.getSession()?.database.dbName,
    );
    if (data.invalid) {
      pageStore.cancelSaving(pageKey);
      return;
    }
    let isSuccess = data?.executeResult?.[0]?.status === ISqlExecuteResultStatus.SUCCESS;
    if (!isSuccess) {
      notification.error(data?.executeResult?.[0]);
    }
    if (isSuccess) {
      switch (params?.plPageType) {
        case PLPageType.plEdit: {
          let newParams;
          let ddl = params.scriptText;
          if (!this.isPackageProgram()) {
            if (plType === PL_TYPE.FUNCTION) {
              const newFunc = await getFunctionByFuncName(
                plName,
                false,
                this.getSession().sessionId,
                this.getSession().database.dbName,
              );
              newParams = newFunc?.params;
              ddl = newFunc?.ddl;
            }
            if (plType === PL_TYPE.PROCEDURE) {
              const newProcedure = await getProcedureByProName(
                plName,
                false,
                this.getSession().sessionId,
                this.getSession().database.dbName,
              );
              newParams = newProcedure?.params;
              ddl = newProcedure?.ddl;
            }
          }
          await pageStore.updatePage(
            pageKey,
            {
              title: page.title,
              isSaved: true,
              startSaving: false,
            },
            {
              scriptText: ddl,
              plSchema: {
                ...params.plSchema,
                ddl: ddl,
                params: newParams || plSchema.params,
              },
            },
          );
          this.editor?.setValue(ddl);
          break;
        }
      }

      // if (
      //   params?.plSchema?.plType === PL_TYPE.PKG_HEAD ||
      //   params?.plSchema?.plType === PL_TYPE.PKG_BODY ||
      //   params?.fromPackage
      // ) {
      //   await schemaStore?.loadPackage(packageName);
      // }

      // 编译、运行、调试、情况不用弹出保存成功
      if (!opts || opts.hideMessage !== true) {
        message.success(
          formatMessage({
            id: 'odc.components.PLPage.SavedSuccessfully',
          }),
        );
      }
      onChangeSaved(pageKey);
    } else {
      pageStore.cancelSaving(pageKey);
    }
  }
  public getSession() {
    return this.props.sessionManagerStore.sessionMap?.get(this.props.sessionId);
  }
  public async saveScript() {
    const { userStore, pageStore, params, onChangeSaved, pageKey } = this.props;
    this.setState({
      isSavingScript: true,
    });
    try {
      if (params?.plPageType === PLPageType.anonymous && params.scriptId) {
        // 仅更新 SQL 内容
        const file = await updateScript(params.scriptId, params.scriptText, params.objectName);
        if (file) {
          message.success(
            formatMessage({
              id: 'workspace.window.sql.modal.savePL.success',
            }),
          );
          await userStore.scriptStore.getScriptList();
          // 更新保存状态
          updatePage(pageKey, file, false);
          onChangeSaved(pageKey);
        }
      } else {
        // 新窗口，弹出创建脚本弹窗
        this.setState({
          showSaveSQLModal: true,
          scriptType: 'PL',
        });
      }
    } finally {
      this.setState({
        isSavingScript: false,
      });
    }
  }

  // 保存 SQL
  public handleSaveNewScript = async (script: ISQLScript) => {
    const {
      userStore,
      pageStore,
      pageKey,
      onSetUnsavedModalContent,
      onChangeSaved,
      params,
    } = this.props;
    const files = await newScript(
      [new File([params.scriptText], script.objectName)],
      'UploadScript',
    );
    const file = files?.[0];
    if (file) {
      await userStore.scriptStore.getScriptList();
      // 更新页面标题 & url
      const plPage = new AnonymousPage(
        params?.cid,
        (params as AnonymousPage['pageParams'])?.databaseFrom,
        params?.scriptText,
      );
      pageStore.updatePage(
        pageKey,
        {
          title: file.objectName,
          updateKey: plPage?.pageKey,
          startSaving: false,
          isSaved: true,
        },
        {
          ...file,
          scriptId: file.id,
          scriptText: params.scriptText,
        },
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
          id: 'workspace.window.sql.modal.savePL.success',
        }),
      );
      this.setState({
        showSaveSQLModal: false,
      });
    }
  };
  public clearHighLightLine() {
    editorUtils.clearHighLightLine(this.editor);
  }
  private getActionGroupKey() {
    const { debug } = this.state;
    const plSchema = this.getFormatPLSchema();
    if (debug) {
      return 'PL_DEBUG_ACTION_GROUP';
    }
    if (plSchema.packageName) {
      return 'PL_PACKAGE_ACTION_GROUP';
    }
    if (plSchema.plName) {
      let groupKey = 'PL_DEFAULT_ACTION_GROUP';
      if (plSchema.plType === PL_TYPE.TRIGGER || plSchema.plType === PL_TYPE.TYPE) {
        groupKey = 'PL_TRIGGER_TYPE_ACTION_GROUP';
      }
      return groupKey;
    }
    return 'PL_ANONEYMOUS_DEFAULT_ACTION_GROUP';
  }
  public gotoBreakPoint = (
    lineNum: number,
    plName: string,
    plType: PLType,
    packageName: string,
  ) => {
    const { currentDebugObj } = this.state;
    if (
      plName === currentDebugObj.plName &&
      plType === currentDebugObj.plType &&
      packageName === currentDebugObj.packageName
    ) {
      editorUtils.shineHighLightLine(this.editor, lineNum);
    } else {
      this.updateEditorOfStack({
        plName,
        plType,
        packageName,
      });
      editorUtils.shineHighLightLine(this.editor, lineNum);
    }
  };
  public handleChangeSplitPane = debounce((size: number) => {
    this.setState({
      resultHeight: size,
    });
    // 手动触发 resize 事件

    window.dispatchEvent(new Event('resize'));
  }, 500);

  /**
   * 这个函数的目的是为了显性的访问一次mobx的store，从而可以让mobx知道plpage依赖这些store
   */
  private setMobxListener() {
    return this.props.sqlStore.runningPageKey;
  }
  private isEditorReadonly = () => {
    const { debug } = this.state;
    const isReadonly =
      PLPageType.plEdit === this.props.params.plPageType && this.props.params?.readonly;
    return isReadonly || debug;
  };
  private getStatusBarDebugStatus() {
    const debug = this.getDebug();
    switch (debug?.status) {
      case DebugStatus.SUCCESS: {
        return 'SUCCESS';
      }
      case DebugStatus.FAIL: {
        return 'FAIL';
      }
      case DebugStatus.STOP: {
        return 'WARNING';
      }
      default: {
        return 'RUNNING';
      }
    }
  }
  private getDebugStatusBar(): IStatusBar {
    const debug = this.getDebug();
    return {
      type: 'DEBUG',
      status: this.getStatusBarDebugStatus(),
      startTime: debug?.history.getStartTime(),
      endTime: debug?.isDebugEnd() ? debug?.history.getEndTime() : 0,
    };
  }
  public render() {
    const { pageKey, pageStore, params } = this.props;
    const debug = this.getDebug();
    const {
      showSaveSQLModal,
      showEditPLParamsModal,
      statusBar,
      debug: isDebugMode,
      toolBarLoading,
      initialSQL,
      result,
      resultHeight,
      isReady,
      defaultAnonymousBlockDdl,
      plAction,
    } = this.state;
    const {} = this.state;
    this.setMobxListener();
    const formatPLSchema = this.getFormatPLSchema();
    return (
      <ScriptPage
        session={this.getSession()}
        ctx={this}
        language={getDataSourceModeConfig(this.getSession()?.connection?.type)?.sql?.language}
        toolbar={{
          loading: toolBarLoading || !isReady,
          actionGroupKey: this.getActionGroupKey(),
        }}
        stackbar={{
          list: isDebugMode ? debug.plInfo : null,
          onClick: this.updateEditorOfStack,
        }}
        handleChangeSplitPane={this.handleChangeSplitPane}
        editor={{
          readOnly: this.isEditorReadonly(),
          defaultValue: initialSQL,
          enableSnippet: true,
          onValueChange: this.handleSQLChanged,
          onEditorCreated: this.handleEditorCreated,
        }}
        sessionSelectReadonly={!!formatPLSchema?.plName || !!formatPLSchema?.packageName || !!debug}
        dialectTypes={[ConnectionMode.OB_ORACLE, ConnectionMode.ORACLE]}
        statusBar={isDebugMode ? this.getDebugStatusBar() : statusBar}
        Result={
          <PLDebugResultSet
            session={this.getSession()}
            key={result.type}
            debug={debug}
            removeBreakPoints={this.removeBreakPoints}
            gotoBreakPoint={this.gotoBreakPoint}
            plSchema={formatPLSchema}
            type={result.type}
            data={result.data}
            resultHeight={resultHeight}
          />
        }
        Others={[
          <SaveSQLModal
            key="plpageSaveSQLModal"
            visible={showSaveSQLModal}
            onCancel={() => {
              pageStore.cancelSaving(pageKey);
              this.setState({
                showSaveSQLModal: false,
              });
            }}
            onSave={this.handleSaveNewScript}
          />,
          <EditPLParamsModal
            key="plpageEditPLParamsModal"
            plAction={plAction}
            visible={showEditPLParamsModal}
            defaultAnonymousBlockDdl={defaultAnonymousBlockDdl}
            onCancel={() =>
              this.setState({
                showEditPLParamsModal: false,
                defaultAnonymousBlockDdl: '',
              })
            }
            onSave={this.handleUpdatedPLParams}
            plSchema={formatPLSchema}
            connectionMode={this.getSession()?.connection?.dialectType}
          />,
        ]}
      />
    );
  }
}
export default function (props: IProps) {
  return (
    <SessionContextWrap
      defaultDatabaseId={props.params?.cid}
      defaultMode={
        props?.params?.plPageType === PLPageType?.anonymous ? props.params?.databaseFrom : undefined
      }
    >
      {({ session }) => {
        return <PLPage sessionId={session?.sessionId} {...props} />;
      }}
    </SessionContextWrap>
  );
}
