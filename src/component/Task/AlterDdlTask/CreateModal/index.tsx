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
import {
  createTask,
  getDatasourceUsers,
  getLockDatabaseUserRequired,
  getTaskDetail,
  queryOmsWorkerInstance,
} from '@/common/network/task';
import CommonIDE from '@/component/CommonIDE';
import FormItemPanel from '@/component/FormItemPanel';
import HelpDoc from '@/component/helpDoc';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import TaskTimer from '@/component/Task/component/TimerSelect';
import {
  IAlterScheduleTaskParams,
  IDatasourceUser,
  TaskDetail,
  TaskExecStrategy,
  TaskPageScope,
  TaskPageType,
  TaskType,
} from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
import { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { mbToB } from '@/util/utils';
import {
  Alert,
  Button,
  Col,
  Drawer,
  Form,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Tooltip,
  Spin,
  Tag,
} from 'antd';
import { useRequest } from 'ahooks';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import DatabaseSelect from '../../component/DatabaseSelect';
import ThrottleFormItem from '../../component/ThrottleFormItem';
import { OscMaxDataSizeLimit, OscMaxRowLimit, OscMinRowLimit } from '../../const';
import { haveOCP } from '@/util/env';
import styles from './index.less';
import { isBoolean } from 'lodash';
import dayjs from 'dayjs';

interface IProps {
  modalStore?: ModalStore;
  settingStore?: SettingStore;
  projectId?: number;
  theme?: 'dark' | 'white';
}
enum ErrorStrategy {
  CONTINUE = 'CONTINUE',
  ABORT = 'ABORT',
}
enum SqlType {
  CREATE = 'CREATE',
  ALTER = 'ALTER',
}
export enum SwapTableType {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}
export enum ClearStrategy {
  ORIGIN_TABLE_RENAME_AND_RESERVED = 'ORIGIN_TABLE_RENAME_AND_RESERVED',
  ORIGIN_TABLE_DROP = 'ORIGIN_TABLE_DROP',
}

export enum LockStrategy {
  LOCK_USER = 'LOCK_USER',
  LOCK_TABLE = 'LOCK_TABLE',
}
export const LockStrategyLableMap = {
  [LockStrategy.LOCK_USER]: formatMessage({
    id: 'src.component.Task.AlterDdlTask.CreateModal.72D3ECEB',
    defaultMessage: '锁定用户',
  }),
  [LockStrategy.LOCK_TABLE]: formatMessage({
    id: 'src.component.Task.AlterDdlTask.CreateModal.4D9F1206',
    defaultMessage: '锁定表',
  }),
};
const CreateDDLTaskModal: React.FC<IProps> = (props) => {
  const { modalStore, settingStore, projectId, theme } = props;
  const { ddlAlterData } = modalStore;
  const editorRef = useRef<CommonIDE>();
  const [form] = Form.useForm();
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [datasourceUser, setDatasourceUser] = useState<IDatasourceUser[]>([]);
  const [canCreateTask, setCanCreateTask] = useState(true); // 判断是否可以进行创建任务
  const [lockDatabaseUserRequired, setLockDatabaseUserRequired] = useState(true);
  const [isDbEnableLockPriorityFlagSet, setIsDbEnableLockPriorityFlagSet] = useState(false);
  const databaseId = Form.useWatch('databaseId', form);
  const { database } = useDBSession(databaseId);
  const connection = database?.dataSource;
  const lockStrategy = Form.useWatch('forbiddenWriteType', form);
  const isLockUser = lockStrategy === LockStrategy.LOCK_USER;
  const lockTableTipInCloud = formatMessage({
    id: 'src.component.Task.AlterDdlTask.CreateModal.44A394CE',
    defaultMessage: '在表名切换前，锁定原表禁写。',
  });

  const lockTableTipInPrivate = formatMessage({
    id: 'src.component.Task.AlterDdlTask.CreateModal.6DC73E39',
    defaultMessage:
      '在表名切换前，锁定原表禁写。请您确保 ODP 满足以下条件：\nODP 版本 ≥ 4.3.1 且已进行以下参数设置：\n    alter proxyconfig set proxy_id=1;\n    alter proxyconfig set client_session_id_version=2;\n    alter proxyconfig set enable_single_leader_node_routing = false;',
  });

  const lockTableTip = haveOCP() ? lockTableTipInCloud : lockTableTipInPrivate;

  const initialValue = {
    rowLimit: 100,
    dataSizeLimit: 1.0,
  };
  const datasourceUserOptions = datasourceUser?.map(({ name }) => ({
    label: name,
    value: name,
  }));

  // 当前路径处理 为了处理跳转到其他页面
  const { origin, pathname } = new URL(window.location.href);
  // /截取出来后第一个为空值，进行剔除
  const [regionId] = pathname.split('/').slice(1);

  const hadleReset = () => {
    form.resetFields(null);
    setHasEdit(false);
    setLockDatabaseUserRequired(true);
    setIsDbEnableLockPriorityFlagSet(false);
  };
  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.AlterDdlTask.CreateModal.AreYouSureYouWant',
          defaultMessage: '是否确认取消无锁结构变更？',
        }),
        //确认取消无锁结构变更吗？
        centered: true,
        onOk: () => {
          hadleReset();
          props.modalStore.changeCreateDDLAlterTaskModal(false);
        },
      });
    } else {
      hadleReset();
      props.modalStore.changeCreateDDLAlterTaskModal(false);
    }
  };
  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const {
          databaseId,
          sqlType,
          sqlContent,
          swapTableNameRetryTimes,
          swapTableType,
          lockTableTimeOutSeconds,
          originTableCleanStrategy,
          errorStrategy,
          description,
          executionTime,
          executionStrategy,
          lockUsers,
          dataSizeLimit,
          rowLimit,
          forbiddenWriteType,
        } = values;
        const parameters = {
          lockTableTimeOutSeconds,
          errorStrategy,
          sqlContent,
          sqlType,
          swapTableNameRetryTimes,
          originTableCleanStrategy,
          lockUsers,
          swapTableType,
          rateLimitConfig:
            rowLimit || dataSizeLimit
              ? {
                  rowLimit,
                  dataSizeLimit: mbToB(dataSizeLimit),
                }
              : null,
          forbiddenWriteType,
        };
        const data = {
          projectId,
          databaseId,
          taskType: TaskType.ONLINE_SCHEMA_CHANGE,
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
        setConfirmLoading(false);
        if (res) {
          handleCancel(false);
          openTasksPage(TaskPageType.ONLINE_SCHEMA_CHANGE, TaskPageScope.CREATED_BY_CURRENT_USER);
        }
      })
      .catch((errorInfo) => {
        form.scrollToField(errorInfo?.errorFields?.[0]?.name);
        console.error(JSON.stringify(errorInfo));
      });
  };
  const handleSqlChange = (sql: string) => {
    form?.setFieldsValue({
      sqlContent: sql,
    });
    setHasEdit(true);
  };
  const handleFieldsChange = (changedFields) => {
    setHasEdit(true);
  };
  const handleDatabaseChange = () => {
    form.setFieldValue('lockUsers', []);
  };
  const loadDatasourceUsers = async (datasourceId: number) => {
    const res = await getDatasourceUsers(datasourceId);
    setDatasourceUser(res?.contents);
  };
  const checkLockDatabaseUserRequired = async (databaseId: number) => {
    const res = await getLockDatabaseUserRequired(databaseId);
    setLockDatabaseUserRequired(res?.lockDatabaseUserRequired);
    setIsDbEnableLockPriorityFlagSet(res?.isDbEnableLockPriorityFlagSet);
  };
  useEffect(() => {
    if (connection?.id && isLockUser) {
      loadDatasourceUsers(connection.id);
    }
  }, [connection?.id, isLockUser]);
  useEffect(() => {
    if (databaseId) {
      checkLockDatabaseUserRequired(databaseId);
    }
  }, [databaseId]);

  useEffect(() => {
    const databaseId = ddlAlterData?.databaseId;
    if (databaseId) {
      form.setFieldsValue({
        databaseId,
      });
    }
    if (ddlAlterData?.taskId) {
      loadTaskDetail();
    }
  }, [ddlAlterData?.databaseId, ddlAlterData?.taskId]);

  const { run: fetchTaskDetail, loading } = useRequest(getTaskDetail, {
    manual: true,
  });

  async function loadTaskDetail() {
    const detailRes = (await fetchTaskDetail(
      ddlAlterData?.taskId,
    )) as TaskDetail<IAlterScheduleTaskParams>;
    const rateLimitConfig = detailRes?.parameters?.rateLimitConfig;

    form.setFieldsValue({
      ...detailRes?.parameters,
      forbiddenWriteType: detailRes?.parameters.forbiddenWriteType || LockStrategy.LOCK_USER,
      executionStrategy: detailRes?.executionStrategy,
      executionTime:
        detailRes?.executionTime && detailRes?.executionTime > new Date().getTime()
          ? dayjs(detailRes?.executionTime)
          : null,
      rowLimit: rateLimitConfig?.rowLimit,
      dataSizeLimit: rateLimitConfig?.dataSizeLimit,
      description: detailRes?.description,
    });

    editorRef?.current?.editor?.setValue(detailRes?.parameters?.sqlContent);
  }

  useEffect(() => {
    if (!modalStore.createDDLAlterVisible) return;
    haveOCP() &&
      settingStore.enableOSCLimiting &&
      queryOmsWorkerInstance().then((res) => {
        //接口返回正常 &&  hasUnconfiguredProject有值且为布尔类型的 false 时 禁用新建
        if (
          isBoolean(res?.data?.hasUnconfiguredProject) &&
          !res?.data?.hasUnconfiguredProject &&
          res.successful
        ) {
          setCanCreateTask(false);
          return;
        }
      });
  }, [modalStore.createDDLAlterVisible]);

  return (
    <Drawer
      destroyOnClose
      rootClassName={styles['ddl-alter']}
      width={720}
      title={formatMessage({
        id: 'odc.AlterDdlTask.CreateModal.NewLockFreeStructureChange',
        defaultMessage: '新建无锁结构变更',
      })}
      /*新建无锁结构变更*/ footer={
        <Space>
          <Button
            onClick={() => {
              handleCancel(hasEdit);
            }}
          >
            {
              formatMessage({
                id: 'odc.AlterDdlTask.CreateModal.Cancel',
                defaultMessage: '取消',
              }) /*取消*/
            }
          </Button>

          <Tooltip
            title={
              canCreateTask
                ? ''
                : formatMessage({
                    id: 'src.component.Task.AlterDdlTask.CreateModal.22DADB05',
                    defaultMessage: '请购买数据传输资源',
                  })
            }
          >
            <Button
              type="primary"
              loading={confirmLoading || loading}
              onClick={handleSubmit}
              disabled={!canCreateTask}
            >
              {
                formatMessage({
                  id: 'odc.AlterDdlTask.CreateModal.Create',
                  defaultMessage: '新建',
                }) /*新建*/
              }
            </Button>
          </Tooltip>
        </Space>
      }
      open={modalStore.createDDLAlterVisible}
      onClose={() => {
        handleCancel(hasEdit);
      }}
    >
      <Spin spinning={loading}>
        <Alert
          style={{
            marginBottom: 12,
          }}
          type="warning"
          showIcon
          message={formatMessage({
            id: 'src.component.Task.AlterDdlTask.CreateModal.767B6898',
            defaultMessage: '注意：执行无锁结构变更前请确保数据库服务器磁盘空间充足。',
          })}
        />

        {!canCreateTask && (
          <Alert
            style={{
              marginBottom: 12,
            }}
            type="warning"
            showIcon
            message={
              formatMessage({
                id: 'odc.src.component.Task.AlterDdlTask.CreateModal.Notice',
                defaultMessage: '注意',
              }) /* 注意 */
            }
            description={
              <div>
                {formatMessage({
                  id: 'src.component.Task.AlterDdlTask.CreateModal.336C0D2E',
                  defaultMessage: '依赖',
                })}

                <a
                  href={`${origin}/oms-v2/${regionId}/migration?pageNumber=1&type=MIGRATION`}
                  target="_blank"
                >
                  {formatMessage({
                    id: 'src.component.Task.AlterDdlTask.CreateModal.D2A9FCAE',
                    defaultMessage: '数据迁移服务',
                  })}
                </a>
                {formatMessage({
                  id: 'src.component.Task.AlterDdlTask.CreateModal.7E1F9429',
                  defaultMessage: '完成数据拷贝，检查到您没有空闲的数据迁移资源。',
                })}

                <br />
                {formatMessage({
                  id: 'src.component.Task.AlterDdlTask.CreateModal.6B29781E',
                  defaultMessage: '请进行',
                })}

                <a
                  href={`https://pre-valid-common-buy.aliyun.com/?commodityCode=oceanbase_omspost_public_cn&regionId=${regionId}`}
                  target="_blank"
                >
                  {formatMessage({
                    id: 'src.component.Task.AlterDdlTask.CreateModal.2C714DF6',
                    defaultMessage: '购买',
                  })}
                </a>
                {formatMessage({
                  id: 'src.component.Task.AlterDdlTask.CreateModal.5EB376C2',
                  defaultMessage: '，重新配置任务。',
                })}
              </div>
            }
          />
        )}

        <Form
          name="basic"
          initialValues={{
            executionStrategy: TaskExecStrategy.AUTO,
          }}
          layout="vertical"
          requiredMark="optional"
          form={form}
          onFieldsChange={handleFieldsChange}
        >
          <Row gutter={14}>
            <Col span={12}>
              <DatabaseSelect
                type={TaskType.ONLINE_SCHEMA_CHANGE}
                projectId={projectId}
                onChange={handleDatabaseChange}
              />
            </Col>
          </Row>
          <Form.Item
            label={formatMessage({
              id: 'src.component.Task.AlterDdlTask.CreateModal.CC3FB49A',
              defaultMessage: '表名切换禁写策略',
            })}
            rules={[{ required: true }]}
            name={'forbiddenWriteType'}
            initialValue={LockStrategy.LOCK_USER}
            extra={
              isLockUser ? (
                formatMessage({
                  id: 'src.component.Task.AlterDdlTask.CreateModal.4871DE06',
                  defaultMessage:
                    '在表名切换前，系统将锁定您指定的数据库账号，并终止该账号的当前会话。切换期间，所有涉及该账号的应用将无法访问数据库。建议避免在业务高峰期执行此操作，以减少对业务的影响。',
                })
              ) : (
                <div style={{ whiteSpace: 'pre-wrap' }}>{lockTableTip}</div>
              )
            }
          >
            <Radio.Group>
              <Radio.Button value={LockStrategy.LOCK_USER}>
                {LockStrategyLableMap[LockStrategy.LOCK_USER]}
              </Radio.Button>

              {!lockDatabaseUserRequired && (
                <Tooltip
                  title={
                    !isDbEnableLockPriorityFlagSet
                      ? formatMessage({
                          id: 'src.component.Task.AlterDdlTask.CreateModal.C62A7DBB',
                          defaultMessage: '需要将参数 enable_lock_priority 设置为 true',
                        })
                      : null
                  }
                >
                  <Radio.Button
                    value={LockStrategy.LOCK_TABLE}
                    disabled={!isDbEnableLockPriorityFlagSet}
                  >
                    {LockStrategyLableMap[LockStrategy.LOCK_TABLE]}
                  </Radio.Button>
                </Tooltip>
              )}
            </Radio.Group>
          </Form.Item>
          {isLockUser && (
            <Col span={12}>
              <Form.Item
                label={
                  formatMessage({
                    id: 'odc.src.component.Task.AlterDdlTask.CreateModal.LockUsers.1',
                    defaultMessage: '锁定用户',
                  }) /*
              锁定用户
              */
                }
                name="lockUsers"
                required
              >
                <Select
                  showSearch
                  mode="multiple"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder={
                    formatMessage({
                      id: 'odc.src.component.Task.AlterDdlTask.CreateModal.PleaseChoose',
                      defaultMessage: '请选择',
                    }) /* 请选择 */
                  }
                  options={datasourceUserOptions}
                />
              </Form.Item>
            </Col>
          )}
          <Form.Item
            label={formatMessage({
              id: 'odc.AlterDdlTask.CreateModal.ChangeDefinition',
              defaultMessage: '变更定义',
            })}
            /*变更定义*/ name="sqlType"
            initialValue={SqlType.CREATE}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.AlterDdlTask.CreateModal.SelectAChangeDefinition',
                  defaultMessage: '请选择变更定义',
                }), //请选择变更定义
              },
            ]}
          >
            <Radio.Group>
              <Radio value={SqlType.CREATE}>CREATE TABLE</Radio>
              <Radio value={SqlType.ALTER}>ALTER TABLE</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="sqlContent"
            label={formatMessage({
              id: 'odc.AlterDdlTask.CreateModal.SqlContent',
              defaultMessage: 'SQL 内容',
            })}
            /*SQL 内容*/
            className={styles.sqlContent}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.AlterDdlTask.CreateModal.EnterTheSqlContent',
                  defaultMessage: '请填写 SQL 内容',
                }), //请填写 SQL 内容
              },
            ]}
            style={{
              height: '280px',
            }}
          >
            <CommonIDE
              editorProps={{
                theme,
              }}
              language={getDataSourceModeConfig(connection?.type)?.sql?.language}
              onSQLChange={handleSqlChange}
              ref={editorRef}
            />
          </Form.Item>
          <FormItemPanel
            label={
              <HelpDoc leftText isTip doc="schemaChangeSwapTable">
                {
                  formatMessage({
                    id: 'odc.AlterDdlTask.CreateModal.SwitchTableSettings',
                    defaultMessage: '切换表设置',
                  }) /*切换表设置*/
                }
              </HelpDoc>
            }
            keepExpand
          >
            <Row>
              <Col span={6}>
                <Form.Item
                  label={
                    <HelpDoc leftText isTip doc="schemaChangeSwapTableTimeout">
                      {
                        formatMessage({
                          id: 'odc.AlterDdlTask.CreateModal.LockTableTimeout',
                          defaultMessage: '锁表超时时间',
                        }) /*锁表超时时间*/
                      }
                    </HelpDoc>
                  }
                  required
                >
                  <Form.Item
                    label={formatMessage({
                      id: 'odc.AlterDdlTask.CreateModal.Seconds',
                      defaultMessage: '秒',
                    })}
                    /*秒*/ name="lockTableTimeOutSeconds"
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'odc.AlterDdlTask.CreateModal.EnterATimeoutPeriod',
                          defaultMessage: '请输入超时时间',
                        }), //请输入超时时间
                      },
                      {
                        type: 'number',
                        max: 3600,
                        message: formatMessage({
                          id: 'odc.AlterDdlTask.CreateModal.UpToSeconds',
                          defaultMessage: '最大不超过 3600 秒',
                        }), //最大不超过 3600 秒
                      },
                    ]}
                    initialValue={5}
                    noStyle
                  >
                    <InputNumber min={0} max={3600} />
                  </Form.Item>
                  <span className={styles.hour}>
                    {
                      formatMessage({
                        id: 'odc.AlterDdlTask.CreateModal.Seconds',
                        defaultMessage: '秒',
                      }) /*秒*/
                    }
                  </span>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="swapTableNameRetryTimes"
                  label={
                    <HelpDoc leftText isTip doc="schemaChangeSwapTableRetryTimes">
                      {
                        formatMessage({
                          id: 'odc.AlterDdlTask.CreateModal.NumberOfFailedRetries',
                          defaultMessage: '失败重试次数',
                        }) /*失败重试次数*/
                      }
                    </HelpDoc>
                  }
                  initialValue={3}
                  required
                  rules={[
                    {
                      required: true,
                      message: formatMessage({
                        id: 'odc.AlterDdlTask.CreateModal.PleaseEnterTheNumberOf',
                        defaultMessage: '请输入失败重试次数',
                      }), //请输入失败重试次数
                    },
                  ]}
                >
                  <InputNumber min={0} max={10} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label={formatMessage({
                id: 'odc.AlterDdlTask.CreateModal.SourceTableCleanupPolicyAfter',
                defaultMessage: '完成后源表清理策略',
              })}
              /*完成后源表清理策略*/ name="originTableCleanStrategy"
              initialValue={ClearStrategy.ORIGIN_TABLE_RENAME_AND_RESERVED}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.AlterDdlTask.CreateModal.SelectACleanupPolicy',
                    defaultMessage: '请选择清理策略',
                  }), //请选择清理策略
                },
              ]}
            >
              <Radio.Group>
                <Radio value={ClearStrategy.ORIGIN_TABLE_RENAME_AND_RESERVED}>
                  <Space>
                    {
                      formatMessage({
                        id: 'odc.AlterDdlTask.CreateModal.RenameNotProcessed',
                        defaultMessage: '重命名不处理',
                      }) /*重命名不处理*/
                    }
                    <Tag color="blue">
                      {formatMessage({
                        id: 'src.component.Task.AlterDdlTask.CreateModal.310DB54C',
                        defaultMessage: '推荐',
                      })}
                    </Tag>
                  </Space>
                </Radio>
                <Radio value={ClearStrategy.ORIGIN_TABLE_DROP}>
                  {
                    formatMessage({
                      id: 'odc.AlterDdlTask.CreateModal.DeleteNow',
                      defaultMessage: '立即删除',
                    }) /*立即删除*/
                  }
                </Radio>
              </Radio.Group>
            </Form.Item>
          </FormItemPanel>
          <FormItemPanel
            label={formatMessage({
              id: 'odc.AlterDdlTask.CreateModal.TaskSettings',
              defaultMessage: '任务设置',
            })}
            /*任务设置*/ keepExpand
          >
            <TaskTimer />
            <Form.Item
              label={formatMessage({
                id: 'odc.AlterDdlTask.CreateModal.TaskErrorHandling',
                defaultMessage: '任务错误处理',
              })}
              /*任务错误处理*/ name="errorStrategy"
              initialValue={ErrorStrategy.ABORT}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.AlterDdlTask.CreateModal.SelectTaskErrorHandling',
                    defaultMessage: '请选择任务错误处理',
                  }), //请选择任务错误处理
                },
              ]}
            >
              <Radio.Group>
                <Radio value={ErrorStrategy.ABORT}>
                  {
                    formatMessage({
                      id: 'odc.AlterDdlTask.CreateModal.StopATask',
                      defaultMessage: '停止任务',
                    }) /*停止任务*/
                  }
                </Radio>
                <Radio value={ErrorStrategy.CONTINUE}>
                  {
                    formatMessage({
                      id: 'odc.AlterDdlTask.CreateModal.IgnoreErrorsToContinueThe',
                      defaultMessage: '忽略错误继续任务',
                    }) /*忽略错误继续任务*/
                  }
                </Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label={
                formatMessage({
                  id: 'odc.src.component.Task.AlterDdlTask.CreateModal.TableNameSwitchingMethod',
                  defaultMessage: '表名切换方式',
                }) /* 表名切换方式 */
              }
              name="swapTableType"
              initialValue={SwapTableType.AUTO}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.src.component.Task.AlterDdlTask.CreateModal.PleaseSelectTheTableName',
                    defaultMessage: '请选择表名切换方式',
                  }), //'请选择表名切换方式'
                },
              ]}
            >
              <Radio.Group>
                <Radio value={SwapTableType.AUTO}>
                  {
                    formatMessage({
                      id: 'odc.src.component.Task.AlterDdlTask.CreateModal.AutomaticSwitch',
                      defaultMessage: '自动切换',
                    }) /* 自动切换 */
                  }
                </Radio>
                <Radio value={SwapTableType.MANUAL}>
                  {
                    formatMessage({
                      id: 'odc.src.component.Task.AlterDdlTask.CreateModal.ManualSwitch',
                      defaultMessage: '手动切换',
                    }) /* 手工切换 */
                  }
                </Radio>
              </Radio.Group>
            </Form.Item>
            {settingStore.enableOSCLimiting && (
              <ThrottleFormItem
                initialValue={initialValue}
                minRowLimit={OscMinRowLimit}
                maxRowLimit={OscMaxRowLimit}
                maxDataSizeLimit={OscMaxDataSizeLimit}
              />
            )}
          </FormItemPanel>
          <DescriptionInput />
        </Form>
      </Spin>
    </Drawer>
  );
};
export default inject('modalStore', 'settingStore')(observer(CreateDDLTaskModal));
