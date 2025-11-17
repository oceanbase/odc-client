import { getDataSourceModeConfig } from '@/common/datasource';
import { getAsyncTaskUploadUrl } from '@/common/network/task';
import CommonIDE from '@/component/CommonIDE';
import { CrontabDateType, CrontabMode, ICrontab } from '@/component/Crontab/interface';
import { validateCrontabInterval } from '@/util/schedule';
import FormItemPanel from '@/component/FormItemPanel';
import ODCDragger from '@/component/OSSDragger2';
import { SQLContentType, TaskExecStrategy } from '@/d.ts';
import login from '@/store/login';
import { CreateScheduleContext } from '@/component/Schedule/context/createScheduleContext';
import { useDBSession } from '@/store/sessionManager/hooks';
import { formatMessage } from '@/util/intl';
import { getLocale } from '@umijs/max';
import { openSchedulesPage } from '@/store/helper/page';
import { AutoComplete, Button, Form, InputNumber, message, Modal, Radio, Space, Spin } from 'antd';
import type { UploadFile } from 'antd/lib/upload/interface';
import Cookies from 'js-cookie';
import { inject, observer } from 'mobx-react';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import DatabaseSelect from '@/component/Task/component/DatabaseSelect';
import { useRequest } from 'ahooks';
import styles from './index.less';
import setting from '@/store/setting';
import { rules } from './const';
import { Rule } from '@@node_modules/antd/es/form';
import AnchorContainer from '@/component/AnchorContainer';
import { history } from '@umijs/max';
import { ScheduleStore } from '@/store/schedule';
import CreateTaskConfirmModal from '@/component/Task/component/CreateTaskConfirmModal';
import { createSchedule, updateSchedule } from '@/common/network/schedule';
import { getScheduleDetail } from '@/common/network/schedule';
import { getInitScheduleName } from '@/component/Task/component/CreateTaskConfirmModal/helper';
const MAX_FILE_SIZE = 1024 * 1024 * 256;
import dayjs from 'dayjs';
import {
  IScheduleRecord,
  ScheduleType,
  createScheduleRecord,
  createSqlPlanParameters,
  ISqlPlanParameters,
  SchedulePageType,
} from '@/d.ts/schedule';
import { SchedulePageMode } from '@/component/Schedule/interface';
import { PageStore } from '@/store/page';
import SchduleExecutionMethodForm from '@/component/Schedule/components/SchduleExecutionMethodForm';

enum ErrorStrategy {
  CONTINUE = 'CONTINUE',
  ABORT = 'ABORT',
}

