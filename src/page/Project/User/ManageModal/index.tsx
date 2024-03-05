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

import { Drawer, Radio, Space, Button, Typography, Modal, message } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import moment from 'moment';
import { isNull } from 'lodash';
import TaskApplyList from './TaskApplyList';
import UserAuthList from './UserAuthList';
import CreateAuth from './CreateAuth';
import { getDatabasePermissions, reclaimPermission } from '@/common/network/project';
import { ITableLoadOptions, ITableInstance } from '@/component/CommonTable/interface';
import { PermissionSourceType, IDatabasePermission } from '@/d.ts/project';
import { DatabasePermissionType } from '@/d.ts/database';
import type { IResponseData } from '@/d.ts';
import { databasePermissionStatusMap } from './Status';
import styles from './index.less';

const { Text } = Typography;

const descMap = {
  [PermissionSourceType.TICKET_APPLICATION]: formatMessage({
    id: 'src.page.Project.User.ManageModal.052E4C60',
  }), //'通过工单申请的数据库权限'
  [PermissionSourceType.USER_AUTHORIZATION]: formatMessage({
    id: 'src.page.Project.User.ManageModal.3A14AB40',
  }), //'通过管理员赋予的数据库权限'
};

export const databasePermissionTypeMap = {
  [DatabasePermissionType.QUERY]: {
    text: formatMessage({ id: 'src.page.Project.User.ManageModal.CDB8A0AA' }), //'查询'
    value: DatabasePermissionType.QUERY,
  },
  [DatabasePermissionType.EXPORT]: {
    text: formatMessage({ id: 'src.page.Project.User.ManageModal.6CDF0607' }), //'导出'
    value: DatabasePermissionType.EXPORT,
  },
  [DatabasePermissionType.CHANGE]: {
    text: formatMessage({ id: 'src.page.Project.User.ManageModal.2DDCB471' }), //'变更'
    value: DatabasePermissionType.CHANGE,
  },
};

export const databasePermissionTypeFilters = Object.values(databasePermissionTypeMap);
export const databasePermissionStatusFilters = Object.values(databasePermissionStatusMap);

interface IProps {
  visible: boolean;
  projectId: number;
  userId: number;
  isOwner: boolean;
  onClose: () => void;
}

const ManageModal: React.FC<IProps> = (props) => {
  const { visible, isOwner, projectId, userId, onClose } = props;
  const [dataSource, setDataSource] = useState<IResponseData<IDatabasePermission>>(null);
  const [authorizationType, setAuthorizationType] = useState(
    PermissionSourceType.TICKET_APPLICATION,
  );
  const [params, setParams] = useState<ITableLoadOptions>(null);
  const tableRef = useRef<ITableInstance>();
  const description = descMap[authorizationType];

  const handleChangeKey = (e) => {
    setAuthorizationType(e.target.value);
    setParams(null);
  };

  const loadData = async (args?: ITableLoadOptions) => {
    const { filters, sorter, pagination, pageSize } = args ?? {};
    const { databaseName, dataSourceName, ticketId, type, status } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};
    const params = {
      authorizationType,
      projectId,
      userId,
      databaseName,
      dataSourceName,
      ticketId,
      type,
      status,
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
    };
    // sorter
    params.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const res = await getDatabasePermissions(params);
    setDataSource(res);
  };

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
          {
            formatMessage({
              id: 'src.page.Project.User.ManageModal.B7377F46' /*回收后不可撤回*/,
            }) /* 回收后不可撤回 */
          }
        </Text>
      ),
      cancelText: formatMessage({ id: 'src.page.Project.User.ManageModal.2FE8276F' }), //'取消'
      okText: formatMessage({ id: 'src.page.Project.User.ManageModal.1C087F21' }), //'确定'
      centered: true,
      onOk: async () => {
        const res = await reclaimPermission(projectId, ids);
        if (res) {
          message.success(
            formatMessage({ id: 'src.page.Project.User.ManageModal.B3D76C33' /*'操作成功'*/ }),
          );
          tableRef.current?.resetSelectedRows();
          handleReload();
        }
      },
    });
  };

  useEffect(() => {
    if (projectId && userId && visible) {
      loadData();
    }
  }, [userId, projectId, authorizationType, visible]);

  const handleSwitchUserTab = () => {
    if (authorizationType === PermissionSourceType.USER_AUTHORIZATION) {
      handleReload();
    } else {
      setAuthorizationType(PermissionSourceType.USER_AUTHORIZATION);
    }
  };

  return (
    <Drawer
      open={visible}
      width={925}
      title={formatMessage({ id: 'src.page.Project.User.ManageModal.211FFE62' }) /*"管理库权限"*/}
      destroyOnClose
      className={styles.detailDrawer}
      footer={null}
      onClose={() => {
        onClose();
      }}
    >
      <Space className={styles.header} direction="vertical" size={5}>
        {isOwner && (
          <CreateAuth projectId={projectId} userId={userId} onSwitchUserTab={handleSwitchUserTab} />
        )}

        <Text strong>
          {
            formatMessage({
              id: 'src.page.Project.User.ManageModal.12DB9111' /*授权记录*/,
            }) /* 授权记录 */
          }
        </Text>
        <Radio.Group onChange={handleChangeKey} value={authorizationType}>
          <Radio.Button value={PermissionSourceType.TICKET_APPLICATION}>
            {
              formatMessage({
                id: 'src.page.Project.User.ManageModal.1DCD8093' /*工单申请*/,
              }) /* 工单申请 */
            }
          </Radio.Button>
          <Radio.Button value={PermissionSourceType.USER_AUTHORIZATION}>
            {
              formatMessage({
                id: 'src.page.Project.User.ManageModal.28BC85BF' /*用户授权*/,
              }) /* 用户授权 */
            }
          </Radio.Button>
        </Radio.Group>
      </Space>
      <div className={styles.content}>
        {authorizationType === PermissionSourceType.TICKET_APPLICATION ? (
          <TaskApplyList
            projectId={projectId}
            dataSource={dataSource}
            description={description}
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
            description={description}
            params={params}
            isOwner={isOwner}
            tableRef={tableRef}
            onLoad={loadData}
            onChange={handleChange}
            onReclaim={handleReclaim}
          />
        )}
      </div>
    </Drawer>
  );
};

export default ManageModal;
