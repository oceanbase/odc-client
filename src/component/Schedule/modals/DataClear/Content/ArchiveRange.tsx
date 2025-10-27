import DisplayTable from '@/component/DisplayTable';
import { formatMessage } from '@/util/intl';
import { Flex, Popover, Tooltip, Typography } from 'antd';
import React from 'react';
import { conditionExpressionColumns } from '@/component/Task/helper';
import { dmlParametersTables } from '@/d.ts/schedule';

const ArchiveRange: React.FC<{
  tables: dmlParametersTables[];
  needCheckBeforeDelete?: boolean;
}> = (props) => {
  const { tables, needCheckBeforeDelete = false } = props;

  const getSettingTip = (value: dmlParametersTables) => {
    const { joinTableConfigs, partitions, tableName } = value || {};
    if (!partitions?.length && !joinTableConfigs?.length) return null;
    return (
      <div>
        {joinTableConfigs?.length ? (
          <div style={{ marginBottom: 8 }}>
            <div style={{ color: 'var(--text-color-hint)' }}>
              {formatMessage({
                id: 'src.component.Schedule.modals.DataClear.Content.52CF4AFE',
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
                id: 'src.component.Schedule.modals.DataClear.Content.31F873C3',
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

  const columns = (needCheckBeforeDelete: boolean) => [
    {
      dataIndex: 'tableName',
      title: formatMessage({
        id: 'src.component.Schedule.modals.DataClear.Content.C69D3E2E',
        defaultMessage: '清理表',
      }),
      ellipsis: true,
      width: 140,
    },
    {
      dataIndex: 'targetTableName',
      title: formatMessage({
        id: 'src.component.Schedule.modals.DataClear.Content.A36904BB',
        defaultMessage: '目标表',
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
      dataIndex: 'conditionExpression',
      title: formatMessage({
        id: 'odc.DataClearTask.DetailContent.ArchiveRange.FilterConditions',
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
      dataIndex: 'setting',
      title: formatMessage({
        id: 'src.component.Schedule.modals.DataClear.Content.8BE4D113',
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
                id: 'src.component.Schedule.modals.DataClear.Content.A25D820A',
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
      rowKey="id"
      columns={columns(needCheckBeforeDelete)}
      dataSource={tables}
      scroll={null}
      disablePagination
    />
  );
};

export default ArchiveRange;
