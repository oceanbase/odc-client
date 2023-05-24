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
