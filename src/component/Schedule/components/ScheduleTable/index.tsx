import { inject, observer } from 'mobx-react';
import TableCard from '@/component/Table/TableCard';
import { Button, Tooltip, Popover, Space, Typography, Dropdown } from 'antd';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { ScheduleStore } from '@/store/schedule';
import type { ITableInstance } from '@/component/CommonTable/interface';
import type { PageStore } from '@/store/page';
import Header from '@/component/Schedule/layout/Header';
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import { IScheduleParam, ISubTaskParam, SchedulePageMode } from '@/component/Schedule/interface';
import { listProjects } from '@/common/network/project';
import { useRequest } from 'ahooks';
import { SchedulePageTextMap } from '@/constant/schedule';
import styles from './index.less';
import CommonTable from '@/component/CommonTable';
import { CommonTableMode } from '@/component/CommonTable/interface';
import { formatMessage } from '@/util/intl';
import ScheduleStatusLabel from '@/component/Schedule/components/ScheduleStatusLabel';
import { scheduleThatCanBeExport } from '@/constant/triangularization';
import { AsyncTaskOperationButton } from '@/component/Task/component/AsyncTaskOperationButton';
import login from '@/store/login';
import { useImport } from '@/component/Task/component/ImportModal/useImport';
import ImportModal from '@/component/Task/component/ImportModal';
import {
  getExportConfig,
  getTerminateConfig,
  isScheduleMigrateTask,
} from '@/component/Task/component/AsyncTaskOperationButton/helper';
import { useLoop } from '@/util/hooks/useLoop';
import ScheduleActions from '../Actions/ScheduleActions';
import ScheduleNameColumns from './ScheduleNameColumns';
import { Perspective } from '@/component/Schedule/interface';
import {
  ScheduleType,
  SchedulePageType,
  IScheduleRecord,
  ScheduleRecordParameters,
  ScheduleDetailType,
} from '@/d.ts/schedule';
import type { FixedType } from 'rc-table/es/interface';
import classNames from 'classnames';
import { getFormatDateTime } from '@/util/utils';
import ScheduleTaskStatusLabel from '../ScheduleTaskStatusLabel';
import { IResponseData } from '@/d.ts';
import ScheduleTaskActions from '@/component/Schedule/components/Actions/ScheduleTaskActions';
import { SubTypeTextMap } from '@/constant/scheduleTask';
import { IScheduleTaskExecutionDetail, scheduleTask, SubTaskParameters } from '@/d.ts/scheduleTask';
import odc from '@/plugins/odc';
import ProjectContext from '@/page/Project/ProjectContext';
import { isProjectArchived } from '@/page/Project/helper';
import { IPagination } from '@/component/Schedule/interface';
import ScheduleMiniFlowSpan from '../ScheduleMiniFlowSpan';
import DatabaseColumn from './DatabaseColumn';
import { useScheduleSelection } from '@/component/Schedule/hooks';
import { persistenceParams } from '@/component/Schedule/helper';

export const SCHEDULE_PARAMS_PERSISTENCE_KEY = 'schedule:paramsPersistence';
export const SCHEDULETASK_PARAMS_PERSISTENCE_KEY = 'scheduleTask:paramsPersistence';

interface IProps {
  tableRef: React.RefObject<ITableInstance>;
  scheduleStore?: ScheduleStore;
  pageStore?: PageStore;
  scheduleRes: IResponseData<IScheduleRecord<ScheduleRecordParameters>>;
  scheduleTaskRes: IResponseData<scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>>;
  scheduleTabType: SchedulePageType;
  getTaskList: (
    args: IScheduleParam | ISubTaskParam,
    perspective: Perspective,
    pagination: IPagination,
  ) => Promise<void>;
  onDetailVisible: (
    schedule: IScheduleRecord<ScheduleRecordParameters>,
    visible: boolean,
    detailType?: ScheduleDetailType,
  ) => void;
  onSubTaskDetailVisible: (
    subTask: scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>,
    visible: boolean,
  ) => void;
  onMenuClick?: (type: ScheduleType) => void;
  onReloadList: () => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onApprovalVisible?: (status: boolean, id: number) => void;
  mode?: SchedulePageMode;
  params: IScheduleParam;
  subTaskParams: ISubTaskParam;
  setParams: React.Dispatch<React.SetStateAction<IScheduleParam>>;
  setsubTaskParams: React.Dispatch<React.SetStateAction<ISubTaskParam>>;
  setPerspective: React.Dispatch<React.SetStateAction<Perspective>>;
  perspective: Perspective;
  pagination: IPagination;
  setPagination: React.Dispatch<React.SetStateAction<IPagination>>;
}

