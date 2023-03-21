import EditorToolBar from '@/component/EditorToolBar';
import PL_ACTIONS from '@/component/EditorToolBar/actions/pl';
import EditPLParamsModal from '@/component/EditPLParamsModal';
import SaveSQLModal from '@/component/SaveSQLModal';
import ScriptPage from '@/component/ScriptPage';
import { ConnectionStore } from '@/store/connection';
import { openNewDefaultPLPage } from '@/store/helper/page';
import { UserStore } from '@/store/login';
import { PageStore } from '@/store/page';
import { SchemaStore } from '@/store/schema';
import { SQLStore } from '@/store/sql';
import editorUtils from '@/util/editor';
import { formatMessage } from '@/util/intl';
import { getPLDebugExecuteSql } from '@/util/sql';
import type { IEditor, monaco } from '@alipay/ob-editor';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Checkbox, message, Modal, Typography } from 'antd';
import EventBus from 'eventbusjs';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import PLDebugResultSet from '../PLDebugResultSet';

import { ConnectionMode, IPage, ISqlExecuteResultStatus, ISQLScript } from '@/d.ts';

import { newScript, updateScript } from '@/common/network';
import { executeSQL } from '@/common/network/sql';
import PL_TYPE, { PLType } from '@/constant/plType';
import { DebugStore } from '@/store/debug';
import { DebugStatus, IDebugStackItem } from '@/store/debug/type';
import { debounceUpdatePageScriptText, updatePage } from '@/store/helper/page';
import notification from '@/util/notification';
import { getPLEntryName } from '@/util/parser';
import { checkPLNameChanged } from '@/util/pl';
import { debounce } from 'lodash';

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

