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

import { deleteConnection } from '@/common/network/connection';
import { actionTypes, IConnection } from '@/d.ts';
import { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  QuestionCircleFilled,
} from '@ant-design/icons';
import { Dropdown, message, Modal } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import { inject, observer } from 'mobx-react';
import React, { useContext, useState } from 'react';
import RelativeResourceModal from '@/component/RelativeResourceModal';
import ParamContext from '../../../ParamContext';
import styles from './index.less';
import { getResourceDependencies } from '@/common/network/relativeResource';
interface IProps {
  connection: IConnection;
  modalStore?: ModalStore;
}
enum Actions {
  EDIT = 'edit',
  COPY = 'copy',
  REMOVE = 'remove',
  CLONE = 'clone',
}
const MoreBtn: React.FC<IProps> = function ({ connection, modalStore }) {
  const context = useContext(ParamContext);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  async function edit() {
    context.editDatasource?.(connection?.id);
  }
  async function copy() {
    const newConnection = {
      ...connection,
      name:
        `${connection.name}_` +
        formatMessage({
          id: 'portal.connection.tooltip.copy',
          defaultMessage: '复制',
        }),
      copyFromSid: connection?.id,
    };
    modalStore.changeAddConnectionModal(true, {
      data: newConnection,
      isEdit: false,
      isCopy: true,
    });
  }
  async function remove() {
    const res = await getResourceDependencies({ datasourceId: connection.id });
    const data = res?.data;
    const total =
      (data?.flowDependencies?.length || 0) +
      (data?.scheduleDependencies?.length || 0) +
      (data?.scheduleTaskDependencies?.length || 0);
    if (total > 0) {
      setDeleteModalOpen(true);
    } else {
      Modal.confirm({
        title: formatMessage(
          {
            id: 'portal.connection.delete.modal.title',
            defaultMessage: '是否确认删除 {name} ？',
          },
          {
            name: connection.name,
          },
        ),
        content: formatMessage({
          id: 'odc.src.page.Datasource.AfterDeletingYouWill',
          defaultMessage: '删除后将无法访问该数据源',
        }),
        //'删除后将无法访问该数据源'
        okText: formatMessage({
          id: 'app.button.ok',
          defaultMessage: '确定',
        }),
        cancelText: formatMessage({
          id: 'app.button.cancel',
          defaultMessage: '取消',
        }),
        centered: true,
        icon: <QuestionCircleFilled />,
        onOk: async () => {
          const isSuccess = await deleteConnection(connection.id.toString());
          if (isSuccess) {
            context.reloadTable();
          }
        },
      });
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
  };
  const items: ItemType[] = [
    connection.permittedActions?.includes(actionTypes.update)
      ? {
          label: formatMessage({
            id: 'odc.List.MoreBtn.Edit',
            defaultMessage: '编辑',
          }),
          key: Actions.EDIT,
          icon: <EditOutlined />,
        }
      : null,
    connection.permittedActions?.includes(actionTypes.update)
      ? {
          label: formatMessage({
            id: 'odc.src.page.Datasource.Datasource.Content.List.MoreBtn.Clone',
            defaultMessage: '克隆',
          }), //'克隆'
          key: Actions.CLONE,
          icon: <CopyOutlined />,
        }
      : null,
    connection.permittedActions?.includes(actionTypes.delete)
      ? {
          label: formatMessage({
            id: 'odc.src.page.Datasource.Datasource.Content.List.MoreBtn.Delete',
            defaultMessage: '删除',
          }),
          //'删除'
          key: Actions.REMOVE,
          icon: <DeleteOutlined />,
        }
      : null,
    {
      type: 'divider',
    },
    {
      label:
        formatMessage({
          id: 'odc.List.MoreBtn.UpdatedOn',
          defaultMessage: '更新于',
        }) + getFormatDateTime(connection?.updateTime),
      key: 'updateTime',
      disabled: true,
      style: {
        color: 'var(--text-color-hint)',
      },
    },
  ];

  return (
    <>
      <Dropdown
        menu={{
          items: items?.filter(Boolean),
          className: styles.menu,
          onClick(e) {
            switch (e.key) {
              case Actions.EDIT: {
                edit();
                return;
              }
              case Actions.COPY: {
                copy();
                return;
              }
              case Actions.REMOVE: {
                remove();
                return;
              }
              case Actions.CLONE: {
                context.setCopyDatasourceId?.(connection?.id);
                return;
              }
            }
          },
        }}
      >
        <EllipsisOutlined
          style={{
            cursor: 'default',
            fontSize: 14,
            color: 'var(--icon-color-normal)',
          }}
        />
      </Dropdown>

      <RelativeResourceModal
        open={deleteModalOpen}
        id={connection.id}
        title={formatMessage(
          {
            id: 'src.page.Datasource.Datasource.Content.List.MoreBtn.4702902F',
            defaultMessage: '数据源 {connectionName} 存在以下未完成的工单和作业，暂不支持删除',
          },
          { connectionName: connection?.name },
        )}
        onCancel={handleDeleteCancel}
      />
    </>
  );
};
export default inject('modalStore')(observer(MoreBtn));
