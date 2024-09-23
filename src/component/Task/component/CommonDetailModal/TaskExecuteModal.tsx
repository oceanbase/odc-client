import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { getPhysicalExecuteDetails } from '@/common/network/logicalDatabase';
import DisplayTable from '@/component/DisplayTable';
import { ISqlExecuteResult, ISqlExecuteResultStatus } from '@/d.ts';
import { ISchemaChangeRecord } from '@/d.ts/logicalDatabase';
import { SqlExecuteResultStatusLabel } from '@/page/Workspace/components/SQLResultSet/const';
import DBTimeline from '@/page/Workspace/components/SQLResultSet/DBTimeline';
import {
  getResultText,
  getSqlExecuteResultStatusIcon,
} from '@/page/Workspace/components/SQLResultSet/ExecuteHistory';
import { formatTimeTemplate } from '@/util/utils';
import Icon, { InfoCircleOutlined } from '@ant-design/icons';
import { Descriptions, Modal, Space, Tooltip } from 'antd';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import styles from './index.less';

const getColumns = () => {
  return [
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      render: (value: ISqlExecuteResultStatus, record, index) => {
        return getSqlExecuteResultStatusIcon(value);
      },
      onFilter: (value, record) => {
        return value == record?.status;
      },
      filters: Object.entries(ISqlExecuteResultStatus).map(([key, value]) => {
        return {
          text: SqlExecuteResultStatusLabel[key],
          value: key,
        };
      }),
    },
    {
      title: 'SQL 语句',
      key: 'executeSql',
      dataIndex: 'executeSql',
      ellipsis: true,
      render: (value: string) => (
        <Tooltip
          placement="topLeft"
          title={
            <div
              style={{
                maxHeight: 300,
                overflowY: 'auto',
              }}
            >
              {value || '-'}
            </div>
          }
        >
          {value || '-'}
        </Tooltip>
      ),
    },
    {
      title: '结果',
      key: 'track',
      dataIndex: 'track',
      ellipsis: true,
      render: (value: string, row: any) =>
        row.status === ISqlExecuteResultStatus.SUCCESS ? (
          getResultText(row)
        ) : (
          <Tooltip
            placement="topLeft"
            title={
              <div
                style={{
                  maxHeight: 300,
                  overflowY: 'auto',
                }}
              >
                {value || '-'}
              </div>
            }
          >
            {value || '-'}
          </Tooltip>
        ),
    },
    {
      title: 'TRACE ID',
      key: 'traceId',
      dataIndex: 'traceId',
      ellipsis: true,
      render: (value: string, row: any) => {
        return (
          <Tooltip placement="topLeft" title={value || '-'}>
            {value || '-'}
          </Tooltip>
        );
      },
      width: 200,
    },
    {
      title: 'DB 耗时',
      key: 'timeout',
      dataIndex: 'timeout',
      render: (value: string, row: ISqlExecuteResult) => {
        const { timer } = row;
        const executeStage = timer?.stages?.find((stage) => stage.stageName === 'Execute');
        const executeSQLStage = executeStage?.subStages?.find(
          (stage) => stage.stageName === 'DB Server Execute SQL',
        );
        const DBCostTime = formatTimeTemplate(
          BigNumber(executeStage?.totalDurationMicroseconds).div(1000000).toNumber(),
        );
        const showDBTimeline = ![
          ISqlExecuteResultStatus.CANCELED,
          ISqlExecuteResultStatus.CREATED,
        ].includes(row?.status);

        return (
          <Space size={5}>
            <span>{DBCostTime}</span>
            {showDBTimeline ? (
              <Tooltip
                overlayStyle={{ maxWidth: 370 }}
                color="var(--background-primary-color)"
                overlayInnerStyle={{
                  maxHeight: 500,
                  overflow: 'auto',
                }}
                placement="rightTop"
                showArrow={false}
                title={<DBTimeline row={row} />}
              >
                <InfoCircleOutlined style={{ color: 'var(--text-color-hint)' }} />
              </Tooltip>
            ) : null}
          </Space>
        );
      },
    },
  ];
};

const TaskProgressModal = ({ physicalDatabaseId, scheduleTaskId, modalOpen, setModalOpen }) => {
  const columns = getColumns();
  const [details, setDetails] = useState<ISchemaChangeRecord>();

  const getLogicalDbChangeTaskJobDetails = async () => {
    const res = await getPhysicalExecuteDetails(scheduleTaskId, physicalDatabaseId);
    setDetails(res);
  };

  useEffect(() => {
    if (modalOpen && physicalDatabaseId) {
      getLogicalDbChangeTaskJobDetails();
    }
  }, [modalOpen]);

  const mergedData = useMemo(() => {
    if (details?.sqlExecuteResults) {
      return details?.sqlExecuteResults?.reduce((acc, item) => {
        acc.push(item);
        return acc;
      }, []);
    }
    return [];
  }, [details]);

  return (
    <Modal
      title="执行详情"
      width={840}
      open={modalOpen}
      closable
      centered
      onCancel={() => setModalOpen(false)}
      destroyOnClose
      footer={null}
    >
      <Descriptions column={1}>
        <Descriptions.Item label="执行数据库">
          {' '}
          <Space size={0}>
            <Space size={4}>
              <Icon
                component={
                  getDataSourceStyleByConnectType(details?.database?.dataSource?.type)?.icon
                    ?.component
                }
                style={{
                  color: getDataSourceStyleByConnectType(details?.database?.dataSource?.type)?.icon
                    ?.color,
                  fontSize: 16,
                  marginRight: 4,
                }}
              />

              <div>{details?.database?.name}</div>
              <div style={{ color: 'var(--neutral-black45-color)' }}>
                {details?.database?.dataSource?.name}
              </div>
            </Space>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="所属数据源">{details?.dataSource?.name}</Descriptions.Item>
      </Descriptions>
      <DisplayTable
        className={styles.subTaskTable}
        rowKey="id"
        columns={columns}
        dataSource={mergedData}
        disablePagination
        scroll={{
          x: 0,
        }}
      />
    </Modal>
  );
};
export default TaskProgressModal;
