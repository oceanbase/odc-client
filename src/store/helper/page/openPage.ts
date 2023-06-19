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
  IProcedure,
  IScript,
  ITrigger,
  ITriggerFormData,
  PageType,
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

import { getTriggerByName } from '@/common/network/trigger';
import SelectDatabase from '@/component/SelectDatabase';
import { PLType } from '@/constant/plType';
import sqlStore from '@/store/sql';
import taskStore from '@/store/task';
import { generateUniqKey } from '@/util/utils';
import { message } from 'antd';
import { generateResultSetColumns } from '..';
import page from '../../page';
import {
  BatchCompilePage,
  FunctionPage,
  PackageViewPage,
  ProcedurePage,
  RecycleBinPage,
  SequencePage,
  SessionManagePage,
  SQLPage,
  SynonymPage,
  TablePage,
  TaskPage,
  TriggerPage,
  TutorialPage,
  TypePage,
  ViewPage,
} from './pages';
import { CreateTablePage, CreateTriggerPage, CreateViewPage, SQLConfirmPage } from './pages/create';
import { AnonymousPage, PackageBodyPage, PackageHeadPage, PLEditPage } from './pages/pl';
import { findPageByScriptIdAndType } from './util';

export function openPackageHeadPage(packageName: string, sql: string, databaseId: number) {
  page.newOrOpenPage(new PackageHeadPage(databaseId, packageName, sql));
}
export async function openPackageBodyPage(packageName: string, sql: string, databaseId: number) {
  let pkgPage = new PackageBodyPage(databaseId, packageName, sql);
  const isNew = !page.pages.find((p) => p.key === pkgPage.pageKey);
  await page.newOrOpenPage(pkgPage);

  return { pkgPage, isNew };
}
export function openPackageViewPage(
  packageName: string,
  topTab: TopTab,
  showCode: boolean,
  databaseId: number,
) {
  let propsTab: PropsTab = null;
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
  const pkgPage = new PackageViewPage(databaseId, packageName, topTab, propsTab);
  page.newOrOpenPage(pkgPage);
}
export async function openNewSQLPage(cid: number, databaseFrom?: 'datasource' | 'project') {
  const sqlPage = new SQLPage(cid, null, false, databaseFrom);
  page.newOrOpenPage(sqlPage);
}
export async function openNewSQLPageWithResult(result, cid: number) {
  const sqlPage = new SQLPage(cid);
  sqlStore.resultSets.set(sqlPage.pageKey, generateResultSetColumns(result));

  page.newOrOpenPage(sqlPage);
}
/** 根据scriptID打开sql或者pl的page */

export async function openSQLPageByScript(scriptId: any, dbid: number) {
  const existPage = findPageByScriptIdAndType(scriptId);

  if (existPage) {
    page.setActivePageKeyAndPushUrl(existPage.key);
    return false;
  }

  const file = await getScript(scriptId);

  if (file) {
    const key = openSQLOrPLPage(file, dbid);
    return key;
  }

  return false;
}
/** 打开已存在的SQL/匿名块Page */

export async function openSQLOrPLPage(file: IScript, cid: number) {
  const sqlPage = new SQLPage(cid, file);

  page.newOrOpenPage(sqlPage);

  return sqlPage.pageKey;
}
export async function openNewDefaultPLPage(
  value?: { sql: string; params: any },
  cid?: number,
  dbName?: string,
  databaseFrom?: 'project' | 'datasource',
) {
  let plPage = new AnonymousPage(cid, databaseFrom, value?.sql);
  page.newOrOpenPage(plPage);
}

export function openTasksPage(taskType?: TaskPageType, taskPageScope?: TaskPageScope) {
  taskStore.changeTaskManageVisible(true, taskType, taskPageScope);
  page.newOrOpenPage(new TaskPage());
}

/** 会话管理 */

export async function openSessionManagePage(datasourceId?: number) {
  if (!datasourceId) {
    [datasourceId] = await SelectDatabase();
  }
  if (!datasourceId) {
    return;
  }
  page.newOrOpenPage(new SessionManagePage(datasourceId));
}
/** 回收站 */

