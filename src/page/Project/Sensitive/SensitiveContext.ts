import { IDatasource } from '@/d.ts/datasource';
import { IMaskingAlgorithm } from '@/d.ts/maskingAlgorithm';
import { ISensitiveRule } from '@/d.ts/sensitiveRule';
import { SelectItemProps } from './interface';

import React from 'react';

interface ISensitiveContext {
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
}

const SensitiveContext = React.createContext<Partial<ISensitiveContext>>({
  dataSources: [],
  dataSourceIdMap: {},

  maskingAlgorithms: [],
  maskingAlgorithmIdMap: {},
  maskingAlgorithmOptions: [],

  maskingRules: [],
  tables: [],
  sensitiveRules: [],
  sensitiveRuleIdMap: {},
});

export default SensitiveContext;
