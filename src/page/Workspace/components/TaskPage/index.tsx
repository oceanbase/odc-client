import { formatMessage } from '@/util/intl';
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

import { TaskTypeMap } from '@/component/Task/component/TaskTable';
import Content from '@/component/Task/Content';
import { TaskPageType } from '@/d.ts';
import styles from './index.less';
export const getTitleByParams = (params: { type: TaskPageType }) => {
  const { type } = params;
  let title = '';
  switch (type) {
    case TaskPageType.ALL: {
      title = formatMessage({
        id: 'odc.src.page.Workspace.components.TaskPage.WorkOrderAllWorkOrders',
        defaultMessage: '工单-所有工单',
      }); //'工单-所有工单'
      break;
    }
    case TaskPageType.CREATED_BY_CURRENT_USER: {
      title = formatMessage({
        id: 'odc.src.page.Workspace.components.TaskPage.WorkersIInitiated',
        defaultMessage: '工单-我发起的',
      }); //'工单-我发起的'
      break;
    }
    case TaskPageType.APPROVE_BY_CURRENT_USER: {
      title = formatMessage({
        id: 'odc.src.page.Workspace.components.TaskPage.WorkOrderWaitingForMe',
        defaultMessage: '工单-待我审批的',
      }); //'工单-待我审批的'
      break;
    }
    default: {
      title = formatMessage(
        {
          id: 'odc.src.page.Workspace.components.TaskPage.WorkOrderTaskTypeMaptype',
          defaultMessage: '工单-{TaskTypeMapType}',
        },
        {
          TaskTypeMapType: TaskTypeMap[type],
        },
      ); //`工单-${TaskTypeMap[type]}`
      break;
    }
  }
  return title;
};
interface IProps {
  pageKey: TaskPageType;
}
const TaskPage: React.FC<IProps> = (props) => {
  return (
    <div className={styles.task}>
      <Content pageKey={props?.pageKey} isMultiPage />
    </div>
  );
};
export default TaskPage;
