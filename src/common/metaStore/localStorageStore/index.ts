import store from 'store';
import expirePlugin from 'store/plugins/expire';
import { IMetaStore } from '..';

store.addPlugin(expirePlugin);

export default class LocalStorageStore implements IMetaStore {
  async setItem(key: string, item: any): Promise<boolean> {
    store.set(key, item);
    return true;
  }
  async getItem(key: string): Promise<any> {
    store.removeExpiredKeys();
    return store.get(key);
  }
  async removeItem(key: string): Promise<boolean> {
    store.remove(key);
    return true;
  }
  async clear(): Promise<boolean> {
    store.each((v, key) => {
      if (['umi_locale'].includes(key)) {
        return;
      }
      this.removeItem(key);
    });
    return true;
  }
  async getAllItem(): Promise<any[]> {
    const arr = [];
    store.each((value, key) => {
      arr.push([key, value]);
    });
    return arr;
  }
}
