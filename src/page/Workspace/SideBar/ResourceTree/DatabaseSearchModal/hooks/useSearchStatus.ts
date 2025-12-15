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

import { useState } from 'react';
import { IDatabase } from '@/d.ts/database';
import { IProject } from '@/d.ts/project';
import { IConnection } from '@/d.ts';
import { SearchStatus } from '../constant';

const useSearchStatus = (initSearchStatus: SearchStatus) => {
  const [status, setStatus] = useState(initSearchStatus);
  /** 缓存搜索searchKey */
  const [cacheSearchKeyList, setCacheSearchKeyList] = useState([]);
  const [searchKey, setSearchKey] = useState<string>('');
  const update = (newStatus: SearchStatus) => {
    setStatus(newStatus);
  };
  const [database, setDatabase] = useState<IDatabase>();
  const [project, setProject] = useState<IProject>();
  const [dataSource, setDataSource] = useState<IConnection>();

  const next = (params?: {
    searchStatus?: SearchStatus;
    searchKey?: string;
    database?: IDatabase;
    project?: IProject;
    dataSource?: IConnection;
  }) => {
    const { searchStatus, database, project, dataSource } = params || {};

    // 如果只传入了 searchStatus（tab 切换），清空选中的对象
    if (searchStatus && !database && !project && !dataSource) {
      setDatabase(null);
      setProject(null);
      setDataSource(null);
      update(searchStatus);
      return;
    }

    // 如果明确传入了 searchStatus，直接更新
    if (searchStatus) {
      update(searchStatus);
    }

    switch (status) {
      case SearchStatus.forDatabase: {
        if (database) {
          setDatabase(database);
          setCacheSearchKeyList([...cacheSearchKeyList, searchKey]);
          setSearchKey('');
          update(SearchStatus.databaseforObject);
        }
        break;
      }
      case SearchStatus.forDataSource: {
        if (dataSource) {
          setDataSource(dataSource);
          setCacheSearchKeyList([...cacheSearchKeyList, searchKey]);
          setSearchKey('');
          update(SearchStatus.dataSourceforObject);
        }
        break;
      }
      case SearchStatus.forProject: {
        if (project) {
          setProject(project);
          setCacheSearchKeyList([...cacheSearchKeyList, searchKey]);
          setSearchKey('');
          update(SearchStatus.projectforObject);
        }
        break;
      }
      case SearchStatus.projectforObject: {
        if (database) {
          setDatabase(database);
          setCacheSearchKeyList([...cacheSearchKeyList, searchKey]);
          setSearchKey('');
          update(SearchStatus.projectWithDatabaseforObject);
        }
        break;
      }
      case SearchStatus.dataSourceforObject: {
        if (database) {
          setDatabase(database);
          setCacheSearchKeyList([...cacheSearchKeyList, searchKey]);
          setSearchKey('');
          update(SearchStatus.dataSourceWithDatabaseforObject);
        }
        break;
      }
    }
  };

  const back = () => {
    switch (status) {
      case SearchStatus.dataSourceWithDatabaseforObject: {
        if (searchKey) {
          setSearchKey('');
        } else {
          const _cacheSearchKeyList = [...cacheSearchKeyList];
          const lastSearchKey = _cacheSearchKeyList.pop();
          setSearchKey(lastSearchKey);
          setDatabase(null);
          setCacheSearchKeyList(_cacheSearchKeyList);
          update(SearchStatus.dataSourceforObject);
        }
        break;
      }
      case SearchStatus.projectWithDatabaseforObject: {
        if (searchKey) {
          setSearchKey('');
        } else {
          const _cacheSearchKeyList = [...cacheSearchKeyList];
          const lastSearchKey = _cacheSearchKeyList.pop();
          setSearchKey(lastSearchKey);
          setCacheSearchKeyList(_cacheSearchKeyList);
          setDatabase(null);
          update(SearchStatus.projectforObject);
        }
        break;
      }
      case SearchStatus.databaseforObject: {
        if (searchKey) {
          setSearchKey('');
        } else {
          const _cacheSearchKeyList = [...cacheSearchKeyList];
          const lastSearchKey = _cacheSearchKeyList.pop();
          setSearchKey(lastSearchKey);
          setDatabase(null);
          setCacheSearchKeyList(_cacheSearchKeyList);
          update(SearchStatus.forDatabase);
        }
        break;
      }
      case SearchStatus.projectforObject: {
        if (searchKey) {
          setSearchKey('');
        } else {
          const _cacheSearchKeyList = [...cacheSearchKeyList];
          const lastSearchKey = _cacheSearchKeyList.pop();
          setProject(null);
          setSearchKey(lastSearchKey);
          setCacheSearchKeyList(_cacheSearchKeyList);
          update(SearchStatus.forProject);
        }
        break;
      }
      case SearchStatus.dataSourceforObject: {
        if (searchKey) {
          setSearchKey('');
        } else {
          const _cacheSearchKeyList = [...cacheSearchKeyList];
          const lastSearchKey = _cacheSearchKeyList.pop();
          setDataSource(null);
          setSearchKey(lastSearchKey);
          setCacheSearchKeyList(_cacheSearchKeyList);
          update(SearchStatus.forDataSource);
        }
        break;
      }
      case SearchStatus.forDatabase:
      case SearchStatus.forDataSource:
      case SearchStatus.forProject: {
        setSearchKey('');
        break;
      }
    }
  };

  const reset = () => {
    setCacheSearchKeyList([]);
  };

  return {
    status,
    reset,
    next,
    back,
    searchKey,
    setSearchKey,
    database,
    setDatabase,
    project,
    setProject,
    dataSource,
    setDataSource,
    update,
    cacheSearchKeyList,
  };
};

export default useSearchStatus;
