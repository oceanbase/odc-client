import AddConnectionDrawer from '@/component/AddConnectionDrawer';
import { IConnectionType } from '@/d.ts';
import { ModalStore } from '@/store/modal';
import { inject, observer } from 'mobx-react';
import React, { useMemo, useRef, useState } from 'react';
import Content from './Content';
import Header from './Header';
import ParamContext, { SortType } from './ParamContext';

interface IProps {
  modalStore?: ModalStore;
}

const ConnectionList: React.FC<IProps> = function ({ modalStore }) {
  const [visibleScope, setVisibleScope] = useState(IConnectionType.ALL);
  const [searchValue, setSearchValue] = useState(null);
  const [searchType, setSearchType] = useState(null);
  const [sortType, setSortType] = useState<SortType>(null);
  const [connectType, setConnectType] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<number>>(new Set());
  const [label, setLabel] = useState([]);
  const contentRef = useRef<any>();
  const _searchValue = useMemo(() => {
    return {
      value: searchValue,
      type: searchType,
    };
  }, [searchValue, searchType]);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ParamContext.Provider
        value={{
          visibleScope: visibleScope,
          setVisibleScope: setVisibleScope,
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
          label,
          setLabel,
          selectedKeys,
          setSelectedKeys,
          reloadTable: () => {
            return contentRef.current?.reload();
          },
        }}
      >
        <div style={{ flex: 0, padding: '0px 24px' }}>
          <Header />
        </div>
        <div style={{ flex: 1, padding: '0px 0px 0px 24px' }}>
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

export default inject('modalStore')(observer(ConnectionList));
