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
import styles from './index.less';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ExpandTraceSpan, InfoRender } from '.';
import { getIconByNodeType } from './Node';
import { formatTimeTemplatMicroSeconds } from '@/util/utils';

const TraceList: React.FC<{
  innerTreeData: ExpandTraceSpan[];
}> = ({ innerTreeData }) => {
  let setIter = new Set(innerTreeData.map((item) => item.node)).values();
  let filters = [];
  let interator = setIter.next();
  if (innerTreeData.length === 1 && interator.done) {
    filters.push({
      text: interator.value,
      value: interator.value,
    });
  }
  while (!interator.done) {
    filters.push({
      text: interator.value,
      value: interator.value,
    });
    interator = setIter.next();
  }
  const getColumns = () => {
    return [
      {
        title: 'Span ID',
        width: 244,
        dataIndex: 'spanId',
        key: 'spanId',
        ellipsis: {
          showTitle: false,
        },
        render: (text) => (
          <Tooltip title={text}>
            <span style={{ cursor: 'pointer' }}>{text}</span>
          </Tooltip>
        ),
      },
      {
        title: 'Span',
        dataIndex: 'span',
        key: 'span',
        width: 200,
        ellipsis: {
          showTitle: false,
        },
        render: (text, record) => {
          const dataSource = [];
          record?.tags?.forEach((obj) => {
            Object.keys(obj).forEach((key) => {
              dataSource.push({
                label: key,
                value: obj?.[key] || '-',
              });
            });
          });
          return (
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
                        title: '节点',
                        render: () => (
                          <div className={styles.nodeTitle}>
                            <div style={{ width: '14px', height: '14px' }}>
                              {getIconByNodeType(record?.node)}
                            </div>
                            {record?.node} {record?.host}
                          </div>
                        ),
                      },
                      {
                        title: 'Span ID',
                        render: () => (
                          <>
                            {record?.spanId}
                            <CopyToClipboard
                              key="copy"
                              text={record?.spanId}
                              style={{
                                marginLeft: '8px',
                              }}
                              onCopy={() => {
                                message.success('复制成功');
                              }}
                            >
                              <CopyOutlined />
                            </CopyToClipboard>
                          </>
                        ),
                      },
                      {
                        title: '开始时间',
                        render: () => record?.originStartTimestamp,
                      },
                      {
                        title: '结束时间',
                        render: () => record?.originEndTimestamp,
                      },
                      {
                        title: '耗时',
                        render: () => formatTimeTemplatMicroSeconds(record?.elapseMicroSeconds),
                      },
                    ]}
                  />
                  {record?.tags && (
                    <>
                      <div style={{ margin: '8px 0px' }}>Tags</div>
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
              title={text}
            >
              <div className={styles.hover}>{text}</div>
            </Popover>
          );
        },
      },
      {
        title: '节点',
        dataIndex: 'node',
        key: 'node',
        width: 120,
        ellipsis: true,
        filters: filters,
        onFilter: (value: string, record) => record.node === value,
        render: (text, record) => (
          <div className={styles.nodeTitle}>
            <div style={{ width: '16px', height: '16px' }}>{getIconByNodeType(record?.node)}</div>
            {record?.node}
          </div>
        ),
      },
      {
        title: '开始时间',
        dataIndex: 'originStartTimestamp',
        key: 'originStartTimestamp',
        width: 200,
        ellipsis: true,
        sorter: (a, b) => a?.startTimestamp - b?.startTimestamp,
        sortDirections: ['ascend', 'descend'],
      },
      {
        title: '耗时',
        dataIndex: 'elapseMicroSeconds',
        key: 'elapseMicroSeconds',
        width: 100,
        sorter: (a, b) => a?.elapseMicroSeconds - b?.elapseMicroSeconds,
        render: (text) => formatTimeTemplatMicroSeconds(text),
      },
    ];
  };
  const columns = getColumns();
  return (
    <div>
      <DisplayTable
        bordered={true}
        expandable={{
          defaultExpandAllRows: true,
        }}
        disablePagination={true}
        columns={columns}
        dataSource={innerTreeData}
      />
    </div>
  );
};
export default TraceList;
