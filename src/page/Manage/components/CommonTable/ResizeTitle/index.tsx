import { useState } from 'react';
import { Resizable } from 'react-resizable';

import styles from './index.less';

export default function ResizeCell(props) {
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
        console.log('start');
      }}
      onResizeStop={(e) => {
        e.stopPropagation();
      }}
      {...{
        onMouseUp: () => {
          setIsDrag(false);
          console.log('down');
        },
        onClick: (e) => !isDrag && onClick?.(e),
      }}
    >
      <th {...restProps} />
    </Resizable>
  );
}
