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

import React, { useContext, useEffect } from 'react';
import ResourceTree from '..';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { useRequest } from 'ahooks';
import { listDatabases } from '@/common/network/database';
import TreeTitle from './Title';

interface IProps {
  openSelectPanel?: () => void;
}

const DatabaseTree: React.FC<IProps> = function ({ openSelectPanel }) {
  const { selectDatasourceId, selectProjectId, projectList, datasourceList } = useContext(
    ResourceTreeContext,
  );
  const selectProject = projectList?.find((p) => p.id == selectProjectId);
  const selectDatasource = datasourceList?.find((d) => d.id == selectDatasourceId);

  const { data: db, reset, run: _runListDatabases, loading: dbLoading } = useRequest(
    listDatabases,
    {
      manual: true,
    },
  );

  async function initDatabase(projectId: number, datasourceId: number) {
    await _runListDatabases(projectId, datasourceId, 1, 99999, null, null, null, true);
  }

  async function reloadDatabase() {
    await initDatabase(selectProjectId, selectDatasourceId);
  }

  useEffect(() => {
    if (selectDatasourceId || selectProjectId) {
      initDatabase(selectProjectId, selectDatasourceId);
    }
  }, [selectDatasourceId, selectProjectId]);
  function ProjectRender() {
    return (
      <ResourceTree
        stateId={'project-' + selectProjectId}
        reloadDatabase={() => reloadDatabase()}
        databaseFrom={'project'}
        title={<TreeTitle project={selectProject} />}
        databases={db?.contents}
        onTitleClick={() => openSelectPanel()}
        enableFilter
        showTip
      />
    );
  }
  function DatasourceRender() {
    return (
      <ResourceTree
        stateId={'datasource-' + selectDatasourceId}
        reloadDatabase={() => reloadDatabase()}
        databaseFrom={'datasource'}
        title={<TreeTitle datasource={selectDatasource} />}
        databases={db?.contents}
        onTitleClick={() => openSelectPanel()}
      />
    );
  }
  return selectDatasourceId ? DatasourceRender() : ProjectRender();
};

export default DatabaseTree;
