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

import FilterIcon from '@/component/Button/FIlterIcon';
import { formatMessage } from '@/util/intl';
import { Popover, Space, Typography } from 'antd';
import Icon, { FilterOutlined } from '@ant-design/icons';
import React from 'react';
import CheckboxTag from '@/component/CheckboxTag';
import { ConnectType } from '@/d.ts';
import { getAllConnectTypes } from '@/common/datasource';
import { ConnectTypeText } from '@/constant/label';
import { useRequest } from 'ahooks';
import { listEnvironments } from '@/common/network/env';
interface IProps {
  onClear: () => void;
  types: ConnectType[];
  onTypesChange: (types: ConnectType[]) => void;
  envs: number[];
  onEnvsChange: (envs: number[]) => void;
  iconStyle?: React.CSSProperties;
}
const DatasourceFilter: React.FC<IProps> = function ({
  iconStyle,
  types,
  envs,
  onClear,
  onTypesChange,
  onEnvsChange,
}) {
  const { data, run } = useRequest(listEnvironments, {
    manual: true,
  });
  const isFiltered = !!envs?.length || !!types?.length;
  return (
    <Popover
      placement="bottomRight"
      overlayStyle={{
        width: 300,
      }}
      onOpenChange={(v) => v && run()}
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 5,
          }}
        >
          <Typography.Text strong>
            {
              formatMessage({
                id: 'odc.Header.Filter.FilterDataSources',
              }) /*筛选数据源*/
            }
          </Typography.Text>
          <a onClick={onClear}>
            {
              formatMessage({
                id: 'odc.Header.Filter.Clear',
              }) /*清空*/
            }
          </a>
        </div>
      }
      content={
        <div>
          <Space direction="vertical" size={16}>
            <Space direction="vertical" size={5}>
              <Typography.Text type="secondary">
                {
                  formatMessage({
                    id: 'odc.Header.Filter.Type',
                  }) /*类型*/
                }
              </Typography.Text>
              <CheckboxTag
                value={types}
                options={[].concat(getAllConnectTypes()).map((v) => ({
                  label: ConnectTypeText[v],
                  value: v,
                }))}
                onChange={(v) => {
                  onTypesChange(v as ConnectType[]);
                }}
              />
            </Space>
            <Space direction="vertical" size={5}>
              <Typography.Text type="secondary">
                {
                  formatMessage({
                    id: 'odc.src.page.Workspace.SideBar.ResourceTree.DatasourceFilter.Environment',
                  }) /* 环境 */
                }
              </Typography.Text>
              <CheckboxTag
                value={envs}
                options={
                  data?.map((v) => ({
                    label: v.name,
                    value: v.id,
                  })) || []
                }
                onChange={(v) => {
                  onEnvsChange(v as number[]);
                }}
              />
            </Space>
          </Space>
        </div>
      }
    >
      <FilterIcon isActive={isFiltered}>
        <Icon style={iconStyle} component={FilterOutlined} />
      </FilterIcon>
    </Popover>
  );
};
export default DatasourceFilter;
