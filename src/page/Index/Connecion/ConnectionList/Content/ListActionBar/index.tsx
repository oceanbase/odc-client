import { batchDeleteConnection } from '@/common/network/connection';
import { formatMessage } from '@/util/intl';
import { Alert, message, Popconfirm, Space } from 'antd';
import React, { useContext, useState } from 'react';
import ParamContext from '../../ParamContext';

interface IProps {}

const ListActionBar: React.FC<IProps> = function () {
  const context = useContext(ParamContext);
  const [isRunning, setIsRunning] = useState(false);
  function cancelSelect() {
    context.setSelectedKeys(new Set());
  }
  async function batchDelete() {
    if (isRunning) {
      return;
    }
    setIsRunning(true);
    try {
      const res = await batchDeleteConnection(Array.from(context.selectedKeys));
      if (res) {
        message.success(
          formatMessage({ id: 'odc.Content.ListActionBar.DeletedSuccessfully' }), //删除成功
        );
        cancelSelect();
        context.reloadTable();
      }
    } finally {
      setIsRunning(false);
    }
  }
  return (
    <Alert
      type="info"
      message={
        <Space>
          {
            formatMessage(
              {
                id: 'odc.Content.ListActionBar.ContextselectedkeyssizeItemSelected',
              },
              { contextSelectedKeysSize: context.selectedKeys.size },
            ) //`已选择 ${context.selectedKeys.size} 项`
          }
          <a onClick={cancelSelect}>
            {
              formatMessage({
                id: 'odc.Content.ListActionBar.Deselect',
              }) /*取消选择*/
            }
          </a>
        </Space>
      }
      action={
        <Space>
          <Popconfirm
            placement="left"
            onConfirm={batchDelete}
            title={
              formatMessage({
                id: 'odc.Content.ListActionBar.BatchDeletion',
              }) + '?'
            }
          >
            <a>
              {
                formatMessage({
                  id: 'odc.Content.ListActionBar.BatchDeletion',
                }) /*批量删除*/
              }
            </a>
          </Popconfirm>
        </Space>
      }
    />
  );
};

export default ListActionBar;
