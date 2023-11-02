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

import {
  DbObjectType,
  IResultSet,
  IScript,
  IScriptMeta,
  ITrigger,
  PageType,
  ScriptId,
  SynonymPropsTab,
  SynonymType,
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
import page from '@/store/page';
import { formatMessage } from '@/util/intl';
import { generateUniqKey } from '@/util/utils';
import { PLPageMap } from '../../pageKeyGenerate';
import { Page } from './base';
export class PackageViewPage extends Page {
  public pageParams: {
    packageName: string;
    topTab: TopTab;
    propsTab: PropsTab;
    databaseId: number;
  };
  constructor(
    databaseId: number,
    packageName: string,
    topTab: TopTab = TopTab.HEAD,
    propsTab: PropsTab = PropsTab.PACKAGE_HEAD_CODE,
  ) {
    super();
    this.pageType = PageType.PACKAGE;
    this.pageKey = `package:${packageName}-dbid:${databaseId}`;
    this.pageParams = {
      packageName,
      topTab,
      propsTab,
      databaseId,
    };
    this.pageTitle = packageName;
  }
}
export class SQLPage extends Page {
  public pageParams: {
    scriptText: string;
    scriptId?: ScriptId;
    cid: number;
    fromTask?: boolean;
    databaseFrom: 'datasource' | 'project';
    pageIndex?: number;
    dbName?: string;
  } & Partial<IScriptMeta>;
  static getTitleByParams(params: SQLPage['pageParams']) {
    if (params?.scriptId) {
      return params?.objectName;
    } else if (params?.dbName) {
      return params?.dbName;
    }
    return `${formatMessage({
      id: 'workspace.header.create.sql',
    })}`;
  }
  public findCurrentNum() {
    const indexList = page.pages
      ?.filter?.((p) => p.type === PageType.SQL)
      ?.map((p) => p.params?.pageIndex)
      ?.filter(Boolean);
    let i = 1;
    while (true) {
      if (indexList.includes(i)) {
        i++;
      } else {
        return i;
      }
    }
  }
  constructor(
    databaseId: number,
    script?: IScript,
    fromTask: boolean = false,
    databaseFrom: 'project' | 'datasource' = 'datasource',
  ) {
    super();
    this.pageType = PageType.SQL;
    if (script) {
      this.pageKey = `sqlpage-scriptId:${script.scriptMeta?.id}`;
      this.pageTitle = '--';
      this.pageParams = {
        ...script?.scriptMeta,
        scriptText: script.content,
        scriptId: script.scriptMeta?.id,
        databaseFrom,
        cid: databaseId,
      };
    } else {
      const pageIndex = this.findCurrentNum();
      this.pageKey = `sqlpage-new-no:${generateUniqKey()}`;
      this.pageTitle = '--';
      this.pageParams = {
        pageIndex: pageIndex,
        scriptText: '',
        cid: databaseId,
        databaseFrom,
        fromTask,
      };
    }
  }
}
export class TutorialPage extends Page {
  public pageParams: {
    docId: string;
    scriptText: string;
    cid: number;
    databaseFrom: 'datasource';
  };
  constructor(docId: string, databaseId: number) {
    super();
    this.pageKey = `tutorialpage-new-${generateUniqKey()}`;
    this.pageTitle = '--';
    this.pageType = PageType.TUTORIAL;
    this.pageParams = {
      docId,
      cid: databaseId,
      scriptText: '',
      databaseFrom: 'datasource',
    };
  }
}
export class TaskPage extends Page {
  constructor(type: TaskPageType) {
    super();
    this.pageKey = type;
    this.pageType = PageType.TASKS;
    this.pageTitle = formatMessage({
      id: 'odc.src.store.helper.page.pages.WorkOrder',
    }); //'工单'
    this.pageParams = {
      type,
    };
  }
}
export class SessionManagePage extends Page {
  public pageParams: {
    cid: number;
  };
  constructor(cid: number) {
    super();
    this.pageKey = `session-management-page-${generateUniqKey()}`;
    this.pageType = PageType.SESSION_MANAGEMENT;
    this.pageTitle = formatMessage({
      id: 'workspace.header.session.management',
    });
    this.pageParams = {
      cid,
    };
  }
}
export class SessionParamsPage extends Page {
  public pageParams: {
    cid: number;
  };
  constructor(cid: number) {
    super();
    this.pageKey = `session-params-page-${generateUniqKey()}`;
    this.pageType = PageType.SESSION_PARAM;
    this.pageTitle = '--';
    this.pageParams = {
      cid,
    };
  }
}
export class RecycleBinPage extends Page {
  public pageParams: {
    cid: number;
  };
  constructor(cid: number) {
    super();
    this.pageKey = `recycle-bin-page-${generateUniqKey()}`;
    this.pageType = PageType.RECYCLE_BIN;
    this.pageTitle = formatMessage({
      id: 'workspace.header.recycle',
    });
    this.pageParams = {
      cid,
    };
  }
}
export class TablePage extends Page {
  public pageParams: {
    databaseId: number;
    databaseFrom: 'datasource';
    tableName: string;
    topTab: TableTopTab;
    propsTab: TablePropsTab;
  };
  constructor(
    databaseId: number,
    tableName: string,
    topTab: TableTopTab = TableTopTab.PROPS,
    propsTab: TablePropsTab = TablePropsTab.INFO,
  ) {
    super();
    this.pageType = PageType.TABLE;
    this.pageKey = `tablepage-tableName:${tableName}-dbid:${databaseId}`;
    this.pageTitle = tableName;
    this.pageParams = {
      databaseId,
      databaseFrom: 'datasource',
      tableName,
      topTab,
      propsTab,
    };
  }
}
export class ViewPage extends Page {
  public pageParams: {
    databaseId: number;
    viewName: string;
    topTab: ViewTopTab;
    propsTab: ViewPropsTab;
  };
  constructor(
    databaseId: number,
    viewName: string,
    topTab: ViewTopTab = ViewTopTab.PROPS,
    propsTab: ViewPropsTab = ViewPropsTab.INFO,
  ) {
    super();
    this.pageType = PageType.VIEW;
    this.pageKey = `viewpage-viewName:${viewName}-dbid:${databaseId}`;
    this.pageTitle = viewName;
    this.pageParams = {
      viewName,
      topTab,
      propsTab,
      databaseId,
    };
  }
}
export class FunctionPage extends Page {
  public pageParams: {
    databaseId: number;
    funName: string;
    topTab: FunctionTopTab;
    propsTab: FunctionPropsTab;
  };
  constructor(
    databaseId: number,
    functionName: string,
    topTab: FunctionTopTab = FunctionTopTab.PROPS,
    propsTab: FunctionPropsTab = FunctionPropsTab.INFO,
  ) {
    super();
    this.pageType = PageType.FUNCTION;
    this.pageKey = `functionpage-functionName:${functionName}-dbid:${databaseId}`;
    this.pageTitle = functionName;
    this.pageParams = {
      databaseId,
      funName: functionName,
      topTab,
      propsTab,
    };
  }
}
export class ProcedurePage extends Page {
  public pageParams: {
    databaseId: number;
    proName: string;
    topTab: ProcedureTopTab;
    propsTab: ProcedurePropsTab;
  };
  constructor(
    databaseId: number,
    procedureName: string,
    topTab: ProcedureTopTab = ProcedureTopTab.PROPS,
    propsTab: ProcedurePropsTab = ProcedurePropsTab.INFO,
  ) {
    super();
    this.pageType = PageType.PROCEDURE;
    this.pageKey = `procedurepage-procedureName:${procedureName}-dbid:${databaseId}`;
    this.pageTitle = procedureName;
    this.pageParams = {
      databaseId,
      proName: procedureName,
      topTab,
      propsTab,
    };
  }
}
export class SequencePage extends Page {
  public pageParams: {
    databaseId: number;
    sequenceName: string;
    propsTab: SequencePropsTab;
  };
  constructor(
    databaseId: number,
    sequenceName: string,
    propsTab: SequencePropsTab = SequencePropsTab.INFO,
  ) {
    super();
    this.pageType = PageType.SEQUENCE;
    this.pageKey = `sequencepage-sequenceName:${sequenceName}-dbid:${databaseId}`;
    this.pageTitle = sequenceName;
    this.pageParams = {
      databaseId,
      sequenceName,
      propsTab,
    };
  }
}
export class TriggerPage extends Page {
  public pageParams: {
    databaseId: number;
    triggerName: string;
    propsTab: TriggerPropsTab;
    triggerData?: ITrigger;
    isDisabled: boolean;
  };
  constructor(
    databaseId: number,
    triggerName: string,
    triggerState: TriggerState,
    propsTab: TriggerPropsTab = TriggerPropsTab.DDL,
    triggerData?: ITrigger,
  ) {
    super();
    this.pageType = PageType.TRIGGER;
    this.pageKey = `triggerpage-triggerName:${triggerName}-dbid:${databaseId}`;
    this.pageTitle = triggerName;
    this.pageParams = {
      databaseId,
      triggerName,
      triggerData,
      propsTab,
      isDisabled: triggerState === TriggerState.disabled,
    };
  }
}
export class SynonymPage extends Page {
  public pageParams: {
    databaseId: number;
    synonymName: string;
    propsTab: SynonymPropsTab;
    synonymType: SynonymType;
  };
  constructor(databaseId: number, synonymName: string, synonymType: SynonymType) {
    super();
    this.pageType = PageType.SYNONYM;
    this.pageKey = `synonympage-synonymName:${synonymName}-dbid:${databaseId}`;
    this.pageTitle = synonymName;
    this.pageParams = {
      databaseId,
      synonymName,
      synonymType,
      propsTab: SynonymPropsTab.DDL,
    };
  }
}
export class TypePage extends Page {
  public pageParams: {
    databaseId: number;
    typeName: string;
    propsTab: TypePropsTab;
  };
  constructor(databaseId: number, typeName: string, propsTab: TypePropsTab) {
    super();
    this.pageType = PageType.TYPE;
    this.pageKey = `typepage-typeName:${typeName}-dbid:${databaseId}`;
    this.pageTitle = typeName;
    this.pageParams = {
      databaseId,
      typeName,
      propsTab,
    };
  }
}
export class BatchCompilePage extends Page {
  public pageParams: {
    type: PageType;
    dbObjectType: DbObjectType;
    databaseId: number;
  };
  static getTitleByParams(params: BatchCompilePage['pageParams']) {
    return `${formatMessage(
      {
        id: 'odc.helper.page.openPage.BatchCompilationLabel',
      },
      {
        label: PLPageMap?.[params?.type]?.label ?? '',
      },
    )}`;
  }
  constructor(pageType: PageType, dbObjectType: DbObjectType, databaseId: number) {
    super();
    this.pageKey = `batchcompile-databaseId:${databaseId}-pageType:${pageType}`;
    this.pageTitle = '--';
    this.pageType = pageType;
    this.pageParams = {
      dbObjectType,
      type: pageType,
      databaseId,
    };
  }
}
export class SQLResultSetPage extends Page {
  public pageParams: {
    resultSets: IResultSet[];
    databaseId: number;
  };
  constructor(databaseId: number, resultSets: IResultSet[], title: string) {
    super();
    this.pageKey = 'sql_resultset_view-' + generateUniqKey();
    this.pageTitle = title;
    this.pageType = PageType.SQL_RESULTSET_VIEW;
    this.pageParams = {
      resultSets,
      databaseId,
    };
  }
}
export class OBClientPage extends Page {
  public pageParams: {
    time: number;
    index: number;
    dataSourceId: number;
    databaseId: number;
  };
  static getTitleByParams(params: OBClientPage['pageParams']) {
    return (
      formatMessage({
        id: 'odc.helper.page.openPage.CommandLineWindow',
      }) + params?.index
    );
  }
  constructor(dataSourceId: number, currentNum: number, databaseId?: number) {
    super();
    this.pageKey = 'obclientPage-' + generateUniqKey();
    this.pageTitle = '--';
    this.pageType = PageType.OB_CLIENT;
    this.pageParams = {
      time: Date.now(),
      index: currentNum,
      dataSourceId,
      databaseId,
    };
  }
}
