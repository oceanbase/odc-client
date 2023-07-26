import FormItemPanel from '@/component/FormItemPanel';
import HelpDoc from '@/component/helpDoc';
import { ITable } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Select, Space, Typography } from 'antd';
import { IArchiveRange } from './index';
import styles from './index.less';

const { Text } = Typography;

interface IProps {
  tables: ITable[];
}

const ArchiveRange: React.FC<IProps> = (props) => {
  const { tables } = props;
  const tablesOptions = tables?.map((item) => ({
    label: item.tableName,
    value: item.tableName,
  }));
  return (
    <>
      <Form.Item
        label={formatMessage({ id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.ArchiveScope' })}
        /*归档范围*/ name="archiveRange"
        required
      >
        <Radio.Group>
          <Radio.Button value={IArchiveRange.PORTION}>
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.PartialArchive',
              }) /*部分归档*/
            }
          </Radio.Button>
          <Radio.Button value={IArchiveRange.ALL}>
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.ArchiveTheEntireDatabase',
              }) /*整库归档*/
            }
          </Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const archiveRange = getFieldValue('archiveRange') || [];
          if (archiveRange !== IArchiveRange.PORTION) {
            return null;
          }
          return (
            <FormItemPanel keepExpand>
              <Space direction="vertical">
                <Space className={styles.infoLabel}>
                  <div style={{ width: '220px' }}>
                    {
                      formatMessage({
                        id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.TableName',
                      }) /*表名*/
                    }
                  </div>
                  <div style={{ width: '400px' }}>
                    <HelpDoc leftText isTip doc="dataArchiveFilterDoc">
                      <Space>
                        <span>过滤条件</span>
                        <Text type="secondary">(可选)</Text>
                      </Space>
                    </HelpDoc>
                  </div>
                </Space>
                <Form.List name="tables">
                  {(fields, { add, remove }) => (
                    <div className={styles.infoBlock}>
                      {fields.map(({ key, name, ...restField }: any, index) => (
                        <Space key={key} align="baseline">
                          <Form.Item
                            {...restField}
                            style={{ width: '220px' }}
                            name={[name, 'tableName']}
                            rules={[
                              {
                                required: true,
                                message: formatMessage({
                                  id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.PleaseSelect',
                                }), //请选择
                              },
                            ]}
                          >
                            <Select
                              showSearch
                              placeholder={formatMessage({
                                id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.PleaseSelect',
                              })} /*请选择*/
                              options={tablesOptions}
                              filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            style={{ width: '400px' }}
                            name={[name, 'conditionExpression']}
                          >
                            <Input
                              placeholder={formatMessage({
                                id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.EnterAFilterCondition',
                              })} /*请输入过滤条件*/
                            />
                          </Form.Item>
                          {fields?.length > 1 && <DeleteOutlined onClick={() => remove(name)} />}
                        </Space>
                      ))}
                      <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          {
                            formatMessage({
                              id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.Add',
                            }) /*添加*/
                          }
                        </Button>
                      </Form.Item>
                    </div>
                  )}
                </Form.List>
              </Space>
            </FormItemPanel>
          );
        }}
      </Form.Item>
    </>
  );
};

export default ArchiveRange;
