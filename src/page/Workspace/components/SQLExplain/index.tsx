import { getFullLinkTrace } from '@/common/network/sql';
import DisplayTable from '@/component/DisplayTable';
import { ISQLExplain } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { CodeOutlined, ProfileOutlined } from '@ant-design/icons';
import { Checkbox, Empty, Modal, Radio, Tooltip } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { FormattedMessage } from 'umi';
import { getSqlExplainColumns } from './column';
import styles from './index.less';
import { SQLExplainProps, SQLExplainState, TAB_NAME } from './interface';
import Trace, { parseTraceTree } from './Trace';

@inject('sqlStore', 'userStore', 'pageStore')
@observer
export default class SQLExplain extends Component<SQLExplainProps, SQLExplainState> {
  constructor(props) {
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
    const { session } = this.props;
    const rawData = await getFullLinkTrace(session?.sessionId, session?.database?.dbName, {
      sql: this.props?.sql,
      tag: this.props?.traceId,
    });
    const resData = parseTraceTree(rawData?.data);
    // @ts-ignore
    resData.isRoot = true;
    this.setState({
      treeData: [resData],
      startTimestamp: resData.startTimestamp,
      endTimestamp: resData.endTimestamp,
    });
  };

  public componentDidMount() {
    const {
      session: {
        params: { obVersion },
      },
    } = this.props;
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
    if (!this.state.tableHeight) {
      const tableHeight = window.innerHeight - 170;
      this.setState({
        tableHeight,
      });
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
    const { explain, sql, haveText, session } = this.props;
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
          {haveText ? (
            <span
              style={{
                fontSize: 14,
              }}
            >
              {showExplainText ? (
                <a
                  onClick={() => {
                    this.setState({
                      showExplainText: false,
                    });
                  }}
                >
                  <ProfileOutlined />
                  {
                    formatMessage({
                      id: 'odc.components.SQLExplain.ViewFormattingInformation',
                    }) /*查看格式化信息*/
                  }
                </a>
              ) : (
                <a
                  onClick={() => {
                    this.setState({
                      showExplainText: true,
                    });
                  }}
                >
                  <CodeOutlined />
                  {
                    formatMessage({
                      id: 'odc.components.SQLExplain.ViewPlanText',
                    }) /*查看计划文本*/
                  }
                </a>
              )}
            </span>
          ) : null}
        </div>
        {!showExplainText && (
          <Radio.Group
            value={tabName}
            onChange={(n) =>
              this.setState({
                tabName: n.target.value,
              })
            }
            className={styles.radioGroup}
          >
            <Radio.Button value={TAB_NAME.SUMMARY}>
              <FormattedMessage id="workspace.window.sql.explain.tab.summary" />
            </Radio.Button>
            <Radio.Button value={TAB_NAME.TRACE}>
              {formatMessage({ id: 'odc.components.SQLExplain.FullLinkTrace' }) /*全链路 TRACE*/}
            </Radio.Button>
          </Radio.Group>
        )}

        {showExplainText ? (
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
            {(explain as ISQLExplain)?.originalText}
          </pre>
        ) : (
          <>
            <div
              style={{
                display: tabName === TAB_NAME.SUMMARY ? 'block' : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '8px',
                }}
              >
                <div>
                  <Checkbox
                    checked={onlyText}
                    onChange={(e: CheckboxChangeEvent) => {
                      this.setState({
                        onlyText: e.target.checked,
                      });
                    }}
                  >
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
                    <DisplayTable
                      key={sql}
                      rowKey="operator"
                      bordered={true}
                      defaultExpandAllRows={true}
                      scroll={{
                        x: 1400,
                        y: tableHeight,
                      }}
                      columns={columns}
                      dataSource={explain && explain.tree ? explain.tree : []}
                      disablePagination={true}
                    />
                  )}
                </>
              )}
            </div>
            <div
              style={{
                display: tabName === TAB_NAME.TRACE ? 'block' : 'none',
              }}
            >
              <Trace {...{ endTimestamp, startTimestamp, treeData }} />
            </div>
          </>
        )}
      </>
    );
  }
}
