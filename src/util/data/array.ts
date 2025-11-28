/**
 * https://tc39.es/proposal-array-grouping/#sec-object.groupby
 * @param array object array => [{ level: 1, name: 'test1'}, { level: 1, name: 'test2'}, { level: 3, name: 'test3'}]
 * @param property object key => 'level'
 * @returns group by object key
 * @example groupByPropertyName([{ level: 1, name: 'test1'}, { level: 1, name: 'test2'}, { level: 3, name: 'test3'}], 'level')
 * @example return { 1: [{ level: 1, name: 'test1'}, { level: 1, name: 'test2'}], 3: [{ level: 3, name: 'test3'}]}
 */
export function groupByPropertyName(array: any[], property: string): Object {
  if (!Array.isArray(array)) {
    return {};
  }
  return array?.reduce((group, cur) => {
    group[cur[property]] ??= [];
    group?.[cur?.[property]].push(cur);
    return group;
  }, {});
}

export function groupBySessionId(filteredRows) {
  const sessionMap = new Map();

  filteredRows.forEach((row) => {
    const sessionId = row?.sessionId;

    if (!sessionMap.has(sessionId)) {
      sessionMap.set(sessionId, {
        ...row,
        children: [],
      });
    } else {
      const existingEntry = sessionMap.get(sessionId);

      if (row.status === 'ACTIVE' && existingEntry.status !== 'ACTIVE') {
        sessionMap.set(sessionId, {
          ...row,
          children: [existingEntry, ...existingEntry.children],
        });
        delete existingEntry.children;
      } else {
        existingEntry?.children?.push(row);
      }
    }
  });

  const cleanedSessions = Array.from(sessionMap.values()).map((entry) => {
    if (entry.children && entry.children.length === 0) {
      delete entry.children;
    }
    return entry;
  });

  return cleanedSessions;
}

/** 根据Key去重数组 */
export const uniqueTools = (tools) => {
  return Array.from(new Map(tools.map((obj) => [obj.key, obj])).values());
};

export const flatArray = (array: any[]): any[] => {
  return array?.reduce?.((pre, cur) => pre?.concat(Array.isArray(cur) ? flatArray(cur) : cur), []);
};

/**
 * 根据保存的键顺序对数组进行排序
 * 已保存的项按照保存的顺序排列在前面，新增的项排列在后面
 *
 * @param items 需要排序的数组
 * @param savedOrder 保存的键顺序数组
 * @param keyExtractor 从数组项提取键的函数，默认提取 key 属性
 * @returns 排序后的新数组（不修改原数组）
 *
 * @example
 * const items = [{ key: 'a' }, { key: 'b' }, { key: 'c' }, { key: 'd' }];
 * const savedOrder = ['c', 'a'];
 * const sorted = sortByPreservedOrder(items, savedOrder);
 * // 结果: [{ key: 'c' }, { key: 'a' }, { key: 'b' }, { key: 'd' }]
 * // 'c' 和 'a' 按保存的顺序排在前面，'b' 和 'd' 作为新增项排在后面
 */
export function sortByPreservedOrder<T>(
  items: T[],
  savedOrder: React.Key[],
  keyExtractor: (item: T) => React.Key = (item: any) => item.key,
): T[] {
  return items.slice().sort((a, b) => {
    const aIndex = savedOrder.indexOf(keyExtractor(a));
    const bIndex = savedOrder.indexOf(keyExtractor(b));

    // Both items are in saved order, sort by saved order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    // Only a is in saved order, a comes first
    if (aIndex !== -1) {
      return -1;
    }

    // Only b is in saved order, b comes first
    if (bIndex !== -1) {
      return 1;
    }

    // Both are new items, maintain original order
    return 0;
  });
}
