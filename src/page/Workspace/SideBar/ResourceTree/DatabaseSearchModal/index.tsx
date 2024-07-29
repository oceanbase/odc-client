import { useState, useContext, useEffect } from 'react';
import { Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@/store/modal';
import Search from './components/Search';
import styles from './index.less';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { getDatabaseObject } from '@/common/network/database';
import { SearchTypeMap, SEARCH_OBJECT_FROM_ALL_DATABASE } from './constant';
import ObjectList from './components/ObjectList';
import DatabaseList from './components/DatabaseList';
import { IDatabase, IDatabaseObject } from '@/d.ts/database';
import classNames from 'classnames';
import { DbObjectType } from '@/d.ts';

interface IProps {
  modalStore?: ModalStore;
}

const DatabaseSearchModal = ({ modalStore }: IProps) => {
  const [database, setDatabase] = useState<IDatabase>();
  const [searchKey, setSearchKey] = useState<string>('');
  const [objectlist, setObjectlist] = useState<IDatabaseObject>();
  const [activeKey, setActiveKey] = useState(SEARCH_OBJECT_FROM_ALL_DATABASE);
  const [loading, setLoading] = useState<boolean>(false);
  const { selectDatasourceId, selectProjectId, databaseList, datasourceList } =
    useContext(ResourceTreeContext);
  const currentDataSourceType = datasourceList?.find(
    (item) => item.id === selectDatasourceId,
  )?.dialectType;
  const handleCancel = () => {
    modalStore.changeDatabaseSearchModalVisible(false);
  };

  useEffect(() => {
    getObjectListData(searchKey);
  }, [activeKey]);

  useEffect(() => {
    setActiveKey(SEARCH_OBJECT_FROM_ALL_DATABASE);
  }, [database]);

  const getType = () => {
    if (activeKey === DbObjectType.database) return 'SCHEMA';
    if (activeKey === SEARCH_OBJECT_FROM_ALL_DATABASE) return null;
    return activeKey;
  };

  const getObjectListData = async (value) => {
    const databaseIds = database?.id;
    const type = getType();
    setLoading(true);
    const res = await getDatabaseObject(
      selectProjectId,
      selectDatasourceId,
      databaseIds,
      type,
      value,
    );
    setObjectlist(res?.data);
    setLoading(false);
  };

  const onChangeInput = async (type: SearchTypeMap, value: string) => {
    setSearchKey(value);
    getObjectListData(value);
    switch (type) {
      case SearchTypeMap.OBJECT: {
        // setSelectDatabaseState(false);
        break;
      }
      case SearchTypeMap.DATABASE: {
        // setSelectDatabaseState(true);
      }
    }
  };

  const contentRender = () => {
    if (!searchKey) {
      return (
        <DatabaseList
          database={database}
          setDatabase={setDatabase}
          databaseList={databaseList}
          searchKey={searchKey}
          setSearchKey={setSearchKey}
          modalStore={modalStore}
          objectlist={objectlist}
        />
      );
    }
    return (
      <ObjectList
        database={database}
        setDatabase={setDatabase}
        objectlist={objectlist}
        activeKey={activeKey}
        setActiveKey={setActiveKey}
        setSearchKey={setSearchKey}
        modalStore={modalStore}
        loading={loading}
        selectProjectId={selectProjectId}
        currentDataSourceType={currentDataSourceType}
      />
    );
  };

  return (
    <Modal
      closeIcon={null}
      width={540}
      title={
        <Search
          database={database}
          visible={modalStore.databaseSearchModalVisible && modalStore.canDatabaseSearchModalOpen}
          onChangeInput={onChangeInput}
          searchKey={searchKey}
          loading={loading}
          setDatabase={setDatabase}
          setSearchKey={setSearchKey}
        />
      }
      open={modalStore.databaseSearchModalVisible && modalStore.canDatabaseSearchModalOpen}
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
      {contentRender()}
    </Modal>
  );
};

export default inject('modalStore')(observer(DatabaseSearchModal));