const defaultValue = {
  sqlContentType: SQLContentType.TEXT,
  delimiter: ';',
  timeoutMillis: 48,
  errorStrategy: ErrorStrategy.ABORT,
  allowConcurrent: false,
  triggerStrategy: TaskExecStrategy.TIMER,
};
interface IProps {
  scheduleStore?: ScheduleStore;
  pageStore?: PageStore;
  projectId?: number;
  theme?: string;
  mode?: SchedulePageMode;
}
const Create: React.FC<IProps> = ({ scheduleStore, pageStore, projectId, theme, mode }) => {
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
  const { createScheduleDatabase, setCreateScheduleDatabase } =
    useContext(CreateScheduleContext) || {};
  const [open, setOpen] = useState<boolean>(false);
  const { sqlPlanData } = scheduleStore;
  const SQLPlanEditId = sqlPlanData?.id;
  const isEdit = !!SQLPlanEditId && sqlPlanData?.type === 'EDIT';
  const { run: fetchScheduleDetail, loading } = useRequest(getScheduleDetail, { manual: true });

  const isInitContent = useMemo(() => {
    if (isEdit) {
      return !!formData;
    } else if (sqlPlanData?.type === 'RETRY') {
      return !!formData;
    }
    return true;
  }, [isEdit, sqlPlanData?.type, formData]);

  const loadEditData = async (editId: number) => {
    const dataRes = (await fetchScheduleDetail(editId)) as IScheduleRecord<ISqlPlanParameters>;
    setCreateScheduleDatabase(dataRes?.parameters?.databaseInfo);
    const { parameters, allowConcurrent, triggerConfig, ...rest } = dataRes;
    const { triggerStrategy, cronExpression, hours, days, startAt } = triggerConfig ?? {};
    const sqlContentType = parameters?.sqlObjectIds ? SQLContentType.FILE : SQLContentType.TEXT;
    const formData = {
      ...rest,
      ...parameters,
      allowConcurrent,
      triggerStrategy,
      startAt: null,
      sqlContentType,
      sqlFiles: undefined,
      timeoutMillis: parameters.timeoutMillis / 1000 / 60 / 60,
    };

    if (sqlContentType === SQLContentType.FILE) {
      const sqlFiles = parameters?.sqlObjectIds?.map((id, i) => {
        return {
          uid: i,
          name: parameters?.sqlObjectNames[i],
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
    if (![TaskExecStrategy.START_NOW, TaskExecStrategy.START_AT].includes(triggerStrategy)) {
      formData.triggerStrategy = TaskExecStrategy.TIMER;
      const crontab = {
        mode: triggerStrategy === TaskExecStrategy.CRON ? CrontabMode.custom : CrontabMode.default,
        dateType: triggerStrategy as any,
        cronString: cronExpression,
        hour: hours,
        dayOfMonth: days,
        dayOfWeek: days,
      };
      crontabRef?.current?.setValue(crontab);
    }
    if (triggerStrategy === TaskExecStrategy.START_AT) {
      formData.startAt = startAt ? dayjs(startAt) : dayjs().add(1, 'hour');
    }
    setSqlContentType(sqlContentType);
    setFormData(formData);
    form.setFieldsValue(formData);
  };

  const loadInitialDataFromSpaceConfig = () => {
    form.setFieldValue(
      'queryLimit',
      Number(setting.spaceConfigurations?.['odc.sqlexecute.default.queryLimit']),
    );
  };

  useEffect(() => {
    const databaseId = sqlPlanData?.databaseId;
    if (databaseId) {
      form.setFieldsValue({
        databaseId,
      });
    }

    if (SQLPlanEditId) {
      loadEditData(SQLPlanEditId);
    } else {
      loadInitialDataFromSpaceConfig();
    }

    return () => {
      handleReset();
    };
  }, []);

  const setFormStatus = (fieldName: string, errorMessage: string) => {
    form.setFields([
      {
        name: [fieldName],
        errors: errorMessage ? [errorMessage] : [],
      },
    ]);
  };

  const handleCancel = async (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.CreateSQLPlanTaskModal.AreYouSureYouWant',
          defaultMessage: '是否确认取消此 SQL 计划？',
        }),
        //确认取消此 SQL 计划吗？
        centered: true,
        onOk: async () => {
          scheduleStore.setSQLPlanData(false);
          if (mode === SchedulePageMode.MULTI_PAGE) {
            await pageStore?.close?.(pageStore.activePageKey);
            await openSchedulesPage(SchedulePageType.SQL_PLAN);
          } else {
            history.back();
          }
        },
      });
    } else {
      scheduleStore.setSQLPlanData(false);
      if (mode === SchedulePageMode.MULTI_PAGE) {
        await pageStore?.close?.(pageStore.activePageKey);
        openSchedulesPage(SchedulePageType.SQL_PLAN);
      } else {
        history.back();
      }
    }
  };

  const handleCrontabChange = (crontab) => {
    setCrontab(crontab);
    validateCrontabInterval(crontab, form, 'crontab');
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

  const handleCreate = async (data: Partial<createScheduleRecord<createSqlPlanParameters>>) => {
    const res = await createSchedule(data);
    setCreateScheduleDatabase(undefined);
    handleCancel(false);
    setConfirmLoading(false);
    if (res.data) {
      message.success(
        formatMessage({
          id: 'src.component.Schedule.modals.SQLPlan.Create.09C29955',
          defaultMessage: '新建成功',
        }),
      );
    }
  };

  const handleEdit = async (data: Partial<createScheduleRecord<createSqlPlanParameters>>) => {
    data.id = SQLPlanEditId;
    const res = await updateSchedule(data);
    setConfirmLoading(false);
    if (res?.data) {
      handleCancel(false);
      message.success(
        formatMessage({
          id: 'src.component.Schedule.modals.SQLPlan.Create.92181F4F',
          defaultMessage: '修改成功',
        }),
      );
    }
  };

  const handleEditAndConfirm = async (
    data: Partial<createScheduleRecord<createSqlPlanParameters>>,
  ) => {
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
            {login.isPrivateSpace()
              ? formatMessage({
                  id: 'src.component.Schedule.modals.SQLPlan.Create.0B0E6068',
                  defaultMessage: '提交后此作业将自动启动',
                })
              : formatMessage({
                  id: 'src.component.Schedule.modals.SQLPlan.Create.97060AA0',
                  defaultMessage: '作业需要重新审批，审批通过后此作业将自动启用',
                })}
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
        handleEdit(data);
      },
      onCancel: () => {
        setConfirmLoading(false);
      },
    });
  };

  const handleSubmit = async (scheduleName?: string) => {
    // 校验 crontab 间隔分钟数
    if (!validateCrontabInterval(crontab, form, 'crontab')) {
      return;
    }

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
          triggerStrategy,
          allowConcurrent,
          startAt,
        } = values;
        const sqlFileIdAndNames = getFileIdAndNames(sqlFiles);
        const { mode, dateType, cronString, hour, dayOfMonth, dayOfWeek } = crontab || {};
        const parameters: createSqlPlanParameters = {
          databaseId,
          sqlContent,
          sqlObjectNames: sqlFileIdAndNames?.names,
          sqlObjectIds: sqlFileIdAndNames?.ids,
          timeoutMillis: timeoutMillis ? timeoutMillis * 60 * 60 * 1000 : undefined,
          errorStrategy,
          delimiter,
          queryLimit,
          modifyTimeoutIfTimeConsumingSqlExists: true,
        };
        if (!checkFileSizeAmount(sqlFiles)) {
          return;
        }
        if (sqlContentType === SQLContentType.FILE) {
          delete parameters.sqlContent;
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
          delete parameters.sqlObjectIds;
          delete parameters.sqlObjectNames;
        }
        if (!scheduleName) {
          setOpen(true);
          return;
        }
        const data: createScheduleRecord<createSqlPlanParameters> = {
          name: scheduleName,
          type: ScheduleType.SQL_PLAN,
          allowConcurrent,
          parameters,
          triggerConfig: null,
        };
        switch (triggerStrategy) {
          case TaskExecStrategy.TIMER: {
            data.triggerConfig = {
              triggerStrategy: (mode === 'custom' ? 'CRON' : dateType) as TaskExecStrategy,
              days: dateType === CrontabDateType.weekly ? dayOfWeek : dayOfMonth,
              hours: hour,
              cronExpression: cronString,
            };
            break;
          }
          case TaskExecStrategy.START_AT: {
            data.triggerConfig = {
              triggerStrategy: TaskExecStrategy.START_AT,
              startAt: startAt?.valueOf(),
            };
            break;
          }
          default: {
            data.triggerConfig = {
              triggerStrategy: TaskExecStrategy.START_NOW,
            };
          }
        }
        setConfirmLoading(true);
        if (isEdit) {
          handleEditAndConfirm(data);
        } else {
          handleCreate(data);
        }
      })
      .catch((errorInfo) => {
        form.scrollToField(errorInfo?.errorFields?.[0]?.name);
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
    setCreateScheduleDatabase(undefined);
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      className={styles.sqlPlan}
    >
      <AnchorContainer
        containerWrapStyle={{ paddingLeft: '24px' }}
        items={[
          {
            key: 'baseInfo',
            href: '#baseInfo',
            title: formatMessage({
              id: 'src.component.Schedule.modals.SQLPlan.Create.BB651904',
              defaultMessage: '基本信息',
            }),
          },
          {
            key: 'executionMethod',
            href: '#executionMethod',
            title: formatMessage({
              id: 'src.component.Schedule.modals.SQLPlan.Create.D07E03AD',
              defaultMessage: '执行方式',
            }),
          },
          {
            key: 'scheduleSetting',
            href: '#scheduleSetting',
            title: formatMessage({
              id: 'src.component.Schedule.modals.SQLPlan.Create.8AE58801',
              defaultMessage: '作业设置',
            }),
          },
        ]}
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
            <h3 id="baseInfo" className={styles.title}>
              {formatMessage({
                id: 'src.component.Schedule.modals.SQLPlan.Create.9B43D6E5',
                defaultMessage: '基本信息',
              })}
            </h3>

            <DatabaseSelect
              disabled={isEdit && !!SQLPlanEditId}
              scheduleType={ScheduleType.SQL_PLAN}
              projectId={projectId}
              onChange={(v, db) => {
                setCreateScheduleDatabase(db);
              }}
              onInit={(db) => setCreateScheduleDatabase(db)}
            />

            <Form.Item
              label={formatMessage({
                id: 'odc.components.CreateSQLPlanTaskModal.SqlContent',
                defaultMessage: 'SQL 内容',
              })}
              /*SQL 内容*/
              name="sqlContentType"
              rules={rules.sqlContentType}
            >
              <Radio.Group
                onChange={handleContentTypeChange}
                optionType="button"
                options={[
                  {
                    label: formatMessage({
                      id: 'odc.components.CreateSQLPlanTaskModal.SqlEntry',
                      defaultMessage: 'SQL 录入',
                    }),
                    value: SQLContentType.TEXT,
                  },
                  // {
                  //   label: formatMessage({
                  //     id: 'odc.components.CreateSQLPlanTaskModal.UploadAnAttachment',
                  //     defaultMessage: '上传附件',
                  //   }),
                  //   value: SQLContentType.FILE,
                  // },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="sqlContent"
              className={`${styles.sqlContent} ${
                sqlContentType !== SQLContentType.TEXT && styles.hide
              }`}
              rules={rules.sqlContent({ required: sqlContentType === SQLContentType.TEXT })}
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
                rules={rules.delimiter}
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
                rules={rules.queryLimit}
              >
                <InputNumber min={1} />
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
                  rules={rules.timeoutMillis as Rule[]}
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

            <h3 id="executionMethod" className={styles.title}>
              {formatMessage({
                id: 'src.component.Schedule.modals.SQLPlan.Create.BE789CEF',
                defaultMessage: '执行方式',
              })}
            </h3>

            <SchduleExecutionMethodForm
              ref={crontabRef}
              crontab={crontab}
              handleCrontabChange={handleCrontabChange}
            />

            <h3 id="scheduleSetting" className={styles.title}>
              {formatMessage({
                id: 'src.component.Schedule.modals.SQLPlan.Create.AC12A0D8',
                defaultMessage: '作业设置',
              })}
            </h3>

            <FormItemPanel /*任务设置*/ keepExpand>
              <Form.Item
                label={formatMessage({
                  id: 'odc.components.CreateSQLPlanTaskModal.TaskErrorHandling',
                  defaultMessage: '任务错误处理',
                })}
                /*任务错误处理*/
                name="errorStrategy"
                rules={rules.errorStrategy}
              >
                <Radio.Group
                  options={[
                    {
                      label: formatMessage({
                        id: 'odc.components.CreateSQLPlanTaskModal.StopATask',
                        defaultMessage: '停止任务',
                      }),
                      value: ErrorStrategy.ABORT,
                    },
                    {
                      label: formatMessage({
                        id: 'odc.components.CreateSQLPlanTaskModal.IgnoreErrorsToContinueThe',
                        defaultMessage: '忽略错误继续任务',
                      }),
                      value: ErrorStrategy.CONTINUE,
                    },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label={formatMessage({
                  id: 'odc.components.CreateSQLPlanTaskModal.TaskExecutionDurationHypercycleProcessing',
                  defaultMessage: '任务执行时长超周期处理',
                })} /*任务执行时长超周期处理*/
                name="allowConcurrent"
                rules={rules.allowConcurrent}
              >
                <Radio.Group
                  options={[
                    {
                      label: formatMessage({
                        id: 'odc.components.CreateSQLPlanTaskModal.AfterTheCurrentTaskIs',
                        defaultMessage: '待当前任务执行完毕在新周期发起任务',
                      }),
                      value: false,
                    },
                    {
                      label: formatMessage({
                        id: 'odc.components.CreateSQLPlanTaskModal.IgnoreTheCurrentTaskStatus',
                        defaultMessage: '忽略当前任务状态，定期发起新任务',
                      }),
                      value: true,
                    },
                  ]}
                />
              </Form.Item>
            </FormItemPanel>
          </Form>
        </Spin>
      </AnchorContainer>
      <div
        style={{ padding: '16px 16px 0px 24px', borderTop: '1px solid var(--table-border-color)' }}
      >
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
          <Button type="primary" loading={confirmLoading || loading} onClick={() => handleSubmit()}>
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
      </div>
      <CreateTaskConfirmModal
        database={createScheduleDatabase}
        initName={getInitScheduleName(form.getFieldValue('scheduleName'), sqlPlanData?.type)}
        open={open}
        isSchedule
        setOpen={setOpen}
        onOk={(scheduleName) => {
          handleSubmit(scheduleName);
        }}
      />
    </div>
  );
};
export default inject('scheduleStore', 'pageStore')(observer(Create));
