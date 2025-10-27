import { getTaskDetail } from '@/common/network/task';
import { TaskOperationType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Space, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import TaskFlow from '@/component/Task/component/TaskDetailModal/TaskFlow';
import { operationTypeMap } from '../ScheduleExecuteRecord';
import { useRequest } from 'ahooks';
import { ODCRiskLevelLabel } from '@/component/RiskLevelLabel';

interface IProps {
  id: number;
  operationType: TaskOperationType;
}
const FlowModal: React.FC<IProps> = function (props) {
  const { id, operationType } = props;
  const [task, setTask] = useState(null);

  const { loading, run } = useRequest(getTaskDetail, {
    manual: true,
  });

  const getTask = async function (id) {
    const data = await run(id);
    setTask(data);
  };
  useEffect(() => {
    if (id) {
      getTask(id);
    }
  }, [id]);
  return (
    <>
      <div style={{ marginTop: '12px' }}>
        <span>
          {
            formatMessage({
              id: 'odc.component.CommonTaskDetailModal.FlowModal.ActionEvents',
              defaultMessage: '操作事件：',
            }) /*操作事件：*/
          }
        </span>
        <span>{operationTypeMap?.[operationType]}</span>
      </div>
      <div style={{ margin: '12px 0px 12px 0px', display: 'flex', alignItems: 'center' }}>
        <span>
          {formatMessage({
            id: 'src.component.Schedule.components.ScheduleExecuteRecordDetail.68A84F2D',
            defaultMessage: '风险等级：',
          })}
        </span>
        <ODCRiskLevelLabel iconMode levelMap level={task?.riskLevel?.level} />
      </div>
      <Spin spinning={loading}>{task && <TaskFlow task={task} />}</Spin>
    </>
  );
};
export default FlowModal;
