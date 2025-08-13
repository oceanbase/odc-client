import DisplayTable from '@/component/DisplayTable';
import { formatMessage } from '@/util/intl';
import { Flex, Popover, Tooltip, Typography } from 'antd';
import React from 'react';
import { conditionExpressionColumns } from '@/component/Task/helper';

const columns = (needCheckBeforeDelete: boolean) => [
  {
    dataIndex: 'tableName',
    title: formatMessage({
      id: 'odc.DataClearTask.DetailContent.ArchiveRange.TableName',
      defaultMessage: '表名',
    }), //表名
    ellipsis: true,
    width: 140,
  },
  {
    dataIndex: 'conditionExpression',
    title: formatMessage({
      id: 'odc.DataClearTask.DetailContent.ArchiveRange.FilterConditions',
      defaultMessage: '过滤条件',
    }), //过滤条件
    ellipsis: true,
    render: (value, record) => {
      return (
        <Flex justify="space-between">
          <Tooltip title={value}>
            <span
              style={{
                maxWidth: 160,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {value ?? '-'}
            </span>
          </Tooltip>
          {record?.joinTableConfigs?.length ? (
            <Popover
              content={
                <DisplayTable
                  dataSource={record?.joinTableConfigs}
                  columns={conditionExpressionColumns}
                  disablePagination
                ></DisplayTable>
              }
            >
              <Typography.Link>
                {formatMessage({
                  id: 'src.component.Task.DataClearTask.DetailContent.079D6222',
                  defaultMessage: '关联表',
                })}
              </Typography.Link>
            </Popover>
          ) : (
            <></>
          )}
        </Flex>
      );
    },
  },
  {
    dataIndex: 'targetTableName',
    title: formatMessage({
      id: 'src.component.Task.DataClearTask.DetailContent.A104F847',
      defaultMessage: '目标表名',
    }),
    ellipsis: true,
    width: 140,
    render: (value) => {
      if (!needCheckBeforeDelete) {
        return '-';
      }
      return <Tooltip title={value}>{value || '-'}</Tooltip>;
    },
  },
  {
    dataIndex: 'partitions',
    title: formatMessage({
      id: 'src.component.Task.DataClearTask.DetailContent.2470B293',
      defaultMessage: '指定分区',
    }),
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
  needCheckBeforeDelete?: boolean;
}> = (props) => {
  const { tables, needCheckBeforeDelete = false } = props;
  return (
    <DisplayTable
      rowKey="id"
      columns={columns(needCheckBeforeDelete)}
      dataSource={tables}
      scroll={null}
      disablePagination
    />
  );
};

export default ArchiveRange;
