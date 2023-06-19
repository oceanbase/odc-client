import {
  DbObjectType,
  IScript,
  IScriptMeta,
  ITrigger,
  PageType,
  ScriptId,
  SynonymPropsTab,
  SynonymType,
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
  } & Partial<IScriptMeta>;

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
      this.pageTitle = script.scriptMeta?.objectName;
      this.pageParams = {
        ...script,
        scriptText: script.content,
        scriptId: script.scriptMeta?.id,
        databaseFrom,
        cid: databaseId,
      };
    } else {
      this.pageKey = `sqlpage-new-no:${page.pageKey++}`;
      this.pageTitle = `${formatMessage({ id: 'workspace.header.create.sql' })}_${
        page.pageKey - 1
      }`;
      this.pageParams = {
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
    this.pageKey = `tutorialpage-new-${page.pageKey++}`;
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
  constructor() {
    super();
    this.pageKey = 'taskpage';
    this.pageType = PageType.TASKS;
    this.pageTitle = formatMessage({
      id: 'odc.component.TaskPopover.TaskCenter',
    });
    this.pageParams = {};
  }
}

export class SessionManagePage extends Page {
  public pageParams: {
    cid: number;
  };
  constructor(cid: number) {
    super();
    this.pageKey = 'session-management-page';
    this.pageType = PageType.SESSION_MANAGEMENT;
    this.pageTitle = formatMessage({
      id: 'workspace.header.session.management',
    });
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
    this.pageKey = 'recycle-bin-page';
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
  constructor(pageType: PageType, dbObjectType: DbObjectType, label: string, databaseId: number) {
    super();
    this.pageKey = `batchcompile-databaseId:${databaseId}-pageType:${pageType}`;
    this.pageTitle = formatMessage(
      {
        id: 'odc.helper.page.openPage.BatchCompilationLabel',
      },
      { label: label },
    );
    this.pageType = pageType;
    this.pageParams = {
      dbObjectType,
      type: pageType,
      databaseId,
    };
  }
}