interface ISQLPageState {
  plAction?: 'DEBUG' | 'EXEC' | '' | 'COMPILE';
  scriptType?: 'SQL' | 'PL';
  resultHeight: number;
  initialSQL: string;
  showSaveSQLModal: boolean;
  executeSQLLoading: boolean;
  showEditPLParamsModal: boolean;
  showGrammerHelpSider: boolean;
  plSchema: any;
  debug: boolean;
  toolBarLoading: boolean;
  statusBar: IStatusBar;
  isSavingScript: boolean;
  result: {
    type: 'COMPILE' | 'EXEC' | 'DEBUG' | '';
    data: {
      terminated?: boolean;
      // 编译结果
      COMPILE?: any;
      // 运行结果
      EXEC?: any;
      // 参数
      PARAMS?: any;
      //  DBMS
      DBMS?: any;
      VARIABLE?: any;
      BREAK_POINT?: any;
      TRACK?: any;
      DEBUG_LOG?: any;
    };
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

@inject('sqlStore', 'userStore', 'pageStore', 'connectionStore', 'schemaStore', 'debugStore')
@observer
class PLPage extends Component<
  {
    params: any;
    sqlStore: SQLStore;
    userStore: UserStore;
    pageStore: PageStore;
    connectionStore: ConnectionStore;
    schemaStore: SchemaStore;
    debugStore?: DebugStore;
    pageKey: string;
    page: IPage;
    startSaving: boolean;
    onUnsavedChange: (pageKey: string) => void;
    onChangeSaved: (pageKey: string) => void;
    onSetUnsavedModalTitle: (title: string) => void;
    onSetUnsavedModalContent: (title: string) => void;
  },
  ISQLPageState
> {
  public readonly state: ISQLPageState = {
    resultHeight: RESULT_HEIGHT,
    initialSQL: (this.props.params && this.props.params.scriptText) || '',
    showSaveSQLModal: false,
    executeSQLLoading: false,
    showEditPLParamsModal: false,
    showGrammerHelpSider: false,
    isSavingScript: false,
    plSchema: null,
    debug: false,
    statusBar: {
      status: '',
      startTime: null,
      endTime: null,
    },

    toolBarLoading: false,
    plAction: '',
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

  private debugLines: number[] = [];

  debugMode: monaco.editor.IContextKey<boolean>;

  public async componentDidMount() {
    const { params, pageKey, onSetUnsavedModalTitle, onSetUnsavedModalContent } = this.props;
    onSetUnsavedModalTitle(formatMessage({ id: 'workspace.window.sql.modal.close.title' }));
    onSetUnsavedModalContent(
      formatMessage(
        { id: 'workspace.window.sql.modal.close.content' },
        {
          name: params.scriptName || 'PL 窗口_' + pageKey.replace('pl-new-', ''),
        },
      ),
    );

    EventBus.addEventListener('pageAction', this.listenAction);
  }

  public async UNSAFE_componentWillReceiveProps(nextProps) {
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
  public listenAction = (e, { key, params }) => {
    const { params: ps } = this.props;
    if (ps?.fromPackage && ps.plSchema?.key === key) {
      this.autoRunPLAction(params);
    } else if (ps.scriptId == key) {
      this.autoRunPLAction(params);
    }
  };

  public componentWillUnmount() {
    const { pageKey, sqlStore, debugStore } = this.props;
    const { plSchema, debug } = this.state;
    if (debug) {
      debugStore.removeDebug(pageKey);
    }
    if (this.timerAutoRunPLAction) {
      clearTimeout(this.timerAutoRunPLAction);
    }
    sqlStore.clear(pageKey);
    if (plSchema && plSchema.plName) {
      sqlStore.removeRunningPL(plSchema.plName);
    }
    EventBus.removeEventListener('pageAction', this.listenAction);
  }

  // 操作集 - 自动运行操作
  public async autoRunPLAction(params: any) {
    const { action } = params;
    if (!action) {
      return;
    }
    clearTimeout(this.timerAutoRunPLAction);
    this.timerAutoRunPLAction = setTimeout(async () => {
      if (action === 'COMPILE' || action === 'EXEC' || action === 'DEBUG') {
        if (this.state.debug || this.props.sqlStore.runningPageKey.has(this.props.pageKey)) {
          /**
           * 当前正在调试或者运行编译的时候，不能继续触发
           */
          return;
        }
        await EditorToolBar.triggler(this, `PL_${action}`);
      }
    }, 500);
  }

  public handleEditorCreated = (editor: IEditor) => {
    const self = this;
    this.editor = editor;
    // 快捷键绑定
    this.editor.addCommand('f8', this.handleExecuteSQL);
    const codeEditor = editor.UNSAFE_getCodeEditor();
    this.debugMode = codeEditor.createContextKey('debugMode', false);
    import('@alipay/ob-editor').then((module) => {
      const monaco = module.monaco;
      codeEditor.addCommand(
        monaco.KeyCode.KEY_I | monaco.KeyMod.CtrlCmd,
        async function () {
          // @ts-ignore
          await PL_ACTIONS.PL_DEBUG_STEP_IN.action(self);
        },
        'debugMode',
      );

      codeEditor.addCommand(
        monaco.KeyCode.KEY_O | monaco.KeyMod.CtrlCmd,
        async function () {
          // @ts-ignore
          await PL_ACTIONS.PL_DEBUG_STEP_OUT.action(self);
        },
        'debugMode',
      );

      codeEditor.addCommand(
        monaco.KeyCode.KEY_P | monaco.KeyMod.CtrlCmd,
        async function () {
          // @ts-ignore
          await PL_ACTIONS.PL_DEBUG_STEP_SKIP.action(self);
        },
        'debugMode',
      );
    });
    // 调试断点事件绑定
    this.initBreakpointEventBind(editor);
  };

  public getFormatPLSchema() {
    const { pageKey, pageStore } = this.props;
    const page = pageStore.pages.find((p) => p.key === pageKey);
    const plSchema = page?.params?.plSchema || {};
    const { scriptText } = this.props.params;
    const r = page?.params?.plSchema ? { ...page.params.plSchema } : {};
    // 程序包内部 PL 加程序包名前缀
    if (r.packageName) {
      if (r.funName) {
        r.funName = `${r.funName}`;
      }
      if (r.proName) {
        r.proName = `${r.proName}`;
      }
    }
    if (r.proName) {
      r.plName = r.proName || plSchema.proName;
      r.plType = PL_TYPE.PROCEDURE;
    }
    if (r.funName) {
      r.plName = r.funName || plSchema.funName;
      r.plType = PL_TYPE.FUNCTION;
    }
    if (r.triggerName) {
      r.plName = plSchema.triggerName;
      r.plType = PL_TYPE.TRIGGER;
    }
    if (r.typeName) {
      r.plName = plSchema.typeName;
      r.plType = PL_TYPE.TYPE;
    }
    if (!r.proName && !r.funName && !r.triggerName && !r.typeName) {
      r.ddl = scriptText;
      if (!r.packageName) {
        r.plType = PLType.ANONYMOUSBLOCK;
      }
    }

    return r;
  }

  private isInMode(paramMode: string) {
    return /IN/.test(paramMode.toUpperCase());
  }

  // 调试 - 是否 PL 调试需要输入入参
  private isPLNeedFillParams(plSchema: any) {
    const { params = [] } = plSchema;
    if (!params.length) {
      return false;
    }
    return params.find((param) => param.paramMode && this.isInMode(param.paramMode));
  }

  // 是否包含复杂类型
  private hasExtendedTypeParams(params: any[] = []) {
    if (!params.length) {
      return false;
    }
    return params.some((param) => param.extendedType);
  }

  // 检查 PL 入参，如果需要填充，弹出弹层填充
  public fillPLINParams = async (plAction: any) => {
    const plSchema = this.getFormatPLSchema();
    const isNeedFillParams = this.isPLNeedFillParams(plSchema);
    const hasExtendedTypeParam =
      this.hasExtendedTypeParams(plSchema?.params) || plSchema?.returnExtendedType;
    const stateObj = { plAction, plSchema };
    if (hasExtendedTypeParam) {
      message.warning({
        content: formatMessage({ id: 'odc.components.PLPage.ParametersIncludeComplexTypesOr' }), //参数包含复杂类型或用户自定义类型，请通过调试窗口自定义参数进行执行或调试
        style: { paddingTop: 0 },
      });
      const templateSql = getPLDebugExecuteSql(plSchema);
      openNewDefaultPLPage({
        sql: templateSql,
        params: {
          isDebug: true,
        },
      });
      return;
    }
    if (isNeedFillParams) {
      this.setState({
        ...stateObj,
        showEditPLParamsModal: true,
      });
    } else {
      this.setState(stateObj, async () => {
        await this.handleUpdatedPLParams(plSchema);
      });
    }
  };

  public isShowDebugTip(plAction: any) {
    const {
      connectionStore: { obVersion },
    } = this.props;
    const tipVisible = localStorage.getItem(PL_DEBUG_TIP_VSIBLE_KEY);
    if (!obVersion || plAction !== 'DEBUG') {
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
    return isLessThan324(obVersion) && tipVisible !== 'no';
  }

  public checkAndFillPLINParams = async (plAction: any) => {
    if (this.isShowDebugTip(plAction)) {
      Modal.confirm({
        title: formatMessage({ id: 'odc.components.PLPage.TheCurrentDatabaseVersionIs' }), //当前数据库版本较低，是否继续调试？
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
              {formatMessage({ id: 'odc.components.PLPage.NoMorePrompt' }) /*不再提示*/}
            </Checkbox>
          </>
        ),

        okText: formatMessage({ id: 'odc.components.PLPage.Continue' }), //继续
        cancelText: formatMessage({ id: 'odc.components.PLPage.Cancel' }), //取消
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
  public handleUpdatedPLParams = async (plSchema: any) => {
    const { sqlStore, debugStore, pageKey } = this.props;
    const { plAction } = this.state;
    const isExec = plAction === 'EXEC';
    const isDebug = plAction === 'DEBUG';
    const result = {
      type: plAction,
      data: {},
    };

    if (this.state.debug) {
      /**
       * 已经处于debug状态，说明是重新调试，只需要设置一下参数就行了
       */
      this.getDebug()?.recoverDebug(plSchema.params);
      this.setState({
        showEditPLParamsModal: false,
      });
      return;
    }
    if (isExec) {
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
      const resExec = await sqlStore.execPL(plSchema, true);
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
    }

    if (isDebug) {
      const debug = await debugStore.newDebug(
        {
          packageName: plSchema.packageName,
          plType: plSchema.plType,
          content: plSchema.ddl,
          function: plSchema,
          procedure: plSchema,
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
      plSchema,
      result,
    });
  };

  // 断点管理 - 交互绑定
  public initBreakpointEventBind(editor: IEditor) {
    this.editor = editor;
    const codeEditor = this.editor.UNSAFE_getCodeEditor();
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
        if (this.debugLines.includes(lineNumber)) {
          return;
        }
        this.debugLines.push(lineNumber);
        await this.addBreakpoint(lineNumber);
      }
    });
    codeEditor.onMouseMove((e) => {
      if (!e.target.detail || !this.state.debug || this.getDebug().isDebugEnd()) {
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
        this.debugLines = this.debugLines?.filter((item) => item !== lineNum);
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
    const codeEditor = this.editor.UNSAFE_getCodeEditor();
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
    const { pageKey, onUnsavedChange, page } = this.props;
    if (this.state.debug) {
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

  private async savePL(opts?: any) {
    const { sqlStore, pageStore, schemaStore, params, onChangeSaved, pageKey, page } = this.props;
    const plSchema = this.getFormatPLSchema();
    const { plName, plType, packageName } = plSchema;
    const newPLEntryName = getPLEntryName(params.scriptText);
    if (!params.fromPackage) {
      /** 暂时还检测不了程序包内的函数等 */
      const plChanged = checkPLNameChanged(plName, newPLEntryName, plType, params.fromPackage);

      if (plChanged) {
        message.error(
          formatMessage(
            {
              id: 'odc.components.PLPage.TheObjectNameCannotBe',
            },
            { plChanged0: plChanged[0], plChanged1: plChanged[1] },
          ),
        );

        return;
      }
    }
    const data = await executeSQL({ sql: params.scriptText, split: false });
    let isSuccess = data?.[0]?.status === ISqlExecuteResultStatus.SUCCESS;
    if (!isSuccess) {
      notification.error(data?.[0]);
    }

    if (isSuccess) {
      let newParams;
      if (!params.fromPackage) {
        if (plType === PL_TYPE.FUNCTION) {
          const newFunc = await schemaStore?.loadFunction(plName);
          newParams = newFunc?.params;
        }
        if (plType === PL_TYPE.PROCEDURE) {
          const newProcedure = await schemaStore?.loadProcedure(plName);
          newParams = newProcedure?.params;
        }
      }

      pageStore.updatePage(
        pageKey,
        { title: page.title, isSaved: true, startSaving: false },
        {
          scriptText: params.scriptText,
          plSchema: {
            ...params.plSchema,
            ddl: params.scriptText,
            params: newParams || plSchema.params,
          },
        },
      );

      if (
        params?.plSchema?.plType === PL_TYPE.PKG_HEAD ||
        params?.plSchema?.plType === PL_TYPE.PKG_BODY ||
        params?.fromPackage
      ) {
        await schemaStore?.loadPackage(packageName);
      }

      // 编译、运行、调试、情况不用弹出保存成功
      if (!opts || opts.hideMessage !== true) {
        message.success(formatMessage({ id: 'odc.components.PLPage.SavedSuccessfully' }));
      }
      onChangeSaved(pageKey);
    } else {
      pageStore.cancelSaving(pageKey);
    }
  }

  public async saveScript() {
    const { userStore, pageStore, params, onChangeSaved, pageKey } = this.props;
    this.setState({
      isSavingScript: true,
    });
    try {
      if (params.scriptId) {
        // 仅更新 SQL 内容
        const file = await updateScript(params.scriptId, params.scriptText, params.objectName);
        if (file) {
          message.success(formatMessage({ id: 'workspace.window.sql.modal.savePL.success' }));
          await userStore.scriptStore.getScriptList();
          // 更新保存状态
          updatePage(pageKey, file, false);
          onChangeSaved(pageKey);
        }
      } else {
        // 新窗口，弹出创建脚本弹窗
        this.setState({ showSaveSQLModal: true, scriptType: 'PL' });
      }
    } finally {
      this.setState({
        isSavingScript: false,
      });
    }
  }

  // 保存 SQL
  public handleSaveNewScript = async (script: ISQLScript) => {
    const { userStore, pageStore, pageKey, onSetUnsavedModalContent, onChangeSaved, params } =
      this.props;
    const files = await newScript(
      [new File([params.scriptText], script.objectName)],
      'UploadScript',
    );
    const file = files?.[0];
    if (file) {
      await userStore.scriptStore.getScriptList();
      // 更新页面标题 & url
      pageStore.updatePage(
        pageKey,
        {
          title: file.objectName,
          updateKey: true,
          updatePath: true,
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
          { id: 'workspace.window.sql.modal.close.content' },
          { name: script.objectName },
        ),
      );

      onChangeSaved(pageKey);
      message.success(formatMessage({ id: 'workspace.window.sql.modal.savePL.success' }));
      this.setState({ showSaveSQLModal: false });
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
    console.log(this.props.sqlStore.runningPageKey);
  }

  private isEditorReadonly = () => {
    const { connectionStore } = this.props;
    const { debug } = this.state;
    const plSchema = this.getFormatPLSchema();
    return (
      (plSchema.plName && connectionStore.connection.dbMode === ConnectionMode.OB_MYSQL) || debug
    );
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
    const { pageKey, pageStore, params, connectionStore } = this.props;
    const debug = this.getDebug();
    const isMySQL = connectionStore.connection.dbMode === ConnectionMode.OB_MYSQL;
    const { scriptType } = params;
    const {
      showSaveSQLModal,
      showEditPLParamsModal,
      plSchema,
      statusBar,
      debug: isDebugMode,
      toolBarLoading,
      initialSQL,
      result,
      resultHeight,
    } = this.state;
    const {} = this.state;
    this.setMobxListener();
    return (
      <ScriptPage
        ctx={this}
        language={`sql-oceanbase-${isMySQL ? 'mysql' : 'oracle'}${scriptType == 'PL' ? '-pl' : ''}`}
        toolbar={{
          loading: toolBarLoading,
          actionGroupKey: this.getActionGroupKey(),
        }}
        stackbar={{
          list: isDebugMode ? debug.plInfo : null,
          onClick: this.updateEditorOfStack,
        }}
        handleChangeSplitPane={this.handleChangeSplitPane}
        editor={{
          readOnly: this.isEditorReadonly(),
          initialValue: initialSQL,
          enableSnippet: true,
          onValueChange: this.handleSQLChanged,
          onEditorCreated: this.handleEditorCreated,
        }}
        statusBar={isDebugMode ? this.getDebugStatusBar() : statusBar}
        Result={
          <PLDebugResultSet
            key={result.type}
            debug={debug}
            removeBreakPoints={this.removeBreakPoints}
            gotoBreakPoint={this.gotoBreakPoint}
            plSchema={plSchema}
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
              this.setState({ showSaveSQLModal: false });
            }}
            onSave={this.handleSaveNewScript}
          />,
          <EditPLParamsModal
            key="plpageEditPLParamsModal"
            visible={showEditPLParamsModal}
            onCancel={() => this.setState({ showEditPLParamsModal: false })}
            onSave={this.handleUpdatedPLParams}
            plSchema={plSchema}
          />,
        ]}
      />
    );
  }
}

export default PLPage;
