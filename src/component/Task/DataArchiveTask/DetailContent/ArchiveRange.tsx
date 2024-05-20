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

import DisplayTable from '@/component/DisplayTable';
import { formatMessage } from '@/util/intl';
import { Tooltip } from 'antd';
import React from 'react';

const columns = [
  {
    dataIndex: 'tableName',
    title: formatMessage({ id: 'odc.DataArchiveTask.DetailContent.ArchiveRange.TableName' }), //表名
    ellipsis: true,
    width: 190,
  },
  {
    dataIndex: 'conditionExpression',
    title: formatMessage({ id: 'odc.DataArchiveTask.DetailContent.ArchiveRange.FilterConditions' }), //过滤条件
    ellipsis: true,
    render: (value) => {
      return <Tooltip title={value}>{value ?? '-'}</Tooltip>;
    },
  },
  {
    dataIndex: 'targetTableName',
    title: formatMessage({ id: 'src.component.Task.DataArchiveTask.DetailContent.8D9A2CED' }), //'目标表名'
    ellipsis: true,
    width: 190,
  },
  {
    dataIndex: 'partitions',
    title: '指定分区',
    ellipsis: true,
    width: 190,
    render: (value) => {
      return value?.join(',') || '-';
    },
  },
];

const ArchiveRange: React.FC<{
  tables: {
    conditionExpression: string;
    tableName: string;
  }[];
}> = (props) => {
  const { tables } = props;
  return (
    <DisplayTable
      rowKey="id"
      columns={columns}
      dataSource={tables}
      scroll={null}
      disablePagination
    />
  );
};

export default ArchiveRange;
