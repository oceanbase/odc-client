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
