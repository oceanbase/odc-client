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

import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { getConnectionDetail } from '@/common/network/connection';
import { getDatabase } from '@/common/network/database';
import { logicalDatabaseDetail } from '@/common/network/logicalDatabase';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { TaskType } from '@/d.ts';
import login from '@/store/login';
import { formatMessage } from '@/util/intl';
import Icon, { ArrowDownOutlined, LoadingOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Divider, Select, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import SessionContext from '../context';
import { DEFALT_WIDTH } from './const';
import { IDatabase } from '@/d.ts/database';
import styles from './index.less';
import SessionDropdown, { ISessionDropdownFiltersProps } from './SessionDropdown';

interface IProps {
  value?: number;
  taskType?: TaskType;
  width?: number | string;
  projectId?: number;
  dataSourceId?: number;
  filters?: ISessionDropdownFiltersProps;
  placeholder?: string;
  disabled?: boolean;
  isLogicalDatabase?: boolean;
  datasourceMode?: boolean;
  projectMode?: boolean;
  onChange?: (value: number, database?: IDatabase) => void;
}

const SelectItem: React.FC<IProps> = ({
  value,
  taskType,
  projectId,
  dataSourceId,
  filters = null,
  width,
  placeholder = formatMessage({
    id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.66A17FFD',
    defaultMessage: '请选择',
  }),
  disabled = false,
  onChange,
  isLogicalDatabase = false,
  datasourceMode = false,
  projectMode = isLogicalDatabase,
}) => {
  const { data: database, run: runDatabase } = useRequest(getDatabase, {
    manual: true,
  });

  const { data: dataSource, run: runDataSource } = useRequest(getConnectionDetail, {
    manual: true,
  });

  const { data: logicalDatabase, run: runLogicalDatabase } = useRequest(logicalDatabaseDetail, {
    manual: true,
  });
  useEffect(() => {
    if (value) {
      if (datasourceMode) {
        runDataSource(value);
      } else {
        if (isLogicalDatabase) {
          runLogicalDatabase(value);
          return;
        }
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
    }
    if (projectMode) {
      if (!logicalDatabase?.data) {
        return <LoadingOutlined />;
      }
      const dbIcon = getDataSourceStyleByConnectType(
        logicalDatabase?.data?.dialectType as any,
      )?.dbIcon;
      return (
        <div
          style={{
            color: 'var(--text-color-primary)',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <>
            <RiskLevelLabel
              content={logicalDatabase?.data?.environment?.name}
              color={logicalDatabase?.data?.environment?.style}
            />
            <Icon
              component={dbIcon?.component}
              style={{ fontSize: 16, marginRight: 4, verticalAlign: 'textBottom' }}
            />
            <span className={styles.ellipsis} title={logicalDatabase?.data?.name}>
              {logicalDatabase?.data?.name}
            </span>
          </>
        </div>
      );
    }
    if (!datasourceMode && database?.data) {
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
        datasourceMode,
        projectMode,
        isLogicalDatabase,
        selectSession(databaseId: number, datasourceId: number, database?: IDatabase) {
          onChange(datasourceMode ? datasourceId : databaseId, database);
        },
      }}
    >
      <Space style={{ width: '100%' }} direction="vertical">
        <SessionDropdown
          projectId={projectId}
          dataSourceId={dataSourceId}
          filters={filters}
          width={width || DEFALT_WIDTH}
          taskType={taskType}
          disabled={disabled}
        >
          <Select
            disabled={disabled}
            placeholder={getPlaceholder()}
            style={{ width: width || DEFALT_WIDTH }}
            open={false}
            className={styles.select}
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
                  defaultMessage: '项目：',
                })}
                {database?.data?.project?.name}
              </span>
            )}

            <span>
              {formatMessage({
                id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.7780C356' /*数据源：*/,
                defaultMessage: '数据源：',
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
