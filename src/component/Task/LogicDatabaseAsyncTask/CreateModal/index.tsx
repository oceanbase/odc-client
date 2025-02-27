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
import { createTask } from '@/common/network/task';
import CommonIDE from '@/component/CommonIDE';
import FormItemPanel from '@/component/FormItemPanel';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import { SQLContentType, TaskExecStrategy, TaskPageScope, TaskPageType, TaskType } from '@/d.ts';
import type { ModalStore } from '@/store/modal';
import type { SQLStore } from '@/store/sql';
import type { TaskStore } from '@/store/task';
import utils, { IEditor } from '@/util/editor';
import { formatMessage } from '@/util/intl';
import { FieldTimeOutlined } from '@ant-design/icons';
import { disabledDate, disabledTime } from '@/util/utils';
import { ICycleTaskTriggerConfig, TaskOperationType } from '@/d.ts';
import {
  Alert,
  AutoComplete,
  Button,
  DatePicker,
  Drawer,
  Form,
  InputNumber,
  message,
  Modal,
  Radio,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import DatabaseSelect from '../../component/DatabaseSelect';
import styles from './index.less';
import PreviewSQLDrawer from './PreviewSQLDrawer';
import { openTasksPage } from '@/store/helper/page';

interface IProps {
  sqlStore?: SQLStore;
  taskStore?: TaskStore;
  modalStore?: ModalStore;
  projectId?: number;
  theme?: string;
}

const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore, projectId, theme } = props;
  const { logicDatabaseInfo } = modalStore;
  const task = logicDatabaseInfo?.task;
  const [form] = Form.useForm();
  const editorRef = useRef<CommonIDE>();
  const [sqlContentType, setSqlContentType] = useState(SQLContentType.TEXT);
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const databaseId = Form.useWatch('databaseId', form);
  const sqlContent = Form.useWatch('sqlContent', form);
  const initialSQL = logicDatabaseInfo?.ddl;
  const delimiter = Form.useWatch('delimiter', form);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const loadEditData = async (task) => {
    const {
      jobParameters,
      description,
      triggerConfig: { triggerStrategy, startAt },
    } = task;
    const { databaseId, delimiter, sqlContent, timeoutMillis } = jobParameters;
    const formData = {
      startAt: undefined,
      databaseId,
      description,
      delimiter,
      sqlContent,
      timeoutMillis: timeoutMillis / 1000 / 60 / 60,
      triggerStrategy,
    };
    if (triggerStrategy === TaskExecStrategy.START_AT) {
      formData.startAt = moment(startAt);
    }
    form.setFieldsValue(formData);
  };

  useEffect(() => {
    if (logicDatabaseInfo?.ddl) {
      form?.setFieldValue('sqlContent', logicDatabaseInfo?.ddl);
      form?.setFieldValue('databaseId', logicDatabaseInfo?.databaseId);
    }
  }, [logicDatabaseInfo?.ddl]);

  const handleSqlChange = (type: 'sqlContent', sql: string) => {
    form?.setFieldsValue({
      [type]: sql,
    });
    setHasEdit(true);
  };
  const handleFieldsChange = () => {
    setHasEdit(true);
  };

  const hadleReset = () => {
    form.resetFields(null);
    setSqlContentType(SQLContentType.TEXT);
    setHasEdit(false);
  };

  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({
          id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.0C94A1FF',
          defaultMessage: '确认取消逻辑库变更吗？',
        }),
        centered: true,
        onOk: () => {
          modalStore.changeLogicialDatabaseModal(false);
          hadleReset();
        },
        okText: formatMessage({
          id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.CA071ACE',
          defaultMessage: '确认',
        }),
        cancelText: formatMessage({
          id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.4421F0D6',
          defaultMessage: '取消',
        }),
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
          sqlContent,
          timeoutMillis,
          errorStrategy,
          description,
          delimiter,
          triggerStrategy,
          startAt,
        } = values;
        const parameters = {
          type: TaskType.LOGICAL_DATABASE_CHANGE,
          operationType: TaskOperationType.CREATE,
          scheduleTaskParameters: {
            timeoutMillis: timeoutMillis ? timeoutMillis * 60 * 60 * 1000 : undefined,
            errorStrategy,
            sqlContent,
            delimiter,
            databaseId,
          },
          triggerConfig: {
            triggerStrategy,
          } as ICycleTaskTriggerConfig,
        };
        if (triggerStrategy === TaskExecStrategy.START_AT) {
          parameters.triggerConfig = {
            triggerStrategy: TaskExecStrategy.START_AT,
            startAt: startAt?.valueOf(),
          };
        }
        const data = {
          databaseId,
          taskType: TaskType.ALTER_SCHEDULE,
          parameters,
          description,
        };
        setConfirmLoading(true);
        await createTask(data);
        handleCancel(false);
        setConfirmLoading(false);
        message.success(
          formatMessage({
            id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.E7B4AE89',
            defaultMessage: '创建成功',
          }),
        );
        openTasksPage(TaskPageType.LOGICAL_DATABASE_CHANGE, TaskPageScope.CREATED_BY_CURRENT_USER);
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
      return formatMessage({
        id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.170CC893',
        defaultMessage: '未输入SQL，无可预览内容',
      });
    }
    if (!databaseId) {
      return formatMessage({
        id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.76DCD3C0',
        defaultMessage: '未选择逻辑库，无可预览内容',
      });
    }
    if (!delimiter) {
      return formatMessage({
        id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.F1374DF3',
        defaultMessage: '未选择分隔符，无可预览内容',
      });
    }
    return null;
  };

  useEffect(() => {
    if (task) {
      loadEditData(task);
    }
  }, [task]);

  return (
    <>
      <Drawer
        destroyOnClose
        className={styles.asyncTask}
        width={905}
        title={formatMessage({
          id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.6CD30B75',
          defaultMessage: '新建逻辑库变更',
        })}
        footer={
          <Space>
            <Button
              onClick={() => {
                handleCancel(hasEdit);
              }}
            >
              {formatMessage({
                id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.77329812',
                defaultMessage: '取消',
              })}
            </Button>
            <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
              {formatMessage({
                id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.12C8523B',
                defaultMessage: '新建',
              })}
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
          message={formatMessage({
            id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.435C79D4',
            defaultMessage: '逻辑库变更仅支持 DDL 语句，多条 SQL 将依次在所有实际数据库上执行。',
          })}
        />

        <Form
          name="basic"
          initialValues={{
            triggerStrategy: TaskExecStrategy.START_NOW,
            databaseId: logicDatabaseInfo?.databaseId,
          }}
          layout="vertical"
          requiredMark="optional"
          form={form}
          onFieldsChange={handleFieldsChange}
        >
          <DatabaseSelect
            isLogicalDatabase
            label={formatMessage({
              id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.9398BE2A',
              defaultMessage: '逻辑库',
            })}
            type={TaskType.ALTER_SCHEDULE}
          />

          <Form.Item
            label={formatMessage({
              id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.844AC838',
              defaultMessage: 'SQL 内容',
            })}
            required
          >
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
                    message: formatMessage({
                      id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.FED011D0',
                      defaultMessage: '请选择 SQL 内容',
                    }),
                  },
                ]}
              >
                <Radio.Group>
                  <Radio.Button value={SQLContentType.TEXT}>
                    {formatMessage({
                      id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.0A3EB502',
                      defaultMessage: 'SQL录入',
                    })}
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Tooltip placement="left" title={getPreveiwSqlTooltip()}>
                <Button
                  type="link"
                  disabled={!sqlContent || !databaseId || !delimiter}
                  onClick={oepnPreviewModal}
                >
                  {formatMessage({
                    id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.DE2BB1F6',
                    defaultMessage: '预览实际 SQL',
                  })}
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
                message: formatMessage({
                  id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.FD315879',
                  defaultMessage: '请填写 SQL 内容',
                }),
              },
            ]}
            style={{
              height: '280px',
              paddingTop: 8,
            }}
          >
            <CommonIDE
              ref={editorRef}
              initialSQL={initialSQL}
              language={'sql'}
              onEditorAfterCreatedCallback={onEditorAfterCreatedCallback}
              onSQLChange={(sql) => {
                handleSqlChange('sqlContent', sql);
              }}
              placeholder={
                '使用逻辑表表达式需要在表达式上加上`号，如：`db_[00-31].test_[00-31]`,否则将无法识别逻辑表拓扑'
              }
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
              label={formatMessage({
                id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.03CE0FA3',
                defaultMessage: '分隔符',
              })}
              initialValue=";"
              required
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.3AA56015',
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
          </div>
          <FormItemPanel
            label={formatMessage({
              id: 'odc.component.DataMockerDrawer.form.TaskSettings',
              defaultMessage: '任务设置',
            })}
            /*任务设置*/ keepExpand
          >
            <Form.Item
              label={formatMessage({
                id: 'odc.DataClearTask.CreateModal.ExecutionMethod',
                defaultMessage: '执行方式',
              })}
              /*执行方式*/ name="triggerStrategy"
              required
            >
              <Radio.Group>
                <Radio.Button value={TaskExecStrategy.START_NOW}>
                  {
                    formatMessage({
                      id: 'odc.DataClearTask.CreateModal.ExecuteNow',
                      defaultMessage: '立即执行',
                    }) /*立即执行*/
                  }
                </Radio.Button>
                <Radio.Button value={TaskExecStrategy.START_AT}>
                  {
                    formatMessage({
                      id: 'odc.DataClearTask.CreateModal.ScheduledExecution',
                      defaultMessage: '定时执行',
                    }) /*定时执行*/
                  }
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue }) => {
                const triggerStrategy = getFieldValue('triggerStrategy') || [];
                if (triggerStrategy === TaskExecStrategy.START_AT) {
                  return (
                    <Form.Item
                      name="startAt"
                      label={formatMessage({
                        id: 'odc.DataArchiveTask.CreateModal.ExecutionTime',
                        defaultMessage: '执行时间',
                      })}
                      /*执行时间*/ required
                    >
                      <DatePicker
                        showTime
                        suffixIcon={<FieldTimeOutlined />}
                        disabledDate={disabledDate}
                        disabledTime={disabledTime}
                      />
                    </Form.Item>
                  );
                }
                return null;
              }}
            </Form.Item>
          </FormItemPanel>
          <Form.Item
            label={formatMessage({
              id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.64467306',
              defaultMessage: '执行超时时间',
            })}
            required
          >
            <Form.Item
              label={formatMessage({
                id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.4899307D',
                defaultMessage: '小时',
              })}
              name="timeoutMillis"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.5AF8C707',
                    defaultMessage: '请输入超时时间',
                  }),
                },
                {
                  type: 'number',
                  max: 480,
                  message: formatMessage({
                    id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.7BAA8D0E',
                    defaultMessage: '最大不超过480小时',
                  }),
                },
              ]}
              initialValue={48}
              noStyle
            >
              <InputNumber min={0} precision={1} />
            </Form.Item>
            <span className={styles.hour}>
              {formatMessage({
                id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.CD58DA91',
                defaultMessage: '小时',
              })}
            </span>
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
