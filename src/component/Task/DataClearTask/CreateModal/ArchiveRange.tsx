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
import { Button, Form, Input, Radio, Select, Space, Checkbox, Typography } from 'antd';
import classNames from 'classnames';
import { IArchiveRange } from './index';
import ArchiveRangeTip from '../../component/ArchiveRangeTip';
import styles from './index.less';
import { useState } from 'react';
import { PartitionTextArea } from '../../component/PartitionTextArea';

const { TextArea } = Input;
const { Text, Link } = Typography;

interface IProps {
  tables: ITable[];
  needCheckBeforeDelete?: boolean;
}
const ArchiveRange: React.FC<IProps> = (props) => {
  const { tables, needCheckBeforeDelete = false } = props;
  const [enablePartition, setEnablePartition] = useState<boolean>(false);
  const tablesOptions = tables?.map((item) => ({
    label: item.tableName,
    value: item.tableName,
  }));
  const hasAdvancedOptionCol = enablePartition || needCheckBeforeDelete;
  return (
    <>
      <Form.Item
        label={formatMessage({
          id: 'odc.DataClearTask.CreateModal.ArchiveRange.CleaningRange',
        })}
        /*清理范围*/ name="archiveRange"
        required
      >
        <Radio.Group>
          <Radio value={IArchiveRange.PORTION}>
            {
              formatMessage({
                id: 'odc.DataClearTask.CreateModal.ArchiveRange.PartialCleaning',
              }) /*部分清理*/
            }
          </Radio>
          <Radio value={IArchiveRange.ALL}>
            {
              formatMessage({
                id: 'odc.DataClearTask.CreateModal.ArchiveRange.CleanUpTheEntireDatabase',
              }) /*整库清理*/
            }
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const archiveRange = getFieldValue('archiveRange') || [];
          if (archiveRange !== IArchiveRange.PORTION) {
            return null;
          }
          const tables = getFieldValue('tables') || [];
          return (
            <div className={styles.tableHeader}>
              <div className={styles.tableHeaderExtra}>
                <div>清理设置</div>
                <div>
                  <Checkbox
                    onChange={() => {
                      setEnablePartition(!enablePartition);
                    }}
                  >
                    指定分区
                  </Checkbox>
                </div>
              </div>
              <div
                className={classNames(styles.tables, styles.title, {
                  [styles.delete]: tables?.length > 1,
                  [styles.advancedOption]: needCheckBeforeDelete || enablePartition,
                })}
              >
                <div className={styles.tableTitle} style={{ width: 160, padding: '3px 8px' }}>
                  清理表
                </div>
                <div className={styles.tableTitle}>
                  <div style={{ display: 'inline-flex', gap: 4, padding: '3px 8px' }}>
                    {
                      formatMessage({
                        id: 'odc.DataClearTask.CreateModal.ArchiveRange.CleaningConditions',
                      }) /*清理条件*/
                    }
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
                          id: 'odc.src.component.Task.DataClearTask.CreateModal.CleanUp',
                        }) /* 清理 */
                      }
                    />
                  </div>
                </div>
                {hasAdvancedOptionCol && (
                  <div className={styles.tableTitle}>
                    <span style={{ padding: '3px 8px', display: 'inline-flex', gap: '4px' }}>
                      <span>高级设置</span>
                      <Text type="secondary">
                        {
                          formatMessage({
                            id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.Optional',
                          }) /*(可选)*/
                        }
                      </Text>
                    </span>
                  </div>
                )}
              </div>
              <Form.List name="tables">
                {(fields, { add, remove }) => (
                  <div className={styles.infoBlock}>
                    {fields.map(({ key, name, ...restField }: any, index) => (
                      <div
                        key={key}
                        className={classNames(styles.tables, {
                          [styles.delete]: fields?.length > 1,
                          [styles.advancedOption]: hasAdvancedOptionCol,
                        })}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, 'tableName']}
                          rules={[
                            {
                              required: true,
                              message: formatMessage({
                                id: 'odc.DataClearTask.CreateModal.ArchiveRange.PleaseSelect',
                              }), //请选择
                            },
                          ]}
                          style={{ width: 160 }}
                        >
                          <Select
                            showSearch
                            placeholder={formatMessage({
                              id: 'odc.DataClearTask.CreateModal.ArchiveRange.PleaseSelect',
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
                              id: 'odc.DataClearTask.CreateModal.ArchiveRange.EnterACleanupCondition',
                            })} /*请输入清理条件*/
                          />
                        </Form.Item>
                        {(needCheckBeforeDelete || enablePartition) && (
                          <div
                            style={{ display: 'flex', flexDirection: 'column' }}
                            className={styles.multiInputBox}
                          >
                            {needCheckBeforeDelete && (
                              <Form.Item
                                {...restField}
                                name={[name, 'targetTableName']}
                                rules={[
                                  {
                                    required: true,
                                    message: '请输入',
                                  },
                                ]}
                              >
                                <Input
                                  addonBefore={'目标表'}
                                  placeholder={
                                    formatMessage({
                                      id: 'src.component.Task.DataArchiveTask.CreateModal.271D9B51',
                                    }) /*"请输入"*/
                                  }
                                />
                              </Form.Item>
                            )}
                            {enablePartition && (
                              <PartitionTextArea {...restField} name={[name, 'partitions']} />
                            )}
                          </div>
                        )}

                        {fields?.length > 1 && (
                          <Link onClick={() => remove(name)} style={{ textAlign: 'center' }}>
                            移除
                          </Link>
                        )}
                      </div>
                    ))}
                    <Form.Item
                      style={{
                        marginBottom: 0,
                      }}
                    >
                      <Button onClick={() => add()} block icon={<PlusOutlined />}>
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
            </div>
          );
        }}
      </Form.Item>
    </>
  );
};
export default ArchiveRange;
