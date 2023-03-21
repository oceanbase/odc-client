import { generateUniqKey } from '@/util/utils';
import { action, observable } from 'mobx';

export class CommonStore {
  @observable
  public tabKey: string; // sidebar

  @action
  public updateTabKey(isDirect?: boolean) {
    this.tabKey = this.generateNewTabKey(isDirect);
  }

  public isDirectTab() {
    return this.tabKey.indexOf('directTab') > -1;
  }

  @action
  public clearTabKey() {
    this.tabKey = null;
  }

  @action
  public setTabKey(tabKey: string) {
    this.tabKey = tabKey;
  }

  public generateNewTabKey(isDirect?: boolean) {
    return generateUniqKey(isDirect ? 'directTab' : 'tab');
  }
}

export default new CommonStore();
