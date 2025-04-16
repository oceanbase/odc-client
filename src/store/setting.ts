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

import { formatMessage } from '@/util/intl';
/**
 * 样式与功能开关
 */

import { getPublicKey, getServerSystemInfo, getSystemConfig } from '@/common/network/other';
import type { IUserConfig, ServerSystemInfo } from '@/d.ts';
import odc from '@/plugins/odc';
import { isClient } from '@/util/env';
import request from '@/util/request';
import { isLinux, isWin64 } from '@/util/utils';
import { message } from 'antd';
import { action, observable } from 'mobx';
import login, { sessionKey } from '@/store/login';

export const themeKey = 'odc-theme';
const SPACE_CONFIG_EXPIRES = 60 * 1000;
const getCurrentOrganizationId = () => sessionStorage.getItem(sessionKey);

interface IThemeConfig {
  editorTheme: Record<string, string>;
  className: string;
  sheetTheme: string;
  cmdTheme: 'dark' | 'white';
  key: string;
  maskType: 'white' | 'dark';
  chartsTheme: string;
}

export enum EThemeConfigKey {
  ODC_WHITE = 'White',
  ODC_DARK = 'Dark',
}
const themeConfig: { [key: string]: IThemeConfig } = {
  [EThemeConfigKey.ODC_WHITE]: {
    key: EThemeConfigKey.ODC_WHITE,
    editorTheme: {
      VSCode: 'vs',
      OceanBase: 'obwhite',
      'VSCode-HC': 'hc-light',
      GitHub: 'github',
      Monokai: 'vs',
    },
    className: 'odc-white',
    sheetTheme: 'white',
    cmdTheme: 'white',
    maskType: 'white',
    chartsTheme: 'white',
  },
  [EThemeConfigKey.ODC_DARK]: {
    key: EThemeConfigKey.ODC_DARK,
    editorTheme: {
      VSCode: 'vs-dark',
      OceanBase: 'obdark',
      'VSCode-HC': 'hc-black',
      GitHub: 'githubDark',
      Monokai: 'monokai',
    },
    className: 'odc-dark',
    sheetTheme: 'dark',
    cmdTheme: 'dark',
    maskType: 'dark',
    chartsTheme: 'dark',
  },
};
const defaultTheme = EThemeConfigKey.ODC_WHITE;

export class SettingStore {
  @observable
  public collapsed: boolean = true; // sidebar

  @observable
  public siderWidth: number = 260; // sidebar width

  @observable
  public theme: IThemeConfig = themeConfig[defaultTheme];

  /**
   * 是否支持数据的导出，包括下载与结果集导出
   */
  @observable
  public enableDataExport: boolean = false;

  /**
   * 多库变更
   */
  @observable
  public enableMultipleAsyncTask: boolean = false;

  /**
   * 影子表同步
   */
  @observable
  public enableShadowTableSync: boolean = false;

  /**
   * 结构对比
   */
  public enableStructureCompare: boolean = false;

  public cacheStorage = new Map();
  /**
   * SQL 计划
   */
  public enableSQLPlan: boolean = false;

  /**
   * 分区计划
   */
  public enablePartitionPlan: boolean = false;

  /**
   * 数据归档
   */
  public enableDataArchive: boolean = false;

  /**
   * 数据清理
   */
  public enableDataClear: boolean = false;

  /**
   * 申请库权限
   */
  public enableApplyDBAuth: boolean = false;

  /**
   * 申请项目权限
   */
  public enableApplyProjectAuth: boolean = false;

  /**
   * 申请表权限
   */
  public enableApplyTableAuth: boolean = false;

  @observable
  public enableAsyncTask: boolean = false;

  @observable
  public enableDBImport: boolean = false;

  @observable
  public enableAuthRule: boolean = false;

  @observable
  public enableDBExport: boolean = false;

  @observable
  public enableOSC: boolean = false;

  @observable
  public enableOSCLimiting: boolean = false;

  @observable
  public enableAll: boolean = false;

  @observable
  public enableMockdata: boolean = false;

  @observable
  public enableLogicaldatabase: boolean = false;

