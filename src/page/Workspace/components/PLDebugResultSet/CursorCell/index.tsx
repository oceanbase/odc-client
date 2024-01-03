/*
 * Copyright 2024 OceanBase
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
import { useState } from 'react';

import { IPLOutParam, IResultSet } from '@/d.ts';
import { IServerTableColumn } from '@/d.ts/table';
import SessionStore from '@/store/sessionManager/session';
import { Modal } from 'antd';
import DDLResultSet from '../../DDLResultSet';
import styles from './index.less';

interface ICursorCellProps {
  record: IPLOutParam & {
    cursorResultSet: {
      resultSetMetaData: {
        columnList: IServerTableColumn[];
      };
      rows: IResultSet['rows'];
    };
  };
  session: SessionStore;
}

const CursorCell: React.FC<ICursorCellProps> = (props) => {
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const { rows, resultSetMetaData } = props?.record?.cursorResultSet ?? {};
  const columns = resultSetMetaData?.columnList?.map((field, index) => {
    return {
      key: `${field.name}_${index}`,
      name: field.name,
      columnName: field.name,
      columnType: field.typeName,
      columnIndex: index,
      columnComment: field.comment,
      internal: null,
      readonly: true,
    };
  });

  const _rows = rows?.map((row, i) => {
    return row.reduce(
      (newRowMap, value, rowIdx) => {
        const columnKey = columns[rowIdx].key;
        newRowMap[columnKey] = value;
        return newRowMap;
      },
      { _rowIndex: i },
    );
  });

  return (
    <>
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
      {detailModalVisible && (
        <Modal
          title={props?.record?.paramName}
          open={true}
          centered
          width={720}
          onCancel={() => {
            setDetailModalVisible(false);
          }}
          footer={null}
          wrapClassName={styles['cursor-modal']}
        >
          <DDLResultSet
            session={null}
            showExplain={false}
            disableEdit={true}
            autoCommit={false}
            isEditing={false}
            onExport={null}
            showPagination={true}
            columns={columns}
            rows={_rows}
            sqlId=""
            enableRowId={true}
            resultHeight={420}
          />
        </Modal>
      )}
    </>
  );
};

export default CursorCell;
