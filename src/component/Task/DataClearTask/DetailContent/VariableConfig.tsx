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
import React from 'react';

const columns = [
  {
    dataIndex: 'name',
    title: formatMessage({ id: 'odc.DataClearTask.DetailContent.VariableConfig.VariableName' }), //变量名
    ellipsis: true,
    width: 190,
    render: (name) => name || '-',
  },
  {
    dataIndex: 'format',
    title: formatMessage({ id: 'odc.DataClearTask.DetailContent.VariableConfig.TimeFormat' }), //时间格式
    ellipsis: true,
    width: 150,
    render: (name) => name || '-',
  },
  {
    dataIndex: 'opration',
    title: formatMessage({ id: 'odc.DataClearTask.DetailContent.VariableConfig.TimeOperation' }), //时间运算
    width: 160,
    render: (name) => name || '-',
  },
];

const VariableConfig: React.FC<{
  variables: {
    name: string;
    pattern: string;
  }[];
}> = (props) => {
  const { variables } = props;
  const dataSource = variables?.map(({ name, pattern }) => {
    const [format, opration] = pattern?.split('|');
    return {
      name,
      format,
      opration,
    };
  });

  return (
    <DisplayTable
      rowKey="id"
      columns={columns}
      dataSource={dataSource}
      scroll={null}
      disablePagination
    />
  );
};

export default VariableConfig;
