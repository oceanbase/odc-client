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

import { createTask, getAsyncTaskUploadUrl, getCycleTaskDetail } from '@/common/network/task';
import CommonIDE from '@/component/CommonIDE';
import Crontab from '@/component/Crontab';
import { CrontabDateType, CrontabMode, ICrontab } from '@/component/Crontab/interface';
import FormItemPanel from '@/component/FormItemPanel';
import ODCDragger from '@/component/OSSDragger2';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import {
  ConnectionMode,
  CreateTaskRecord,
  ISqlPlayJobParameters,
  SQLContentType,
  TaskExecStrategy,
  TaskOperationType,
  TaskPageScope,
  TaskPageType,
  TaskStatus,
  TaskType,
} from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import login from '@/store/login';
import type { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
import { formatMessage } from '@/util/intl';
import { getLocale } from '@umijs/max';
import {
  AutoComplete,
  Button,
  Drawer,
  Form,
  InputNumber,
  message,
  Modal,
  Radio,
  Space,
} from 'antd';
import type { UploadFile } from 'antd/lib/upload/interface';
import Cookies from 'js-cookie';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import DatabaseSelect from '../../component/DatabaseSelect';
import styles from './index.less';
const MAX_FILE_SIZE = 1024 * 1024 * 256;

interface IProps {
  modalStore?: ModalStore;
  projectId?: number;
  theme?: string;
}

enum ErrorStrategy {
  CONTINUE = 'CONTINUE',
  ABORT = 'ABORT',
}

const defaultValue = {
  sqlContentType: SQLContentType.TEXT,
  delimiter: ';',
  queryLimit: 1000,
  timeoutMillis: 48,
  errorStrategy: ErrorStrategy.ABORT,
  allowConcurrent: false,
};

const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore, projectId, theme } = props;
  const [sqlContentType, setSqlContentType] = useState(SQLContentType.TEXT);
  const [formData, setFormData] = useState(null);
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [crontab, setCrontab] = useState(null);
  const [form] = Form.useForm();
  const databaseId = Form.useWatch('databaseId', form);
  const { database } = useDBSession(databaseId);
  const connection = database?.dataSource;
  const crontabRef = useRef<{
    setValue: (value: ICrontab) => void;
    resetFields: () => void;
  }>();

  const { createSQLPlanVisible, SQLPlanEditId } = modalStore;
  const isMySQL = connection?.dialectType === ConnectionMode.OB_MYSQL;
  const isEdit = !!SQLPlanEditId;
  const isInitContent = isEdit ? isEdit && formData : true;
  const loadEditData = async (editId: number) => {
    const data = await getCycleTaskDetail<ISqlPlayJobParameters>(editId);
    const {
      jobParameters,
      triggerConfig: { triggerStrategy, cronExpression, hours, days },
      ...rest
    } = data;
    const sqlContentType = jobParameters?.sqlObjectIds ? SQLContentType.FILE : SQLContentType.TEXT;
    const formData = {
      ...rest,
      ...jobParameters,
      sqlContentType,
      sqlFiles: undefined,
      timeoutMillis: jobParameters.timeoutMillis / 1000 / 60 / 60,
    };

    if (sqlContentType === SQLContentType.FILE) {
      const sqlFiles = jobParameters?.sqlObjectIds?.map((id, i) => {
        return {
          uid: i,
          name: jobParameters?.sqlObjectNames[i],
          status: 'done',
          response: {
            data: {
              contents: [{ objectId: id }],
            },
          },
        };
      });
      formData.sqlFiles = sqlFiles;
    }
    setSqlContentType(sqlContentType);
    setFormData(formData);
    form.setFieldsValue(formData);
    crontabRef.current?.setValue({
      mode: triggerStrategy === TaskExecStrategy.CRON ? CrontabMode.custom : CrontabMode.default,
      dateType: triggerStrategy as any,
      cronString: cronExpression,
      hour: hours,
      dayOfMonth: days,
      dayOfWeek: days,
    });
  };

  useEffect(() => {
    if (SQLPlanEditId) {
      loadEditData(SQLPlanEditId);
    }
  }, [SQLPlanEditId]);

  const setFormStatus = (fieldName: string, errorMessage: string) => {
    form.setFields([
      {
        name: [fieldName],
        errors: errorMessage ? [errorMessage] : [],
      },
    ]);
  };

  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.CreateSQLPlanTaskModal.AreYouSureYouWant',
        }),
        //确认取消此 SQL 计划吗？
        centered: true,
        onOk: () => {
          props.modalStore.changeCreateSQLPlanTaskModal(false);
        },
      });
    } else {
      props.modalStore.changeCreateSQLPlanTaskModal(false);
    }
  };

  const handleCrontabChange = (crontab) => {
    setCrontab(crontab);
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

  const checkFileSizeAmount = (files: UploadFile[]) => {
    const fileSizeAmount = files?.reduce((prev, current) => {
      return prev + current.size;
    }, 0);
    if (fileSizeAmount > MAX_FILE_SIZE) {
      /**
       * 校验文件总大小
       */
      message.warn(
        formatMessage({
          id: 'odc.components.CreateSQLPlanTaskModal.UpToMbOfFiles',
        }),
        //文件最多不超过 256MB
      );
      return false;
    }
    return true;
  };

  const handleCreate = async (data: Partial<CreateTaskRecord>) => {
    const res = await createTask(data);
    handleCancel(false);
    setConfirmLoading(false);
    if (res) {
      openTasksPage(TaskPageType.SQL_PLAN, TaskPageScope.CREATED_BY_CURRENT_USER);
    }
  };

  const handleEditAndConfirm = async (data: Partial<CreateTaskRecord>) => {
    Modal.confirm({
      title: formatMessage({
        id: 'odc.components.CreateSQLPlanTaskModal.AreYouSureYouWant.1',
      }),
      //确认要修改此 SQL 计划吗？
      content: (
        <>
          <div>
            {
              formatMessage({
                id: 'odc.components.CreateSQLPlanTaskModal.EditSqlPlan',
              })
              /*编辑 SQL 计划*/
            }
          </div>
          <div>
            {
              formatMessage({
                id: 'odc.components.CreateSQLPlanTaskModal.TheTaskNeedsToBe',
              })
              /*任务需要重新审批，审批通过后此任务将重新执行*/
            }
          </div>
        </>
      ),

      cancelText: formatMessage({
        id: 'odc.components.CreateSQLPlanTaskModal.Cancel',
      }),
      //取消
      okText: formatMessage({ id: 'odc.components.CreateSQLPlanTaskModal.Ok' }), //确定
      centered: true,
      onOk: () => {
        handleCreate(data);
      },
      onCancel: () => {
        setConfirmLoading(false);
      },
    });
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const {
          databaseId,
          sqlContentType,
          sqlContent,
          sqlFiles,
          timeoutMillis,
          queryLimit,
          delimiter,
          errorStrategy,
          allowConcurrent,
          description,
        } = values;
        const sqlFileIdAndNames = getFileIdAndNames(sqlFiles);
        const { mode, dateType, cronString, hour, dayOfMonth, dayOfWeek } = crontab;
        const parameters = {
          taskId: SQLPlanEditId,
          type: TaskType.SQL_PLAN,
          operationType: isEdit ? TaskOperationType.UPDATE : TaskOperationType.CREATE,
          allowConcurrent,
          scheduleTaskParameters: {
            timeoutMillis: timeoutMillis ? timeoutMillis * 60 * 60 * 1000 : undefined,
            errorStrategy,
            sqlContent,
            sqlObjectIds: sqlFileIdAndNames?.ids,
            sqlObjectNames: sqlFileIdAndNames?.names,
            queryLimit,
            delimiter,
          },

          triggerConfig: {
            triggerStrategy: mode === 'custom' ? 'CRON' : dateType,
            days: dateType === CrontabDateType.weekly ? dayOfWeek : dayOfMonth,
            hours: hour,
            cronExpression: cronString,
          },
        };

        if (!checkFileSizeAmount(sqlFiles)) {
          return;
        }
        if (sqlContentType === SQLContentType.FILE) {
          delete parameters.scheduleTaskParameters.sqlContent;
          if (sqlFiles?.some((item) => item?.error?.isLimit)) {
            setFormStatus(
              'sqlFiles',
              formatMessage({
                id: 'odc.components.CreateSQLPlanTaskModal.UpToMbOfFiles',
              }),
              //文件最多不超过 256MB
            );
            return;
          }

          if (!sqlFileIdAndNames?.size || sqlFileIdAndNames?.size !== sqlFiles?.length) {
            setFormStatus(
              'sqlFiles',
              formatMessage({
                id: 'odc.components.CreateSQLPlanTaskModal.PleaseUploadTheSqlFile',
              }),
              //请上传 SQL 文件
            );
            return;
          }
        } else {
          delete parameters.scheduleTaskParameters.sqlObjectIds;
          delete parameters.scheduleTaskParameters.sqlObjectNames;
        }

        const data = {
          projectId,
          databaseId,
          taskType: TaskType.ALTER_SCHEDULE,
          parameters,
          description,
        };

        setConfirmLoading(true);
        if (!isEdit) {
          delete parameters.taskId;
        }
        if (isEdit && formData?.status !== TaskStatus.PAUSE) {
          handleEditAndConfirm(data);
        } else {
          handleCreate(data);
        }
      })
      .catch((errorInfo) => {
        console.error(JSON.stringify(errorInfo));
      });
  };

  const handleContentTypeChange = (e) => {
    setSqlContentType(e.target.value);
  };

  const handleSqlChange = (sql: string) => {
    form?.setFieldsValue({
      sqlContent: sql,
    });

    setHasEdit(true);
  };

  const handleFieldsChange = () => {
    setHasEdit(true);
  };

  const handleBeforeUpload = (file) => {
    const isLt20M = MAX_FILE_SIZE > file.size;
    if (!isLt20M) {
      setTimeout(() => {
        setFormStatus(
          'sqlFiles',
          formatMessage({
            id: 'odc.components.CreateSQLPlanTaskModal.UpToMbOfFiles',
          }),
          //文件最多不超过 256MB
        );
      }, 0);
    }
    return isLt20M;
  };

  const handleFileChange = (files: UploadFile[]) => {
    form?.setFieldsValue({
      sqlFiles: files,
    });

    if (files.some((item) => item?.error?.isLimit)) {
      setFormStatus(
        'sqlFiles',
        formatMessage({
          id: 'odc.components.CreateSQLPlanTaskModal.UpToMbOfFiles',
        }),
        //文件最多不超过 256MB
      );
    } else {
      setFormStatus('sqlFiles', '');
    }
  };

  const draggerProps = {
    accept: '.sql',
    uploadFileOpenAPIName: 'UploadFile',
    onBeforeUpload: handleBeforeUpload,
    multiple: true,
    tip: formatMessage({
      id: 'odc.components.CreateSQLPlanTaskModal.YouCanDragAndDrop',
    }),
    //支持拖拽文件上传，任务将按文件排列的先后顺序执行
    maxCount: 500,
    action: getAsyncTaskUploadUrl(),
    headers: {
      'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN') || '',
      'Accept-Language': getLocale(),
      currentOrganizationId: login.organizationId?.toString(),
    },

    defaultFileList: formData?.sqlFiles,
    onFileChange: handleFileChange,
  };

  const handleReset = () => {
    setFormData(null);
    setSqlContentType(SQLContentType.TEXT);
    form?.resetFields();
    crontabRef.current?.resetFields();
  };

  useEffect(() => {
    if (!createSQLPlanVisible) {
      handleReset();
    }
  }, [createSQLPlanVisible]);

  return (
    <Drawer
      destroyOnClose
      className={styles['sql-plan']}
      width={720}
      title={
        isEdit
          ? formatMessage({
              id: 'odc.components.CreateSQLPlanTaskModal.EditSqlPlan',
            })
          : //编辑 SQL 计划
            formatMessage({
              id: 'odc.components.CreateSQLPlanTaskModal.CreateAnSqlPlan',
            })
        //新建 SQL 计划
      }
      footer={
        <Space>
          <Button
            onClick={() => {
              handleCancel(hasEdit);
            }}
          >
            {
              formatMessage({
                id: 'odc.components.CreateSQLPlanTaskModal.Cancel',
              })
              /*取消*/
            }
          </Button>
          <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
            {
              isEdit
                ? formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.Save',
                  })
                : //保存
                  formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.Create',
                  })
              //新建
            }
          </Button>
        </Space>
      }
      visible={createSQLPlanVisible}
      onClose={() => {
        handleCancel(hasEdit);
      }}
    >
      <Form
        form={form}
        name="basic"
        layout="vertical"
        requiredMark="optional"
        initialValues={defaultValue}
        onFieldsChange={handleFieldsChange}
      >
        <DatabaseSelect projectId={projectId} />
        <Form.Item
          label={formatMessage({
            id: 'odc.components.CreateSQLPlanTaskModal.SqlContent',
          })}
          /*SQL 内容*/
          name="sqlContentType"
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.components.CreateSQLPlanTaskModal.SelectSqlContent',
              }),
              //请选择 SQL 内容
            },
          ]}
        >
          <Radio.Group onChange={handleContentTypeChange}>
            <Radio.Button value={SQLContentType.TEXT}>
              {
                formatMessage({
                  id: 'odc.components.CreateSQLPlanTaskModal.SqlEntry',
                })
                /*SQL录入*/
              }
            </Radio.Button>
            <Radio.Button value={SQLContentType.FILE}>
              {
                formatMessage({
                  id: 'odc.components.CreateSQLPlanTaskModal.UploadAnAttachment',
                })
                /*上传附件*/
              }
            </Radio.Button>
          </Radio.Group>
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
                id: 'odc.components.CreateSQLPlanTaskModal.EnterTheSqlContent',
              }),
              //请填写 SQL 内容
            },
          ]}
          style={{ height: '280px' }}
        >
          {isInitContent && (
            <CommonIDE
              initialSQL={formData?.sqlContent}
              language={`${isMySQL ? 'obmysql' : 'oboracle'}`}
              editorProps={{
                theme,
              }}
              onSQLChange={handleSqlChange}
            />
          )}
        </Form.Item>
        <Form.Item
          name="sqlFiles"
          className={sqlContentType !== SQLContentType.FILE && styles.hide}
        >
          {isInitContent && (
            <ODCDragger {...draggerProps}>
              <p className={styles.tip}>
                {
                  formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.ClickOrDragMultipleFiles',
                  })
                  /*点击或将多个文件拖拽到这里上传*/
                }
              </p>
              <p className={styles.desc}>
                {
                  formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.TheFileCanBeUp',
                  })
                  /*文件最多不超过 256MB ，支持扩展名 .sql*/
                }
              </p>
            </ODCDragger>
          )}
        </Form.Item>
        <Space size={24}>
          <Form.Item
            name="delimiter"
            label={formatMessage({
              id: 'odc.components.CreateSQLPlanTaskModal.Separator',
            })}
            /*分隔符*/
            required
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.components.CreateSQLPlanTaskModal.EnterADelimiter',
                }),
                //请输入分隔符
              },
            ]}
          >
            <AutoComplete
              style={{ width: 90 }}
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
              id: 'odc.components.CreateSQLPlanTaskModal.QueryResultLimits',
            })}
            /*查询结果限制*/
            required
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.components.CreateSQLPlanTaskModal.PleaseEnterTheQueryResult',
                }),
                //请输入查询结果限制
              },
            ]}
          >
            <InputNumber min={1} max={10000 * 100} />
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.components.CreateSQLPlanTaskModal.ExecutionTimeout',
            })}
            /*执行超时时间*/ required
          >
            <Form.Item
              label={formatMessage({
                id: 'odc.components.CreateSQLPlanTaskModal.Hours',
              })}
              /*小时*/
              name="timeoutMillis"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.EnterATimeoutPeriod',
                  }),
                  //请输入超时时间
                },
                {
                  type: 'number',
                  max: 480,
                  message: formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.UpToHours',
                  }),
                  //最大不超过480小时
                },
              ]}
              noStyle
            >
              <InputNumber min={0} />
            </Form.Item>
            <span className={styles.hour}>
              {
                formatMessage({
                  id: 'odc.components.CreateSQLPlanTaskModal.Hours',
                })
                /*小时*/
              }
            </span>
          </Form.Item>
        </Space>
        <Form.Item>
          <Crontab ref={crontabRef} initialValue={crontab} onValueChange={handleCrontabChange} />
        </Form.Item>
        <FormItemPanel
          label={formatMessage({
            id: 'odc.components.CreateSQLPlanTaskModal.TaskSettings',
          })}
          /*任务设置*/ keepExpand
        >
          <Form.Item
            label={formatMessage({
              id: 'odc.components.CreateSQLPlanTaskModal.TaskErrorHandling',
            })}
            /*任务错误处理*/
            name="errorStrategy"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.components.CreateSQLPlanTaskModal.SelectTaskErrorHandling',
                }),
                //请选择任务错误处理
              },
            ]}
          >
            <Radio.Group>
              <Radio value={ErrorStrategy.ABORT}>
                {
                  formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.StopATask',
                  })
                  /*停止任务*/
                }
              </Radio>
              <Radio value={ErrorStrategy.CONTINUE}>
                {
                  formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.IgnoreErrorsToContinueThe',
                  })
                  /*忽略错误继续任务*/
                }
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.components.CreateSQLPlanTaskModal.TaskExecutionDurationHypercycleProcessing',
            })} /*任务执行时长超周期处理*/
            name="allowConcurrent"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.components.CreateSQLPlanTaskModal.PleaseSelectTaskExecutionDuration',
                }), //请选择任务执行时长超周期处理
              },
            ]}
          >
            <Radio.Group>
              <Radio value={false}>
                {
                  formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.AfterTheCurrentTaskIs',
                  }) /*待当前任务执行完毕在新周期发起任务*/
                }
              </Radio>
              <Radio value={true}>
                {
                  formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.IgnoreTheCurrentTaskStatus',
                  }) /*忽略当前任务状态，定期发起新任务*/
                }
              </Radio>
            </Radio.Group>
          </Form.Item>
        </FormItemPanel>
        <DescriptionInput />
      </Form>
    </Drawer>
  );
};

export default inject('modalStore')(observer(CreateModal));
