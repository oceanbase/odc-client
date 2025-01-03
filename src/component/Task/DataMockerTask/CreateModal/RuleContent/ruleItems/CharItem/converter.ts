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

import { IMockFormColumn } from '@/component/Task/DataMockerTask/CreateModal/type';
import { IServerMockColumn, MockGenerator } from '@/d.ts';
import { convertColumnType } from '@/util/utils';
import BigNumber from 'bignumber.js';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { getOrderWithSign, getSignWithOrder, getTimeZone } from '../../util';
import { CharRuleType } from './index';

export const ruleTypeToGenerator = {
  [CharRuleType.NORMAL_TEXT]: MockGenerator.FIX_CHAR_GENERATOR,
  [CharRuleType.RANDOM_TEXT]: MockGenerator.RANDOM_GENERATOR,
  [CharRuleType.REGEXP_TEXT]: MockGenerator.REGEXP_GENERATOR,
  [CharRuleType.RANDOM_BOOL]: MockGenerator.BOOL_CHAR_GENERATOR,
  [CharRuleType.NORMAL_BOOL]: MockGenerator.BOOL_CHAR_GENERATOR,
  [CharRuleType.NORMAL_DATE]: MockGenerator.FIX_DATE_GENERATOR,
  [CharRuleType.RANDOM_DATE]: MockGenerator.RANDOM_DATE_GENERATOR,
  [CharRuleType.RANDOM_NUMBER]: MockGenerator.UNIFORM_GENERATOR,
  [CharRuleType.ORDER_DATE]: MockGenerator.STEP_DATE_GENERATOR,
  [CharRuleType.ORDER_NUMBER]: MockGenerator.STEP_GENERATOR,
  [CharRuleType.NORMAL_NUMBER]: MockGenerator.FIX_GENERATOR,
  [CharRuleType.NULL]: MockGenerator.NULL_GENERATOR,
  [CharRuleType.SKIP]: MockGenerator.SKIP_GENERATOR,
};
const g2r = {};
Object.entries(ruleTypeToGenerator).forEach(([key, value]) => {
  g2r[value] = key;
});

function generatorToRuleType(column: IServerMockColumn): CharRuleType {
  const generator = column?.typeConfig?.generator;
  switch (generator) {
    case MockGenerator.BOOL_CHAR_GENERATOR: {
      return column?.typeConfig?.genParams?.fixText
        ? CharRuleType.NORMAL_BOOL
        : CharRuleType.RANDOM_BOOL;
    }
    default: {
      return g2r[generator];
    }
  }
}

export function convertFormDataToServerData(formData: IMockFormColumn): IServerMockColumn {
  let lowValue, highValue;
  let generator = ruleTypeToGenerator[formData.rule];
  formData = cloneDeep(formData);
  let genParams = formData?.typeConfig?.genParams;

  switch (formData.rule) {
    case CharRuleType.RANDOM_TEXT: {
      lowValue = parseInt(formData.typeConfig.range[0]);
      highValue = parseInt(formData.typeConfig.range[1]);
      break;
    }
    case CharRuleType.RANDOM_NUMBER: {
      lowValue = formData.typeConfig.range[0];
      highValue = formData.typeConfig.range[1];
      break;
    }
    case CharRuleType.RANDOM_DATE: {
      lowValue = (formData.typeConfig.range[0] as moment.Moment)?.valueOf?.();
      highValue = (formData.typeConfig.range[1] as moment.Moment)?.valueOf?.();
      if (!genParams) {
        genParams = {};
      }
      genParams.timezone = getTimeZone(formData.typeConfig.range[0]);
      break;
    }
    case CharRuleType.ORDER_DATE: {
      lowValue = (formData.typeConfig.lowValue as moment.Moment)?.valueOf?.();
      genParams.step = getSignWithOrder(formData.typeConfig.order) * parseInt(genParams.step);
      genParams.timeUnit = 'DAYS';
      genParams.timezone = getTimeZone(formData.typeConfig.lowValue);
      break;
    }
    case CharRuleType.ORDER_NUMBER: {
      lowValue = formData.typeConfig.lowValue;
      genParams.step = new BigNumber(genParams.step)
        .multipliedBy(getSignWithOrder(formData.typeConfig.order))
        .toString();
      break;
    }
    case CharRuleType.NORMAL_DATE: {
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
      width: formData.columnObj.width,
    },
  };
}
export function convertServerDataToFormData(formData: IServerMockColumn): IMockFormColumn {
  let rule = generatorToRuleType(formData);
  formData = cloneDeep(formData);
  let genParams = formData?.typeConfig?.genParams;
  let lowValue: string | number | moment.Moment = formData.typeConfig.lowValue;
  let highValue = formData.typeConfig.highValue;
  let range;
  let order;

  switch (rule) {
    case CharRuleType.RANDOM_TEXT:
    case CharRuleType.RANDOM_NUMBER: {
      range = [lowValue, highValue];
      break;
    }
    case CharRuleType.RANDOM_DATE: {
      range = [moment(lowValue), moment(highValue)];
      break;
    }
    case CharRuleType.ORDER_DATE: {
      lowValue = moment(lowValue);
      order = getOrderWithSign(genParams.step);
      genParams.step =
        new BigNumber(genParams.step).comparedTo(0) === 1
          ? new BigNumber(genParams.step).toString()
          : new BigNumber(genParams.step).multipliedBy(-1).toString();
      break;
    }
    case CharRuleType.ORDER_NUMBER: {
      order = getOrderWithSign(genParams.step);
      genParams.step =
        new BigNumber(genParams.step).comparedTo(0) === 1
          ? new BigNumber(genParams.step).toString()
          : new BigNumber(genParams.step).multipliedBy(-1).toString();
      break;
    }
    case CharRuleType.NORMAL_DATE: {
      genParams.timestamp = moment(genParams.timestamp);
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
