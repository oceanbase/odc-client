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

import { getServerSystemInfo, getSystemConfig, getPublicKey } from '@/common/network/other';
import type { IUserConfig, ServerSystemInfo } from '@/d.ts';
import odc from '@/plugins/odc';
import { isClient } from '@/util/env';
import request from '@/util/request';
import { initTracert } from '@/util/tracert';
import { message } from 'antd';
import { action, observable } from 'mobx';
import { isLinux, isWin64 } from '@/util/utils';
import login from './login';

export const themeKey = 'odc-theme';

interface IThemeConfig {
  editorTheme: string;
  className: string;
  sheetTheme: string;
  cmdTheme: 'dark' | 'white';
  key: string;
  maskType: 'white' | 'dark';
}

const themeConfig: { [key: string]: IThemeConfig } = {
  'odc-white': {
    key: 'odc-white',
    editorTheme: 'obwhite',
    className: 'odc-white',
    sheetTheme: 'white',
    cmdTheme: 'white',
    maskType: 'white',
  },
  'odc-dark': {
    key: 'odc-dark',
    editorTheme: 'vs-dark',
    className: 'odc-dark',
    sheetTheme: 'dark',
    cmdTheme: 'dark',
    maskType: 'dark',
  },
};
const defaultTheme = 'odc-white';

export class SettingStore {
  @observable
  public collapsed: boolean = true; // sidebar

  @observable
  public siderWidth: number = 260; // sidebar width

  @observable
  public theme: IThemeConfig =
    themeConfig[localStorage.getItem(themeKey)] || themeConfig[defaultTheme];

  /**
   * 是否支持数据的导出，包括下载与结果集导出
   */
  @observable
  public enableDataExport: boolean = false;

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
  public enableAll: boolean = false;

  @observable
  public enableMockdata: boolean = false;

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
  public configurations: IUserConfig = null;

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
    const res = await request.get('/api/v1/users/me/configurations');
    if (res?.data) {
      this.configurations = res?.data?.reduce((data, item) => {
        data[item.key] = item.value;
        return data;
      }, {});
    }
  }

  @action
  public async getSystemConfig() {
    const res = await getSystemConfig();
    const isMacClient = isClient() && !isWin64() && !isLinux();
    const maxResultsetRows =
      parseInt(res?.['odc.session.sql-execute.max-result-set-rows']) || Number.MAX_SAFE_INTEGER;
    const maxSessionCount =
      parseInt(res?.['odc.session.sql-execute.max-single-session-count']) ||
      Number.MAX_SAFE_INTEGER;
    this.enableDataExport = res?.['odc.data.export.enabled'] === 'true' ?? false;
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
    this.enableOSC = res?.['odc.features.task.osc.enabled'] === 'true';
    if (login.isPrivateSpace()) {
      this.enableOSC = res?.['odc.features.task.osc.individual.space.enabled'] === 'true';
    }
    this.isUploadCloudStore = res?.['odc.file.interaction-mode'] === 'CLOUD_STORAGE';
    this.maxSingleTaskRowLimit =
      parseInt(res?.['odc.task.dlm.max-single-task-row-limit']) || Number.MAX_SAFE_INTEGER;
    this.maxSingleTaskDataSizeLimit =
      parseInt(res?.['odc.task.dlm.max-single-task-data-size-limit']) || Number.MAX_SAFE_INTEGER;
  }

  @action
  public async updateUserConfig(newData: IUserConfig) {
    const serverData = Object.keys(newData).map((key) => {
      return {
        key,
        value: newData[key],
      };
    });
    const res = await request.patch('/api/v1/users/me/configurations', {
      data: serverData,
    });
    const data = res?.data;
    if (data) {
      await this.getUserConfig();
    }
    return data;
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
      if (this.serverSystemInfo?.spmEnabled && odc.appConfig.spm.enable) {
        initTracert();
      }
      this.settingLoadStatus = 'done';
    } catch (e) {
      console.error(e);
      this.settingLoadStatus = 'failed';
      message.error(
        formatMessage({
          id: 'odc.src.store.setting.SystemInitializationFailedRefreshAnd',
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
        }), // 系统配置查询失败
      );
    }
    try {
      console.log('server buildTime:', new Date(info.buildTime));
      console.log('server version:', info.version);
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
