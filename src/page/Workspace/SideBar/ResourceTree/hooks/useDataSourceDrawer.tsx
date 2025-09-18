import React, { useContext, useState } from 'react';
import { message } from 'antd';
import { formatMessage } from '@/util/intl';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';

const useDataSourceDrawer = () => {
  const [dataSourceDrawerVisiable, setDataSourceDrawerVisiable] = useState(false);
  const [editDatasourceId, setEditDatasourceId] = useState<number>(null);
  const [copyDatasourceId, setCopyDatasourceId] = useState<number>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteDataSourceInfo, setDeleteDataSourceInfo] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const context = useContext(ResourceTreeContext);
  const selectKeys = [context.selectDatasourceId].filter(Boolean);

  function setSelectKeys(keys) {
    return context.setSelectDatasourceId(keys?.[0]);
  }

  const deleteDataSource = (name: string, key: number) => {
    setDeleteDataSourceInfo({ id: key, name });
    setDeleteModalOpen(true);
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
    setDeleteModalOpen(false);
    setDeleteDataSourceInfo(null);
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
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
    deleteModalOpen,
    deleteDataSourceInfo,
    handleDeleteSuccess,
    handleDeleteCancel,
  };
};

export default useDataSourceDrawer;
