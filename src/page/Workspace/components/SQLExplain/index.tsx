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

import DisplayTable from '@/component/DisplayTable';
import { ISQLExplain } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { CodeOutlined, ProfileOutlined } from '@ant-design/icons';
import { Checkbox, Empty, Modal, Tooltip } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { getSqlExplainColumns } from './column';
import styles from './index.less';
import { SQLExplainProps, SQLExplainState } from './interface';
import { randomUUID } from '../Trace';
@inject('sqlStore', 'userStore', 'pageStore')
@observer
export default class SQLExplain extends Component<SQLExplainProps, SQLExplainState> {
  constructor(props: SQLExplainProps) {
    super(props);
    this.state = {
      onlyText: false,
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
  public render() {
    const { explain, sql, haveText, traceId, session } = this.props;
    function injectKey2TreeData(root) {
      if (Array.isArray(root)) {
        root.forEach((node) => {
          if (node?.children) {
            if (Array.isArray(node?.children)) {
              injectKey2TreeData(node?.children);
              node.key = randomUUID();
            } else {
              node.key = randomUUID();
            }
          } else {
            node.key = randomUUID();
          }
        });
      } else {
        root.key = randomUUID();
      }
      return root;
    }
    const { onlyText, tableHeight, showExplainText } = this.state;
    const columns = getSqlExplainColumns({
      handleShowOutputFilter: handleShowOutputFilter,
    });
    return (
      <>
        <div className={styles.header}>
          <div className={styles.sql}>
            <Tooltip title={sql}>SQL: {sql}</Tooltip>
          </div>
          {haveText && (explain as ISQLExplain)?.showFormatInfo && (
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
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <div className={styles.subTitle}>
                  {
                    formatMessage({
                      id: 'odc.src.page.Workspace.components.SQLExplain.PlanStatistics',
                    }) /* 计划统计 */
                  }
                </div>
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
                    (explain as ISQLExplain)?.tree && (
                      <DisplayTable
                        key={sql}
                        rowKey="key"
                        bordered={true}
                        expandable={{
                          defaultExpandAllRows: true,
                        }}
                        scroll={{
                          x: 1400,
                          y: tableHeight,
                        }}
                        columns={columns}
                        dataSource={explain && explain.tree ? injectKey2TreeData(explain.tree) : []}
                        disablePagination={true}
                      />
                    )
                  )}
                </>
              )}
            </div>
          )
        }
      </>
    );
  }
}
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

export const handleShowOutputFilter = (filterContent: string) => {
  Modal.info({
    width: 720,
    zIndex: 2000,
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
