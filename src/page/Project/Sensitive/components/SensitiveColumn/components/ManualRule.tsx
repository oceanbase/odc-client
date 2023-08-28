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

import { listDatabases } from '@/common/network/database';
import { exist } from '@/common/network/sensitiveColumn';
import { getTableColumnList } from '@/common/network/table';
import { IDatabase } from '@/d.ts/database';
import ProjectContext from '@/page/Project/ProjectContext';
import { SelectItemProps } from '@/page/Project/Sensitive/interface';
import SensitiveContext from '@/page/Project/Sensitive/SensitiveContext';
import DatabaseStore from '@/store/sessionManager/database';
import { useDBSession } from '@/store/sessionManager/hooks';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined } from '@ant-design/icons';
import { Form, Select, Space } from 'antd';
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import styles from './index.less';

const ManualRule = ({
  fields,
  index,
  formRef,
  databasesMap,
  setDatabasesMap,
  fieldKey,
  fieldName,
  remove,
}) => {
  const context = useContext(ProjectContext);
  const sensitiveContext = useContext(SensitiveContext);
  const { dataSources = [], maskingAlgorithmOptions, projectId } = sensitiveContext;
  const [databases, setDatabases] = useState<IDatabase[]>([]);
  const [dataSourceId, setDataSourceId] = useState<number>(0);
  const [databaseId, setDatabaseId] = useState<number>(0);
  const [tableName, setTableName] = useState<string>('');
  const [columnName, setColumnName] = useState<string>('');
  const { session, loading, reset } = useDBSession(databaseId);
  const [dataSourceOptions, setDataSourceOptions] = useState<SelectItemProps[]>([]);
  const [databaseOptions, setDatabaseOptions] = useState<SelectItemProps[]>([]);
  const [columnOptions, setColumnOptions] = useState<SelectItemProps[]>([]);
  const [tableOptions, setTableOptions] = useState<SelectItemProps[]>([]);

  const handleLoad = async () => {
    if (databaseId) {
      await session?.database?.getTableList();
    }
  };

  const initDataSources = async () => {
    const resData = dataSources?.map((content) => ({
      label: content.name,
      value: content.id,
    }));
    setDataSourceOptions(resData);
    setDataSourceId(0);
    setDatabaseOptions([]);
    setTableOptions([]);
    setColumnOptions([]);
  };

  const initDatabases = async (
    projectId: number = context.projectId,
    id: number = dataSourceId,
  ) => {
    const rawData = await listDatabases(projectId, id);
    const resData = rawData?.contents?.map((content) => ({
      label: content.name,
      value: content.id,
    }));
    setDatabases(rawData?.contents);
    databasesMap.set(dataSourceId, rawData.contents);
    setDatabasesMap(databasesMap);
    setTableName('');
    setColumnName('');
    setDatabaseOptions(resData);
    setTableOptions([]);
    setColumnOptions([]);
  };
  const getExistHomologyColumnNames = (
    tableName: string,
    manual?: {
      dataSource: number;
      database: number;
      tableName: string;
      columnName: string;
    }[],
  ) => {
    const result = manual
      ?.filter(
        (data) =>
          data.dataSource === dataSourceId &&
          data.database === databaseId &&
          data.tableName === tableName,
      )
      ?.map((data) => data.columnName);
    return result;
  };

  const initColumn = async (
    value: string,
    manual?: {
      dataSource: number;
      database: number;
      tableName: string;
      columnName: string;
    }[],
    init: boolean = true,
  ) => {
    const res = await getTableColumnList(
      value,
      databases?.find((d) => d.id === databaseId)?.name,
      session.sessionId,
    );
    let existHomologyColumnNames = getExistHomologyColumnNames(value, manual);
    if (!init) {
      existHomologyColumnNames = existHomologyColumnNames?.filter((cm) => cm !== columnName);
    }
    setColumnOptions(
      res?.map((r) => ({
        label: r.columnName,
        value: r.columnName,
        disabled: existHomologyColumnNames?.some((cm) => cm === r.columnName),
      })),
    );
  };

  const handleDataSourceSelect = async (value: number) => {
    const { manual = [] } = await formRef.getFieldsValue();
    if (dataSourceId !== value) {
      setDataSourceId(value);
      setDatabaseId(0);
      setTableName('');
      setColumnName('');

      manual[index] = {
        dataSource: value,
        columnName: undefined,
        database: undefined,
        maskingAlgorithmId: undefined,
        tableName: undefined,
      };
      formRef.setFieldsValue({
        manual,
      });
    }
  };

  const handleDatabaseSelect = async (value: number) => {
    const { manual = [] } = await formRef.getFieldsValue();
    if (databaseId !== value) {
      setDatabaseId(value);
      setTableName('');
      setColumnName('');
      manual[index] = {
        ...manual[index],
        database: value,
        tableName: undefined,
        columnName: undefined,
        maskingAlgorithmId: undefined,
      };
      formRef.setFieldsValue({
        manual,
      });
    }
  };

  const handleTableSelect = async (value: string) => {
    const { manual = [] } = await formRef.getFieldsValue();
    if (value !== tableName) {
      setTableName(value);
      setColumnName('');

      manual[index] = {
        ...manual[index],
        tableName: value,
        columnName: undefined,
        maskingAlgorithmId: undefined,
      };
      formRef.setFieldsValue({
        manual,
      });
    }
  };

  const hanleColumnSelect = async (value: string) => {
    const { manual = [] } = await formRef.getFieldsValue();
    if (columnName !== value) {
      setColumnName(value);

      manual[index] = {
        ...manual[index],
        columnName: value,
        maskingAlgorithmId: undefined,
      };
      formRef.setFieldsValue({
        manual,
      });
    }
  };

  const checkExist = async (ruler, value) => {
    if (value) {
      const result = await exist(projectId, {
        database: {
          id: databaseId,
        },
        tableName,
        columnName: value,
      });
      if (result) {
        throw new Error();
      }
    } else {
      return;
    }
  };

  const getTables = async (database: DatabaseStore) => {
    if (database) {
      await handleLoad();
      const newTableOptions = database?.tables?.map((table) => ({
        label: table.info.tableName,
        value: table.info.tableName,
      }));
      setTableOptions(newTableOptions);
    }
  };
  const handleDelete = async (index: number) => {
    remove(index);
  };

  useEffect(() => {
    initDataSources();
  }, []);
  useEffect(() => {
    if (dataSourceId !== 0) {
      initDatabases(context.projectId, dataSourceId);
    }
  }, [dataSourceId]);

  useLayoutEffect(() => {
    if (session?.database) {
      getTables(session?.database);
    }
  }, [session?.database]);

  return (
    <Space key={fieldKey} className={styles.formItem} align="baseline">
      <Form.Item
        required
        key={[fieldName, 'dataSource'].join('_')}
        name={[fieldName, 'dataSource']}
        isListField
        fieldKey={[fieldName, 'dataSource']}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.SensitiveColumn.components.ManualRule.SelectADataSource',
            }), //请选择数据源
          },
        ]}
      >
        <Select
          key={[fieldName, 'dataSource', index].join('_')}
          placeholder={
            formatMessage({ id: 'odc.SensitiveColumn.components.ManualRule.PleaseSelect' }) //请选择
          }
          style={{ width: '132px' }}
          onSelect={handleDataSourceSelect}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={dataSourceOptions}
        />
      </Form.Item>
      <Form.Item
        required
        key={[fieldName, 'database'].join('_')}
        name={[fieldName, 'database']}
        isListField
        fieldKey={[fieldName, 'database']}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.SensitiveColumn.components.ManualRule.SelectADatabase',
            }), //请选择数据库
          },
        ]}
      >
        <Select
          key={[fieldName, 'database', index].join('_')}
          placeholder={
            formatMessage({ id: 'odc.SensitiveColumn.components.ManualRule.PleaseSelect' }) //请选择
          }
          style={{ width: '132px' }}
          onSelect={handleDatabaseSelect}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={databaseOptions}
          disabled={dataSourceOptions?.length === 0 || dataSourceId === 0}
        />
      </Form.Item>
      <Form.Item
        required
        key={[fieldName, 'tableName'].join('_')}
        name={[fieldName, 'tableName']}
        isListField
        fieldKey={[fieldName, 'tableName']}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.SensitiveColumn.components.ManualRule.SelectATable',
            }), //请选择表
          },
        ]}
      >
        <Select
          key={[fieldName, 'tableName', index].join('_')}
          placeholder={
            formatMessage({ id: 'odc.SensitiveColumn.components.ManualRule.PleaseSelect' }) //请选择
          }
          style={{ width: '132px' }}
          options={tableOptions}
          value={tableName}
          onSelect={handleTableSelect}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          disabled={databaseOptions?.length === 0 || databaseId === 0}
        />
      </Form.Item>
      <Form.Item
        key={[fieldName, 'columnName'].join('_')}
        name={[fieldName, 'columnName']}
        isListField
        fieldKey={[fieldName, 'columnName']}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.SensitiveColumn.components.ManualRule.PleaseSelectAColumn',
            }), //请选择列
          },
          {
            message: formatMessage({
              id: 'odc.SensitiveColumn.components.ManualRule.SensitiveColumnAlreadyExists',
            }), //敏感列已存在
            validator: checkExist,
          },
        ]}
      >
        <Select
          key={[fieldName, 'columnName', index].join('_')}
          placeholder={
            formatMessage({ id: 'odc.SensitiveColumn.components.ManualRule.PleaseSelect' }) //请选择
          }
          style={{ width: '132px' }}
          value={columnName}
          onSelect={hanleColumnSelect}
          showSearch
          onChange={(e) => setColumnName(e)}
          onDropdownVisibleChange={async (visible: boolean) => {
            if (visible) {
              const { manual = [] } = await formRef.getFieldsValue();
              await initColumn(tableName, manual, false);
            }
          }}
          filterOption={(input, option) =>
            // @ts-ignore
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={columnOptions}
          disabled={tableOptions?.length === 0 || tableName === ''}
        />
      </Form.Item>
      <Form.Item
        key={[fieldName, 'maskingAlgorithmId'].join('_')}
        name={[fieldName, 'maskingAlgorithmId']}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.SensitiveColumn.components.ManualRule.SelectADesensitizationAlgorithm',
            }), //请选择脱敏算法
          },
        ]}
      >
        <Select
          key={[fieldName, 'maskingAlgorithmId', index].join('_')}
          placeholder={
            formatMessage({ id: 'odc.SensitiveColumn.components.ManualRule.PleaseSelect' }) //请选择
          }
          style={{ width: '184px' }}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={maskingAlgorithmOptions}
          disabled={columnOptions?.length === 0 || columnName === ''}
        />
      </Form.Item>
      {fields?.length > 1 ? (
        <DeleteOutlined key={index} onClick={() => handleDelete(index)} />
      ) : null}
    </Space>
  );
};

export default ManualRule;
