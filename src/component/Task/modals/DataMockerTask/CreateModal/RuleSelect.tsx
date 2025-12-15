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

import { ConnectionMode } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { convertColumnType } from '@/util/data/string';
import { Select } from 'antd';
import { SelectProps } from 'antd/es/select';
import React from 'react';
import { CharRuleType } from './RuleContent/ruleItems/CharItem';
import { DateRuleType } from './RuleContent/ruleItems/DateItem';
import { NumberRuleType } from './RuleContent/ruleItems/NumberItem';
import { OtherRuleType } from './RuleContent/ruleItems/OtherItem';
import { columnTypeToRuleMap } from './type';

const { Option } = Select;

const ruleMap: {
  [key: string]: {
    value: string | number;
    name: string;
  }[];
} = {
  NUMBER: [
    {
      value: NumberRuleType.NORMAL,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.Value',
        defaultMessage: '定值',
      }), // 定值
    },
    {
      value: NumberRuleType.ORDER,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.Order',
        defaultMessage: '顺序',
      }), // 顺序
    },
    {
      value: NumberRuleType.RANDOM,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.Random',
        defaultMessage: '随机',
      }), // 随机
    },
    {
      value: NumberRuleType.NULL,
      name: 'NULL',
    },

    {
      value: NumberRuleType.SKIP,
      name: '<SKIP>',
    },
  ],

  CHAR: [
    {
      value: CharRuleType.RANDOM_TEXT,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.RandomText',
        defaultMessage: '随机文本',
      }), // 随机文本
    },
    {
      value: CharRuleType.REGEXP_TEXT,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.RegularText',
        defaultMessage: '正则文本',
      }), // 正则文本
    },
    {
      value: CharRuleType.NORMAL_TEXT,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.FixedValueText',
        defaultMessage: '定值文本',
      }), // 定值文本
    },
    {
      value: CharRuleType.RANDOM_BOOL,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.RandomBooleanValue',
        defaultMessage: '随机布尔值',
      }), // 随机布尔值
    },
    {
      value: CharRuleType.NORMAL_BOOL,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.BooleanValue',
        defaultMessage: '定值布尔值',
      }), // 定值布尔值
    },
    {
      value: CharRuleType.RANDOM_DATE,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.RandomDateValue',
        defaultMessage: '随机日期值',
      }), // 随机日期值
    },
    {
      value: CharRuleType.NORMAL_DATE,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.FixedValueDateValue',
        defaultMessage: '定值日期值',
      }), // 定值日期值
    },
    {
      value: CharRuleType.ORDER_DATE,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.SequentialDateValue',
        defaultMessage: '顺序日期值',
      }), // 顺序日期值
    },
    {
      value: CharRuleType.RANDOM_NUMBER,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.RandomNumericValue',
        defaultMessage: '随机数字值',
      }), // 随机数字值
    },
    {
      value: CharRuleType.NORMAL_NUMBER,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.NumericValue',
        defaultMessage: '定值数字值',
      }), // 定值数字值
    },
    {
      value: CharRuleType.ORDER_NUMBER,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.SequentialNumericValue',
        defaultMessage: '顺序数字值',
      }), // 顺序数字值
    },
    {
      value: CharRuleType.NULL,
      name: 'NULL',
    },

    {
      value: CharRuleType.SKIP,
      name: '<SKIP>',
    },
  ],

  DATE: [
    {
      value: DateRuleType.RANDOM,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.RandomDateValue',
        defaultMessage: '随机日期值',
      }), // 随机日期值
    },
    {
      value: DateRuleType.NORMAL,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.FixedValueDateValue',
        defaultMessage: '定值日期值',
      }), // 定值日期值
    },
    {
      value: DateRuleType.ORDER,
      name: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleSelect.SequentialDateValue',
        defaultMessage: '顺序日期值',
      }), // 顺序日期值
    },
    {
      value: DateRuleType.NULL,
      name: 'NULL',
    },

    {
      value: DateRuleType.SKIP,
      name: '<SKIP>',
    },
  ],

  // INTERVAL_YEAR_TO_MONTH: [
  //   {
  //     value: IntervalRuleType.NORMAL,
  //     name: '定值',
  //   },
  //   {
  //     value: IntervalRuleType.SKIP,
  //     name: '<SKIP>',
  //   },
  // ],
  // INTERVAL_DAY_TO_SECOND: [
  //   {
  //     value: IntervalRuleType.NORMAL,
  //     name: '定值',
  //   },
  //   {
  //     value: IntervalRuleType.SKIP,
  //     name: '<SKIP>',
  //   },
  // ],
};

function getRule(columnType: string, dbMode: ConnectionMode) {
  columnType = convertColumnType(columnType);
  const ruleName = columnTypeToRuleMap[dbMode]?.[columnType];
  return (
    ruleMap[ruleName] || [
      {
        value: OtherRuleType.NULL,
        name: 'NULL',
      },
      {
        value: OtherRuleType.SKIP,
        name: 'SKIP',
      },
    ]
  );
}

interface IRuleSelect extends SelectProps<string> {
  columnType: string;
  readonly?: boolean;
  dbMode?: ConnectionMode;
}

const RuleSelect: React.FC<IRuleSelect> = (props) => {
  const { dbMode, columnType, readonly = false, ...rest } = props;
  const taskDbMode = dbMode;
  const ruleOptions = getRule(columnType, taskDbMode);
  if (readonly) {
    return (
      <span>
        {
          ruleOptions.find((r) => {
            return r.value === rest.value;
          })?.name
        }
      </span>
    );
  }
  return (
    <Select showSearch optionFilterProp="children" {...rest}>
      {ruleOptions?.map((rule) => {
        return (
          <Option key={rule.value} value={rule.value}>
            {rule.name}
          </Option>
        );
      })}
    </Select>
  );
};

export default RuleSelect;
