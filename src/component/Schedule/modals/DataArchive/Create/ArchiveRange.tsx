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
  Button,
  Checkbox,
  Form,
  Input,
  Radio,
  Select,
  Typography,
  Tooltip,
  Divider,
  Popover,
} from 'antd';
import classNames from 'classnames';
import ArchiveRangeTip from '@/component/Schedule/components/ArchiveRangeTip';
import { IArchiveRange } from '@/d.ts';
import styles from './index.less';
import BatchSelectionPopover from '@/component/BatchSelectionPopover';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import { IDatabase } from '@/d.ts/database';
import JoinTableConfigModal from '@/component/Task/component/JoinTableConfigsModal';
import useJoinTableConfig from '@/component/Task/component/JoinTableConfigsModal/useJoinTableConfig';
import { rules } from './const';
const MAX_TABLES_COUNT = 100;
const { Text, Link } = Typography;
import { cloneDeep, isString } from 'lodash';

interface IProps {
  tables: ITable[];
  enabledTargetTable?: boolean;
  checkPartition?: boolean;
  targetDatabase?: IDatabase;
  databaseId?: number;
}

export const IArchiveRangeTextMap: Record<IArchiveRange, string> = {
  [IArchiveRange.PORTION]: formatMessage({
    id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.PartialArchive',
    defaultMessage: '部分归档',
  }),
  [IArchiveRange.ALL]: formatMessage({
    id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.ArchiveTheEntireDatabase',
    defaultMessage: '整库归档',
  }),
};

const ArchiveRange: React.FC<IProps> = (props) => {
  const {
    tables: propsTables,
    enabledTargetTable = false,
    checkPartition,
    targetDatabase,
    databaseId,
  } = props;
  const form = Form.useFormInstance();
  const tablesOptions = propsTables?.map((item) => ({
    label: item.tableName,
    value: item.tableName,
  }));

  const { visible, currentIndex, open, close, handleSubmit } = useJoinTableConfig(form);

  const handleConfirm = (
    checkList: any[],
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

  const getSettingTip = (name) => {
    const data = form.getFieldValue(['tables', name]);
    const { joinTableConfigs, partitions: _partitions, tableName } = data || {};
    if (!_partitions && !joinTableConfigs?.length) return null;
    const partitions = isString(_partitions)
      ? _partitions
          ?.replace(/[\r\n]+/g, '')
          ?.split(',')
          ?.filter(Boolean)
      : _partitions;
    // 目前只有join类型，所以先写死join
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

        {partitions?.length ? (
          <>
            <div style={{ color: 'var(--text-color-hint)' }}>指定扫描分区</div>
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

  return (
    <>
      <Form.Item /*归档范围*/ name="archiveRange" required style={{ marginBottom: '0px' }}>
        <Radio.Group
          optionType="button"
          options={[
            {
              label: IArchiveRangeTextMap[IArchiveRange.PORTION],
              value: IArchiveRange.PORTION,
            },
            {
              label: IArchiveRangeTextMap[IArchiveRange.ALL],
              value: IArchiveRange.ALL,
            },
          ]}
        />
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const archiveRange = getFieldValue('archiveRange') || [];
          const tables = getFieldValue('tables') || [];
          if (archiveRange !== IArchiveRange.PORTION) {
            return <>包括当前数据库内所有表及新增表</>;
          }
          return (
            <div className={styles.tableHeader}>
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
                {enabledTargetTable && (
                  <div className={styles.tableTitle}>
                    {isConnectTypeBeFileSystemGroup(targetDatabase?.connectType)
                      ? formatMessage({
                          id: 'src.component.Task.DataArchiveTask.CreateModal.79D75776',
                          defaultMessage: '目标文件',
                        })
                      : formatMessage({
                          id: 'src.component.Task.DataArchiveTask.CreateModal.94BCB0E1',
                          defaultMessage: '目标表',
                        })}
                  </div>
                )}
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
                          })}
                        >
                          <Form.Item
                            {...restField}
                            name={[name, 'tableName']}
                            rules={rules.tableName}
                            className={styles.pr6}
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
                          {enabledTargetTable && (
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                paddingRight: '6px',
                              }}
                              className={styles.multiInputBox}
                            >
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
                            </div>
                          )}

                          <Form.Item {...restField} name={[name, 'conditionExpression']}>
                            <Input
                              placeholder={'请输入 SQLWhere 条件语句，可引用自定义变量'}
                              addonAfter={
                                <>
                                  <JoinTableConfigModal
                                    visible={visible && currentIndex === index}
                                    name={name}
                                    initialValues={form.getFieldValue(['tables', index])}
                                    onCancel={close}
                                    onOk={handleSubmit}
                                    databaseId={databaseId}
                                  />

                                  <Popover content={getSettingTip(name)} destroyOnHidden>
                                    <div onClick={() => open(index)} style={{ cursor: 'pointer' }}>
                                      {form.getFieldValue(['tables', name, 'joinTableConfigs'])
                                        ?.length ||
                                      form.getFieldValue(['tables', name, 'partitions']) ? (
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
                                id: 'src.component.Task.DataArchiveTask.CreateModal.890DB04E',
                                defaultMessage: '移除',
                              })}
                            >
                              <DeleteOutlined
                                onClick={() => remove(name)}
                                style={{ margin: ' 0px 0px 10px 8px' }}
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
                              onClick={() => add()}
                              type="link"
                              icon={<PlusOutlined />}
                              disabled={disabledAddFields}
                            >
                              {
                                formatMessage({
                                  id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.Add',
                                  defaultMessage: '添加',
                                }) /*添加*/
                              }
                            </Button>
                            <Divider type="vertical" />
                            <BatchSelectionPopover
                              maxCount={MAX_TABLES_COUNT - fields?.length}
                              disabled={disabledAddFields}
                              options={tablesOptions}
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
