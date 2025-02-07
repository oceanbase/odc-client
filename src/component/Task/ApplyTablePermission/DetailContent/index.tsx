import { formatMessage } from '@/util/intl';
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

import { getDataSourceStyleByConnectType } from '@/common/datasource';
import DisplayTable from '@/component/DisplayTable';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import type { IApplyTablePermissionTaskParams, TaskDetail } from '@/d.ts';
import { getFormatDateTime } from '@/util/utils';
import { Descriptions, Divider, Space } from 'antd';
import { useMemo } from 'react';
import { getExpireTimeLabel, permissionOptionsMap } from '../';

const getConnectionColumns = () => {
  return [
    {
      dataIndex: 'databaseName',
      title: formatMessage({
        id: 'src.component.Task.ApplyTablePermission.DetailContent.9E007486',
        defaultMessage: '数据库',
      }),
      ellipsis: true,
      width: 240,
      render(databaseName: string, { dataSourceType }) {
        const Icon = dataSourceType
          ? getDataSourceStyleByConnectType(dataSourceType)?.dbIcon?.component
          : null;
        return (
          <Space>
            {Icon && <Icon />}
            <span>{databaseName}</span>
          </Space>
        );
      },
    },
    {
      dataIndex: 'tableName',
      title: formatMessage({
        id: 'src.component.Task.ApplyTablePermission.DetailContent.9E20200F',
        defaultMessage: '表/视图',
      }),
      ellipsis: true,
      width: 240,
    },
    {
      dataIndex: 'dataSourceName',
      title: formatMessage({
        id: 'src.component.Task.ApplyTablePermission.DetailContent.04825B86',
        defaultMessage: '所属数据源',
      }),
      ellipsis: true,
    },
  ];
};

interface IProps {
  task: TaskDetail<IApplyTablePermissionTaskParams>;
}
const TaskContent: React.FC<IProps> = (props) => {
  const { task } = props;
  const { parameters, database } = task || {};
  /**
   * 数据处理成每个表一行
   */
  const dataSource = useMemo(() => {
    const tableList = [];
    for (const table of parameters?.tables || []) {
      const { tableName, databaseName, dataSourceName } = table;
      tableList.push({
        tableName,
        databaseName,
        dataSourceName,
        dataSourceType: database?.dataSource?.type,
      });
    }
    return tableList;
  }, [database?.dataSource?.type, parameters?.tables]);

  return (
    <>
      <Descriptions column={1}>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.ApplyTablePermission.DetailContent.8CEA0610',
            defaultMessage: '任务编号',
          })}
        >
          {task?.id}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.ApplyTablePermission.DetailContent.4B4A4E81',
            defaultMessage: '任务类型',
          })}
        >
          {formatMessage({
            id: 'src.component.Task.ApplyTablePermission.DetailContent.A8093E8B',
            defaultMessage: '申请表/视图权限',
          })}
        </Descriptions.Item>
      </Descriptions>
      <Divider
        style={{
          marginTop: 4,
        }}
      />

      <Descriptions column={1}>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.ApplyTablePermission.DetailContent.32776504',
            defaultMessage: '项目',
          })}
        >
          {parameters?.project?.name}
        </Descriptions.Item>
      </Descriptions>
      <SimpleTextItem
        label={formatMessage({
          id: 'src.component.Task.ApplyTablePermission.DetailContent.C384EA27',
          defaultMessage: '表/视图',
        })}
        content={
          <DisplayTable
            rowKey="tableName"
            columns={getConnectionColumns()}
            dataSource={dataSource}
            scroll={null}
            showQuickJumper={false}
            showSizeChanger={false}
            pageSize={10}
          />
        }
        direction="column"
      />

      <Divider
        style={{
          marginTop: 4,
        }}
      />

      <Descriptions column={1}>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.ApplyTablePermission.DetailContent.64239A78',
            defaultMessage: '权限类型',
          })}
        >
          {parameters?.types?.map((key) => permissionOptionsMap[key].text)?.join(', ')}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.ApplyTablePermission.DetailContent.FB4B30E0',
            defaultMessage: '权限有效期',
          })}
        >
          {getExpireTimeLabel(parameters?.expireTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.ApplyTablePermission.DetailContent.55EE2A17',
            defaultMessage: '申请原因',
          })}
        >
          {parameters?.applyReason}
        </Descriptions.Item>
      </Descriptions>
      <Divider
        style={{
          marginTop: 4,
        }}
      />

      <Descriptions column={1}>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.ApplyTablePermission.DetailContent.2740E99B',
            defaultMessage: '创建人',
          })}
        >
          {task?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.ApplyTablePermission.DetailContent.7EEDDF7A',
            defaultMessage: '创建时间',
          })}
        >
          {getFormatDateTime(task?.createTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
export default TaskContent;
