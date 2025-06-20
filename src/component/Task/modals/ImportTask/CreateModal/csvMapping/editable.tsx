import { Popover, Table } from 'antd';
import React from 'react';
import { ColumnType, TableProps } from 'antd/es/table';
import classNames from 'classnames';
import styles from './editable.less';

interface IEditableColumn extends ColumnType<any> {
  editor?: (text: any, record: any, index: number) => React.ReactElement;
}

interface IEditableProps extends TableProps<any> {
  columns: IEditableColumn[];
}

const Editable: React.FC<IEditableProps> = (props) => {
  const { columns, ...rest } = props;

  const columnConvert = (column) => {
    return {
      ...column,
      ellipsis: true,
      children: column.children?.map((c) => {
        return columnConvert(c);
      }),
      render: (text: any, record: any, i: number) => {
        const originContent = column.render ? column.render(text, record, i) : text;
        if (column.editor) {
          return (
            <Popover
              overlayClassName={styles.popOver}
              trigger="click"
              getPopupContainer={(trigger) => {
                return document.querySelector('.odc_csvmapping_archor');
              }}
              content={column.editor(text, record, i)}
            >
              <div
                style={{
                  height: '100%',
                  position: 'relative',
                  cursor: 'pointer',
                  lineHeight: '24px',
                }}
              >
                {originContent}
              </div>
            </Popover>
          );
        } else {
          return originContent;
        }
      },
    };
  };

  const initColumns = () => {
    const { columns } = props;

    return columns.map((column) => columnConvert(column));
  };

  return (
    <Table
      bordered={true}
      className={classNames(styles.table, 'odc_csvmapping_archor')}
      rowClassName={(record, i) => (i % 2 === 0 ? styles.even : styles.odd)}
      columns={initColumns()}
      {...rest}
    />
  );
};

export default Editable;
