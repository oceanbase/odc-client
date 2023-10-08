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

import { ConnectTypeText } from '@/constant/label';
import { ConnectType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { CloseOutlined, FilterOutlined } from '@ant-design/icons';
import { Popover, Space, Typography } from 'antd';
import React, { useContext } from 'react';
import ParamContext from '../../ParamContext';
import FilterIcon from '../FIlterIcon';
import { getAllConnectTypes } from '@/common/datasource';
import { IDataSourceType } from '@/d.ts/datasource';
import CheckboxTag from '@/component/CheckboxTag';

interface IProps {}

const Filter: React.FC<IProps> = function ({}) {
  const context = useContext(ParamContext);
  let displayDom = (
    <FilterIcon>
      <FilterOutlined />
    </FilterIcon>
  );

  function clear() {
    context.setConnectType([]);
  }
  const { connectType } = context;
  let selectedNames = [];
  connectType?.forEach((c) => {
    selectedNames.push(ConnectTypeText[c]);
  });
  if (selectedNames.length) {
    displayDom = (
      <div
        style={{
          padding: '4px 8px',
          lineHeight: '20px',
          color: 'var(--text-color-secondary)',
          background: 'var(--hover-color)',
        }}
      >
        {selectedNames.slice(0, 3)?.join(';')}
        {selectedNames?.length > 3 ? '...' : ''}
        <span style={{ marginLeft: 3 }}>
          {formatMessage({ id: 'odc.Header.Filter.Total' }) /*共*/}
          {selectedNames?.length}
          {formatMessage({ id: 'odc.Header.Filter.Item' }) /*项*/}
        </span>
        <CloseOutlined onClick={clear} style={{ cursor: 'pointer', marginLeft: 15 }} />
      </div>
    );
  }

  return (
    <Popover
      placement="bottomRight"
      overlayStyle={{ width: 300 }}
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography.Text strong>
            {formatMessage({ id: 'odc.Header.Filter.FilterDataSources' }) /*筛选数据源*/}
          </Typography.Text>
          <a onClick={clear}>{formatMessage({ id: 'odc.Header.Filter.Clear' }) /*清空*/}</a>
        </div>
      }
      content={
        <div>
          <Space direction="vertical" size={16}>
            <Space direction="vertical" size={5}>
              <Typography.Text type="secondary">
                {formatMessage({ id: 'odc.Header.Filter.Type' }) /*类型*/}
              </Typography.Text>
              <CheckboxTag
                value={context?.connectType}
                options={[]
                  .concat(getAllConnectTypes())
                  .map((v) => ({ label: ConnectTypeText[v], value: v }))}
                onChange={(v) => {
                  context.setConnectType(v as ConnectType[]);
                }}
              />
            </Space>
          </Space>
        </div>
      }
    >
      {displayDom}
    </Popover>
  );
};

export default Filter;
