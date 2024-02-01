import { EComparisonScope, EOperationType } from '@/d.ts/task';
export const comparisonScopeMap = {
  [EComparisonScope.ALL]: '全部表',
  [EComparisonScope.PART]: '部分表',
};
export const EOperationTypeMap = {
  [EOperationType.CREATE]: '新建',
  [EOperationType.UPDATE]: '修改',
  [EOperationType.DROP]: '删除',
  [EOperationType.NO_ACTION]: '一致',
  [EOperationType.SKIP]: '跳过',
  [EOperationType.UNSUPPORTED]: '不支持',
};
