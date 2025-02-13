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
import { createTask, getAsyncTaskUploadUrl, getCycleTaskDetail } from '@/common/network/task';
import CommonIDE from '@/component/CommonIDE';
import Crontab from '@/component/Crontab';
import { CrontabDateType, CrontabMode, ICrontab } from '@/component/Crontab/interface';
import FormItemPanel from '@/component/FormItemPanel';
import ODCDragger from '@/component/OSSDragger2';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import {
  CreateTaskRecord,
  ISqlPlayJobParameters,
  SQLContentType,
  TaskExecStrategy,
  TaskOperationType,
  TaskPageScope,
  TaskPageType,
  TaskStatus,
  TaskType,
  CycleTaskDetail,
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
  Spin,
} from 'antd';
import type { UploadFile } from 'antd/lib/upload/interface';
import Cookies from 'js-cookie';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import DatabaseSelect from '../../component/DatabaseSelect';
import { useRequest } from 'ahooks';
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

  const { createSQLPlanVisible, sqlPlanData } = modalStore;
  const SQLPlanEditId = sqlPlanData?.id;
  const taskId = sqlPlanData?.taskId;
  const isEdit = !!SQLPlanEditId || !!taskId;
  const isInitContent = isEdit ? isEdit && formData : true;
  const { run: fetchCycleTaskDetail, loading } = useRequest(getCycleTaskDetail, { manual: true });

  const loadEditData = async (editId: number) => {
    const data = (await fetchCycleTaskDetail(editId)) as CycleTaskDetail<ISqlPlayJobParameters>;

    const {
      jobParameters,
      triggerConfig: { triggerStrategy, cronExpression, hours, days },
      database: { id: databaseId },
      ...rest
    } = data;
    const sqlContentType = jobParameters?.sqlObjectIds ? SQLContentType.FILE : SQLContentType.TEXT;
    const formData = {
      ...rest,
      ...jobParameters,
      databaseId,
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
    if (SQLPlanEditId || taskId) {
      loadEditData(SQLPlanEditId || taskId);
    }
  }, [SQLPlanEditId, taskId]);

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
          defaultMessage: '是否确认取消此 SQL 计划？',
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
      message.warning(
        formatMessage({
          id: 'odc.components.CreateSQLPlanTaskModal.UpToMbOfFiles',
          defaultMessage: '文件最多不超过 256 MB',
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
        defaultMessage: '是否确认修改此 SQL 计划？',
      }),
      //确认要修改此 SQL 计划吗？
      content: (
        <>
          <div>
            {
              formatMessage({
                id: 'odc.components.CreateSQLPlanTaskModal.EditSqlPlan',
                defaultMessage: '编辑 SQL 计划',
              })
              /*编辑 SQL 计划*/
            }
          </div>
          <div>
            {
              formatMessage({
                id: 'odc.components.CreateSQLPlanTaskModal.TheTaskNeedsToBe',
                defaultMessage: '任务需要重新审批，审批通过后此任务将重新执行',
              })
              /*任务需要重新审批，审批通过后此任务将重新执行*/
            }
          </div>
        </>
      ),

      cancelText: formatMessage({
        id: 'odc.components.CreateSQLPlanTaskModal.Cancel',
        defaultMessage: '取消',
      }),
      //取消
      okText: formatMessage({
        id: 'odc.components.CreateSQLPlanTaskModal.Ok',
        defaultMessage: '确定',
      }), //确定
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
          operationType:
            isEdit && SQLPlanEditId ? TaskOperationType.UPDATE : TaskOperationType.CREATE,
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
                id: 'odc.components.CreateSQLPlanTaskModal.PleaseUploadTheSqlFile',
                defaultMessage: '请上传 SQL 文件',
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
        if (!isEdit && SQLPlanEditId) {
          delete parameters.taskId;
        }
        if (isEdit && formData?.status !== TaskStatus.PAUSE && SQLPlanEditId) {
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
            defaultMessage: '文件最多不超过 256 MB',
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
          defaultMessage: '文件最多不超过 256 MB',
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
      defaultMessage: '支持拖拽文件上传，任务将按文件排列的先后顺序执行',
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
    setCrontab(null);
  };

  useEffect(() => {
    if (!createSQLPlanVisible) {
      handleReset();
    }
  }, [createSQLPlanVisible]);

  useEffect(() => {
    const databaseId = sqlPlanData?.databaseId;
    if (databaseId) {
      form.setFieldsValue({
        databaseId,
      });
    }
  }, [sqlPlanData?.databaseId]);

  return (
    <Drawer
      destroyOnClose
      className={styles['sql-plan']}
      width={720}
      title={
        isEdit && SQLPlanEditId
          ? formatMessage({
              id: 'odc.components.CreateSQLPlanTaskModal.EditSqlPlan',
              defaultMessage: '编辑 SQL 计划',
            })
          : //编辑 SQL 计划
            formatMessage({
              id: 'odc.components.CreateSQLPlanTaskModal.CreateAnSqlPlan',
              defaultMessage: '新建 SQL 计划',
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
                defaultMessage: '取消',
              })
              /*取消*/
            }
          </Button>
          <Button type="primary" loading={confirmLoading || loading} onClick={handleSubmit}>
            {
              isEdit && SQLPlanEditId
                ? formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.Save',
                    defaultMessage: '保存',
                  })
                : //保存
                  formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.Create',
                    defaultMessage: '新建',
                  })
              //新建
            }
          </Button>
        </Space>
      }
      open={createSQLPlanVisible}
      onClose={() => {
        handleCancel(hasEdit);
      }}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          name="basic"
          layout="vertical"
          requiredMark="optional"
          initialValues={defaultValue}
          onFieldsChange={handleFieldsChange}
        >
          <DatabaseSelect
            disabled={isEdit && !!SQLPlanEditId}
            type={TaskType.SQL_PLAN}
            projectId={projectId}
          />
          <Form.Item
            label={formatMessage({
              id: 'odc.components.CreateSQLPlanTaskModal.SqlContent',
              defaultMessage: 'SQL 内容',
            })}
            /*SQL 内容*/
            name="sqlContentType"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.components.CreateSQLPlanTaskModal.SelectSqlContent',
                  defaultMessage: '请选择 SQL 内容',
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
                    defaultMessage: 'SQL 录入',
                  })
                  /*SQL录入*/
                }
              </Radio.Button>
              <Radio.Button value={SQLContentType.FILE}>
                {
                  formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.UploadAnAttachment',
                    defaultMessage: '上传附件',
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
                  defaultMessage: '请填写 SQL 内容',
                }),
                //请填写 SQL 内容
              },
            ]}
            style={{ height: '280px' }}
          >
            {isInitContent && (
              <CommonIDE
                initialSQL={formData?.sqlContent}
                language={getDataSourceModeConfig(connection?.type)?.sql?.language}
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
                      defaultMessage: '点击或将多个文件拖拽到这里上传',
                    })
                    /*点击或将多个文件拖拽到这里上传*/
                  }
                </p>
                <p className={styles.desc}>
                  {
                    formatMessage({
                      id: 'odc.components.CreateSQLPlanTaskModal.TheFileCanBeUp',
                      defaultMessage: '文件最多不超过 256 MB ，支持扩展名 .sql',
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
                defaultMessage: '分隔符',
              })}
              /*分隔符*/
              required
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.EnterADelimiter',
                    defaultMessage: '请输入分隔符',
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
                defaultMessage: '查询结果限制',
              })}
              /*查询结果限制*/
              required
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.PleaseEnterTheQueryResult',
                    defaultMessage: '请输入查询结果限制',
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
                defaultMessage: '执行超时时间',
              })}
              /*执行超时时间*/ required
            >
              <Form.Item
                label={formatMessage({
                  id: 'odc.components.CreateSQLPlanTaskModal.Hours',
                  defaultMessage: '小时',
                })}
                /*小时*/
                name="timeoutMillis"
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'odc.components.CreateSQLPlanTaskModal.EnterATimeoutPeriod',
                      defaultMessage: '请输入超时时间',
                    }),
                    //请输入超时时间
                  },
                  {
                    type: 'number',
                    max: 480,
                    message: formatMessage({
                      id: 'odc.components.CreateSQLPlanTaskModal.UpToHours',
                      defaultMessage: '最大不超过 480 小时',
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
                    defaultMessage: '小时',
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
              defaultMessage: '任务设置',
            })}
            /*任务设置*/ keepExpand
          >
            <Form.Item
              label={formatMessage({
                id: 'odc.components.CreateSQLPlanTaskModal.TaskErrorHandling',
                defaultMessage: '任务错误处理',
              })}
              /*任务错误处理*/
              name="errorStrategy"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.SelectTaskErrorHandling',
                    defaultMessage: '请选择任务错误处理',
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
                      defaultMessage: '停止任务',
                    })
                    /*停止任务*/
                  }
                </Radio>
                <Radio value={ErrorStrategy.CONTINUE}>
                  {
                    formatMessage({
                      id: 'odc.components.CreateSQLPlanTaskModal.IgnoreErrorsToContinueThe',
                      defaultMessage: '忽略错误继续任务',
                    })
                    /*忽略错误继续任务*/
                  }
                </Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label={formatMessage({
                id: 'odc.components.CreateSQLPlanTaskModal.TaskExecutionDurationHypercycleProcessing',
                defaultMessage: '任务执行时长超周期处理',
              })} /*任务执行时长超周期处理*/
              name="allowConcurrent"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.components.CreateSQLPlanTaskModal.PleaseSelectTaskExecutionDuration',
                    defaultMessage: '请选择任务执行时长超周期处理',
                  }), //请选择任务执行时长超周期处理
                },
              ]}
            >
              <Radio.Group>
                <Radio value={false}>
                  {
                    formatMessage({
                      id: 'odc.components.CreateSQLPlanTaskModal.AfterTheCurrentTaskIs',
                      defaultMessage: '待当前任务执行完毕在新周期发起任务',
                    }) /*待当前任务执行完毕在新周期发起任务*/
                  }
                </Radio>
                <Radio value={true}>
                  {
                    formatMessage({
                      id: 'odc.components.CreateSQLPlanTaskModal.IgnoreTheCurrentTaskStatus',
                      defaultMessage: '忽略当前任务状态，定期发起新任务',
                    }) /*忽略当前任务状态，定期发起新任务*/
                  }
                </Radio>
              </Radio.Group>
            </Form.Item>
          </FormItemPanel>
          <DescriptionInput />
        </Form>
      </Spin>
    </Drawer>
  );
};

export default inject('modalStore')(observer(CreateModal));
