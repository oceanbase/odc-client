import { getConnectionList } from '@/common/network/connection';
import { listDatabases } from '@/common/network/database';
import { listSensitiveRules } from '@/common/network/sensitiveRule';
import ProjectContext from '@/page/Project/ProjectContext';
import { SelectItemProps } from '@/page/Project/Sensitive/interface';
import { Form, Select } from 'antd';
import { useContext, useEffect, useState } from 'react';

const ScanRule = ({ formRef, resetScanTableData, reset, setDatabases }) => {
  const context = useContext(ProjectContext);
  const [dataSourceId, setDataSourceId] = useState<number>(-1);
  const [databaseId, setDatabaseId] = useState<number>(0);
  const [dataSourceOptions, setDataSourceOptions] = useState<SelectItemProps[]>([]);
  const [databaseIdsOptions, setDatabaseIdsOptions] = useState<SelectItemProps[]>([]);
  const [sensitiveOptions, setSensitiveOptions] = useState<SelectItemProps[]>([]);

  const initDataSources = async () => {
    const rawData = await getConnectionList({});
    const resData = rawData?.contents?.map((content) => ({
      label: content.name,
      value: content.id,
    }));
    setDataSourceOptions(resData);
  };
  const initDatabases = async (
    projectId: number = context.projectId,
    id: number = dataSourceId,
  ) => {
    const rawData = await listDatabases(projectId, id);
    setDatabases(rawData?.contents);
    const resData =
      rawData?.contents?.map((content) => ({
        label: content.name,
        value: content.id,
      })) || [];
    setDatabaseIdsOptions([
      {
        label: '全部',
        value: -1,
      },
      ...resData,
    ]);
    formRef.setFieldsValue({ databaseIds: [], sensitiveRuleIds: [] });
  };

  const initDetectRules = async (projectId: number = context.projectId) => {
    const rawData = await listSensitiveRules(projectId, { enabled: [true] });
    const resData = rawData?.contents?.map((content) => ({
      label: content.name,
      value: content.id,
    }));
    setSensitiveOptions([
      {
        label: '全部',
        value: -1,
      },
      ...resData,
    ]);
  };
  const handleDataSourceIdChange = async (v: number) => {
    setDataSourceId(v);
    resetScanTableData();
    reset();
    setDatabaseId(0);
  };

  const handleDatabaseIdsSelect = async (value: number) => {
    if (value === -1) {
      await formRef.setFieldsValue({ databaseIds: [-1] });
    } else {
      const databaseIds = (await formRef.getFieldValue('databaseIds')) || [];
      if (databaseIds.includes(-1)) {
        await formRef.setFieldsValue({
          databaseIds: databaseIds.filter((v) => v != -1),
        });
      }
    }
    reset();
    setDatabaseId(value);
  };
  const handleSensitiveRuleIdsSelect = async (value: number) => {
    if (value === -1) {
      await formRef.setFieldsValue({ sensitiveRuleIds: [-1] });
    } else {
      const sensitiveRuleIds = (await formRef.getFieldValue('sensitiveRuleIds')) || [];
      if (sensitiveRuleIds.includes(-1)) {
        await formRef.setFieldsValue({
          sensitiveRuleIds: sensitiveRuleIds.filter((v) => v != -1),
        });
      }
    }
    reset();
  };
  useEffect(() => {
    if (dataSourceId !== -1) {
      initDatabases(context.projectId, dataSourceId);
    }
  }, [dataSourceId]);
  useEffect(() => {
    initDataSources();
    initDatabases();
    initDetectRules();
  }, []);

  return (
    <div style={{ display: 'flex', columnGap: '8px' }}>
      <Form.Item
        label={'数据源'}
        name="connectionId"
        rules={[
          {
            required: true,
            message: '请选择数据源',
          },
        ]}
      >
        <Select
          options={dataSourceOptions}
          onChange={handleDataSourceIdChange}
          placeholder={'请选择'}
          maxTagCount="responsive"
          style={{ width: '170px' }}
        ></Select>
      </Form.Item>
      <Form.Item
        label={'数据库'}
        name="databaseIds"
        rules={[
          {
            required: true,
            message: '请选择数据库',
          },
        ]}
      >
        <Select
          mode="multiple"
          options={databaseIdsOptions}
          // onChange={handleDatabaseIdsChange}
          onSelect={handleDatabaseIdsSelect}
          placeholder={'请选择'}
          maxTagCount="responsive"
          disabled={
            databaseIdsOptions?.length === 1 ||
            dataSourceOptions?.length === 0 ||
            dataSourceId === -1
          }
          style={{ width: '262px' }}
        />
      </Form.Item>
      <Form.Item
        label={'识别规则'}
        name="sensitiveRuleIds"
        rules={[
          {
            required: true,
            message: '请选择数据源',
          },
        ]}
      >
        <Select
          mode="multiple"
          options={sensitiveOptions}
          onSelect={handleSensitiveRuleIdsSelect}
          disabled={
            databaseIdsOptions?.length === 1 || sensitiveOptions?.length === 1 || databaseId === 0
          }
          maxTagCount="responsive"
          placeholder={'请选择'}
          style={{ width: '244px' }}
        />
      </Form.Item>
    </div>
  );
};

export default ScanRule;
