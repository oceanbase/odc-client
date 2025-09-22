import copy from 'copy-to-clipboard';
import login from '@/store/login';
import { formatMessage } from '@/util/intl';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@/store/modal';
import { TaskStore } from '@/store/task';
import type { UserStore } from '@/store/login';
import { SettingStore } from '@/store/setting';
import { TaskRecord, TaskRecordParameters, TaskDetail, RollbackType } from '@/d.ts';
import useOperationPermissions from '@/util/hooks/useOperationPermissions';
import { TaskActionsEnum } from '@/d.ts/task';
import {
  againTask,
  createTask,
  downloadTaskFlow,
  executeTask,
  getStructureComparisonTaskFile,
  getTaskResult,
  stopTask,
  getTaskDetail,
  getAsyncResultSet,
} from '@/common/network/task';
import React, { useEffect, useMemo, useState } from 'react';
import { Dropdown, MenuProps, message, Modal, Popconfirm, Tooltip } from 'antd';
import {
  IApplyDatabasePermissionTaskParams,
  IApplyTablePermissionTaskParams,
  IAsyncTaskParams,
  IMultipleAsyncTaskParams,
  ITaskResult,
  TaskExecStrategy,
  TaskStatus,
  TaskType,
  IResultSetExportTaskParams,
  ISqlExecuteResultStatus,
  IMockDataParams,
  IApplyPermissionTaskParams,
} from '@/d.ts';
import { downloadFile, getLocalFormatDateTime, uniqueTools } from '@/util/utils';
import ipcInvoke from '@/util/client/service';
import { openSQLResultSetViewPage } from '@/store/helper/page';
import { TaskActionsTextMap } from '@/constant/task';
import {
  EllipsisOutlined,
  BarsOutlined,
  ShareAltOutlined,
  CloseCircleOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { TaskStatus2Actions } from '@/component/Task/const';
import { isClient } from '@/util/env';
import { widthPermission } from '@/util/utils';
import Action from '@/component/Action';
import styles from './index.less';
import RollBackModal from '../RollbackConfirmModal';
import { IOperationTypeRole } from '@/d.ts/schedule';
import { ReactComponent as RollbackSvg } from '@/svgr/Roll-back.svg';
import Icon from '@ant-design/icons';

interface TaskActionsProps {
  modalStore?: ModalStore;
  taskStore?: TaskStore;
  userStore?: UserStore;
  settingStore?: SettingStore;

  disabledSubmit?: boolean;
  onApprovalVisible?: (status: boolean, id: number) => void;
  onDetailVisible: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
  onClose?: () => void;
  task: Partial<TaskRecord<TaskRecordParameters> | TaskDetail<TaskRecordParameters>>;
  onReloadList?: () => void;
  onReload?: () => void;
  result?: ITaskResult;
  isDetailModal?: boolean;
}

enum actionShowScene {
  list = 'list',
  detail = 'detail',
}

interface taskActionsConfig {
  key: TaskActionsEnum;
  label: string;
  action: () => void;
  /** 如果有icon，则意味着这个操作在列表页时是放在下拉菜单里的 */
  icon?: React.ReactNode;
  /** 展示场景 */
  showScene: actionShowScene[];
  /** 允许的操作类型，
   * 如果操作配置有allowTaskType，则需要判断工单类型是否在allowTaskType中，
   * 无allowTaskType则不需要判断，默认展示 */
  allowTaskType?: TaskType[];
  visible: () => boolean;
  /** 如果disabledTooltip返回不为空，则代表要禁用，并且用返回的string作为tooltip */
  disabledTooltip?: () => string;
}

const TaskActions: React.FC<TaskActionsProps> = (props) => {
  const {
    task,
    modalStore,
    result,
    taskStore,
    settingStore,
    isDetailModal,
    disabledSubmit = false,
  } = props;
  const [openRollback, setOpenRollback] = useState(false);
  const [activeBtnKey, setActiveBtnKey] = useState<TaskActionsEnum>();
  const isSqlworkspace = location?.hash?.includes('sqlworkspace');
  const disabledApproval =
    task?.status === TaskStatus.WAIT_FOR_CONFIRM && !isDetailModal ? true : disabledSubmit;

  /** 工单不需要从approveByCurrentUser判断当前用户是否可以审批，直接传true即可 */
  const { IRoles } = useOperationPermissions({
    currentUserResourceRoles: task?.project?.currentUserResourceRoles || [],
    approvable: task?.approvable,
    createrId: task?.creator?.id,
    approveByCurrentUser: true,
  });

  const closeTaskDetail = async () => {
    props.onDetailVisible(null, false);
  };

  const _rollbackTask = async () => {
    setOpenRollback(true);
  };

  const _stopTask = async () => {
    setActiveBtnKey(TaskActionsEnum.STOP);
    const res = await stopTask(task.id);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.TaskManagePage.TerminatedSuccessfully',
          defaultMessage: '终止成功',
        }),
      );
      props?.onReloadList?.();
      props?.onReload?.();
    } else {
      setActiveBtnKey(undefined);
    }
  };

  const _executeTask = async () => {
    setActiveBtnKey(TaskActionsEnum.EXECUTE);
    const res = await executeTask(task.id);
    if (res) {
      message.success(
        formatMessage({
          id: 'src.component.Task.component.ActionBar.10A4FEFD',
          defaultMessage: '开始执行',
        }),
      );
      closeTaskDetail();
      props?.onReloadList?.();
      setActiveBtnKey(undefined);
    } else {
      setActiveBtnKey(undefined);
    }
  };

  const _approvalTask = async (status: boolean) => {
    props.onApprovalVisible(status, task?.id);
  };

  const _retryTask = async () => {
    const { type } = task;

    switch (type) {
      case TaskType.ASYNC: {
        const detailRes = (await getTaskDetail(task?.id)) as TaskDetail<IAsyncTaskParams>;
        props.modalStore.changeCreateAsyncTaskModal(true, {
          task: detailRes,
        });
        return;
      }
      case TaskType.DATAMOCK: {
        const detailRes = (await getTaskDetail(task?.id)) as TaskDetail<IMockDataParams>;
        props.modalStore.changeDataMockerModal(true, {
          task: detailRes,
        });
        return;
      }
      case TaskType.APPLY_DATABASE_PERMISSION: {
        const detailRes = (await getTaskDetail(
          task?.id,
        )) as TaskDetail<IApplyDatabasePermissionTaskParams>;
        modalStore.changeApplyDatabasePermissionModal(true, {
          task: detailRes,
        });
        return;
      }
      case TaskType.APPLY_PROJECT_PERMISSION: {
        const detailRes = (await getTaskDetail(task?.id)) as TaskDetail<IApplyPermissionTaskParams>;
        modalStore.changeApplyPermissionModal(true, {
          task: detailRes,
        });
        return;
      }
      case TaskType.APPLY_TABLE_PERMISSION: {
        const detailRes = (await getTaskDetail(
          task?.id,
        )) as TaskDetail<IApplyTablePermissionTaskParams>;
        modalStore.changeApplyTablePermissionModal(true, {
          task: detailRes,
        });
        return;
      }
      case TaskType.MULTIPLE_ASYNC: {
        const detailRes = (await getTaskDetail(task?.id)) as TaskDetail<IMultipleAsyncTaskParams>;
        modalStore.changeMultiDatabaseChangeModal(true, {
          projectId: (task as TaskDetail<IMultipleAsyncTaskParams>)?.projectId,
          task: detailRes,
        });
        return;
      }
      case TaskType.SHADOW: {
        modalStore.changeShadowSyncVisible(true, {
          taskId: task?.id,
          databaseId: task.database?.id,
        });
        return;
      }
      case TaskType.LOGICAL_DATABASE_CHANGE: {
        modalStore.changeLogicialDatabaseModal(true, {
          taskId: task?.id,
        });
        break;
      }
      case TaskType.STRUCTURE_COMPARISON: {
        modalStore.changeStructureComparisonModal(true, {
          databaseId: task.database?.id,
          taskId: task?.id,
        });
        return;
      }
      case TaskType.EXPORT: {
        modalStore.changeExportModal(true, {
          databaseId: task.database?.id,
          taskId: task?.id,
        });
        return;
      }
      case TaskType.IMPORT: {
        modalStore.changeImportModal(true, {
          databaseId: task.database?.id,
          taskId: task?.id,
        });
        return;
      }
      case TaskType.EXPORT_RESULT_SET: {
        const detailRes = (await getTaskDetail(task?.id)) as TaskDetail<IResultSetExportTaskParams>;
        modalStore.changeCreateResultSetExportTaskModal(true, {
          databaseId: task.database?.id,
          taskId: task?.id,
          sql: detailRes.parameters.sql,
          task: detailRes,
        });
        return;
      }
      case TaskType.ONLINE_SCHEMA_CHANGE: {
        modalStore.changeCreateDDLAlterTaskModal(true, {
          databaseId: task.database?.id,
          taskId: task?.id,
        });
        return;
      }
      default: {
        const detailRes = await getTaskDetail(task?.id);
        const { database, executionStrategy, executionTime, parameters, description } = detailRes;

        const data = {
          taskType: type,
          parameters,
          databaseId: database?.id,
          executionStrategy,
          executionTime,
          description,
        };

        const res = await createTask(data);
        if (res) {
          message.success(
            formatMessage({
              id: 'odc.TaskManagePage.component.TaskTools.InitiatedAgain',
              defaultMessage: '再次发起成功',
            }),

            //再次发起成功
          );
        }
      }
    }
  };

  const _againTask = async () => {
    const { id } = task;

    const res = await againTask({ id: id });
    if (res) {
      message.success(
        formatMessage({
          id: 'src.component.Task.component.ActionBar.15961986',
          defaultMessage: '发起重试成功',
        }),
      );
      props?.onReloadList?.();
      props?.onReload?.();
    }
  };

  const _download = async () => {
    downloadTaskFlow(task.id);
  };

  const _downloadSQL = async () => {
    const structureComparisonData = modalStore?.structureComparisonDataMap?.get(task?.id) || null;
    if (structureComparisonData?.storageObjectId) {
      const fileUrl = await getStructureComparisonTaskFile(task?.id, [
        `${structureComparisonData?.storageObjectId}`,
      ]);
      fileUrl?.forEach((url) => {
        url && downloadFile(url);
      });
    }
  };

  const _structureComparison = async () => {
    const structureComparisonData = modalStore?.structureComparisonDataMap?.get(task?.id) || null;
    structureComparisonData &&
      modalStore?.changeCreateAsyncTaskModal(true, {
        sql: structureComparisonData?.totalChangeScript,
        databaseId: structureComparisonData?.database?.id,
        rules: null,
      });
  };

  const _openLocalFolder = async () => {
    const info = await getTaskResult(task.id);
    if (info?.exportZipFilePath) {
      ipcInvoke('showItemInFolder', info?.exportZipFilePath);
    }
  };

  const _downloadViewResult = async () => {
    downloadFile(result?.zipFileDownloadUrl);
  };

  const _viewResult = async () => {
    const resultSets = await getAsyncResultSet(task.id);
    if (resultSets) {
      /**
       * 没有成功的请求的话，这里就不去展示结果了。
       */

      const haveSuccessQuery = !!resultSets?.find(
        (result) => result.status === ISqlExecuteResultStatus.SUCCESS && result.columns?.length,
      );

      if (!haveSuccessQuery) {
        message.warning(
          formatMessage({
            id: 'src.component.Task.component.ActionBar.797981FE',
            defaultMessage: '无可查看的结果信息',
          }),
        );
        return;
      }
      if (isSqlworkspace) {
        await openSQLResultSetViewPage(
          task.id,
          resultSets,
          (task?.parameters as IAsyncTaskParams)?.sqlContent,
        );
        taskStore.changeTaskManageVisible(false);
        props.onDetailVisible(null, false);
      } else {
        window.open(
          location.origin +
            location.pathname +
            `#/sqlworkspace?taskId=${task.id}&resultSets=${true}&sqlContent=${JSON.stringify(
              (task?.parameters as IAsyncTaskParams)?.sqlContent,
            )}`,
        );
      }
    }
  };

  const _shareTask = async () => {
    const url =
      location.origin +
      location.pathname +
      `#/task?taskId=${task?.id}&taskType=${task?.type}&organizationId=${login.organizationId}`;
    copy(url);
    message.success(
      formatMessage({
        id: 'odc.src.component.Task.component.CommonDetailModal.Replication',
        defaultMessage: '复制成功',
      }), //'复制成功'
    );
  };

  const handleCloseRollback = async () => {
    setOpenRollback(false);
  };

  const confirmRollback = async (type: RollbackType) => {
    setOpenRollback(false);
    closeTaskDetail();
    const detailRes = await getTaskDetail(task?.id);
    props.modalStore.changeCreateAsyncTaskModal(true, {
      type,
      task: detailRes as TaskDetail<IAsyncTaskParams>,
      databaseId: task?.database?.id,
      objectId: result?.rollbackPlanResult?.resultFileDownloadUrl,
      parentFlowInstanceId: task?.id,
    });
  };

  const _openTaskDetail = async () => {
    props.onDetailVisible(task as TaskRecord<TaskRecordParameters>, true);
  };

  const eventMap: Record<TaskActionsEnum, () => void> = {
    [TaskActionsEnum.ROLLBACK]: _rollbackTask,
    [TaskActionsEnum.STOP]: _stopTask,
    [TaskActionsEnum.EXECUTE]: _executeTask,
    [TaskActionsEnum.PASS]: () => _approvalTask(true),
    [TaskActionsEnum.REJECT]: () => _approvalTask(false),

    [TaskActionsEnum.AGAIN]: _againTask,
    [TaskActionsEnum.DOWNLOAD]: _download,
    [TaskActionsEnum.DOWNLOAD_SQL]: _downloadSQL,
    [TaskActionsEnum.STRUCTURE_COMPARISON]: _structureComparison,
    [TaskActionsEnum.OPEN_LOCAL_FOLDER]: _openLocalFolder,

    [TaskActionsEnum.DOWNLOAD_VIEW_RESULT]: _downloadViewResult,
    [TaskActionsEnum.VIEW_RESULT]: _viewResult,
    [TaskActionsEnum.CLONE]: _retryTask,
    [TaskActionsEnum.VIEW]: _openTaskDetail,
    [TaskActionsEnum.SHARE]: _shareTask,
  };

  const COMMON_ACTIONS: Array<taskActionsConfig> = [
    {
      key: TaskActionsEnum.STOP,
      label: TaskActionsTextMap[TaskActionsEnum.STOP],
      action: eventMap[TaskActionsEnum.STOP],
      icon: <CloseCircleOutlined />,
      showScene: [actionShowScene.list, actionShowScene.detail],
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
      key: TaskActionsEnum.ROLLBACK,
      label: TaskActionsTextMap[TaskActionsEnum.ROLLBACK],
      action: eventMap[TaskActionsEnum.ROLLBACK],
      allowTaskType: [TaskType.ASYNC, TaskType.MULTIPLE_ASYNC],
      showScene: [actionShowScene.list, actionShowScene.detail],
      icon: <Icon component={RollbackSvg} />,
      visible: widthPermission(
        (hasPermission) => {
          return hasPermission && task?.rollbackable;
        },
        [
          IOperationTypeRole.CREATOR,
          IOperationTypeRole.PROJECT_DBA,
          IOperationTypeRole.PROJECT_OWNER,
        ],
        IRoles,
      ),
    },
    {
      key: TaskActionsEnum.EXECUTE,
      label: TaskActionsTextMap[TaskActionsEnum.EXECUTE],
      action: eventMap[TaskActionsEnum.EXECUTE],
      showScene: [actionShowScene.list, actionShowScene.detail],
      visible: widthPermission(
        (hasPermission) => {
          return hasPermission && task?.executionStrategy !== TaskExecStrategy.AUTO;
        },
        [
          IOperationTypeRole.CREATOR,
          IOperationTypeRole.PROJECT_DBA,
          IOperationTypeRole.PROJECT_OWNER,
        ],
        IRoles,
      ),
      disabledTooltip: () => {
        if (task?.executionStrategy !== TaskExecStrategy.TIMER) {
          return undefined;
        }
        const executionTime = getLocalFormatDateTime(task?.executionTime);
        return formatMessage(
          {
            id: 'odc.TaskManagePage.component.TaskTools.ScheduledExecutionTimeExecutiontime',
            defaultMessage: '定时执行时间：{executionTime}',
          },

          { executionTime },
        );
      },
    },

    {
      key: TaskActionsEnum.AGAIN,
      label: TaskActionsTextMap[TaskActionsEnum.AGAIN],
      action: eventMap[TaskActionsEnum.AGAIN],
      showScene: [actionShowScene.list, actionShowScene.detail],
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
      key: TaskActionsEnum.DOWNLOAD,
      label: TaskActionsTextMap[TaskActionsEnum.DOWNLOAD],
      action: eventMap[TaskActionsEnum.DOWNLOAD],
      showScene: [actionShowScene.list, actionShowScene.detail],
      allowTaskType: [TaskType.EXPORT, TaskType.DATAMOCK, TaskType.EXPORT_RESULT_SET],
      visible: widthPermission(
        (hasPermission) => {
          let show = hasPermission;
          if (task?.type === TaskType.EXPORT) {
            show = show && settingStore.enableDataExport && !isClient();
          }
          return show && settingStore.enableDataExport;
        },
        [
          IOperationTypeRole.CREATOR,
          IOperationTypeRole.PROJECT_DBA,
          IOperationTypeRole.PROJECT_OWNER,
        ],
        IRoles,
      ),
      disabledTooltip: () => {
        const isExpired =
          Math.abs(Date.now() - task?.completeTime) >= 14 * 24 * 60 * 60 * 1000 || false;
        return isExpired
          ? formatMessage({
              id: 'src.component.Task.component.ActionBar.F20AAC3F',
              defaultMessage: '文件下载链接已超时，请重新发起工单。',
            })
          : undefined;
      },
    },
    {
      key: TaskActionsEnum.DOWNLOAD_SQL,
      showScene: [actionShowScene.detail],
      label: TaskActionsTextMap[TaskActionsEnum.DOWNLOAD_SQL],
      action: eventMap[TaskActionsEnum.DOWNLOAD_SQL],
      allowTaskType: [TaskType.STRUCTURE_COMPARISON],
      visible: widthPermission(
        (hasPermission) => hasPermission,
        [
          IOperationTypeRole.CREATOR,
          IOperationTypeRole.PROJECT_DBA,
          IOperationTypeRole.PROJECT_OWNER,
        ],
        IRoles,
      ),
      disabledTooltip: () => {
        // 结构比对工单详情 任务未得到执行结果前禁用按钮。
        const structureComparisonData =
          modalStore?.structureComparisonDataMap?.get(task?.id) || null;
        const disable =
          (task?.type === TaskType.STRUCTURE_COMPARISON &&
            structureComparisonData &&
            !['DONE', 'FAILED'].includes(structureComparisonData?.status)) ||
          !structureComparisonData?.storageObjectId;
        return disable
          ? formatMessage({
              id: 'src.component.Task.component.ActionBar.A79907A3',
              defaultMessage: '暂不可用',
            })
          : undefined;
      },
    },
    {
      key: TaskActionsEnum.STRUCTURE_COMPARISON,
      showScene: [actionShowScene.detail],
      label: TaskActionsTextMap[TaskActionsEnum.STRUCTURE_COMPARISON],
      action: eventMap[TaskActionsEnum.STRUCTURE_COMPARISON],
      allowTaskType: [TaskType.STRUCTURE_COMPARISON],
      visible: widthPermission(
        (hasPermission) => hasPermission,
        [
          IOperationTypeRole.CREATOR,
          IOperationTypeRole.PROJECT_DBA,
          IOperationTypeRole.PROJECT_OWNER,
        ],
        IRoles,
      ),
      disabledTooltip: () => {
        // 结构比对工单详情 任务未得到执行结果前禁用按钮。
        const structureComparisonData =
          modalStore?.structureComparisonDataMap?.get(task?.id) || null;
        const disable =
          task?.type === TaskType.STRUCTURE_COMPARISON &&
          structureComparisonData &&
          !['DONE', 'FAILED'].includes(structureComparisonData?.status);
        // 结构比对结果均为一致时，无须发起数据库变更任务。
        const noAction =
          'DONE' === structureComparisonData?.status &&
          ((structureComparisonData?.overSizeLimit && structureComparisonData?.storageObjectId) ||
            (!structureComparisonData?.overSizeLimit &&
              !(structureComparisonData?.totalChangeScript?.length > 0)));
        if (noAction) {
          return formatMessage({
            id: 'src.component.Task.component.ActionBar.D98B5B62',
            defaultMessage: '结构一致，无需发起结构同步',
          });
        } else if (disable) {
          return formatMessage({
            id: 'src.component.Task.component.ActionBar.4BF7D8BF',
            defaultMessage: '暂不可用',
          });
        } else {
          return undefined;
        }
      },
    },
    {
      key: TaskActionsEnum.OPEN_LOCAL_FOLDER,
      showScene: [actionShowScene.detail],
      label: TaskActionsTextMap[TaskActionsEnum.OPEN_LOCAL_FOLDER],
      action: eventMap[TaskActionsEnum.OPEN_LOCAL_FOLDER],
      allowTaskType: [TaskType.EXPORT],
      visible: widthPermission(
        (hasPermission) => {
          return hasPermission && settingStore.enableDataExport && isClient();
        },
        [
          IOperationTypeRole.CREATOR,
          IOperationTypeRole.PROJECT_DBA,
          IOperationTypeRole.PROJECT_OWNER,
        ],
        IRoles,
      ),
    },

    {
      key: TaskActionsEnum.DOWNLOAD_VIEW_RESULT,
      showScene: [actionShowScene.detail],
      label: TaskActionsTextMap[TaskActionsEnum.DOWNLOAD_VIEW_RESULT],
      action: eventMap[TaskActionsEnum.DOWNLOAD_VIEW_RESULT],
      allowTaskType: [TaskType.ASYNC],
      visible: widthPermission(
        (hasPermission) => {
          const allowDownloadResultSets =
            settingStore.spaceConfigurations?.[
              'odc.task.databaseChange.allowDownloadResultSets'
            ] === 'true';
          return (
            hasPermission &&
            allowDownloadResultSets &&
            settingStore.enableDataExport &&
            result?.containQuery
          );
        },
        [
          IOperationTypeRole.CREATOR,
          IOperationTypeRole.PROJECT_DBA,
          IOperationTypeRole.PROJECT_OWNER,
        ],
        IRoles,
      ),
      disabledTooltip: () => {
        // 文件过期判断。
        const isExpired =
          Math.abs(Date.now() - task?.completeTime) >= 14 * 24 * 60 * 60 * 1000 || false;
        return isExpired
          ? formatMessage({
              id: 'src.component.Task.component.ActionBar.F20AAC3F',
              defaultMessage: '文件下载链接已超时，请重新发起工单。',
            })
          : undefined;
      },
    },
    {
      key: TaskActionsEnum.VIEW_RESULT,
      showScene: [actionShowScene.detail],
      label: TaskActionsTextMap[TaskActionsEnum.VIEW_RESULT],
      action: eventMap[TaskActionsEnum.VIEW_RESULT],
      allowTaskType: [TaskType.ASYNC],
      visible: widthPermission(
        (hasPermission) => {
          const allowShowResultSets =
            settingStore.spaceConfigurations?.['odc.task.databaseChange.allowShowResultSets'] ===
            'true';
          return (
            hasPermission &&
            task?.type === TaskType.ASYNC &&
            result?.containQuery &&
            allowShowResultSets
          );
        },
        [
          IOperationTypeRole.CREATOR,
          IOperationTypeRole.PROJECT_DBA,
          IOperationTypeRole.PROJECT_OWNER,
        ],
        IRoles,
      ),
    },
    {
      key: TaskActionsEnum.VIEW,
      label: TaskActionsTextMap[TaskActionsEnum.VIEW],
      action: eventMap[TaskActionsEnum.VIEW],
      icon: <BarsOutlined />,
      showScene: [actionShowScene.list],
      visible: widthPermission((hasPermission) => hasPermission, [], IRoles),
    },
    {
      key: TaskActionsEnum.CLONE,
      label: TaskActionsTextMap[TaskActionsEnum.CLONE],
      action: eventMap[TaskActionsEnum.CLONE],
      icon: <CopyOutlined />,
      showScene: [actionShowScene.list, actionShowScene.detail],
      visible: widthPermission((hasPermission) => hasPermission, [], IRoles),
    },
    {
      key: TaskActionsEnum.SHARE,
      label: TaskActionsTextMap[TaskActionsEnum.SHARE],
      showScene: [actionShowScene.list, actionShowScene.detail],
      action: eventMap[TaskActionsEnum.SHARE],
      icon: <ShareAltOutlined />,
      visible: widthPermission(
        (hasPermission) => hasPermission && !login?.isPrivateSpace(),
        [],
        IRoles,
      ),
    },
    {
      key: TaskActionsEnum.PASS,
      label: TaskActionsTextMap[TaskActionsEnum.PASS],
      action: eventMap[TaskActionsEnum.PASS],
      showScene: [actionShowScene.list, actionShowScene.detail],
      visible: widthPermission(
        (hasPermission) => {
          return hasPermission && task?.approvable && !login.isPrivateSpace();
        },
        [IOperationTypeRole.APPROVER],
        IRoles,
      ),
      disabledTooltip: () => {
        return disabledApproval
          ? formatMessage({
              id: 'odc.TaskManagePage.component.TaskTools.SetPartitionPoliciesForAll',
              defaultMessage: '请设置所有Range分区表的分区策略',
            })
          : //请设置所有Range分区表的分区策略
            null;
      },
    },
    {
      key: TaskActionsEnum.REJECT,
      label: TaskActionsTextMap[TaskActionsEnum.REJECT],
      showScene: [actionShowScene.list, actionShowScene.detail],
      action: eventMap[TaskActionsEnum.REJECT],
      visible: widthPermission(
        (hasPermission) => {
          return hasPermission && !login.isPrivateSpace();
        },
        [IOperationTypeRole.APPROVER],
        IRoles,
      ),
    },
  ];

  const actions = useMemo(() => {
    const _actions = COMMON_ACTIONS.filter((item) => {
      let show = false;
      /** 该状态是否有这个操作 */
      show = TaskStatus2Actions[task?.status]?.includes(item.key);
      if (show && item?.allowTaskType) {
        show = item?.allowTaskType.includes(task?.type) && show;
      }
      if (show && item?.visible) {
        show = item?.visible() && show;
      }
      return show;
    });
    return _actions;
  }, [task?.status, task?.approvable]);

  const menuItems: MenuProps['items'] = useMemo(() => {
    let items: MenuProps['items'] = actions
      ?.map((tool) => {
        if (!tool?.icon || !tool?.showScene.includes(actionShowScene.list)) return;
        const { key, label, icon } = tool || {};
        const disabledTooltip = tool?.disabledTooltip?.();
        const disabled = activeBtnKey === key || Boolean(disabledTooltip);
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
      items?.find((item) => item.key === TaskActionsEnum.VIEW) &&
      items?.[0]?.key !== TaskActionsEnum.VIEW
    ) {
      const viewIndex = items?.findIndex((item) => item?.key === TaskActionsEnum.VIEW);
      items?.splice(viewIndex, 0, { type: 'divider' });
    }
    return items;
  }, [actions, activeBtnKey]);

  const renderTool = (tool: taskActionsConfig) => {
    const ActionButton = isDetailModal ? Action.Button : Action.Link;
    const disabledTooltip = tool?.disabledTooltip?.();
    const disabled = activeBtnKey === tool?.key || Boolean(disabledTooltip);
    return (
      <ActionButton
        key={tool?.key}
        type={'default'}
        onClick={tool.action}
        disabled={disabled}
        tooltip={disabledTooltip}
      >
        {tool.label}
      </ActionButton>
    );
  };

  return (
    <>
      <Action.Group size={!isDetailModal ? 4 : 6}>
        {actions?.map((tool) => {
          /** 有icon代表着在列表页会放在下拉菜单里 */
          if (tool.icon && !isDetailModal) return;
          /** 屏蔽掉不展示在详情的按钮 */
          if (isDetailModal && !tool.showScene.includes(actionShowScene.detail)) return;
          if (!isDetailModal && !tool.showScene.includes(actionShowScene.list)) return;
          return renderTool(tool);
        })}
      </Action.Group>
      {!isDetailModal && !!menuItems?.length && (
        <Dropdown
          overlayClassName={styles.taskActionsDropdown}
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
      <RollBackModal open={openRollback} onOk={confirmRollback} onCancel={handleCloseRollback} />
    </>
  );
};

export default inject(
  'taskStore',
  'userStore',
  'modalStore',
  'settingStore',
)(observer(TaskActions));
