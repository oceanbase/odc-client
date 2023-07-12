import { formatMessage } from '@/util/intl';
import { Space } from 'antd';
import React from 'react';

export interface ITaskStatus {
  icon: React.ReactNode;
  text: string;
}

export const SimpleTextItem: React.FC<{
  label: React.ReactNode;
  content: React.ReactNode;
  direction?: 'row' | 'column';
}> = (props) => {
  const { label, content, direction = 'row' } = props;
  return (
    <div
      style={{
        display: 'flex',
        fontSize: 12,
        lineHeight: '20px',
        flexDirection: direction,
      }}
    >
      <div
        style={{
          flexGrow: 0,
          flexShrink: 0,
          color: 'var(--text-color-primary)',
          marginBottom: direction === 'column' ? '8px' : 0,
        }}
      >
        {formatMessage(
          {
            id: 'odc.component.TaskDetailDrawer.TaskInfo.Label',
          },

          { label },
        )}
      </div>
      <div
        style={{
          flexGrow: 1,
          wordBreak: 'break-all',
          color: 'var(--text-color-secondary)',
        }}
      >
        {content}
      </div>
    </div>
  );
};

export const TaskStatus: React.FC<ITaskStatus> = (props) => {
  return (
    <Space
      style={{
        fontSize: 12,
      }}
    >
      <span>{props.icon}</span>
      <span>{props.text}</span>
    </Space>
  );
};
