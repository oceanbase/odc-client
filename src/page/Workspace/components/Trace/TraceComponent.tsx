import { TraceTabsType, ExpandTraceSpan, randomUUID } from './index';
import TraceList from './TraceList';
import TraceTreeTable from './TraceTreeTable';
import { useState, useEffect } from 'react';
import { getFullLinkTrace, getFullLinkTraceDownloadUrl } from '@/common/network/sql';

export default (props) => {
  const {
    tabName,
    traceId,
    sql,
    session,
    searchValue,
    updateTotalElapseMicroSeconds,
    updateOriginStartTimestamp,
  } = props;
  const [treeData, setTreeData] = useState<ExpandTraceSpan[]>([]);
  const [innerTreeData, setInnerTreeData] = useState([]);
  const [totalElapseMicroSeconds, setTotalElapseMicroSeconds] = useState<number>();
  const [totalEndTimestamp, setTotalEndTimestamp] = useState<number>(0);
  const [totalStartTimestamp, setTotalStartTimestamp] = useState<number>(0);
  const [originTreeData, setOriginTreeData] = useState<ExpandTraceSpan[]>([]);
  const [openNodes, setOpenNodes] = useState<string[]>([]);
  const [originStartTimestamp, setOriginStartTimestamp] = useState<string>('');
  const _data_ = [];

  useEffect(() => {
    getTraceData(traceId, sql, session);
    return () => {
      setOriginTreeData([]);
      setOpenNodes([]);
      setTreeData([]);
      setInnerTreeData([]);
    };
  }, []);

  useEffect(() => {
    onSearch(searchValue);
  }, [searchValue]);
  return (
    <>
      {tabName === TraceTabsType.Trace && (
        <TraceTreeTable
          innerTreeData={innerTreeData}
          treeData={treeData}
          totalElapseMicroSeconds={totalElapseMicroSeconds}
          totalEndTimestamp={totalEndTimestamp}
          totalStartTimestamp={totalStartTimestamp}
          handleNodeExpand={handleNodeExpand}
          countStepBySameParentKey={countStepBySameParentKey}
        />
      )}
      {tabName === TraceTabsType.List && <TraceList innerTreeData={treeData} />}
    </>
  );

  function onSearch(value: string) {
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
  }

  function handleNodeExpand(key) {
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
  }
  function countStepBySameParentKey(parentKey) {
    return (
      // @ts-ignore
      treeData.findLastIndex((td) => td.parentKey === parentKey) -
        treeData.findIndex((td) => td.parentKey === parentKey) +
        1 || 0
    );
  }
  async function getTraceData(traceId, sql, session) {
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
      setTotalElapseMicroSeconds(rawData?.data?.elapseMicroSeconds);
      updateOriginStartTimestamp?.(rawData?.data?.startTimestamp);
      updateTotalElapseMicroSeconds?.(rawData?.data?.elapseMicroSeconds);
      setTotalStartTimestamp(resData.startTimestamp);
      setTotalEndTimestamp(resData.endTimestamp);
    }
  }
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
    const key = randomUUID();
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
};
export function parseTraceTree(data, k = [0]) {
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
}

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
