import { ITransferDataObjStatus } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  LoadingOutlined,
  StopFilled,
} from '@ant-design/icons';

const statusMap = {
  [ITransferDataObjStatus.INITIAL]: {
    icon: <LoadingOutlined style={{ color: '#1890ff' }} />,
    text: formatMessage({ id: 'odc.component.TaskDetailDrawer.status.Waiting' }),
  },

  [ITransferDataObjStatus.SUCCESS]: {
    icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
    text: formatMessage({
      id: 'odc.component.TaskDetailDrawer.status.Complete',
    }),
  },

  [ITransferDataObjStatus.FAILURE]: {
    icon: <ExclamationCircleFilled style={{ color: '#f5222d' }} />,
    text: formatMessage({ id: 'odc.component.TaskDetailDrawer.status.Failed' }),
  },

  [ITransferDataObjStatus.KILLED]: {
    icon: <StopFilled style={{ color: '#F5222D' }} />,
    text: formatMessage({
      id: 'odc.component.TaskDetailDrawer.status.Terminated',
    }),
  },

  [ITransferDataObjStatus.UNKNOWN]: {
    icon: <StopFilled style={{ color: '#F5222D' }} />,
    text: formatMessage({ id: 'odc.component.TaskDetailDrawer.status.Unknown' }),
  },
};

export default statusMap;

export function StatusItem(props: { status: ITransferDataObjStatus }) {
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
