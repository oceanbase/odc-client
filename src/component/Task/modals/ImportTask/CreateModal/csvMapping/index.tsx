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

import { getTableColumnList } from '@/common/network/table';
import type { CsvColumnMapping, ITableColumn } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Row, Select, Tooltip } from 'antd';
import { cloneDeep, isNil } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import Editable from './editable';

const { Option } = Select;
interface IProps {
  csvColumnMappings: CsvColumnMapping[];
  tableName: string;
  databaseName: string;
  sessionId: string;
  onChangeCsvColumnMappings: (csvColumnMappings: CsvColumnMapping[]) => void;
  csvMappingErrors: {
    errorMsg: string;
    errorIndex: number;
  }[];
}

const CsvMapping: React.FC<IProps> = (props) => {
  const {
    databaseName,
    sessionId,
    tableName,
    csvColumnMappings,
    onChangeCsvColumnMappings,
    csvMappingErrors,
  } = props;
  const [columns, setColumns] = useState<ITableColumn[]>([]);

  const getTableColumns = async () => {
    if (!sessionId) {
      return;
    }
    const columns = await getTableColumnList(tableName, databaseName, sessionId);
    setColumns(columns);
  };

  useEffect(() => {
    getTableColumns();
  }, []);

  useEffect(() => {
    getTableColumns();
  }, [tableName, sessionId]);

  const changeDestColumnName = (index: number, value: string) => {
    const newMapping = cloneDeep(csvColumnMappings);
    const targetColumn = columns.find((column) => {
      return column.columnName === value;
    });
    newMapping[index] = {
      ...newMapping[index],
      destColumnName: value,
      destColumnType: targetColumn?.dataType,
      destColumnPosition: targetColumn?.ordinalPosition,
    };

    onChangeCsvColumnMappings?.(newMapping);
  };

  const updateSelectedKeys = (selectedKeys: string[]) => {
    const indexs = selectedKeys.map((key) => {
      return parseInt(key.split('-')[0]);
    });
    onChangeCsvColumnMappings?.(
      csvColumnMappings?.map((column, i) => {
        return { ...column, isSelected: indexs.includes(i) };
      }),
    );
  };

  const errorMsg = useMemo(() => {
    let errorMsg;
    if (csvMappingErrors?.length) {
      const globalError = csvMappingErrors.find((error) => {
        return error.errorIndex === -1;
      });
      if (globalError) {
        errorMsg = globalError.errorMsg;
      } else {
        errorMsg = formatMessage({
          id: 'odc.ImportDrawer.csvMapping.IncorrectFormSettings',
          defaultMessage: '表单设置有误',
        });
      }
    }
    return errorMsg;
  }, [JSON.stringify(csvMappingErrors)]);

  const initColumns = () => {
    const errorMap = {};
    csvMappingErrors?.forEach((error) => {
      errorMap[error.errorIndex] = error.errorMsg;
    });
    return [
      {
        title: formatMessage({
          id: 'odc.ImportDrawer.csvMapping.ImportFile',
          defaultMessage: '导入文件',
        }), //导入文件
        children: [
          {
            title: formatMessage({
              id: 'odc.ImportDrawer.csvMapping.OriginalField',
              defaultMessage: '原字段',
            }),

            dataIndex: 'srcColumnName',
            width: 100,
          },

          {
            title: formatMessage({
              id: 'odc.ImportDrawer.csvMapping.FirstLineValue',
              defaultMessage: '首行值',
            }),

            dataIndex: 'firstLineValue',
            render(t) {
              if (t === '') {
                return formatMessage({
                  id: 'odc.ImportDrawer.csvMapping.Null',
                  defaultMessage: '(空)',
                }); // (空)
              } else if (isNil(t)) {
                return '(null)';
              }
              return t;
            },
          },
        ],
      },

      {
        title: formatMessage({
          id: 'odc.ImportDrawer.csvMapping.TargetTable',
          defaultMessage: '目标表',
        }), //目标表
        children: [
          {
            title: formatMessage({
              id: 'odc.ImportDrawer.csvMapping.TargetField',
              defaultMessage: '目标字段',
            }),
            dataIndex: 'destColumnName',
            width: 100,
            render: (columnName, record, i) => {
              if (errorMap[i]) {
                return (
                  <Tooltip title={errorMap[i]}>
                    <div style={{ color: '#FF4D4F' }}>
                      {columnName ||
                        formatMessage({
                          id: 'odc.ImportDrawer.csvMapping.No',
                          defaultMessage: '无',
                        })}
                    </div>
                  </Tooltip>
                );
              }
              return columnName;
            },
            editor: (t, record, i) => {
              return (
                <Select
                  value={t}
                  showSearch
                  allowClear
                  onChange={(value) => changeDestColumnName(i, value)}
                  style={{ width: 100 }}
                  getPopupContainer={(trigger) => trigger?.parentNode}
                  dropdownStyle={{
                    width: 170,
                    minWidth: 170,
                  }}
                >
                  {columns.map((column) => {
                    return (
                      <Option
                        title={column.columnName}
                        key={column.columnName}
                        value={column.columnName}
                      >
                        {column.columnName}
                      </Option>
                    );
                  })}
                </Select>
              );
            },
          },

          {
            title: formatMessage({
              id: 'odc.ImportDrawer.csvMapping.TargetFieldType',
              defaultMessage: '目标字段类型',
            }),

            dataIndex: 'destColumnType',
            width: 100,
          },
        ],
      },
    ];
  };

  return (
    <div>
      <div style={{ lineHeight: '20px', fontSize: 12, margin: '16px 0px' }}>
        {formatMessage({
          id: 'odc.ImportDrawer.csvMapping.FieldMapping',
          defaultMessage: '字段映射',
        })}
      </div>
      <Editable
        rowKey={(_, i) => {
          return `${i}-key`;
        }}
        columns={initColumns()}
        dataSource={csvColumnMappings}
        rowSelection={{
          selectedRowKeys: csvColumnMappings
            .map((column, i) => {
              return column.isSelected ? `${i}-key` : null;
            })
            .filter(Boolean),
          onChange: (selectedKeys) => {
            updateSelectedKeys(selectedKeys as string[]);
          },
        }}
        pagination={false}
      />

      {errorMsg && <Row style={{ color: '#FF4D4F', marginTop: 8 }}>{errorMsg}</Row>}
    </div>
  );
};

export default CsvMapping;
