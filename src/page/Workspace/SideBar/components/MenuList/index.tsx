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
