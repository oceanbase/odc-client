import { PlusOutlined } from '@ant-design/icons';
import { Button, Form } from 'antd';
import { useWatch } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import ManualRule from './ManualRule';

const ManualForm = ({ formRef, setFormDrawerDatabases }) => {
  const [disabledAdd, setDisabledAdd] = useState<boolean>(true);
  const manual = useWatch('manual', formRef);
  const handleAdd = async (fn) => {
    const { manual } = await formRef.getFieldsValue();
    if (
      manual?.every(
        (rule) =>
          rule?.dataSource &&
          rule?.database &&
          rule?.tableName !== '' &&
          rule?.columnName !== '' &&
          rule?.maskingAlgorithmId,
      )
    ) {
      fn?.();
      setDisabledAdd(true);
    }
  };
  useEffect(() => {
    if (
      manual?.every(
        (rule) =>
          rule?.dataSource &&
          rule?.database &&
          rule?.tableName !== '' &&
          rule?.columnName !== '' &&
          rule?.maskingAlgorithmId,
      )
    ) {
      setDisabledAdd(false);
    } else {
      setDisabledAdd(true);
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
                      fieldKey: field.key,
                      fieldName: field.name,
                      setFormDrawerDatabases,
                      remove,
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
