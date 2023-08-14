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

import React, { useCallback } from 'react';

import styles from './index.less';

interface DataNode {
  title: string;
  key: string | number;
}

interface IProps {
  data: DataNode[];
  titleRender?: (node: DataNode) => React.ReactNode;
  onClick?: (node: DataNode) => void;
}

const MenuList: React.FC<IProps> = function ({ data, titleRender, onClick }) {
  const innerTitleRender = useCallback(
    (node: DataNode) => {
      if (titleRender) {
        return titleRender(node);
      }
      return node.title;
    },
    [titleRender],
  );
  return (
    <div className={styles.menuList}>
      {data?.map((item) => {
        return (
          <div
            onClick={(e) => {
              onClick?.(item);
            }}
            key={item.key}
            className={styles.menuItem}
          >
            {innerTitleRender(item)}
          </div>
        );
      })}
    </div>
  );
};

export default MenuList;
