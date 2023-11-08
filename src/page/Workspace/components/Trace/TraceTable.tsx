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
  totalStartTimestamp: number;
  totalEndTimestamp: number;
}> = ({ innerTreeData, totalStartTimestamp, totalEndTimestamp }) => {
  return (
    <div className={styles.traceTable}>
      {innerTreeData?.map((node, index) => {
        const total = totalEndTimestamp - totalStartTimestamp;
        const other = (node.startTimestamp - totalStartTimestamp) / total;
        const percent = (node.endTimestamp - node.startTimestamp) / total;
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
            <div className={styles.timeStepItem}></div>
            <div className={styles.timeStepItem}></div>
            <div className={styles.timeStepItem}></div>
            <div className={styles.timeStepItem}></div>
            <div className={styles.progressBar} style={{ color: 'var(--text-color-primary)' }}>
              <div style={{ width: `${other * 100}%` }}></div>
              <Popover
                content={
                  <div
                    style={{
                      width: '400px',
                    }}
                  >
                    <InfoRender
                      infos={[
                        {
                          title: '节点',
                          render: () => (
                            <div className={styles.nodeTitle}>
                              <div style={{ width: '16px', height: '16px' }}>
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
                                      id: 'workspace.window.session.modal.sql.copied',
                                    }),
                                  );
                                }}
                              >
                                <CopyOutlined />
                              </CopyToClipboard>
                            </>
                          ),
                        },
                        {
                          title: '开始时间',
                          render: () => node?.originStartTimestamp,
                        },
                        {
                          title: '结束时间',
                          render: () => node?.originEndTimestamp,
                        },
                        {
                          title: '耗时',
                          render: () => <>{node?.elapseMicroSeconds}us</>,
                        },
                      ]}
                    />
                    {node?.tags && (
                      <>
                        <div style={{ margin: '16px 0px 8px' }}>Tags</div>
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
                title={'sql_execute'}
              >
                <div
                  style={{
                    width: `${percent * 100}%`,
                    height: '14px',
                    lineHeight: '14px',

                    backgroundColor: `${getColorByType(node.node)}`,
                    paddingRight: '2px',
                  }}
                  className={styles.traceBar}
                >
                  {percent + other >= 0.9 ? `${node?.elapseMicroSeconds}us` : ''}
                </div>
              </Popover>
              <div style={percent + other < 0.9 ? { marginLeft: '2px' } : {}}>
                {percent + other < 0.9 ? `${node?.elapseMicroSeconds}us` : ''}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default TraceTable;
