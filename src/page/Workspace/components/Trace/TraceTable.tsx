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
import { TraceSpanNode } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { formatTimeTemplatMicroSeconds } from '@/util/utils';
import { CopyOutlined } from '@ant-design/icons';
import { message, Popover, Tooltip } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ExpandTraceSpan, InfoRender } from '.';
import styles from './index.less';
import { getIconByNodeType } from './Node';
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
                left: `25%`,
              }}
            ></div>
            <div
              className={styles.timeStepItem}
              style={{
                left: `calc(50% - 1px)`,
              }}
            ></div>
            <div
              className={styles.timeStepItem}
              style={{
                left: `calc(75% - 2px)`,
              }}
            ></div>
            <div
              className={styles.timeStepItem}
              style={{
                left: `100%`,
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
                            defaultMessage: '节点',
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
                                      defaultMessage: '复制成功',
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
                            defaultMessage: '开始时间',
                          }), //'开始时间'
                          render: () => node?.originStartTimestamp,
                        },
                        {
                          title: formatMessage({
                            id: 'odc.src.page.Workspace.components.Trace.EndTime.1',
                            defaultMessage: '结束时间',
                          }), //'结束时间'
                          render: () => node?.originEndTimestamp,
                        },
                        {
                          title: formatMessage({
                            id: 'odc.src.page.Workspace.components.Trace.TimeConsuming.2',
                            defaultMessage: '耗时',
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
                    whiteSpace: 'nowrap',
                    position: 'relative',
                    backgroundColor: `${getColorByType(node.node)}`,
                  }}
                  className={styles.traceBar}
                >
                  {other < 0.9 ? (
                    formatTimeTemplatMicroSeconds(node?.elapseMicroSeconds)
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        right: '1px',
                      }}
                    >
                      {formatTimeTemplatMicroSeconds(node?.elapseMicroSeconds)}
                    </div>
                  )}
                </div>
              </Popover>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default TraceTable;
