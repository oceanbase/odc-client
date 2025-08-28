import { formatMessage } from '@/util/intl';
import React, { useEffect, useState } from 'react';
import type { FileExportResponse, ScheduleExportListView } from '@/d.ts/migrateTask';
import { AsyncTaskType, TripartiteExportTaskStatus } from '@/d.ts/migrateTask';
import { Button, notification, Typography, Space } from 'antd';
import { createTaskManager } from '@/store/migrationTaskManager';
import type { TaskConfig } from '@/store/migrationTaskManager';
import {
  getExportSchedulesResult,
  exportSchedulesTask,
  getExportTaskLog,
  cancelFlowInstance,
  getBatchCancelResult,
  getBatchCancelLog,
} from '@/common/network/task';
import {
  batchTerminateScheduleAndTask,
  getTerminateScheduleResult,
  getTerminateScheduleLog,
} from '@/common/network/schedule';
import { LoadingOutlined } from '@ant-design/icons';
import type { AsyncTaskModalConfig } from './hooks/useTaskTable';
import { useDebounceFn } from 'ahooks';
import { TaskRecord, TaskRecordParameters, TaskType } from '@/d.ts';
import {
  IBatchTerminateFlowResult,
  IScheduleTerminateCmd,
  IScheduleTerminateResult,
  ITaskTerminateCmd,
} from '@/d.ts/importTask';

