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
import {
  CommonTableMode,
  ITableLoadOptions,
  ITableInstance,
} from '@/component/CommonTable/interface';
import { getExpireTimeLabel } from '@/component/Task/ApplyDatabasePermission';
import { DatabasePermissionStatus, IDatabasePermission } from '@/d.ts/project';
import type { IResponseData } from '@/d.ts';
import { TaskType } from '@/d.ts';
import TaskDetailModal from '@/component/Task/DetailModal';
import {
  databasePermissionTypeFilters,
  databasePermissionTypeMap,
  databasePermissionStatusFilters,
} from '../';
import StatusLabel from '../Status';
import SearchFilter from '@/component/SearchFilter';
import CommonTable from '@/component/CommonTable';
import { SearchOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

const getColumns = (params: {
  paramOptions: ITableLoadOptions;
  onOpenDetail: (task: { id: number }, visible: boolean) => void;
  onReclaim: (id: number[]) => void;
}) => {
  const { filters, sorter } = params.paramOptions ?? {};
  return [
    {
      dataIndex: 'databaseName',
      title: formatMessage({ id: 'src.page.Project.User.ManageModal.TaskApplyList.D0AC4874' }), //'数据库'
      ellipsis: true,
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            selectedKeys={filters?.databaseName}
            placeholder={
              formatMessage({
                id: 'src.page.Project.User.ManageModal.TaskApplyList.312C3184',
              }) /*"请输入"*/
            }
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
      title: formatMessage({ id: 'src.page.Project.User.ManageModal.TaskApplyList.E54735F1' }), //'所属数据源'
      ellipsis: true,
      width: 188,
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            selectedKeys={filters?.dataSourceName}
            placeholder={
              formatMessage({
                id: 'src.page.Project.User.ManageModal.TaskApplyList.2AF1BB1C',
              }) /*"请输入"*/
            }
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
    },
    {
      dataIndex: 'ticketId',
      title: formatMessage({ id: 'src.page.Project.User.ManageModal.TaskApplyList.6B680E1D' }), //'工单编号'
      width: 128,
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            selectedKeys={filters?.ticketId}
            placeholder={
              formatMessage({
                id: 'src.page.Project.User.ManageModal.TaskApplyList.CC93DC98',
              }) /*"请输入"*/
            }
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
      title: formatMessage({ id: 'src.page.Project.User.ManageModal.TaskApplyList.DC1F11F6' }), //'权限类型'
      width: 120,
      filters: databasePermissionTypeFilters,
      filteredValue: filters?.type || null,
      render: (type) => databasePermissionTypeMap[type].text,
    },
    {
      dataIndex: 'expireTime',
      title: formatMessage({ id: 'src.page.Project.User.ManageModal.TaskApplyList.B805DCE9' }), //'过期时间'
      width: 138,
      sorter: true,
      render: getExpireTimeLabel,
    },
    {
      dataIndex: 'status',
      title: formatMessage({ id: 'src.page.Project.User.ManageModal.TaskApplyList.1DA4FB8D' }), //'状态'
      width: 104,
      filters: databasePermissionStatusFilters,
      filteredValue: filters?.status || null,
      render: (status) => <StatusLabel status={status} />,
    },
    {
      dataIndex: 'action',
      title: formatMessage({ id: 'src.page.Project.User.ManageModal.TaskApplyList.DCC37870' }), //'操作'
      ellipsis: true,
      width: 65,
      render: (_, record) => {
        return (
          <Action.Link
            disabled={record?.status === DatabasePermissionStatus.EXPIRED}
            onClick={() => {
              params?.onReclaim([record.id]);
            }}
          >
            {
              formatMessage({
                id: 'src.page.Project.User.ManageModal.TaskApplyList.75F749A1' /*回收*/,
              }) /* 回收 */
            }
          </Action.Link>
        );
      },
    },
  ];
};

interface IProps {
  projectId: number;
  dataSource: IResponseData<IDatabasePermission>;
  description: string;
  params: ITableLoadOptions;
  isOwner: boolean;
  tableRef: React.RefObject<ITableInstance>;
  onReclaim: (ids: number[]) => void;
  onLoad: (args: ITableLoadOptions) => Promise<any>;
  onChange?: (args: ITableLoadOptions) => void;
}

const TaskApplyList: React.FC<IProps> = (props) => {
  const {
    projectId,
    isOwner,
    dataSource,
    params,
    description,
    tableRef,
    onReclaim,
    onLoad,
    onChange,
  } = props;
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
        mode={CommonTableMode.SMALL}
        ref={tableRef}
        enabledReload={true}
        filterContent={{
          enabledSearch: false,
        }}
        titleContent={{
          description,
        }}
        rowSelecter={
          isOwner
            ? {
                options: [
                  {
                    okText: formatMessage({
                      id: 'src.page.Project.User.ManageModal.TaskApplyList.461215D6',
                    }), //'批量回收'
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
            x: 650,
          },
          pagination: {
            current: dataSource?.page?.number,
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
