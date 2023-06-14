import {
  getFunctionByFuncName,
  getFunctionCreateSQL,
  getProcedureByProName,
  getScript,
  getTypemByName,
} from '@/common/network';
import {
  DbObjectType,
  IFunction,
  IScript,
  ITrigger,
  ITriggerFormData,
  PageType,
  SynonymPropsTab,
  SynonymType,
  TaskPageScope,
  TaskPageType,
  TriggerPropsTab,
  TriggerState,
  TypePropsTab,
} from '@/d.ts';

import {
  PropsTab as FunctionPropsTab,
  TopTab as FunctionTopTab,
} from '@/page/Workspace/components/FunctionPage';
import { PropsTab, TopTab } from '@/page/Workspace/components/PackagePage';
import {
  PropsTab as ProcedurePropsTab,
  TopTab as ProcedureTopTab,
} from '@/page/Workspace/components/ProcedurePage';
import { PropsTab as SequencePropsTab } from '@/page/Workspace/components/SequencePage';
import {
  PropsTab as TablePropsTab,
  TopTab as TableTopTab,
} from '@/page/Workspace/components/TablePage';
import {
  PropsTab as ViewPropsTab,
  TopTab as ViewTopTab,
} from '@/page/Workspace/components/ViewPage';
import { formatMessage } from '@/util/intl';
import { getPLScriptTemplate } from '@/util/sql';

import { getTriggerByName } from '@/common/network/trigger';
import SelectDatabase from '@/component/SelectDatabase';
import plType from '@/constant/plType';
import sqlStore from '@/store/sql';
import taskStore from '@/store/task';
import { generateUniqKey } from '@/util/utils';
import { message } from 'antd';
import { generateResultSetColumns } from '..';
import page from '../../page';
import { generatePageKey, generatePageTitle } from '../pageKeyGenerate';
import {
  createPackageBodyPageParams,
  createPackageHeadPageParams,
  IPLPageParams,
} from './pageParams';
import { findPageByScriptIdAndType } from './util';

export function openPackageHeadPage(packageName: string, sql: string, cid: number, dbName: string) {
  const pageTitle = `${packageName}_head`;
  page.openPage(
    PageType.PL,
    {
      title: pageTitle,
    },

    Object.assign(createPackageHeadPageParams(packageName, sql, pageTitle), { cid, dbName }),
  );
}
export async function openPackageBodyPage(
  packageName: string,
  sql: string,
  cid: number,
  dbName: string,
) {
  const pageTitle = `${packageName}_body`;
  await page.openPage(
    PageType.PL,
    {
      title: pageTitle,
    },

    Object.assign(createPackageBodyPageParams(packageName, sql, pageTitle), { cid, dbName }),
  );

  return pageTitle;
}
export function openPackageViewPage(
  packageName: string,
  topTab: TopTab,
  showCode: boolean,
  dbName: string,
  databaseId: number,
) {
  let propsTab = '';
  topTab = topTab || TopTab.HEAD;
  if (topTab == TopTab.HEAD) {
    if (showCode) {
      propsTab = PropsTab.PACKAGE_HEAD_CODE;
    } else {
      propsTab = PropsTab.PACKAGE_HEAD_INFO;
    }
  } else if (topTab == TopTab.BODY) {
    if (showCode) {
      propsTab = PropsTab.PACKAGE_BODY_CODE;
    } else {
      propsTab = PropsTab.PACKAGE_BODY_INFO;
    }
  }

  page.openPage(
    PageType.PACKAGE,
    {
      title: packageName,
    },

    {
      packageName,
      topTab,
      propsTab,
      dbName,
      databaseId,
    },
  );
}
export async function openNewSQLPage(
  cid: number,
  dbName: string,
  databaseFrom: 'datasource' | 'project',
) {
  const key = await generatePageKey(PageType.SQL);
  const title = generatePageTitle(PageType.SQL, key);
  page.openPage(
    PageType.SQL,
    {
      key,
      title,
    },

    {
      scriptName: title,
      scriptText: '',
      cid,
      dbName,
      databaseFrom,
    },
  );
}
export async function openNewSQLPageWithResult(result, cid: number, dbName: string) {
  const key = await generatePageKey(PageType.SQL);
  const title = generatePageTitle(PageType.SQL, key);
  sqlStore.resultSets.set(key, generateResultSetColumns(result));

  page.openPage(
    PageType.SQL,
    {
      key,
      title,
    },

    {
      scriptName: title,
      scriptText: result
        ?.map((t) => {
          return t.executeSql;
        })
        .join('\n'),
      fromTask: true,
      cid,
      dbName,
    },
  );
}
/** 根据scriptID打开sql或者pl的page */

