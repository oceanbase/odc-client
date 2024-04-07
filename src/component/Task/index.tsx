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

import { TaskExecStrategy, TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import Content from './Content';
import styles from './index.less';
import Sider from './Sider';
import CreateModals from './CreateModals';
import { useSearchParams } from '@umijs/max';
import login from '@/store/login';
import { toInteger } from 'lodash';
export const getTaskExecStrategyMap = (type: TaskType) => {
  switch (type) {
    case TaskType.DATA_ARCHIVE:
    case TaskType.DATA_DELETE:
    case TaskType.PARTITION_PLAN:
      return {
        [TaskExecStrategy.TIMER]: formatMessage({
          id: 'odc.src.component.Task.CycleExecution',
        }), //'周期执行'
        [TaskExecStrategy.CRON]: formatMessage({
          id: 'odc.src.component.Task.CycleExecution.1',
        }), //'周期执行'
        [TaskExecStrategy.DAY]: formatMessage({
          id: 'odc.src.component.Task.CycleExecution.2',
        }), //'周期执行'
        [TaskExecStrategy.MONTH]: formatMessage({
          id: 'odc.src.component.Task.CycleExecution.3',
        }), //'周期执行'
        [TaskExecStrategy.WEEK]: formatMessage({
          id: 'odc.src.component.Task.CycleExecution.4',
        }), //'周期执行'
        [TaskExecStrategy.START_NOW]: formatMessage({
          id: 'odc.src.component.Task.ExecuteImmediately',
        }), //'立即执行'
        [TaskExecStrategy.START_AT]: formatMessage({
          id: 'odc.src.component.Task.TimedExecution',
        }), //'定时执行'
      };
    case TaskType.STRUCTURE_COMPARISON: {
      return {
        [TaskExecStrategy.AUTO]: formatMessage({ id: 'src.component.Task.9B79BD20' }), //'自动执行'
        [TaskExecStrategy.MANUAL]: formatMessage({ id: 'src.component.Task.0B2B1D60' }), //'手动执行'
      };
    }
    default:
      return {
        [TaskExecStrategy.AUTO]: formatMessage({
          id: 'odc.components.TaskManagePage.ExecuteNow',
        }),
        //立即执行
        [TaskExecStrategy.MANUAL]: formatMessage({
          id: 'odc.components.TaskManagePage.ManualExecution',
        }),
        //手动执行
        [TaskExecStrategy.TIMER]: formatMessage({
          id: 'odc.components.TaskManagePage.ScheduledExecution',
        }), //定时执行
      };
  }
};

interface IProps {
  projectId?: number;
  inProject?: boolean;
}
const TaskManaerPage: React.FC<IProps> = (props) => {
  const { projectId, inProject } = props;
  const [search] = useSearchParams();
  const defaultTaskId = search.get('taskId');
  const defaultTaskType = search.get('taskType') as TaskType;
  const defaultOrganizationId = search.get('organizationId');
  const currentOrganizationId = login.organizationId;
  const isOrganizationMatch = toInteger(defaultOrganizationId) === toInteger(currentOrganizationId);
  return (
    <>
      <div className={styles.task}>
        <div className={styles.sider}>
          <Sider />
        </div>
        <Content
          projectId={projectId}
          inProject={inProject}
          defaultTaskType={defaultTaskType}
          defaultTaskId={isOrganizationMatch ? toInteger(defaultTaskId) : null}
        />

        <CreateModals projectId={projectId} theme="white" />
      </div>
    </>
  );
};
export default TaskManaerPage;
