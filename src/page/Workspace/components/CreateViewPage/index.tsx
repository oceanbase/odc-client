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

import { getViewCreateSQL } from '@/common/network/view';
import { IEditor } from '@/component/MonacoEditor';
import ScriptPage from '@/component/ScriptPage';
import { ConnectionMode, ICreateView, ICreateViewColumn, ICreateViewViewUnit } from '@/d.ts';
import { openViewViewPage } from '@/store/helper/page';
import { CreateViewPage as CreateViewPageModel } from '@/store/helper/page/pages/create';
import { PageStore } from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { getRealTableName } from '@/util/sql';
import { CheckOutlined, CloseCircleFilled, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Collapse, Layout, message, Tabs } from 'antd';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { FormattedMessage } from '@umijs/max';
import SessionContext from '../SessionContextWrap/context';
import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
import { PropsTab, TopTab } from '../ViewPage';
import BaseInfoForm from './component/BaseInfoForm';
import ColumnSelector from './component/ColumnSelector';
import TableSelector from './component/TableSelector';
import styles from './index.less';
import { getDataSourceModeConfig } from '@/common/datasource';

const { TabPane } = Tabs;
const { Content } = Layout;
const { Panel } = Collapse;
const RESULT_HEIGHT = 230;

enum EnumStep {
  BASEINFO = 'BASEINFO',
  SELECT_TABLES = 'SELECT_TABLES',
  SELECT_COLUMNS = 'SELECT_COLUMNS',
  CONFIRM_SQL = 'CONFIRM_SQL',
  SQL_PAGE = 'SQL_PAGE',
}

enum EnumStepStatus {
  UNSAVED = 'UNSAVED',
  SAVED = 'SAVED',
  EDITING = 'EDITING',
  ERROR = 'ERROR',
}

interface IProps {
  sqlStore: SQLStore;
  pageStore: PageStore;
  sessionManagerStore: SessionManagerStore;
  pageKey: string;
  viewName: string;
  checkOption: string;
  viewUnits: ICreateViewViewUnit[];
  operations: string[];
  resultHeight: number;
  params: CreateViewPageModel['pageParams'];
}

@inject('sqlStore', 'sessionManagerStore', 'pageStore')
@observer
class CreateViewPage extends Component<
  IProps & { session?: SessionStore },
  {
    activeStepKey: EnumStep;
    sql?: string;
    viewName: string;
    resultHeight: number;
    checkOption: string;
    viewUnits: ICreateViewViewUnit[];
    customColumns: ICreateViewColumn[];
    operations: string[];
    stepsData: object;
  }
