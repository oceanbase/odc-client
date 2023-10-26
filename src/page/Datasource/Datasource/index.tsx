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

import { ModalStore } from '@/store/modal';
import { inject, observer } from 'mobx-react';
import React, { useMemo, useRef, useState } from 'react';
import Content from './Content';
import NewDatasourceDrawer from './NewDatasourceDrawer';
import ParamContext, { SortType } from './ParamContext';

interface IProps {
  modalStore?: ModalStore;
}

const Datasource: React.FC<IProps> = function ({ modalStore }) {
  const [searchValue, setSearchValue] = useState(null);
  const [searchType, setSearchType] = useState(null);
  const [sortType, setSortType] = useState<SortType>(null);
  const [connectType, setConnectType] = useState([]);
  const [editDatasourceId, setEditDatasourceId] = useState(null);
  const contentRef = useRef<any>();
  const _searchValue = useMemo(() => {
    return {
      value: searchValue,
      type: searchType,
    };
  }, [searchValue, searchType]);
  return (
    <div style={{ height: '100%' }}>
      <ParamContext.Provider
        value={{
          searchValue: _searchValue,
          setSearchvalue(v, type) {
            setSearchType(type);
            setSearchValue(v);
          },
          sortType: sortType,
          setSortType,
          connectType,
          setConnectType,
          reloadTable: () => {
            return contentRef.current?.reload();
          },
          editDatasource(id: number) {
            setEditDatasourceId(id);
          },
        }}
      >
        <div style={{ height: '100%' }}>
          <Content ref={contentRef} />
        </div>
        <NewDatasourceDrawer
          isEdit={true}
          disableTheme
          visible={!!editDatasourceId}
          id={editDatasourceId}
          close={() => setEditDatasourceId(null)}
          onSuccess={() => {
            contentRef.current?.reload();
          }}
        />
      </ParamContext.Provider>
    </div>
  );
};

export default inject('modalStore')(observer(Datasource));
