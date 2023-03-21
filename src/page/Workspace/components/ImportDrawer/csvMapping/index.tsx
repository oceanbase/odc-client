import { getTableColumnList } from '@/common/network/table';
import type { CsvColumnMapping, ITableColumn } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Row, Select, Tooltip } from 'antd';
import { cloneDeep, isNil } from 'lodash';
import React from 'react';
import Editable from './editable';

const { Option } = Select;

class CsvMapping extends React.Component<
  {
    csvColumnMappings: CsvColumnMapping[];
    tableName: string;
    onChangeCsvColumnMappings: (csvColumnMappings: CsvColumnMapping[]) => void;
    csvMappingErrors: {
      errorMsg: string;
      errorIndex: number;
    }[];
  },
  {
    columns: ITableColumn[];
  }
> {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
    };
  }
  componentDidMount() {
    this.getTableColumns();
  }
  getTableColumns = async () => {
    const columns = await getTableColumnList(this.props.tableName);
    this.setState({
      columns,
    });
  };
  componentDidUpdate(
    prevProps: Readonly<{
      csvColumnMappings: CsvColumnMapping[];
      tableName: string;
      onChangeCsvColumnMappings: (csvColumnMappings: CsvColumnMapping[]) => void;
      csvMappingErrors: {
        errorMsg: string;
        errorIndex: number;
      }[];
    }>,

    prevState: Readonly<{ columns: ITableColumn[] }>,
    snapshot?: any,
  ): void {
    if (prevProps.tableName !== this.props.tableName) {
      this.getTableColumns();
    }
  }
  changeDestColumnName = (index, value) => {
    const newMapping = cloneDeep(this.props.csvColumnMappings);
    const targetColumn = this.state.columns.find((column) => {
      return column.columnName == value;
    });
    newMapping[index] = {
      ...newMapping[index],
      destColumnName: value,
      destColumnType: targetColumn?.dataType,
      destColumnPosition: targetColumn?.ordinalPosition,
    };

    this.props.onChangeCsvColumnMappings(newMapping);
  };

  updateSelectedKeys = (selectedKeys: string[]) => {
    const indexs = selectedKeys.map((key) => {
      return parseInt(key.split('-')[0]);
    });
    this.props.onChangeCsvColumnMappings(
      this.props.csvColumnMappings.map((column, i) => {
        return { ...column, isSelected: indexs.includes(i) };
      }),
    );
  };

  initColumns = () => {
    const { csvMappingErrors } = this.props;
    const errorMap = {};
    csvMappingErrors?.forEach((error) => {
      errorMap[error.errorIndex] = error.errorMsg;
    });
    return [
      {
        title: formatMessage({ id: 'odc.ImportDrawer.csvMapping.ImportFile' }), //导入文件
        children: [
          {
            title: formatMessage({
              id: 'odc.ImportDrawer.csvMapping.OriginalField',
            }),

            dataIndex: 'srcColumnName',
            width: 100,
          },

          {
            title: formatMessage({
              id: 'odc.ImportDrawer.csvMapping.FirstLineValue',
            }),

            dataIndex: 'firstLineValue',
            render(t) {
              if (t === '') {
                return formatMessage({
                  id: 'odc.ImportDrawer.csvMapping.Null',
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
        title: formatMessage({ id: 'odc.ImportDrawer.csvMapping.TargetTable' }), //目标表
        children: [
          {
            title: formatMessage({
              id: 'odc.ImportDrawer.csvMapping.TargetField',
            }),
            dataIndex: 'destColumnName',
            width: 100,
            render: (columnName, record, i) => {
              if (errorMap[i]) {
                return (
                  <Tooltip title={errorMap[i]}>
                    <div style={{ color: '#FF4D4F' }}>
                      {columnName || formatMessage({ id: 'odc.ImportDrawer.csvMapping.No' })}
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
                  onChange={this.changeDestColumnName.bind(this, i)}
                  style={{ width: 100 }}
                  dropdownStyle={{
                    width: 170,
                    minWidth: 170,
                  }}
                >
                  {this.state.columns.map((column) => {
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
            }),

            dataIndex: 'destColumnType',
            width: 100,
          },
        ],
      },
    ];
  };
  render() {
    const { csvColumnMappings, csvMappingErrors } = this.props;
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
        });
      }
    }
    return (
      <div>
        <div style={{ lineHeight: '20px', fontSize: 12, margin: '16px 0px' }}>
          {formatMessage({ id: 'odc.ImportDrawer.csvMapping.FieldMapping' })}
        </div>
        <Editable
          rowKey={(_, i) => {
            return `${i}-key`;
          }}
          columns={this.initColumns()}
          dataSource={csvColumnMappings}
          rowSelection={{
            selectedRowKeys: csvColumnMappings
              .map((column, i) => {
                return column.isSelected ? `${i}-key` : null;
              })
              .filter(Boolean),
            onChange: (selectedKeys) => {
              this.updateSelectedKeys(selectedKeys as string[]);
            },
          }}
          pagination={false}
        />

        {errorMsg && <Row style={{ color: '#FF4D4F', marginTop: 8 }}>{errorMsg}</Row>}
      </div>
    );
  }
}

export default CsvMapping;
