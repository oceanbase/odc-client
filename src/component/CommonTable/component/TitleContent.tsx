import { SyncOutlined } from '@ant-design/icons';
import { Radio, Space } from 'antd';
import React from 'react';
import styles from '../index.less';
import type { ITableLoadOptions, ITitleContent } from '../interface';

interface IProps extends ITitleContent {
  loading: boolean;
  onTabChange: (value: string) => void;
  onReload: (args?: ITableLoadOptions) => void;
}

export const TitleContent: React.FC<IProps> = (props) => {
  const {
    tabs,
    title = '',
    description = '',
    wrapperClass,
    enabledReload = true,
    loading,
  } = props ?? {};
  return (
    <Space className={styles.titleContent}>
      {!!tabs && (
        <Radio.Group
          value={tabs.value || tabs?.options?.[0]?.value}
          options={tabs.options}
          onChange={(e) => {
            props.onTabChange(e.target.value);
          }}
          optionType="button"
        />
      )}
      {!!title && <div className={`${styles.title} ${wrapperClass}`}>{title}</div>}
      {!!description && <span className={styles.desc}>{description}</span>}
      {enabledReload && (
        <SyncOutlined
          className={styles.cursor}
          onClick={() => {
            props.onReload();
          }}
          spin={loading}
        />
      )}
    </Space>
  );
};
