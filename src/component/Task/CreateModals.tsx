import React from 'react';
import AlterDDLTaskCreateModal from './AlterDdlTask';
import AsyncTaskCreateModal from './AsyncTask';
import DataArchiveTaskCreateModal from './DataArchiveTask';
import DataClearTaskCreateModal from './DataClearTask';
import DataMockerTaskCreateModal from './DataMockerTask';
import ExportTaskCreateModal from './ExportTask';
import ImportTaskCreateModal from './ImportTask';
import PartitionTaskCreateModal from './PartitionTask';
import ResultSetExportTask from './ResultSetExportTask';
import ShadowSyncTaskCreateModal from './ShadowSyncTask';
import SQLPlanTaskCreateModal from './SQLPlanTask';

interface IProps {
  projectId?: number;
  theme?: string;
}

const CreateModals: React.FC<IProps> = (props) => {
  const { projectId, theme } = props;
  return (
    <>
      <AsyncTaskCreateModal projectId={projectId} theme={theme} />
      <DataMockerTaskCreateModal projectId={projectId} />
      <ExportTaskCreateModal projectId={projectId} />
      <ImportTaskCreateModal projectId={projectId} />
      <PartitionTaskCreateModal projectId={projectId} />
      <SQLPlanTaskCreateModal projectId={projectId} theme={theme} />
      <ShadowSyncTaskCreateModal projectId={projectId} />
      <DataArchiveTaskCreateModal projectId={projectId} />
      <DataClearTaskCreateModal projectId={projectId} />
      <AlterDDLTaskCreateModal projectId={projectId} />
      <ResultSetExportTask projectId={projectId} theme={theme} />
    </>
  );
};

export default CreateModals;
