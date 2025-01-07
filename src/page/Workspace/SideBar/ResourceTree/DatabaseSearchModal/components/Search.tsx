import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import { IDatabase } from '@/d.ts/database';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { formatMessage } from '@/util/intl';
import { CloseCircleFilled, LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { Input, Tooltip } from 'antd';
import { InputRef } from 'antd/lib/input';
import React, { useContext, useEffect, useRef } from 'react';
import { SearchTypeMap } from '../constant';
import styles from '../index.less';

interface Iprops {
  database: IDatabase;
  visible: boolean;
  onChangeInput: (SearchTypeMap: SearchTypeMap, value: string) => void;
  searchKey: string;
  loading: boolean;
  setDatabase: React.Dispatch<React.SetStateAction<IDatabase>>;
  setSearchKey: React.Dispatch<React.SetStateAction<string>>;
}
const Search = ({
  database,
  visible,
  onChangeInput,
  searchKey,
  loading,
  setDatabase,
  setSearchKey,
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
      database && (
        <>
          <span className={styles.selectDivider}></span>
          <span style={{ color: 'var(--icon-color-disable)', paddingRight: 4 }}>/</span>
        </>
      );

    if (database) {
      return (
        <span
          className={styles.selectedDatabase}
          onClick={() => {
            setDatabase(null);
            onChangeInput(SearchTypeMap.DATABASE, null);
          }}
        >
          <DataBaseStatusIcon item={database} />
          <Tooltip
            title={`${database?.name}(${database?.dataSource?.name})`}
            placement="top"
            overlayStyle={{ maxWidth: 280 }}
          >
            <span className={styles.selectTitle}>{database?.name}</span>
            {divider()}
          </Tooltip>
        </span>
      );
    }
    return null;
  };

  const handleChangeDatabaseSearch = (e) => {
    onChangeInput(SearchTypeMap.DATABASE, e.target.value);
  };
  const handleChangeObjectSearch = (e) => {
    onChangeInput(SearchTypeMap.OBJECT, e.target.value);
  };

  const getObjectInput = () => {
    if (!database) {
      return (
        <Input
          size="small"
          ref={inputRef}
          placeholder={formatMessage({
            id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.EBF92A7F',
            defaultMessage: '搜索数据库、表、外表、字段、视图等',
          })}
          onChange={handleChangeDatabaseSearch}
          value={searchKey}
        />
      );
    }
    return (
      <Input
        size="small"
        ref={inputRef}
        placeholder={formatMessage({
          id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.EF45DCA4',
          defaultMessage: '搜索表、外表、字段、视图等',
        })}
        onChange={handleChangeObjectSearch}
        value={searchKey}
      />
    );
  };

  const getIcon = () => {
    const props = {
      style: { color: 'var(--icon-color-normal-2)' },
    };
    if (loading) {
      return <LoadingOutlined {...props} />;
    }
    if (searchKey || database) {
      return (
        <CloseCircleFilled
          {...props}
          onClick={() => {
            setSearchKey('');
            onChangeInput(SearchTypeMap.DATABASE, '');
            setDatabase(null);
          }}
        />
      );
    }
    return <SearchOutlined {...props} />;
  };

  return (
    <div>
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
