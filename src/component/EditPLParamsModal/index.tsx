/*
 * Copyright 2024 OceanBase
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

import { formatMessage } from '@/util/intl';
import { useEffect, useState } from 'react';
// compatible
import { ConnectionMode, IFormatPLSchema, IPLParam } from '@/d.ts';
import { Form, FormInstance, FormProps, message, Modal, Table } from 'antd';

import { getPLDebugExecuteSql } from '@/util/sql';
import CommonIDE from '../CommonIDE';
import styles from './index.less';
import ValueInput, { ValueList } from './ValueInput';

interface IProps extends FormProps {
  connectionMode?: ConnectionMode;
  plSchema?: IFormatPLSchema;
  executeLoading?: boolean;
  defaultAnonymousBlockDdl?: string;
  onSave: (params?: IPLParam[], ddl?: string) => void;
  visible: boolean;
  plAction: '' | 'DEBUG' | 'COMPILE' | 'EXEC';
  onCancel: () => void;
}

function EditPLParamasModal({
  visible,
  onCancel,
  onSave,
  plSchema,
  defaultAnonymousBlockDdl,
  connectionMode,
  plAction,
}: IProps) {
  const [loading, setLoading] = useState(false);
  const [anonymousBlockDdl, setAnonymousBlockDdl] = useState('');
  const [form] = Form.useForm<FormInstance<any>>();
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setAnonymousBlockDdl('');
    } else {
      /**
       * 计算anonymousBlockDdl
       */
      if (connectionMode === ConnectionMode.OB_ORACLE) {
        setAnonymousBlockDdl(
          defaultAnonymousBlockDdl || getPLDebugExecuteSql(plSchema, plAction === 'DEBUG'),
        );
      }
    }
  }, [visible]);
  if (!plSchema) {
    return null;
  }
  const { params = [] } = plSchema;
  function getColumns() {
    return [
      {
        title: '',
        dataIndex: 'index',
        key: 'index',
        width: 36,
        render(_, __, index) {
          return index + 1;
        },
      },
      {
        title: formatMessage({
          id: 'odc.component.EditPLParamsModal.Parameter',
        }),
        width: 160,
        dataIndex: 'paramName',
        key: 'paramName',
      },

      {
        title: formatMessage({
          id: 'odc.component.EditPLParamsModal.DataType',
        }),
        width: 136,
        dataIndex: 'dataType',
        key: 'dataType',
      },

      {
        title: formatMessage({ id: 'odc.component.EditPLParamsModal.Value' }),
        dataIndex: 'defaultValue',
        key: 'defaultValue',
        render(value: any, record: any) {
          return (
            <Form.Item
              name={record.paramName}
              initialValue={value}
              // rules={[
              //   {
              //     required: true,
              //     message: formatMessage({
              //       id: 'odc.component.EditPLParamsModal.ItCannotBeEmpty',
              //     }),
              //   },
              // ]}
            >
              <ValueInput connectionMode={connectionMode} />
            </Form.Item>
          );
        },
      },
    ];
  }
  const columns = getColumns();
  const dataSource = params?.filter(
    (param) => param.paramMode && /IN/.test(param.paramMode.toUpperCase()),
  );

  const isOracle = connectionMode === ConnectionMode.OB_ORACLE;

  const handleSubmit = async () => {
    setLoading(true);
    const values = await form?.validateFields?.();
    if (!values) {
      return;
    }
    let params = [];
    try {
      if (isOracle) {
        if (!anonymousBlockDdl) {
          message.warn(
            formatMessage({ id: 'odc.component.EditPLParamsModal.StatementCannotBeEmpty' }), //语句不能为空
          );
          return;
        }
        await onSave(null, anonymousBlockDdl);
      } else {
        // 入参数更新 paramMode 为 IN params
        params = plSchema.params.map((item) => {
          const { paramName } = item;
          let cloneItem = { ...item };
          if (typeof values[paramName] !== 'undefined') {
            const v = values[paramName];
            switch (v) {
              case ValueList.NULL: {
                cloneItem.defaultValue = null;
                break;
              }
              case ValueList.DEFAULT: {
                cloneItem.defaultValue = item.originDefaultValue;
                break;
              }
              default: {
                cloneItem.defaultValue = values[paramName];
              }
            }
          }
          return cloneItem;
        });
        await onSave(params);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      zIndex={1002}
      width={isOracle ? 640 : 520}
      destroyOnClose
      title={formatMessage({
        id: 'odc.component.EditPLParamsModal.SetParameters',
      })}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      {isOracle ? (
        <div style={{ height: 400 }}>
          <CommonIDE
            bordered
            language={'oboracle'}
            session={null}
            initialSQL={anonymousBlockDdl}
            onSQLChange={(sql) => {
              setAnonymousBlockDdl(sql);
            }}
          />
        </div>
      ) : (
        <div className={styles.table}>
          <Form form={form} layout="inline">
            <Table
              size="small"
              rowKey="paramName"
              bordered={true}
              dataSource={dataSource}
              columns={columns}
              pagination={false}
            />
          </Form>
        </div>
      )}
    </Modal>
  );
}

export default EditPLParamasModal;
