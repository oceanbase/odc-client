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

  const getObjectListData = async (value) => {
    const databaseIds = isSelectAll ? null : database?.id;
    const type = activeKey === SEARCH_OBJECT_FROM_ALL_DATABASE ? null : activeKey;
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
          setSelectDatabaseState={setSelectDatabaseState}
          searchKey={searchKey}
          isSelectAll={isSelectAll}
          setSelectAllState={setSelectAllState}
          loading={loading}
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
