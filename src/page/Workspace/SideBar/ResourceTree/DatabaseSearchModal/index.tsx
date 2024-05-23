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

interface IProps {
  modalStore?: ModalStore;
}

const DatabaseSearchModal = ({ modalStore }: IProps) => {
  const [database, setDatabase] = useState<IDatabase>();
  const [searchKey, setSearchKey] = useState<string>('');
  const [isSelectDatabase, setSelectDatabaseState] = useState(false);
  const [isSelectAll, setSelectAllState] = useState(true);
  const [objectlist, setObjectlist] = useState<IDatabaseObject>();
  const [activeKey, setActiveKey] = useState(SEARCH_OBJECT_FROM_ALL_DATABASE);
  const [loading, setLoading] = useState<boolean>(false);

  const { selectDatasourceId, selectProjectId, databaseList } = useContext(ResourceTreeContext);

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
    if (isSelectDatabase) return 'SCHEMA';
    if (activeKey === SEARCH_OBJECT_FROM_ALL_DATABASE) return null;
    return activeKey;
  };

  const getObjectListData = async (value) => {
    const databaseIds = isSelectAll ? null : database?.id;
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
        setSelectDatabaseState(false);
        break;
      }
      case SearchTypeMap.DATABASE: {
        setSelectDatabaseState(true);
      }
    }
  };

  const contentRender = () => {
    if (isSelectAll && !searchKey) {
      return null;
    }
    if (isSelectDatabase) {
      return (
        <DatabaseList
          database={database}
          setDatabase={setDatabase}
          databaseList={databaseList}
          setSelectDatabaseState={setSelectDatabaseState}
          searchKey={searchKey}
          setSearchKey={setSearchKey}
          isSelectAll={isSelectAll}
          setSelectAllState={setSelectAllState}
          modalStore={modalStore}
          objectlist={objectlist}
        />
      );
    }
    return (
      <ObjectList
        database={database}
        objectlist={objectlist}
        activeKey={activeKey}
        setActiveKey={setActiveKey}
        modalStore={modalStore}
        loading={loading}
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
          isSelectDatabase={isSelectDatabase}
          searchKey={searchKey}
          isSelectAll={isSelectAll}
          setSelectAllState={setSelectAllState}
          loading={loading}
          setDatabase={setDatabase}
        />
      }
      open={modalStore.databaseSearchModalVisible && modalStore.canDatabaseSearchModalOpen}
      onOk={handleCancel}
      onCancel={handleCancel}
      maskClosable={true}
      closable={false}
      className={styles.databaseSearchModal}
      destroyOnClose={true}
      footer={null}
    >
      {contentRender()}
    </Modal>
  );
};

export default inject('modalStore')(observer(DatabaseSearchModal));
