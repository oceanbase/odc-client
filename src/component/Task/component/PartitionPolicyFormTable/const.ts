import { formatMessage } from '@/util/intl';
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

import { PARTITION_KEY_INVOKER, TaskPartitionStrategy } from '@/d.ts';
import { TaskPartitionStrategyMap } from '../../const';
export enum NameRuleType {
  PRE_SUFFIX = 'PRE_SUFFIX',
  CUSTOM = 'CUSTOM',
}

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
  [INCREAMENT_FIELD_TYPE.NUMBER]: formatMessage({
    id: 'src.component.Task.component.PartitionPolicyFormTable.E0F368F6',
    defaultMessage: '数值',
  }),
  [INCREAMENT_FIELD_TYPE.TIME_STRING]: formatMessage({
    id: 'src.component.Task.component.PartitionPolicyFormTable.053D6705',
    defaultMessage: '日期时间',
  }),
  [INCREAMENT_FIELD_TYPE.TIMESTAMP]: formatMessage({
    id: 'src.component.Task.component.PartitionPolicyFormTable.FCD94271',
    defaultMessage: '时间戳',
  }),
};

export const StrategyOptions = Object.keys(TaskPartitionStrategyMap)?.map((key) => ({
  label: TaskPartitionStrategyMap[key],
  value: key,
}));

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

export const intervalPrecisionOptions = [
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.436BC171',
      defaultMessage: '秒',
    }), //'秒'
    value: 63,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.0E0CEBAC',
      defaultMessage: '分',
    }), //'分'
    value: 31,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.9EC2D1FF',
      defaultMessage: '时',
    }), //'时'
    value: 15,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.1E11DFEA',
      defaultMessage: '日',
    }), //'日'
    value: 7,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.1FB1ABDC',
      defaultMessage: '月',
    }), //'月'
    value: 3,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.069255DB',
      defaultMessage: '年',
    }), //'年'
    value: 1,
  },
];

export const suffixOptions = [
  {
    label: 'yyyy',
    value: 'yyyy',
  },

  {
    label: 'yyyyMMdd',
    value: 'yyyyMMdd',
  },

  {
    label: 'yyyyMM',
    value: 'yyyyMM',
  },

  {
    label: 'yyyy_MM_dd',
    value: 'yyyy_MM_dd',
  },

  {
    label: 'yyyy_MM',
    value: 'yyyy_MM',
  },
  {
    label: 'yyyy/MM',
    value: 'yyyy/MM',
  },
  {
    label: 'yyyy/MM/dd',
    value: 'yyyy/MM/dd',
  },
  {
    label: 'yyyyMMddHHmmss',
    value: 'yyyyMMddHHmmss',
  },
  {
    label: 'yyyy/MM/dd HH:mm:ss',
    value: 'yyyy/MM/dd HH:mm:ss',
  },
  {
    label: 'yyyy_MM_dd HH:mm:ss',
    value: 'yyyy_MM_dd HH:mm:ss',
  },
];

export const rules = {
  generateCount: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.16355175',
        defaultMessage: '请输入预创建分区数量',
      }), //'请输入预创建分区数量'
    },
  ],
  nameRuleType: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.87D4D0BB',
        defaultMessage: '请选择',
      }), //'请选择'
    },
  ],
  generateExpr: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.E5DA1FA4',
        defaultMessage: '请输入表达式',
      }), //'请输入表达式'
    },
  ],
  namingPrefix: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.4293BED4',
        defaultMessage: '请输入前缀',
      }), //'请输入前缀'
    },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
      message: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.F70A7891',
        defaultMessage: '仅支持英文/数字/下划线，且以英文开头',
      }), //'仅支持英文/数字/下划线，且以英文开头'
    },
    {
      max: 32,
      message: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.D76C944C',
        defaultMessage: '不超过32个字符',
      }), //'不超过32个字符'
    },
  ],
  refPartitionKey: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.CC74D506',
        defaultMessage: '请选择',
      }), //'请选择'
    },
  ],
  namingSuffixExpression: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.7183DAA0',
        defaultMessage: '请选择后缀',
      }), //'请选择后缀'
    },
  ],
  namingSuffixStrategy: [
    {
      required: true,
    },
  ],
  keepLatestCount: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.967356C8',
        defaultMessage: '请输入',
      }), //'请输入'
    },
  ],
  reloadIndexes: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.393D1F82',
        defaultMessage: '请选择',
      }), //'请选择'
    },
  ],
};

export const ruleFormRules = {
  intervalPrecision: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.7FB4A416',
        defaultMessage: '请选择',
      }), //'请选择'
    },
  ],
  intervalGenerateExpr: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.8368A05F',
        defaultMessage: '请输入',
      }), //'请输入'
    },
  ],
  interval: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.2F986FD8',
        defaultMessage: '请输入',
      }), //'请输入'
    },
  ],
  incrementFieldType: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.88F8B3BE',
        defaultMessage: '请选择',
      }),
    },
  ],
  incrementFieldTypeInDate: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.3174105E',
        defaultMessage: '请输入格式',
      }),
    },
  ],
  generateExpr: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.DE258551',
        defaultMessage: '请输入',
      }), //'请输入'
    },
  ],
};

export const startDateOptionValues = [
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.88D572DE',
      defaultMessage: '当前时间',
    }), //'当前时间'
    value: START_DATE.CURRENT_DATE,
    description: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.684CAF92',
      defaultMessage: '从实际执行的时间开始创建',
    }), //'从实际执行的时间开始创建'
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.9CDC5E14',
      defaultMessage: '指定时间',
    }), //'指定时间'
    value: START_DATE.CUSTOM_DATE,
    description: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.0E0ADD3E',
      defaultMessage: '从指定的某个时间开始创建',
    }), //'从指定的某个时间开始创建'
  },
];

export const incrementFieldTypeOptionsValues = [
  {
    label: increamentFieldTypeLabelMap[INCREAMENT_FIELD_TYPE.NUMBER],
    value: INCREAMENT_FIELD_TYPE.NUMBER,
    description: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.33B07A9E',
      defaultMessage: '仅代表数值数据，如：001、002',
    }),
  },
  {
    label: increamentFieldTypeLabelMap[INCREAMENT_FIELD_TYPE.TIME_STRING],
    value: INCREAMENT_FIELD_TYPE.TIME_STRING,
    description: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.38D2B418',
      defaultMessage: '类型为数值但实际含义为日期时间，如: 20250207',
    }),
  },
  {
    label: increamentFieldTypeLabelMap[INCREAMENT_FIELD_TYPE.TIMESTAMP],
    value: INCREAMENT_FIELD_TYPE.TIMESTAMP,
    description: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.EBF8762C',
      defaultMessage: '类型为数值但实际含义为时间戳，如: 1609459200',
    }),
  },
];

export const incrementByDateOptionsInNumber = ['yyyy', 'yyyyMM', 'yyyyMMdd', 'yyyyMMddHHmmss'].map(
  (item) => ({
    label: item,
    value: item,
  }),
);

export const PRECISION_MAP = {
  second: 63,
  minute: 31,
  hour: 15,
  day: 7,
  month: 3,
  year: 1,
};
