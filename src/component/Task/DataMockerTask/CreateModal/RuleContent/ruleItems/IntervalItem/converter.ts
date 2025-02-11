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
import { cloneDeep } from 'lodash';
import { IntervalRuleType } from './index';

export const ruleTypeToGenerator = {
  [IntervalRuleType.NORMAL]: MockGenerator.FIX_CHAR_GENERATOR,
  [IntervalRuleType.SKIP]: MockGenerator.SKIP_GENERATOR,
};

const g2r = {};
Object.entries(ruleTypeToGenerator).forEach(([key, value]) => {
  g2r[value] = key;
});

function generatorToRuleType(column: IServerMockColumn): IntervalRuleType {
  const generator = column.typeConfig.generator;
  return g2r[generator];
}

export function convertFormDataToServerData(formData: IMockFormColumn): IServerMockColumn {
  let lowValue, highValue;
  let generator = ruleTypeToGenerator[formData.rule];
  formData = cloneDeep(formData);
  let genParams = formData?.typeConfig?.genParams;

  return {
    columnName: formData.columnName,
    typeConfig: {
      columnType: convertColumnType(formData.columnType),
      lowValue,
      highValue,
      genParams,
      generator,
      scale: formData.columnObj?.scale,
    },
  };
}

export function convertServerDataToFormData(formData: IServerMockColumn): IMockFormColumn {
  let rule = generatorToRuleType(formData);
  formData = cloneDeep(formData);
  let genParams = formData?.typeConfig?.genParams;
  let range;
  let order;

  return {
    columnName: formData.columnName,
    columnType: formData.typeConfig.columnType,
    rule,
    typeConfig: {
      range,
      genParams,
      order,
    },
  };
}
