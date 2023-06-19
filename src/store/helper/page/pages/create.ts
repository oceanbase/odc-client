import { ITriggerFormData, PageType, SynonymType } from '@/d.ts';
import page from '@/store/page';
import { formatMessage } from '@/util/intl';
import { Page } from './base';

export class CreateTablePage extends Page {
  public pageParams: {
    databaseId: number;
  };
  constructor(databaseId: number) {
    super();
    this.pageKey = `createTablePage-${page.pageKey++}`;
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
    this.pageKey = `createViewPage-${page.pageKey++}`;
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
    this.pageKey = `sqlconfirmpage-type:${type}-${page.pageKey++}`;
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
      (this.pageKey = `createTrigger-${page.pageKey++}`);
    this.pageType = PageType.CREATE_TRIGGER;
    this.pageParams = {
      preData,
      databaseId,
    };
  }
}