const ScheduleTable: React.FC<IProps> = (props) => {
  const {
    scheduleStore,
    pageStore,
    getTaskList,
    scheduleTabType,
    tableRef,
    scheduleRes,
    scheduleTaskRes,
    onMenuClick,
    onDetailVisible,
    onSubTaskDetailVisible,
    setLoading,
    loading,
    onApprovalVisible,
    mode,
    params,
    subTaskParams,
    setParams,
    setsubTaskParams,
    setPerspective,
    perspective,
    pagination,
    setPagination,
  } = props;
  const [hoverInNewScheduleMenuBtn, setHoverInNewScheduleMenuBtn] = useState(false);
  const [hoverInNewScheduleMenu, setHoverInNewScheduleMenu] = useState(false);
  const isAll = SchedulePageType.ALL === scheduleTabType;
  const [importProjectId, setImportProjectId] = useState<string>();
  const { isSubmitImport, debounceSubmit } = useImport(props.onReloadList, importProjectId);
  const [importModalVisible, setImportModalVisible] = useState<boolean>(false);
  const [delList, setDelList] = useState<number[]>([]);
  const { project } = useContext(ProjectContext) || {};
  const projectArchived = isProjectArchived(project);
  /** 是否是作业视角 */
  const isScheduleView = useMemo(() => {
    return perspective === Perspective.scheduleView;
  }, [perspective]);

  const { selectedRow, rowSelection, clearSelection } = useScheduleSelection({
    scheduleStore: scheduleStore,
    scheduleTabType: scheduleTabType,
    ScheduleRes: scheduleRes,
    tableRef,
  });

  const { data: resProjects } = useRequest(listProjects, {
    defaultParams: [null, 1, 400],
  });

  const { loop: loadData, destory } = useLoop((count) => {
    return async (
      args: IScheduleParam | ISubTaskParam,
      perspective: Perspective,
      propsPagination: IPagination,
    ) => {
      if (mode === SchedulePageMode.MULTI_PAGE && pageStore.activePageKey !== scheduleTabType) {
        destory();
        return;
      }
      if (propsPagination?.pageSize) {
        setPagination(propsPagination);
      }
      await getTaskList(args, perspective, propsPagination);
      setLoading(false);
    };
  }, 6000);

  useEffect(() => {
    return () => {
      destory?.();
    };
  }, []);

  const handleChangeParams = useCallback(
    (params: IScheduleParam | ISubTaskParam, perspective: Perspective, pagination: IPagination) => {
      setLoading(true);
      loadData(params, perspective, pagination);
    },
    [],
  );

  useEffect(() => {
    if (isScheduleView) {
      if (mode !== SchedulePageMode.PROJECT) {
        persistenceParams(isScheduleView, params);
      }
      handleChangeParams(params, perspective, { ...pagination, current: 1 });
    } else {
      if (mode !== SchedulePageMode.PROJECT) {
        persistenceParams(isScheduleView, subTaskParams);
      }
      handleChangeParams(subTaskParams, perspective, { ...pagination, current: 1 });
    }
  }, [params, scheduleTabType, subTaskParams]);

  const newSchedule = () => {
    return (
      <Space
        direction="vertical"
        style={{ padding: '3px', rowGap: '4px' }}
        onMouseMove={() => setHoverInNewScheduleMenuBtn(true)}
        onMouseLeave={() => setHoverInNewScheduleMenuBtn(false)}
      >
        {Object.keys(ScheduleType).map((item) => {
          return (
            <div
              className={styles.menuItem}
              key={item}
              onClick={() => {
                setHoverInNewScheduleMenuBtn(false);
                onMenuClick(item as ScheduleType);
              }}
            >
              {SchedulePageTextMap[item]}
            </div>
          );
        })}
      </Space>
    );
  };

  const columns = [
    {
      title: formatMessage({
        id: 'src.component.Schedule.components.ScheduleTable.ED66F868',
        defaultMessage: '作业',
      }),
      dataIndex: 'scheduleId',
      key: 'scheduleId',
      width: 500,
      render: (id, record: IScheduleRecord<ScheduleRecordParameters>) => {
        return (
          <ScheduleNameColumns
            record={record}
            delList={delList}
            onDetailVisible={onDetailVisible}
            mode={mode}
          />
        );
      },
    },
    {
      title: formatMessage({
        id: 'src.component.Schedule.components.ScheduleTable.6B913018',
        defaultMessage: '数据库',
      }),
      dataIndex: 'database',
      key: 'database',
      width: 180,
      render: (type, record: IScheduleRecord<ScheduleRecordParameters>) => {
        return <DatabaseColumn record={record} />;
      },
    },
    ...(scheduleTabType === SchedulePageType.ALL
      ? [
          {
            title: formatMessage({
              id: 'src.component.Schedule.components.ScheduleTable.8A9EE1D4',
              defaultMessage: '类型',
            }),
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (type) => {
              return <>{SchedulePageTextMap[type] || type || '-'}</>;
            },
          },
        ]
      : []),
    {
      title: formatMessage({
        id: 'odc.component.TaskTable.Status',
        defaultMessage: '状态',
      }),
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status, record: IScheduleRecord<ScheduleRecordParameters>) => {
        return (
          <ScheduleMiniFlowSpan
            record={record}
            isShowApprovableInfo={Boolean(record?.approvable && record?.approveInstanceId)}
            isShowFLowPopover={Boolean(record?.approvable && record?.approveInstanceId)}
            onDetail={() => {
              onDetailVisible(record, true, ScheduleDetailType.OPERATION_RECORD);
              scheduleStore.setOpenOperationId(record?.latestChangedLogId);
            }}
          >
            <ScheduleStatusLabel status={status} />
          </ScheduleMiniFlowSpan>
        );
      },
    },
    {
      title: formatMessage({
        id: 'src.component.Schedule.components.ScheduleTable.9BA98317',
        defaultMessage: '操作',
      }),
      dataIndex: 'actions',
      key: 'actions',
      fixed: 'right' as FixedType,
      width: 140,
      render: (_, record: IScheduleRecord<ScheduleRecordParameters>) => {
        return (
          <ScheduleActions
            schedule={record}
            onReloadList={props.onReloadList}
            onDetailVisible={onDetailVisible}
            mode={mode}
            delList={delList}
            setDelList={setDelList}
            onApprovalVisible={onApprovalVisible}
          />
        );
      },
    },
  ];

  const subTaskColumns = [
    {
      dataIndex: 'id',
      key: 'id',
      title: formatMessage({
        id: 'src.component.Schedule.components.ScheduleTable.396B62AE',
        defaultMessage: '执行记录ID',
      }),
      ellipsis: true,
      width: 80,
      render: (id, record) => {
        return (
          <div
            className={styles.hoverLink}
            style={{ padding: '10px 0px 10px 0px' }}
            onClick={() => {
              onSubTaskDetailVisible?.(record, true);
            }}
          >
            #{id}
          </div>
        );
      },
    },
    {
      dataIndex: 'scheduleName',
      key: 'scheduleName',
      title: formatMessage({
        id: 'src.component.Schedule.components.ScheduleTable.59E20EEA',
        defaultMessage: '所属作业',
      }),
      ellipsis: true,
      width: 260,
      render: (scheduleName, record) => {
        return (
          <div>
            <Tooltip
              overlayClassName={styles.scheduleNameTooltip}
              title={
                <>
                  <div>
                    {formatMessage({
                      id: 'src.component.Schedule.components.ScheduleTable.2EC4A25A',
                      defaultMessage: '所属作业：',
                    })}
                    {scheduleName}
                  </div>
                  <div>
                    {formatMessage({
                      id: 'src.component.Schedule.components.ScheduleTable.B7E41B5A',
                      defaultMessage: '作业ID：',
                    })}
                    {record?.scheduleId}
                  </div>
                </>
              }
            >
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  maxWidth: '100%',
                  width: 'max-content',
                  cursor: 'pointer',
                }}
                className={classNames(styles.tip)}
              >
                <div className={styles.ellipsis}>{scheduleName}</div>
                <div>#{record?.scheduleId}</div>
              </div>
            </Tooltip>
          </div>
        );
      },
    },
    {
      dataIndex: 'database',
      key: 'database',
      title: formatMessage({
        id: 'src.component.Schedule.components.ScheduleTable.05AA08FD',
        defaultMessage: '数据库',
      }),
      ellipsis: true,
      width: 180,
      render: (database, record) => {
        return <DatabaseColumn record={record} isSubTaskList />;
      },
    },
    ...(mode === SchedulePageMode.PROJECT || login.isPrivateSpace()
      ? []
      : [
          {
            dataIndex: 'project',
            key: 'project',
            title: formatMessage({
              id: 'src.component.Schedule.components.ScheduleTable.61F03513',
              defaultMessage: '项目',
            }),
            ellipsis: true,
            width: 120,
            render: (project) => project?.name,
          },
        ]),

    ...(scheduleTabType === SchedulePageType.ALL
      ? [
          {
            dataIndex: 'type',
            key: 'type',
            title: formatMessage({
              id: 'src.component.Schedule.components.ScheduleTable.9890F824',
              defaultMessage: '类型',
            }),
            ellipsis: true,
            width: 120,
            render: (type) => SubTypeTextMap[type],
          },
        ]
      : []),
    {
      dataIndex: 'createTime',
      key: 'createTime',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskRecord.CreationTime',
        defaultMessage: '创建时间',
      }), //创建时间
      ellipsis: true,
      width: 150,
      render: (createTime) => getFormatDateTime(createTime),
    },
    {
      dataIndex: 'status',
      key: 'status',
      title: formatMessage({
        id: 'src.component.Schedule.components.ScheduleTable.CD27AD0F',
        defaultMessage: '状态',
      }),
      ellipsis: true,
      width: 140,
      render: (status, record) => {
        return <ScheduleTaskStatusLabel status={status} />;
      },
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskRecord.Operation',
        defaultMessage: '操作',
      }), //操作
      fixed: 'right' as FixedType,
      ellipsis: true,
      width: 140,
      render: (_, record) => {
        return (
          <ScheduleTaskActions
            onReloadList={props.onReloadList}
            scheduleId={record?.scheduleId}
            subTask={record}
            handleView={() => onSubTaskDetailVisible?.(record, true)}
          />
        );
      },
    },
  ];

  const newALLScheduleOperation = useMemo(() => {
    if (!isAll || projectArchived) return;

    return (
      <Popover
        content={newSchedule}
        overlayClassName={styles.newSchedulePopover}
        placement="bottomLeft"
        open={(hoverInNewScheduleMenuBtn || hoverInNewScheduleMenu) && isAll}
      >
        <Button
          type="primary"
          onMouseMove={() => setHoverInNewScheduleMenu(true)}
          onMouseLeave={() => {
            setTimeout(() => {
              setHoverInNewScheduleMenu(false);
            }, 200);
          }}
          onClick={() => {
            if (isAll) return;
            onMenuClick(scheduleTabType);
          }}
        >
          <>
            {formatMessage({
              id: 'src.component.Schedule.components.ScheduleTable.9209CAFC',
              defaultMessage: '新建',
            })}

            <DownOutlined style={{ color: '#fff' }} />
          </>
        </Button>
      </Popover>
    );
  }, [isAll, hoverInNewScheduleMenuBtn, hoverInNewScheduleMenu]);

  const newScheduleOperation = useMemo(() => {
    if (isAll || projectArchived) return;
    const isSupportTaksImport = odc?.appConfig?.task?.isSupportTaksImport;
    let scheduleTypeLabel = SchedulePageTextMap[scheduleTabType];
    const menuItems = [];
    if (
      scheduleThatCanBeExport.includes(scheduleTabType) &&
      !login.isPrivateSpace() &&
      isSupportTaksImport
    ) {
      menuItems.push({
        key: 'import',
        disabled: isSubmitImport,
        label: (
          <Tooltip
            title={
              isSubmitImport
                ? formatMessage({
                    id: 'src.component.Task.component.TaskTable.55FC08BB',
                    defaultMessage: '正在导入中',
                  })
                : ''
            }
          >
            {formatMessage(
              {
                id: 'src.component.Task.component.TaskTable.D4FAED98',
                defaultMessage: '导入{activeTaskLabel}',
              },
              { activeTaskLabel: scheduleTypeLabel },
            )}
          </Tooltip>
        ),
      });
    }

    return (
      <Dropdown
        menu={{
          items: menuItems,
          onClick: (val) => {
            switch (val?.key) {
              case 'import': {
                setImportModalVisible(true);
                break;
              }
              default: {
              }
            }
          },
        }}
      >
        <Button type="primary">
          <a onClick={() => onMenuClick(scheduleTabType as unknown as ScheduleType)}>
            <Space>
              {formatMessage(
                {
                  id: 'odc.src.component.Task.component.TaskTable.NewActiveTasklabel',
                  defaultMessage: '新建{activeTaskLabel}',
                },
                { activeTaskLabel: scheduleTypeLabel },
              )}
              {Boolean(menuItems.length) ? <DownOutlined /> : undefined}
            </Space>
          </a>
        </Button>
      </Dropdown>
    );
  }, [isAll, scheduleTabType, isSubmitImport]);

  const batchOperation = () => {
    if (projectArchived || isAll) return;
    const isSupportTaksExport = odc?.appConfig?.task?.isSupportTaksExport;
    const isSupportTaksTerminate = odc?.appConfig?.task?.isSupportTaksTerminate;
    let menuItems = [];
    if (isSupportTaksTerminate) {
      menuItems.push({
        key: 'batchTerminate',
        label: (
          <AsyncTaskOperationButton
            onReload={() => {
              clearSelection();
              props.onReloadList?.();
            }}
            {...getTerminateConfig(selectedRow, true)}
            buttonType="text"
            dataSource={selectedRow as any[]}
          />
        ),
      });
    }
    if (isSupportTaksExport && isScheduleMigrateTask(scheduleTabType as unknown as ScheduleType)) {
      menuItems.push({
        key: 'batchExport',
        label: (
          <AsyncTaskOperationButton
            onReload={() => {
              clearSelection();
              props.onReloadList?.();
            }}
            {...getExportConfig(selectedRow)}
            buttonType="text"
            dataSource={selectedRow as any[]}
          />
        ),
      });
    }
    if (!menuItems?.length) {
      return;
    }
    return (
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomLeft"
        overlayClassName={styles.batchOperationDropdown}
      >
        <Button>
          {formatMessage({
            id: 'src.page.Project.Database.components.AddDataBaseButton.85804FB2',
            defaultMessage: '批量操作',
          })}

          <DownOutlined style={{ color: 'var(--icon-color-normal)' }} />
        </Button>
      </Dropdown>
    );
  };

  const handleOnLoad = useCallback(async (e, isScheduleView, params, subTaskParams) => {
    setLoading(true);
    if (isScheduleView) {
      loadData(params, Perspective.scheduleView, {
        current: 1,
        pageSize: e.pageSize ? e.pageSize : pagination?.pageSize,
      });
    } else {
      loadData(subTaskParams, Perspective.executionView, {
        current: 1,
        pageSize: e.pageSize ? e.pageSize : pagination?.pageSize,
      });
    }
  }, []);

  return (
    <TableCard
      title={
        <Space size={12}>
          {newALLScheduleOperation}
          {newScheduleOperation}
          {batchOperation()}
        </Space>
      }
      extra={
        <ParamsContext.Provider
          value={{
            mode,
            params,
            setParams,
            projectList: resProjects?.contents,
            scheduleTabType,
            perspective,
            setPerspective,
            subTaskParams,
            isScheduleView,
            loading,
            setLoading,
            setsubTaskParams,
            reload: () => {
              setLoading(true);
              if (isScheduleView) {
                loadData(params, perspective, pagination);
              } else {
                loadData(subTaskParams, perspective, pagination);
              }
            },
          }}
        >
          <Space>
            <Header />
          </Space>
        </ParamsContext.Provider>
      }
    >
      <CommonTable
        computePageSizeByResize
        key={perspective}
        stripe={false}
        showToolbar={false}
        rowHeight={isScheduleView ? 60 : 40}
        ref={tableRef}
        mode={CommonTableMode.SMALL}
        titleContent={null}
        enableResize
        onLoad={async (e) => handleOnLoad(e, isScheduleView, params, subTaskParams)}
        onChange={(e) => {
          if (e.pagination) {
            if (isScheduleView) {
              loadData(params, Perspective.scheduleView, {
                current: e?.pagination?.current,
                pageSize: e?.pagination?.pageSize ? e.pagination.pageSize : pagination?.pageSize,
              });
            } else {
              loadData(subTaskParams, Perspective.executionView, {
                current: e?.pagination?.current,
                pageSize: e?.pagination?.pageSize ? e.pagination.pageSize : pagination?.pageSize,
              });
            }
          }
        }}
        enabledReload={false}
        tableProps={{
          className: styles.scheduleTable,
          rowClassName: styles.tableRow,
          columns: isScheduleView ? columns : subTaskColumns,
          loading,
          rowKey: isScheduleView ? 'scheduleId' : 'id',
          dataSource: isScheduleView ? scheduleRes?.contents : scheduleTaskRes?.contents,
          pagination: {
            current: isScheduleView ? scheduleRes?.page?.number : scheduleTaskRes?.page?.number,
            total: isScheduleView
              ? scheduleRes?.page?.totalElements
              : scheduleTaskRes?.page?.totalElements,
          },
        }}
        showSelectedInfoBar={false}
        rowSelecter={
          ![SchedulePageType.ALL]?.includes(scheduleTabType) && isScheduleView ? rowSelection : null
        }
      />

      <ImportModal
        taskType={scheduleTabType as any}
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        onOk={(scheduleTaskImportRequest, previewData, projectId) => {
          setImportModalVisible(false);
          setImportProjectId(projectId);
          debounceSubmit(scheduleTaskImportRequest, previewData);
        }}
      />
    </TableCard>
  );
};

export default inject('scheduleStore', 'pageStore')(observer(ScheduleTable));
