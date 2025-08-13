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

import { getSubTask, getTaskDetail, swapTableName } from '@/common/network/task';
import DisplayTable from '@/component/DisplayTable';
import {
  IMultipleAsyncTaskParams,
  TaskDetail,
  TaskPageType,
  TaskRecordParameters,
  TaskType,
  sqlExecutionResultMap,
} from '@/d.ts';
import { TaskStore } from '@/store/task';
import { UserStore } from '@/store/login';
import { isLogicalDatabase } from '@/util/database';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { message } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import { flatArray } from '@/util/utils';
import { TaskDetailContext } from '@/component/Task/context/TaskDetailContext';
import { getColumnsByTaskType } from './colums';
import styles from './index.less';
import TaskProgressDrawer from './TaskProgressDrawer';
import TaskProgressHeader from './TaskProgressHeader';
import ProgressDetailsModal from './ProgressDetailsModal';
import { ProjectRole } from '@/d.ts/project';
import TaskExecuteModal from '../TaskExecuteModal';
import CommonTable from '@/component/CommonTable';
import { IDatabase } from '@/d.ts/database';
import { CommonTableMode } from '@/component/CommonTable/interface';
import { skipPhysicalSqlExecute, stopPhysicalSqlExecute } from '@/common/network/logicalDatabase';

