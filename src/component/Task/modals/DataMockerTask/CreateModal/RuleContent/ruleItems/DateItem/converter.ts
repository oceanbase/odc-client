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

import { IMockFormColumn } from '@/component/Task/modals/DataMockerTask/CreateModal/type';
import { IServerMockColumn, MockGenerator } from '@/d.ts';
import { convertColumnType } from '@/util/utils';
import BigNumber from 'bignumber.js';
import { cloneDeep } from 'lodash';
import dayjs from 'dayjs';
import { getOrderWithSign, getSignWithOrder, getTimeZone } from '../../util';
import { DateRuleType } from './index';

export const ruleTypeToGenerator = {
  [DateRuleType.NORMAL]: MockGenerator.FIX_DATE_GENERATOR,
  [DateRuleType.ORDER]: MockGenerator.STEP_DATE_GENERATOR,
  [DateRuleType.RANDOM]: MockGenerator.RANDOM_DATE_GENERATOR,
  [DateRuleType.NULL]: MockGenerator.NULL_GENERATOR,
  [DateRuleType.SKIP]: MockGenerator.SKIP_GENERATOR,
};

const g2r = {};
Object.entries(ruleTypeToGenerator).forEach(([key, value]) => {
  g2r[value] = key;
});

function generatorToRuleType(column: IServerMockColumn): DateRuleType {
  const generator = column.typeConfig.generator;
  return g2r[generator];
}

export function convertFormDataToServerData(formData: IMockFormColumn): IServerMockColumn {
  let lowValue, highValue;
  let generator = ruleTypeToGenerator[formData.rule];
  formData = cloneDeep(formData);
  let genParams = formData?.typeConfig?.genParams;

  switch (formData.rule) {
    case DateRuleType.RANDOM: {
      lowValue = (formData.typeConfig.range[0] as dayjs.Dayjs)?.valueOf?.();
      highValue = (formData.typeConfig.range[1] as dayjs.Dayjs)?.valueOf?.();
      if (!genParams) {
        genParams = {};
      }
      genParams.timezone = getTimeZone(formData.typeConfig.range[0]);
      break;
    }
    case DateRuleType.ORDER: {
      lowValue = (formData.typeConfig.lowValue as dayjs.Dayjs)?.valueOf?.();
      genParams.step = getSignWithOrder(formData.typeConfig.order) * parseInt(genParams.step);
      genParams.timeUnit = 'DAYS';
      genParams.timezone = getTimeZone(formData.typeConfig.lowValue);
      break;
    }
    case DateRuleType.NORMAL: {
      genParams.timestamp = genParams.timestamp?.valueOf?.();
      genParams.timezone = getTimeZone(genParams.timestamp);
      break;
    }
  }
  return {
    columnName: formData.columnName,
    typeConfig: {
      columnType: convertColumnType(formData.columnType),
      lowValue,
      highValue,
      genParams,
      generator,
      scale: formData.columnObj.scale,
    },
  };
}

export function convertServerDataToFormData(formData: IServerMockColumn): IMockFormColumn {
  let rule = generatorToRuleType(formData);
  formData = cloneDeep(formData);
  let genParams = formData?.typeConfig?.genParams;
  let lowValue: string | number | dayjs.Dayjs = formData.typeConfig.lowValue;
  let highValue = formData.typeConfig.highValue;
  let range;
  let order;

  switch (rule) {
    case DateRuleType.RANDOM: {
      range = [dayjs(lowValue), dayjs(highValue)];
      break;
    }
    case DateRuleType.ORDER: {
      lowValue = dayjs(lowValue);
      order = getOrderWithSign(genParams.step);
      genParams.step =
        new BigNumber(genParams.step).comparedTo(0) === 1
          ? new BigNumber(genParams.step).toString()
          : new BigNumber(genParams.step).multipliedBy(-1).toString();
      break;
    }
    case DateRuleType.NORMAL: {
      genParams.timestamp = dayjs(genParams.timestamp);
      break;
    }
  }
  return {
    columnName: formData.columnName,
    columnType: formData.typeConfig.columnType,
    rule,
    typeConfig: {
      lowValue,
      range,
      genParams,
      order,
    },
  };
}
