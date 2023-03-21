import { formatMessage } from '@/util/intl';
/**
 * 样式与功能开关
 */

import { getServerSystemInfo, getSystemConfig } from '@/common/network/other';
import type { IUserConfig, ServerSystemInfo } from '@/d.ts';
import { SQLSessionMode } from '@/d.ts';
import { message } from 'antd';
import { action, observable } from 'mobx';

import appConfig from '@/constant/appConfig';
import request from '@/util/request';
import pkg from '../../package.json';

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
    editorTheme: 'ob-grey',
    className: 'odc-white',
    sheetTheme: 'white',
    cmdTheme: 'white',
    maskType: 'white',
  },
  'odc-dark': {
    key: 'odc-dark',
    editorTheme: 'ob-dark',
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

  @observable
  public enableMultiSession: boolean = false;

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
      this.enableMultiSession =
        this.configurations['connect.sessionMode'] === SQLSessionMode.MultiSession;
    }
  }

  @action
  public async getSystemConfig() {
    const res = await getSystemConfig();
    const maxResultsetRows =
      parseInt(res?.['odc.session.sql-execute.max-result-set-rows']) || Number.MAX_SAFE_INTEGER;
    const maxSessionCount =
      parseInt(res?.['odc.session.sql-execute.max-single-session-count']) ||
      Number.MAX_SAFE_INTEGER;
    this.enableDataExport = res?.['odc.data.export.enabled'] === 'true' ?? false;
    this.enableOBClient = res?.['odc.features.obclient.enabled'] === 'true';
    this.maxResultSetRows = maxResultsetRows === -1 ? Number.MAX_SAFE_INTEGER : maxResultsetRows;
    this.maxSessionCount = maxSessionCount === -1 ? Number.MAX_SAFE_INTEGER : maxSessionCount;
    this.enableVersionTip = res?.['odc.features.show-new-features.enabled'] === 'true';
    this.enablePersonalRecord = res?.['odc.features.personal-audit.enabled'] === 'true';
    this.enableAsyncTask = res?.['odc.features.task.async.enabled'] === 'true';
    this.enableDBImport = res?.['odc.features.task.import.enabled'] === 'true';
    this.enableAuthRule = res?.['odc.automatic-auth-rule.enabled'] === 'true';
    this.enableDBExport =
      res?.['odc.features.task.export.enabled'] === 'true' && this.enableDataExport;
    this.enableMockdata = res?.['odc.features.task.mockdata.enabled'] === 'true';
    this.isUploadCloudStore = res?.['odc.file.interaction-mode'] === 'CLOUD_STORAGE';
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
    if (appConfig.systemConfig.default) {
      this.serverSystemInfo = {
        buildTime: 11,
        startTime: 22,
        version: '2.1',
      };
    }
    try {
      this.settingLoadStatus = 'loading';
      await this.fetchSystemInfo();
      if (this.serverSystemInfo?.spmEnabled && appConfig.spm.enable) {
        const Tracert = (await import('@alipay/tracert/lib/starter'))?.default;
        window.Tracert.start({
          mdata: {
            version: pkg.version,
          },
          roleId: null,
          debug: process?.env?.NODE_ENV === 'development',
        });
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
}

export default new SettingStore();
