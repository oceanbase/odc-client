import { formatMessage } from '@/util/intl';
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
import TaskDetailModal from '@/component/Task/modals/DetailModals';
import { getExpireTimeLabel } from '@/component/Task/helper';
import type { IResponseData } from '@/d.ts';
import { TaskType } from '@/d.ts';
import { ITablePermission, TablePermissionStatus } from '@/d.ts/project';
import { SearchOutlined } from '@ant-design/icons';
import { ColumnType } from 'antd/es/table';
import React, { useState } from 'react';
import {
  tablePermissionStatusFilters,
  tablePermissionTypeFilters,
  tablePermissionTypeMap,
} from '../';
import StatusLabel from '../Status';

const getColumns = (params: {
  paramOptions: ITableLoadOptions;
  onOpenDetail: (task: { id: number }, visible: boolean) => void;
  onReclaim: (id: number[]) => void;
}): ColumnType<ITablePermission>[] => {
  const { filters } = params.paramOptions ?? {};
  return [
    {
      dataIndex: 'tableName',
      title: formatMessage({
        id: 'src.page.Project.User.ManageModal.Table.TaskApplyList.3EEF9DAF',
        defaultMessage: '表/视图',
      }),
      width: 140,
      ellipsis: true,
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            selectedKeys={filters?.tableName}
            placeholder={formatMessage({
              id: 'src.page.Project.User.ManageModal.Table.TaskApplyList.F38F822F',
              defaultMessage: '请输入',
            })}
          />
        );
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
      dataIndex: 'databaseName',
      title: formatMessage({
        id: 'src.page.Project.User.ManageModal.Table.TaskApplyList.47C16695',
        defaultMessage: '所属数据库',
      }),
      ellipsis: true,
      width: 208,
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            selectedKeys={filters?.databaseName}
            placeholder={formatMessage({
              id: 'src.page.Project.User.ManageModal.Table.TaskApplyList.88257A65',
              defaultMessage: '请输入',
            })}
          />
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
      dataIndex: 'dataSourceName',
      title: formatMessage({
        id: 'src.page.Project.User.ManageModal.Table.TaskApplyList.E80C6744',
        defaultMessage: '所属数据源',
      }),
      ellipsis: true,
      width: 188,
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            selectedKeys={filters?.dataSourceName}
            placeholder={formatMessage({
              id: 'src.page.Project.User.ManageModal.Table.TaskApplyList.C0ABE640',
              defaultMessage: '请输入',
            })}
          />
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
      render(value) {
        return value || '-';
      },
    },
    {
      dataIndex: 'ticketId',
      title: formatMessage({
        id: 'src.page.Project.User.ManageModal.Table.TaskApplyList.C0E75C97',
        defaultMessage: '工单编号',
      }),
      width: 128,
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            selectedKeys={filters?.ticketId}
            placeholder={formatMessage({
              id: 'src.page.Project.User.ManageModal.Table.TaskApplyList.3B1CD3B1',
              defaultMessage: '请输入',
            })}
          />
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? 'var(--icon-color-focus)' : undefined,
          }}
        />
      ),

      filteredValue: filters?.ticketId || null,
      filters: [],
      render: (ticketId) => {
        return (
          <Action.Link
            onClick={() => {
              params?.onOpenDetail({ id: ticketId }, true);
            }}
          >
            {ticketId}
          </Action.Link>
        );
      },
    },
    {
      dataIndex: 'type',
      title: formatMessage({
        id: 'src.page.Project.User.ManageModal.Table.TaskApplyList.9C75241F',
        defaultMessage: '权限类型',
      }),
      width: 120,
      filters: tablePermissionTypeFilters,
      filteredValue: filters?.type || null,
      render: (type) => tablePermissionTypeMap[type].text,
    },
    {
      dataIndex: 'expireTime',
      title: formatMessage({
        id: 'src.page.Project.User.ManageModal.Table.TaskApplyList.EC52BFBC',
        defaultMessage: '过期时间',
      }),
      width: 138,
      sorter: true,
      render: getExpireTimeLabel,
    },
    {
      dataIndex: 'status',
      title: formatMessage({
        id: 'src.page.Project.User.ManageModal.Table.TaskApplyList.D8B38717',
        defaultMessage: '状态',
      }),
      width: 104,
      filters: tablePermissionStatusFilters,
      filteredValue: filters?.status || null,
      render: (status) => <StatusLabel status={status} />,
    },
    {
      dataIndex: 'action',
      title: formatMessage({
        id: 'src.page.Project.User.ManageModal.Table.TaskApplyList.BC1F3BBD',
        defaultMessage: '操作',
      }),
      ellipsis: true,
      width: 65,
      fixed: 'right',
      render: (_, record) => {
        return (
          <Action.Link
            disabled={record?.status === TablePermissionStatus.EXPIRED}
            onClick={() => {
              params?.onReclaim([record.id]);
            }}
            tooltip={
              record?.status === TablePermissionStatus.EXPIRED
                ? formatMessage({
                    id: 'src.page.Project.User.ManageModal.Table.TaskApplyList.8BA76A12',
                    defaultMessage: '过期超三个月后此权限将被清除',
                  })
                : ''
            }
          >
            {formatMessage({
              id: 'src.page.Project.User.ManageModal.Table.TaskApplyList.9CDE663F',
              defaultMessage: '回收',
            })}
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
  isDBA: boolean;
  tableRef: React.RefObject<ITableInstance>;
  onReclaim: (ids: number[]) => void;
  onLoad: (args: ITableLoadOptions) => Promise<any>;
  onChange?: (args: ITableLoadOptions) => void;
}

const TaskApplyList: React.FC<IProps> = (props) => {
  const { projectId, isOwner, isDBA, dataSource, params, tableRef, onReclaim, onLoad, onChange } =
    props;
  const [detailId, setDetailId] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const handleDetailVisible = (task: { id: number }, visible: boolean = false) => {
    const { id } = task ?? {};
    setDetailId(id);
    setDetailVisible(visible);
  };

  const columns = getColumns({
    paramOptions: params,
    onOpenDetail: handleDetailVisible,
    onReclaim: onReclaim,
  });

  return (
    <>
      <CommonTable
        enabledReload={false}
        showToolbar={false}
        mode={CommonTableMode.SMALL}
        ref={tableRef}
        filterContent={{
          enabledSearch: false,
        }}
        titleContent={null}
        rowSelecter={
          isOwner || isDBA
            ? {
                selectAllText: formatMessage({
                  id: 'src.page.Project.User.ManageModal.Table.TaskApplyList.88383CDB',
                  defaultMessage: '全选当前页',
                }),
                options: [
                  {
                    okText: formatMessage({
                      id: 'src.page.Project.User.ManageModal.Table.TaskApplyList.AEDC316B',
                      defaultMessage: '批量回收',
                    }),
                    onOk: onReclaim,
                  },
                ],

                getCheckboxProps: (record: ITablePermission) => {
                  return {
                    disabled: record?.status === TablePermissionStatus.EXPIRED,
                  };
                },
              }
            : null
        }
        onLoad={onLoad}
        onChange={onChange}
        tableProps={{
          columns: columns?.filter((item) =>
            isOwner || isDBA ? true : item?.dataIndex !== 'action',
          ),
          dataSource: dataSource?.contents ?? [],
          rowKey: 'id',
          scroll: {
            x: 950,
          },
          pagination: {
            current: dataSource?.page?.number,
            pageSize: 10,
            total: dataSource?.page?.totalElements,
          },
        }}
      />

      <TaskDetailModal
        type={TaskType.APPLY_DATABASE_PERMISSION}
        detailId={detailId}
        visible={detailVisible}
        enabledAction={false}
        onDetailVisible={handleDetailVisible}
      />
    </>
  );
};

export default TaskApplyList;
