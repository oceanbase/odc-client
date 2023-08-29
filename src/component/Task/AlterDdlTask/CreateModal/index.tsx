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
import HelpDoc from '@/component/helpDoc';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import TaskTimer from '@/component/Task/component/TimerSelect';
import { ConnectionMode, TaskExecStrategy, TaskPageScope, TaskPageType, TaskType } from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
import { formatMessage } from '@/util/intl';
import { Alert, Button, Col, Drawer, Form, InputNumber, Modal, Radio, Row, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useState } from 'react';
import DatabaseSelect from '../../component/DatabaseSelect';
import styles from './index.less';
interface IProps {
  modalStore?: ModalStore;
  projectId?: number;
}
enum ErrorStrategy {
  CONTINUE = 'CONTINUE',
  ABORT = 'ABORT',
}
enum SqlType {
  CREATE = 'CREATE',
  ALTER = 'ALTER',
}
export enum ClearStrategy {
  ORIGIN_TABLE_RENAME_AND_RESERVED = 'ORIGIN_TABLE_RENAME_AND_RESERVED',
  ORIGIN_TABLE_DROP = 'ORIGIN_TABLE_DROP',
}
const CreateDDLTaskModal: React.FC<IProps> = (props) => {
  const { modalStore, projectId } = props;
  const [form] = Form.useForm();
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const databaseId = Form.useWatch('databaseId', form);
  const { database } = useDBSession(databaseId);
  const connection = database?.dataSource;
  const isMySQL = connection?.dialectType === ConnectionMode.OB_MYSQL;

  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({ id: 'odc.AlterDdlTask.CreateModal.AreYouSureYouWant' }), //确认取消无锁结构变更吗？
        centered: true,
        onOk: () => {
          props.modalStore.changeCreateDDLAlterTaskModal(false);
        },
      });
    } else {
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
          lockTableTimeOutSeconds,
          originTableCleanStrategy,
          errorStrategy,
          description,
          executionTime,
          executionStrategy,
        } = values;
        const parameters = {
          lockTableTimeOutSeconds,
          errorStrategy,
          sqlContent,
          sqlType,
          swapTableNameRetryTimes,
          originTableCleanStrategy,
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
        handleCancel(false);
        setConfirmLoading(false);
        if (res) {
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
  const handleFieldsChange = () => {
    setHasEdit(true);
  };
  return (
    <Drawer
      destroyOnClose
      className={styles['ddl-alter']}
      width={720}
      title={formatMessage({
        id: 'odc.AlterDdlTask.CreateModal.NewLockFreeStructureChange',
      })} /*新建无锁结构变更*/
      footer={
        <Space>
          <Button
            onClick={() => {
              handleCancel(hasEdit);
            }}
          >
            {formatMessage({ id: 'odc.AlterDdlTask.CreateModal.Cancel' }) /*取消*/}
          </Button>
          <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
            {formatMessage({ id: 'odc.AlterDdlTask.CreateModal.Create' }) /*新建*/}
          </Button>
        </Space>
      }
      visible={modalStore.createDDLAlterVisible}
      onClose={() => {
        handleCancel(hasEdit);
      }}
    >
      <Alert
        style={{
          marginBottom: 12,
        }}
        type="info"
        showIcon
        message="由于低版本 OB rename 过程不能保障原子的，对于 OB MySQL 版本 <  4.3 及 OB Oracle  版本 < 4.0， 表名切换之前会锁定数据库账号，并 kill session，表名切换期间，应用可能无法访问数据库，请务在业务高峰期执行无锁结构变更工单，磁盘空间充足的情况下，创建工单时建议保留原表！"
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
        <DatabaseSelect projectId={projectId} />
        <Form.Item
          label={formatMessage({
            id: 'odc.AlterDdlTask.CreateModal.ChangeDefinition',
          })} /*变更定义*/
          name="sqlType"
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
          label={formatMessage({ id: 'odc.AlterDdlTask.CreateModal.SqlContent' })} /*SQL 内容*/
          className={styles.sqlContent}
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'odc.AlterDdlTask.CreateModal.EnterTheSqlContent' }), //请填写 SQL 内容
            },
          ]}
          style={{ height: '280px' }}
        >
          <CommonIDE
            language={`${isMySQL ? 'obmysql' : 'oboracle'}`}
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
                  label={formatMessage({ id: 'odc.AlterDdlTask.CreateModal.Seconds' })} /*秒*/
                  name="lockTableTimeOutSeconds"
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
                      message: formatMessage({ id: 'odc.AlterDdlTask.CreateModal.UpToSeconds' }), //最大不超过 3600 秒
                    },
                  ]}
                  initialValue={5}
                  noStyle
                >
                  <InputNumber min={0} max={3600} />
                </Form.Item>
                <span className={styles.hour}>
                  {formatMessage({ id: 'odc.AlterDdlTask.CreateModal.Seconds' }) /*秒*/}
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
            })} /*完成后源表清理策略*/
            name="originTableCleanStrategy"
            initialValue={ClearStrategy.ORIGIN_TABLE_RENAME_AND_RESERVED}
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'odc.AlterDdlTask.CreateModal.SelectACleanupPolicy' }), //请选择清理策略
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
                {formatMessage({ id: 'odc.AlterDdlTask.CreateModal.DeleteNow' }) /*立即删除*/}
              </Radio>
            </Radio.Group>
          </Form.Item>
        </FormItemPanel>
        <FormItemPanel
          label={formatMessage({ id: 'odc.AlterDdlTask.CreateModal.TaskSettings' })}
          /*任务设置*/ keepExpand
        >
          <TaskTimer isReadonlyPublicConn={false} />
          <Form.Item
            label={formatMessage({
              id: 'odc.AlterDdlTask.CreateModal.TaskErrorHandling',
            })} /*任务错误处理*/
            name="errorStrategy"
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
                {formatMessage({ id: 'odc.AlterDdlTask.CreateModal.StopATask' }) /*停止任务*/}
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
        </FormItemPanel>
        <DescriptionInput />
      </Form>
    </Drawer>
  );
};
export default inject('modalStore')(observer(CreateDDLTaskModal));