interface IProps {
  taskStore?: TaskStore;
  userStore?: UserStore;
  task: TaskDetail<TaskRecordParameters>;
  theme?: string;
  onReload: () => void;
  databaseList: IDatabase[];
}
const TaskProgress: React.FC<IProps> = (props) => {
  // #region ------------------------- props or state -------------------------
  const { handleDetailVisible: _handleDetailVisible, setState } = useContext(TaskDetailContext);
  const { task, theme, taskStore, onReload, userStore, databaseList } = props;
  const [subTasks, setSubTasks] = useState([]);
  const [databases, setDatabases] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [progressModalOpen, setProgressModalOpen] = useState<boolean>(false);
  const [result, setResult] = useState<sqlExecutionResultMap>(null);
  const tableRef = useRef();

  const { run: loadData } = useRequest(
    async () => {
      const res = await getSubTask(task.id);
      if (task?.type === TaskType.MULTIPLE_ASYNC) {
        // @ts-ignore
        const dbMap = res?.contents?.[0]?.databaseChangingRecordList?.reduce((pre, cur) => {
          pre[cur?.database?.id] = cur;
          return pre;
        }, {});
        const rawData = [];
        let rawCount = 0;
        (task as TaskDetail<IMultipleAsyncTaskParams>)?.parameters?.orderedDatabaseIds?.map(
          (item, index) => {
            item?.forEach((_item_, _index_) => {
              rawData.push({
                id: rawCount,
                nodeIndex: index,
                rowSpan: item?.length,
                needMerge: _index_ === 0,
                ...dbMap[_item_],
              });
              rawCount++;
            });
          },
        );
        // @ts-ignore
        setSubTasks(rawData);
        const databases = flatArray(
          (task as TaskDetail<IMultipleAsyncTaskParams>)?.parameters?.orderedDatabaseIds,
        )?.map((item) => dbMap?.[item]);
        databases?.length && setDatabases(databases);
      } else if (task?.type === TaskType.LOGICAL_DATABASE_CHANGE) {
        const rawData = [];
        Object.values(res?.contents?.[0]?.sqlExecutionResultMap)?.forEach((item) => {
          const physicalDatabase = databaseList?.find(
            (i) => i?.id === item?.result?.physicalDatabaseId,
          );
          rawData.push({
            ...item,
            id: item?.result?.flowInstanceId,
            physicalDatabase: physicalDatabase,
          });
        });
        setSubTasks(rawData);
      } else {
        setSubTasks(res?.contents?.[0].tasks);
      }
    },
    {
      pollingInterval: 3000,
    },
  );
  const subTask = subTasks?.find((item) => item.id === detailId);
  const resultJson = JSON.parse(subTask?.resultJson ?? '{}');
  const parametersJson = JSON.parse(subTask?.parametersJson ?? '{}');
  const pendingExectionDatabases = databases?.filter((item) => !item?.status)?.length;
  const haveOperationPermission = useMemo(() => {
    return (
      task?.project?.currentUserResourceRoles?.some((item) =>
        [ProjectRole.DBA, ProjectRole.OWNER].includes(item),
      ) || userStore?.user?.id === task?.creator?.id
    );
  }, [task]);

  // #endregion

  // #region ------------------------- function -------------------------
  const handleSwapTable = async (id: number) => {
    const res = await swapTableName(id);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.src.component.Task.component.CommonDetailModal.StartTheNameSwitching',
        }), //'开始表名切换'
      );
      loadData();
    }
  };
  // 终止 & 查看
  const handleDetailVisible = (id: number) => {
    setDrawerOpen(true);
    setDetailId(id);
  };

  const handleMultipleAsyncOpen = async (taskId: number) => {
    const data = await getTaskDetail(taskId, true);
    setState({
      detailVisible: false,
    });
    taskStore.changeTaskPageType(TaskPageType.ASYNC);
    _handleDetailVisible(data, true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
  };

  const handleProgressDetailVisible = (id: number) => {
    setDetailId(id);
    setProgressModalOpen(true);
  };
  const handleProgressModalClose = () => {
    setProgressModalOpen(false);
  };
  // #endregion

  // #region ------------------------- hooks -------------------------
  useEffect(() => {
    loadData();
  }, []);
  // #endregion

  const handleLogicalDatabaseTaskStop = async (data: sqlExecutionResultMap) => {
    const res = await stopPhysicalSqlExecute(data?.id, data?.result?.physicalDatabaseId);
    if (res) {
      message.success(
        formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.1F689C8D',
          defaultMessage: '正在尝试终止',
        }),
      );
    } else {
      message.warning(
        formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.30E204EE',
          defaultMessage: '当前任务状态不支持终止',
        }),
      );
    }
  };
  const handleLogicalDatabaseTaskSkip = async (data: sqlExecutionResultMap) => {
    const res = await skipPhysicalSqlExecute(data?.id, data?.result?.physicalDatabaseId);
    if (res) {
      message.success(
        formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.B0CD0DE9',
          defaultMessage: '正在尝试跳过',
        }),
      );
    } else {
      message.warning(
        formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.6C8E11EA',
          defaultMessage: '当前任务状态不支持跳过',
        }),
      );
    }
  };

  const handleLogicalDatabaseAsyncModalOpen = (data: sqlExecutionResultMap) => {
    setResult(data);
    setModalOpen(true);
  };

  const columns = getColumnsByTaskType(
    task?.type,
    {
      handleDetailVisible,
      handleMultipleAsyncOpen,
      handleSwapTable,
      handleProgressDetailVisible,
      handleLogicalDatabaseTaskStop,
      handleLogicalDatabaseTaskSkip,
      handleLogicalDatabaseAsyncModalOpen,
    },
    task.status,
    haveOperationPermission,
  );

  return (
    <>
      <TaskProgressHeader
        subTasks={subTasks}
        pendingExectionDatabases={pendingExectionDatabases}
        isLogicalDb={task?.type === TaskType.LOGICAL_DATABASE_CHANGE}
      />
      {task?.type !== TaskType.LOGICAL_DATABASE_CHANGE && (
        <DisplayTable
          className={styles.subTaskTable}
          rowKey="id"
          columns={columns}
          dataSource={subTasks}
          disablePagination
          scroll={null}
        />
      )}
      {task?.type === TaskType.LOGICAL_DATABASE_CHANGE && (
        <CommonTable
          mode={CommonTableMode.SMALL}
          ref={tableRef}
          titleContent={null}
          showToolbar={false}
          enabledReload={false}
          tableProps={{
            className: styles.subTaskTable,
            columns,
            dataSource: subTasks,
            rowKey: 'id',
            scroll: {
              x: 650,
            },
            pagination: null,
          }}
          onLoad={async () => {}}
          onChange={async () => {}}
        />
      )}

      <TaskProgressDrawer
        drawerOpen={drawerOpen}
        task={task}
        theme={theme}
        resultJson={resultJson}
        handleClose={handleClose}
      />
      <ProgressDetailsModal
        modalOpen={progressModalOpen}
        handleClose={handleProgressModalClose}
        parametersJson={parametersJson}
        resultJson={resultJson}
      />
      <TaskExecuteModal modalOpen={modalOpen} setModalOpen={setModalOpen} data={result} />
    </>
  );
};
export default inject('taskStore', 'userStore')(observer(TaskProgress));
