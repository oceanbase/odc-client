import { IScheduleRecord, ScheduleRecordParameters } from '@/d.ts/schedule';
import Icon from '@ant-design/icons';
import { ReactComponent as TargetDatabaseSvg } from '@/svgr/targetDatabase.svg';
import { ReactComponent as SourceDatabaseSvg } from '@/svgr/sourceDatabase.svg';
import { ReactComponent as DatabaseSvg } from '@/svgr/database2.svg';
import { Tooltip } from 'antd';
import styles from './index.less';

interface IProps {
  record: IScheduleRecord<ScheduleRecordParameters>;
}
const DatabaseColumn: React.FC<IProps> = (props) => {
  const { record } = props;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      {record?.attributes?.databaseInfo && (
        <Tooltip title={record?.attributes?.databaseInfo?.name}>
          <div className={styles.dbColumnsEllipsis}>
            <Icon component={DatabaseSvg} className={styles.mr4} />
            {record?.attributes?.databaseInfo?.name ?? '-'}
          </div>
        </Tooltip>
      )}
      {record?.attributes?.sourceDataBaseInfo && (
        <Tooltip title={record?.attributes?.sourceDataBaseInfo?.name}>
          <div className={styles.dbColumnsEllipsis}>
            <Icon component={SourceDatabaseSvg} className={styles.mr4} />
            {record?.attributes?.sourceDataBaseInfo?.name ?? '-'}
          </div>
        </Tooltip>
      )}
      {record?.attributes?.targetDataBaseInfo && (
        <Tooltip title={record?.attributes?.targetDataBaseInfo?.name}>
          <div className={styles.dbColumnsEllipsis}>
            <Icon component={TargetDatabaseSvg} className={styles.mr4} />
            {record?.attributes?.targetDataBaseInfo?.name ?? '-'}
          </div>
        </Tooltip>
      )}
    </div>
  );
};

export default DatabaseColumn;
