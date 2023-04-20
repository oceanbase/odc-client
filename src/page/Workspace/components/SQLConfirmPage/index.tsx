import { getFunctionByFuncName, getProcedureByProName } from '@/common/network';
import { getSequence } from '@/common/network/sequence';
import { executeSQL } from '@/common/network/sql';
import { getSynonym } from '@/common/network/synonym';
import { getTriggerByName } from '@/common/network/trigger';
import { getType } from '@/common/network/type';
import CommonIDE from '@/component/CommonIDE';
import {
  ConnectionMode,
  ISqlExecuteResultStatus,
  PageType,
  TriggerPropsTab,
  TypePropsTab,
} from '@/d.ts';
import {
  openCreateTriggerPage,
  openFunctionViewPage,
  openPackageViewPage,
  openProcedureViewPage,
  openSequenceViewPage,
  openSynonymViewPage,
  openTriggerViewPage,
  openTypeViewPage,
  updatePage,
} from '@/store/helper/page';
import { formatMessage } from '@/util/intl';
import { getPLEntryName } from '@/util/parser';
import { getSQLEntryName } from '@/util/parser/sql/core';
import { CloseCircleFilled } from '@ant-design/icons';
import { Button, message, Modal, Space } from 'antd';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { TopTab } from '../PackagePage';
import styles from './index.less';
import type { IProps, IState } from './type';

