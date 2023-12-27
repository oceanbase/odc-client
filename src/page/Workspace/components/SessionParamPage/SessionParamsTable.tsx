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

import { fetchVariableList, updateVariable } from '@/common/network/sessionParams';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import PropertyModal from '@/component/PropertyModal';
import Toolbar from '@/component/Toolbar';
import { IConnectionProperty } from '@/d.ts';
import { ConnectionPropertyType } from '@/d.ts/datasource';
import { PageStore } from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
import { SettingStore } from '@/store/setting';
import { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import { EditOutlined, SyncOutlined } from '@ant-design/icons';
import { Alert, Input, Layout, message, Spin } from 'antd';
import { debounce } from 'lodash';
import { inject, observer } from 'mobx-react';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { FormattedMessage } from '@umijs/max';
import EditableTable, { RowType } from '../EditableTable';
import SessionSelect from '../SessionContextWrap/SessionSelect';
import styles from './index.less';
const ToolbarButton = Toolbar.Button;
const Search = Input.Search;
const { Content } = Layout;

interface IRowConnectionProperty extends RowType, IConnectionProperty {}

function SessionParamsTable(props: {
  sqlStore?: SQLStore;
  settingStore?: SettingStore;
  pageStore?: PageStore;
  connectionPropertyType: ConnectionPropertyType;
  sessionId?: string;
  tip?: string;
  bordered?: boolean;
  sessionManagerStore?: SessionManagerStore;
  showDatasource?: boolean;
}) {
  const {
    sessionManagerStore,
    connectionPropertyType,
    sessionId,
    tip,
    bordered,
    showDatasource,
  } = props;
  const [listLoading, setListLoading] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [connectionProperty, setConnectionProperty] = useState([]);
  const [rows, setRows] = useState<IRowConnectionProperty[]>([]);
  const gridRef = useRef<DataGridRef>();
  const session = sessionManagerStore.sessionMap.get(sessionId);

  const loadData = async function () {
    setListLoading(true);
    setConnectionProperty(await fetchVariableList(connectionPropertyType, sessionId));
    setListLoading(false);
  };
  /**
   * 初始化
   */
  useEffect(() => {
    if (sessionId) {
      loadData();
    }
  }, [connectionPropertyType, sessionId]);

  useEffect(() => {
    setRows(connectionProperty);
  }, [connectionProperty]);

  const handleRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const handleOpenEditModal = useCallback(() => {
    if (selectedRowIndex > -1) {
      setShowEditModal(true);
    }
  }, [selectedRowIndex]);

  const handleSearch = useCallback(
    debounce((searchKey: string) => {
      setSearchKey(searchKey);
    }, 200),
    [],
  );

  const columns = [
    {
      key: 'key',
      name: formatMessage({
        id: 'workspace.window.session.form.key',
      }),
      editable: false,
      sortable: true,
    },
    {
      key: 'value',
      name: formatMessage({
        id: 'workspace.window.session.form.value',
      }),
      editable: false,
      sortable: false,
    },
  ];
  const filteredRows = useMemo(() => {
    return rows?.filter((p) => p.key?.toLowerCase().indexOf(searchKey?.toLowerCase()) > -1) || [];
  }, [searchKey, rows]);

  const handleSaveProperty = useCallback(
    async (property: IRowConnectionProperty) => {
      const newValue = property?.value;
      const oldVlaue = filteredRows?.[selectedRowIndex]?.value;
      let modified = newValue !== oldVlaue;
      if (modified) {
        const isSuccess = await updateVariable(
          {
            ...filteredRows?.[selectedRowIndex],
            value: newValue,
          },
          connectionPropertyType,
          sessionId,
        );
        if (isSuccess) {
          await loadData();
          await session.initSessionStatus();
          message.success(
            formatMessage({
              id: 'workspace.window.session.modal.sql.execute.success',
            }),
          );
          setShowEditModal(false);
        }
      } else {
        setShowEditModal(false);
      }
    },
    [filteredRows, selectedRowIndex],
  );

  useEffect(() => {
    gridRef.current?.setRows?.(filteredRows ?? []);
  }, [filteredRows]);

  return (
    <>
      <Spin wrapperClassName={styles.spin} spinning={listLoading}>
        <div
          className={bordered ? styles.bordered : null}
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <Toolbar>
            <div className="tools-left">
              <ToolbarButton
                isShowText
                text={formatMessage({ id: 'workspace.window.session.button.edit' })}
                icon={<EditOutlined />}
                onClick={handleOpenEditModal}
                // disabled={connectionPropertyType === ConnectionPropertyType.GLOBAL}
              />
            </div>
            <div className="tools-right">
              <Search
                allowClear={true}
                placeholder={formatMessage({
                  id: 'workspace.window.session.button.search',
                })}
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                size="small"
                className={styles.search}
              />
              <ToolbarButton
                text={formatMessage({ id: 'workspace.window.session.button.refresh' })}
                icon={<SyncOutlined />}
                onClick={handleRefresh}
              />
            </div>
          </Toolbar>
          {showDatasource ? (
            <div style={{ flex: 0 }}>
              <SessionSelect />
            </div>
          ) : null}
          {tip ? <Alert showIcon message={tip} /> : null}
          <div className={styles.table}>
            <EditableTable
              gridRef={gridRef}
              bordered={!bordered}
              minHeight={`100%`}
              initialColumns={columns}
              rowKey="key"
              enableFilterRow={false}
              initialRows={filteredRows as any}
              readonly={true}
              onSelectChange={(keys) => {
                const idx = filteredRows.findIndex((c) => keys.includes(c.key));
                setSelectedRowIndex(idx);
              }}
            />
          </div>
        </div>
      </Spin>
      <PropertyModal
        visible={showEditModal}
        onSave={handleSaveProperty}
        onCancel={() => setShowEditModal(false)}
        model={filteredRows?.[selectedRowIndex] || {}}
      />
    </>
  );
}

export default inject(
  'sqlStore',
  'sessionManagerStore',
  'pageStore',
  'settingStore',
)(observer(SessionParamsTable));
