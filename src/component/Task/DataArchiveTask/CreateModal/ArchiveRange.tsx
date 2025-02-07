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
import { PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Radio, Select, Typography, Tooltip } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import ArchiveRangeTip from '../../component/ArchiveRangeTip';
import { PartitionTextArea } from '../../component/PartitionTextArea';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import { IArchiveRange } from './index';
import styles from './index.less';
import BatchSelectionPopover from '@/component/BatchSelectionPopover';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import { IDatabase } from '@/d.ts/database';
const { Text, Link } = Typography;

interface IProps {
  tables: ITable[];
  enabledTargetTable?: boolean;
  checkPartition?: boolean;
  targetDatabase?: IDatabase;
}
const ArchiveRange: React.FC<IProps> = (props) => {
  const { tables, enabledTargetTable = false, checkPartition, targetDatabase } = props;
  const form = Form.useFormInstance();
  const [enablePartition, setEnablePartition] = useState<boolean>(checkPartition);
  const tablesOptions = tables?.map((item) => ({
    label: item.tableName,
    value: item.tableName,
  }));

  useEffect(() => {
    setEnablePartition(checkPartition);
  }, [checkPartition]);

  const handleConfirm = (
    checkList: CheckboxValueType[],
    add: (defaultValue?: any, insertIndex?: number) => void,
    remove: (index: number | number[]) => void,
  ) => {
    if (checkList?.length === 0) return;
    const filedList = form.getFieldValue('tables');
    // 批量增加时，先移除空的fields
    for (let i = 0; i < filedList.length; i++) {
      if (!filedList[i]) {
        remove(i);
      }
    }
    checkList.forEach((item) => {
      add({ tableName: item });
    });
  };

  return (
    <>
      <Form.Item
        label={formatMessage({
          id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.ArchiveScope',
          defaultMessage: '归档范围',
        })}
        /*归档范围*/ name="archiveRange"
        required
      >
        <Radio.Group>
          <Radio value={IArchiveRange.PORTION}>
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.PartialArchive',
                defaultMessage: '部分归档',
              }) /*部分归档*/
            }
          </Radio>
          <Radio value={IArchiveRange.ALL}>
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.ArchiveTheEntireDatabase',
                defaultMessage: '整库归档',
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
            <div className={styles.tableHeader}>
              <div className={styles.tableHeaderExtra}>
                <div>
                  {formatMessage({
                    id: 'src.component.Task.DataArchiveTask.CreateModal.877C68FB',
                    defaultMessage: '归档设置',
                  })}
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <Checkbox
                    checked={enablePartition}
                    onChange={() => {
                      setEnablePartition(!enablePartition);
                    }}
                  >
                    {formatMessage({
                      id: 'src.component.Task.DataArchiveTask.CreateModal.AEEF3B7C',
                      defaultMessage: '指定分区',
                    })}
                  </Checkbox>
                </div>
              </div>
              <div
                className={classNames(styles.tables, styles.title, {
                  [styles.delete]: tables?.length > 1,
                })}
              >
                <div className={styles.tableTitle}>
                  {
                    formatMessage({
                      id: 'odc.src.component.Task.DataArchiveTask.CreateModal.ArchiveTable',
                      defaultMessage: '归档表',
                    }) /* 归档表 */
                  }
                </div>
                <div className={styles.tableTitle}>
                  <div style={{ display: 'inline-flex', gap: 4 }}>
                    <span>
                      {
                        formatMessage({
                          id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.FilterConditions',
                          defaultMessage: '过滤条件',
                        }) /*过滤条件*/
                      }
                    </span>
                    <Text type="secondary">
                      {
                        formatMessage({
                          id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.Optional',
                          defaultMessage: '(可选)',
                        }) /*(可选)*/
                      }
                    </Text>
                    <ArchiveRangeTip
                      label={
                        formatMessage({
                          id: 'odc.src.component.Task.DataArchiveTask.CreateModal.Archive',
                          defaultMessage: '归档',
                        }) /* 归档 */
                      }
                    />
                  </div>
                </div>
                {enabledTargetTable && (
                  <div className={styles.tableTitle}>
                    {formatMessage({
                      id: 'src.component.Task.DataArchiveTask.CreateModal.CC365F6B',
                      defaultMessage: '高级设置',
                    })}

                    <Text type="secondary">
                      {
                        formatMessage({
                          id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.Optional',
                          defaultMessage: '(可选)',
                        }) /*(可选)*/
                      }
                    </Text>
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
                                defaultMessage: '请选择表',
                              }), //'请选择表'
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            placeholder={formatMessage({
                              id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.PleaseSelect',
                              defaultMessage: '请选择',
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
                              defaultMessage: '请输入过滤条件',
                            })} /*请输入过滤条件*/
                          />
                        </Form.Item>
                        {enabledTargetTable && (
                          <div
                            style={{ display: 'flex', flexDirection: 'column' }}
                            className={styles.multiInputBox}
                          >
                            <Tooltip
                              title={
                                isConnectTypeBeFileSystemGroup(targetDatabase?.connectType)
                                  ? formatMessage({
                                      id: 'src.component.Task.DataArchiveTask.CreateModal.39BA9EFE',
                                      defaultMessage:
                                        '选择的目标数据库为对象存储类型时，不支持该配置',
                                    })
                                  : undefined
                              }
                            >
                              <Form.Item {...restField} name={[name, 'targetTableName']}>
                                <Input
                                  addonBefore={formatMessage({
                                    id: 'src.component.Task.DataArchiveTask.CreateModal.94BCB0E1',
                                    defaultMessage: '目标表',
                                  })}
                                  disabled={isConnectTypeBeFileSystemGroup(
                                    targetDatabase?.connectType,
                                  )}
                                  onChange={(e) => {
                                    form.setFieldsValue({
                                      tables: {
                                        [name]: {
                                          targetTableName: e.target.value,
                                        },
                                      },
                                    });
                                  }}
                                  placeholder={
                                    formatMessage({
                                      id: 'src.component.Task.DataArchiveTask.CreateModal.271D9B51',
                                      defaultMessage: '请输入',
                                    }) /*"请输入"*/
                                  }
                                />
                              </Form.Item>
                            </Tooltip>

                            {enablePartition && (
                              <PartitionTextArea {...restField} name={[name, 'partitions']} />
                            )}
                          </div>
                        )}

                        {fields?.length > 1 && (
                          <Link onClick={() => remove(name)} style={{ textAlign: 'center' }}>
                            {formatMessage({
                              id: 'src.component.Task.DataArchiveTask.CreateModal.890DB04E',
                              defaultMessage: '移除',
                            })}
                          </Link>
                        )}
                      </div>
                    ))}
                    <Form.Item
                      style={{
                        marginBottom: 0,
                      }}
                    >
                      <div className={styles.operationContainer}>
                        <Button onClick={() => add()} type="link" icon={<PlusOutlined />}>
                          {
                            formatMessage({
                              id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.Add',
                              defaultMessage: '添加',
                            }) /*添加*/
                          }
                        </Button>
                        <BatchSelectionPopover
                          options={tablesOptions}
                          handleConfirm={(checkList) => handleConfirm(checkList, add, remove)}
                        />
                      </div>
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
