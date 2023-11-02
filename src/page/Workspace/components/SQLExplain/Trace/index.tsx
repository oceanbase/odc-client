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
import ProgressBar from './components/ProgressBar';
import DisplayTable from '@/component/DisplayTable';
import { useEffect, useState } from 'react';

const Trace = ({ endTimestamp, startTimestamp, treeData = [] }) => {
  const [tableHeight, setTableHeight] = useState<number>();
  useEffect(() => {
    setTableHeight(window.innerHeight - 170);
  }, []);
  if (Array.isArray(treeData) && treeData.length === 0) {
    return (
      <DisplayTable
        bordered={true}
        expandable={{
          defaultExpandAllRows: true,
        }}
        scroll={{
          x: 1400,
        }}
        columns={[
          {
            dataIndex: 'title',
            key: 'title',
            fixed: 'left',
            title: formatMessage({
              id: 'workspace.window.sql.explain.tab.summary.columns.name',
            }),
            width: 378,
          },
          {
            dataIndex: 'nodeWithHost',
            key: 'nodeWithHost',
            title: formatMessage({ id: 'odc.SQLExplain.Trace.Node' }), //节点
            width: 262,
          },
          {
            dataIndex: 'host',
            key: 'host',
            title: formatMessage({ id: 'odc.SQLExplain.Trace.ExecutionTimeline' }), //执行时间线
            width: 711,
            render: (_, record) => (
              <ProgressBar
                {...{
                  totalEndTimestamp: endTimestamp,
                  totalStartTimestamp: startTimestamp,
                  node: record,
                }}
              />
            ),
          },
        ]}
        dataSource={[]}
      />
    );
  }
  return (
    treeData && (
      <DisplayTable
        bordered={true}
        key={treeData?.[0]?.spanId}
        disablePagination
        expandable={{
          defaultExpandAllRows: true,
        }}
        scroll={{
          x: 1400,
          y: tableHeight,
        }}
        columns={[
          {
            dataIndex: 'title',
            key: 'title',
            fixed: 'left',
            title: formatMessage({
              id: 'workspace.window.sql.explain.tab.summary.columns.name',
            }),
            width: 378,
          },
          {
            dataIndex: 'nodeWithHost',
            key: 'nodeWithHost',
            title: formatMessage({ id: 'odc.SQLExplain.Trace.Node' }), //节点
            width: 262,
          },
          {
            dataIndex: 'host',
            key: 'host',
            title: formatMessage({ id: 'odc.SQLExplain.Trace.ExecutionTimeline' }), //执行时间线
            width: 711,
            render: (_, record) => (
              <ProgressBar
                {...{
                  totalEndTimestamp: endTimestamp,
                  totalStartTimestamp: startTimestamp,
                  node: record,
                }}
              />
            ),
          },
        ]}
        dataSource={treeData}
      />
    )
  );
};
export default Trace;

export const combineNodeAndHost = (node?: string, host?: string) => {
  if (node && host) {
    return `${node}, ${host}`;
  } else {
    if (node || host) {
      return node || host;
    } else {
      return '-';
    }
  }
};
export const parseTraceTree = (data, k = [0]) => {
  const children =
    data?.subSpans?.map((subSpan, index) => parseTraceTree(subSpan, k.concat(index))) || [];
  return {
    title: data?.spanName,
    key: k.join('-'),
    children: children?.length > 0 ? children : null,
    node: data?.node,
    host: data?.host,
    nodeWithHost: combineNodeAndHost(data?.node, data?.host),
    parent: data?.parent,
    spanId: data?.spanId,
    traceId: data?.traceId,
    logTraceId: data?.logTraceId,
    isLeaf: children?.length === 0,
    originStartTimestamp: data?.startTimestamp,
    originEndTimestamp: data?.endTimestamp,
    startTimestamp:
      Date.parse(data?.startTimestamp) * 1000 + parseInt(data?.startTimestamp?.slice(-3)),
    endTimestamp: Date.parse(data?.endTimestamp) * 1000 + parseInt(data?.endTimestamp?.slice(-3)),
    tags: data?.tags,
  };
};
