import { Popover, Table } from 'antd';
import React from 'react';

import { ColumnType, TableProps } from 'antd/es/table';
import styles from './editable.less';

interface IEditableColumn extends ColumnType<any> {
  editor?: (text: any, record: any, index: number) => React.ReactElement;
}

interface IEditableProps extends TableProps<any> {
  columns: IEditableColumn[];
}

class Editable extends React.Component<IEditableProps, any> {
  state = {
    selected: [],
  };

  initColumns = () => {
    const { columns } = this.props;
    function columnConvert(column) {
      return {
        ...column,
        ellipsis: true,
        children: column.children?.map((c) => {
          return columnConvert(c);
        }),
        render: (text, record, i) => {
          const originContent = column.render ? column.render(text, record, i) : text;
          if (column.editor) {
            return (
              <Popover
                overlayClassName={styles.popOver}
                trigger="click"
                content={column.editor(text, record, i)}
              >
                <div style={{ height: '100%', cursor: 'pointer', lineHeight: '24px' }}>
                  {originContent}
                </div>
              </Popover>
            );
          } else {
            return originContent;
          }
        },
      };
    }
    return columns.map((column) => {
      return columnConvert(column);
    });
  };

  render() {
    const { columns, ...rest } = this.props;
    return (
      <Table
        bordered={true}
        className={styles.table}
        rowClassName={(record, i) => (i % 2 === 0 ? styles.even : styles.odd)}
        columns={this.initColumns()}
        {...rest}
      />
    );
  }
}
export default Editable;