const SubmitTripartiteTaskButton = (props: {
  closeModal: () => void;
  disabled: boolean;
  tasks: ScheduleExportListView[];
  asyncTaskType: AsyncTaskType;
  config: AsyncTaskModalConfig;
  riskConfirmed: boolean;
  setConfirmRiskUnFinished: (value: boolean) => void;
  setIsSubmitButtonLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onReload: () => void;
}) => {
  const [taskId, setTaskId] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const downloadLogFromString = (str: string, type: AsyncTaskType) => {
    const blob = new Blob([str], { type: 'text/plain' });
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `task_${type}.log`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  };

  const asyncTaskMap = {
    [AsyncTaskType.export]: {
      api: (taskId: number) => {
        return getExportSchedulesResult(taskId);
      },
      submitApi: (params: { ids: number[]; scheduleType: TaskType }) => {
        return exportSchedulesTask(params);
      },
      getSubmitParams: () => {
        return {
          ids: props.tasks?.map((item) => item.id),
          scheduleType: props.tasks?.[0]?.scheduleType,
        };
      },
      isTaskCompleted: (result: FileExportResponse) => {
        return [TripartiteExportTaskStatus.SUCCESS, TripartiteExportTaskStatus.FAILED]?.includes(
          result?.status,
        );
      },
      notificationHandler: {
        handleResult: (rawResult: FileExportResponse, exportId: string) => {
          setTaskId(undefined);
          switch (rawResult.status) {
            case TripartiteExportTaskStatus.SUCCESS: {
              const downloadUrl = rawResult.downloadUrl;
              const link = document.createElement('a');
              link.href = downloadUrl;
              link.download = rawResult.fileName || 'export.zip';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              notification.success({
                message: formatMessage({
                  id: 'src.component.Task.component.AsyncTaskOperationButton.410023EB',
                  defaultMessage: '导出定时任务已完成',
                }),
                description: (
                  <Space direction="vertical">
                    <Typography.Text>
                      {formatMessage({
                        id: 'src.component.Task.component.AsyncTaskOperationButton.40B3DA3C',
                        defaultMessage: '请妥善保存文件密钥，后续导入时需要使用:',
                      })}
                    </Typography.Text>
                    <Space direction="vertical">
                      <span>
                        {formatMessage({
                          id: 'src.component.Task.component.AsyncTaskOperationButton.2F172E80',
                          defaultMessage: '文件:',
                        })}
                        {rawResult.fileName}
                      </span>
                      <Typography.Paragraph
                        ellipsis={true}
                        style={{ width: 260 }}
                        copyable={{
                          text: rawResult.secret,
                        }}
                      >
                        {formatMessage({
                          id: 'src.component.Task.component.AsyncTaskOperationButton.726D13A8',
                          defaultMessage: '密钥:',
                        })}

                        {rawResult.secret}
                      </Typography.Paragraph>
                    </Space>
                  </Space>
                ),

                duration: null,
              });
              props?.onReload?.();
              break;
            }
            case TripartiteExportTaskStatus.FAILED: {
              const downloadLog = async () => {
                const res = await getExportTaskLog({ exportId });
                downloadLogFromString(res, AsyncTaskType.export);
              };
              notification.error({
                message: formatMessage({
                  id: 'src.component.Task.component.AsyncTaskOperationButton.26B47A2E',
                  defaultMessage: '导出定时任务失败',
                }),
                description: (
                  <Typography.Text style={{ textAlign: 'center' }}>
                    {formatMessage({
                      id: 'src.component.Task.component.AsyncTaskOperationButton.45245510',
                      defaultMessage: '如需了解导出详情，可',
                    })}

                    <Typography.Link
                      onClick={downloadLog}
                      style={{ padding: '0 8px', display: 'inline' }}
                    >
                      {formatMessage({
                        id: 'src.component.Task.component.AsyncTaskOperationButton.0FD76940',
                        defaultMessage: '下载日志',
                      })}
                    </Typography.Link>
                    {formatMessage({
                      id: 'src.component.Task.component.AsyncTaskOperationButton.D813FC16',
                      defaultMessage: '查看',
                    })}
                  </Typography.Text>
                ),

                duration: null,
              });
              props?.onReload?.();
              break;
            }
            case TripartiteExportTaskStatus.CREATED:
            case TripartiteExportTaskStatus.EXPORTING:
              props?.onReload?.();
              break;
          }
        },
        handleError: (error: any) => {
          setTaskId(undefined);
          notification.error({
            message: formatMessage({
              id: 'src.component.Task.component.AsyncTaskOperationButton.622B32EB',
              defaultMessage: '导出错误',
            }),
            description: error.message,
          });
          props?.onReload?.();
        },
        startNotification: (taskId: number, ids: number[]) => {
          const notificationId = `${taskId}`;
          notification.open({
            key: notificationId,
            message: formatMessage({
              id: 'src.component.Task.component.AsyncTaskOperationButton.02135262',
              defaultMessage: '导出定时任务',
            }),
            description: formatMessage(
              {
                id: 'src.component.Task.component.AsyncTaskOperationButton.EB1F7F39',
                defaultMessage: '{idsLength}个定时任务正在导出中...',
              },
              { idsLength: ids.length },
            ),
            icon: <LoadingOutlined style={{ color: '#108ee9' }} />,
            duration: 0,
          });
          return notificationId;
        },
      },
    },
    [AsyncTaskType.terminateTask]: {
      api: (terminateId: number) => {
        return getBatchCancelResult(terminateId?.toString?.());
      },
      submitApi: (data: ITaskTerminateCmd) => {
        return cancelFlowInstance(data);
      },
      getSubmitParams: () => {
        return {
          flowInstanceIds: props.tasks?.map((item) => item.id),
          taskType: props.tasks?.[0]?.type,
        };
      },
      isTaskCompleted: (result: IBatchTerminateFlowResult[]) => {
        return result?.length > 0 && result?.every((i) => i?.terminateSucceed || i?.failReason);
      },
      notificationHandler: {
        handleResult: (rawResult: IBatchTerminateFlowResult[], taskId: string) => {
          setTaskId(undefined);
          const failedCount = rawResult?.filter((item) => !item.terminateSucceed).length;
          const succeedCount = rawResult?.filter((item) => item.terminateSucceed).length;

          if (succeedCount === rawResult?.length) {
            notification.success({
              message: formatMessage({
                id: 'src.component.Task.component.AsyncTaskOperationButton.C2AF7DD4',
                defaultMessage: '终止任务已完成',
              }),
              description: formatMessage(
                {
                  id: 'src.component.Task.component.AsyncTaskOperationButton.348E6976',
                  defaultMessage: '{rawResultLength} 个任务已终止。',
                },
                { rawResultLength: rawResult?.length },
              ),
              duration: null,
            });
            props?.onReload?.();
          } else {
            const downloadLog = async () => {
              const res = await getBatchCancelLog(taskId);
              downloadLogFromString(res, AsyncTaskType.terminateSchedule);
            };
            notification.error({
              message: formatMessage({
                id: 'src.component.Task.component.AsyncTaskOperationButton.C20458AD',
                defaultMessage: '终止任务已完成',
              }),
              description: (
                <Typography.Text style={{ textAlign: 'center' }}>
                  {formatMessage(
                    {
                      id: 'src.component.Task.component.AsyncTaskOperationButton.96306F17',
                      defaultMessage:
                        '{succeedCount} 个任务已终止，{failedCount} 个任务终止失败。如需了解导出详情，可',
                    },
                    { succeedCount, failedCount },
                  )}
                  <Typography.Link onClick={downloadLog} style={{ padding: '0 8px' }}>
                    {formatMessage({
                      id: 'src.component.Task.component.AsyncTaskOperationButton.FBB89FF3',
                      defaultMessage: '下载日志',
                    })}
                  </Typography.Link>
                  {formatMessage({
                    id: 'src.component.Task.component.AsyncTaskOperationButton.89DB8E51',
                    defaultMessage: '查看',
                  })}
                </Typography.Text>
              ),

              duration: null,
            });
            props?.onReload?.();
          }
        },
        handleError: (error: any) => {
          setTaskId(undefined);
          notification.error({
            message: formatMessage({
              id: 'src.component.Task.component.AsyncTaskOperationButton.75E93A96',
              defaultMessage: '终止错误',
            }),
            description: error.message,
          });
          props?.onReload?.();
        },
        startNotification: (taskId: number, ids: number[]) => {
          const notificationId = `${taskId}`;
          notification.open({
            key: notificationId,
            message: formatMessage({
              id: 'src.component.Task.component.AsyncTaskOperationButton.AC3DA902',
              defaultMessage: '终止任务',
            }),
            description: formatMessage(
              {
                id: 'src.component.Task.component.AsyncTaskOperationButton.24B587C3',
                defaultMessage: '{idsLength}个任务正在终止中...',
              },
              { idsLength: ids.length },
            ),
            icon: <LoadingOutlined style={{ color: '#108ee9' }} />,
            duration: null,
          });
          return notificationId;
        },
      },
    },
    [AsyncTaskType.terminateSchedule]: {
      api: (taskId: string) => {
        return getTerminateScheduleResult(taskId);
      },
      submitApi: (params: IScheduleTerminateCmd) => {
        return batchTerminateScheduleAndTask(params);
      },
      getSubmitParams: () => {
        return {
          ids: props.tasks?.map((item) => item.id),
          scheduleType: props.tasks?.[0]?.scheduleType,
        };
      },
      isTaskCompleted: (result: IScheduleTerminateResult[]) => {
        return result?.length > 0 && result?.every((i) => i?.terminateSucceed || i?.failReason);
      },
      notificationHandler: {
        handleResult: (rawResult: IScheduleTerminateResult[], taskId: string) => {
          setTaskId(undefined);
          const failedCount = rawResult?.filter((item) => !item.terminateSucceed).length;
          const succeedCount = rawResult?.filter((item) => item.terminateSucceed).length;
          if (succeedCount === rawResult?.length) {
            notification.success({
              message: formatMessage({
                id: 'src.component.Task.component.AsyncTaskOperationButton.E7A1ECD2',
                defaultMessage: '终止任务已完成',
              }),
              description: formatMessage(
                {
                  id: 'src.component.Task.component.AsyncTaskOperationButton.66B5F8B4',
                  defaultMessage: '{rawResultLength} 个任务已终止。',
                },
                { rawResultLength: rawResult?.length },
              ),
              duration: null,
            });
            props?.onReload?.();
          } else {
            const downloadLog = async () => {
              const res = await getTerminateScheduleLog(taskId);
              downloadLogFromString(res, AsyncTaskType.terminateSchedule);
            };
            notification.error({
              message: formatMessage({
                id: 'src.component.Task.component.AsyncTaskOperationButton.FEAC6AAB',
                defaultMessage: '终止任务已完成',
              }),
              description: (
                <Typography.Text style={{ textAlign: 'center' }}>
                  {formatMessage(
                    {
                      id: 'src.component.Task.component.AsyncTaskOperationButton.D27AC971',
                      defaultMessage:
                        '{succeedCount} 个任务已终止，{failedCount} 个任务终止失败。如需了解导出详情，可',
                    },
                    { succeedCount, failedCount },
                  )}
                  <Typography.Link onClick={downloadLog} style={{ padding: '0 8px' }}>
                    {formatMessage({
                      id: 'src.component.Task.component.AsyncTaskOperationButton.2E9AB925',
                      defaultMessage: '下载日志',
                    })}
                  </Typography.Link>
                  {formatMessage({
                    id: 'src.component.Task.component.AsyncTaskOperationButton.091E3B93',
                    defaultMessage: '查看',
                  })}
                </Typography.Text>
              ),

              duration: null,
            });
            props?.onReload?.();
          }
        },
        handleError: (error: any) => {
          setTaskId(undefined);
          notification.error({
            message: formatMessage({
              id: 'src.component.Task.component.AsyncTaskOperationButton.89CE28F7',
              defaultMessage: '终止错误',
            }),
            description: error.message,
          });
          props?.onReload?.();
        },
        startNotification: (taskId: number, ids: number[]) => {
          const notificationId = `${taskId}`;
          notification.open({
            key: notificationId,
            message: formatMessage({
              id: 'src.component.Task.component.AsyncTaskOperationButton.08EE66D0',
              defaultMessage: '终止任务',
            }),
            description: formatMessage(
              {
                id: 'src.component.Task.component.AsyncTaskOperationButton.5E6481EB',
                defaultMessage: '{idsLength}个任务正在终止中...',
              },
              { idsLength: ids.length },
            ),
            icon: <LoadingOutlined style={{ color: '#108ee9' }} />,
            duration: null,
          });
          return notificationId;
        },
      },
    },
  };

  const getAsyncTaskConfigByTaskType = (asyncTaskType: AsyncTaskType): TaskConfig => {
    return {
      asyncTaskType,
      api: {
        fetchStatus: (taskId) => asyncTaskMap[asyncTaskType]?.api?.(taskId),
        submit: (params) => asyncTaskMap[asyncTaskType]?.submitApi?.(params),
      },
      getSubmitParams: () => asyncTaskMap[asyncTaskType]?.getSubmitParams?.(),
      isTaskCompleted: (result) => asyncTaskMap[asyncTaskType]?.isTaskCompleted?.(result),
      notificationHandler: asyncTaskMap[asyncTaskType]?.notificationHandler,
    };
  };

  const asyncTask = createTaskManager(getAsyncTaskConfigByTaskType(props.asyncTaskType));

  const { run: debounceSubmit } = useDebounceFn(
    async () => {
      setIsSubmitting(true);
      try {
        if (props.config.needRiskConfirm && !props.riskConfirmed) {
          props?.setConfirmRiskUnFinished(true);
          return;
        }
        setTaskId(undefined);
        const config = getAsyncTaskConfigByTaskType(props.asyncTaskType);
        const res = await config?.api?.submit(config?.getSubmitParams?.());
        if (res) {
          setTaskId(res as string);
          props?.closeModal();
          await asyncTask.startTask(res, props.asyncTaskType, {
            taskId: res,
            ids: props.tasks?.map((item) => item.id),
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    { wait: 300 },
  );

  const handleSumbit = () => {
    if (isSubmitting) return;
    debounceSubmit();
  };

  useEffect(() => {
    if (taskId && asyncTask?.isTaskFinished(taskId.toString())) {
      setTaskId(undefined);
    }
  }, [taskId, asyncTask?.isTaskFinished]);

  useEffect(() => {
    props.setIsSubmitButtonLoading(
      isSubmitting || (!!taskId && !asyncTask?.isTaskFinished(taskId.toString())),
    );
  }, [isSubmitting, taskId]);
  return (
    <Button
      onClick={handleSumbit}
      loading={isSubmitting || (!!taskId && !asyncTask?.isTaskFinished(taskId.toString()))}
      type={props.config.confirmButtonType === 'primary' ? 'primary' : 'default'}
      disabled={props.disabled || isSubmitting}
      danger={props.config.confirmButtonType === 'danger'}
    >
      {props.config.confirmButtonText}
    </Button>
  );
};

export default SubmitTripartiteTaskButton;
