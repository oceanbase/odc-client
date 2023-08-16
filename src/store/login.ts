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

import { getScriptList as getRemoteScriptList } from '@/common/network';
import { getOrganizationList } from '@/common/network/organization';
import { odcServerLoginUrl, odcServerLogoutUrl } from '@/common/network/other';
import type { IOrganization, ISQLScript, IUser } from '@/d.ts';
import { SpaceType } from '@/d.ts/_index';
import logger from '@/util/logger';
import request from '@/util/request';
import tracert from '@/util/tracert';
import { encrypt, safeParseJson } from '@/util/utils';
import { isNil } from 'lodash';
import { action, observable } from 'mobx';
import { history } from '@umijs/max';
import authStore from './auth';
import setting from './setting';

class ScriptStore {
  @observable
  public scripts: ISQLScript[] = [];

  @action
  public async getScriptList() {
    const fileList = await getRemoteScriptList();
    this.scripts = fileList;
  }
}

export const sessionKey = '$odc_session_organizationKey';

export class UserStore {
  @observable
  public user: Partial<IUser> | null = null;

  @observable
  public isUserFetched: boolean = false;

  @observable
  public isSwitchingOrganization: boolean = false;

  @observable
  public organizations: IOrganization[] = [];

  @observable
  public organizationId: number = null;

  @observable
  public scriptStore: ScriptStore = new ScriptStore();

  @action
  public async getOrganizations() {
    const organizations = await getOrganizationList();
    this.organizations = organizations;
    logger.debug('set organizations', this.organizations?.length);
    return !!organizations;
  }

  public isPrivateSpace() {
    return (
      this.organizations?.find((o) => o.id === this.organizationId)?.type === SpaceType.PRIVATE
    );
  }

