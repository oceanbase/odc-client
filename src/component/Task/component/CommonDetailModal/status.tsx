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
    icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
    text: formatMessage({
      id: 'odc.component.TaskDetailDrawer.status.Complete',
      defaultMessage: '完成',
    }),
  },

  [ScheduleChangeStatus.FAILED]: {
    icon: <ExclamationCircleFilled style={{ color: '#f5222d' }} />,
    text: formatMessage({
      id: 'odc.component.TaskDetailDrawer.status.Failed',
      defaultMessage: '失败',
    }),
  },

  [ScheduleChangeStatus.APPROVING]: {
    icon: <ExclamationCircleFilled style={{ color: '#F5222D' }} />,
    text: formatMessage({
      id: 'odc.component.TaskStatus.Approving',
      defaultMessage: '审批中',
    }),
  },

  [ScheduleChangeStatus.CHANGING]: {
    icon: <LoadingOutlined style={{ color: '#F5222D' }} />,
    text: '改变中',
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
