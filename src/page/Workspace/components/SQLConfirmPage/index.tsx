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
import SessionStore from '@/store/sessionManager/session';
import { formatMessage } from '@/util/intl';
import { getPLEntryName } from '@/util/parser';
import { getSQLEntryName } from '@/util/parser/sql/core';
import { CloseCircleFilled } from '@ant-design/icons';
import { Button, message, Modal, Space } from 'antd';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { TopTab } from '../PackagePage';
import SessionContext from '../SessionContextWrap/context';
import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
import styles from './index.less';
import type { IProps, IState } from './type';
import { getDataSourceModeConfig } from '@/common/datasource';

@inject('sqlStore', 'pageStore', 'sessionManagerStore')
@observer
class SQLConfirmPage extends Component<IProps & { session: SessionStore }, IState> {
  constructor(props: IProps & { session: SessionStore }) {
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
    const { session } = this.props;
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
    const dbName = this.props.session?.odcDatabase?.name;
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
    const result = await executeSQL({ sql, split }, this.props?.session?.sessionId, dbName);
    if (result?.invalid || !result) {
      return {
        isSuccess: false,
        errMsg: '',
      };
    }
    isSuccess = result?.executeResult?.[0]?.status === ISqlExecuteResultStatus.SUCCESS;
    errMsg = result?.executeResult?.[0]?.track;
    return {
      isSuccess,
      errMsg,
    };
  };
  private handleSubmit = async () => {
    const {
      pageStore,
      session,
      pageKey,
      params: { type, synonymType, isPackageBody },
    } = this.props;
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
            this.handleCheckName(name, PageType.SEQUENCE);
            return;
          }
          case PageType.CREATE_FUNCTION: {
            message.success(formatMessage({ id: 'workspace.window.createFunction.success' }));
            this.handleCheckName(name, PageType.FUNCTION);
            return;
          }
          case PageType.CREATE_PROCEDURE: {
            message.success(formatMessage({ id: 'workspace.window.createProcedure.success' }));
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
    const { params, session } = this.props;
    const dbName = this.props.session?.odcDatabase?.name;
    const sessionId = session?.sessionId;
    const databaseId = session?.odcDatabase?.id;
    switch (pageType) {
      case PageType.TRIGGER: {
        const trigger = await getTriggerByName(name, session?.sessionId, dbName);
        if (trigger) {
          openTriggerViewPage(
            name,
            TriggerPropsTab.DDL,
            trigger.enableState,
            trigger,
            session?.odcDatabase?.id,
            dbName,
          );
        }
        return;
      }
      case PageType.TYPE: {
        const type = await getType(name, true, dbName, session?.sessionId);
        if (type) {
          openTypeViewPage(name, TypePropsTab.DDL, session?.odcDatabase?.id, dbName);
        }
        return;
      }
      case PageType.SYNONYM: {
        const synonym = await getSynonym(name, options?.synonymType, sessionId, dbName);
        if (synonym) {
          openSynonymViewPage(name, options?.synonymType, session?.odcDatabase?.id, dbName);
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
            databaseId,
          );
        }
        return;
      }
      case PageType.SEQUENCE: {
        const sequence = await getSequence(name, sessionId, dbName);
        if (sequence) {
          openSequenceViewPage(name, undefined, session?.odcDatabase?.id, dbName);
        }
        return;
      }
      case PageType.FUNCTION: {
        const func = await getFunctionByFuncName(name, true, sessionId, dbName);
        if (func) {
          openFunctionViewPage(name, undefined, undefined, session?.odcDatabase?.id, dbName);
        }
        return;
      }
      case PageType.PROCEDURE: {
        const procedure = await getProcedureByProName(name, true, sessionId, dbName);
        if (procedure) {
          openProcedureViewPage(name, undefined, undefined, session?.odcDatabase?.id, dbName);
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
      params: { preData },
      session,
      pageStore,
      pageKey,
    } = this.props;
    const dbName = this.props.session?.odcDatabase?.name;
    await pageStore.close(pageKey);
    await openCreateTriggerPage(preData, session?.odcDatabase?.id, dbName);
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
      params: { hasPre },
      session,
      sessionManagerStore,
    } = this.props;
    const { sql, log, loading } = this.state;
    const logEle = log ? this.getLogEle(log) : null;
    return (
      <>
        <CommonIDE
          session={session}
          language={getDataSourceModeConfig(session?.connection?.type)?.sql?.language}
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

export default WrapSessionPage(function Component(props: IProps) {
  return (
    <SessionContext.Consumer>
      {({ session }) => {
        return <SQLConfirmPage {...props} session={session} />;
      }}
    </SessionContext.Consumer>
  );
});