> {
  public readonly state = {
    activeStepKey: EnumStep.BASEINFO,
    sql: '',
    resultHeight: RESULT_HEIGHT,
    viewName: '',
    checkOption: '',
    viewUnits: [],
    colums: [],
    customColumns: [],
    operations: [],
    stepsData: {},
  };

  public editor: IEditor;

  private sql: string;

  public render() {
    return (
      <>
        {this.renderSQLPanel()}
        {this.renderStepPanel()}
      </>
    );
  }

  public handleSwitchToSteps = () => {
    this.setState({
      activeStepKey: EnumStep.CONFIRM_SQL,
    });
  };

  public handleCreateView = async () => {
    const { sqlStore, pageKey, pageStore, params, sessionManagerStore, session } = this.props;
    const { sql } = this;
    if (!sql || !sql.replace(/\s/g, '')) {
      return;
    }

    const results = await sqlStore.executeSQL(
      sql,
      pageKey,
      false,
      session?.sessionId,
      session?.odcDatabase?.name,
    );
    if (results?.invalid || !results?.executeResult?.length) {
      return;
    }
    const { dbObjectName: viewName, track } = results.executeResult[0];
    if (!track) {
      message.success(
        formatMessage(
          {
            id: 'odc.components.CreateViewPage.TheViewViewnameHasBeen',
          },

          { viewName },
        ),
        // `创建视图 ${viewName} 成功!`
        2,
      );

      await session?.database.getViewList();
      pageStore.close(pageKey);
      /**
       * sql-execute 返回的还是不区分大小写，所以需要自己处理一下
       */
      let realViewName = getRealTableName(
        viewName,
        session?.connection.dialectType === ConnectionMode.OB_ORACLE,
      );
      if (
        session?.database.views.find((view) => {
          return view.viewName === realViewName;
        })
      ) {
        openViewViewPage(
          realViewName,
          TopTab.PROPS,
          PropsTab.DDL,
          session?.odcDatabase?.id,
          session?.odcDatabase?.name,
        );
      }
    }
  };

  private renderSQLPanel = () => {
    const { activeStepKey } = this.state;
    const session = this.props.session;
    if (activeStepKey !== EnumStep.SQL_PAGE) {
      return null;
    }

    return (
      <ScriptPage
        ctx={this}
        session={session}
        language={getDataSourceModeConfig(session?.connection?.type)?.sql?.language}
        toolbar={{
          loading: false,
          actionGroupKey: 'VIEW_CREATE_ACTION_GROUP',
        }}
        editor={{
          readOnly: false,
          defaultValue: this.sql,
          onValueChange: this.handleSQLChanged,
          onEditorCreated: this.handleEditorCreated,
        }}
        Result={this.renderResultPanel()}
        Others={[]}
      />
    );
  };

  // 2021-02-07: 泛秋：如存在相同表｜视图，需要具备不同别名
  private isNeedFillAliasName(viewUnits) {
    const viewUnitsMap = {};
    for (let i = 0, len = viewUnits.length; i < len; i++) {
      const { tableName, viewName, dbName, aliasName } = viewUnits[i];
      const uid = `d=${dbName}${aliasName ? `a=${aliasName}` : ''}${
        viewName ? `v=${viewName}` : ''
      }${tableName ? `t=${tableName}` : ''}`;
      if (!viewUnitsMap[uid]) {
        viewUnitsMap[uid] = true;
      } else {
        const _t = `${viewName || tableName}(${dbName})`;
        message.warn(
          formatMessage(
            {
              id: 'odc.components.CreateViewPage.MultipleTExistYouNeed',
            },
            { t: _t },
          ), // `存在多个${_t}, 需要设置不同别名`
        );
        return;
      }
    }
  }

  private renderStepPanel = () => {
    const { activeStepKey, viewName, viewUnits } = this.state;
    const { sessionManagerStore, params, session } = this.props;
    const steps = [
      {
        key: EnumStep.BASEINFO,
        title: formatMessage({
          id: 'odc.components.CreateViewPage.BasicInformation',
        }),
        // 基本信息
        required: true,
        render() {
          return (
            <BaseInfoForm
              connectionMode={session?.connection.dialectType}
              onSubmit={(values) => {
                this.setState(
                  {
                    viewName: values.viewName,
                    checkOption: values.checkOption,
                  },

                  () => {
                    this.handleActiveNextStep(activeStepKey, steps);
                  },
                );
              }}
            />
          );
        },
      },

      {
        key: EnumStep.SELECT_TABLES,
        title: formatMessage({
          id: 'odc.components.CreateViewPage.BaseTableSelection',
        }),
        // 基表选择
        required: false,
        render() {
          return (
            <TableSelector
              session={session}
              onSubmit={(res) => {
                const { viewUnits, operations } = res;
                // 如存在相同表｜视图，需要具备不同别名
                if (this.isNeedFillAliasName(viewUnits)) {
                  return;
                }
                this.setState(
                  {
                    viewUnits,
                    operations,
                  },

                  () => {
                    this.handleActiveNextStep(activeStepKey, steps);
                  },
                );
              }}
            />
          );
        },
      },

      {
        key: EnumStep.SELECT_COLUMNS,
        title: formatMessage({
          id: 'odc.components.CreateViewPage.FieldSelection',
        }),
        // 字段选择
        required: false,
        onShow() {
          if (!viewUnits.length) {
            message.warn(
              formatMessage({
                id: 'odc.components.CreateViewPage.SelectABaseTableFirst',
              }),
              // 请先选择基表
            );
          }
        },
        render() {
          return (
            <ColumnSelector
              session={session}
              viewUnits={this.state.viewUnits}
              onSubmit={(colums) => {
                this.setState({ colums }, () => {
                  this.handleActiveNextStep(activeStepKey, steps);
                });
              }}
            />
          );
        },
      },

      {
        key: EnumStep.CONFIRM_SQL,
        title: formatMessage({
          id: 'odc.components.CreateViewPage.NextConfirmTheSqlStatement',
        }),
        // 下一步：确认 SQL
        required: true,
      },
    ];

    const lastStep = steps[steps.length - 1];
    return (
      <Content
        style={{
          padding: 24,
          display: activeStepKey === EnumStep.SQL_PAGE ? 'none' : '',
        }}
      >
        <Collapse
          className={styles.collapse}
          accordion
          activeKey={activeStepKey}
          onChange={(stepkey: EnumStep) => {
            const step = steps.find((step) => step.key === stepkey);
            this.handleStepChanged(step);
          }}
        >
          {steps.map((step, index) => {
            if (!step.render) {
              return null;
            }
            step.render = step.render?.bind(this);
            const stepStatus =
              activeStepKey === step.key
                ? EnumStepStatus.EDITING
                : !this.state.stepsData[step.key]
                ? EnumStepStatus.UNSAVED
                : EnumStepStatus.SAVED;

            return (
              <Panel
                key={step.key}
                showArrow={false}
                header={this.renderStepHeader({
                  status: stepStatus,
                  text: (
                    <>
                      {step.title}
                      {!step.required ? (
                        <span className={styles.optional}>
                          {
                            formatMessage({
                              id: 'odc.components.CreateViewPage.Optional',
                            })
                            /* （选填） */
                          }
                        </span>
                      ) : null}
                    </>
                  ),
                })}
                style={{
                  background: 'var(--background-secondry-color)',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <Content>{step.render()}</Content>
              </Panel>
            );
          })}
        </Collapse>
        <Button
          onClick={this.getCreateSql}
          type="primary"
          disabled={!viewName}
          style={{ marginTop: '-4px' }}
        >
          {lastStep.title}
        </Button>
      </Content>
    );
  };

  private renderStepHeader = ({
    status,
    text,
  }: {
    status: EnumStepStatus;
    text: string | React.ReactNode;
  }) => {
    const collapseHeaderIconMap = {
      [EnumStepStatus.EDITING]: EditOutlined,
      [EnumStepStatus.SAVED]: CheckOutlined,
      [EnumStepStatus.UNSAVED]: CheckOutlined,
      [EnumStepStatus.ERROR]: CloseOutlined,
    };
    const Icon = collapseHeaderIconMap[status];
    return (
      <>
        <span className={classNames(styles.icon, styles[status.toLowerCase()])}>
          <Icon />
        </span>
        <span className={styles.title}>{text}</span>
      </>
    );
  };

  private renderResultPanel = () => {
    const {
      sqlStore: { records },
    } = this.props;
    const result = records.length ? records[0] : null;
    const errStack = result?.track;
    const executeSql = result?.executeSql;
    if (!errStack) {
      return null;
    }
    return (
      <Tabs
        style={{ width: '100%' }}
        activeKey="SQL_EXEC_RESULT"
        tabBarGutter={0}
        className={styles.tabs}
        animated={false}
      >
        <TabPane
          tab={formatMessage({ id: 'odc.components.CreateViewPage.Result' })}
          /* 运行结果 */ key="SQL_EXEC_RESULT"
        >
          <div className={styles.result}>
            <CloseCircleFilled style={{ color: '#F5222D', marginRight: 8 }} />
            <FormattedMessage id="workspace.window.sql.result.failure" />
            <div className={styles.executedSQL}>{executeSql}</div>
            <div className={styles.failReason}>
              <FormattedMessage id="workspace.window.sql.result.failureReason" />
            </div>
            <div className={styles.track}>{errStack}</div>
          </div>
        </TabPane>
      </Tabs>
    );
  };

  private handleStepChanged = (step) => {
    if (!step) {
      return;
    }
    this.setState(
      {
        activeStepKey: step.key,
      },

      () => {
        step.onShow && step.onShow();
      },
    );
  };

  private handleSQLChanged = (sql: string) => {
    this.sql = sql;
  };

  private handleEditorCreated = (editor: IEditor) => {
    this.editor = editor;
  };

  private handleActiveNextStep = (activeStepKey, steps) => {
    const currectIndex = steps.findIndex((step) => step.key === activeStepKey);
    const nextRequiredSteps = steps.filter((step, index) => index > currectIndex && step.required);
    const nextStep = nextRequiredSteps[nextRequiredSteps.length - 1];
    this.setState({
      stepsData: {
        ...this.state.stepsData,
        [activeStepKey]: true,
      },

      activeStepKey: nextStep?.key,
    });
  };

  private getCreateSql = async () => {
    const { sqlStore, params, session } = this.props;
    const { viewName, checkOption, operations, viewUnits, colums } = this.state;
    const reqCreateView: ICreateView = {
      viewName,
      checkOption,
      operations,
      viewUnits: viewUnits.map((unit) => {
        return {
          dbName: unit.dbName,
          // 2021-01-14 闻牛：接口需要适配， 表和视图名称统一用 tableName, 表和视图别名统一用 tableAliasName
          tableName: unit.tableName || unit.viewName,
          tableAliasName: unit.aliasName,
        };
      }),
      createColumns: (colums || []).map((col) => {
        return {
          columnName: col.columnName,
          dbName: col.dbName,
          aliasName: col.aliasName,
          tableName: col.tableName || col.viewName,
          tableAliasName: col.tableOrViewAliasName,
        };
      }),
    };

    const sql = await getViewCreateSQL(
      reqCreateView,
      session?.sessionId,
      session?.odcDatabase?.name,
    );
    if (sql) {
      sqlStore.clearExecuteRecords();
      this.sql = sql;
      this.setState({
        activeStepKey: EnumStep.SQL_PAGE,
      });
    }
  };
}

export default WrapSessionPage(
  function CreateViewPageWrap(props: IProps) {
    return (
      <SessionContext.Consumer>
        {({ session }) => {
          return <CreateViewPage {...props} session={session} />;
        }}
      </SessionContext.Consumer>
    );
  },
  false,
  true,
);
