import CommonTable from '@/component/CommonTable';
import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import { CommonTableMode, IOperationOptionType } from '@/component/CommonTable/interface';
import StatusLabel, { status } from '@/component/Task/component/Status';
import type { IResponseData, TaskRecord, TaskRecordParameters } from '@/d.ts';
import { TaskPageType, TaskType } from '@/d.ts';
import type { PageStore } from '@/store/page';
import type { TaskStore } from '@/store/task';
import { useLoop } from '@/util/hooks/useLoop';
import { formatMessage } from '@/util/intl';
import Icon, { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker, Tooltip, Popover, Space, Typography, Dropdown } from 'antd';
import { inject, observer } from 'mobx-react';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState, useContext, useCallback, useMemo } from 'react';
import styles from '@/component/Task/index.less';
import { listProjects } from '@/common/network/project';
import ProjectContext from '@/page/Project/ProjectContext';
import { isProjectArchived } from '@/page/Project/helper';
import { useRequest, useSetState } from 'ahooks';
import useURLParams from '@/util/hooks/useUrlParams';
import { useTaskGroup } from '../../hooks';
import { TaskConfig } from '@/common/task';
import Header from '../../layout/Header';
import TableCard from '@/component/Table/TableCard';
import ParamsContext, { defaultParam } from '../../context/ParamsContext';
import { debounce } from 'lodash';
import { ITaskParam, TaskPageMode, IPagination } from '@/component/Task/interface';
import { TaskPageTextMap } from '@/constant/task';
import { useTaskSelection } from '@/component/Task/component/TaskTable/useTaskSelection';
import useUrlAction, { URL_ACTION } from '@/util/hooks/useUrlAction';
import { getTerminateConfig } from '@/component/Task/component/AsyncTaskOperationButton/helper';
import { AsyncTaskOperationButton } from '@/component/Task/component/AsyncTaskOperationButton';
import ImportModal from '@/component/Task/component/ImportModal';
import { useImport } from '@/component/Task/component/ImportModal/useImport';
import TaskNameColumn from './TaskNameColumn';
import odc from '@/plugins/odc';
import TaskActions from '../TaskActions';
import { taskTypeThatCanBeTerminate } from '@/constant/triangularization';
import { TASK_EXECUTE_DATE_KEY, TASK_EXECUTE_TIME_KEY } from './const';
const { Text } = Typography;

interface IProps {
  tableRef: React.RefObject<ITableInstance>;
  taskStore?: TaskStore;
  pageStore?: PageStore;
  taskTabType?: TaskPageType;
  taskList: IResponseData<TaskRecord<TaskRecordParameters>>;
  mode?: TaskPageMode;
  getTaskList: (args: ITableLoadOptions, pagination: IPagination) => Promise<any>;
  onReloadList: () => void;
  onDetailVisible: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
  onChange?: (args: ITableLoadOptions) => void;
  onMenuClick?: (type: TaskPageType) => void;
  disableProjectCol?: boolean;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onApprovalVisible?: (status: boolean, id: number) => void;
  params?: ITaskParam;
  setParams?: React.Dispatch<React.SetStateAction<ITaskParam>>;
  pagination?: IPagination;
  setPagination?: React.Dispatch<React.SetStateAction<IPagination>>;
}

