/*
 * Copyright 2024 OceanBase
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
