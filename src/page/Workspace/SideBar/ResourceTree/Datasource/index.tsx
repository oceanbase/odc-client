import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { Dropdown, Empty, Input, message, Modal, Popover, Spin, Tree, TreeDataNode } from 'antd';
import ResourceTree from '..';
import ResourceLayout from '../Layout';

import { deleteConnection, getDataSourceGroupByProject } from '@/common/network/connection';
import { listDatabases } from '@/common/network/database';
import { useRequest } from 'ahooks';
import { forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import styles from './index.less';

import ConnectionPopover from '@/component/ConnectionPopover';
import { IDatasource } from '@/d.ts/datasource';
import NewDatasourceDrawer from '@/page/Datasource/Datasource/NewDatasourceDrawer';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import login from '@/store/login';
import OBSvg from '@/svgr/source_ob.svg';
import { toInteger, toNumber } from 'lodash';

export default forwardRef(function DatasourceTree(props, ref) {
  const { data, loading, run } = useRequest(getDataSourceGroupByProject, {
    defaultParams: [login.isPrivateSpace()],
  });
  const [editDatasourceId, setEditDatasourceId] = useState(null);
  const [searchKey, setSearchKey] = useState('');

  const context = useContext(ResourceTreeContext);

  const selectKeys = [context.selectDatasourceId].filter(Boolean);
  function setSelectKeys(keys) {
    return context.setSelectDatasourceId(keys?.[0]);
  }

  useImperativeHandle(
    ref,
    () => {
      return {
        reload() {
          setSelectKeys([]);
          return run();
        },
      };
    },
    [run],
  );

  const selectConnection = useMemo(() => {
    const key = selectKeys?.[0];
    if (!key) {
      return null;
    }
    return data?.contents?.find((item) => item.id == key);
  }, [selectKeys, data]);

  const datasource: TreeDataNode[] = useMemo(() => {
    return data?.contents
      ?.map((item) => {
        if (searchKey && !item.name?.toLowerCase()?.includes(searchKey?.toLowerCase())) {
          return null;
        }
        return {
          title: item.name,
          key: item.id,
          icon: <Icon component={OBSvg} style={{ fontSize: 16 }} />,
        };
      })
      .filter(Boolean);
  }, [data, searchKey]);

  const datasourceMap = useMemo(() => {
    const map = new Map<number, IDatasource>();
    data?.contents?.forEach((c) => {
      map.set(c.id, c);
    });
    return map;
  }, [data?.contents]);

  const {
    data: db,
    reset,
    run: runListDatabases,
    loading: dbLoading,
  } = useRequest(listDatabases, {
    manual: true,
  });

  useEffect(() => {
    console.log(selectKeys?.[0]);
    if (selectKeys?.[0]) {
      runListDatabases(null, selectKeys?.[0], 1, 9999);
    } else {
      reset();
    }
  }, [selectKeys?.[0]]);

  return (
    <ResourceLayout
      top={
        <div className={styles.container}>
          <div className={styles.search}>
            <Input.Search
              onSearch={(v) => {
                setSearchKey(v);
              }}
              placeholder={formatMessage({
                id: 'odc.ResourceTree.Datasource.SearchForDataSources',
              })} /*搜索数据源*/
              style={{ width: '100%' }}
              size="small"
            />
          </div>
          <div className={styles.list}>
            <Spin spinning={loading || dbLoading}>
              {datasource?.length ? (
                <Tree
                  titleRender={(node) => {
                    return (
                      <Dropdown
                        trigger={login.isPrivateSpace() ? ['contextMenu'] : []}
                        menu={{
                          items: [
                            {
                              label: formatMessage({ id: 'odc.ResourceTree.Datasource.Edit' }), //编辑
                              key: 'edit',
                              onClick: (e) => {
                                e.domEvent?.stopPropagation();
                                setEditDatasourceId(node.key);
                              },
                            },
                            {
                              label: formatMessage({ id: 'odc.ResourceTree.Datasource.Delete' }), //删除
                              key: 'delete',
                              onClick: (e) => {
                                e.domEvent?.stopPropagation();
                                const name = node.title;
                                Modal.confirm({
                                  title: formatMessage(
                                    {
                                      id: 'odc.ResourceTree.Datasource.AreYouSureYouWant',
                                    },
                                    { name: name },
                                  ), //`确认删除数据源 ${name}?`
                                  async onOk() {
                                    const isSuccess = await deleteConnection(node.key as any);
                                    if (isSuccess) {
                                      message.success(
                                        formatMessage({
                                          id: 'odc.ResourceTree.Datasource.DeletedSuccessfully',
                                        }), //删除成功
                                      );
                                      if (selectKeys.includes(toInteger(node.key))) {
                                        setSelectKeys([]);
                                      }
                                      run();
                                    }
                                  },
                                });
                              },
                            },
                          ],
                        }}
                      >
                        <Popover
                          showArrow={false}
                          overlayClassName={styles.connectionPopover}
                          placement="rightBottom"
                          content={
                            <ConnectionPopover connection={datasourceMap.get(toNumber(node.key))} />
                          }
                        >
                          {node.title}
                        </Popover>
                      </Dropdown>
                    );
                  }}
                  selectedKeys={selectKeys}
                  onSelect={(keys) => {
                    setSelectKeys(keys);
                  }}
                  showIcon
                  selectable
                  multiple={false}
                  treeData={datasource}
                />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Spin>
          </div>
          <NewDatasourceDrawer
            isEdit={true}
            isPersonal={true}
            visible={!!editDatasourceId}
            id={editDatasourceId}
            close={() => setEditDatasourceId(null)}
            onSuccess={() => {
              run();
            }}
          />
        </div>
      }
      bottomLoading={dbLoading}
      bottom={
        selectKeys?.length ? (
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <ResourceTree
              reloadDatabase={() => runListDatabases(null, selectKeys?.[0], 1, 9999)}
              databaseFrom="datasource"
              title={selectConnection?.name}
              key={selectKeys?.[0]}
              databases={db?.contents}
            />
          </div>
        ) : null
      }
    />
  );
});
