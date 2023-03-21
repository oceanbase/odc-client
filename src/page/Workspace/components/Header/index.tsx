import { getTypeCreateSQL } from '@/common/network/type';
import { AcessResult, withWorkspaceCreateAcess } from '@/component/Acess';
import CreatePackageModal from '@/component/CreatePackageModal';
import CreateSynonymModal from '@/component/CreateSynonymModal';
import CreateTypeModal from '@/component/CreateTypeModal';
import DropdownMenu from '@/component/DropdownMenu';
import HeaderBtn from '@/component/HeaderBtn';
import HelpMenus from '@/component/HelpMenus';
import LocalMenus from '@/component/LocalMenus';
import LoginMenus from '@/component/LoginMenus';
import RecordPopover from '@/component/RecordPopover';
import TaskPopover from '@/component/TaskPopover';
import ThemeBtn from '@/component/ThemeBtn';
import appConfig from '@/constant/appConfig';
import { IDatabase, IPackage, ISynonym, ITypeForm } from '@/d.ts';
import { hasSourceReadAuth } from '@/page/Manage';
import commonStore, { CommonStore } from '@/store/common';
import { ConnectionStore } from '@/store/connection';
import {
  openCreatePackagePage,
  openCreateSynonymPage,
  openCreateTablePage,
  openCreateTriggerPage,
  openCreateTypePage,
  openCreateViewPage,
  openRecycleBin,
  openSessionManagePage,
  openSessionParamsPage,
} from '@/store/helper/page';
import { UserStore } from '@/store/login';
import modal, { ModalStore } from '@/store/modal';
import { PageStore } from '@/store/page';
import schema, { SchemaStore } from '@/store/schema';
import { SettingStore } from '@/store/setting';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Menu, Select, Spin } from 'antd';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import { MenuInfo } from 'rc-menu/lib/interface';
import { Component } from 'react';
import { FormattedMessage, history } from 'umi';
import ConnectionItem from './ConnectionItem';
import HomeMenu from './homeMenu';
import styles from './index.less';
import WorkbenchMenu from './WorkbenchMenu';

const { Option } = Select;
enum MenuKey {
  CREATE_TABLE = 'CREATE_TABLE',
  CREATE_VIEW = 'CREATE_VIEW',
  CREATE_FUNCTION = 'CREATE_FUNCTION',
  CREATE_PROCEDURE = 'CREATE_PROCEDURE',
  CREATE_SEQUENCE = 'CREATE_SEQUENCE',
  CREATE_PACKAGE = 'CREATE_PACKAGE',
  CREATE_SESSION_PARAMS = 'CREATE_SESSION_PARAMS',
  // 会话参数
  CREATE_SESSION_MANAGEMENT = 'CREATE_SESSION_MANAGEMENT',
  // 会话管理
  CREATE_TRIGGER = 'CREATE_TRIGGER',
  // 触发器
  CREATE_TYPE = 'CREATE_TYPE',
  // 类型
  CREATE_SYNONYM = 'CREATE_SYNONYM',
  // 同义词
  IMPORT = 'IMPORT',
  // 导入
  EXPORT = 'EXPORT',
  MOCK = 'MOCK',
  ASYNC = 'ASYNC',
  PARTITION = 'PARTITION',
  SQL_PLAN = 'SQL_PLAN',
  SHADOW = 'SHADOW',
}

@inject(
  'connectionStore',
  'pageStore',
  'schemaStore',
  'userStore',
  'commonStore',
  'modalStore',
  'settingStore',
)
@observer
class Header extends Component<
  {
    connectionStore?: ConnectionStore;
    pageStore?: PageStore;
    schemaStore?: SchemaStore;
    userStore?: UserStore;
    modalStore?: ModalStore;
    commonStore?: CommonStore;
    settingStore?: SettingStore;
  } & Partial<AcessResult>,
  {
    showCreateViewModal: boolean;
    showCreatePackageModal: boolean;
    showCreateSynonymModal: boolean;
    showCreateTypeModal: boolean;
  }
