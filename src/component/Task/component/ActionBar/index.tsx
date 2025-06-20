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

import {
  againTask,
  createTask,
  downloadTaskFlow,
  executeTask,
  getStructureComparisonTaskFile,
  getTaskResult,
  stopTask,
  stopDataArchiveSubTask,
  getDataArchiveSubTask,
  getTaskDetail,
} from '@/common/network/task';
import Action from '@/component/Action';
import { TaskTypeMap } from '@/component/Task/component/TaskTable/const';
import type {
  IApplyPermissionTaskParams,
  ICycleSubTaskRecord,
  ICycleTaskRecord,
  ILogicalDatabaseAsyncTaskParams,
} from '@/d.ts';
import {
  IApplyDatabasePermissionTaskParams,
  IApplyTablePermissionTaskParams,
  IAsyncTaskParams,
  IMockDataParams,
  IMultipleAsyncTaskParams,
  ITaskResult,
  RollbackType,
  SubTaskStatus,
  TaskDetail,
  TaskExecStrategy,
  TaskOperationType,
  TaskRecord,
  TaskRecordParameters,
  TaskStatus,
  TaskType,
  IResultSetExportTaskParams,
} from '@/d.ts';
import type { UserStore } from '@/store/login';
import type { ModalStore } from '@/store/modal';
import type { SettingStore } from '@/store/setting';
import type { TaskStore } from '@/store/task';
import ipcInvoke from '@/util/client/service';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { downloadFile, getLocalFormatDateTime, uniqueTools } from '@/util/utils';
import { message, Modal, Popconfirm, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useMemo, useState } from 'react';
import { isCycleTask, isLogicalDbChangeTask } from '@/component/Task/helper';
import RollBackModal from '../RollbackModal';
import { ProjectRole } from '@/d.ts/project';
import { useRequest } from 'ahooks';
import { taskSuccessHintInfo } from '@/constant';
import { actionInfo, actions, JOB_SCHEDULE_TASKS, SCHEDULE_TASKS } from './helper';
import { IAddOperationsParams } from './type';
interface IProps {
  userStore?: UserStore;
  taskStore?: TaskStore;
  settingStore?: SettingStore;
  modalStore?: ModalStore;
  isDetailModal?: boolean;
  task: Partial<TaskRecord<TaskRecordParameters> | TaskDetail<TaskRecordParameters>>;
  disabledSubmit?: boolean;
  result?: ITaskResult;
  onReloadList?: () => void;
  onReload?: () => void;
  onApprovalVisible?: (status: boolean, visible: boolean) => void;
  onDetailVisible: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
  onClose?: () => void;
  delTaskList?: number[];
  setDelTaskList?: React.Dispatch<React.SetStateAction<number[]>>;
}

