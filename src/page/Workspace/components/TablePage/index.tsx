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

import { getTableInfo } from '@/common/network/table';
import { DbObjectType, TaskType } from '@/d.ts';
import { PageStore } from '@/store/page';
import { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { ExportOutlined } from '@ant-design/icons';
import { Radio, Space, Spin, Tabs } from 'antd';
import type { RadioChangeEvent } from 'antd/lib/radio';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ITableModel } from '../CreateTable/interface';
import TableColumns from './Columns';
import TableConstraints from './Constraints';
import TablePageContext from './context';
import TableDDL from './DDL';
import TableIndexes from './Indexes';
import TablePartitions from './Partitions';
import ShowExecuteModal from './showExecuteModal';
import ShowTableBaseInfoForm from './ShowTableBaseInfoForm';
import TableData from './TableData';

import { getDataSourceModeConfig } from '@/common/datasource';
import WorkSpacePageLoading from '@/component/Loading/WorkSpacePageLoading';
import Toolbar from '@/component/Toolbar';
import { TablePage as TablePageModel } from '@/store/helper/page/pages';
import modal from '@/store/modal';
import { SessionManagerStore } from '@/store/sessionManager';
import { getQuoteTableName } from '@/util/utils';
import SessionContext from '../SessionContextWrap/context';
import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
import styles from './index.less';

interface IProps {
  pageKey: string;
  pageStore?: PageStore;
  settingStore?: SettingStore;
  sessionManagerStore?: SessionManagerStore;
  params: TablePageModel['pageParams'];
}

// 顶层 Tab key 枚举
export enum TopTab {
  PROPS = 'PROPS',
  DATA = 'DATA',
}

// 属性 Tab key 枚举
export enum PropsTab {
  INFO = 'INFO',
  COLUMN = 'COLUMN',
  INDEX = 'INDEX',
  CONSTRAINT = 'CONSTRAINT',
  DDL = 'DDL',
  PARTITION = 'PARTITION',
}

