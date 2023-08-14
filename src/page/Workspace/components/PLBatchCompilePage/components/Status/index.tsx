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

import { formatMessage } from '@/util/intl';
import { CheckCircleFilled, InfoCircleFilled } from '@ant-design/icons';
import { Tooltip, Typography } from 'antd';
import React from 'react';

export const Status: React.FC<{
  status: string;
  errorMessage?: string;
  isShowErrorTooltip?: boolean;
}> = (props) => {
  const { status, errorMessage, isShowErrorTooltip = true } = props;
  const ValidIcon = <CheckCircleFilled style={{ color: '#52c41a' }} />;
  const InvalidIcon = isShowErrorTooltip ? (
    <Tooltip
      placement="right"
      title={
        <Typography.Paragraph
          style={{ color: '#fff', marginBottom: 0 }}
          ellipsis={{
            rows: 5,
            expandable: true,
            symbol: formatMessage({ id: 'odc.components.Status.More' }), //更多
          }}
        >
          {errorMessage}
        </Typography.Paragraph>
      }
    >
      <InfoCircleFilled
        style={{
          color: '#FAAD14',
        }}
      />
    </Tooltip>
  ) : (
    <InfoCircleFilled
      style={{
        color: '#FAAD14',
      }}
    />
  );

  return status !== 'INVALID' ? ValidIcon : InvalidIcon;
};
