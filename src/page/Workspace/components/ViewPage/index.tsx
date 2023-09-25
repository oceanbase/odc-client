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

import { queryTableOrViewData, tableModify } from '@/common/network/table';
import { getView } from '@/common/network/view';
import { IEditor } from '@/component/MonacoEditor';
import { SQLCodeEditorDDL } from '@/component/SQLCodeEditorDDL';
import Toolbar from '@/component/Toolbar';
import { IConStatus } from '@/component/Toolbar/statefulIcon';
import type { IResultSet, IView } from '@/d.ts';
import { ConnectionMode } from '@/d.ts';
import { generateResultSetColumns } from '@/store/helper';
import { ViewPage as ViewPageModel } from '@/store/helper/page/pages';
import { ModalStore } from '@/store/modal';
import type { PageStore } from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import type { SQLStore } from '@/store/sql';
import notification from '@/util/notification';
import { downloadPLDDL } from '@/util/sqlExport';
import { generateUniqKey } from '@/util/utils';
import { AlignLeftOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import { formatMessage, FormattedMessage } from '@umijs/max';
import { Layout, message, Radio, Spin, Tabs } from 'antd';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import DDLResultSet from '../DDLResultSet';
import SessionContext from '../SessionContextWrap/context';
import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
import ShowViewBaseInfoForm from '../ShowViewBaseInfoForm';
import ColumnTab from '../TablePage/ColumnTab';
import styles from './index.less';
import { getDataSourceModeConfig } from '@/common/datasource';

const { Content } = Layout;
const { TabPane } = Tabs;
const ToolbarButton = Toolbar.Button;

const GLOBAL_HEADER_HEIGHT = 40;
const TABBAR_HEIGHT = 28;
// 顶层 Tab key 枚举
export enum TopTab {
  PROPS = 'PROPS',
  DATA = 'DATA',
}

// 属性 Tab key 枚举
export enum PropsTab {
  INFO = 'INFO',
  COLUMN = 'COLUMN',
  DDL = 'DDL',
}

interface IProps {
  sqlStore: SQLStore;
  pageStore: PageStore;
  modalStore?: ModalStore;
  pageKey: string;
  sessionManagerStore: SessionManagerStore;
  params: ViewPageModel['pageParams'];

  onUnsavedChange: (pageKey: string) => void;
}

interface IViewPageState {
  topTab: TopTab;
  propsTab: PropsTab;
  view: IView;

  dataLoading: boolean;
  resultSet: IResultSet;

  // 表结构变更
  showViewExecuteSQLModal: boolean;
  executeViewLoading: boolean;
  updateViewDML: string;
  updatedView: Partial<IView>;

  showDataExecuteSQLModal: boolean;
  executeDataLoading: boolean;
  updateDataDML: string;

  // 导出数据
  resultSetIndexToExport: number;
  limitToExport: number;

  formated: boolean;
}

@inject('sqlStore', 'pageStore', 'sessionManagerStore', 'modalStore')
@observer
class ViewPage extends Component<IProps & { session: SessionStore }, IViewPageState> {
  public editor: IEditor;

  public readonly state: IViewPageState = {
    topTab: this.props.params.topTab || TopTab.PROPS,
    propsTab: this.props.params.propsTab || PropsTab.INFO,
    view: {
      viewName: '',
      columns: [],
      ddl: '',
    },

    dataLoading: false,
    resultSet: null,

    showViewExecuteSQLModal: false,
    executeViewLoading: false,
    updateViewDML: '',
    updatedView: {
      viewName: this.props.params && this.props.params.viewName,
    },

    showDataExecuteSQLModal: false,
    executeDataLoading: false,
    updateDataDML: '',

    // 导出
    resultSetIndexToExport: -1,
    limitToExport: 0,

    formated: false,
  };

  private timer: number | undefined;

  public async componentDidMount() {
    const {
      params: { viewName },
    } = this.props;

    this.setState({
      view: {
        ...this.state.view,
        viewName,
      },
    });

    await this.reloadView(viewName);

    await this.reloadViewColumns(viewName);
    if (this.state.topTab === TopTab.DATA) {
      await this.reloadViewData(viewName, true);
    }
  }

  public UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    if (
      nextProps.params &&
      this.props.params &&
      this.props.params.topTab &&
      nextProps.params.topTab !== this.state.topTab
    ) {
      this.setState({
        topTab: nextProps.params.topTab,
      });
    }
    if (
      nextProps.params &&
      this.props.params &&
      this.props.params.propsTab &&
      nextProps.params.propsTab !== this.state.propsTab
    ) {
      this.setState({
        propsTab: nextProps.params.propsTab,
      });
    }
  }

  public componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  public handleTopTabChanged = (v) => {
    const { pageStore, pageKey } = this.props;
    const { view } = this.state;

    const topTab = v.target.value;
    if (topTab === TopTab.DATA && !this.state.resultSet) {
      this.reloadViewData(this.props.params?.viewName, true);
    }
    this.setState({ topTab });
    // 更新 url
    pageStore.updatePage(
      pageKey,
      {},
      {
        viewName: view.viewName,
        topTab,
      },
    );
  };

  public handlePropsTabChanged = (propsTab: PropsTab) => {
    const { pageStore, pageKey } = this.props;
    const { view } = this.state;
    this.setState({ propsTab });

    // 更新 url
    pageStore.updatePage(
      pageKey,
      {},
      {
        viewName: view.viewName,
        topTab: TopTab.PROPS,
        propsTab,
      },
    );
  };

  public handleExecuteViewDML = async () => {
    const {
      sqlStore,
      params: { viewName, databaseId },
      pageKey,
      pageStore,
    } = this.props;
    const { updatedView } = this.state;
    const updatedViewName = updatedView && updatedView.viewName;

    try {
      const isSuccess = await tableModify(this.state.updateViewDML, viewName);
      if (isSuccess) {
        // 关闭对话框
        this.setState({
          showViewExecuteSQLModal: false,
          updateViewDML: '',
          updatedView: {},
        });

        // TODO: 可能修改表名，需要更新 URL，Page title，左侧资源树
        if (updatedViewName !== viewName) {
          const viewPage = new ViewPageModel(databaseId, updatedViewName);
          pageStore.updatePage(
            pageKey,
            { title: updatedViewName, updateKey: viewPage.pageKey },
            {
              viewName: updatedViewName,
            },
          );
        }
        await this.reloadView(updatedViewName);

        message.success(formatMessage({ id: 'portal.connection.form.save.success' }));
      }
    } catch (e) {
      //
    }
  };

  public reloadView = async (viewName: string) => {
    const view = await getView(
      viewName,
      this.props.session?.sessionId,
      this.props.session?.odcDatabase?.name,
    );
    if (view) {
      this.setState({ view });
    } else {
      message.error(formatMessage({ id: 'workspace.window.view.load.error' }));
    }
  };

  public reloadViewColumns = async (viewName: string) => {
    const { columns } = await getView(
      viewName,
      this.props.session?.sessionId,
      this.props.session?.odcDatabase?.name,
    );
    this.setState({
      view: {
        ...this.state.view,
        columns:
          columns &&
          columns.map((c) => {
            // 例如 Varchar，需要拼上长度
            if (c.length) {
              c.dataType = `${c.dataType}(${c.length})`;
              delete c.length;
            }

            return {
              ...c,
              initialValue: c,
              modified: false,
              key: generateUniqKey(),
            };
          }),
      },
    });
  };

  /**
   * 重新加载表数据
   */
  public reloadViewData = async (
    viewName: string,
    keepInitialSQL: boolean = false,
    limit: number = 1000,
  ) => {
    this.setState({ dataLoading: true });
    try {
      const viewData = await queryTableOrViewData(
        this.props.session?.odcDatabase?.name,
        viewName,
        limit,
        false,
        this.props.session?.sessionId,
      );
      if (viewData?.track) {
        notification.error(viewData);
      } else {
        const resultSet = generateResultSetColumns(
          [viewData],
          this.props.session?.connection?.dialectType,
        )?.[0];

        if (resultSet) {
          this.setState({
            resultSet,
          });
        }
      }
    } catch (e) {
      //
    } finally {
      this.setState({ dataLoading: false });
    }
  };

  private handleFormat = () => {
    const { formated, view } = this.state;
    if (!formated) {
      this.editor.doFormat();
    } else {
      this.editor.setValue(view?.ddl || '');
    }
    this.setState({
      formated: !formated,
    });
  };

  showExportResuleSetModal = () => {
    const { modalStore, session } = this.props;
    const { resultSet } = this.state;
    const sql = resultSet?.originSql;
    modalStore.changeCreateResultSetExportTaskModal(true, {
      sql,
      databaseId: session?.database.databaseId,
    });
  };

  public render() {
    const {
      pageKey,
      params: { viewName },
      session,
      sessionManagerStore,
    } = this.props;
    const { topTab, propsTab, view, dataLoading, resultSet, formated } = this.state;

    return (
      view && (
        <>
          <Content>
            <Radio.Group
              onChange={this.handleTopTabChanged}
              value={topTab}
              className={styles.topbar}
            >
              <Radio.Button value={TopTab.PROPS}>
                <FormattedMessage id="workspace.window.table.toptab.props" />
              </Radio.Button>
              <Radio.Button value={TopTab.DATA}>
                <FormattedMessage id="workspace.window.table.toptab.data" />
              </Radio.Button>
            </Radio.Group>

            <Tabs
              defaultActiveKey={TopTab.PROPS}
              activeKey={topTab}
              className={styles.topbarTab}
              animated={false}
            >
              <TabPane key={TopTab.PROPS} tab="">
                <Tabs
                  activeKey={propsTab}
                  tabPosition="left"
                  className={styles.propsTab}
                  onChange={this.handlePropsTabChanged as (key: string) => void}
                >
                  <TabPane
                    tab={formatMessage({
                      id: 'workspace.window.table.propstab.info',
                    })}
                    key={PropsTab.INFO}
                  >
                    <ShowViewBaseInfoForm model={view} />
                  </TabPane>
                  <TabPane
                    tab={formatMessage({
                      id: 'workspace.window.table.propstab.column',
                    })}
                    key={PropsTab.COLUMN}
                  >
                    <ColumnTab
                      hideRawtableInfo={true}
                      hideOrder={true}
                      editable={false}
                      modified={false}
                      table={view}
                      tableName={viewName}
                      pageKey={pageKey}
                      onReload={() => this.reloadViewColumns(viewName)}
                    />
                  </TabPane>
                  <TabPane tab={'DDL'} key={PropsTab.DDL}>
                    <Toolbar>
                      <ToolbarButton
                        text={
                          formatMessage({
                            id: 'odc.components.ViewPage.Download',
                          }) //下载
                        }
                        icon={<CloudDownloadOutlined />}
                        onClick={() => {
                          downloadPLDDL(
                            view?.viewName,
                            'VIEW',
                            view?.ddl,
                            this.props.session?.odcDatabase?.name,
                          );
                        }}
                      />

                      <ToolbarButton
                        text={
                          formated
                            ? formatMessage({
                                id: 'odc.components.ViewPage.Unformat',
                              })
                            : // 取消格式化
                              formatMessage({
                                id: 'odc.components.ViewPage.Formatting',
                              })
                          // 格式化
                        }
                        icon={<AlignLeftOutlined />}
                        onClick={this.handleFormat}
                        status={formated ? IConStatus.ACTIVE : IConStatus.INIT}
                      />
                    </Toolbar>
                    <div
                      style={{
                        height: `calc(100vh - ${40 + 28 + 47 + 38}px)`,
                        position: 'relative',
                      }}
                    >
                      <SQLCodeEditorDDL
                        readOnly
                        key={view.ddl}
                        defaultValue={`${view.ddl};`}
                        language={getDataSourceModeConfig(session?.connection?.type)?.sql?.language}
                        onEditorCreated={(editor: IEditor) => {
                          this.editor = editor;
                        }}
                      />
                    </div>
                  </TabPane>
                </Tabs>
              </TabPane>
              <TabPane key={TopTab.DATA} tab="">
                <Spin spinning={dataLoading || !resultSet}>
                  {resultSet && (
                    <DDLResultSet
                      showExplain={false}
                      session={session}
                      autoCommit={session?.params?.autoCommit}
                      showPagination={true}
                      isTableData={false}
                      isViewData={true}
                      disableEdit={true}
                      columns={resultSet.columns}
                      useUniqueColumnName={false}
                      rows={resultSet.rows}
                      sqlId={resultSet.sqlId}
                      table={{
                        tableName: view?.viewName,
                        ...view,
                      }}
                      resultHeight={`calc(100vh - ${
                        GLOBAL_HEADER_HEIGHT + TABBAR_HEIGHT + 46 + 1
                      }px)`}
                      onRefresh={(limit) => this.reloadViewData(viewName, false, limit)}
                      onExport={(limitToExport) => {
                        this.setState({
                          limitToExport,
                        });
                        this.showExportResuleSetModal();
                      }}
                    />
                  )}
                </Spin>
              </TabPane>
            </Tabs>
          </Content>
        </>
      )
    );
  }
}

export default WrapSessionPage(
  function ViewPageWrap(props: IProps) {
    return (
      <SessionContext.Consumer>
        {({ session }) => {
          return <ViewPage {...props} session={session} />;
        }}
      </SessionContext.Consumer>
    );
  },
  true,
  true,
);
