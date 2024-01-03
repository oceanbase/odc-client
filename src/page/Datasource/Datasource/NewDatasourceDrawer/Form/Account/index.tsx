/*
 * Copyright 2024 OceanBase
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

import { IConnectionTestErrorType } from '@/d.ts';
import { Typography } from 'antd';
import { ValidateStatus } from 'antd/es/form/FormItem';
import React from 'react';
import PrivateAccount from './PrivateAccount';

export interface IStatus {
  status: ValidateStatus;
  errorMessage: string;
}

export interface IConnectionTestResponseData {
  active: boolean;
  errorCode: IConnectionTestErrorType;
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
  isEdit: boolean;
}

const Account: React.FC<IProps> = function (props) {
  const { isEdit } = props;

  return <PrivateAccount isEdit={isEdit} />;
};

export default Account;
