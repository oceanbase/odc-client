import DisplayTable from '@/component/DisplayTable';
import { formatMessage } from '@/util/intl';
import { Button, Flex, Popover, Tooltip, Typography } from 'antd';
import React from 'react';
import { conditionExpressionColumns } from '@/component/Task/helper';
import { dmlParametersTables } from '@/d.ts/schedule';

const ArchiveRange: React.FC<{
  tables: dmlParametersTables[];
}> = (props) => {
  const { tables } = props;

  const getSettingTip = (value: dmlParametersTables) => {
    const { joinTableConfigs, partitions, tableName } = value || {};
    if (!partitions?.length && !joinTableConfigs?.length) return null;
    return (
      <div>
        {joinTableConfigs?.length ? (
          <div style={{ marginBottom: 8 }}>
            <div style={{ color: 'var(--text-color-hint)' }}>
              {formatMessage({
                id: 'src.component.Schedule.modals.DataArchive.Content.FE8B5FFD',
                defaultMessage: '关联表',
              })}
            </div>
            {joinTableConfigs?.map((item) => {
              return (
                <div style={{ display: 'flex', gap: 8 }}>
                  <div>{tableName}</div>
                  <div>join</div>
                  <div>{item?.tableName}</div>
                  <div>on</div>
                  <div>{item?.joinCondition}</div>
                </div>
              );
            })}
          </div>
        ) : null}
        {partitions?.length ? (
          <>
            <div style={{ color: 'var(--text-color-hint)' }}>
              {formatMessage({
                id: 'src.component.Schedule.modals.DataArchive.Content.1648CBAB',
                defaultMessage: '指定扫描分区',
              })}
            </div>
            {(partitions as string[])?.map((item, index) => (
              <>
                <span>{item}</span>
                {index !== partitions?.length - 1 && <span>;</span>}
              </>
            ))}
          </>
        ) : null}
      </div>
    );
  };

  const columns = [
    {
      dataIndex: 'tableName',
      key: 'tableName',
      title: formatMessage({
        id: 'src.component.Schedule.modals.DataArchive.Content.B08F1053',
        defaultMessage: '归档表',
      }),
      ellipsis: true,
      width: 140,
    },
    {
      dataIndex: 'targetTableName',
      key: 'targetTableName',
      title: formatMessage({
        id: 'src.component.Schedule.modals.DataArchive.Content.0F1D0521',
        defaultMessage: '目标表',
      }),
      ellipsis: true,
      width: 140,
    },
    {
      dataIndex: 'conditionExpression',
      key: 'conditionExpression',
      title: formatMessage({
        id: 'odc.DataArchiveTask.DetailContent.ArchiveRange.FilterConditions',
        defaultMessage: '过滤条件',
      }), //过滤条件
      ellipsis: true,
      width: 200,
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
                    id: 'src.component.Task.DataArchiveTask.DetailContent.361EA0F5',
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
      dataIndex: 'setting',
      key: 'setting',
      title: formatMessage({
        id: 'src.component.Schedule.modals.DataArchive.Content.2BCA0085',
        defaultMessage: '高级设置',
      }),
      ellipsis: true,
      width: 190,
      render: (_, record: dmlParametersTables) => {
        const showAction = record?.joinTableConfigs?.length || record?.partitions?.length;
        return showAction ? (
          <Popover content={getSettingTip(record)} destroyOnHidden>
            <a>
              {formatMessage({
                id: 'src.component.Schedule.modals.DataArchive.Content.D09B03C7',
                defaultMessage: '查看',
              })}
            </a>
          </Popover>
        ) : (
          '-'
        );
      },
    },
  ];

  return (
    <DisplayTable
      enableResize
      rowKey="id"
      columns={columns}
      dataSource={tables}
      scroll={null}
      disablePagination
    />
  );
};

export default ArchiveRange;
