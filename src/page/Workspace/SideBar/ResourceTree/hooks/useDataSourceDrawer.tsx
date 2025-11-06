import React, { useContext, useState } from 'react';
import { message, Modal } from 'antd';
import { formatMessage } from '@/util/intl';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { deleteConnection } from '@/common/network/connection';
import { getResourceDependencies } from '@/util/request/relativeResource';

const useDataSourceDrawer = () => {
  const [dataSourceDrawerVisiable, setDataSourceDrawerVisiable] = useState(false);
  const [editDatasourceId, setEditDatasourceId] = useState<number>(null);
  const [copyDatasourceId, setCopyDatasourceId] = useState<number>(null);
  const [deleteDataSourceInfo, setDeleteDataSourceInfo] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [openDepResourceModal, setOpenDepResourceModal] = useState(false);

  const context = useContext(ResourceTreeContext);
  const selectKeys = [context.selectDatasourceId].filter(Boolean);

  function setSelectKeys(keys) {
    return context.setSelectDatasourceId(keys?.[0]);
  }

  const deleteDataSource = async (name: string, key: number) => {
    // 先检查是否有依赖项
    const res = await getResourceDependencies({ datasourceId: key });
    const total =
      (res?.flowDependencies?.length || 0) +
      (res?.scheduleDependencies?.length || 0) +
      (res?.scheduleTaskDependencies?.length || 0);

    if (total > 0) {
      // 有依赖项，展示资源依赖弹窗
      setDeleteDataSourceInfo({ id: key, name });
      setOpenDepResourceModal(true);
    } else if (res?.successful) {
      // 没有依赖项，按原本的 modal 展示
      Modal.confirm({
        title: `确认删除数据源 ${name}?`,
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
    }
  };

  const handleDeleteSuccess = () => {
    message.success(
      formatMessage({
        id: 'odc.ResourceTree.Datasource.DeletedSuccessfully',
        defaultMessage: '删除成功',
      }), //删除成功
    );

    if (deleteDataSourceInfo && selectKeys.includes(deleteDataSourceInfo.id)) {
      setSelectKeys([]);
    }
    context?.reloadDatasourceList();
    setTimeout(() => {
      context?.reloadDatabaseList();
    }, 500);
    setDeleteDataSourceInfo(null);
  };

  const handleDeleteCancel = () => {
    setOpenDepResourceModal(false);
    setDeleteDataSourceInfo(null);
  };

  const handleDepResourceModalCancel = () => {
    setOpenDepResourceModal(false);
    setDeleteDataSourceInfo(null);
  };

  return {
    dataSourceDrawerVisiable,
    setDataSourceDrawerVisiable,
    editDatasourceId,
    setEditDatasourceId,
    copyDatasourceId,
    setCopyDatasourceId,
    deleteDataSource,
    deleteDataSourceInfo,
    handleDeleteSuccess,
    handleDeleteCancel,
    openDepResourceModal,
    handleDepResourceModalCancel,
  };
};

export default useDataSourceDrawer;
