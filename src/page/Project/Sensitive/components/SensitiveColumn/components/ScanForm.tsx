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
  getScanningResults,
  ScannResultType,
  startScanning,
} from '@/common/network/sensitiveColumn';
import { ESensitiveColumnType, ISensitiveColumn } from '@/d.ts/sensitiveColumn';
import ProjectContext from '@/page/Project/ProjectContext';
import { maskRuleTypeMap } from '@/page/Secure/MaskingAlgorithm';
import { ReactComponent as TableOutlined } from '@/svgr/menuTable.svg';
import { ReactComponent as ViewSvg } from '@/svgr/menuView.svg';
import { formatMessage } from '@/util/intl';
import Icon, { CheckCircleFilled, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import {
  Button,
  Collapse,
  Descriptions,
  Empty,
  Form,
  FormInstance,
  Input,
  Progress,
  Select,
  Space,
  Table,
  Tooltip,
} from 'antd';
import classnames from 'classnames';
import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { PopoverContainer } from '..';
import { ScanTableData, ScanTableDataItem } from '../../../interface';
import SensitiveContext, { ISensitiveContext } from '../../../SensitiveContext';
import { checkResult, defaultScanTableData } from './FormSensitiveColumnDrawer';
import styles from './index.less';
import ScanRule from './SacnRule';
interface IScanFormProps {
  formRef: FormInstance<any>;
  _formRef: FormInstance<any>;
  setSensitiveColumns: React.Dispatch<React.SetStateAction<ISensitiveColumn[]>>;
  setFormData: React.Dispatch<React.SetStateAction<Object>>;
  setManageSensitiveRuleDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const ScanForm = (props: IScanFormProps, ref) => {
  const { formRef, _formRef, setFormData, setSensitiveColumns, setManageSensitiveRuleDrawerOpen } =
    props;
  const projectContext = useContext(ProjectContext);
  const sensitiveContext = useContext(SensitiveContext);
  const timer = useRef(null);
  const [taskId, setTaskId] = useState<string>();
  const [scanStatus, setScanStatus] = useState<ScannResultType>();
  const [scanLoading, setScanLoading] = useState<boolean>(false);
  const [hasScan, setHasScan] = useState<boolean>(false);
  const [percent, setPercent] = useState<number>(0);
  const [successful, setSuccessful] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [scanTableData, setScanTableData] = useState<ScanTableData[]>([]);
  const [originScanTableData, setOriginScanTableData] = useState<ScanTableData[]>([]);
  const [activeKeys, setActiveKeys] = useState<string | string[]>(['0']);
  const [sensitiveColumnMap, setSensitiveColumnMap] = useState<Map<string, any>>(new Map());
  const reset = () => {
    setTaskId(null);
    setScanStatus(null);
    setScanLoading(false);
    setHasScan(false);
    setPercent(0);
    setSuccessful(false);
    setSearchText('');
    setScanTableData([]);
    setOriginScanTableData([]);
    setActiveKeys(['0']);
    setSensitiveColumnMap(new Map());
    setFormData({});
    setSensitiveColumns([]);
  };
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
  const handleStartScan = async () => {
    const rawData = await formRef.validateFields().catch();
    setScanTableData(defaultScanTableData);
    setOriginScanTableData(defaultScanTableData);
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
    const taskId = await startScanning(projectContext.projectId, rawData);
    if (taskId) {
      setTaskId(taskId);
      setScanStatus(ScannResultType.CREATED);
    }
  };
  const handleScanning = async (taskId: string) => {
    const rawData = await getScanningResults(projectContext.projectId, taskId);
    const { status, sensitiveColumns, allTableCount, finishedTableCount } = rawData;
    if ([ScannResultType.FAILED, ScannResultType.SUCCESS].includes(status)) {
      const dataSourceMap = new Map();
      setSensitiveColumns(sensitiveColumns);
      sensitiveColumns?.forEach((d) => {
        const key = `${d.database.name}_${d.type}_${d.tableName}`;
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
              databaseId: d.database.databaseId,
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
      dataSourceMap.forEach((value, key) => {
        value.dataSource = value.dataSource.sort((a, b) =>
          a?.columnName?.localeCompare(b?.columnName),
        );
        dataSourceMap.set(key, value);
      });
      setSensitiveColumnMap(dataSourceMap);
      const resData = [];
      dataSourceMap?.forEach((ds) => {
        resData.push(ds);
      });
      const rawFormData = checkResult(resData);
      setActiveKeys(
        rawFormData?.length === 0
          ? ['0']
          : rawFormData?.map(
              ({ header: { database, tableName, type }, dataSource }, index) =>
                `${database}_${type}_${tableName}`,
            ),
      );
      setScanTableData(rawFormData);
      setOriginScanTableData(rawFormData);
      const scanTableData = {};
      const newScanTableDataMap = {};
      rawFormData?.forEach(({ dataSource = [], header = {} }) => {
        const { database = '', tableName, type, databaseId } = header;
        scanTableData[database] = scanTableData?.[database] || {
          [ESensitiveColumnType.TABLE_COLUMN]: {},
          [ESensitiveColumnType.VIEW_COLUMN]: {},
        };
        scanTableData[database][type][tableName] = {};
        dataSource?.forEach(({ columnName, maskingAlgorithmId }) => {
          scanTableData[database][type][tableName][columnName] = maskingAlgorithmId;
          newScanTableDataMap[`${database}_${type}_${tableName}_${columnName}`] =
            sensitiveColumns?.find(
              (item) =>
                item?.database?.databaseId === databaseId &&
                item.type === type &&
                item.tableName === tableName &&
                item.columnName === columnName,
            );
        });
      });
      setFormData(scanTableData);
      setSuccessful(true);
      setScanStatus(ScannResultType.SUCCESS);
      setPercent(Math.floor((finishedTableCount * 100) / allTableCount));
      await _formRef.setFieldsValue({
        scanTableData,
      });
      setScanLoading(false);
    } else {
      setScanStatus(ScannResultType.RUNNING);
      setHasScan(true);
      setSuccessful(false);
      setActiveKeys(['0']);
      setScanLoading(true);
      setPercent(Math.floor((finishedTableCount * 100) / allTableCount));
      timer.current = setTimeout(() => {
        handleScanning(taskId);
        clearTimeout(timer.current);
      }, 500);
    }
  };
  const handleScanTableDataDelete = (
    database: string,
    type: string,
    tableName: string,
    columnName: string,
  ) => {
    const key = `${database}_${type}_${tableName}`;
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
    const newTableData = checkResult(resData);
    setScanTableData(newTableData);
    setOriginScanTableData(newTableData);
    newTableData?.length === 0 && setActiveKeys(['0']);
    setSensitiveColumnMap(sensitiveColumnMap);
  };
  const handleScanTableDataDeleteByTableName = (
    database: string,
    type: string,
    tableName: string,
  ) => {
    const key = `${database}_${type}_${tableName}`;
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
      const newTableData = checkResult(originResData);
      newTableData?.length === 0 && setActiveKeys(['0']);
      setOriginScanTableData(newTableData);
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
      const newTableData = checkResult(resData);
      setOriginScanTableData(newTableData);
      newTableData?.length === 0 && setActiveKeys(['0']);
    }
    setScanTableData(checkResult(resData));
    setSensitiveColumnMap(sensitiveColumnMap);
  };
  useImperativeHandle(ref, () => {
    return {
      getColumnMap: () => {
        return sensitiveColumnMap;
      },
      reset,
    };
  });
  useEffect(() => {
    if (taskId && [ScannResultType.CREATED, ScannResultType.RUNNING].includes(scanStatus)) {
      handleScanning(taskId);
    }
    return () => {
      clearTimeout(timer.current);
    };
  }, [taskId, scanStatus]);
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
  return (
    <>
      <Form form={formRef} layout="vertical" requiredMark="optional">
        <ScanRule
          setManageSensitiveRuleDrawerOpen={setManageSensitiveRuleDrawerOpen}
          formRef={formRef}
          reset={reset}
        />

        <ScanButton
          scanLoading={scanLoading}
          successful={successful}
          handleStartScan={handleStartScan}
        />
      </Form>
      <PreviewHeader
        searchText={searchText}
        scanTableData={scanTableData}
        originScanTableData={originScanTableData}
        onSearch={onSearch}
        resetSearch={resetSearch}
        handleSearchChange={handleSearchChange}
      />

      <div
        style={{
          height: 'calc(100% - 150px)',
          overflowY: 'scroll',
        }}
      >
        <Form
          form={_formRef}
          layout="vertical"
          initialValues={{
            scanTableData: {},
          }}
        >
          {originScanTableData?.length === 0 ? (
            <EmptyCollapse
              percent={percent}
              hasScan={hasScan}
              scanLoading={scanLoading}
              successful={successful}
              empty={true}
            />
          ) : (
            <CollapseItemContent
              activeKeys={Array.isArray(activeKeys) ? activeKeys : [activeKeys]}
              scanTableData={scanTableData}
              sensitiveContext={sensitiveContext}
              handleScanTableDataDelete={handleScanTableDataDelete}
              handleScanTableDataDeleteByTableName={handleScanTableDataDeleteByTableName}
              setActiveKeys={setActiveKeys}
            />
          )}
        </Form>
      </div>
    </>
  );
};
const EmptyOrSpin: React.FC<{
  empty?: boolean;
  isSearch?: boolean;
  hasScan: boolean;
  percent: number;
  successful: boolean;
  scanLoading: boolean;
}> = ({ empty = false, isSearch = false, scanLoading, hasScan, percent, successful }) => {
  const gentDescription = () => {
    if (hasScan && isSearch && isSearch) {
      return formatMessage({
        id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.TheSensitiveColumnsInThe',
        defaultMessage: '扫描结果中的敏感列不包含搜索内容',
      }); //'扫描结果中的敏感列不包含搜索内容'
    }
    if (hasScan && successful && empty) {
      return formatMessage({
        id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.SelectingTheDatabaseIsCurrently',
        defaultMessage: '选中数据库目前暂无可选敏感列',
      }); //'选中数据库目前暂无可选敏感列'
    }
    if (hasScan && !successful) {
      return formatMessage({
        id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.ScanFailure',
        defaultMessage: '扫描失败',
      }); //'扫描失败'
    }
    return formatMessage({
      id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.NoData',
      defaultMessage: '暂无数据',
    }); //'暂无数据'
  };
  return (
    <div
      style={{
        height: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {scanLoading ? (
        <div>
          <div
            style={{
              marginLeft: '16px',
            }}
          >
            {
              formatMessage({
                id: 'odc.SensitiveColumn.components.ScanForm.ScanningTheScanningTimeMay',
                defaultMessage: '正在扫描中。扫描时间可能较长请耐心等待…',
              }) /*正在扫描中。扫描时间可能较长请耐心等待…*/
            }
          </div>
          <Progress
            percent={percent}
            style={{
              maxWidth: '628px',
              margin: '0px 16px',
            }}
          />
        </div>
      ) : (
        <Empty description={gentDescription()} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  );
};
const ScanButton: React.FC<{
  scanLoading: boolean;
  successful: boolean;
  handleStartScan: () => void;
}> = ({ scanLoading, successful, handleStartScan }) => {
  return (
    <Space>
      <Button
        onClick={handleStartScan}
        disabled={scanLoading}
        icon={scanLoading && <SyncOutlined spin={true} />}
      >
        {
          scanLoading
            ? formatMessage({
                id: 'odc.SensitiveColumn.components.ScanForm.Scanning',
                defaultMessage: '正在扫描',
              }) //正在扫描
            : formatMessage({
                id: 'odc.SensitiveColumn.components.ScanForm.StartScanning',
                defaultMessage: '开始扫描',
              }) //开始扫描
        }
      </Button>
      {successful && (
        <Space>
          <CheckCircleFilled
            style={{
              color: '#52c41a',
            }}
          />

          <div>
            {
              formatMessage({
                id: 'odc.SensitiveColumn.components.ScanForm.ScanCompleted',
                defaultMessage: '扫描完成',
              }) /*扫描完成*/
            }
          </div>
        </Space>
      )}
    </Space>
  );
};
const getColumns = (
  database: string,
  type: ESensitiveColumnType,
  tableName: string,
  sensitiveContext: Partial<ISensitiveContext>,
  handleScanTableDataDelete: (
    database: string,
    type: string,
    tableName: string,
    columnName: string,
  ) => void,
) => {
  return [
    {
      title: formatMessage({
        id: 'odc.SensitiveColumn.components.ScanForm.Column',
        defaultMessage: '列',
      }),
      //列
      width: 146,
      dataIndex: 'columnName',
      key: 'columnName',
    },
    {
      title: formatMessage({
        id: 'odc.SensitiveColumn.components.ScanForm.IdentificationRules',
        defaultMessage: '识别规则',
      }),
      //识别规则
      width: 126,
      dataIndex: 'sensitiveRuleId',
      key: 'sensitiveRuleId',
      render: (text) => sensitiveContext?.sensitiveRuleIdMap?.[text],
    },
    {
      title: formatMessage({
        id: 'odc.SensitiveColumn.components.ScanForm.DesensitizationAlgorithm',
        defaultMessage: '脱敏算法',
      }),
      //脱敏算法
      width: 180,
      dataIndex: 'maskingAlgorithmId',
      key: 'maskingAlgorithmId',
      render: (text, record, _index) => {
        return (
          <Form.Item
            name={['scanTableData', database, type, tableName, record.columnName]}
            key={['scanTableData', database, type, tableName, record.columnName].join('')}
          >
            <Select
              key={_index}
              style={{
                width: '144px',
              }}
              defaultValue={record?.maskingAlgorithmId}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')?.toString()?.toLowerCase().includes(input.toLowerCase())
              }
              optionLabelProp="label"
            >
              {sensitiveContext?.maskingAlgorithmOptions?.map((option, index) => {
                const target = sensitiveContext?.maskingAlgorithms?.find(
                  (maskingAlgorithm) => maskingAlgorithm?.id === option?.value,
                );
                return (
                  <Select.Option value={option?.value} key={index} label={option?.label}>
                    <PopoverContainer
                      key={index}
                      title={option?.label}
                      descriptionsData={[
                        {
                          label: formatMessage({
                            id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.DesensitizationMethod.1',
                            defaultMessage: '脱敏方式',
                          }) /* 脱敏方式 */,
                          value: maskRuleTypeMap?.[target?.type],
                        },
                        {
                          label: formatMessage({
                            id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.TestData.1',
                            defaultMessage: '测试数据',
                          }) /* 测试数据 */,
                          value: target?.sampleContent,
                        },
                        {
                          label: formatMessage({
                            id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Preview.1',
                            defaultMessage: '结果预览',
                          }) /* 结果预览 */,
                          value: target?.maskedContent,
                        },
                      ]}
                      children={() => <div>{option?.label}</div>}
                    />
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        );
      },
    },
    {
      title: formatMessage({
        id: 'odc.SensitiveColumn.components.ScanForm.Operation',
        defaultMessage: '操作',
      }),
      //操作
      width: 88,
      key: 'action',
      render: (_, record) => (
        <Space>
          <a
            onClick={() =>
              handleScanTableDataDelete(
                database,
                type,
                tableName,
                (record as ScanTableDataItem)?.columnName,
              )
            }
          >
            {
              formatMessage({
                id: 'odc.SensitiveColumn.components.ScanForm.Delete',
                defaultMessage: '删除',
              }) /*删除*/
            }
          </a>
        </Space>
      ),
    },
  ];
};
const PreviewHeader: React.FC<{
  searchText: string;
  scanTableData: ScanTableData[];
  originScanTableData: ScanTableData[];
  onSearch: () => void;
  resetSearch: () => void;
  handleSearchChange: (e: any) => void;
}> = ({
  searchText,
  scanTableData,
  originScanTableData,
  onSearch,
  resetSearch,
  handleSearchChange,
}) => (
  <div className={styles.scanResultPreview}>
    <div
      style={{
        height: '30px',
        lineHeight: '30px',
      }}
    >
      {
        formatMessage({
          id: 'odc.SensitiveColumn.components.ScanForm.PreviewOfScanResults',
          defaultMessage: '扫描结果预览',
        }) /*扫描结果预览*/
      }
    </div>
    {originScanTableData?.length > 0 ? (
      <Space>
        <Input.Search
          value={searchText}
          placeholder={formatMessage({
            id: 'odc.SensitiveColumn.components.ScanForm.EnterAColumnName',
            defaultMessage: '请输入列名',
          })}
          /*请输入列名*/ width={240}
          style={{
            width: '240px',
          }}
          onChange={handleSearchChange}
          onSearch={onSearch}
        />

        <Button onClick={resetSearch}>
          {
            formatMessage({
              id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Repossess',
              defaultMessage: '重置',
            }) /* 重置 */
          }
        </Button>
      </Space>
    ) : (
      scanTableData?.length > 0 && (
        <Input.Search
          value={searchText}
          placeholder={formatMessage({
            id: 'odc.SensitiveColumn.components.ScanForm.EnterAColumnName',
            defaultMessage: '请输入列名',
          })}
          /*请输入列名*/ width={240}
          style={{
            width: '240px',
          }}
          onChange={handleSearchChange}
          onSearch={onSearch}
        />
      )
    )}
  </div>
);

const CollapseHeader: React.FC<{
  database: string;
  type: ESensitiveColumnType;
  tableName: string;
  handleScanTableDataDeleteByTableName: (database: string, type: string, tableName: string) => void;
}> = ({ database, type, tableName, handleScanTableDataDeleteByTableName }) => (
  <Descriptions column={2} layout="horizontal" className={styles.descriptions}>
    <Descriptions.Item
      label={
        formatMessage({
          id: 'odc.SensitiveColumn.components.ScanForm.Database',
          defaultMessage: '数据库',
        }) //数据库
      }
    >
      <span className={styles.tooltipContent}>{database}</span>
    </Descriptions.Item>
    <Descriptions.Item
      label={
        formatMessage({
          id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.TableView.1',
          defaultMessage: '表/视图',
        }) //'表/视图'
      }
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              display: 'flex',
              lineHeight: 1,
              fontSize: 14,
              color: 'var(--icon-color-disable)',
            }}
          >
            <Icon
              component={type === ESensitiveColumnType.TABLE_COLUMN ? TableOutlined : ViewSvg}
            />
          </span>
          <Tooltip title={tableName}>
            <span className={styles.tooltipContent}>{tableName}</span>
          </Tooltip>
        </div>
        <Tooltip
          title={
            formatMessage({
              id: 'odc.SensitiveColumn.components.ScanForm.Delete',
              defaultMessage: '删除',
            }) //删除
          }
        >
          <DeleteOutlined
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleScanTableDataDeleteByTableName(database, type, tableName);
              return;
            }}
          />
        </Tooltip>
      </div>
    </Descriptions.Item>
  </Descriptions>
);

const EmptyCollapse: React.FC<{
  empty?: boolean;
  isSearch?: boolean;
  percent?: number;
  hasScan?: boolean;
  scanLoading?: boolean;
  successful?: boolean;
}> = ({ empty = false, isSearch = false, percent, hasScan, scanLoading, successful }) => {
  return (
    <Collapse defaultActiveKey={['0']} className={styles.collapse}>
      <Collapse.Panel
        key={'0'}
        header={
          <Descriptions column={2} layout="horizontal" className={styles.descriptions}>
            <Descriptions.Item
              label={
                formatMessage({
                  id: 'odc.SensitiveColumn.components.ScanForm.Database',
                  defaultMessage: '数据库',
                }) //数据库
              }
            >
              {''}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                formatMessage({
                  id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.TableView',
                  defaultMessage: '表/视图',
                }) //'表/视图'
              }
            >
              {''}
            </Descriptions.Item>
          </Descriptions>
        }
      >
        <EmptyOrSpin
          empty={empty}
          isSearch={isSearch}
          percent={percent}
          hasScan={hasScan}
          scanLoading={scanLoading}
          successful={successful}
        />
      </Collapse.Panel>
    </Collapse>
  );
};
const CollapseItemContent: React.FC<{
  activeKeys: string[];
  scanTableData: ScanTableData[];
  sensitiveContext: Partial<ISensitiveContext>;
  setActiveKeys: (keys: string[]) => void;
  handleScanTableDataDelete: (
    database: string,
    type: string,
    tableName: string,
    columnName: string,
  ) => void;
  handleScanTableDataDeleteByTableName: (database: string, type: string, tableName: string) => void;
}> = ({
  activeKeys,
  scanTableData,
  sensitiveContext,
  setActiveKeys,
  handleScanTableDataDelete,
  handleScanTableDataDeleteByTableName,
}) => {
  return scanTableData?.length === 0 ? (
    <EmptyCollapse empty={true} hasScan={true} successful={true} isSearch={true} />
  ) : (
    <Collapse
      defaultActiveKey={activeKeys}
      onChange={(keys) => {
        setActiveKeys(
          Array.isArray(keys)
            ? keys?.filter((key) => key !== '0')
            : [keys]?.filter((key) => key !== '0'),
        );
      }}
      className={classnames(styles.collapse, styles.collapses)}
    >
      {scanTableData?.map(({ header: { database, tableName, type }, dataSource }, index) => {
        return (
          <Collapse.Panel
            header={
              <CollapseHeader
                database={database}
                type={type}
                tableName={tableName}
                handleScanTableDataDeleteByTableName={handleScanTableDataDeleteByTableName}
              />
            }
            key={`${database}_${type}_${tableName}`}
          >
            <Table
              className={styles.bigTable}
              columns={getColumns(
                database,
                type,
                tableName,
                sensitiveContext,
                handleScanTableDataDelete,
              )}
              dataSource={dataSource}
              pagination={{
                showSizeChanger: false,
                pageSize: 10,
                hideOnSinglePage: dataSource?.length > 10 ? false : true,
              }}
            />
          </Collapse.Panel>
        );
      })}
    </Collapse>
  );
};
export default forwardRef(ScanForm);
