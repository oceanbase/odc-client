import { previewLogicalTableTopologies } from '@/common/network/logicalDatabase';
import CommonTable from '@/component/CommonTable';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import { formatMessage, getLocalDocs } from '@/util/intl';
import { Col, Empty, Form, Input, Popover, Row, Select, Space, Typography } from 'antd';
import { useState } from 'react';
import { getDefaultCollation } from '../helper';
import styles from './index.less';
const { Text, Link } = Typography;
import odc from '@/plugins/odc';

const { Option } = Select;

export const columns = [
  {
    title: formatMessage({
      id: 'src.page.Workspace.components.CreateTable.BaseInfo.8993186C',
      defaultMessage: '表达式',
    }),
    key: 'expression',
    dataIndex: 'expression',
  },
  {
    title: formatMessage({
      id: 'src.page.Workspace.components.CreateTable.BaseInfo.1C442EC6',
      defaultMessage: '物理表数量',
    }),
    key: 'tableCount',
    dataIndex: 'tableCount',
  },
  {
    title: formatMessage({
      id: 'src.page.Workspace.components.CreateTable.BaseInfo.4F605871',
      defaultMessage: '物理库',
    }),
    key: 'physicalDatabase',
    dataIndex: 'physicalDatabase',
    render(value) {
      return value ? (
        <Space>
          <DataBaseStatusIcon item={value} />
          {value?.name}
          <Typography.Text type="secondary">{value?.dataSource?.name || '-'}</Typography.Text>
        </Space>
      ) : (
        value?.name
      );
    },
  },
];