export async function openRecycleBin(cid?: number) {
  if (!cid) {
    [cid] = await SelectDatabase();
  }
  if (!cid) {
    return;
  }
  page.newOrOpenPage(new RecycleBinPage(cid));
}
/** 创建表页面 */

export function openCreateTablePage(dbId: number) {
  page.newOrOpenPage(new CreateTablePage(dbId));
}
/** Table详情页面 */

export function openTableViewPage(
  tableName: string,
  topTab: TableTopTab = TableTopTab.PROPS,
  propsTab: TablePropsTab = TablePropsTab.INFO,
  databaseId: number,
) {
  page.newOrOpenPage(new TablePage(databaseId, tableName, topTab, propsTab));
}

/**
 * 创建视图页面
 */
export function openCreateViewPage(dbId: number) {
  page.newOrOpenPage(new CreateViewPage(dbId));
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
  page.newOrOpenPage(new ViewPage(dbId, viewName, topTab, propsTab));
}
/** 创建函数页面 */

export function openCreateFunctionPage(sql: string, databaseId: number, dbName: string) {
  page.newOrOpenPage(
    new SQLConfirmPage(
      PageType.CREATE_FUNCTION,
      databaseId,
      formatMessage({
        id: 'workspace.window.createFunction.modal.title',
      }),
      sql,
    ),
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
  page.newOrOpenPage(new FunctionPage(databaseId, functionName, topTab, propsTab));
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
  page.newOrOpenPage(
    new SQLConfirmPage(
      PageType.CREATE_PROCEDURE,
      databaseId,
      formatMessage({
        id: 'workspace.window.createProcedure.modal.title',
      }),
      sql,
    ),
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
  page.newOrOpenPage(new ProcedurePage(databaseId, procedureName, topTab, propsTab));
}
/** 创建程序包页面 */

export function openCreatePackagePage(sql: string, databaseId: number, dbName: string) {
  page.newOrOpenPage(
    new SQLConfirmPage(
      PageType.CREATE_PACKAGE,
      databaseId,
      formatMessage({
        id: 'workspace.window.createPackage.modal.title',
      }),
      sql,
    ),
  );
}
/** 创建程序包包体页面 */

export function openCreatePackageBodyPage(sql: string, databaseId: number, dbName: string) {
  page.newOrOpenPage(
    new SQLConfirmPage(
      PageType.CREATE_PACKAGE,
      databaseId,
      formatMessage({
        id: 'workspace.window.createPackageBody.modal.title',
      }),
      sql,
      true,
    ),
  );
}
/** 创建序列页面 */

export function openCreateSequencePage(sql: string, databaseId: number, dbName: string) {
  page.newOrOpenPage(
    new SQLConfirmPage(
      PageType.CREATE_SEQUENCE,
      databaseId,
      formatMessage({
        id: 'workspace.window.createSequence.modal.title',
      }),
      sql,
    ),
  );
}
/** Sequence 查看序列详情页面 */

export function openSequenceViewPage(
  sequenceName: string,
  propsTab: SequencePropsTab = SequencePropsTab.INFO,
  databaseId: number,
  dbName: string,
) {
  page.newOrOpenPage(new SequencePage(databaseId, sequenceName, propsTab));
}
/** 编辑存储过程页面 */

export async function openProcedureEditPageByProName(
  proName: string,
  sessionId: string,
  dbName: string,
  databaseId: number,
) {
  const plSchema = await getProcedureByProName(proName, false, sessionId, dbName);
  const plPage = new PLEditPage(PLType.PROCEDURE, databaseId, proName, plSchema);
  const isNew = !page.pages.find((p) => p.key === plPage.pageKey);
  await page.newOrOpenPage(plPage);
  return { plPage, isNew };
}
/** 编辑函数页面-local */

export async function openFunctionOrProcedureFromPackage(
  packageName: string,
  subName: string,
  type: any,
  plSchema: IFunction | IProcedure,
  databaseId: number,
  dbName: string,
) {
  const plName = `${packageName}.${subName}`;
  const plPage = new PLEditPage(type, databaseId, plName, plSchema, true);
  const isNew = !page.pages.find((p) => p.key === plPage.pageKey);
  await page.newOrOpenPage(plPage);
  return { plPage, isNew };
}
/** 编辑函数页面-remote */

export async function openFunctionEditPageByFuncName(
  funcName: string,
  sessionId: string,
  dbName: string,
  databaseId: number,
) {
  const plSchema = await getFunctionByFuncName(funcName, false, sessionId, dbName);
  let plPage = new PLEditPage(PLType.FUNCTION, databaseId, funcName, plSchema);
  const isNew = !page.pages.find((p) => p.key === plPage.pageKey);
  await page.newOrOpenPage(plPage);
  return { plPage, isNew };
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
  await page.newOrOpenPage(new CreateTriggerPage(databaseId, preData));
}
/** 创建触发器页面 (SQL确认页面) */

export async function openCreateTriggerSQLPage(
  sql: string,
  preData: ITriggerFormData,
  databaseId: number,
  dbName: string,
) {
  await page.newOrOpenPage(
    new SQLConfirmPage(
      PageType.CREATE_TRIGGER_SQL,
      databaseId,
      formatMessage({ id: 'odc.helper.page.openPage.CreateATrigger' }),
      sql,
      false,
      preData,
    ),
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
  page.newOrOpenPage(new TriggerPage(databaseId, triggerName, triggerState, propsTab, triggerData));
}
/** 编辑触发器页面 */

export async function openTriggerEditPageByName(
  triggerName: string,
  sessionId: string,
  dbName: string,
  databaseId: number,
) {
  const plSchema: ITrigger = await getTriggerByName(triggerName, sessionId, dbName);
  page.newOrOpenPage(new PLEditPage(PLType.TRIGGER, databaseId, triggerName, plSchema));
}
/** 创建同义词页面 */

export function openCreateSynonymPage(
  sql: string,
  synonymType?: SynonymType,
  databaseId?: number,
  dbName?: string,
) {
  page.newOrOpenPage(
    new SQLConfirmPage(
      PageType.CREATE_SYNONYM,
      databaseId,
      formatMessage({ id: 'odc.helper.page.openPage.CreateSynonym' }),
      sql,
      false,
      null,
      synonymType,
    ),
  );
}
/** 同义词详情页面 */

export function openSynonymViewPage(
  synonymName: string,
  synonymType: SynonymType,
  databaseId: number,
  dbName: string,
) {
  page.newOrOpenPage(new SynonymPage(databaseId, synonymName, synonymType));
}
/** 创建类型页面 */

export function openCreateTypePage(sql: string, databaseId: number, dbName: string) {
  page.newOrOpenPage(
    new SQLConfirmPage(
      PageType.CREATE_TYPE,
      databaseId,
      formatMessage({ id: 'odc.helper.page.openPage.NewType' }),
      sql,
    ),
  );
}
/** 类型详情页面 */

export function openTypeViewPage(
  typeName: string,
  propsTab: TypePropsTab = TypePropsTab.DDL,
  databaseId: number,
  dbName: string,
) {
  page.newOrOpenPage(new TypePage(databaseId, typeName, propsTab));
}
/** 编辑类型页面 */

export async function openTypeEditPageByName(
  typeName: string,
  sessionId: string,
  databaseId: number,
  dbName: string,
) {
  const plSchema = await getTypemByName(typeName, sessionId, dbName);
  page.newOrOpenPage(new PLEditPage(PLType.TYPE, databaseId, typeName, plSchema));
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
  databaseId: number,
  dbName: string,
) {
  page.newOrOpenPage(new BatchCompilePage(pageType, dbObjectType, label, databaseId));
}

export async function openTutorialPage(docId: string) {
  page.newOrOpenPage(new TutorialPage(docId, null));
}
