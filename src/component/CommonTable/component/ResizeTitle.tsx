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

import { useState } from 'react';
import { Resizable } from 'react-resizable';
import styles from '../index.less';

export function ResizeTitle(props) {
  const { width, onResize, onClick, ...restProps } = props;

  const [isDrag, setIsDrag] = useState(false);
  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      handle={<div className={styles.handle} />}
      width={width}
      height={0}
      onResize={onResize}
      onResizeStart={() => {
        setIsDrag(true);
      }}
      onResizeStop={(e) => {
        e.stopPropagation();
      }}
      {...{
        onMouseUp: () => {
          setIsDrag(false);
        },
        onClick: (e) => !isDrag && onClick?.(e),
      }}
    >
      <th {...restProps} />
    </Resizable>
  );
}
