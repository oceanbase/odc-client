import { useEffect, useMemo, useRef, useState } from 'react';
import type { LineData, LogData, LogValue, SafeLine, SearchedLine } from './typings';
import { encodeRegexpStr, formatSafeData, range } from './utils';

const defaultStyle = {
  'min-height': '22px',
};

export const useHeight = (ref: React.MutableRefObject<HTMLDivElement | null>) => {
  const calcElem = useRef<HTMLSpanElement>();
  /** 解决空行问题，创建行号的DOM */
  const lineElem = useRef<HTMLSpanElement>();

  const init = () => {
    const outerElem = document.createElement('div');
    const element = document.createElement('div');
    outerElem.style.visibility = 'hidden';
    outerElem.style.overflow = 'hidden';
    outerElem.style.display = 'flex';
    outerElem.style.opacity = '0';
    element.style.height = '0';
    element.style.paddingLeft = '8px';
    element.style.paddingRight = '17px';
    element.appendChild(outerElem);

    const newStyle = { ...defaultStyle };

    (ref.current as HTMLDivElement).appendChild(element);
    calcElem.current = document.createElement('span');
    lineElem.current = document.createElement('span');
    /** css 与 真实dom 保持一致 */
    (lineElem.current as HTMLSpanElement).style.minWidth = '30px';
    (lineElem.current as HTMLSpanElement).style.marginRight = '12px';
    (lineElem.current as HTMLSpanElement).style.display = 'inline-block';
    (calcElem.current as HTMLSpanElement).style.flex = '1';
    (calcElem.current as HTMLSpanElement).style.paddingRight = '16px';
    (calcElem.current as HTMLSpanElement).style.wordBreak = 'break-all';
    (calcElem.current as HTMLSpanElement).style.wordWrap = 'anywhere';
    Object.keys(newStyle).forEach((attr) => {
      (calcElem.current as HTMLSpanElement).style[attr] = newStyle[attr];
    });
    outerElem.appendChild(lineElem.current);
    outerElem.appendChild(calcElem.current);
  };

  useEffect(() => {
    return () => {
      const outerElem: HTMLElement = (calcElem.current as HTMLSpanElement)
        ?.parentElement as HTMLSpanElement;
      outerElem?.remove();
    };
  }, []);

  return (str: string, rowIndex: number) => {
    if (!calcElem.current) {
      init();
    }
    (lineElem.current as HTMLSpanElement).innerText = `${rowIndex}`;
    (calcElem.current as HTMLSpanElement).innerText = str;
    return (calcElem.current as HTMLSpanElement).getBoundingClientRect().height;
  };
};

/**
 * 算法思路与原理参照下面的文档
 * @param dataList
 * @param keyword
 */
export const useLazyLogData = (
  dataList: LogValue,
  keyword: string,
  ignoreCase: boolean,
): LogData => {
  const [lazyCacheData, setLazyCacheData] = useState<LogData>({
    foundCount: 0,
    data: [],
    searchResultIndexList: [],
    searchResultMap: {},
  });
  const regex = RegExp(`${encodeRegexpStr(keyword)}`, `${ignoreCase ? 'ig' : 'g'}`);

  const intervalRef = useRef(-1);

  const safeData = useMemo(() => {
    return formatSafeData(dataList);
  }, [dataList]);

  const formatSliceData = (sliceData: SafeLine[], index: number, cursor: number) => {
    let data: SearchedLine[];
    let foundCount = 0;
    let searchResultIndexList = [];
    const searchResultMap = {};
    let innerIndex = index;

    if (keyword) {
      data = sliceData.map((item, itemIndex) => {
        const textArr = item.content.split(regex);
        const keywords = item.content.match(regex);
        const searchCount = textArr.length - 1;

        const result: SearchedLine = {
          rowIndex: item.rowIndex,
          content: item.content,
          brokenMark: item.brokenMark,
        };
        if (searchCount > 0) {
          const indexArr = range(innerIndex, searchCount);
          foundCount += searchCount;
          innerIndex += indexArr.length;
          searchResultMap[item.rowIndex] = indexArr;
          searchResultIndexList = searchResultIndexList.concat(
            Array(indexArr.length).fill(itemIndex + cursor),
          );
          result.textArr = textArr;
          result.keywords = keywords;
        }
        return result;
      });
    } else {
      data = sliceData.map((item) => {
        return {
          rowIndex: item.rowIndex,
          content: item.content,
          brokenMark: item.brokenMark,
        };
      });
    }

    return {
      data,
      foundCount,
      searchResultIndexList,
      searchResultMap,
      index: innerIndex,
    };
  };

  useEffect(() => {
    clearTimeout(intervalRef.current);
    const initData = {
      foundCount: 0,
      data: [],
      searchResultIndexList: [],
      searchResultMap: {},
    };

    let index = 0;
    let cursor = 0;
    const maxIndex = safeData.length; // 不减1,是因为他作为 slice第二个参数

    const SLICE_SIZE = 5000;

    const lazy = () => {
      const endIndex = Math.min(maxIndex, cursor + SLICE_SIZE);
      const subDataList = safeData.slice(cursor, endIndex) as LineData[];
      const subCacheData = formatSliceData(subDataList, index, cursor);
      index = subCacheData.index;

      initData.data = initData.data.concat(subCacheData.data);
      initData.foundCount += subCacheData.foundCount;
      initData.searchResultIndexList = initData.searchResultIndexList.concat(
        subCacheData.searchResultIndexList,
      );
      Object.assign(initData.searchResultMap, subCacheData.searchResultMap);

      setLazyCacheData({ ...initData });
      cursor = endIndex;
      if (cursor < maxIndex) {
        intervalRef.current = window.setTimeout(lazy, 16);
      }
    };
    lazy();
  }, [safeData, keyword]);

  return lazyCacheData;
};
