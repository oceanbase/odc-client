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
import { ScheduleType } from '@/d.ts/schedule';
import { SchedulePageTextMap } from '@/constant/schedule';
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
        defaultMessage: '新建',
      }) +
      formatMessage({
        id: 'workspace.header.create.table',
        defaultMessage: '表',
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
    this.pageTitle = formatMessage({
      id: 'workspace.window.createView.modal.title',
      defaultMessage: '新建视图',
    });
    this.pageType = PageType.CREATE_VIEW;
    this.pageParams = {
      databaseId,
    };
  }
}

export class CreateMaterializedViewPage extends Page {
  public pageParams: {
    databaseId: number;
  };

  constructor(databaseId: number) {
    super();
    this.pageKey = `createMaterializedViewPage-${generateUniqKey()}`;
    this.pageTitle = formatMessage({
      id: 'src.store.helper.page.pages.1690882C',
      defaultMessage: '新建物化视图',
    });
    this.pageType = PageType.CREATE_MATERIALIZED_VIEW;
    this.pageParams = {
      databaseId,
    };
  }
}

export class CreateSchedulePage extends Page {
  public pageParams: {
    scheduleType: ScheduleType;
  };

  constructor(scheduleType: ScheduleType, title?: string) {
    super();
    this.pageKey = `createSchedulePage-${generateUniqKey()}`;
    this.pageTitle = title || `新建${SchedulePageTextMap[scheduleType]}`;
    this.pageType = PageType.CREATE_SCHEDULES;
    this.pageParams = {
      scheduleType,
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
        defaultMessage: '新建程序包体',
      });
    }
    return formatMessage({
      id: 'workspace.window.createPackage.modal.title',
      defaultMessage: '新建程序包',
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
    (this.pageTitle = formatMessage({
      id: 'odc.helper.page.openPage.CreateATrigger',
      defaultMessage: '新建触发器',
    })), // 新建触发器
      (this.pageKey = `createTrigger-${generateUniqKey()}`);
    this.pageType = PageType.CREATE_TRIGGER;
    this.pageParams = {
      preData,
      databaseId,
    };
  }
}
