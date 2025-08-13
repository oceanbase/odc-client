import { formatMessage } from '@/util/intl';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { getPhysicalExecuteDetails } from '@/common/network/logicalDatabase';
import DisplayTable from '@/component/DisplayTable';
import { ISqlExecuteResult, ISqlExecuteResultStatus } from '@/d.ts';
import DBTimeline from '@/page/Workspace/components/SQLResultSet/DBTimeline';
import {
  getResultText,
  getSqlExecuteResultStatusIcon,
} from '@/page/Workspace/components/SQLResultSet/ExecuteHistory';
import { formatTimeTemplate } from '@/util/utils';
import Icon, { InfoCircleOutlined } from '@ant-design/icons';
import { Descriptions, Drawer, Modal, Space, Tooltip } from 'antd';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import styles from './index.less';
import { sqlExecutionResultMap } from '@/d.ts';
import { ISchemaChangeRecord } from '@/d.ts/logicalDatabase';
import { useRequest } from 'ahooks';
import TaskProgressHeader from '@/component/Task/component/TaskDetailModal/TaskProgress/TaskProgressHeader';

const getColumns = () => {
  return [
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.E54A5EC1',
        defaultMessage: '状态',
      }),
      key: 'status',
      dataIndex: 'status',
      render: (value: ISqlExecuteResultStatus, record, index) => {
        return getSqlExecuteResultStatusIcon(value);
      },
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.5E35D23F',
        defaultMessage: 'SQL 语句',
      }),
      key: 'executeSql',
      dataIndex: 'executeSql',
      ellipsis: {
        showTitle: false,
      },
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
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.E05F7579',
        defaultMessage: '结果',
      }),
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
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.7021CF96',
        defaultMessage: 'DB 耗时',
      }),
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

interface IProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  data: sqlExecutionResultMap;
}
const TaskProgressModal: React.FC<IProps> = ({ modalOpen, setModalOpen, data }) => {
  const [result, setResult] = useState<ISchemaChangeRecord>();
  const columns = getColumns();

  const { run: loadData, loading } = useRequest(getPhysicalExecuteDetails, {
    manual: true,
  });

  const initData = async () => {
    const res = await loadData(data?.id, data?.physicalDatabase?.id);
    console.log(res);
    setResult(res);
  };

  useEffect(() => {
    if (modalOpen) {
      initData();
    }
  }, [modalOpen]);

  return (
    <Drawer
      title={formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.8FBFD910',
        defaultMessage: '执行详情',
      })}
      width={840}
      open={modalOpen}
      closable
      loading={loading}
      onClose={() => setModalOpen(false)}
      footer={null}
    >
      <Descriptions column={1} style={{ marginBottom: '12px' }}>
        <Descriptions.Item label={'数据库'}>
          <Space size={0}>
            <Space size={4}>
              <Icon
                component={
                  getDataSourceStyleByConnectType(result?.database?.dataSource?.type)?.icon
                    ?.component
                }
                style={{
                  color: getDataSourceStyleByConnectType(result?.database?.dataSource?.type)?.icon
                    ?.color,
                  fontSize: 16,
                  marginRight: 4,
                }}
              />

              <div>{result?.database?.name}</div>
              <div style={{ color: 'var(--neutral-black45-color)' }}>
                {result?.database?.dataSource?.name}
              </div>
            </Space>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label={'DML 预计影响行数'}>
          {result?.completedSqlCount}
        </Descriptions.Item>
        <Descriptions.Item label={'数据源'}>{result?.database?.dataSource?.name}</Descriptions.Item>
      </Descriptions>
      {result?.sqlExecuteResults && (
        <TaskProgressHeader
          isLogicalDb
          subTasks={result?.sqlExecuteResults}
          pendingExectionDatabases={0}
        />
      )}

      <DisplayTable
        className={styles.subTaskTable}
        rowKey="id"
        columns={columns}
        dataSource={result?.sqlExecuteResults}
        disablePagination
        scroll={{
          x: 0,
        }}
      />
    </Drawer>
  );
};
export default TaskProgressModal;
