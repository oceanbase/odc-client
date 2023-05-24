import AddConnectionDrawer from '@/component/AddConnectionDrawer';
import { IConnectionType } from '@/d.ts';
import { ModalStore } from '@/store/modal';
import { inject, observer } from 'mobx-react';
import React, { useMemo, useRef, useState } from 'react';
import Content from './Content';
import ParamContext, { SortType } from './ParamContext';

interface IProps {
  modalStore?: ModalStore;
}

const Datasource: React.FC<IProps> = function ({ modalStore }) {
  const [searchValue, setSearchValue] = useState(null);
  const [searchType, setSearchType] = useState(null);
  const [sortType, setSortType] = useState<SortType>(null);
  const [connectType, setConnectType] = useState([]);
  const [permissions, setPermissions] = useState([]);
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
          permissions,
          setPermissions,
          reloadTable: () => {
            return contentRef.current?.reload();
          },
        }}
      >
        <div style={{ height: '100%' }}>
          <Content ref={contentRef} />
        </div>
        <AddConnectionDrawer
          key={`${modalStore.addConnectionVisible}connection`}
          connectionType={IConnectionType.PRIVATE}
          reloadData={contentRef.current?.reload}
        />
      </ParamContext.Provider>
    </div>
  );
};

export default inject('modalStore')(observer(Datasource));
