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
import { timeUnitOptions } from '@/component/Task/DataArchiveTask/CreateModal/VariableConfig';
import { formatMessage } from '@/util/intl';
import React from 'react';
const oprationReg = /^[-+]\d+[shdwmMy]$/;
const columns = [
  {
    dataIndex: 'name',
    title: formatMessage({
      id: 'odc.DataArchiveTask.DetailContent.VariableConfig.VariableName',
      defaultMessage: '变量名',
    }),
    //变量名
    ellipsis: true,
    width: 190,
    render: (name) => name || '-',
  },
  {
    dataIndex: 'format',
    title: formatMessage({
      id: 'odc.DataArchiveTask.DetailContent.VariableConfig.TimeFormat',
      defaultMessage: '时间格式',
    }),
    //时间格式
    ellipsis: true,
    width: 150,
    render: (name) => name || '-',
  },
  {
    dataIndex: 'opration',
    title: formatMessage({
      id: 'odc.src.component.Task.component.VariableConfigTable.Shift',
      defaultMessage: '时间偏移',
    }), //'时间偏移'
    width: 160,
    render: (opration) => {
      let oprationLabel = opration;
      if (oprationLabel?.match(oprationReg)) {
        const unit = oprationLabel?.slice(-1);
        const unitLabel = timeUnitOptions?.find((item) => item?.value === unit)?.label;
        oprationLabel = oprationLabel.replace(unit, unitLabel);
      } else {
        oprationLabel = '-';
      }
      return oprationLabel;
    },
  },
];

const VariableConfigTable: React.FC<{
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
export default VariableConfigTable;
