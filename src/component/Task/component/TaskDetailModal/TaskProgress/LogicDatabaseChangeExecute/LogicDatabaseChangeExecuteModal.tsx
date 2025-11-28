import { formatMessage } from '@/util/intl';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { getPhysicalExecuteDetails } from '@/common/network/logicalDatabase';
import {
  ILogicDatabaseChangeExecuteRecord,
  ISqlExecuteResult,
  ISqlExecuteResultStatus,
  TaskDetail,
  TaskRecordParameters,
} from '@/d.ts';
import DBTimeline from '@/page/Workspace/components/SQLResultSet/DBTimeline';
import {
  getResultText,
  getSqlExecuteResultStatusIcon,
} from '@/page/Workspace/components/SQLResultSet/ExecuteHistory';
import { formatTimeTemplate } from '@/util/data/dateTime';
import Icon, { InfoCircleOutlined } from '@ant-design/icons';
import { Descriptions, Drawer, Modal, Space, Tooltip } from 'antd';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ISchemaChangeRecord } from '@/d.ts/logicalDatabase';
import { useRequest } from 'ahooks';
import TaskProgressHeader from '@/component/Task/component/TaskDetailModal/TaskProgress/TaskProgressHeader';
import CommonTable from '@/component/CommonTable';
import { CommonTableMode, ITableLoadOptions } from '@/component/CommonTable/interface';
import { SchemaChangeRecordStatusTextMap } from '@/constant/task';

interface IProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  data: ILogicDatabaseChangeExecuteRecord;
  task: TaskDetail<TaskRecordParameters>;
}
const TaskProgressModal: React.FC<IProps> = ({ modalOpen, setModalOpen, data, task }) => {
  const [result, setResult] = useState<ISchemaChangeRecord>();
  const [listParams, setListParams] = useState<ITableLoadOptions>(null);
  const tableRef = useRef();

  const { run: loadData, loading } = useRequest(getPhysicalExecuteDetails, {
    manual: true,
  });

  const initData = async (params?: { status?: ISqlExecuteResultStatus[] }) => {
    const res = await loadData(task?.id, data?.physicalDatabaseId, params?.status || []);
    setResult(res);
  };

  const initColumns = (listParams: ITableLoadOptions) => {
    const { filters } = listParams ?? {};
    return [
      {
        title: formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.E54A5EC1',
          defaultMessage: '状态',
        }),
        key: 'status',
        dataIndex: 'status',
        width: 100,
        filters: Object.keys(ISqlExecuteResultStatus).map((key) => {
          return {
            text: SchemaChangeRecordStatusTextMap[key],
            value: key,
          };
        }),
        filteredValue: filters?.status || null,
        render: (value: ISqlExecuteResultStatus) => {
          return (
            <>
              {getSqlExecuteResultStatusIcon(value)}
              <span style={{ marginLeft: 4 }}>{SchemaChangeRecordStatusTextMap[value]}</span>
            </>
          );
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
        width: 150,
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
        width: 100,
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
        width: 130,
        ellipsis: true,
        render: (value: string, row: any) => {
          return (
            <Tooltip placement="topLeft" title={value || '-'}>
              {value || '-'}
            </Tooltip>
          );
        },
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.7021CF96',
          defaultMessage: 'DB 耗时',
        }),
        key: 'timeout',
        dataIndex: 'timeout',
        width: 110,
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

  const handleChange = (args?: ITableLoadOptions) => {
    setListParams(args);
    initData({ status: args?.filters?.status });
  };

  useEffect(() => {
    if (modalOpen) {
      initData();
    }
  }, [modalOpen]);

  const header = useMemo(() => {
    let executeCount = 0;
    let successCount = 0;
    let failedCount = 0;
    result?.sqlExecuteResults?.forEach((i) => {
      switch (i?.status) {
        case ISqlExecuteResultStatus.RUNNING:
          executeCount++;
          break;
        case ISqlExecuteResultStatus.SUCCESS:
          successCount++;
          break;
        case ISqlExecuteResultStatus.FAILED:
          failedCount++;
          break;
      }
    });
    return (
      <div style={{ marginBottom: 6 }}>
        {formatMessage(
          {
            id: 'src.component.Task.component.TaskDetailModal.TaskProgress.LogicDatabaseChangeExecute.2A29F7DA',
            defaultMessage:
              '以下 {executeCount} 行变更记录执行中， {successCount} 行变更记录执行成功， {failedCount} 行变更记录执行失败',
          },
          { executeCount, successCount, failedCount },
        )}
      </div>
    );
  }, [result?.sqlExecuteResults]);

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
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.component.TaskDetailModal.TaskProgress.LogicDatabaseChangeExecute.97548E04',
            defaultMessage: '数据库',
          })}
        >
          <div style={{ alignItems: 'center', display: 'flex', gap: '4px' }}>
            <Icon
              component={
                getDataSourceStyleByConnectType(result?.database?.dataSource?.type)?.icon?.component
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
          </div>
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.component.TaskDetailModal.TaskProgress.LogicDatabaseChangeExecute.9F19D48A',
            defaultMessage: '数据源',
          })}
        >
          {result?.database?.dataSource?.name}
        </Descriptions.Item>
      </Descriptions>
      {header}
      <CommonTable
        stripe={false}
        mode={CommonTableMode.SMALL}
        ref={tableRef}
        titleContent={null}
        showToolbar={false}
        enabledReload={false}
        onLoad={async () => {}}
        onChange={handleChange}
        tableProps={{
          dataSource: result?.sqlExecuteResults,
          columns: initColumns(listParams),
          scroll: {
            x: 650,
          },
          rowKey: 'id',
          bordered: true,
        }}
      />
    </Drawer>
  );
};
export default TaskProgressModal;
