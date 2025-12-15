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

import { getTableColumnList, getTableListByDatabaseName } from '@/common/network/table';
import FormItemPanel from '@/component/FormItemPanel';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import TaskExecutionMethodForm from '@/component/Task/component/TaskExecutionMethodForm';
import { ConnectionMode, ITable, TaskExecStrategy, TaskType } from '@/d.ts';
import { useDBSession } from '@/store/sessionManager/hooks';
import { SettingStore } from '@/store/setting';
import { getColumnSizeMapFromColumns } from '@/util/database/column';
import { formatMessage } from '@/util/intl';
import { useUpdate } from 'ahooks';
import { Col, Divider, Form, InputNumber, Radio, Row, Select } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import { cloneDeep } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import DatabaseSelect from '@/component/Task/component/DatabaseSelect';
import RuleConfigTable from './RuleConfigTable';
import { convertFormToServerColumns, getDefaultRule, getDefaultValue } from './RuleContent';
import { IMockFormData, MockStrategy, MockStrategyTextMap, RuleConfigList } from './type';
import { NumberRuleType } from './RuleContent/ruleItems/NumberItem';
import styles from './index.less';
import { rules } from './const';
import { Rule } from 'antd/es/form';

const { Option } = Select;

interface IDataMockerFormProps {
  settingStore?: SettingStore;
  ref?: React.Ref<FormInstance>;
  tableName?: string;
  dbId?: number;
  projectId: number;
  onDbModeChange: (mode: ConnectionMode) => void;
  ruleConfigList?: RuleConfigList[];
}

