import { createTask, getAsyncTaskUploadUrl } from '@/common/network/task';
import CommonIDE from '@/component/CommonIDE';
import FormItemPanel from '@/component/FormItemPanel';
import ODCDragger from '@/component/OSSDragger2';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import {
  ConnectType,
  IConnection,
  SQLContentType,
  TaskExecStrategy,
  TaskPageScope,
  TaskPageType,
  TaskType,
} from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import login from '@/store/login';
import type { ModalStore } from '@/store/modal';
import type { SQLStore } from '@/store/sql';
import type { TaskStore } from '@/store/task';
import utils, { IEditor } from '@/util/editor';
import { formatMessage } from '@/util/intl';
import { getLocale } from '@umijs/max';
import {
  Alert,
  AutoComplete,
  Button,
  Checkbox,
  Divider,
  Drawer,
  Form,
  InputNumber,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Tabs,
  Timeline,
  Tooltip,
} from 'antd';
import type { UploadFile } from 'antd/lib/upload/interface';
import Cookies from 'js-cookie';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './index.less';
import { useProjects } from '../../hooks/useProjects';
import { DeleteOutlined, DownOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { listDatabases } from '@/common/network/database';
import { useRequest } from 'ahooks';
import { IEnvironment } from '@/d.ts/environment';
import _, { throttle } from 'lodash';
import InnerSelecter from './InnerSelecter';
import { CreateTemplateModal, SelectTemplate } from './template';
import { runMultipleSQLLint } from '@/common/network/sql';
import MultipleLintResultTable from '@/page/Workspace/components/SQLResultSet/MultipleAsyncSQLLintTable';
import { IDatabase } from '@/d.ts/database';
import { MultipleAsyncContext } from './MultipleAsyncContext';
import { getDataSourceModeConfig } from '@/common/datasource';
const MAX_FILE_SIZE = 1024 * 1024 * 256;
interface IProps {
  sqlStore?: SQLStore;
  taskStore?: TaskStore;
  modalStore?: ModalStore;
  projectId?: number;
  theme?: string;
}
enum ErrorStrategy {
  CONTINUE = 'CONTINUE',
  ABORT = 'ABORT',
}
type DatabaseOption = {
  label: string;
  value: number;
  dataSource: IConnection;
  environment: IEnvironment;
  existed: boolean;
};
export const flatArray = (array: any[]): any[] => {
  return array?.reduce?.((pre, cur) => pre?.concat(Array.isArray(cur) ? flatArray(cur) : cur), []);
};
enum SiderTabKeys {
  SELECT_DATABASE = 'SELECT_DATABASE',
  SQL_CONTENT = 'SQL_CONTENT',
  ROLLBACK_CONTENT = 'ROLLBACK_CONTENT',
  MORE_SETTINGS = 'MORE_SETTINGS',
}
const items = [
  {
    label: formatMessage({
      id: 'src.component.Task.MutipleAsyncTask.CreateModal.C0D9B0C7',
      defaultMessage: '数据库选择',
    }),
    key: SiderTabKeys.SELECT_DATABASE,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.MutipleAsyncTask.CreateModal.AC5189F0',
      defaultMessage: 'SQL 内容',
    }),
    key: SiderTabKeys.SQL_CONTENT,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.MutipleAsyncTask.CreateModal.453929F9',
      defaultMessage: '回滚内容',
    }),
    key: SiderTabKeys.ROLLBACK_CONTENT,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.MutipleAsyncTask.CreateModal.0D0BC691',
      defaultMessage: '更多设置',
    }),
    key: SiderTabKeys.MORE_SETTINGS,
  },
];

