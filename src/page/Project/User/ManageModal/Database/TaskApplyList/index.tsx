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
  FixedType,
  ITableInstance,
  ITableLoadOptions,
} from '@/component/CommonTable/interface';
import SearchFilter from '@/component/SearchFilter';
import TaskDetailModal from '@/component/Task/modals/DetailModals';
import { getExpireTimeLabel } from '@/component/Task/helper';
import type { IResponseData } from '@/d.ts';
import { TaskType } from '@/d.ts';
import { DatabasePermissionStatus, IDatabasePermission } from '@/d.ts/project';
import { SearchOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import {
  databasePermissionStatusFilters,
  databasePermissionTypeFilters,
  databasePermissionTypeMap,
} from '../';
import StatusLabel from '../Status';

const getColumns = (params: {
  paramOptions: ITableLoadOptions;
  onOpenDetail: (task: { id: number }, visible: boolean) => void;
  onReclaim: (id: number[]) => void;
}) => {
  const { filters, sorter } = params.paramOptions ?? {};
  return [
    {
      dataIndex: 'databaseName',
      title: formatMessage({
        id: 'src.page.Project.User.ManageModal.TaskApplyList.D0AC4874',
        defaultMessage: '数据库',
      }), //'数据库'
      ellipsis: true,
      width: 140,
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            selectedKeys={filters?.databaseName}
            placeholder={
              formatMessage({
                id: 'src.page.Project.User.ManageModal.TaskApplyList.312C3184',
                defaultMessage: '请输入',
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
      title: formatMessage({
        id: 'src.page.Project.User.ManageModal.TaskApplyList.E54735F1',
        defaultMessage: '所属数据源',
      }), //'所属数据源'
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
                defaultMessage: '请输入',
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
      render(value) {
        return value || '-';
      },
    },
    {
      dataIndex: 'ticketId',
      title: formatMessage({
        id: 'src.page.Project.User.ManageModal.TaskApplyList.6B680E1D',
        defaultMessage: '工单编号',
      }), //'工单编号'
      width: 128,
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            selectedKeys={filters?.ticketId}
            placeholder={
              formatMessage({
                id: 'src.page.Project.User.ManageModal.TaskApplyList.CC93DC98',
                defaultMessage: '请输入',
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
      title: formatMessage({
        id: 'src.page.Project.User.ManageModal.TaskApplyList.DC1F11F6',
        defaultMessage: '权限类型',
      }), //'权限类型'
      width: 120,
      filters: databasePermissionTypeFilters,
      filteredValue: filters?.type || null,
      render: (type) => databasePermissionTypeMap[type].text,
    },
    {
      dataIndex: 'expireTime',
      title: formatMessage({
        id: 'src.page.Project.User.ManageModal.TaskApplyList.B805DCE9',
        defaultMessage: '过期时间',
      }), //'过期时间'
      width: 138,
      sorter: true,
      render: getExpireTimeLabel,
    },
    {
      dataIndex: 'status',
      title: formatMessage({
        id: 'src.page.Project.User.ManageModal.TaskApplyList.1DA4FB8D',
        defaultMessage: '状态',
      }), //'状态'
      width: 104,
      filters: databasePermissionStatusFilters,
      filteredValue: filters?.status || null,
      render: (status) => <StatusLabel status={status} />,
    },
    {
      dataIndex: 'action',
      title: formatMessage({
        id: 'src.page.Project.User.ManageModal.TaskApplyList.DCC37870',
        defaultMessage: '操作',
      }), //'操作'
      ellipsis: true,
      width: 65,
      fixed: 'right' as FixedType,
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
                defaultMessage: '回收',
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
        mode={CommonTableMode.SMALL}
        ref={tableRef}
        enabledReload={false}
        showToolbar={false}
        titleContent={null}
        rowSelecter={
          isOwner || isDBA
            ? {
                selectAllText: '全选当前页',
                options: [
                  {
                    okText: formatMessage({
                      id: 'src.page.Project.User.ManageModal.TaskApplyList.461215D6',
                      defaultMessage: '批量回收',
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
          columns: columns?.filter((item) =>
            isOwner || isDBA ? true : item?.dataIndex !== 'action',
          ),
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
