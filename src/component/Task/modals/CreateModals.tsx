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
import DataMockerTaskCreateModal from './DataMockerTask';
import ExportTaskCreateModal from './ExportTask';
import ImportTaskCreateModal from './ImportTask';
import ResultSetExportTask from './ResultSetExportTask';
import ShadowSyncTaskCreateModal from './ShadowSyncTask';
import ApplyPermissionCreateModal from './ApplyPermission';
import ApplyDatabasePermissionCreateModal from './ApplyDatabasePermission';
import ApplyTablePermissionCreateModal from './ApplyTablePermission';
import StructureComparisonTask from './StructureComparisonTask';
import MutipleAsyncTask from './MutipleAsyncTask';
import LogicDatabaseAsyncTask from './LogicDatabaseAsyncTask';

interface IProps {
  projectId?: number;
  theme?: 'dark' | 'white';
  reloadList?: () => void;
}

const CreateModals: React.FC<IProps> = (props) => {
  const { projectId, theme, reloadList } = props;
  return (
    <>
      <AsyncTaskCreateModal projectId={projectId} theme={theme} reloadList={reloadList} />
      <DataMockerTaskCreateModal projectId={projectId} reloadList={reloadList} />
      <ExportTaskCreateModal projectId={projectId} reloadList={reloadList} />
      <ImportTaskCreateModal projectId={projectId} reloadList={reloadList} />
      <ShadowSyncTaskCreateModal projectId={projectId} reloadList={reloadList} />
      <ApplyPermissionCreateModal projectId={projectId} reloadList={reloadList} />
      <AlterDDLTaskCreateModal projectId={projectId} theme={theme} />
      <ResultSetExportTask projectId={projectId} theme={theme} reloadList={reloadList} />
      <ApplyDatabasePermissionCreateModal projectId={projectId} reloadList={reloadList} />
      <ApplyTablePermissionCreateModal projectId={projectId} reloadList={reloadList} />
      <StructureComparisonTask projectId={projectId} reloadList={reloadList} />
      <MutipleAsyncTask projectId={projectId} theme={theme} reloadList={reloadList} />
      <LogicDatabaseAsyncTask projectId={projectId} theme={theme} reloadList={reloadList} />
    </>
  );
};

export default CreateModals;
