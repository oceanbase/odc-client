import { getMetaStoreInstance } from '@/common/metaStore';
import login from '@/store/login';
import { isNil, throttle } from 'lodash';
import { IReactionDisposer, reaction } from 'mobx';

function getOrganizationKey() {
  const userId = login?.user?.id;
  const organizationId = login?.user?.organizationId;
  return organizationId ? `${userId}-organization-${organizationId}` : null;
}

/**
 * 更新数据的缓存，用来批量更新数据提高性能，同时避免异步读写导致的数据覆盖问题。
 */
const modifyCache = new Map<string, any>();

const saveToDB = throttle(async function () {
  console.log('save to db');
  for (let [key, value] of modifyCache.entries()) {
    const oldData = (await getMetaStoreInstance().getItem(key)) || {};
    await getMetaStoreInstance().setItem(key, {
      ...oldData,
      ...value,
    });
    modifyCache.delete(key);
  }
}, 500);

async function updateDB(key, value, propertyDBKey) {
  console.log('update to db');
  let cacheValue = modifyCache.get(key);
  if (!cacheValue) {
    cacheValue = {};
  }
  cacheValue = {
    ...cacheValue,
    [propertyDBKey]: value,
  };
  modifyCache.set(key, cacheValue);
  saveToDB();
}

export async function autoSave(
  obj: any,
  property: string,
  propertyDBKey: string,
  defaultValue: any,
) {
  let timer;
  let mobxDisposer: IReactionDisposer;
  async function reset() {
    console.log('register meta sync');
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (mobxDisposer) {
      mobxDisposer();
      mobxDisposer = null;
    }
    /**
     * 先同步db到内存中
     */
    const key = getOrganizationKey();
    let data: any = defaultValue;
    if (!key) {
      /**
       * 组织不存在的情况下，无法定位到db，停止同步。
       */
      obj[property] = data;
      return;
    }
    const dbValue = (await (await getMetaStoreInstance()).getItem(key))?.[propertyDBKey];
    if (isNil(dbValue)) {
      data = defaultValue;
    } else {
      data = dbValue;
    }
    obj[property] = data;

    /**
     * 同步完成之后，监听数据的变化，数据变化之后，执行更新逻辑
     */
    console.log('add reaction');
    mobxDisposer = reaction(
      () => obj[property],
      () => {
        updateDB(key, obj[property], propertyDBKey);
      },
    );
    return;
  }

  reaction(
    () => getOrganizationKey(),
    () => {
      reset();
    },
  );
  reset();
}
