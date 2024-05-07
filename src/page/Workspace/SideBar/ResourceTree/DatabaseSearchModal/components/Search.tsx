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

import { Input, Tooltip } from 'antd';
import React, { useContext, useEffect, useRef } from 'react';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import styles from '../index.less';
import { DownOutlined, SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import { IDatabase } from '@/d.ts/database';
import { SearchTypeMap } from '../constant';
import { InputRef } from 'antd/lib/input';

interface Iprops {
  database: IDatabase;
  visible: boolean;
  onChangeInput: (SearchTypeMap: SearchTypeMap, value: string) => void;
  isSelectDatabase: boolean;
  setSelectDatabaseState: React.Dispatch<React.SetStateAction<boolean>>;
  searchKey: string;
  isSelectAll: boolean;
  setSelectAllState: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
}
const Search = ({
  database,
  visible,
  onChangeInput,
  isSelectDatabase,
  setSelectDatabaseState,
  searchKey,
  isSelectAll,
  setSelectAllState,
  loading,
}: Iprops) => {
  const { selectDatasourceId, selectProjectId, projectList, datasourceList } =
    useContext(ResourceTreeContext);

  const selectProject = projectList?.find((p) => p.id == selectProjectId);
  const selectDatasource = datasourceList?.find((d) => d.id == selectDatasourceId);

  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible, searchKey, database]);

  const getDataBase = () => {
    const divider = () =>
      (isSelectAll || database) && (
        <>
          <span className={styles.selectDivider}>
            <DownOutlined className={styles.selectIcon} />
          </span>
          <span style={{ color: 'var(--icon-color-disable)', paddingRight: 4 }}>/</span>
        </>
      );
    if (database) {
      return (
        <span
          className={styles.selecteDatabase}
          onClick={() => {
            setSelectDatabaseState(true);
            setSelectAllState(false);
            onChangeInput(SearchTypeMap.DATABASE, null);
          }}
        >
          <DataBaseStatusIcon item={database} />
          <Tooltip title={database?.name} placement="top" overlayStyle={{ maxWidth: 280 }}>
            <span className={styles.selectTitle}>{database?.name}</span>
            {divider()}
          </Tooltip>
        </span>
      );
    }
    if (isSelectAll) {
      return (
        <span
          className={styles.selecteDatabase}
          onClick={() => {
            setSelectDatabaseState(true);
            setSelectAllState(false);
            onChangeInput(SearchTypeMap.DATABASE, null);
          }}
        >
          全部数据库
          {divider()}
        </span>
      );
    }
    return null;
  };

  const handleChangeDatabaswSearch = (e) => {
    onChangeInput(SearchTypeMap.DATABASE, e.target.value);
  };
  const handleChangeObjectSearch = (e) => {
    if (isSelectAll) {
      onChangeInput(SearchTypeMap.OBJECT, e.target.value);
    } else if (e.target.value === '') {
      onChangeInput(SearchTypeMap.DATABASE, '');
    } else {
      onChangeInput(SearchTypeMap.OBJECT, e.target.value);
    }
  };

  const getObjectInput = () => {
    if (isSelectDatabase && !database) {
      return (
        <Input
          size="small"
          ref={inputRef}
          placeholder="搜索数据库"
          onChange={handleChangeDatabaswSearch}
          value={searchKey}
        />
      );
    }
    return (
      <Input
        size="small"
        ref={inputRef}
        placeholder="搜索表、字段、视图等"
        onChange={handleChangeObjectSearch}
        value={searchKey}
      />
    );
  };

  const getIcon = () => {
    if (loading) {
      return <LoadingOutlined />;
    }
    return <SearchOutlined />;
  };

  return (
    <div>
      <div className={styles.listTitle}>
        {selectProject
          ? `当前项目: ${selectProject?.name}`
          : `当前数据源: ${selectDatasource?.name}`}
      </div>
      <span className={styles.title}>
        <span className={styles.selectInfo}>
          {getDataBase()}
          <span className={styles.selectInput}>{getObjectInput()}</span>
        </span>
        <span className={styles.searchIcon}>{getIcon()}</span>
      </span>
    </div>
  );
};

export default Search;
