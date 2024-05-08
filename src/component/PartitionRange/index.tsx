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

import { Component } from 'react';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
// compatible

import { Button, Form, Input, Table } from 'antd';
import update from 'immutability-helper';
import PartitionValueInput from './PartitionValueInput';
// @ts-ignore
import { formatMessage } from '@/util/intl';
import styles from './index.less';

export interface ISinglePartitionRule {
  name: string;
  value: string;
  dragIdx: number;
}

interface IProps {
  partitionType: string;
  selectColums?: Array<any>;
  partitionValuePlaceholder?: string;
  partitionValueLabel?: string;
  value?: any;
  onChange?: (list: ISinglePartitionRule[]) => void;
}

let dragIdxGenerator = 1;

export default class PartitionRange extends Component<IProps> {
  public handleAdd = (e) => {
    const { value, onChange, partitionType } = this.props;
    if (value && onChange) {
      const update = [...value].concat({
        dragIdx: dragIdxGenerator++,
        name: '',
        value: partitionType === 'LIST_COLUMNS' ? [{}] : '',
      });

      onChange(update);
    }
  };

  public handleDelete = (idx: number) => {
    const { value, onChange } = this.props;
    if (value && onChange) {
      value.splice(idx, 1);
      onChange(value);
    }
  };

  public handleEdit = (idx: number, rule: Partial<ISinglePartitionRule>) => {
    const { value, onChange } = this.props;
    if (value && onChange) {
      // 替换 idx 的值
      value.splice(idx, 1, {
        ...value[idx],
        ...rule,
      });

      onChange(value);
    }
  };

  private handlePartitionNameChange = (index, value) => {
    this.handleEdit(index, { name: value });
  };

  public handleMove = (dragIndex: number, hoverIndex: number) => {
    const { value, onChange } = this.props;
    if (value) {
      const dragParam = value[dragIndex];
      if (onChange) {
        const updateValue = update(value, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragParam],
          ],
        });

        onChange(updateValue);
      }
    }
  };

  public render() {
    const { value, partitionType, selectColums } = this.props;
    const self = this;
    const dataSource = [...value];
    let labelPlus = '';
    if (partitionType === 'LIST_COLUMNS') {
      labelPlus = ` ${selectColums.map((item) => item.columnName).join(':')}`;
    }
    const columns = [
      {
        title: formatMessage({
          id: 'odc.component.PartitionRange.PartitionName',
        }),
        dataIndex: 'name',
        key: 'name',
        width: '242px',
        render(val, record, index) {
          const errorMessage = record.error && record.error.name;
          return (
            <Form.Item
              name={['partitions', index, 'name']}
              validateStatus={errorMessage ? 'error' : null}
              help={errorMessage || ''}
            >
              <Input
                onChange={(e) => {
                  self.handlePartitionNameChange(index, e.target.value);
                }}
                placeholder={formatMessage({
                  id: 'odc.component.PartitionRange.Enter',
                })}
                autoFocus={true}
              />
            </Form.Item>
          );
        },
      },

      {
        title: this.props.partitionValueLabel + labelPlus,
        dataIndex: 'value',
        key: 'value',
        render(val, record, index) {
          return (
            <div className={styles.partitionValueWrap}>
              <PartitionValueInput
                error={record.error && record.error.value}
                index={index}
                partitionType={self.props.partitionType}
                selectColums={self.props.selectColums}
                value={val}
                placeholder={self.props.partitionValuePlaceholder}
                handleEdit={self.handleEdit}
              />

              {dataSource.length > 1 ? (
                <DeleteOutlined
                  style={{
                    lineHeight: '32px',
                  }}
                  className="btn-partition-delete"
                  onClick={() => {
                    self.handleDelete(index);
                  }}
                />
              ) : null}
            </div>
          );
        },
      },
    ];

    return (
      <>
        <Table
          columns={columns}
          dataSource={dataSource}
          tableLayout="fixed"
          className={styles.table}
          bordered
          pagination={false}
        />

        <Button
          className={styles.btnAdd}
          icon={<PlusOutlined />}
          size="small"
          onClick={this.handleAdd}
        >
          {formatMessage({ id: 'workspace.window.createTable.partition.button.add' })}
        </Button>
      </>
    );
  }
}
