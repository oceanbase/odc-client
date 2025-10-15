import { useState, useContext, useEffect, useMemo } from 'react';
import { Modal, Spin, Tabs } from 'antd';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@/store/modal';
import Search from './components/Search';
import styles from './index.less';
import {
  SEARCH_OBJECT_FROM_ALL_DATABASE,
  privateSpaceSupportSearchOptionList,
  publicSpaceSupportSearchOptionList,
} from './constant';
import ObjectList from './components/ObjectList';
import { UserStore } from '@/store/login';
import List from './components/List';
import classNames from 'classnames';
import { DbObjectType } from '@/d.ts';
import { SearchOptionTypeTextMap, SearchStatus } from './constant';
import useSearchStatus from './hooks/useSearchStatus';
import useGlobalSearchData from './hooks/useData';
import useActions from '@/page/Workspace/SideBar/ResourceTree/DatabaseSearchModal/hooks/useActions';
import { openNewSQLPage } from '@/store/helper/page';
import { formatMessage } from '@/util/intl';
import GlobalSearchContext from '@/page/Workspace/context/GlobalSearchContext';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import Icon from '@ant-design/icons';
import { ReactComponent as ProjectSvg } from '@/svgr/project_space.svg';
import StatusIcon from '@/component/StatusIcon/DataSourceIcon';
import EllipsisText from '@/component/EllipsisText';

interface IProps {
  modalStore?: ModalStore;
  userStore?: UserStore;
}

