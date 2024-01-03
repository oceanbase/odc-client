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
import { FormatterProps } from '@oceanbase-odc/ob-react-data-grid';
import React, { useState } from 'react';

import { Input, Modal } from 'antd';
import { isNil, isUndefined } from 'lodash';
import styles from './index.less';

export default React.memo(
  function TextFormatter(props: FormatterProps) {
    const { column, row } = props;
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const columnKey = column.key;
    const value = row[columnKey];
    return (
      <div className={styles.textFormatter}>
        {isNil(value) ? (
          <span className={styles.textNull}>{isUndefined(value) ? '(default)' : '(null)'}</span>
        ) : (
          value?.replace(/\r/g, '\\r').replace(/\n/g, '\\n')
        )}
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
            title={column.name}
            visible={true}
            centered
            onCancel={() => {
              setDetailModalVisible(false);
            }}
            footer={null}
          >
            <Input.TextArea
              className={styles.contenttext}
              autoSize={{ minRows: 15, maxRows: 15 }}
              value={value}
            />
          </Modal>
        )}
      </div>
    );
  },
  (prev, next) =>
    prev.row === next.row &&
    prev.column?.key === next.column?.key &&
    prev.column?.name === next.column?.name,
);
