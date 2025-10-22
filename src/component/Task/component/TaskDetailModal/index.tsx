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
import { ITaskResult, TaskDetail, TaskRecordParameters, TaskType, CommonTaskLogType } from '@/d.ts';
import login from '@/store/login';
import { formatMessage } from '@/util/intl';
import { ShareAltOutlined } from '@ant-design/icons';
import { Drawer, message, Radio, Spin, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import TaskFlow from './TaskFlow';
import TaskInfo, { ITaskInfoProps } from './TaskInfo';
import TaskProgress from './TaskProgress';
import TaskRecord from './TaskRecord';
import TaskResult from './TaskResult';
import { listDatabases } from '@/common/network/database';
import { useRequest } from 'ahooks';
import { IDatabase } from '@/d.ts/database';

const TaskContent: React.FC<ICommonTaskDetailModalProps> = (props) => {
  const {
    task,
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
    case TaskDetailType.PROGRESS:
      content = <TaskProgress task={task} theme={theme} onReload={onReload} />;
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
const TaskDetailModal: React.FC<ICommonTaskDetailModalProps> = function (props) {
  const {
    width = 950,
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
    TaskType.SHADOW,
    TaskType.ALTER_SCHEDULE,
    TaskType.STRUCTURE_COMPARISON,
    TaskType.ONLINE_SCHEMA_CHANGE,
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
    TaskType.SHADOW,
    TaskType.STRUCTURE_COMPARISON,
    TaskType.ALTER_SCHEDULE,
    TaskType.ONLINE_SCHEMA_CHANGE,
    TaskType.EXPORT_RESULT_SET,
    TaskType.APPLY_PROJECT_PERMISSION,
    TaskType.APPLY_DATABASE_PERMISSION,
    TaskType.APPLY_TABLE_PERMISSION,
    TaskType.LOGICAL_DATABASE_CHANGE,
    TaskType.MULTIPLE_ASYNC,
  ].includes(task?.type);

  return (
    <Drawer
      open={visible}
      width={width}
      onClose={onClose}
      title={
        <div className={styles.title}>
          <div className={styles.detailName}>
            <div className={styles.taskName}>{task?.description}</div>
            <Tooltip title={task?.description} overlayClassName={styles.scheduleNameTooltip}>
              <div className={styles.ml4}>详情</div>
            </Tooltip>
          </div>
        </div>
      }
      /* 任务详情 */ destroyOnClose
      rootClassName={styles.detailDrawer}
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
              基本信息
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
export default TaskDetailModal;
