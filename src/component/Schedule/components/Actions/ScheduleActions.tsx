import {
  ScheduleType,
  ScheduleActionsEnum,
  ScheduleDetailType,
  IOperationTypeRole,
} from '@/d.ts/schedule';
import { ScheduleActionsTextMap, ScheduleTextMap } from '@/constant/schedule';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Dropdown, message, Modal, MenuProps } from 'antd';
import Action from '@/component/Action';
import {
  deleteSchedule,
  pauseSchedule,
  resumeSchedule,
  terminateSchedule,
} from '@/common/network/schedule';
import copy from 'copy-to-clipboard';
import login from '@/store/login';
import { formatMessage } from '@/util/intl';
import { IScheduleRecord, ScheduleRecordParameters } from '@/d.ts/schedule';
import { inject, observer } from 'mobx-react';
import { ScheduleStore } from '@/store/schedule';
import { ModalStore } from '@/store/modal';
import { SchedulePageMode } from '../../interface';
import styles from './index.less';
import { revokeTask } from '@/common/network/task';
import {
  EllipsisOutlined,
  BarsOutlined,
  ShareAltOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { ScheduleStatus2Actions } from '@/component/Schedule/const';
import { widthPermission } from '@/util/utils';
import useOperationPermissions from '@/util/hooks/useOperationPermissions';
import ProjectContext from '@/page/Project/ProjectContext';

export interface scheduleActions {
  key: ScheduleActionsEnum;
  label: string;
  action: () => void;
  icon?: React.ReactNode;
  visible: () => boolean;
  hideInDetail?: boolean;
}

interface ScheduleActionsIProps {
  schedule: IScheduleRecord<ScheduleRecordParameters>;
  onReloadList: () => void;
  scheduleStore?: ScheduleStore;
  modalStore?: ModalStore;
  onClose?: () => void;
  isDetailModal?: boolean;
  onDetailVisible?: (
    schedule: IScheduleRecord<ScheduleRecordParameters>,
    visible: boolean,
    detailType?: ScheduleDetailType,
  ) => void;
  mode?: SchedulePageMode;
  delList?: number[];
  setDelList?: React.Dispatch<React.SetStateAction<number[]>>;
  onApprovalVisible?: (status: boolean, id: number) => void;
}

const ScheduleActions: React.FC<ScheduleActionsIProps> = (props) => {
  const {
    schedule,
    onReloadList,
    scheduleStore,
    isDetailModal,
    onClose,
    onDetailVisible,
    mode,
    delList = [],
    setDelList,
    onApprovalVisible,
  } = props;
  const { project } = useContext(ProjectContext) || {};
  const projectId = project?.id;
  const [activeBtnKey, setActiveBtnKey] = useState<ScheduleActionsEnum>(null);

  const { IRoles } = useOperationPermissions({
    currentUserResourceRoles:
      schedule?.currentUserResourceRoles || schedule?.project?.currentUserResourceRoles || [],
    approvable: schedule?.approvable,
    createrId: schedule?.creator?.id,
  });

  useEffect(() => {
    if (activeBtnKey) {
      resetActiveBtnKey();
    }
  }, [schedule?.status]);

  const resetActiveBtnKey = () => {
    setActiveBtnKey(null);
  };

  const _handleView = () => {
    onDetailVisible?.(schedule, true);
  };

  const _handleShare = async () => {
    const url =
      location.origin +
      location.pathname +
      `#/schedule?scheduleId=${schedule?.scheduleId}&scheduleType=${schedule?.type}&organizationId=${login.organizationId}`;
    copy(url);
    message.success(
      formatMessage({
        id: 'odc.src.component.Task.component.CommonDetailModal.Replication',
        defaultMessage: '复制成功',
      }), //'复制成功'
    );
  };

  const _handleStop = async () => {
    const { scheduleId } = schedule;
    const scheduleTypeText = ScheduleTextMap[schedule?.type];
    Modal.confirm({
      title: `确定要终止${scheduleTypeText}吗`,
      content: (
        <>
          <div>
            {formatMessage({
              id: 'src.component.Task.component.ActionBar.5E24502A',
              defaultMessage: '任务终止后将不可恢复',
            })}
          </div>
        </>
      ),
      cancelText: formatMessage({
        id: 'odc.TaskManagePage.component.TaskTools.Cancel',
        defaultMessage: '取消',
      }), //取消
      okText: '终止',
      centered: true,
      onOk: async () => {
        setActiveBtnKey(ScheduleActionsEnum.STOP);
        const res = await terminateSchedule(scheduleId);
        if (res?.data) {
          message.success('任务需要重新审批，审批通过后此任务将终止');
          onReloadList?.();
        } else {
          resetActiveBtnKey();
        }
      },
    });
  };

  const _handleDisable = async () => {
    const { scheduleId } = schedule;
    const scheduleTypeText = ScheduleTextMap[schedule?.type];
    Modal.confirm({
      title: `确定要禁用此${scheduleTypeText}吗`,
      content: (
        <>
          <div>
            {formatMessage(
              {
                id: 'src.component.Task.component.ActionBar.EC0C09D6',
                defaultMessage: '禁用{TaskTypeMapTaskType}',
              },
              { TaskTypeMapTaskType: ScheduleTextMap[schedule?.type] },
            )}
          </div>
          <div>
            {
              formatMessage({
                id: 'odc.TaskManagePage.component.TaskTools.TheTaskNeedsToBe',
                defaultMessage: '任务需要重新审批，审批通过后此任务将禁用',
              }) /*任务需要重新审批，审批通过后此任务将禁用*/
            }
          </div>
        </>
      ),
      cancelText: formatMessage({
        id: 'odc.TaskManagePage.component.TaskTools.Cancel',
        defaultMessage: '取消',
      }),
      okText: '禁用',
      centered: true,
      onOk: async () => {
        setActiveBtnKey(ScheduleActionsEnum.DISABLE);
        const res = await pauseSchedule(scheduleId);
        if (res?.data) {
          message.success(
            formatMessage({
              id: 'odc.TaskManagePage.component.TaskTools.TheTaskNeedsToBe',
              defaultMessage: '任务需要重新审批，审批通过后此任务将禁用',
            }),
          );
          onReloadList?.();
        }
      },
    });
  };

  const _handleEnable = async () => {
    const { scheduleId } = schedule;
    const scheduleTypeText = ScheduleTextMap[schedule?.type];
    Modal.confirm({
      title: `确定要启用此${scheduleTypeText}吗`,
      content: (
        <>
          <div>
            {
              formatMessage({
                id: 'odc.TaskManagePage.component.TaskTools.EnableSqlScheduling',
                defaultMessage: '启用 SQL 计划',
              }) /*启用 SQL 计划*/
            }
          </div>
          <div>
            {formatMessage({
              id: 'odc.TaskManagePage.component.TaskTools.TheTaskNeedsToBe.1',
              defaultMessage: '任务需要重新审批，审批通过后此任务将启用',
            })}
          </div>
        </>
      ),
      cancelText: formatMessage({
        id: 'odc.TaskManagePage.component.TaskTools.Cancel',
        defaultMessage: '取消',
      }),
      okText: '启用',
      centered: true,
      onOk: async () => {
        setActiveBtnKey(ScheduleActionsEnum.ENABLE);
        const res = await resumeSchedule(scheduleId);
        if (res?.data) {
          message.success(
            formatMessage({
              id: 'odc.TaskManagePage.component.TaskTools.TheTaskNeedsToBe.1',
              defaultMessage: '任务需要重新审批，审批通过后此任务将启用',
            }),
          );
          onReloadList?.();
        }
      },
    });
  };

  const _handleEdit = async () => {
    onClose?.();
    switch (schedule?.type) {
      case ScheduleType.DATA_ARCHIVE: {
        scheduleStore.setDataArchiveData(true, mode, {
          id: schedule?.scheduleId,
          type: 'EDIT',
          projectId,
        });
        break;
      }
      case ScheduleType.SQL_PLAN: {
        scheduleStore.setSQLPlanData(true, mode, {
          id: schedule?.scheduleId,
          type: 'EDIT',
          projectId,
        });
        break;
      }
      case ScheduleType.PARTITION_PLAN: {
        scheduleStore.setPartitionPlanData(true, mode, {
          id: schedule?.scheduleId,
          type: 'EDIT',
          projectId,
        });
        break;
      }
      case ScheduleType.DATA_DELETE: {
        scheduleStore.setDataClearData(true, mode, {
          id: schedule?.scheduleId,
          type: 'EDIT',
          projectId,
        });
        break;
      }
    }
  };

  const _handleClone = async () => {
    onClose?.();
    switch (schedule?.type) {
      case ScheduleType.DATA_ARCHIVE: {
        scheduleStore.setDataArchiveData(true, mode, {
          id: schedule?.scheduleId,
          type: 'RETRY',
          projectId,
        });
        break;
      }
      case ScheduleType.SQL_PLAN: {
        scheduleStore.setSQLPlanData(true, mode, {
          id: schedule?.scheduleId,
          databaseId: schedule?.database?.id,
          type: 'RETRY',
          projectId,
        });
        break;
      }
      case ScheduleType.PARTITION_PLAN: {
        scheduleStore.setPartitionPlanData(true, mode, {
          id: schedule?.scheduleId,
          databaseId: schedule?.database?.id,
          type: 'RETRY',
          projectId,
        });
        break;
      }
      case ScheduleType.DATA_DELETE: {
        scheduleStore.setDataClearData(true, mode, {
          id: schedule?.scheduleId,
          type: 'RETRY',
          projectId,
        });
        break;
      }
    }
  };

  const _handleDelete = async () => {
    const { scheduleId } = schedule;
    const scheduleTypeText = ScheduleTextMap[schedule?.type];
    Modal.confirm({
      title: `确定要删除此${scheduleTypeText}吗`,
      content: (
        <>
          <div>
            {formatMessage({
              id: 'odc.TaskManagePage.component.TaskTools.TheTaskNeedsToBe',
              defaultMessage: '任务需要重新审批，审批通过后此任务将删除',
            })}
          </div>
        </>
      ),
      cancelText: formatMessage({
        id: 'odc.TaskManagePage.component.TaskTools.Cancel',
        defaultMessage: '取消',
      }), //取消
      okText: '删除',
      centered: true,
      onOk: async () => {
        setDelList?.([...delList, scheduleId]);
        const res = await deleteSchedule(scheduleId);
        if (res?.data) {
          message.success('任务需要重新审批，审批通过后此任务将删除');
          onReloadList?.();
          onClose?.();
        }
      },
    });
  };

  const _handlePass = async () => {
    onApprovalVisible(true, schedule?.approveInstanceId);
  };

  const _handleRevoke = async () => {
    const { approveInstanceId } = schedule;
    const scheduleTypeText = ScheduleTextMap[schedule?.type];
    Modal.confirm({
      title: `确定要撤销此${scheduleTypeText}审批吗`,
      content: <div>审批撤销后，作业将进入终止态</div>,
      cancelText: formatMessage({
        id: 'odc.TaskManagePage.component.TaskTools.Cancel',
        defaultMessage: '取消',
      }), //取消
      okText: '确定',
      centered: true,
      onOk: async () => {
        setActiveBtnKey(ScheduleActionsEnum.REVOKE);
        const res = await revokeTask(approveInstanceId);
        if (res) {
          message.success('撤销成功');
          onReloadList?.();
          onClose?.();
        }
      },
    });
  };

  const _handleRefuse = async () => {
    onApprovalVisible(false, schedule?.approveInstanceId);
  };

  const eventMap = {
    [ScheduleActionsEnum.STOP]: _handleStop,
    [ScheduleActionsEnum.DISABLE]: _handleDisable,
    [ScheduleActionsEnum.ENABLE]: _handleEnable,
    [ScheduleActionsEnum.EDIT]: _handleEdit,
    [ScheduleActionsEnum.DELETE]: _handleDelete,
    [ScheduleActionsEnum.VIEW]: _handleView,
    [ScheduleActionsEnum.CLONE]: _handleClone,
    [ScheduleActionsEnum.SHARE]: _handleShare,
    [ScheduleActionsEnum.PASS]: _handlePass,
    [ScheduleActionsEnum.REVOKE]: _handleRevoke,
    [ScheduleActionsEnum.REFUSE]: _handleRefuse,
  };

  const COMMON_ACTIONS: Array<scheduleActions> = [
    {
      key: ScheduleActionsEnum.STOP,
      label: ScheduleActionsTextMap[ScheduleActionsEnum.STOP],
      action: eventMap[ScheduleActionsEnum.STOP],
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
      key: ScheduleActionsEnum.DISABLE,
      label: ScheduleActionsTextMap[ScheduleActionsEnum.DISABLE],
      action: eventMap[ScheduleActionsEnum.DISABLE],
      icon: <PauseCircleOutlined />,
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
      key: ScheduleActionsEnum.ENABLE,
      label: ScheduleActionsTextMap[ScheduleActionsEnum.ENABLE],
      action: eventMap[ScheduleActionsEnum.ENABLE],
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
      key: ScheduleActionsEnum.EDIT,
      label: ScheduleActionsTextMap[ScheduleActionsEnum.EDIT],
      action: eventMap[ScheduleActionsEnum.EDIT],
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
      key: ScheduleActionsEnum.DELETE,
      label: ScheduleActionsTextMap[ScheduleActionsEnum.DELETE],
      icon: <DeleteOutlined />,
      action: eventMap[ScheduleActionsEnum.DELETE],
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
      key: ScheduleActionsEnum.VIEW,
      label: ScheduleActionsTextMap[ScheduleActionsEnum.VIEW],
      icon: <BarsOutlined />,
      action: eventMap[ScheduleActionsEnum.VIEW],
      visible: widthPermission((hasPermission) => hasPermission, [], IRoles),
      hideInDetail: true,
    },
    {
      key: ScheduleActionsEnum.CLONE,
      label: ScheduleActionsTextMap[ScheduleActionsEnum.CLONE],
      icon: <CopyOutlined />,
      action: eventMap[ScheduleActionsEnum.CLONE],
      visible: widthPermission(
        (hasPermission) => hasPermission,
        [IOperationTypeRole.CREATOR],
        IRoles,
      ),
    },
    {
      key: ScheduleActionsEnum.SHARE,
      label: ScheduleActionsTextMap[ScheduleActionsEnum.SHARE],
      icon: <ShareAltOutlined />,
      action: eventMap[ScheduleActionsEnum.SHARE],
      visible: widthPermission((hasPermission) => hasPermission, [], IRoles),
    },
  ];

  const APPROVAL_ACTIONS: Array<scheduleActions> = [
    {
      key: ScheduleActionsEnum.PASS,
      label: ScheduleActionsTextMap[ScheduleActionsEnum.PASS],
      action: eventMap[ScheduleActionsEnum.PASS],
      visible: widthPermission(
        (hasPermission) => hasPermission,
        [IOperationTypeRole.APPROVER],
        IRoles,
      ),
    },
    {
      key: ScheduleActionsEnum.REVOKE,
      label: ScheduleActionsTextMap[ScheduleActionsEnum.REVOKE],
      action: eventMap[ScheduleActionsEnum.REVOKE],
      icon: <CloseCircleOutlined />,
      visible: widthPermission(
        (hasPermission) => hasPermission,
        [IOperationTypeRole.CREATOR],
        IRoles,
      ),
    },
    {
      key: ScheduleActionsEnum.REFUSE,
      label: ScheduleActionsTextMap[ScheduleActionsEnum.REFUSE],
      action: eventMap[ScheduleActionsEnum.REFUSE],
      visible: widthPermission(
        (hasPermission) => hasPermission,
        [IOperationTypeRole.APPROVER],
        IRoles,
      ),
    },
  ];

  const actions = useMemo(() => {
    let _actions = COMMON_ACTIONS.filter((item) => {
      let show = false;
      show = ScheduleStatus2Actions[schedule?.status]?.includes(item.key);
      if (show && item.visible) {
        show = item?.visible() && show;
      }
      return show;
    });
    if (schedule?.approvable) {
      APPROVAL_ACTIONS.forEach((item) => {
        let show = item?.visible();
        if (show) {
          _actions.unshift(item);
        }
      });
    }
    return _actions;
  }, [schedule?.status, schedule?.approvable]);

  const menuItems: MenuProps['items'] = useMemo(() => {
    let items: MenuProps['items'] = actions
      ?.map((tool) => {
        if (!tool?.icon) return;
        const { key, label, icon } = tool || {};
        const disabled = activeBtnKey === key || delList.includes(schedule?.scheduleId);
        return {
          key,
          label,
          icon,
          disabled,
        };
      })
      ?.filter(Boolean);
    // 判断是否需要加分割线
    if (
      items?.find((item) => item.key === ScheduleActionsEnum.VIEW) &&
      items?.[0]?.key !== ScheduleActionsEnum.VIEW
    ) {
      const viewIndex = items?.findIndex((item) => item?.key === ScheduleActionsEnum.VIEW);
      items?.splice(viewIndex, 0, { type: 'divider' });
    }
    return items;
  }, [actions, delList, activeBtnKey]);

  const renderTool = (tool: scheduleActions) => {
    const ActionButton = isDetailModal ? Action.Button : Action.Link;
    const disabled = activeBtnKey === tool?.key || delList.includes(schedule?.scheduleId);
    return (
      <ActionButton
        key={tool?.key}
        type={'default'}
        onClick={tool.action}
        disabled={disabled}
        tooltip={null}
      >
        {tool.label}
      </ActionButton>
    );
  };

  return (
    <>
      <Action.Group size={!isDetailModal ? 6 : 9}>
        {actions?.map((tool) => {
          /** 有icon代表着在列表页会放在下拉菜单里 */
          if (tool.icon && !isDetailModal) return;
          /** 屏蔽掉不展示在详情的按钮 */
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

export default inject('scheduleStore', 'modalStore')(observer(ScheduleActions));