  /**
   * 上传文件是否为oss，s3之类的云存储
   */
  @observable
  public isUploadCloudStore: boolean = false;

  /**
   * obclient
   */
  @observable
  public enableOBClient: boolean = false;

  /**
   * personal record
   */
  @observable
  public enablePersonalRecord: boolean = false;

  /**
   * 新功能提示
   */
  @observable
  public enableVersionTip: boolean = true;

  /**
   * 结果集最大条数,-1表示不限制
   */
  @observable
  public maxResultSetRows: number = Number.MAX_SAFE_INTEGER;

  /**
   * 工单（数据归档 & 数据清理）行限流最大值
   */
  @observable
  public maxSingleTaskRowLimit: number = Number.MAX_SAFE_INTEGER;

  /**
   * 工单（数据归档 & 数据清理）数据限流最大值
   */
  @observable
  public maxSingleTaskDataSizeLimit: number = Number.MAX_SAFE_INTEGER;

  /**
   * 独立session最大数量
   */
  @observable
  public maxSessionCount: number = Number.MAX_SAFE_INTEGER;

  /**
   * 服务端配置信息
   */
  @observable.shallow
  public serverSystemInfo: ServerSystemInfo = null;

  /**
   * 非对称加密的公钥
   */
  @observable
  public encryptionPublicKey: string = null;

  /**
   * 系统配置是否初始化完毕
   */
  @observable
  public settingLoadStatus: 'init' | 'loading' | 'done' | 'failed' = 'init';

  @observable
  public configurations: Partial<IUserConfig> = null;

  @observable
  public headerStyle: any = {
    background: '#1F293D',
    boxShadow: '0px 1px 4px 0px rgba(0,21,41,0.12)',
  };

  @action
  public setHeaderStyle(headerStyle: any) {
    this.headerStyle = headerStyle;
  }

  @action
  public setTheme(theme: string) {
    const newTheme = themeConfig[theme] || themeConfig[defaultTheme];
    this.theme = newTheme;
    localStorage.setItem(themeKey, themeConfig[theme] ? theme : defaultTheme);
  }

  @action
  public setSpaceConfig(config: Partial<IUserConfig>) {
    const cacheData = {
      data: config,
      timestamp: Date.now(),
      organizationId: getCurrentOrganizationId(),
    };
    localStorage.setItem(`cached-${getCurrentOrganizationId()}`, JSON.stringify(cacheData));
    this.cacheStorage.set(`cached-${getCurrentOrganizationId()}`, true);
  }

  @action
  public clearSpaceConfig() {
    localStorage.removeItem(`cached-${getCurrentOrganizationId()}`);
    this.cacheStorage.set(`cached-${getCurrentOrganizationId()}`, false);
  }

  @action
  public readCachedSpaceConfig() {
    const storageSpaceConfigurations = localStorage.getItem(`cached-${getCurrentOrganizationId()}`);
    const { data, timestamp, organizationId } = JSON.parse(storageSpaceConfigurations) || {};

    const cached = organizationId === getCurrentOrganizationId();
    const sessionExist = this.cacheStorage.get(`cached-${getCurrentOrganizationId()}`);

    if (cached && sessionExist) {
      try {
        if (Date.now() - timestamp < SPACE_CONFIG_EXPIRES) {
          return data;
        }
      } catch (error) {
        console.error('Failed to parse cached spaceConfig:', error);
      }
    }
    return null;
  }

  @action
  public hideHeader() {
    this.headerStyle = {
      ...this.headerStyle,
      display: 'none',
    };
  }

  @action
  public showHeader() {
    this.headerStyle = {
      ...this.headerStyle,
      display: 'display',
    };
  }

  @action
  public toggleCollapsed() {
    this.collapsed = !this.collapsed;
  }

  @action
  public setSiderWidth(width: number) {
    this.siderWidth = width;
  }

