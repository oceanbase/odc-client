import { listDatabases } from '@/common/network/database';
import { exist } from '@/common/network/sensitiveColumn';
import { getTableColumnList } from '@/common/network/table';
import ProjectContext from '@/page/Project/ProjectContext';
import { SelectItemProps } from '@/page/Project/Sensitive/interface';
import SensitiveContext from '@/page/Project/Sensitive/SensitiveContext';
import { useDBSession } from '@/store/sessionManager/hooks';
import { DeleteOutlined } from '@ant-design/icons';
import { Form, Select, Space } from 'antd';
import { useContext, useEffect, useState } from 'react';
import styles from './index.less';

const ManualRule = ({
  fields,
  index,
  formRef,
  fieldKey,
  fieldName,
  remove,
  databases,
  setDatabases,
}) => {
  const context = useContext(ProjectContext);
  const sensitiveContext = useContext(SensitiveContext);
  const { dataSources = [], maskingAlgorithmOptions, projectId } = sensitiveContext;
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
  ) => {
    const res = await getTableColumnList(
      value,
      databases?.find((d) => d.id === databaseId)?.name,
      session.sessionId,
    );
    const existHomologyColumnNames = getExistHomologyColumnNames(value, manual);

    setColumnName('');
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
    setDataSourceId(value);
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
  };

  const handleDatabaseSelect = async (value: number) => {
    const { manual = [] } = await formRef.getFieldsValue();
    setDatabaseId(value);
    manual[index] = {
      ...manual[index],
      columnName: undefined,
      database: value,
      maskingAlgorithmId: undefined,
      tableName: undefined,
    };
    formRef.setFieldsValue({
      manual,
    });
  };

  const handleTableSelect = async (value: string) => {
    const { manual = [] } = await formRef.getFieldsValue();
    setTableName(value);

    manual[index] = {
      ...manual[index],
      columnName: undefined,
      maskingAlgorithmId: undefined,
      tableName: value,
    };
    formRef.setFieldsValue({
      manual,
    });
    await initColumn(value, manual);
  };

  const hanleColumnSelect = async (value: any) => {
    const { manual = [] } = await formRef.getFieldsValue();
    setColumnName(value);

    manual[index] = {
      ...manual[index],
      columnName: value,
      maskingAlgorithmId: undefined,
    };
    formRef.setFieldsValue({
      manual,
    });
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

  useEffect(() => {
    initDataSources();
  }, []);
  useEffect(() => {
    if (dataSourceId !== 0) {
      initDatabases(context.projectId, dataSourceId);
    }
  }, [dataSourceId]);

  useEffect(() => {
    let timer;
    if (session?.database) {
      handleLoad();
      timer = setTimeout(() => {
        const newTableOptions = session?.database?.tables?.map((table) => ({
          label: table.info.tableName,
          value: table.info.tableName,
        }));
        setTableOptions(newTableOptions);
        clearTimeout(timer);
      }, 300);
    }
    return () => {
      clearTimeout(timer);
    };
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
            message: '请选择数据源',
          },
        ]}
      >
        <Select
          key={[fieldName, 'dataSource', index].join('_')}
          placeholder={'请选择'}
          style={{ width: '132px' }}
          onSelect={handleDataSourceSelect}
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
            message: '请选择数据库',
          },
        ]}
      >
        <Select
          key={[fieldName, 'database', index].join('_')}
          placeholder={'请选择'}
          style={{ width: '132px' }}
          onSelect={handleDatabaseSelect}
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
            message: '请选择表',
          },
        ]}
      >
        <Select
          key={[fieldName, 'tableName', index].join('_')}
          placeholder={'请选择'}
          style={{ width: '132px' }}
          options={tableOptions}
          value={tableName}
          onSelect={handleTableSelect}
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
            message: '请选择列',
          },
          {
            message: '敏感列已存在',
            validator: checkExist,
          },
        ]}
      >
        <Select
          key={[fieldName, 'columnName', index].join('_')}
          placeholder={'请选择'}
          style={{ width: '132px' }}
          value={columnName}
          onSelect={hanleColumnSelect}
          disabled={tableOptions?.length === 0}
        >
          {columnOptions?.map(
            ({ label = undefined, value = undefined, disabled = false }, index) => (
              <Select.Option value={value} key={index} disabled={disabled}>
                {label}
              </Select.Option>
            ),
          )}
        </Select>
      </Form.Item>
      <Form.Item
        key={[fieldName, 'maskingAlgorithmId'].join('_')}
        name={[fieldName, 'maskingAlgorithmId']}
        rules={[
          {
            required: true,
            message: '请选择脱敏算法',
          },
        ]}
      >
        <Select
          key={[fieldName, 'maskingAlgorithmId', index].join('_')}
          placeholder={'请选择'}
          style={{ width: '184px' }}
          options={maskingAlgorithmOptions}
          disabled={columnOptions?.length === 0 || columnName === ''}
        />
      </Form.Item>
      {fields?.length > 0 ? <DeleteOutlined key={index} onClick={() => remove(index)} /> : null}
    </Space>
  );
};

export default ManualRule;
