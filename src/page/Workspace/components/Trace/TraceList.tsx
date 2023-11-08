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

const TraceList: React.FC<{
  innerTreeData: ExpandTraceSpan[];
}> = ({ innerTreeData }) => {
  return (
    <div>
      <DisplayTable
        bordered={true}
        expandable={{
          defaultExpandAllRows: true,
        }}
        disablePagination={true}
        columns={[
          {
            title: 'Span ID',
            dataIndex: 'spanId',
            key: 'spanId',
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
                            render: () => record?.originStartTimestamp,
                          },
                          {
                            title: '结束时间',
                            render: () => record?.originEndTimestamp,
                          },
                          {
                            title: '耗时',
                            render: () => <>{record?.elapseMicroSeconds}us</>,
                          },
                        ]}
                      />
                      {record?.tags && (
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
                  <div className={styles.hover}>{text}</div>
                </Popover>
              );
            },
          },
          {
            title: 'Span',
            dataIndex: 'span',
            key: 'span',
          },
          {
            title: '节点',
            dataIndex: 'node',
            key: 'node',
            filters: [
              {
                text: '123',
                value: 123,
              },
            ],
          },
          {
            title: '开始时间',
            dataIndex: 'startTimestamp',
            key: 'startTimestamp',
            sorter: (a, b) => a?.startTimestamp - b?.startTimestamp,
          },
          {
            title: '耗时',
            dataIndex: 'elapseMicroSeconds',
            key: 'elapseMicroSeconds',
            sorter: (a, b) => a?.elapseMicroSeconds - b?.elapseMicroSeconds,
            render: (text) => <>{text}us</>,
          },
        ]}
        dataSource={innerTreeData}
      />
    </div>
  );
};
export default TraceList;
