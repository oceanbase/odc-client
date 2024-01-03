/*
 * Copyright 2024 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { LogValue, SafeLine } from './typings';

export const range = (start: number, count: number) => {
  const arr = [];
  for (let i = 0; i < count; i += 1) {
    arr.push(start + i);
  }
  return arr;
};

export const formatSafeData = (logValue: LogValue): SafeLine[] => {
  const data: SafeLine[] = [];
  if (logValue.length === 0) {
    return data;
  }

  let dataList;

  if (typeof logValue === 'string') {
    // string => string[]
    dataList = logValue.split('\n');
  } else {
    // string[] || ListProps
    dataList = logValue;
  }

  // string[] 直接格式化后 return
  if (typeof dataList[0] === 'string') {
    return (dataList as string[]).map((str, index) => ({
      rowIndex: index + 1,
      content: str,
    }));
  }

  // 处理带有隔行的数据，添加固定值，再根据此判断
  for (let i = 0; i < dataList.length - 1; i += 1) {
    data.push({
      rowIndex: dataList[i].rowIndex,
      content: dataList[i].content ?? '',
    });
    if (dataList[i]?.rowIndex + 1 !== dataList[i + 1]?.rowIndex) {
      data.push({
        rowIndex: Number.MAX_SAFE_INTEGER - i,
        content: '',
        brokenMark: true,
      });
    }
  }
  data.push({
    rowIndex: dataList[dataList.length - 1].rowIndex,
    content: dataList[dataList.length - 1].content ?? '',
  });

  return data;
};

export const dealData = (data: SafeLine[]) => {
  let downloadStr = '';
  let copyStr = '';

  data.forEach((item) => {
    if (!item.brokenMark) {
      downloadStr += `${item.rowIndex} ${item.content}\n`;
      copyStr += `${item.content}\n`;
    }
  });

  return {
    downloadStr,
    copyStr,
  };
};

export const download = (data: SafeLine[]) => {
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    `data:text/plain;charset=utf-8, ${encodeURIComponent(dealData(data).downloadStr)}`,
  );
  element.setAttribute('download', 'text.log');
  element.click();
  element.remove();
};

// 对 value(keyword) 中可能包含的特殊符号进行转义
const invalidRegexpStr = /[$()*+.\[\]?\\^{}|]/g;
export const encodeRegexpStr = (value: string) => {
  return value?.replace(invalidRegexpStr, '\\$&');
};
