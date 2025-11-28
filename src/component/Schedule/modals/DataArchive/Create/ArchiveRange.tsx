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
import { isConnectTypeBeFileSystemGroup } from '@/util/database/connection';
import { IDatabase } from '@/d.ts/database';
import JoinTableConfigModal from '@/component/Task/component/JoinTableConfigsModal';
import useJoinTableConfig from '@/component/Task/component/JoinTableConfigsModal/useJoinTableConfig';
import { rules } from './const';
import { getSettingTip } from '@/component/Schedule/helper';
const MAX_TABLES_COUNT = 100;
const { Text, Link } = Typography;

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
            return (
              <>
                {formatMessage({
                  id: 'src.component.Schedule.modals.DataArchive.Create.D7AEEF6A',
                  defaultMessage: '包括当前数据库内所有表及新增表',
                })}
              </>
            );
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
                              options={getTablesOptions()}
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
                                  placeholder={formatMessage({
                                    id: 'src.component.Schedule.modals.DataArchive.Create.F9306B41',
                                    defaultMessage: '请输入，若不输入默认使用归档表名作为目标表名',
                                  })}
                                />
                              </Form.Item>
                            </div>
                          )}

                          <Form.Item {...restField} name={[name, 'conditionExpression']}>
                            <Input
                              placeholder={formatMessage({
                                id: 'src.component.Schedule.modals.DataArchive.Create.FFDA9CD3',
                                defaultMessage: '请输入 SQL 的 Where 条件部分，可引用自定义变量',
                              })}
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

                                  <Popover
                                    content={getSettingTip(form.getFieldValue(['tables', name]))}
                                    destroyOnHidden
                                    placement="top"
                                  >
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
                        <Tooltip
                          title={
                            disabledAddFields
                              ? formatMessage(
                                  {
                                    id: 'src.component.Schedule.modals.DataArchive.Create.8E6B7262',
                                    defaultMessage: '最多添加{MAX_TABLES_COUNT}个',
                                  },
                                  { MAX_TABLES_COUNT },
                                )
                              : ''
                          }
                        >
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
