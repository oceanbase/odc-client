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

/**
 * 这个组件主要是维护编辑态，以及处理数据类型,库类型与具体输入展示组件之间的关系
 */
import { ConnectionMode, IColumnSizeMap, IColumnSizeValue, IServerMockColumn } from '@/d.ts';
import { convertColumnType } from '@/util/utils';
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { FormInstance } from 'antd/lib/form';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { columnTypeToRuleMap, IMockFormColumn, RuleItem } from '../type';

import { isNil } from 'lodash';
import styles from './index.less';
import CharItem, { CharRuleType, isShowEmpty as isShowCharItemEmpty } from './ruleItems/CharItem';
import {
  convertFormDataToServerData as charConvertFormDataToServerData,
  convertServerDataToFormData as charConvertServerDataToFormData,
} from './ruleItems/CharItem/converter';
import getCharDefaltValue from './ruleItems/CharItem/defaultValue';
import DateItem, { DateRuleType, isShowEmpty as isShowDateItemEmpty } from './ruleItems/DateItem';
import {
  convertFormDataToServerData as dateConvertFormDataToServerData,
  convertServerDataToFormData as dateConvertServerDataToFormData,
} from './ruleItems/DateItem/converter';
import getDateDefaltValue from './ruleItems/DateItem/defaultValue';
import IntervalItem, {
  IntervalRuleType,
  isShowEmpty as isShowIntervalItemEmpty,
} from './ruleItems/IntervalItem';
import {
  convertFormDataToServerData as intervalConvertFormDataToServerData,
  convertServerDataToFormData as intervalConvertServerDataToFormData,
} from './ruleItems/IntervalItem/converter';
import getIntervalDefaltValue from './ruleItems/IntervalItem/defaultValue';
import NumberItem, {
  isShowEmpty as isShowNumberItemEmpty,
  NumberRuleType,
} from './ruleItems/NumberItem';
import {
  convertFormDataToServerData as numberConvertFormDataToServerData,
  convertServerDataToFormData as numberConvertServerDataToFormData,
} from './ruleItems/NumberItem/converter';
import getNumberDefaltValue from './ruleItems/NumberItem/defaultValue';
import OtherItem, { isShowEmpty as isShowOtherItemEmpty } from './ruleItems/OtherItem';
import {
  convertFormDataToServerData as otherConvertFormDataToServerData,
  convertServerDataToFormData as otherConvertServerDataToFormData,
} from './ruleItems/OtherItem/converter';
import getOtherDefaultValue from './ruleItems/OtherItem/defaultValue';

interface IRuleContentProps {
  columnType: string;
  columnName: string;
  ruleType: NumberRuleType | any;
  dbMode: ConnectionMode;
  value?: any;
  onChange?: (value: any) => void;
  columnSizeMap: IColumnSizeMap;
  readonly?: boolean;
}

/**
 * 获取是否为浮点型
 */
function getNumberType(dbMode: ConnectionMode, columnType: string) {
  if (dbMode === ConnectionMode.OB_ORACLE) {
    return 'float';
  }
  if (['DECIMAL', 'FLOAT', 'DOUBLE', 'NUMERIC'].includes(convertColumnType(columnType))) {
    return 'float';
  }
  return 'int';
}

const RuleContent: React.FC<IRuleContentProps> = (props) => {
  const [isEditing, _setIsEditing] = useState(false);
  const itemRef = useRef<FormInstance>();
  let emptyShowFunc;
  let {
    dbMode,
    columnType,
    ruleType,
    readonly,
    value,
    columnSizeMap,
    columnName,
    onChange,
  } = props;
  const maxLength = columnSizeMap?.[columnName];
  columnType = convertColumnType(columnType);
  const ruleItem = columnTypeToRuleMap[dbMode]?.[columnType];
  const setIsEditing = useCallback(
    (isEditing: boolean, newValue?: any) => {
      _setIsEditing(isEditing);
      if (value || newValue) {
        onChange({
          ...(newValue || value),
          _isEditing: isEditing,
        });
      }
    },
    [value],
  );
  /**
   * ruleType 改变的时候，重置状态
   */
  useEffect(() => {
    setIsEditing(false);
  }, [ruleType]);

  if (!ruleItem) {
    return null;
  }
  /**
   * 渲染的内容组件
   * 这里需要设置 key 来重置 form 的状态，否则，form 会缓存第一次的 initialValue 导致无法手动重置。
   */

  let items;
  /**
   * react 更新是异步的，为了防止边界情况数据异常，加上ruleType来重置。
   */
  let itemKey = isEditing + '' + ruleType;
  switch (ruleItem) {
    case RuleItem.NUMBER: {
      items = (
        <NumberItem
          key={itemKey}
          readonly={!isEditing || readonly}
          ref={itemRef}
          value={value}
          type={getNumberType(dbMode, columnType)}
          ruleType={ruleType}
        />
      );
      emptyShowFunc = isShowNumberItemEmpty;
      break;
    }
    case RuleItem.INTERVAL_YEAR_TO_MONTH:
    case RuleItem.INTERVAL_DAY_TO_SECOND: {
      items = (
        <IntervalItem
          key={itemKey}
          ruleType={ruleType}
          readonly={!isEditing || readonly}
          ref={itemRef}
          value={value}
        />
      );
      emptyShowFunc = isShowIntervalItemEmpty;
      break;
    }
    case RuleItem.DATE: {
      items = (
        <DateItem
          key={itemKey}
          ruleType={ruleType}
          readonly={!isEditing || readonly}
          ref={itemRef}
          value={value}
        />
      );
      emptyShowFunc = isShowDateItemEmpty;
      break;
    }
    case RuleItem.CHAR: {
      items = (
        <CharItem
          key={itemKey}
          maxLength={maxLength as number}
          ruleType={ruleType}
          readonly={!isEditing || readonly}
          ref={itemRef}
          value={value}
        />
      );
      emptyShowFunc = isShowCharItemEmpty;
      break;
    }
    default: {
      items = (
        <OtherItem
          key={itemKey}
          ruleType={ruleType}
          readonly={!isEditing || readonly}
          ref={itemRef}
          value={value}
        />
      );
      emptyShowFunc = isShowOtherItemEmpty;
    }
  }
  const isEmptyItems = !items || isNil(ruleType) || emptyShowFunc?.(ruleType);
  return (
    <div className={styles.main}>
      <div className={styles.items}>{items}</div>
      <div className={styles.tools}>
        {isEmptyItems || readonly ? null : isEditing ? (
          <Space size="middle" style={{ paddingTop: 5 }}>
            <CheckOutlined
              style={{ color: '#52C41A' }}
              onClick={async () => {
                try {
                  const value = await itemRef.current?.validateFields();
                  onChange(value);
                  setIsEditing(false, value);
                } catch (e) {
                  console.log(e);
                }
              }}
            />
            <CloseOutlined style={{ color: '#FF4D4F' }} onClick={() => setIsEditing(false)} />
          </Space>
        ) : (
          <EditOutlined
            style={{ color: 'var(--text-color-hint)' }}
            onClick={() => setIsEditing(true)}
          />
        )}
      </div>
    </div>
  );
};

