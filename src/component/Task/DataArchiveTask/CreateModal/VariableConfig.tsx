import FormItemPanel from '@/component/FormItemPanel';
import HelpDoc from '@/component/helpDoc';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Select, Space, Tooltip } from 'antd';
import { variable } from './index';
import styles from './index.less';

const timeFormatOptions = ['yyyy-MM-dd', 'HH:mm:ss', 'yyyyMMdd'].map((item) => ({
  label: item,
  value: item,
}));
const operatorOptions = ['+', '-'].map((item) => ({ label: item, value: item }));
const timeUnitOptions = [
  {
    label: formatMessage({ id: 'odc.DataArchiveTask.CreateModal.VariableConfig.Points' }), //分
    value: 's',
  },
  {
    label: formatMessage({ id: 'odc.DataArchiveTask.CreateModal.VariableConfig.Hours' }), //小时
    value: 'h',
  },
  {
    label: formatMessage({ id: 'odc.DataArchiveTask.CreateModal.VariableConfig.Day' }), //日
    value: 'd',
  },
  {
    label: formatMessage({ id: 'odc.DataArchiveTask.CreateModal.VariableConfig.Zhou' }), //周
    value: 'w',
  },
  {
    label: formatMessage({ id: 'odc.DataArchiveTask.CreateModal.VariableConfig.Month' }), //月
    value: 'm',
  },
  {
    label: formatMessage({ id: 'odc.DataArchiveTask.CreateModal.VariableConfig.Year' }), //年
    value: 'y',
  },
];

interface IProps {}

const VariableConfig: React.FC<IProps> = (props) => {
  //
  return (
    <FormItemPanel
      keepExpand
      label={
        <Space>
          {
            formatMessage({
              id: 'odc.DataArchiveTask.CreateModal.VariableConfig.VariableConfiguration',
            }) /*变量配置*/
          }

          <span className={styles.desc}>
            <HelpDoc leftText isTip doc="dataArchiveVariablesDoc">
              变量可在归档配置的过滤条件中引用 (可选)
            </HelpDoc>
          </span>
        </Space>
      }
    >
      <Space direction="vertical">
        <Space className={styles.infoLabel}>
          <div style={{ width: '194px' }}>
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.VariableConfig.VariableName',
              }) /*变量名*/
            }
          </div>
          <div style={{ width: '170px' }}>
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.VariableConfig.TimeFormat',
              }) /*时间格式*/
            }
          </div>
          <div style={{ width: '305px' }}>
            <HelpDoc leftText isTip doc="dataArchiveTimeDoc">
              {
                formatMessage({
                  id: 'odc.DataArchiveTask.CreateModal.VariableConfig.TimeOperation',
                }) /*时间运算*/
              }
            </HelpDoc>
          </div>
        </Space>
        <Form.List name="variables">
          {(fields, { add, remove }) => (
            <div className={styles.infoBlock}>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} align="baseline">
                  <Form.Item {...restField} style={{ width: '194px' }} name={[name, 'name']}>
                    <Input
                      placeholder={formatMessage({
                        id: 'odc.DataArchiveTask.CreateModal.VariableConfig.PleaseEnter',
                      })} /*请输入*/
                    />
                  </Form.Item>
                  <Form.Item {...restField} style={{ width: '170px' }} name={[name, 'format']}>
                    <Select
                      placeholder={formatMessage({
                        id: 'odc.DataArchiveTask.CreateModal.VariableConfig.PleaseSelect',
                      })}
                      /*请选择*/ options={timeFormatOptions}
                    />
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
                                  placeholder={formatMessage({
                                    id: 'odc.DataArchiveTask.CreateModal.VariableConfig.PleaseSelect',
                                  })} /*请选择*/
                                  style={{ width: 80 }}
                                  options={operatorOptions}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                style={{ width: '80px' }}
                                name={[name, 'step']}
                              >
                                <InputNumber
                                  placeholder={formatMessage({
                                    id: 'odc.DataArchiveTask.CreateModal.VariableConfig.PleaseEnter',
                                  })}
                                  /*请输入*/ min={1}
                                  style={{ width: 80 }}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                style={{ width: '80px' }}
                                name={[name, 'unit']}
                              >
                                <Select
                                  placeholder={formatMessage({
                                    id: 'odc.DataArchiveTask.CreateModal.VariableConfig.PleaseSelect',
                                  })} /*请选择*/
                                  style={{ width: 80 }}
                                  options={timeUnitOptions}
                                />
                              </Form.Item>
                              <Tooltip title="添加时间运算">
                                <Button type="text" disabled={disabledAdd}>
                                  <PlusOutlined onClick={() => _add()} />
                                </Button>
                              </Tooltip>
                              <Tooltip title="删除时间运算">
                                <Button type="text">
                                  <MinusOutlined
                                    onClick={() => {
                                      if (subFields?.length > 1) _remove(name);
                                    }}
                                  />
                                </Button>
                              </Tooltip>
                            </Space>
                          ))}
                        </div>
                      );
                    }}
                  </Form.List>
                  {fields?.length > 1 && (
                    <Tooltip title="删除变量">
                      <DeleteOutlined onClick={() => remove(name)} />
                    </Tooltip>
                  )}
                </Space>
              ))}
              <Form.Item style={{ marginBottom: 0, width: '100%' }}>
                <Button type="dashed" onClick={() => add(variable)} block icon={<PlusOutlined />}>
                  {
                    formatMessage({
                      id: 'odc.DataArchiveTask.CreateModal.VariableConfig.AddVariables',
                    }) /*添加变量*/
                  }
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
