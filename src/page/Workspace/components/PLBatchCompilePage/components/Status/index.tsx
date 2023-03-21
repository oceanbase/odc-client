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
