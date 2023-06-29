import { ConnectType, IConnectionTestErrorType } from '@/d.ts';
import { IDatasource } from '@/d.ts/datasource';
import { FormInstance } from 'antd';
import React from 'react';

interface IDatasouceFormContext {
  form?: FormInstance<IDatasource>;
  test: () => void;
  isPersonal?: boolean;
  testResult?: {
    active: boolean;
    errorCode: IConnectionTestErrorType;
    errorMessage: string;
    type: ConnectType;
  };
  isEdit?: boolean;
}

const DatasourceFormContext = React.createContext<IDatasouceFormContext>({
  test: () => {},
});

export default DatasourceFormContext;
