import { DbObjectType, IDatabase, TriggerState } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import TriggerSvg from '@/svgr/menuTrigger.svg';
import { formatMessage } from '@/util/intl';
import Icon, { FolderOpenFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { ResourceNodeType, TreeDataNode } from '../type';

enum THEME {
  TRIGGER_ENABLE = 'var(--icon-color-3)',
  TRIGGER_DISABLE = 'var(--icon-color-disable)',
}

export function TriggerTreeData(dbSession: SessionStore, database: IDatabase): TreeDataNode {
  const dbName = database.name;
  const triggers = dbSession?.database?.triggers;
  const treeData: TreeDataNode = {
    title: '触发器',
    key: `${dbName}-trigger`,
    type: ResourceNodeType.TriggerRoot,
    data: database,
    icon: (
      <FolderOpenFilled
        style={{
          color: '#3FA3FF',
        }}
      />
    ),
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };
  if (triggers) {
    treeData.children = triggers.map((trigger) => {
      const title =
        trigger.enableState === TriggerState.enabled
          ? formatMessage({ id: 'odc.ResourceTree.config.procedure.Enable' }) // 启用
          : formatMessage({ id: 'odc.ResourceTree.config.procedure.Disable' }); // 禁用
      const icon = (
        <Tooltip placement="right" title={title}>
          <Icon
            component={TriggerSvg}
            style={{
              color: trigger.enableState ? THEME.TRIGGER_ENABLE : THEME.TRIGGER_DISABLE,
            }}
          />
        </Tooltip>
      );
      const key = `${dbName}-trigger-${trigger.triggerName}`;
      return {
        title: trigger.triggerName,
        key,
        type: ResourceNodeType.Trigger,
        dbObjectType: DbObjectType.trigger,
        data: trigger,
        icon: icon,
        warning: trigger.status === 'INVALID' ? trigger.errorMessage : null,
        sessionId: dbSession?.sessionId,
        isLeaf: true,
      };
    });
  }

  return treeData;
}
