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

import { AccountType, IConnectionTestErrorType, IConnectionType } from '@/d.ts';
import { Typography } from 'antd';
import { ValidateStatus } from 'antd/es/form/FormItem';
import React from 'react';
import type { IConnectionTestResponseData } from '../index';
import PrivateAccount from './PrivateAccount';
import PublicAccount from './PublicAccount';

export interface IStatus {
  status: ValidateStatus;
  errorMessage: string;
}

export const ErrorTip: React.FC<{
  status: IStatus;
}> = ({ status }) => {
  return (
    status?.status === 'error' && (
      <div>
        <Typography.Text type="danger">{status?.errorMessage}</Typography.Text>
      </div>
    )
  );
};

interface IProps {
  connectionType: IConnectionType;
  isEdit: boolean;
  isCopy: boolean;
  isOldPasswordSaved: boolean;
  onlySys: boolean;
  baseWidth: number;
  handleChangeFormData: (values: Record<string, any>) => void;
  handleConnectionTest: (
    nameKey: string,
    passwordKey: string,
    accountType: AccountType,
  ) => Promise<IConnectionTestResponseData>;
}

const Account: React.FC<IProps> = function (props) {
  const {
    connectionType,
    isEdit,
    isCopy,
    onlySys,
    baseWidth,
    isOldPasswordSaved,
    handleChangeFormData,
    handleConnectionTest,
  } = props;

  const getStatusByTestResult = (data: IConnectionTestResponseData) => {
    let status = null;
    if (data?.active) {
      status = 'success';
    } else {
      if (
        [
          IConnectionTestErrorType.OB_ACCESS_DENIED,
          IConnectionTestErrorType.OB_MYSQL_ACCESS_DENIED,
        ].includes(data?.errorCode)
      ) {
        status = 'error';
      }
    }
    return {
      status,
      errorMessage: data?.errorMessage,
    };
  };

  return connectionType === IConnectionType.PRIVATE ? (
    <PrivateAccount
      isEdit={isEdit}
      isCopy={isCopy}
      onlySys={onlySys}
      isOldPasswordSaved={isOldPasswordSaved}
      baseWidth={baseWidth}
      handleChangeFormData={handleChangeFormData}
      handleConnectionTest={handleConnectionTest}
      getStatusByTestResult={getStatusByTestResult}
    />
  ) : (
    <PublicAccount
      isEdit={isEdit}
      isCopy={isCopy}
      onlySys={onlySys}
      isOldPasswordSaved={isOldPasswordSaved}
      handleChangeFormData={handleChangeFormData}
      handleConnectionTest={handleConnectionTest}
      getStatusByTestResult={getStatusByTestResult}
    />
  );
};

export default Account;
