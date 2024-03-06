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
  createTask,
  downloadTaskFlow,
  executeTask,
  getStructureComparisonTaskFile,
  getTaskResult,
  stopTask,
} from '@/common/network/task';
import Action from '@/component/Action';
import {
  IAsyncTaskParams,
  IMockDataParams,
  ITaskResult,
  RollbackType,
  TaskDetail,
  TaskExecStrategy,
  TaskRecord,
  TaskRecordParameters,
  IApplyDatabasePermissionTaskParams,
  TaskStatus,
  TaskType,
  SubTaskStatus,
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
import React, { useEffect, useState } from 'react';
import { isCycleTask } from '../../helper';
import RollBackModal from '../RollbackModal';
import { cloneDeep } from 'lodash';

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
    } = props;
    const isOwner = user?.id === task?.creator?.id;
    const isApprovable = task?.approvable;
    const [activeBtnKey, setActiveBtnKey] = useState(null);
    const [openRollback, setOpenRollback] = useState(false);
    const disabledApproval =
      task?.status === TaskStatus.WAIT_FOR_CONFIRM && !isDetailModal ? true : disabledSubmit;

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
          }),
        );

        props?.onReloadList?.();
        props?.onReload?.();
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
      const res = await executeTask(task.id);
      if (res) {
        message.success(
          formatMessage({
            id: 'odc.TaskManagePage.component.TaskTools.ExecutionSucceeded',
          }),

          //执行成功
        );
      }
    };

    const handleApproval = async (status: boolean) => {
      props.onApprovalVisible(status, true);
    };

    const handleReTry = async () => {
      const { type } = task;
      switch (type) {
        case TaskType.ASYNC: {
          props.modalStore.changeCreateAsyncTaskModal(true, {
            task: task as TaskDetail<IAsyncTaskParams>,
          });
          return;
        }
        case TaskType.DATAMOCK: {
          props.modalStore.changeDataMockerModal(true, {
            task: task as TaskDetail<IMockDataParams>,
          });
          return;
        }
        case TaskType.APPLY_DATABASE_PERMISSION: {
          modalStore.changeApplyDatabasePermissionModal(true, {
            task: task as TaskDetail<IApplyDatabasePermissionTaskParams>,
          });
          return;
        }
        default: {
          const {
            database: { id: databaseId } = {},
            executionStrategy,
            executionTime,
            parameters,
            description,
          } = task;
          const data = {
            taskType: type,
            parameters,
            databaseId,
            executionStrategy,
            executionTime,
            description,
          };
          const res = await createTask(data);
          if (res) {
            message.success(
              formatMessage({
                id: 'odc.TaskManagePage.component.TaskTools.InitiatedAgain',
              }),

              //再次发起成功
            );
          }
        }
      }
    };

    const editCycleTask = async () => {
      props?.onClose?.();
      if (task?.type === TaskType.DATA_ARCHIVE) {
        props.modalStore.changeDataArchiveModal(true, {
          id: task?.id,
          type: 'EDIT',
        });
      } else {
        props.modalStore.changeCreateSQLPlanTaskModal(true, task?.id);
      }
    };

    const handleReTryCycleTask = async () => {
      props?.onClose?.();
      if (task?.type === TaskType.DATA_ARCHIVE) {
        props.modalStore.changeDataArchiveModal(true, {
          id: task?.id,
          type: 'RETRY',
        });
      } else if (task?.type === TaskType.DATA_DELETE) {
        props.modalStore.changeDataClearModal(true, {
          id: task?.id,
          type: 'RETRY',
        });
      }
    };

    const disableCycleTask = async () => {
      const {
        database: { id: databaseId },
        id,
      } = task;
      Modal.confirm({
        title: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.AreYouSureYouWant.1',
        }), //确认要禁用此 SQL 计划吗？
        content: (
          <>
            <div>
              {
                formatMessage({
                  id: 'odc.TaskManagePage.component.TaskTools.DisableSqlScheduling',
                }) /*禁用 SQL 计划*/
              }
            </div>
            <div>
              {
                formatMessage({
                  id: 'odc.TaskManagePage.component.TaskTools.TheTaskNeedsToBe',
                }) /*任务需要重新审批，审批通过后此任务将禁用*/
              }
            </div>
          </>
        ),

        cancelText: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Cancel',
        }), //取消
        okText: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Ok.2',
        }), //确定
        centered: true,
        onOk: async () => {
          await createTask({
            databaseId,
            taskType: TaskType.ALTER_SCHEDULE,
            parameters: {
              taskId: id,
              operationType: 'PAUSE',
            },
          });
          props?.onReload?.();
        },
      });
    };

    const enableCycleTask = async () => {
      const {
        database: { id: databaseId },
        id,
      } = task;
      Modal.confirm({
        title: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.AreYouSureYouWant.2',
        }), //确认要启用此 SQL 计划吗？
        content: (
          <>
            <div>
              {
                formatMessage({
                  id: 'odc.TaskManagePage.component.TaskTools.EnableSqlScheduling',
                }) /*启用 SQL 计划*/
              }
            </div>
            <div>
              {
                formatMessage({
                  id: 'odc.TaskManagePage.component.TaskTools.TheTaskNeedsToBe.1',
                }) /*任务需要重新审批，审批通过后此任务将启用*/
              }
            </div>
          </>
        ),

        cancelText: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Cancel',
        }), //取消
        okText: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Ok.2',
        }), //确定
        centered: true,
        onOk: async () => {
          await createTask({
            databaseId,
            taskType: TaskType.ALTER_SCHEDULE,
            parameters: {
              taskId: id,
              operationType: 'RESUME',
            },
          });
          props?.onReload?.();
        },
      });
    };

    const stopCycleTask = async () => {
      const {
        database: { id: databaseId },
        id,
      } = task;
      await createTask({
        databaseId,
        taskType: TaskType.ALTER_SCHEDULE,
        parameters: {
          taskId: id,
          operationType: 'TERMINATION',
        },
      });
      props?.onReload?.();
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
        text: formatMessage({ id: 'odc.TaskManagePage.AsyncTask.See' }), // 查看
        action: openTaskDetail,
        type: 'button',
        isOpenBtn: true,
      };

      const closeBtn = {
        key: 'close',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Close',
        }),

        //关闭
        action: closeTaskDetail,
        type: 'button',
      };

      const copyBtn = {
        key: 'copy',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Copy',
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
        }),

        //回滚
        action: handleRollback,
        type: 'button',
      };

      const stopBtn = {
        key: 'stop',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Terminate',
        }),

        //终止
        action: _stopTask,
        type: 'button',
      };

      const executeBtn = {
        key: 'execute',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Run',
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
        }),

        //通过
        type: 'button',
        isPrimary: isDetailModal,
        disabled: disabledApproval,
        tooltip: disabledApproval
          ? formatMessage({
              id: 'odc.TaskManagePage.component.TaskTools.SetPartitionPoliciesForAll',
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
        }),

        //再次发起
        type: 'button',
        action: handleReTry,
      };

      const downloadBtn = {
        key: 'download',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Download',
        }),
        disabled: isExpired,
        isExpired,
        tip: formatMessage({ id: 'src.component.Task.component.ActionBar.F20AAC3F' }), //'文件下载链接已超时，请重新发起工单。'

        action: download,
        type: 'button',
      };
      const downloadSQLBtn = {
        key: 'downloadSQL',
        text: formatMessage({ id: 'src.component.Task.component.ActionBar.DBA6CB6E' }), //'下载 SQL'
        disabled: disableBtn || !structureComparisonData?.storageObjectId,
        isExpired: disableBtn || !structureComparisonData?.storageObjectId,
        tip: formatMessage({ id: 'src.component.Task.component.ActionBar.A79907A3' }), //'暂不可用'
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
        text: formatMessage({ id: 'src.component.Task.component.ActionBar.46F2F0ED' }), //'发起结构同步'
        isExpired: disableBtn || noAction,
        disabled: disableBtn || noAction,
        tip: noAction
          ? formatMessage({ id: 'src.component.Task.component.ActionBar.D98B5B62' })
          : formatMessage({ id: 'src.component.Task.component.ActionBar.4BF7D8BF' }),
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
        }),
        disabled: isExpired,
        isExpired,
        tip: '文件下载链接已超时，请重新发起工单。',
        //下载查询结果
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
            if (isOwner || (isOwner && isApprovable)) {
              tools = [reTryBtn];
            }
            if (isApprovable) {
              tools = [];
            }
            break;
          }
          case TaskStatus.EXECUTING: {
            if (isOwner || (isOwner && isApprovable)) {
              tools = [reTryBtn, stopBtn];
              if (task.type === TaskType.STRUCTURE_COMPARISON) {
                tools.push(downloadSQLBtn, structrueComparisonBySQL);
              }
            }
            if (isApprovable) {
              tools = [];
            }
            break;
          }
          case TaskStatus.EXECUTION_SUCCEEDED: {
            if (isOwner || (isOwner && isApprovable)) {
              tools = [reTryBtn];
              if (task.type === TaskType.EXPORT && settingStore.enableDataExport) {
                if (isClient()) {
                  tools.push(openLocalFolder);
                } else {
                  tools.push(downloadBtn);
                }
              } else if (task.type === TaskType.DATAMOCK && settingStore.enableDataExport) {
                tools.push(downloadBtn);
              } else if (task.type === TaskType.EXPORT_RESULT_SET) {
                tools.push(downloadBtn);
              } else if (task.type === TaskType.ASYNC && task?.rollbackable) {
                tools.push(rollbackBtn);
              } else if (task.type === TaskType.STRUCTURE_COMPARISON) {
                tools.push(downloadSQLBtn, structrueComparisonBySQL);
              }
            }
            if (isApprovable) {
              tools = [];
            }
            break;
          }
          case TaskStatus.WAIT_FOR_CONFIRM:
          case TaskStatus.APPROVING: {
            if (isOwner && isApprovable) {
              tools = [reTryBtn, stopBtn, rejectBtn, approvalBtn];
            } else {
              if (isOwner) {
                tools = [reTryBtn, stopBtn];
              }
              if (isApprovable) {
                tools = [rejectBtn, approvalBtn];
              }
            }
            break;
          }
          case TaskStatus.WAIT_FOR_EXECUTION: {
            if (isOwner || (isOwner && isApprovable)) {
              const _executeBtn = { ...executeBtn };
              if (task?.executionStrategy === TaskExecStrategy.TIMER) {
                _executeBtn.disabled = true;
                const executionTime = getLocalFormatDateTime(task?.executionTime);

                _executeBtn.tooltip = formatMessage(
                  {
                    id: 'odc.TaskManagePage.component.TaskTools.ScheduledExecutionTimeExecutiontime',
                  },

                  { executionTime: executionTime },
                );

                //`定时执行时间：${executionTime}`
              }
              tools =
                task?.executionStrategy === TaskExecStrategy.AUTO
                  ? [reTryBtn, stopBtn]
                  : [reTryBtn, stopBtn, _executeBtn];
            }
            if (isApprovable) {
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
      }
      if (task?.executionStrategy === TaskExecStrategy.TIMER) {
        // 定时任务无再次发起
        tools = tools?.filter((item) => item.key !== 'reTry');
      }
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
        }), //查看
        action: openTaskDetail,
        type: 'button',
        isOpenBtn: true,
      };

      const stopBtn = {
        key: 'stop',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Termination',
        }), //终止
        action: stopCycleTask,
        type: 'button',
      };

      const editBtn = {
        key: 'edit',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Edit',
        }), //编辑
        action: editCycleTask,
        type: 'button',
      };

      const reTryBtn = {
        key: 'reTry',
        text: formatMessage({ id: 'src.component.Task.component.ActionBar.C324AD20' }), //'再次发起'
        type: 'button',
        action: handleReTryCycleTask,
      };

      const disableBtn = {
        key: 'disable',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Disable',
        }), //禁用
        action: disableCycleTask,
        type: 'button',
      };

      const enableBtn = {
        key: 'enable',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Enable',
        }), //启用
        action: enableCycleTask,
        type: 'button',
      };

      const approvalBtn = {
        key: 'approval',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Pass',
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
        }), //拒绝
        type: 'button',
        action: async () => {
          handleApproval(false);
        },
      };

      switch (status) {
        case TaskStatus.APPROVING: {
          if (isOwner && isApprovable) {
            tools = [viewBtn, stopBtn, approvalBtn, rejectBtn];
          } else {
            if (isOwner) {
              tools = [viewBtn, stopBtn];
            } else if (isApprovable) {
              tools = [viewBtn, approvalBtn, rejectBtn];
            } else {
              tools = [viewBtn];
            }
          }
          break;
        }
        case TaskStatus.REJECTED: {
          tools = [viewBtn];
          break;
        }
        case TaskStatus.ENABLED: {
          if (isOwner || (isOwner && isApprovable)) {
            tools = [viewBtn, editBtn, disableBtn];
          } else {
            tools = [viewBtn];
          }
          break;
        }
        case TaskStatus.APPROVAL_EXPIRED:
        case TaskStatus.TERMINATION: {
          if (isOwner || (isOwner && isApprovable)) {
            tools = [viewBtn];
          } else {
            tools = [viewBtn];
          }
          break;
        }
        case TaskStatus.PAUSE: {
          if (isOwner || (isOwner && isApprovable)) {
            tools = [viewBtn, editBtn, enableBtn];
          } else {
            tools = [viewBtn];
          }
          break;
        }
        case TaskStatus.COMPLETED: {
          if (isOwner || (isOwner && isApprovable)) {
            tools = [viewBtn];
            if ([TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE].includes(task?.type)) {
              tools.push(reTryBtn);
            }
          } else {
            tools = [viewBtn];
          }
          break;
        }
        default:
      }

      if (isDetailModal) {
        tools = tools.filter((item) => item.key !== 'view');
      } else {
        tools = [viewBtn];
      }
      // 仅 sql 计划 & 数据归档支持编辑
      if (![TaskType.SQL_PLAN, TaskType.DATA_ARCHIVE].includes(task?.type)) {
        tools = tools.filter((item) => item.key !== 'edit');
      }
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
      const disabled = activeBtnKey === tool?.key || tool?.disabled;
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
