import { Space } from 'antd';
import React from 'react';

interface IProps {
  tip?: string;
  extra?: React.ReactElement;
}

const Title: React.FC<IProps> = function ({ children, tip, extra }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        lineHeight: '24px',
        padding: '16px 0px',
      }}
    >
      <span style={{ color: 'var(--text-color-inverse)', fontSize: 16, fontWeight: 600 }}>
        {children}
      </span>
      <Space>
        <span style={{ color: 'var(--text-color-secondary)' }}>{tip}</span>
        {extra}
      </Space>
    </div>
  );
};

export default Title;
