import React from 'react';

const SimpleTextItem: React.FC<{
  label: string;
  content: React.ReactNode;
}> = (props) => {
  const { label, content } = props;
  return (
    <div
      style={{
        display: 'flex',
        fontSize: 12,
        lineHeight: '20px',
        marginBottom: 8,
      }}
    >
      <div style={{ flexGrow: 0, flexShrink: 0, color: 'var(--text-color-primary)' }}>
        {label + '：'}
      </div>
      <div
        style={{
          flexGrow: 1,
          wordBreak: 'break-all',
          color: 'var(--text-color-primary)',
        }}
      >
        {content}
      </div>
    </div>
  );
};

export default SimpleTextItem;
