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
import { convertColumnType } from '@/util/data/string';
import BigNumber from 'bignumber.js';
import { cloneDeep, isNil } from 'lodash';
import dayjs from 'dayjs';
import { getOrderWithSign, getSignWithOrder } from '../../util';
import { NumberRuleType } from './index';

export const ruleTypeToGenerator = {
  [NumberRuleType.NORMAL]: MockGenerator.FIX_GENERATOR,
  [NumberRuleType.ORDER]: MockGenerator.STEP_GENERATOR,
  [NumberRuleType.RANDOM]: MockGenerator.UNIFORM_GENERATOR,
  [NumberRuleType.NULL]: MockGenerator.NULL_GENERATOR,
  [NumberRuleType.SKIP]: MockGenerator.SKIP_GENERATOR,
};
const g2r = {};
Object.entries(ruleTypeToGenerator).forEach(([key, value]) => {
  g2r[value] = key;
});

function generatorToRuleType(column: IServerMockColumn): NumberRuleType {
  const generator = column.typeConfig.generator;
  return g2r[generator];
}

export function convertFormDataToServerData(formData: IMockFormColumn): IServerMockColumn {
  let lowValue, highValue;
  let generator = ruleTypeToGenerator[formData.rule];
  formData = cloneDeep(formData);
  let genParams = formData?.typeConfig?.genParams;

  switch (formData.rule) {
    case NumberRuleType.RANDOM: {
      lowValue = formData.typeConfig.range[0];
      highValue = formData.typeConfig.range[1];
      break;
    }
    case NumberRuleType.ORDER: {
      lowValue = formData.typeConfig.lowValue;
      genParams.step = new BigNumber(genParams.step)
        .multipliedBy(getSignWithOrder(formData.typeConfig.order))
        .toString();
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
      precision: isNil(formData.columnObj.precision) ? 38 : formData.columnObj.precision,
      scale: isNil(formData.columnObj.scale) ? 0 : formData.columnObj.scale,
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
    case NumberRuleType.RANDOM: {
      range = [lowValue, highValue];
      break;
    }
    case NumberRuleType.ORDER: {
      order = getOrderWithSign(genParams.step);
      genParams.step =
        new BigNumber(genParams.step).comparedTo(0) === 1
          ? new BigNumber(genParams.step).toString()
          : new BigNumber(genParams.step).multipliedBy(-1).toString();
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
