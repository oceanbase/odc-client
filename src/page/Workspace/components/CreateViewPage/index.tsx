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

import { inject, observer } from 'mobx-react';
import React, { useState } from 'react';
import { SQLStore } from '@/store/sql';
import { PageStore } from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
import { ConnectionMode, ICreateView, ICreateViewColumn, ICreateViewViewUnit } from '@/d.ts';
import { CreateViewPage as CreateViewPageModel } from '@/store/helper/page/pages/create';
import { formatMessage } from '@/util/intl';
import SessionStore from '@/store/sessionManager/session';
import { Button, Collapse, Layout, message, Space, Tabs, Typography } from 'antd';
import styles from './index.less';
import { CheckOutlined, CloseCircleFilled, CloseOutlined, EditOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { getViewCreateSQL } from '@/common/network/view';
import BaseInfoForm from './component/BaseInfoForm';
import ColumnSelector from './component/ColumnSelector';
import TableSelector from './component/TableSelector';
import { omit } from 'lodash';
import ScriptPage from '@/component/ScriptPage';
import { getDataSourceModeConfig } from '@/common/datasource';
import { IEditor } from '@/component/MonacoEditor';
import { getRealTableName } from '@/util/sql';
import { openViewViewPage } from '@/store/helper/page';
import { PropsTab, TopTab } from '../ViewPage';
import SessionContext from '../SessionContextWrap/context';
import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
import DBPermissionTableContent from '../DBPermissionTableContent';
import { IUnauthorizedDBResources } from '@/d.ts/table';

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
  session?: SessionStore;
}
const { Text } = Typography;
const CreateViewPage: React.FC<IProps> = inject(
  'sqlStore',
  'sessionManagerStore',
  'pageStore',
)(
  observer((props) => {
    const [state, setState] = useState({
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
    });

    const [editor, setEditor] = useState<IEditor>();
    const [sql, setSql] = useState<string>();
    const [createCheckResults, setCreateCheckResults] = useState<{
      unauthorizedDBResources: IUnauthorizedDBResources[];
      unauthorizedSql?: string;
    }>();

    const handleCreateView = async () => {
      const { sqlStore, pageKey, pageStore, params, sessionManagerStore, session } = props;
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
      setCreateCheckResults(results);
      if (results?.invalid || !results?.executeResult?.length) {
        return;
      }
      const { dbObjectName: viewName, track } = results.executeResult[0];
      if (!track) {
        message.success(
          formatMessage(
            {
              id: 'odc.components.CreateViewPage.TheViewViewnameHasBeen',
              defaultMessage: '创建视图 {viewName} 成功!',
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

    const handleSwitchToSteps = () => {
      setState({
        ...state,
        activeStepKey: EnumStep.CONFIRM_SQL,
      });
    };

    const handleStepChanged = (step) => {
      if (!step) {
        return;
      }
      setState({ ...state, activeStepKey: step.key });
      step.onShow && step.onShow();
    };

    const renderStepHeader = ({
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

    const handleActiveNextStep = (object, steps) => {
      const currectIndex = steps.findIndex((step) => step.key === object.activeStepKey);
      const nextRequiredSteps = steps.filter(
        (step, index) => index > currectIndex && step.required,
      );
      const nextStep = nextRequiredSteps[nextRequiredSteps.length - 1];
      setState({
        ...state,
        ...omit(object, 'activeStepKey'),
        stepsData: {
          ...state.stepsData,
          [object.activeStepKey]: true,
        },
        activeStepKey: nextStep?.key,
      });
    };

    const getCreateSql = async () => {
      const { sqlStore, params, session } = props;
      const { viewName, checkOption, operations, viewUnits, colums } = state;
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

      let sql = await getViewCreateSQL(
        reqCreateView,
        session?.sessionId,
        session?.odcDatabase?.name,
      );
      if (sql) {
        sqlStore.clearExecuteRecords();
        setSql(sql);
        setState({
          ...state,
          activeStepKey: EnumStep.SQL_PAGE,
        });
      }
    };

    const renderStepPanel = () => {
      const { activeStepKey, viewName, viewUnits } = state;
      const { sessionManagerStore, params, session } = props;
      const steps = [
        {
          key: EnumStep.BASEINFO,
          title: formatMessage({
            id: 'odc.components.CreateViewPage.BasicInformation',
            defaultMessage: '基本信息',
          }),
          // 基本信息
          required: true,
          render() {
            return (
              <BaseInfoForm
                connectionMode={session?.connection.dialectType}
                onSubmit={(values) => {
                  const object = {
                    viewName: values.viewName,
                    checkOption: values.checkOption,
                    activeStepKey,
                  };
                  handleActiveNextStep(object, steps);
                }}
              />
            );
          },
        },

        {
          key: EnumStep.SELECT_TABLES,
          title: formatMessage({
            id: 'odc.components.CreateViewPage.BaseTableSelection',
            defaultMessage: '基表选择',
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
                  if (isNeedFillAliasName(viewUnits)) {
                    return;
                  }
                  const object = {
                    activeStepKey,
                    viewUnits,
                    operations,
                  };
                  handleActiveNextStep(object, steps);
                }}
              />
            );
          },
        },

        {
          key: EnumStep.SELECT_COLUMNS,
          title: formatMessage({
            id: 'odc.components.CreateViewPage.FieldSelection',
            defaultMessage: '字段选择',
          }),
          // 字段选择
          required: false,
          onShow() {
            if (!viewUnits.length) {
              message.warning(
                formatMessage({
                  id: 'odc.components.CreateViewPage.SelectABaseTableFirst',
                  defaultMessage: '请先选择基表',
                }),
                // 请先选择基表
              );
            }
          },
          render() {
            return (
              <ColumnSelector
                session={session}
                viewUnits={state.viewUnits}
                onSubmit={(colums) => {
                  const object = {
                    colums,
                    activeStepKey,
                  };
                  handleActiveNextStep(object, steps);
                }}
              />
            );
          },
        },

        {
          key: EnumStep.CONFIRM_SQL,
          title: formatMessage({
            id: 'odc.components.CreateViewPage.NextConfirmTheSqlStatement',
            defaultMessage: '下一步：确认 SQL',
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
            onChange={(stepkeys: EnumStep[]) => {
              const step = steps.find((step) => stepkeys.includes(step.key));
              handleStepChanged(step);
            }}
          >
            {steps.map((step, index) => {
              if (!step.render) {
                return null;
              }
              step.render;
              const stepStatus =
                activeStepKey === step.key
                  ? EnumStepStatus.EDITING
                  : !state.stepsData[step.key]
                  ? EnumStepStatus.UNSAVED
                  : EnumStepStatus.SAVED;

              return (
                <Panel
                  key={step.key}
                  showArrow={false}
                  header={renderStepHeader({
                    status: stepStatus,
                    text: (
                      <>
                        {step.title}
                        {!step.required ? (
                          <span className={styles.optional}>
                            {
                              formatMessage({
                                id: 'odc.components.CreateViewPage.Optional',
                                defaultMessage: '（选填）',
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
            onClick={getCreateSql}
            type="primary"
            disabled={!viewName}
            style={{ marginTop: '-4px' }}
          >
            {lastStep.title}
          </Button>
        </Content>
      );
    };

    // 2021-02-07: 泛秋：如存在相同表｜视图，需要具备不同别名
    const isNeedFillAliasName = (viewUnits) => {
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
          message.warning(
            formatMessage(
              {
                id: 'odc.components.CreateViewPage.MultipleTExistYouNeed',
                defaultMessage: '存在多个{t}, 需要设置不同别名',
              },
              { t: _t },
            ), // `存在多个${_t}, 需要设置不同别名`
          );
          return true;
        }
      }
      return false;
    };
    const renderResultPanel = () => {
      const {
        sqlStore: { records },
      } = props;
      const result = records.length ? records[0] : null;
      const errStack = result?.track;
      const executeSql = result?.executeSql;

      const { unauthorizedDBResources, unauthorizedSql } = createCheckResults || {};

      if (!errStack && !unauthorizedDBResources) {
        return null;
      }
      const renderErrStack = () => {
        return (
          <div className={styles.result}>
            <CloseCircleFilled style={{ color: '#F5222D', marginRight: 8 }} />
            {formatMessage({
              id: 'workspace.window.sql.result.failure',
              defaultMessage: '执行以下 SQL 失败',
            })}
            <div key="2" className={styles.executedSQL}>
              {executeSql}
            </div>
            <div className={styles.failReason}>
              {formatMessage({
                id: 'workspace.window.sql.result.failureReason',
                defaultMessage: '失败原因：',
              })}
            </div>
            <div className={styles.track}>{errStack}</div>
          </div>
        );
      };

      const renderDbPermissionTable = () => {
        return (
          <div className={styles.result}>
            <CloseCircleFilled style={{ color: '#F5222D', marginRight: 8 }} />
            {formatMessage({
              id: 'workspace.window.sql.result.failure',
              defaultMessage: '执行以下 SQL 失败',
            })}
            <div key="1" className={styles.executedSQL}>
              {unauthorizedSql}
            </div>

            <Space direction="vertical">
              <div className={styles.failReason}>
                {formatMessage({
                  id: 'workspace.window.sql.result.failureReason',
                  defaultMessage: '失败原因：',
                })}
              </div>
              <Text type="secondary">
                {formatMessage({
                  id: 'src.page.Workspace.components.SQLResultSet.DDB9284D',
                  defaultMessage: '缺少以下数据库表对应权限，请先申请权限',
                })}
              </Text>
            </Space>
            <div className={styles.track}>
              <DBPermissionTableContent showAction dataSource={unauthorizedDBResources} />
            </div>
          </div>
        );
      };
      return (
        <Tabs
          style={{ width: '100%' }}
          activeKey="SQL_EXEC_RESULT"
          tabBarGutter={0}
          className={styles.tabs}
          animated={false}
          items={[
            {
              key: 'SQL_EXEC_RESULT',
              label: formatMessage({
                id: 'odc.components.CreateViewPage.Result',
                defaultMessage: '运行结果',
              }),
              children: unauthorizedDBResources ? renderDbPermissionTable() : renderErrStack(),
            },
          ]}
        />
      );
    };

    const handleSQLChanged = (sql: string) => {
      setSql(sql);
    };

    const handleEditorCreated = (editor: IEditor) => {
      setEditor(editor);
    };

    const renderSQLPanel = () => {
      const { activeStepKey } = state;
      const session = props.session;

      if (activeStepKey !== EnumStep.SQL_PAGE) {
        return null;
      }

      return (
        <ScriptPage
          ctx={{
            state,
            editor,
            pageKey: props.pageKey,
            sqlStore: props.sqlStore,
            pageStore: props.pageStore,
            handleCreateView,
            handleSwitchToSteps,
            getCreateSql,
          }}
          session={session}
          language={getDataSourceModeConfig(session?.connection?.type)?.sql?.language}
          toolbar={{
            loading: false,
            actionGroupKey: 'VIEW_CREATE_ACTION_GROUP',
          }}
          showSessionSelect={false}
          editor={{
            readOnly: false,
            defaultValue: sql,
            onValueChange: handleSQLChanged,
            onEditorCreated: handleEditorCreated,
          }}
          Result={renderResultPanel()}
          Others={[]}
        />
      );
    };

    return (
      <>
        {renderSQLPanel()}
        {renderStepPanel()}
      </>
    );
  }),
);

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
