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

import { PARTITION_KEY_INVOKER } from '@/d.ts';

export enum START_DATE {
  CURRENT_DATE = 'CURRENT_DATE',
  CUSTOM_DATE = 'CUSTOM_DATE',
}

export enum INCREAMENT_FIELD_TYPE {
  NUMBER = 'NUMBER',
  TIME_STRING = 'TIME_STRING',
  TIMESTAMP = 'TIMESTAMP',
}

export const increamentFieldTypeLabelMap = {
  [INCREAMENT_FIELD_TYPE.NUMBER]: '数值',
  [INCREAMENT_FIELD_TYPE.TIME_STRING]: '日期时间',
  [INCREAMENT_FIELD_TYPE.TIMESTAMP]: '时间戳',
};

export const getPartitionKeyInvokerByIncrementFieldType = (
  partitionKeyInvoker: PARTITION_KEY_INVOKER,
  incrementFieldType: INCREAMENT_FIELD_TYPE,
) => {
  if (!incrementFieldType) {
    return partitionKeyInvoker;
  }
  switch (incrementFieldType) {
    case INCREAMENT_FIELD_TYPE.NUMBER: {
      return PARTITION_KEY_INVOKER.NUMBER_INCREASING_GENERATOR;
    }
    case INCREAMENT_FIELD_TYPE.TIME_STRING: {
      return PARTITION_KEY_INVOKER.TIME_STRING_INCREASING_GENERATOR;
    }
    case INCREAMENT_FIELD_TYPE.TIMESTAMP: {
      return PARTITION_KEY_INVOKER.TIME_STRING_INCREASING_GENERATOR;
    }
  }
};

export const revertPartitionKeyInvokerByIncrementFieldType = (
  partitionKeyInvoker: PARTITION_KEY_INVOKER,
  incrementFieldType: INCREAMENT_FIELD_TYPE,
) => {
  if (!incrementFieldType) {
    return partitionKeyInvoker;
  }
  return PARTITION_KEY_INVOKER.TIME_INCREASING_GENERATOR;
};
