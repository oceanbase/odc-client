import styles from '@/component/Task/index.less';
import type { TaskRecord, TaskRecordParameters } from '@/d.ts';
import { Tooltip } from 'antd';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { formatMessage } from '@/util/intl';
import { TaskPageMode } from '../../interface';
import login from '@/store/login';

interface IProps {
  record: TaskRecord<TaskRecordParameters>;
  onDetailVisible: (record: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
  mode?: TaskPageMode;
}

const TaskNameColumn = (props: IProps) => {
  const { record, onDetailVisible, mode } = props;
  const roleNames = record?.creator?.roleNames?.join(' | ');

  return (
    <div className={styles.taskNameColumn}>
      <div className={styles.columns}>
        <Tooltip title={record?.description} overlayClassName={styles.taskNameTooltip}>
          <span
            className={classNames(styles.taskName, styles.hoverLink)}
            onClick={() => {
              onDetailVisible(record as TaskRecord<TaskRecordParameters>, true);
            }}
          >
            {record?.description}
          </span>
        </Tooltip>
      </div>
      <div className={styles.columns}>
        <span
          className={styles.hoverLink}
          onClick={() => {
            onDetailVisible(record as TaskRecord<TaskRecordParameters>, true);
          }}
        >
          #{record?.id}
        </span>
        ·
        <Tooltip
          title={
            <>
              <div>创建人：{record?.creator?.name}</div>
              <div>账号：{record?.creator?.accountName}</div>
              {roleNames && (
                <div className={styles.ellipsis} title={roleNames}>
                  {
                    formatMessage({
                      id: 'odc.component.UserPopover.Role',
                      defaultMessage: '角色：',
                    }) /*角色：*/
                  }{' '}
                  {roleNames}
                </div>
              )}
            </>
          }
          placement="bottom"
        >
          <div className={styles.creator}>
            <span>{record?.creator?.name}</span>
          </div>
        </Tooltip>
        <span>创建于 {dayjs(record?.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
        {login.isPrivateSpace() || mode === TaskPageMode.PROJECT ? (
          ''
        ) : (
          <>
            ·
            <div className={styles.project}>
              <Tooltip title={'所属项目：' + record?.project?.name} placement="bottom">
                {record?.project?.name}
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskNameColumn;
