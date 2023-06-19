import { PLType } from '@/constant/plType';
import { IFunction, IProcedure, ITrigger, IType, PageType } from '@/d.ts';
import page from '@/store/page';
import { formatMessage } from '@/util/intl';
import { getPLScriptTemplate } from '@/util/sql';
import { Page } from './base';

export enum PLPageType {
  pkgHead,
  pkgBody,
  anonymous,
  plEdit,
}

export class PLPage extends Page {
  public plType: PLType;
  public databaseId: number;
  public pageParams: { cid: number; plPageType: PLPageType };
  constructor(plType: PLType, databaseId: number) {
    super();
    this.pageType = PageType.PL;
    this.plType = plType;
    this.databaseId = databaseId;
  }
}

export class PackageHeadPage extends PLPage {
  public pageParams: {
    plPageType: PLPageType.pkgHead;
    cid: number;
    packageName: string;
    scriptText: string;
    plSchema: {
      packageName: string;
      plName: string;
      plType: PLType.PKG_HEAD;
    };
  };
  constructor(databaseId: number, packageName: string, ddl: string) {
    super(PLType.PKG_HEAD, databaseId);
    this.pageKey = `pl-pkg:${packageName}-type:head-dbid:${databaseId}`;
    this.pageParams = {
      plPageType: PLPageType.pkgHead,
      cid: databaseId,
      packageName,
      scriptText: ddl,
      plSchema: {
        packageName,
        plName: `${packageName}.head`,
        plType: PLType.PKG_HEAD,
      },
    };
    this.pageTitle = `${packageName}_head`;
  }
}

export class PackageBodyPage extends PLPage {
  public pageParams: {
    plPageType: PLPageType.pkgBody;
    cid: number;
    packageName: string;
    scriptText: string;
    plSchema: {
      packageName: string;
      plName: string;
      plType: PLType.PKG_BODY;
    };
  };
  constructor(databaseId: number, packageName: string, ddl: string) {
    super(PLType.PKG_BODY, databaseId);
    this.pageKey = `pl-pkg:${packageName}-type:body-dbid:${databaseId}`;
    this.pageParams = {
      plPageType: PLPageType.pkgBody,
      cid: databaseId,
      packageName,
      scriptText: ddl,
      plSchema: {
        packageName,
        plName: `${packageName}.body`,
        plType: PLType.PKG_BODY,
      },
    };
    this.pageTitle = `${packageName}_body`;
  }
}

export class AnonymousPage extends PLPage {
  public pageParams: {
    plPageType: PLPageType.anonymous;
    cid: number;
    scriptName: string;
    isAnonymous: true;
    scriptText: string;
    scriptId?: string;
    objectName?: string;
    plSchema: {
      params: any[];
    };
    databaseFrom: 'datasource' | 'project';
  };
  constructor(databaseId: number, databaseFrom: 'project' | 'datasource', sql: string) {
    super(PLType.ANONYMOUSBLOCK, databaseId);
    this.pageKey = `pl-new-${page.plPageKey++}`;
    this.pageTitle = `${formatMessage({ id: 'workspace.header.create.pl' })}_${page.plPageKey - 1}`;
    this.pageParams = {
      plPageType: PLPageType.anonymous,
      cid: databaseId,
      isAnonymous: true,
      scriptName: this.pageTitle,
      scriptText: sql ?? getPLScriptTemplate(),
      plSchema: {
        params: [],
      },
      databaseFrom,
    };
  }
}

export class PLEditPage extends PLPage {
  public pageParams:
    | {
        plPageType: PLPageType.plEdit;
        cid: number;
        scriptText: string;
        scriptId: string;
        plName: string;
        plSchema: (IFunction | IProcedure) & {
          key: string;
          packageName: string;
        };
        fromPackage: true;
        plType: PLType;
      }
    | {
        plPageType: PLPageType.plEdit;
        cid: number;
        scriptText: string;
        scriptId: string;
        plName: string;
        plSchema: IFunction | IProcedure | ITrigger | IType;
        fromPackage: false;
        plType: PLType;
      };
  constructor(
    plType: PLType,
    databaseId: number,
    plName: string,
    plSchema:
      | IFunction
      | IProcedure
      | ITrigger
      | IType
      | ((IFunction | IProcedure) & { key: string; packageName: string }),
    fromPackage: boolean = false,
  ) {
    super(plType, databaseId);
    this.pageKey = `pl-edit-plName:${plName}-dbid:${databaseId}`;
    this.pageTitle = plName;
    //@ts-ignore
    this.pageParams = {
      plPageType: PLPageType.plEdit,
      scriptId: plName + '-' + databaseId,
      plName,
      scriptText: plSchema.ddl,
      plSchema,
      plType,
      cid: databaseId,
      fromPackage,
    };
  }
}
