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
  Input,
  Popover,
  Progress,
  Select,
  Space,
  Table,
  Tooltip,
} from 'antd';
import { ScanTableDataItem } from '../../../interface';
import styles from './index.less';
import ScanRule from './SacnRule';
import classnames from 'classnames';
import { ESensitiveColumnType } from '@/d.ts/sensitiveColumn';
import TableOutlined from '@/svgr/menuTable.svg';
import ViewSvg from '@/svgr/menuView.svg';
import { MaskRyleTypeMap } from '@/d.ts';
const ScanForm = ({
  formRef,
  _formRef,
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
  sensitiveContext,
  setManageSensitiveRuleDrawerOpen,
  handleScanTableDataChange,
  handleScanTableDataDelete,
  handleScanTableDataDeleteByTableName,
}) => {
  const { maskingAlgorithms } = sensitiveContext;
  const EmptyOrSpin = ({ scanLoading, hasScan, percent, successful }) => {
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
        <Form form={_formRef} layout="vertical">
          <Collapse
            defaultActiveKey={[0]}
            className={
              scanTableData?.length === 0
                ? classnames(styles.collapse)
                : classnames(styles.collapse, styles.collapses)
            }
          >
            {scanTableData?.length === 0 ? (
              <Collapse.Panel
                key={0}
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
                  {...{
                    scanLoading,
                    percent,
                    hasScan,
                    successful,
                  }}
                />
              </Collapse.Panel>
            ) : (
              <>
                {scanTableData?.map(
                  ({ header: { database, tableName, type }, dataSource }, index) => {
                    return (
                      <Collapse.Panel
                        header={
                          <Descriptions
                            column={2}
                            layout="horizontal"
                            className={styles.descriptions}
                          >
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
                                    }}
                                  />
                                </Tooltip>
                              </div>
                            </Descriptions.Item>
                          </Descriptions>
                        }
                        key={index}
                      >
                        <Table
                          className={styles.bigTable}
                          columns={[
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
                                id:
                                  'odc.SensitiveColumn.components.ScanForm.DesensitizationAlgorithm',
                              }),
                              //脱敏算法
                              width: 180,
                              dataIndex: 'maskingAlgorithmId',
                              key: 'maskingAlgorithmId',
                              render: (text, record, _index) => {
                                return (
                                  <Select
                                    key={index}
                                    style={{
                                      width: '144px',
                                    }}
                                    defaultValue={dataSource[_index].maskingAlgorithmId}
                                    onChange={(v) =>
                                      handleScanTableDataChange(
                                        `${database}_${tableName}`,
                                        (record as ScanTableDataItem)?.columnName,
                                        v,
                                      )
                                    }
                                    showSearch
                                    filterOption={(input, option) =>
                                      (option?.label ?? '')
                                        ?.toString()
                                        ?.toLowerCase()
                                        .includes(input.toLowerCase())
                                    }
                                  >
                                    {sensitiveContext?.maskingAlgorithmOptions?.map(
                                      (option, index) => {
                                        const target = maskingAlgorithms?.find(
                                          (maskingAlgorithm) =>
                                            maskingAlgorithm?.id === option?.value,
                                        );
                                        return (
                                          <Select.Option value={option?.value} key={index}>
                                            <Popover
                                              placement="left"
                                              title={option?.label}
                                              content={
                                                <Descriptions
                                                  column={1}
                                                  style={{
                                                    width: '250px',
                                                  }}
                                                >
                                                  <Descriptions.Item
                                                    label={
                                                      formatMessage({
                                                        id:
                                                          'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.DesensitizationMethod.1',
                                                      }) /* 脱敏方式 */
                                                    }
                                                  >
                                                    {MaskRyleTypeMap?.[target?.type]}
                                                  </Descriptions.Item>
                                                  <Descriptions.Item
                                                    label={
                                                      formatMessage({
                                                        id:
                                                          'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.TestData.1',
                                                      }) /* 测试数据 */
                                                    }
                                                  >
                                                    {target?.sampleContent}
                                                  </Descriptions.Item>
                                                  <Descriptions.Item
                                                    label={
                                                      formatMessage({
                                                        id:
                                                          'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Preview.1',
                                                      }) /* 结果预览 */
                                                    }
                                                  >
                                                    {target?.maskedContent}
                                                  </Descriptions.Item>
                                                </Descriptions>
                                              }
                                            >
                                              {option?.label}
                                            </Popover>
                                          </Select.Option>
                                        );
                                      },
                                    )}
                                  </Select>
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
                          ]}
                          dataSource={dataSource}
                          pagination={{
                            showSizeChanger: false,
                          }}
                        />
                      </Collapse.Panel>
                    );
                  },
                )}
              </>
            )}
          </Collapse>
        </Form>
      </div>
    </>
  );
};
export default ScanForm;
