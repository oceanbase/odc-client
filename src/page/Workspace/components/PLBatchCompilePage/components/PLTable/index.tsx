import Action from '@/component/Action';
import DisplayTable from '@/component/DisplayTable/virtual';
import { formatMessage } from '@/util/intl';
import React from 'react';
import { Status } from '../Status';

const getPageColumns = (params: { label: string; openViewPage: (title: string) => void }) => {
  const { label, openViewPage } = params;
  return [
    {
      width: 40,
      key: 'status',
      dataIndex: 'status',
      render: (text, _, index) => {
        return index + 1;
      },
    },

    {
      title: formatMessage({ id: 'odc.components.PLTable.Status' }), //状态
      width: 64,
      key: 'status',
      dataIndex: 'status',
      filters: [
        {
          value: 'VALID',
          text: formatMessage({ id: 'odc.components.PLTable.Effective' }), //有效
        },
        {
          value: 'INVALID',
          text: formatMessage({ id: 'odc.components.PLTable.Invalid' }), //无效
        },
      ],

      onFilter: (value: string, record) => {
        return value === record.status;
      },
      render: (status, record) => <Status status={status} errorMessage={record.errorMessage} />,
    },

    {
      title: formatMessage({ id: 'odc.components.PLTable.ObjectName' }), //对象名称
      ellipsis: true,
      key: 'name',
      dataIndex: 'name',
    },

    {
      title: formatMessage({ id: 'odc.components.PLTable.ObjectType' }), //对象类型
      width: 120,
      key: 'type',
      dataIndex: 'type',
      render: () => <span>{label}</span>,
    },

    {
      title: formatMessage({ id: 'odc.components.PLTable.Operation' }), //操作
      width: 120,
      key: 'action',
      dataIndex: 'action',
      render: (action, record) => {
        return (
          <Action.Link
            onClick={async () => {
              openViewPage(record.name);
            }}
          >
            {formatMessage({ id: 'odc.components.PLTable.View' }) /*查看*/}
          </Action.Link>
        );
      },
    },
  ];
};

const PLTable: React.FC<{
  data: any[];
  label: string;
  tableHeight: number;
  openViewPage: (title: string) => void;
}> = (props) => {
  const { data, label, tableHeight, openViewPage } = props;

  return (
    <DisplayTable
      rowKey="id"
      bordered={true}
      columns={getPageColumns({
        label,
        openViewPage,
      })}
      dataSource={data}
      disablePagination={true}
      scroll={{
        y: tableHeight,
      }}
    />
  );
};

export default PLTable;
