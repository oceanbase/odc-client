import { Button, Form } from 'antd';
import ManualRule from './ManualRule';

const ManualForm = ({ formRef, databases, setDatabases }) => {
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
                    key={`${index}_${field.key}_${field.name}`}
                    {...{
                      index,
                      fields,
                      formRef,
                      databases,
                      setDatabases,
                      fieldKey: field.key,
                      fieldName: field.name,
                      remove,
                    }}
                  />
                ))}
              </div>
              <Form.Item>
                <Button type="dashed" block onClick={() => add()} style={{ width: '746px' }}>
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
