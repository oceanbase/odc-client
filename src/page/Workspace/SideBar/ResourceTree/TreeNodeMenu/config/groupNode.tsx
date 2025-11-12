import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';
import { openGlobalSearch } from '../../const';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { formatMessage } from '@/util/intl';
import { actionTypes, IManagerResourceType, TaskPageType, TaskType } from '@/d.ts';

export const groupNodeMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.GroupNodeProject]: [
    {
      key: 'GLOBAL_SEARCH',
      text: [
        formatMessage({
          id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.B034F159',
          defaultMessage: '全局搜索',
        }),
      ],
      icon: SearchOutlined,
      actionType: actionTypes.read,
      run(session, node) {
        openGlobalSearch(node);
      },
    },
  ],
};