@inject('sqlStore', 'pageStore', 'sessionManagerStore')
@observer
export default class SQLConfirmPage extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      sql: props.params?.sql,
      log: '',
      hasChange: false,
      loading: false,
    };
  }

  private isPL = () => {
    return ![PageType.CREATE_SYNONYM, PageType.CREATE_SEQUENCE].includes(this.props.params?.type);
  };

  private getNameBySQL = (sql: string) => {
    const {
      params: { type, sessionId, dbName },
      sessionManagerStore,
    } = this.props;
    const session = sessionManagerStore.sessionMap.get(sessionId);
    const isOracle = session.connection.dialectType === ConnectionMode.OB_ORACLE;
    let name;
    if (!this.isPL()) {
      // 同义词不处于 PL 文件中，需要用 SQL 来解析
      name = getSQLEntryName(sql) || '';
    } else {
      name = getPLEntryName(sql) || '';
    }
    if (isOracle) {
      name = name.startsWith('"') ? name : name.toUpperCase();
    }
    // 对象名称包含""调用接口无效
    return isOracle ? _.trim(name, '"') : _.trim(name, '`');
  };
  private execute: (
    sql: string,
    type: PageType,
  ) => Promise<{
    isSuccess: boolean;
    errMsg: string;
  }> = async (sql, type) => {
    const { sessionId, dbName } = this.props.params;
    let isSuccess = false;
    let errMsg = '';
    const split = ![
      PageType.CREATE_TYPE,
      PageType.CREATE_PACKAGE,
      PageType.CREATE_FUNCTION,
      PageType.CREATE_PROCEDURE,
      PageType.CREATE_SYNONYM,
      PageType.CREATE_TRIGGER_SQL,
    ].includes(type);
    const result = await executeSQL({ sql, split }, sessionId, dbName);
    isSuccess = result?.[0]?.status === ISqlExecuteResultStatus.SUCCESS;
    errMsg = result?.[0]?.track;
    return {
      isSuccess,
      errMsg,
    };
  };
  private handleSubmit = async () => {
    const {
      pageStore,
      sessionManagerStore,
      pageKey,
      params: { type, synonymType, isPackageBody, sessionId, dbName },
    } = this.props;
    const session = sessionManagerStore.sessionMap.get(sessionId);
    const { sql } = this.state;
    this.setState({
      loading: true,
    });
    try {
      const { isSuccess, errMsg } = await this.execute(sql, type);
      if (isSuccess) {
        const name = this.getNameBySQL(sql);
        pageStore.close(pageKey); // todo 改为配置的方式
        switch (type) {
          case PageType.CREATE_TRIGGER_SQL: {
            message.success(
              formatMessage(
                {
                  id: 'odc.components.SQLConfirmPage.TheNameTriggerWasCreated',
                },

                { name },
              ),
              // `${name} 触发器创建成功`
            ); // 刷新对应的资源树

            await session.database.getTriggerList(); // 名称验证，验证通过直接跳转至详情页

            this.handleCheckName(name, PageType.TRIGGER);
            return;
          }
          case PageType.CREATE_SYNONYM: {
            message.success(
              name +
                formatMessage({
                  id: 'odc.components.SQLConfirmPage.SynonymCreatedSuccessfully',
                }), // 同义词创建成功
            );
            await session.database.getSynonymList();
            this.handleCheckName(name, PageType.SYNONYM, { synonymType });
            return;
          }
          case PageType.CREATE_TYPE: {
            message.success(
              formatMessage(
                {
                  id: 'odc.components.SQLConfirmPage.NameTypeCreated',
                },

                { name },
              ),
              // `${name} 类型创建成功`
            ); // 刷新对应的资源树

            await session.database.getTypeList();
            this.handleCheckName(name, PageType.TYPE);
            return;
          }
          case PageType.CREATE_PACKAGE: {
            if (isPackageBody) {
              message.success(
                formatMessage({
                  id: 'workspace.window.createPackageBody.success',
                }),
              );
            } else {
              message.success(
                formatMessage({
                  id: 'workspace.window.createPackage.success',
                }),
              );
            }
            await session.database!.getPackageList();
            this.handleCheckName(name, PageType.PACKAGE);
            return;
          }
          case PageType.CREATE_SEQUENCE: {
            message.success(
              formatMessage(
                {
                  id: 'odc.components.SQLConfirmPage.SequenceNameCreated',
                },
                { name },
              ), // `创建序列 ${name} 成功`
            );
            await session.database.getSequenceList();
            this.handleCheckName(name, PageType.SEQUENCE);
            return;
          }
          case PageType.CREATE_FUNCTION: {
            message.success(formatMessage({ id: 'workspace.window.createFunction.success' }));
            await session.database.getFunctionList();
            this.handleCheckName(name, PageType.FUNCTION);
            return;
          }
          case PageType.CREATE_PROCEDURE: {
            message.success(formatMessage({ id: 'workspace.window.createProcedure.success' }));
            await session.database.getProcedureList();
            this.handleCheckName(name, PageType.PROCEDURE);
            return;
          }
        }
      } else {
        this.setState({
          log: errMsg,
          loading: false,
        });
      }
    } catch (e) {
      console.trace(e);
    }
  };
  /**
   * 名称验证，验证通过直接跳转至详情页
   */

  private handleCheckName = async (
    name: string,
    pageType: PageType,
    options?: Record<string, any>,
  ) => {
    const { sessionManagerStore, params } = this.props;
    const { sessionId, dbName } = params;
    const session = sessionManagerStore.sessionMap.get(sessionId);

    switch (pageType) {
      case PageType.TRIGGER: {
        const trigger = await getTriggerByName(name, sessionId, dbName);
        if (trigger) {
          openTriggerViewPage(
            name,
            TriggerPropsTab.DDL,
            trigger.enableState,
            trigger,
            sessionId,
            dbName,
          );
        }
        return;
      }
      case PageType.TYPE: {
        const type = await getType(name, true, dbName, sessionId);
        if (type) {
          openTypeViewPage(name, TypePropsTab.DDL, sessionId, dbName);
        }
        return;
      }
      case PageType.SYNONYM: {
        const synonym = await getSynonym(name, options?.synonymType, sessionId, dbName);
        if (synonym) {
          openSynonymViewPage(name, options?.synonymType, sessionId, dbName);
        }
        return;
      }
      case PageType.PACKAGE: {
        const pkg = await session.database.loadPackage(name, true);
        if (pkg) {
          openPackageViewPage(
            name,
            params.isPackageBody ? TopTab.BODY : TopTab.HEAD,
            true,
            dbName,
            sessionId,
          );
        }
        return;
      }
      case PageType.SEQUENCE: {
        const sequence = await getSequence(name, sessionId, dbName);
        if (sequence) {
          openSequenceViewPage(name, undefined, sessionId, dbName);
        }
        return;
      }
      case PageType.FUNCTION: {
        const func = await getFunctionByFuncName(name, true, sessionId, dbName);
        if (func) {
          openFunctionViewPage(name, undefined, undefined, sessionId, dbName);
        }
        return;
      }
      case PageType.PROCEDURE: {
        const procedure = await getProcedureByProName(name, true, sessionId, dbName);
        if (procedure) {
          openProcedureViewPage(name, undefined, undefined, sessionId, dbName);
        }
      }
    }
  };
  private handlePre = () => {
    const {
      params: { type },
    } = this.props;
    const { hasChange } = this.state;

    if (type === PageType.CREATE_TRIGGER_SQL) {
      if (hasChange) {
        Modal.confirm({
          title: formatMessage({
            id: 'odc.components.SQLConfirmPage.AreYouSureYouWant',
          }), // 确认要返回上一步吗？
          content: formatMessage({
            id: 'odc.components.SQLConfirmPage.IfYouReturnToThe',
          }), // 若返回上一步，当前编辑的代码将不会生效且不保存
          centered: true,
          onOk: () => {
            this.handleGotoPre();
          },
        });
      } else {
        this.handleGotoPre();
      }
    }
  };
  private handleGotoPre = async () => {
    const {
      params: { preData, sessionId, dbName },
      pageStore,
      pageKey,
    } = this.props;
    await pageStore.close(pageKey);
    await openCreateTriggerPage(preData, sessionId, dbName);
  };
  private handleSqlChange = (sql: string) => {
    this.setState(
      {
        sql,
        hasChange: true,
      },
      this.syncPageParams,
    );
  };
  private syncPageParams = _.debounce(() => {
    updatePage(this.props.pageKey, { sql: this.state.sql }, false);
  }, 200);
  private getLogEle = (log: string) => {
    return (
      <div className={styles.errorLog}>
        <Space>
          <CloseCircleFilled
            style={{
              color: '#ff4d4f',
            }}
          />

          <span>
            {
              formatMessage({
                id: 'odc.components.SQLConfirmPage.ExecuteDdlError',
              }) /* 执行DDL出错 */
            }
          </span>
        </Space>
        <div className={styles.log}>{log}</div>
      </div>
    );
  };

  public render() {
    const {
      params: { hasPre, sessionId, dbName },
      sessionManagerStore,
    } = this.props;
    const session = sessionManagerStore.sessionMap.get(sessionId);
    const { sql, log, loading } = this.state;
    const isMySQL = session?.connection.dialectType === ConnectionMode.OB_MYSQL;
    const logEle = log ? this.getLogEle(log) : null;
    return (
      <>
        <CommonIDE
          language={`${isMySQL ? 'obmysql' : 'oboracle'}`}
          initialSQL={sql}
          log={logEle}
          onSQLChange={this.handleSqlChange}
          toolbarActions={
            <Space>
              {hasPre && (
                <Button onClick={this.handlePre}>
                  {
                    formatMessage({
                      id: 'odc.components.SQLConfirmPage.PreviousStep',
                    }) /* 上一步 */
                  }
                </Button>
              )}
              <Button type="primary" onClick={this.handleSubmit} loading={loading}>
                {
                  formatMessage({
                    id: 'odc.components.SQLConfirmPage.Create',
                  }) /* 创建 */
                }
              </Button>
            </Space>
          }
        />
      </>
    );
  }
}