> {
  public readonly state = {
    showCreateViewModal: false,
    showCreatePackageModal: false,
    showCreateSynonymModal: false,
    showCreateTypeModal: false,
    exportTables: [],
  };

  public handleDatabaseChange = async (dbName: string) => {
    const { schemaStore, pageStore, connectionStore } = this.props;

    if (connectionStore && schemaStore && pageStore) {
      await schemaStore.selectDatabase(dbName);
      pageStore.clearExceptResidentPages();
      history.push(
        `/workspace/session/${commonStore.tabKey}/sid:${connectionStore.sessionId}:d:${dbName}`,
      );
    }
  };
  /** 打开 会话参数 页面 */

  public handleOpenSessionParamPage = () => {
    openSessionParamsPage();
  };
  /** 打开 会话管理 页面 */

  public handleOpenSessionManagementPage = () => {
    const {
      pageStore,
      connectionStore: { connection },
    } = this.props;
    openSessionManagePage();
  };
  /** 打开 回收站 页面 */

  public handleOpenRecycleBinPage = () => {
    const {
      pageStore,
      connectionStore: { connection },
    } = this.props;
    openRecycleBin();
  };

  public handleShowExportDrawer = async () => {
    const { modalStore } = this.props;
    modalStore.changeExportModal();
  };

  public handleClickMenu = (clickParam: MenuInfo) => {
    const { modalStore } = this.props;

    switch (clickParam.key) {
      case MenuKey.CREATE_TABLE:
        openCreateTablePage();
        break;

      case MenuKey.CREATE_VIEW:
        openCreateViewPage();
        break;

      case MenuKey.CREATE_FUNCTION:
        modalStore.changeCreateFunctionModalVisible(true);
        break;

      case MenuKey.CREATE_PROCEDURE:
        modalStore.changeCreateProcedureModalVisible(true);
        break;

      case MenuKey.CREATE_SEQUENCE:
        this.handleOpenCreateSequencePage();
        break;

      case MenuKey.CREATE_PACKAGE:
        this.setState({
          showCreatePackageModal: true,
        });

        break;

      case MenuKey.CREATE_SESSION_PARAMS:
        this.handleOpenSessionParamPage();
        break;

      case MenuKey.CREATE_SESSION_MANAGEMENT:
        this.handleOpenSessionManagementPage();
        break;

      case MenuKey.CREATE_TRIGGER:
        openCreateTriggerPage();
        break;

      case MenuKey.CREATE_TYPE:
        this.setState({
          showCreateTypeModal: true,
        });

        break;

      case MenuKey.CREATE_SYNONYM:
        this.setState({
          showCreateSynonymModal: true,
        });

        break;

      case MenuKey.IMPORT:
        modal.changeImportModal(true);
        break;

      case MenuKey.EXPORT:
        this.handleShowExportDrawer();
        break;
      case MenuKey.MOCK:
        modalStore.changeDataMockerModal(true);
        break;
      case MenuKey.SHADOW:
        modalStore.changeShadowSyncVisible(true);
        break;
      case MenuKey.ASYNC:
        modalStore.changeCreateAsyncTaskModal(true);
        break;
      case MenuKey.PARTITION:
        modalStore.changePartitionModal(true);
        break;
      case MenuKey.SQL_PLAN:
        modalStore.changeCreateSQLPlanTaskModal(true);
        break;
      default:
    }
  };

  public handleOpenCreateSequencePage = () => {
    this.props.modalStore.changeCreateSequenceModalVisible(true);
  };

  public handleCreatePackage = async (pkg: IPackage) => {
    const { packageName } = pkg;
    const { schemaStore, pageStore, connectionStore } = this.props;
    const sql = await schemaStore?.getPackageCreateSQL(packageName);
    this.setState(
      {
        showCreatePackageModal: false,
      },

      () => {
        openCreatePackagePage(sql);
      },
    );
  };

  public handleCreateSynonym = async (synonym: ISynonym) => {
    const { schemaStore } = this.props;
    const sql = await schemaStore!.getSynonymCreateSQL(synonym.synonymName, synonym);
    this.setState(
      {
        showCreateSynonymModal: false,
      },

      () => {
        openCreateSynonymPage(sql, synonym.synonymType);
      },
    );
  };

  public handleCreateType = async (type: ITypeForm) => {
    const sql = await getTypeCreateSQL(type.typeName, type);
    this.setState(
      {
        showCreateTypeModal: false,
      },

      () => {
        openCreateTypePage(sql);
      },
    );
  };

  public render() {
    const {
      connectionStore: { connection, sessionId },
      settingStore,
      schemaStore: {
        databases,
        database,
        enableFunction,
        enableProcedure,
        enableView,
        enableSequence,
        enablePackage,
        enablePLDebug,
        switchingDatabase,
        enableTrigger,
        enableType,
        enableSynonym,
        enableAsync,
        enableDBExport,
        enableDBImport,
        enableMockData,
        enableShadowSync,
        enablePartitionPlan,
      },

      accessible,
    } = this.props;
    const { showCreatePackageModal, showCreateSynonymModal, showCreateTypeModal } = this.state;
    const allowCreateDBObject = !!(database && database.name && accessible);
    const isReadonly = hasSourceReadAuth(connection.permittedActions);

    const { clusterName = '', tenantName = '' } = window._odc_params || {};
    const createMenu = (
      <Menu
        style={{
          minWidth: '120px',
        }}
        onClick={this.handleClickMenu}
      >
        <Menu.Item key={MenuKey.CREATE_TABLE} disabled={!allowCreateDBObject}>
          <FormattedMessage id="workspace.header.create.table" />
        </Menu.Item>
        <Menu.Item key={MenuKey.CREATE_VIEW} disabled={!allowCreateDBObject || !enableView}>
          <FormattedMessage id="workspace.header.create.view" />
        </Menu.Item>
        <Menu.Item key={MenuKey.CREATE_FUNCTION} disabled={!allowCreateDBObject || !enableFunction}>
          <FormattedMessage id="workspace.header.create.function" />
        </Menu.Item>
        <Menu.Item
          key={MenuKey.CREATE_PROCEDURE}
          disabled={!allowCreateDBObject || !enableProcedure}
        >
          <FormattedMessage id="workspace.header.create.procedure" />
        </Menu.Item>
        <Menu.Item key={MenuKey.CREATE_PACKAGE} disabled={!allowCreateDBObject || !enablePackage}>
          <FormattedMessage id="workspace.header.create.package" />
        </Menu.Item>
        <Menu.Item key={MenuKey.CREATE_TRIGGER} disabled={!allowCreateDBObject || !enableTrigger}>
          {formatMessage({ id: 'odc.components.Header.Trigger' }) /* 触发器 */}
        </Menu.Item>
        <Menu.Item key={MenuKey.CREATE_TYPE} disabled={!allowCreateDBObject || !enableType}>
          {formatMessage({ id: 'odc.components.Header.Type' }) /* 类型 */}
        </Menu.Item>
        <Menu.Item key={MenuKey.CREATE_SEQUENCE} disabled={!allowCreateDBObject || !enableSequence}>
          <FormattedMessage id="workspace.header.create.sequence" />
        </Menu.Item>
        <Menu.Item key={MenuKey.CREATE_SYNONYM} disabled={!allowCreateDBObject || !enableSynonym}>
          {formatMessage({ id: 'odc.components.Header.Synonyms' }) /* 同义词 */}
        </Menu.Item>
      </Menu>
    );

    // 会话菜单，包含会话管理 和 会话属性

    const sessionMenu = (
      <Menu
        style={{
          minWidth: '120px',
        }}
        onClick={this.handleClickMenu}
      >
        <Menu.Item key={MenuKey.CREATE_SESSION_PARAMS}>
          <FormattedMessage id="workspace.header.session.params" />
        </Menu.Item>
        <Menu.Item key={MenuKey.CREATE_SESSION_MANAGEMENT}>
          <FormattedMessage id="workspace.header.session.management" />
        </Menu.Item>
      </Menu>
    );

    // 工具菜单，目前包括导入、导出

    const toolsMenu = (
      <Menu
        style={{
          minWidth: '120px',
        }}
        onClick={this.handleClickMenu}
      >
        {enableDBImport ? (
          <Menu.Item key={MenuKey.IMPORT}>
            <FormattedMessage id="workspace.header.tools.import" />
          </Menu.Item>
        ) : null}
        {enableDBExport && (
          <Menu.Item key={MenuKey.EXPORT}>
            <FormattedMessage id="workspace.header.tools.export" />
          </Menu.Item>
        )}

        {enableMockData ? (
          <Menu.Item key={MenuKey.MOCK}>
            {
              formatMessage({
                id: 'odc.components.Header.AnalogData',
              })

              /* 模拟数据 */
            }
          </Menu.Item>
        ) : null}
        {enablePartitionPlan ? (
          <Menu.Item key={MenuKey.PARTITION}>
            {
              formatMessage({
                id: 'odc.components.Header.PartitionPlan',
              })
              /*分区计划*/
            }
          </Menu.Item>
        ) : null}
        {enableAsync ? (
          <Menu.Item key={MenuKey.ASYNC}>
            {
              formatMessage({
                id: 'odc.components.Header.DatabaseChanges',
              })

              /*数据库变更*/
            }
          </Menu.Item>
        ) : null}
        {!!enableShadowSync && (
          <Menu.Item key={MenuKey.SHADOW}>
            {
              formatMessage({
                id: 'odc.components.Header.ShadowTableSynchronization',
              })
              /*影子表同步*/
            }
          </Menu.Item>
        )}
        {!isClient() && (
          <Menu.Item key={MenuKey.SQL_PLAN}>
            {
              formatMessage({
                id: 'odc.components.Header.SqlPlan',
              }) /*SQL 计划*/
            }
          </Menu.Item>
        )}
      </Menu>
    );

    return (
      <>
        <Spin spinning={switchingDatabase}>
          <div className={classNames([styles.header])}>
            <div className={styles.leftContent}>
              <HomeMenu />
              <div className={styles.divider} />
              <ConnectionItem />
              <div className={styles.divider} />
              <Select
                bordered={false}
                showSearch
                value={database && database.name}
                style={{
                  minWidth: 100,
                  maxWidth: 192,
                }}
                dropdownClassName={styles.selectMenu}
                onChange={this.handleDatabaseChange}
              >
                {databases?.map?.((d: IDatabase) => (
                  <Option key={d.name} value={d.name}>
                    {d.name}
                  </Option>
                ))}
              </Select>
              <div className={styles.divider} />
              <DropdownMenu overlay={createMenu}>
                <FormattedMessage id="workspace.header.create" />
              </DropdownMenu>
              <WorkbenchMenu />
              <DropdownMenu overlay={toolsMenu}>
                <FormattedMessage id="workspace.header.tools" />
              </DropdownMenu>
              <DropdownMenu overlay={sessionMenu}>
                <FormattedMessage id="workspace.header.session" />
              </DropdownMenu>
              {schema.enableRecycleBin && (
                <HeaderBtn onClick={this.handleOpenRecycleBinPage}>
                  <FormattedMessage id="workspace.header.recycle" />
                </HeaderBtn>
              )}
            </div>
            <div className={styles.rightContent}>
              <TaskPopover enabledCreate={true} />
              {settingStore.enablePersonalRecord ? <RecordPopover /> : null}
              <div className={styles.divider} />
              <HelpMenus placement="bottomLeft" />
              <ThemeBtn />
              {appConfig.locale.menu ? <LocalMenus /> : null}
              {appConfig.login.menu ? (
                <>
                  <div className={styles.divider} />
                  <LoginMenus />
                </>
              ) : null}
            </div>
          </div>
        </Spin>
        <CreatePackageModal
          model={{}}
          visible={showCreatePackageModal}
          onCancel={() =>
            this.setState({
              showCreatePackageModal: false,
            })
          }
          onSave={this.handleCreatePackage as any}
        />

        {allowCreateDBObject && sessionId && (
          <CreateSynonymModal
            model={{}}
            sessionId={sessionId}
            visible={showCreateSynonymModal}
            schemaStore={this.props.schemaStore}
            onCancel={() =>
              this.setState({
                showCreateSynonymModal: false,
              })
            }
            onSave={this.handleCreateSynonym}
          />
        )}

        <CreateTypeModal
          model={{}}
          visible={showCreateTypeModal}
          onCancel={() =>
            this.setState({
              showCreateTypeModal: false,
            })
          }
          onSave={this.handleCreateType}
        />
      </>
    );
  }
}

export default withWorkspaceCreateAcess(Header);
