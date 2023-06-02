import { getMetaStoreInstance } from '@/common/metaStore';
import { IPage, PageType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import tracert from '@/util/tracert';
import { message } from 'antd';
import { isNil } from 'lodash';
import { action, computed, observable } from 'mobx';
import commonStore from './common';
import connectionStore from './connection';
import { savePageStoreToMetaStore } from './helper/page';
import { generatePageKey, generatePageTitle, resetPageKey } from './helper/pageKeyGenerate';
import login from './login';
import { default as schemaStore } from './schema';
import { autoSave } from './utils/metaSync';

export interface IPageOptions {
  title?: string;
  key?: string;
  updateKey?: boolean;
  updatePath?: boolean;
  path?: string;
  isSaved?: boolean;
  startSaving?: boolean;
}

export class PageStore {
  @observable
  public pageKey: number = 0;

  @observable
  public plPageKey: number = 0;

  @observable
  public plDebugPageKey: number = 0;

  @observable
  public databaseId: number;

  @observable
  public pages: IPage[] = [];

  @observable
  public activePageKey: string | null = null;

  @computed public get activePage() {
    return this.pages.find((p) => p.key === this.activePageKey);
  }

  @action
  getPageByKey(pageKey: string) {
    return this.pages.find((p) => p.key === pageKey);
  }

  /** 初始化store */
  @action
  public async initStore() {
    await autoSave(this, 'pages', 'pages', []);
    await autoSave(this, 'pageKey', 'pageKey', 0);
    await autoSave(this, 'plPageKey', 'plPageKey', 0);
    await autoSave(this, 'plDebugPageKey', 'plDebugPageKey', 0);
  }
  /** 切换打开的page，更新一下URL */
  @action
  public async setActivePageKeyAndPushUrl(activePageKey: string | null) {
    await this.updateActiveKey(() => {
      return activePageKey;
    });

    // if (this.activePage) {
    //   // 更新路由
    //   history.push(this.activePage.path);
    // } else {
    //   history.push(this.generatePagePath(PageType.DATABASE));
    // }
  }

  /**
   * 生成页面路由路径
   *
   * @param type
   * @param params
   */
  public generatePagePath(): string {
    // 编码进 sessionId & dbName
    let url = `/workspace/session/${commonStore.tabKey}/sid:${connectionStore.sessionId}:d:${
      schemaStore?.database?.name || ''
    }`;
    return url;
  }

  /** Page是否需要唯一 */
  public isUnique(type: PageType, params: any = {}): boolean {
    if (type === PageType.SQL) {
      return params && params.scriptId;
    }
    if (type === PageType.PL) {
      return params && params.scriptId;
    } else if (type === PageType.TABLE) {
      return params.tableName;
    } else if (
      type === PageType.CREATE_TABLE ||
      type === PageType.CREATE_VIEW ||
      type === PageType.CREATE_FUNCTION ||
      type === PageType.CREATE_PROCEDURE ||
      type === PageType.CREATE_SEQUENCE ||
      type === PageType.CREATE_PACKAGE ||
      type === PageType.CREATE_TRIGGER ||
      type === PageType.CREATE_TRIGGER_SQL ||
      type === PageType.CREATE_SYNONYM ||
      type === PageType.CREATE_TYPE ||
      type === PageType.BATCH_COMPILE_FUNCTION ||
      type === PageType.BATCH_COMPILE_PACKAGE ||
      type === PageType.BATCH_COMPILE_PROCEDURE ||
      type === PageType.BATCH_COMPILE_TRIGGER ||
      type === PageType.BATCH_COMPILE_TYPE
    ) {
      return false;
    } else if (type === PageType.VIEW) {
      return params.viewName;
    } else if (type === PageType.FUNCTION) {
      return params.funName;
    } else if (type === PageType.PROCEDURE) {
      return params.proName;
    } else if (type === PageType.SEQUENCE) {
      return params.sequenceName;
    } else if (type === PageType.PACKAGE) {
      return params.packageName;
    } else if (type === PageType.TRIGGER) {
      return params.triggerName;
    } else if (type === PageType.SYNONYM) {
      return params.synonymName;
    } else if (type === PageType.TYPE) {
      return params.typeName;
    } else {
      return true;
    }
  }

  /** New!!!打开一个新page */
  @action
  public async openPage(
    type: PageType = PageType.SQL,
    options: IPageOptions = {},
    pageData: any = {},
    insertHead: boolean = false,
    open: boolean = true,
  ) {
    let { title, key } = options;
    key = key || (await generatePageKey(type, pageData));
    title = title || generatePageTitle(type, key);
    const path = this.generatePagePath();
    const isUnique = this.isUnique(type, pageData);
    const existed = !!this.pages.find((p) => p.key === key);
    switch (type) {
      case PageType.SQL:
      case PageType.PL: {
        if (!existed && !isUnique) {
          const count = this.pages.filter((page) => {
            return page.type == type;
          }).length;
          if (count >= 32) {
            message.error(
              (type == PageType.PL ? 'PL' : 'SQL') +
                formatMessage({
                  id: 'odc.src.store.page.TheNumberOfWindowsCannot',
                }),
            );
            return;
          }
        }
        break;
      }
      default: {
      }
    }

    /** 未打开的page或者未保存的page，则push进pages。 */
    if (!(isUnique && existed)) {
      const newPage = {
        key,
        title,
        type,
        isSaved: true,
        path,
        params: pageData,
      };

      if (insertHead) {
        this.pages = [].concat(newPage).concat(this.pages);
      } else {
        this.pages = this.pages.concat({
          key,
          title,
          type,
          isSaved: true,
          path,
          params: pageData,
        });
      }
    }
    if (open) {
      await this.setActivePageKeyAndPushUrl(key);
    }
    await this.updatePage(key, undefined, pageData);
  }

  /** New!!!更新page */
  @action
  public async updatePage(targetPageKey: string, options: IPageOptions = {}, pageData: any = {}) {
    const { title, isSaved, startSaving, updateKey, updatePath } = options;
    await this.updatePages(async (pages) => {
      const newPages = [];
      for (let i = 0; i < pages.length; i++) {
        const p = { ...pages[i] };
        if (p.key === targetPageKey) {
          // 更新标题
          if (title) {
            p.title = title;
          }

          // 更新参数
          p.params = {
            ...p.params,
            ...pageData,
          };

          // 更新页面状态
          if (isSaved !== undefined) {
            p.isSaved = isSaved;
          }
          // 更新页面状态
          if (startSaving !== undefined) {
            p.startSaving = startSaving;
          }

          // 更新 pageKey
          if (updateKey) {
            p.key = await generatePageKey(p.type, pageData);
            await this.setActivePageKeyAndPushUrl(p.key);
          }

          if (updatePath) {
            p.path = this.generatePagePath();
          }
        }
        newPages.push(p);
      }
      return newPages;
    });
  }

  @action
  public updatePageColor(title: string, isDisabled: boolean) {
    const targetPage = this.pages.find((page: IPage) => page.title === title);
    if (targetPage) {
      this.updatePage(targetPage.key, undefined, {
        isDisabled,
      });
    }
  }

  @action
  public async close(targetPageKey: string) {
    let activeKey = this.activePageKey;
    let lastIndex = -1;
    this.pages.forEach((page, i) => {
      if (page.key === targetPageKey) {
        lastIndex = i - 1;
      }
    });
    const pages = this.pages.filter((page) => page.key !== targetPageKey);
    if (pages.length && activeKey === targetPageKey) {
      activeKey = lastIndex >= 0 ? pages[lastIndex].key : pages[0].key;
    }
    await this.updatePages(async (oldPages) => {
      return pages;
    });
    await this.setActivePageKeyAndPushUrl(activeKey);
  }

  /** 清除全部页面，适用于返回连接列表页完全退出工作台的场景
   *
   * updated: 保留页面的数据，48小时过期
   */
  @action
  public async clear() {
    await this.updatePages(async (pages) => {
      return [];
    });
    await this.updateActiveKey(() => {
      return null;
    });
    // clearTabDataInMetaStore();
    resetPageKey();
  }

  /** 部分常驻页面不应该被清除，也保留SQL和匿名快 */
  @action
  public async clearExceptResidentPages() {
    // 只保留常驻页面
    await this.updatePages(async (pages) => {
      return pages.filter(
        (p) =>
          p.params.isDocked ||
          [PageType.SQL, PageType.OB_CLIENT, PageType.TASKS].includes(p.type) ||
          (p.type == PageType.PL && !p.params?.plName),
      );
    });
    await this.updateActiveKey((pages, activeKey) => {
      return pages[0]?.key;
    });
  }

  @action
  public async save(targetPageKey: string) {
    await this.updatePageByKey(targetPageKey, (oldPage) => {
      return {
        ...oldPage,
        startSaving: false,
        isSaved: true,
      };
    });
  }

  @action
  public startSaving(targetPageKey: string) {
    this.updatePageByKey(targetPageKey, (oldPage) => {
      return {
        ...oldPage,
        startSaving: true,
      };
    });
  }

  @action
  public cancelSaving(targetPageKey: string) {
    this.updatePageByKey(targetPageKey, (oldPage) => {
      return {
        ...oldPage,
        startSaving: false,
      };
    });
  }

  @action
  public setPageUnsaved(targetPageKey: string) {
    this.updatePageByKey(targetPageKey, (oldPage) => {
      return {
        ...oldPage,
        isSaved: false,
      };
    });
  }

  /** 更新单个page */
  private async updatePageByKey(pageKey: string, getNewPage: (oldPage: IPage) => IPage) {
    this.pages = this.pages.map((p, i) => {
      if (p.key === pageKey) {
        return getNewPage(p);
      }
      return p;
    });
    await this.saveDataToMetaStore();
  }

  /** 更新多个page */
  public async updatePages(getNewPages: (oldPages: IPage[]) => Promise<IPage[]>) {
    this.pages = await getNewPages(this.pages);
  }

  /** 更新activeKey */
  private async updateActiveKey(fn: (pages: IPage[], oldActiveKey: any) => any) {
    this.activePageKey = fn(this.pages, this.activePageKey);
    const pageType = this.getPageByKey(this.activePageKey)?.type;
    pageType && tracert.expoPage(pageType);
  }

  private async saveDataToMetaStore() {
    await savePageStoreToMetaStore(this.pages, this.activePageKey);
  }

  public async patchMetaStoreUserId() {
    const userId = login.user?.id;
    if (isNil(userId)) {
      return;
    }
    const result = await getMetaStoreInstance().getAllItem();
    for (const [key, value] of result) {
      if (isNil(value?.userId)) {
        await getMetaStoreInstance().setItem(key, { ...value, userId });
      }
    }
  }

  @action
  public restore(pages: IPage[]) {
    // TODO: 从缓存中恢复全部页面
  }
}

export default new PageStore();
