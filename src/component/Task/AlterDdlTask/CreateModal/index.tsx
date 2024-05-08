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
import { createTask, getDatasourceUsers, getLockDatabaseUserRequired } from '@/common/network/task';
import CommonIDE from '@/component/CommonIDE';
import FormItemPanel from '@/component/FormItemPanel';
import HelpDoc from '@/component/helpDoc';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import TaskTimer from '@/component/Task/component/TimerSelect';
import { IDatasourceUser, TaskExecStrategy, TaskPageScope, TaskPageType, TaskType } from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
import { formatMessage } from '@/util/intl';
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
} from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import DatabaseSelect from '../../component/DatabaseSelect';
import styles from './index.less';
interface IProps {
  modalStore?: ModalStore;
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
const CreateDDLTaskModal: React.FC<IProps> = (props) => {
  const { modalStore, projectId, theme } = props;
  const { ddlAlterData } = modalStore;
  const [form] = Form.useForm();
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [datasourceUser, setDatasourceUser] = useState<IDatasourceUser[]>([]);
  const [lockDatabaseUserRequired, setLockDatabaseUserRequired] = useState(false);
  const databaseId = Form.useWatch('databaseId', form);
  const { database } = useDBSession(databaseId);
  const connection = database?.dataSource;
  const datasourceUserOptions = datasourceUser?.map(({ name }) => ({
    label: name,
    value: name,
  }));
  const hadleReset = () => {
    form.resetFields(null);
    setHasEdit(false);
    setLockDatabaseUserRequired(false);
  };
  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.AlterDdlTask.CreateModal.AreYouSureYouWant',
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
  };
  useEffect(() => {
    if (connection?.id && lockDatabaseUserRequired) {
      loadDatasourceUsers(connection.id);
    }
  }, [connection?.id]);
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
  }, [ddlAlterData?.databaseId]);

  return (
    <Drawer
      destroyOnClose
      className={styles['ddl-alter']}
      width={720}
      title={formatMessage({
        id: 'odc.AlterDdlTask.CreateModal.NewLockFreeStructureChange',
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
              }) /*取消*/
            }
          </Button>
          <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
            {
              formatMessage({
                id: 'odc.AlterDdlTask.CreateModal.Create',
              }) /*新建*/
            }
          </Button>
        </Space>
      }
      open={modalStore.createDDLAlterVisible}
      onClose={() => {
        handleCancel(hasEdit);
      }}
    >
      <Alert
        style={{
          marginBottom: 12,
        }}
        type="warning"
        showIcon
        message={
          formatMessage({
            id: 'odc.src.component.Task.AlterDdlTask.CreateModal.Notice',
          }) /* 注意 */
        }
        description={
          <div>
            {
              formatMessage({
                id: 'odc.src.component.Task.AlterDdlTask.CreateModal.1BeforePerformingThe',
              }) /* 
            1、执行无锁结构变更前请确保数据库服务器磁盘空间充足；
             */
            }
            <br />
            {
              formatMessage({
                id: 'odc.src.component.Task.AlterDdlTask.CreateModal.2WhenCreatingA',
              }) /* 
            2、创建工单选择源表清理策略时建议选择保留源表；
             */
            }
            {lockDatabaseUserRequired && (
              <>
                <br />
                {
                  formatMessage({
                    id: 'odc.src.component.Task.AlterDdlTask.CreateModal.3IfTheOB',
                  }) /* 
                3、若 OB Oracle 模式版本小于 4.0 或 OB MySQL 模式版本小于
                4.3，表名切换之前会锁定您指定的数据库账号，并 kill 该账号对应的
                session。表名切换期间，锁定账号涉及应用将无法访问数据库，请勿在业务高峰期执行；
               */
                }
              </>
            )}
          </div>
        }
      />
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
          {lockDatabaseUserRequired && (
            <Col span={12}>
              <Form.Item
                label={
                  <HelpDoc leftText isTip doc="AlterDdlTaskLockUsersTip">
                    {
                      formatMessage({
                        id: 'odc.src.component.Task.AlterDdlTask.CreateModal.LockUsers.1',
                      }) /* 
                    锁定用户
                   */
                    }
                  </HelpDoc>
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
                    }) /* 请选择 */
                  }
                  options={datasourceUserOptions}
                />
              </Form.Item>
            </Col>
          )}
        </Row>
        <Form.Item
          label={formatMessage({
            id: 'odc.AlterDdlTask.CreateModal.ChangeDefinition',
          })}
          /*变更定义*/ name="sqlType"
          initialValue={SqlType.CREATE}
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.AlterDdlTask.CreateModal.SelectAChangeDefinition',
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
          })}
          /*SQL 内容*/ className={styles.sqlContent}
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.AlterDdlTask.CreateModal.EnterTheSqlContent',
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
          />
        </Form.Item>
        <FormItemPanel
          label={
            <HelpDoc leftText isTip doc="schemaChangeSwapTable">
              {
                formatMessage({
                  id: 'odc.AlterDdlTask.CreateModal.SwitchTableSettings',
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
                      }) /*锁表超时时间*/
                    }
                  </HelpDoc>
                }
                required
              >
                <Form.Item
                  label={formatMessage({
                    id: 'odc.AlterDdlTask.CreateModal.Seconds',
                  })}
                  /*秒*/ name="lockTableTimeOutSeconds"
                  rules={[
                    {
                      required: true,
                      message: formatMessage({
                        id: 'odc.AlterDdlTask.CreateModal.EnterATimeoutPeriod',
                      }), //请输入超时时间
                    },
                    {
                      type: 'number',
                      max: 3600,
                      message: formatMessage({
                        id: 'odc.AlterDdlTask.CreateModal.UpToSeconds',
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
            })}
            /*完成后源表清理策略*/ name="originTableCleanStrategy"
            initialValue={ClearStrategy.ORIGIN_TABLE_RENAME_AND_RESERVED}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.AlterDdlTask.CreateModal.SelectACleanupPolicy',
                }), //请选择清理策略
              },
            ]}
          >
            <Radio.Group>
              <Radio value={ClearStrategy.ORIGIN_TABLE_RENAME_AND_RESERVED}>
                {
                  formatMessage({
                    id: 'odc.AlterDdlTask.CreateModal.RenameNotProcessed',
                  }) /*重命名不处理*/
                }
              </Radio>
              <Radio value={ClearStrategy.ORIGIN_TABLE_DROP}>
                {
                  formatMessage({
                    id: 'odc.AlterDdlTask.CreateModal.DeleteNow',
                  }) /*立即删除*/
                }
              </Radio>
            </Radio.Group>
          </Form.Item>
        </FormItemPanel>
        <FormItemPanel
          label={formatMessage({
            id: 'odc.AlterDdlTask.CreateModal.TaskSettings',
          })}
          /*任务设置*/ keepExpand
        >
          <TaskTimer isReadonlyPublicConn={false} />
          <Form.Item
            label={formatMessage({
              id: 'odc.AlterDdlTask.CreateModal.TaskErrorHandling',
            })}
            /*任务错误处理*/ name="errorStrategy"
            initialValue={ErrorStrategy.ABORT}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.AlterDdlTask.CreateModal.SelectTaskErrorHandling',
                }), //请选择任务错误处理
              },
            ]}
          >
            <Radio.Group>
              <Radio value={ErrorStrategy.ABORT}>
                {
                  formatMessage({
                    id: 'odc.AlterDdlTask.CreateModal.StopATask',
                  }) /*停止任务*/
                }
              </Radio>
              <Radio value={ErrorStrategy.CONTINUE}>
                {
                  formatMessage({
                    id: 'odc.AlterDdlTask.CreateModal.IgnoreErrorsToContinueThe',
                  }) /*忽略错误继续任务*/
                }
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={
              formatMessage({
                id: 'odc.src.component.Task.AlterDdlTask.CreateModal.TableNameSwitchingMethod',
              }) /* 表名切换方式 */
            }
            name="swapTableType"
            initialValue={SwapTableType.AUTO}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.src.component.Task.AlterDdlTask.CreateModal.PleaseSelectTheTableName',
                }), //'请选择表名切换方式'
              },
            ]}
          >
            <Radio.Group>
              <Radio value={SwapTableType.AUTO}>
                {
                  formatMessage({
                    id: 'odc.src.component.Task.AlterDdlTask.CreateModal.AutomaticSwitch',
                  }) /* 自动切换 */
                }
              </Radio>
              <Radio value={SwapTableType.MANUAL}>
                {
                  formatMessage({
                    id: 'odc.src.component.Task.AlterDdlTask.CreateModal.ManualSwitch',
                  }) /* 手工切换 */
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
export default inject('modalStore')(observer(CreateDDLTaskModal));
