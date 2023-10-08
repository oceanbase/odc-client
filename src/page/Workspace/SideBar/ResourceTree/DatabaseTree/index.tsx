import React, { useContext, useEffect } from 'react';
import ResourceTree from '..';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { useRequest } from 'ahooks';
import { listDatabases } from '@/common/network/database';
import { getDataSourceGroupByProject } from '@/common/network/connection';
import login from '@/store/login';
import { Space } from 'antd';
import RiskLevelLabel from '@/component/RiskLevelLabel';
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
