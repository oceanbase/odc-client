import { getDataSourceModeConfig } from '@/common/datasource';
import { listProjects } from '@/common/network/project';
import { runMultipleSQLLint } from '@/common/network/sql';
import { createTask, getAsyncTaskUploadUrl } from '@/common/network/task';
import CommonIDE from '@/component/CommonIDE';
import ODCDragger from '@/component/OSSDragger2';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import {
  ConnectType,
  IConnection,
  SQLContentType,
  TaskExecStrategy,
  TaskPageType,
  TaskType,
} from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import MultipleLintResultTable from '@/page/Workspace/components/SQLResultSet/MultipleAsyncSQLLintTable';
import { openTasksPage } from '@/store/helper/page';
import login from '@/store/login';
import utils, { IEditor } from '@/util/editor';
import { formatMessage } from '@/util/intl';
import { getLocale } from '@umijs/max';
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Drawer,
  Form,
  message,
  Modal,
  Radio,
  Tabs,
  Tooltip,
} from 'antd';
import type { UploadFile } from 'antd/lib/upload/interface';
import Cookies from 'js-cookie';
import { merge, throttle } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import DatabaseQueue from './DatabaseQueue';
import DrawerFooter from './DrawerFooter';
import { IProps, items, SiderTabKeys } from './helper';
import { flatArray } from '@/util/utils';
import styles from './index.less';
import MoreSetting from './MoreSetting';
import { MultipleAsyncContext } from './MultipleAsyncContext';
import ProjectSelect from './ProjectSelect';
import setting from '@/store/setting';
import { rules } from '../const';
import dayjs from 'dayjs';

const MAX_FILE_SIZE = 1024 * 1024 * 256;

