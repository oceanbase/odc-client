/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
import ApplyPermissionCreateModal from './ApplyPermission';
import ApplyDatabasePermissionCreateModal from './ApplyDatabasePermission';
import ApplyTablePermissionCreateModal from './ApplyTablePermission';
import StructureComparisonTask from './StructureComparisonTask';
import MutipleAsyncTask from './MutipleAsyncTask';
import LogicDatabaseAsyncTask from './LogicDatabaseAsyncTask';

interface IProps {
  projectId?: number;
  theme?: 'dark' | 'white';
}

const CreateModals: React.FC<IProps> = (props) => {
  const { projectId, theme } = props;
  return (
    <>
      <AsyncTaskCreateModal projectId={projectId} theme={theme} />
      <DataMockerTaskCreateModal projectId={projectId} />
      <ExportTaskCreateModal projectId={projectId} />
      <ImportTaskCreateModal projectId={projectId} />
      <PartitionTaskCreateModal projectId={projectId} theme={theme} />
      <SQLPlanTaskCreateModal projectId={projectId} theme={theme} />
      <ShadowSyncTaskCreateModal projectId={projectId} />
      <DataArchiveTaskCreateModal projectId={projectId} />
      <DataClearTaskCreateModal projectId={projectId} />
      <ApplyPermissionCreateModal projectId={projectId} />
      <AlterDDLTaskCreateModal projectId={projectId} theme={theme} />
      <ResultSetExportTask projectId={projectId} theme={theme} />
      <ApplyDatabasePermissionCreateModal projectId={projectId} />
      <ApplyTablePermissionCreateModal projectId={projectId} />
      <StructureComparisonTask projectId={projectId} />
      <MutipleAsyncTask projectId={projectId} theme={theme} />
      <LogicDatabaseAsyncTask projectId={projectId} />
    </>
  );
};

export default CreateModals;
