/*
 * Copyright 2024 OceanBase
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

import { openTasksPage } from '@/store/helper/page';
import type { TaskStore } from '@/store/task';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Badge } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect } from 'react';
import HeaderBtn from '../HeaderBtn';
import styles from './index.less';

const TaskPopover: React.FC<{
  taskStore?: TaskStore;
  showAllSchemaTaskType?: boolean;
}> = inject('taskStore')(
  observer(function (props) {
    const { taskStore, showAllSchemaTaskType } = props;
    const count = taskStore.pendingApprovalInstanceIds?.length ?? 0;
    const badgeProps = {
      showZero: !isClient(),
      count: !isClient() ? count : 0,
    };
    useEffect(() => {
      taskStore.getTaskMetaInfo();
    }, []);

    return (
      <>
        <Badge
          {...badgeProps}
          overflowCount={100}
          offset={[5, 16]}
          className={`${styles.badge} ${!count && styles.empty}`}
        >
          <HeaderBtn
            onClick={() => {
              openTasksPage();
              taskStore.showAllSchemaTaskType = showAllSchemaTaskType;
            }}
          >
            {
              formatMessage({
                id: 'odc.component.TaskPopover.TaskCenter',
              }) /*任务中心*/
            }
          </HeaderBtn>
        </Badge>
      </>
    );
  }),
);

export default TaskPopover;