export async function openSQLPageByScript(scriptId: any, dbid: number, dbName: string) {
  const existPage = findPageByScriptIdAndType(scriptId);

  if (existPage) {
    page.setActivePageKeyAndPushUrl(existPage.key);
    return false;
  }

  const file = await getScript(scriptId);

  if (file) {
    const key = openSQLOrPLPage(file, dbid, dbName);
    return key;
  }

  return false;
}
/** 打开已存在的SQL/匿名块Page */

export async function openSQLOrPLPage(file: IScript, cid: number, dbName: string) {
  const key = await generatePageKey(PageType.SQL, {
    scriptId: file.scriptMeta.id,
  });

  page.openPage(
    PageType.SQL,
    {
      key,
      title: file.scriptMeta.objectName,
    },

    {
      ...file.scriptMeta,
      scriptText: file.content,
      scriptId: file.scriptMeta.id,
      cid,
      dbName,
      databaseFrom: 'datasource',
    },
  );

  return key;
}
export async function openNewDefaultPLPage(
  value?: { sql: string; params: any },
  cid?: number,
  dbName?: string,
  databaseFrom?: 'project' | 'datasource',
) {
  const key = await generatePageKey(PageType.PL, value?.params);
  const title = generatePageTitle(PageType.PL, key);
  page.openPage(
    PageType.PL,
    {
      key,
      title,
    },

    {
      scriptName: title,
      isAnonymous: true,
      scriptText: value?.sql ?? getPLScriptTemplate(),
      cid,
      dbName,
      plSchema: {
        params: [],
      },
      databaseFrom,
    } as IPLPageParams,
  );
}

export function openTasksPage(taskType?: TaskPageType, taskPageScope?: TaskPageScope) {
  taskStore.changeTaskManageVisible(true, taskType, taskPageScope);
  page.openPage(
    PageType.TASKS,
    {
      title: formatMessage({
        id: 'odc.component.TaskPopover.TaskCenter',
      }),
    },
    {},
  );
}

/** 会话管理 */

export async function openSessionManagePage(cid?: number, dbName?: string) {
  if (!dbName || !cid) {
    [cid, dbName] = await SelectDatabase();
  }
  if (!cid || !dbName) {
    return;
  }
  page!.openPage(
    PageType.SESSION_MANAGEMENT,
    {
      title: formatMessage({
        id: 'workspace.header.session.management',
      }),
    },

    {
      cid,
      dbName,
      databaseId: 1,
    },
  );
}
/** 回收站 */

export async function openRecycleBin(cid?: number, dbName?: string) {
  if (!dbName || !cid) {
    [cid, dbName] = await SelectDatabase();
  }
  if (!cid || !dbName) {
    return;
  }
  page.openPage(
    PageType.RECYCLE_BIN,
    {
      title: formatMessage({
        id: 'workspace.header.recycle',
      }),
    },

    {
      cid,
      dbName,
      databaseId: 1,
    },
  );
}
/** 创建表页面 */

export function openCreateTablePage(dbId: number, dbName: string) {
  page!.openPage(
    PageType.CREATE_TABLE,
    {
      title:
        formatMessage({
          id: 'workspace.header.create',
        }) +
        formatMessage({
          id: 'workspace.header.create.table',
        }),
    },

    {
      databaseId: dbId,
      dbName,
    },
  );
}
/** Table详情页面 */

export function openTableViewPage(
  tableName: string,
  topTab: TableTopTab = TableTopTab.PROPS,
  propsTab: TablePropsTab = TablePropsTab.INFO,
  databaseId: number,
) {
  page!.openPage(
    PageType.TABLE,
    {
      title: tableName,
    },

    {
      databaseId,
      databaseFrom: 'datasource',
      tableName,
      topTab,
      propsTab,
    },
  );
}

/**
 * 创建视图页面
 */
