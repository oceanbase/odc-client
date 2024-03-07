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
  className?: string;
}> = (props) => {
  const { label, content, direction = 'row', className = '' } = props;
  return (
    <div
      className={className}
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
