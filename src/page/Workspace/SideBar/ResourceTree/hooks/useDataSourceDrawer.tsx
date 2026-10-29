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

import React, { useContext, useState } from 'react';
import { message, Modal } from 'antd';
import { formatMessage } from '@/util/intl';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { deleteConnection } from '@/common/network/connection';
import { getResourceDependencies } from '@/common/network/relativeResource';

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
    const data = res?.data;
    const total =
      (data?.flowDependencies?.length || 0) +
      (data?.scheduleDependencies?.length || 0) +
      (data?.scheduleTaskDependencies?.length || 0);

    if (total > 0) {
      // 有依赖项，展示资源依赖弹窗
      setDeleteDataSourceInfo({ id: key, name });
      setOpenDepResourceModal(true);
    } else if (res?.successful) {
      // 没有依赖项，按原本的 modal 展示
      Modal.confirm({
        title: formatMessage(
          {
            id: 'src.page.Workspace.SideBar.ResourceTree.hooks.CC09F723',
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