  @action
  public async login(params: {
    username?: string;
    password?: string;
    authCode?: string;
    token?: string;
  }): Promise<{
    success: boolean;
    message: string;
    errCode: string;
  }> {
    const { username, password, authCode, token } = params;
    await setting.fetchSystemInfo();
    let result;
    if (token) {
      result = await request.post('/api/v2/bastion/login', {
        data: {
          token,
        },
        params: {
          ignoreError: true,
        },
      });
    } else {
      const form = new URLSearchParams();
      form.append('username', username);
      form.append('password', encrypt(password));
      form.append('verificationCode', authCode);
      form.append('token', token);
      result = await request.post('/api/v2/iam/login', {
        data: form,
        params: {
          ignoreError: true,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    }

    return {
      success: !result?.isError,
      message: result?.errMsg,
      errCode: result?.errCode,
    };
  }

  @action
  public async logout() {
    logger.debug('logout');
    const res = await request.post('/api/v2/iam/logout', {
      params: {
        wantCatchError: true,
      },
    });
    this.user = null;
    this.organizations = [];
    this.organizationId = null;
    this.isSwitchingOrganization = false;
    sessionStorage.removeItem(sessionKey);
    tracert.setUser(null);
    this.scriptStore = new ScriptStore();
    /**
     * 退出登录更新一下配置，刷新一下sso配置
     */
    setting.fetchSystemInfo();
    this.broadcastLogoutMsg();
    return res?.data;
  }
  private LogoutEventKey = 'odc_msg_logout';
  public async broadcastLogoutMsg() {
    window.localStorage.setItem(this.LogoutEventKey, Date.now().toString());
  }

  @action
  public async createUser(user: Partial<IUser>) {
    if (user) {
      user = Object.assign({}, user, { password: encrypt(user.password) });
    }
    const result = await request.post('/api/v1/user/create', {
      data: user,
    });
    return result && result.data;
  }

  @action
  public async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    username?: string;
  }) {
    if (data) {
      data = Object.assign({}, data, {
        newPassword: encrypt(data.newPassword),
        currentPassword: encrypt(data.currentPassword),
      });
    }
    const result = await request.post('/api/v2/iam/users/me/changePassword', {
      data,
    });
    return result && result.data;
  }

  @action
  public async activate(data: { currentPassword: string; newPassword: string; username?: string }) {
    if (data) {
      data = Object.assign({}, data, {
        newPassword: encrypt(data.newPassword),
        currentPassword: encrypt(data.currentPassword),
      });
    }
    const result = await request.post(`/api/v2/iam/users/${data.username}/activate`, {
      data,
    });
    return result && result.data;
  }

  @action
  public async getCurrentUser() {
    const user = await authStore.getCurrentUserPermissions();
    this.isUserFetched = true;
    if (user) {
      this.user = user;
      tracert.setUser(this.user.id);
      await setting.getUserConfig();
      await setting.getSystemConfig();
      this.addLogoutListener();
    }
    return !!user;
  }
  public _logoutListenerExist;
  public addLogoutListener() {
    if (this._logoutListenerExist) {
      return;
    }
    window.addEventListener('storage', (e) => {
      const { key } = e;
      if (key === this.LogoutEventKey) {
        window.close();
      }
    });
    this._logoutListenerExist = true;
  }

  @action
  public async switchCurrentOrganization(id?: number) {
    id = id || this.getDefaultOrganization()?.id;
    if (!id) {
      return false;
    }
    this.isSwitchingOrganization = true;
    this.organizationId = id;
    sessionStorage.setItem(sessionKey, id?.toString());
    this.isUserFetched = false;
    const isSuccess = await this.getCurrentUser();
    this.isSwitchingOrganization = false;
    return isSuccess;
  }

  public getDefaultOrganization() {
    const sessionOrganizationId = parseInt(sessionStorage.getItem(sessionKey));
    const sessionOrganization = this.organizations?.find(
      (item) => item.id === sessionOrganizationId,
    );
    if (sessionOrganization) {
      return sessionOrganization;
    }
    let personalOrganization: IOrganization = this.organizations?.find(
      (item) => item.type === SpaceType.PRIVATE,
    );
    const firstOrganization = this.organizations?.find((item) => item.type === SpaceType.SYNERGY);
    let defaultOrganization = firstOrganization || personalOrganization;
    return defaultOrganization;
  }

  @action
  public async isUserExists(userName: string) {
    const r = await request.get(`/api/v1/user/isUserExists?userName=${userName}`);
    return r && r.data;
  }

  @action
  public async validateUserPassword(user: Partial<IUser>) {
    const r = await request.post('/api/v1/user/userValidate', {
      data: user,
    });
    return r && r.data;
  }

  @action
  public async gotoLoginPageSSO() {
    const r = await request.get(odcServerLoginUrl, {
      params: {
        odc_back_url: location.href,
        notLogin: true,
      },
    });
    if (r.data) {
      window.location.href = r.data;
    } else {
      history.push({
        pathname: '/login',
      });
    }
  }

  @action
  public async gotoLoginPage() {
    this.user = null;
    tracert.setUser(null);
    if (
      !setting.serverSystemInfo?.passwordLoginEnabled &&
      setting.serverSystemInfo?.ssoLoginEnabled
    ) {
      await this.gotoLoginPageSSO();
    } else {
      const searchParamsObj = new URLSearchParams();
      searchParamsObj.append('redirectTo', encodeURIComponent(history.location.pathname));
      history.push({
        pathname: '/login',
        search: searchParamsObj.toString(),
      });
    }
  }

  @action
  public async gotoLogoutPageSSO() {
    const r = await request.get(odcServerLogoutUrl);
    if (r.data) {
      window.location.href = r.data;
    } else {
      history.push({
        pathname: '/login',
      });
    }
  }

  @action
  public async gotoLogoutPage() {
    this.user = null;
    tracert.setUser(null);
    if (
      !setting.serverSystemInfo?.passwordLoginEnabled &&
      setting.serverSystemInfo?.ssoLoginEnabled
    ) {
      this.gotoLogoutPageSSO();
    } else {
      history.push('/login');
    }
  }

  @action
  public haveUserInfo() {
    return !isNil(this?.user?.id);
  }
}

export default new UserStore();