const LogicTableBaseInfo = ({
  form,
  session,
  tableContext,
  datasourceConfig,
  config,
  isEdit,
  setIsLogicalTableValid,
}) => {
  if (!session) return;
  const { collations, charsets } = session;

  const [previewTopologiesList, setPreviewTopologiesList] = useState([]);

  const previewTopologies = async () => {
    form.setFields([
      {
        name: 'tableName',
        errors: [],
      },
    ]);
    const tableName = form.getFieldValue('tableName');
    if (!tableName) {
      form.setFields([
        {
          name: 'tableName',
          errors: [
            formatMessage({
              id: 'src.page.Workspace.components.CreateTable.BaseInfo.295F57AB',
              defaultMessage: '请输入',
            }),
          ],
        },
      ]);
      return;
    }
    const dbId = session?.odcDatabase?.id;
    const res = await previewLogicalTableTopologies(dbId, form.getFieldValue('tableName'));
    if (Array.isArray(res)) {
      setPreviewTopologiesList(res);
      form.setFields([
        {
          name: 'tableName',
          errors: [],
        },
      ]);
    } else {
      setPreviewTopologiesList([]);
      form.setFields([
        {
          name: 'tableName',
          errors: [
            res ||
              formatMessage({
                id: 'src.page.Workspace.components.CreateTable.BaseInfo.BB53E42B',
                defaultMessage: '语法错误',
              }),
          ],
        },
      ]);
    }
  };

  const previewTopologiesBtn = (
    <Link onClick={previewTopologies}>
      {formatMessage({
        id: 'src.page.Workspace.components.CreateTable.BaseInfo.636631AC',
        defaultMessage: '预览拓扑',
      })}
    </Link>
  );

  const helpDocUrl = odc.appConfig.docs.url || getLocalDocs('200.web-odc-create-a-table.html');

  const inputTooltipContent = () => {
    return (
      <Space direction="vertical" onClick={(e) => e.stopPropagation()}>
        <Text strong>
          {formatMessage({
            id: 'src.page.Workspace.components.CreateTable.BaseInfo.F3910740',
            defaultMessage: '常见示例',
          })}
        </Text>
        <Text>db.test_[00-09]</Text>
        <Text type="secondary">
          {formatMessage({
            id: 'src.page.Workspace.components.CreateTable.BaseInfo.609D2F60',
            defaultMessage: '在 db 单库下创建 10 张表',
          })}
        </Text>
        <Text>db_[00-31].test</Text>
        <Text type="secondary">
          {formatMessage({
            id: 'src.page.Workspace.components.CreateTable.BaseInfo.270970B2',
            defaultMessage: '在 db_00 - db_31 一共32 个库上均创建 test 表',
          })}
        </Text>
        <Text>db_[00-31].test_[00-31]</Text>
        <Text type="secondary">
          {formatMessage({
            id: 'src.page.Workspace.components.CreateTable.BaseInfo.61D2312D',
            defaultMessage: '在 32 个库下共创建 32 张表，注意表的数量需要能被库数量整除：',
          })}
        </Text>
        <Text type="secondary">db_00.test_00, db_01.test_01 ...</Text>
        <Text>db_[00-31].test_[[00-31]]</Text>
        <Text type="secondary">
          {formatMessage({
            id: 'src.page.Workspace.components.CreateTable.BaseInfo.A165C668',
            defaultMessage: '在指定的 32 个库下各创建 32 张表，共 1024 张表：',
          })}
        </Text>
        <Text type="secondary">db_00.test_00, db_00.test_01 ... db_31.test_30, db_31.test_31</Text>
        <Text>db.test_[1-10:2]</Text>
        <Text type="secondary">
          {formatMessage({
            id: 'src.page.Workspace.components.CreateTable.BaseInfo.19F98E57',
            defaultMessage: '在 db 单库下创建 5 张表，起始值为 1，最大值为 10，步长为 2：',
          })}
        </Text>
        <Text type="secondary">db.test_1, db.test_3, db.test_5, db.test_7, db.test_9</Text>
        <Text>db.test_1,db.test_2,db.test_4</Text>
        <Text type="secondary">
          {formatMessage({
            id: 'src.page.Workspace.components.CreateTable.BaseInfo.2D3445A1',
            defaultMessage: '在 db 单库下创建 3 张表：db.test_1,db.test_2,db.test_4',
          })}
        </Text>
        <Link href={helpDocUrl} target={'_blank'}>
          {formatMessage({
            id: 'src.page.Workspace.components.CreateTable.BaseInfo.C3013389',
            defaultMessage: '查看更多',
          })}
        </Link>
      </Space>
    );
  };
  return (
    <Form
      className={styles.form}
      form={form}
      layout="vertical"
      initialValues={null}
      onValuesChange={async (cValue, values) => {
        await previewTopologies();
        if ('character' in cValue) {
          form.setFieldsValue({
            collation: getDefaultCollation(cValue.character, collations),
          });
        }
        if ('tableName' in cValue) {
          const list = await form?.getFieldsError();
          if (list?.find((i) => i?.errors?.length)) {
            setIsLogicalTableValid(false);
          } else {
            setIsLogicalTableValid(true);
          }
        }
        tableContext.setInfo?.(form.getFieldsValue());
      }}
    >
      <Row gutter={12}>
        <Col span={24}>
          <Popover content={inputTooltipContent} placement="left" color="white">
            <Form.Item
              name="tableName"
              label={formatMessage({
                id: 'src.page.Workspace.components.CreateTable.BaseInfo.7641485F',
                defaultMessage: '逻辑表表达式',
              })}
              extra={previewTopologiesBtn}
              tooltip={formatMessage({
                id: 'src.page.Workspace.components.CreateTable.BaseInfo.B17B453C',
                defaultMessage: '设置物理表在实际数据库上的分布规则',
              })}
            >
              <Input
                autoFocus
                placeholder={formatMessage({
                  id: 'src.page.Workspace.components.CreateTable.BaseInfo.4B6F9099',
                  defaultMessage: '请输入',
                })}
              />
            </Form.Item>
          </Popover>
        </Col>
        <Col span={12}>
          <Form.Item
            name="character"
            label={formatMessage({
              id: 'workspace.window.createTable.baseInfo.character',
              defaultMessage: '默认字符集',
            })}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select
              disabled={isEdit}
              showSearch
              onSelect={(v) => {
                form.setFieldsValue({
                  collation: getDefaultCollation(v.toString(), collations),
                });
              }}
            >
              {charsets?.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue }) => {
              return (
                <Form.Item
                  name="collation"
                  label={formatMessage({
                    id: 'workspace.window.createTable.baseInfo.collation',
                    defaultMessage: '默认排序规则',
                  })}
                  rules={[
                    {
                      required: true,
                      message: formatMessage({
                        id: 'workspace.window.createTable.baseInfo.tableName.validation',
                        defaultMessage: '请填写表名称',
                      }),
                    },
                  ]}
                  shouldUpdate
                >
                  <Select disabled={isEdit} showSearch>
                    {collations
                      ?.filter((c) => {
                        const character = getFieldValue('character') || 'utf8mb4';
                        return c.indexOf(character) > -1;
                      })
                      .map((c) => (
                        <Option key={c} value={c}>
                          {c}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              );
            }}
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Form.Item
          name="comment"
          label={formatMessage({
            id: 'workspace.window.createTable.baseInfo.comment',
            defaultMessage: '描述',
          })}
          style={{ width: '100%' }}
          requiredMark={'optional'}
        >
          <Input.TextArea
            style={{ width: '100%' }}
            autoSize={{ maxRows: 3, minRows: 3 }}
            placeholder={formatMessage({
              id: 'workspace.window.createTable.baseInfo.comment.placeholder',
              defaultMessage: '请填写描述',
            })}
          />
        </Form.Item>
      </Row>
      <Row>
        <Form.Item
          name="comment"
          label={formatMessage({
            id: 'src.page.Workspace.components.CreateTable.BaseInfo.AC6FB5A2',
            defaultMessage: '逻辑表拓扑',
          })}
          tooltip={formatMessage({
            id: 'src.page.Workspace.components.CreateTable.BaseInfo.12225948',
            defaultMessage: '物理表在实际数据库上分布',
          })}
        >
          <CommonTable
            key="CompareTable"
            titleContent={null}
            showToolbar={false}
            operationContent={null}
            tableProps={{
              rowKey: 'structureComparisonId',
              columns,
              dataSource: previewTopologiesList,
              pagination: {
                pageSize: 10,
              },
              locale: {
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div>
                        {formatMessage({
                          id: 'src.page.Workspace.components.CreateTable.BaseInfo.1F8270D8',
                          defaultMessage: '暂无数据, 请先',
                        })}
                        {previewTopologiesBtn}
                      </div>
                    }
                  ></Empty>
                ),
              },
              scroll: {
                y: 200,
              },
            }}
            onLoad={async () => {}}
          />
        </Form.Item>
      </Row>
    </Form>
  );
};
export default LogicTableBaseInfo;
