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

import { formatMessage } from '@/util/intl';
import {
  getScheduleImportLog,
  getScheduleImportResult,
  startScheduleImportTask,
} from '@/common/network/task';
import { createTaskManager } from '@/store/migrationTaskManager';
import {
  IImportScheduleTaskView,
  IImportTaskResult,
  IScheduleTaskImportRequest,
} from '@/d.ts/importTask';
import { notification, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import React, { useState } from 'react';
import { AsyncTaskType } from '@/d.ts/migrateTask';
import { history } from '@umijs/max';
import login from '@/store/login';

const downloadLogFromString = (str: string) => {
  const blob = new Blob([str], { type: 'text/plain' });
  const downloadUrl = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `task.log`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

const goNotification = (projectId: string) => {
  if (projectId) {
    history.push(`/project/${projectId}/notification`);
  } else {
    history.push(`/project`);
  }
};

export const useImport = (
  setReloadSign: React.Dispatch<React.SetStateAction<number>>,
  projectId?: string,
) => {
  const [isSubmitImport, setIsSubmitImport] = useState(false);
  const taskInfo = {
    api: (importTaskId: string) => {
      return getScheduleImportResult(importTaskId);
    },
    submitApi: (task: IScheduleTaskImportRequest) => {
      return startScheduleImportTask(task);
    },
    isTaskCompleted: (result: IImportTaskResult[]) => {
      return result?.length > 0;
    },
    notificationHandler: {
      handleResult: (result: IImportTaskResult[], taskId: string) => {
        const downloadLog = async () => {
          const res = await getScheduleImportLog(taskId);
          downloadLogFromString(res);
        };
        if (result?.every((i) => i.success)) {
          const importedCount = result?.filter((i) => i?.remark === 'Have been imported.')?.length;
          const importedDescription = importedCount
            ? formatMessage(
                {
                  id: 'src.component.Task.component.ImportModal.A6892359',
                  defaultMessage: '(包含 {importedCount} 个已导入的任务)',
                },
                { importedCount },
              )
            : '';
          const privateSpaceDescription = formatMessage(
            {
              id: 'src.component.Task.component.ImportModal.AF106FF6',
              defaultMessage: '{resultLength} 个作业导入成功{importedDescription}。',
            },
            { resultLength: result?.length, importedDescription },
          );
          notification.success({
            message: formatMessage({
              id: 'src.component.Task.component.ImportModal.997B6AC7',
              defaultMessage: '导入定时任务已完成',
            }),
            description: login.isPrivateSpace() ? (
              privateSpaceDescription
            ) : (
              <Typography.Text>
                {formatMessage(
                  {
                    id: 'src.component.Task.component.ImportModal.97A1A7A3',
                    defaultMessage: '{resultLength} 个作业导入成功{importedDescription}。',
                  },
                  { resultLength: result?.length, importedDescription },
                )}
                {formatMessage({
                  id: 'src.component.Task.component.ImportModal.1B653B27',
                  defaultMessage: '建议手动为任务',
                })}

                <Typography.Link onClick={() => goNotification(projectId)}>
                  {formatMessage({
                    id: 'src.component.Task.component.ImportModal.8AD83BC8',
                    defaultMessage: '配置消息通知',
                  })}
                </Typography.Link>
                {formatMessage({
                  id: 'src.component.Task.component.ImportModal.04E1F63D',
                  defaultMessage: '，保证任务异常能够被及时发现。',
                })}
              </Typography.Text>
            ),

            duration: null,
          });
        } else {
          const successCount = result?.filter((i) => i?.success)?.length;
          const failedCount = result?.filter((i) => !i?.success)?.length;
          const importedCount = result?.filter(
            (i) => i?.success && i?.remark === 'Have been imported.',
          )?.length;
          const importedDescription = importedCount
            ? formatMessage(
                {
                  id: 'src.component.Task.component.ImportModal.92D087FB',
                  defaultMessage: '(包含 {importedCount} 个已导入的任务)',
                },
                { importedCount },
              )
            : '';
          const privateSpaceDescription = (
            <Typography.Text>
              {formatMessage(
                {
                  id: 'src.component.Task.component.ImportModal.94BFD01C',
                  defaultMessage:
                    '{successCount} 个作业导入成功{importedDescription}, {failedCount} 个作业导入失败。可',
                },
                { successCount, importedDescription, failedCount },
              )}
              <Typography.Link
                onClick={downloadLog}
                style={{ padding: '0 4px', display: 'inline' }}
              >
                {formatMessage({
                  id: 'src.component.Task.component.ImportModal.A23B9738',
                  defaultMessage: '下载日志',
                })}
              </Typography.Link>
              {formatMessage({
                id: 'src.component.Task.component.ImportModal.997B48CD',
                defaultMessage: '查看。',
              })}
            </Typography.Text>
          );

          notification.warning({
            message: formatMessage({
              id: 'src.component.Task.component.ImportModal.997B6AC7',
              defaultMessage: '导入定时任务已完成',
            }),
            description: login.isPrivateSpace() ? (
              privateSpaceDescription
            ) : (
              <Typography.Text style={{ textAlign: 'center' }}>
                {formatMessage(
                  {
                    id: 'src.component.Task.component.ImportModal.AE88E265',
                    defaultMessage: '{successCount} 个作业导入成功{importedDescription}, ',
                  },
                  { successCount, importedDescription },
                )}
                {formatMessage(
                  {
                    id: 'src.component.Task.component.ImportModal.32698C46',
                    defaultMessage: '{failedCount}  个作业导入失败。 建议手动为任务',
                  },
                  { failedCount },
                )}
                <Typography.Link
                  onClick={() => goNotification(projectId)}
                  style={{ padding: '0 4px' }}
                >
                  {formatMessage({
                    id: 'src.component.Task.component.ImportModal.801362FE',
                    defaultMessage: '配置消息通知',
                  })}
                </Typography.Link>
                {formatMessage({
                  id: 'src.component.Task.component.ImportModal.60663407',
                  defaultMessage: '，保证任务异常能够被及时发现。如需了解导出详情，可',
                })}
                <Typography.Link
                  onClick={downloadLog}
                  style={{ padding: '0 4px', display: 'inline' }}
                >
                  {formatMessage({
                    id: 'src.component.Task.component.ImportModal.A23B9738',
                    defaultMessage: '下载日志',
                  })}
                </Typography.Link>
                {formatMessage({
                  id: 'src.component.Task.component.ImportModal.997B48CD',
                  defaultMessage: '查看。',
                })}
              </Typography.Text>
            ),

            duration: null,
          });
        }
        setReloadSign((prev) => prev + 1);
      },
      handleError: (error: any) => {
        notification.error({
          message: formatMessage({
            id: 'src.component.Task.component.ImportModal.853B74F5',
            defaultMessage: '导出错误',
          }),
          description: error.message,
        });
        setReloadSign((prev) => prev + 1);
      },
      startNotification: (taskId: number, ids: number[]) => {
        const notificationId = `${taskId}`;
        notification.open({
          key: notificationId,
          message: formatMessage({
            id: 'src.component.Task.component.ImportModal.A4299354',
            defaultMessage: '导入定时任务',
          }),
          description: formatMessage(
            {
              id: 'src.component.Task.component.ImportModal.AD74A1C1',
              defaultMessage: '{idsLength} 个定时任务正在导入中...',
            },
            { idsLength: ids?.length },
          ),
          icon: <LoadingOutlined style={{ color: '#108ee9' }} />,
          duration: null,
        });
        return notificationId;
      },
    },
  };

  const config = {
    api: {
      fetchStatus: (taskId: string) => taskInfo?.api?.(taskId),
      submit: (params: IScheduleTaskImportRequest) => taskInfo?.submitApi?.(params),
    },
    isTaskCompleted: (result: IImportTaskResult[]) => taskInfo?.isTaskCompleted?.(result),
    notificationHandler: taskInfo?.notificationHandler,
    asyncTaskType: AsyncTaskType.import,
  };

  const asyncTask = createTaskManager(config);
  const { run: debounceSubmit } = useDebounceFn(
    async (
      scheduleTaskImportRequest: IScheduleTaskImportRequest,
      previewData: IImportScheduleTaskView[],
    ) => {
      setIsSubmitImport(true);
      try {
        const res = await config?.api?.submit(scheduleTaskImportRequest);
        if (res) {
          await asyncTask.startTask(res, config?.asyncTaskType, {
            taskId: res,
            ids: previewData,
          });
        }
      } finally {
        setIsSubmitImport(false);
      }
    },
    { wait: 300 },
  );

  return {
    isSubmitImport,
    debounceSubmit,
  };
};