const ActionBar: React.FC<IProps> = inject(
  'taskStore',
  'userStore',
  'settingStore',
  'modalStore',
)(
  observer((props) => {
    const {
      modalStore,
      userStore: { user },
      settingStore,
      isDetailModal,
      task,
      disabledSubmit = false,
      result,
      delTaskList = [],
      setDelTaskList,
    } = props;
    /** 是否创建者 */
    const isOwner = user?.id === task?.creator?.id;
    /** 可审批者 */
    const isApprover = task?.approvable;
    /** 当前用户在当前项目中的角色 */
    const { currentUserResourceRoles = [] } = task?.project || {};
    const [activeBtnKey, setActiveBtnKey] = useState(null);
    const [openRollback, setOpenRollback] = useState(false);
    const [taskList, setTaskList] = useState<ICycleSubTaskRecord[]>([]);

    const disabledApproval =
      task?.status === TaskStatus.WAIT_FOR_CONFIRM && !isDetailModal ? true : disabledSubmit;

    useEffect(() => {
      if (task?.id && isLogicalDbChangeTask(task?.type) && isDetailModal) {
        loadtaskList();
      }
      return cancel();
    }, [task?.id]);

    const getScheduleTask = async () => {
      const taskList = await getDataArchiveSubTask(task?.id);
      setTaskList(taskList?.contents);
      return taskList?.contents;
    };

    const { run: loadtaskList, cancel } = useRequest(getScheduleTask, {
      pollingInterval: 3000,
      manual: true,
      onSuccess: (data) => {
        if (
          [SubTaskStatus.CANCELED, SubTaskStatus.DONE, SubTaskStatus.FAILED]?.includes(
            data?.[0]?.status as any,
          )
        ) {
          cancel();
        }
      },
    });

    const _openTaskDetail = async () => {
      props.onDetailVisible(task as TaskRecord<TaskRecordParameters>, true);
    };

    const closeTaskDetail = async () => {
      props.onDetailVisible(null, false);
    };

    const resetActiveBtnKey = () => {
      setActiveBtnKey(null);
    };

    const _stopTask = async () => {
      setActiveBtnKey('stop');
      const res = await stopTask(task.id);
      if (res) {
        message.success(taskSuccessHintInfo.terminate);

        props?.onReloadList?.();
        props?.onReload?.();
      }
    };

    const _executeTask = async () => {
      setActiveBtnKey('execute');
      const res = await executeTask(task.id);
      if (res) {
        message.success(taskSuccessHintInfo.start);
        closeTaskDetail();
        props?.onReloadList?.();
      }
    };

    const _deleteTask = async () => {
      const { id } = task;
      const res = await createTask({
        taskType: TaskType.ALTER_SCHEDULE,
        parameters: {
          taskId: id,
          operationType: 'DELETE',
        },
      });
      if (res) {
        setDelTaskList?.([...delTaskList, id]);
        message.success(taskSuccessHintInfo.delete);
        props?.onReloadList?.();
      }
    };

    const download = async () => {
      downloadTaskFlow(task.id);
    };

    const downloadViewResult = async () => {
      downloadFile(result?.zipFileDownloadUrl);
    };

    const handleCopy = () => {};

    const confirmRollback = async (type: RollbackType) => {
      closeTaskDetail();
      actions[TaskType.ASYNC]({
        type,
        task: task as TaskDetail<IAsyncTaskParams>,
        databaseId: task?.database?.id,
        objectId: result?.rollbackPlanResult?.resultFileDownloadUrl,
        parentFlowInstanceId: task?.id,
      });
    };

    useEffect(() => {
      if (activeBtnKey) {
        resetActiveBtnKey();
      }
    }, [task?.status]);

    const _rollbackTask = async () => {
      setOpenRollback(true);
    };

    const handleCloseRollback = async () => {
      setOpenRollback(false);
    };

    const _approvalTask = async (status: boolean) => {
      props.onApprovalVisible(status, true);
    };

    const _retryTask = async () => {
      const { type } = task;

      switch (type) {
        case TaskType.ASYNC:
        case TaskType.DATAMOCK: {
          const detailRes = (await getTaskDetail(task?.id)) as TaskDetail<IAsyncTaskParams>;
          actions[type]({ task: detailRes });
          return;
        }
        case TaskType.APPLY_DATABASE_PERMISSION: {
          actions[type]({
            task: task as TaskDetail<IApplyDatabasePermissionTaskParams>,
          });
          return;
        }
        case TaskType.APPLY_PROJECT_PERMISSION: {
          modalStore.changeApplyPermissionModal(true, {
            task: task as TaskDetail<IApplyPermissionTaskParams>,
          });
          return;
        }
        case TaskType.APPLY_TABLE_PERMISSION: {
          actions[type]({
            task: task as TaskDetail<IApplyTablePermissionTaskParams>,
          });
          return;
        }
        case TaskType.MULTIPLE_ASYNC: {
          actions[type]({
            projectId: (task as TaskDetail<IMultipleAsyncTaskParams>)?.parameters?.projectId,
            task: task as TaskDetail<IMultipleAsyncTaskParams>,
          });
          return;
        }
        case TaskType.SHADOW:
        case TaskType.STRUCTURE_COMPARISON:
        case TaskType.EXPORT:
        case TaskType.IMPORT:
        case TaskType.ONLINE_SCHEMA_CHANGE:
        case TaskType.PARTITION_PLAN: {
          actions[type]({
            databaseId: task.database?.id,
            taskId: task?.id,
          });
          return;
        }
        case TaskType.EXPORT_RESULT_SET: {
          const detailRes = (await getTaskDetail(
            task?.id,
          )) as TaskDetail<IResultSetExportTaskParams>;
          actions[type]({
            databaseId: task.database?.id,
            taskId: task?.id,
            sql: detailRes.parameters.sql,
            task: detailRes,
          });
          return;
        }
        default: {
          const { database, executionStrategy, executionTime, parameters, description } = task;

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
            message.success(taskSuccessHintInfo.retry); //再次发起成功
          }
        }
      }
    };

    const _againTask = async () => {
      const { id } = task;

      const res = await againTask({ id: id });
      if (res) {
        message.success(taskSuccessHintInfo.again);
        props?.onReloadList?.();
        props?.onReload?.();
      }
    };

    const _editCycleTask = async () => {
      props?.onClose?.();
      const actionType = JOB_SCHEDULE_TASKS.includes(task?.type) ? task?.type : TaskType.SQL_PLAN;
      actions?.[actionType]?.({
        id: task?.id,
        type: JOB_SCHEDULE_TASKS.includes(task?.type) ? ('EDIT' as 'EDIT') : undefined,
      });
    };

    const _retryCycleTask = async () => {
      props?.onClose?.();
      switch (task?.type) {
        case TaskType.DATA_ARCHIVE:
        case TaskType.DATA_DELETE: {
          actions?.[task?.type]?.({
            id: task?.id,
            type: 'RETRY',
          });
          break;
        }
        case TaskType.LOGICAL_DATABASE_CHANGE: {
          actions?.[task?.type]?.({
            task: task,
          });
          break;
        }
        case TaskType.SQL_PLAN: {
          actions?.[task?.type]?.({
            databaseId: task.database?.id,
            taskId: task?.id,
          });
          return;
        }
      }
    };

    const _stopScheduleTask = async () => {
      await stopDataArchiveSubTask(task?.id, taskList?.[0]?.id);
      await getScheduleTask();
      props?.onReload?.();
    };

    const _alterScheduleTask = async ({ databaseId, operationType }) => {
      await createTask({
        databaseId,
        taskType: TaskType.ALTER_SCHEDULE,
        parameters: {
          taskId: task.id,
          operationType,
        },
      });
      props?.onReload?.();
    };

    const handleTaskOperation = async ({
      operationType,
      callback,
    }: {
      operationType: TaskOperationType;
      callback?: () => void;
    }) => {
      let databaseId;
      if (task?.database) {
        databaseId = task?.database?.id;
      } else {
        databaseId = (task as ICycleTaskRecord<ILogicalDatabaseAsyncTaskParams>)?.jobParameters
          ?.databaseId;
      }
      const taskTypeName = TaskTypeMap[task?.type];
      const config = {
        [TaskOperationType.RESUME]: {
          title: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTools.AreYouSureYouWant.2',
            defaultMessage: '是否确认启用此 SQL 计划？',
          }),
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
                {
                  formatMessage({
                    id: 'odc.TaskManagePage.component.TaskTools.TheTaskNeedsToBe.1',
                    defaultMessage: '任务需要重新审批，审批通过后此任务将启用',
                  }) /*任务需要重新审批，审批通过后此任务将启用*/
                }
              </div>
            </>
          ),
        },
        [TaskOperationType.TERMINATE]: {
          title: formatMessage(
            {
              id: 'src.component.Task.component.ActionBar.718054C5',
              defaultMessage: '确认要终止此{taskTypeName}?',
            },
            { taskTypeName },
          ),
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
          [TaskOperationType.PAUSE]: {
            title: formatMessage(
              {
                id: 'src.component.Task.component.ActionBar.5495D4C7',
                defaultMessage: '确认要禁用此{TaskTypeMapTaskType}?',
              },
              { TaskTypeMapTaskType: taskTypeName },
            ),
            content: (
              <>
                <div>
                  {formatMessage(
                    {
                      id: 'src.component.Task.component.ActionBar.EC0C09D6',
                      defaultMessage: '禁用{TaskTypeMapTaskType}',
                    },
                    { TaskTypeMapTaskType: taskTypeName },
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
          },
        },
      };
      const { title, content } = config[operationType] || {};

      Modal.confirm({
        title,
        content,
        cancelText: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Cancel',
          defaultMessage: '取消',
        }), //取消
        okText: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Ok.2',
          defaultMessage: '确定',
        }), //确定
        centered: true,
        onOk: async () => {
          callback?.();
          await _alterScheduleTask({ databaseId, operationType });
        },
      });
    };

    /**
     * 判断是否是创建人、项目DBA、项目owner，以操作工单
     */
    const haveOperationPermission = useMemo(() => {
      return (
        currentUserResourceRoles?.some((item) =>
          [ProjectRole.DBA, ProjectRole.OWNER].includes(item),
        ) || isOwner
      );
    }, [currentUserResourceRoles, isOwner]);

    /** 添加再次发起，只有创建人才可以 */
    const setBtnByCreater = (tools, reTryBtn) => {
      if (isOwner) {
        tools.push(reTryBtn);
      }
    };
    const commonButtonConfig = {
      viewBtn: {
        key: 'view',
        text: formatMessage({ id: 'odc.TaskManagePage.AsyncTask.See', defaultMessage: '查看' }), // 查看
        action: _openTaskDetail,
        type: 'button',
        isOpenBtn: true,
      },
      rejectBtn: {
        key: 'reject',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Reject',
          defaultMessage: '拒绝',
        }),

        //拒绝
        type: 'button',
        action: async () => {
          _approvalTask(false);
        },
      },
    };

    const getTaskTools = (_task) => {
      let tools = [];
      const addOperations = ({ auth, taskTypeLimit, operations }: IAddOperationsParams) => {
        const hasOperaitons = Boolean(operations?.length);
        const useableTaskType =
          (taskTypeLimit && taskTypeLimit.includes(task?.type)) || Boolean(taskTypeLimit?.length);
        if (auth && useableTaskType && hasOperaitons) {
          tools.push(...operations);
          return true;
        }
        return false;
      };

      if (!_task) {
        return [];
      }
      const { status, completeTime = 0 } = _task;
      const structureComparisonData =
        modalStore?.structureComparisonDataMap?.get(_task?.id) || null;
      // 文件过期判断。
      const isExpired = Math.abs(Date.now() - completeTime) >= 14 * 24 * 60 * 60 * 1000 || false;
      // 结构比对工单详情 任务未得到执行结果前禁用按钮。
      const disableBtn =
        task?.type === TaskType.STRUCTURE_COMPARISON &&
        structureComparisonData &&
        ![SubTaskStatus.DONE, SubTaskStatus.FAILED].includes(structureComparisonData?.status);
      // 结构比对结果均为一致时，无须发起数据库变更任务。
      const noAction =
        SubTaskStatus.DONE === structureComparisonData?.status &&
        ((structureComparisonData?.overSizeLimit && structureComparisonData?.storageObjectId) ||
          (!structureComparisonData?.overSizeLimit &&
            !Boolean(structureComparisonData?.totalChangeScript?.length)));
      const buttonConfig = {
        ...commonButtonConfig,
        closeBtn: {
          ...actionInfo.closeBtn,
          //关闭
          action: closeTaskDetail,
        },
        copyBtn: {
          ...actionInfo.copyBtn,
          //复制
          action: handleCopy,

          isOpenBtn: true,
        },
        rollbackBtn: {
          ...actionInfo.rollbackBtn,
          //回滚
          action: _rollbackTask,
        },
        stopBtn: {
          ...actionInfo.stopBtn,
          //终止
          action: _stopTask,
        },
        executeBtn: {
          ...actionInfo.executeBtn,
          //执行
          action: _executeTask,
          isOpenBtn: true,
          isPrimary: isDetailModal,
          disabled: false,
          tooltip: '',
        },
        approvalBtn: {
          ...actionInfo.approvalBtn,
          //通过
          isPrimary: isDetailModal,
          disabled: disabledApproval,
          tooltip: disabledApproval
            ? formatMessage({
                id: 'odc.TaskManagePage.component.TaskTools.SetPartitionPoliciesForAll',
                defaultMessage: '请设置所有Range分区表的分区策略',
              })
            : //请设置所有Range分区表的分区策略
              null,
          action: async () => {
            _approvalTask(true);
          },
        },
        reTryBtn: {
          ...actionInfo.reTryBtn,
          //再次发起
          action: _retryTask,
        },
        againBtn: {
          ...actionInfo.againBtn,
          // 重试
          action: _againTask,
        },
        downloadBtn: {
          ...actionInfo.downloadBtn,
          disabled: isExpired,
          isExpired,
          tip: formatMessage({
            id: 'src.component.Task.component.ActionBar.F20AAC3F',
            defaultMessage: '文件下载链接已超时，请重新发起工单。',
          }), //'文件下载链接已超时，请重新发起工单。'

          action: download,
        },
        downloadSQLBtn: {
          ...actionInfo.downloadSQLBtn,
          disabled: disableBtn || !structureComparisonData?.storageObjectId,
          isExpired: disableBtn || !structureComparisonData?.storageObjectId,
          tip: formatMessage({
            id: 'src.component.Task.component.ActionBar.A79907A3',
            defaultMessage: '暂不可用',
          }), //'暂不可用'
          action: async () => {
            if (structureComparisonData?.storageObjectId) {
              const fileUrl = await getStructureComparisonTaskFile(_task?.id, [
                `${structureComparisonData?.storageObjectId}`,
              ]);
              fileUrl?.forEach((url) => {
                url && downloadFile(url);
              });
            }
          },
        },
        structrueComparisonBySQL: {
          ...actionInfo.structrueComparisonBySQL,
          isExpired: disableBtn || noAction,
          disabled: disableBtn || noAction,
          tip: noAction
            ? formatMessage({
                id: 'src.component.Task.component.ActionBar.D98B5B62',
                defaultMessage: '结构一致，无需发起结构同步',
              })
            : formatMessage({
                id: 'src.component.Task.component.ActionBar.4BF7D8BF',
                defaultMessage: '暂不可用',
              }),
          isPrimary: true,
          action: async () => {
            structureComparisonData &&
              actions[TaskType.ASYNC]({
                sql: structureComparisonData?.totalChangeScript,
                databaseId: structureComparisonData?.database?.id,
                rules: null,
              });
          },
        },
        openLocalFolder: {
          ...actionInfo.openLocalFolder,
          //打开文件夹
          action: async () => {
            const info = await getTaskResult(task.id);
            if (info?.exportZipFilePath) {
              ipcInvoke('showItemInFolder', info?.exportZipFilePath);
            }
          },
        },
        downloadViewResultBtn: {
          ...actionInfo.downloadViewResultBtn,
          disabled: isExpired,
          isExpired,
          tip: formatMessage({
            id: 'src.component.Task.component.ActionBar.E9211B1A',
            defaultMessage: '文件下载链接已超时，请重新发起工单。',
          }), //'文件下载链接已超时，请重新发起工单。'

          action: downloadViewResult,
        },
      };

      const addRetryButton = () => {
        setBtnByCreater(tools, buttonConfig.reTryBtn);
      };

      const resetToolsForApprover = (
        target?: Array<{
          key: string;
          text: any;
          type: string;
          action: () => Promise<void>;
        }>,
      ) => {
        if (isApprover) {
          tools = target || [];
        }
      };

      const operationNeedPermission = {
        [TaskStatus.EXECUTION_ABNORMAL]: {
          operations: [buttonConfig.stopBtn, buttonConfig.againBtn],
        },
        [TaskStatus.EXECUTING]: {
          operations: [buttonConfig.stopBtn],
          taskRules: [
            {
              auth: true,
              taskTypeLimit: [TaskType.STRUCTURE_COMPARISON],
              operations: [buttonConfig.downloadSQLBtn, buttonConfig.structrueComparisonBySQL],
            },
          ],
        },
        [TaskStatus.APPROVING]: {
          operations: [buttonConfig.stopBtn],
        },
        [TaskStatus.EXECUTION_SUCCEEDED]: {
          operations: [],
          // taskRules 中的规则按顺序匹配，匹配上一个之后则应用该规则，不再继续匹配
          taskRules: [
            {
              taskTypeLimit: [TaskType.EXPORT],
              auth: settingStore.enableDataExport && isClient(),
              operations: [buttonConfig.openLocalFolder],
            },
            {
              taskTypeLimit: [TaskType.EXPORT, TaskType.DATAMOCK, TaskType.EXPORT_RESULT_SET],
              auth: settingStore.enableDataExport,
              operations: [buttonConfig.downloadBtn],
            },
            {
              taskTypeLimit: [TaskType.ASYNC, TaskType.MULTIPLE_ASYNC],
              auth: task?.rollbackable,
              operations: [buttonConfig.rollbackBtn],
            },
            {
              taskTypeLimit: [TaskType.STRUCTURE_COMPARISON],
              auth: true,
              operations: [buttonConfig.downloadSQLBtn, buttonConfig.structrueComparisonBySQL],
            },
          ],
        },
      };
      const getSpecialExecuteBtn = () => {
        const _executeBtn = { ...buttonConfig.executeBtn };
        if (task?.executionStrategy === TaskExecStrategy.TIMER) {
          _executeBtn.disabled = true;
          const executionTime = getLocalFormatDateTime(task?.executionTime);

          _executeBtn.tooltip = formatMessage(
            {
              id: 'odc.TaskManagePage.component.TaskTools.ScheduledExecutionTimeExecutiontime',
              defaultMessage: '定时执行时间：{executionTime}',
            },

            { executionTime },
          );

          //`定时执行时间：${executionTime}`
        }
        return _executeBtn;
      };

      if (isDetailModal) {
        switch (status) {
          case TaskStatus.REJECTED:
          case TaskStatus.APPROVAL_EXPIRED:
          case TaskStatus.WAIT_FOR_EXECUTION_EXPIRED:
          case TaskStatus.EXECUTION_EXPIRED:
          case TaskStatus.CREATED:
          case TaskStatus.EXECUTION_FAILED:
          case TaskStatus.ROLLBACK_FAILED:
          case TaskStatus.ROLLBACK_SUCCEEDED:
          case TaskStatus.CANCELLED:
          case TaskStatus.PRE_CHECK_FAILED:
          case TaskStatus.COMPLETED: {
            addRetryButton();
            resetToolsForApprover();
            break;
          }
          case TaskStatus.EXECUTING:
          case TaskStatus.EXECUTION_ABNORMAL:
          case TaskStatus.EXECUTION_SUCCEEDED: {
            addRetryButton();

            if (haveOperationPermission) {
              const taskRules = operationNeedPermission?.[status]?.taskRules;
              taskRules?.some((rule) => {
                return addOperations(rule);
              });
              tools.push(...operationNeedPermission[status].operations);
            }
            resetToolsForApprover();
            break;
          }
          case TaskStatus.WAIT_FOR_CONFIRM:
          case TaskStatus.APPROVING: {
            resetToolsForApprover([buttonConfig.rejectBtn, buttonConfig.approvalBtn]);
            addRetryButton();
            if (haveOperationPermission) {
              tools.push(...operationNeedPermission[status].operations);
            }
            break;
          }
          case TaskStatus.WAIT_FOR_EXECUTION: {
            addRetryButton();

            if (haveOperationPermission) {
              const _executeBtn = getSpecialExecuteBtn();
              const tempTools =
                task?.executionStrategy === TaskExecStrategy.AUTO
                  ? [buttonConfig.stopBtn]
                  : [buttonConfig.stopBtn, _executeBtn];
              tools.push(...tempTools);
            }
            resetToolsForApprover();
            break;
          }
          default:
        }

        if (task?.type === TaskType.ASYNC && result?.containQuery) {
          if (settingStore.enableDataExport) {
            tools.unshift(buttonConfig.downloadViewResultBtn);
          }
        }
      } else {
        tools = [buttonConfig.viewBtn];
        if (status === TaskStatus.WAIT_FOR_EXECUTION) {
          if (haveOperationPermission) {
            const _executeBtn = getSpecialExecuteBtn();
            task?.executionStrategy === TaskExecStrategy.AUTO
              ? tools.push(buttonConfig.stopBtn)
              : tools.push(_executeBtn, buttonConfig.stopBtn);
          }
          addRetryButton();
        }
      }
      tools = uniqueTools(tools);
      return tools;
    };

    const getCycleTaskTools = (_task) => {
      let tools = [];
      if (!_task) {
        return [];
      }
      const { status } = _task;
      const buttongConfig = {
        ...commonButtonConfig,
        stopBtn: {
          ...actionInfo.stopBtn,
          action: async () => {
            await handleTaskOperation({
              operationType: TaskOperationType.TERMINATE,
              callback: () => {
                setActiveBtnKey('stop');
              },
            });
          },
        },
        editBtn: {
          ...actionInfo.editBtn,
          action: _editCycleTask,
        },
        reTryBtn: {
          ...actionInfo.reTryBtn,
          action: _retryCycleTask,
        },
        disableBtn: {
          ...actionInfo.disableBtn,
          action: async () => {
            await handleTaskOperation({ operationType: TaskOperationType.PAUSE });
          },
        },

        /* 禁用Schedule下的Task for logical database change task */
        /* 很脏的逻辑, ued少一层导致的 */
        stopScheduleTaskBtn: {
          ...actionInfo.stopScheduleTaskBtn,
          action: _stopScheduleTask,
        },
        enableBtn: {
          ...actionInfo.enableBtn,
          action: async () => {
            await handleTaskOperation({ operationType: TaskOperationType.RESUME });
          },
        },
        approvalBtn: {
          ...actionInfo.approvalBtn,
          isPrimary: isDetailModal,
          action: async () => {
            _approvalTask(true);
          },
        },
        deleteBtn: {
          ...actionInfo.deleteBtn,
          confirmText: formatMessage({
            id: 'src.component.Task.component.ActionBar.72AF1732',
            defaultMessage: '你确定要删除这个任务吗？',
          }),
          action: _deleteTask,
        },
      };
      const initTools = ({ view, retry }: { view?: boolean; retry?: boolean }) => {
        if (view) {
          tools = [buttongConfig.viewBtn];
        }
        if (retry) {
          setBtnByCreater(tools, buttongConfig.reTryBtn);
        }
      };

      const operationNeedPermission = {
        [TaskStatus.APPROVING]: {
          auth: haveOperationPermission,
          operations: [buttongConfig.stopBtn],
        },
        [TaskStatus.PAUSE]: {
          auth: haveOperationPermission,
          operations: [buttongConfig.editBtn, buttongConfig.enableBtn, buttongConfig.stopBtn],
        },
        [TaskStatus.CANCELLED]: {
          auth: haveOperationPermission,
          operations: [buttongConfig.stopBtn],
        },
        [TaskStatus.REJECTED]: { auth: haveOperationPermission, operations: [] },
        [TaskStatus.APPROVAL_EXPIRED]: {
          taskTypeLimit: SCHEDULE_TASKS,
          auth: haveOperationPermission,
          operations: [buttongConfig.deleteBtn],
        },
        [TaskStatus.TERMINATED]: {
          taskTypeLimit: SCHEDULE_TASKS,
          auth: haveOperationPermission,
          operations: [buttongConfig.deleteBtn],
        },
        [TaskStatus.COMPLETED]: {
          taskTypeLimit: SCHEDULE_TASKS,
          auth: haveOperationPermission,
          operations: [buttongConfig.deleteBtn],
        },
        [TaskStatus.ENABLED]: {
          auth:
            haveOperationPermission &&
            !(
              JOB_SCHEDULE_TASKS.includes(task?.type) &&
              (task as ICycleTaskRecord<TaskRecordParameters>)?.triggerConfig?.triggerStrategy ===
                TaskExecStrategy.START_NOW
            ),
          operations: [buttongConfig.disableBtn, buttongConfig.stopBtn, buttongConfig.editBtn],
        },
      };

      const operationNeedApprover = {
        [TaskStatus.APPROVING]: [buttongConfig.approvalBtn, buttongConfig.rejectBtn],
      };

      const addOperations = ({ taskTypeLimit, auth, operations }: IAddOperationsParams) => {
        const hasOperations = Boolean(operations?.length);
        const useableTaskType =
          (taskTypeLimit && taskTypeLimit.includes(task?.type)) || Boolean(taskTypeLimit?.length);
        if (auth && hasOperations && useableTaskType) {
          tools.push(...operations);
        }
      };
      const enableRetry = isOwner;
      initTools({ view: true, retry: enableRetry });
      addOperations(operationNeedPermission?.[status]);

      switch (status) {
        case TaskStatus.APPROVING:
          addOperations({ auth: isApprover, operations: operationNeedApprover[status] });
          break;
        case TaskStatus.ENABLED: {
          if (haveOperationPermission && isLogicalDbChangeTask(task?.type)) {
            tools = [buttongConfig.viewBtn, buttongConfig.editBtn, buttongConfig.reTryBtn];
          }
          break;
        }
        default:
          break;
      }

      if (isDetailModal) {
        tools = tools.filter((item) => !['view', 'delete'].includes(item.key));
      } else {
        tools = tools.filter((item) => ['view', 'delete'].includes(item.key));
      }

      // sql 计划 & 数据归档 & 数据清理 支持编辑
      if (!SCHEDULE_TASKS.includes(task?.type)) {
        tools = tools.filter((item) => item.key !== 'edit');
      }
      if ((taskList?.[0]?.status as any) === SubTaskStatus.RUNNING) {
        tools = [...tools, buttongConfig.stopScheduleTaskBtn];
      }
      tools = uniqueTools(tools);
      return tools;
    };

    const getTools = (task) => {
      return isCycleTask(task?.type) ? getCycleTaskTools(task) : getTaskTools(task);
    };

    const btnTools = !isDetailModal
      ? getTools(task).filter((item) => item?.type === 'button')
      : getTools(task);

    const renderTool = (tool, index) => {
      const ActionButton = isDetailModal ? Action.Button : Action.Link;
      const disabled =
        activeBtnKey === tool?.key || tool?.disabled || delTaskList?.includes(task.id);
      if (tool.confirmText) {
        return (
          <Popconfirm key={tool?.key || index} title={tool.confirmText} onConfirm={tool.action}>
            <ActionButton key={tool?.key || index} disabled={disabled}>
              {tool.text}
            </ActionButton>
          </Popconfirm>
        );
      }

      if (tool.download) {
        return (
          <ActionButton key={tool?.key || index} disabled={disabled} onClick={tool.download}>
            {tool.text}
          </ActionButton>
        );
      }

      return (
        <ActionButton
          key={tool?.key || index}
          type={tool.isPrimary ? 'primary' : 'default'}
          disabled={disabled || tool?.isExpired}
          onClick={tool.action}
          placement={tool?.isExpired ? 'topRight' : null}
          tooltip={isDetailModal ? (tool?.isExpired && tool?.tip) || tool?.tooltip : null}
        >
          <Tooltip placement="topRight" title={tool?.isExpired ? tool?.tip : tool?.tooltip}>
            {tool.text}
          </Tooltip>
        </ActionButton>
      );
    };

    return (
      <>
        <Action.Group size={!isDetailModal ? 4 : 6}>
          {btnTools?.map((tool, index) => {
            return renderTool(tool, index);
          })}
        </Action.Group>
        {isDetailModal && (
          <RollBackModal
            open={openRollback}
            generateRollbackPlan={
              (task as TaskDetail<IAsyncTaskParams>)?.parameters?.generateRollbackPlan &&
              !!result?.rollbackPlanResult?.resultFileDownloadUrl
            }
            onOk={confirmRollback}
            onCancel={handleCloseRollback}
          />
        )}
      </>
    );
  }),
);

export default ActionBar;
