import { action, observable } from 'mobx';

const GUIDE_CACHE_KEY = 'GUIDE_CACHE_KEY';

export const guideCacheMap = {
  executePlan: 'executePlan',
};

export class GuideCacheStore {
  public cacheEnum = guideCacheMap;

  @observable
  public executePlan = this.getDataByKey(guideCacheMap.executePlan);

  public serialization(data: Record<any, any>) {
    return JSON.stringify(data);
  }

  public deserialize(data: string) {
    return JSON.parse(data);
  }

  public getData() {
    const data = localStorage.getItem(GUIDE_CACHE_KEY);
    return this.deserialize(data);
  }

  public setData(v) {
    localStorage.setItem(GUIDE_CACHE_KEY, this.serialization(v));
  }

  public getDataByKey(key: string) {
    const storageContent = this.getData();
    return storageContent?.includes(key);
  }

  @action
  public setDataByKey(key: string) {
    let storageContent = this.getData() || [];
    if (!storageContent.includes(key)) {
      this.setData(storageContent ? [...storageContent, key] : [key]);
    }
    this[key] = true;
  }
}

export default new GuideCacheStore();
