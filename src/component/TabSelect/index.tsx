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
import { Select, Space, Tabs } from 'antd';
import styles from './index.less';
import { ReactComponent as ProjectSvg } from '@/svgr/project_space.svg';
import { ProjectTabType } from '@/d.ts/project';

interface ITabSelectProps {
  defaultValue?: string | number;
  value?: string | number;
  icon: any;
  iconColor?: string;
  options: {
    value: string | number;
    label: string;
  }[];
  onSelectTabChange?: (value: ProjectTabType) => void;
  onChange?: (value: string | number) => void;
  onDropdownVisibleChange?: (v: boolean) => void;
  bottom?: React.ReactNode;
  projectType: ProjectTabType;
  loading?: boolean;
  tabOption: {
    label: string;
    value: ProjectTabType;
  }[];
}
const TabSelect: React.FC<ITabSelectProps> = (props) => {
  const {
    defaultValue,
    options,
    bottom,
    icon,
    iconColor,
    onChange,
    onDropdownVisibleChange,
    projectType,
    onSelectTabChange,
    tabOption,
    loading,
  } = props;

  return (
    <Space size={12} className={styles['select-wrapper']}>
      <div className={styles.logo}>
        <Icon component={icon || ProjectSvg} style={{ color: iconColor }} />
      </div>
      <Select
        className={styles.select}
        defaultValue={defaultValue}
        onDropdownVisibleChange={onDropdownVisibleChange}
        bordered={false}
        options={options}
        dropdownMatchSelectWidth={280}
        onChange={onChange}
        listHeight={170}
        loading={loading}
        dropdownRender={(menu) => (
          <div className={styles.selectContentTabSelect}>
            <Tabs
              activeKey={projectType}
              className={styles['page-container-title-tab']}
              items={tabOption?.map(({ label, value }) => {
                return {
                  key: value?.toString(),
                  label: label,
                };
              })}
              onChange={(v: ProjectTabType) => {
                onSelectTabChange(v);
              }}
            />
            {menu}
            {bottom ? <div className={styles['select-footer']}>{bottom}</div> : null}
          </div>
        )}
      />
    </Space>
  );
};

export default TabSelect;
