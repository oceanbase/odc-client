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

import { getFullLinkTrace } from '@/common/network/sql';
import DisplayTable from '@/component/DisplayTable';
import { ISQLExplain } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { CodeOutlined, ProfileOutlined } from '@ant-design/icons';
import { Checkbox, Empty, Modal, Radio, Table, Tooltip } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { FormattedMessage } from '@umijs/max';
import { getSqlExplainColumns } from './column';
import styles from './index.less';
import { SQLExplainProps, SQLExplainState, TAB_NAME } from './interface';
import Trace, { parseTraceTree } from './Trace';
import { ColumnsType } from 'antd/es/table';

@inject('sqlStore', 'userStore', 'pageStore')
@observer
export default class SQLExplain extends Component<SQLExplainProps, SQLExplainState> {
  constructor(props: SQLExplainProps) {
    super(props);
    this.state = {
      tabName: TAB_NAME.SUMMARY,
      onlyText: false,
      tableHeight: this.props.tableHeight || 0,
      showExplainText: !!props.haveText,
      treeData: [],
      startTimestamp: 0,
      endTimestamp: 0,
    };
  }
  public getTraceData = async () => {
    const { session, traceId, sql } = this.props;
    if (traceId) {
      const rawData = await getFullLinkTrace(session?.sessionId, session?.database?.dbName, {
        sql: sql,
        tag: traceId,
      });
      const resData = parseTraceTree(rawData?.data);
      // @ts-ignore
      resData.isRoot = true;
      this.setState({
        treeData: [resData],
        startTimestamp: resData.startTimestamp,
        endTimestamp: resData.endTimestamp,
      });
    }
  };

  public componentDidMount() {
    if (!this.state.tableHeight) {
      const tableHeight = window.innerHeight - 170;
      this.setState({
        tableHeight,
      });
    }
  }

  public componentDidUpdate(
    prevProps: Readonly<SQLExplainProps>,
    prevState: Readonly<SQLExplainState>,
    snapshot?: any,
  ): void {
    const {
      session: {
        params: { obVersion },
      },
    } = this.props;
    if (this.state.tabName !== prevState.tabName) {
      if (this.state.tabName === TAB_NAME.TRACE) {
        if (obVersion.startsWith('4.') && parseInt(obVersion?.[2]) >= 1) {
          this.getTraceData();
        } else {
          this.setState({
            treeData: [],
            startTimestamp: 0,
            endTimestamp: 0,
          });
        }
      }
    }
  }

