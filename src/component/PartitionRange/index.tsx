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

import { useCallback } from 'react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
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

const PartitionRange: React.FC<IProps> = ({
  partitionType,
  selectColums,
  partitionValuePlaceholder,
  partitionValueLabel,
  value,
  onChange,
}) => {
  const handleAdd = useCallback(
    (e) => {
      if (value && onChange) {
        const newItem = {
          dragIdx: dragIdxGenerator++,
          name: '',
          value: partitionType === 'LIST_COLUMNS' ? [{}] : '',
        };
        const updatedList = [...value, newItem];
        onChange(updatedList);
      }
    },
    [value, onChange, partitionType],
  );

  const handleDelete = useCallback(
    (idx: number) => {
      if (value && onChange) {
        const newList = [...value];
        newList.splice(idx, 1);
        onChange(newList);
      }
    },
    [value, onChange],
  );

  const handleEdit = useCallback(
    (idx: number, rule: Partial<ISinglePartitionRule>) => {
      if (value && onChange) {
        const newList = [...value];
        newList.splice(idx, 1, {
          ...newList[idx],
          ...rule,
        });
        onChange(newList);
      }
    },
    [value, onChange],
  );

  const handlePartitionNameChange = useCallback(
    (index, val) => {
      handleEdit(index, { name: val });
    },
    [handleEdit],
  );

  const dataSource = value ? [...value] : [];
  let labelPlus = '';
  if (partitionType === 'LIST_COLUMNS') {
    labelPlus = ` ${selectColums?.map((item) => item.columnName).join(':')}`;
  }
  const columns = [
    {
      title: formatMessage({
        id: 'odc.component.PartitionRange.PartitionName',
        defaultMessage: '分区名称',
      }),
      dataIndex: 'name',
      key: 'name',
      width: '242px',
      render: (val, record, index) => {
        const errorMessage = record.error && record.error.name;
        return (
          <Form.Item
            name={['partitions', index, 'name']}
            validateStatus={errorMessage ? 'error' : null}
            help={errorMessage || ''}
          >
            <Input
              onChange={(e) => {
                handlePartitionNameChange(index, e.target.value);
              }}
              placeholder={formatMessage({
                id: 'odc.component.PartitionRange.Enter',
                defaultMessage: '请输入',
              })}
              autoFocus={true}
            />
          </Form.Item>
        );
      },
    },
    {
      title: partitionValueLabel + labelPlus,
      dataIndex: 'value',
      key: 'value',
      render: (val, record, index) => {
        return (
          <div className={styles.partitionValueWrap}>
            <PartitionValueInput
              error={record.error && record.error.value}
              index={index}
              partitionType={partitionType}
              selectColums={selectColums}
              value={val}
              placeholder={partitionValuePlaceholder}
              handleEdit={handleEdit}
            />
            {dataSource.length > 1 ? (
              <DeleteOutlined
                style={{
                  lineHeight: '32px',
                }}
                className="btn-partition-delete"
                onClick={() => {
                  handleDelete(index);
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
      <Button className={styles.btnAdd} icon={<PlusOutlined />} size="small" onClick={handleAdd}>
        {formatMessage({
          id: 'workspace.window.createTable.partition.button.add',
          defaultMessage: '添加分区',
        })}
      </Button>
    </>
  );
};

export default PartitionRange;