const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore, theme } = props;
  const { multipleAsyncTaskData, multipleDatabaseChangeOpen } = modalStore;
  const [form] = Form.useForm();
  const editorRef = useRef<CommonIDE>();
  const scrollSwitcher = useRef<Boolean>(true);
  const formBoxRef = React.createRef<HTMLDivElement>();
  const [activeKey, setActiveKey] = useState<SiderTabKeys>(SiderTabKeys.SELECT_DATABASE);

  const [sqlContentType, setSqlContentType] = useState(SQLContentType.TEXT);
  const [rollbackContentType, setRollbackContentType] = useState(SQLContentType.TEXT);
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [projectOptions, setProjectOptions] = useState<
    {
      label: string;
      value: number;
    }[]
  >([]);
  const [projectMap, setProjectMap] = useState<Record<number, string>>({});
  const [defaultDatasource, setDefaultDatasource] = useState<IConnection>();
  const _projectId = Form.useWatch<number>('projectId', form);
  const sqlContent = Form.useWatch<string>(['parameters', 'sqlContent'], form);
  const orderedDatabaseIds = Form.useWatch<number[][]>(['parameters', 'orderedDatabaseIds'], form);
  const [preCheckLoading, setPreLoading] = useState<boolean>(false);
  const [hasPreCheck, setHasPreCheck] = useState<boolean>(false);
  const [lintResultSet, setLintResultSet] = useState<
    {
      checkResult: ISQLLintReuslt;
      database: IDatabase;
    }[]
  >([]);
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

  const isRollback = !!multipleAsyncTaskData?.task?.parameters?.parentJobType;
  const initSqlContent = isRollback
    ? multipleAsyncTaskData?.task?.parameters?.rollbackSqlContent
    : multipleAsyncTaskData?.task?.parameters?.sqlContent;
  const initRollbackContent = isRollback
    ? ''
    : multipleAsyncTaskData?.task?.parameters?.rollbackSqlContent;

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
    if (!scrollSwitcher.current || !formBoxRef.current) {
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
          defaultMessage: '文件最多不超过 256 MB',
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
            defaultMessage: '文件最多不超过 256 MB',
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
          defaultMessage: '文件最多不超过 256 MB',
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
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.C3F6AD52',
          defaultMessage: '确认取消多库变更吗？',
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
    const databaseIds = flatArray(orderedDatabaseIds);
    if (databaseIds?.length < 2) {
      return form.setFields([
        {
          name: ['parameters', 'orderedDatabaseIds'],
          errors: [
            formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.CreateModal.51536A7D',
              defaultMessage: '至少共需要2个数据库',
            }),
          ],
        },
      ]);
    }
    form
      .validateFields()
      .then(async (values) => {
        const {
          executionStrategy,
          executionTime,
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
                defaultMessage: '文件最多不超过 256 MB',
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
                defaultMessage: '请上传 SQL 文件',
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
          executionTime,
        };
        if (executionStrategy === TaskExecStrategy.TIMER) {
          data.executionTime = executionTime?.valueOf();
        } else {
          data.executionTime = undefined;
        }
        setConfirmLoading(true);
        const res = await createTask(data);
        handleCancel(false);
        setConfirmLoading(false);
        if (res) {
          message.success(
            formatMessage({
              id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.E7B4AE89',
              defaultMessage: '创建成功',
            }),
          );
          openTasksPage(TaskPageType.MULTIPLE_ASYNC);
          modalStore.changeMultiDatabaseChangeModal(false);
        }
      })
      .catch((errorInfo) => {
        form.scrollToField(errorInfo?.errorFields?.[0]?.name);
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
  const getInitialValue = () => {
    const defaultFormData = {
      projectId: undefined,
      executionStrategy: TaskExecStrategy.MANUAL,
      executionTime: undefined,
      retryTimes: 0,
      parameters: {
        orderedDatabaseIds: [[undefined]],
        queryLimit: Number(setting.getSpaceConfigByKey('odc.sqlexecute.default.queryLimit')),
        generateRollbackPlan:
          multipleAsyncTaskData?.task?.parameters?.generateRollbackPlan ||
          setting.getSpaceConfigByKey('odc.task.default.rollbackPlanEnabled') === 'true',
      },
    };
    if (multipleAsyncTaskData?.task) {
      const { parameters, description, executionStrategy, rollbackable } =
        multipleAsyncTaskData?.task;
      return merge(defaultFormData, {
        projectId: parameters?.projectId,
        executionStrategy,
        retryTimes: parameters?.retryTimes,
        executionTime:
          multipleAsyncTaskData?.task?.executionTime && new Date().getTime()
            ? dayjs(multipleAsyncTaskData?.task?.executionTime)
            : null,
        parameters: {
          orderedDatabaseIds: parameters?.orderedDatabaseIds?.length
            ? parameters?.orderedDatabaseIds
            : [[undefined]],
          delimiter: parameters?.delimiter,
          timeoutMillis: parameters?.timeoutMillis / 1000 / 60 / 60,
          errorStrategy: parameters?.errorStrategy,
          autoErrorStrategy: parameters?.autoErrorStrategy,
          manualTimeoutMillis: parameters?.timeoutMillis / 1000 / 60 / 60,
        },
        description,
      });
    }
    if (multipleAsyncTaskData?.projectId) {
      return merge(defaultFormData, {
        projectId: multipleAsyncTaskData?.projectId,
        parameters: {
          orderedDatabaseIds: multipleAsyncTaskData?.orderedDatabaseIds,
        },
      });
    }
    return defaultFormData;
  };
  const initData = async () => {
    if (multipleDatabaseChangeOpen) {
      await loadProjectOptions();
      form.setFieldsValue(getInitialValue());
    } else {
      form.resetFields();
    }
  };
  const loadProjectOptions = async () => {
    const response = await listProjects(undefined, undefined, Number.MAX_SAFE_INTEGER, undefined);
    if (response?.contents?.length) {
      const projectOptions = response?.contents?.map(({ name, id, currentUserResourceRoles }) => ({
        label: name,
        value: id,
      }));
      const rawProjectMap = response?.contents?.reduce((pre, cur) => {
        pre[cur?.id] = cur?.name;
        return pre;
      }, {});
      setProjectMap(rawProjectMap);
      setProjectOptions(projectOptions);
    }
  };
  useLayoutEffect(() => {
    if (multipleDatabaseChangeOpen) {
      initData();
    } else {
      modalStore.changeMultiDatabaseChangeModal(false);
    }
  }, [multipleAsyncTaskData, multipleDatabaseChangeOpen]);
  useEffect(() => {
    if (multipleDatabaseChangeOpen) {
      loadProjectOptions();
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

  useEffect(() => {
    if (initSqlContent) {
      handleSqlChange('sqlContent', initSqlContent);
    }
  }, [initSqlContent]);

  return (
    <MultipleAsyncContext.Provider
      value={{
        projectId: _projectId,
        projectMap,
      }}
    >
      <Drawer
        destroyOnClose
        rootClassName={styles.asyncTask}
        width={905}
        title={formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.493673D9',
          defaultMessage: '新建多库变更工单',
        })}
        footer={
          <DrawerFooter
            confirmLoading={confirmLoading}
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
            hasEdit={false}
          />
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
              layout="vertical"
              requiredMark="optional"
              form={form}
              onFieldsChange={handleFieldsChange}
            >
              <div data-name={SiderTabKeys.SELECT_DATABASE}>
                <ProjectSelect projectOptions={projectOptions} />
                <DatabaseQueue
                  multipleDatabaseChangeOpen={multipleDatabaseChangeOpen}
                  setDefaultDatasource={setDefaultDatasource}
                />
              </div>
              <div data-name={SiderTabKeys.SQL_CONTENT}>
                <Form.Item
                  label={formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.CreateModal.1DFE930F',
                    defaultMessage: 'SQL 内容',
                  })}
                  name="sqlContentType"
                  initialValue={SQLContentType.TEXT}
                  rules={rules.sqlContentType}
                >
                  <Radio.Group
                    options={[
                      {
                        label: formatMessage({
                          id: 'odc.components.CreateAsyncTaskModal.SqlEntry',
                          defaultMessage: 'SQL 录入',
                        }),
                        value: SQLContentType.TEXT,
                      },
                      {
                        label: formatMessage({
                          id: 'odc.components.CreateAsyncTaskModal.UploadAttachments',
                          defaultMessage: '上传附件',
                        }),
                        value: SQLContentType.FILE,
                      },
                    ]}
                    optionType="button"
                    onChange={(e) => handleChange('sqlContentType', e.target.value)}
                  />
                </Form.Item>
                <Form.Item
                  name={['parameters', 'sqlContent']}
                  className={`${styles.sqlContent} ${
                    sqlContentType !== SQLContentType.TEXT && styles.hide
                  }`}
                  rules={rules['parameters-sqlContent']({
                    required: sqlContentType === SQLContentType.TEXT,
                  })}
                  style={{
                    height: '280px',
                  }}
                >
                  <CommonIDE
                    ref={editorRef}
                    initialSQL={initSqlContent}
                    language={
                      getDataSourceModeConfig(defaultDatasource?.type || ConnectType.OB_MYSQL)?.sql
                        ?.language
                    }
                    editorProps={{
                      theme,
                    }}
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
                      defaultMessage: '支持拖拽文件上传，任务将按文件排列的先后顺序执行',
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
                          defaultMessage: '点击或将多个文件拖拽到这里上传',
                        })
                        /*点击或将多个文件拖拽到这里上传*/
                      }
                    </p>
                    <p className={styles.desc}>
                      {
                        formatMessage({
                          id: 'odc.components.CreateAsyncTaskModal.TheMaximumSizeOfThe.2',
                          defaultMessage: '文件最多不超过 256 MB ，支持扩展名 .sql',
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
                            defaultMessage: '检查中',
                          }) //'检查中'
                        : formatMessage({
                            id: 'odc.src.component.Task.AsyncTask.CreateModal.SQLCheck',
                            defaultMessage: 'SQL 检查',
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
                          defaultMessage:
                            '预检查完成，{lintResultSetLength} 处语句违反 SQL 开发规范。',
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
                      options={[
                        {
                          label: formatMessage({
                            id: 'src.component.Task.MutipleAsyncTask.CreateModal.F79FDCAD',
                            defaultMessage: 'SQL 录入',
                          }),
                          value: SQLContentType.TEXT,
                        },
                        {
                          label: formatMessage({
                            id: 'src.component.Task.MutipleAsyncTask.CreateModal.447DDBF6',
                            defaultMessage: '上传附件',
                          }),
                          value: SQLContentType.FILE,
                        },
                      ]}
                      optionType="button"
                      onChange={(e) => handleChange('rollbackContentType', e.target.value)}
                    />
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
                    initialSQL={initRollbackContent}
                    language={
                      getDataSourceModeConfig(defaultDatasource?.type || ConnectType.OB_MYSQL)?.sql
                        ?.language
                    }
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
                <MoreSetting />
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
