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

import Sider from '@/component/Task/Sider';
import { formatMessage } from '@/util/intl';
import React, { useEffect } from 'react';
import SideTabs from '../components/SideTabs';
import styles from './index.less';
import tracert from '@/util/tracert';

interface IProps {}

const Task: React.FC<IProps> = () => {
  useEffect(() => {
    tracert.expo('a3112.b41896.c330990');
  }, []);
  return (
    <SideTabs
      tabs={[
        {
          title: formatMessage({ id: 'odc.SideBar.Task.Ticket' }), //工单
          key: 'task',
          actions: [],
          render() {
            return <Sider className={styles.taskSider} isPage={true} />;
          },
        },
      ]}
    />
  );
};

export default Task;
