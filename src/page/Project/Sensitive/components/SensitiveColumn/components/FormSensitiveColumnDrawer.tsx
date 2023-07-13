import {
  batchCreateSensitiveColumns,
  getScanningResults,
  ScannResultType,
  startScanning,
} from '@/common/network/sensitiveColumn';
import { IDatabase } from '@/d.ts/database';
import { ISensitiveColumn } from '@/d.ts/sensitiveColumn';
import ProjectContext from '@/page/Project/ProjectContext';
import { AddSensitiveColumnType, ScanTableData } from '@/page/Project/Sensitive/interface';
import SensitiveContext from '@/page/Project/Sensitive/SensitiveContext';
import { Button, Drawer, message, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useContext, useEffect, useRef, useState } from 'react';
import styles from './index.less';
import ManualForm from './ManualForm';
import ScanForm from './ScanForm';

const defaultScanTableData: Array<ScanTableData> = [];

const checkResult = (resData: Array<ScanTableData> = []) =>
  resData?.length > 0 ? resData : defaultScanTableData;

const FormSensitiveColumnDrawer = ({
  isEdit,
  visible,
  onClose,
  onOk,
  addSensitiveColumnType,
  initSensitiveColumn,
}) => {
  const [formRef] = useForm();
  const [_formRef] = useForm();
  const context = useContext(ProjectContext);
  const sensitiveContext = useContext(SensitiveContext);
  const [scanTableData, setScanTableData] = useState<ScanTableData[]>([]);
  const [databases, setDatabases] = useState<IDatabase[]>([]);
  const [submiting, setSubmiting] = useState<boolean>(false);
  const [sensitiveColumns, setSensitiveColumns] = useState<ISensitiveColumn[]>([]);
  const [sensitiveColumnMap, setSensitiveColumnMap] = useState(new Map());
  const [taskId, setTaskId] = useState<string>();
  const [scanStatus, setScanStatus] = useState<ScannResultType>();
  const [scanLoading, setScanLoading] = useState<boolean>(false);
  const [hasScan, setHasScan] = useState<boolean>(false);
  const [percent, setPercent] = useState<number>(0);
  const [successful, setSuccessful] = useState<boolean>(false);
  const timer = useRef(null);
  const [searchText, setSearchText] = useState<string>('');

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };
  const onSearch = () => {
    if (searchText.trim() === '') {
      return;
    }

    const dataSourceMap = new Map();
    const filterSensitiveColumns =
      sensitiveColumns?.filter((d) =>
        d?.columnName?.toLowerCase()?.includes(searchText?.toLowerCase()),
      ) || [];
    filterSensitiveColumns?.forEach((d) => {
      const key = `${d.database.name}_${d.tableName}`;
      if (dataSourceMap.has(key)) {
        dataSourceMap.get(key)?.dataSource?.push({
          columnName: d.columnName,
          sensitiveRuleId: d.sensitiveRuleId,
          maskingAlgorithmId: d.maskingAlgorithmId,
        });
      } else {
        dataSourceMap.set(key, {
          header: {
            database: d.database.name,
            tableName: d.tableName,
          },
          dataSource: [
            {
              columnName: d.columnName,
              sensitiveRuleId: d.sensitiveRuleId,
              maskingAlgorithmId: d.maskingAlgorithmId,
            },
          ],
        });
      }
    });

    const resData = [];
    dataSourceMap?.forEach((ds) => {
      resData.push(ds);
    });
    setScanTableData(checkResult(resData));
  };

  const reset = () => {
    setTaskId(null);
    setScanStatus(null);
    setScanLoading(false);
    setPercent(0);
    setSuccessful(false);
    setHasScan(false);
  };

  const resetScanTableData = () => {
    formRef.resetFields();
    _formRef.resetFields();

    setScanTableData(defaultScanTableData);
    setDatabases([]);
    setSubmiting(false);
    setSensitiveColumns([]);
    setSensitiveColumnMap(new Map());
    setTaskId('');
    setScanStatus(null);
    setScanLoading(false);
    setHasScan(false);
    setPercent(0);
    setSuccessful(false);
    setSearchText('');

    clearTimeout(timer.current);
  };

  const handleScanTableDataChange = (index: number, _index: number, maskingAlgorithmId: number) => {
    const {
      header: { database, tableName },
    } = scanTableData[index];
    const key = `${database}_${tableName}`;

    sensitiveColumnMap.get(key).dataSource[_index].maskingAlgorithmId = maskingAlgorithmId;

    const resData = [];
    sensitiveColumnMap?.forEach((ds) => {
      resData.push(ds);
    });
    setScanTableData(checkResult(resData));
  };

  const handleScanTableDataDelete = (index: number, _index: number) => {
    const {
      header: { database, tableName },
    } = scanTableData[index];
    const key = `${database}_${tableName}`;
    const filterDataSource =
      sensitiveColumnMap.get(key).dataSource.filter((d, i) => i !== _index) || [];
    sensitiveColumnMap.get(key).dataSource = filterDataSource;
    if (filterDataSource?.length === 0) {
      sensitiveColumnMap.delete(key);
    }

    const resData = [];
    sensitiveColumnMap?.forEach((ds) => {
      resData.push(ds);
    });
    setScanTableData(checkResult(resData));
  };
  const handleStartScan = async () => {
    reset();
    setScanTableData(defaultScanTableData);
    const rawData = await formRef.validateFields().catch();
    if (rawData.databaseIds?.includes(-1)) {
      rawData.allDatabases = true;
      rawData.databaseIds = [];
    } else {
      rawData.allDatabases = false;
    }
    if (rawData.sensitiveRuleIds?.includes(-1)) {
      rawData.allSensitiveRules = true;
      rawData.sensitiveRuleIds = [];
    } else {
      rawData.allSensitiveRules = false;
    }
    setScanLoading(true);
    const taskId = await startScanning(context.projectId, rawData);
    if (taskId) {
      setTaskId(taskId);
      setScanStatus(ScannResultType.CREATED);
    } else {
      setScanLoading(false);
      reset();
    }
  };
  const handleScanSubmit = async () => {
    await formRef.validateFields().catch();
    const rawData = [];
    sensitiveColumns?.forEach((sc) => {
      const key = `${sc.database.name}_${sc.tableName}`;
      if (sensitiveColumnMap.has(key)) {
        const maskingAlgorithmId = sensitiveColumnMap
          .get(key)
          .dataSource?.find((c) => c.columnName === sc.columnName)?.maskingAlgorithmId;
        sc.enabled = true;
        sc.maskingAlgorithmId = maskingAlgorithmId;
        rawData.push(sc);
      }
    });
    if (rawData?.length === 0) {
      return;
    }
    setSubmiting(true);
    const res = await batchCreateSensitiveColumns(context.projectId, rawData);
    if (res) {
      message.success('新建成功');
      onOk();
      reset();
      resetScanTableData();
    } else {
      message.error('新建失败');
    }
  };
  const handleManualSubmit = async () => {
    const data = await formRef.validateFields().catch();
    if (data?.manual?.length === 0) {
      return message.error('不能提交空表单');
    }
    data?.manual?.map((d) => {
      d.database = databases?.find((database) => database?.id === d.database);
      d.enabled = true;
      return d;
    });
    const res = await batchCreateSensitiveColumns(context.projectId, data?.manual);
    if (res) {
      message.success('新建成功');
      onOk();
      formRef.resetFields();
    } else {
      message.error('新建失败');
    }
  };

  const hanldeClose = () => {
    onClose(() => {
      formRef?.resetFields();
      _formRef?.resetFields();
      setSuccessful(false);
      setScanTableData([]);
      setSensitiveColumnMap(new Map());
      setSensitiveColumns([]);
      setTaskId(null);
      setScanStatus(null);
      setScanLoading(false);
      setPercent(0);
      setSearchText('');
      clearTimeout(timer.current);
    });
  };
  const handleScanning = async (taskId: string) => {
    const rawData = await getScanningResults(context.projectId, taskId);
    const { status, sensitiveColumns, allTableCount, finishedTableCount } = rawData;
    if ([ScannResultType.FAILED, ScannResultType.SUCCESS].includes(status)) {
      const dataSourceMap = new Map();

      setSensitiveColumns(sensitiveColumns);
      sensitiveColumns?.forEach((d) => {
        const key = `${d.database.name}_${d.tableName}`;
        if (dataSourceMap.has(key)) {
          dataSourceMap.get(key)?.dataSource?.push({
            columnName: d.columnName,
            sensitiveRuleId: d.sensitiveRuleId,
            maskingAlgorithmId: d.maskingAlgorithmId,
          });
        } else {
          dataSourceMap.set(key, {
            header: {
              database: d.database.name,
              tableName: d.tableName,
            },
            dataSource: [
              {
                columnName: d.columnName,
                sensitiveRuleId: d.sensitiveRuleId,
                maskingAlgorithmId: d.maskingAlgorithmId,
              },
            ],
          });
        }
      });

      setSensitiveColumnMap(dataSourceMap);
      const resData = [];
      dataSourceMap?.forEach((ds) => {
        resData.push(ds);
      });
      setScanTableData(checkResult(resData));
      setScanStatus(ScannResultType.SUCCESS);
      setSuccessful(true);
      setPercent(Math.floor((finishedTableCount * 100) / allTableCount));
      setScanLoading(false);
    } else {
      setScanStatus(ScannResultType.RUNNING);
      setHasScan(true);
      setPercent(Math.floor((finishedTableCount * 100) / allTableCount));
      timer.current = setTimeout(() => {
        handleScanning(taskId);
        clearTimeout(timer.current);
      }, 1000);
    }
  };
  useEffect(() => {
    if (!isEdit) {
      formRef.setFieldsValue({
        manual: [
          {
            dataSource: undefined,
            database: undefined,
            tableName: undefined,
            columnName: undefined,
            maskingAlgorithmId: undefined,
          },
        ],
      });
    }
  }, [isEdit, visible]);
  useEffect(() => {
    if (successful && searchText === '') {
      const resData = [];
      sensitiveColumnMap?.forEach((ds) => {
        resData.push(ds);
      });
      setScanTableData(checkResult(resData));
    }
  }, [searchText, successful]);
  useEffect(() => {
    if (taskId && [ScannResultType.CREATED, ScannResultType.RUNNING].includes(scanStatus)) {
      handleScanning(taskId);
    }
    return () => {
      clearTimeout(timer.current);
    };
  }, [taskId, scanStatus]);
  return (
    <Drawer
      title={
        addSensitiveColumnType === AddSensitiveColumnType.Manual
          ? '手动添加敏感列'
          : '扫描添加敏感列'
      }
      width={addSensitiveColumnType === AddSensitiveColumnType.Manual ? 800 : 724}
      open={visible}
      onClose={hanldeClose}
      destroyOnClose={true}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Space>
            <Button onClick={hanldeClose}>取消</Button>
            <Button
              type="primary"
              disabled={submiting}
              onClick={
                addSensitiveColumnType === AddSensitiveColumnType.Manual
                  ? handleManualSubmit
                  : handleScanSubmit
              }
            >
              提交
            </Button>
          </Space>
        </div>
      }
      className={styles.drawer}
    >
      {addSensitiveColumnType === AddSensitiveColumnType.Manual ? (
        <ManualForm
          {...{
            formRef,
          }}
        />
      ) : (
        <ScanForm
          {...{
            formRef,
            _formRef,
            hasScan,
            databases,
            setDatabases,
            resetScanTableData,
            reset,
            handleStartScan,
            scanLoading,
            successful,
            searchText,
            handleSearchChange,
            onSearch,
            scanTableData,
            percent,
            sensitiveContext,
            handleScanTableDataChange,
            handleScanTableDataDelete,
          }}
        />
      )}
    </Drawer>
  );
};

export default FormSensitiveColumnDrawer;
