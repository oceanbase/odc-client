import DisplayTable from '@/component/DisplayTable';
import { formatMessage } from '@/util/intl';
import React from 'react';
import { timeUnitOptions } from '../CreateModal/VariableConfig';

const oprationReg = /^[-+]\d+[shdwmy]$/;

const columns = [
  {
    dataIndex: 'name',
    title: formatMessage({ id: 'odc.DataArchiveTask.DetailContent.VariableConfig.VariableName' }), //变量名
    ellipsis: true,
    width: 190,
    render: (name) => name || '-',
  },
  {
    dataIndex: 'format',
    title: formatMessage({ id: 'odc.DataArchiveTask.DetailContent.VariableConfig.TimeFormat' }), //时间格式
    ellipsis: true,
    width: 150,
    render: (name) => name || '-',
  },
  {
    dataIndex: 'opration',
    title: formatMessage({ id: 'odc.DataArchiveTask.DetailContent.VariableConfig.TimeOperation' }), //时间运算
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
