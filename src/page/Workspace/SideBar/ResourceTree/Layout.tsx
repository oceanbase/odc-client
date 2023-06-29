import React, { useCallback, useState } from 'react';

import { Spin } from 'antd';
import { debounce } from 'lodash';
import SplitPane from 'react-split-pane';
import styles from './layout.less';

interface IProps {
  top: React.ReactNode;
  bottom: React.ReactNode;
  bottomLoading?: boolean;
}

const ResourceLayout: React.FC<IProps> = function ({ top, bottom, bottomLoading }) {
  const maxHeight = document.body.clientHeight * 0.7;
  const [sideWidth, setSideWidth] = useState(150);
  const emitResizeEvent = useCallback(
    debounce(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500),
    [],
  );
  const handleChangeSiderWidth = (width: number) => {
    setSideWidth(width);
    emitResizeEvent();
  };
  return (
    <div className={styles.layout}>
      <div className={styles.splitPane}>
        <SplitPane
          split="horizontal"
          allowResize={!!bottom}
          minSize={120}
          size={bottom ? sideWidth : '100%'}
          maxSize={maxHeight}
          defaultSize={sideWidth}
          pane2Style={{
            minHeight: '1px',
            overflow: 'hidden',
          }}
          resizerStyle={{
            background: 'transparent',
          }}
          onChange={handleChangeSiderWidth}
        >
          <div className={styles.top}>{top}</div>
          <Spin spinning={bottomLoading} wrapperClassName={styles.bottom}>
            {bottom}
          </Spin>
        </SplitPane>
      </div>
    </div>
  );
};

export default ResourceLayout;
