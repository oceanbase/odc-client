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

import { deleteIntegration, getIntegrationList, setIntegration } from '@/common/network/manager';
import Action from '@/component/Action';
import FilterIcon from '@/component/Button/FIlterIcon';
import Reload from '@/component/Button/Reload';
import StatusSwitch from '@/component/StatusSwitch';
import MiniTable from '@/component/Table/MiniTable';
import TableCard from '@/component/Table/TableCard';
import { IManagerIntegration, IntegrationType, IResponseData } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { useRequest } from 'ahooks';
import { message, Popconfirm } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useEffect, useRef, useState } from 'react';
import NewSSODrawerButton from './NewSSODrawerButton';
import EditSSODrawer from './NewSSODrawerButton/Edit';
import SSODetailDrawer from './SSODetailDrawer';
import tracert from '@/util/tracert';

export default function SSO() {
  const [list, setList] = useState<IResponseData<IManagerIntegration>>();

  const [viewId, setViewId] = useState<number>();
  const [editId, setEditId] = useState<number>();

  const { loading, run } = useRequest(getIntegrationList, {
    manual: true,
  });

  const { loading: setEnabledLoading, run: runSetIntegration } = useRequest(setIntegration, {
    manual: true,
  });

  const paramsRef = useRef<{
    current: number;
    pageSize: number;
  }>();
  useEffect(() => {
    tracert.expo('a3112.b64009.c330927');
  }, []);

  const loadData = async (current, pageSize) => {
    paramsRef.current = {
      current,
      pageSize,
    };

    const data = {
      type: IntegrationType.SSO,
      page: current,
      size: pageSize,
    };
    const list = await run(data);
    setList(list);
  };

  function reload() {
    setList(null);
    loadData(paramsRef?.current?.current, paramsRef?.current?.pageSize);
  }
  async function changeStatus(v: boolean, id: number) {
    const isSuccess = await runSetIntegration({
      id: id,
      enabled: v,
    });
    if (isSuccess) {
      message.success(
        formatMessage({ id: 'odc.ExternalIntegration.SSO.OperationSucceeded' }), //操作成功
      );
      reload();
    }
  }

  const columns: ColumnType<IManagerIntegration>[] = [
    {
      title: formatMessage({ id: 'odc.ExternalIntegration.SSO.Name' }), //名称
      dataIndex: 'name',
    },
    {
      title: formatMessage({ id: 'odc.ExternalIntegration.SSO.Type' }), //类型
      dataIndex: 'type',
      width: 80,
      render(value, record, index) {
        try {
          return JSON.parse(record.configuration)?.type || '-';
        } catch (e) {
          return '-';
        }
      },
    },
    {
      title: formatMessage({ id: 'odc.ExternalIntegration.SSO.CreationDate' }), //创建日期
      dataIndex: 'createTime',
      width: 200,
      render(v) {
        return getLocalFormatDateTime(v);
      },
    },
    {
      title: formatMessage({ id: 'odc.ExternalIntegration.SSO.Founder' }), //创建人
      dataIndex: 'creatorName',
      width: 120,
    },
    {
      title: formatMessage({ id: 'odc.ExternalIntegration.SSO.WhetherToEnable' }), //是否启用
      dataIndex: 'enabled',
      width: 100,
      render(v, record) {
        return (
          <StatusSwitch
            checked={v}
            onConfirm={async () => {
              changeStatus(!v, record.id);
            }}
            onCancel={() => {
              changeStatus(!v, record.id);
            }}
          />
        );
      },
    },
    {
      title: formatMessage({ id: 'odc.ExternalIntegration.SSO.Operation' }), //操作
      dataIndex: '_action',
      width: 180,
      render(_, record: IManagerIntegration) {
        return (
          <Action.Group size={3}>
            <Action.Link onClick={() => setViewId(record?.id)} key={'view'}>
              {formatMessage({ id: 'odc.ExternalIntegration.SSO.View' }) /*查看*/}
            </Action.Link>
            <Action.Link
              onClick={() => {
                setEditId(record.id);
              }}
              key={'edit'}
            >
              {formatMessage({ id: 'odc.ExternalIntegration.SSO.Edit' }) /*编辑*/}
            </Action.Link>
            <Popconfirm
              title={formatMessage({
                id: 'odc.ExternalIntegration.SSO.AreYouSureYouWant',
              })} /*是否确认删除？*/
              onConfirm={async () => {
                const isSuccess = await deleteIntegration(record.id);
                if (isSuccess) {
                  message.success(
                    formatMessage({ id: 'odc.ExternalIntegration.SSO.OperationSucceeded' }), //操作成功
                  );
                  reload();
                }
              }}
            >
              <Action.Link key={'deleted'}>
                {formatMessage({ id: 'odc.ExternalIntegration.SSO.Delete' }) /*删除*/}
              </Action.Link>
            </Popconfirm>
          </Action.Group>
        );
      },
    },
  ];

  return (
    <TableCard
      title={<NewSSODrawerButton onSuccess={() => reload()} />}
      extra={
        <>
          <FilterIcon onClick={reload}>
            <Reload />
          </FilterIcon>
        </>
      }
    >
      <MiniTable
        loading={loading}
        columns={columns}
        dataSource={list?.contents}
        pagination={{
          total: list?.page?.totalElements,
        }}
        loadData={(page) => {
          loadData(page.current, page.pageSize);
        }}
      />

      <SSODetailDrawer close={() => setViewId(null)} id={viewId} visible={!!viewId} />
      <EditSSODrawer
        visible={!!editId}
        id={editId}
        onSave={() => reload()}
        close={() => setEditId(null)}
      />
    </TableCard>
  );
}
