import React, { useCallback, useContext, useRef, useState } from 'react';

import { debounce } from 'lodash';
import SplitPane from 'react-split-pane';
import ActivityBarContext from '../context/ActivityBarContext';
import styles from './index.less';

interface IProps {
  activityBar: React.ReactNode;
  sideBar: React.ReactNode;
  editorGroup: React.ReactNode;
}

const MinWidth = 180;

const WorkBenchLayout: React.FC<IProps> = function ({ activityBar, sideBar, editorGroup }) {
  const [sideWidth, setSideWidth] = useState(MinWidth + 100);
  const minSizeEventCountRef = useRef(0);
  const splitRef = useRef<SplitPane>();
  const context = useContext(ActivityBarContext);
  const haveActiveKey = !!context?.activeKey;
  const emitResizeEvent = useCallback(
    debounce(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500),
    [],
  );
  const handleChangeSiderWidth = (width: number) => {
    setSideWidth(width);
    emitResizeEvent();
    if (width <= MinWidth) {
      minSizeEventCountRef.current++;
      if (minSizeEventCountRef.current > 30) {
        minSizeEventCountRef.current = 0;
        /**
         * active设置split pane停止监听move事件，同时在下一次事件循环中设置activekey，确保让onmove事件优先处理完成。
         */
        splitRef.current?.setState(
          {
            active: false,
          },
          () => {
            setTimeout(() => {
              context.setActiveKey(null);
            });
          },
        );
      }
    } else {
      minSizeEventCountRef.current = 0;
    }
  };
  return (
    <div className={styles.workbench}>
      <div className={styles.activityBar}>{activityBar}</div>

      <div className={styles.splitPane}>
        <SplitPane
          ref={splitRef}
          split="vertical"
          allowResize={haveActiveKey}
          minSize={MinWidth}
          size={haveActiveKey ? sideWidth : 0}
          maxSize={480}
          defaultSize={sideWidth}
          pane2Style={{
            minWidth: '1px',
          }}
          pane1Style={{
            minWidth: '1px',
          }}
          resizerStyle={{
            background: 'transparent',
            pointerEvents: haveActiveKey ? 'unset' : 'none',
          }}
          onChange={handleChangeSiderWidth}
        >
          <div
            style={{ minWidth: sideWidth, zIndex: !haveActiveKey ? -9999 : 'unset' }}
            className={styles.sideBar}
          >
            {sideBar}
          </div>
          <div className={styles.editorGroup}>{editorGroup}</div>
        </SplitPane>
      </div>
    </div>
  );
};

export default WorkBenchLayout;
