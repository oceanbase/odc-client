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

import Icon from '@ant-design/icons';
import { Space } from 'antd';
import classNames from 'classnames';
import React, { ReactElement, useRef } from 'react';

import Action from '@/component/Action';
import { useControllableValue } from 'ahooks';
import styles from './index.less';

interface IActionProps {
  onAction: (key: string) => void;
}

export interface ITab {
  title: React.ReactNode;
  key: string;
  actions: (
    | {
        title: string;
        icon: React.ComponentType;
        key: string;
        onClick: () => Promise<void> | void;
      }
    | { render: () => React.ReactElement }
  )[];
  render: () => ReactElement;
  groupSize?: number;
}

interface IProps {
  tabs: ITab[];
  selectTabKey?: string;
  leftAction?: React.ReactNode;
  setSelectTabKey?: (v: string) => void;
}

export default function SideTabs(props: IProps) {
  const tabs = props.tabs;
  const [selectTabKey, setSelectTabKey] = useControllableValue(props, {
    defaultValue: tabs?.[0]?.key,
    valuePropName: 'selectTabKey',
    trigger: 'setSelectTabKey',
  });
  const loadedKeys = useRef<Set<string>>(new Set());
  const selectTab: ITab = tabs.find((tab) => tab.key === selectTabKey);
  loadedKeys.current.add(selectTabKey);

  return (
    <div className={styles.sidetabs}>
      <div className={styles.header}>
        <Space size={12} className={styles.tabs}>
          {props.leftAction}
          {tabs.map((tab) => {
            const isSelect = tab.key === selectTabKey;
            return (
              <div
                key={tab.key}
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
        <Action.Group size={selectTab.groupSize}>
          {selectTab?.actions?.map((action) => {
            if ('render' in action) {
              return action.render();
            }
            return (
              <Action.Link replaceLoading={true} key={action.key} onClick={action.onClick}>
                <Icon className={styles.acion} component={action.icon} />
              </Action.Link>
            );
          })}
        </Action.Group>
      </div>
      <div className={styles.content}>
        {tabs
          .map((tab) => {
            if (loadedKeys.current.has(tab.key) || selectTab.key === tab.key) {
              return (
                <div
                  key={tab.key}
                  className={styles.component}
                  style={{ zIndex: selectTab.key === tab.key ? 'unset' : -9999 }}
                >
                  {tab?.render?.()}
                </div>
              );
            }
            return null;
          })
          .filter(Boolean)}
      </div>
    </div>
  );
}
