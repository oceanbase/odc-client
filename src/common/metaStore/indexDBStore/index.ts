import logger from '@/util/logger';
import { IMetaStore } from '..';

export default class IndexDBStore implements IMetaStore {
  static ODC_DB_KEY = 'odc';
  static ODC_TABLE_KEY = 'odc_table';
  static uniqKey = '_odc_indexdb_primary_key';
  static db: IDBDatabase;
  static openPromise: Promise<IDBDatabase>;
  static async openDB(): Promise<IDBDatabase> {
    if (IndexDBStore.db) {
      return IndexDBStore.db;
    }
    if (IndexDBStore.openPromise) {
      return IndexDBStore.openPromise;
    }
    const openPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open(IndexDBStore.ODC_DB_KEY);
      request.onerror = (error: Event) => {
        logger.error('open indexdb failed ', error);
        reject(error);
      };
      request.onsuccess = (event: Event) => {
        logger.log('[Init metaStore success]');
        IndexDBStore.db = request.result;
        resolve(IndexDBStore.db);
      };
      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IndexDBStore.ODC_TABLE_KEY)) {
          db.createObjectStore(IndexDBStore.ODC_TABLE_KEY, { keyPath: IndexDBStore.uniqKey });
        }
      };
    });
    return openPromise;
  }
  constructor() {
    IndexDBStore.openDB();
  }
  async setItem(key: string, item: any): Promise<boolean> {
    const db = await IndexDBStore.openDB();
    return new Promise((resolve) => {
      const request = db
        .transaction([IndexDBStore.ODC_TABLE_KEY], 'readwrite')
        .objectStore(IndexDBStore.ODC_TABLE_KEY)
        .put({
          [IndexDBStore.uniqKey]: key,
          data: JSON.stringify(item),
        });
      request.onerror = function (error) {
        logger.error('setItem failed ', error);
        resolve(false);
      };
      request.onsuccess = function () {
        resolve(true);
      };
    });
  }
  async getItem(key: string): Promise<any> {
    const db = await IndexDBStore.openDB();
    return new Promise((resolve) => {
      const request = db
        .transaction([IndexDBStore.ODC_TABLE_KEY])
        .objectStore(IndexDBStore.ODC_TABLE_KEY)
        .get(key);
      request.onerror = function (error) {
        logger.error('getItem failed ', error);
        resolve(null);
      };
      request.onsuccess = function () {
        const d = request.result?.data;
        if (typeof d === 'undefined') {
          resolve(null);
          return;
        }
        resolve(JSON.parse(request.result?.data));
      };
    });
  }
  async removeItem(key: string): Promise<boolean> {
    const db = await IndexDBStore.openDB();
    return new Promise((resolve) => {
      const request = db
        .transaction([IndexDBStore.ODC_TABLE_KEY], 'readwrite')
        .objectStore(IndexDBStore.ODC_TABLE_KEY)
        .delete(key);
      request.onerror = function (error) {
        logger.error('removeItem failed ', error);
        resolve(false);
      };
      request.onsuccess = function () {
        resolve(true);
      };
    });
  }
  async clear(): Promise<boolean> {
    const db = await IndexDBStore.openDB();
    return new Promise((resolve) => {
      const request = db
        .transaction([IndexDBStore.ODC_TABLE_KEY], 'readwrite')
        .objectStore(IndexDBStore.ODC_TABLE_KEY)
        .clear();
      request.onerror = function (error) {
        logger.error('clear failed ', error);
        resolve(false);
      };
      request.onsuccess = function () {
        resolve(true);
      };
    });
  }
  async getAllItem(): Promise<any[]> {
    const db = await IndexDBStore.openDB();
    return new Promise((resolve) => {
      const request = db
        .transaction([IndexDBStore.ODC_TABLE_KEY])
        .objectStore(IndexDBStore.ODC_TABLE_KEY)
        .getAll();
      request.onerror = function (error) {
        logger.error('getAllItem failed ', error);
        resolve(null);
      };
      request.onsuccess = function () {
        resolve(
          request.result?.map((res) => {
            return [res[IndexDBStore.uniqKey], JSON.parse(res.data)];
          }),
        );
      };
    });
  }
}
