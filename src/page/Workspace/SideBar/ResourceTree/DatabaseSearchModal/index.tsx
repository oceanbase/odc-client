import { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { Modal, Spin } from 'antd';
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
  } = useSearchStatus(SearchStatus.defalut);
  const [activeKey, setActiveKey] = useState(SEARCH_OBJECT_FROM_ALL_DATABASE);
  const {
    initStatus,
    dataSourceId: initDataSourceId,
    projectId: initProjectId,
    databaseId: initDatabaseId,
    initSearchKey,
  } = modalStore.golbalSearchData || {};

  const {
    objectlist,
    datasourceList,
    projectList,
    databaseList,
    loadDatabaseObject,
    loadDatabaseList,
    fetchSyncAll,
    projectLoading,
    dataSourceLoading,
    databaseLoading,
    objectloading,
    syncAllLoading,
  } = useGlobalSearchData({ project, database, dataSource, activeKey, modalStore });
  const actions = useActions({ modalStore, project });
  const { positionResourceTree, positionProjectOrDataSource } = actions || {};

  const reloadDatabaseList = () => {
    loadDatabaseList();
  };

  const handleCancel = () => {
    modalStore.changeDatabaseSearchModalVisible(false);
  };

  useEffect(() => {
    if (!databaseLoading && !dataSourceLoading && !projectLoading) {
      if (initStatus) {
        reset();
        update(initStatus);
        setSearchKey(initSearchKey);
        setDatabase(databaseList.find((item) => item.id === initDatabaseId));
        setDataSource(datasourceList.find((item) => item.id === initDataSourceId));
        setProject(projectList.find((item) => item.id === initProjectId));
      }
    }
  }, [databaseList, projectList, datasourceList]);

  useEffect(() => {
    loadDatabaseObject(searchKey);
  }, [activeKey]);

  useEffect(() => {
    setActiveKey(SEARCH_OBJECT_FROM_ALL_DATABASE);
  }, [database]);

  const searchContent = useMemo(() => {
    const options = userStore?.isPrivateSpace()
      ? privateSpaceSupportSearchOptionList
      : publicSpaceSupportSearchOptionList;
    return (
      <div className={styles.content}>
        {options.map((type) => {
          return (
            <div
              className={styles.databaseItem}
              onClick={() => {
                next({ searchStatus: type });
              }}
            >{`搜索${SearchOptionTypeTextMap?.[type]}"${searchKey}"`}</div>
          );
        })}
      </div>
    );
  }, [searchKey, status]);

  const PositioninContent = useMemo(() => {
    let positionText: string;
    let action: () => void;
    if (
      [
        SearchStatus.databaseforObject,
        SearchStatus.projectWithDatabaseforObject,
        SearchStatus.dataSourceWithDatabaseforObject,
      ].includes(status)
    ) {
      positionText = formatMessage(
        {
          id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.FA5E6855',
          defaultMessage: '定位到数据库 "${database?.name}"',
        },
        { databaseName: database?.name },
      );
      action = () => {
        positionResourceTree?.({
          type: DbObjectType.database,
          database: database,
        });
        database.id && openNewSQLPage(database.id, project ? 'project' : 'datasource');
      };
    }
    if ([SearchStatus.projectforObject].includes(status)) {
      positionText = `定位到项目${project?.name}`;
      action = () => {
        positionProjectOrDataSource?.({
          status,
          object: project,
        });
      };
    }
    if ([SearchStatus.dataSourceforObject].includes(status)) {
      positionText = `定位到数据源${dataSource?.name}`;
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
    let shouldShowSearchContent: boolean;
    let shouldShowObjectList: boolean;
    let shouldShowtPositioninContent: boolean;
    if (!searchKey) {
      shouldShowList = [
        SearchStatus.defalut,
        SearchStatus.forDataSource,
        SearchStatus.forProject,
        SearchStatus.forDatabase,
        SearchStatus.projectforObject,
        SearchStatus.dataSourceforObject,
      ].includes(status);
      shouldShowSearchContent = false;
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
      shouldShowSearchContent = [SearchStatus.defalut].includes(status);
      shouldShowtPositioninContent = false;
    }

    return (
      <div style={{ minHeight: '364px' }} className={styles.content}>
        {shouldShowSearchContent && searchContent}
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
        reloadDatabaseList,
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
        <Spin spinning={databaseLoading || dataSourceLoading || projectLoading || objectloading}>
          {contentRender()}
        </Spin>
      </Modal>
    </GlobalSearchContext.Provider>
  );
};

export default inject('modalStore', 'userStore')(observer(DatabaseSearchModal));
