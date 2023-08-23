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

import { formatMessage } from '@/util/intl';
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import { Col, Empty, Row, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
// @ts-ignore
import DisplayTable from '@/component/DisplayTable';
import { PLType } from '@/constant/plType';
import { ConnectionMode, IFormatPLSchema, IPLParam, ParamMode } from '@/d.ts';
import type { Debug } from '@/store/debug';
import { useDebugContext } from '@/store/debug/hooks';
import { DebugStatus, IDebugFunctionResult } from '@/store/debug/type';
import SessionStore from '@/store/sessionManager/session';
import { cloneDeep, isArray } from 'lodash';
import { inject, observer } from 'mobx-react';
import SplitPane from 'react-split-pane';
import { IResultData, IResultType } from '../PLPage';
import Breakpoints from './breakpoints';
import CursorCell from './CursorCell';
import DebugLog from './DebugLog';
import DebugVariables from './DebugVariables';
import styles from './index.less';

const { TabPane } = Tabs;

interface IProps {
  session: SessionStore;
  type: IResultType;
  data: IResultData;
  resultHeight: number;
  plSchema: IFormatPLSchema;
  debug?: Debug;
  removeBreakPoints: (
    points: {
      line: number;
      plName: string;
      plType: PLType;
      packageName: string;
    }[],
  ) => Promise<boolean>;
  gotoBreakPoint: (lineNum: number, plName: string, plType: PLType, packageName: string) => void;
}

const PLDebugResultSet: React.FC<IProps> = (props) => {
  const { type, debug, session } = props;
  /**
   * 监听 debug 改变
   */
  useDebugContext(debug);
  const [activeTabKey, setActiveTabKey] = useState('');
  const [activeRightTabKey, setActiveRightTabKey] = useState('');

  useEffect(() => {
    if (debug?.status === DebugStatus.FAIL) {
      setActiveRightTabKey('DEBUG_LOG');
    }
  }, [debug?.status]);

  // 渲染编译结果
  function renderCompileResultPanel() {
    const { type, data = {} } = props;
    let status = data.COMPILE.status ? 'SUCCESS' : 'FAIL';
    if (status === 'SUCCESS' && data.COMPILE?.statementWarnings) {
      status = 'WARNING';
    }
    const tabs = [
      {
        name: formatMessage({
          id: 'odc.components.PLDebugResultSet.CompilationResult',
        }),

        key: 'COMPLIE_RESULT',
        renderTabContent() {
          if (!data.COMPILE) {
            return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
          }
          const resInfo = {
            SUCCESS: {
              icon: <CheckCircleFilled style={{ color: '#52C41A' }} />,
              text: formatMessage({
                id: 'odc.components.PLDebugResultSet.CompiledSuccessfully',
              }),
            },

            WARNING: {
              icon: <ExclamationCircleFilled style={{ color: '#faad14' }} />,
              text: formatMessage({
                id: 'odc.components.PLDebugResultSet.CompiledSuccessfullyWithAnAlert',
              }), // 编译成功，存在告警信息
            },
            FAIL: {
              icon: <CloseCircleFilled style={{ color: '#FF1A2E' }} />,
              text: formatMessage({
                id: 'odc.components.PLDebugResultSet.CompilationFailed',
              }),
            },
          };

          const info = resInfo[status];
          return (
            <div className={styles.execWrap}>
              <p>
                {info.icon} {info.text}
              </p>
              {status === 'WARNING' && (
                <div>
                  {
                    formatMessage({
                      id: 'odc.components.PLDebugResultSet.AlertDetails',
                    }) /* 告警详情： */
                  }
                </div>
              )}
              <div>{data.COMPILE.track}</div>
            </div>
          );
        },
      },
    ];

    return renderTabArea(tabs);
  }

  // 渲染运行结果
  function renderExecResultPanel() {
    const { resultHeight, type, data = {}, plSchema } = props;
    const { plType } = plSchema || {};
    const hasPLName = [PLType.FUNCTION, PLType.PROCEDURE].includes(plType);
    const tabs = [
      {
        name: formatMessage({ id: 'odc.components.PLDebugResultSet.Result' }),
        key: 'EXEC_RESULT',
        renderTabContent() {
          if (!data?.EXEC) {
            return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
          }
          const statusMap = {
            SUCCESS: {
              icon: <CheckCircleFilled style={{ color: '#52C41A' }} />,
              text: formatMessage({
                id: 'odc.components.PLDebugResultSet.RunSuccessfully',
              }),
            },

            FAIL: {
              icon: <CloseCircleFilled style={{ color: '#FF1A2E' }} />,
              text: formatMessage({
                id: 'odc.components.PLDebugResultSet.FailedToRun',
              }),
            },
          };

          const { errorMessage = '', status } = data.EXEC || {};
          const formatStatus = status !== 'FAIL' ? 'SUCCESS' : 'FAIL';
          const statusInfo = statusMap[formatStatus];
          const paramsColumns = [
            {
              dataIndex: 'paramName',
              title: formatMessage({
                id: 'odc.components.PLDebugResultSet.Parameter',
              }),
            },

            {
              dataIndex: 'paramMode',
              title: formatMessage({
                id: 'odc.components.PLDebugResultSet.Type',
              }),
            },

            {
              dataIndex: 'value',
              title: formatMessage({
                id: 'odc.components.PLDebugResultSet.Value',
              }),
              render(v, record) {
                const isOracle = session?.connection.dialectType === ConnectionMode.OB_ORACLE;
                let text;
                if (v === null || (isOracle && v === '')) {
                  text = <span style={{ color: 'var(--text-color-hint)' }}>(null)</span>;
                } else {
                  text = v;
                }
                return (
                  <div className={styles.textFormatter}>
                    {text}
                    {record?.dataType?.toLowerCase() === 'sys_refcursor' &&
                      !!record?.cursorResultSet && (
                        <div className={styles.more}>
                          <CursorCell session={session} record={record} />
                        </div>
                      )}
                  </div>
                );
              },
            },
          ];

          const paramsValues = [];
          // if (plSchema?.params?.length) {
          //   plSchema.params.map((param) => {
          //     if (param.paramMode?.toUpperCase().indexOf('IN') > -1) {
          //       paramsValues.push({
          //         ...param,
          //         paramMode: 'IN',
          //       });
          //     }
          //   });
          // }
          data?.EXEC?.outParams?.forEach((param) => {
            paramsValues.push({
              ...param,
              paramMode: 'OUT',
            });
          });

          const returnValueColumns = [
            {
              dataIndex: 'returnType',
              title: formatMessage({
                id: 'odc.components.PLDebugResultSet.ResponseType',
              }),
            },

            {
              dataIndex: 'returnValue',
              title: formatMessage({
                id: 'odc.components.PLDebugResultSet.ReturnValue',
              }),
            },
          ];

          const returnValues = data?.EXEC?.returnValue
            ? [
                {
                  returnType: data.EXEC.returnValue.dataType,
                  returnValue: data.EXEC.returnValue.value,
                },
              ]
            : [];

          return (
            <div className={styles.execWrap}>
              <p>
                {statusInfo?.icon} {statusInfo?.text} {errorMessage}
              </p>
              {hasPLName && (
                <Row>
                  <Col span={10} style={{ marginRight: 15 }}>
                    <DisplayTable
                      rowKey={(r: any, i: number) => {
                        return `${r.paramName}.${r.paramMode}-${i}`;
                      }}
                      bordered={true}
                      columns={paramsColumns}
                      dataSource={paramsValues.filter(Boolean)}
                      disablePagination={true}
                    />
                  </Col>
                  <Col span={5}>
                    <DisplayTable
                      rowKey="returnType"
                      bordered={true}
                      columns={returnValueColumns}
                      dataSource={returnValues.filter(Boolean)}
                      disablePagination={true}
                    />
                  </Col>
                </Row>
              )}
            </div>
          );
        },
      },

      {
        name: formatMessage({
          id: 'odc.components.PLDebugResultSet.DbmsOutput',
        }),

        key: 'EXEC_DBMS',
        renderTabContent() {
          if (!data?.DBMS || !data.DBMS.line) {
            return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
          }
          return <div className={styles['dbms-output']}>{data.DBMS.line}</div>;
        },
      },
    ];

    return renderTabArea(tabs);
  }

  // 渲染调试结果
  function renderDebugResultPanel() {
    const { data = {}, plSchema } = props;
    console.log('[renderDebugResultPanel]', data);
    const leftTabs = [
      {
        name: formatMessage({
          id: 'odc.components.PLDebugResultSet.Parameter',
        }),

        key: 'PARAMS',
        renderTabContent: () => {
          const executeRecordColumns = [
            {
              dataIndex: 'paramName',
              title: formatMessage({
                id: 'odc.components.PLDebugResultSet.Parameter.1',
              }),
            },

            {
              dataIndex: 'paramMode',
              title: formatMessage({
                id: 'odc.components.PLDebugResultSet.Mode',
              }),
            },

            {
              dataIndex: 'dataType',
              title: formatMessage({
                id: 'odc.components.PLDebugResultSet.DataType',
              }),
            },

            {
              dataIndex: 'defaultValue',
              title: formatMessage({
                id: 'odc.components.PLDebugResultSet.Value',
              }),
            },
          ];

          const resultParams = props.debug?.result;
          const initParams = props.debug?.getPlSchema()?.params;
          let dataSource = cloneDeep(
            isArray(resultParams)
              ? resultParams
              : initParams?.filter((item) => item?.paramMode?.includes('OUT')),
          );
          if (props.debug?.isDebugEnd() && props.debug?.plType === PLType.FUNCTION) {
            dataSource = []
              .concat(dataSource)
              .concat({
                paramName: 'return',
                paramMode: 'returnMode',
                dataType: (props.debug?.result as IDebugFunctionResult)?.returnType,
                defaultValue: (props.debug?.result as IDebugFunctionResult)?.returnValue,
                seqNum: 9999,
              })
              .filter(Boolean);
            (resultParams as IDebugFunctionResult)?.params?.forEach((param) => {
              const { paramName, paramMode, defaultValue } = param;
              if (paramMode === ParamMode.OUT || paramMode === ParamMode.INOUT) {
                const target = (dataSource as IPLParam[]).find(
                  (item) => item?.paramName === paramName && item?.paramMode === paramMode,
                );
                if (target) target.defaultValue = defaultValue;
              }
            });
          }
          if (!dataSource?.length) {
            return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
          }
          return (
            <DisplayTable
              rowKey="seqNum"
              bordered={true}
              columns={executeRecordColumns}
              dataSource={dataSource}
              disablePagination={true}
            />
          );
        },
      },

      {
        name: formatMessage({
          id: 'odc.components.PLDebugResultSet.StacksAndVariables',
        }),

        key: 'TRACK_AND_VARIABLE',
        renderTabContent: () => {
          return <DebugVariables debug={props.debug} />;
        },
      },

      {
        name: formatMessage({
          id: 'odc.components.PLDebugResultSet.DbmsOutput',
        }),

        key: 'DBMS',
        renderTabContent: () => {
          const dbms = props.debug?.dbms;
          if (!dbms) {
            return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
          }
          return <div className={styles['dbms-output']}>{dbms}</div>;
        },
      },
    ];

    const rightTabs = [
      {
        name: formatMessage({
          id: 'odc.components.PLDebugResultSet.Breakpoint',
        }),

        key: 'BREAK_POINT',
        renderTabContent: () => {
          return (
            <Breakpoints
              gotoBreakPoint={props.gotoBreakPoint}
              removeBreakPoints={props.removeBreakPoints}
              debug={props.debug}
            />
          );
        },
      },

      {
        name: formatMessage({
          id: 'odc.components.PLDebugResultSet.DebuggingLogs',
        }),

        key: 'DEBUG_LOG',
        renderTabContent: () => {
          return <DebugLog debug={props.debug} />;
        },
      },
    ];

    return (
      <div className={styles.plDebugResults}>
        <SplitPane split="vertical" defaultSize="60%" minSize={136} maxSize={-200}>
          {renderTabArea(leftTabs, 'LEFT')}
          {renderTabArea(rightTabs, 'RIGHT')}
        </SplitPane>
      </div>
    );
  }

  function renderTabArea(tabs, pos?: string) {
    const { type } = props;
    const tabPosition = pos || 'LEFT';
    const isLeft = tabPosition === 'LEFT';
    const tabCfg = {
      className: styles.tabs,
      animated: false,
      activeKey: '',
      tabBarGutter: 0,
      onChange: null,
    };

    if (isLeft) {
      tabCfg.activeKey = activeTabKey || (type == 'DEBUG' ? tabs[1].key : tabs[0].key);
      tabCfg.onChange = handleChangeTab;
    } else {
      tabCfg.activeKey = activeRightTabKey || tabs[0].key;
      tabCfg.onChange = handleChangeRightTab;
    }
    return (
      <Tabs {...tabCfg}>
        {tabs.map((cfg) => {
          const { name, key, renderTabContent } = cfg;
          return (
            <TabPane tab={name} key={key}>
              {renderTabContent()}
            </TabPane>
          );
        })}
      </Tabs>
    );
  }

  function handleChangeTab(activeTabKey: string) {
    setActiveTabKey(activeTabKey);
  }

  function handleChangeRightTab(activeRightTabKey: string) {
    setActiveRightTabKey(activeRightTabKey);
  }

  if (type === 'COMPILE') {
    return renderCompileResultPanel();
  }

  if (type === 'EXEC') {
    return renderExecResultPanel();
  }

  if (type === 'DEBUG') {
    return renderDebugResultPanel();
  }
  return renderExecResultPanel();
};

export default inject('userStore', 'pageStore')(observer(PLDebugResultSet));
