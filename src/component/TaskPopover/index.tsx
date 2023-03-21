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
  enabledCreate?: boolean;
  showAllSchemaTaskType?: boolean;
}> = inject('taskStore')(
  observer(function (props) {
    const { taskStore, enabledCreate, showAllSchemaTaskType } = props;
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
              taskStore.setTaskCreateEnabled(enabledCreate);
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