export function openCreateViewPage(dbId: number, dbName: string) {
  page!.openPage(
    PageType.CREATE_VIEW,
    {
      title: formatMessage({ id: 'workspace.window.createView.modal.title' }),
    },
    {
      databaseId: dbId,
      dbName,
    },
  );
}

/**
 * 视图详情页面
 */

export function openViewViewPage(
  viewName: string,
  topTab: ViewTopTab = ViewTopTab.PROPS,
  propsTab: ViewPropsTab = ViewPropsTab.INFO,
  dbId: number,
  dbName: string,
) {
  page!.openPage(
    PageType.VIEW,
    {
      title: viewName,
    },

    {
      viewName,
      topTab,
      propsTab,
      databaseId: dbId,
      dbName,
    },
  );
}
/** 创建函数页面 */

export function openCreateFunctionPage(sql: string, databaseId: number, dbName: string) {
  page!.openPage(
    PageType.CREATE_FUNCTION,
    {
      title: formatMessage({
        id: 'workspace.window.createFunction.modal.title',
      }),
    },

    {
      databaseId,
      dbName,
      sql,
      type: PageType.CREATE_FUNCTION,
    },
  );
}
/** 函数详情页面 */

export function openFunctionViewPage(
  functionName: string,
  topTab: FunctionTopTab = FunctionTopTab.PROPS,
  propsTab: FunctionPropsTab = FunctionPropsTab.INFO,
  databaseId: number,
  dbName: string,
) {
  page!.openPage(
    PageType.FUNCTION,
    {
      title: functionName,
    },

    {
      databaseId,
      dbName,
      funName: functionName,
      topTab,
      propsTab,
    },
  );
}
/** 根据函数信息自动填充sql */

export async function openCreateFunctionPageByRemote(
  func: IFunction,
  sessionId: string,
  dbName: string,
  databaseId: number,
) {
  const sql = await getFunctionCreateSQL(func.funName, func, sessionId, dbName);
  if (sql) {
    openCreateFunctionPage(sql, databaseId, dbName);
  }
}
/** 创建存储过程页面 */

export function openCreateProcedurePage(sql: string, databaseId: number, dbName: string) {
  page!.openPage(
    PageType.CREATE_PROCEDURE,
    {
      title: formatMessage({
        id: 'workspace.window.createProcedure.modal.title',
      }),
    },

    {
      databaseId,
      dbName,
      sql,
      type: PageType.CREATE_PROCEDURE,
    },
  );
}
/** 存储过程详情页面 */

export function openProcedureViewPage(
  procedureName: string,
  topTab: ProcedureTopTab = ProcedureTopTab.PROPS,
  propsTab: ProcedurePropsTab = ProcedurePropsTab.INFO,
  databaseId: number,
  dbName: string,
) {
  page!.openPage(
    PageType.PROCEDURE,
    {
      title: procedureName,
    },

    {
      databaseId,
      dbName,
      proName: procedureName,
      topTab,
      propsTab,
    },
  );
}
/** 创建程序包页面 */

export function openCreatePackagePage(sql: string, databaseId: number, dbName: string) {
  page!.openPage(
    PageType.CREATE_PACKAGE,
    {
      title: formatMessage({
        id: 'workspace.window.createPackage.modal.title',
      }),
    },

    {
      sql,
      databaseId,
      dbName,
      type: PageType.CREATE_PACKAGE,
    },
  );
}
/** 创建程序包包体页面 */

export function openCreatePackageBodyPage(sql: string, databaseId: number, dbName: string) {
  page!.openPage(
    PageType.CREATE_PACKAGE,
    {
      title: formatMessage({
        id: 'workspace.window.createPackageBody.modal.title',
      }),
    },

    {
      databaseId,
      dbName,
      sql,
      type: PageType.CREATE_PACKAGE,
      isPackageBody: true,
    },
  );
}
/** 创建序列页面 */

export function openCreateSequencePage(sql: string, databaseId: number, dbName: string) {
  page!.openPage(
    PageType.CREATE_SEQUENCE,
    {
      title: formatMessage({
        id: 'workspace.window.createSequence.modal.title',
      }),
    },

    {
      databaseId,
      dbName,
      sql,
      type: PageType.CREATE_SEQUENCE,
    },
  );
}
/** Sequence 查看序列详情页面 */

