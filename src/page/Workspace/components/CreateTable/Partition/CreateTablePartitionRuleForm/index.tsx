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
import { cloneDeep, debounce } from 'lodash';
import React, { Component } from 'react';
// compatible
import PartitionRange from '@/component/PartitionRange';
import TableIndexSelector from '@/component/TableIndexSelector';
import { IDataType, IPartitionType, ITablePartition } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import { Button, Form, FormInstance, Input, InputNumber, Select } from 'antd';
import { TableColumn, TablePartition } from '../../interface';
import { getPartitionValueLabel, partitionValuePlaceholder } from './config';
import styles from './index.less';
import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';

interface IProps {
  fixedFooter?: boolean;
  dataTypes: IDataType[];
  partitionType?: IPartitionType;
  disableCheckMaxValue?: boolean;
  disablePartition?: boolean;
  columns: TableColumn[];
  session: SessionStore;
  /**
   * 是否为新增modal的模式，新增的时候，不需要显示列等信息，只需要展示分区定义信息。
   */
  addMode?: boolean;
  selectColumns?: { columnName: string }[];
  selectColumnName?: string;
  partNumber?: number;
  expression?: string;
  onSave: (partitions: Partial<TablePartition>) => void;
}

export interface IFormPartition extends ITablePartition {
  columnName: string;
  columns: Array<{
    columnName: string;
  }>;

  partitions: Array<{
    name: string;
    error?: any;
    value: any;
  }>;
}

const { Option } = Select;
export const partitionNameMap = {
  [IPartitionType.HASH]: 'Hash',
  [IPartitionType.KEY]: 'Key',
  [IPartitionType.RANGE]: 'Range',
  [IPartitionType.RANGE_COLUMNS]: 'Range Columns',
  [IPartitionType.LIST]: 'List',
  [IPartitionType.LIST_COLUMNS]: 'List Columns',
  [IPartitionType.NONE]: 'None',
};

class CreateTablePartitionRuleForm extends Component<
  IProps,
  {
    partitionType: IPartitionType;
  }
