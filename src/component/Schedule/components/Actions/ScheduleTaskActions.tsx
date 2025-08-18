import {
  IScheduleTaskExecutionDetail,
  ScheduleTaskActionsEnum,
  ScheduleTaskStatus,
  SubTaskParameters,
  SubTaskType,
} from '@/d.ts/scheduleTask';
import { ScheduleTaskActionsTextMap } from '@/constant/scheduleTask';
import { useEffect, useMemo, useState } from 'react';
import Action from '@/component/Action';
import { Popconfirm, Dropdown, message, Modal } from 'antd';
import styles from './index.less';

import {
  pauseScheduleTask,
  resumeScheduleTask,
  startScheduleTask,
  stopScheduleTask,
} from '@/common/network/schedule';
import { formatMessage } from '@/util/intl';
import copy from 'copy-to-clipboard';
import login from '@/store/login';
import { scheduleTask } from '@/d.ts/scheduleTask';
import {
  EllipsisOutlined,
  BarsOutlined,
  ShareAltOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { MenuProps } from 'antd';
import { ScheduleTaskStatus2Actions } from '@/component/Schedule/const';
import useOperationPermissions from '@/util/hooks/useOperationPermissions';
import { widthPermission } from '@/util/utils';
import { IOperationTypeRole } from '@/d.ts/schedule';

interface ScheduleActionsIProps {
  subTask: scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>;
  onReloadList?: () => void;
  isDetailModal?: boolean;
  handleView: (
    task: scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>,
    visible: boolean,
  ) => void;
  scheduleId?: number;
  icon?: JSX.Element;
}
const ScheduleTaskActions: React.FC<ScheduleActionsIProps> = (props) => {
  const { onReloadList, subTask, isDetailModal, scheduleId } = props;
  const [activeBtnKey, setActiveBtnKey] = useState<ScheduleTaskActionsEnum>(null);

  /** 作业类任务不需要使用到审批人、创建者 */
  const { IRoles } = useOperationPermissions({
    currentUserResourceRoles:
      subTask?.project?.currentUserResourceRoles || subTask?.currentUserResourceRoles || [],
    approvable: false,
    createrId: undefined,
  });

  useEffect(() => {
    if (activeBtnKey) {
      resetActiveBtnKey();
    }
  }, [subTask?.status]);

  const resetActiveBtnKey = () => {
    setActiveBtnKey(null);
  };

  const _handleView = async () => {
    props?.handleView(subTask, true);
  };

  const _handleShare = async () => {
    const url =
      location.origin +
      location.pathname +
      `#/schedule?scheduleId=${scheduleId}&subTaskId=${subTask.id}&organizationId=${login.organizationId}&scheduleType=${subTask.type}`;
    copy(url);
    message.success(
      formatMessage({
        id: 'odc.src.component.Task.component.CommonDetailModal.Replication',
        defaultMessage: '复制成功',
      }), //'复制成功'
    );
  };

  const _handleExecute = async () => {
    setActiveBtnKey(ScheduleTaskActionsEnum.EXECUTE);
    const res = await startScheduleTask(scheduleId, subTask?.id);
    if (res?.data) {
      message.success('执行成功');
      onReloadList?.();
    }
  };

  const _handlePause = async () => {
    Modal.confirm({
      title: '确定要暂停此任务吗',
      content: '暂停后，任务任可重新恢复执行',
      cancelText: formatMessage({
        id: 'odc.TaskManagePage.component.TaskTools.Cancel',
        defaultMessage: '取消',
      }),
      okText: '暂停',
      centered: true,
      onOk: async () => {
        setActiveBtnKey(ScheduleTaskActionsEnum.PAUSE);
        const res = await pauseScheduleTask(scheduleId, subTask.id);
        if (res?.data) {
          message.success('暂停成功');
          onReloadList?.();
        }
      },
    });
  };

  const _handleRestore = async () => {
    setActiveBtnKey(ScheduleTaskActionsEnum.RESTORE);
    const res = await resumeScheduleTask(scheduleId, subTask?.id);
    if (res?.data) {
      message.success('恢复成功');
      onReloadList?.();
    }
  };

  const _handleRetry = async () => {
    setActiveBtnKey(ScheduleTaskActionsEnum.RETRY);
    const res = await resumeScheduleTask(scheduleId, subTask?.id);
    if (res?.data) {
      message.success('重试成功');
      onReloadList?.();
    }
  };

  const _handleStop = async () => {
    Modal.confirm({
      title: '确定要终止此任务吗',
      content: '终止后，此次任务将无法恢复',
      cancelText: formatMessage({
        id: 'odc.TaskManagePage.component.TaskTools.Cancel',
        defaultMessage: '取消',
      }), //取消
      okText: '终止',
      centered: true,
      onOk: async () => {
        setActiveBtnKey(ScheduleTaskActionsEnum.STOP);
        const res = await stopScheduleTask(scheduleId, subTask?.id);
        if (res?.data) {
          message.success('终止成功');
          onReloadList?.();
        }
      },
    });
  };

  const eventMap = {
    [ScheduleTaskActionsEnum.STOP]: _handleStop,
    [ScheduleTaskActionsEnum.EXECUTE]: _handleExecute,
    [ScheduleTaskActionsEnum.PAUSE]: _handlePause,
    [ScheduleTaskActionsEnum.RESTORE]: _handleRestore,
    [ScheduleTaskActionsEnum.RETRY]: _handleRetry,
    [ScheduleTaskActionsEnum.VIEW]: _handleView,
    [ScheduleTaskActionsEnum.SHARE]: _handleShare,
  };

  const ALL_ACTIONS = [
    {
      key: ScheduleTaskActionsEnum.STOP,
      label: ScheduleTaskActionsTextMap[ScheduleTaskActionsEnum.STOP],
      action: eventMap[ScheduleTaskActionsEnum.STOP],
      icon: <CloseCircleOutlined />,
      visible: widthPermission(
        (hasPermission) => hasPermission,
        [
          IOperationTypeRole.CREATOR,
          IOperationTypeRole.PROJECT_DBA,
          IOperationTypeRole.PROJECT_OWNER,
        ],
        IRoles,
      ),
    },
    {
      key: ScheduleTaskActionsEnum.EXECUTE,
      label: ScheduleTaskActionsTextMap[ScheduleTaskActionsEnum.EXECUTE],
      action: eventMap[ScheduleTaskActionsEnum.EXECUTE],
      visible: widthPermission(
        (hasPermission) => hasPermission,
        [
          IOperationTypeRole.CREATOR,
          IOperationTypeRole.PROJECT_DBA,
          IOperationTypeRole.PROJECT_OWNER,
        ],
        IRoles,
      ),
    },
    {
      key: ScheduleTaskActionsEnum.PAUSE,
      label: ScheduleTaskActionsTextMap[ScheduleTaskActionsEnum.PAUSE],
      action: eventMap[ScheduleTaskActionsEnum.PAUSE],
      allowScheduleType: [SubTaskType.DATA_ARCHIVE, SubTaskType.DATA_DELETE],
      visible: widthPermission(
        (hasPermission) => hasPermission,
        [
          IOperationTypeRole.CREATOR,
          IOperationTypeRole.PROJECT_DBA,
          IOperationTypeRole.PROJECT_OWNER,
        ],
        IRoles,
      ),
    },
    {
      key: ScheduleTaskActionsEnum.RESTORE,
      label: ScheduleTaskActionsTextMap[ScheduleTaskActionsEnum.RESTORE],
      action: eventMap[ScheduleTaskActionsEnum.RESTORE],
      allowScheduleType: [SubTaskType.DATA_ARCHIVE, SubTaskType.DATA_DELETE],
      visible: widthPermission(
        (hasPermission) => hasPermission,
        [
          IOperationTypeRole.CREATOR,
          IOperationTypeRole.PROJECT_DBA,
          IOperationTypeRole.PROJECT_OWNER,
        ],
        IRoles,
      ),
    },
    {
      key: ScheduleTaskActionsEnum.RETRY,
      label: ScheduleTaskActionsTextMap[ScheduleTaskActionsEnum.RETRY],
      action: eventMap[ScheduleTaskActionsEnum.RETRY],
      allowScheduleType: [SubTaskType.DATA_ARCHIVE, SubTaskType.DATA_DELETE],
      visible: widthPermission(
        (hasPermission) => hasPermission,
        [
          IOperationTypeRole.CREATOR,
          IOperationTypeRole.PROJECT_DBA,
          IOperationTypeRole.PROJECT_OWNER,
        ],
        IRoles,
      ),
    },
    {
      key: ScheduleTaskActionsEnum.VIEW,
      label: ScheduleTaskActionsTextMap[ScheduleTaskActionsEnum.VIEW],
      action: eventMap[ScheduleTaskActionsEnum.VIEW],
      icon: <BarsOutlined />,
      hideInDetail: true,
      visible: widthPermission((hasPermission) => hasPermission, [], IRoles),
    },
    {
      key: ScheduleTaskActionsEnum.SHARE,
      label: ScheduleTaskActionsTextMap[ScheduleTaskActionsEnum.SHARE],
      action: eventMap[ScheduleTaskActionsEnum.SHARE],
      icon: <ShareAltOutlined />,
      visible: widthPermission((hasPermission) => hasPermission, [], IRoles),
    },
  ];

  const renderTool = (tool) => {
    const ActionButton = isDetailModal ? Action.Button : Action.Link;
    const disabled = activeBtnKey === tool?.key;

    return (
      <ActionButton
        key={tool?.key}
        type={'default'}
        onClick={tool.action}
        tooltip={null}
        disabled={disabled}
      >
        {tool.label}
      </ActionButton>
    );
  };

  const actions = useMemo(() => {
    return ALL_ACTIONS.filter((item) => {
      let show = false;
      show = ScheduleTaskStatus2Actions[subTask?.status]?.includes(item.key);
      if (show && item.visible) {
        show = item?.visible() && show;
      }
      if (show && item.allowScheduleType) {
        show = item.allowScheduleType.includes(subTask?.type) && show;
      }
      return show;
    });
  }, [subTask?.status]);

  const menuItems: MenuProps['items'] = useMemo(() => {
    let items: MenuProps['items'] = actions
      ?.map((tool) => {
        if (!tool?.icon) return;
        const { key, label, icon } = tool || {};
        return {
          key,
          label,
          icon,
          disabled: activeBtnKey === key,
        };
      })
      ?.filter(Boolean);
    // 判断是否需要加分割线
    if (
      items?.find((item) => item.key === ScheduleTaskActionsEnum.VIEW) &&
      items?.[0]?.key !== ScheduleTaskActionsEnum.VIEW
    ) {
      const viewIndex = items?.findIndex((item) => item?.key === ScheduleTaskActionsEnum.VIEW);
      items?.splice(viewIndex, 0, { type: 'divider' });
    }
    return items;
  }, [actions, activeBtnKey]);

  return (
    <>
      <Action.Group size={!isDetailModal ? 4 : 6}>
        {actions?.map((tool) => {
          /** 有icon代表着在列表页会放在下拉菜单里 */
          if (!isDetailModal && tool.icon) return;
          /** 屏蔽掉不展示在详情页的按钮 */
          if (isDetailModal && tool.hideInDetail) return;
          return renderTool(tool);
        })}
      </Action.Group>
      {!isDetailModal && !!menuItems?.length && (
        <Dropdown
          overlayClassName={styles.scheduleActionsDropdown}
          menu={{
            items: menuItems,
            onClick: (a) => eventMap?.[a.key]?.(),
          }}
        >
          <EllipsisOutlined
            style={{ marginLeft: '6px', color: 'var(--icon-blue-color)', cursor: 'pointer' }}
          />
        </Dropdown>
      )}
    </>
  );
};
export default ScheduleTaskActions;
