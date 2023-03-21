import Toolbar from '@/component/Toolbar';
import type { IPackage } from '@/d.ts';
import { ConnectionMode } from '@/d.ts';
import type { PageStore } from '@/store/page';
import type { SchemaStore } from '@/store/schema';
import type { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import {
  AlignLeftOutlined,
  CloudDownloadOutlined,
  EditOutlined,
  FileSearchOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Layout, Radio, Tabs } from 'antd';
import type { RadioChangeEvent } from 'antd/lib/radio';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import { Component } from 'react';
import { FormattedMessage } from 'umi';

// @ts-ignore

import { actionTypes, WorkspaceAcess } from '@/component/Acess';
import { SQLCodeEditorDDL } from '@/component/SQLCodeEditorDDL';
import { IConStatus } from '@/component/Toolbar/statefulIcon';
import { PLType } from '@/constant/plType';
import type { ConnectionStore } from '@/store/connection';
import { openPackageBodyPage, openPackageHeadPage, updatePage } from '@/store/helper/page';
import { downloadPLDDL } from '@/util/sqlExport';
import type { IEditor } from '@alipay/ob-editor';
import { throttle } from 'lodash';
import styles from './index.less';

const ToolbarButton = Toolbar.Button;

const { Content } = Layout;
const { TabPane } = Tabs;

// 顶层 Tab key 枚举
export enum TopTab {
  HEAD = 'HEAD',
  BODY = 'BODY',
}

// 属性 Tab key 枚举
export enum PropsTab {
  PACKAGE_HEAD_INFO = 'PACKAGE_HEAD_INFO',
  PACKAGE_HEAD_CODE = 'PACKAGE_HEAD_CODE',
  PACKAGE_BODY_INFO = 'PACKAGE_BODY_INFO',
  PACKAGE_BODY_CODE = 'PACKAGE_BODY_CODE',
  PACKAGE_BODY_REFFER = 'PACKAGE_BODY_REFFER',
  PACKAGE_BODY_REFFERED = 'PACKAGE_BODY_REFFERED',
}

interface IProps {
  sqlStore: SQLStore;
  pageStore: PageStore;
  schemaStore: SchemaStore;
  propsTab;
  connectionStore: ConnectionStore;
  pageKey: string;
  params: {
    packageName: string;
    propsTab: PropsTab;
    topTab: TopTab;
  };

  onUnsavedChange: (pageKey: string) => void;
}

interface IFunctionPageState {
  propsTab: PropsTab;
  package?: Partial<IPackage>;
  dataLoading: boolean;
  ddlReadOnly: boolean;
  topTab: TopTab;
  pkg: any;
  headerFormated: boolean;
  bodyFormated: boolean;
  reloading: boolean;
}

@inject('sqlStore', 'schemaStore', 'pageStore', 'connectionStore')
@observer
export default class FunctionPage extends Component<IProps, IFunctionPageState> {
  public editor_header: IEditor;
  public editor_body: IEditor;

  public readonly state: IFunctionPageState = {
    topTab: this.props.params.topTab || TopTab.HEAD,
    propsTab: this.props.params.propsTab || PropsTab.PACKAGE_HEAD_INFO,
    pkg: null,
    dataLoading: false,
    ddlReadOnly: false,
    headerFormated: false,
    bodyFormated: false,
    reloading: false,
  };

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

  public handlePropsTabChanged = (propsTab: PropsTab) => {
    const {
      pageStore,
      pageKey,
      params: { packageName },
    } = this.props;
    const { topTab } = this.state;
    const pkg = this.getPackage(packageName);
    this.setState({ propsTab });

    updatePage(pageKey, {
      path: true,
      packageName: pkg.packageName,
      topTab,
      propsTab,
    });
  };

  public async componentDidMount() {
    const {
      schemaStore,
      params: { packageName },
    } = this.props;
    const pkg = this.getPackage(packageName) || (await schemaStore.loadPackage(packageName));
    if (!pkg?.packageHead) {
      this.setState({
        topTab: TopTab.BODY,
        propsTab: PropsTab.PACKAGE_BODY_INFO,
      });
    }
  }

  public reloadPackage = throttle(
    async () => {
      const {
        schemaStore,
        params: { packageName },
      } = this.props;
      this.setState({
        reloading: true,
      });

      await schemaStore.loadPackage(packageName);
      this.setState({
        reloading: false,
      });
    },
    500,
    {
      trailing: false,
    },
  );

  public handleTopTabChanged = (v: RadioChangeEvent) => {
    const {
      params: { packageName },
    } = this.props;
    const pkg = this.getPackage(packageName);
    const { pageKey, pageStore } = this.props;
    const topTab = v.target.value;
    const propsTab =
      topTab == TopTab.HEAD ? PropsTab.PACKAGE_HEAD_INFO : PropsTab.PACKAGE_BODY_INFO;
    this.setState({ topTab, propsTab });
    updatePage(pageKey, {
      path: true,
      packageName: pkg.packageName,
      topTab,
      propsTab,
    });
  };

  private showSearchWidget() {
    [this.editor_header, this.editor_body].forEach((editor) => {
      const codeEditor = editor?.UNSAFE_getCodeEditor();
      codeEditor?.trigger('FIND_OR_REPLACE', 'actions.find', null);
    });
  }

  public async handleEditPackage(pkgName: string, type: PropsTab) {
    const {
      params: { packageName },
    } = this.props;
    const pkg = this.getPackage(packageName);
    const { topTab } = this.state;
    if (topTab == TopTab.BODY) {
      openPackageBodyPage(pkgName, pkg.packageBody.basicInfo.ddl);
    } else if (topTab == TopTab.HEAD) {
      openPackageHeadPage(pkgName, pkg.packageHead.basicInfo.ddl);
    }
  }

  private getPackage = (packageName) => {
    const { schemaStore } = this.props;
    const { packagesDetails } = schemaStore;
    return packagesDetails[packageName];
  };

  private handleFormat = (editor: IEditor, key: 'headerFormated' | 'bodyFormated', ddl: string) => {
    if (!this.state[key]) {
      editor.doFormat();
    } else {
      editor.setValue(ddl || '');
    }

    if (key === 'headerFormated') {
      this.setState({
        headerFormated: !this.state[key],
      });
    } else {
      this.setState({
        bodyFormated: !this.state[key],
      });
    }
  };

  public render() {
    const {
      pageKey,
      params: { packageName },
      connectionStore,
      schemaStore,
    } = this.props;
    const { propsTab, ddlReadOnly, topTab, headerFormated, bodyFormated, reloading } = this.state;
    const pkg = this.getPackage(packageName);
    const isMySQL = connectionStore.connection.dbMode === ConnectionMode.OB_MYSQL;

    if (!pkg) {
      return null;
    }

    return (
      <>
        <Content>
          <Radio.Group onChange={this.handleTopTabChanged} value={topTab} className={styles.topbar}>
            {pkg.packageHead ? (
              <Radio.Button value={TopTab.HEAD}>
                <FormattedMessage id="workspace.window.table.toptab.package.head" />
              </Radio.Button>
            ) : null}
            {pkg.packageBody ? (
              <Radio.Button value={TopTab.BODY}>
                <FormattedMessage id="workspace.window.table.toptab.package.body" />
              </Radio.Button>
            ) : null}
          </Radio.Group>
          <Tabs
            defaultActiveKey={TopTab.HEAD}
            activeKey={topTab}
            className={styles.topbarTab}
            animated={false}
          >
            {pkg.packageHead ? (
              <TabPane key={TopTab.HEAD} tab="">
                <Tabs
                  activeKey={propsTab}
                  tabPosition="left"
                  className={styles.propsTab}
                  onChange={this.handlePropsTabChanged as any}
                >
                  <TabPane
                    tab={formatMessage({
                      id: 'workspace.window.table.propstab.info',
                    })}
                    key={PropsTab.PACKAGE_HEAD_INFO}
                  >
                    <Content>
                      <p>
                        {formatMessage(
                          {
                            id: 'odc.components.PackagePage.PackageNamePkgpackagename',
                          },

                          { pkgPackageName: pkg.packageName },
                        )}
                      </p>
                      <p>
                        {formatMessage({
                          id: 'odc.components.PackagePage.Created',
                        })}

                        {pkg.packageHead.basicInfo.definer}
                      </p>
                      <p>
                        {formatMessage({
                          id: 'odc.components.PackagePage.Created.2',
                        })}

                        {moment(pkg.packageHead.basicInfo.createTime).format('YYYY-MM-DD HH:mm')}
                      </p>
                      <p>
                        {formatMessage({
                          id: 'odc.components.PackagePage.LastModifiedTime',
                        })}
                        {moment(pkg.packageHead.basicInfo.modifyTime).format('YYYY-MM-DD HH:mm')}{' '}
                      </p>
                    </Content>
                  </TabPane>
                  <TabPane tab={'DDL'} key={PropsTab.PACKAGE_HEAD_CODE}>
                    <Toolbar>
                      <WorkspaceAcess action={actionTypes.update}>
                        <ToolbarButton
                          text={<FormattedMessage id="workspace.window.session.button.edit" />}
                          icon={<EditOutlined />}
                          onClick={this.handleEditPackage.bind(
                            this,
                            pkg.packageName,
                            PropsTab.PACKAGE_HEAD_CODE,
                          )}
                        />
                      </WorkspaceAcess>
                      <ToolbarButton
                        text={
                          formatMessage({
                            id: 'odc.components.PackagePage.Download',
                          }) //下载
                        }
                        icon={<CloudDownloadOutlined />}
                        onClick={() => {
                          downloadPLDDL(
                            packageName + '.head',
                            PLType.PKG_HEAD,
                            pkg?.packageHead?.basicInfo?.ddl,
                          );
                        }}
                      />

                      <ToolbarButton
                        text={<FormattedMessage id="workspace.window.sql.button.search" />}
                        icon={<FileSearchOutlined />}
                        onClick={this.showSearchWidget.bind(this)}
                      />

                      <ToolbarButton
                        text={
                          headerFormated
                            ? formatMessage({
                                id: 'odc.components.PackagePage.Unformat',
                              })
                            : // 取消格式化
                              formatMessage({
                                id: 'odc.components.PackagePage.Formatting',
                              })

                          // 格式化
                        }
                        icon={<AlignLeftOutlined />}
                        onClick={() => {
                          this.handleFormat(
                            this.editor_header,
                            'headerFormated',
                            pkg?.packageHead?.basicInfo?.ddl,
                          );
                        }}
                        status={headerFormated ? IConStatus.ACTIVE : IConStatus.INIT}
                      />

                      <ToolbarButton
                        text={
                          formatMessage({
                            id: 'odc.components.PackagePage.Refresh',
                          })
                          // 刷新
                        }
                        icon={<SyncOutlined />}
                        onClick={this.reloadPackage}
                        status={reloading ? IConStatus.ACTIVE : IConStatus.INIT}
                      />
                    </Toolbar>
                    <div style={{ height: `calc(100vh - ${40 + 28 + 46 + 39}px)` }}>
                      <SQLCodeEditorDDL
                        readOnly
                        initialValue={pkg?.packageHead?.basicInfo?.ddl}
                        language={`sql-oceanbase-${isMySQL ? 'mysql-pl' : 'oracle-pl'}`}
                        onEditorCreated={(editor: IEditor) => {
                          this.editor_header = editor;
                        }}
                      />
                    </div>
                  </TabPane>
                </Tabs>
              </TabPane>
            ) : null}

            {pkg.packageBody ? (
              <TabPane key={TopTab.BODY} tab="">
                <Tabs
                  activeKey={propsTab}
                  tabPosition="left"
                  className={styles.propsTab}
                  onChange={this.handlePropsTabChanged as any}
                >
                  <TabPane
                    tab={formatMessage({
                      id: 'workspace.window.table.propstab.info',
                    })}
                    key={PropsTab.PACKAGE_BODY_INFO}
                  >
                    <Content>
                      <p>
                        {formatMessage(
                          {
                            id: 'odc.components.PackagePage.PackageNamePkgpackagename',
                          },

                          { pkgPackageName: pkg.packageName },
                        )}
                      </p>
                      <p>
                        {formatMessage({
                          id: 'odc.components.PackagePage.Created',
                        })}

                        {pkg.packageBody.basicInfo.definer}
                      </p>
                      <p>
                        {formatMessage({
                          id: 'odc.components.PackagePage.Created.2',
                        })}

                        {moment(pkg.packageBody.basicInfo.createTime).format('YYYY-MM-DD HH:mm')}
                      </p>
                      <p>
                        {formatMessage({
                          id: 'odc.components.PackagePage.LastModifiedTime',
                        })}
                        {moment(pkg.packageBody.basicInfo.modifyTime).format('YYYY-MM-DD HH:mm')}{' '}
                      </p>
                    </Content>
                  </TabPane>
                  <TabPane tab={'DDL'} key={PropsTab.PACKAGE_BODY_CODE}>
                    <Toolbar>
                      <WorkspaceAcess action={actionTypes.update}>
                        <ToolbarButton
                          text={<FormattedMessage id="workspace.window.session.button.edit" />}
                          icon={<EditOutlined />}
                          onClick={this.handleEditPackage.bind(
                            this,
                            pkg.packageName,
                            PropsTab.PACKAGE_BODY_CODE,
                          )}
                        />
                      </WorkspaceAcess>
                      <ToolbarButton
                        text={
                          formatMessage({
                            id: 'odc.components.PackagePage.Download',
                          }) //下载
                        }
                        icon={<CloudDownloadOutlined />}
                        onClick={() => {
                          downloadPLDDL(
                            packageName + '.body',
                            PLType.PKG_BODY,
                            pkg.packageBody.basicInfo.ddl,
                          );
                        }}
                      />

                      <ToolbarButton
                        text={<FormattedMessage id="workspace.window.sql.button.search" />}
                        icon={<FileSearchOutlined />}
                        onClick={this.showSearchWidget.bind(this)}
                      />

                      <ToolbarButton
                        text={
                          bodyFormated
                            ? formatMessage({
                                id: 'odc.components.PackagePage.Unformat',
                              })
                            : // 取消格式化
                              formatMessage({
                                id: 'odc.components.PackagePage.Formatting',
                              })

                          // 格式化
                        }
                        icon={<AlignLeftOutlined />}
                        onClick={() => {
                          this.handleFormat(
                            this.editor_body,
                            'bodyFormated',
                            pkg.packageBody.basicInfo.ddl,
                          );
                        }}
                        status={bodyFormated ? IConStatus.ACTIVE : IConStatus.INIT}
                      />

                      <ToolbarButton
                        text={
                          formatMessage({
                            id: 'odc.components.PackagePage.Refresh',
                          })
                          // 刷新
                        }
                        icon={<SyncOutlined />}
                        onClick={this.reloadPackage}
                        status={reloading ? IConStatus.ACTIVE : IConStatus.INIT}
                      />
                    </Toolbar>
                    <div style={{ height: `calc(100vh - ${40 + 28 + 46 + 39}px)` }}>
                      <SQLCodeEditorDDL
                        readOnly
                        initialValue={pkg.packageBody.basicInfo.ddl}
                        language={`sql-oceanbase-${isMySQL ? 'mysql' : 'oracle'}`}
                        onEditorCreated={(editor: IEditor) => {
                          this.editor_body = editor;
                        }}
                      />
                    </div>
                  </TabPane>
                  {/* <TabPane
                  tab={formatMessage({
                  id: 'workspace.window.table.propstab.reffer',
                  })}
                  key={PropsTab.PACKAGE_BODY_REFFER}
                  >
                  <Content> {pkg.packageBody.basicInfo.refer} </Content>
                  </TabPane>
                  <TabPane
                  tab={formatMessage({
                  id: 'workspace.window.table.propstab.reffered',
                  })}
                  key={PropsTab.PACKAGE_BODY_REFFERED}
                  >
                  <Content> {pkg.packageBody.basicInfo.referd} </Content>
                  </TabPane> */}
                </Tabs>
              </TabPane>
            ) : null}
          </Tabs>
        </Content>
      </>
    );
  }
}
