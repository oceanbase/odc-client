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
