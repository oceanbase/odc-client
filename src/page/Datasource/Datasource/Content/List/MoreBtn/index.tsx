import { deleteConnection } from '@/common/network/connection';
import { actionTypes, IConnection } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  QuestionCircleFilled,
} from '@ant-design/icons';
import { Dropdown, message, Modal } from 'antd';
import React, { useContext } from 'react';
import ParamContext from '../../../ParamContext';

import { ModalStore } from '@/store/modal';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import { inject, observer } from 'mobx-react';
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
        id: 'portal.connection.delete.modal.content',
      }),

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
          label: formatMessage({ id: 'odc.List.MoreBtn.Edit' }),
          key: Actions.EDIT,
          icon: <EditOutlined />,
        }
      : null,
    connection.permittedActions?.includes(actionTypes.delete)
      ? {
          label: formatMessage({ id: 'odc.List.MoreBtn.Remove' }) /*移除*/,
          key: Actions.REMOVE,
          icon: <DeleteOutlined />,
        }
      : null,
    {
      type: 'divider',
    },
    {
      label:
        formatMessage({ id: 'odc.List.MoreBtn.UpdatedOn' }) +
        getFormatDateTime(connection?.updateTime),
      key: 'updateTime',
      disabled: true,
      style: { color: 'var(--text-color-hint)' },
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
        style={{ cursor: 'default', fontSize: 14, color: 'var(--icon-color-normal)' }}
      />
    </Dropdown>
  );
};

export default inject('modalStore')(observer(MoreBtn));
