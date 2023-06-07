import { PageType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { generateUniqKey } from '@/util/utils';
import page from '../page';

export const PLPageMap = {
  [PageType.BATCH_COMPILE_FUNCTION]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.Function' }), //函数
  },
  [PageType.BATCH_COMPILE_PROCEDURE]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.StoredProcedure' }), //存储过程
  },
  [PageType.BATCH_COMPILE_PACKAGE]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.Bag' }), //包
  },
  [PageType.BATCH_COMPILE_TRIGGER]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.Trigger' }), //触发器
  },
  [PageType.BATCH_COMPILE_TYPE]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.Type' }), //类型
  },
};

const isBatchCompilePL = (type: PageType) => {
  return [
    PageType.BATCH_COMPILE_FUNCTION,
    PageType.BATCH_COMPILE_PACKAGE,
    PageType.BATCH_COMPILE_PROCEDURE,
    PageType.BATCH_COMPILE_TRIGGER,
    PageType.BATCH_COMPILE_TYPE,
  ].includes(type);
};

export function resetPageKey() {
  page.pageKey = 0;
  page.plPageKey = 0;
  page.plDebugPageKey = 0;
}

export function generatePageTitle(type: PageType, key?: string): string {
  let title = '';
  if (type === PageType.SESSION_PARAM) {
    title = formatMessage({ id: 'workspace.header.session.params' });
  } else if (type === PageType.SESSION_MANAGEMENT) {
    title = formatMessage({ id: 'workspace.header.session.management' });
  } else if (type === PageType.RECYCLE_BIN) {
    title = formatMessage({ id: 'workspace.header.recycle' });
  } else if (type === PageType.SQL) {
    title = `${formatMessage({ id: 'workspace.header.create.sql' })}_${
      key && key.replace('sql-new-', '')
    }`;
  } else if (type === PageType.PL) {
    if (key?.startsWith('pl-debug')) {
      title =
        formatMessage({ id: 'odc.store.helper.pageKeyGenerate.DebuggingWindow' }) + //调试窗口
        `_${key && key.replace('pl-debug-new-', '')}`;
    } else {
      title = `${formatMessage({ id: 'workspace.header.create.pl' })}_${
        key && key.replace('pl-new-', '')
      }`;
    }
  } else if (isBatchCompilePL(type)) {
    title = `${formatMessage(
      {
        id: 'odc.helper.page.openPage.BatchCompilationLabel',
      },
      { label: PLPageMap?.[type]?.label ?? '' },
    )}`;
  }
  return title;
}

export async function generatePageKey(type: PageType, params: any = {}): Promise<string> {
  let key = `page-`;
  if (type === PageType.SQL) {
    key = `sql-${params?.scriptId || 'new-' + page.pageKey++}`;
  } else if (type === PageType.PL) {
    if (params?.isDebug) {
      key = `pl-debug-${params?.scriptId || 'new-' + page.plDebugPageKey++}`;
    } else {
      key = `pl-${params?.scriptId || 'new-' + page.plPageKey++}`;
    }
  } else if (type === PageType.DATABASE) {
    key += `database-${params.databaseId}`;
  } else if (type === PageType.TABLE || type === PageType.CREATE_TABLE) {
    key += params.tableName ? `table-${params.tableName}` : `table-new-${page.pageKey++}`;
  } else if (type === PageType.SESSION_PARAM) {
    key += 'session-param';
  } else if (type === PageType.SESSION_MANAGEMENT) {
    key += 'session-management';
  } else if (type === PageType.RECYCLE_BIN) {
    key += 'recycle-bin';
  } else if (type === PageType.VIEW || type === PageType.CREATE_VIEW) {
    key += params.viewName ? `view-${params.viewName}` : `view-new-${page.pageKey++}`;
  } else if (type === PageType.FUNCTION || type === PageType.CREATE_FUNCTION) {
    key += params.funName ? `func-${params.funName}` : `func-new-${page.pageKey++}`;
  } else if (isBatchCompilePL(type)) {
    key += `batch-compile-pl-${generateUniqKey()}`;
  } else if (type === PageType.PROCEDURE || type === PageType.CREATE_PROCEDURE) {
    key += params.proName ? `pro-${params.proName}` : `pro-new-${page.pageKey++}`;
  } else if (type === PageType.SEQUENCE || type === PageType.CREATE_SEQUENCE) {
    key += params.sequenceName
      ? `sequence-${params.sequenceName}`
      : `sequence-new-${page.pageKey++}`;
  } else if (type === PageType.PACKAGE || type === PageType.CREATE_PACKAGE) {
    key += params.packageName ? `pk-${params.packageName}` : `pk-new-${page.pageKey++}`;
  } else if (
    type === PageType.TRIGGER ||
    type === PageType.CREATE_TRIGGER ||
    type === PageType.CREATE_TRIGGER_SQL
  ) {
    key += params.triggerName ? `trigger-${params.triggerName}` : `trigger-new-${page.pageKey++}`;
  } else if (type === PageType.SYNONYM || type === PageType.CREATE_SYNONYM) {
    key += params.synonymName
      ? `synonym-${params.synonymName}-${params.synonymType}`
      : `synonym-new-${page.pageKey++}`;
  } else if (type === PageType.TYPE || type === PageType.CREATE_TYPE) {
    key += params.typeName ? `type-${params.typeName}` : `type-new-${page.pageKey++}`;
  } else if (type === PageType.TASKS) {
    key += 'tasks';
  } else if (type === PageType.OB_CLIENT) {
    key += `OBClient-${params.index}`;
  } else if (type === PageType.SQL_RESULTSET_VIEW) {
    key += `resultview-${generateUniqKey()}`;
  }
  return key;
}
