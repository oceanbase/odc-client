import { TaskStore } from '@/store/task';
import { isClient } from '@/util/env';
import { Badge } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect } from 'react';

interface IProps {
  taskStore?: TaskStore;
}

const MessageCount: React.FC<IProps> = (props) => {
  const { taskStore } = props;
  const _count = taskStore.pendingApprovalInstanceIds?.length ?? 0;
  const showZero = !isClient();
  const count = !isClient() ? _count : 0;

  useEffect(() => {
    props.taskStore?.getTaskMetaInfo();
  }, []);

  return (
    <Badge showZero={showZero} count={count} overflowCount={100} offset={[-8, 5]}>
      {props.children}
    </Badge>
  );
};

export default inject('taskStore')(observer(MessageCount));
