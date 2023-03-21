import { formatMessage } from '@/util/intl';
import { Button, Tree } from 'antd';
import type { FilterDropdownProps } from 'antd/lib/table/interface';
import type { DataNode } from 'antd/lib/tree';
import React, { useState } from 'react';
import styles from './index.less';

interface ITreeFilterProps extends FilterDropdownProps {
  filters: any;
  treeData: DataNode[];
}

const TreeFilter: React.FC<ITreeFilterProps> = (props) => {
  const { confirm, setSelectedKeys, treeData } = props;
  const [checkedKeys, setCheckedKeys] = useState(null);

  const handleOk = () => {
    setSelectedKeys(checkedKeys);
    confirm();
  };

  const handleReset = () => {
    setSelectedKeys(null);
    setCheckedKeys(null);
    confirm();
  };

  const onCheck = (keys) => {
    setCheckedKeys(keys);
  };

  return (
    <div className={styles.treeFilter}>
      <Tree checkable checkedKeys={checkedKeys} treeData={treeData} onCheck={onCheck} />
      <div className={styles.footer}>
        <Button size="small" onClick={handleReset} type="link">
          {formatMessage({ id: 'odc.components.TreeFilter.Reset' }) /*重置*/}
        </Button>
        <Button type="primary" size="small" onClick={handleOk}>
          {formatMessage({ id: 'odc.components.TreeFilter.Ok' }) /*确定*/}
        </Button>
      </div>
    </div>
  );
};

export default TreeFilter;
