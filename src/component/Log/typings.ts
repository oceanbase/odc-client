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

import type { CSSProperties } from 'react';

export interface LineData {
  /**
   * @title 行号
   * @description 行号, 不一定连续
   */
  rowIndex: number;
  /**
   * @title 行内容
   * @description 行内容
   */
  content: string;
}

export interface SafeLine extends LineData {
  /**
   * @title 下一行的行号是否是不连续的
   * @description 下一行的行号是否是不连续的
   */
  brokenMark?: boolean;
}

export interface SearchedLine extends SafeLine {
  /**
   * @title 行内容对keyword执行split的返回值
   * @description 行内容对keyword执行split的返回值
   */
  textArr?: string[];
  /**
   * @title 行内容对keyword执行match的返回值
   * @description 行内容对keyword执行match的返回值（支持忽略大小写后，行内匹配到的keyword集合）
   */
  keywords?: string[];
}

/**
 * @title 日志内容传参格式
 * @description 日志内容传参格式
 */
export type LogValue = LineData[] | string | string[];

export interface LogProps {
  /**
   * @title 日志内容传参
   * @description 日志内容传参
   */
  value: LogValue;
  /**
   * @title 搜索回调
   * @description 搜索回调
   */
  onSearch?: (value: string) => void;
  /**
   * @title 组件外部控制的loading
   * @description 组件外部控制的loading
   */
  loading?: boolean;
  /**
   * @title 搜索触发的方式
   * @description 搜索触发的方式, 默认为click点击触发, change为输入框内容变化时触发
   */
  searchTrigger?: 'click' | 'change';
  /**
   * @title 日志组件盒子的样式
   * @description 日志组件盒子的样式
   */
  style?: React.CSSProperties;
  /**
   * @title 空数据描述
   * @description 空数据描述
   */
  emptyDescription?: string;
  /**
   * @title 刷新
   * @description 点击刷新按钮触发传入的回调方法, 如果没有传,刷新按钮则不可见
   */
  onReload?: () => void;
  /**
   * @title 日志默认位置
   * @description 加载完日志后, 视窗显示首行日志, 还是末尾的日志, 默认 start
   */
  defaultPosition?: 'start' | 'end';
  /**
   * @title 忽略大小写
   * @description 忽略大小写
   */
  ignoreCase?: boolean;
  /**
   * @title 是否开启下载
   * @description 开启下载
   */
  enableDownload?: boolean;
  /**
   * @title 是否开启复制
   * @description 开启复制
   */
  enableCopy?: boolean;
  /**
   * @title 是否开启代码高亮
   * @description 是否开启代码高亮
   */
  enableHighLight?: boolean;
  /**
   * @title 指定日志语言类型
   * @description 指定日志语言类型，详见：Highlight组件语言支持情况
   */
  language?: string;
}

// eslint-disable-next-line
interface SearchResultProps {
  /**
   * @title 搜索结果
   * @description 搜索结果 行号line中的搜索结果,如果有则按全局顺序的index存储,
   * eg; 12: [2, 3] 代表行号12有两个搜索结果, 分别在全局排第2和第3
   */
  [line: number]: number[];
}

export interface LineProps {
  /**
   * @title 包含搜索信息的行内容
   * @description 包含搜索信息的行内容
   */
  data: SearchedLine;
  /**
   * @title 高亮搜索关键字的索引
   * @description 高亮搜索关键字的索引
   */
  current: number;
  /**
   * @title 行样式
   * @description 行样式, 由虚拟列表生成赋值给行
   */
  style: CSSProperties;
  /**
   * @title 当前行的搜索结果
   * @description 当前行的搜索结果
   */
  searchData: SearchResultProps;
  /**
   * @title 是否开启代码高亮
   * @description 是否开启代码高亮
   */
  enableHighLight?: boolean;
  /**
   * @title 指定语言类型
   * @description 指定语言类型，详见：Highlight组件语言支持情况
   */
  language?: string;
}

export interface LogData {
  /**
   * @title 关键字查找到的数量
   * @description 关键字查找到的数量
   */
  foundCount: number;
  /**
   * @title 行数据
   * @description 行数据
   */
  data: SafeLine[];
  /**
   * @title 搜索结果索引列表
   * @description 搜索结果索引列表
   */
  searchResultIndexList: number[];
  /**
   * @title 搜索结果索引Map
   * @description 搜索结果索引Map
   */
  searchResultMap: SearchResultProps;
}
