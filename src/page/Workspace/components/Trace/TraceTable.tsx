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
import { Popover, Tooltip, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { formatMessage } from '@/util/intl';
import styles from './index.less';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ExpandTraceSpan, InfoRender } from '.';
import { getIconByNodeType } from './Node';
import { TraceSpanNode } from '@/d.ts';
import { formatTimeTemplatMicroSeconds } from '@/util/utils';
const getColorByType = (type: TraceSpanNode) => {
  switch (type) {
    case TraceSpanNode.OBServer: {
      return '#5B8FF9';
    }
    case TraceSpanNode.OBProxy: {
      return '#61DDAA';
    }
    case TraceSpanNode.JDBC: {
      return '#F6BD16';
    }
  }
};
const TraceTable: React.FC<{
  innerTreeData: ExpandTraceSpan[];
  totalElapseMicroSeconds: number;
  totalStartTimestamp: number;
}> = ({ innerTreeData, totalElapseMicroSeconds, totalStartTimestamp }) => {
  return (
    <div className={styles.traceTable}>
      {innerTreeData?.map((node, index) => {
        const other = (node.startTimestamp - totalStartTimestamp) / totalElapseMicroSeconds;
        const percent = (node.endTimestamp - node.startTimestamp) / totalElapseMicroSeconds;
        const dataSource = [];
        node?.tags?.forEach((obj) => {
          Object.keys(obj).forEach((key) => {
            dataSource.push({
              label: key,
              value: obj?.[key] || '-',
            });
          });
        });
        return (
          <div
            className={styles.traceTableItem}
            style={{
              backgroundColor: node?.isSearch ? 'var(--odc-color1-bgcolor)' : 'transparent',
            }}
            key={index}
          >
            <div
              className={styles.timeStepItem}
              style={{
                left: `${142 * 1}px`,
              }}
            ></div>
            <div
              className={styles.timeStepItem}
              style={{
                left: `${143 * 2}px`,
              }}
            ></div>
            <div
              className={styles.timeStepItem}
              style={{
                left: `${143 * 3 + 1}px`,
              }}
            ></div>
            <div
              className={styles.timeStepItem}
              style={{
                left: `${143 * 4 + 3}px`,
              }}
            ></div>
            <div
              className={styles.progressBar}
              style={{
                color: 'var(--text-color-primary)',
              }}
            >
              <div
                style={{
                  width: `${other * 100}%`,
                }}
              ></div>
              <Popover
                overlayClassName={styles.tracePopover}
                content={
                  <div
                    style={{
                      width: '400px',
                    }}
                  >
                    <InfoRender
                      infos={[
                        {
                          title: formatMessage({
                            id: 'odc.src.page.Workspace.components.Trace.Node.2',
                          }), //'节点'
                          render: () => (
                            <div className={styles.nodeTitle}>
                              <div
                                style={{
                                  width: '14px',
                                  height: '14px',
                                }}
                              >
                                {getIconByNodeType(node?.node)}
                              </div>
                              {node?.node} {node?.host}
                            </div>
                          ),
                        },
                        {
                          title: 'Span ID',
                          render: () => (
                            <>
                              {node?.spanId}
                              <CopyToClipboard
                                key="copy"
                                text={node?.spanId}
                                style={{
                                  marginLeft: '8px',
                                }}
                                onCopy={() => {
                                  message.success(
                                    formatMessage({
                                      id: 'odc.src.page.Workspace.components.Trace.Replication.2',
                                    }), //'复制成功'
                                  );
                                }}
                              >
                                <CopyOutlined />
                              </CopyToClipboard>
                            </>
                          ),
                        },
                        {
                          title: formatMessage({
                            id: 'odc.src.page.Workspace.components.Trace.StartingTime.3',
                          }), //'开始时间'
                          render: () => node?.originStartTimestamp,
                        },
                        {
                          title: formatMessage({
                            id: 'odc.src.page.Workspace.components.Trace.EndTime.1',
                          }), //'结束时间'
                          render: () => node?.originEndTimestamp,
                        },
                        {
                          title: formatMessage({
                            id: 'odc.src.page.Workspace.components.Trace.TimeConsuming.2',
                          }), //'耗时'
                          render: () => formatTimeTemplatMicroSeconds(node?.elapseMicroSeconds),
                        },
                      ]}
                    />
                    {node?.tags && node?.tags?.length && (
                      <>
                        <div
                          style={{
                            margin: '8px 0px',
                          }}
                        >
                          Tags
                        </div>
                        <DisplayTable
                          bordered={true}
                          expandable={{
                            defaultExpandAllRows: true,
                          }}
                          disablePagination={true}
                          showHeader={false}
                          columns={[
                            {
                              title: 'label',
                              dataIndex: 'label',
                              key: 'label',
                            },
                            {
                              title: 'value',
                              dataIndex: 'value',
                              key: 'value',
                              render: (text) => (
                                <Tooltip title={text}>
                                  <div className={styles.valueElliscape}>{text}</div>
                                </Tooltip>
                              ),
                            },
                          ]}
                          dataSource={dataSource}
                        />
                      </>
                    )}
                  </div>
                }
                title={node?.title}
              >
                <div
                  style={{
                    width: percent > 0 ? `${percent * 100}%` : '0px',
                    height: '14px',
                    lineHeight: '14px',
                    backgroundColor: `${getColorByType(node.node)}`,
                  }}
                  className={styles.traceBar}
                >
                  {percent + other >= 0.9
                    ? formatTimeTemplatMicroSeconds(node?.elapseMicroSeconds)
                    : ''}
                </div>
              </Popover>
              {percent <= 0.05 ? (
                <Popover
                  overlayClassName={styles.tracePopover}
                  content={
                    <div
                      style={{
                        width: '400px',
                      }}
                    >
                      <InfoRender
                        infos={[
                          {
                            title: formatMessage({
                              id: 'odc.src.page.Workspace.components.Trace.Node.3',
                            }), //'节点'
                            render: () => (
                              <div className={styles.nodeTitle}>
                                <div
                                  style={{
                                    width: '14px',
                                    height: '14px',
                                  }}
                                >
                                  {getIconByNodeType(node?.node)}
                                </div>
                                {node?.node} {node?.host}
                              </div>
                            ),
                          },
                          {
                            title: 'Span ID',
                            render: () => (
                              <>
                                {node?.spanId}
                                <CopyToClipboard
                                  key="copy"
                                  text={node?.spanId}
                                  style={{
                                    marginLeft: '8px',
                                  }}
                                  onCopy={() => {
                                    message.success(
                                      formatMessage({
                                        id: 'odc.src.page.Workspace.components.Trace.Replication.3',
                                      }), //'复制成功'
                                    );
                                  }}
                                >
                                  <CopyOutlined />
                                </CopyToClipboard>
                              </>
                            ),
                          },
                          {
                            title: formatMessage({
                              id: 'odc.src.page.Workspace.components.Trace.StartingTime.4',
                            }), //'开始时间'
                            render: () => node?.originStartTimestamp,
                          },
                          {
                            title: formatMessage({
                              id: 'odc.src.page.Workspace.components.Trace.EndTime.2',
                            }), //'结束时间'
                            render: () => node?.originEndTimestamp,
                          },
                          {
                            title: formatMessage({
                              id: 'odc.src.page.Workspace.components.Trace.TimeConsuming.3',
                            }), //'耗时'
                            render: () => formatTimeTemplatMicroSeconds(node?.elapseMicroSeconds),
                          },
                        ]}
                      />
                      {node?.tags && (
                        <>
                          <div
                            style={{
                              margin: '8px 0px',
                            }}
                          >
                            Tags
                          </div>
                          <DisplayTable
                            bordered={true}
                            expandable={{
                              defaultExpandAllRows: true,
                            }}
                            disablePagination={true}
                            showHeader={false}
                            columns={[
                              {
                                title: 'label',
                                dataIndex: 'label',
                                key: 'label',
                              },
                              {
                                title: 'value',
                                dataIndex: 'value',
                                key: 'value',
                                render: (text) => (
                                  <Tooltip title={text}>
                                    <div className={styles.valueElliscape}>{text}</div>
                                  </Tooltip>
                                ),
                              },
                            ]}
                            dataSource={dataSource}
                          />
                        </>
                      )}
                    </div>
                  }
                  title={node?.title}
                >
                  <div
                    style={{
                      cursor: 'pointer',
                    }}
                  >
                    {' '}
                    {percent + other < 0.9
                      ? formatTimeTemplatMicroSeconds(node?.elapseMicroSeconds)
                      : ''}
                  </div>
                </Popover>
              ) : (
                <div
                  style={
                    percent + other < 0.9
                      ? {
                          marginLeft: '2px',
                          cursor: 'pointer',
                        }
                      : {
                          cursor: 'pointer',
                        }
                  }
                >
                  {percent + other < 0.9
                    ? formatTimeTemplatMicroSeconds(node?.elapseMicroSeconds)
                    : ''}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default TraceTable;
