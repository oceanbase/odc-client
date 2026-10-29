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

import { IDatasource } from '@/d.ts/datasource';
import { IMaskingAlgorithm } from '@/d.ts/maskingAlgorithm';
import { ISensitiveRule } from '@/d.ts/sensitiveRule';
import { SelectItemProps } from './interface';

import React from 'react';

export interface ISensitiveContext {
  projectId: number;

  maskingAlgorithms: IMaskingAlgorithm[];
  maskingAlgorithmIdMap: {
    [key in any]: string;
  };
  maskingAlgorithmOptions: SelectItemProps[];
  maskingRules: {
    label: string;
    value: string | number;
  }[];

  dataSources: IDatasource[];
  dataSourceIdMap: {
    [key in any]: string;
  };
  tables?: any[];
  sensitiveRules: ISensitiveRule[];
  sensitiveRuleIdMap: {
    [key in any]: string;
  };
  setSensitiveRuleIdMap: (sensitiveRuleIdMap: {
    [key in any]: string;
  }) => void;
}

const SensitiveContext = React.createContext<Partial<ISensitiveContext>>({
  projectId: undefined,
  dataSources: [],
  dataSourceIdMap: {},

  maskingAlgorithms: [],
  maskingAlgorithmIdMap: {},
  maskingAlgorithmOptions: [],

  maskingRules: [],
  tables: [],
  sensitiveRules: [],
  sensitiveRuleIdMap: {},
  setSensitiveRuleIdMap: (sensitiveRuleIdMap = {}) => {},
});

export default SensitiveContext;
