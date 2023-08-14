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
import InputBigNumber from '@/component/InputBigNumber';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import TaskTimer from '@/component/Task/component/TimerSelect';
import {
  ConnectionMode,
  EXPORT_TYPE,
  IExportResultSetFileType,
  IMPORT_ENCODING,
  TaskExecStrategy,
  TaskPageScope,
  TaskPageType,
  TaskType,
} from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
import type { TaskStore } from '@/store/task';
import { Button, Col, Drawer, Form, Input, Modal, Row, Select, Space, Typography } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import DatabaseSelect from '../../component/DatabaseSelect';
import { CsvFormItemPanel } from './CsvFormItemPanel';
import styles from './index.less';

const { Text } = Typography;
const { Option } = Select;

interface IProps {
  taskStore?: TaskStore;
  modalStore?: ModalStore;
  projectId?: number;
}

const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore, projectId } = props;
  const [form] = Form.useForm();
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const databaseId = Form.useWatch('databaseId', form);
  const { database } = useDBSession(databaseId);
  const connection = database?.dataSource;
  const isMySQL = connection?.dialectType === ConnectionMode.OB_MYSQL;
  const { resultSetExportData } = modalStore;
  const initSql = resultSetExportData?.sql;

  const handleSqlChange = (sql: string) => {
    form?.setFieldsValue({
      sql,
    });
    setHasEdit(true);
  };

  const handleFieldsChange = () => {
    setHasEdit(true);
  };

  const hadleReset = () => {
    form.resetFields(null);
  };

  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: '确认取消导出结果集吗？',
        centered: true,
        onOk: () => {
          modalStore.changeCreateResultSetExportTaskModal(false);
          hadleReset();
        },
      });
    } else {
      modalStore.changeCreateResultSetExportTaskModal(false);
      hadleReset();
    }
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const {
          databaseId,
          executionStrategy,
          executionTime,
          sql,
          description,
          fileFormat,
          fileEncoding,
          csvFormat,
          fileName,
          maxRows,
        } = values;
        const parameters = {
          sql,
          fileFormat,
          fileEncoding,
          csvFormat,
          fileName,
          maxRows,
        };

        const data = {
          projectId,
          databaseId,
          executionStrategy,
          taskType: TaskType.EXPORT_RESULT_SET,
          parameters,
          executionTime,
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
          openTasksPage(TaskPageType.EXPORT_RESULT_SET, TaskPageScope.CREATED_BY_CURRENT_USER);
        }
      })
      .catch((errorInfo) => {
        console.error(JSON.stringify(errorInfo));
      });
  };

  useEffect(() => {
    if (initSql) {
      handleSqlChange(initSql);
    }
  }, [initSql]);

  return (
    <Drawer
      destroyOnClose
      className={styles.drawer}
      width={520}
      title="新建导出结果集"
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
      visible={modalStore.createResultSetExportTaskVisible}
      onClose={() => {
        handleCancel(hasEdit);
      }}
    >
      <Form
        name="basic"
        initialValues={{
          executionStrategy: TaskExecStrategy.AUTO,
          databaseId: resultSetExportData?.databaseId,
          fileFormat: EXPORT_TYPE.CSV,
          fileEncoding: IMPORT_ENCODING.UTF8,
          maxRows: 1000,
          csvFormat: {
            isContainColumnHeader: true,
            isTransferEmptyString: true,
            columnSeparator: ',',
            columnDelimiter: '"',
            lineSeparator: '\\r\\n',
          },
        }}
        layout="vertical"
        requiredMark="optional"
        form={form}
        onFieldsChange={handleFieldsChange}
      >
        <DatabaseSelect projectId={projectId} />
        <Form.Item
          label={
            <Space>
              <span>查询 SQL</span>
              <Text type="secondary">仅支持输入单条 SQL</Text>
            </Space>
          }
          name="sql"
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
            initialSQL={initSql}
            language={`${isMySQL ? 'obmysql' : 'oboracle'}`}
            onSQLChange={(sql) => {
              handleSqlChange(sql);
            }}
          />
        </Form.Item>
        <Form.Item
          name="maxRows"
          label="查询结果条数限制"
          rules={[
            {
              required: true,
              message: '请填写条数限制',
            },
          ]}
        >
          <InputBigNumber isInt min="1" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item
          name="fileName"
          label="文件名称"
          rules={[
            {
              required: true,
              message: '请填写文件名称',
            },
          ]}
        >
          <Input style={{ width: 320 }} />
        </Form.Item>
        <Form.Item required name="fileFormat" label="文件格式">
          <Select style={{ width: 200 }}>
            <Option value={IExportResultSetFileType.CSV}>{IExportResultSetFileType.CSV}</Option>
            <Option value={IExportResultSetFileType.SQL}>{IExportResultSetFileType.SQL}</Option>
            <Option value={IExportResultSetFileType.EXCEL}>{IExportResultSetFileType.EXCEL}</Option>
          </Select>
        </Form.Item>
        <Row>
          <Col span={11}>
            <Form.Item required name="fileEncoding" label="文件编码">
              <Select style={{ width: 200 }}>
                <Option value={IMPORT_ENCODING.UTF8}>{IMPORT_ENCODING.UTF8}</Option>
                <Option value={IMPORT_ENCODING.UTF16}>{IMPORT_ENCODING.UTF16}</Option>
                <Option value={IMPORT_ENCODING.GBK}>{IMPORT_ENCODING.GBK}</Option>
                <Option value={IMPORT_ENCODING.GB2312}>{IMPORT_ENCODING.GB2312}</Option>
                <Option value={IMPORT_ENCODING.BIG5}>{IMPORT_ENCODING.BIG5}</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <CsvFormItemPanel />
        <FormItemPanel label="任务设置" keepExpand>
          <TaskTimer isReadonlyPublicConn={false} />
        </FormItemPanel>
        <DescriptionInput />
      </Form>
    </Drawer>
  );
};

export default inject('taskStore', 'modalStore')(observer(CreateModal));