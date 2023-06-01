import { getTableColumnList } from '@/common/network/table';
import FormItemPanel from '@/component/FormItemPanel';
import TaskTimer from '@/component/Task/component/TimerSelect';
import { ConnectionMode, ITable, TaskExecStrategy } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { SchemaStore } from '@/store/schema';
import { SettingStore } from '@/store/setting';
import { getColumnSizeMapFromColumns } from '@/util/column';
import { formatMessage } from '@/util/intl';
import { useUpdate } from 'ahooks';
import { Col, Divider, Form, InputNumber, Radio, Row, Select } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import { cloneDeep } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import RuleConfigTable from './RuleConfigTable';
import { convertFormToServerColumns, getDefaultRule, getDefaultValue } from './RuleContent';
import { IMockFormData, MockStrategy, MockStrategyTextMap } from './type';

const { Option } = Select;

interface IDataMockerFormProps {
  connectionStore?: ConnectionStore;
  schemaStore?: SchemaStore;
  settingStore?: SettingStore;
  ref?: React.Ref<FormInstance>;
  tableName?: string;
}

const DataMockerForm: React.FC<IDataMockerFormProps> = inject(
  'connectionStore',
  'schemaStore',
  'settingStore',
)(
  observer(
    forwardRef((props, ref) => {
      const {
        connectionStore: { connection },
        schemaStore,
        settingStore,
        tableName,
      } = props;
      const [form] = Form.useForm<IMockFormData>();
      /**
       * 字段长度信息表
       */
      const [columnSizeMap, setColumnSizeMap] = useState({});
      const [databaseName, setDatabaseName] = useState<string>(schemaStore.database.name);
      const [tables, setTables] = useState<ITable[]>();
      const forceUpdate = useUpdate();
      const maxMockLimit = settingStore?.serverSystemInfo?.mockDataMaxRowCount || 1000000;

      useImperativeHandle(ref, () => form);

      const loadTables = async (value: string) => {
        const tables = await schemaStore.getTableListByDatabaseName(value);
        setTables(tables);
      };

      const handleDatabaseChange = (value: string) => {
        form.setFieldsValue({
          databaseName: value,
        });

        setDatabaseName(value);
      };

      useEffect(() => {
        form.resetFields(['tableName', 'columns']);
        loadTables(databaseName);
      }, [form, databaseName]);

      /**
       * 获取表列表
       */
      useEffect(() => {
        schemaStore.refreshTableList();
      }, []);

      /**
       * 更新表的列
       */
      const fetchTable = useCallback(
        async function fetchTable(value) {
          if (value) {
            form.resetFields(['columns']);
            setColumnSizeMap({});
            forceUpdate();
            let columns = await getTableColumnList(value, databaseName);
            if (columns?.length) {
              columns = columns.map((column) => {
                /**
                 * 这里覆盖掉之前有问题的字段，在不改变接口的情况下保持兼容
                 */
                return {
                  ...column,
                  dataType: column.nativeDataType,
                  length: column.width,
                };
              });
              /**
               * 更新字段长度信息表
               */
              const _sizeMap = getColumnSizeMapFromColumns(columns);
              setColumnSizeMap(_sizeMap);
              /**
               * 更新字段配置信息
               */
              form.setFieldsValue({
                columns: columns.map((column) => {
                  const rule: any = getDefaultRule(column.dataType, connection?.dbMode);

                  return {
                    columnName: column.columnName,
                    columnType: column.dataType,
                    columnObj: column,
                    rule,
                    typeConfig: getDefaultValue(
                      connection?.dbMode,
                      column.dataType,
                      rule,
                      _sizeMap[column.columnName],
                    ),
                  };
                }),
              });
            }
          }
        },
        [form, databaseName],
      );

      /**
       * 外部传入表
       */
      useEffect(() => {
        form.setFieldsValue({
          tableName,
        });

        fetchTable(tableName);
      }, [tableName]);
      /**
       * render
       */
      return (
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{
            whetherTruncate: false,
            strategy: MockStrategy.IGNORE,
            totalCount: 1000,
            batchSize: 200,
            connectionId: connection.id,
            databaseName: schemaStore.database.name,
            executionStrategy: TaskExecStrategy.AUTO,
          }}
        >
          <Row gutter={14}>
            <Col span={12}>
              <Form.Item
                label={formatMessage({
                  id: 'odc.component.DataMockerDrawer.form.Connection',
                })}
                /*所属连接*/ name="connectionId"
                required
              >
                <Select
                  disabled
                  options={[
                    {
                      label: connection.sessionName,
                      value: connection.id,
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={formatMessage({
                  id: 'odc.component.DataMockerDrawer.form.Database',
                })}
                /*所属库*/ name="databaseName"
                required
              >
                <Select
                  onChange={handleDatabaseChange}
                  options={schemaStore?.databases?.map((item) => {
                    return {
                      label:
                        item.name === schemaStore.database.name
                          ? formatMessage(
                              {
                                id: 'odc.component.DataMockerDrawer.form.ItemnameDefaultCurrentLibrary',
                              },

                              { itemName: item.name },
                            )
                          : //`${item.name} (默认当前库)`
                            item.name,
                      value: item.name,
                    };
                  })}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={14}>
            <Col span={12}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'odc.component.DataMockerDrawer.form.SelectATable',
                    }),

                    // 请选择表
                  },
                ]}
                name="tableName"
                label={formatMessage({
                  id: 'odc.component.DataMockerDrawer.form.Table',
                })}

                /* 表 */
              >
                <Select
                  placeholder={formatMessage({
                    id: 'odc.component.DataMockerDrawer.form.SelectATable',
                  })}
                  /* 请选择表 */ showSearch
                  onSelect={fetchTable}
                >
                  {tables?.map((table) => {
                    return (
                      <Option key={table.tableName} value={table.tableName}>
                        {table.tableName}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={14}>
            <Col span={12}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'odc.component.DataMockerDrawer.form.EnterTheSimulatedDataVolume',
                    }),

                    // 请输入模拟数据量
                  },
                  {
                    max: maxMockLimit,
                    type: 'number',
                  },
                ]}
                required
                name="totalCount"
                label={formatMessage({
                  id: 'odc.component.DataMockerDrawer.form.SimulateTheGeneratedDataVolume',
                })}

                /* 模拟生成数据量 */
              >
                <InputNumber precision={0} style={{ width: '100%' }} min={1} max={maxMockLimit} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'odc.component.DataMockerDrawer.form.EnterTheBatchSize',
                    }),

                    // 请输入批处理大小
                  },
                  {
                    max: 1000,
                    message: formatMessage({
                      id: 'odc.component.DataMockerDrawer.form.TheBatchSizeCannotExceed',
                    }),

                    // 批处理大小不能超过 1000
                    type: 'number',
                  },
                ]}
                required
                name="batchSize"
                label={formatMessage({
                  id: 'odc.component.DataMockerDrawer.form.BatchSize',
                })}

                /* 批处理大小 */
              >
                <InputNumber precision={0} style={{ width: '100%' }} min={1} max={1000} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={14}>
            <Col span={12}>
              <Form.Item
                required
                name="whetherTruncate"
                label={formatMessage({
                  id: 'odc.component.DataMockerDrawer.form.InsertASimulatedDataEmptying',
                })}

                /* 插入模拟数据清空表 */
              >
                <Radio.Group>
                  <Radio value={false}>
                    {
                      formatMessage({
                        id: 'odc.component.DataMockerDrawer.form.No',
                      })

                      /* 否 */
                    }
                  </Radio>
                  <Radio value>
                    {
                      formatMessage({
                        id: 'odc.component.DataMockerDrawer.form.Is',
                      })

                      /* 是 */
                    }
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                required
                name="strategy"
                label={formatMessage({
                  id: 'odc.component.DataMockerDrawer.form.DataConflictHandlingMethod',
                })}

                /* 数据冲突处理方式 */
              >
                <Radio.Group>
                  {[MockStrategy.IGNORE, MockStrategy.OVERWRITE, MockStrategy.TERMINATE].map(
                    (strategy) => {
                      return <Radio value={strategy}>{MockStrategyTextMap[strategy]}</Radio>;
                    },
                  )}
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ marginTop: '8px', marginBottom: '16px' }} />
          <Form.Item
            shouldUpdate
            key={form.getFieldValue('tableName')}
            required
            name="columns"
            label={formatMessage({
              id: 'odc.component.DataMockerDrawer.form.RuleSettings',
            })}

            /* 规则设置 */
          >
            <RuleConfigTable columnSizeMap={columnSizeMap} form={form} />
          </Form.Item>
          <FormItemPanel
            label={formatMessage({
              id: 'odc.component.DataMockerDrawer.form.TaskSettings',
            })}
            /*任务设置*/ keepExpand
          >
            <TaskTimer />
          </FormItemPanel>
        </Form>
      );
    }),
  ),
);

export default DataMockerForm;

export function converFormToServerData(
  formData: IMockFormData,
  dbMode: ConnectionMode,
  schemaName: string,
) {
  const tableData = cloneDeep(formData);
  const serverData = {
    tables: [
      {
        ...tableData,
        columns: convertFormToServerColumns(tableData.columns, dbMode),
        schemaName,
      },
    ],
  };

  return serverData;
}
