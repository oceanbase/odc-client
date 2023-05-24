import { deleteConnection } from '@/common/network/connection';
import { IConnection } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  QuestionCircleFilled,
} from '@ant-design/icons';
import { Dropdown, Menu, message, Modal } from 'antd';
import React, { useContext } from 'react';
import ParamContext from '../../../ParamContext';

import { ModalStore } from '@/store/modal';
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

  return (
    <Dropdown
      overlay={
        <Menu
          className={styles.menu}
          onClick={(e) => {
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
          }}
        >
          <Menu.Item icon={<EditOutlined />} key={Actions.EDIT}>
            {formatMessage({ id: 'odc.List.MoreBtn.Edit' }) /*编辑*/}
          </Menu.Item>
          <Menu.Item icon={<DeleteOutlined />} key={Actions.REMOVE}>
            {formatMessage({ id: 'odc.List.MoreBtn.Remove' }) /*移除*/}
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item style={{ color: 'var(--text-color-hint)' }} key={'updateTime'} disabled>
            {formatMessage({ id: 'odc.List.MoreBtn.UpdatedOn' }) /*更新于*/}
            {getFormatDateTime(connection?.updateTime)}
          </Menu.Item>
        </Menu>
      }
    >
      <EllipsisOutlined
        style={{ cursor: 'default', fontSize: 14, color: 'var(--icon-color-normal)' }}
      />
    </Dropdown>
  );
};

export default inject('modalStore')(observer(MoreBtn));
