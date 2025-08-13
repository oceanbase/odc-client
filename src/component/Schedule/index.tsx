import { ScheduleStatus, ScheduleType } from '@/d.ts/schedule';
import Content from './layout/Content';
import styles from './index.less';
import Sider from './layout/Sider';
import { useSearchParams } from '@umijs/max';
import login from '@/store/login';
import { toInteger } from 'lodash';
import { SchedulePageMode } from './interface';
import { useEffect } from 'react';

interface IProps {
  projectId?: number;
  mode?: SchedulePageMode;
}

const ScheduleManage: React.FC<IProps> = (props) => {
  const { projectId, mode = SchedulePageMode.COMMON } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultScheduleId = searchParams.get('scheduleId');
  const defaultScheduleType = searchParams.get('scheduleType') as ScheduleType;
  const defaultOrganizationId = searchParams.get('organizationId');
  const defaultSubTaskId = searchParams.get('subTaskId');
  const defaultScheduleStatus = searchParams.get('scheduleStatus');
  const currentOrganizationId = login.organizationId;
  const isOrganizationMatch = toInteger(defaultOrganizationId) === toInteger(currentOrganizationId);

  useEffect(() => {
    setTimeout(() => {
      searchParams.delete('scheduleId');
      searchParams.delete('scheduleType');
      searchParams.delete('organizationId');
      searchParams.delete('subTaskId');
      searchParams.delete('scheduleStatus');
      setSearchParams(searchParams);
    }, 100);
  }, []);

  return (
    <div className={styles.task}>
      <div className={styles.sider}>
        <Sider mode={mode} />
      </div>
      <Content
        defaultScheduleId={isOrganizationMatch ? toInteger(defaultScheduleId) : null}
        defaultScheduleType={defaultScheduleType}
        defaultSubTaskId={toInteger(defaultSubTaskId)}
        defaultScheduleStatus={defaultScheduleStatus as ScheduleStatus}
        mode={mode}
        projectId={projectId}
      />
    </div>
  );
};

export default ScheduleManage;
