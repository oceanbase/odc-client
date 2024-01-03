/*
 * Copyright 2024 OceanBase
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

import { ITriggerFormData, PageType, SynonymType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { generateUniqKey } from '@/util/utils';
import { Page } from './base';

export class CreateTablePage extends Page {
  public pageParams: {
    databaseId: number;
  };
  constructor(databaseId: number) {
    super();
    this.pageKey = `createTablePage-${generateUniqKey()}`;
    this.pageTitle =
      formatMessage({
        id: 'workspace.header.create',
      }) +
      formatMessage({
        id: 'workspace.header.create.table',
      });
    this.pageType = PageType.CREATE_TABLE;
    this.pageParams = {
      databaseId,
    };
  }
}

export class CreateViewPage extends Page {
  public pageParams: {
    databaseId: number;
  };
  constructor(databaseId: number) {
    super();
    this.pageKey = `createViewPage-${generateUniqKey()}`;
    this.pageTitle = formatMessage({ id: 'workspace.window.createView.modal.title' });
    this.pageType = PageType.CREATE_VIEW;
    this.pageParams = {
      databaseId,
    };
  }
}

export class SQLConfirmPage extends Page {
  public pageParams: {
    databaseId: number;
    sql: string;
    type: PageType;
    isPackageBody: boolean;
    preData?: ITriggerFormData;
    hasPre?: boolean;
    synonymType?: SynonymType;
  };
  static getTitleByParams(params: SQLConfirmPage['pageParams']) {
    if (params?.isPackageBody) {
      return formatMessage({
        id: 'workspace.window.createPackageBody.modal.title',
      });
    }
    return formatMessage({
      id: 'workspace.window.createPackage.modal.title',
    });
  }
  constructor(
    type: PageType,
    databaseId: number,
    title: string,
    sql: string,
    isPackageBody: boolean = false,
    preData?: ITriggerFormData,
    synonymType?: SynonymType,
  ) {
    super();
    this.pageKey = `sqlconfirmpage-type:${type}-${generateUniqKey()}`;
    this.pageTitle = title;
    this.pageType = type;
    this.pageParams = {
      databaseId,
      type,
      sql,
      isPackageBody,
      preData,
      hasPre: !!preData,
      synonymType,
    };
  }
}

export class CreateTriggerPage extends Page {
  public pageParams: {
    preData: ITriggerFormData;
    databaseId: number;
  };

  constructor(databaseId: number, preData: ITriggerFormData) {
    super();
    (this.pageTitle = formatMessage({ id: 'odc.helper.page.openPage.CreateATrigger' })), // 新建触发器
      (this.pageKey = `createTrigger-${generateUniqKey()}`);
    this.pageType = PageType.CREATE_TRIGGER;
    this.pageParams = {
      preData,
      databaseId,
    };
  }
}
