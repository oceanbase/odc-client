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
import TabSelect from '@/component/TabSelect';
import { Tabs } from 'antd';
import classnames from 'classnames';
import { CSSProperties, ReactNode } from 'react';
import styles from './index.less';
import { ProjectTabType } from '@/d.ts/project';

export enum TitleType {
  TEXT = 'text',
  TAB = 'tab',
  SELECT = 'select',
  TAB_SELECT = 'tab_select',
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
    loading?: boolean;
    SelectTab?: ProjectTabType;
    onSelectTabChange?: (value: ProjectTabType) => void;
    onDropdownVisibleChange?: (v: boolean) => void;
    SelectTabOptions?: {
      label: string;
      value: ProjectTabType;
    }[];
  };
  containerWrapStyle?: CSSProperties;
  tabList?: { key: string; tab: ReactNode }[];
  tabActiveKey?: string;
  tabBarExtraContent?: ReactNode;
  onTabChange?: (key) => void;
  icon?: any;
  iconColor?: string;
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
    iconColor,
    onTabChange,
    containerWrapStyle = {},
  } = props;
  const {
    title,
    type,
    options,
    defaultValue,
    showDivider,
    onChange,
    onDropdownVisibleChange,
    SelectTab,
    onSelectTabChange,
    SelectTabOptions,
    loading,
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
            activeKey={tabActiveKey?.toString()}
            tabBarExtraContent={tabBarExtraContent}
            onChange={onTabChange}
            items={options?.map(({ label, value }) => {
              return {
                key: value?.toString(),
                label: label,
              };
            })}
          />
        )}
        {type === TitleType.TEXT && <div className={styles.title}>{title}</div>}
        {type === TitleType.SELECT && (
          <BigSelect
            bottom={bigSelectBottom}
            defaultValue={defaultValue}
            options={options}
            icon={icon}
            iconColor={iconColor}
            onChange={onChange}
            onDropdownVisibleChange={onDropdownVisibleChange}
          />
        )}
        {type === TitleType.TAB_SELECT && (
          <TabSelect
            bottom={bigSelectBottom}
            defaultValue={defaultValue}
            onSelectTabChange={onSelectTabChange}
            options={options}
            icon={icon}
            iconColor={iconColor}
            onChange={onChange}
            projectType={SelectTab}
            tabOption={SelectTabOptions}
            onDropdownVisibleChange={onDropdownVisibleChange}
            loading={loading}
          />
        )}
      </div>
      {tabList?.length > 0 && (
        <Tabs
          activeKey={tabActiveKey}
          tabBarExtraContent={tabBarExtraContent}
          onChange={onTabChange}
          items={tabList?.map(({ tab, key }) => {
            return {
              key,
              label: tab,
            };
          })}
        />
      )}
      <div className={styles['page-container-main']} style={containerWrapStyle}>
        {props?.children}
      </div>
    </div>
  );
};

export default PageContainer;
