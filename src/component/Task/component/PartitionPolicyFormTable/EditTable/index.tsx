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
import React from 'react';
import { Form, Select, Typography } from 'antd';
import type { FormInstance } from 'antd';
import VirtualList from 'rc-virtual-list';
import RuleFormItem from '../RuleFormItem';
import { PARTITION_KEY_INVOKER } from '@/d.ts';
import styles from './index.less';

const TABLE_ROW_HEIGHT = 72;

const columns = [
  {
    title: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.EditTable.6B748774',
    }), //'分区键'
    width: '80px',
  },
  {
    title: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.EditTable.F56607BB',
    }), //'字段类型'
    width: '80px',
  },
  {
    title: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.EditTable.1E12C404',
    }), //'创建方式'
    width: '108px',
  },
  {
    title: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.EditTable.3ADF7B62',
    }), //'细则'
    width: '380px',
  },
];

const TypeOptions = [
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.EditTable.397A9C98',
    }), //'顺序递增'
    value: PARTITION_KEY_INVOKER.TIME_INCREASING_GENERATOR,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.EditTable.1ED9B737',
    }), //'自定义'
    value: PARTITION_KEY_INVOKER.CUSTOM_GENERATOR,
  },
];

interface ITableRowProps {
  form: FormInstance<any>;
  field: any;
}
const Row: React.FC<ITableRowProps> = (props) => {
  const { form, field } = props;
  const column = form.getFieldValue(['option', 'partitionKeyConfigs', field.name]) ?? {};
  const isDate = !!column?.type?.localizedMessage;
  const _TypeOptions = TypeOptions?.filter((item) =>
    isDate ? true : item.value === PARTITION_KEY_INVOKER.CUSTOM_GENERATOR,
  );
  const dataTypeName = column?.type?.localizedMessage || column?.type?.dataTypeName;

  const handleChange = (name: number) => {
    form.setFieldValue(['option', 'partitionKeyConfigs', name, 'fromCurrentTime'], null);
    form.setFieldValue(['option', 'partitionKeyConfigs', name, 'primary3'], null);
  };

  return (
    <div className={styles.row}>
      <div className={styles.td}>
        <div className={styles.content}>
          <Typography.Text ellipsis title={column?.name}>
            {column?.name}
          </Typography.Text>
        </div>
      </div>
      <div className={styles.td}>
        <div className={styles.content}>
          <Typography.Text ellipsis title={dataTypeName}>
            {dataTypeName}
          </Typography.Text>
        </div>
      </div>
      <div className={styles.td}>
        <div className={styles.typeSelect}>
          <Form.Item
            {...field}
            name={[field.name, 'partitionKeyInvoker']}
            style={{ marginBottom: 0 }}
          >
            <Select
              options={_TypeOptions}
              style={{ width: 90 }}
              onChange={() => {
                handleChange(field.name);
              }}
            />
          </Form.Item>
        </div>
      </div>
      <div className={styles.td}>
        <div className={styles.ruleFormItem}>
          <RuleFormItem field={field} precision={column?.type?.precision} />
        </div>
      </div>
    </div>
  );
};

interface TableFormProps {
  form: FormInstance<any>;
}

const TableForm: React.FC<TableFormProps> = (props) => {
  const { form } = props;

  return (
    <Form.List name={['option', 'partitionKeyConfigs']}>
      {(fields) => {
        return (
          <VirtualList
            data={fields}
            height={Math.min(fields?.length, 4) * TABLE_ROW_HEIGHT}
            itemHeight={TABLE_ROW_HEIGHT}
            itemKey="name"
          >
            {(field) => <Row field={field} form={form} />}
          </VirtualList>
        );
      }}
    </Form.List>
  );
};

interface IEditTableProps {
  form: FormInstance<any>;
}

const EditTable: React.FC<IEditTableProps> = (props) => {
  const { form } = props;
  return (
    <div className={styles.editTable}>
      <div className={styles.thead}>
        {columns?.map((item) => {
          return <div className={styles.theadCell}>{item?.title}</div>;
        })}
      </div>
      <div className={styles.table}>
        <TableForm form={form} />
      </div>
    </div>
  );
};

export default EditTable;
