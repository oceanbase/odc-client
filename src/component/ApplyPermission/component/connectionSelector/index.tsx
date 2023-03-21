import ConnectionPopover from '@/component/ConnectionPopover';
import type { IConnection } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Popover, Space, Tree } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import React, { useEffect, useState } from 'react';
import SearchBar from '../searchBar';
import styles from './index.less';

interface IProps {
  connections: IConnection[];
  onChange: (ids: number[]) => void;
}

const ConnectionSelector: React.FC<IProps> = (props) => {
  const { connections, onChange } = props;
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [checkedConnections, setCheckedConnections] = useState([]);
  const [selectorKey, setSelectorKey] = useState('');
  const [viewerKey, setViewerKey] = useState('');
  const selectedLen = checkedKeys?.length;
  const allLen = connections?.length;

  const handleCheck = (keys, info) => {
    setCheckedKeys(keys);
  };

  const handleDelete = (key: number) => {
    const keys = [...checkedKeys];
    const keyIndex = keys.indexOf(key);
    keys.splice(keyIndex, 1);
    setCheckedKeys(keys);
  };

  const handleClear = () => {
    setCheckedKeys([]);
  };

  const handleSearch = (type: 'selector' | 'viewer', keyword: string) => {
    if (type === 'selector') {
      setSelectorKey(keyword);
    } else {
      setViewerKey(keyword);
    }
  };

  const withFilter = (list: IConnection[], keyword: string) => {
    return list?.filter((item) => {
      const { name, host, clusterName, tenantName } = item;
      return [name, host, clusterName, tenantName]
        .map((item) => item?.toLowerCase())
        .some((item) => item?.includes(keyword?.toLowerCase()));
    });
  };

  const treeData: DataNode[] = withFilter(connections, selectorKey)?.map(
    ({ username, ...rest }) => {
      return {
        title: (
          <Popover
            overlayClassName={styles.connectionPopover}
            placement="right"
            content={<ConnectionPopover connection={rest} />}
          >
            <Space>
              <LinkOutlined />
              <span>{rest.name}</span>
            </Space>
          </Popover>
        ),

        key: rest.id,
      };
    },
  );

  const viewerTreeData: DataNode[] = withFilter(checkedConnections, viewerKey)?.map(
    ({ name, id }) => {
      return {
        key: id,
        title: (
          <div className={styles.titleWrapper}>
            <Space>
              <LinkOutlined />
              <span>{name}</span>
            </Space>
            <span
              className={styles.button}
              onClick={() => {
                handleDelete(id);
              }}
            >
              <DeleteOutlined />
            </span>
          </div>
        ),
      };
    },
  );

  useEffect(() => {
    if (checkedKeys) {
      const checked = connections
        ?.map((item) => {
          return checkedKeys.includes(item.id) ? item : null;
        })
        ?.filter(Boolean);
      setCheckedConnections(checked);
    }
    onChange(checkedKeys);
  }, [checkedKeys, connections]);

  return (
    <div className={styles.selectorWrapper}>
      <div className={styles.selector}>
        <SearchBar
          title={
            <span>
              {
                formatMessage(
                  {
                    id: 'odc.component.connectionSelector.SelectConnectionSelectedlenAlllen',
                  },
                  { selectedLen: selectedLen, allLen: allLen },
                ) /*选择连接（{selectedLen}/{allLen}）*/
              }
            </span>
          }
          onChange={(e) => {
            handleSearch('selector', e.target.value);
          }}
        />

        <div className={styles.content}>
          <Tree
            checkable
            height={300}
            onCheck={handleCheck}
            treeData={treeData}
            checkedKeys={checkedKeys}
          />
        </div>
      </div>
      <div className={styles.viewer}>
        <SearchBar
          title={
            <>
              <span>
                {
                  formatMessage(
                    {
                      id: 'odc.component.connectionSelector.SelectedlenItemsSelected',
                    },
                    { selectedLen: selectedLen },
                  ) /*已选 {selectedLen} 项*/
                }
              </span>
              <Button type="link" onClick={handleClear}>
                {
                  formatMessage({
                    id: 'odc.component.connectionSelector.Clear',
                  }) /*清空*/
                }
              </Button>
            </>
          }
          onChange={(e) => {
            handleSearch('viewer', e.target.value);
          }}
        />

        <div className={styles.content}>
          <Tree height={300} treeData={viewerTreeData} />
        </div>
      </div>
    </div>
  );
};

export default ConnectionSelector;