const TablePage: React.FC<IProps> = function ({ params, pageStore, pageKey, settingStore }) {
  const [table, setTable] = useState<Partial<ITableModel>>(null);
  const version = useRef(0);
  const [topTab, setTopTab] = useState(TopTab.PROPS);
  const [propsTab, setPropsTab] = useState(PropsTab.INFO);
  const executeRef = useRef<{
    showExecuteModal: (
      sql: any,
      tableName: any,
      onSuccess,
      tip,
      callback: () => void,
    ) => Promise<boolean>;
  }>();
  const { session } = useContext(SessionContext);
  const dbName = session?.database?.dbName;
  const showPartition = !!table?.partitions?.partType;
  const enableConstraint = session?.supportFeature?.enableConstraint;
  const callbackRef = useRef<any>();
  async function fetchTable() {
    if (table?.info?.tableName === params.tableName) {
      return;
    }
    const newTable = await getTableInfo(params.tableName, dbName, session?.sessionId);
    if (newTable) {
      version.current++;
      setTable(newTable);
      /**
       * 加一个校验的逻辑，避免名字不同步
       */
      const newTableName = newTable?.info?.tableName;
      if (
        newTableName &&
        newTableName !==
          getQuoteTableName(params.tableName, session?.odcDatabase?.dataSource?.dialectType)
      ) {
        setTable({
          ...newTable,
          info: Object.assign({}, newTable?.info, { tableName: newTableName }),
        });
        const tablePage = new TablePageModel(params?.databaseId, newTableName);
        await pageStore.updatePage(
          pageKey,
          {
            title: newTableName,
            updateKey: tablePage.pageKey,
          },

          {
            tableName: newTableName,
          },
        );
      }
    }
  }

  const refresh = useCallback(async () => {
    await fetchTable();
  }, [params.tableName, session]);

  useEffect(() => {
    if (session) {
      fetchTable();
    }
  }, [session]);

  useEffect(() => {
    if (params.topTab) {
      setTopTab(params.topTab);
    }
    if (params.propsTab) {
      setPropsTab(params.propsTab);
    }
  }, [params.propsTab, params.topTab]);

  const handleTopTabChanged = (v: RadioChangeEvent) => {
    const topTab = v.target.value;

    // 更新 url
    pageStore.updatePage(
      pageKey,
      {},
      {
        topTab,
      },
    );
  };

  const handlePropsTabChanged = async (propsTab: PropsTab) => {
    pageStore.updatePage(
      pageKey,
      {},
      {
        propsTab,
      },
    );
  };

  const oldTable = useMemo(() => {
    return {
      tableName: table?.info?.tableName,
      columns: table?.columns,
    };
  }, [table]);

  return table ? (
    <>
      <div style={{ height: '100%', overflow: 'auto' }}>
        <div className={styles.header}>
          <Radio.Group onChange={handleTopTabChanged} value={topTab} className={styles.topbar}>
            <Radio.Button value={TopTab.PROPS}>
              {formatMessage({ id: 'workspace.window.table.toptab.props' })}
            </Radio.Button>
            <Radio.Button value={TopTab.DATA}>
              {formatMessage({ id: 'workspace.window.table.toptab.data' })}
            </Radio.Button>
          </Radio.Group>
          <Space>
            {settingStore.enableDBExport &&
            getDataSourceModeConfig(session?.connection?.type)?.features?.task?.includes(
              TaskType.EXPORT,
            ) ? (
              <Toolbar.Button
                text={
                  formatMessage({ id: 'odc.components.TablePage.Export' }) //导出
                }
                icon={ExportOutlined}
                isShowText
                onClick={() => {
                  modal.changeExportModal(true, {
                    type: DbObjectType.table,
                    name: table?.info?.tableName,
                    databaseId: session?.database.databaseId,
                  });
                }}
              />
            ) : null}
          </Space>
        </div>
        <TablePageContext.Provider
          value={{
            table: table,
            onRefresh: refresh,
            showExecuteModal: function (...args) {
              // 后续回调函数
              callbackRef.current = args?.[4];
              return executeRef.current?.showExecuteModal(...args);
            },
            editMode: true,
            session,
          }}
        >
          <Tabs
            defaultActiveKey={TopTab.PROPS}
            activeKey={topTab}
            className={styles.topbarTab}
            animated={false}
            items={[
              {
                key: TopTab.PROPS,
                label: '',
                children: (
                  <Tabs
                    activeKey={propsTab}
                    tabPosition="left"
                    className={styles.propsTab}
                    onChange={handlePropsTabChanged}
                    items={[
                      {
                        label: formatMessage({
                          id: 'workspace.window.table.propstab.info',
                        }),
                        key: PropsTab.INFO,
                        children: <ShowTableBaseInfoForm pageKey={pageKey} />,
                      },
                      {
                        label: formatMessage({
                          id: 'workspace.window.table.propstab.column',
                        }),
                        key: PropsTab.COLUMN,
                        children: (
                          <Spin spinning={false}>
                            <TableColumns />
                          </Spin>
                        ),
                      },
                      {
                        key: PropsTab.INDEX,
                        label: formatMessage({
                          id: 'workspace.window.table.propstab.index',
                        }),
                        children: (
                          <Spin spinning={false}>
                            <TableIndexes />
                          </Spin>
                        ),
                      },
                      enableConstraint && {
                        children: (
                          <Spin spinning={false}>
                            <TableConstraints />
                          </Spin>
                        ),
                        key: PropsTab.CONSTRAINT,
                        label: formatMessage({
                          id: 'workspace.window.table.propstab.constraint',
                        }),
                      },
                      showPartition
                        ? {
                            key: PropsTab.PARTITION,
                            label: formatMessage({
                              id: 'workspace.window.table.propstab.partition',
                            }),
                            children: (
                              <Spin spinning={false}>
                                <TablePartitions />
                              </Spin>
                            ),
                          }
                        : null,
                      {
                        key: PropsTab.DDL,
                        label: formatMessage({
                          id: 'workspace.window.table.propstab.ddl',
                        }),
                        children: <TableDDL key={version.current} />,
                      },
                    ].filter(Boolean)}
                  />
                ),
              },
              {
                key: TopTab.DATA,
                label: '',
                children:
                  version.current > 0 ? (
                    <TableData
                      table={oldTable}
                      session={session}
                      tableName={table?.info.tableName}
                      pageKey={pageKey}
                      key={version.current}
                    />
                  ) : null,
              },
            ]}
          />
        </TablePageContext.Provider>
      </div>
      <ShowExecuteModal session={session} ref={executeRef} callbackRef={callbackRef} />
    </>
  ) : (
    <WorkSpacePageLoading />
  );
};

export default WrapSessionPage(
  inject('pageStore', 'sessionManagerStore', 'settingStore')(observer(TablePage)),
  true,
  true,
);
