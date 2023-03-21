import { IManagerUserStatus } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { CheckCircleFilled, StopFilled } from '@ant-design/icons';
import { Space } from 'antd';
import React from 'react';

export const COMMON_STATUS: Record<
  string,
  {
    icon: React.ReactNode;
    text: string;
  }
> = {
  [IManagerUserStatus.ACTIVATE]: {
    icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
    text: formatMessage({ id: 'odc.components.CommonStatus.Enable' }), // 启用
  },
  [IManagerUserStatus.DEACTIVATE]: {
    icon: <StopFilled style={{ color: 'var(--text-color-hint)' }} />,
    text: formatMessage({ id: 'odc.components.CommonStatus.Disable' }), // 停用
  },
  [IManagerUserStatus.INACTIVATE]: {
    icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
    text: formatMessage({ id: 'odc.components.CommonStatus.NotActivated' }), // 未激活
  },
};

const Status: React.FC<{
  enabled: boolean;
  showIcon?: boolean;
  isActive?: boolean;
}> = ({ enabled, showIcon = true, isActive = true }) => {
  let status = enabled ? IManagerUserStatus.ACTIVATE : IManagerUserStatus.DEACTIVATE;
  if (!isActive) {
    status = IManagerUserStatus.INACTIVATE;
  }
  return (
    <Space size={5}>
      {showIcon && COMMON_STATUS[status].icon}
      <span>{COMMON_STATUS[status].text}</span>
    </Space>
  );
};

export default Status;