const DatabaseSearchModal = ({ modalStore, userStore }: IProps) => {
  const {
    status,
    reset,
    next,
    back,
    searchKey,
    setSearchKey,
    database,
    setDatabase,
    project,
    dataSource,
    update,
    setDataSource,
    setProject,
  } = useSearchStatus(SearchStatus.forDatabase);
  const [activeKey, setActiveKey] = useState(SEARCH_OBJECT_FROM_ALL_DATABASE);
  const {
    initStatus,
    dataSourceId: initDataSourceId,
    projectId: initProjectId,
    databaseId: initDatabaseId,
    initSearchKey,
    activeKey: initActiveKey,
  } = modalStore.golbalSearchData || {};

  const {
    objectlist,
    loadDatabaseObject,
    fetchSyncAll,
    objectloading,
    syncAllLoading,
    databaseList,
    databaseLoading,
  } = useGlobalSearchData({ project, database, dataSource, activeKey, modalStore });
  const treeContext = useContext(ResourceTreeContext);
  const { projectList, datasourceList } = treeContext;
  const actions = useActions({ modalStore, project });
  const { positionResourceTree, positionProjectOrDataSource } = actions || {};

  const handleCancel = () => {
    modalStore.changeDatabaseSearchModalVisible(false);
  };

  useEffect(() => {
    if (initStatus) {
      reset();
      update(initStatus);
      setSearchKey(initSearchKey);
      setDatabase(databaseList.find((item) => item.id === initDatabaseId));
      setDataSource(datasourceList.find((item) => item.id === initDataSourceId));
      setProject(projectList.find((item) => item.id === initProjectId));

      // 如果有 initActiveKey，在数据准备好后立即设置
      if (initActiveKey) {
        setActiveKey(initActiveKey);
      }
    }
  }, [databaseList, projectList, datasourceList]);

  // 当 database 变化但没有 initActiveKey 时，重置为默认 tab
  useEffect(() => {
    if (database && !initActiveKey) {
      setActiveKey(SEARCH_OBJECT_FROM_ALL_DATABASE);
    }
  }, [database, initActiveKey]);

  // 当 activeKey、database 或 searchKey 变化时，重新加载数据
  useEffect(() => {
    if (database) {
      loadDatabaseObject(searchKey);
    }
  }, [activeKey, database, searchKey]);

  const getCurrentActiveKey = () => {
    // 返回当前应该高亮的 tab key
    const tabStates = [
      SearchStatus.forDatabase,
      SearchStatus.forProject,
      SearchStatus.forDataSource,
    ];
    if (tabStates.includes(status)) {
      return status;
    }
    // 如果是对象搜索状态，根据选中的对象类型返回对应的 tab
    if (
      status === SearchStatus.projectforObject ||
      status === SearchStatus.projectWithDatabaseforObject
    ) {
      return SearchStatus.forProject;
    }
    if (
      status === SearchStatus.dataSourceforObject ||
      status === SearchStatus.dataSourceWithDatabaseforObject
    ) {
      return SearchStatus.forDataSource;
    }
    if (status === SearchStatus.databaseforObject) {
      return SearchStatus.forDatabase;
    }
    // 默认返回数据库 tab
    return SearchStatus.forDatabase;
  };

  const searchContent = useMemo(() => {
    const options = userStore?.isPrivateSpace()
      ? privateSpaceSupportSearchOptionList
      : publicSpaceSupportSearchOptionList;
    return (
      <div
        className={styles.searchContent}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Tabs
          activeKey={getCurrentActiveKey()}
          items={options.map((type) => ({ key: type, label: SearchOptionTypeTextMap?.[type] }))}
          onChange={(key) => {
            next({ searchStatus: key as SearchStatus });
          }}
        />
      </div>
    );
  }, [status, userStore]);

  const PositioninContent = useMemo(() => {
    let positionText: JSX.Element;
    let action: () => void;
    if (
      [
        SearchStatus.databaseforObject,
        SearchStatus.projectWithDatabaseforObject,
        SearchStatus.dataSourceWithDatabaseforObject,
      ].includes(status)
    ) {
      positionText = (
        <div className={styles.positioninContentText}>
          <span>定位到数据库:</span>
          <DataBaseStatusIcon item={database} />
          <EllipsisText content={database?.name} />
        </div>
      );
      action = () => {
        positionResourceTree?.({
          type: DbObjectType.database,
          database: database,
        });
        database.id && openNewSQLPage(database.id);
      };
    }
    if ([SearchStatus.projectforObject].includes(status)) {
      positionText = (
        <div className={styles.positioninContentText}>
          <span>定位到项目:</span>
          <Icon component={ProjectSvg} style={{ color: 'var(--icon-blue-color)', fontSize: 16 }} />
          <EllipsisText content={project?.name} />
        </div>
      );
      action = () => {
        positionProjectOrDataSource?.({
          status,
          object: project,
        });
      };
    }
    if ([SearchStatus.dataSourceforObject].includes(status)) {
      positionText = (
        <div className={styles.positioninContentText}>
          <span>定位到数据源:</span>
          <StatusIcon item={dataSource} />
          <EllipsisText content={dataSource?.name} />
        </div>
      );
      action = () => {
        positionProjectOrDataSource?.({
          status,
          object: dataSource,
        });
      };
    }
    return (
      <div className={styles.positioninContent}>
        <div className={styles.databaseItem} onClick={action}>
          {positionText}
        </div>
      </div>
    );
  }, [database, project, dataSource, status]);

  const contentRender = () => {
    let shouldShowList: boolean;
    let shouldShowSearchContent = !(dataSource || project || database);
    let shouldShowObjectList: boolean;
    let shouldShowtPositioninContent: boolean;

    if (!searchKey) {
      shouldShowList = [
        SearchStatus.forDataSource,
        SearchStatus.forProject,
        SearchStatus.forDatabase,
        SearchStatus.projectforObject,
        SearchStatus.dataSourceforObject,
      ].includes(status);
      shouldShowObjectList = false;
      shouldShowtPositioninContent = [
        SearchStatus.projectforObject,
        SearchStatus.dataSourceforObject,
        SearchStatus.databaseforObject,
        SearchStatus.projectWithDatabaseforObject,
        SearchStatus.dataSourceWithDatabaseforObject,
      ].includes(status);
    } else {
      shouldShowList = [
        SearchStatus.forDataSource,
        SearchStatus.forProject,
        SearchStatus.forDatabase,
      ].includes(status);
      shouldShowObjectList = [
        SearchStatus.databaseforObject,
        SearchStatus.dataSourceforObject,
        SearchStatus.projectforObject,
        SearchStatus.dataSourceWithDatabaseforObject,
        SearchStatus.projectWithDatabaseforObject,
      ].includes(status);
      shouldShowtPositioninContent = false;
    }

    return (
      <div style={{ minHeight: '364px' }} className={styles.content}>
        {!syncAllLoading && shouldShowSearchContent && searchContent}
        {shouldShowtPositioninContent && PositioninContent}
        {shouldShowList && <List />}
        {shouldShowObjectList && <ObjectList />}
      </div>
    );
  };

  return (
    <GlobalSearchContext.Provider
      value={{
        database,
        setDatabase,
        project,
        dataSource,
        searchKey,
        objectlist,
        setSearchKey,
        back,
        next,
        update,
        status,
        databaseList,
        projectList,
        datasourceList,
        activeKey,
        setActiveKey,
        databaseLoading,
        objectloading,
        actions,
        loadDatabaseObject,
        fetchSyncAll,
        syncAllLoading,
      }}
    >
      <Modal
        closeIcon={null}
        width={540}
        title={<Search />}
        open={modalStore.databaseSearchModalVisible}
        onOk={handleCancel}
        onCancel={handleCancel}
        maskClosable={true}
        closable={false}
        className={classNames(styles.databaseSearchModal, {
          [styles.withPanel]: searchKey,
        })}
        destroyOnClose={true}
        footer={null}
      >
        <Spin spinning={objectloading || databaseLoading}>{contentRender()}</Spin>
      </Modal>
    </GlobalSearchContext.Provider>
  );
};

export default inject('modalStore', 'userStore')(observer(DatabaseSearchModal));
