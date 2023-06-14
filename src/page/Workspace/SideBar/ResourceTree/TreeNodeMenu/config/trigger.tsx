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
import { IMenuItemConfig } from '../type';

import { deleteTrigger, getTriggerByName, setTriggerStatus } from '@/common/network/trigger';
import { PLType } from '@/constant/plType';
import modal from '@/store/modal';
import pageStore from '@/store/page';
import BatchCompileSvg from '@/svgr/batch-compile-all.svg';
import { downloadPLDDL } from '@/util/sqlExport';
import { PlusOutlined, QuestionCircleFilled } from '@ant-design/icons';
import { message, Modal } from 'antd';

export const triggerMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.TriggerRoot]: [
    {
      key: 'BATCH_COMPILE',
      text: ['批量编译'],
      icon: BatchCompileSvg,
      actionType: actionTypes.create,
      run(session, node) {
        openBatchCompilePLPage(
          PageType.BATCH_COMPILE_TRIGGER,
          DbObjectType.trigger,
          formatMessage({ id: 'odc.components.ResourceTree.Trigger' }),
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },
    {
      key: 'CREATE_TRIGGER',
      text: [formatMessage({ id: 'odc.ResourceTree.actions.CreateATrigger' })],
      actionType: actionTypes.create,
      icon: PlusOutlined,
      run(session, node) {
        openCreateTriggerPage(null, session?.odcDatabase?.id, session?.database?.dbName);
      },
    },
  ],
  [ResourceNodeType.Trigger]: [
    {
      key: 'OVERVIEW_TRIGGER',
      text: [formatMessage({ id: 'odc.ResourceTree.actions.ViewTriggers' })],
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
      key: 'EDIT_TRIGGER',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Editing' }), //编辑
      ],
      actionType: actionTypes.update,
      ellipsis: true,
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
        formatMessage({ id: 'odc.ResourceTree.actions.Compile' }), //编译
      ],
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
        formatMessage({ id: 'odc.ResourceTree.actions.Enable' }), //启用
      ],
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
        formatMessage({ id: 'odc.ResourceTree.actions.Disable' }), //禁用
      ],
      disabled(session, node) {
        const trigger: ITrigger = node.data;
        return (
          !session.supportFeature.enableTriggerAlterStatus || trigger?.enableState !== 'ENABLED'
        );
      },
      isHide(session, node) {
        return !session.supportFeature.enableTriggerAlterStatus;
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
        formatMessage({ id: 'odc.ResourceTree.actions.Export' }), //导出
      ],
      run(session, node) {
        const trigger: ITrigger = node.data || {};
        modal.changeExportModal(true, {
          type: DbObjectType.trigger,
          name: trigger?.triggerName,
        });
      },
    },
    {
      key: 'DOWNLOAD',
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Download' }), //下载
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
        formatMessage({ id: 'odc.ResourceTree.actions.Delete' }), //删除
      ],
      actionType: actionTypes.delete,
      run(session, node) {
        const trigger: ITrigger = node.data || {};
        Modal.confirm({
          title: formatMessage(
            {
              id: 'odc.components.ResourceTree.TriggerTree.AreYouSureYouWant',
            },
            { title: trigger?.triggerName },
          ), // `确定要删除触发器${title}吗？`
          okText: formatMessage({ id: 'app.button.ok' }),

          cancelText: formatMessage({
            id: 'app.button.cancel',
          }),

          centered: true,
          icon: <QuestionCircleFilled />,
          onOk: async () => {
            await deleteTrigger(
              trigger?.triggerName,
              session?.sessionId,
              session?.database?.dbName,
            );
            await session.database.getTriggerList();

            message.success(
              formatMessage({
                id: 'odc.components.ResourceTree.TriggerTree.DeletedSuccessfully',
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
        formatMessage({ id: 'odc.ResourceTree.actions.Refresh' }), //刷新
      ],
      actionType: actionTypes.create,
      async run(session, node) {
        await session.database.getTriggerList();
      },
    },
  ],
};
