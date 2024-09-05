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

import { render } from '@/app';
import DisplayTable from '@/component/DisplayTable';
import { Debug } from '@/store/debug';
import { formatMessage } from '@/util/intl';
import { Empty } from 'antd';
import React from 'react';

interface IProps {
  debug: Debug;
}

const DebugVariables: React.FC<IProps> = (props) => {
  const { debug } = props;
  const executeRecordColumns = [
    {
      dataIndex: 'name',
      title: formatMessage({
        id: 'odc.components.PLDebugResultSet.VariableName',
      }),
    },

    {
      dataIndex: 'value',
      title: formatMessage({
        id: 'odc.components.PLDebugResultSet.Value',
      }),
      render(v) {
        return <pre>v</pre>;
      },
    },
  ];
  const variables = debug?.contextVariables;
  if (!variables?.length) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }
  return (
    <DisplayTable
      rowKey="frameNum"
      bordered={true}
      columns={executeRecordColumns}
      dataSource={variables}
      disablePagination={true}
    />
  );
};

export default DebugVariables;
