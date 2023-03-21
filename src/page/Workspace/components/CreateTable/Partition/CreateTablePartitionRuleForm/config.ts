import { IPartitionType } from '@/d.ts';
import { formatMessage } from '@/util/intl';

export const partitionValuePlaceholder = {
  [IPartitionType.LIST]: formatMessage({
    id: 'workspace.window.createTable.partition.value.list.placelholder',
  }),
  [IPartitionType.LIST_COLUMNS]: formatMessage({
    id: 'workspace.window.createTable.partition.value.listColumns.placelholder',
  }),
  [IPartitionType.RANGE]: formatMessage({
    id: 'workspace.window.createTable.partition.value.range.placelholder',
  }),
  [IPartitionType.RANGE_COLUMNS]: formatMessage({
    id: 'workspace.window.createTable.partition.value.rangeColumns.placelholder',
  }),
};

export function getPartitionValueLabel(partitionType: IPartitionType) {
  if (partitionType === IPartitionType.LIST || partitionType === IPartitionType.LIST_COLUMNS) {
    return formatMessage({
      id: 'workspace.window.createTable.partition.value.list',
    });
  }
  if (partitionType === IPartitionType.RANGE_COLUMNS || partitionType === IPartitionType.RANGE) {
    return formatMessage({
      id: 'workspace.window.createTable.partition.value.range',
    });
  }
  return '';
}