  @action
  public async getUserConfig() {
    const res = await request.get('/api/v2/config/users/me/configurations');
    if (res?.data) {
      const config = res?.data?.contents?.reduce((data, item) => {
        data[item.key] = item.value;
        return data;
      }, {});
      this.configurations = config;
      this.theme = themeConfig[this.configurations['odc.appearance.scheme']];
    } else {
      this.configurations = {};
    }
  }

  @action
  public async getSpaceConfig() {
    const cachedSpaceConfig = this.readCachedSpaceConfig();
    if (cachedSpaceConfig) return cachedSpaceConfig;

    const res = await request.get('/api/v2/config/organization/configurations');
    if (res?.data) {
      const config = res?.data?.contents?.reduce((data, item) => {
        data[item.key] = item.value;
        return data;
      }, {});

      this.setSpaceConfig(config);

      return config;
    } else {
      this.clearSpaceConfig();
    }
  }

  @action
  public getSpaceConfigByKey(key: string) {
    const storageSpaceConfigurations = localStorage.getItem(`cached-${getCurrentOrganizationId()}`);
    const { data } = JSON.parse(storageSpaceConfigurations) || {};
    return data?.[key] || undefined;
  }

  @action
  public async getSystemConfig() {
    const res = await getSystemConfig();
    const isMacClient = isClient() && !isWin64() && !isLinux();
    const isPrivateSpace = login.isPrivateSpace();
    const maxResultsetRows =
      parseInt(res?.['odc.session.sql-execute.max-result-set-rows']) || Number.MAX_SAFE_INTEGER;
    const maxSessionCount =
      parseInt(res?.['odc.session.sql-execute.max-single-session-count']) ||
      Number.MAX_SAFE_INTEGER;
    this.enableDataExport = res?.['odc.data.export.enabled'] === 'true' || false;
    this.enableOBClient = res?.['odc.features.obclient.enabled'] === 'true' && !isMacClient;
    this.maxResultSetRows = maxResultsetRows === -1 ? Number.MAX_SAFE_INTEGER : maxResultsetRows;
    this.maxSessionCount = maxSessionCount === -1 ? Number.MAX_SAFE_INTEGER : maxSessionCount;
    this.enableVersionTip =
      !isClient() && res?.['odc.features.show-new-features.enabled'] === 'true';
    this.enablePersonalRecord = res?.['odc.features.personal-audit.enabled'] === 'true';
    this.enableAsyncTask = res?.['odc.features.task.async.enabled'] === 'true';
    this.enableDBImport = res?.['odc.features.task.import.enabled'] === 'true';
    this.enableAuthRule = res?.['odc.automatic-auth-rule.enabled'] === 'true';
    this.enableDBExport =
      res?.['odc.features.task.export.enabled'] === 'true' && this.enableDataExport;
    this.enableMockdata = res?.['odc.features.task.mockdata.enabled'] === 'true';
    this.enableLogicaldatabase = res?.['odc.features.logicaldatabase.enabled'] === 'true';
    this.enableOSC = res?.['odc.features.task.osc.enabled'] === 'true';
    if (isPrivateSpace) {
      this.enableOSC = res?.['odc.features.task.osc.individual.space.enabled'] === 'true';
    }
    this.enableOSCLimiting = res?.['odc.osc.rate-limit.enabled'] === 'true';
    this.isUploadCloudStore = res?.['odc.file.interaction-mode'] === 'CLOUD_STORAGE';
    this.maxSingleTaskRowLimit =
      parseInt(res?.['odc.task.dlm.max-single-task-row-limit']) || Number.MAX_SAFE_INTEGER;
    this.maxSingleTaskDataSizeLimit =
      parseInt(res?.['odc.task.dlm.max-single-task-data-size-limit']) || Number.MAX_SAFE_INTEGER;

    this.enableMultipleAsyncTask =
      res?.['odc.features.task.multiple-async.enabled'] === 'true' && !isPrivateSpace;
    this.enableShadowTableSync = res?.['odc.features.task.shadowtable-sync.enabled'] === 'true';
    this.enableStructureCompare =
      res?.['odc.features.task.structure-comparison.enabled'] === 'true';
    this.enableSQLPlan = res?.['odc.features.task.sql-plan.enabled'] === 'true' && !isClient();
    this.enablePartitionPlan =
      res?.['odc.features.task.partition-plan.enabled'] === 'true' && !isClient();
    this.enableDataArchive =
      res?.['odc.features.task.data-archive.enabled'] === 'true' && !isClient();
    this.enableDataClear = res?.['odc.features.task.data-delete.enabled'] === 'true' && !isClient();
    this.enableApplyDBAuth =
      res?.['odc.features.task.apply-database-permission.enabled'] === 'true' && !isPrivateSpace;
    this.enableApplyProjectAuth =
      res?.['odc.features.task.apply-project-permission.enabled'] === 'true' && !isPrivateSpace;
    this.enableApplyTableAuth =
      res?.['odc.features.task.apply-table-permission.enabled'] === 'true' && !isPrivateSpace;
  }

