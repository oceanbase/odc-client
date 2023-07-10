import { createTask } from '@/common/network/task';
import CommonIDE from '@/component/CommonIDE';
import FormItemPanel from '@/component/FormItemPanel';
import { TaskExecStrategy, TaskPageScope, TaskPageType, TaskType, ConnectionMode } from '@/d.ts';
import TaskTimer from '@/component/Task/component/TimerSelect';
import HelpDoc from '@/component/helpDoc';
import DatabaseSelect from '../../component/DatabaseSelect';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
import React, { useState } from 'react';
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Space,
} from 'antd';
import { inject, observer } from 'mobx-react';
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
enum ClearStrategy {
  ORIGIN_TABLE_RENAME_AND_RESERVED = 'ORIGIN_TABLE_RENAME_AND_RESERVED',
  ORIGIN_TABLE_DROP = 'ORIGIN_TABLE_DROP',
}
const CreateDDLTaskModal: React.FC<IProps> = (props) => {
  const {
    modalStore,
    projectId
  } = props;
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
        title: '确认取消无锁结构变更吗？',
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
          timeoutMillis,
          originTableCleanStrategy,
          errorStrategy,
          description,
          executionTime,
          executionStrategy,
        } = values;
        const parameters = {
          lockTableTimeOutSeconds: timeoutMillis ? timeoutMillis * 60 * 60 * 1000 : undefined,
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
      title="新建无锁结构变更"
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
      visible={modalStore.createDDLAlterVisible}
      onClose={() => {
        handleCancel(hasEdit);
      }}
    >
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
          label="变更定义"
          name="sqlType"
          initialValue={SqlType.CREATE}
          rules={[
            {
              required: true,
              message: '请选择变更定义',
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
          label="SQL 内容"
          className={styles.sqlContent}
          rules={[
            {
              required: true,
              message: '请填写 SQL 内容',
            },
          ]}
          style={{ height: '280px' }}
        >
          <CommonIDE
            initialSQL={modalStore.asyncTaskData?.sql}
            language={`${isMySQL ? 'obmysql' : 'oboracle'}`}
            onSQLChange={handleSqlChange}
          />
        </Form.Item>
        <FormItemPanel
          label={
            <HelpDoc leftText isTip doc="schemaChangeSwapTable">
              切换表设置
            </HelpDoc>
          }
          keepExpand
        >
          <Row>
            <Col span={6}>
              <Form.Item
                label={
                  <HelpDoc leftText isTip doc="schemaChangeSwapTableTimeout">
                    锁表超时时间
                  </HelpDoc>
                }
                required
              >
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
                  <InputNumber min={0} />
                </Form.Item>
                <span className={styles.hour}>小时</span>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="swapTableNameRetryTimes"
                label={
                  <HelpDoc leftText isTip doc="schemaChangeSwapTableRetryTimes">
                    失败重试次数
                  </HelpDoc>
                }
                initialValue={3}
                required
                rules={[
                  {
                    required: true,
                    message: '请输入失败重试次数',
                  },
                ]}
              >
                <InputNumber min={0} max={10} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="完成后原表清理策略"
            name="originTableCleanStrategy"
            initialValue={ClearStrategy.ORIGIN_TABLE_RENAME_AND_RESERVED}
            rules={[
              {
                required: true,
                message: '请选择清理策略',
              },
            ]}
          >
            <Radio.Group>
              <Radio value={ClearStrategy.ORIGIN_TABLE_RENAME_AND_RESERVED}>重命名不处理</Radio>
              <Radio value={ClearStrategy.ORIGIN_TABLE_DROP}>立即删除</Radio>
            </Radio.Group>
          </Form.Item>
        </FormItemPanel>
        <FormItemPanel label="任务设置" keepExpand>
          <TaskTimer isReadonlyPublicConn={false} />
          <Form.Item
            label="任务错误处理"
            name="errorStrategy"
            initialValue={ErrorStrategy.ABORT}
            rules={[
              {
                required: true,
                message: '请选择任务错误处理',
              },
            ]}
          >
            <Radio.Group>
              <Radio value={ErrorStrategy.ABORT}>停止任务</Radio>
              <Radio value={ErrorStrategy.CONTINUE}>忽略错误继续任务</Radio>
            </Radio.Group>
          </Form.Item>
        </FormItemPanel>
        <Form.Item
          label="备注"
          name="description"
          rules={[
            {
              max: 200,
              message: '备注不超过 200 个字符',
            },
          ]}
        >
          <Input.TextArea rows={3} placeholder="请输入备注" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
export default inject('modalStore')(observer(CreateDDLTaskModal));
