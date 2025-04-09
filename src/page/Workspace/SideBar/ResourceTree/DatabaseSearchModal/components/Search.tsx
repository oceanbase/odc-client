import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import { formatMessage } from '@/util/intl';
import { CloseCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { Input, Tooltip } from 'antd';
import { InputRef } from 'antd/lib/input';
import { useEffect, useMemo, useRef, useContext } from 'react';
import styles from '../index.less';
import Icon from '@ant-design/icons';
import { ReactComponent as ProjectSvg } from '@/svgr/project_space.svg';
import { SearchStatus } from '../constant';
import { inject, observer } from 'mobx-react';
import { UserStore } from '@/store/login';
import GlobalSearchContext from '@/page/Workspace/context/GlobalSearchContext';
import { ModalStore } from '@/store/modal';
import { SearchOutlined } from '@ant-design/icons';
import StatusIcon from '@/component/StatusIcon/DataSourceIcon';

interface Iprops {
  userStore?: UserStore;
  modalStore?: ModalStore;
}
const Search = ({ userStore, modalStore }: Iprops) => {
  const inputRef = useRef<InputRef>(null);
  const globalSearchContext = useContext(GlobalSearchContext);
  const {
    database,
    searchKey,
    objectloading,
    dataSource,
    project,
    back,
    status,
    setSearchKey,
    loadDatabaseObject,
  } = globalSearchContext;
  useEffect(() => {
    if (modalStore.databaseSearchModalVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [modalStore.databaseSearchModalVisible, searchKey, database]);

  const getSearchTag = () => {
    let databaseTag, dataSourceTag, projectTag, searchTag;
    const divider = (
      <>
        <span className={styles.selectDivider}></span>
        <span style={{ color: 'var(--icon-color-disable)', paddingRight: 4 }}>/</span>
      </>
    );
    searchTag = (
      <SearchOutlined
        style={{
          marginRight: '6px',
          position: 'relative',
          top: '2px',
          color: 'var(--icon-color-normal)',
        }}
      />
    );
    if (database) {
      databaseTag = (
        <>
          <span className={styles.selectedDatabase}>
            <DataBaseStatusIcon item={database} />
            <Tooltip
              title={`${database?.name}(${database?.dataSource?.name})`}
              placement="top"
              overlayStyle={{ maxWidth: 280 }}
            >
              <span className={styles.selectTitle}>{database?.name}</span>
            </Tooltip>
          </span>
          {divider}
        </>
      );
    }
    if (dataSource) {
      dataSourceTag = (
        <>
          <span className={styles.selectedDatabase}>
            <StatusIcon item={dataSource} />
            <Tooltip title={dataSource?.name} placement="top" overlayStyle={{ maxWidth: 280 }}>
              <span className={styles.selectTitle}>{dataSource?.name}</span>
            </Tooltip>
          </span>
          {divider}
        </>
      );
    }
    if (project) {
      projectTag = (
        <>
          <span className={styles.selectedDatabase}>
            <Icon
              component={ProjectSvg}
              style={{ color: 'var(--icon-blue-color)', fontSize: 16 }}
            />
            <Tooltip title={project?.name} placement="top" overlayStyle={{ maxWidth: 280 }}>
              <span className={styles.selectTitle}>{project?.name}</span>
            </Tooltip>
          </span>
          {divider}
        </>
      );
    }
    return (
      <>
        {searchTag}
        {dataSourceTag}
        {projectTag}
        {databaseTag}
      </>
    );
  };

  const handleChangeSearch = (e) => {
    if (
      [
        SearchStatus.databaseforObject,
        SearchStatus.dataSourceforObject,
        SearchStatus.projectforObject,
        SearchStatus.dataSourceWithDatabaseforObject,
        SearchStatus.projectWithDatabaseforObject,
      ].includes(status)
    ) {
      loadDatabaseObject?.(e.target.value);
    }
    setSearchKey?.(e.target.value);
  };

  const inputPlaceholder = useMemo(() => {
    let text;
    switch (status) {
      case SearchStatus.defalut: {
        if (userStore?.isPrivateSpace()) {
          text = '支持搜索数据源、数据库，也可继续搜索表、列、视图等';
        } else {
          text = '支持搜索项目、数据源、数据库，也可继续搜索表、列、视图等';
        }
        break;
      }
      default: {
        if (database) {
          text = '搜索表、列、视图等';
        } else {
          text = '搜索数据库、表、列、视图等';
        }
        break;
      }
    }
    return text;
  }, [status, database]);

  const getObjectInput = () => {
    return (
      <Input
        size="small"
        ref={inputRef}
        placeholder={inputPlaceholder}
        onChange={handleChangeSearch}
        value={searchKey}
      />
    );
  };

  const getIcon = () => {
    const props = {
      style: { color: 'var(--icon-color-normal-2)' },
    };
    if (objectloading) {
      return <LoadingOutlined {...props} />;
    }
    if (status === SearchStatus.defalut && !searchKey) return undefined;
    return (
      <CloseCircleFilled
        {...props}
        onClick={() => {
          back?.();
        }}
      />
    );
  };

  return (
    <div>
      <span className={styles.title}>
        <span className={styles.selectInfo}>
          {getSearchTag()}
          <span className={styles.selectInput}>{getObjectInput()}</span>
        </span>
        <span className={styles.searchIcon}>{getIcon()}</span>
      </span>
    </div>
  );
};

export default inject('userStore', 'modalStore')(observer(Search));
