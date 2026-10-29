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
import { SchedulePageMode } from './interface';

interface IProps {
  projectId?: number;
  mode?: SchedulePageMode;
}

const ScheduleManage: React.FC<IProps> = (props) => {
  const { projectId, mode = SchedulePageMode.COMMON } = props;

  return (
    <div className={styles.schedule}>
      <div className={styles.sider}>
        <Sider mode={mode} />
      </div>
      <Content mode={mode} projectId={projectId} />
    </div>
  );
};

export default ScheduleManage;
