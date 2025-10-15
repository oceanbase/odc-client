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

import { actionTypes } from '@/component/Acess';
import { DbObjectType, ITrigger, PageType, TriggerPropsTab, TriggerState } from '@/d.ts';
import {
  openBatchCompilePLPage,
  openCreateTriggerPage,
  openTriggerEditPageByName,
  openTriggerViewPage,
} from '@/store/helper/page';
import { formatMessage } from '@/util/intl';
import { ResourceNodeType } from '../../type';
import { hasChangePermission, hasExportPermission } from '../index';
import { IMenuItemConfig } from '../type';

import { getDataSourceModeConfig } from '@/common/datasource';
import { dropObject } from '@/common/network/database';
import { getTriggerByName, setTriggerStatus } from '@/common/network/trigger';
import { PLType } from '@/constant/plType';
import modal from '@/store/modal';
import pageStore from '@/store/page';
import { ReactComponent as BatchCompileSvg } from '@/svgr/batch-compile-all.svg';
import { downloadPLDDL } from '@/util/sqlExport';
import {
  PlusOutlined,
  QuestionCircleFilled,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { message, Modal } from 'antd';
import { isSupportExport, isSupportPLEdit } from './helper';
import { openGlobalSearch } from '../../const';

export const triggerMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.TriggerRoot]: [
    {
      key: 'BATCH_COMPILE',
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.trigger.BatchCompilation',
          defaultMessage: '批量编译',
        }), //批量编译
      ],
      icon: BatchCompileSvg,
      actionType: actionTypes.create,
      isHide(session, node) {
        return !getDataSourceModeConfig(session?.connection?.type)?.features?.compile;
      },
      run(session, node) {
        openBatchCompilePLPage(
          PageType.BATCH_COMPILE_TRIGGER,
          DbObjectType.trigger,
          formatMessage({ id: 'odc.components.ResourceTree.Trigger', defaultMessage: '触发器' }),
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },
    {
      key: 'CREATE_TRIGGER',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.actions.CreateATrigger',
          defaultMessage: '新建触发器',
        }),
      ],
      actionType: actionTypes.create,
      icon: PlusOutlined,
      run(session, node) {
        openCreateTriggerPage(null, session?.odcDatabase?.id, session?.database?.dbName);
      },
    },
    {
      key: 'GLOBAL_SEARCH',
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.trigger.GlobalSearch',
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
      key: 'REFRESH',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Refresh', defaultMessage: '刷新' }), //刷新
      ],
      icon: ReloadOutlined,
      actionType: actionTypes.read,
      async run(session, node) {
        await session.database.getTriggerList();
      },
    },
  ],

  [ResourceNodeType.Trigger]: [
    {
      key: 'OVERVIEW_TRIGGER',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.actions.ViewTriggers',
          defaultMessage: '查看触发器',
        }),
      ],
      ellipsis: true,
      run(session, node) {
        const trigger: ITrigger = node.data;
        openTriggerViewPage(
          trigger?.triggerName,
          TriggerPropsTab.DDL,
          trigger?.enableState,
          null,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },
    {
      key: 'GLOBAL_SEARCH',
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.trigger.GlobalSearch',
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
      key: 'EDIT_TRIGGER',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Editing', defaultMessage: '编辑' }), //编辑
      ],
      actionType: actionTypes.update,
      ellipsis: true,
      disabled: (session, node) => {
        return !isSupportPLEdit(session);
      },
      run(session, node) {
        const trigger: ITrigger = node.data;
        openTriggerEditPageByName(
          trigger?.triggerName,
          session?.sessionId,
          session?.database?.dbName,
          session?.odcDatabase?.id,
        );
      },
    },
    {
      key: 'COMPILE_TRIGGER',
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Compile', defaultMessage: '编译' }), //编译
      ],
      isHide(session, node) {
        return !getDataSourceModeConfig(session?.connection?.type)?.features?.compile;
      },
      disabled(session) {
        return !session?.supportFeature.enableTriggerCompile;
      },
      run(session, node) {
        return false;
      },
    },
    {
      key: 'ENABLE_TRIGGER',
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Enable', defaultMessage: '启用' }), //启用
      ],
      isHide(session, node) {
        return getDataSourceModeConfig(session?.connection?.type)?.features?.disableTriggerSwitch;
      },
      disabled(session, node) {
        const trigger: ITrigger = node.data;
        return (
          !session.supportFeature.enableTriggerAlterStatus || trigger?.enableState === 'ENABLED'
        );
      },
      actionType: actionTypes.update,
      async run(session, node) {
        const trigger: ITrigger = node.data || {};
        const { triggerName, enableState } = trigger;
        await setTriggerStatus(
          triggerName,
          TriggerState.enabled,
          session?.sessionId,
          session?.database?.dbName,
        );
        await session.database.getTriggerList();
        pageStore.updatePageColor(triggerName, enableState === TriggerState.disabled);
      },
    },
    {
      key: 'DISABLE_TRIGGER',
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Disable', defaultMessage: '禁用' }), //禁用
      ],
      disabled(session, node) {
        const trigger: ITrigger = node.data;
        return (
          !session.supportFeature.enableTriggerAlterStatus || trigger?.enableState !== 'ENABLED'
        );
      },
      isHide(session, node) {
        return (
          !session.supportFeature.enableTriggerAlterStatus ||
          getDataSourceModeConfig(session?.connection?.type)?.features?.disableTriggerSwitch
        );
      },
      actionType: actionTypes.update,
      hasDivider: true,
      async run(session, node) {
        const trigger: ITrigger = node.data || {};
        const { triggerName, enableState } = trigger;
        await setTriggerStatus(
          triggerName,
          TriggerState.disabled,
          session?.sessionId,
          session?.database?.dbName,
        );
        await session.database.getTriggerList();
        pageStore.updatePageColor(triggerName, enableState === TriggerState.enabled);
      },
    },

    {
      key: 'EXPORT',
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Export', defaultMessage: '导出' }), //导出
      ],
      disabled: (session) => {
        return !hasExportPermission(session);
      },
      isHide: (session) => {
        return !isSupportExport(session);
      },
      run(session, node) {
        const trigger: ITrigger = node.data || {};
        modal.changeExportModal(true, {
          type: DbObjectType.trigger,
          name: trigger?.triggerName,
          databaseId: session?.database.databaseId,
        });
      },
    },
    {
      key: 'DOWNLOAD',
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Download', defaultMessage: '下载' }), //下载
      ],
      hasDivider: true,
      async run(session, node) {
        const trigger: ITrigger = node.data;
        const obj = await getTriggerByName(
          trigger?.triggerName,
          session?.sessionId,
          session?.database?.dbName,
        );
        const ddl = obj?.ddl;
        if (ddl) {
          downloadPLDDL(trigger?.triggerName, PLType.TRIGGER, ddl, session?.database?.dbName);
        }
      },
    },

    {
      key: 'DELETE_TRIGGER',
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Delete', defaultMessage: '删除' }), //删除
      ],
      actionType: actionTypes.delete,
      disabled: (session) => {
        return !hasChangePermission(session);
      },
      run(session, node) {
        const trigger: ITrigger = node.data || {};
        Modal.confirm({
          title: formatMessage(
            {
              id: 'odc.components.ResourceTree.TriggerTree.AreYouSureYouWant',
              defaultMessage: '是否确定删除触发器{title}？',
            },
            { title: trigger?.triggerName },
          ), // `确定要删除触发器${title}吗？`
          okText: formatMessage({ id: 'app.button.ok', defaultMessage: '确定' }),

          cancelText: formatMessage({
            id: 'app.button.cancel',
            defaultMessage: '取消',
          }),

          centered: true,
          icon: <QuestionCircleFilled />,
          onOk: async () => {
            const isSuccess = await dropObject(
              trigger?.triggerName,
              DbObjectType.trigger,
              session?.sessionId,
            );
            if (!isSuccess) {
              return;
            }
            await session.database.getTriggerList();

            message.success(
              formatMessage({
                id: 'odc.components.ResourceTree.TriggerTree.DeletedSuccessfully',
                defaultMessage: '删除成功',
              }),
              // 删除成功
            );

            const openedPages = pageStore?.pages.filter(
              (p) =>
                p.title === trigger?.triggerName &&
                (p.type === PageType.TRIGGER || p.type === PageType.PL),
            );

            if (openedPages?.length) {
              openedPages.forEach((page) => pageStore.close(page.key));
            }
          },
        });
      },
    },
    {
      key: 'REFRESH_TRIGGER',
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Refresh', defaultMessage: '刷新' }), //刷新
      ],
      actionType: actionTypes.create,
      async run(session, node) {
        await session.database.getTriggerList();
      },
    },
  ],
};