const TaskTable: React.FC<IProps> = (props) => {
  const {
    taskStore,
    pageStore,
    getTaskList,
    taskTabType,
    tableRef,
    taskList,
    mode,
    onMenuClick,
    onDetailVisible,
    loading,
    setLoading,
    onApprovalVisible,
    params,
    setParams,
    pagination,
    setPagination,
  } = props;
  const { results: menus } = useTaskGroup({ taskItems: Object.values(TaskConfig) });
  const { project } = useContext(ProjectContext) || {};
  const projectArchived = isProjectArchived(project);
  const { activePageKey } = pageStore;
  const isAll = TaskPageType.ALL === taskTabType;
  const [hoverInNewTaskMenuBtn, setHoverInNewTaskMenuBtn] = useState(false);
  const [hoverInNewTaskMenu, setHoverInNewTaskMenu] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState<boolean>(false);
  const [importProjectId, setImportProjectId] = useState<string>();
  const { isSubmitImport, debounceSubmit } = useImport(props.onReloadList, importProjectId);
  const { runAction } = useUrlAction();

  const { loop: loadData, destory } = useLoop((count) => {
    return async (args, propsPagination) => {
      if (mode === TaskPageMode.MULTI_PAGE && activePageKey !== taskTabType) {
        destory();
        return;
      }
      if (propsPagination?.pageSize) {
        setPagination(propsPagination);
      }
      await getTaskList(args, propsPagination);
      setLoading(false);
    };
  }, 6000);

  useEffect(() => {
    setLoading(true);
    runAction({ actionType: URL_ACTION.newTask, callback: () => setHoverInNewTaskMenu(true) });
    runAction({
      actionType: URL_ACTION.newDataMock,
      callback: () => {
        props.onMenuClick(TaskPageType.DATAMOCK);
      },
    });
    loadData(params, pagination);
    return () => {
      destory?.();
    };
  }, []);

  const { data: resProjects } = useRequest(listProjects, {
    defaultParams: [null, 1, 400],
  });

  const handleChangeParams = useCallback(
    debounce((params, pagination) => {
      setLoading(true);
      loadData(params, pagination);
    }, 150),
    [pagination, params],
  );

  useEffect(() => {
    setPagination({
      current: taskList?.page?.number,
      pageSize: taskList?.page?.size ? taskList?.page?.size : pagination?.pageSize,
    });
  }, [taskList]);

  useEffect(() => {
    params.timeRange &&
      localStorage.setItem(TASK_EXECUTE_TIME_KEY, JSON.stringify(params.timeRange));
    params.executeDate &&
      localStorage.setItem(TASK_EXECUTE_DATE_KEY, JSON.stringify(params.executeDate));
    handleChangeParams(params, {
      ...pagination,
      current: 1,
    });
  }, [params, taskTabType]);

  const { selectedRow, rowSelection, clearSelection } = useTaskSelection({
    taskStore,
    taskTabType,
    taskList,
    tableRef,
  });

  const newTaskMenu = () => {
    return (
      <Space
        align="start"
        size={20}
        onMouseMove={() => setHoverInNewTaskMenuBtn(true)}
        onMouseLeave={() => setHoverInNewTaskMenuBtn(false)}
      >
        {menus?.map((groupItem) => {
          if (!groupItem.label) {
            return;
          }
          return (
            <Space direction="vertical">
              <Text
                type="secondary"
                style={{ color: 'var(--text-color-hint)' }}
                key={groupItem.key}
              >
                {groupItem?.label}
              </Text>
              <Space size={0} direction="vertical">
                {groupItem?.children?.map((item) => {
                  return (
                    <div
                      className={styles.menuItem}
                      key={item.value}
                      onClick={() => {
                        setHoverInNewTaskMenuBtn(false);
                        onMenuClick(item.value);
                      }}
                    >
                      {item?.label}
                    </div>
                  );
                })}
              </Space>
            </Space>
          );
        })}
      </Space>
    );
  };

  const columns = [
    {
      title: '工单',
      dataIndex: 'id',
      width: 500,
      render: (id, record) => (
        <TaskNameColumn record={record} onDetailVisible={onDetailVisible} mode={mode} />
      ),
    },
    {
      ...(isAll
        ? {
            title: '类型',
            dataIndex: 'type',
            width: 150,
            render: (type, record) => {
              return TaskPageTextMap[type];
            },
          }
        : {}),
    },

    {
      title: formatMessage({
        id: 'odc.component.TaskTable.Status',
        defaultMessage: '状态',
      }),
      dataIndex: 'status',
      width: 100,
      render: (status, record) => {
        return <StatusLabel status={status} type={record?.type} />;
      },
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 200,
      render: (_, record) => (
        <TaskActions
          task={record}
          onDetailVisible={props.onDetailVisible}
          onReloadList={props.onReloadList}
          isDetailModal={false}
          onClose={() => props.onDetailVisible(null, false)}
          onApprovalVisible={onApprovalVisible}
        />
      ),
    },
  ];

  const newALLTaskOperation = useMemo(() => {
    if (!isAll || projectArchived) return;

    return (
      <Popover
        content={newTaskMenu}
        placement="bottomLeft"
        open={(hoverInNewTaskMenuBtn || hoverInNewTaskMenu) && isAll}
      >
        <Button
          type="primary"
          onMouseMove={() => setHoverInNewTaskMenu(true)}
          onMouseLeave={() => {
            setTimeout(() => {
              setHoverInNewTaskMenu(false);
            }, 200);
          }}
          onClick={() => {
            if (isAll) return;
            onMenuClick(taskTabType);
          }}
        >
          <>
            新建
            <DownOutlined style={{ color: '#fff' }} />
          </>
        </Button>
      </Popover>
    );
  }, [isAll, hoverInNewTaskMenuBtn, hoverInNewTaskMenu]);

  const newTaskOperation = useMemo(() => {
    if (isAll || projectArchived) return;
    const taskTypeLabel = TaskPageTextMap[taskTabType];
    return (
      <Button type="primary">
        <a onClick={() => props.onMenuClick(taskTabType)}>
          <Space>
            {formatMessage(
              {
                id: 'odc.src.component.Task.component.TaskTable.NewActiveTasklabel',
                defaultMessage: '新建{activeTaskLabel}',
              },
              { activeTaskLabel: taskTypeLabel },
            )}
          </Space>
        </a>
      </Button>
    );
  }, [isAll, taskTabType, isSubmitImport]);

  const batchOperation = () => {
    if (projectArchived) return;
    let menuItems = [];
    const isSupportTaksTerminate = odc?.appConfig?.task?.isSupportTaksTerminate;
    if (isSupportTaksTerminate && taskTypeThatCanBeTerminate?.includes(taskTabType)) {
      menuItems.push({
        key: 'batchTerminate',
        label: (
          <AsyncTaskOperationButton
            onReload={() => {
              clearSelection();
              props.onReloadList?.();
            }}
            {...getTerminateConfig(selectedRow)}
            buttonType="text"
            dataSource={selectedRow}
          />
        ),
      });
    }
    if (!menuItems.length) return;
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

  return (
    <TableCard
      title={
        <Space size={12}>
          {newALLTaskOperation}
          {newTaskOperation}
          {batchOperation()}
        </Space>
      }
      extra={
        <ParamsContext.Provider
          value={{
            params,
            setParams,
            projectList: resProjects?.contents,
            mode,
            reload: () => {
              setLoading(true);
              loadData(params, pagination);
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
        stripe={false}
        showToolbar={false}
        computePageSizeByResize
        rowHeight={51}
        ref={tableRef}
        mode={CommonTableMode.SMALL}
        titleContent={null}
        enableResize
        onLoad={async (e) => {
          loadData(params, {
            current: 1,
            pageSize: e?.pageSize ? e?.pageSize : pagination?.pageSize,
          });
        }}
        onChange={(e) => {
          if (e.pagination) {
            loadData(params, {
              pageSize: e?.pagination?.pageSize ? e?.pagination?.pageSize : pagination?.pageSize,
              current: e?.pagination?.current,
            });
          }
        }}
        enabledReload={false}
        tableProps={{
          className: styles.commonTable,
          loading,
          columns: columns,
          rowKey: 'id',
          dataSource: taskList?.contents,
          pagination: {
            current: taskList?.page?.number,
            total: taskList?.page?.totalElements,
          },
        }}
        showSelectedInfoBar={false}
        rowSelecter={[TaskPageType.ALL]?.includes(taskTabType) ? null : rowSelection}
      />
      <ImportModal
        taskType={taskTabType as any}
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

export default inject('taskStore', 'pageStore')(observer(TaskTable));
