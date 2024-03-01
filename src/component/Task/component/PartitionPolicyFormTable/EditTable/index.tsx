import React from 'react';
import { Form, Select } from 'antd';
import type { FormInstance } from 'antd';
import VirtualList from 'rc-virtual-list';
import RuleFormItem from '../RuleFormItem';
import { PARTITION_KEY_INVOKER } from '@/d.ts';
import styles from './index.less';

const TABLE_ROW_HEIGHT = 72;

const columns = [
  {
    title: '分区键',
    width: '80px',
  },
  {
    title: '字段类型',
    width: '80px',
  },
  {
    title: '创建方式',
    width: '108px',
  },
  {
    title: '细则',
    width: '380px',
  },
];

const TypeOptions = [
  {
    label: '顺序递增',
    value: PARTITION_KEY_INVOKER.TIME_INCREASING_GENERATOR,
  },
  {
    label: '自定义',
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

  const handleChange = (name: number) => {
    form.setFieldValue(['option', 'partitionKeyConfigs', name, 'fromCurrentTime'], null);
    form.setFieldValue(['option', 'partitionKeyConfigs', name, 'primary3'], null);
  };

  return (
    <tr>
      <td style={{ width: columns[0].width }}>
        <div className={styles.content}>{column?.name}</div>
      </td>
      <td style={{ width: columns[1].width }}>
        <div className={styles.content}>
          {column?.type?.localizedMessage || column?.type?.dataTypeName}
        </div>
      </td>
      <td style={{ width: columns[2].width }}>
        <div className={styles.content}>
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
      </td>
      <td style={{ width: columns[3].width }}>
        <div className={styles.content}>
          <RuleFormItem field={field} />
        </div>
      </td>
    </tr>
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
    <>
      <table className={styles.table}>
        <thead>
          <tr className={styles.thead}>
            {columns?.map((item) => {
              return (
                <th className={styles.theadCell} style={{ width: item?.width }}>
                  {item?.title}
                </th>
              );
            })}
          </tr>
        </thead>
      </table>
      <table className={styles.table}>
        <tbody>
          <TableForm form={form} />
        </tbody>
      </table>
    </>
  );
};

export default EditTable;
