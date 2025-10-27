import { ScheduleChangeStatus } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { CheckCircleFilled, LoadingOutlined, ExclamationCircleFilled } from '@ant-design/icons';

const statusMap = {
  [ScheduleChangeStatus.PREPARING]: {
    icon: <LoadingOutlined style={{ color: '#1890ff' }} />,
    text: formatMessage({
      id: 'odc.component.TaskDetailDrawer.status.Waiting',
      defaultMessage: '等待中',
    }),
  },

  [ScheduleChangeStatus.SUCCESS]: {
    icon: <CheckCircleFilled style={{ color: 'var(--icon-green-color)' }} />,
    text: formatMessage({
      id: 'src.component.Task.component.TaskDetailModal.42742344',
      defaultMessage: '审批通过',
    }),
  },

  [ScheduleChangeStatus.FAILED]: {
    icon: <ExclamationCircleFilled style={{ color: 'var(--function-red6-color)' }} />,
    text: formatMessage({
      id: 'odc.component.TaskDetailDrawer.status.Failed',
      defaultMessage: '失败',
    }),
  },

  [ScheduleChangeStatus.APPROVING]: {
    icon: <ExclamationCircleFilled style={{ color: 'var(--icon-blue-color)' }} />,
    text: formatMessage({
      id: 'odc.component.TaskStatus.Approving',
      defaultMessage: '审批中',
    }),
  },

  [ScheduleChangeStatus.CHANGING]: {
    icon: <LoadingOutlined style={{ color: '#F5222D' }} />,
    text: formatMessage({
      id: 'src.component.Task.component.CommonDetailModal.833A559A',
      defaultMessage: '改变中',
    }),
  },
  [ScheduleChangeStatus.APPROVE_CANCELED]: {
    icon: <ExclamationCircleFilled style={{ color: 'var(--function-red6-color)' }} />,
    text: formatMessage({
      id: 'src.component.Task.component.TaskDetailModal.7BAD8A45',
      defaultMessage: '审批撤销',
    }),
  },
  [ScheduleChangeStatus.APPROVE_EXPIRED]: {
    icon: <ExclamationCircleFilled style={{ color: 'var(--function-red6-color)' }} />,
    text: formatMessage({
      id: 'src.component.Task.component.TaskDetailModal.BA303120',
      defaultMessage: '审批过期',
    }),
  },
  [ScheduleChangeStatus.APPROVE_REJECTED]: {
    icon: <ExclamationCircleFilled style={{ color: 'var(--function-red6-color)' }} />,
    text: formatMessage({
      id: 'src.component.Task.component.TaskDetailModal.9D255593',
      defaultMessage: '审批不通过',
    }),
  },
};

export default function StatusItem(props: { status: ScheduleChangeStatus }) {
  const statusInfo = statusMap[props.status];
  if (!statusInfo) {
    return null;
  }
  return (
    <span>
      {statusMap[props.status].icon}
      <span style={{ marginLeft: 5 }}>{statusMap[props.status].text}</span>
    </span>
  );
}
