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

import { TaskType } from '@/d.ts';
import login from '@/store/login';
import { useSearchParams } from '@umijs/max';
import { toInteger } from 'lodash';
import Content from './container/Content';
import styles from './index.less';
import Sider from './container/Sider';

interface IProps {
  projectId?: number;
  inProject?: boolean;
}
const TaskManagerPage: React.FC<IProps> = (props) => {
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
          <Sider inProject={inProject} />
        </div>
        <Content
          projectId={projectId}
          inProject={inProject}
          defaultTaskType={defaultTaskType}
          defaultTaskId={isOrganizationMatch ? toInteger(defaultTaskId) : null}
        />
      </div>
    </>
  );
};
export default TaskManagerPage;
