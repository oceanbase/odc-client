import { DataNode } from 'antd/lib/tree';
import { ITableModel } from '@/page/Workspace/components/CreateTable/interface';
import React, { Key, useContext, useEffect, useMemo, useRef, useState } from 'react';
import styles from './partitionTreeSelecter.less';
import { Popover, Select, Tree, Input, Empty } from 'antd';
import { CaretRightOutlined, CaretDownOutlined, SearchOutlined } from '@ant-design/icons';
import { ReactComponent as PartitionSvg } from '@/svgr/Partition.svg';
import Icon from '@ant-design/icons';

interface IProps {
  table: Partial<ITableModel>;
  selectedPartitions: string[];
  setSelectedPartitions: (partitions: string[]) => void;
  onChange: (partitions: string[]) => void;
}

enum TreeNodeType {
  Partitions = 'Partitions',
  Subpartitions = 'Subpartitions',
}

const PartitionTreeSelecter: React.FC<IProps> = ({
  table,
  selectedPartitions,
  setSelectedPartitions,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>(
    table?.partitions?.partitions?.map((item) => item?.name) ?? [],
  );
  const treeRef = useRef(null);
  const [searchValue, setSearchValue] = useState('');

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const handleExpand = (expandedKeys: Key[]) => {
    setExpandedKeys(expandedKeys);
  };

  const parentNodeDisabled = (name: string) => {
    let children =
      table?.subpartitions?.partitions
        ?.filter((item) => item.parentName === name)
        ?.map((item) => item.name) ?? [];

    for (let child of children) {
      if (selectedPartitions?.includes(child)) {
        return true;
      }
    }
    return false;
  };

  const subparentNodeDisabled = (parentName: string) => {
    return selectedPartitions?.includes(parentName);
  };

  useEffect(() => {
    if (!isOpen) {
      setSearchValue('');
    }
  }, [isOpen]);

  // 过滤树数据的函数
  const filterTreeData = (data: any[], searchValue: string): any[] => {
    if (!searchValue) return data;

    return data.reduce((acc: any[], item: any) => {
      const itemMatches = item.title?.toLowerCase().includes(searchValue?.toLowerCase());
      const filteredChildren = item.children ? filterTreeData(item.children, searchValue) : [];

      // 如果当前节点匹配或有匹配的子节点，则包含此节点
      if (itemMatches || filteredChildren.length > 0) {
        acc.push({
          ...item,
          children: filteredChildren.length > 0 ? filteredChildren : item.children,
        });
      }

      return acc;
    }, []);
  };

  const treeData = useMemo(() => {
    const baseData =
      table?.partitions?.partitions?.map((item) => ({
        title: item?.name,
        key: item?.name,
        type: TreeNodeType.Partitions,
        disabled: parentNodeDisabled(item?.name),
        icon: (
          <Icon
            component={PartitionSvg}
            style={{
              color: '#3FA3FF',
              marginRight: 4,
              marginLeft: 4,
            }}
          />
        ),
        data: item,
        children: table?.subpartitions?.partitions
          ?.filter((subItem) => subItem?.parentName === item?.name)
          ?.map((subItem) => {
            return {
              title: subItem?.name,
              disabled: subparentNodeDisabled(subItem?.parentName),
              icon: (
                <Icon
                  component={PartitionSvg}
                  style={{
                    color: '#3FA3FF',
                    marginRight: 4,
                    marginLeft: 4,
                  }}
                />
              ),
              key: subItem?.name,
              data: subItem,
              type: TreeNodeType.Subpartitions,
            };
          }),
      })) ?? [];

    return filterTreeData(baseData, searchValue);
  }, [table, selectedPartitions, searchValue]);

  // 当搜索时自动展开匹配的节点
  useEffect(() => {
    if (searchValue) {
      const getExpandedKeys = (data: any[]): Key[] => {
        const keys: Key[] = [];
        data.forEach((item) => {
          if (item.children && item.children.length > 0) {
            keys.push(item.key);
            keys.push(...getExpandedKeys(item.children));
          }
        });
        return keys;
      };
      setExpandedKeys(getExpandedKeys(treeData));
    } else {
      // 清空搜索时恢复默认展开状态
      setExpandedKeys(table?.partitions?.partitions?.map((item) => item?.name) ?? []);
    }
  }, [searchValue, treeData]);

  // 自定义树节点渲染
  const renderTreeNode = (nodeData: any) => {
    const { title, key, children, icon } = nodeData;
    const isExpanded = expandedKeys.includes(key);
    const hasChildren = children && children.length > 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {hasChildren && (
          <span
            style={{
              marginRight: 8,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 16,
              height: 16,
            }}
            onClick={(e) => {
              e.stopPropagation();
              const newExpandedKeys = isExpanded
                ? expandedKeys.filter((k) => k !== key)
                : [...expandedKeys, key];
              setExpandedKeys(newExpandedKeys);
            }}
          >
            {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
          </span>
        )}
        {!hasChildren && <span style={{ marginRight: 24 }} />}
        <span
          className={styles.item}
          style={
            selectedPartitions?.includes(nodeData?.data?.name) ? { backgroundColor: '#e6f4ff' } : {}
          }
        >
          {nodeData?.icon}
          {title}
        </span>
      </div>
    );
  };

  function TreeRender() {
    if (!treeData?.length) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />;
    }
    return (
      <Tree
        ref={treeRef}
        switcherIcon={<></>}
        className={styles.PartitionTreeSelecter}
        expandedKeys={expandedKeys}
        onExpand={handleExpand}
        blockNode={true}
        showIcon={false}
        treeData={treeData}
        titleRender={renderTreeNode}
        height={300}
        onSelect={(selectedKeys, info) => {
          if (selectedPartitions.includes(info?.node?.data?.name)) {
            setSelectedPartitions(
              selectedPartitions.filter((item) => item !== info?.node?.data?.name),
            );
            onChange(selectedPartitions.filter((item) => item !== info?.node?.data?.name));
          } else {
            setSelectedPartitions(
              Array.from(new Set([...selectedPartitions, info?.node?.data?.name])),
            );
            onChange(Array.from(new Set([...selectedPartitions, info?.node?.data?.name])));
          }
        }}
      />
    );
  }

  return (
    <>
      <Popover
        trigger={['click']}
        placement="bottom"
        open={isOpen}
        destroyOnHidden
        showArrow={false}
        onOpenChange={handleOpenChange}
        content={
          <div style={{ width: 300 }}>
            <Input
              placeholder="搜索分区名称"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              allowClear
              style={{ marginBottom: 8 }}
            />
            <div style={{ maxHeight: 300, overflow: 'auto' }}>{TreeRender()}</div>
          </div>
        }
      >
        <Select
          maxTagCount={4}
          allowClear
          open={false}
          style={{ width: 300 }}
          mode="multiple"
          value={selectedPartitions}
          placeholder="请选择"
          onChange={(value) => {
            setSelectedPartitions(value);
            onChange(value);
          }}
        />
      </Popover>
    </>
  );
};

export default PartitionTreeSelecter;
