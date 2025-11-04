import { formatMessage } from '@/util/intl';
import { Drawer, Radio, Spin, Tag, Tooltip } from 'antd';
import styles from './index.less';
import { ScheduleDetailType } from '@/d.ts/schedule';
import OperationRecord from '../OperationRecord';
import ScheduleExecuteRecord from '../ScheduleExecuteRecord';
import { IScheduleRecord, ScheduleRecordParameters } from '@/d.ts/schedule';
import ScheduleActions from '../Actions/ScheduleActions';
import ScheduleStatusLabel from '@/component/Schedule/components/ScheduleStatusLabel';
import { SchedulePageMode } from '../../interface';
import { ReactComponent as ProcessingSvg } from '@/svgr/processing.svg';
import Icon from '@ant-design/icons';

interface TaskContentProps {
  taskContent?: React.ReactNode;
  isLoading: boolean;
  detailType: ScheduleDetailType;
  schedule: IScheduleRecord<ScheduleRecordParameters>;
}
const TaskContent: React.FC<TaskContentProps> = (props) => {
  const { isLoading, taskContent, detailType, schedule } = props;
  let content = null;

  switch (detailType) {
    case ScheduleDetailType.INFO:
      content = taskContent;
      break;
    case ScheduleDetailType.EXECUTE_RECORD:
      content = <OperationRecord schedule={schedule} />;
      break;
    case ScheduleDetailType.OPERATION_RECORD:
      content = <ScheduleExecuteRecord schedule={schedule} />;
      break;
  }

  return (
    <div className={styles.content}>
      <Spin spinning={isLoading}>{content}</Spin>
    </div>
  );
};

interface ICommonScheduleDetailModalProps {
  width?: number;
  isSplit?: boolean;
  theme?: string;
  downloadUrl?: string;
  visible: boolean;
  onClose: () => void;
  taskContent?: React.ReactNode;
  isLoading: boolean;
  detailType: ScheduleDetailType;
  onDetailTypeChange: (type: ScheduleDetailType) => void;
  schedule: IScheduleRecord<ScheduleRecordParameters>;
  enabledAction: boolean;
  onReloadList?: () => void;
  onApprovalVisible?: (status: boolean, id: number) => void;
  mode?: SchedulePageMode;
  hideCloneButton?: boolean;
}

const CommonTaskDetailModal: React.FC<ICommonScheduleDetailModalProps> = (props) => {
  const {
    visible,
    width = 800,
    onClose,
    onDetailTypeChange,
    detailType,
    taskContent,
    schedule,
    enabledAction,
    onApprovalVisible,
    mode,
    hideCloneButton,
  } = props;

  return (
    <Drawer
      open={visible}
      width={width}
      onClose={onClose}
      destroyOnClose={true}
      title={
        <div className={styles.title}>
          <div className={styles.detailName}>
            <div className={styles.scheduleName}>{schedule?.scheduleName}</div>
            <Tooltip title={schedule?.scheduleName} overlayClassName={styles.scheduleNameTooltip}>
              <div className={styles.ml4}>
                {formatMessage({
                  id: 'src.component.Schedule.components.ScheduleDetailModal.70F9BD00',
                  defaultMessage: '详情',
                })}
              </div>
            </Tooltip>
          </div>
          {schedule?.approvable && (
            <Tag color="blue" className={styles.ProcessingTag}>
              <Icon component={ProcessingSvg} style={{ fontSize: 14, marginRight: '4px' }} />
              {formatMessage({
                id: 'src.component.Schedule.components.ScheduleDetailModal.25896752',
                defaultMessage: '审批中',
              })}
            </Tag>
          )}
        </div>
      }
      rootClassName={styles.detailDrawer}
    >
      <div className={styles.header}>
        <Radio.Group
          value={detailType}
          onChange={(e) => {
            props.onDetailTypeChange(e.target.value);
          }}
        >
          <Radio.Button value={ScheduleDetailType.INFO} key={ScheduleDetailType.INFO}>
            {formatMessage({
              id: 'src.component.Schedule.components.ScheduleDetailModal.8AB0B420',
              defaultMessage: '基本信息',
            })}
          </Radio.Button>
          <Radio.Button
            value={ScheduleDetailType.EXECUTE_RECORD}
            key={ScheduleDetailType.EXECUTE_RECORD}
          >
            {formatMessage({
              id: 'src.component.Schedule.components.ScheduleDetailModal.54AC6A9F',
              defaultMessage: '执行记录',
            })}
          </Radio.Button>
          <Radio.Button
            value={ScheduleDetailType.OPERATION_RECORD}
            key={ScheduleDetailType.OPERATION_RECORD}
          >
            {formatMessage({
              id: 'src.component.Schedule.components.ScheduleDetailModal.05126891',
              defaultMessage: '操作记录',
            })}
          </Radio.Button>
        </Radio.Group>
        <ScheduleStatusLabel status={schedule?.status} />
      </div>
      <TaskContent
        isLoading={props.isLoading}
        detailType={detailType}
        taskContent={taskContent}
        schedule={schedule}
      />

      {enabledAction && (
        <div className={styles.tools}>
          <ScheduleActions
            schedule={schedule}
            onReloadList={props?.onReloadList}
            onClose={onClose}
            isDetailModal={true}
            onApprovalVisible={onApprovalVisible}
            mode={mode}
            hideCloneButton={hideCloneButton}
          />
        </div>
      )}
    </Drawer>
  );
};

export default CommonTaskDetailModal;
