import { IScheduleRecord, ScheduleDetailType, ScheduleRecordParameters } from '@/d.ts/schedule';
import Icon from '@ant-design/icons';
import classNames from 'classnames';
import { Tooltip } from 'antd';
import { ReactComponent as UserSvg } from '@/svgr/user.svg';
import dayjs from 'dayjs';
import styles from './index.less';

interface IProps {
  record: IScheduleRecord<ScheduleRecordParameters>;
  delList: number[];
  onDetailVisible: (
    schedule: IScheduleRecord<ScheduleRecordParameters>,
    visible: boolean,
    detailType?: ScheduleDetailType,
  ) => void;
}
const ScheduleName: React.FC<IProps> = (props) => {
  const { record, delList, onDetailVisible } = props;

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
            <Icon
              style={{ color: 'var(--icon-color-disable)', marginRight: 5 }}
              component={UserSvg}
            />
            <span>{record?.creator?.name}</span>
          </div>
        </Tooltip>
        <span>创建于 {dayjs(record?.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>·
        <div className={styles.project}>
          <Tooltip title={'所属项目：' + record?.project?.name} placement="bottom">
            {record?.project?.name}
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ScheduleName;
