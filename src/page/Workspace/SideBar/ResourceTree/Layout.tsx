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
