import { formatMessage } from '@/util/intl';
import { CodeOutlined, ProfileOutlined } from '@ant-design/icons';
import { Alert, Button, Modal, Radio, Tooltip } from 'antd';
import { Component } from 'react';
import { FormattedMessage } from 'umi';
// @ts-ignore
import DisplayTable from '@/component/DisplayTable';
import { ISQLExplain } from '@/d.ts';
import { inject, observer } from 'mobx-react';
import styles from './index.less';
enum TAB_NAME {
  SUMMARY = 'SUMMARY',
  OUTLINE = 'OUTLINE',
}
@inject('sqlStore', 'userStore', 'pageStore')
@observer
export default class SQLExplain extends Component<
  {
    explain: ISQLExplain | string;
    sql: string;
    tableHeight?: number;
    haveText?: boolean;
  },
  {
    tabName: TAB_NAME;
    tableHeight: number;
    showExplainText: boolean;
  }
> {
  constructor(props) {
    super(props);
    this.state = {
      tabName: TAB_NAME.SUMMARY,
      tableHeight: this.props.tableHeight || 0,
      showExplainText: !!props.haveText,
    };
  }

  public componentDidMount() {
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
    const { explain, sql, haveText } = this.props;
    const { tabName, tableHeight, showExplainText } = this.state;
    const columns = [
      {
        dataIndex: 'operator',
        title: formatMessage({
          id: 'workspace.window.sql.explain.tab.summary.columns.operator',
        }), // width: 530,
      },
      {
        dataIndex: 'name',
        title: formatMessage({
          id: 'workspace.window.sql.explain.tab.summary.columns.name',
        }),
        width: 126,
        fixed: 'right',
        render: (v) => {
          return (
            <div
              style={{
                maxWidth: 110,
                display: 'flex',
                alignItems: 'center',
              }}
              title={v}
            >
              <span
                style={{
                  flex: 1,
                  display: 'inline-block',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {v}
              </span>
            </div>
          );
        },
      },
      {
        dataIndex: 'rowCount',
        title: formatMessage({
          id: 'workspace.window.sql.explain.tab.summary.columns.rows',
        }),
        width: 86,
        fixed: 'right',
      },
      {
        dataIndex: 'cost',
        title: formatMessage({
          id: 'workspace.window.sql.explain.tab.summary.columns.cost',
        }),
        width: 86,
        fixed: 'right',
      },
      {
        dataIndex: 'outputFilter',
        title: formatMessage({
          id: 'workspace.window.sql.explain.tab.summary.columns.output',
        }),
        width: 366,
        fixed: 'right',
        render: (v: string) => (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                maxWidth: 350,
              }}
            >
              <span
                style={{
                  flex: 1,
                  display: 'inline-block',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {v}
              </span>
              <Button
                style={{
                  fontSize: 12,
                }}
                type="link"
                size="small"
                onClick={() => this.handleShowOutputFilter(v)}
              >
                <FormattedMessage id="workspace.window.sql.explain.button.showOutputFilter" />
              </Button>
            </div>
          </>
        ),
      },
    ];
    if (typeof explain === 'string') {
      return (
        <>
          <div className={styles.header}>
            <div className={styles.sql}>
              <Tooltip title={sql}>SQL: {sql}</Tooltip>
            </div>
          </div>
          <Alert message={explain} type="error" />
        </>
      );
    }
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
            <Radio.Button value={TAB_NAME.OUTLINE}>
              <FormattedMessage id="workspace.window.sql.explain.tab.outline" />
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
            {explain?.originalText}
          </pre>
        ) : (
          <>
            <div
              style={{
                display: tabName === TAB_NAME.SUMMARY && explain && explain.tree ? 'block' : 'none',
              }}
            >
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
                dataSource={explain && explain.tree}
                disablePagination={true}
              />
            </div>
            <div
              style={{
                display: tabName === TAB_NAME.OUTLINE ? 'block' : 'none',
              }}
              className={styles.outline}
            >
              {explain && explain.outline}
            </div>
          </>
        )}
      </>
    );
  }
}
