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

import { SyncOutlined } from '@ant-design/icons';
import { Cascader, Space } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { FilterContent, OperationContent, TitleContent } from './component';
import styles from './index.less';
import type {
  ICascaderContent,
  IFilterContent,
  IOperationContent,
  ITableLoadOptions,
  ITitleContent,
} from './interface';

interface IProps {
  loading: boolean;
  titleContent: ITitleContent;
  filterContent: IFilterContent;
  cascaderContent?: ICascaderContent;
  operationContent: IOperationContent;
  isSplit: boolean;
  params: ITableLoadOptions;
  enabledReload?: boolean;
  onFilterChange: (name: string, value: any) => void;
  onSearchChange: (value: string) => void;
  onTabChange: (value: string) => void;
  onReload: (args?: ITableLoadOptions) => void;
  onOperationClick: (fn: (args?: ITableLoadOptions) => void) => void;
}

export const Toolbar: React.FC<IProps> = (props) => {
  const {
    titleContent,
    filterContent,
    operationContent,
    cascaderContent,
    isSplit,
    loading,
    params,
    enabledReload = true,
    onReload,
    onFilterChange,
    onSearchChange,
    onTabChange,
    onOperationClick,
  } = props;
  return (
    <Space className={classNames(styles.toolBar, 'odc-commontable-toolbar')}>
      {operationContent && <OperationContent {...operationContent} onClick={onOperationClick} />}
      {titleContent && <TitleContent {...titleContent} onTabChange={onTabChange} />}
      <Space split={isSplit ? '|' : null} size={16}>
        {cascaderContent && <Cascader {...cascaderContent} multiple maxTagCount="responsive" />}
        {filterContent && (
          <FilterContent
            {...filterContent}
            params={params}
            onFilterChange={onFilterChange}
            onSearchChange={onSearchChange}
          />
        )}
        {enabledReload && (
          <SyncOutlined
            className={styles.cursor}
            onClick={() => {
              onReload();
            }}
            spin={loading}
          />
        )}
      </Space>
    </Space>
  );
};