export function openSequenceViewPage(
  sequenceName: string,
  propsTab: SequencePropsTab = SequencePropsTab.INFO,
  databaseId: number,
  dbName: string,
) {
  page?.openPage(
    PageType.SEQUENCE,
    {
      title: sequenceName,
    },

    {
      databaseId,
      dbName,
      sequenceName,
      propsTab,
    },
  );
}
/** 编辑存储过程页面 */

export async function openProcedureEditPageByProName(
  proName: string,
  sessionId: string,
  dbName: string,
  cid: number,
) {
  const plSchema = await getProcedureByProName(proName, false, sessionId, dbName);
  await page.openPage(
    PageType.PL,
    {
      title: proName,
    },

    {
      scriptId: proName,
      plName: proName,
      scriptText: plSchema.ddl,
      plSchema,
      plType: plType.PROCEDURE,
      cid,
      dbName,
    },
  );
}
/** 编辑函数页面-local */

export async function openFunctionOrProcedureFromPackage(
  packageName: string,
  subName: string,
  type: any,
  plSchema: any,
  cid: number,
  dbName: string,
) {
  const plName = `${packageName}.${subName}`;
  await page.openPage(
    PageType.PL,
    {
      title: plName,
      key: plSchema.key,
    },

    {
      scriptId: plName,
      plName,
      plSchema,
      fromPackage: true,
      plType: type,
      scriptText: plSchema.ddl,
      cid,
      dbName,
    },
  );

  return plName;
}
/** 编辑函数页面-remote */

export async function openFunctionEditPageByFuncName(
  funcName: string,
  sessionId: string,
  dbName: string,
  cid: number,
) {
  const plSchema = await getFunctionByFuncName(funcName, false, sessionId, dbName);
  await page.openPage(
    PageType.PL,
    {
      title: funcName,
    },

    {
      scriptId: funcName,
      plName: funcName,
      scriptText: plSchema.ddl,
      plSchema,
      plType: plType.FUNCTION,
      cid,
      dbName,
    },
  );
}

export async function openOBClientPage(cid: number, dbName: string) {
  const MAX_CLIENT_PAGE = 3;
  const currentNum =
    Math.max(
      ...page.pages
        .filter((page) => {
          return page.type === PageType.OB_CLIENT;
        })
        .map((p) => {
          return p.params.index as number;
        }),
      -1,
    ) + 1;
  const clientPageCounts = page.pages?.filter((p) => {
    return p.type === PageType.OB_CLIENT;
  })?.length;
  if (clientPageCounts >= MAX_CLIENT_PAGE) {
    message.warn(
      formatMessage(
        {
          id: 'odc.helper.page.openPage.YouCannotOpenMoreThan',
        },

        { MAXCLIENTPAGE: MAX_CLIENT_PAGE },
      ),
      // `不能打开超过 ${MAX_CLIENT_PAGE} 个命令行窗口`
    );
    return;
  }
  page.openPage(
    PageType.OB_CLIENT,
    {
      title:
        formatMessage({ id: 'odc.helper.page.openPage.CommandLineWindow' }) + // 命令行窗口_
        currentNum,
    },

    {
      time: Date.now(),
      index: currentNum,
      cid,
      dbName,
    },
  );
}
/**
 * 创建触发器页面 (表单)
 */
export async function openCreateTriggerPage(
  preData: ITriggerFormData = null,
  databaseId: number,
  dbName: string,
) {
  await page!.openPage(
    PageType.CREATE_TRIGGER,
    {
      title: formatMessage({ id: 'odc.helper.page.openPage.CreateATrigger' }), // 新建触发器
    },
    {
      preData,
      databaseId,
      dbName,
    },
  );
}
/** 创建触发器页面 (SQL确认页面) */

export async function openCreateTriggerSQLPage(
  sql: string,
  preData: ITriggerFormData,
  databaseId: number,
  dbName: string,
) {
  await page!.openPage(
    PageType.CREATE_TRIGGER_SQL,
    {
      title: formatMessage({ id: 'odc.helper.page.openPage.CreateATrigger' }), // 新建触发器
    },
    {
      databaseId,
      dbName,
      sql,
      preData,
      hasPre: true,
      type: PageType.CREATE_TRIGGER_SQL,
    },
  );
}
/** 触发器详情页面 */

