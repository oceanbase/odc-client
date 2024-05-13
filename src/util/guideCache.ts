const GUIDE_CACHE_KEY = 'GUIDE_CACHE_KEY';

const GUIDE_CACHE_MAP = {
  EXECUTE_PLAN: 'EXECUTE_PLAN',
};

function getGuideCacheByKey(cacheKey: string) {
  // 从 localStorage 获取 myStorage 的值
  const storageContent = getGuideCacheAll();

  const cacheList = storageContent.split(';');
  cacheList.pop();
  let result;
  cacheList.forEach((i) => {
    const [key, value] = i.split(':');
    if (cacheKey === key && value) {
      result = true;
    }
  });
  return result;
}

function getGuideCacheAll() {
  return localStorage.getItem(GUIDE_CACHE_KEY) || '';
}

function setGuideCache(key: string, clicked?: undefined | 1) {
  let storageContent = getGuideCacheAll();
  let updated = false;

  // 正则表达式，匹配key后面跟随的任何字符直到分号
  const regex = new RegExp(key + ':[^;]*;', 'g');

  // 如果已存在相同的key，则更新它的value
  storageContent = storageContent.replace(regex, (match) => {
    updated = true;
    return `${key}:${clicked};`;
  });

  // 如果不存在相同的key，则添加新键值对
  if (!updated) {
    storageContent += `${key}:${clicked};`;
  }

  // 存储更新后的字符串
  localStorage.setItem(GUIDE_CACHE_KEY, storageContent);
}

export default { getGuideCacheByKey, setGuideCache, GUIDE_CACHE_KEY, GUIDE_CACHE_MAP };
