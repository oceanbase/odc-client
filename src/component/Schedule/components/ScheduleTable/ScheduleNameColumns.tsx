import { IScheduleRecord, ScheduleDetailType, ScheduleRecordParameters } from '@/d.ts/schedule';
import classNames from 'classnames';
import { Tooltip } from 'antd';
import login from '@/store/login';
import dayjs from 'dayjs';
import { SchedulePageMode } from '@/component/Schedule/interface';
import styles from './index.less';

interface IProps {
  record: IScheduleRecord<ScheduleRecordParameters>;
  delList: number[];
  mode?: SchedulePageMode;
  onDetailVisible: (
    schedule: IScheduleRecord<ScheduleRecordParameters>,
    visible: boolean,
    detailType?: ScheduleDetailType,
  ) => void;
}
const ScheduleName: React.FC<IProps> = (props) => {
  const { record, delList, onDetailVisible, mode } = props;

  return (
    <div className={styles.scheduleNameColumn}>
      <div className={styles.columns}>
        <Tooltip title={record?.scheduleName} overlayClassName={styles.scheduleNameTooltip}>
          <span
            className={classNames(styles.scheduleName, {
              [styles.hoverLink]: !delList?.includes(record?.scheduleId),
            })}
            onClick={() => {
              if (delList?.includes(record?.scheduleId)) return;
              onDetailVisible(record, true);
            }}
          >
            {record?.scheduleName ?? '-'}
          </span>
        </Tooltip>
      </div>
      <div className={styles.columns}>
        <span
          className={styles.hoverLink}
          onClick={() => {
            onDetailVisible(record, true);
          }}
        >
          #{record?.scheduleId}
        </span>
        ·
        <Tooltip
          title={
            <>
              <div>创建人：{record?.creator?.name}</div>
              <div>账号：{record?.creator?.accountName}</div>
            </>
          }
          placement="bottom"
        >
          <div className={styles.creator}>
            <span>{record?.creator?.name}</span>
          </div>
        </Tooltip>
        <span>创建于 {dayjs(record?.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
        {login.isPrivateSpace() || mode === SchedulePageMode.PROJECT ? (
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

export default ScheduleName;
