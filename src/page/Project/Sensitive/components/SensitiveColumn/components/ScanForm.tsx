import CommonTable from '@/component/CommonTable';
import { CommonTableMode } from '@/component/CommonTable/interface';
import { formatMessage } from '@/util/intl';
import { CheckCircleFilled, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import {
  Button,
  Collapse,
  Descriptions,
  Empty,
  Form,
  Input,
  Progress,
  Select,
  Space,
  Tooltip,
} from 'antd';
import { ScanTableDataItem } from '../../../interface';
import styles from './index.less';
import ScanRule from './SacnRule';

const ScanForm = ({
  formRef,
  _formRef,
  resetScanTableData,
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
  handleScanTableDataChange,
  handleScanTableDataDelete,
  handleScanTableDataDeleteByTableName,
}) => {
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
            <div style={{ marginLeft: '16px' }}>
              {
                formatMessage({
                  id: 'odc.SensitiveColumn.components.ScanForm.ScanningTheScanningTimeMay',
                }) /*正在扫描中。扫描时间可能较长请耐心等待…*/
              }
            </div>
            <Progress percent={percent} style={{ maxWidth: '628px', margin: '0px 16px' }} />
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
        <ScanRule {...{ formRef, resetScanTableData, reset }} />
        <Space>
          <Button
            onClick={handleStartScan}
            disabled={scanLoading}
            icon={scanLoading && <SyncOutlined spin={true} />}
          >
            {
              scanLoading
                ? formatMessage({ id: 'odc.SensitiveColumn.components.ScanForm.Scanning' }) //正在扫描
                : formatMessage({ id: 'odc.SensitiveColumn.components.ScanForm.StartScanning' }) //开始扫描
            }
          </Button>
          {successful && (
            <Space>
              <CheckCircleFilled style={{ color: '#52c41a' }} />
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
        {scanTableData?.length > 0 && (
          <Input.Search
            value={searchText}
            placeholder={formatMessage({
              id: 'odc.SensitiveColumn.components.ScanForm.EnterAColumnName',
            })} /*请输入列名*/
            width={240}
            style={{ width: '240px' }}
            onChange={handleSearchChange}
            onSearch={onSearch}
          />
        )}
      </div>
      <Form form={_formRef} layout="vertical">
        <Collapse defaultActiveKey={[0]} className={styles.collapse}>
          {scanTableData?.length === 0 ? (
            <Collapse.Panel
              key={0}
              header={
                <Descriptions column={2} layout="horizontal" className={styles.descriptions}>
                  <Descriptions.Item
                    label={
                      formatMessage({ id: 'odc.SensitiveColumn.components.ScanForm.Database' }) //数据库
                    }
                  >
                    {''}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      formatMessage({ id: 'odc.SensitiveColumn.components.ScanForm.Table' }) //表
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
              {scanTableData?.map(({ header: { database, tableName }, dataSource }, index) => {
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
                            formatMessage({ id: 'odc.SensitiveColumn.components.ScanForm.Table' }) //表
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
                            <Tooltip title={tableName}>
                              <span className={styles.tooltipContent}>{tableName}</span>
                            </Tooltip>
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
                    <CommonTable
                      mode={CommonTableMode.SMALL}
                      titleContent={null}
                      showToolbar={false}
                      filterContent={{}}
                      operationContent={null}
                      onLoad={null}
                      tableProps={{
                        columns: [
                          {
                            title: formatMessage({
                              id: 'odc.SensitiveColumn.components.ScanForm.Column',
                            }), //列
                            width: 146,
                            dataIndex: 'columnName',
                            key: 'columnName',
                          },
                          {
                            title: formatMessage({
                              id: 'odc.SensitiveColumn.components.ScanForm.IdentificationRules',
                            }), //识别规则
                            width: 126,
                            dataIndex: 'sensitiveRuleId',
                            key: 'sensitiveRuleId',
                            render: (text) => sensitiveContext?.sensitiveRuleIdMap?.[text],
                          },
                          {
                            title: formatMessage({
                              id:
                                'odc.SensitiveColumn.components.ScanForm.DesensitizationAlgorithm',
                            }), //脱敏算法
                            width: 180,
                            dataIndex: 'maskingAlgorithmId',
                            key: 'maskingAlgorithmId',
                            render: (text, record, _index) => (
                              <Select
                                key={index}
                                style={{ width: '144px' }}
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
                                options={sensitiveContext.maskingAlgorithmOptions}
                              />
                            ),
                          },
                          {
                            title: formatMessage({
                              id: 'odc.SensitiveColumn.components.ScanForm.Operation',
                            }), //操作
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
                        ],

                        dataSource,
                        // rowKey: 'id',
                        pagination: false,
                        scroll: {
                          x: 564,
                        },
                      }}
                    />
                  </Collapse.Panel>
                );
              })}
            </>
          )}
        </Collapse>
      </Form>
    </>
  );
};

export default ScanForm;
