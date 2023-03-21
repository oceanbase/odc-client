import login from '@/store/login';
import { safeParseJson } from '@/util/utils';

import pkg from '../../package.json';

const currentVersion = pkg.version;

interface LocalLoginHistoryData {
  version: string;
}

class localLoginHistory {
  private getKey() {
    return login.user?.id + '-localHistory';
  }
  private getMetaData(): LocalLoginHistoryData {
    return safeParseJson(localStorage.getItem(this.getKey()), {}) || {};
  }
  private setMetaData(data: Partial<LocalLoginHistoryData>) {
    const oldData = this.getMetaData();
    localStorage.setItem(this.getKey(), JSON.stringify(Object.assign(oldData, data)));
  }
  public getLastLoginVersion() {
    return this.getMetaData().version;
  }
  public isNewVersion() {
    return this.getLastLoginVersion() !== currentVersion;
  }
  public isNewUser() {
    return !this.getLastLoginVersion();
  }
  public registerUser() {
    this.setMetaData({ version: '1' });
  }
  public updateVersion() {
    this.setMetaData({ version: currentVersion });
  }
}

export default new localLoginHistory();