const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore, projectId, theme } = props;
  const { multipleAsyncTaskData, multipleDatabaseChangeOpen } = modalStore;
  const [form] = Form.useForm();
  const editorRef = useRef<CommonIDE>();
  const scrollSwitcher = useRef<Boolean>(true);
  const formBoxRef = React.createRef<HTMLDivElement>();
  const [activeKey, setActiveKey] = useState<SiderTabKeys>(SiderTabKeys.SELECT_DATABASE);

  const [sqlContentType, setSqlContentType] = useState(SQLContentType.TEXT);
  const [rollbackContentType, setRollbackContentType] = useState(SQLContentType.TEXT);
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { projectOptions, projectMap, loadProjects } = useProjects();
  const [databaseIdMap, setDatabaseIdMap] = useState<Map<number, boolean>>(new Map());
  const [defaultDatasource, setDefaultDatasource] = useState<IConnection>();
  const _projectId = Form.useWatch<number>('projectId', form);
  const sqlContent = Form.useWatch<string>(['parameters', 'sqlContent'], form);
  const executionStrategy = Form.useWatch<TaskExecStrategy>('executionStrategy', form);
  const [createTemplateModalOpen, setCreateTemplateModalOpen] = useState<boolean>(false);
  const [selectTemplateModalOpen, setSelectTemplateModalOpen] = useState<boolean>(false);
  const [manageTemplateModalOpen, setManageTemplateModalOpen] = useState<boolean>(false);
  const [preCheckLoading, setPreLoading] = useState<boolean>(false);
  const [hasPreCheck, setHasPreCheck] = useState<boolean>(false);
  const [lintResultSet, setLintResultSet] = useState<
    {
      checkResult: ISQLLintReuslt;
      database: IDatabase;
    }[]
  >([]);
  const [databaseOptions, setDatabaseOptions] = useState<DatabaseOption[]>([]);
  const sqlFileRef = useRef<{
    setValue: (value: UploadFile[]) => void;
    resetFields: () => void;
  }>();
  const rollbackSqlFileRef = useRef<{
    setValue: (value: UploadFile[]) => void;
    resetFields: () => void;
  }>();
  const [executeOrPreCheckSql, setExecuteOrPreCheckSql] = useState<string>();
  const [sqlChanged, setSqlChanged] = useState<boolean>(false);
  const {
    data,
    run,
    loading: fetchLoading,
  } = useRequest(listDatabases, {
    manual: true,
  });

  const scrollToKey = (key: string) => {
    scrollSwitcher.current = false;
    const element = document.querySelector(`[data-name=${key}]`);
    if (element) {
      element.scrollIntoView();
    }
    setTimeout(() => {
      scrollSwitcher.current = true;
    });
  };
  // src/component/ODCSetting/index.tsx
  const listener = throttle(() => {
    if (!scrollSwitcher.current) {
      return;
    }
    // 获取容器A的当前滚动位置和高度
    const scrollTop = formBoxRef.current?.scrollTop;
    // 遍历所有子节点
    const children = formBoxRef.current?.querySelectorAll<HTMLHeadingElement>('[data-name]'); // 假定子节点有共同的类名'child'
    let min = Number.MAX_SAFE_INTEGER;
    let key;
    children.forEach((child) => {
      // 获取子节点相对于容器A顶部的位置
      const childOffsetTop = child.offsetTop;
      let distance = childOffsetTop - scrollTop;
      if (distance >= 0) {
        distance = distance / 2;
      }
      const distanceAbs = Math.abs(distance);
      if (distanceAbs < min) {
        min = distanceAbs;
        key = child.getAttribute('data-name');
      }
    });
    if (!key) {
      return;
    }
    setActiveKey(key);
  }, 500);

  const getFileIdAndNames = (files: UploadFile[]) => {
    const ids = [];
    const names = [];
    files
      ?.filter((file) => file?.status === 'done')
      ?.forEach((file) => {
        ids.push(file?.response?.data?.contents?.[0]?.objectId);
        names.push(file?.name);
      });
    return {
      ids,
      names,
      size: ids.length,
    };
  };
  const checkFileSizeAmount = (files: UploadFile[]): boolean => {
    const fileSizeAmount = files?.reduce((prev, current) => {
      return prev + current.size;
    }, 0);
    if (fileSizeAmount > MAX_FILE_SIZE) {
      /**
       * 校验文件总大小
       */
      message.warning(
        formatMessage({
          id: 'odc.components.CreateAsyncTaskModal.TheMaximumSizeOfThe',
        }),
        //文件最多不超过 256MB
      );

      return false;
    }
    return true;
  };
  const handleChange = (type: 'sqlContentType' | 'rollbackContentType', value: SQLContentType) => {
    if (type === 'sqlContentType') {
      setSqlContentType(value);
    } else {
      setRollbackContentType(value);
    }
  };
  const handleSqlChange = (type: 'sqlContent' | 'rollbackSqlContent', sql: string) => {
    form?.setFieldValue(['parameters', type], sql);
    setHasEdit(true);
  };
  const handleFieldsChange = (changedFields, allFields) => {
    setHasEdit(true);
  };
  const handleBeforeUpload = (file, type: 'sqlFiles' | 'rollbackSqlFiles') => {
    const isLt20M = MAX_FILE_SIZE > file.size;
    if (!isLt20M) {
      setTimeout(() => {
        setFormStatus(
          type,
          formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.TheMaximumSizeOfThe',
          }),
          //文件最多不超过 256MB
        );
      }, 0);
    }
    return isLt20M;
  };
  const handleFileChange = (files: UploadFile[], type: 'sqlFiles' | 'rollbackSqlFiles') => {
    form?.setFieldsValue({
      [type]: files,
    });
    if (files.some((item) => item?.error?.isLimit)) {
      setFormStatus(
        type,
        formatMessage({
          id: 'odc.components.CreateAsyncTaskModal.TheMaximumSizeOfThe',
        }),
        //文件最多不超过 256MB
      );
    } else {
      setFormStatus(type, '');
    }
  };
  const setFormStatus = (fieldName: string, errorMessage: string) => {
    form.setFields([
      {
        name: [fieldName],
        errors: errorMessage ? [errorMessage] : [],
      },
    ]);
  };
  const hadleReset = () => {
    form.resetFields(null);
    setSqlContentType(SQLContentType.TEXT);
    setRollbackContentType(SQLContentType.TEXT);
    sqlFileRef.current?.resetFields();
    rollbackSqlFileRef.current?.resetFields();
    setHasEdit(false);
    setLintResultSet([]);
    setHasPreCheck(false);
  };
  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.E9F7FF9D',
          defaultMessage: '确认取消数据库变更吗？',
        }),
        centered: true,
        onOk: () => {
          modalStore.changeMultiDatabaseChangeModal(false);
          hadleReset();
        },
        okText: formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.B13CF0A4',
          defaultMessage: '确认',
        }),
        cancelText: formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.3FBE491C',
          defaultMessage: '取消',
        }),
      });
    } else {
      modalStore.changeMultiDatabaseChangeModal(false);
      hadleReset();
    }
  };
  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const {
          executionStrategy,
          sqlContentType,
          rollbackContentType,
          rollbackSqlFiles,
          sqlFiles,
          description,
          parameters: {
            orderedDatabaseIds,
            delimiter,
            errorStrategy,
            generateRollbackPlan,
            queryLimit,
            retryTimes,
            rollbackSqlContent,
            sqlContent,
            timeoutMillis,
            manualTimeoutMillis,
            autoErrorStrategy,
          },
        } = values;
        const sqlFileIdAndNames = getFileIdAndNames(sqlFiles);
        const rollbackSqlFileIdAndNames = getFileIdAndNames(rollbackSqlFiles);
        const parameters = {
          projectId: _projectId,
          orderedDatabaseIds,
          timeoutMillis: timeoutMillis ? timeoutMillis * 60 * 60 * 1000 : undefined,
          manualTimeoutMillis: manualTimeoutMillis
            ? manualTimeoutMillis * 60 * 60 * 1000
            : undefined,
          errorStrategy,
          autoErrorStrategy,
          sqlContent,
          generateRollbackPlan,
          sqlObjectIds: sqlFileIdAndNames?.ids || null,
          sqlObjectNames: sqlFileIdAndNames?.names,
          rollbackSqlContent,
          rollbackSqlObjectIds: rollbackSqlFileIdAndNames?.ids,
          rollbackSqlObjectNames: rollbackSqlFileIdAndNames?.names,
          queryLimit,
          delimiter,
          retryTimes,
        };
        if (!checkFileSizeAmount(sqlFiles) || !checkFileSizeAmount(rollbackSqlFiles)) {
          return;
        }
        if (sqlContentType === SQLContentType.FILE) {
          delete parameters.sqlContent;
          if (sqlFiles?.some((item) => item?.error?.isLimit)) {
            setFormStatus(
              'sqlFiles',
              formatMessage({
                id: 'odc.components.CreateAsyncTaskModal.TheMaximumSizeOfThe',
              }),
              //文件最多不超过 256MB
            );

            return;
          }
          if (!sqlFileIdAndNames?.size || sqlFileIdAndNames?.size !== sqlFiles?.length) {
            setFormStatus(
              'sqlFiles',
              formatMessage({
                id: 'odc.components.CreateAsyncTaskModal.UploadAnSqlFile',
              }),

              //请上传 SQL 文件
            );

            return;
          }
        } else {
          // if (asyncTaskData?.type !== RollbackType.REF) {
          //   delete parameters.sqlObjectIds;
          // }
          delete parameters.sqlObjectNames;
        }
        if (rollbackContentType === SQLContentType.FILE) {
          delete parameters.rollbackSqlContent;
        } else {
          delete parameters.rollbackSqlObjectIds;
          delete parameters.rollbackSqlObjectNames;
        }
        const data = {
          taskType: TaskType.MULTIPLE_ASYNC,
          executionStrategy,
          parameters,
          description,
        };
        setConfirmLoading(true);
        const res = await createTask(data);
        handleCancel(false);
        setConfirmLoading(false);
        if (res) {
          openTasksPage(TaskPageType.MULTIPLE_ASYNC, TaskPageScope.CREATED_BY_CURRENT_USER);
          modalStore.changeMultiDatabaseChangeModal(false);
        }
      })
      .catch((errorInfo) => {
        console.error(JSON.stringify(errorInfo));
        setConfirmLoading(false);
      });
  };

  const preCheck = async () => {
    utils.removeHighlight(editorRef?.current?.editor);
    const { parameters } = await form?.getFieldsValue();
    const { sqlContent, delimiter, orderedDatabaseIds } = parameters ?? {};
    const databaseIds = flatArray(orderedDatabaseIds);
    if (_projectId && sqlContent?.length && databaseIds?.length) {
      setLintResultSet([]);
      setPreLoading(true);
      setHasPreCheck(false);
      const result = await runMultipleSQLLint(
        {
          delimiter,
          databaseIds,
          scriptContent: sqlContent as string,
        },
        login.organizationId?.toString(),
      );
      if (result) {
        setExecuteOrPreCheckSql(sqlContent);
        setSqlChanged(false);
        setHasPreCheck(true);
        setLintResultSet(
          result?.reduce((pre, cur) => {
            cur?.checkResultList?.forEach((item) => {
              pre.push({
                checkResult: item,
                database: cur?.database,
              });
            });
            return pre;
          }, []),
        );
      }
      setPreLoading(false);
    }
  };
  const onEditorAfterCreatedCallback = (editor: IEditor) => {
    editor.onDidChangeCursorPosition(() => {
      utils.removeHighlight(editor);
    });
  };
  const initData = async () => {
    let formData: any = {};
    if (multipleDatabaseChangeOpen) {
      await loadProjects();
      const initData = { ...multipleAsyncTaskData };
      formData = {
        projectId: initData?.projectId ? initData?.projectId : undefined,
        executionStrategy: TaskExecStrategy.MANUAL,
        retryTimes: 0,
        parameters: {
          orderedDatabaseIds: initData?.parameters?.orderedDatabaseIds?.length
            ? initData?.parameters?.orderedDatabaseIds
            : [[undefined]],
        },
      };
      form.setFieldsValue(formData);
    } else {
      form.resetFields();
    }
  };

  useLayoutEffect(() => {
    initData();
  }, [multipleAsyncTaskData, multipleDatabaseChangeOpen]);
  useEffect(() => {
    if (multipleDatabaseChangeOpen) {
      loadProjects();
      form.setFieldsValue({
        executionStrategy: TaskExecStrategy.MANUAL,
        retryTimes: 0,
        projectId: undefined,
        parameters: {
          orderedDatabaseIds: [[undefined]],
        },
      });
    } else {
      form.resetFields();
    }
    return () => {
      form.resetFields();
    };
  }, [multipleDatabaseChangeOpen]);
  const loadDatabaseList = async (projectId: number) => {
    const databaseList = await run(
      projectId,
      null,
      1,
      99999,
      null,
      null,
      login.isPrivateSpace(),
      true,
      true,
    );
    setDatabaseOptions(
      databaseList?.contents?.map((item) => ({
        label: item?.name,
        value: item?.id,
        environment: item?.environment,
        dataSource: item?.dataSource,
        existed: item?.existed,
      })),
    );
    if (databaseList?.contents?.length) {
      setDefaultDatasource(databaseList?.contents?.[0]?.dataSource);
    }
    databaseList?.contents?.forEach((db) => {
      databaseIdMap.set(db.id, false);
    });
    setDatabaseIdMap(databaseIdMap);
  };
  useEffect(() => {
    if (multipleDatabaseChangeOpen && _projectId) {
      loadDatabaseList(_projectId);
    }
  }, [_projectId]);
  return (
    <MultipleAsyncContext.Provider
      value={{
        projectId: _projectId,
        projectMap,
      }}
    >
      <Drawer
        destroyOnClose
        className={styles.asyncTask}
        width={905}
        title={formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.493673D9',
          defaultMessage: '新建多库变更工单',
        })}
        footer={
          <Space>
            <Button
              onClick={() => {
                handleCancel(hasEdit);
              }}
            >
              {
                formatMessage({
                  id: 'odc.components.CreateAsyncTaskModal.Cancel',
                })

                /* 取消 */
              }
            </Button>
            <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
              {
                formatMessage({
                  id: 'odc.components.CreateAsyncTaskModal.New',
                })

                /* 新建 */
              }
            </Button>
          </Space>
        }
        open={multipleDatabaseChangeOpen}
        onClose={() => {
          handleCancel(hasEdit);
        }}
      >
        <div className={styles.content} ref={formBoxRef} onScroll={listener}>
          <div
            style={{
              flexGrow: 1,
              maxWidth: 'calc(100% - 136px)',
            }}
          >
            <Form
              name="basic"
              // initialValues={}
              layout="vertical"
              requiredMark="optional"
              form={form}
              onFieldsChange={handleFieldsChange}
            >
              <div data-name={SiderTabKeys.SELECT_DATABASE}>
                <Form.Item
                  label={
                    formatMessage({
                      id: 'odc.src.component.Task.ApplyPermission.CreateModal.Project',
                    }) /* 项目 */
                  }
                  name="projectId"
                  rules={[
                    {
                      required: true,
                      message: formatMessage({
                        id: 'odc.src.component.Task.ApplyPermission.CreateModal.PleaseSelectTheProject',
                      }), //'请选择项目'
                    },
                  ]}
                >
                  <Select
                    style={{
                      width: 320,
                    }}
                    options={projectOptions}
                    placeholder={
                      formatMessage({
                        id: 'odc.src.component.Task.ApplyPermission.CreateModal.PleaseChoose.1',
                      }) /* 请选择 */
                    }
                    onChange={() => {
                      form.setFieldValue(['parameters', 'orderedDatabaseIds'], [[undefined]]);
                    }}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
                <Form.Item
                  label={formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.CreateModal.A608B8E7',
                    defaultMessage: '数据库',
                  })}
                  requiredMark
                  shouldUpdate={true}
                >
                  <div className={styles.header}>
                    <div className={styles.tip}>
                      {formatMessage({
                        id: 'src.component.Task.MutipleAsyncTask.CreateModal.50FF5C74',
                        defaultMessage:
                          '选择库并设置执行顺序；不同节点将依次执行变更，同一节点内的库将同时变更',
                      })}
                    </div>
                    <Space split="|">
                      <Tooltip
                        title={
                          !Boolean(_projectId)
                            ? formatMessage({
                                id: 'src.component.Task.MutipleAsyncTask.CreateModal.C7B17105',
                                defaultMessage: '请先选择项目',
                              })
                            : null
                        }
                      >
                        <Button
                          disabled={!Boolean(_projectId)}
                          className={styles.linkBtn}
                          style={{
                            padding: 0,
                            margin: 0,
                          }}
                          type="link"
                          onClick={() => {
                            setCreateTemplateModalOpen(true);
                          }}
                        >
                          {formatMessage({
                            id: 'src.component.Task.MutipleAsyncTask.CreateModal.A95292C7',
                            defaultMessage: '保存模版',
                          })}
                        </Button>
                      </Tooltip>
                      <SelectTemplate
                        manageTemplateModalOpen={manageTemplateModalOpen}
                        setManageTemplateModalOpen={setManageTemplateModalOpen}
                        selectTemplateModalOpen={selectTemplateModalOpen}
                        setSelectTemplateModalOpen={setSelectTemplateModalOpen}
                      />
                    </Space>
                    <CreateTemplateModal
                      form={form}
                      createTemplateModalOpen={createTemplateModalOpen}
                      setCreateTemplateModalOpen={setCreateTemplateModalOpen}
                    />
                  </div>
                  <div className={styles.orderedDatabaseIds}>
                    <Form.List name={['parameters', 'orderedDatabaseIds']}>
                      {(fields, { add, remove }) => (
                        <Timeline>
                          {fields?.map(({ key, name, ...restField }, index) => (
                            <Timeline.Item
                              className={styles.timelineItem}
                              key={['databaseIds', key, index]?.join(',')}
                            >
                              <Form.List name={[name]}>
                                {(innerFields, { add: innerAdd, remove: innerRemove }) => (
                                  <DndProvider backend={HTML5Backend}>
                                    <div
                                      key={[key, index, 'inner']?.join(',')}
                                      style={{ display: 'flex', flexDirection: 'column' }}
                                    >
                                      <div
                                        style={{
                                          display: 'flex',
                                          width: '428px',
                                          height: '20px',
                                          lineHeight: '20px',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                        }}
                                      >
                                        <div
                                          className={styles.title}
                                          style={{ flexShrink: 0, alignSelf: 'center' }}
                                        >
                                          {formatMessage({
                                            id: 'src.component.Task.MutipleAsyncTask.CreateModal.4230F3E6',
                                            defaultMessage: '执行节点',
                                          })}
                                        </div>
                                        <Divider
                                          style={{
                                            flex: 1,
                                            padding: 0,
                                            margin: 0,
                                            alignSelf: 'center',
                                            height: 1,
                                            width: 284,
                                            minWidth: 0,
                                            maxWidth: 284,
                                          }}
                                        />

                                        <div
                                          style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            columnGap: '8px',
                                          }}
                                        >
                                          <PlusOutlined onClick={() => innerAdd(undefined)} />
                                          <UpOutlined
                                            style={{
                                              color: index === 0 ? 'var(--mask-color)' : null,
                                              cursor: index === 0 ? 'not-allowed' : null,
                                            }}
                                            onClick={async () => {
                                              if (index === 0) {
                                                return;
                                              }
                                              const data = await form.getFieldsValue();
                                              const orderedDatabaseIds =
                                                data?.parameters?.orderedDatabaseIds ?? [];
                                              const [pre, next] = orderedDatabaseIds?.slice(
                                                index - 1,
                                                index + 1,
                                              );
                                              orderedDatabaseIds?.splice(index - 1, 2, next, pre);
                                              form.setFieldValue(
                                                ['parameters', 'orderedDatabaseIds'],
                                                orderedDatabaseIds,
                                              );
                                            }}
                                          />

                                          <DownOutlined
                                            style={{
                                              color:
                                                index === fields?.length - 1
                                                  ? 'var(--mask-color)'
                                                  : null,
                                              cursor:
                                                index === fields?.length - 1 ? 'not-allowed' : null,
                                            }}
                                            onClick={async () => {
                                              if (index === fields?.length - 1) {
                                                return;
                                              }
                                              const data = await form.getFieldsValue();
                                              const orderedDatabaseIds =
                                                data?.parameters?.orderedDatabaseIds ?? [];
                                              const [pre, next] = orderedDatabaseIds?.slice(
                                                index,
                                                index + 2,
                                              );
                                              orderedDatabaseIds?.splice(index, 2, next, pre);
                                              form.setFieldValue(
                                                ['parameters', 'orderedDatabaseIds'],
                                                orderedDatabaseIds,
                                              );
                                            }}
                                          />

                                          <DeleteOutlined onClick={() => remove(name)} />
                                        </div>
                                      </div>
                                      <InnerSelecter
                                        projectId={_projectId}
                                        outerName={name}
                                        innerFields={innerFields}
                                        innerRemove={innerRemove}
                                        databaseOptions={databaseOptions}
                                      />
                                    </div>
                                  </DndProvider>
                                )}
                              </Form.List>
                            </Timeline.Item>
                          ))}
                          <Timeline.Item className={styles.timelineItem}>
                            <Button
                              type="link"
                              style={{
                                padding: 0,
                                margin: 0,
                                lineHeight: '20px',
                                height: '20px',
                              }}
                              onClick={() => add([undefined])}
                              icon={<PlusOutlined />}
                            >
                              {formatMessage({
                                id: 'src.component.Task.MutipleAsyncTask.CreateModal.F281ECC3',
                                defaultMessage: '添加执行节点',
                              })}
                            </Button>
                          </Timeline.Item>
                        </Timeline>
                      )}
                    </Form.List>
                  </div>
                </Form.Item>
              </div>
              <div data-name={SiderTabKeys.SQL_CONTENT}>
                <Form.Item
                  label={formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.CreateModal.1DFE930F',
                    defaultMessage: 'SQL 内容',
                  })}
                  name="sqlContentType"
                  initialValue={SQLContentType.TEXT}
                  rules={[
                    {
                      required: true,
                      message: formatMessage({
                        id: 'odc.components.CreateAsyncTaskModal.SelectSqlContent',
                      }),

                      // 请选择 SQL 内容
                    },
                  ]}
                >
                  <Radio.Group
                    onChange={(e) => {
                      handleChange('sqlContentType', e.target.value);
                    }}
                  >
                    <Radio.Button value={SQLContentType.TEXT}>
                      {
                        formatMessage({
                          id: 'odc.components.CreateAsyncTaskModal.SqlEntry',
                        })

                        /* SQL录入 */
                      }
                    </Radio.Button>
                    <Radio.Button value={SQLContentType.FILE}>
                      {
                        formatMessage({
                          id: 'odc.components.CreateAsyncTaskModal.UploadAttachments',
                        })

                        /* 上传附件 */
                      }
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
                <Form.Item
                  name={['parameters', 'sqlContent']}
                  className={`${styles.sqlContent} ${
                    sqlContentType !== SQLContentType.TEXT && styles.hide
                  }`}
                  rules={[
                    {
                      required: sqlContentType === SQLContentType.TEXT,
                      message: formatMessage({
                        id: 'src.component.Task.MutipleAsyncTask.CreateModal.20CA9283',
                        defaultMessage: '请填写 SQL 内容',
                      }),
                    },
                  ]}
                  style={{
                    height: '280px',
                  }}
                >
                  <CommonIDE
                    ref={editorRef}
                    language={
                      getDataSourceModeConfig(defaultDatasource?.type || ConnectType.OB_MYSQL)?.sql
                        ?.language
                    }
                    onEditorAfterCreatedCallback={onEditorAfterCreatedCallback}
                    onSQLChange={(sql) => {
                      handleSqlChange('sqlContent', sql);
                      if (executeOrPreCheckSql !== sql) {
                        setSqlChanged(true);
                      } else {
                        setSqlChanged(false);
                      }
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="sqlFiles"
                  className={sqlContentType !== SQLContentType.FILE && styles.hide}
                >
                  <ODCDragger
                    ref={sqlFileRef}
                    accept=".sql"
                    uploadFileOpenAPIName="UploadFile"
                    onBeforeUpload={(file) => {
                      return handleBeforeUpload(file, 'sqlFiles');
                    }}
                    multiple={true}
                    tip={formatMessage({
                      id: 'odc.component.OSSDragger2.YouCanDragAndDrop',
                    })}
                    maxCount={500}
                    action={getAsyncTaskUploadUrl()}
                    headers={{
                      'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN') || '',
                      'Accept-Language': getLocale(),
                      currentOrganizationId: login.organizationId?.toString(),
                    }}
                    onFileChange={(files) => {
                      handleFileChange(files, 'sqlFiles');
                    }}
                  >
                    <p className={styles.tip}>
                      {
                        formatMessage({
                          id: 'odc.components.CreateAsyncTaskModal.ClickOrDragMultipleFiles',
                        })
                        /*点击或将多个文件拖拽到这里上传*/
                      }
                    </p>
                    <p className={styles.desc}>
                      {
                        formatMessage({
                          id: 'odc.components.CreateAsyncTaskModal.TheMaximumSizeOfThe.2',
                        })
                        /*文件最多不超过 256MB ，支持扩展名 .sql*/
                      }
                    </p>
                  </ODCDragger>
                </Form.Item>
                <Tooltip
                  title={
                    sqlContentType === SQLContentType.FILE
                      ? formatMessage({
                          id: 'src.component.Task.MutipleAsyncTask.CreateModal.F7476B91',
                          defaultMessage: '请使用 SQL 录入，上传附件暂不支持 SQL 检查',
                        })
                      : null
                  }
                >
                  <Button
                    style={{
                      marginBottom: '12px',
                    }}
                    onClick={preCheck}
                    disabled={
                      // !session?.sessionId ||
                      // !databaseId ||
                      !sqlContent || sqlContentType === SQLContentType.FILE
                    }
                    loading={preCheckLoading}
                  >
                    {
                      preCheckLoading
                        ? formatMessage({
                            id: 'odc.src.component.Task.AsyncTask.CreateModal.InInspection',
                          }) //'检查中'
                        : formatMessage({
                            id: 'odc.src.component.Task.AsyncTask.CreateModal.SQLCheck',
                          }) //'SQL 检查'
                    }
                  </Button>
                </Tooltip>
                {hasPreCheck && (
                  <Alert
                    closable
                    message={
                      formatMessage(
                        {
                          id: 'odc.src.component.Task.AsyncTask.CreateModal.ThePreExaminationIs',
                        },
                        {
                          lintResultSetLength: lintResultSet?.length || 0,
                        },
                      ) //`预检查完成，${lintResultSet.length} 处语句违反 SQL 开发规范。`
                    }
                    type={lintResultSet?.length === 0 ? 'success' : 'warning'}
                    showIcon
                    style={{
                      marginBottom: '8px',
                    }}
                  />
                )}

                {lintResultSet?.length > 0 && (
                  <MultipleLintResultTable
                    ctx={editorRef?.current?.editor}
                    pageSize={10}
                    hasExtraOpt={false}
                    lintResultSet={lintResultSet}
                    sqlChanged={sqlChanged}
                    baseOffset={0}
                  />
                )}
              </div>
              <Divider />
              <div data-name={SiderTabKeys.ROLLBACK_CONTENT}>
                <Form.Item
                  label={formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.CreateModal.D521A9F8',
                    defaultMessage: '回滚方案',
                  })}
                >
                  <Form.Item
                    name={['parameters', 'generateRollbackPlan']}
                    valuePropName="checked"
                    extra={formatMessage({
                      id: 'src.component.Task.MutipleAsyncTask.CreateModal.DA9F492E',
                      defaultMessage:
                        '可针对 Update、Delete 语句自动生成回滚方案，并以附件形式提供下载，该方案仅供参考',
                    })}
                  >
                    <Checkbox>
                      {formatMessage({
                        id: 'src.component.Task.MutipleAsyncTask.CreateModal.2549497E',
                        defaultMessage: '生成备份回滚方案',
                      })}
                    </Checkbox>
                  </Form.Item>
                  <Form.Item
                    name={['parameters', 'rollbackContentType']}
                    initialValue={SQLContentType.TEXT}
                    noStyle
                  >
                    <Radio.Group
                      onChange={(e) => {
                        handleChange('rollbackContentType', e.target.value);
                      }}
                    >
                      <Radio.Button value={SQLContentType.TEXT}>
                        {formatMessage({
                          id: 'src.component.Task.MutipleAsyncTask.CreateModal.F79FDCAD',
                          defaultMessage: 'SQL录入',
                        })}
                      </Radio.Button>
                      <Radio.Button value={SQLContentType.FILE}>
                        {formatMessage({
                          id: 'src.component.Task.MutipleAsyncTask.CreateModal.447DDBF6',
                          defaultMessage: '上传附件',
                        })}
                      </Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Form.Item>
                <Form.Item
                  name={['parameters', 'rollbackSqlContent']}
                  className={`${styles.sqlContent} ${
                    rollbackContentType !== SQLContentType.TEXT && styles.hide
                  }`}
                  style={{
                    height: '280px',
                  }}
                >
                  <CommonIDE
                    language={'sql'}
                    editorProps={{
                      theme,
                    }}
                    onSQLChange={(sql) => {
                      handleSqlChange('rollbackSqlContent', sql);
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="rollbackSqlFiles"
                  className={rollbackContentType !== SQLContentType.FILE && styles.hide}
                >
                  <ODCDragger
                    ref={rollbackSqlFileRef}
                    accept=".sql"
                    uploadFileOpenAPIName="UploadFile"
                    onBeforeUpload={(file) => {
                      return handleBeforeUpload(file, 'rollbackSqlFiles');
                    }}
                    multiple={true}
                    maxCount={500}
                    action={getAsyncTaskUploadUrl()}
                    headers={{
                      'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN') || '',
                      'Accept-Language': getLocale(),
                      currentOrganizationId: login.organizationId?.toString(),
                    }}
                    onFileChange={(files) => {
                      handleFileChange(files, 'rollbackSqlFiles');
                    }}
                  >
                    <p className={styles.tip}>
                      {formatMessage({
                        id: 'src.component.Task.MutipleAsyncTask.CreateModal.533E6CE4',
                        defaultMessage: '点击或将多个文件拖拽到这里上传',
                      })}
                    </p>
                    <p className={styles.desc}>
                      {formatMessage({
                        id: 'src.component.Task.MutipleAsyncTask.CreateModal.8BE86C8A',
                        defaultMessage: '文件最多不超过 256MB ，支持扩展名 .sql',
                      })}
                    </p>
                  </ODCDragger>
                </Form.Item>
              </div>
              <div data-name={SiderTabKeys.MORE_SETTINGS}>
                <FormItemPanel
                  label={formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.CreateModal.F33367CE',
                    defaultMessage: 'SQL 执行设置',
                  })}
                  keepExpand
                >
                  <Space size={24}>
                    <Form.Item
                      name={['parameters', 'delimiter']}
                      label={formatMessage({
                        id: 'src.component.Task.MutipleAsyncTask.CreateModal.F77A633D',
                        defaultMessage: '分隔符',
                      })}
                      initialValue=";"
                      required
                      rules={[
                        {
                          required: true,
                          message: formatMessage({
                            id: 'src.component.Task.MutipleAsyncTask.CreateModal.FF497D5B',
                            defaultMessage: '请输入分隔符',
                          }),
                        },
                      ]}
                    >
                      <AutoComplete
                        style={{
                          width: 128,
                        }}
                        options={[';', '/', '//', '$', '$$'].map((value) => {
                          return {
                            value,
                          };
                        })}
                      />
                    </Form.Item>
                    <Form.Item
                      name={['parameters', 'queryLimit']}
                      label={formatMessage({
                        id: 'src.component.Task.MutipleAsyncTask.CreateModal.34D62304',
                        defaultMessage: '查询结果限制',
                      })}
                      initialValue={1000}
                      required
                      rules={[
                        {
                          required: true,
                          message: formatMessage({
                            id: 'src.component.Task.MutipleAsyncTask.CreateModal.631AD60F',
                            defaultMessage: '请输入查询结果限制',
                          }),
                        },
                      ]}
                    >
                      <InputNumber style={{ width: 128 }} min={1} max={10000 * 100} />
                    </Form.Item>
                    <Form.Item
                      label={formatMessage({
                        id: 'src.component.Task.MutipleAsyncTask.CreateModal.A1050715',
                        defaultMessage: '执行超时时间',
                      })}
                      required
                    >
                      <Form.Item
                        label={formatMessage({
                          id: 'src.component.Task.MutipleAsyncTask.CreateModal.5B0DDC71',
                          defaultMessage: '小时',
                        })}
                        name={['parameters', 'timeoutMillis']}
                        rules={[
                          {
                            required: true,
                            message: formatMessage({
                              id: 'src.component.Task.MutipleAsyncTask.CreateModal.57804D6A',
                              defaultMessage: '请输入超时时间',
                            }),
                          },
                          {
                            type: 'number',
                            max: 480,
                            message: formatMessage({
                              id: 'src.component.Task.MutipleAsyncTask.CreateModal.50D2F13E',
                              defaultMessage: '最大不超过480小时',
                            }),
                          },
                        ]}
                        initialValue={48}
                        noStyle
                      >
                        <InputNumber style={{ width: 128 }} min={0} precision={1} />
                      </Form.Item>
                      <span className={styles.hour}>
                        {formatMessage({
                          id: 'src.component.Task.MutipleAsyncTask.CreateModal.450BFD6C',
                          defaultMessage: '小时',
                        })}
                      </span>
                    </Form.Item>
                  </Space>
                  <Form.Item
                    label={formatMessage({
                      id: 'src.component.Task.MutipleAsyncTask.CreateModal.D82AF71B',
                      defaultMessage: 'SQL 执行处理',
                    })}
                    name={['parameters', 'errorStrategy']}
                    initialValue={ErrorStrategy.ABORT}
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'src.component.Task.MutipleAsyncTask.CreateModal.C3F2CC4E',
                          defaultMessage: '请选择SQL 执行处理',
                        }),
                      },
                    ]}
                  >
                    <Radio.Group>
                      <Radio value={ErrorStrategy.ABORT}>
                        {formatMessage({
                          id: 'src.component.Task.MutipleAsyncTask.CreateModal.7026E054',
                          defaultMessage: '停止执行',
                        })}
                      </Radio>
                      <Radio value={ErrorStrategy.CONTINUE}>
                        {formatMessage({
                          id: 'src.component.Task.MutipleAsyncTask.CreateModal.6E9057B6',
                          defaultMessage: '忽略错误继续执行',
                        })}
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                </FormItemPanel>
                <FormItemPanel
                  label={formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.CreateModal.024E1E8C',
                    defaultMessage: '任务设置',
                  })}
                  keepExpand
                >
                  <Form.Item
                    label={formatMessage({
                      id: 'src.component.Task.MutipleAsyncTask.CreateModal.8B0566E4',
                      defaultMessage: '执行方式',
                    })}
                    name="executionStrategy"
                    initialValue={TaskExecStrategy.MANUAL}
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'src.component.Task.MutipleAsyncTask.CreateModal.B1EBE15F',
                          defaultMessage: '请选择执行方式',
                        }),
                      },
                    ]}
                  >
                    <Radio.Group>
                      <Radio value={TaskExecStrategy.AUTO}>
                        {formatMessage({
                          id: 'src.component.Task.MutipleAsyncTask.CreateModal.D0E2C00B',
                          defaultMessage: '自动执行',
                        })}
                      </Radio>
                      <Radio value={TaskExecStrategy.MANUAL}>
                        {formatMessage({
                          id: 'src.component.Task.MutipleAsyncTask.CreateModal.A8CB0B6F',
                          defaultMessage: '手动执行',
                        })}
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                  {executionStrategy === TaskExecStrategy.AUTO ? (
                    <Form.Item
                      label={formatMessage({
                        id: 'src.component.Task.MutipleAsyncTask.CreateModal.0BBF7055',
                        defaultMessage: '任务错误处理',
                      })}
                      name={['parameters', 'autoErrorStrategy']}
                      initialValue={ErrorStrategy.ABORT}
                      rules={[
                        {
                          required: true,
                          message: formatMessage({
                            id: 'src.component.Task.MutipleAsyncTask.CreateModal.D2818FDA',
                            defaultMessage: '请选择任务错误处理',
                          }),
                        },
                      ]}
                    >
                      <Radio.Group>
                        <Radio value={ErrorStrategy.ABORT}>
                          {formatMessage({
                            id: 'src.component.Task.MutipleAsyncTask.CreateModal.9115412E',
                            defaultMessage: '终止任务',
                          })}
                        </Radio>
                        <Radio value={ErrorStrategy.CONTINUE}>
                          {formatMessage({
                            id: 'src.component.Task.MutipleAsyncTask.CreateModal.FBD39393',
                            defaultMessage: '忽略错误继续执行下一节点',
                          })}
                        </Radio>
                      </Radio.Group>
                    </Form.Item>
                  ) : (
                    <Form.Item
                      required
                      label={formatMessage({
                        id: 'src.component.Task.MutipleAsyncTask.CreateModal.364DA2E0',
                        defaultMessage: '手动确认超时时间',
                      })}
                      tooltip={formatMessage({
                        id: 'src.component.Task.MutipleAsyncTask.CreateModal.38358F62',
                        defaultMessage: '超时未确认执行后，任务将终止',
                      })}
                    >
                      <Space size={4}>
                        <Form.Item
                          noStyle
                          name={['parameters', 'manualTimeoutMillis']}
                          rules={[
                            {
                              required: true,
                              message: formatMessage({
                                id: 'src.component.Task.MutipleAsyncTask.CreateModal.73A16360',
                                defaultMessage: '请输入手动确认超时时间',
                              }),
                            },
                            {
                              type: 'number',
                              max: 480,
                              message: formatMessage({
                                id: 'src.component.Task.MutipleAsyncTask.CreateModal.61541BB4',
                                defaultMessage: '最大不超过480小时',
                              }),
                            },
                          ]}
                          initialValue={48}
                        >
                          <InputNumber
                            placeholder={formatMessage({
                              id: 'src.component.Task.MutipleAsyncTask.CreateModal.2A98246D',
                              defaultMessage: '请输入',
                            })}
                            style={{ width: 128 }}
                            min={0}
                            precision={1}
                          />
                        </Form.Item>
                        <div>
                          {formatMessage({
                            id: 'src.component.Task.MutipleAsyncTask.CreateModal.40B65A3B',
                            defaultMessage: '小时',
                          })}
                        </div>
                      </Space>
                    </Form.Item>
                  )}
                </FormItemPanel>
                <DescriptionInput />
              </div>
            </Form>
          </div>
          <div className={styles.multipleMenu}>
            <Tabs
              tabBarGutter={0}
              size="small"
              moreIcon={false}
              tabPosition="right"
              items={items}
              activeKey={activeKey}
              onChange={(key) => {
                setActiveKey(key as SiderTabKeys);
                scrollToKey(key);
              }}
            />
          </div>
        </div>
      </Drawer>
    </MultipleAsyncContext.Provider>
  );
};
export default inject('sqlStore', 'taskStore', 'modalStore')(observer(CreateModal));
