import { Divider, Progress, Tooltip, Select, Radio } from 'antd';
import styles from './index.less';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { formatTimeTemplate } from '@/util/utils';
import BigNumber from 'bignumber.js';

const { Option } = Select;

export default (props) => {
  const { dataSource, topNodes, initialNodes, globalInfo } = props;
  const { duration = [] } = topNodes || {};
  const topNodesList = initialNodes
    ?.filter((i) => [...duration].includes(i?.id))
    ?.sort((a, b) => b.data.duration - a.data.duration);
  const locateNode = (i) => {
    i?.data?.locateNode(i?.id);
  };

  const subNodeSortType = {
    BY_DURATION: 'duration',
    BY_OUTPUT: 'output',
    BY_MAX_MEMORY: 'maxMemory',
  };
  const subNodesSortMap = {
    [subNodeSortType.BY_DURATION]: {
      label: '按 DB 耗时排序',
    },
    [subNodeSortType.BY_OUTPUT]: {
      label: '按内存排序',
    },
    [subNodeSortType.BY_MAX_MEMORY]: {
      label: '按吐行排序',
    },
  };
  const handleChangeSubNode = (node) => {
    if (node === 'SUM') {
      setSelectedSubNodes(null);
      return;
    }
    setSelectedSubNodes(node);
  };
  const getDefaultSubNodes = (node) => {
    return `${node?.name}的汇总`;
  };
  const getSubNodesOptions = (sortBy = 'duration') => {
    const data = dataSource?.data;
    if (!data) return [];
    if (!data?.subNodes) return [];
    const sum = {
      value: 'SUM',
      label: `${data?.name}的汇总`,
      duration: data?.duration,
      output: data?.statistics?.['Output rows'],
      maxMemory: data?.statistics?.['Max memory'],
    };
    let list = Object.keys(data?.subNodes)?.map((i) => {
      return {
        value: i,
        label: i,
        duration: Number(data?.subNodes[i]?.duration) || 0,
        output: Number(data?.subNodes[i]?.statistics?.['Output rows']) || 0,
        maxMemory: Number(data?.subNodes[i]?.statistics?.['Max memory']) || 0,
      };
    });
    if (sortBy) {
      list = list.sort((a, b) => b?.[sortBy] - a?.[sortBy]);
    }
    setNodesOptions([sum, ...list]);
  };

  const handleSortChange = (e) => {
    setSortType(e.target.value);
    getSubNodesOptions(e.target.value);
  };
  useEffect(() => {
    setSelectedSubNodes(null);
    setSortType(subNodeSortType.BY_DURATION);
    if (data?.subNodes) {
      getSubNodesOptions();
      setSortType(subNodeSortType.BY_DURATION);
      setSelectedSubNodes(getDefaultSubNodes(dataSource?.data));
    }
  }, [JSON.stringify(dataSource?.data)]);

  const [sortType, setSortType] = useState(subNodeSortType.BY_DURATION);
  const [subNodesOptions, setNodesOptions] = useState(null);
  const [selectedSubNodes, setSelectedSubNodes] = useState(getDefaultSubNodes(dataSource?.data));
  const dropdownRender = (menu) => (
    <div>
      <Radio.Group
        value={sortType}
        onChange={handleSortChange}
        style={{ width: '100%', padding: '0 7px 8px 7px' }}
      >
        <Radio.Button value={subNodeSortType.BY_DURATION}>
          {subNodesSortMap[subNodeSortType.BY_DURATION].label}
        </Radio.Button>
        <Radio.Button value={subNodeSortType.BY_OUTPUT}>
          {subNodesSortMap[subNodeSortType.BY_OUTPUT].label}
        </Radio.Button>
        <Radio.Button value={subNodeSortType.BY_MAX_MEMORY}>
          {subNodesSortMap[subNodeSortType.BY_MAX_MEMORY].label}
        </Radio.Button>
      </Radio.Group>
      {menu}
    </div>
  );

  const top5 = () => {
    if (!topNodesList.length) return;
    return (
      <div>
        <h3 style={{ padding: '0px 8px' }}>耗时 Top5</h3>
        {topNodesList?.map((i) => {
          return (
            <div
              className={classnames(styles.top5, {
                [styles.current]: i?.id === dataSource?.data?.id,
              })}
              onClick={() => locateNode(i)}
            >
              <span>
                {i?.data?.name}
                <span style={{ color: 'rgba(0,0,0,0.45)', height: 28 }}>[{i?.id}]</span>
              </span>
              <span>
                {' '}
                {formatTimeTemplate(BigNumber(i?.data?.duration).div(1000000).toNumber())}{' '}
              </span>
            </div>
          );
        })}
      </div>
    );
  };
  if (!topNodesList) return null;
  if (!dataSource) {
    return (
      <div
        style={{
          position: 'absolute',
          right: '16px',
          width: '320px',
          backgroundColor: '#FFFFF',
          border: '1px solid #E0E0E0',
          borderLeft: 'none',
          height: 'calc(100% - 151px)',
          overflowY: 'auto',
          padding: '12px 8px',
        }}
        className={styles.customDetailBox}
      >
        {top5()}
        {globalInfo?.overview ? (
          <>
            {topNodesList.length ? <Divider /> : null}
            <div style={{ padding: '0px 8px' }}>
              {globalInfo?.overview ? <h3>Node 执行概览</h3> : null}
              <Progress percent={globalInfo?.percent} showInfo={false} />
              {globalInfo?.overview
                ? Object.entries(globalInfo?.overview)?.map(([key, value]) => {
                    return (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '4px 0px',
                        }}
                      >
                        <span>{key}</span>
                        <span>{value}</span>
                      </div>
                    );
                  })
                : null}
            </div>
            {globalInfo?.statistics ? (
              <h3 className={styles.customDetailBoxTitle}>I/O 统计</h3>
            ) : null}
            {globalInfo?.statistics
              ? Object.entries(globalInfo?.statistics)?.map(([key, value]) => {
                  return (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '4px 8px',
                      }}
                    >
                      <span>{key}</span>
                      <span>{value}</span>
                    </div>
                  );
                })
              : null}
          </>
        ) : null}
      </div>
    );
  }

  const { data: nodeData } = dataSource;
  const subNodeData = dataSource?.data?.subNodes?.[selectedSubNodes];
  if (subNodeData) {
    subNodeData.percentage = globalInfo?.duration
      ? ((subNodeData?.duration / globalInfo?.duration) * 100).toFixed(2)
      : '';
  }
  const data = subNodeData || nodeData;
  if (!data) return null;
  return (
    <div
      style={{
        position: 'absolute',
        right: '17px',
        width: '320px',
        backgroundColor: '#FFFFF',
        border: '1px solid #E0E0E0',
        borderLeft: 'none',
        height: 'calc(100% - 151px)',
        overflowY: 'auto',
        padding: '12px 8px',
      }}
      className={styles.customDetailBox}
    >
      <div>
        {top5()}
        {topNodesList.length ? <Divider /> : null}
        <div style={{ padding: '0px 8px' }}>
          <h3>Node 执行概览</h3>
          {dataSource?.data?.subNodes ? (
            <Select
              style={{ width: '100%', paddingBottom: 8 }}
              onChange={handleChangeSubNode}
              dropdownRender={dropdownRender}
              value={selectedSubNodes}
              optionLabelProp="label"
            >
              {subNodesOptions?.map((i) => {
                return (
                  <Option value={i.label} key={i.value}>
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                    >
                      {i.value === 'SUM' ? (
                        <span>
                          {i.label}
                          {''}
                        </span>
                      ) : (
                        <>
                          <span>{i.label}</span>
                          {sortType === subNodeSortType.BY_DURATION ? (
                            formatTimeTemplate(BigNumber(i?.[sortType]).div(1000000).toNumber())
                          ) : (
                            <span>{i?.[sortType] || '-'}</span>
                          )}
                        </>
                      )}
                    </div>
                  </Option>
                );
              })}
            </Select>
          ) : null}
          {data?.percentage === '' ? null : (
            <Progress percent={data?.percentage} showInfo={false} />
          )}
          {Object.entries(data?.overview)?.map(([key, value]) => {
            return (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0px' }}>
                <span>{key}</span>
                <span>{value}</span>
              </div>
            );
          })}
        </div>
        <h3 className={styles.customDetailBoxTitle}>I/O 统计</h3>
        {data?.statistics
          ? Object.entries(data?.statistics)?.map(([key, value]) => {
              return (
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px' }}
                >
                  <span>{key}</span>
                  <span>{value}</span>
                </div>
              );
            })
          : null}
        <h3 className={styles.customDetailBoxTitle}>节点属性</h3>
        {data?.attributes
          ? Object.entries(data?.attributes)?.map(([key, value]) => {
              return (
                <div style={{ padding: '0 8px' }}>
                  <h4 className={styles.customDetailBoxSubTitle}>{key}</h4>
                  {/* @ts-ignore */}
                  {value?.map((i) => (
                    <Tooltip title={i}>
                      <div
                        style={{
                          padding: '4px 0',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {i}
                      </div>
                    </Tooltip>
                  ))}
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
};
