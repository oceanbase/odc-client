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

import { PLType } from '@/constant/plType';
import { IFunction, IProcedure, ITrigger, IType, PageType } from '@/d.ts';
import page from '@/store/page';
import { formatMessage } from '@/util/intl';
import { getPLScriptTemplate } from '@/util/sql';
import { generateUniqKey } from '@/util/utils';
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
    pageIndex: number;
  };
  static getTitleByParams(params: AnonymousPage['pageParams']) {
    return `${formatMessage({ id: 'workspace.header.create.pl' })}_${params?.pageIndex}`;
  }
  public findCurrentNum() {
    const indexList = page.pages
      ?.filter?.((p) => p.type === PageType.PL)
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
  constructor(databaseId: number, databaseFrom: 'project' | 'datasource', sql: string) {
    super(PLType.ANONYMOUSBLOCK, databaseId);
    const pageIndex = this.findCurrentNum();
    this.pageKey = `pl-new-${generateUniqKey()}`;
    this.pageTitle = '--';
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
      pageIndex,
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
        readonly: boolean;
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
        readonly: boolean;
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
    readonly: boolean = false,
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
      readonly,
    };
  }
}
