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

import { formatMessage } from '@/util/intl';
import React, { useEffect } from 'react';
import SessionDropdown, { ISessionDropdownFiltersProps } from './SessionDropdown';
import SessionContext from '../context';
import { Divider, Select, Space } from 'antd';
import { useRequest } from 'ahooks';
import { getDatabase } from '@/common/network/database';
import { getConnectionDetail } from '@/common/network/connection';
import Icon from '@ant-design/icons';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { TaskType } from '@/d.ts';
import login from '@/store/login';
import { DEFALT_WIDTH } from './const';

interface IProps {
  value?: number;
  taskType?: TaskType;
  width?: number | string;
  projectId?: number;
  filters?: ISessionDropdownFiltersProps;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: number) => void;
  datasourceMode?: boolean;
}

const SelectItem: React.FC<IProps> = ({
  value,
  taskType,
  projectId,
  filters = null,
  width,
  placeholder = formatMessage({
    id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.66A17FFD',
  }),
  disabled = false,
  onChange,
  datasourceMode = false,
}) => {
  const { data: database, run: runDatabase } = useRequest(getDatabase, {
    manual: true,
  });

  const { data: dataSource, run: runDataSource } = useRequest(getConnectionDetail, {
    manual: true,
  });

  useEffect(() => {
    if (value) {
      if (datasourceMode) {
        runDataSource(value);
      } else {
        runDatabase(value);
      }
    }
  }, [value]);

  const dbIcon = getDataSourceStyleByConnectType(database?.data?.dataSource?.type)?.dbIcon;
  const dataSourceIcon = getDataSourceStyleByConnectType(dataSource?.type)?.icon;

  const getPlaceholder = () => {
    if (!value) return placeholder;
    if (datasourceMode && dataSource) {
      return (
        <Space size={1} style={{ color: 'var(--text-color-primary)', width: '100%' }}>
          <Icon
            component={dataSourceIcon?.component}
            style={{ fontSize: 16, marginRight: 4, verticalAlign: 'textBottom' }}
          />
          {dataSource?.name}
        </Space>
      );
    } else if (!datasourceMode && database?.data) {
      return (
        <Space size={1} style={{ color: 'var(--text-color-primary)', width: '100%' }}>
          <>
            <RiskLevelLabel
              content={database?.data?.environment?.name}
              color={database?.data?.environment?.style}
            />

            <Icon
              component={dbIcon?.component}
              style={{ fontSize: 16, marginRight: 4, verticalAlign: 'textBottom' }}
            />
          </>
          {database?.data?.name}
        </Space>
      );
    }
    return placeholder;
  };
  return (
    <SessionContext.Provider
      value={{
        session: null,
        databaseId: value,
        from: 'datasource',
        datasourceMode: datasourceMode,
        selectSession(databaseId: number, datasourceId: number, from: 'project' | 'datasource') {
          onChange(datasourceMode ? datasourceId : databaseId);
        },
      }}
    >
      <Space style={{ width: '100%' }} direction="vertical">
        <SessionDropdown
          projectId={projectId}
          filters={filters}
          width={width || DEFALT_WIDTH}
          taskType={taskType}
        >
          <Select
            disabled={disabled}
            placeholder={getPlaceholder()}
            style={{ width: width || DEFALT_WIDTH }}
            open={false}
          />
        </SessionDropdown>
        {value && database?.data ? (
          <Space
            size={2}
            split={<Divider type="vertical" />}
            style={{ color: 'var(--text-color-hint)' }}
          >
            {login.isPrivateSpace() ? null : (
              <span>
                {formatMessage({
                  id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.5AC43B24' /*项目：*/,
                })}
                {database?.data?.project?.name}
              </span>
            )}

            <span>
              {formatMessage({
                id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.7780C356' /*数据源：*/,
              })}
              {database?.data?.dataSource?.name}
            </span>
          </Space>
        ) : null}
      </Space>
    </SessionContext.Provider>
  );
};

export default SelectItem;
