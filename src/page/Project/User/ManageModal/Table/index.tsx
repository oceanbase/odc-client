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

import { getTablePermissions, reclaimTablePermission } from '@/common/network/project';
import { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import type { IResponseData } from '@/d.ts';
import { TablePermissionType } from '@/d.ts/table';
import { ITablePermission, PermissionSourceType } from '@/d.ts/project';
import { formatMessage } from '@/util/intl';
import { Modal, Radio, Space, Typography, message } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import CreateAuth from './CreateAuth';
import { tablePermissionStatusMap } from './Status';
import TaskApplyList from './TaskApplyList';
import UserAuthList from './UserAuthList';
import styles from './index.less';
import HelpDoc from '@/component/helpDoc';

const { Text } = Typography;

export const tablePermissionTypeMap = {
  [TablePermissionType.QUERY]: {
    text: formatMessage({
      id: 'src.page.Project.User.ManageModal.Table.A3D05C57',
      defaultMessage: '查询',
    }),
    value: TablePermissionType.QUERY,
  },
  [TablePermissionType.EXPORT]: {
    text: formatMessage({
      id: 'src.page.Project.User.ManageModal.Table.D53578CD',
      defaultMessage: '导出',
    }),
    value: TablePermissionType.EXPORT,
  },
  [TablePermissionType.CHANGE]: {
    text: formatMessage({
      id: 'src.page.Project.User.ManageModal.Table.070B09D0',
      defaultMessage: '变更',
    }),
    value: TablePermissionType.CHANGE,
  },
};

export const tablePermissionTypeFilters = Object.values(tablePermissionTypeMap);
export const tablePermissionStatusFilters = Object.values(tablePermissionStatusMap);

interface IProps {
  projectId: number;
  userId: number;
  isOwner: boolean;
}

const ManageModal: React.FC<IProps> = (props) => {
  const { isOwner, projectId, userId } = props;
  const [dataSource, setDataSource] = useState<IResponseData<ITablePermission>>(null);
  const [authorizationType, setAuthorizationType] = useState(
    PermissionSourceType.TICKET_APPLICATION,
  );
  const [params, setParams] = useState<ITableLoadOptions>(null);
  const tableRef = useRef<ITableInstance>();

  const handleChangeKey = (e) => {
    setAuthorizationType(e.target.value);
    setParams(null);
  };

  const loadData = useCallback(
    async (args?: ITableLoadOptions) => {
      const { filters, sorter, pagination, pageSize } = args ?? {};
      const { tableName, dataSourceName, ticketId, type, status } = filters ?? {};
      const { column, order } = sorter ?? {};
      const { current = 1 } = pagination ?? {};
      const params = {
        authorizationType,
        projectId,
        userId,
        tableName,
        dataSourceName,
        ticketId,
        type,
        status,
        sort: column?.dataIndex,
        page: current,
        size: pageSize,
      };
      // sorter
      params.sort = column
        ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}`
        : undefined;
      const res = await getTablePermissions(params);
      setDataSource(res);
    },
    [authorizationType, projectId, userId],
  );

  const handleChange = (args: ITableLoadOptions) => {
    setParams(args);
    loadData(args);
  };

  const handleReload = () => {
    tableRef.current?.reload();
  };

  const handleReclaim = async (ids: number[]) => {
    const isBatch = ids?.length > 1;
    const title = isBatch
      ? formatMessage({ id: 'src.page.Project.User.ManageModal.A23DCE27' })
      : formatMessage({ id: 'src.page.Project.User.ManageModal.8B929D18' });
    Modal.confirm({
      title,
      content: (
        <Text type="secondary">
          {formatMessage({
            id: 'src.page.Project.User.ManageModal.Table.7E23C899',
            defaultMessage: '回收后不可撤回',
          })}
        </Text>
      ),
      cancelText: formatMessage({
        id: 'src.page.Project.User.ManageModal.Table.C5AD844C',
        defaultMessage: '取消',
      }),
      okText: formatMessage({
        id: 'src.page.Project.User.ManageModal.Table.E297BA02',
        defaultMessage: '确定',
      }),
      centered: true,
      onOk: async () => {
        const res = await reclaimTablePermission(projectId, ids);
        if (res) {
          message.success(
            formatMessage({
              id: 'src.page.Project.User.ManageModal.Table.2E8F3BF1',
              defaultMessage: '操作成功',
            }),
          );
          tableRef.current?.resetSelectedRows();
          handleReload();
        }
      },
    });
  };

  useEffect(() => {
    if (projectId && userId) {
      loadData();
    }
  }, [userId, projectId, authorizationType, loadData]);

  const handleSwitchUserTab = () => {
    if (authorizationType === PermissionSourceType.USER_AUTHORIZATION) {
      handleReload();
    } else {
      setAuthorizationType(PermissionSourceType.USER_AUTHORIZATION);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <div>
          <Radio.Group onChange={handleChangeKey} value={authorizationType}>
            <Radio.Button value={PermissionSourceType.TICKET_APPLICATION}>
              {formatMessage({
                id: 'src.page.Project.User.ManageModal.Table.CED524BB',
                defaultMessage: '工单授权',
              })}
            </Radio.Button>
            <Radio.Button value={PermissionSourceType.USER_AUTHORIZATION}>
              {formatMessage({
                id: 'src.page.Project.User.ManageModal.Table.92D4CD12',
                defaultMessage: '用户授权',
              })}
            </Radio.Button>
          </Radio.Group>
          <HelpDoc isTip leftText doc="userManageTip" />
        </div>
        {isOwner && (
          <CreateAuth projectId={projectId} userId={userId} onSwitchUserTab={handleSwitchUserTab} />
        )}
      </div>
      <div className={styles.content}>
        {authorizationType === PermissionSourceType.TICKET_APPLICATION ? (
          <TaskApplyList
            projectId={projectId}
            dataSource={dataSource}
            params={params}
            isOwner={isOwner}
            tableRef={tableRef}
            onLoad={loadData}
            onChange={handleChange}
            onReclaim={handleReclaim}
          />
        ) : (
          <UserAuthList
            projectId={projectId}
            dataSource={dataSource}
            params={params}
            isOwner={isOwner}
            tableRef={tableRef}
            onLoad={loadData}
            onChange={handleChange}
            onReclaim={handleReclaim}
          />
        )}
      </div>
    </>
  );
};

export default ManageModal;
