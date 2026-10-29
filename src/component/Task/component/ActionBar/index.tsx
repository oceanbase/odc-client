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
import { TaskTypeMap } from '@/component/Task/component/TaskTable';
import type {
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
import { downloadFile, getLocalFormatDateTime } from '@/util/utils';
import { message, Modal, Popconfirm, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useMemo, useState } from 'react';
import { isCycleTask, isLogicalDbChangeTask } from '../../helper';
import RollBackModal from '../RollbackModal';
import { ProjectRole } from '@/d.ts/project';
import { useRequest } from 'ahooks';
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
      taskStore,
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

    const openTaskDetail = async () => {
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
        message.success(
          formatMessage({
            id: 'odc.components.TaskManagePage.TerminatedSuccessfully',
            defaultMessage: '终止成功',
          }),
        );

        props?.onReloadList?.();
        props?.onReload?.();
      }
    };

    const deleteTask = async () => {
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
        message.success(
          formatMessage({
            id: 'src.component.Task.component.ActionBar.9EDD0936',
            defaultMessage: '删除成功',
          }),
        );
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
      props.modalStore.changeCreateAsyncTaskModal(true, {
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

    const handleRollback = async () => {
      setOpenRollback(true);
    };

    const handleCloseRollback = async () => {
      setOpenRollback(false);
    };

    const handleExecute = async () => {
      setActiveBtnKey('execute');
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
      }
    };

    const handleApproval = async (status: boolean) => {
      props.onApprovalVisible(status, true);
    };

    const handleReTry = async () => {
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
          modalStore.changeApplyDatabasePermissionModal(true, {
            task: task as TaskDetail<IApplyDatabasePermissionTaskParams>,
          });
          return;
        }
        case TaskType.APPLY_TABLE_PERMISSION: {
          modalStore.changeApplyTablePermissionModal(true, {
            task: task as TaskDetail<IApplyTablePermissionTaskParams>,
          });
          return;
        }
        case TaskType.MULTIPLE_ASYNC: {
          modalStore.changeMultiDatabaseChangeModal(true, {
            projectId: (task as TaskDetail<IMultipleAsyncTaskParams>)?.parameters?.projectId,
            task: task as TaskDetail<IMultipleAsyncTaskParams>,
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
          const detailRes = (await getTaskDetail(
            task?.id,
          )) as TaskDetail<IResultSetExportTaskParams>;
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

    const handleAgain = async () => {
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

    const editCycleTask = async () => {
      props?.onClose?.();
      switch (task?.type) {
        case TaskType.DATA_ARCHIVE: {
          props.modalStore.changeDataArchiveModal(true, {
            id: task?.id,
            type: 'EDIT',
          });
          break;
        }
        case TaskType.DATA_DELETE: {
          props.modalStore.changeDataClearModal(true, {
            id: task?.id,
            type: 'EDIT',
          });
          break;
        }
        default: {
          props.modalStore.changeCreateSQLPlanTaskModal(true, {
            id: task?.id,
          });
        }
      }
    };

    const handleReTryCycleTask = async () => {
      props?.onClose?.();
      switch (task?.type) {
        case TaskType.DATA_ARCHIVE: {
          props.modalStore.changeDataArchiveModal(true, {
            id: task?.id,
            type: 'RETRY',
          });
          break;
        }
        case TaskType.LOGICAL_DATABASE_CHANGE: {
          modalStore.changeLogicialDatabaseModal(true, {
            task: task,
          });
          break;
        }
        case TaskType.DATA_DELETE: {
          props.modalStore.changeDataClearModal(true, {
            id: task?.id,
            type: 'RETRY',
          });
          break;
        }
        case TaskType.SQL_PLAN: {
          modalStore.changeCreateSQLPlanTaskModal(true, {
            databaseId: task.database?.id,
            taskId: task?.id,
          });
          return;
        }
      }
    };

    const stopScheduleTask = async () => {
      await stopDataArchiveSubTask(task?.id, taskList?.[0]?.id);
      await getScheduleTask();
      props?.onReload?.();
    };

    const disableCycleTask = async () => {
      let databaseId;
      if (task.database) {
        databaseId = task.database?.id;
      } else {
        databaseId = (task as ICycleTaskRecord<ILogicalDatabaseAsyncTaskParams>).jobParameters
          ?.databaseId;
      }
      Modal.confirm({
        title: formatMessage(
          {
            id: 'src.component.Task.component.ActionBar.5495D4C7',
            defaultMessage: '确认要禁用此{TaskTypeMapTaskType}?',
          },
          { TaskTypeMapTaskType: TaskTypeMap[task.type] },
        ),
        content: (
          <>
            <div>
              {formatMessage(
                {
                  id: 'src.component.Task.component.ActionBar.EC0C09D6',
                  defaultMessage: '禁用{TaskTypeMapTaskType}',
                },
                { TaskTypeMapTaskType: TaskTypeMap[task.type] },
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
        }), //取消
        okText: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Ok.2',
          defaultMessage: '确定',
        }), //确定
        centered: true,
        onOk: async () => {
          await createTask({
            databaseId,
            taskType: TaskType.ALTER_SCHEDULE,
            parameters: {
              taskId: task.id,
              operationType: 'PAUSE',
            },
          });
          props?.onReload?.();
        },
      });
    };

    const enableCycleTask = async () => {
      let databaseId;
      if (task.database) {
        databaseId = task.database?.id;
      } else {
        databaseId = (task as ICycleTaskRecord<ILogicalDatabaseAsyncTaskParams>).jobParameters
          ?.databaseId;
      }
      Modal.confirm({
        title: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.AreYouSureYouWant.2',
          defaultMessage: '是否确认启用此 SQL 计划？',
        }), //确认要启用此 SQL 计划吗？
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
          await createTask({
            databaseId,
            taskType: TaskType.ALTER_SCHEDULE,
            parameters: {
              taskId: task?.id,
              operationType: 'RESUME',
            },
          });
          props?.onReload?.();
        },
      });
    };

    const stopCycleTask = async () => {
      let databaseId;
      if (task.database) {
        databaseId = task.database?.id;
      } else {
        databaseId = (task as ICycleTaskRecord<ILogicalDatabaseAsyncTaskParams>).jobParameters
          ?.databaseId;
      }
      const taskTypeName = TaskTypeMap[task?.type];
      Modal.confirm({
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
          setActiveBtnKey('stop');
          await createTask({
            databaseId,
            taskType: TaskType.ALTER_SCHEDULE,
            parameters: {
              taskId: task?.id,
              operationType: TaskOperationType.TERMINATE,
            },
          });
          props?.onReload?.();
        },
      });
    };

    /** 去重数组 */
    const uniqueTools = (tools) => {
      return Array.from(new Map(tools.map((obj) => [obj.key, obj])).values());
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

    const getTaskTools = (_task) => {
      let tools = [];

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
            !(structureComparisonData?.totalChangeScript?.length > 0)));
      const viewBtn = {
        key: 'view',
        text: formatMessage({ id: 'odc.TaskManagePage.AsyncTask.See', defaultMessage: '查看' }), // 查看
        action: openTaskDetail,
        type: 'button',
        isOpenBtn: true,
      };

      const closeBtn = {
        key: 'close',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Close',
          defaultMessage: '关闭',
        }),

        //关闭
        action: closeTaskDetail,
        type: 'button',
      };

      const copyBtn = {
        key: 'copy',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Copy',
          defaultMessage: '复制',
        }),

        //复制
        action: handleCopy,
        type: 'button',
        isOpenBtn: true,
      };

      const rollbackBtn = {
        key: 'rollback',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.RollBack',
          defaultMessage: '回滚',
        }),

        //回滚
        action: handleRollback,
        type: 'button',
      };

      const stopBtn = {
        key: 'stop',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Terminate',
          defaultMessage: '终止',
        }),

        //终止
        action: _stopTask,
        type: 'button',
      };

      const executeBtn = {
        key: 'execute',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Run',
          defaultMessage: '执行',
        }),

        //执行
        type: 'button',
        action: handleExecute,
        isOpenBtn: true,
        isPrimary: isDetailModal,
        disabled: false,
        tooltip: '',
      };

      const approvalBtn = {
        key: 'approval',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Pass',
          defaultMessage: '通过',
        }),

        //通过
        type: 'button',
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
          handleApproval(true);
        },
      };

      const rejectBtn = {
        key: 'reject',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Reject',
          defaultMessage: '拒绝',
        }),

        //拒绝
        type: 'button',
        action: async () => {
          handleApproval(false);
        },
      };

      const reTryBtn = {
        key: 'reTry',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.InitiateAgain',
          defaultMessage: '再次发起',
        }),

        //再次发起
        type: 'button',
        action: handleReTry,
      };

      const againBtn = {
        key: 'again',
        text: formatMessage({
          id: 'src.component.Task.component.ActionBar.57DBF8A7',
          defaultMessage: '重试',
        }),
        // 重试
        type: 'button',
        action: handleAgain,
      };

      const downloadBtn = {
        key: 'download',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Download',
          defaultMessage: '下载',
        }),
        disabled: isExpired,
        isExpired,
        tip: formatMessage({
          id: 'src.component.Task.component.ActionBar.F20AAC3F',
          defaultMessage: '文件下载链接已超时，请重新发起工单。',
        }), //'文件下载链接已超时，请重新发起工单。'

        action: download,
        type: 'button',
      };
      const downloadSQLBtn = {
        key: 'downloadSQL',
        text: formatMessage({
          id: 'src.component.Task.component.ActionBar.DBA6CB6E',
          defaultMessage: '下载 SQL',
        }), //'下载 SQL'
        disabled: disableBtn || !structureComparisonData?.storageObjectId,
        isExpired: disableBtn || !structureComparisonData?.storageObjectId,
        tip: formatMessage({
          id: 'src.component.Task.component.ActionBar.A79907A3',
          defaultMessage: '暂不可用',
        }), //'暂不可用'
        type: 'button',
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
      };
      const structrueComparisonBySQL = {
        key: 'structrueComparisonBySQL',
        text: formatMessage({
          id: 'src.component.Task.component.ActionBar.46F2F0ED',
          defaultMessage: '发起结构同步',
        }), //'发起结构同步'
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
        type: 'button',
        isPrimary: true,
        action: async () => {
          structureComparisonData &&
            modalStore?.changeCreateAsyncTaskModal(true, {
              sql: structureComparisonData?.totalChangeScript,
              databaseId: structureComparisonData?.database?.id,
              rules: null,
            });
        },
      };
      const openLocalFolder = {
        key: 'openLocalFolder',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.OpenFolder',
          defaultMessage: '打开文件夹',
        }),

        //打开文件夹
        action: async () => {
          const info = await getTaskResult(task.id);
          if (info?.exportZipFilePath) {
            ipcInvoke('showItemInFolder', info?.exportZipFilePath);
          }
        },
        type: 'button',
      };

      const downloadViewResultBtn = {
        key: 'downloadViewResult',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.DownloadQueryResults',
          defaultMessage: '下载查询结果',
        }),
        disabled: isExpired,
        isExpired,
        tip: formatMessage({
          id: 'src.component.Task.component.ActionBar.E9211B1A',
          defaultMessage: '文件下载链接已超时，请重新发起工单。',
        }), //'文件下载链接已超时，请重新发起工单。'

        action: downloadViewResult,
        type: 'button',
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
            setBtnByCreater(tools, reTryBtn);
            if (isApprover) {
              tools = [];
            }
            break;
          }
          case TaskStatus.EXECUTING: {
            setBtnByCreater(tools, reTryBtn);

            if (haveOperationPermission) {
              if (task.type === TaskType.STRUCTURE_COMPARISON) {
                tools.push(downloadSQLBtn, structrueComparisonBySQL);
              }
              tools.push(stopBtn);
            }
            if (isApprover) {
              tools = [];
            }
            break;
          }
          case TaskStatus.EXECUTION_SUCCEEDED: {
            setBtnByCreater(tools, reTryBtn);
            if (haveOperationPermission) {
              if (task.type === TaskType.EXPORT && settingStore.enableDataExport) {
                if (isClient()) {
                  tools.push(openLocalFolder);
                } else {
                  tools.push(downloadBtn);
                }
              } else if (task.type === TaskType.DATAMOCK && settingStore.enableDataExport) {
                tools.push(downloadBtn);
              } else if (
                task.type === TaskType.EXPORT_RESULT_SET &&
                settingStore.enableDataExport
              ) {
                tools.push(downloadBtn);
              } else if (
                [TaskType.ASYNC, TaskType.MULTIPLE_ASYNC]?.includes(task.type) &&
                task?.rollbackable
              ) {
                tools.push(rollbackBtn);
              } else if (task.type === TaskType.STRUCTURE_COMPARISON) {
                tools.push(downloadSQLBtn, structrueComparisonBySQL);
              }
            }

            if (isApprover) {
              tools = [];
            }
            break;
          }
          case TaskStatus.WAIT_FOR_CONFIRM:
          case TaskStatus.APPROVING: {
            if (isApprover) {
              tools = [rejectBtn, approvalBtn];
            }
            setBtnByCreater(tools, reTryBtn);
            if (haveOperationPermission) {
              tools.push(stopBtn);
            }
            break;
          }
          case TaskStatus.WAIT_FOR_EXECUTION: {
            setBtnByCreater(tools, reTryBtn);

            if (haveOperationPermission) {
              const _executeBtn = { ...executeBtn };
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
              const tempTools =
                task?.executionStrategy === TaskExecStrategy.AUTO
                  ? [stopBtn]
                  : [stopBtn, _executeBtn];
              tools.push(...tempTools);
            }
            if (isApprover) {
              tools = [];
            }
            break;
          }
          case TaskStatus.EXECUTION_ABNORMAL: {
            setBtnByCreater(tools, reTryBtn);
            if (haveOperationPermission) {
              tools.push(stopBtn, againBtn);
            }
            if (isApprover) {
              tools = [];
            }
            break;
          }
          default:
        }

        if (task?.type === TaskType.ASYNC && result?.containQuery) {
          if (settingStore.enableDataExport) {
            tools.unshift(downloadViewResultBtn);
          }
        }
      } else {
        tools = [viewBtn];
        if (status === TaskStatus.WAIT_FOR_EXECUTION) {
          if (haveOperationPermission) {
            const _executeBtn = { ...executeBtn };
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
            }
            task?.executionStrategy === TaskExecStrategy.AUTO
              ? tools.push(stopBtn)
              : tools.push(_executeBtn, stopBtn);
          }
          setBtnByCreater(tools, reTryBtn);
        }
      }
      if (task?.executionStrategy === TaskExecStrategy.TIMER) {
        // 定时任务无再次发起
        tools = tools?.filter((item) => item.key !== 'reTry');
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

      const viewBtn = {
        key: 'view',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.View',
          defaultMessage: '查看',
        }), //查看
        action: openTaskDetail,
        type: 'button',
        isOpenBtn: true,
      };

      const stopBtn = {
        key: 'stop',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Termination',
          defaultMessage: '终止',
        }), //终止
        action: stopCycleTask,
        type: 'button',
      };

      const editBtn = {
        key: 'edit',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Edit',
          defaultMessage: '编辑',
        }), //编辑
        action: editCycleTask,
        type: 'button',
      };

      const reTryBtn = {
        key: 'reTry',
        text: formatMessage({
          id: 'src.component.Task.component.ActionBar.C324AD20',
          defaultMessage: '再次发起',
        }), //'再次发起'
        type: 'button',
        action: handleReTryCycleTask,
      };

      const disableBtn = {
        key: 'disable',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Disable',
          defaultMessage: '禁用',
        }), //禁用
        action: disableCycleTask,
        type: 'button',
      };

      /* 禁用Schedule下的Task for logical database change task */
      /* 很脏的逻辑, ued少一层导致的 */
      const stopScheduleTaskBtn = {
        key: 'stopLogicalChangeTask',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Termination',
          defaultMessage: '终止',
        }), //终止
        action: stopScheduleTask,
        type: 'button',
      };

      const enableBtn = {
        key: 'enable',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Enable',
          defaultMessage: '启用',
        }), //启用
        action: enableCycleTask,
        type: 'button',
      };

      const approvalBtn = {
        key: 'approval',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Pass',
          defaultMessage: '通过',
        }), //通过
        type: 'button',
        isPrimary: isDetailModal,
        action: async () => {
          handleApproval(true);
        },
      };

      const rejectBtn = {
        key: 'reject',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Reject',
          defaultMessage: '拒绝',
        }), //拒绝
        type: 'button',
        action: async () => {
          handleApproval(false);
        },
      };

      const deleteBtn = {
        key: 'delete',
        text: formatMessage({
          id: 'src.component.Task.component.ActionBar.E16B982C',
          defaultMessage: '删除',
        }),
        type: 'button',
        confirmText: formatMessage({
          id: 'src.component.Task.component.ActionBar.72AF1732',
          defaultMessage: '你确定要删除这个任务吗？',
        }),
        action: deleteTask,
      };
      switch (status) {
        case TaskStatus.APPROVING: {
          tools = [viewBtn];
          if (haveOperationPermission) {
            tools.push(stopBtn);
          }
          if (isApprover) {
            tools.push(approvalBtn, rejectBtn);
          }
          break;
        }
        case TaskStatus.REJECTED: {
          tools = [viewBtn];
          break;
        }
        case TaskStatus.ENABLED: {
          tools = [viewBtn];
          setBtnByCreater(tools, reTryBtn);
          if (haveOperationPermission) {
            if (
              !(
                [TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE].includes(task?.type) &&
                (task as ICycleTaskRecord<TaskRecordParameters>)?.triggerConfig?.triggerStrategy ===
                  TaskExecStrategy.START_NOW
              )
            ) {
              tools.push(disableBtn, stopBtn, editBtn);
            }
          }

          if (haveOperationPermission && isLogicalDbChangeTask(task?.type)) {
            tools = [viewBtn, editBtn];
          }
          break;
        }
        case TaskStatus.APPROVAL_EXPIRED:
        case TaskStatus.TERMINATED: {
          tools = [viewBtn];
          if (haveOperationPermission) {
            if (
              [TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE, TaskType.SQL_PLAN].includes(task?.type)
            ) {
              tools.push(deleteBtn);
            }
          }
          break;
        }
        case TaskStatus.PAUSE: {
          tools = [viewBtn];
          setBtnByCreater(tools, reTryBtn);
          if (haveOperationPermission) {
            tools.push(editBtn, enableBtn, stopBtn);
          }
          break;
        }
        case TaskStatus.COMPLETED: {
          tools = [viewBtn];
          if ([TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE].includes(task?.type)) {
            setBtnByCreater(tools, reTryBtn);
          }
          if (
            [TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE, TaskType.SQL_PLAN].includes(task?.type) &&
            haveOperationPermission
          ) {
            tools.push(deleteBtn);
          }
          break;
        }
        case TaskStatus.CANCELLED: {
          tools = [viewBtn];
          if (haveOperationPermission) {
            tools.push(stopBtn);
          }
          break;
        }
        default:
      }

      if (isDetailModal) {
        tools = tools.filter((item) => !['view', 'delete'].includes(item.key));
      } else {
        tools = tools.filter((item) => ['view', 'delete'].includes(item.key));
      }

      // sql 计划 & 数据归档 & 数据清理 支持编辑
      if (![TaskType.SQL_PLAN, TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE].includes(task?.type)) {
        tools = tools.filter((item) => item.key !== 'edit');
      }
      if ((taskList?.[0]?.status as any) === SubTaskStatus.RUNNING) {
        tools = [...tools, stopScheduleTaskBtn];
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
