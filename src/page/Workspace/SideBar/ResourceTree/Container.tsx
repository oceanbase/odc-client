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

import { UserStore } from '@/store/login';
import { inject, observer } from 'mobx-react';
import { useContext, useEffect, useRef, useState } from 'react';
import ResourceTreeContext from '../../context/ResourceTreeContext';
import tracert from '@/util/tracert';
import { Spin } from 'antd';
import DatabaseTree from './DatabaseTree';
import TreeStateStore, { ITreeStateCache } from './TreeStateStore';
import { ModalStore } from '@/store/modal';
import { useParams, useSearchParams } from '@umijs/max';
import { openNewSQLPage } from '@/store/helper/page';

export default inject(
  'userStore',
  'modalStore',
)(
  observer(function ResourceTreeContainer({
    userStore,
    modalStore,
  }: {
    userStore: UserStore;
    modalStore: ModalStore;
  }) {
    const resourcetreeContext = useContext(ResourceTreeContext);
    const { pollingDatabase } = resourcetreeContext;
    const cacheRef = useRef<ITreeStateCache>({});

    const { datasourceId: tempDatasourceId } = useParams<{
      tabKey: string;
      datasourceId: string;
    }>();
    const [searchParams, setSearchParams] = useSearchParams();

    const [loading, setLoading] = useState(true);

    async function initData() {
      await resourcetreeContext.reloadDatabaseList();
      resourcetreeContext.reloadDatasourceList();
      resourcetreeContext.reloadProjectList();
      setLoading(false);
      pollingDatabase();
      resolveParams();
    }

    const resolveParams = async () => {
      const databaseId = searchParams.get('databaseId');
      const projectId = searchParams.get('projectId');
      if (databaseId && !projectId) {
        // 打开sql窗口
        openNewSQLPage(parseInt(databaseId));
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('databaseId');
        setSearchParams(newSearchParams, { replace: true });
      }
    };

    useEffect(() => {
      initData();
      tracert.expo('a3112.b41896.c330988');
    }, []);

    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 20 }}>
          <Spin />
        </div>
      );
    }
    return (
      <TreeStateStore.Provider
        value={{
          cache: cacheRef?.current,
        }}
      >
        <DatabaseTree />
      </TreeStateStore.Provider>
    );
  }),
);
