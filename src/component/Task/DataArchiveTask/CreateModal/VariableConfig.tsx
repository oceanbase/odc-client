import FormItemPanel from '@/component/FormItemPanel';
import HelpDoc from '@/component/helpDoc';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Select, Space } from 'antd';
import { variable } from './index';
import styles from './index.less';

const timeFormatOptions = ['yyyy-MM-dd', 'HH:mm:ss', 'yyyyMMdd'].map((item) => ({
  label: item,
  value: item,
}));
const operatorOptions = ['+', '-'].map((item) => ({ label: item, value: item }));
const timeUnitOptions = [
  {
    label: '分',
    value: 's',
  },
  {
    label: '小时',
    value: 'h',
  },
  {
    label: '日',
    value: 'd',
  },
  {
    label: '周',
    value: 'w',
  },
  {
    label: '月',
    value: 'm',
  },
  {
    label: '年',
    value: 'y',
  },
];

interface IProps {}

const VariableConfig: React.FC<IProps> = (props) => {
  return (
    <FormItemPanel
      keepExpand
      label={
        <Space>
          变量配置<span className={styles.desc}>变量可在归档配置的过滤条件中引用</span>
        </Space>
      }
    >
      <Space direction="vertical">
        <Space className={styles.infoLabel}>
          <div style={{ width: '194px' }}>变量名</div>
          <div style={{ width: '170px' }}>时间格式</div>
          <div style={{ width: '250px' }}>
            <HelpDoc leftText isTip doc="dataArchiveTimeDoc">
              时间运算
            </HelpDoc>
          </div>
        </Space>
        <Form.List name="variables">
          {(fields, { add, remove }) => (
            <div className={styles.infoBlock}>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} align="baseline">
                  <Form.Item {...restField} style={{ width: '194px' }} name={[name, 'name']}>
                    <Input placeholder="请输入" />
                  </Form.Item>
                  <Form.Item {...restField} style={{ width: '170px' }} name={[name, 'format']}>
                    <Select placeholder="请选择" options={timeFormatOptions} />
                  </Form.Item>
                  <Form.List name={[name, 'pattern']}>
                    {(subFields, { add: _add, remove: _remove }) => {
                      const disabledAdd = subFields.length >= 3;
                      return (
                        <div className={styles.infoBlock}>
                          {subFields.map(({ key, name, ...restField }) => (
                            <Space size={5} key={key} align="baseline">
                              <Form.Item
                                {...restField}
                                style={{ width: '80px' }}
                                name={[name, 'operator']}
                              >
                                <Select
                                  placeholder="请选择"
                                  style={{ width: 80 }}
                                  options={operatorOptions}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                style={{ width: '80px' }}
                                name={[name, 'step']}
                              >
                                <InputNumber placeholder="请输入" min={1} style={{ width: 80 }} />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                style={{ width: '80px' }}
                                name={[name, 'unit']}
                              >
                                <Select
                                  placeholder="请选择"
                                  style={{ width: 80 }}
                                  options={timeUnitOptions}
                                />
                              </Form.Item>
                              <Button type="text" disabled={disabledAdd}>
                                <PlusOutlined onClick={() => _add()} />
                              </Button>
                              <Button type="text">
                                <MinusOutlined
                                  onClick={() => {
                                    if (subFields?.length > 1) _remove(name);
                                  }}
                                />
                              </Button>
                            </Space>
                          ))}
                        </div>
                      );
                    }}
                  </Form.List>
                  {fields?.length > 1 && <DeleteOutlined onClick={() => remove(name)} />}
                </Space>
              ))}
              <Form.Item style={{ marginBottom: 0, width: '100%' }}>
                <Button type="dashed" onClick={() => add(variable)} block icon={<PlusOutlined />}>
                  添加变量
                </Button>
              </Form.Item>
            </div>
          )}
        </Form.List>
      </Space>
    </FormItemPanel>
  );
};

export default VariableConfig;
