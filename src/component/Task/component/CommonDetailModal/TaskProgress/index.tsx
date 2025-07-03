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
} from '@/d.ts';
import { TaskStore } from '@/store/task';
import { UserStore } from '@/store/login';
import { isLogicalDatabase } from '@/util/database';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { message } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { flatArray } from '../../../MutipleAsyncTask/CreateModal/helper';
import { TaskDetailContext } from '../../../TaskDetailContext';
import { getColumnsByTaskType } from './colums';
import styles from './index.less';
import TaskProgressDrawer from './TaskProgressDrawer';
import TaskProgressHeader from './TaskProgressHeader';
import ProgressDetailsModal from './ProgressDetailsModal';
import { ProjectRole } from '@/d.ts/project';

interface IProps {
  taskStore?: TaskStore;
  userStore?: UserStore;
  task: TaskDetail<TaskRecordParameters>;
  theme?: string;
  onReload: () => void;
}
const TaskProgress: React.FC<IProps> = (props) => {
  // #region ------------------------- props or state -------------------------
  const { handleDetailVisible: _handleDetailVisible, setState } = useContext(TaskDetailContext);
  const { task, theme, taskStore, onReload, userStore } = props;
  const [subTasks, setSubTasks] = useState([]);
  const [databases, setDatabases] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [progressModalOpen, setProgressModalOpen] = useState<boolean>(false);
  const { run: loadData } = useRequest(
    async () => {
      const res = await getSubTask(task.id);
      if (task?.type === TaskType.MULTIPLE_ASYNC) {
        const sortDb = flatArray(
          (task as TaskDetail<IMultipleAsyncTaskParams>)?.parameters?.orderedDatabaseIds,
        );
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
        setSubTasks(res?.contents);
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

  const columns = getColumnsByTaskType(
    task?.type,
    {
      handleDetailVisible,
      handleMultipleAsyncOpen,
      handleSwapTable,
      handleProgressDetailVisible,
    },
    task.status,
    haveOperationPermission,
  );

  return (
    <>
      <TaskProgressHeader
        subTasks={subTasks}
        pendingExectionDatabases={pendingExectionDatabases}
        isLogicalDb={isLogicalDatabase(task?.database)}
      />
      <DisplayTable
        className={styles.subTaskTable}
        rowKey="id"
        columns={columns}
        dataSource={subTasks}
        disablePagination
        scroll={null}
      />
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
    </>
  );
};
export default inject('taskStore', 'userStore')(observer(TaskProgress));
