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
import { useControllableValue } from 'ahooks';
import { Tree, TreeProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import Card from './Card';

import Delete from '../Button/Delete';
import styles from './index.less';

interface IProps extends TreeProps {}

export default function SelectTransfer(props: IProps) {
  const [checkedKeys, setCheckedKeys] = useControllableValue(props, {
    defaultValue: [],
    valuePropName: 'checkedKeys',
    trigger: 'onCheck',
  });

  const [sourceSearch, setSourceSearch] = useState(null);
  const [targetSearch, setTargetSearch] = useState(null);
  const [indeterminate, setIndeterminate] = useState<boolean>(false);

  const checkedData = useMemo(() => {
    const data = [];
    function find(nodes) {
      if (!nodes?.length) {
        return;
      }
      nodes.forEach((node) => {
        if (node.children) {
          find(node.children);
        } else if (checkedKeys?.includes(node.key)) {
          data.push(node);
        }
      });
    }
    find(props.treeData);
    return data;
  }, [props.treeData, checkedKeys]);

  const sourceDisplayTreeData = useMemo(() => {
    if (!sourceSearch) {
      return props.treeData;
    }
    return props.treeData.filter((data) => {
      return data.title?.toString()?.toLowerCase()?.includes(sourceSearch?.toLowerCase?.());
    });
  }, [sourceSearch, props.treeData]);

  const targetDisplayTreeData = useMemo(() => {
    if (!targetSearch) {
      return checkedData;
    }
    return checkedData.filter((data) => {
      return data.title?.toString()?.toLowerCase()?.includes(targetSearch?.toLowerCase?.());
    });
  }, [targetSearch, checkedData]);
  const count = checkedKeys?.length || 0;
  const sourceCount = sourceDisplayTreeData?.length || 0;
  const isSelectAll = count > 1 && count === sourceCount;

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    let checkedKeys = [];
    if (checked) {
      checkedKeys = sourceDisplayTreeData?.map((item) => item?.key);
    }
    setCheckedKeys(checkedKeys);
  };

  useEffect(() => {
    setIndeterminate(count > 0 && !isSelectAll);
  }, [count, isSelectAll]);

  return (
    <div style={{ height: 370, display: 'flex', border: '1px solid var(--odc-border-color)' }}>
      <div
        style={{
          width: '50%',
          flexShrink: 0,
          flexGrow: 0,
          height: '100%',
          borderRight: '1px solid var(--odc-border-color)',
        }}
      >
        <Card
          enableSelectAll
          checked={isSelectAll}
          indeterminate={indeterminate}
          title={formatMessage({ id: 'odc.component.SelectTransfer.SelectUser' })} /*选择用户*/
          onSearch={(v) => {
            setSourceSearch(v);
          }}
          onSelectAll={handleSelectAll}
        >
          <Tree
            {...props}
            checkable
            selectable={false}
            checkedKeys={checkedKeys}
            onCheck={(v) => setCheckedKeys(v as string[])}
            height={274}
            treeData={sourceDisplayTreeData}
          />
        </Card>
      </div>
      <div style={{ width: '100%', height: '100%' }}>
        <Card
          title={
            formatMessage(
              {
                id: 'odc.component.SelectTransfer.CountItemSelected',
              },
              { count: count },
            ) //`已选 ${count} 项`
          }
          onSearch={(v) => {
            setTargetSearch(v);
          }}
          extra={
            <a onClick={() => setCheckedKeys([])}>
              {formatMessage({ id: 'odc.component.SelectTransfer.Clear' }) /*清空*/}
            </a>
          }
          disabled
        >
          <Tree
            className={styles.viewTree}
            selectable={false}
            height={274}
            treeData={targetDisplayTreeData}
            titleRender={(node) => {
              return (
                <div style={{ display: 'flex', maxWidth: '100%', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      flexGrow: 1,
                      flexShrink: 1,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                    title={node.title}
                  >
                    {node.title}
                  </span>
                  <span style={{ flexGrow: 0, flexShrink: 0 }}>
                    <Delete
                      onClick={() => {
                        setCheckedKeys(checkedKeys.filter((key) => key !== node.key));
                      }}
                    />
                  </span>
                </div>
              );
            }}
          />
        </Card>
      </div>
    </div>
  );
}