  public handleShowOutputFilter = (filterContent: string) => {
    Modal.info({
      width: 720,
      title: formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.columns.output',
      }),
      content: (
        <div
          style={{
            maxHeight: 'calc(100vh - 300px)',
            overflowY: 'auto',
          }}
        >
          {filterContent}
        </div>
      ),

      maskClosable: true,
      okText: formatMessage({
        id: 'app.button.ok',
      }),
    });
  };

  public render() {
    const { explain, sql, haveText, traceId } = this.props;
    const {
      tabName,
      onlyText,
      tableHeight,
      showExplainText,
      treeData,
      startTimestamp,
      endTimestamp,
    } = this.state;
    const columns = getSqlExplainColumns({
      handleShowOutputFilter: this.handleShowOutputFilter,
    });
    return (
      <>
        <div className={styles.header}>
          <div className={styles.sql}>
            <Tooltip title={sql}>SQL: {sql}</Tooltip>
          </div>
          {haveText && (
            // 切换显示方式
            <span
              style={{
                fontSize: 14,
              }}
            >
              {showExplainText ? (
                <ViewFormattingInformation
                  onClick={() => {
                    this.setState({
                      showExplainText: false,
                    });
                  }}
                />
              ) : (
                <ViewPlanText
                  onClick={() => {
                    this.setState({
                      showExplainText: true,
                    });
                  }}
                />
              )}
            </span>
          )}
        </div>
        {
          // 是否仅查看文本格式
          showExplainText ? (
            <OnlyExplainText originalText={(explain as ISQLExplain)?.originalText} />
          ) : (
            <RadioSwitchContainer
              onlyText={onlyText}
              explain={explain}
              columns={columns}
              tableHeight={tableHeight}
              endTimestamp={endTimestamp}
              startTimestamp={startTimestamp}
              treeData={treeData}
              tabName={tabName}
              traceId={traceId}
              handleSummaryOnChange={(e: CheckboxChangeEvent) => {
                this.setState({
                  onlyText: e.target.checked,
                });
              }}
              handleRadioGroupOnChange={(e) =>
                this.setState({
                  tabName: e.target.value,
                })
              }
            />
          )
        }
      </>
    );
  }
}
const OnlyExplainText: React.FC<{
  originalText: string;
}> = ({ originalText = '' }) => {
  return (
    <pre
      style={{
        padding: 12,
        height: 'calc(100vh - 158px)',
        backgroundColor: 'var(--background-tertraiy-color)',
        color: 'var(--text-color-primary)',
        overflow: 'auto',
        marginBottom: 0,
      }}
    >
      {originalText}
    </pre>
  );
};
const Summary: React.FC<{
  onlyText: boolean;
  explain: string | ISQLExplain;
  columns: ColumnsType<any>[];
  tableHeight: number;
  handleSummaryOnChange: (e: CheckboxChangeEvent) => void;
}> = ({ onlyText, explain, columns, tableHeight, handleSummaryOnChange }) => {
  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '8px',
        }}
      >
        <div>
          <Checkbox checked={onlyText} onChange={handleSummaryOnChange}>
            {
              formatMessage({
                id: 'odc.components.SQLExplain.ViewOnlyTextFormats',
              }) /*仅查看文本格式*/
            }
          </Checkbox>
        </div>
      </div>
      {onlyText ? (
        <div className={styles.outline}>{explain && (explain as ISQLExplain).outline}</div>
      ) : (
        <>
          {typeof explain === 'string' ? (
            <>
              <Empty />
            </>
          ) : (
            explain?.tree && (
              <DisplayTable
                rowKey="operator"
                bordered={true}
                expandable={{
                  defaultExpandAllRows: true,
                }}
                scroll={{
                  x: 1400,
                  y: tableHeight,
                }}
                columns={columns}
                dataSource={explain && explain.tree ? explain.tree : []}
                disablePagination={true}
              />
            )
          )}
        </>
      )}
    </>
  );
};
const RadioSwitchContainer: React.FC<{
  tabName: string;
  onlyText: boolean;
  explain: string | ISQLExplain;
  columns: any[];
  tableHeight: number;
  traceId?: string;
  endTimestamp: number;
  startTimestamp: number;
  treeData: any[];
  handleSummaryOnChange: (e: CheckboxChangeEvent) => void;
  handleRadioGroupOnChange: (e: any) => void;
}> = ({
  tabName,
  onlyText,
  explain,
  columns,
  tableHeight,
  traceId,
  endTimestamp,
  startTimestamp,
  treeData,
  handleSummaryOnChange,
  handleRadioGroupOnChange,
}) => {
  return (
    <>
      <Radio.Group
        value={tabName}
        onChange={handleRadioGroupOnChange}
        className={styles.radioGroup}
      >
        <Radio.Button value={TAB_NAME.SUMMARY}>
          <FormattedMessage id="workspace.window.sql.explain.tab.summary" />
        </Radio.Button>
        {traceId && (
          <Radio.Button value={TAB_NAME.TRACE}>
            {
              formatMessage({
                id: 'odc.components.SQLExplain.FullLinkTrace',
              }) /*全链路 TRACE*/
            }
          </Radio.Button>
        )}
      </Radio.Group>
      <div
        style={{
          display: tabName === TAB_NAME.SUMMARY ? 'block' : 'none',
        }}
      >
        <Summary
          onlyText={onlyText}
          explain={explain}
          columns={columns}
          tableHeight={tableHeight}
          handleSummaryOnChange={handleSummaryOnChange}
        />
      </div>
      <div
        style={{
          display: tabName === TAB_NAME.TRACE ? 'block' : 'none',
        }}
      >
        <Trace endTimestamp={endTimestamp} startTimestamp={startTimestamp} treeData={treeData} />
      </div>
    </>
  );
};
const ViewPlanText: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  return (
    <a onClick={onClick}>
      <CodeOutlined />
      {
        formatMessage({
          id: 'odc.components.SQLExplain.ViewPlanText',
        }) /*查看计划文本*/
      }
    </a>
  );
};
const ViewFormattingInformation: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  return (
    <a onClick={onClick}>
      <ProfileOutlined />
      {
        formatMessage({
          id: 'odc.components.SQLExplain.ViewFormattingInformation',
        }) /*查看格式化信息*/
      }
    </a>
  );
};