> {
  public readonly state = {
    partitionType: this.props.partitionType,
  };

  private form = React.createRef<FormInstance>();

  private getRealParitionName(name: string) {
    if (!name) {
      return '';
    }
    const { session } = this.props;
    const config = getDataSourceModeConfigByConnectionMode(session.connection?.dialectType)?.schema
      ?.table;
    return !config.paritionNameCaseSensitivity ? name.toLowerCase() : name;
  }

  public handleSubmit = debounce(async () => {
    const { onSave } = this.props;
    const values = await this.form.current.getFieldsValue();
    const partition = cloneDeep(values);
    const { columns, partType } = partition;
    const partitionNames = {};
    // 空字段打标错误码
    partition.partitions?.map((item) => {
      // 清空错误信息
      item.error = {};
      const itemName = this.getRealParitionName(item.name);
      // 分区名不能重复
      if (itemName && partitionNames[itemName]) {
        const sameNamePartitions = partition.partitions.filter(
          (i) => this.getRealParitionName(i.name) === itemName,
        );

        sameNamePartitions.forEach((item) => {
          item.error.name = formatMessage({
            id: 'odc.components.CreateTablePartitionRuleForm.ThePartitionNameMustBeUnique',
          });
        });
      }
      partitionNames[itemName] = true;
    });

    // 更新错误信息
    this.form.current.setFieldsValue({
      partitions: partition.partitions || [],
    });
    onSave(values);
  }, 500);

  public handleChangeType = (partitionType: IPartitionType) => {
    const partitions: any[] = [{}];
    this.form.current.setFieldsValue({
      partitions: partitions.map((item) => {
        item.name = '';
        item.value = partitionType === IPartitionType.LIST_COLUMNS ? [{}] : '';
        item.error = {};
        return item;
      }),
    });

    this.setState({ partitionType });
  };

  private renderPartitions() {
    const { columns, dataTypes, addMode } = this.props;
    const { partitionType } = this.state;
    const singleColumnFormItem = addMode ? null : (
      <Form.Item
        label={formatMessage({
          id: 'odc.TableConstraint.Primary.columns.Column',
        })}
        name={'columnName'}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'workspace.window.createTable.column.name.validation',
            }),
          },
        ]}
      >
        <Select disabled={addMode} allowClear style={{ width: 240 }}>
          {(columns || []).map((c) => (
            <Option key={c.name} value={c.name}>
              {c.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
    );

    const exprItem = (
      <Form.Item
        label={formatMessage({
          id: 'workspace.window.createTable.partition.expression',
        })}
        name={'expression'}
      >
        <Input disabled={addMode} style={{ width: 240 }} />
      </Form.Item>
    );

    const multiColumnsItem = (
      <Form.Item
        label={formatMessage({
          id: 'odc.TableConstraint.Primary.columns.Column',
        })}
        name={'columns'}
      >
        <TableIndexSelector
          disabled={addMode}
          dataTypes={dataTypes}
          columns={columns.map((c) => {
            return { ...c, columnName: c.name, dataType: c.type };
          })}
          // onChange={this.handleChangeColumns}
        />
      </Form.Item>
    );

    const partitionsItem = (
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          return (
            <Form.Item
              label={
                formatMessage({
                  id: 'odc.Partition.CreateTablePartitionRuleForm.PartitionSettings',
                }) //分区设置
              }
              name={'partitions'}
              shouldUpdate
            >
              <PartitionRange
                partitionType={partitionType}
                selectColums={getFieldValue('columns')}
                partitionValuePlaceholder={partitionValuePlaceholder[partitionType] || ''}
                partitionValueLabel={getPartitionValueLabel(partitionType)}
              />
            </Form.Item>
          );
        }}
      </Form.Item>
    );

    const partitionCountItem = (
      <Form.Item
        label={formatMessage({
          id: 'workspace.window.createTable.partition.partNumber',
        })}
        name="partNumber"
      >
        <InputNumber precision={0} disabled={addMode} min={1} />
      </Form.Item>
    );

    switch (partitionType) {
      case IPartitionType.RANGE:
      case IPartitionType.LIST: {
        return [singleColumnFormItem, exprItem, partitionsItem];
      }
      case IPartitionType.RANGE_COLUMNS:
      case IPartitionType.LIST_COLUMNS: {
        return [multiColumnsItem, partitionsItem];
      }
      case IPartitionType.KEY: {
        return [multiColumnsItem, partitionCountItem];
      }
      case IPartitionType.HASH: {
        return [singleColumnFormItem, exprItem, partitionCountItem];
      }
      case IPartitionType.NONE:
      default: {
        return null;
      }
    }
  }

  public render() {
    const {
      columns,
      disablePartition,
      fixedFooter,
      selectColumns,
      addMode,
      selectColumnName,
      partNumber,
      expression,
      session,
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };

    const { partitionType } = this.state;
    const config =
      getDataSourceModeConfigByConnectionMode(session.connection?.dialectType)?.schema?.table || {};

    const initialPartitions = [{ name: '', value: '' }];

    return (
      <>
        <Form
          {...formItemLayout}
          className={styles.form}
          ref={this.form}
          requiredMark={false}
          layout="vertical"
          style={{
            height: fixedFooter ? 'calc(100vh - 157px)' : 'initial',
          }}
          onValuesChange={(_, v) => {
            this.handleSubmit();
          }}
          initialValues={{
            partType: partitionType || IPartitionType.NONE,
            columnName: selectColumnName ?? (columns?.length ? columns[0].name : ''),
            columns: selectColumns ?? [],
            partitions: initialPartitions,
            partNumber: partNumber ?? 1,
            expression: expression,
          }}
        >
          <div
            style={{
              height: fixedFooter ? 'calc(100vh - 213px)' : 'initial',
              overflow: 'auto',
              marginBottom: '24px',
            }}
          >
            <Form.Item
              label={formatMessage({
                id: 'workspace.window.createTable.partition.type',
              })}
              name={'partType'}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'workspace.window.createTable.partition.type.validation',
                  }),
                },
              ]}
            >
              <Select
                // 暂时禁掉非分区表，OB 2.3.1 不支持
                disabled={disablePartition || addMode}
                onChange={this.handleChangeType}
                style={{ width: 240 }}
                getPopupContainer={(e) => {
                  return e?.closest('.J_createTable') || document.body;
                }}
              >
                <Option value={IPartitionType.NONE}>{partitionNameMap[IPartitionType.NONE]}</Option>
                <Option value={IPartitionType.RANGE}>
                  {partitionNameMap[IPartitionType.RANGE]}
                </Option>
                {!config.disableRangeColumnsPartition && (
                  <Option value={IPartitionType.RANGE_COLUMNS}>
                    {partitionNameMap[IPartitionType.RANGE_COLUMNS]}
                  </Option>
                )}

                <Option value={IPartitionType.LIST}>{partitionNameMap[IPartitionType.LIST]}</Option>
                {!config.disableListColumnsPartition && (
                  <Option value={IPartitionType.LIST_COLUMNS}>
                    {partitionNameMap[IPartitionType.LIST_COLUMNS]}
                  </Option>
                )}

                <Option value={IPartitionType.HASH}>{partitionNameMap[IPartitionType.HASH]}</Option>
                {!config.disableKeyPartition && (
                  <Option value={IPartitionType.KEY}>{partitionNameMap[IPartitionType.KEY]}</Option>
                )}
              </Select>
            </Form.Item>
            {this.renderPartitions()}
          </div>
          {fixedFooter ? (
            <>
              <div className={styles.footer}>{this.renderButtons()}</div>
            </>
          ) : null}
        </Form>
      </>
    );
  }

  private renderButtons() {
    return (
      <Button
        size="small"
        type="primary"
        onClick={this.handleSubmit}
        className={styles.submitButton}
      >
        {formatMessage({ id: 'app.button.ok' })}
      </Button>
    );
  }
}

export default CreateTablePartitionRuleForm;
