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

import { SQLContent } from '@/component/SQLContent';
import { getTaskExecStrategyMap } from '@/component/Task';
import {
  SubTaskStatus,
  type ConnectType,
  type IStructureComparisonTaskParams,
  type ITaskResult,
  type TaskDetail,
  IResponseDataPage,
} from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { downloadFile, getFormatDateTime } from '@/util/utils';
import { ConfigProvider, Descriptions, Divider, Empty, Modal, Tabs } from 'antd';
import { SimpleTextItem } from '../../component/SimpleTextItem';
import SearchFilter from '@/component/SearchFilter';
import { SearchOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { TaskTypeMap } from '../../component/TaskTable';
import { EOperationTypeMap, comparisonScopeMap } from '../CreateModal/interface';
import styles from './index.less';
import {
  getStructrueComparison,
  getStructrueComparisonDetail,
  getStructureComparisonTaskFile,
  getTaskResult,
} from '@/common/network/task';
import { getDataSourceModeConfig } from '@/common/datasource';
import DiffEditor from '@/component/MonacoEditor/DiffEditor';
import { ModalStore } from '@/store/modal';
import { inject, observer } from 'mobx-react';
import {
  IComparisonResult,
  EOperationType,
  IStructrueComparisonDetail,
  IComparisonResultData,
} from '@/d.ts/task';
import CommonTable from '@/component/CommonTable';
import {
  CommonTableMode,
  ITableInstance,
  ITableLoadOptions,
} from '@/component/CommonTable/interface';
import MonacoEditor from '@/component/MonacoEditor';
interface IStructureComparisonTaskContentProps {
  modalStore?: ModalStore;
  task: TaskDetail<IStructureComparisonTaskParams>;
  result: ITaskResult;
  hasFlow: boolean;
}

const TableEmpty = () => (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description={
      <>
        {
          formatMessage({
            id: 'src.component.Task.StructureComparisonTask.DetailContent.1A3F5341' /*正在比对中，暂无数据*/,
          }) /* 正在比对中，暂无数据 */
        }
      </>
    }
  />
);

const CompareTable: React.FC<{
  taskId: number;
  currentTaskResult: ITaskResult;
  comparisonResults: {
    contents: IComparisonResult[];
    page: IResponseDataPage;
  };
  handleDetailModalOpen: (taskId: number, structureComparisonId: number) => void;
  loadStructureComparisonResults: (args: ITableLoadOptions) => Promise<void>;
}> = ({
  taskId,
  currentTaskResult,
  comparisonResults,
  handleDetailModalOpen,
  loadStructureComparisonResults,
}) => {
  const tableRef = useRef<ITableInstance>(null);
  const columns = [
    {
      title: formatMessage({
        id: 'src.component.Task.StructureComparisonTask.DetailContent.322E747A',
      }), //'对比表'
      key: 'dbObjectName',
      dataIndex: 'dbObjectName',
      filters: [],
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            placeholder={formatMessage({
              id: 'odc.Env.components.InnerEnvironment.RuleName',
            })} //规则名称
          />
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? 'var(--icon-color-focus)' : undefined,
          }}
        />
      ),
    },
    {
      title: formatMessage({
        id: 'src.component.Task.StructureComparisonTask.DetailContent.04A0E2C5',
      }), //'对比结果'
      key: 'operationType',
      dataIndex: 'operationType',
      filters: [
        {
          text: EOperationTypeMap?.[EOperationType.CREATE],
          value: EOperationType.CREATE,
        },
        {
          text: EOperationTypeMap?.[EOperationType.UPDATE],
          value: EOperationType.UPDATE,
        },
        {
          text: EOperationTypeMap?.[EOperationType.DROP],
          value: EOperationType.DROP,
        },
        {
          text: EOperationTypeMap?.[EOperationType.NO_ACTION],
          value: EOperationType.NO_ACTION,
        },
        {
          text: EOperationTypeMap?.[EOperationType.UNSUPPORTED],
          value: EOperationType.UNSUPPORTED,
        },
        {
          text: EOperationTypeMap?.[EOperationType.SKIP],
          value: EOperationType.SKIP,
        },
      ],

      onFilter: (value: string, record: IComparisonResult) => {
        return record?.operationType === value;
      },
      render: (operationType: EOperationType) => EOperationTypeMap?.[operationType] || '-',
    },
    {
      title: formatMessage({
        id: 'src.component.Task.StructureComparisonTask.DetailContent.E8DAF6BA',
      }), //'操作'
      key: 'action',
      render: (_, record: IComparisonResult) => (
        <a
          onClick={() => {
            handleDetailModalOpen(taskId, record?.structureComparisonId);
          }}
        >
          {
            formatMessage({
              id: 'src.component.Task.StructureComparisonTask.DetailContent.DF21DA79' /*查看*/,
            }) /* 查看 */
          }
        </a>
      ),
    },
  ];

  useEffect(() => {
    if (
      currentTaskResult &&
      [SubTaskStatus.DONE, SubTaskStatus.FAILED].includes((currentTaskResult as any)?.status)
    ) {
      tableRef.current?.reload();
    }
  }, [currentTaskResult]);
  return (
    <div style={{ height: '316px', paddingTop: '8px' }}>
      <ConfigProvider renderEmpty={TableEmpty}>
        <CommonTable
          key="CompareTable"
          ref={tableRef}
          mode={CommonTableMode.SMALL}
          titleContent={null}
          showToolbar={false}
          operationContent={null}
          onLoad={loadStructureComparisonResults}
          onChange={loadStructureComparisonResults}
          tableProps={{
            rowKey: 'structureComparisonId',
            columns,
            dataSource: comparisonResults?.contents || [],
            pagination: {
              pageSize: 10,
              current: comparisonResults?.page?.number,
              total: comparisonResults?.page?.totalElements,
            },
          }}
        />
      </ConfigProvider>
    </div>
  );
};
const SQLPreview: React.FC<{
  task: TaskDetail<IStructureComparisonTaskParams>;
  comparisonResult: IComparisonResultData;
  datasourceType: ConnectType;
}> = ({ task, comparisonResult, datasourceType }) => {
  const sqlDownload = async () => {
    if (comparisonResult?.storageObjectId) {
      const fileUrl = await getStructureComparisonTaskFile(task?.id, [
        `${comparisonResult?.storageObjectId}`,
      ]);
      fileUrl?.forEach((url) => {
        url && downloadFile(url);
      });
    }
  };
  return (
    <div>
      <div className={styles.tip}>
        {formatMessage({
          id: 'src.component.Task.StructureComparisonTask.DetailContent.9DFA1E59' /*删除表、索引、字段等风险变更 SQL 已修改为注释，如需执行，需手动修改 SQL*/,
        })}
      </div>
      <div
        style={{
          marginTop: '8px',
        }}
      >
        {comparisonResult?.id && comparisonResult?.totalChangeScript ? (
          <div className={styles?.sqlContent}>
            <MonacoEditor
              readOnly
              defaultValue={comparisonResult?.totalChangeScript}
              language={getDataSourceModeConfig(datasourceType)?.sql?.language}
            />
          </div>
        ) : (
          <div
            style={{
              height: '316px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'var(--empty-background-color)',
            }}
          >
            <Empty
              description={
                <span style={{ color: 'var(--text-color-placeholder', cursor: 'default' }}>
                  {comparisonResult?.id && comparisonResult?.overSizeLimit ? (
                    <div>
                      {formatMessage({
                        id: 'src.component.Task.StructureComparisonTask.DetailContent.099109D1' /*当前 SQL 文件超过 1 兆，暂不支持预览，请*/,
                      })}
                      <a onClick={sqlDownload}>
                        {
                          formatMessage({
                            id: 'src.component.Task.StructureComparisonTask.DetailContent.49F7605B' /*下载 SQL*/,
                          }) /* 下载 SQL */
                        }
                      </a>{' '}
                      {formatMessage({
                        id: 'src.component.Task.StructureComparisonTask.DetailContent.734F1D69' /*进行查看*/,
                      })}
                    </div>
                  ) : (
                    formatMessage({
                      id: 'src.component.Task.StructureComparisonTask.DetailContent.8453A485',
                    })
                  )}
                </span>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
const StructureComparisonTaskContent: React.FC<IStructureComparisonTaskContentProps> = inject(
  'modalStore',
)(
  observer((props) => {
    const { task, result, modalStore } = props;
    const timerRef = useRef(null);
    const taskEndRef = useRef(null);
    const [currentResult, setCurrentResult] = useState<ITaskResult>(result);
    const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
    const [comparisonResult, setComparisonResult] = useState<IComparisonResultData>(null);
    const [structrueComparison, setStructrueComparison] =
      useState<IStructrueComparisonDetail>(null);
    const loadStructureComparisonResults = async (args?: ITableLoadOptions) => {
      if (!(currentResult as any)?.taskId) {
        return;
      }
      const { filters, sorter, pagination, pageSize } = args ?? {};
      const { current = 1 } = pagination ?? {};
      const { dbObjectName, operationType } = filters ?? {};
      const params = {
        dbObjectName,
        operationType,
        page: current,
        size: 10,
      };
      const data = await getStructrueComparison((currentResult as any)?.taskId, {
        ...params,
      } as any);
      if (data?.id) {
        modalStore?.updateStructureComparisonDataMap(task?.id, {
          database: task?.relatedDatabase,
          overSizeLimit: data?.overSizeLimit,
          storageObjectId: data?.storageObjectId,
          totalChangeScript: data?.totalChangeScript,
          status: (currentResult as any)?.status,
        });
        setComparisonResult(data);
      }
    };
    const loop = (timeout: number = 0) => {
      timerRef.current = setTimeout(async () => {
        if (taskEndRef.current) {
          return;
        }
        const currentResult = await getTaskResult(task?.id);
        if (
          currentResult &&
          [SubTaskStatus.DONE, SubTaskStatus.FAILED].includes((currentResult as any)?.status)
        ) {
          setCurrentResult(currentResult);
          taskEndRef.current = true;
          clearTimeout(timerRef.current);
          timerRef.current = null;
        } else {
          taskEndRef.current = false;
          modalStore?.updateStructureComparisonDataMap(task?.id, {
            database: null,
            storageObjectId: null,
            totalChangeScript: null,
            overSizeLimit: null,
            status: (currentResult as any)?.status,
          });
          loop(2000);
        }
      }, timeout);
    };
    const handleDetailModalOpen = async (taskId: number, structureComparisonId: number) => {
      const structrueComparisonDetail = await getStructrueComparisonDetail(
        taskId,
        structureComparisonId,
      );
      setStructrueComparison(structrueComparisonDetail);
      setDetailModalOpen(true);
    };
    useEffect(() => {
      if (!detailModalOpen) {
        setStructrueComparison(null);
        modalStore?.updateStructureComparisonDataMap(null);
      }
    }, [detailModalOpen]);
    useEffect(() => {
      loop();
      return () => {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      };
    }, []);
    const tabItems = [
      {
        label: formatMessage({
          id: 'src.component.Task.StructureComparisonTask.DetailContent.7DFCBE9E',
        }), //'对比的表'
        key: '1',
        children: (
          <CompareTable
            taskId={(currentResult as any)?.taskId}
            currentTaskResult={currentResult}
            comparisonResults={comparisonResult?.comparisonResults?.data}
            handleDetailModalOpen={handleDetailModalOpen}
            loadStructureComparisonResults={loadStructureComparisonResults}
          />
        ),
      },
      {
        label: formatMessage({
          id: 'src.component.Task.StructureComparisonTask.DetailContent.69BFA988',
        }), //'SQL 预览'
        key: '2',
        children: (
          <SQLPreview
            task={task}
            comparisonResult={comparisonResult}
            datasourceType={task?.database?.dataSource?.type}
          />
        ),
      },
    ];

    return (
      <>
        <Modal
          title={
            formatMessage({
              id: 'src.component.Task.StructureComparisonTask.DetailContent.2B43CB55',
            }) /*"结构比对详情"*/
          }
          open={detailModalOpen}
          destroyOnClose
          closable
          width={844}
          footer={null}
          onCancel={() => {
            setDetailModalOpen(false);
          }}
          className={styles.detailModal}
        >
          <div style={{ height: null }}>
            <Descriptions column={2}>
              <Descriptions.Item
                span={1}
                label={
                  formatMessage({
                    id: 'src.component.Task.StructureComparisonTask.DetailContent.3AB981EC',
                  }) /*"源表结构"*/
                }
                className={styles.descriptionItem}
              >
                {structrueComparison?.dbObjectName || '-'}
              </Descriptions.Item>
              <Descriptions.Item
                span={1}
                label={
                  formatMessage({
                    id: 'src.component.Task.StructureComparisonTask.DetailContent.CD265898',
                  }) /*"比对表结构"*/
                }
                className={styles.descriptionItem}
              >
                {structrueComparison?.dbObjectName || '-'}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ position: 'relative', height: '310px' }} className={styles.diffEditor}>
              <DiffEditor
                source={structrueComparison?.sourceObjectDdl}
                modifie={structrueComparison?.targetObjectDdl}
              />
            </div>
            <div style={{ marginTop: '16px' }}>
              <SimpleTextItem
                label={formatMessage({
                  id: 'src.component.Task.StructureComparisonTask.DetailContent.F1BC87F0',
                })}
                content={
                  <div>
                    <SQLContent
                      sqlContent={structrueComparison?.changeScript || ''}
                      sqlObjectIds={null}
                      sqlObjectNames={null}
                      taskId={null}
                      showLineNumbers={false}
                      language={
                        getDataSourceModeConfig(task?.database?.dataSource?.type)?.sql?.language
                      }
                    />
                  </div>
                }
                direction="column"
              />
            </div>
          </div>
        </Modal>
        <Descriptions column={6}>
          <Descriptions.Item
            span={2}
            label={
              formatMessage({
                id: 'src.component.Task.StructureComparisonTask.DetailContent.152888BE',
              }) /*"任务编号"*/
            }
          >
            {task?.id}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={
              formatMessage({
                id: 'src.component.Task.StructureComparisonTask.DetailContent.5E3A8702',
              }) /*"任务类型"*/
            }
          >
            {TaskTypeMap?.[task?.type]}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={
              formatMessage({
                id: 'src.component.Task.StructureComparisonTask.DetailContent.575F8B39',
              }) /*"比对范围"*/
            }
          >
            {comparisonScopeMap?.[task?.parameters?.comparisonScope]}
          </Descriptions.Item>

          <Descriptions.Item
            span={2}
            label={
              formatMessage({
                id: 'src.component.Task.StructureComparisonTask.DetailContent.0570289A',
              }) /*"项目"*/
            }
          >
            {task?.database?.project?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={
              formatMessage({
                id: 'src.component.Task.StructureComparisonTask.DetailContent.BB26A84B',
              }) /*"源端数据源"*/
            }
          >
            {task?.database?.dataSource?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={
              formatMessage({
                id: 'src.component.Task.StructureComparisonTask.DetailContent.D26187E4',
              }) /*"源端数据库"*/
            }
          >
            {task?.database?.name || '-'}
          </Descriptions.Item>

          <Descriptions.Item
            span={2}
            label={
              formatMessage({
                id: 'src.component.Task.StructureComparisonTask.DetailContent.5B5EF5E5',
              }) /*"执行方式"*/
            }
          >
            {getTaskExecStrategyMap(task?.type)?.[task?.executionStrategy] || '-'}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={
              formatMessage({
                id: 'src.component.Task.StructureComparisonTask.DetailContent.CE00A7E1',
              }) /*"目标端数据源"*/
            }
          >
            {task?.relatedDatabase?.dataSource?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={
              formatMessage({
                id: 'src.component.Task.StructureComparisonTask.DetailContent.3C7B0B00',
              }) /*"目标端数据库"*/
            }
          >
            {task?.relatedDatabase?.name || '-'}
          </Descriptions.Item>

          <Descriptions.Item
            span={6}
            label={
              formatMessage({
                id: 'src.component.Task.StructureComparisonTask.DetailContent.A0036BAC',
              }) /*"描述"*/
            }
          >
            {task?.description || '-'}
          </Descriptions.Item>
        </Descriptions>

        <Divider
          style={{
            marginTop: 12,
          }}
        />

        <Tabs type="card" size="small" items={tabItems} className={styles.tabs} />
        <Divider
          style={{
            marginTop: 12,
          }}
        />

        <Descriptions column={4}>
          <Descriptions.Item
            span={2}
            label={
              formatMessage({
                id: 'odc.src.component.Task.AsyncTask.DetailContent.Founder',
              }) /* 创建人 */
            }
          >
            {task?.creator?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={
              formatMessage({
                id: 'odc.src.component.Task.AsyncTask.DetailContent.CreationTime',
              }) /* 创建时间 */
            }
          >
            {getFormatDateTime(task?.createTime)}
          </Descriptions.Item>
        </Descriptions>
      </>
    );
  }),
);
export default StructureComparisonTaskContent;
