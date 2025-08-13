import { Operation } from '@/d.ts';
import { Drawer, Space, Radio, Button } from 'antd';
import { useState } from 'react';
import { formatMessage } from '@/util/intl';
import ChangeDetail from './ChangeDetail';
import ApprovalRecord from './ApprovalRecord';
import { IScheduleRecord, ScheduleRecordParameters } from '@/d.ts/schedule';
import ApprovalModal from '@/component/Task/component/ApprovalModal';
import { useLoop } from '@/util/hooks/useLoop';

enum ExecuteRecordDetailType {
  DETAIL = 'DETAIL',
  CHANGE_DETAIL = 'CHANGE_DETAIL',
}

interface ScheduleExecuteRecordDetailProps {
  visible: boolean;
  onClose: () => void;
  operation: Operation;
  schedule: IScheduleRecord<ScheduleRecordParameters>;
  onReload: () => void;
}

const ScheduleExecuteRecordDetail: React.FC<ScheduleExecuteRecordDetailProps> = (props) => {
  const { visible, onClose, operation, schedule, onReload } = props;
  const [detailType, setDetailType] = useState(ExecuteRecordDetailType.DETAIL);

  const [approvalVisible, setApprovalVisible] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(false);
  const handleApprovalVisible = (approvalStatus: boolean = false, visible: boolean = false) => {
    setApprovalVisible(visible);
    setApprovalStatus(approvalStatus);
  };

  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      title="操作记录详情"
      width={1000}
      footer={
        schedule?.approvable && (
          <Space style={{ flexDirection: 'row-reverse', width: '100%' }}>
            <Button
              onClick={() => {
                handleApprovalVisible(false, true);
              }}
            >
              {formatMessage({
                id: 'odc.src.component.Task.component.CommonDetailModal.Reject',
                defaultMessage: '拒绝',
              })}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                handleApprovalVisible(true, true);
              }}
            >
              {formatMessage({
                id: 'odc.src.component.Task.component.CommonDetailModal.Pass',
                defaultMessage: '通过',
              })}
            </Button>
          </Space>
        )
      }
    >
      <div>
        <Radio.Group value={detailType} onChange={(e) => setDetailType(e.target.value)}>
          <Radio.Button value={ExecuteRecordDetailType.DETAIL} key={ExecuteRecordDetailType.DETAIL}>
            {formatMessage({
              id: 'src.component.Task.component.CommonDetailModal.3D4F5474',
              defaultMessage: '审批记录',
            })}
          </Radio.Button>
          <Radio.Button
            value={ExecuteRecordDetailType.CHANGE_DETAIL}
            key={ExecuteRecordDetailType.CHANGE_DETAIL}
          >
            {formatMessage({
              id: 'src.component.Task.component.CommonDetailModal.5C706BA6',
              defaultMessage: '变更详情',
            })}
          </Radio.Button>
        </Radio.Group>
      </div>

      {detailType === ExecuteRecordDetailType.DETAIL && (
        <ApprovalRecord id={operation?.flowInstanceId} operationType={operation?.type} />
      )}
      {detailType === ExecuteRecordDetailType.CHANGE_DETAIL && (
        <ChangeDetail scheduleId={operation?.scheduleId} scheduleChangeLogId={operation?.id} />
      )}
      <ApprovalModal
        id={schedule?.approveInstanceId}
        zIndex={1500}
        visible={approvalVisible}
        approvalStatus={approvalStatus}
        onReload={() => {
          onClose?.();
          onReload?.();
        }}
        onCancel={() => {
          handleApprovalVisible(false);
        }}
      />
    </Drawer>
  );
};

export default ScheduleExecuteRecordDetail;
