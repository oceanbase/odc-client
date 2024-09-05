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
import { createTask, getAsyncTaskUploadUrl } from '@/common/network/task';
import CommonIDE from '@/component/CommonIDE';
import FormItemPanel from '@/component/FormItemPanel';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import TaskTimer from '@/component/Task/component/TimerSelect';
import { SQLContentType, TaskExecStrategy, TaskPageScope, TaskPageType, TaskType } from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import type { SQLStore } from '@/store/sql';
import type { TaskStore } from '@/store/task';
import utils, { IEditor } from '@/util/editor';
import { formatMessage } from '@/util/intl';
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
import { inject, observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import DatabaseSelect from '../../component/DatabaseSelect';
import styles from './index.less';
import PreviewSQLDrawer from './PreviewSQLDrawer';

interface IProps {
  sqlStore?: SQLStore;
  taskStore?: TaskStore;
  modalStore?: ModalStore;
  projectId?: number;
  theme?: string;
}

const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore, projectId, theme } = props;
  const { asyncTaskData, logicDatabaseInfo } = modalStore;
  const [form] = Form.useForm();
  const editorRef = useRef<CommonIDE>();
  const [sqlContentType, setSqlContentType] = useState(SQLContentType.TEXT);
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const databaseId = Form.useWatch('databaseId', form);
  const sqlContent = Form.useWatch('sqlContent', form);
  const delimiter = Form.useWatch('delimiter', form);

  const [executeOrPreCheckSql, setExecuteOrPreCheckSql] = useState<string>();
  const [sqlChanged, setSqlChanged] = useState<boolean>(false);
  const initSqlContent =
    asyncTaskData?.task?.parameters?.sqlContent || asyncTaskData?.sql || logicDatabaseInfo?.ddl;
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const loadEditData = async () => {
    const { task, type, objectId } = asyncTaskData;
    const {
      parameters,
      projectId,
      database: { id: databaseId },
      description,
      executionStrategy,
    } = task;
    const { delimiter, queryLimit, errorStrategy, timeoutMillis, sqlContent } = parameters ?? {};
    let sqlContentType = null;
    const formData = {
      projectId,
      databaseId,
      description,
      executionStrategy,
      sqlContentType,
      sqlContent,
      delimiter,
      queryLimit,
      timeoutMillis: timeoutMillis / 1000 / 60 / 60,
      errorStrategy,
    };
    setSqlContentType(formData.sqlContentType);
    form.setFieldsValue(formData);
  };

  const handleSqlChange = (type: 'sqlContent', sql: string) => {
    form?.setFieldsValue({
      [type]: sql,
    });
    setHasEdit(true);
  };
  const handleFieldsChange = () => {
    setHasEdit(true);
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
    setHasEdit(false);
  };

  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: '确认取消逻辑库变更吗？',
        centered: true,
        onOk: () => {
          modalStore.changeLogicialDatabaseModal(false);
          hadleReset();
        },
        okText: '确认',
        cancelText: '取消',
      });
    } else {
      modalStore.changeLogicialDatabaseModal(false);
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
          sqlContent,
          timeoutMillis,
          errorStrategy,
          description,
          queryLimit,
          delimiter,
        } = values;
        const parameters = {
          timeoutMillis: timeoutMillis ? timeoutMillis * 60 * 60 * 1000 : undefined,
          errorStrategy,
          sqlContent,
          queryLimit,
          delimiter,
          type: TaskType.LOGICAL_DATABASE_CHANGE,
        };
        const data = {
          projectId,
          databaseId,
          parentFlowInstanceId: asyncTaskData?.task ? asyncTaskData?.task?.id : undefined,
          taskType: TaskType.ALTER_SCHEDULE,
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
        setConfirmLoading(false);
        if (res) {
          openTasksPage(TaskPageType.ASYNC, TaskPageScope.CREATED_BY_CURRENT_USER);
        }
      })
      .catch((errorInfo) => {
        console.error(JSON.stringify(errorInfo));
      });
  };

  const onEditorAfterCreatedCallback = (editor: IEditor) => {
    editor.onDidChangeCursorPosition(() => {
      utils.removeHighlight(editor);
    });
  };
  const oepnPreviewModal = async () => {
    setPreviewOpen(true);
  };

  const getPreveiwSqlTooltip = () => {
    if (!sqlContent) {
      return '未输入SQL，无可预览内容';
    }
    if (!databaseId) {
      return '未选择逻辑库，无可预览内容';
    }
    if (!delimiter) {
      return '未选择分隔符，无可预览内容';
    }
    return null;
  };

  useEffect(() => {
    if (asyncTaskData?.task) {
      loadEditData();
    }
    if (asyncTaskData?.rules) {
      // if (asyncTaskData?.rules?.length > 0) {
      //   setLintResultSet(asyncTaskData?.rules);
      //   setHasPreCheck(true);
      // }
    }
    if (asyncTaskData?.sql) {
      setExecuteOrPreCheckSql(asyncTaskData?.sql);
      setSqlChanged(false);
    }
  }, [asyncTaskData]);
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
    <>
      <Drawer
        destroyOnClose
        className={styles.asyncTask}
        width={905}
        title={'新建逻辑库变更'}
        footer={
          <Space>
            <Button
              onClick={() => {
                handleCancel(hasEdit);
              }}
            >
              取消
            </Button>
            <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
              新建
            </Button>
          </Space>
        }
        open={modalStore.logicDatabaseVisible}
        onClose={() => {
          handleCancel(hasEdit);
        }}
      >
        <Alert
          type="info"
          showIcon
          message="逻辑库变更仅支持 DDL 语句，多条 SQL 将依次在所有实际数据库上执行。"
        />
        <Form
          name="basic"
          initialValues={{
            executionStrategy: TaskExecStrategy.AUTO,
            databaseId: asyncTaskData?.databaseId || logicDatabaseInfo?.databaseId,
          }}
          layout="vertical"
          requiredMark="optional"
          form={form}
          onFieldsChange={handleFieldsChange}
        >
          <DatabaseSelect
            isLogicalDatabase
            label={'逻辑库'}
            type={TaskType.ALTER_SCHEDULE}
            projectId={logicDatabaseInfo?.projectId}
          />
          <Form.Item label="SQL 内容" required>
            <div
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
              }}
            >
              <Form.Item
                noStyle
                style={{
                  display: 'block',
                }}
                name="sqlContentType"
                initialValue={SQLContentType.TEXT}
                rules={[
                  {
                    required: true,
                    message: '请选择 SQL 内容',
                  },
                ]}
              >
                <Radio.Group>
                  <Radio.Button value={SQLContentType.TEXT}>SQL录入</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Tooltip placement="left" title={getPreveiwSqlTooltip()}>
                <Button
                  type="link"
                  disabled={!sqlContent || !databaseId || !delimiter}
                  onClick={oepnPreviewModal}
                >
                  预览实际 SQL
                </Button>
              </Tooltip>
            </div>
          </Form.Item>
          <Form.Item
            name="sqlContent"
            className={`${styles.sqlContent} ${
              sqlContentType !== SQLContentType.TEXT && styles.hide
            }`}
            rules={[
              {
                required: sqlContentType === SQLContentType.TEXT,
                message: '请填写 SQL 内容',
              },
            ]}
            style={{
              height: '280px',
            }}
          >
            <CommonIDE
              ref={editorRef}
              initialSQL={initSqlContent}
              // TODO: 逻辑库直接获取方言类型
              language={'sql'}
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
          <div
            style={{
              display: 'flex',
              columnGap: '24px',
            }}
          >
            <Form.Item
              name="delimiter"
              label="分隔符"
              initialValue=";"
              required
              rules={[
                {
                  required: true,
                  message: '请输入分隔符',
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
          </div>
          <FormItemPanel
            label={formatMessage({
              id: 'odc.component.DataMockerDrawer.form.TaskSettings',
              defaultMessage: '任务设置',
            })}
            /*任务设置*/ keepExpand
          >
            <TaskTimer />
          </FormItemPanel>
          <Form.Item label="执行超时时间" required>
            <Form.Item
              label="小时"
              name="timeoutMillis"
              rules={[
                {
                  required: true,
                  message: '请输入超时时间',
                },
                {
                  type: 'number',
                  max: 480,
                  message: '最大不超过480小时',
                },
              ]}
              initialValue={48}
              noStyle
            >
              <InputNumber min={0} precision={1} />
            </Form.Item>
            <span className={styles.hour}>小时</span>
          </Form.Item>
          <DescriptionInput />
        </Form>
      </Drawer>
      <PreviewSQLDrawer
        sqlContent={sqlContent}
        open={previewOpen}
        delimiter={delimiter}
        setOpen={setPreviewOpen}
        databaseId={databaseId}
      />
    </>
  );
};
export default inject('sqlStore', 'taskStore', 'modalStore')(observer(CreateModal));
