import { IScheduleRecord, ScheduleRecordParameters } from '@/d.ts/schedule';
import Icon from '@ant-design/icons';
import { ReactComponent as TargetDatabaseSvg } from '@/svgr/targetDatabase.svg';
import { ReactComponent as SourceDatabaseSvg } from '@/svgr/sourceDatabase.svg';
import { ReactComponent as DatabaseSvg } from '@/svgr/database2.svg';
import { Divider, Popover, Tooltip } from 'antd';
import styles from './index.less';
import ConnectionPopover from '@/component/ConnectionPopover';
import { IScheduleTaskExecutionDetail, scheduleTask, SubTaskParameters } from '@/d.ts/scheduleTask';
import classNames from 'classnames';

interface IProps {
  record:
    | IScheduleRecord<ScheduleRecordParameters>
    | scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>;
  isSubTaskList?: boolean;
}
const DatabaseColumn: React.FC<IProps> = (props) => {
  const { record, isSubTaskList } = props;
  return (
    <div className={isSubTaskList ? styles.subTaskDatabaseColumn : styles.scheduleDatabaseColumn}>
      {record?.attributes?.databaseInfo && (
        <Popover
          destroyOnHidden
          title={
            <ConnectionPopover
              showRemark
              database={record?.attributes?.databaseInfo}
              connection={record?.attributes?.databaseInfo?.dataSource}
            />
          }
        >
          <div className={styles.dbColumnsEllipsis}>
            <Icon component={DatabaseSvg} className={styles.mr4} />
            {record?.attributes?.databaseInfo?.name ?? '-'}
          </div>
        </Popover>
      )}
      {record?.attributes?.sourceDataBaseInfo && (
        <Popover
          destroyOnHidden
          title={
            <ConnectionPopover
              showRemark
              database={record?.attributes?.sourceDataBaseInfo}
              connection={record?.attributes?.sourceDataBaseInfo?.dataSource}
            />
          }
        >
          <div
            className={classNames(styles.dbColumnsEllipsis, {
              [styles.mw110]: isSubTaskList && record?.attributes?.targetDataBaseInfo,
            })}
          >
            <Icon component={SourceDatabaseSvg} className={styles.mr4} />
            {record?.attributes?.sourceDataBaseInfo?.name ?? '-'}
          </div>
        </Popover>
      )}
      {record?.attributes?.sourceDataBaseInfo &&
        record?.attributes?.targetDataBaseInfo &&
        isSubTaskList && <Divider type="vertical" />}
      {record?.attributes?.targetDataBaseInfo && (
        <Popover
          destroyOnHidden
          title={
            <ConnectionPopover
              showRemark
              database={record?.attributes?.targetDataBaseInfo}
              connection={record?.attributes?.targetDataBaseInfo?.dataSource}
            />
          }
        >
          <div
            className={classNames(styles.dbColumnsEllipsis, {
              [styles.mw110]: isSubTaskList && record?.attributes?.sourceDataBaseInfo,
            })}
          >
            <Icon component={TargetDatabaseSvg} className={styles.mr4} />
            {record?.attributes?.targetDataBaseInfo?.name ?? '-'}
          </div>
        </Popover>
      )}
    </div>
  );
};

export default DatabaseColumn;
