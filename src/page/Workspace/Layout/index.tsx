import React, { useCallback, useState } from 'react';

import { debounce } from 'lodash';
import SplitPane from 'react-split-pane';
import styles from './index.less';

interface IProps {
  activityBar: React.ReactNode;
  sideBar: React.ReactNode;
  editorGroup: React.ReactNode;
}

const WorkBenchLayout: React.FC<IProps> = function ({ activityBar, sideBar, editorGroup }) {
  const [sideWidth, setSideWidth] = useState(240);
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
    <div className={styles.workbench}>
      <div className={styles.activityBar}>{activityBar}</div>

      <div className={styles.splitPane}>
        {sideBar ? (
          <SplitPane
            split="vertical"
            minSize={120}
            maxSize={480}
            defaultSize={sideWidth}
            pane2Style={{
              minWidth: '1px',
            }}
            resizerStyle={{
              background: 'transparent',
            }}
            onChange={handleChangeSiderWidth}
          >
            <div className={styles.sideBar}>{sideBar}</div>
            <div className={styles.editorGroup}>{editorGroup}</div>
          </SplitPane>
        ) : (
          <div className={styles.editorGroup}>{editorGroup}</div>
        )}
      </div>
    </div>
  );
};

export default WorkBenchLayout;
