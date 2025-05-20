import { TaskPartitionStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import {
  INCREAMENT_FIELD_TYPE,
  intervalPrecisionOptions,
  NameRuleType,
  PRECISION_MAP,
} from './const';
import { getLocale } from '@umijs/max';

const DropConfigMessage = formatMessage({
  id: 'src.component.Task.component.PartitionPolicyFormTable.A9C95E9D',
  defaultMessage:
    '当前表如果包含全局索引，删除分区会导致全局索引失效，如果选择重建全局索引可能耗时很久，请谨慎操作',
}); /*"当前表如果包含全局索引，删除分区会导致全局索引失效，请谨慎操作，如果选择重建全局索引可能耗时很久，请谨慎操作"*/

const CreateConfigMessage = formatMessage({
  id: 'src.component.Task.component.PartitionPolicyFormTable.8DC77765',
  defaultMessage:
    '当前表如果属于表组（tablegroup），创建分区可能会失败或破坏负载均衡，请谨慎配置创建策略',
}); /*"当前表如果属于表组（tablegroup），创建分区可能会失败或破坏负载均衡，请谨慎配置创建策略"*/

export const getAlertMessage = (strategies: TaskPartitionStrategy[]) => {
  const messages = [];
  if (strategies?.includes(TaskPartitionStrategy.DROP)) {
    messages.push(DropConfigMessage);
  }
  if (strategies?.includes(TaskPartitionStrategy.CREATE)) {
    messages.push(CreateConfigMessage);
  }
  return messages;
};

export const getUnitLabel = (value: number) => {
  return intervalPrecisionOptions.find((item) => item.value === value)?.label;
};

const nameRuleOptions = [
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.EB655A6C',
      defaultMessage: '前缀 + 后缀',
    }), //'前缀 + 后缀'
    value: NameRuleType.PRE_SUFFIX,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.AB4964B2',
      defaultMessage: '自定义',
    }), //'自定义'
    value: NameRuleType.CUSTOM,
  },
];

export const filteredNameRuleOptions = (
  dateTypes: boolean,
  incrementFieldType: INCREAMENT_FIELD_TYPE,
) => {
  if (dateTypes || incrementFieldType === INCREAMENT_FIELD_TYPE.TIME_STRING) {
    return nameRuleOptions;
  }
  return nameRuleOptions.filter((item) => item.value === NameRuleType.CUSTOM);
};

export const getIncrementByDateOptionsInChar = () => {
  const locale = getLocale();
  const options = [
    'yyyy',
    formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.E205FB6F',
      defaultMessage: 'yyyy年',
    }),

    'yyyyMM',
    'yyyy-MM',
    'yyyy/MM',
    formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.216E3527',
      defaultMessage: 'yyyy年MM月',
    }),

    'yyyyMMdd',
    'yyyy-MM-dd',
    'yyyy/MM/dd',
    formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.EF0BF81D',
      defaultMessage: 'yyyy年MM月dd日',
    }),
    'yyyyMMdd HH:mm:ss',
    'yyyy-MM-dd HH:mm:ss',
    'yyyy/MM/dd HH:mm:ss',
    formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.13B22678',
      defaultMessage: 'yyyy年MM月dd日 HH:mm:ss',
    }),
  ];

  if (locale !== 'zh-CN') {
    return options
      .filter((item) => !/[\u4e00-\u9fa5]/.test(item))
      .map((item) => ({
        label: item,
        value: item,
      }));
  }

  return options.map((item) => ({
    label: item,
    value: item,
  }));
};

export const getIntervalPrecisionOptionsByIncrementDateType = (
  incrementFieldTypeInDate: string,
  incrementFieldType: INCREAMENT_FIELD_TYPE,
) => {
  if (incrementFieldType !== INCREAMENT_FIELD_TYPE.TIME_STRING || !incrementFieldTypeInDate) {
    return intervalPrecisionOptions;
  }

  if (incrementFieldTypeInDate?.includes?.('s')) {
    return intervalPrecisionOptions?.filter((item) => item.value <= PRECISION_MAP.second);
  }
  if (incrementFieldTypeInDate?.includes?.('m')) {
    return intervalPrecisionOptions?.filter((item) => item.value <= PRECISION_MAP.minute);
  }
  if (incrementFieldTypeInDate?.includes?.('H')) {
    return intervalPrecisionOptions?.filter((item) => item.value <= PRECISION_MAP.hour);
  }
  if (incrementFieldTypeInDate?.includes?.('d')) {
    return intervalPrecisionOptions?.filter((item) => item.value <= PRECISION_MAP.day);
  }
  if (incrementFieldTypeInDate?.includes?.('M')) {
    return intervalPrecisionOptions?.filter((item) => item.value <= PRECISION_MAP.month);
  }
  if (incrementFieldTypeInDate?.includes?.('y')) {
    return intervalPrecisionOptions?.filter((item) => item.value <= PRECISION_MAP.year);
  }

  return intervalPrecisionOptions;
};

export const getDefaultPrecisionByIncrementDateTypeInDate = (
  incrementFieldTypeInDate: string,
  incrementFieldType: INCREAMENT_FIELD_TYPE,
) => {
  if (incrementFieldType !== INCREAMENT_FIELD_TYPE.TIME_STRING || !incrementFieldTypeInDate) {
    return 3;
  }

  if (incrementFieldTypeInDate?.includes?.('s')) {
    return PRECISION_MAP.second;
  }
  if (incrementFieldTypeInDate?.includes?.('m')) {
    return PRECISION_MAP.minute;
  }
  if (incrementFieldTypeInDate?.includes?.('H')) {
    return PRECISION_MAP.hour;
  }
  if (incrementFieldTypeInDate?.includes?.('d')) {
    return PRECISION_MAP.day;
  }
  if (incrementFieldTypeInDate?.includes?.('M')) {
    return PRECISION_MAP.month;
  }
  if (incrementFieldTypeInDate?.includes?.('y')) {
    return PRECISION_MAP.year;
  }

  return 3;
};

export const getPartitionKeyConfigsFormItemName = ({ name, key }) => {
  return ['option', 'partitionKeyConfigs', name, key];
};
