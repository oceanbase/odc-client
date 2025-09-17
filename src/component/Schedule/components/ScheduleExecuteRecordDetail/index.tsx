import { Operation } from '@/d.ts';
import { Drawer, Space, Radio, Button, Modal, message } from 'antd';
import { useState } from 'react';
import { formatMessage } from '@/util/intl';
import ChangeDetail from './ChangeDetail';
import ApprovalRecord from './ApprovalRecord';
import { IOperationTypeRole, IScheduleRecord, ScheduleRecordParameters } from '@/d.ts/schedule';
import ApprovalModal from '@/component/Task/component/ApprovalModal';
import useOperationPermissions from '@/util/hooks/useOperationPermissions';
import { widthPermission } from '@/util/utils';
import { ScheduleTextMap } from '@/constant/schedule';
import { revokeTask } from '@/common/network/task';

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
  const { IRoles } = useOperationPermissions({
    currentUserResourceRoles:
      schedule?.currentUserResourceRoles || schedule?.project?.currentUserResourceRoles || [],
    approvable: schedule?.approvable,
    createrId: schedule?.creator?.id,
  });

  const haveRevokePermission = widthPermission(
    (hasPermission) => hasPermission,
    [IOperationTypeRole.CREATOR, IOperationTypeRole.PROJECT_OWNER, IOperationTypeRole.PROJECT_DBA],
    IRoles,
  )();

  const handleRevoke = async () => {
    const { approveInstanceId } = schedule;
    const scheduleTypeText = ScheduleTextMap[schedule?.type];
    Modal.confirm({
      title: `确定要撤销此${scheduleTypeText}审批吗`,
      content: <div>审批撤销后，作业将进入终止态</div>,
      cancelText: formatMessage({
        id: 'odc.TaskManagePage.component.TaskTools.Cancel',
        defaultMessage: '取消',
      }), //取消
      okText: '确定',
      centered: true,
      onOk: async () => {
        const res = await revokeTask(approveInstanceId);
        if (res) {
          message.success('撤销成功');
          onClose?.();
          onReload?.();
        }
      },
    });
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
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
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

            {haveRevokePermission && <Button onClick={handleRevoke}>撤销审批</Button>}
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
