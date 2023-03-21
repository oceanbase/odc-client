import { TABLE_ROW_HEIGHT } from '@/constant';
import { Table } from 'antd';
import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer';
import { useEffect, useRef, useState } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import styles from './index.less';

const VirtualTable = (props) => {
  const { columns, scroll } = props;
  const [tableWidth, setTableWidth] = useState(0);
  const gridRef = useRef<Grid>();
  const [connectObject] = useState(() => {
    const obj = {};
    Object.defineProperty(obj, 'scrollLeft', {
      get: () => null,
      set: (scrollLeft) => {
        if (gridRef.current) {
          gridRef.current.scrollTo({
            scrollLeft,
          });
        }
      },
    });
    return obj;
  });

  const widthColumnCount = columns.filter(({ width }) => !width).length;
  const mergedWidth = columns
    .filter(({ width }) => width)
    .reduce((total, { width }) => (total += width), 0);
  const mergedColumns = columns.map((column) => {
    if (column.width) {
      return column;
    }
    return { ...column, width: Math.floor((tableWidth - mergedWidth) / widthColumnCount) };
  });

  const resetVirtualGrid = () => {
    gridRef.current?.resetAfterIndices({
      columnIndex: 0,
      shouldForceUpdate: true,
    });
  };

  useEffect(() => resetVirtualGrid, [tableWidth]);

  const renderVirtualList = (rawData, { scrollbarSize, ref, onScroll }) => {
    ref.current = connectObject;
    const totalHeight = rawData.length * TABLE_ROW_HEIGHT;

    return (
      <Grid
        ref={gridRef}
        className={styles.grid}
        columnCount={mergedColumns.length}
        columnWidth={(index) => {
          const { width } = mergedColumns[index];
          return totalHeight > scroll.y && index === mergedColumns.length - 1
            ? width - scrollbarSize - 1
            : width;
        }}
        height={scroll.y}
        rowCount={rawData.length}
        rowHeight={() => TABLE_ROW_HEIGHT}
        width={tableWidth}
        onScroll={({ scrollLeft }) => {
          onScroll({
            scrollLeft,
          });
        }}
      >
        {({ columnIndex, rowIndex, style }) => {
          const record = rawData[rowIndex];
          const text = record[mergedColumns[columnIndex].dataIndex];
          const ellipsis = !!mergedColumns[columnIndex].ellipsis;
          return (
            <div
              className={classNames(styles.cell, {
                [styles.cellLast]: columnIndex === mergedColumns.length - 1,
                [styles.ellipsis]: ellipsis,
              })}
              style={style}
              title={ellipsis && text}
            >
              {columns[columnIndex].render
                ? columns[columnIndex].render(text, record, rowIndex)
                : text}
            </div>
          );
        }}
      </Grid>
    );
  };

  return (
    <ResizeObserver
      onResize={({ width }) => {
        setTableWidth(width);
      }}
    >
      <Table
        {...props}
        className={styles.virtualTable}
        columns={mergedColumns}
        pagination={false}
        components={{
          body: renderVirtualList,
        }}
      />
    </ResizeObserver>
  );
};
export default VirtualTable;
