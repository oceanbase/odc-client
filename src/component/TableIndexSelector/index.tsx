import { fieldIconMap } from '@/constant';
import { ColumnShowType, IDataType, ITableColumn } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { convertDataTypeToDataShowType } from '@/util/utils';
import Icon from '@ant-design/icons';
import { Col, Empty, Row, Table } from 'antd';
import update from 'immutability-helper';
import { Component } from 'react';
import DragableColumn from './DragableColumn';
import styles from './index.less';

export const ColumnIcon = ({ dataShowType }: { dataShowType: ColumnShowType }) => (
  <Icon
    component={fieldIconMap[dataShowType]}
    style={{
      fontSize: 16,
      color: '#3FA3FF',
      marginRight: 4,
      verticalAlign: 'middle',
    }}
  />
);

export interface IIndexColumn {
  columnName: string;
  dragIdx: number;
}

let dragIdxGenerator = 1;

const { Column } = Table;

export default class TableIndexSelector extends Component<{
  dataTypes: IDataType[];
  columns?: Partial<ITableColumn>[];
  disabled?: boolean;
  value?: Array<Partial<IIndexColumn>>;
  onChange?: (value: Array<Partial<IIndexColumn>>) => void;
}> {
  public handleAdd = (columnName: string) => {
    const { value, onChange } = this.props;
    if (onChange && value && !value.filter((c) => c.columnName === columnName).length) {
      const updateValue = [...value].concat({
        dragIdx: dragIdxGenerator++,
        columnName,
      });
      onChange(updateValue);
    }
  };

  public handleDelete = (idx: number) => {
    const { value, onChange } = this.props;
    if (value) {
      value.splice(idx, 1);
      if (onChange) {
        onChange([...value]);
      }
    }
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
    const { columns, value, dataTypes, disabled } = this.props;
    if (disabled) {
      return value
        ?.map?.((indexColumn, index) => {
          return indexColumn.columnName;
        })
        ?.join(',');
    }
    return (
      <Table
        tableLayout="fixed"
        dataSource={[{}]}
        bordered={true}
        pagination={false}
        className={styles.table}
      >
        <Column
          title={formatMessage({
            id: 'workspace.window.table.modal.index.columnNames1',
          })}
          render={() =>
            columns && columns.length ? (
              columns.map((c) => (
                <Row
                  key={c.columnName}
                  onClick={this.handleAdd.bind(this, c.columnName)}
                  className={styles.column}
                >
                  <Col span={24}>
                    {c.dataType && (
                      <ColumnIcon
                        dataShowType={convertDataTypeToDataShowType(c.dataType, dataTypes)}
                      />
                    )}
                    {c.columnName}
                  </Col>
                </Row>
              ))
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )
          }
        />
        <Column
          title={formatMessage({
            id: 'workspace.window.table.modal.index.priority',
          })}
          render={() =>
            value && value.length ? (
              value.map((indexColumn, index) => {
                if (!indexColumn.dragIdx) {
                  indexColumn.dragIdx = dragIdxGenerator++;
                }
                // @ts-ignore
                const column = columns.find((c) => c.columnName === indexColumn.columnName);
                return (
                  column && (
                    <DragableColumn
                      key={indexColumn.dragIdx || 0}
                      id={indexColumn.dragIdx || 0}
                      index={index}
                      column={indexColumn}
                      dataShowType={convertDataTypeToDataShowType(column.dataType, dataTypes)}
                      handleDelete={this.handleDelete}
                      handleMove={this.handleMove}
                    />
                  )
                );
              })
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )
          }
        />
      </Table>
    );
  }
}
