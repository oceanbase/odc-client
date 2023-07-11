import { PlusOutlined } from '@ant-design/icons';
import { Button, Form } from 'antd';
import { useWatch } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import ManualRule from './ManualRule';

const ManualForm = ({ formRef, databases, setDatabases }) => {
  const [disabledAdd, setDisabledAdd] = useState<boolean>(true);
  const manual = useWatch('manual', formRef);
  const handleAdd = async (fn) => {
    const { manual } = await formRef.getFieldsValue();
    const lastOne = manual?.at(-1);
    if (
      lastOne?.dataSource &&
      lastOne?.database &&
      lastOne?.tableName !== '' &&
      lastOne?.columnName !== '' &&
      lastOne?.maskingAlgorithmId
    ) {
      fn?.();
      setDisabledAdd(true);
    }
  };
  useEffect(() => {
    const lastOne = manual?.at(-1) || manual?.[manual?.length - 1];
    if (
      lastOne?.dataSource &&
      lastOne?.database &&
      lastOne?.tableName !== '' &&
      lastOne?.columnName !== '' &&
      lastOne?.maskingAlgorithmId
    ) {
      setDisabledAdd(false);
    }
  }, [manual]);
  return (
    <>
      <div style={{ display: 'flex', columnGap: '8px', marginBottom: '8px' }}>
        <span style={{ width: '132px' }}>数据源</span>
        <span style={{ width: '132px' }}>数据库</span>
        <span style={{ width: '132px' }}>表</span>
        <span style={{ width: '132px' }}>列</span>
        <span style={{ width: '184px' }}>脱敏算法</span>
      </div>
      <Form form={formRef} layout="vertical">
        <Form.List name="manual">
          {(fields, { add, remove }, { errors }) => (
            <>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {fields?.map((field, index) => (
                  <ManualRule
                    key={field.key}
                    {...{
                      index,
                      fields,
                      formRef,
                      databases,
                      setDatabases,
                      fieldKey: field.key,
                      fieldName: field.name,
                      remove,
                      setDisabledAdd,
                    }}
                  />
                ))}
              </div>
              <Form.Item>
                <Button
                  disabled={disabledAdd}
                  type="dashed"
                  icon={<PlusOutlined />}
                  block
                  onClick={() => handleAdd(add)}
                  style={{ width: '746px' }}
                >
                  添加
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </>
  );
};

export default ManualForm;
