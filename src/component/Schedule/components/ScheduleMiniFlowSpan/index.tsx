import React, { useEffect, useMemo, useState } from 'react';
import { TaskDetail, TaskRecordParameters } from '@/d.ts';
import { Button, Popover, Spin } from 'antd';
import MiniTaskFlow from '../MiniFlow';
import { getTaskDetail } from '@/common/network/task';
import { useRequest } from 'ahooks';
import { IScheduleRecord, ScheduleRecordParameters } from '@/d.ts/schedule';
import { operationTypeMap } from '../ScheduleExecuteRecord';
import { formatMessage } from '@/util/intl';

interface IProps {
  onDetail: () => void;
  record: IScheduleRecord<ScheduleRecordParameters>;
}
const ScheduleMiniFlowSpan: React.FC<IProps> = ({ onDetail, record }) => {
  const { candidateApprovers, approveInstanceId } = record;
  const candidateApproversName = candidateApprovers?.map((item) => item.name)?.join(', ');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const operationTypeDescription = useMemo(() => {
    return (
      <div style={{ margin: '6px 0px' }}>
        <span>
          {
            formatMessage({
              id: 'odc.component.CommonTaskDetailModal.FlowModal.ActionEvents',
              defaultMessage: '操作事件：',
            }) /*操作事件：*/
          }
        </span>
        <span>{operationTypeMap?.[record?.operationType]}</span>
      </div>
    );
  }, [record?.operationType]);

  return (
    <Popover
      zIndex={999}
      fresh={true}
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
      content={
        <div style={{ width: '300px', minHeight: '100px', minWidth: '200px' }}>
          {operationTypeDescription}
          <Content Id={approveInstanceId} onDetail={onDetail} visible={popoverOpen} />
        </div>
      }
    >
      <div
        style={{
          color: 'var(--text-color-secondary)',
          maxWidth: '134px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        审批中
        {candidateApproversName && `(${candidateApproversName})`}
      </div>
    </Popover>
  );
};

export default ScheduleMiniFlowSpan;

const Content = ({
  Id,
  onDetail,
  visible,
}: {
  Id: number;
  onDetail: () => void;
  visible: boolean;
}) => {
  const [task, setTask] = useState<TaskDetail<TaskRecordParameters>>();
  const { run: fetchTaskDetail, loading } = useRequest(getTaskDetail, {
    manual: true,
  });

  useEffect(() => {
    if (visible && Id) {
      initData();
    }
  }, [visible, Id]);

  const initData = async () => {
    const res = await fetchTaskDetail(Id);
    setTask(res);
  };

  return (
    <Spin spinning={loading}>
      {task && <MiniTaskFlow task={task} />}
      <Button type="link" onClick={onDetail}>
        查看详情
      </Button>
    </Spin>
  );
};
