import PartitionRange from '@/component/PartitionRange';
import TableIndexSelector from '@/component/TableIndexSelector';
import {
  ConnectionMode,
  IDataType,
  IPartitionType,
  ITable,
  ITableColumn,
  ITablePartition,
} from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { formatMessage } from '@/util/intl';
import { Button, Divider, Form, Input, InputNumber, message, Select } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { cloneDeep } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import styles from './index.less';

interface IProps {
  fixedFooter?: boolean;
  connectionStore?: ConnectionStore;
  dataTypes: IDataType[];
  partitionType?: IPartitionType;
  disableCheckMaxValue?: boolean;
  disablePartition?: boolean;
  table: Partial<ITable>;
  onSave: (partitions: Array<Partial<ITablePartition>>) => void;
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

// 分区配置
const partitionMap = {
  [IPartitionType.HASH]: {
    title: 'Hash',
  },

  [IPartitionType.KEY]: {
    title: 'Key',
  },

  [IPartitionType.RANGE]: {
    title: 'Range',
  },

  [IPartitionType.RANGE_COLUMNS]: {
    title: 'Range Columns',
  },

  [IPartitionType.LIST]: {
    title: 'List',
  },

  [IPartitionType.LIST_COLUMNS]: {
    title: 'List Columns',
  },

  [IPartitionType.NONE]: {
    title: 'None',
  },
};

@inject('connectionStore')
@observer
class CreateTablePartitionRuleForm extends Component<
  IProps,
  {
    partitionType: IPartitionType;
  }
> {
  public formRef = React.createRef<FormInstance>();

  public readonly state = {
    partitionType: this.props.partitionType,
  };

  public isOracleMode = () => {
    const { connectionStore } = this.props;
    return (
      connectionStore &&
      connectionStore.connection &&
      connectionStore.connection.dbMode &&
      connectionStore.connection.dbMode === ConnectionMode.OB_ORACLE
    );
  };

  public handleSubmit = () => {
    const { onSave } = this.props;
    const isOracle = this.isOracleMode();

    this.formRef.current
      .validateFields()
      .then((values: IFormPartition) => {
        let partitions: Array<Partial<ITablePartition>>;
        const partition = cloneDeep(values);
        const { columns, partType } = partition;
        let errorMessage = '';
        const partitionNames = {};
        // 空字段打标错误码
        partition.partitions &&
          partition.partitions.map((item) => {
            // 清空错误信息
            item.error = {};

            // 分区名称不能为空
            if (!item.name) {
              errorMessage = formatMessage({
                id: 'odc.components.CreateTablePartitionRuleForm.ThePartitionNameMustBe',
              });

              item.error.name = errorMessage;
            }

            // 分区名不能重复
            // oracleMode 分区不区分大小写
            if (isOracle) {
              if (item.name && partitionNames[item.name.toLowerCase()]) {
                const sameNamePartitions = partition.partitions.filter(
                  (i) => i.name.toLowerCase() === item.name.toLowerCase(),
                );
                sameNamePartitions.forEach((item) => {
                  item.error.name = formatMessage({
                    id: 'odc.components.CreateTablePartitionRuleForm.ThePartitionNameMustBeUnique',
                  });
                });
              }
              partitionNames[item.name.toLowerCase()] = true;
            } else {
              if (item.name && partitionNames[item.name]) {
                const sameNamePartitions = partition.partitions.filter((i) => i.name === item.name);
                sameNamePartitions.forEach((item) => {
                  item.error.name = formatMessage({
                    id: 'odc.components.CreateTablePartitionRuleForm.ThePartitionNameMustBeUnique',
                  });
                });
              }
              partitionNames[item.name] = true;
            }

            // 通用分区值检查
            if (!item.value && partType !== 'RANGE_COLUMNS' && partType !== 'LIST_COLUMNS') {
              errorMessage = formatMessage({
                id: 'odc.components.CreateTablePartitionRuleForm.EnterAPartitionValue',
              });

              item.error.value = errorMessage;
              return;
            }

            if (partType === 'RANGE_COLUMNS') {
              item.error.value = {};
              item.value = item.value || {};
              const keys = Object.keys(item.value);
              if (!keys.length) {
                errorMessage = formatMessage({
                  id: 'odc.components.CreateTablePartitionRuleForm.SelectAFieldFirst',
                });
              }

              columns.forEach((column) => {
                if (!item.value[column.columnName]) {
                  errorMessage = formatMessage({
                    id: 'odc.components.CreateTablePartitionRuleForm.EnterAPartitionValue',
                  });

                  item.error.value[column.columnName] = errorMessage;
                }
              });
            }

            if (partType === 'LIST_COLUMNS') {
              item.error.value = [];
              item.value = item.value || [];
              if (!item.value.length) {
                errorMessage = formatMessage({
                  id: 'odc.components.CreateTablePartitionRuleForm.SelectAFieldFirst',
                });
              }

              item.value.forEach((data, i) => {
                columns.forEach((column) => {
                  if (!data[column.columnName]) {
                    errorMessage = formatMessage({
                      id: 'odc.components.CreateTablePartitionRuleForm.EnterAPartitionValue',
                    });

                    item.error.value[i] = errorMessage;
                  }
                });
              });
            }
          });

        // 更新错误信息
        this.formRef.current.setFieldsValue({
          partitions: partition.partitions,
        });

        if (errorMessage) {
          message.error(errorMessage);
          return;
        }
        const formatPartition = cloneDeep(partition);
        // if (
        //   !disableCheckMaxValue &&
        //   (isOracle
        //     ? partition.partType === IPartitionType.RANGE_COLUMNS
        //     : partition.partType === IPartitionType.RANGE)
        // ) {
        //   // 如果是 RANGE 类型，一定要有一个默认分区
        //   const r = partition.partitions.filter((p) => p.value === 'MAXVALUE');
        //   if (!r || r.length === 0) {
        //     message.error(
        //       formatMessage({
        //         id: 'workspace.window.createTable.partition.validation.maxvalue',
        //       }),
        //     );

        //     return;
        //   }
        // }

        // 处理数据（删减字段、排序、格式化）
        if (formatPartition.partType === IPartitionType.RANGE_COLUMNS) {
          formatPartition.partitions = formatPartition.partitions.map((item) => {
            // value: { a: 1, b: 2, c: 3 }
            const { name, value = {} } = item;
            item.value = columns
              .map((col) => {
                const { columnName } = col;
                return this.getFormatePartitionValue(columnName, value[columnName]);
              })
              .join(',');
            return item;
          });
        }

        if (formatPartition.partType === IPartitionType.LIST_COLUMNS) {
          formatPartition.partitions = formatPartition.partitions.map((item) => {
            const { name, value = [] } = item;
            item.value = value
              .map((val) => {
                const itemStr = columns
                  .map((col) => {
                    const { columnName } = col;
                    return this.getFormatePartitionValue(columnName, val[columnName]);
                  })
                  .join(',');
                return `(${itemStr})`;
              })
              .join(',');
            return item;
          });
        }

        // range || list 类型 || hash，字段 & 表达式二选一
        if (
          (partition.partType === IPartitionType.RANGE ||
            partition.partType === IPartitionType.LIST ||
            partition.partType === IPartitionType.HASH) &&
          !partition.expression &&
          partition.columnName
        ) {
          formatPartition.expression = partition.columnName;
          delete formatPartition.columnName;
        }

        // range columns || list columns
        if (
          partition.partType === IPartitionType.RANGE_COLUMNS ||
          partition.partType === IPartitionType.LIST_COLUMNS ||
          partition.partType === IPartitionType.KEY
        ) {
          formatPartition.expression = partition.columns.map((c: any) => c.columnName).join(',');
        }

        // hash
        if (
          formatPartition.partType === IPartitionType.HASH ||
          formatPartition.partType === IPartitionType.KEY
        ) {
          partitions = [
            {
              // Oracle 模式没有 key 分区
              partType: isOracle ? IPartitionType.HASH : formatPartition.partType,
              expression: formatPartition.expression,
              partNumber: formatPartition.partNumber,
            },
          ];
        } else {
          partitions = (formatPartition.partitions || []).map(({ name, value }) => ({
            partType: formatPartition.partType,
            expression: formatPartition.expression,
            partName: name, // 分区名称
            partValues: value,
          }));
        }
        onSave(partitions);
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  public handleChangeType = (partitionType: IPartitionType) => {
    const form = this.formRef.current;
    const partitions = form.getFieldValue('partitions') || [{}];
    form.setFieldsValue({
      partitions: partitions.map((item) => {
        item.name = '';
        item.value = partitionType === IPartitionType.LIST_COLUMNS ? [{}] : '';
        item.error = {};
        return item;
      }),
    });

    this.setState({ partitionType });
  };

  public render() {
    const {
      table,
      disableCheckMaxValue,
      disablePartition,
      dataTypes,
      connectionStore,
      fixedFooter,
    } = this.props;

    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };

    const { partitionType } = this.state;
    // oracle mode 没有 key 分区类型
    // @see aone/issue/22400325?
    const isOracle =
      connectionStore &&
      connectionStore.connection &&
      connectionStore.connection.dbMode &&
      connectionStore.connection.dbMode === ConnectionMode.OB_ORACLE;
    const showColumn =
      partitionType === IPartitionType.RANGE ||
      partitionType === IPartitionType.LIST ||
      partitionType === IPartitionType.HASH;

    const initialPartitions = [{ name: '', value: '' }];
    const initialValues = {
      partType: partitionType || IPartitionType.NONE,
      columnName: table && table.columns && table.columns.length ? table.columns[0].columnName : '',
      expression: '',
      columns: [],
      partitions: initialPartitions,
      partNumber: 1,
    };
    // Range 类型需要添加一个默认分区
    // if (
    //   !disableCheckMaxValue &&
    //   (isOracle
    //     ? partitionType === IPartitionType.RANGE_COLUMNS
    //     : partitionType === IPartitionType.RANGE)
    // ) {
    //   initialPartitions.push({
    //     name: '',
    //     value: 'MAXVALUE',
    //   });
    // }

    return (
      <>
        <Form
          {...formItemLayout}
          ref={this.formRef}
          className={styles.form}
          initialValues={initialValues}
          style={{
            height: fixedFooter ? 'calc(100vh - 157px)' : 'initial',
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
              name="partType"
              label={formatMessage({
                id: 'workspace.window.createTable.partition.type',
              })}
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
                disabled={disablePartition}
                onChange={this.handleChangeType}
                style={{ width: 240 }}
                getPopupContainer={(e) => {
                  return e?.closest('.J_createTable') || document.body;
                }}
              >
                <Option value={IPartitionType.NONE}>{partitionNameMap[IPartitionType.NONE]}</Option>
                {!isOracle && (
                  <Option value={IPartitionType.RANGE}>
                    {partitionNameMap[IPartitionType.RANGE]}
                  </Option>
                )}

                <Option value={IPartitionType.RANGE_COLUMNS}>
                  {partitionNameMap[isOracle ? IPartitionType.RANGE : IPartitionType.RANGE_COLUMNS]}
                </Option>
                {!isOracle && (
                  <Option value={IPartitionType.LIST}>
                    {partitionNameMap[IPartitionType.LIST]}
                  </Option>
                )}

                <Option value={IPartitionType.LIST_COLUMNS}>
                  {partitionNameMap[isOracle ? IPartitionType.LIST : IPartitionType.LIST_COLUMNS]}
                </Option>
                {!isOracle && (
                  <Option value={IPartitionType.HASH}>
                    {partitionNameMap[IPartitionType.HASH]}
                  </Option>
                )}

                <Option value={IPartitionType.KEY}>
                  {partitionNameMap[isOracle ? IPartitionType.HASH : IPartitionType.KEY]}
                </Option>
              </Select>
            </Form.Item>
            {showColumn && (
              <Form.Item
                name="columnName"
                label={formatMessage({
                  id: 'workspace.window.createTable.partition.column',
                })}
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'workspace.window.createTable.column.name.validation',
                    }),
                  },
                ]}
              >
                <Select style={{ width: 240 }}>
                  {table &&
                    (table.columns || []).map((c) => (
                      <Option key={c.columnName} value={c.columnName}>
                        {c.columnName}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            )}

            {showColumn && (
              <Form.Item
                name="expression"
                label={formatMessage({
                  id: 'workspace.window.createTable.partition.expression',
                })}
              >
                <Input style={{ width: 240 }} />
              </Form.Item>
            )}

            {(partitionType === IPartitionType.RANGE_COLUMNS ||
              partitionType === IPartitionType.LIST_COLUMNS ||
              partitionType === IPartitionType.KEY) && (
              <Form.Item
                name="columns"
                label={formatMessage({
                  id: 'workspace.window.createTable.partition.columns',
                })}
              >
                <TableIndexSelector
                  dataTypes={dataTypes}
                  columns={table && (table.columns as ITableColumn[])}
                  // onChange={this.handleChangeColumns}
                />
              </Form.Item>
            )}

            {(partitionType === IPartitionType.RANGE ||
              partitionType === IPartitionType.RANGE_COLUMNS ||
              partitionType === IPartitionType.LIST ||
              partitionType === IPartitionType.LIST_COLUMNS) && (
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                  return (
                    <Form.Item
                      name="partitions"
                      label={formatMessage({
                        id: 'workspace.window.table.propstab.partition',
                      })}
                    >
                      <PartitionRange
                        partitionType={partitionType}
                        selectColums={getFieldValue('columns')}
                        partitionValuePlaceholder={this.getPartitionValuePlaceholder(partitionType)}
                        partitionValueLabel={this.getPartitionValueLabel(partitionType)}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            )}

            {(partitionType === IPartitionType.HASH || partitionType === IPartitionType.KEY) && (
              <Form.Item
                name="partNumber"
                label={formatMessage({
                  id: 'workspace.window.createTable.partition.partNumber',
                })}
              >
                <InputNumber min={0} />
              </Form.Item>
            )}
          </div>
          {fixedFooter ? (
            <>
              <div className={styles.footer}>{this.renderButtons()}</div>
            </>
          ) : (
            <>
              <Divider className={styles.divider} />
              {this.renderButtons()}
            </>
          )}
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

  private getPartitionValuePlaceholder(partitionType: IPartitionType) {
    if (partitionType === IPartitionType.LIST) {
      return formatMessage({
        id: 'workspace.window.createTable.partition.value.list.placelholder',
      });
    }
    if (partitionType === IPartitionType.LIST_COLUMNS) {
      return formatMessage({
        id: 'workspace.window.createTable.partition.value.listColumns.placelholder',
      });
    }
    if (partitionType === IPartitionType.RANGE) {
      return formatMessage({
        id: 'workspace.window.createTable.partition.value.range.placelholder',
      });
    }
    if (partitionType === IPartitionType.RANGE_COLUMNS) {
      return formatMessage({
        id: 'workspace.window.createTable.partition.value.rangeColumns.placelholder',
      });
    }
    return '';
  }

  private getPartitionValueLabel(partitionType: IPartitionType) {
    if (partitionType === IPartitionType.LIST || partitionType === IPartitionType.LIST_COLUMNS) {
      return formatMessage({
        id: 'workspace.window.createTable.partition.value.list',
      });
    }
    if (partitionType === IPartitionType.RANGE_COLUMNS || partitionType === IPartitionType.RANGE) {
      return formatMessage({
        id: 'workspace.window.createTable.partition.value.range',
      });
    }
    return '';
  }

  private getFormatePartitionValue = (columnName: string, value: any) => {
    const { columns } = this.props.table;
    const columnSchema = columns.find((c) => c.columnName === columnName);
    const isNumberType =
      /^(integer|number|float|tinyint|smallint|mediumint|int|bigint|double|decimal)/i.test(
        columnSchema.dataType,
      );
    return isNumberType ? value : "'" + value + "'"; // 必须用单引号
  };
}

export default CreateTablePartitionRuleForm;
