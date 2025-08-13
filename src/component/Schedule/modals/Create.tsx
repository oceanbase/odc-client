import useURLParams from '@/util/hooks/useUrlParams';
import { useEffect, useState } from 'react';
import { ScheduleType } from '@/d.ts/schedule';
import DataArchive from './DataArchive/Create';
import PartitionPlan from './PartitionPlan/Create';
import SQLPlan from './SQLPlan/Create';
import DataClear from './DataClear/Create';
import classNames from 'classnames';
import { CreateScheduleContext } from '../context/createScheduleContext';
import { IDatabase } from '@/d.ts/database';
import { SchedulePageMode } from '../interface';
import { useParams } from '@umijs/max';
import { toInteger } from 'lodash';

interface IProps {
  type?: ScheduleType;
  mode?: SchedulePageMode;
}
const CreatePage: React.FC<IProps> = ({ type: propsType, mode = SchedulePageMode.COMMON }) => {
  const { getParam } = useURLParams();
  const type = propsType || (getParam('type') as ScheduleType);
  const [createType, setCreateType] = useState<ScheduleType>();
  const [createScheduleDatabase, setCreateScheduleDatabase] = useState<IDatabase>();
  const { id: projectId } = useParams<{ id: string }>();
  useEffect(() => {
    if (type && Object.values(ScheduleType).includes(type)) {
      setCreateType(type);
    } else {
      setCreateType(ScheduleType.DATA_ARCHIVE);
    }
  }, [type]);

  return (
    <>
      <CreateScheduleContext.Provider
        value={{
          createScheduleDatabase,
          setCreateScheduleDatabase,
        }}
      >
        {createType === ScheduleType.DATA_ARCHIVE && (
          <DataArchive mode={mode} projectId={projectId ? toInteger(projectId) : null} />
        )}
        {createType === ScheduleType.DATA_DELETE && (
          <DataClear mode={mode} projectId={projectId ? toInteger(projectId) : null} />
        )}
        {createType === ScheduleType.PARTITION_PLAN && (
          <PartitionPlan mode={mode} projectId={projectId ? toInteger(projectId) : null} />
        )}
        {createType === ScheduleType.SQL_PLAN && (
          <SQLPlan mode={mode} projectId={projectId ? toInteger(projectId) : null} />
        )}
      </CreateScheduleContext.Provider>
    </>
  );
};

export default CreatePage;
