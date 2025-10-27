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

import { getDataSourceModeConfig } from '@/common/datasource';
import { runSQLLint } from '@/common/network/sql';
import { createTask, getAsyncTaskUploadUrl } from '@/common/network/task';
import CommonIDE from '@/component/CommonIDE';
import FormItemPanel from '@/component/FormItemPanel';
import ODCDragger from '@/component/OSSDragger2';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import TaskExecutionMethodForm from '@/component/Task/component/TaskExecutionMethodForm';
import { RollbackType, SQLContentType, TaskExecStrategy, TaskPageType, TaskType } from '@/d.ts';
import LintResultTable from '@/page/Workspace/components/SQLResultSet/LintResultTable';
import { openTasksPage } from '@/store/helper/page';
import login from '@/store/login';
import type { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
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
  Space,
  Tooltip,
} from 'antd';
import type { UploadFile } from 'antd/lib/upload/interface';
import Cookies from 'js-cookie';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import DatabaseSelect from '@/component/Task/component/DatabaseSelect';
import styles from './index.less';
import setting from '@/store/setting';
import { rules } from './const';
import { Rule } from 'antd/es/form';
import dayjs from 'dayjs';

const MAX_FILE_SIZE = 1024 * 1024 * 256;
interface IProps {
  sqlStore?: SQLStore;
  taskStore?: TaskStore;
  modalStore?: ModalStore;
  projectId?: number;
  theme?: string;
  reloadList?: () => void;
}
enum ErrorStrategy {
  CONTINUE = 'CONTINUE',
  ABORT = 'ABORT',
}
const getFilesByIds = (ids: string[], names: string[]) => {
  return ids?.map((id, i) => {
    return {
      uid: i,
      name: names[i],
      status: 'done',
      response: {
        data: {
          contents: [
            {
              objectId: id,
            },
          ],
        },
      },
    };
  });
};
const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore, projectId, theme, reloadList } = props;
  const { createAsyncTaskVisible, asyncTaskData } = modalStore;
  const [form] = Form.useForm();
  const editorRef = useRef<CommonIDE>();
  const [sqlContentType, setSqlContentType] = useState(SQLContentType.TEXT);
  const [rollbackContentType, setRollbackContentType] = useState(SQLContentType.TEXT);
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const databaseId = Form.useWatch('databaseId', form);
  const sqlContent = Form.useWatch('sqlContent', form);
  const { database, session } = useDBSession(databaseId);
  const [preCheckLoading, setPreLoading] = useState<boolean>(false);
  const [hasPreCheck, setHasPreCheck] = useState<boolean>(false);
  const [lintResultSet, setLintResultSet] = useState<ISQLLintReuslt[]>([]);
  const [affectedRows, setAffectedRows] = useState<number>();
  const connection = database?.dataSource;
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
  const isRollback = !!asyncTaskData?.type;
  const initSqlContent = isRollback
    ? asyncTaskData?.task?.parameters?.rollbackSqlContent || asyncTaskData?.sql
    : asyncTaskData?.task?.parameters?.sqlContent || asyncTaskData?.sql;
  const initRollbackContent = isRollback ? '' : asyncTaskData?.task?.parameters?.rollbackSqlContent;

  const loadEditData = async () => {
    const { task, type, objectId } = asyncTaskData;
    const { parameters, projectId, database, description, executionStrategy, executionTime } = task;
    const { id: databaseId } = database || {};
    const {
      delimiter,
      queryLimit,
      errorStrategy,
      timeoutMillis,
      sqlObjectIds,
      sqlObjectNames,
      sqlContent,
      rollbackSqlObjectIds,
      rollbackSqlObjectNames,
      rollbackSqlContent,
      generateRollbackPlan,
      retryTimes = 0,
    } = parameters ?? {};
    let sqlContentType = null;
    let rollbackContentType = null;
    if (isRollback) {
      sqlContentType = rollbackSqlObjectIds ? SQLContentType.FILE : SQLContentType.TEXT;
      rollbackContentType = SQLContentType.TEXT;
    } else {
      sqlContentType = sqlObjectIds ? SQLContentType.FILE : SQLContentType.TEXT;
      rollbackContentType = rollbackSqlObjectIds ? SQLContentType.FILE : SQLContentType.TEXT;
    }
    const formData = {
      projectId,
      databaseId,
      description,
      executionStrategy,
      executionTime:
        executionTime && executionTime > new Date().getTime() ? dayjs(executionTime) : null,
      sqlContentType,
      rollbackContentType,
      generateRollbackPlan,
      sqlContent,
      rollbackSqlContent,
      delimiter,
      queryLimit,
      timeoutMillis: timeoutMillis / 1000 / 60 / 60,
      errorStrategy,
      sqlFiles: undefined,
      rollbackSqlFiles: undefined,
      retryTimes,
    };
    if (isRollback) {
      formData.sqlContent = rollbackSqlContent;
      formData.rollbackSqlContent = '';
      if (type === RollbackType.REF) {
        const files = getFilesByIds([objectId], ['rollback-plan-result.sql']);
        formData.sqlContentType = SQLContentType.FILE;
        formData.sqlFiles = files;
      } else {
        if (sqlContentType === SQLContentType.FILE) {
          const files = getFilesByIds(rollbackSqlObjectIds, rollbackSqlObjectNames);
          formData.sqlFiles = files;
        }
      }
    } else {
      if (sqlContentType === SQLContentType.FILE) {
        const files = getFilesByIds(sqlObjectIds, sqlObjectNames);
        formData.sqlFiles = files;
      }
      if (rollbackContentType === SQLContentType.FILE) {
        const files = getFilesByIds(rollbackSqlObjectIds, rollbackSqlObjectNames);
        formData.rollbackSqlFiles = files;
      }
    }
    setSqlContentType(formData.sqlContentType);
    setRollbackContentType(formData.rollbackContentType);
    form.setFieldsValue(formData);
    sqlFileRef.current?.setValue(formData.sqlFiles);
    rollbackSqlFileRef.current?.setValue(formData.rollbackSqlFiles);
  };

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
    form?.setFieldsValue({
      [type]: sql,
    });
    setHasEdit(true);
  };
  const handleFieldsChange = () => {
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
    setAffectedRows(undefined);
    setHasPreCheck(false);
  };
  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.CreateAsyncTaskModal.AreYouSureYouWant.1',
          defaultMessage: '是否确认取消数据库变更？',
        }),
        //确认取消数据库变更吗？
        centered: true,
        onOk: () => {
          modalStore.changeCreateAsyncTaskModal(false);
          hadleReset();
        },
        okText: formatMessage({
          id: 'odc.src.component.Task.AsyncTask.CreateModal.Confirm',
          defaultMessage: '确认',
        }), //'确认'
        cancelText: formatMessage({
          id: 'odc.src.component.Task.AsyncTask.CreateModal.Cancel',
          defaultMessage: '取消',
        }), //'取消'
      });
    } else {
      modalStore.changeCreateAsyncTaskModal(false);
      hadleReset();
    }
  };
  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const {
          databaseId,
          databaseName,
          executionStrategy,
          executionTime,
          sqlContentType,
          rollbackContentType,
          generateRollbackPlan,
          sqlContent,
          sqlFiles,
          rollbackSqlContent,
          rollbackSqlFiles,
          timeoutMillis,
          errorStrategy,
          description,
          queryLimit,
          delimiter,
          retryTimes,
        } = values;
        const sqlFileIdAndNames = getFileIdAndNames(sqlFiles);
        const rollbackSqlFileIdAndNames = getFileIdAndNames(rollbackSqlFiles);
        const parameters = {
          timeoutMillis: timeoutMillis ? timeoutMillis * 60 * 60 * 1000 : undefined,
          errorStrategy,
          sqlContent,
          generateRollbackPlan,
          sqlObjectIds:
            asyncTaskData?.type === RollbackType.REF
              ? [asyncTaskData?.objectId]
              : sqlFileIdAndNames?.ids,
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
          if (asyncTaskData?.type !== RollbackType.REF) {
            delete parameters.sqlObjectIds;
          }
          delete parameters.sqlObjectNames;
        }
        if (rollbackContentType === SQLContentType.FILE) {
          delete parameters.rollbackSqlContent;
        } else {
          delete parameters.rollbackSqlObjectIds;
          delete parameters.rollbackSqlObjectNames;
        }
        const data = {
          projectId,
          databaseId,
          parentFlowInstanceId: asyncTaskData?.parentFlowInstanceId || undefined,
          taskType: TaskType.ASYNC,
          executionStrategy,
          executionTime,
          parameters,
          description,
        };
        if (executionStrategy === TaskExecStrategy.TIMER) {
          data.executionTime = executionTime?.valueOf();
        } else {
          data.executionTime = undefined;
        }
        setConfirmLoading(true);
        const res = await createTask(data);
        handleCancel(false);
        reloadList?.();
        setConfirmLoading(false);
        if (res) {
          openTasksPage(TaskPageType.ASYNC);
        }
      })
      .catch((errorInfo) => {
        form.scrollToField(errorInfo?.errorFields?.[0]?.name);
        console.error(JSON.stringify(errorInfo));
      });
  };
  const preCheck = async () => {
    utils.removeHighlight(editorRef?.current?.editor);
    const { sqlContent, delimiter, databaseId } = await form?.getFieldsValue();
    if (databaseId && sqlContent && session?.sessionId) {
      setLintResultSet([]);
      setAffectedRows(undefined);
      setPreLoading(true);
      setHasPreCheck(false);
      const result = await runSQLLint(session?.sessionId, delimiter, sqlContent);
      setExecuteOrPreCheckSql(sqlContent);
      setSqlChanged(false);
      setHasPreCheck(true);
      setPreLoading(false);
      setLintResultSet(result.checkResults);
      setAffectedRows(result.affectedRows);
    }
  };
  const onEditorAfterCreatedCallback = (editor: IEditor) => {
    editor.onDidChangeCursorPosition(() => {
      utils.removeHighlight(editor);
    });
  };

  const loadInitialDataFromSpaceConfig = () => {
    const initialFormData = {
      queryLimit: Number(setting.spaceConfigurations?.['odc.sqlexecute.default.queryLimit']),
      generateRollbackPlan:
        setting.spaceConfigurations?.['odc.task.default.rollbackPlanEnabled'] === 'true',
      executionStrategy:
        setting.spaceConfigurations?.['odc.task.databaseChange.executionStrategy'] ||
        TaskExecStrategy.MANUAL,
    };
    form.setFieldsValue(initialFormData);
  };

  useEffect(() => {
    if (!createAsyncTaskVisible) return;

    if (asyncTaskData?.task) {
      loadEditData();
    } else {
      loadInitialDataFromSpaceConfig();
    }
    if (asyncTaskData?.rules) {
      if (asyncTaskData?.rules?.length > 0) {
        setLintResultSet(asyncTaskData?.rules);
        setHasPreCheck(true);
      }
    }
    if (asyncTaskData?.sql) {
      setExecuteOrPreCheckSql(asyncTaskData?.sql);
      setSqlChanged(false);
    }
  }, [asyncTaskData, createAsyncTaskVisible]);

  useEffect(() => {
    if (initSqlContent) {
      handleSqlChange('sqlContent', initSqlContent);
    }
  }, [initSqlContent]);
  useEffect(() => {
    form.setFieldsValue({
      databaseId: asyncTaskData?.databaseId,
    });
  }, [asyncTaskData?.databaseId]);

  return (
    <Drawer
      destroyOnClose
      rootClassName={styles.asyncTask}
      width={905}
      title={formatMessage({
        id: 'src.component.Task.AsyncTask.CreateModal.6EEFAEA6',
        defaultMessage: '新建数据库变更',
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
                defaultMessage: '取消',
              })

              /* 取消 */
            }
          </Button>
          <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
            {
              formatMessage({
                id: 'odc.components.CreateAsyncTaskModal.New',
                defaultMessage: '新建',
              })

              /* 新建 */
            }
          </Button>
        </Space>
      }
      open={modalStore.createAsyncTaskVisible}
      onClose={() => {
        handleCancel(hasEdit);
      }}
    >
      <Form
        name="basic"
        initialValues={{
          databaseId: asyncTaskData?.databaseId,
          retryTimes: 0,
        }}
        layout="vertical"
        requiredMark="optional"
        form={form}
        onFieldsChange={handleFieldsChange}
      >
        <DatabaseSelect type={TaskType.ASYNC} projectId={projectId} />
        <Form.Item
          label={formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.SqlContent',
            defaultMessage: 'SQL 内容',
          })}
          /* SQL 内容 */ name="sqlContentType"
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

                /* SQL录入 */ value: SQLContentType.TEXT,
              },
              {
                label: formatMessage({
                  id: 'odc.components.CreateAsyncTaskModal.UploadAttachments',
                  defaultMessage: '上传附件',
                }),

                /* 上传附件 */ value: SQLContentType.FILE,
              },
            ]}
            onChange={(e) => {
              handleChange('sqlContentType', e.target.value);
            }}
          />
        </Form.Item>
        <Form.Item
          name="sqlContent"
          className={`${styles.sqlContent} ${
            sqlContentType !== SQLContentType.TEXT && styles.hide
          }`}
          rules={rules.sqlContent({ required: sqlContentType === SQLContentType.TEXT })}
          style={{
            height: '280px',
          }}
        >
          <CommonIDE
            ref={editorRef}
            initialSQL={initSqlContent}
            language={getDataSourceModeConfig(connection?.type)?.sql?.language}
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
                  id: 'odc.src.component.Task.AsyncTask.CreateModal.PleaseUseSQLToEnter',
                  defaultMessage: '请使用 SQL 录入，上传附件暂不支持 SQL 检查',
                }) //'请使用 SQL 录入，上传附件暂不支持 SQL 检查'
              : ''
          }
        >
          <Button
            style={{
              marginBottom: '12px',
            }}
            onClick={preCheck}
            disabled={
              !session?.sessionId ||
              !databaseId ||
              !sqlContent ||
              sqlContentType === SQLContentType.FILE
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
          <>
            <Alert
              closable
              message={
                formatMessage(
                  {
                    id: 'odc.src.component.Task.AsyncTask.CreateModal.ThePreExaminationIs',
                    defaultMessage: '预检查完成，{lintResultSetLength} 处语句违反 SQL 开发规范。',
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

            <Alert
              closable
              message={formatMessage(
                {
                  id: 'src.component.Task.AsyncTask.CreateModal.4F14EA28',
                  defaultMessage: 'DML语句预估影响行数：{LogicalExpression0}',
                },
                { LogicalExpression0: affectedRows || '-' },
              )}
              type={lintResultSet?.length === 0 ? 'success' : 'warning'}
              showIcon
              style={{
                marginBottom: '8px',
              }}
            />
          </>
        )}

        {lintResultSet?.length > 0 && (
          <LintResultTable
            ctx={editorRef?.current?.editor}
            pageSize={10}
            hasExtraOpt={false}
            lintResultSet={lintResultSet}
            sqlChanged={sqlChanged}
            baseOffset={0}
          />
        )}

        <Divider />
        <Form.Item
          label={formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.RollbackScheme',
            defaultMessage: '回滚方案',
          })}
          /*回滚方案*/
        >
          <Form.Item
            name="generateRollbackPlan"
            valuePropName="checked"
            extra={formatMessage({
              id: 'odc.AsyncTask.CreateModal.TheRollbackSchemeCanBe',
              defaultMessage:
                '可针对 Update、Delete 语句自动生成回滚方案，并以附件形式提供下载，该方案仅供参考',
            })} /*可针对 Update、Delete 语句自动生成回滚方案，并以附件形式提供下载，该方案仅供参考*/
          >
            <Checkbox>
              {
                formatMessage({
                  id: 'odc.AsyncTask.CreateModal.GenerateABackupRollbackScheme',
                  defaultMessage: '生成备份回滚方案',
                }) /*生成备份回滚方案*/
              }
            </Checkbox>
          </Form.Item>
          <Form.Item name="rollbackContentType" initialValue={SQLContentType.TEXT} noStyle>
            <Radio.Group
              options={[
                {
                  label: formatMessage({
                    id: 'odc.components.CreateAsyncTaskModal.SqlEntry',
                    defaultMessage: 'SQL 录入',
                  }),

                  /* SQL录入 */ value: SQLContentType.TEXT,
                },
                {
                  label: formatMessage({
                    id: 'odc.components.CreateAsyncTaskModal.UploadAttachments',
                    defaultMessage: '上传附件',
                  }),

                  /* 上传附件 */ value: SQLContentType.FILE,
                },
              ]}
              onChange={(e) => {
                handleChange('rollbackContentType', e.target.value);
              }}
            />
          </Form.Item>
        </Form.Item>
        <Form.Item
          name="rollbackSqlContent"
          className={`${styles.sqlContent} ${
            rollbackContentType !== SQLContentType.TEXT && styles.hide
          }`}
          style={{
            height: '280px',
          }}
        >
          <CommonIDE
            initialSQL={initRollbackContent}
            language={getDataSourceModeConfig(connection?.type)?.sql?.language}
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
        <Form.Item
          name="delimiter"
          label={formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.Separator',
            defaultMessage: '分隔符',
          })}
          /* 分隔符 */ initialValue=";"
          required
          rules={rules.delimiter}
        >
          <AutoComplete
            style={{
              width: 90,
            }}
            options={[';', '/', '//', '$', '$$'].map((value) => {
              return {
                value,
              };
            })}
          />
        </Form.Item>
        <Form.Item
          name="queryLimit"
          label={formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.QueryResultLimits',
            defaultMessage: '查询结果限制',
          })}
          required
          rules={rules.queryLimit}
        >
          <InputNumber min={1} />
        </Form.Item>
        <FormItemPanel
          label={formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.TaskSettings',
            defaultMessage: '任务设置',
          })}
          /*任务设置*/ keepExpand
        >
          <Form.Item
            label={
              formatMessage({
                id: 'src.component.Task.AsyncTask.CreateModal.4C35F704',
                defaultMessage: 'SQL 重试次数',
              }) /*"SQL 重试次数"*/
            }
            name="retryTimes"
            rules={rules.retryTimes}
          >
            <InputNumber min={0} precision={0} />
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.components.CreateAsyncTaskModal.TaskErrorHandling',
              defaultMessage: '任务错误处理',
            })}
            /* 任务错误处理 */ name="errorStrategy"
            initialValue={ErrorStrategy.ABORT}
            rules={rules.errorStrategy}
          >
            <Radio.Group
              options={[
                {
                  label: formatMessage({
                    id: 'odc.components.CreateAsyncTaskModal.StopATask',
                    defaultMessage: '停止任务',
                  }),

                  /* 停止任务 */ value: ErrorStrategy.ABORT,
                },
                {
                  label: formatMessage({
                    id: 'odc.components.CreateAsyncTaskModal.IgnoreErrorsContinueTasks',
                    defaultMessage: '忽略错误继续任务',
                  }),

                  /* 忽略错误继续任务 */ value: ErrorStrategy.CONTINUE,
                },
              ]}
            />
          </Form.Item>
          <TaskExecutionMethodForm />
        </FormItemPanel>
        <Form.Item
          label={formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.ExecutionTimeout',
            defaultMessage: '执行超时时间',
          })}
          /* 执行超时时间 */ required
        >
          <Form.Item
            label={formatMessage({
              id: 'odc.components.CreateAsyncTaskModal.Hours',
              defaultMessage: '小时',
            })}
            /* 小时 */ name="timeoutMillis"
            rules={rules.timeoutMillis as Rule[]}
            initialValue={48}
            noStyle
          >
            <InputNumber min={0} precision={1} />
          </Form.Item>
          <span className={styles.hour}>
            {
              formatMessage({
                id: 'odc.components.CreateAsyncTaskModal.Hours',
                defaultMessage: '小时',
              })

              /* 小时 */
            }
          </span>
        </Form.Item>
        <DescriptionInput />
      </Form>
    </Drawer>
  );
};
export default inject('sqlStore', 'taskStore', 'modalStore')(observer(CreateModal));
