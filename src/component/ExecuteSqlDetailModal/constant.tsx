import { formatMessage } from '@/util/intl';
import { ReactComponent as List } from '@/svgr/List.svg';
import { ReactComponent as Tree } from '@/svgr/Tree.svg';
import { ReactComponent as Text } from '@/svgr/Text.svg';
import { ReactComponent as TraceSvg } from '@/svgr/Trace.svg';
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

export const planTabLabel = '计划统计';

export const planTabOption = [{ value: PLAN_PAGE_TYPE.PLAN_DETAIL, label: planTabLabel }];
