import IndexDBStore from './indexDBStore';

export interface IMetaStore {
  setItem(key: string, item: any): Promise<boolean>;
  getItem(key: string): Promise<any>;
  removeItem(key: string): Promise<boolean>;
  clear(): Promise<boolean>;
  getAllItem(): Promise<any[]>;
}
let ins: {
  metaStore: IMetaStore;
} = {
  metaStore: null,
};

export async function initMetaStore() {
  if (!ins.metaStore) {
    ins.metaStore = new IndexDBStore();
  }
}

export function getMetaStoreInstance() {
  return ins.metaStore;
}

export default ins;
