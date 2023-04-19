import { deleteType, getType } from '@/common/network/type';
import { actionTypes } from '@/component/Acess';
import { PLType } from '@/constant/plType';
import { IType, PageType, TypePropsTab } from '@/d.ts';
import { openTypeViewPage } from '@/store/helper/page';
import modal from '@/store/modal';
import pageStore from '@/store/page';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { QuestionCircleFilled } from '@ant-design/icons';
import { message, Modal } from 'antd';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';

export const typeMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.Type]: [
    {
      key: 'OVERVIEW',
      text: [formatMessage({ id: 'odc.ResourceTree.actions.ViewType' })],
      run(session, node) {
        const type: IType = node.data;
        openTypeViewPage(
          type?.typeName,
          TypePropsTab.DDL,
          session?.sessionId,
          session?.database?.dbName,
        );
      },
    },

    {
      key: 'CREATE',
      text: [formatMessage({ id: 'odc.ResourceTree.actions.NewType' })],
      actionType: actionTypes.create,
      hasDivider: true,
      run(session, node) {
        modal.changeCreateTypeModalVisible(true, session?.sessionId, session?.database?.dbName);
      },
    },

    {
      key: 'DOWNLOAD',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Download' }), //下载
      ],
      hasDivider: true,
      async run(session, node) {
        const type: IType = node.data;
        const obj = await getType(
          type?.typeName,
          false,
          session?.database?.dbName,
          session?.sessionId,
        );
        const ddl = obj?.ddl;
        if (ddl) {
          downloadPLDDL(type?.typeName, PLType.TYPE, ddl, session?.database?.dbName);
        }
      },
    },

    {
      key: 'DELETE',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Delete' }), //删除
      ],
      actionType: actionTypes.delete,
      run(session, node) {
        const type: IType = node.data;

        Modal.confirm({
          title: formatMessage(
            {
              id: 'odc.components.ResourceTree.TypeTree.AreYouSureYouWant',
            },
            { title: type?.typeName },
          ), // `确定要删除类型${title}吗？`
          okText: formatMessage({ id: 'app.button.ok' }),

          cancelText: formatMessage({
            id: 'app.button.cancel',
          }),

          centered: true,
          icon: <QuestionCircleFilled />,
          onOk: async () => {
            await deleteType(type?.typeName, session?.sessionId, session?.database?.dbName);
            await session?.database?.getTypeList();

            message.success(
              formatMessage({
                id: 'odc.components.ResourceTree.TypeTree.DeletedSuccessfully',
              }),
              // 删除成功
            );

            const openedPages = pageStore?.pages.filter(
              (p) =>
                p.title === type?.typeName && (p.type === PageType.TYPE || p.type === PageType.PL),
            );

            if (openedPages.length) {
              for (let p of openedPages) {
                await pageStore.close(p.key);
              }
            }
          },
        });
      },
    },
    {
      key: 'REFRESH',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Refresh' }), //刷新
      ],
      actionType: actionTypes.create,
      async run(session, node) {
        await session.database.getTypeList();
      },
    },
  ],
};
