import { FullscreenOutlined } from '@ant-design/icons';
import { FormatterProps } from '@oceanbase-odc/ob-react-data-grid';
import React, { useContext, useState } from 'react';

import { isNil, isUndefined } from 'lodash';
import ResultContext from '../../../ResultContext';
import BlobViewModal from './BlobViewModal';
import styles from './index.less';

export default React.memo(
  function TextFormatter(props: FormatterProps) {
    const { column, row, onRowChange } = props;
    const resultContext = useContext(ResultContext);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const columnKey = resultContext?.isColumnMode ? row.columnKey : column.key;
    const value = row[columnKey];
    const isOriginValueBeNil = row._originRow && isNil(row._originRow[columnKey]);
    /**
     * 是否支持查看详情
     */
    const supportModal = !isOriginValueBeNil && !isNil(value);
    return (
      <div className={styles.textFormatter}>
        {isNil(value) ? (
          <span className={styles.textNull}>{isUndefined(value) ? '(default)' : '(null)'}</span>
        ) : (
          value
        )}
        {(row._created || supportModal) && (
          <div
            className={styles.viewBtn}
            onClick={(e) => {
              setDetailModalVisible(true);
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <FullscreenOutlined />
          </div>
        )}
        {detailModalVisible && (
          <BlobViewModal
            onCancel={() => {
              setDetailModalVisible(false);
            }}
            column={column}
            onRowChange={onRowChange}
            row={row}
          />
        )}
      </div>
    );
  },
  (prev, next) => prev.row === next.row && prev.column === next.column,
);
