import { formatMessage } from '@/util/intl';
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

import { DatabasePermissionStatus } from '@/d.ts/project';
import HelpDoc from '@/component/helpDoc';
import { ExclamationCircleFilled, StopFilled, CheckCircleFilled } from '@ant-design/icons';
import { Space } from 'antd';
import React from 'react';

export const databasePermissionStatusMap = {
  [DatabasePermissionStatus.EXPIRED]: {
    text: formatMessage({ id: 'src.page.Project.User.ManageModal.Status.F648282E' }), //'已过期'
    value: DatabasePermissionStatus.EXPIRED,
    icon: (
      <StopFilled
        style={{
          color: 'var(--icon-color-disable)',
        }}
      />
    ),
  },
  [DatabasePermissionStatus.EXPIRING]: {
    text: formatMessage({ id: 'src.page.Project.User.ManageModal.Status.CDAFC981' }), //'即将过期'
    value: DatabasePermissionStatus.EXPIRING,
    icon: (
      <ExclamationCircleFilled
        style={{
          color: 'var(--icon-orange-color)',
        }}
      />
    ),
  },
  [DatabasePermissionStatus.NOT_EXPIRED]: {
    text: formatMessage({ id: 'src.page.Project.User.ManageModal.Status.F7C8A70D' }), //'生效中'
    value: DatabasePermissionStatus.NOT_EXPIRED,
    icon: <CheckCircleFilled style={{ color: 'var(--icon-green-color)' }} />,
  },
};

interface IProps {
  status: DatabasePermissionStatus;
}

const StatusLabel: React.FC<IProps> = (props) => {
  const { status } = props;
  const statusInfo: {
    icon: React.ReactNode;
    text: string;
    [key: string]: any;
  } = databasePermissionStatusMap[status];

  return (
    <Space
      style={{
        overflow: 'hidden',
        maxWidth: '100%',
      }}
      size={5}
    >
      {statusInfo ? (
        <>
          {statusInfo.icon}
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              maxWidth: '100%',
            }}
          >
            {statusInfo.text}
          </span>
          {status === DatabasePermissionStatus.EXPIRING && (
            <HelpDoc leftText isTip doc="ApplyDatabasePermissionExpiringTip" />
          )}
        </>
      ) : null}
    </Space>
  );
};
export default StatusLabel;
