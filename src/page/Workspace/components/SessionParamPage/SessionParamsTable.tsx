import {
  executeVariableUpdateDML,
  fetchVariableList,
  getVariableUpdateDML,
} from '@/common/network/sessionParams';
import { WorkspaceAcess } from '@/component/Acess';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import PropertyModal from '@/component/PropertyModal';
import Toolbar from '@/component/Toolbar';
import { actionTypes, IConnectionProperty } from '@/d.ts';
import { ConnectionPropertyType } from '@/store/connection';
import { PageStore } from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
import { SettingStore } from '@/store/setting';
import { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { EditOutlined, SyncOutlined } from '@ant-design/icons';
import { Alert, Input, Layout, message, Spin } from 'antd';
import { debounce } from 'lodash';
import { inject, observer } from 'mobx-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'umi';
import EditableTable, { RowType } from '../EditableTable';
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
}) {
  const { sessionManagerStore, connectionPropertyType, sessionId, tip, bordered } = props;
  const [listLoading, setListLoading] = useState(false);
  const [showExecuteSQLModal, setShowExecuteSQLModal] = useState(false);
  const [updateDML, setupdateDML] = useState('');
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [connectionProperty, setConnectionProperty] = useState([]);
  const [rows, setRows] = useState<IRowConnectionProperty[]>([]);
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

  const handleExecuteUpdateDML = useCallback(async () => {
    if (!session) {
      return;
    }
    const success = await executeVariableUpdateDML(updateDML, connectionPropertyType, sessionId);

    if (success) {
      // 刷新
      await loadData();
      await session.initTransactionStatus();
      setShowExecuteSQLModal(false);
      message.success(
        formatMessage({
          id: 'workspace.window.session.modal.sql.execute.success',
        }),
      ); // 更新页面标题 & url
    }
  }, [session, updateDML, rows, connectionPropertyType, loadData, sessionId]);

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
        setShowExecuteSQLModal(true);
        const updateDML = await getVariableUpdateDML(
          {
            ...filteredRows?.[selectedRowIndex],
            value: newValue,
          },
          connectionPropertyType,
          sessionId,
        );
        setupdateDML(updateDML);
        if (updateDML) {
          setShowEditModal(false);
        }
      } else {
        setShowEditModal(false);
      }
    },
    [filteredRows, selectedRowIndex],
  );

  return (
    <>
      <Spin wrapperClassName={styles.spin} spinning={listLoading}>
        <div
          className={bordered ? styles.bordered : null}
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <Toolbar>
            <div className="tools-left">
              <WorkspaceAcess action={actionTypes.update}>
                <ToolbarButton
                  isShowText
                  text={<FormattedMessage id="workspace.window.session.button.edit" />}
                  icon={<EditOutlined />}
                  onClick={handleOpenEditModal}
                  disabled={connectionPropertyType === ConnectionPropertyType.GLOBAL}
                />
              </WorkspaceAcess>
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
                text={<FormattedMessage id="workspace.window.session.button.refresh" />}
                icon={<SyncOutlined />}
                onClick={handleRefresh}
              />
            </div>
          </Toolbar>
          {tip ? <Alert showIcon message={tip} /> : null}
          <div className={styles.table}>
            <EditableTable
              bordered={!bordered}
              minHeight={`100%`}
              columns={columns}
              rowKey="key"
              enableFilterRow={false}
              rows={filteredRows as any}
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
      <ExecuteSQLModal
        sessionStore={session}
        key="key"
        tip={formatMessage({
          id: 'odc.components.SessionParamPage.ThisModificationWillTakeEffect',
        })}
        /*本次修改将对本连接的所有窗口生效，请仔细确认*/
        sql={updateDML}
        visible={showExecuteSQLModal}
        onSave={handleExecuteUpdateDML}
        onCancel={() => setShowExecuteSQLModal(false)}
        onChange={(sql) => setupdateDML(sql)}
        readonly={true}
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
