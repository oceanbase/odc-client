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

import { ReactComponent as List } from '@/svgr/List.svg';
import { ReactComponent as Text } from '@/svgr/Text.svg';
import { ReactComponent as TraceSvg } from '@/svgr/Trace.svg';
import { ReactComponent as Tree } from '@/svgr/Tree.svg';
import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';

export const enum ProfileType {
  Plan = 'Plan',
  Execute = 'Execute',
}

export const enum TypeMap {
  TREE = 'TREE',
  LIST = 'LIST',
  TEXT = 'TEXT',
  TRACE = 'TRACE',
  TRACE_LIST = 'TRACE_LIST',
}

export const enum EXECUTE_PAGE_TYPE {
  EXECUTE_DETAIL = 'EXECUTE_DETAIL',
  EXECUTE_PLAN = 'EXECUTE_PLAN',
  FULL_TRACE = 'FULL_TRACE',
}

export const enum PLAN_PAGE_TYPE {
  PLAN_DETAIL = 'PLAN_DETAIL',
}

export const initConfig = {
  [ProfileType.Execute]: {
    tab: EXECUTE_PAGE_TYPE.EXECUTE_DETAIL,
    viewType: TypeMap.TREE,
  },
  [ProfileType.Plan]: {
    tab: PLAN_PAGE_TYPE.PLAN_DETAIL,
    viewType: TypeMap.TREE,
  },
};

export const initTabViewConfig = {
  [EXECUTE_PAGE_TYPE.EXECUTE_DETAIL]: TypeMap.TREE,
  [EXECUTE_PAGE_TYPE.EXECUTE_PLAN]: TypeMap.LIST,
  [EXECUTE_PAGE_TYPE.FULL_TRACE]: TypeMap.TRACE,
};

export const traceViewOptions = [
  {
    value: TypeMap.TRACE,
    icon: <Icon component={TraceSvg} />,
    message: formatMessage({
      id: 'src.component.ExecuteSqlDetailModal.3AAA9DF9',
      defaultMessage: 'Trace 视图',
    }),
  },
  {
    value: TypeMap.TRACE_LIST,
    icon: <Icon component={List} />,
    message: formatMessage({
      id: 'src.component.ExecuteSqlDetailModal.D1E28701',
      defaultMessage: '列表视图',
    }),
  },
];

export const executeViewOptions = [
  {
    value: TypeMap.LIST,
    icon: <Icon component={List} />,
    message: formatMessage({
      id: 'src.component.ExecuteSqlDetailModal.FB8B6D0B',
      defaultMessage: '列表视图',
    }),
  },
  {
    value: TypeMap.TEXT,
    icon: <Icon component={Text} />,
    message: formatMessage({
      id: 'src.component.ExecuteSqlDetailModal.052B3894',
      defaultMessage: '文本视图',
    }),
  },
];

export const executeViewOptionsInPlan = [
  {
    value: TypeMap.TREE,
    icon: <Icon component={Tree} />,
    message: formatMessage({
      id: 'src.component.ExecuteSqlDetailModal.0DAD5E44',
      defaultMessage: '树视图',
    }),
  },
  {
    value: TypeMap.LIST,
    icon: <Icon component={List} />,
    message: formatMessage({
      id: 'src.component.ExecuteSqlDetailModal.2129C7A3',
      defaultMessage: '列表视图',
    }),
  },
  {
    value: TypeMap.TEXT,
    icon: <Icon component={Text} />,
    message: formatMessage({
      id: 'src.component.ExecuteSqlDetailModal.97782AAE',
      defaultMessage: '文本视图',
    }),
  },
];

export const planTabLabel = formatMessage({
  id: 'src.component.ExecuteSqlDetailModal.1882C007',
  defaultMessage: '计划统计',
});

export const planTabOption = [{ value: PLAN_PAGE_TYPE.PLAN_DETAIL, label: planTabLabel }];

export enum DirtyRowActionEnum {
  SKIP = 'SKIP',
  REMIGRATE = 'REMIGRATE',
  RAISE_ERROR = 'RAISE_ERROR',
}

export const DirtyRowActionLabelMap = {
  [DirtyRowActionEnum.SKIP]: formatMessage({
    id: 'src.component.ExecuteSqlDetailModal.1F699B52',
    defaultMessage: '跳过清理',
  }),
  [DirtyRowActionEnum.REMIGRATE]: formatMessage({
    id: 'src.component.ExecuteSqlDetailModal.86528F49',
    defaultMessage: '清理并更新目标库',
  }),
  [DirtyRowActionEnum.RAISE_ERROR]: formatMessage({
    id: 'src.component.ExecuteSqlDetailModal.B88E979F',
    defaultMessage: '任务失败',
  }),
};

// 跳过不清理数据不传的时候后端默认值是Long.max: 2^63 - 1, javaScript 的 Number.MAX_SAFE_INTEGER 是 2^53 - 1, 反显的时候会超出
// 因此采用antd的stringMode属性 + string, 以支持超出 JavaScript 安全整数范围的大数
export const JAVA_LONG_MAX_VALUE = '9223372036854775807';
