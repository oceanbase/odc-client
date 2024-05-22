import { ReactComponent as List } from '@/svgr/List.svg';
import { ReactComponent as Tree } from '@/svgr/Tree.svg';
import { ReactComponent as Text } from '@/svgr/Text.svg';
import { ReactComponent as TraceSvg } from '@/svgr/Trace.svg';
import Icon from '@ant-design/icons';

export const enum ProfileType {
  Plan = 'Plan',
  Execute = 'Execute',
}

export const TypeMap = {
  TREE: 'TREE',
  LIST: 'LIST',
  TEXT: 'TEXT',
  TRACE: 'TRACE',
  TRACE_LIST: 'TRACE_LIST',
};

export const enum EXECUTE_PAGE_TYPE {
  EXECUTE_DETAIL = 'EXECUTE_DETAIL',
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

export const traceViewOptions = [
  { value: TypeMap.TRACE, icon: <Icon component={TraceSvg} />, message: 'Trace 视图' },
  { value: TypeMap.TRACE_LIST, icon: <Icon component={List} />, message: '列表视图' },
];

export const executeViewOptions = [
  { value: TypeMap.TREE, icon: <Icon component={Tree} />, message: '树视图' },
  { value: TypeMap.LIST, icon: <Icon component={List} />, message: '列表视图' },
  { value: TypeMap.TEXT, icon: <Icon component={Text} />, message: '文本视图' },
];
