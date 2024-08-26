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

import TaskLog from '@/component/Task/component/Log';
import StatusLabel from '@/component/Task/component/Status';
import type { ITaskDetailModalProps } from '@/component/Task/interface';
import { TaskDetailType } from '@/component/Task/interface';
import { ITaskResult, TaskDetail, TaskRecordParameters, TaskType } from '@/d.ts';
import login from '@/store/login';
import { formatMessage } from '@/util/intl';
import { ShareAltOutlined } from '@ant-design/icons';
import { Drawer, message, Radio, Spin } from 'antd';
import copy from 'copy-to-clipboard';
import React from 'react';
import { isCycleTask } from '../../helper';
import styles from './index.less';
import TaskExecuteRecord from './TaskExecuteRecord';
import TaskFlow from './TaskFlow';
import TaskInfo, { ITaskInfoProps } from './TaskInfo';
import TaskOperationRecord from './TaskOperationRecord';
import TaskProgress from './TaskProgress';
import TaskRecord from './TaskRecord';
import TaskResult from './TaskResult';
const TaskContent: React.FC<ICommonTaskDetailModalProps> = (props) => {
  const {
    task,
    subTasks,
    opRecord,
    result,
    isSplit,
    isLoading,
    log,
    logType,
    detailType,
    getItems,
    theme,
    taskContent,
    hasFlow,
    onLogTypeChange,
    onReload,
  } = props;
  let content = null;
  switch (detailType) {
    case TaskDetailType.INFO:
      content = taskContent ? (
        taskContent
      ) : (
        <TaskInfo
          task={task}
          taskItems={getItems?.(task, result, hasFlow, theme)}
          isSplit={isSplit}
        />
      );

      break;
    case TaskDetailType.LOG:
      content = (
        <TaskLog
          log={log}
          logType={logType}
          isLoading={isLoading}
          downloadUrl={result?.fullLogDownloadUrl}
          onLogTypeChange={onLogTypeChange}
        />
      );

      break;
    case TaskDetailType.RESULT:
      content = <TaskResult result={result} />;
      break;
    case TaskDetailType.FLOW:
      content = <TaskFlow task={task} result={result} />;
      break;
    case TaskDetailType.RECORD:
      content = <TaskRecord task={task} />;
      break;
    case TaskDetailType.EXECUTE_RECORD:
      content = <TaskExecuteRecord task={task} subTasks={subTasks} onReload={onReload} />;
      break;
    case TaskDetailType.OPERATION_RECORD:
      content = <TaskOperationRecord opRecord={opRecord} onReload={onReload} />;
      break;
    case TaskDetailType.PROGRESS:
      content = <TaskProgress task={task} theme={theme} />;
      break;
    default:
      break;
  }
  return (
    <div className={styles.content}>
      <Spin spinning={isLoading}>{content}</Spin>
    </div>
  );
};
interface ICommonTaskDetailModalProps extends ITaskDetailModalProps {
  width?: number;
  isSplit?: boolean;
  theme?: string;
  getItems?: (
    task: TaskDetail<TaskRecordParameters>,
    result: ITaskResult,
    hasFlow: boolean,
    theme: string,
  ) => ITaskInfoProps['taskItems'];
  taskContent?: React.ReactNode;
}
const CommonTaskDetailModal: React.FC<ICommonTaskDetailModalProps> = function (props) {
  const {
    width = 750,
    visible,
    task,
    taskTools,
    detailType,
    detailId,
    hasFlow,
    theme,
    onClose,
  } = props;
  // 任务信息
  const hasInfo = [
    TaskType.ASYNC,
    TaskType.IMPORT,
    TaskType.EXPORT,
    TaskType.DATAMOCK,
    TaskType.PARTITION_PLAN,
    TaskType.SHADOW,
    TaskType.SQL_PLAN,
    TaskType.ALTER_SCHEDULE,
    TaskType.DATA_ARCHIVE,
    TaskType.STRUCTURE_COMPARISON,
    TaskType.ONLINE_SCHEMA_CHANGE,
    TaskType.DATA_DELETE,
    TaskType.EXPORT_RESULT_SET,
    TaskType.APPLY_PROJECT_PERMISSION,
    TaskType.APPLY_DATABASE_PERMISSION,
    TaskType.APPLY_TABLE_PERMISSION,
    TaskType.MULTIPLE_ASYNC,
    TaskType.LOGICAL_DATABASE_CHANGE,
  ].includes(task?.type);
  // 任务日志
  const hasLog = [
    TaskType.ASYNC,
    TaskType.IMPORT,
    TaskType.EXPORT,
    TaskType.DATAMOCK,
    TaskType.PARTITION_PLAN,
    TaskType.SHADOW,
    TaskType.STRUCTURE_COMPARISON,
    TaskType.ALTER_SCHEDULE,
    TaskType.ONLINE_SCHEMA_CHANGE,
    TaskType.EXPORT_RESULT_SET,
    TaskType.APPLY_PROJECT_PERMISSION,
    TaskType.APPLY_DATABASE_PERMISSION,
    TaskType.APPLY_TABLE_PERMISSION,
    TaskType.LOGICAL_DATABASE_CHANGE,
  ].includes(task?.type);
  function onShare() {
    const url =
      location.origin +
      location.pathname +
      `#/task?taskId=${detailId}&taskType=${task?.type}&organizationId=${login.organizationId}`;
    copy(url);
    message.success(
      formatMessage({
        id: 'odc.src.component.Task.component.CommonDetailModal.Replication',
        defaultMessage: '复制成功',
      }), //'复制成功'
    );
  }
  return (
    <Drawer
      open={visible}
      width={width}
      onClose={onClose}
      title={
        <div className={styles.title}>
          {formatMessage({
            id: 'odc.component.CommonTaskDetailModal.TaskDetails',
            defaultMessage: '任务详情',
          })}
          {login.isPrivateSpace() ? (
            <div></div>
          ) : (
            <a className={styles.share} onClick={onShare}>
              {
                formatMessage({
                  id: 'odc.src.component.Task.component.CommonDetailModal.Share',
                  defaultMessage: '分享',
                }) /*
          分享  */
              }

              <ShareAltOutlined />
            </a>
          )}
        </div>
      }
      /* 任务详情 */ destroyOnClose
      className={styles.detailDrawer}
    >
      <div className={styles.header}>
        <Radio.Group
          value={detailType}
          onChange={(e) => {
            props.onDetailTypeChange(e.target.value);
          }}
        >
          {hasInfo && (
            <Radio.Button value={TaskDetailType.INFO} key={TaskDetailType.INFO}>
              {
                formatMessage({
                  id: 'odc.component.CommonTaskDetailModal.TaskInformation',
                  defaultMessage: '任务信息',
                })

                /* 任务信息 */
              }
            </Radio.Button>
          )}

          {hasFlow && (
            <Radio.Button value={TaskDetailType.FLOW} key={TaskDetailType.FLOW}>
              {
                formatMessage({
                  id: 'odc.component.CommonTaskDetailModal.TaskFlow',
                  defaultMessage: '任务流程',
                })

                /*任务流程*/
              }
            </Radio.Button>
          )}

          {task?.type === TaskType.PARTITION_PLAN && (
            <Radio.Button value={TaskDetailType.RECORD} key={TaskDetailType.RECORD}>
              {
                formatMessage({
                  id: 'odc.component.CommonTaskDetailModal.AssociatedRecords',
                  defaultMessage: '关联记录',
                })
                /*关联记录*/
              }
            </Radio.Button>
          )}

          {isCycleTask(task?.type) && (
            <>
              <Radio.Button
                value={TaskDetailType.EXECUTE_RECORD}
                key={TaskDetailType.EXECUTE_RECORD}
              >
                {
                  formatMessage({
                    id: 'odc.component.CommonTaskDetailModal.ExecutionRecord',
                    defaultMessage: '执行记录',
                  }) /*执行记录*/
                }
              </Radio.Button>
              <Radio.Button
                value={TaskDetailType.OPERATION_RECORD}
                key={TaskDetailType.OPERATION_RECORD}
              >
                {
                  formatMessage({
                    id: 'odc.component.CommonTaskDetailModal.OperationRecord',
                    defaultMessage: '操作记录',
                  }) /*操作记录*/
                }
              </Radio.Button>
            </>
          )}
          {[
            TaskType.ONLINE_SCHEMA_CHANGE,
            TaskType.MULTIPLE_ASYNC,
            TaskType.LOGICAL_DATABASE_CHANGE,
          ]?.includes(task?.type) && (
            <Radio.Button value={TaskDetailType.PROGRESS} key={TaskDetailType.PROGRESS}>
              {
                formatMessage({
                  id: 'odc.component.CommonTaskDetailModal.ExecutionRecord',
                  defaultMessage: '执行记录',
                }) /*执行记录*/
              }
            </Radio.Button>
          )}

          {task?.type === TaskType.ASYNC && (
            <Radio.Button value={TaskDetailType.RESULT} key={TaskDetailType.RESULT}>
              {
                formatMessage({
                  id: 'odc.component.CommonTaskDetailModal.ExecutionResult',
                  defaultMessage: '执行结果',
                })

                /*执行结果*/
              }
            </Radio.Button>
          )}

          {task?.type === TaskType.ASYNC && (
            <Radio.Button value={TaskDetailType.RECORD} key={TaskDetailType.RECORD}>
              {
                formatMessage({
                  id: 'odc.component.CommonDetailModal.RollbackTicket',
                  defaultMessage: '回滚工单',
                }) /*回滚工单*/
              }
            </Radio.Button>
          )}

          {hasLog && (
            <Radio.Button value={TaskDetailType.LOG} key={TaskDetailType.LOG}>
              {
                formatMessage({
                  id: 'odc.component.CommonTaskDetailModal.TaskLog',
                  defaultMessage: '任务日志',
                })

                /* 任务日志 */
              }
            </Radio.Button>
          )}
        </Radio.Group>
        <StatusLabel status={task?.status} progress={task?.progressPercentage} type={task?.type} />
      </div>
      <TaskContent {...props} />
      <div className={styles.tools}>{taskTools}</div>
    </Drawer>
  );
};
export default CommonTaskDetailModal;
