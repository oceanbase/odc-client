import FormItemPanel from '@/component/FormItemPanel';
import HelpDoc from '@/component/helpDoc';
import { ITable } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Select, Space } from 'antd';
import { IArchiveRange } from './index';
import styles from './index.less';

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
        label={formatMessage({ id: 'odc.DataClearTask.CreateModal.ArchiveRange.CleaningRange' })}
        /*清理范围*/ name="archiveRange"
        required
      >
        <Radio.Group>
          <Radio.Button value={IArchiveRange.PORTION}>
            {
              formatMessage({
                id: 'odc.DataClearTask.CreateModal.ArchiveRange.PartialArchive',
              }) /*部分归档*/
            }
          </Radio.Button>
          <Radio.Button value={IArchiveRange.ALL}>
            {
              formatMessage({
                id: 'odc.DataClearTask.CreateModal.ArchiveRange.ArchiveTheEntireDatabase',
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
                        id: 'odc.DataClearTask.CreateModal.ArchiveRange.TableName',
                      }) /*表名*/
                    }
                  </div>
                  <div style={{ width: '400px' }}>
                    <HelpDoc leftText isTip doc="dataArchiveFilterDoc">
                      {
                        formatMessage({
                          id: 'odc.DataClearTask.CreateModal.ArchiveRange.CleaningConditions',
                        }) /*清理条件*/
                      }
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
                                  id: 'odc.DataClearTask.CreateModal.ArchiveRange.PleaseSelect',
                                }), //请选择
                              },
                            ]}
                          >
                            <Select
                              showSearch
                              placeholder={formatMessage({
                                id: 'odc.DataClearTask.CreateModal.ArchiveRange.PleaseSelect',
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
                                id: 'odc.DataClearTask.CreateModal.ArchiveRange.EnterACleanupCondition',
                              })} /*请输入清理条件*/
                            />
                          </Form.Item>
                          {fields?.length > 1 && <DeleteOutlined onClick={() => remove(name)} />}
                        </Space>
                      ))}
                      <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          {
                            formatMessage({
                              id: 'odc.DataClearTask.CreateModal.ArchiveRange.Add',
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
