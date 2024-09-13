import { formatMessage } from '@/util/intl';
import { Col, Form, Input, Row, Select, Typography, Empty, Popover, Space } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import React, { useContext, useEffect, useImperativeHandle, useState } from 'react';
import { getDefaultCollation } from '../helper';
import styles from './index.less';
import CommonTable from '@/component/CommonTable';
import { previewLogicalTableTopologies } from '@/common/network/logicalDatabase';
const { Text, Link } = Typography;
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';

const { Option } = Select;

export const columns = [
  {
    title: '表达式',
    key: 'expression',
    dataIndex: 'expression',
  },
  {
    title: '物理表数量',
    key: 'tableCount',
    dataIndex: 'tableCount',
  },
  {
    title: '物理库',
    key: 'physicalDatabase',
    dataIndex: 'physicalDatabase',
    render(value) {
      return value ? (
        <Space>
          <DataBaseStatusIcon item={value} />
          {value?.name}
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
          errors: ['请输入'],
        },
      ]);
      return;
    }
    const dbId = session?.odcDatabase?.id;
    const res = await previewLogicalTableTopologies(dbId, form.getFieldValue('tableName'));
    if (Array.isArray(res)) {
      setPreviewTopologiesList(res);
    } else {
      setPreviewTopologiesList([]);
      form.setFields([
        {
          name: 'tableName',
          errors: [res || '语法错误'],
        },
      ]);
    }
  };

  const previewTopologiesBtn = <Link onClick={previewTopologies}>预览拓扑</Link>;
  const inputTooltipContent = () => {
    return (
      <Space direction="vertical" onClick={(e) => e.stopPropagation()}>
        <Text strong>常见示例</Text>
        <Text>test_[00-09]</Text>
        <Text type="secondary">共创建 10 张表</Text>
        <Text>db_[00-31].test</Text>
        <Text type="secondary">在指定的 32 个库上均创建 test 表</Text>
        <Text>db_[00-31].test_[00-31]</Text>
        <Text type="secondary">在指定的 32 个库下共创建 32 张表</Text>
        <Text>db_[00-31].test_[[00-31]]</Text>
        <Text type="secondary">在指定的 32 个库下各创建 32 张表</Text>
        <Link>查看更多</Link>
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
              label="逻辑表表达式"
              extra={previewTopologiesBtn}
              tooltip="设置物理表在实际数据库上的分布规则"
            >
              <Input autoFocus placeholder="请输入" />
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
        <Form.Item name="comment" label="逻辑表拓扑" tooltip="物理表在实际数据库上分布">
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
                    description={<div>暂无数据, 请先 {previewTopologiesBtn}</div>}
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
