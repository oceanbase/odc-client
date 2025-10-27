import { formatMessage } from '@/util/intl';
import {
  IScheduleTaskExecutionDetail,
  scheduleTask,
  ScheduleTaskDetailType,
  SubTaskParameters,
} from '@/d.ts/scheduleTask';
import { Drawer, Radio, Spin } from 'antd';
import styles from '../ScheduleDetailModal/index.less';
import ScheduleTaskActions from '../Actions/ScheduleTaskActions';
import ScheduleTaskStatusLabel from '../ScheduleTaskStatusLabel';
import type { ILog } from '@/component/Task/component/Log';
import { ITaskResult, CommonTaskLogType, Operation } from '@/d.ts';
import ScheduleResult from '../ScheduleResult';
import TaskLog from '@/component/Task/component/Log';

interface TaskContentProps {
  taskContent?: React.ReactNode;
  isLoading: boolean;
  detailType: ScheduleTaskDetailType;
  subTask: scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>;
  log: ILog;
  result: ITaskResult;
  logType: CommonTaskLogType;
  handleLogTypeChange: (type: CommonTaskLogType) => void;
  opRecord: Operation[];
}
const TaskContent: React.FC<TaskContentProps> = (props) => {
  const {
    isLoading,
    taskContent,
    detailType,
    subTask,
    log,
    result,
    logType,
    handleLogTypeChange,
    opRecord,
  } = props;
  let content = null;

  switch (detailType) {
    case ScheduleTaskDetailType.INFO:
      content = taskContent;
      break;
    case ScheduleTaskDetailType.EXECUTE_RESULT:
      content = <ScheduleResult subTask={subTask} />;
      break;
    // case ScheduleTaskDetailType.OPERATION_RECORD:
    //   content = <TaskOperationRecord opRecord={opRecord} onReload={() => {}} />;
    //   break;
    case ScheduleTaskDetailType.LOG:
      content = (
        <TaskLog
          log={log}
          isLoading={false}
          logType={logType}
          onLogTypeChange={handleLogTypeChange}
        />
      );

      break;
  }

  return (
    <div className={styles.content}>
      <Spin spinning={isLoading}>{content}</Spin>
    </div>
  );
};

interface ICommonSubTaskDetailModalProps {
  width?: number;
  isSplit?: boolean;
  theme?: string;
  downloadUrl?: string;
  visible: boolean;
  onClose: () => void;
  taskContent?: React.ReactNode;
  isLoading: boolean;
  detailType: ScheduleTaskDetailType;
  onDetailTypeChange: (type: ScheduleTaskDetailType) => void;
  enabledAction: boolean;
  onReloadList?: () => void;
  subTask: scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>;
  log: ILog;
  result: ITaskResult;
  logType: CommonTaskLogType;
  opRecord: Operation[];
  handleLogTypeChange: (type: CommonTaskLogType) => void;
  loading?: boolean;
}

const SubTaskDetailModal: React.FC<ICommonSubTaskDetailModalProps> = (props) => {
  const {
    visible,
    width = 1100,
    onClose,
    onDetailTypeChange,
    detailType,
    taskContent,
    subTask,
    log,
    result,
    logType,
    handleLogTypeChange,
    opRecord,
    loading,
  } = props;

  return (
    <Drawer
      open={visible}
      width={width}
      onClose={onClose}
      rootClassName={styles.detailDrawer}
      destroyOnHidden
      loading={loading}
      title={
        <div className={styles.title}>
          <span>
            {formatMessage(
              {
                id: 'src.component.Schedule.components.SubTaskDetailModal.E3DE0DB0',
                defaultMessage: '#{subTaskId} 执行详情',
              },
              { subTaskId: subTask?.id },
            )}
          </span>
        </div>
      }
    >
      <div className={styles.header}>
        <Radio.Group
          value={detailType}
          onChange={(e) => {
            onDetailTypeChange?.(e.target.value);
          }}
        >
          <Radio.Button value={ScheduleTaskDetailType.INFO} key={ScheduleTaskDetailType.INFO}>
            {formatMessage({
              id: 'src.component.Schedule.components.SubTaskDetailModal.4F7A9991',
              defaultMessage: '基本信息',
            })}
          </Radio.Button>
          <Radio.Button
            value={ScheduleTaskDetailType.EXECUTE_RESULT}
            key={ScheduleTaskDetailType.EXECUTE_RESULT}
          >
            {formatMessage({
              id: 'src.component.Schedule.components.SubTaskDetailModal.0251DA45',
              defaultMessage: '执行结果',
            })}
          </Radio.Button>
          {/* <Radio.Button
             value={ScheduleTaskDetailType.OPERATION_RECORD}
             key={ScheduleTaskDetailType.OPERATION_RECORD}
            >
             操作记录
            </Radio.Button> */}
          <Radio.Button value={ScheduleTaskDetailType.LOG} key={ScheduleTaskDetailType.LOG}>
            {formatMessage({
              id: 'src.component.Schedule.components.SubTaskDetailModal.E143FD68',
              defaultMessage: '任务日志',
            })}
          </Radio.Button>
        </Radio.Group>
        <ScheduleTaskStatusLabel status={subTask?.status} />
      </div>
      <TaskContent
        isLoading={props.isLoading}
        detailType={detailType}
        taskContent={taskContent}
        subTask={subTask}
        log={log}
        result={result}
        logType={logType}
        opRecord={opRecord}
        handleLogTypeChange={handleLogTypeChange}
      />

      <div className={styles.tools}>
        <ScheduleTaskActions
          subTask={subTask}
          onReloadList={props?.onReloadList}
          isDetailModal
          scheduleId={subTask?.scheduleId}
          handleView={() => {}}
        />
      </div>
    </Drawer>
  );
};

export default SubTaskDetailModal;
