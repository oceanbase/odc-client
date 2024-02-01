import { Popconfirm, Spin, Tree } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import ExportCard from '@/component/ExportCard';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { DbObjsIcon } from '@/constant';
import { DbObjectType } from '@/d.ts';
import classNames from 'classnames';
import { getTableListByDatabaseName } from '@/common/network/table';
import { useDBSession } from '@/store/sessionManager/hooks';

const TableSelector: React.FC<{
  databaseId?: number;
  targetDatabaseId?: number;
  value?: any[];
  onChange?: (newValue: any[]) => void;
}> = ({ databaseId, targetDatabaseId, value, onChange }) => {
  const { session, database } = useDBSession(databaseId);
  const sessionId = session?.sessionId;
  const [sourceSearchValue, setSourceSearchValue] = useState<string>(null);
  const [targetSearchValue, setTargetSearchValue] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [treeData, setTreeData] = useState<
    {
      title: string;
      key: string;
      icon: JSX.Element;
      children: Array<any>;
    }[]
  >([]);
  const handleCheck = (checkedKeys, e) => {
    const newValue = treeData
      ?.map((node) => {
        if (checkedKeys?.includes(node?.key)) {
          return node;
        }
        return null;
      })
      ?.filter(Boolean);
    setCheckedKeys(checkedKeys as string[]);
    onChange?.(newValue?.map((item) => item?.title));
  };
  const allTreeData = treeData
    ?.map((node) => {
      if (
        sourceSearchValue &&
        node?.title?.toLowerCase()?.indexOf(sourceSearchValue?.toLowerCase()) === -1
      ) {
        return null;
      }
      return node;
    })
    .filter(Boolean);
  const selectedTreeData = treeData
    ?.map((node) => {
      if (
        targetSearchValue &&
        node?.title?.toLowerCase()?.indexOf(targetSearchValue?.toLowerCase()) === -1
      ) {
        return null;
      }
      if (!checkedKeys?.includes(node?.key)) {
        return null;
      }
      return node;
    })
    .filter(Boolean);

  const loadTableListByDatabaseName = async () => {
    if (databaseId && sessionId && database) {
      setLoading(true);
      const result = await getTableListByDatabaseName(sessionId, database?.name);
      const newResult = result?.map((table, index) => {
        return {
          key: `0-${index}`,
          title: table?.tableName,
          icon: <Icon component={DbObjsIcon[DbObjectType.table]} />,
          children: [],
        };
      });
      setTreeData(newResult);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (sessionId && targetDatabaseId) {
      loadTableListByDatabaseName();
    }
  }, [sessionId, targetDatabaseId]);

  return (
    <div className={styles.doubleExportCardContainer}>
      <div className={styles.content}>
        <ExportCard
          title={`选择源表 (${checkedKeys?.length}/${treeData?.length})`}
          hasSelectAll={false}
          onSelectAll={() => setCheckedKeys(allTreeData?.map((node) => node?.key) as string[])}
          onSearch={(v) => setSourceSearchValue(v)}
        >
          <Spin spinning={loading}>
            <Tree
              showIcon
              selectable={false}
              checkable
              autoExpandParent
              treeData={allTreeData}
              checkedKeys={checkedKeys}
              defaultExpandAll
              onCheck={handleCheck}
              className={styles.tree}
            />
          </Spin>
        </ExportCard>
      </div>
      <div className={classNames(styles.content, styles.hasIconTree)}>
        <ExportCard
          title={`已选 ${checkedKeys?.length} 项`}
          onSearch={(v) => setTargetSearchValue(v)}
          extra={
            <Popconfirm
              onConfirm={() => {
                setCheckedKeys([]);
              }}
              placement="left"
              title="确定要清空已选对象吗？"
            >
              <a>清空</a>
            </Popconfirm>
          }
          disabled
        >
          <Tree
            defaultExpandAll
            autoExpandParent
            selectable={false}
            treeData={selectedTreeData}
            showIcon
            titleRender={(node) => {
              return (
                <div className={styles.node}>
                  <div className={styles.nodeName}>{node.title}</div>
                  <a
                    className={styles.delete}
                    onClick={() => {
                      const nodeKey = node?.key;
                      const newCheckedKeys = checkedKeys.filter((key) => key !== nodeKey);
                      const newValue = treeData
                        ?.map((node) => {
                          if (newCheckedKeys?.includes(node?.key)) {
                            return node;
                          }
                          return null;
                        })
                        ?.filter(Boolean);
                      setCheckedKeys(newCheckedKeys);
                      onChange?.(newValue);
                    }}
                  >
                    <DeleteOutlined />
                  </a>
                </div>
              );
            }}
          />
        </ExportCard>
      </div>
    </div>
  );
};
export default TableSelector;
