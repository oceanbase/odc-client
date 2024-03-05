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

import { ITable } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Select, Space, Typography } from 'antd';
import classNames from 'classnames';
import { IArchiveRange } from './index';
import ArchiveRangeTip from '../../component/ArchiveRangeTip';
import styles from './index.less';
const { Text } = Typography;
interface IProps {
  tables: ITable[];
  enabledTargetTable?: boolean;
}
const ArchiveRange: React.FC<IProps> = (props) => {
  const { tables, enabledTargetTable = false } = props;
  const tablesOptions = tables?.map((item) => ({
    label: item.tableName,
    value: item.tableName,
  }));
  return (
    <>
      <Form.Item
        label={formatMessage({
          id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.ArchiveScope',
        })}
        /*归档范围*/ name="archiveRange"
        required
      >
        <Radio.Group>
          <Radio value={IArchiveRange.PORTION}>
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.PartialArchive',
              }) /*部分归档*/
            }
          </Radio>
          <Radio value={IArchiveRange.ALL}>
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.ArchiveTheEntireDatabase',
              }) /*整库归档*/
            }
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const archiveRange = getFieldValue('archiveRange') || [];
          const tables = getFieldValue('tables') || [];
          if (archiveRange !== IArchiveRange.PORTION) {
            return null;
          }
          return (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space
                className={classNames(styles.tables, {
                  [styles.delete]: tables?.length > 1,
                })}
              >
                <div>
                  {
                    formatMessage({
                      id: 'odc.src.component.Task.DataArchiveTask.CreateModal.ArchiveTable',
                    }) /* 归档表 */
                  }
                </div>
                <div>
                  <Space>
                    <span>
                      {
                        formatMessage({
                          id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.FilterConditions',
                        }) /*过滤条件*/
                      }
                    </span>
                    <Text type="secondary">
                      {
                        formatMessage({
                          id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.Optional',
                        }) /*(可选)*/
                      }
                    </Text>
                    <ArchiveRangeTip
                      label={
                        formatMessage({
                          id: 'odc.src.component.Task.DataArchiveTask.CreateModal.Archive',
                        }) /* 归档 */
                      }
                    />
                  </Space>
                </div>
                {enabledTargetTable && (
                  <div>
                    {formatMessage({
                      id: 'src.component.Task.DataArchiveTask.CreateModal.50BCBA55' /*目标表*/,
                    })}

                    <Text type="secondary">
                      {
                        formatMessage({
                          id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.Optional',
                        }) /*(可选)*/
                      }
                    </Text>
                  </div>
                )}
              </Space>
              <Form.List name="tables">
                {(fields, { add, remove }) => (
                  <div className={styles.infoBlock}>
                    {fields.map(({ key, name, ...restField }: any, index) => (
                      <div
                        key={key}
                        className={classNames(styles.tables, {
                          [styles.delete]: fields?.length > 1,
                        })}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, 'tableName']}
                          rules={[
                            {
                              required: true,
                              message: formatMessage({
                                id: 'odc.src.component.Task.DataArchiveTask.CreateModal.PleaseSelectTheTable',
                              }), //'请选择表'
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            placeholder={formatMessage({
                              id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.PleaseSelect',
                            })}
                            /*请选择*/ options={tablesOptions}
                            filterOption={(input, option) =>
                              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                          />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'conditionExpression']}>
                          <Input
                            placeholder={formatMessage({
                              id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.EnterAFilterCondition',
                            })} /*请输入过滤条件*/
                          />
                        </Form.Item>
                        {enabledTargetTable && (
                          <Form.Item {...restField} name={[name, 'targetTableName']}>
                            <Input
                              placeholder={
                                formatMessage({
                                  id: 'src.component.Task.DataArchiveTask.CreateModal.271D9B51',
                                }) /*"请输入"*/
                              }
                            />
                          </Form.Item>
                        )}

                        {fields?.length > 1 && <DeleteOutlined onClick={() => remove(name)} />}
                      </div>
                    ))}
                    <Form.Item
                      style={{
                        marginBottom: 0,
                      }}
                    >
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
          );
        }}
      </Form.Item>
    </>
  );
};
export default ArchiveRange;
