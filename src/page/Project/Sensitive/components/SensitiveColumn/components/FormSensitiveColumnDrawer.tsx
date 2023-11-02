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
import { formatMessage } from '@/util/intl';
import { Button, Drawer, message, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useContext, useEffect, useRef, useState } from 'react';
import styles from './index.less';
import ManualForm from './ManualForm';
import ScanForm from './ScanForm';
import tracert from '@/util/tracert';
import SensitiveRule from '../../SensitiveRule';
const defaultScanTableData: Array<ScanTableData> = [];
const checkResult = (resData: Array<ScanTableData> = []) =>
  resData?.length > 0 ? resData : defaultScanTableData;
const FormSensitiveColumnDrawer = ({
  isEdit,
  visible,
  projectId,
  onClose,
  onOk,
  addSensitiveColumnType,
}) => {
  const [formRef] = useForm();
  const [_formRef] = useForm();
  const timer = useRef(null);
  const context = useContext(ProjectContext);
  const sensitiveContext = useContext(SensitiveContext);
  const [scanTableData, setScanTableData] = useState<ScanTableData[]>([]);
  const [originScanTableData, setOriginScanTableData] = useState<ScanTableData[]>([]);
  const [submiting, setSubmiting] = useState<boolean>(false);
  const [sensitiveColumns, setSensitiveColumns] = useState<ISensitiveColumn[]>([]);
  const [sensitiveColumnMap, setSensitiveColumnMap] = useState(new Map());
  const [taskId, setTaskId] = useState<string>();
  const [scanStatus, setScanStatus] = useState<ScannResultType>();
  const [scanLoading, setScanLoading] = useState<boolean>(false);
  const [hasScan, setHasScan] = useState<boolean>(false);
  const [percent, setPercent] = useState<number>(0);
  const [successful, setSuccessful] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [manageSensitiveRuleDrawerOpen, setManageSensitiveRuleDrawerOpen] = useState<boolean>(
    false,
  );
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };
  const onSearch = () => {
    if (searchText.trim() === '') {
      return;
    }
    const resData = [];
    sensitiveColumnMap.forEach((sc, key) => {
      const filterColumn = sc?.dataSource?.filter((item) =>
        item?.columnName?.toLowerCase()?.includes(searchText?.toLocaleLowerCase()),
      );
      if (filterColumn?.length > 0) {
        resData.push({
          header: sc?.header,
          dataSource: filterColumn,
        });
      }
    });
    setScanTableData(checkResult(resData));
  };
  const resetSearch = () => {
    setSearchText('');
    setScanTableData(originScanTableData);
  };
  const reset = () => {
    setTaskId(null);
    setScanStatus(null);
    setScanLoading(false);
    setPercent(0);
    setSuccessful(false);
    setHasScan(false);
    setSearchText('');
  };
  const resetScanTableData = () => {
    formRef.resetFields();
    _formRef.resetFields();
    setScanTableData(defaultScanTableData);
    setOriginScanTableData(defaultScanTableData);
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
  const handleScanTableDataChange = (
    key: string,
    columnName: string,
    maskingAlgorithmId: number,
  ) => {
    const resData = [];
    if (!!searchText) {
      const newDataSource = sensitiveColumnMap.get(key).dataSource.map((item) => {
        if (item.columnName === columnName) {
          item.maskingAlgorithmId = maskingAlgorithmId;
        }
        return item;
      });
      sensitiveColumnMap.get(key).dataSource = newDataSource;
      sensitiveColumnMap.forEach((sc, key) => {
        const filterColumn = sc?.dataSource?.filter((item) =>
          item?.columnName?.toLowerCase()?.includes(searchText?.toLocaleLowerCase()),
        );
        if (filterColumn?.length > 0) {
          resData.push({
            header: sc?.header,
            dataSource: filterColumn,
          });
        }
      });
      setScanTableData(checkResult(resData));
      setOriginScanTableData(checkResult(resData));
    } else {
      const newDataSource = sensitiveColumnMap.get(key).dataSource.map((item) => {
        if (item.columnName === columnName) {
          item.maskingAlgorithmId = maskingAlgorithmId;
        }
        return item;
      });
      sensitiveColumnMap.get(key).dataSource = newDataSource;
      sensitiveColumnMap?.forEach((ds) => {
        resData.push(ds);
      });
      setScanTableData(checkResult(resData));
      setOriginScanTableData(checkResult(resData));
    }
    setSensitiveColumnMap(sensitiveColumnMap);
  };
  const handleScanTableDataDelete = (database: string, tableName: string, columnName: string) => {
    const key = `${database}_${tableName}`;
    const filterDataSource =
      sensitiveColumnMap.get(key).dataSource.filter((ds) => ds?.columnName !== columnName) || [];
    sensitiveColumnMap.get(key).dataSource = filterDataSource;
    if (filterDataSource?.length === 0) {
      sensitiveColumnMap.delete(key);
    }
    const resData = [];
    if (!!searchText) {
      sensitiveColumnMap?.forEach((dsItem) => {
        const newDataSource = dsItem?.dataSource?.filter((ds) =>
          ds?.columnName?.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
        );
        if (newDataSource?.length > 0) {
          resData.push({
            header: dsItem?.header,
            dataSource: newDataSource,
          });
        }
      });
    } else {
      // 没有searchText 纯删除
      sensitiveColumnMap?.forEach((dsItem) => {
        resData.push(dsItem);
      });
    }
    setScanTableData(checkResult(resData));
    setOriginScanTableData(checkResult(resData));
    setSensitiveColumnMap(sensitiveColumnMap);
  };
  const handleScanTableDataDeleteByTableName = (database: string, tableName: string) => {
    const key = `${database}_${tableName}`;
    const resData = [];
    if (!!searchText) {
      sensitiveColumnMap.get(key).dataSource = sensitiveColumnMap
        .get(key)
        .dataSource?.filter(
          (item) => !item.columnName?.toLowerCase()?.includes(searchText?.toLowerCase()),
        );
      const originResData = [];
      sensitiveColumnMap?.forEach((dsItem) => {
        if (dsItem?.dataSource?.length > 0) {
          originResData.push(dsItem);
        }
      });
      setOriginScanTableData(checkResult(originResData));
      sensitiveColumnMap?.forEach((dsItem, dsKey) => {
        if (dsItem?.dataSource?.length > 0) {
          resData.push(dsItem);
        } else {
          sensitiveColumnMap.delete(key);
        }
      });
    } else {
      sensitiveColumnMap.delete(key);
      sensitiveColumnMap?.forEach((dsItem) => {
        resData.push(dsItem);
      });
      setOriginScanTableData(checkResult(resData));
    }
    setScanTableData(checkResult(resData));
    setSensitiveColumnMap(sensitiveColumnMap);
  };
  const handleStartScan = async () => {
    reset();
    setScanTableData(defaultScanTableData);
    setOriginScanTableData(defaultScanTableData);
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
    sensitiveColumns.forEach((sensitiveColumn) => {
      const key = `${sensitiveColumn.database.name}_${sensitiveColumn.tableName}`;
      if (sensitiveColumnMap.get(key)) {
        const column = sensitiveColumnMap
          .get(key)
          ?.dataSource.find((item) => item.columnName === sensitiveColumn.columnName);
        if (column) {
          rawData.push({
            ...sensitiveColumn,
            enabled: true,
            maskingAlgorithmId: column.maskingAlgorithmId,
          });
        }
      }
    });
    let data = [];
    if (!!searchText) {
      data = rawData.filter((d) =>
        d.columnName.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
      );
    } else {
      data = rawData;
    }
    if (data?.length === 0) {
      return;
    }
    setSubmiting(true);
    const res = await batchCreateSensitiveColumns(context.projectId, data);
    if (res) {
      tracert.click('a3112.b64002.c330861.d367391');
      message.success(
        formatMessage({
          id: 'odc.SensitiveColumn.components.FormSensitiveColumnDrawer.New',
        }), //新建成功
      );

      onOk();
      reset();
      resetScanTableData();
      setSubmiting(false);
    } else {
      message.error(
        formatMessage({
          id: 'odc.SensitiveColumn.components.FormSensitiveColumnDrawer.FailedToCreate',
        }), //新建失败
      );
    }
  };

  const hanldeClose = () => {
    onClose(() => {
      formRef?.resetFields();
      _formRef?.resetFields();
      setSuccessful(false);
      setScanTableData(defaultScanTableData);
      setOriginScanTableData(defaultScanTableData);
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
              type: d.type,
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
      setOriginScanTableData(checkResult(resData));
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
      setOriginScanTableData(checkResult(resData));
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
    <>
      <Drawer
        title={
          addSensitiveColumnType === AddSensitiveColumnType.Manual
            ? formatMessage({
                id:
                  'odc.SensitiveColumn.components.FormSensitiveColumnDrawer.ManuallyAddSensitiveColumns',
              }) //手动添加敏感列
            : formatMessage({
                id:
                  'odc.SensitiveColumn.components.FormSensitiveColumnDrawer.ScanToAddSensitiveColumns',
              }) //扫描添加敏感列
        }
        width={724}
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
              <Button onClick={hanldeClose}>
                {
                  formatMessage({
                    id: 'odc.SensitiveColumn.components.FormSensitiveColumnDrawer.Cancel',
                  }) /*取消*/
                }
              </Button>
              <Button
                type="primary"
                disabled={sensitiveColumnMap?.size === 0 || submiting}
                onClick={handleScanSubmit}
              >
                {
                  formatMessage({
                    id: 'odc.SensitiveColumn.components.FormSensitiveColumnDrawer.Submit',
                  }) /*提交*/
                }
              </Button>
            </Space>
          </div>
        }
        className={styles.drawer}
      >
        <ScanForm
          {...{
            formRef,
            _formRef,
            hasScan,
            originScanTableData,
            resetSearch,
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
            handleScanTableDataDeleteByTableName,
            setManageSensitiveRuleDrawerOpen,
          }}
        />
      </Drawer>

      <Drawer
        open={manageSensitiveRuleDrawerOpen}
        title={
          formatMessage({
            id:
              'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.ManagementRecognitionRules',
          }) //'管理识别规则'
        }
        width={720}
        destroyOnClose
        onClose={() => {
          setManageSensitiveRuleDrawerOpen(false);
        }}
      >
        <SensitiveRule projectId={projectId} />
      </Drawer>
    </>
  );
};
export default FormSensitiveColumnDrawer;
