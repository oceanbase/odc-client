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

import React, { CSSProperties, useRef } from 'react';
import { Anchor } from 'antd';
import { AnchorLinkItemProps } from 'antd/es/anchor/Anchor';
import styles from './index.less';

interface AnchorContainerProps {
  items: AnchorLinkItemProps[];
  containerWrapStyle?: CSSProperties;
}

const AnchorContainer: React.FC<AnchorContainerProps> = (props) => {
  const { items, containerWrapStyle = {} } = props;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={scrollContainerRef} className={styles.AnchorContainer}>
      <div className={styles.content} style={containerWrapStyle}>
        {props.children}
      </div>
      <div className={styles.anchor}>
        <Anchor
          getContainer={() => scrollContainerRef.current!}
          onClick={(e) => {
            e.preventDefault();
          }}
          items={items}
        />
      </div>
    </div>
  );
};

export default AnchorContainer;
