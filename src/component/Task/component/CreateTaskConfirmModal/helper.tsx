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

import { formatMessage } from '@/util/intl';
import { IDatabase } from '@/d.ts/database';
import { MaximumCharacterLength } from '@/component/Task/component/CreateTaskConfirmModal';
import { safeTruncateString } from '@/util/data/string';

/** 作业的默认生成规则 */
export const getDefaultName = (database: IDatabase) => {
  let scheduleName = `[${database?.environment?.name}]${database?.name}_${+new Date()}`;
  return safeTruncateString(MaximumCharacterLength, scheduleName);
};

/** 克隆作业时的默认生成规则 */
export const getInitScheduleName = (scheduleName: string, type: 'RETRY' | 'EDIT') => {
  let initScheduleName = undefined;
  if (scheduleName) {
    switch (type) {
      case 'RETRY':
        initScheduleName = formatMessage(
          {
            id: 'src.component.Task.component.CreateTaskConfirmModal.A4D01F9B',
            defaultMessage: '[克隆]{scheduleName}',
          },
          { scheduleName },
        );
        break;
      case 'EDIT':
        initScheduleName = scheduleName;
        break;
      default:
        break;
    }
  }
  return safeTruncateString(MaximumCharacterLength, initScheduleName);
};