const DataMockerForm: React.FC<IDataMockerFormProps> = inject('settingStore')(
  observer(
    forwardRef((props, ref) => {
      const { settingStore, tableName, dbId, projectId, onDbModeChange, ruleConfigList } = props;
      const [form] = Form.useForm<IMockFormData>();
      /**
       * 字段长度信息表
       */
      const [columnSizeMap, setColumnSizeMap] = useState({});
      const databaseId = Form.useWatch('databaseId', form);
      const formTableName = Form.useWatch('tableName', form);
      const { session, database } = useDBSession(databaseId);
      const [tables, setTables] = useState<ITable[]>();
      const forceUpdate = useUpdate();
      const databaseName = database?.name;
      const dialectType = database?.dataSource?.dialectType;
      const maxMockLimit = settingStore?.serverSystemInfo?.mockDataMaxRowCount || 1000000;

      useImperativeHandle(ref, () => form);

      const loadTables = async (value: string) => {
        const tables = await getTableListByDatabaseName(session?.sessionId, value);
        setTables(tables);
      };

      useEffect(() => {
        if (databaseName) {
          loadTables(databaseName);
        }
      }, [form, databaseName]);

      useEffect(() => {
        if (dialectType) {
          onDbModeChange(dialectType);
        }
      }, [dialectType]);

      /**
       * 更新表的列
       */
      const fetchTable = useCallback(
        async function fetchTable(value) {
          if (value) {
            form.resetFields(['columns']);
            setColumnSizeMap({});
            forceUpdate();
            let columns = await getTableColumnList(value, databaseName, session?.sessionId);

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
                  const dbMode = database?.dataSource?.dialectType;
                  const rule: any = getDefaultRule(column.dataType, dbMode);

                  const newTypeConfig = ruleConfigList?.find(
                    (item) => item.columnName === column.columnName,
                  );
                  let NumberOrder = null;
                  if (
                    newTypeConfig?.typeConfig?.genParams?.hasOwnProperty('step') &&
                    newTypeConfig?.rule === NumberRuleType.ORDER
                  ) {
                    // 倒序时，页面展现的是正数，实际上调用接口时会转换为负数，再次发起需要转换回来
                    if (Number(newTypeConfig?.typeConfig?.genParams?.step) < 0) {
                      NumberOrder = 'desc';
                      newTypeConfig.typeConfig.genParams.step = String(
                        -Number(newTypeConfig?.typeConfig?.genParams.step),
                      );
                    } else {
                      NumberOrder = 'asc';
                    }
                  }
                  return {
                    columnName: column.columnName,
                    columnType: column.dataType,
                    columnObj: column,
                    rule: newTypeConfig?.rule ?? rule,
                    typeConfig: newTypeConfig
                      ? {
                          range: newTypeConfig.range,
                          genParams: newTypeConfig.typeConfig.genParams,
                          lowValue: newTypeConfig.range[0],
                          highVAlue: newTypeConfig.range[1],
                          order: NumberOrder ?? null,
                        }
                      : getDefaultValue(dbMode, column.dataType, rule, _sizeMap[column.columnName]),
                  };
                }),
              });
            }
          }
        },
        [form, databaseName],
      );
      useEffect(() => {
        if (session && formTableName) {
          /**
           * 获取最新表columns
           */
          fetchTable(formTableName);
        }
      }, [formTableName, session]);

      useEffect(() => {
        /**
         * 初始化
         */
        form.setFieldsValue({
          tableName,
          databaseId: dbId,
        });
      }, []);
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
            executionStrategy: TaskExecStrategy.MANUAL,
            databaseName,
          }}
          className={styles.mockData}
        >
          <Row gutter={14}>
            <Col span={12}>
              <DatabaseSelect
                onChange={(v, db) => {
                  form.resetFields(['tableName', 'columns']);
                }}
                projectId={projectId}
                width={441}
                type={TaskType.DATAMOCK}
              />
            </Col>
            <Col span={12}>
              <Form.Item
                rules={rules.tableName}
                name="tableName"
                label={formatMessage({
                  id: 'odc.component.DataMockerDrawer.form.Table',
                  defaultMessage: '表',
                })}

                /* 表 */
              >
                <Select
                  placeholder={formatMessage({
                    id: 'odc.component.DataMockerDrawer.form.SelectATable',
                    defaultMessage: '请选择表',
                  })}
                  /* 请选择表 */ showSearch
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
                rules={rules.totalCount({ maxMockLimit })}
                required
                name="totalCount"
                label={formatMessage({
                  id: 'odc.component.DataMockerDrawer.form.SimulateTheGeneratedDataVolume',
                  defaultMessage: '模拟生成数据量',
                })}

                /* 模拟生成数据量 */
              >
                <InputNumber precision={0} style={{ width: '100%' }} min={1} max={maxMockLimit} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                rules={rules.batchSize as Rule[]}
                required
                name="batchSize"
                label={formatMessage({
                  id: 'odc.component.DataMockerDrawer.form.BatchSize',
                  defaultMessage: '批处理大小',
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
                  defaultMessage: '插入模拟数据清空表',
                })}

                /* 插入模拟数据清空表 */
              >
                <Radio.Group
                  options={[
                    {
                      label: formatMessage({
                        id: 'odc.component.DataMockerDrawer.form.No',
                        defaultMessage: '否',
                      }),
                      value: false,
                    },
                    {
                      label: formatMessage({
                        id: 'odc.component.DataMockerDrawer.form.Is',
                        defaultMessage: '是',
                      }),
                      value: true,
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                required
                name="strategy"
                label={formatMessage({
                  id: 'odc.component.DataMockerDrawer.form.DataConflictHandlingMethod',
                  defaultMessage: '数据冲突处理方式',
                })}

                /* 数据冲突处理方式 */
              >
                <Radio.Group>
                  {[MockStrategy.IGNORE, MockStrategy.OVERWRITE, MockStrategy.TERMINATE].map(
                    (strategy) => {
                      return (
                        <Radio key={strategy} value={strategy}>
                          {MockStrategyTextMap[strategy]}
                        </Radio>
                      );
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
              defaultMessage: '规则设置',
            })}

            /* 规则设置 */
          >
            <RuleConfigTable
              columnSizeMap={columnSizeMap}
              form={form}
              dbMode={database?.dataSource?.dialectType}
            />
          </Form.Item>
          <FormItemPanel
            label={formatMessage({
              id: 'odc.component.DataMockerDrawer.form.TaskSettings',
              defaultMessage: '任务设置',
            })}
            /*任务设置*/ keepExpand
          >
            <TaskExecutionMethodForm />
          </FormItemPanel>
          <DescriptionInput />
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
