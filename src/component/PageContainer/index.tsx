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

import BigSelect from '@/component/BigSelect';
import { Tabs } from 'antd';
import classnames from 'classnames';
import { CSSProperties, ReactNode } from 'react';
import styles from './index.less';

export enum TitleType {
  TEXT = 'text',
  TAB = 'tab',
  SELECT = 'select',
}

interface IPageContainerProps {
  titleProps: {
    type: TitleType;
    title?: ReactNode;
    options?: {
      label: string;
      value: string | number;
    }[];
    defaultValue?: string | number;
    showDivider?: boolean;
    onChange?: (value: string) => void;
    onDropdownVisibleChange?: (v: boolean) => void;
  };
  containerWrapStyle?: CSSProperties;
  tabList?: { key: string; tab: ReactNode }[];
  tabActiveKey?: string;
  tabBarExtraContent?: ReactNode;
  onTabChange?: (key) => void;
  icon?: any;
  bigSelectBottom?: React.ReactNode;
}

const PageContainer: React.FC<IPageContainerProps> = (props) => {
  const {
    titleProps,
    tabList,
    tabActiveKey,
    tabBarExtraContent,
    bigSelectBottom,
    icon,
    onTabChange,
    containerWrapStyle,
  } = props;
  const {
    title,
    type,
    options,
    defaultValue,
    showDivider,
    onChange,
    onDropdownVisibleChange,
  } = titleProps;

  return (
    <div className={styles['page-container']}>
      <div
        className={classnames(styles['page-container-header'], {
          [styles['bottom-border']]: showDivider,
        })}
      >
        {type === TitleType.TAB && (
          <Tabs
            className={styles['page-container-title-tab']}
            activeKey={tabActiveKey}
            tabBarExtraContent={tabBarExtraContent}
            onChange={onTabChange}
          >
            {options?.map(({ label, value }) => {
              return <Tabs.TabPane tab={label} key={value} />;
            })}
          </Tabs>
        )}
        {type === TitleType.TEXT && <div className={styles.title}>{title}</div>}
        {type === TitleType.SELECT && (
          <BigSelect
            bottom={bigSelectBottom}
            defaultValue={defaultValue}
            options={options}
            icon={icon}
            onChange={onChange}
            onDropdownVisibleChange={onDropdownVisibleChange}
          />
        )}
      </div>
      {tabList?.length > 0 && (
        <Tabs
          activeKey={tabActiveKey}
          tabBarExtraContent={tabBarExtraContent}
          onChange={onTabChange}
        >
          {tabList?.map(({ tab, key }) => {
            return <Tabs.TabPane tab={tab} key={key} />;
          })}
        </Tabs>
      )}
      <div className={styles['page-container-main']} style={containerWrapStyle}>
        {props?.children}
      </div>
    </div>
  );
};

export default PageContainer;
