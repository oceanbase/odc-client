import { formatMessage } from '@/util/intl';
import { Table } from 'antd';
import ProgressBar from '../components/ProgressBar';
import styles from './index.less';

const Trace = ({ endTimestamp, startTimestamp, treeData }) => {
  return (
    <Table
      className={styles.treeTable}
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
          title: '节点',
          width: 262,
        },
        {
          dataIndex: 'host',
          key: 'host',
          title: '执行时间线',
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
      pagination={false}
    />
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
