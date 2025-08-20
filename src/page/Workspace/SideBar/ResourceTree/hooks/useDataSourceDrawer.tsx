import React, { useContext, useState } from 'react';
import { Modal, message } from 'antd';
import { formatMessage } from '@/util/intl';
import { deleteConnection } from '@/common/network/connection';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';

const useDataSourceDrawer = () => {
  const [dataSourceDrawerVisiable, setDataSourceDrawerVisiable] = useState(false);
  const [editDatasourceId, setEditDatasourceId] = useState<number>(null);
  const [copyDatasourceId, setCopyDatasourceId] = useState<number>(null);
  const context = useContext(ResourceTreeContext);
  const selectKeys = [context.selectDatasourceId].filter(Boolean);
  function setSelectKeys(keys) {
    return context.setSelectDatasourceId(keys?.[0]);
  }

  const deleteDataSource = (name: string, key: number) => {
    Modal.confirm({
      title: formatMessage(
        {
          id: 'odc.ResourceTree.Datasource.AreYouSureYouWant',
          defaultMessage: '确认删除数据源 {name}?',
        },
        { name },
      ),
      async onOk() {
        const isSuccess = await deleteConnection(key?.toString());
        if (isSuccess) {
          message.success(
            formatMessage({
              id: 'odc.ResourceTree.Datasource.DeletedSuccessfully',
              defaultMessage: '删除成功',
            }), //删除成功
          );

          if (selectKeys.includes(key)) {
            setSelectKeys([]);
          }
          context?.reloadDatasourceList();
          setTimeout(() => {
            context?.reloadDatabaseList();
          }, 500);
        }
      },
    });
  };

  return {
    dataSourceDrawerVisiable,
    setDataSourceDrawerVisiable,
    editDatasourceId,
    setEditDatasourceId,
    copyDatasourceId,
    setCopyDatasourceId,
    deleteDataSource,
  };
};

export default useDataSourceDrawer;
