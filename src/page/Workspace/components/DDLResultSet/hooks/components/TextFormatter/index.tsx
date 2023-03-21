import { FormatterProps } from '@alipay/ob-react-data-grid';
import { FullscreenOutlined } from '@ant-design/icons';
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
