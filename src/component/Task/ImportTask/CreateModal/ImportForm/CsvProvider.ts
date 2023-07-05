import type { CsvColumnMapping } from '@/d.ts';
import React from 'react';

const CsvProvider = React.createContext<{
  csvColumnMappings?: CsvColumnMapping[];
  onChangeCsvColumnMappings?: (csvColumnMappings: CsvColumnMapping[]) => void;
  csvMappingErrors?: {
    errorMsg: string;
    errorIndex: number;
  }[];
}>({});

export default CsvProvider;
