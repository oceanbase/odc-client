import { CommonTableMode } from '@/component/CommonTable/interface';
import SecureTable from '@/page/Secure/components/SecureTable';
import { CommonTableBodyMode } from '@/page/Secure/components/SecureTable/interface';
import { CheckCircleTwoTone, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
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
  databases,
  setFormDrawerDatabases,
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
            <div style={{ marginLeft: '16px' }}>正在扫描中。扫描时间可能较长请耐心等待…</div>
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
        <ScanRule {...{ formRef, databases, setFormDrawerDatabases, resetScanTableData, reset }} />
        <Space>
          <Button
            onClick={handleStartScan}
            disabled={scanLoading}
            icon={scanLoading && <SyncOutlined spin={true} />}
          >
            {scanLoading ? '正在扫描' : '开始扫描'}
          </Button>
          {successful && (
            <Space>
              <CheckCircleTwoTone twoToneColor="#52c41a" />
              <div>扫描完成</div>
            </Space>
          )}
        </Space>
      </Form>
      <div className={styles.scanResultPreview}>
        <div>扫描结果预览</div>
        <Input.Search
          value={searchText}
          placeholder="请输入列名"
          width={240}
          style={{ width: '240px' }}
          onChange={handleSearchChange}
          onSearch={onSearch}
        />
      </div>
      <Form form={_formRef} layout="vertical">
        <Collapse defaultActiveKey={[0]} className={styles.collapse}>
          {scanTableData?.length === 0 ? (
            <Collapse.Panel
              key={0}
              header={
                <Descriptions column={2} layout="horizontal" className={styles.descriptions}>
                  <Descriptions.Item label={'数据库'}>{''}</Descriptions.Item>
                  <Descriptions.Item label={'表'}>{''}</Descriptions.Item>
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
                        <Descriptions.Item label={'数据库'}>
                          <span className={styles.tooltipContent}>{database}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label={'表'}>
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
                            <Tooltip title={'删除'}>
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
                    <SecureTable
                      mode={CommonTableMode.SMALL}
                      body={CommonTableBodyMode.BIG}
                      titleContent={null}
                      showToolbar={false}
                      showPagination={false}
                      filterContent={{}}
                      operationContent={null}
                      onLoad={null}
                      tableProps={{
                        columns: [
                          {
                            title: '列',
                            width: 146,
                            dataIndex: 'columnName',
                            key: 'columnName',
                          },
                          {
                            title: '识别规则',
                            width: 126,
                            dataIndex: 'sensitiveRuleId',
                            key: 'sensitiveRuleId',
                            render: (text) => sensitiveContext?.sensitiveRuleIdMap?.[text],
                          },
                          {
                            title: '脱敏算法',
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
                                options={sensitiveContext.maskingAlgorithmOptions}
                              />
                            ),
                          },
                          {
                            title: '操作',
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
                                  删除
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
