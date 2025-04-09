import { queryTableOrViewData } from '@/common/network/table';
import type { IResultSet, IMaterializedView, ITable } from '@/d.ts';
import { generateResultSetColumns } from '@/store/helper';
import { MaterializedViewPage as MaterializedViewPageModel } from '@/store/helper/page/pages';
import { ModalStore } from '@/store/modal';
import type { PageStore } from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import type { RadioChangeEvent } from 'antd/lib/radio';
import type { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import notification from '@/util/notification';
import { Layout, message, Radio, Spin, Tabs } from 'antd';
import { inject, observer } from 'mobx-react';
import DDLResultSet from '../DDLResultSet';
import SessionContext from '../SessionContextWrap/context';
import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
import styles from './index.less';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import MvViewPageBaseInfoForm from './MvViewPageBaseInfoForm/index';
import MvViewColumns from './Columns';
import MvViewIndexes from './Indexes';
import MvViewConstraints from './Constraints';
import MvViewPartitions from './Partitions';
import MvViewDDL from './DDL';
import MaterializedViewPageContext from './context';
import { getMaterializedView } from '@/common/network/materializedView/index';
import WorkSpacePageLoading from '@/component/Loading/WorkSpacePageLoading';
import ShowExecuteModal from '@/page/Workspace/components/TablePage/showExecuteModal';
const GLOBAL_HEADER_HEIGHT = 40;
const TABBAR_HEIGHT = 28;

interface IProps {
  sqlStore: SQLStore;
  pageStore: PageStore;
  modalStore?: ModalStore;
  pageKey: string;
  sessionManagerStore: SessionManagerStore;
  params: MaterializedViewPageModel['pageParams'];
  session?: SessionStore;
  onUnsavedChange: (pageKey: string) => void;
}

export enum TopTab {
  PROPS = 'PROPS',
  DATA = 'DATA',
}

export enum PropsTab {
  INFO = 'INFO',
  COLUMN = 'COLUMN',
  INDEX = 'INDEX',
  CONSTRAINT = 'CONSTRAINT',
  PARTITION = 'PARTITION',
  DDL = 'DDL',
}

interface IMaterializedViewPageState {}
const MaterializedViewPage = inject(
  'sqlStore',
  'pageStore',
  'sessionManagerStore',
  'modalStore',
)(
  observer((props: IProps) => {
    const { pageStore, modalStore, pageKey, params, session } = props;

    const [topTab, setTopTab] = useState(TopTab.PROPS);
    const [propsTab, setPropsTab] = useState(PropsTab.INFO);
    const [dataLoading, setDataLoading] = useState<boolean>(false);
    const [resultSet, setResultSet] = useState<IResultSet>();
    const executeRef = useRef<{
      showExecuteModal: (
        sql: any,
        tableName: any,
        onSuccess,
        tip,
        callback: () => void,
      ) => Promise<boolean>;
    }>();
    const callbackRef = useRef<() => void>();
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
    const [materializedView, setMaterializedView] = useState<Partial<IMaterializedView>>(null);
    const showPartition = !!materializedView?.partitions?.partType;

    const handlePropsTabChanged = async (propsTab: PropsTab) => {
      pageStore.updatePage(
        pageKey,
        {},
        {
          propsTab,
        },
      );
    };

    const loadmaterializedView = async () => {
      const newMaterializedView = await getMaterializedView({
        sessionId: session.sessionId,
        dbName: params.dbName,
        materializedViewName: params.materializedViewName,
      });
      setMaterializedView(newMaterializedView);
    };

    const reloadMaterializedViewData = async (
      materializedViewName: string,
      limit: number = 1000,
    ) => {
      setDataLoading(true);
      try {
        const viewData = await queryTableOrViewData(
          session?.odcDatabase?.name,
          materializedViewName,
          limit,
          false,
          session?.sessionId,
        );
        if (viewData?.track) {
          notification.error(viewData);
        } else {
          const resultSet = generateResultSetColumns(
            [viewData],
            session?.connection?.dialectType,
          )?.[0];
          if (resultSet) {
            setResultSet(resultSet);
          }
        }
      } catch (error) {
        console.log('error:' + error);
      } finally {
        setDataLoading(false);
      }
    };

    const refresh = useCallback(async () => {
      await loadmaterializedView();
    }, [params.materializedViewName, session]);

    const showExportResuleSetModal = () => {
      const sql = resultSet?.originSql;
      modalStore.changeCreateResultSetExportTaskModal(true, {
        sql,
        databaseId: session?.database.databaseId,
        tableName: params?.materializedViewName,
      });
    };

    useEffect(() => {
      if (session) {
        loadmaterializedView();
      }
    }, []);

    useEffect(() => {
      if (materializedView && topTab === TopTab.DATA) {
        reloadMaterializedViewData(materializedView?.info?.name);
      }
    }, [topTab, materializedView]);

    useEffect(() => {
      if (params.topTab) {
        setTopTab(params.topTab);
      }
      if (params.propsTab) {
        setPropsTab(params.propsTab);
      }
    }, [params.propsTab, params.topTab]);

    return materializedView ? (
      <>
        <div style={{ height: '100%', overflow: 'auto' }}>
          <div className={styles.header}>
            <Radio.Group onChange={handleTopTabChanged} value={topTab} className={styles.topbar}>
              <Radio.Button value={TopTab.PROPS}>
                {formatMessage({
                  id: 'workspace.window.table.toptab.props',
                  defaultMessage: '属性',
                })}
              </Radio.Button>
              <Radio.Button value={TopTab.DATA}>
                {formatMessage({
                  id: 'workspace.window.table.toptab.data',
                  defaultMessage: '数据',
                })}
              </Radio.Button>
            </Radio.Group>
          </div>
          <MaterializedViewPageContext.Provider
            value={{
              session,
              materializedView,
              onRefresh: refresh,
              pageKey,
              showExecuteModal: function (...args) {
                // 后续回调函数
                callbackRef.current = args?.[4];
                return executeRef.current?.showExecuteModal(...args);
              },
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
                            defaultMessage: '基本信息',
                          }),
                          key: PropsTab.INFO,
                          children: <MvViewPageBaseInfoForm pageKey={pageKey} />,
                        },
                        {
                          label: formatMessage({
                            id: 'workspace.window.table.propstab.column',
                            defaultMessage: '列',
                          }),
                          key: PropsTab.COLUMN,
                          children: <MvViewColumns />,
                        },
                        {
                          key: PropsTab.INDEX,
                          label: formatMessage({
                            id: 'workspace.window.table.propstab.index',
                            defaultMessage: '索引',
                          }),
                          children: <MvViewIndexes />,
                        },
                        {
                          key: PropsTab.CONSTRAINT,
                          label: formatMessage({
                            id: 'workspace.window.table.propstab.constraint',
                            defaultMessage: '约束',
                          }),
                          children: <MvViewConstraints />,
                        },
                        showPartition
                          ? {
                              key: PropsTab.PARTITION,
                              label: formatMessage({
                                id: 'workspace.window.table.propstab.partition',
                                defaultMessage: '分区',
                              }),
                              children: <MvViewPartitions />,
                            }
                          : null,
                        {
                          key: PropsTab.DDL,
                          label: formatMessage({
                            id: 'workspace.window.table.propstab.ddl',
                            defaultMessage: 'DDL',
                          }),
                          children: <MvViewDDL />,
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: TopTab.DATA,
                  label: '',
                  children: (
                    <Spin spinning={dataLoading || !resultSet}>
                      {resultSet && (
                        <DDLResultSet
                          session={session}
                          autoCommit={session?.params?.autoCommit}
                          showPagination={true}
                          isTableData={false}
                          isViewData={false}
                          isMvViewData={true}
                          disableEdit={true}
                          columns={resultSet.columns}
                          useUniqueColumnName={false}
                          rows={resultSet.rows}
                          sqlId={resultSet.sqlId}
                          table={
                            {
                              tableName: materializedView?.info?.name,
                              ...materializedView,
                            } as any
                          }
                          resultHeight={`calc(100vh - ${
                            GLOBAL_HEADER_HEIGHT + TABBAR_HEIGHT + 46 + 1
                          }px)`}
                          onRefresh={(limit) =>
                            reloadMaterializedViewData(materializedView?.info?.name, limit)
                          }
                          onExport={(limitToExport) => {
                            showExportResuleSetModal();
                          }}
                        />
                      )}
                    </Spin>
                  ),
                },
              ]}
            />
          </MaterializedViewPageContext.Provider>
          <ShowExecuteModal session={session} ref={executeRef} callbackRef={callbackRef} />
        </div>
      </>
    ) : (
      <WorkSpacePageLoading />
    );
  }),
);

export default WrapSessionPage(
  function ViewPageWrap(props: IProps) {
    return (
      <SessionContext.Consumer>
        {({ session }) => {
          return <MaterializedViewPage {...props} session={session} />;
        }}
      </SessionContext.Consumer>
    );
  },
  true,
  true,
  true,
);
