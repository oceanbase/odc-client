import { Button, Col, Descriptions, Drawer, Input, Radio, Row, message } from 'antd';
import React, { useEffect } from 'react';
import { CopyOutlined } from '@ant-design/icons';
import { formatMessage } from '@/util/intl';
import { useState } from 'react';
import styles from './index.less';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import TraceList from './TraceList';
import TraceTreeTable from './TraceTreeTable';
import { getFullLinkTrace, getFullLinkTraceJson } from '@/common/network/sql';
import { generateAndDownloadFile } from '@/util/utils';
import { TraceSpan } from '@/d.ts';

export const InfoRender = ({ infos }) => {
  return (
    <Descriptions column={1}>
      {infos.map((info, index) => {
        return (
          <Descriptions.Item key={index} label={info.title}>
            {info.render()}
          </Descriptions.Item>
        );
      })}
    </Descriptions>
  );
};
export enum TraceTabsType {
  Trace = 'Trace',
  List = 'List',
}
export type ExpandTraceSpan = TraceSpan & {
  isExpand: boolean;
  uuid: string;
  parentChain: string[];
  parentKey: string;
  startTimestamp: number;
  endTimestamp: number;
  isSearch: boolean;
  spanId: string;
  originStartTimestamp: string;
  originEndTimestamp: string;
  level: number;
  title: string;
  isRoot: boolean;
  isParent: boolean;
  index: number;
  siblings: number;
};
const Trace: React.FC<{
  open: boolean;
  setOpen: () => void;
  traceId: string;
  sql: string;
  session: any;
}> = ({ open, setOpen, traceId, sql, session }) => {
  const [innerTreeData, setInnerTreeData] = useState([]);
  const [originTreeData, setOriginTreeData] = useState<ExpandTraceSpan[]>([]);
  const [tabName, setTabName] = useState<string>(TraceTabsType.Trace);
  const [originStartTimestamp, setOriginStartTimestamp] = useState<string>('');
  const [elapseMicroSeconds, setElapseMicroSeconds] = useState<number>(0);
  const [totalEndTimestamp, setTotalEndTimestamp] = useState<number>(0);
  const [totalStartTimestamp, setTotalStartTimestamp] = useState<number>(0);
  const [treeData, setTreeData] = useState<ExpandTraceSpan[]>([]);
  const [openNodes, setOpenNodes] = useState<string[]>([]);
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
  const _data_ = [];
  const handleNodeExpand = (key) => {
    let newOpenNodes = [];
    const newTreeData = originTreeData.map((td) => {
      if (td.uuid === key) {
        if (td.isExpand) {
          newOpenNodes = openNodes.filter((on) => on !== key);
        } else {
          newOpenNodes = [...new Set(openNodes.concat(key))];
        }
        td.isExpand = !td.isExpand;
      }
      return td;
    });
    setOpenNodes(newOpenNodes);
    setTreeData(
      newTreeData.filter((_d) => {
        return _d.parentChain.every((e) => newOpenNodes.includes(e));
      }),
    );
    setInnerTreeData(
      newTreeData.filter((_d) => {
        return _d.parentChain.every((e) => newOpenNodes.includes(e));
      }),
    );
  };
  const countStepBySameParentKey = (parentKey) => {
    return (
      // @ts-ignore
      treeData.findLastIndex((td) => td.parentKey === parentKey) -
        treeData.findIndex((td) => td.parentKey === parentKey) +
        1 || 0
    );
  };

  const onSearch = (value: string) => {
    let newInnerTreeData = [];
    if (value) {
      newInnerTreeData = innerTreeData.map((itd) => {
        if (itd.title.toLowerCase().includes(value.toLowerCase())) {
          itd.isSearch = true;
        } else {
          itd.isSearch = false;
        }
        return itd;
      });
    } else {
      newInnerTreeData = innerTreeData.map((itd) => {
        itd.isSearch = false;
        return itd;
      });
    }
    setInnerTreeData(newInnerTreeData);
  };
  const getTraceData = async (traceId, sql, session) => {
    if (traceId) {
      const rawData = await getFullLinkTrace(session?.sessionId, session?.database?.dbName, {
        sql: sql,
        tag: traceId,
      });
      const resData = await parseTraceTree(rawData?.data);
      // @ts-ignore
      resData.isRoot = true;

      const d = parseToTreeData(resData, 0, 0, null, [], 0, true);
      setOriginTreeData(d);
      const newOpenNodes = d
        .filter((_d) => (_d.isParent && _d.isExpand) || _d.isRoot)
        ?.map((_d) => _d.uuid);

      setOpenNodes(newOpenNodes);
      setTreeData(d);
      setInnerTreeData(d);

      setOriginStartTimestamp(rawData?.data?.startTimestamp);
      setElapseMicroSeconds(rawData?.data?.elapseMicroSeconds);
      setTotalStartTimestamp(resData.startTimestamp);
      setTotalEndTimestamp(resData.endTimestamp);
    }
  };
  useEffect(() => {
    if (open) {
      getTraceData(traceId, sql, session);
    }

    return () => {
      setOriginTreeData([]);
      setOpenNodes([]);
      setTreeData([]);
      setInnerTreeData([]);
    };
  }, [open]);

  function parseToTreeData(
    node,
    level,
    index,
    parentKey = null,
    parentChain = [],
    siblings = 0,
    isRoot = false,
  ) {
    if (Array.isArray(node) && node.length === 0) {
      return [];
    }
    const key = crypto.randomUUID();
    _data_.push({
      title: node.title,
      span: node.title,
      spanId: node.spanId,
      node: node.node,
      host: node.host,
      tags: node.tags,
      isRoot,
      level,
      index,
      uuid: key,
      parentKey: parentKey,
      parentChain: parentChain,
      elapseMicroSeconds: node.elapseMicroSeconds,
      startTimestamp: node.startTimestamp,
      endTimestamp: node.endTimestamp,
      originEndTimestamp: node.originEndTimestamp,
      originStartTimestamp: node.originStartTimestamp,
      siblings: siblings,
      isExpand: true,
      isSearch: false,
      isParent: isRoot ? true : node?.children?.length > 0,
    });
    if (node.children) {
      node.children.forEach((child, _index) =>
        parseToTreeData(
          child,
          level + 1,
          _index,
          key,
          parentChain.concat(key),
          node?.children?.length,
        ),
      );
    }
    return _data_;
  }

  async function handleJsonDownload() {
    setDownloadLoading(true);
    const downloadContent = await getFullLinkTraceJson(
      session?.sessionId,
      session?.database?.dbName,
      {
        sql: sql,
        tag: traceId,
      },
    );
    await generateAndDownloadFile(`${traceId}.json`, downloadContent);
    setDownloadLoading(false);
  }
  return (
    <Drawer
      open={open}
      width={912}
      title={'全链路 Trace 详情'}
      destroyOnClose={true}
      onClose={() => setOpen()}
    >
      <div className={styles.infoContainer}>
        <Row>
          <Col span={24} className={styles.info}>
            <span className={styles.infoLabel}>SQL: </span>
            <span className={styles.infoValue}>{sql}</span>
          </Col>
        </Row>
        <Row>
          <Col span={12} className={styles.info}>
            <span className={styles.infoLabel}>Trace ID: </span>
            <span className={styles.infoValue}>{traceId}</span>
            <CopyToClipboard
              key="copy"
              text={traceId}
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
          </Col>
          <Col span={8} className={styles.info}>
            <span className={styles.infoLabel}>开始时间: </span>
            <span className={styles.infoValue}>{originStartTimestamp}</span>
          </Col>

          <Col span={4} className={styles.info}>
            <span className={styles.infoLabel}>持续时间: </span>
            <span className={styles.infoValue}>{elapseMicroSeconds}us</span>
          </Col>
        </Row>
      </div>
      <div className={styles.optContainer}>
        <Radio.Group value={tabName} onChange={(e) => setTabName(e.target.value)}>
          <Radio.Button value={TraceTabsType.Trace}>Trace 视图</Radio.Button>
          <Radio.Button value={TraceTabsType.List}>列表视图</Radio.Button>
        </Radio.Group>
        <div className={styles.rightSide}>
          <Input.Search style={{ width: '256px' }} placeholder="搜索关键字" onSearch={onSearch} />
          <Button loading={downloadLoading} disabled={downloadLoading} onClick={handleJsonDownload}>
            导出 Json
          </Button>
        </div>
      </div>
      {tabName === TraceTabsType.Trace && (
        <TraceTreeTable
          innerTreeData={innerTreeData}
          treeData={treeData}
          elapseMicroSeconds={elapseMicroSeconds}
          totalEndTimestamp={totalEndTimestamp}
          totalStartTimestamp={totalStartTimestamp}
          handleNodeExpand={handleNodeExpand}
          countStepBySameParentKey={countStepBySameParentKey}
        />
      )}
      {tabName === TraceTabsType.List && <TraceList innerTreeData={innerTreeData} />}
    </Drawer>
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
    elapseMicroSeconds: data?.elapseMicroSeconds,
    startTimestamp:
      Date.parse(data?.startTimestamp) * 1000 + parseInt(data?.startTimestamp?.slice(-3)),
    endTimestamp: Date.parse(data?.endTimestamp) * 1000 + parseInt(data?.endTimestamp?.slice(-3)),
    tags: data?.tags,
  };
};
