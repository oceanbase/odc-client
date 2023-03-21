import React from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';

interface IProps {
  children: React.ReactNode;
  className?: string;
  style?: any;
  onDrop?: (item, monitor: DropTargetMonitor) => void;
  onHover?: (item, monitor: DropTargetMonitor) => void;
}

const Component: React.FC<IProps> = ({ children, className, style, onDrop, onHover }) => {
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'box',
    hover(item, monitor) {
      onHover && onHover(item, monitor);
    },
    drop: (item, monitor) => {
      onDrop && onDrop(item, monitor);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div ref={drop} className={className} style={style}>
      {children}
    </div>
  );
};
export default Component;
