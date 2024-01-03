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