export default RuleContent;

/**
 * 获取对应 ruleType 默认值
 */
export function getDefaultValue(
  dbMode: ConnectionMode,
  columnType: string,
  ruleType: string,
  columnSize?: IColumnSizeValue,
) {
  columnType = convertColumnType(columnType);
  const ruleItem = columnTypeToRuleMap[dbMode][columnType];
  switch (ruleItem) {
    case RuleItem.NUMBER: {
      return getNumberDefaltValue(ruleType as any, columnSize);
    }
    case RuleItem.INTERVAL_DAY_TO_SECOND:
    case RuleItem.INTERVAL_YEAR_TO_MONTH: {
      return getIntervalDefaltValue(ruleType as any, ruleItem === RuleItem.INTERVAL_DAY_TO_SECOND);
    }
    case RuleItem.DATE: {
      return getDateDefaltValue(ruleType as any);
    }
    case RuleItem.CHAR: {
      return getCharDefaltValue(ruleType as any, columnSize as number);
    }
    default: {
      return getOtherDefaultValue(ruleType as any);
    }
  }
}
/**
 * 获取默认的rule
 */
export function getDefaultRule(columnType: string, dbMode: ConnectionMode) {
  columnType = convertColumnType(columnType);
  const ruleItem = columnTypeToRuleMap[dbMode][columnType];
  switch (ruleItem) {
    case RuleItem.CHAR: {
      return CharRuleType.RANDOM_TEXT;
    }
    case RuleItem.DATE: {
      return DateRuleType.RANDOM;
    }
    case RuleItem.INTERVAL_YEAR_TO_MONTH:
    case RuleItem.INTERVAL_DAY_TO_SECOND: {
      return IntervalRuleType.NORMAL;
    }
    case RuleItem.NUMBER: {
      return NumberRuleType.RANDOM;
    }
    default: {
      return CharRuleType.NULL;
    }
  }
}
/**
 * 转换成服务器的数据
 */
export function convertFormToServerColumns(
  columns: IMockFormColumn[],
  dbMode: ConnectionMode,
): IServerMockColumn[] {
  return columns?.map((column) => {
    const ruleItem: RuleItem = columnTypeToRuleMap[dbMode]?.[convertColumnType(column.columnType)];
    switch (ruleItem) {
      case RuleItem.CHAR: {
        return charConvertFormDataToServerData(column);
      }
      case RuleItem.DATE: {
        return dateConvertFormDataToServerData(column);
      }
      case RuleItem.INTERVAL_DAY_TO_SECOND:
      case RuleItem.INTERVAL_YEAR_TO_MONTH: {
        return intervalConvertFormDataToServerData(column);
      }
      case RuleItem.NUMBER: {
        return numberConvertFormDataToServerData(column);
      }
      default: {
        return otherConvertFormDataToServerData(column);
      }
    }
  }) as any;
}
export function convertServerColumnsToFormColumns(
  serverData: IServerMockColumn[],
  dbMode: ConnectionMode,
): IMockFormColumn[] {
  if (!serverData) {
    return null;
  }
  return serverData?.map((column) => {
    const columnType = column?.typeConfig?.columnType;
    const ruleItem: RuleItem = columnTypeToRuleMap[dbMode]?.[convertColumnType(columnType)];
    switch (ruleItem) {
      case RuleItem.CHAR: {
        return charConvertServerDataToFormData(column);
      }
      case RuleItem.DATE: {
        return dateConvertServerDataToFormData(column);
      }
      case RuleItem.INTERVAL_DAY_TO_SECOND:
      case RuleItem.INTERVAL_YEAR_TO_MONTH: {
        return intervalConvertServerDataToFormData(column);
      }
      case RuleItem.NUMBER: {
        return numberConvertServerDataToFormData(column);
      }
      default: {
        return otherConvertServerDataToFormData(column);
      }
    }
  }) as any;
}
