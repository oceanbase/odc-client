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

import Action from '@/component/Action';
import CommonTable from '@/component/CommonTable';
import {
  CommonTableMode,
  ITableInstance,
  ITableLoadOptions,
} from '@/component/CommonTable/interface';
import SearchFilter from '@/component/SearchFilter';
import { getExpireTimeLabel } from '@/component/Task/ApplyTablePermission';
import type { IResponseData } from '@/d.ts';
import { ITablePermission, TablePermissionStatus } from '@/d.ts/project';
import { SearchOutlined } from '@ant-design/icons';
import React from 'react';
import {
  tablePermissionStatusFilters,
  tablePermissionTypeFilters,
  tablePermissionTypeMap,
} from '../';
import StatusLabel from '../Status';
import { ColumnType } from 'antd/es/table';

const getColumns = (params: {
  paramOptions: ITableLoadOptions;
  onReclaim: (id: number[]) => void;
}): ColumnType<ITablePermission>[] => {
  const { filters } = params.paramOptions ?? {};
  return [
    {
      dataIndex: 'databaseName',
      title: '数据库',
      ellipsis: true,
      filterDropdown: (props) => {
        return (
          <SearchFilter {...props} selectedKeys={filters?.databaseName} placeholder="请输入" />
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? 'var(--icon-color-focus)' : undefined,
          }}
        />
      ),

      filteredValue: filters?.databaseName || null,
      filters: [],
    },
    {
      dataIndex: 'tableName',
      title: '表',
      ellipsis: true,
      filterDropdown: (props) => {
        return <SearchFilter {...props} selectedKeys={filters?.tableName} placeholder="请输入" />;
      },
      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? 'var(--icon-color-focus)' : undefined,
          }}
        />
      ),

      filteredValue: filters?.tableName || null,
      filters: [],
    },
    {
      dataIndex: 'dataSourceName',
      title: '所属数据源',
      ellipsis: true,
      width: 188,
      filterDropdown: (props) => {
        return (
          <SearchFilter {...props} selectedKeys={filters?.dataSourceName} placeholder="请输入" />
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? 'var(--icon-color-focus)' : undefined,
          }}
        />
      ),

      filteredValue: filters?.dataSourceName || null,
      filters: [],
    },
    {
      dataIndex: 'type',
      title: '权限类型',
      width: 120,
      filters: tablePermissionTypeFilters,
      filteredValue: filters?.type || null,
      render: (type) => tablePermissionTypeMap[type].text,
    },
    {
      dataIndex: 'expireTime',
      title: '过期时间',
      width: 138,
      sorter: true,
      render: getExpireTimeLabel,
    },
    {
      dataIndex: 'status',
      title: '状态',
      width: 104,
      filters: tablePermissionStatusFilters,
      filteredValue: filters?.status || null,
      render: (status) => <StatusLabel status={status} />,
    },
    {
      dataIndex: 'action',
      title: '操作',
      ellipsis: true,
      width: 65,
      fixed: 'right',
      render: (_, record) => {
        return (
          <Action.Link
            disabled={record?.status === TablePermissionStatus.EXPIRED}
            onClick={async () => {
              params?.onReclaim([record.id]);
            }}
          >
            回收
          </Action.Link>
        );
      },
    },
  ];
};

interface IProps {
  projectId: number;
  dataSource: IResponseData<ITablePermission>;
  params: ITableLoadOptions;
  isOwner: boolean;
  tableRef: React.RefObject<ITableInstance>;
  onReclaim: (ids: number[]) => void;
  onLoad: (args: ITableLoadOptions) => Promise<any>;
  onChange?: (args: ITableLoadOptions) => void;
}

const UserAuthList: React.FC<IProps> = (props) => {
  const { isOwner, dataSource, params, tableRef, onReclaim, onLoad, onChange } = props;
  const columns = getColumns({
    paramOptions: params,
    onReclaim: onReclaim,
  });

  return (
    <>
      <CommonTable
        mode={CommonTableMode.SMALL}
        ref={tableRef}
        enabledReload={false}
        showToolbar={false}
        filterContent={{
          enabledSearch: false,
        }}
        titleContent={null}
        rowSelecter={
          isOwner
            ? {
                options: [
                  {
                    okText: '批量回收',
                    onOk: onReclaim,
                  },
                ],
              }
            : null
        }
        onLoad={onLoad}
        onChange={onChange}
        tableProps={{
          columns: columns?.filter((item) => (isOwner ? true : item?.dataIndex !== 'action')),
          dataSource: dataSource?.contents ?? [],
          rowKey: 'id',
          scroll: {
            x: 950,
            y: 800,
          },
          pagination: {
            current: dataSource?.page?.number,
            pageSize: 10,
            total: dataSource?.page?.totalElements,
          },
        }}
      />
    </>
  );
};

export default UserAuthList;
