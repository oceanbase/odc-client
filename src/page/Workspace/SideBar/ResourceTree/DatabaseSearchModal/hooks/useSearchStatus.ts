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
    switch (status) {
      case SearchStatus.defalut: {
        if (!searchKey) {
          setDatabase(database);
          update(SearchStatus.databaseforObject);
        } else {
          update(searchStatus);
          setCacheSearchKeyList([...cacheSearchKeyList, searchKey]);
        }
        break;
      }
      case SearchStatus.forDatabase: {
        update(SearchStatus.databaseforObject);
        setDatabase(database);
        setCacheSearchKeyList([...cacheSearchKeyList, searchKey]);
        setSearchKey('');
        break;
      }
      case SearchStatus.forDataSource: {
        update(SearchStatus.dataSourceforObject);
        setDataSource(dataSource);
        setCacheSearchKeyList([...cacheSearchKeyList, searchKey]);
        setSearchKey('');
        break;
      }
      case SearchStatus.forProject: {
        update(SearchStatus.projectforObject);
        setProject(project);
        setCacheSearchKeyList([...cacheSearchKeyList, searchKey]);
        setSearchKey('');
        break;
      }
      case SearchStatus.projectforObject: {
        setDatabase(database);
        update(SearchStatus.projectWithDatabaseforObject);
        setCacheSearchKeyList([...cacheSearchKeyList, searchKey]);
        setSearchKey('');
        break;
      }
      case SearchStatus.dataSourceforObject: {
        setDatabase(database);
        update(SearchStatus.dataSourceWithDatabaseforObject);
        setCacheSearchKeyList([...cacheSearchKeyList, searchKey]);
        setSearchKey('');
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
          const _cacheSearchKeyList = cacheSearchKeyList;
          setSearchKey(_cacheSearchKeyList.pop());
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
          const _cacheSearchKeyList = cacheSearchKeyList;
          setSearchKey(_cacheSearchKeyList.pop());
          setCacheSearchKeyList(_cacheSearchKeyList);
          setDatabase(null);
          update(SearchStatus.projectforObject);
        }
        break;
      }
      case SearchStatus.databaseforObject: {
        if (searchKey) {
          setSearchKey('');
        } else if (!cacheSearchKeyList.length || cacheSearchKeyList.length === 1) {
          update(SearchStatus.defalut);
          setDatabase(null);
        } else {
          const _cacheSearchKeyList = cacheSearchKeyList;
          setSearchKey(_cacheSearchKeyList.pop());
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
          const _cacheSearchKeyList = cacheSearchKeyList;
          setProject(null);
          setSearchKey(_cacheSearchKeyList.pop());
          setCacheSearchKeyList(_cacheSearchKeyList);
          update(SearchStatus.forProject);
        }
        break;
      }
      case SearchStatus.dataSourceforObject: {
        if (searchKey) {
          setSearchKey('');
        } else {
          const _cacheSearchKeyList = cacheSearchKeyList;
          setDataSource(null);
          setSearchKey(_cacheSearchKeyList.pop());
          setCacheSearchKeyList(_cacheSearchKeyList);
          update(SearchStatus.forDataSource);
        }
        break;
      }
      case SearchStatus.forDatabase:
      case SearchStatus.forDataSource:
      case SearchStatus.forProject: {
        setDatabase(null);
        setProject(null);
        setDataSource(null);
        update(SearchStatus.defalut);
        const _cacheSearchKeyList = cacheSearchKeyList;
        if (_cacheSearchKeyList.length) {
          setSearchKey(_cacheSearchKeyList.pop());
        }
        break;
      }
      case SearchStatus.defalut: {
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
