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
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  QuestionCircleFilled,
} from '@ant-design/icons';
import { Dropdown, message, Modal } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import { inject, observer } from 'mobx-react';
import React, { useContext } from 'react';
import ParamContext from '../../../ParamContext';
import styles from './index.less';
interface IProps {
  connection: IConnection;
  modalStore?: ModalStore;
}
enum Actions {
  EDIT = 'edit',
  COPY = 'copy',
  REMOVE = 'remove',
}
const MoreBtn: React.FC<IProps> = function ({ connection, modalStore }) {
  const context = useContext(ParamContext);
  async function edit() {
    context.editDatasource?.(connection?.id);
  }
  async function copy() {
    const newConnection = {
      ...connection,
      name: `${connection.name}_${formatMessage({
        id: 'portal.connection.tooltip.copy',
      })}`,
      copyFromSid: connection?.id,
    };
    modalStore.changeAddConnectionModal(true, {
      data: newConnection,
      isEdit: false,
      isCopy: true,
    });
  }
  async function remove() {
    Modal.confirm({
      title: formatMessage(
        {
          id: 'portal.connection.delete.modal.title',
        },
        {
          name: connection.name,
        },
      ),
      content: formatMessage({
        id: 'odc.src.page.Datasource.AfterDeletingYouWill',
      }), //'删除后将无法访问该数据源'
      okText: formatMessage({
        id: 'app.button.ok',
      }),
      cancelText: formatMessage({
        id: 'app.button.cancel',
      }),
      centered: true,
      icon: <QuestionCircleFilled />,
      onOk: async () => {
        const isSuccess = await deleteConnection(connection.id.toString());
        if (isSuccess) {
          context.reloadTable();
          message.success(
            formatMessage({
              id: 'portal.connection.delete.success',
            }),
          );
        }
      },
    });
  }
  const items: ItemType[] = [
    connection.permittedActions?.includes(actionTypes.update)
      ? {
          label: formatMessage({
            id: 'odc.List.MoreBtn.Edit',
          }),
          key: Actions.EDIT,
          icon: <EditOutlined />,
        }
      : null,
    connection.permittedActions?.includes(actionTypes.delete)
      ? {
          label: formatMessage({
            id: 'odc.src.page.Datasource.Datasource.Content.List.MoreBtn.Delete',
          }), //'删除'
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
        }) + getFormatDateTime(connection?.updateTime),
      key: 'updateTime',
      disabled: true,
      style: {
        color: 'var(--text-color-hint)',
      },
    },
  ];
  return (
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
  );
};
export default inject('modalStore')(observer(MoreBtn));
