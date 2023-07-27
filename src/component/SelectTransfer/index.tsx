import { formatMessage } from '@/util/intl';
import { useControllableValue } from 'ahooks';
import { Tree, TreeProps } from 'antd';
import { useMemo, useState } from 'react';
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
  return (
    <div style={{ height: 370, display: 'flex', border: '1px solid var(--odc-border-color)' }}>
      <div
        style={{ width: '100%', height: '100%', borderRight: '1px solid var(--odc-border-color)' }}
      >
        <Card
          title={formatMessage({ id: 'odc.component.SelectTransfer.SelectUser' })} /*选择用户*/
          onSearch={(v) => {
            setSourceSearch(v);
          }}
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
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{node.title}</span>
                  <Delete
                    onClick={() => {
                      setCheckedKeys(checkedKeys.filter((key) => key !== node.key));
                    }}
                  />
                </div>
              );
            }}
          />
        </Card>
      </div>
    </div>
  );
}
