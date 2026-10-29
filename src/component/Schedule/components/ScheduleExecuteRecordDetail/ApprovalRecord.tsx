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
