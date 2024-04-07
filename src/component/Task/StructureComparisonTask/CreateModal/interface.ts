import { formatMessage } from '@/util/intl';
import { EComparisonScope, EOperationType } from '@/d.ts/task';
export const comparisonScopeMap = {
  [EComparisonScope.ALL]: formatMessage({
    id: 'src.component.Task.StructureComparisonTask.CreateModal.9C98407E',
  }), //'全部表'
  [EComparisonScope.PART]: formatMessage({
    id: 'src.component.Task.StructureComparisonTask.CreateModal.D2F4E132',
  }), //'部分表'
};
export const EOperationTypeMap = {
  [EOperationType.CREATE]: formatMessage({
    id: 'src.component.Task.StructureComparisonTask.CreateModal.604BD3CF',
  }), //'新建'
  [EOperationType.UPDATE]: formatMessage({
    id: 'src.component.Task.StructureComparisonTask.CreateModal.8F395AFB',
  }), //'修改'
  [EOperationType.DROP]: formatMessage({
    id: 'src.component.Task.StructureComparisonTask.CreateModal.4DAACA54',
  }), //'删除'
  [EOperationType.NO_ACTION]: formatMessage({
    id: 'src.component.Task.StructureComparisonTask.CreateModal.32ECF203',
  }), //'一致'
  [EOperationType.SKIP]: formatMessage({
    id: 'src.component.Task.StructureComparisonTask.CreateModal.E247086C',
  }), //'跳过'
  [EOperationType.UNSUPPORTED]: formatMessage({
    id: 'src.component.Task.StructureComparisonTask.CreateModal.F20205E5',
  }), //'不支持'
};
