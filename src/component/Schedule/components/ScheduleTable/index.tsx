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
  ScheduleStatus,
} from '@/d.ts/schedule';
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
import { useScheduleSelection } from '@/component/Schedule/hooks/useScheduleSelection';

export const SCHEDULE_EXECUTE_TIME_KEY = 'schedule:executeTime';
export const SCHEDULE_EXECUTE_DATE_KEY = 'schedule:executeDate';
export const SUB_TASK_EXECUTE_TIME_KEY = 'subTask:executeTime';
export const SUB_TASK_EXECUTE_DATE_KEY = 'subTask:executeDate';

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
  defaultScheduleStatus?: ScheduleStatus;
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
    defaultScheduleStatus,
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
  const { activePageKey } = pageStore;
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

  useEffect(() => {
    if (defaultScheduleStatus) {
      setParams({
        ...params,
        status: [defaultScheduleStatus as ScheduleStatus],
      });
    }
  }, [defaultScheduleStatus]);

  useEffect(() => {
    if (isScheduleView && scheduleRes) {
      setPagination({
        current: scheduleRes?.page?.number,
        pageSize: scheduleRes?.page?.size ? scheduleRes.page.size : pagination?.pageSize,
      });
    }
    if (!isScheduleView && scheduleTaskRes) {
      setPagination({
        current: scheduleTaskRes?.page?.number,
        pageSize: scheduleTaskRes?.page?.size ? scheduleTaskRes.page.size : pagination?.pageSize,
      });
    }
  }, [scheduleTaskRes, scheduleRes, isScheduleView]);

  const { data: resProjects } = useRequest(listProjects, {
    defaultParams: [null, 1, 400],
  });

  const { loop: loadData, destory } = useLoop((count) => {
    return async (
      args: IScheduleParam | ISubTaskParam,
      perspective: Perspective,
      propsPagination: IPagination,
    ) => {
      if (mode === SchedulePageMode.MULTI_PAGE && activePageKey !== scheduleTabType) {
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
      params.timeRange &&
        localStorage.setItem(SCHEDULE_EXECUTE_TIME_KEY, JSON.stringify(params.timeRange));
      params.executeDate &&
        localStorage.setItem(SCHEDULE_EXECUTE_DATE_KEY, JSON.stringify(params.executeDate));
      handleChangeParams(params, perspective, { ...pagination, current: 1 });
    } else {
      subTaskParams.timeRange &&
        localStorage.setItem(SUB_TASK_EXECUTE_TIME_KEY, JSON.stringify(subTaskParams.timeRange));
      subTaskParams.executeDate &&
        localStorage.setItem(SUB_TASK_EXECUTE_DATE_KEY, JSON.stringify(subTaskParams.executeDate));
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
      title: '作业',
      dataIndex: 'scheduleId',
      width: 500,
      render: (id, record) => {
        return (
          <ScheduleNameColumns
            record={record as IScheduleRecord<ScheduleRecordParameters>}
            delList={delList}
            onDetailVisible={onDetailVisible}
            mode={mode}
          />
        );
      },
    },
    {
      title: '数据库',
      dataIndex: 'database',
      width: 120,
      render: (type, record) => {
        return <DatabaseColumn record={record as IScheduleRecord<ScheduleRecordParameters>} />;
      },
    },
    ...(scheduleTabType === SchedulePageType.ALL
      ? [
          {
            title: '类型',
            dataIndex: 'type',
            width: 100,
            render: (type, record) => {
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
      width: 150,
      render: (status, record) => {
        return (
          <div>
            <div>
              <ScheduleStatusLabel status={status} />
            </div>
            {record?.approvable && record?.approveInstanceId && (
              <ScheduleMiniFlowSpan
                record={record}
                onDetail={() => {
                  onDetailVisible(record, true, ScheduleDetailType.OPERATION_RECORD);
                  scheduleStore.setOpenOperationId(record?.latestChangedLogId);
                }}
              />
            )}
          </div>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 140,
      render: (_, record) => {
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
      title: '执行记录ID',
      ellipsis: true,
      width: 80,
      render: (id, record) => {
        return (
          <div
            style={{ color: '#1890ff', cursor: 'pointer', padding: '10px 0px 10px 0px' }}
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
      title: '所属作业',
      ellipsis: true,
      width: 220,
      render: (scheduleName, record) => {
        return (
          <div>
            <Tooltip
              overlayClassName={styles.scheduleNameTooltip}
              title={
                <>
                  <div>所属作业：{scheduleName}</div>
                  <div>作业ID：{record?.scheduleId}</div>
                </>
              }
            >
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  maxWidth: '100%',
                  width: 'max-content',
                }}
                className={classNames(styles.tip, styles.hoverLink)}
              >
                <div className={styles.ellipsis}>{scheduleName}</div>
                <div>#{record?.scheduleId}</div>
              </div>
            </Tooltip>
          </div>
        );
      },
    },
    ...(mode === SchedulePageMode.PROJECT || login.isPrivateSpace()
      ? []
      : [
          {
            dataIndex: 'project',
            title: '项目',
            ellipsis: true,
            width: 200,
            render: (project) => project?.name,
          },
        ]),

    {
      dataIndex: 'type',
      title: '类型',
      ellipsis: true,
      width: 120,
      render: (type) => SubTypeTextMap[type],
    },
    {
      dataIndex: 'createTime',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskRecord.CreationTime',
        defaultMessage: '创建时间',
      }), //创建时间
      ellipsis: true,
      width: 180,
      render: (createTime) => getFormatDateTime(createTime),
    },
    {
      dataIndex: 'status',
      title: '状态',
      ellipsis: true,
      width: 140,
      render: (status, record) => {
        return <ScheduleTaskStatusLabel status={status} />;
      },
    },
    {
      dataIndex: 'action',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskRecord.Operation',
        defaultMessage: '操作',
      }), //操作
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
            新建
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
            scheduleTabType: scheduleTabType,
            perspective,
            setPerspective,
            subTaskParams,
            isScheduleView,
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
