import React, { useRef } from 'react';
import { Anchor } from 'antd';
import { AnchorLinkItemProps } from 'antd/es/anchor/Anchor';
import styles from './index.less';

interface AnchorContainerProps {
  items: AnchorLinkItemProps[];
}

const AnchorContainer: React.FC<AnchorContainerProps> = (props) => {
  const { items } = props;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={scrollContainerRef} className={styles.AnchorContainer}>
      <div className={styles.content}>{props.children}</div>
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
