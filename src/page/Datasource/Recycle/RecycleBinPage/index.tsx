import { getRecycleConfig, updateRecycleConfig } from '@/common/network/recycle';
import Reload from '@/component/Button/Reload';
import MiniTable from '@/component/Table/MiniTable';
import TableCard from '@/component/Table/TableCard';
import Toolbar from '@/component/Toolbar';
import { IRecycleConfig, IRecycleObject } from '@/d.ts';
import sessionManager from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import { sortString } from '@/util/utils';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Input, Layout, Space } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { formatMessage } from 'umi';
import RecyleConfigContext from './context/RecyleConfigContext';
import styles from './index.less';
import RecycleConfig from './RecyleConfig';

const ToolbarButton = Toolbar.Button;

const { Search } = Input;
const { Content } = Layout;

interface IProps {
  dataSourceId: string;
}

export default function RecycleBin({ dataSourceId }: IProps) {
  const [selectedObjectNames, setSelectedObjectNames] = useState<Set<string>>(new Set());
  const [searchKey, setSearchKey] = useState<string>();
  const [session, setSession] = useState<SessionStore>();
  const [recycleConfig, setRecycleConfig] = useState<IRecycleConfig>();

  const _getRecycleConfig = async (sessionId) => {
    const setting = await getRecycleConfig(sessionId);
    setRecycleConfig(setting);
  };

  async function createSession(dataSourceId) {
    const _session = await sessionManager.createSession(dataSourceId, null);
    if (_session) {
      setSession(session);
    }
  }

  useEffect(() => {
    if (session) {
      _getRecycleConfig(session?.sessionId);
    }
  }, [session]);

  useEffect(() => {
    createSession(dataSourceId);
  }, []);

  const columns: ColumnType<any>[] = [
    {
      dataIndex: 'id',
      title: formatMessage({
        id: 'workspace.window.recyclebin.column.originName',
      }),

      sorter: (a: IRecycleObject, b: IRecycleObject) => sortString(a.id, b.id),
      sortDirections: ['descend', 'ascend'],
    },

    {
      dataIndex: 'objName',
      title: formatMessage({
        id: 'workspace.window.recyclebin.column.objName',
      }),
    },

    {
      dataIndex: 'objType',
      title: formatMessage({
        id: 'workspace.window.recyclebin.column.objType',
      }),
    },

    {
      dataIndex: 'createTime',
      title: formatMessage({
        id: 'workspace.window.recyclebin.column.createTime',
      }),
    },
  ];

  const filteredRows = session?.recycleObjects.filter(
    (p) =>
      (p.id && p.id.toLowerCase().indexOf(searchKey.toLowerCase()) > -1) ||
      (p.objName && p.objName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1),
  );

  const handleRowSelected = (ids: string[]) => {
    selectedObjectNames.clear();
    ids.forEach((id) => {
      selectedObjectNames.add(id);
    });
    setSelectedObjectNames(selectedObjectNames);
  };

  const handleCancelAllSelected = (filteredRows: IRecycleObject[]) => {
    filteredRows?.forEach((row) => {
      if (selectedObjectNames.has(row.uniqueId)) {
        selectedObjectNames.delete(row.uniqueId);
      }
    });
    setSelectedObjectNames(selectedObjectNames);
  };

  const changeSetting = async (config: Partial<IRecycleConfig>) => {
    const isSuccess = await updateRecycleConfig(config, this.session?.sessionId);
    if (isSuccess) {
      _getRecycleConfig(session?.sessionId);
    }
    return isSuccess;
  };

  return (
    <TableCard
      title={
        <Space>
          <Button danger>删除</Button>
          <Button>还原</Button>
          <Button danger>清空</Button>
        </Space>
      }
      extra={
        <Space>
          <Search
            allowClear
            placeholder={formatMessage({
              id: 'workspace.window.session.button.search',
            })}
            onSearch={(v) => setSearchKey(v)}
            onChange={(e) => setSearchKey(e.target.value)}
            size="small"
            style={{
              height: 24,
            }}
            className={styles.search}
          />

          <RecyleConfigContext.Provider
            value={{
              setting: recycleConfig,
              changeSetting: changeSetting,
            }}
          >
            <RecycleConfig>
              <ToolbarButton
                text={
                  formatMessage({
                    id: 'odc.components.RecycleBinPage.Settings',
                  })
                  //设置
                }
                icon={<SettingOutlined />}
              />
            </RecycleConfig>
          </RecyleConfigContext.Provider>
          <Reload
            onClick={async () => {
              setSelectedObjectNames(new Set());
              await session.getRecycleObjectList();
            }}
          />
        </Space>
      }
    >
      <MiniTable
        rowKey="uniqueId"
        loadData={() => {}}
        columns={columns}
        dataSource={filteredRows}
        rowSelection={{
          selectedRowKeys: Array.from(selectedObjectNames),
          onChange: (selectedRowKeys: string[], rows: IRecycleObject[]) => {
            handleRowSelected(selectedRowKeys);
          },
          selections: [
            {
              key: 'all-data',
              text: formatMessage({
                id: 'odc.components.RecycleBinPage.SelectAllObjects',
              }),
              //选择所有对象
              onSelect: () => {
                handleRowSelected(filteredRows.map((row) => row.uniqueId));
              },
            },

            {
              key: 'cancel-all-data',
              text: formatMessage({
                id: 'odc.components.RecycleBinPage.CancelAllObjects',
              }),
              //取消所有对象
              onSelect: () => {
                handleCancelAllSelected(filteredRows);
              },
            },
          ],
        }}
      />
    </TableCard>
  );
}
