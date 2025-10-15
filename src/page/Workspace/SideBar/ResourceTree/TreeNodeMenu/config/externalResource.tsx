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

import { ResourceTreeNodeMenuKeys } from '@/d.ts';
import { ResourceNodeType } from '../../type';
import { actionTypes } from '@/component/Acess';
import modalStore from '@/store/modal';
import { message, Modal } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FunctionOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { IMenuItemConfig } from '../type';
import { formatMessage } from '@/util/intl';
import { openExternalResourceViewPage } from '@/store/helper/page';
import { downloadExternalResourceFile } from '@/common/network/externalResource';
import { IExternalResource } from '@/d.ts/externalResoruce';
import { openGlobalSearch } from '../../const';

export const externalResourceMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.ExternalResourceRoot]: [
    {
      key: ResourceTreeNodeMenuKeys.CREATE_EXTERNAL_RESOURCE,
      text: '新建外部资源',
      icon: PlusOutlined,
      actionType: actionTypes.create,
      run(session, node) {
        modalStore.changeCreateExternalResourceModalVisible(
          true,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },
    {
      key: 'GLOBAL_SEARCH',
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.externalResource.GlobalSearch',
          defaultMessage: '全局搜索',
        }),
      ],
      icon: SearchOutlined,
      actionType: actionTypes.read,
      run(session, node) {
        openGlobalSearch(node);
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.REFRESH,
      text: '刷新',
      icon: ReloadOutlined,
      actionType: actionTypes.read,
      async run(session, node) {
        if (session?.database?.getExternalResourceList) {
          await session.database.getExternalResourceList();
        }
      },
    },
  ],
  [ResourceNodeType.ExternalResource]: [
    {
      key: ResourceTreeNodeMenuKeys.VIEW_EXTERNAL_RESOURCE,
      text: '查看',
      ellipsis: true,
      actionType: actionTypes.read,
      hasDivider: true,
      run(session, node) {
        const externalResource: IExternalResource = node.data;
        if (session?.odcDatabase?.id) {
          openExternalResourceViewPage(
            externalResource.name,
            'INFO',
            session.odcDatabase.id,
            session.database?.dbName,
          );
        } else {
          message.error('会话信息不完整，无法查看外部资源');
        }
      },
    },
    {
      key: 'GLOBAL_SEARCH',
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.externalResource.GlobalSearch',
          defaultMessage: '全局搜索',
        }),
      ],
      icon: SearchOutlined,
      actionType: actionTypes.read,
      run(session, node) {
        openGlobalSearch(node);
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.CREATE_EXTERNAL_FUNCTION,
      text: '新建外部自定义函数',
      icon: FunctionOutlined,
      ellipsis: true,
      actionType: actionTypes.create,
      run(session, node) {
        const externalResource: IExternalResource = node.data;
        if (session?.odcDatabase?.id && session?.database?.dbName) {
          modalStore.changeCreateFunctionModalVisible(
            true,
            session.odcDatabase.id,
            session.database.dbName,
            true, // 标识从外部资源触发
            externalResource.name, // 传递外部资源名称
          );
        } else {
          message.error('会话信息不完整，无法创建函数');
        }
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.DOWNLOAD_EXTERNAL_RESOURCE,
      text: '下载',
      icon: DownloadOutlined,
      ellipsis: true,
      actionType: actionTypes.read,
      hasDivider: true,
      async run(session, node) {
        const externalResource: IExternalResource = node.data;
        try {
          if (!session?.sessionId || !session?.database?.dbName) {
            message.error('会话信息不完整，无法下载外部资源');
            return;
          }

          const success = await downloadExternalResourceFile(
            externalResource.name,
            session.database.dbName,
            session.sessionId,
          );

          if (success) {
            message.success('外部资源下载成功');
          } else {
            message.error('外部资源下载失败');
          }
        } catch (error) {
          console.error('下载外部资源失败:', error);
          message.error('外部资源下载失败');
        }
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.DELETE_EXTERNAL_RESOURCE,
      text: '删除',
      icon: DeleteOutlined,
      ellipsis: true,
      actionType: actionTypes.delete,
      async run(session, node) {
        const externalResource: IExternalResource = node.data;
        Modal.confirm({
          title: `确定要删除外部资源${externalResource?.name}吗？`,
          okText: formatMessage({
            id: 'app.button.ok',
            defaultMessage: '确定',
          }),
          cancelText: formatMessage({
            id: 'app.button.cancel',
            defaultMessage: '取消',
          }),
          async onOk() {
            if (session?.database?.deleteExternalResource) {
              const success = await session.database.deleteExternalResource(externalResource);
              if (success) {
                message.success('外部资源删除成功');
                // 刷新外部资源列表
                if (session?.database?.getExternalResourceList) {
                  await session.database.getExternalResourceList();
                }
              } else {
                message.error('外部资源删除失败');
              }
            }
          },
        });
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.REFRESH,
      text: '刷新',
      icon: ReloadOutlined,
      ellipsis: true,
      actionType: actionTypes.read,
      async run(session, node) {
        try {
          if (session?.database?.getExternalResourceList) {
            await session.database.getExternalResourceList();
            message.success('外部资源列表刷新成功');
          } else {
            message.error('无法获取刷新方法');
          }
        } catch (error) {
          console.error('刷新外部资源列表失败:', error);
          message.error('刷新外部资源列表失败');
        }
      },
    },
  ],
};
