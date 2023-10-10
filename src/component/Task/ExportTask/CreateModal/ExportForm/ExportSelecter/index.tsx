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

import { getExportObjects } from '@/common/network';
import ExportCard from '@/component/ExportCard';
import { DbObjectType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { Empty, Popconfirm, Spin, Tree } from 'antd';
import { isArray } from 'lodash';
import React, { useEffect, useState } from 'react';

import { DbObjsIcon } from '@/constant';
import { DbObjectTypeTextMap } from '@/constant/label';
import { DataNode } from 'antd/lib/tree';
import classnames from 'classnames';
import styles from './index.less';

const SPLITKEY = '$#$odc_split$#$';
interface IProps {
  databaseId: number;
  connectionId: number;
  onlyTable?: boolean;
  value?: any[];
  onChange?: (newValue: any[]) => void;
}

type IObjs = {
  [key in DbObjectType]?: string[];
};

const ExportSelecter: React.FC<IProps> = function ({
  databaseId,
  connectionId,
  onlyTable,
  value,
  onChange,
}) {
  const [objsLoading, setObjsLoading] = useState(false);
  const [sourceSearchValue, setSourceSearchValue] = useState(null);
  const [targetSearchValue, setTargetSearchValue] = useState(null);
  const [objs, setObjs] = useState<IObjs>({});
  const [checkedKeys, _setCheckedKeys] = useState([]);

  function wrapValueStruct(dbObjectType, objectName) {
    return {
      dbObjectType,
      objectName,
    };
  }

  function setCheckedKeys(v) {
    let newValue = [];
    v?.forEach((key) => {
      const [type, name] = key?.split(SPLITKEY);
      if (!name) {
        return;
      }
      if (type === DbObjectType.package && objs[DbObjectType?.package_body]?.includes(name)) {
        /**
         * 需要增加程序包体进去
         */
        newValue.push(wrapValueStruct(DbObjectType.package_body, name));
      }
      newValue.push(wrapValueStruct(type, name));
    });
    onChange?.(newValue);
  }

  useEffect(() => {
    const newCheckedKeys =
      value
        ?.map(({ dbObjectType, objectName }) => {
          if (dbObjectType === DbObjectType.package_body) {
            return null;
          }
          return getObjKey(objectName, dbObjectType);
        })
        ?.filter(Boolean) || [];
    _setCheckedKeys(newCheckedKeys);
  }, [value]);

  function getObjTypeList() {
    return onlyTable
      ? [DbObjectType.table]
      : [
          DbObjectType.table,
          DbObjectType.view,
          DbObjectType.function,
          DbObjectType.procedure,
          DbObjectType.sequence,
          DbObjectType.package,
          DbObjectType.trigger,
          DbObjectType.synonym,
          DbObjectType.public_synonym,
          DbObjectType.type,
        ];
  }

  const loadExportObjects = async () => {
    setObjsLoading(true);

    try {
      const obj = await getExportObjects(databaseId, null, connectionId);

      if (obj) {
        const objList = getObjTypeList();

        let tmp = {};
        objList.forEach((dbObjectType) => {
          const objs = obj[dbObjectType];
          tmp[dbObjectType] = objs;
        });
        setObjs(obj);
      }
    } catch (e) {
      console.trace(e);
    } finally {
      setObjsLoading(false);
    }
  };
  useEffect(() => {
    if (databaseId) {
      loadExportObjects();
    }
  }, [databaseId]);

  function getObjKey(name, type) {
    return type + SPLITKEY + name;
  }

  function getCheckedTreeData() {
    const dbObjsList = getObjTypeList();
    const tmp = {};
    checkedKeys.forEach((checkedKey) => {
      if (dbObjsList.includes(checkedKey)) {
        return;
      }
      const [type, name] = checkedKey.split(SPLITKEY);
      if (!tmp[type]) {
        tmp[type] = [];
      }
      tmp[type].push(name);
    });

    return dbObjsList
      .map((objType) => {
        if (!tmp[objType]) {
          return null;
        }
        const ObjIcon = DbObjsIcon[objType];
        let icon = null;
        if (ObjIcon) {
          icon = <Icon component={ObjIcon} />;
        }
        const children = tmp[objType]
          .map((name) => {
            if (
              targetSearchValue &&
              name?.toLowerCase().indexOf(targetSearchValue?.toLowerCase()) === -1
            ) {
              return null;
            }
            return {
              title: name,
              icon,
              key: getObjKey(name, objType),
            };
          })
          .filter(Boolean);
        return {
          title: DbObjectTypeTextMap[objType] + `(${children?.length})`,
          key: objType,
          icon,
          children,
        };
      })
      .filter(Boolean);
  }

  function getAllTreeData(): DataNode[] {
    const dbObjsList = getObjTypeList();
    return dbObjsList
      .map((objType) => {
        if (!objs[objType]) {
          return null;
        }
        const ObjIcon = DbObjsIcon[objType];
        let icon = null;
        if (ObjIcon) {
          icon = <Icon component={ObjIcon} />;
        }
        const children = objs[objType]
          ?.map((name) => {
            if (
              sourceSearchValue &&
              name?.toLowerCase().indexOf(sourceSearchValue?.toLowerCase()) === -1
            ) {
              return null;
            }
            return {
              title: <span style={{ wordBreak: 'break-all' }}>{name}</span>,
              icon,
              key: getObjKey(name, objType),
            };
          })
          .filter(Boolean);
        return {
          title: DbObjectTypeTextMap[objType] + `(${children?.length})`,
          key: objType,
          icon,
          children,
        };
      })
      .filter(Boolean);
  }

  const allTreeData = getAllTreeData();
  const selectedTreeData = getCheckedTreeData();
  const allTreeDataCount = Object.entries(allTreeData).reduce((prev, current) => {
    return prev + current?.[1]?.children.length;
  }, 0);
  const selectedTreeDataCount = checkedKeys.filter((key) => !getObjTypeList().includes(key))
    ?.length;
  return (
    <div className={styles.selecter}>
      <div className={styles.content}>
        <Spin spinning={objsLoading}>
          <ExportCard
            onSearch={(v) => setSourceSearchValue(v)}
            title={
              formatMessage({
                id: 'odc.ExportForm.ExportSelecter.SelectObject',
              }) + //选择对象
              `(${allTreeDataCount})`
            }
          >
            <Tree
              showIcon
              height={300}
              selectable={false}
              checkable
              autoExpandParent
              treeData={allTreeData}
              onCheck={(_checkedKeys, { checked }) => {
                if (!isArray(_checkedKeys)) {
                  return;
                }
                const newCheckedKeys = new Set(checkedKeys);
                allTreeData.forEach((item) => {
                  const { children } = item;
                  if (children) {
                    children.forEach((childItem) => {
                      newCheckedKeys.delete(childItem.key);
                    });
                  }
                });
                _checkedKeys.forEach((key) => newCheckedKeys.add(key));
                setCheckedKeys(Array.from(newCheckedKeys));
              }}
              checkedKeys={checkedKeys}
            />
          </ExportCard>
        </Spin>
      </div>
      <div className={classnames(styles.content, styles.hasIconTree)}>
        <ExportCard
          title={
            formatMessage(
              {
                id: 'odc.ExportForm.ExportSelecter.SelectedtreedatacountItemsSelected',
              },
              { selectedTreeDataCount: selectedTreeDataCount },
            ) //`已选 ${selectedTreeDataCount} 项`
          }
          onSearch={(v) => setTargetSearchValue(v)}
          extra={
            <Popconfirm
              onConfirm={() => {
                setCheckedKeys([]);
              }}
              placement="left"
              title={formatMessage({
                id: 'odc.ExportForm.ExportSelecter.AreYouSureYouWant',
              })} /*确定要清空已选对象吗？*/
            >
              <a>
                {
                  formatMessage({
                    id: 'odc.ExportForm.ExportSelecter.Clear',
                  }) /*清空*/
                }
              </a>
            </Popconfirm>
          }
          disabled
        >
          {selectedTreeData?.length ? (
            <Tree
              showIcon
              height={300}
              defaultExpandAll
              autoExpandParent
              selectable={false}
              treeData={selectedTreeData}
              titleRender={(node) => {
                return (
                  <div className={styles.node}>
                    <div className={styles.nodeName}>{node.title}</div>
                    <a
                      className={styles.delete}
                      onClick={() => {
                        const nodeKey = node.key;
                        if (getObjTypeList().includes(nodeKey)) {
                          /**
                           * 说明这里删除的是根节点
                           */
                          const typeList = selectedTreeData.find((d) => d.key === nodeKey)
                            ?.children;
                          const filterAllkeys = typeList?.map((item) => item.key);
                          setCheckedKeys(
                            checkedKeys.filter((key) => !filterAllkeys?.includes(key)),
                          );

                          return;
                        }
                        setCheckedKeys(checkedKeys.filter((key) => key !== nodeKey));
                      }}
                    >
                      <DeleteOutlined />
                    </a>
                  </div>
                );
              }}
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </ExportCard>
      </div>
    </div>
  );
};

export default ExportSelecter;
