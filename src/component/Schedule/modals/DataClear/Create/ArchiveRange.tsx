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
import { PlusOutlined, SettingOutlined, SettingFilled, DeleteOutlined } from '@ant-design/icons';
import {
  Tooltip,
  Button,
  Checkbox,
  Form,
  Input,
  Radio,
  Select,
  Typography,
  Divider,
  Popover,
} from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import ArchiveRangeTip from '@/component/Schedule/components/ArchiveRangeTip';
import { PartitionTextArea } from '@/component/Task/component/PartitionTextArea';
import { IArchiveRange } from '@/d.ts';
import BatchSelectionPopover from '@/component/BatchSelectionPopover';
import styles from './index.less';
import JoinTableConfigModal from '@/component/Task/component/JoinTableConfigsModal';
import useJoinTableConfig from '@/component/Task/component/JoinTableConfigsModal/useJoinTableConfig';
import { rules } from './const';
import { cloneDeep, isString } from 'lodash';

const { Text, Link } = Typography;
const MAX_TABLES_COUNT = 100;

interface IProps {
  tables: ITable[];
  needCheckBeforeDelete?: boolean;
  checkPartition?: boolean;
  databaseId?: number;
}

export const CleanRangeTextMap: Record<IArchiveRange, string> = {
  [IArchiveRange.PORTION]: formatMessage({
    id: 'odc.DataClearTask.CreateModal.ArchiveRange.PartialCleaning',
    defaultMessage: '部分清理',
  }),
  [IArchiveRange.ALL]: formatMessage({
    id: 'odc.DataClearTask.CreateModal.ArchiveRange.CleanUpTheEntireDatabase',
    defaultMessage: '整库清理',
  }),
};

