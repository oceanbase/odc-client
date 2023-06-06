import Icon from '@ant-design/icons';
import { Space, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { ReactElement, useState } from 'react';

import styles from './index.less';

interface IActionProps {
  onAction: (key: string) => void;
}

export interface ITab {
  title: string;
  key: string;
  actions: {
    title: string;
    icon: React.ComponentType;
    key: string;
    onClick: () => void;
  }[];
  render: () => ReactElement;
}

interface IProps {
  tabs: ITab[];
}

export default function SideTabs({ tabs }: IProps) {
  const [selectTabKey, setSelectTabKey] = useState<string>(tabs?.[0]?.key);
  const selectTab: ITab = tabs.find((tab) => tab.key === selectTabKey);
  return (
    <div className={styles.sidetabs}>
      <div className={styles.header}>
        <Space size={12} className={styles.tabs}>
          {tabs.map((tab) => {
            const isSelect = tab.key === selectTabKey;
            return (
              <div
                onClick={() => {
                  if (isSelect) {
                    return;
                  }
                  setSelectTabKey(tab.key);
                }}
                className={classNames(styles.tab, { [styles.select]: isSelect })}
              >
                {tab.title}
              </div>
            );
          })}
        </Space>
        <Space size={10} className={styles.actions}>
          {selectTab?.actions?.map((action) => {
            return (
              <Tooltip title={action.title}>
                <Icon
                  onClick={action.onClick}
                  className={styles.acion}
                  component={action.icon}
                  key={action.key}
                />
              </Tooltip>
            );
          })}
        </Space>
      </div>
      <div className={styles.content}>{selectTab?.render?.()}</div>
    </div>
  );
}
