import { formatMessage } from '@/util/intl';
import { formatTimeTemplate } from '@/util/utils';
import { Divider, Progress, Radio, Select, Tooltip } from 'antd';
import BigNumber from 'bignumber.js';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import type { Node } from 'reactflow';
import { CPU_TIME, IO_WAIT_TIME, subNodeSortType, subNodesSortMap, SUM } from '../constant';
import styles from './index.less';

const { Option } = Select;

interface Iprops {
  dataSource: Node;
  topNodes: {
    duration: string[];
  };
  initialNodes: any[];
  globalInfo: {
    duration: number;
    overview: {
      [overviewType: string]: string | number;
    };
    statistics: {
      [statisticType: string]: string | number;
    };
    percent: number;
  };
}

interface INodeOptions {
  value: string;
  label: string;
  duration: number;
  output: number;
  maxMemory: number;
}

const nodeOverviewColorMap = {
  [CPU_TIME]: '#1890ff',
  [IO_WAIT_TIME]: '#5ad8a6',
};

export default ({ dataSource, topNodes, initialNodes, globalInfo }: Iprops) => {
  const { duration = [] } = topNodes || {};
  const [sortType, setSortType] = useState(subNodeSortType.BY_DURATION);
  const [subNodesOptions, setNodesOptions] = useState<INodeOptions[]>(null);
  const [selectedSubNodes, setSelectedSubNodes] = useState<string>(
    getDefaultSubNodes(dataSource?.data),
  );

  const topNodesList = initialNodes
    ?.filter((i) => [...duration].includes(i?.id))
    ?.sort((a, b) => b?.data?.duration - a?.data?.duration);

  useEffect(() => {
    setSelectedSubNodes(null);
    setSortType(subNodeSortType.BY_DURATION);
    if (dataSource?.data?.subNodes) {
      getSubNodesOptions();
      setSortType(subNodeSortType.BY_DURATION);
      setSelectedSubNodes(getDefaultSubNodes(dataSource?.data));
    }
  }, [dataSource?.id]);

  if (!topNodesList) return null;
  // 汇总信息
  if (!dataSource) {
    return getProfileOverview();
  }

  const { data: nodeData } = dataSource;
  const subNodeData = dataSource?.data?.subNodes?.[selectedSubNodes];
  if (subNodeData) {
    subNodeData.percentageInCompare = subNodeData?.overview
      ? (
          (subNodeData?.overview?.[CPU_TIME] /
            (subNodeData?.overview?.[CPU_TIME] + subNodeData?.overview?.[IO_WAIT_TIME])) *
          100
        ).toFixed(2)
      : 0;
  }
  const nodeInfo = subNodeData || nodeData;

  if (!nodeInfo) return null;
  // 节点信息
  return getProfileNodeDetail(nodeInfo);

  function getProfileNodeDetail(data) {
    return (
      <div style={{ width: '336px' }} className={styles.customDetailBox}>
        <div>
          {top5Render()}
          {topNodesList.length ? <Divider /> : null}
          <div className={styles.infoBlockBox}>
            <h3>
              {dataSource?.data?.name ||
                formatMessage({
                  id: 'src.component.ProfileFlow.customComponents.2AB1AD68',
                  defaultMessage: 'Node 执行概览',
                })}
            </h3>
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
                        {i.value === SUM ? (
                          <span>{i.label}</span>
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
              <Progress
                percent={data?.percentageInCompare}
                showInfo={false}
                className={styles.progressWithCompare}
              />
            )}

            {Object.entries(data?.overview)?.map(([key, value]) => {
              return (
                <div className={styles.keyValueBox}>
                  {[IO_WAIT_TIME, CPU_TIME].includes(key) ? (
                    <>
                      <span>
                        <span
                          className={styles.circle}
                          style={{ backgroundColor: nodeOverviewColorMap[key] }}
                        ></span>
                        {key}
                      </span>
                      <span className={styles.value}>
                        {formatTimeTemplate(
                          BigNumber(value as any)
                            .div(1000000)
                            .toNumber(),
                        )}{' '}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>{key}</span>
                      <span className={styles.value}>{value}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {data?.statistics && Object.keys(data?.statistics)?.length ? (
            <div className={styles.infoBlockBox}>
              <h3 className={styles.customDetailBoxTitle}>
                {formatMessage({
                  id: 'src.component.ProfileFlow.customComponents.0E9A817E',
                  defaultMessage: 'I/O 统计',
                })}
              </h3>
              {Object.entries(data?.statistics)?.map(([key, value]) => {
                return (
                  <div className={styles.keyValueBox}>
                    <span>{key}</span>
                    <span className={styles.value}>{value}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
          {data?.attributes ? (
            <div className={styles.infoBlockBox}>
              <h3 className={styles.customDetailBoxTitle}>
                {formatMessage({
                  id: 'src.component.ProfileFlow.customComponents.422173C9',
                  defaultMessage: '节点属性',
                })}
              </h3>
              {Object.entries(data?.attributes)?.map(([key, value]) => {
                return (
                  <div>
                    <h4 className={styles.customDetailBoxSubTitle}>{key}</h4>
                    {/* @ts-ignore */}
                    {value?.map((i) => (
                      <Tooltip title={i}>
                        <div className={styles.ellipsisValue}>{i}</div>
                      </Tooltip>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  function handleChangeSubNode(node) {
    if (node === SUM) {
      setSelectedSubNodes(null);
      return;
    }
    setSelectedSubNodes(node);
  }

  function getDefaultSubNodes(node) {
    return formatMessage(
      {
        id: 'src.component.ProfileFlow.customComponents.7812E9AE',
        defaultMessage: '{nodeName}的汇总',
      },
      { nodeName: node?.name },
    );
  }

  function getSubNodesOptions(sortBy = subNodeSortType.BY_DURATION) {
    const data = dataSource?.data;
    if (!data) return [];
    if (!data?.subNodes) return [];
    const sum = {
      value: SUM,
      label: formatMessage(
        {
          id: 'src.component.ProfileFlow.customComponents.C22AD2CB',
          defaultMessage: '{dataName}的汇总',
        },
        { dataName: data?.name },
      ),
      duration: data?.duration,
      output: data?.statistics?.[subNodesSortMap[subNodeSortType.BY_OUTPUT].objectKey],
      maxMemory: data?.statistics?.[subNodesSortMap[subNodeSortType.BY_MAX_MEMORY].objectKey],
    };
    let list =
      data?.subNodes &&
      Object.keys(data?.subNodes)?.map((i) => {
        return {
          value: i,
          label: i,
          duration: Number(data?.subNodes[i]?.duration) || 0,
          output:
            Number(
              data?.subNodes[i]?.statistics?.[subNodesSortMap[subNodeSortType.BY_OUTPUT].objectKey],
            ) || 0,
          maxMemory:
            Number(
              data?.subNodes[i]?.statistics?.[
                subNodesSortMap[subNodeSortType.BY_MAX_MEMORY].objectKey
              ],
            ) || 0,
        };
      });
    if (sortBy) {
      list = list.sort((a, b) => b?.[sortBy] - a?.[sortBy]);
    }
    setNodesOptions([sum, ...list]);
  }

  function handleSortChange(e) {
    setSortType(e.target.value);
    getSubNodesOptions(e.target.value);
  }

  function dropdownRender(menu) {
    return (
      <div>
        <Radio.Group
          value={sortType}
          onChange={handleSortChange}
          style={{ width: '100%', padding: '4px 6px 8px 6px', textAlign: 'center' }}
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
  }

  function top5Render() {
    if (!topNodesList.length) return;
    return (
      <div>
        <h3 style={{ padding: '0px 8px' }}>
          {formatMessage({
            id: 'src.component.ProfileFlow.customComponents.66C75D66',
            defaultMessage: '耗时 Top5',
          })}
        </h3>
        {topNodesList?.map((i) => {
          return (
            <div
              className={classnames(styles.top5, {
                [styles.current]: i?.id === dataSource?.data?.id,
              })}
              onClick={() => i?.data?.locateNode(i?.id)}
            >
              <div className={styles.top5Name}>
                <div style={{ maxWidth: '180px' }} className={styles.ellipsis}>
                  {i?.data?.name}
                </div>
                <div style={{ color: 'var(--profile-text-color)' }}>[{i?.id}]</div>
              </div>
              <span className={styles.value}>
                {' '}
                {formatTimeTemplate(BigNumber(i?.data?.duration).div(1000000).toNumber())}{' '}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  function getProfileOverview() {
    return (
      <div className={styles.customDetailBox}>
        {top5Render()}
        {globalInfo?.overview && Object.keys(globalInfo?.overview)?.length ? (
          <>
            {topNodesList.length ? <Divider /> : null}
            <div className={styles.infoBlockBox}>
              <h3 className={styles.customDetailBoxTitle} style={{ paddingTop: 0 }}>
                {formatMessage({
                  id: 'src.component.ProfileFlow.customComponents.5FAB7852',
                  defaultMessage: 'SQL 执行概览',
                })}
              </h3>
              <Progress
                percent={globalInfo?.percent}
                showInfo={false}
                className={styles.progressWithCompare}
              />

              {Object.entries(globalInfo?.overview)?.map(([key, value]) => {
                return (
                  <div className={styles.keyValueBox}>
                    {[IO_WAIT_TIME, CPU_TIME].includes(key) ? (
                      <>
                        <span>
                          <span
                            className={styles.circle}
                            style={{ backgroundColor: nodeOverviewColorMap[key] }}
                          ></span>
                          {key}
                        </span>
                        <span className={styles.value}>
                          {formatTimeTemplate(BigNumber(value).div(1000000).toNumber())}{' '}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>{key}</span>
                        <span className={styles.value}>{value}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {globalInfo?.statistics && Object.keys(globalInfo?.statistics)?.length ? (
              <div className={styles.infoBlockBox}>
                <h3 className={styles.customDetailBoxTitle}>
                  {formatMessage({
                    id: 'src.component.ProfileFlow.customComponents.E406DF5A',
                    defaultMessage: 'I/O 统计',
                  })}
                </h3>
                {Object.entries(globalInfo?.statistics)?.map(([key, value]) => {
                  return (
                    <div className={styles.keyValueBox}>
                      <span>{key}</span>
                      <span className={styles.value}>{value}</span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    );
  }
};
