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
  isShowApprovableInfo: boolean;
  isShowFLowPopover: boolean;
}
const ScheduleMiniFlowSpan: React.FC<IProps> = (props) => {
  const { onDetail, record, isShowApprovableInfo, isShowFLowPopover } = props;
  const { candidateApprovers, approveInstanceId } = record;
  const candidateApproversName = candidateApprovers?.map((item) => item.name)?.join(', ');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const operationTypeDescription = useMemo(() => {
    if (!record?.operationType) {
      return null;
    }
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
      destroyOnHidden
      content={
        isShowFLowPopover ? (
          <div style={{ width: '300px', minHeight: '100px', minWidth: '200px' }}>
            {operationTypeDescription}
            <Content Id={approveInstanceId} onDetail={onDetail} visible={popoverOpen} />
          </div>
        ) : null
      }
    >
      <div
        style={{
          width: 'max-content',
          maxWidth: '100%',
        }}
      >
        {props.children}
        {isShowApprovableInfo && (
          <div
            style={{
              color: 'var(--text-color-secondary)',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {formatMessage({
              id: 'src.component.Schedule.components.ScheduleMiniFlowSpan.EB2B586A',
              defaultMessage: '审批中',
            })}

            {candidateApproversName && `(${candidateApproversName})`}
          </div>
        )}
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
        {formatMessage({
          id: 'src.component.Schedule.components.ScheduleMiniFlowSpan.4F597A2D',
          defaultMessage: '查看详情',
        })}
      </Button>
    </Spin>
  );
};