const ArchiveRange: React.FC<IProps> = (props) => {
  const { tables: propsTables, needCheckBeforeDelete = false, checkPartition, databaseId } = props;
  const form = Form.useFormInstance();
  const getTablesOptions = () => {
    const _selectedTables =
      form
        .getFieldValue('tables')
        ?.filter((item) => item?.tableName)
        ?.map((item) => item?.tableName) ?? [];
    const _options = propsTables?.map((item) => {
      return {
        label: item.tableName,
        value: item.tableName,
        disabled: _selectedTables?.includes(item.tableName),
      };
    });
    return _options;
  };

  const { visible, currentIndex, open, close, handleSubmit } = useJoinTableConfig(form);

  const getSettingTip = (name) => {
    const data = form.getFieldValue(['tables', name]);
    const { joinTableConfigs, partitions, tableName } = data || {};
    if (!partitions?.length && !joinTableConfigs?.length) return null;
    return (
      <div>
        {joinTableConfigs?.length ? (
          <div style={{ marginBottom: 8 }}>
            <div style={{ color: 'var(--text-color-hint)' }}>关联表</div>
            {joinTableConfigs?.map((item) => {
              return (
                <div style={{ display: 'flex', gap: 8 }}>
                  <div>{tableName}</div>
                  <div>join</div>
                  <div>{item?.tableName}</div>
                  <div>on</div>
                  <div>{item?.joinCondition}</div>
                </div>
              );
            })}
          </div>
        ) : null}
        <div style={{ color: 'var(--text-color-hint)' }}>指定扫描分区</div>
        {partitions?.length ? (
          <>
            {partitions?.map((item, index) => (
              <>
                <span>{item}</span>
                {index !== partitions?.length - 1 && <span>;</span>}
              </>
            ))}
          </>
        ) : null}
      </div>
    );
  };

  const handleConfirm = (
    checkList: any[],
    add: (defaultValue?: any, insertIndex?: number) => void,
    remove: (index: number | number[]) => void,
  ) => {
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
          id: 'odc.DataClearTask.CreateModal.ArchiveRange.CleaningRange',
          defaultMessage: '清理范围',
        })}
        /*清理范围*/ name="archiveRange"
        style={{ marginBottom: '0px' }}
        required
      >
        <Radio.Group
          optionType="button"
          options={[
            {
              label: CleanRangeTextMap[IArchiveRange.PORTION],
              value: IArchiveRange.PORTION,
            },
            {
              label: CleanRangeTextMap[IArchiveRange.ALL],
              value: IArchiveRange.ALL,
            },
          ]}
        />
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const archiveRange = getFieldValue('archiveRange') || [];
          if (archiveRange !== IArchiveRange.PORTION) {
            return <>包括当前数据库内所有表及新增表</>;
          }
          const tables = getFieldValue('tables') || [];
          return (
            <div className={styles.tableHeader}>
              <div
                className={classNames(styles.tables, {
                  [styles.delete]: tables?.length > 1,
                  [styles.advancedOption]: needCheckBeforeDelete,
                })}
              >
                <div className={styles.tableTitle} style={{ width: 160, padding: '3px 8px' }}>
                  {formatMessage({
                    id: 'src.component.Task.DataClearTask.CreateModal.CF6B368E',
                    defaultMessage: '清理表',
                  })}
                </div>
                {needCheckBeforeDelete && (
                  <div className={styles.tableTitle}>
                    <span style={{ padding: '3px 8px', display: 'inline-flex', gap: '4px' }}>
                      目标表
                    </span>
                  </div>
                )}
                <div className={styles.tableTitle}>
                  <div style={{ display: 'inline-flex', gap: 4, padding: '3px 0px' }}>
                    {
                      formatMessage({
                        id: 'odc.DataClearTask.CreateModal.ArchiveRange.CleaningConditions',
                        defaultMessage: '清理条件',
                      }) /*清理条件*/
                    }

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
                          id: 'odc.src.component.Task.DataClearTask.CreateModal.CleanUp',
                          defaultMessage: '清理',
                        }) /* 清理 */
                      }
                    />
                  </div>
                </div>
              </div>
              <Form.List name="tables">
                {(fields, { add, remove }) => {
                  const disabledAddFields = fields.length >= MAX_TABLES_COUNT;
                  return (
                    <div className={styles.infoBlock}>
                      {fields.map(({ key, name, ...restField }: any, index) => (
                        <div
                          key={key}
                          className={classNames(styles.tables, {
                            [styles.delete]: fields?.length > 1,
                            [styles.advancedOption]: needCheckBeforeDelete,
                          })}
                        >
                          <Form.Item
                            {...restField}
                            name={[name, 'tableName']}
                            rules={rules.tableName}
                            style={{ width: 160 }}
                            className={styles.pr6}
                          >
                            <Select
                              showSearch
                              placeholder={formatMessage({
                                id: 'odc.DataClearTask.CreateModal.ArchiveRange.PleaseSelect',
                                defaultMessage: '请选择',
                              })}
                              /*请选择*/ options={getTablesOptions()}
                              filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                            />
                          </Form.Item>
                          {needCheckBeforeDelete && (
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                paddingRight: '6px',
                              }}
                              className={styles.multiInputBox}
                            >
                              {needCheckBeforeDelete && (
                                <Form.Item {...restField} name={[name, 'targetTableName']}>
                                  <Input
                                    placeholder={
                                      formatMessage({
                                        id: 'src.component.Task.DataArchiveTask.CreateModal.271D9B51',
                                        defaultMessage: '请输入',
                                      }) /*"请输入"*/
                                    }
                                  />
                                </Form.Item>
                              )}
                            </div>
                          )}
                          <Form.Item {...restField} name={[name, 'conditionExpression']}>
                            <Input
                              placeholder={formatMessage({
                                id: 'odc.DataClearTask.CreateModal.ArchiveRange.EnterACleanupCondition',
                                defaultMessage: '请输入清理条件',
                              })} /*请输入清理条件*/
                              addonAfter={
                                <>
                                  <JoinTableConfigModal
                                    name={name}
                                    visible={visible && currentIndex === index}
                                    initialValues={form.getFieldValue(['tables', index])}
                                    onCancel={close}
                                    onOk={handleSubmit}
                                    databaseId={databaseId}
                                  />

                                  <Popover destroyOnHidden content={getSettingTip(name)}>
                                    <div onClick={() => open(index)} style={{ cursor: 'pointer' }}>
                                      {form.getFieldValue(['tables', name, 'joinTableConfigs'])
                                        ?.length ||
                                      form.getFieldValue(['tables', name, 'partitions'])?.length ? (
                                        <SettingFilled style={{ color: '#1890ff' }} />
                                      ) : (
                                        <SettingOutlined />
                                      )}
                                    </div>
                                  </Popover>
                                </>
                              }
                            />
                          </Form.Item>

                          {fields?.length > 1 && (
                            <Tooltip
                              title={formatMessage({
                                id: 'src.component.Task.DataClearTask.CreateModal.F0991266',
                                defaultMessage: '移除',
                              })}
                            >
                              <DeleteOutlined
                                onClick={() => remove(name)}
                                style={{ margin: '0px 0px 10px 8px' }}
                              />
                            </Tooltip>
                          )}
                        </div>
                      ))}
                      <Form.Item
                        style={{
                          marginBottom: 0,
                        }}
                      >
                        <Tooltip title={disabledAddFields ? `最多添加${MAX_TABLES_COUNT}个` : ''}>
                          <Button type="dashed" block disabled={disabledAddFields}>
                            <Button
                              type="link"
                              onClick={() => add()}
                              icon={<PlusOutlined />}
                              disabled={disabledAddFields}
                            >
                              {
                                formatMessage({
                                  id: 'odc.DataClearTask.CreateModal.ArchiveRange.Add',
                                  defaultMessage: '添加',
                                }) /*添加*/
                              }
                            </Button>
                            <Divider type="vertical" />
                            <BatchSelectionPopover
                              maxCount={MAX_TABLES_COUNT - fields?.length}
                              disabled={disabledAddFields}
                              options={getTablesOptions()}
                              handleConfirm={(checkList) => handleConfirm(checkList, add, remove)}
                            />
                          </Button>
                        </Tooltip>
                      </Form.Item>
                    </div>
                  );
                }}
              </Form.List>
            </div>
          );
        }}
      </Form.Item>
    </>
  );
};
export default ArchiveRange;
