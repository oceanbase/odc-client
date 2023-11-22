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
import { ScanTableData, ScanTableDataItem } from '../../../interface';
import styles from './index.less';
import ScanRule from './SacnRule';
import classnames from 'classnames';
import { ESensitiveColumnType } from '@/d.ts/sensitiveColumn';
import TableOutlined from '@/svgr/menuTable.svg';
import ViewSvg from '@/svgr/menuView.svg';
import { MaskRyleTypeMap } from '@/d.ts';
import { PopoverContainer } from '..';
import { useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import SensitiveContext from '../../../SensitiveContext';
const EmptyOrSpin: React.FC<{
  hasScan: boolean;
  percent: number;
  successful: boolean;
  scanLoading: boolean;
}> = ({ scanLoading, hasScan, percent, successful }) => {
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
      ) : hasScan && successful ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  );
};

const ScanForm: React.FC<{
  formRef: FormInstance<any>;
  _formRef: FormInstance<any>;

  hasScan: boolean;
  percent: number;
  successful: boolean;
  activeKeys: string | string[];
  searchText: string;
  scanLoading: boolean;
  scanTableData: ScanTableData[];
  originScanTableData: ScanTableData[];

  reset: () => void;
  onSearch: () => void;
  resetSearch: () => void;
  setActiveKeys: (keys: string[]) => void;
  handleStartScan: () => Promise<void>;
  resetScanTableData: () => void;
  handleSearchChange: (e: any) => void;
  handleScanTableDataDelete: (database: string, tableName: string, columnName: string) => void;
  setManageSensitiveRuleDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleScanTableDataDeleteByTableName: (database: string, tableName: string) => void;
}> = ({
  formRef,
  _formRef,
  activeKeys,
  setActiveKeys,
  resetSearch,
  originScanTableData,
  reset,
  hasScan,
  handleStartScan,
  scanLoading,
  successful,
  searchText,
  handleSearchChange,
  onSearch,
  scanTableData,
  percent,
  setManageSensitiveRuleDrawerOpen,
  handleScanTableDataDelete,
  handleScanTableDataDeleteByTableName,
}) => {
  const sensitiveContext = useContext(SensitiveContext);
  const { maskingAlgorithms } = sensitiveContext;
  const getColumns = (database: string, type: ESensitiveColumnType, tableName: string) => {
    return [
      {
        title: formatMessage({
          id: 'odc.SensitiveColumn.components.ScanForm.Column',
        }),
        //列
        width: 146,
        dataIndex: 'columnName',
        key: 'columnName',
      },
      {
        title: formatMessage({
          id: 'odc.SensitiveColumn.components.ScanForm.IdentificationRules',
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
        }),
        //脱敏算法
        width: 180,
        dataIndex: 'maskingAlgorithmId',
        key: 'maskingAlgorithmId',
        render: (text, record, _index) => {
          return (
            <Form.Item name={['scanTableData', database, type, tableName, record.columnName]}>
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
                  const target = maskingAlgorithms?.find(
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
                              id:
                                'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.DesensitizationMethod.1',
                            }) /* 脱敏方式 */,
                            value: MaskRyleTypeMap?.[target?.type],
                          },
                          {
                            label: formatMessage({
                              id:
                                'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.TestData.1',
                            }) /* 测试数据 */,
                            value: target?.sampleContent,
                          },
                          {
                            label: formatMessage({
                              id:
                                'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Preview.1',
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
                  tableName,
                  (record as ScanTableDataItem)?.columnName,
                )
              }
            >
              {
                formatMessage({
                  id: 'odc.SensitiveColumn.components.ScanForm.Delete',
                }) /*删除*/
              }
            </a>
          </Space>
        ),
      },
    ];
  };
  const WrapCollapse = useCallback(() => {
    return (
      <Collapse
        defaultActiveKey={activeKeys}
        onChange={(keys) => {
          setActiveKeys(Array.isArray(keys) ? keys : [keys]);
        }}
        className={
          scanTableData?.length === 0
            ? classnames(styles.collapse)
            : classnames(styles.collapse, styles.collapses)
        }
      >
        {scanTableData?.length === 0 ? (
          <Collapse.Panel
            key={'0'}
            header={
              <Descriptions column={2} layout="horizontal" className={styles.descriptions}>
                <Descriptions.Item
                  label={
                    formatMessage({
                      id: 'odc.SensitiveColumn.components.ScanForm.Database',
                    }) //数据库
                  }
                >
                  {''}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    formatMessage({
                      id:
                        'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.TableView',
                    }) //'表/视图'
                  }
                >
                  {''}
                </Descriptions.Item>
              </Descriptions>
            }
          >
            <EmptyOrSpin
              percent={percent}
              hasScan={hasScan}
              scanLoading={scanLoading}
              successful={successful}
            />
          </Collapse.Panel>
        ) : (
          <>
            {scanTableData?.map(({ header: { database, tableName, type }, dataSource }, index) => {
              return (
                <Collapse.Panel
                  header={
                    <Descriptions column={2} layout="horizontal" className={styles.descriptions}>
                      <Descriptions.Item
                        label={
                          formatMessage({
                            id: 'odc.SensitiveColumn.components.ScanForm.Database',
                          }) //数据库
                        }
                      >
                        <span className={styles.tooltipContent}>{database}</span>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          formatMessage({
                            id:
                              'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.TableView.1',
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
                                component={
                                  type === ESensitiveColumnType.TABLE_COLUMN
                                    ? TableOutlined
                                    : ViewSvg
                                }
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
                              }) //删除
                            }
                          >
                            <DeleteOutlined
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleScanTableDataDeleteByTableName(database, tableName);
                                return;
                              }}
                            />
                          </Tooltip>
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  }
                  key={`${database}_${type}_${tableName}`}
                >
                  <Table
                    className={styles.bigTable}
                    columns={getColumns(database, type, tableName)}
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
          </>
        )}
      </Collapse>
    );
  }, [scanTableData, activeKeys]);
  return (
    <>
      <Form form={formRef} layout="vertical" requiredMark="optional">
        <ScanRule
          setManageSensitiveRuleDrawerOpen={setManageSensitiveRuleDrawerOpen}
          formRef={formRef}
          reset={reset}
        />
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
                  }) //正在扫描
                : formatMessage({
                    id: 'odc.SensitiveColumn.components.ScanForm.StartScanning',
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
                  }) /*扫描完成*/
                }
              </div>
            </Space>
          )}
        </Space>
      </Form>
      <div className={styles.scanResultPreview}>
        <div>
          {
            formatMessage({
              id: 'odc.SensitiveColumn.components.ScanForm.PreviewOfScanResults',
            }) /*扫描结果预览*/
          }
        </div>
        {originScanTableData?.length > 0 ? (
          <Space>
            <Input.Search
              value={searchText}
              placeholder={formatMessage({
                id: 'odc.SensitiveColumn.components.ScanForm.EnterAColumnName',
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
                  id:
                    'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Repossess',
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
          <WrapCollapse />
        </Form>
      </div>
    </>
  );
};
export default ScanForm;
