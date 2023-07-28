import { formatMessage } from '@/util/intl';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form } from 'antd';
import ManualRule from './ManualRule';

const ManualForm = ({ formRef, databasesMap, setDatabasesMap }) => {
  return (
    <>
      <div style={{ display: 'flex', columnGap: '8px', marginBottom: '8px' }}>
        <span style={{ width: '132px' }}>
          {formatMessage({ id: 'odc.SensitiveColumn.components.ManualForm.DataSource' }) /*数据源*/}
        </span>
        <span style={{ width: '132px' }}>
          {formatMessage({ id: 'odc.SensitiveColumn.components.ManualForm.Database' }) /*数据库*/}
        </span>
        <span style={{ width: '132px' }}>
          {formatMessage({ id: 'odc.SensitiveColumn.components.ManualForm.Table' }) /*表*/}
        </span>
        <span style={{ width: '132px' }}>
          {formatMessage({ id: 'odc.SensitiveColumn.components.ManualForm.Column' }) /*列*/}
        </span>
        <span style={{ width: '184px' }}>
          {
            formatMessage({
              id: 'odc.SensitiveColumn.components.ManualForm.DesensitizationAlgorithm',
            }) /*脱敏算法*/
          }
        </span>
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
                      databasesMap,
                      setDatabasesMap,
                      remove,
                    }}
                  />
                ))}
              </div>
              <Form.Item>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  block
                  onClick={() => add()}
                  style={{ width: '746px' }}
                >
                  {formatMessage({ id: 'odc.SensitiveColumn.components.ManualForm.Add' }) /*添加*/}
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
