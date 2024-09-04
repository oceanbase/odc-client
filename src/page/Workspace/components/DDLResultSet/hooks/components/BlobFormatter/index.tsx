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
    const isMasked = resultContext.originColumns?.find((c) => c.key === columnKey)?.masked;
    /**
     * 是否支持查看详情
     */
    const supportModal = !isOriginValueBeNil && !isMasked;
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