export function openTriggerViewPage(
  triggerName: string,
  propsTab: TriggerPropsTab = TriggerPropsTab.DDL,
  triggerState: TriggerState,
  triggerData?: ITrigger,
  databaseId?: number,
  dbName?: string,
) {
  page.openPage(
    PageType.TRIGGER,
    {
      title: triggerName,
    },

    {
      databaseId,
      dbName,
      triggerName,
      triggerData,
      propsTab,
      isDisabled: triggerState === TriggerState.disabled,
    },
  );
}
/** 编辑触发器页面 */

export async function openTriggerEditPageByName(
  triggerName: string,
  sessionId: string,
  dbName: string,
  cid: number,
) {
  const plSchema = await getTriggerByName(triggerName, sessionId, dbName);
  page.openPage(
    PageType.PL,
    {
      title: triggerName,
    },

    {
      scriptId: triggerName,
      scriptText: plSchema.ddl,
      triggerName,
      plSchema,
      plType: plType.TRIGGER,
      cid,
      dbName,
    },
  );
}
/** 创建同义词页面 */

export function openCreateSynonymPage(
  sql: string,
  synonymType?: SynonymType,
  databaseId?: number,
  dbName?: string,
) {
  page!.openPage(
    PageType.CREATE_SYNONYM,
    {
      title: formatMessage({ id: 'odc.helper.page.openPage.CreateSynonym' }), // 新建同义词
    },
    {
      sql,
      databaseId,
      dbName,
      synonymType,
      type: PageType.CREATE_SYNONYM,
    },
  );
}
/** 同义词详情页面 */

export function openSynonymViewPage(
  synonymName: string,
  synonymType: SynonymType,
  databaseId: number,
  dbName: string,
) {
  page.openPage(
    PageType.SYNONYM,
    {
      title: synonymName,
    },

    {
      databaseId,
      dbName,
      synonymName,
      synonymType,
      propsTab: SynonymPropsTab.DDL,
    },
  );
}
/** 创建类型页面 */

export function openCreateTypePage(sql: string, databaseId: number, dbName: string) {
  page!.openPage(
    PageType.CREATE_TYPE,
    {
      title: formatMessage({ id: 'odc.helper.page.openPage.NewType' }), // 新建类型
    },
    {
      databaseId,
      dbName,
      sql,
      type: PageType.CREATE_TYPE,
    },
  );
}
/** 类型详情页面 */

export function openTypeViewPage(
  typeName: string,
  propsTab: TypePropsTab = TypePropsTab.DDL,
  databaseId: number,
  dbName: string,
) {
  page.openPage(
    PageType.TYPE,
    {
      title: typeName,
    },

    {
      databaseId,
      dbName,
      typeName,
      propsTab,
    },
  );
}
/** 编辑类型页面 */

export async function openTypeEditPageByName(
  typeName: string,
  sessionId: string,
  cid: number,
  dbName: string,
) {
  const plSchema = await getTypemByName(typeName, sessionId, dbName);
  page.openPage(
    PageType.PL,
    {
      title: typeName,
    },

    {
      scriptId: typeName,
      scriptText: plSchema.ddl,
      typeName,
      plSchema,
      plType: plType.TYPE,
      cid,
      dbName,
    },
  );
}

export async function openSQLResultSetViewPage(name, resultSets) {
  await page.openPage(
    PageType.SQL_RESULTSET_VIEW,
    {
      title: name,
      key: 'sql_resultset_view-' + generateUniqKey(),
    },

    {
      resultSets: generateResultSetColumns(resultSets),
    },
  );
}

// 批量编译PL页面
export function openBatchCompilePLPage(
  pageType: PageType,
  dbObjectType: DbObjectType,
  label: string,
  cid: number,
  dbName: string,
) {
  page!.openPage(
    pageType,
    {
      title: formatMessage(
        {
          id: 'odc.helper.page.openPage.BatchCompilationLabel',
        },
        { label: label },
      ), //`批量编译${label}`
      key: `${cid}-${dbName}-${pageType}`,
    },
    { dbObjectType, type: pageType, databaseId: cid, dbName },
  );
}

export async function openTutorialPage(docId: string) {
  const key = await generatePageKey(PageType.SQL);
  const title = generatePageTitle(PageType.TUTORIAL, key);
  page.openPage(
    PageType.TUTORIAL,
    {
      key,
      title,
    },

    {
      scriptName: title,
      scriptText: '',
      docId,
    },
  );
}
