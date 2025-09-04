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

import Content from './layout/Content';
import styles from './index.less';
import Sider from './layout/Sider';
import { TaskPageMode } from './interface';
import CreateModals from '@/component/Task/modals/CreateModals';

interface IProps {
  projectId?: number;
  mode: TaskPageMode;
}
const TaskManagerPage: React.FC<IProps> = (props) => {
  const { projectId, mode } = props;

  return (
    <div className={styles.task}>
      <div className={styles.sider}>
        <Sider mode={mode} />
      </div>
      <Content mode={mode} projectId={projectId} />
      <CreateModals projectId={projectId} theme={'white'} />
    </div>
  );
};
export default TaskManagerPage;