  @action
  public async updateUserConfig(newData: IUserConfig) {
    const serverData = Object.keys(newData).map((key) => {
      return {
        key,
        value: newData[key],
      };
    });
    const res = await request.patch('/api/v2/config/users/me/configurations', {
      data: serverData,
    });
    const data = res?.data?.contents;
    if (data) {
      await this.getUserConfig();
    }
    return !!data;
  }

  @action
  public async updateSpaceConfig(newData: IUserConfig) {
    const serverData = Object.keys(newData).map((key) => {
      return {
        key,
        value: newData[key],
      };
    });

    const res = await request.patch('/api/v2/config/organization/configurations', {
      data: serverData,
    });
    const data = res?.data?.contents;
    if (data) {
      this.setSpaceConfig(newData);
    }
    return !!data;
  }

  @action
  public async resetSpaceConfig() {
    const res = await request.get('/api/v2/config/organization/default/configurations');
    const data = res?.data?.contents;
    if (data) {
      const res = await request.patch('/api/v2/config/organization/configurations', {
        data,
      });
      const userConfig = res?.data?.contents;
      if (userConfig) {
        await this.getSpaceConfig();
      }
    }
    return !!data;
  }

  public async updateOneUserConfig(params: { key: string; value: string | boolean }) {
    const res = await request.put(`/api/v2/config/users/me/configurations/${params.key}`, {
      data: params,
    });
  }

  @action
  public async resetUserConfig() {
    const res = await request.get('/api/v2/config/users/default/configurations');
    const data = res?.data?.contents;
    if (data) {
      const res = await request.patch('/api/v2/config/users/me/configurations', {
        data,
      });
      const userConfig = res?.data?.contents;
      if (userConfig) {
        await this.getUserConfig();
      }
    }
    return !!data;
  }

  @action
  public async initSetting() {
    // todo
    if (odc.appConfig.systemConfig.default) {
      this.serverSystemInfo = {
        buildTime: 11,
        startTime: 22,
        version: '2.1',
      };
    }
    try {
      this.settingLoadStatus = 'loading';
      await this.fetchSystemInfo();
      await this.getPublicKeyData();

      this.settingLoadStatus = 'done';
    } catch (e) {
      console.error(e);
      this.settingLoadStatus = 'failed';
      message.error(
        formatMessage({
          id: 'odc.src.store.setting.SystemInitializationFailedRefreshAnd',
          defaultMessage: '系统初始化失败，请刷新重试！',
        }), // 系统初始化失败，请刷新重试！
      );
    }
  }

  @action
  public async fetchSystemInfo() {
    const info = await getServerSystemInfo();
    if (!info) {
      throw new Error(
        formatMessage({
          id: 'odc.src.store.setting.SystemConfigurationQueryFailed',
          defaultMessage: '系统配置查询失败',
        }),
      ); // 系统配置查询失败
    }
    try {
      console.log('server buildTime:', new Date(info.buildTime));
      console.log('server version:', info.version);
      console.log('odc version:', ODC_VERSION);
    } catch (e) {}
    this.serverSystemInfo = info;
  }

  @action
  public async getPublicKeyData() {
    const res = await getPublicKey();
    this.encryptionPublicKey = res;
  }
}

export default new SettingStore();
