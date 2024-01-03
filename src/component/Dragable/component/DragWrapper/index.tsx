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

import React, { useEffect } from 'react';
import { DragSourceMonitor, useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

interface IProps {
  key?: string;
  children: React.ReactNode;
  className?: string;
  style?: any;
  useCustomerDragLayer?: boolean;
  onBegin?: (monitor: DragSourceMonitor) => void;
  onEnd?: (item, monitor: DragSourceMonitor) => void;
}

const Component: React.FC<IProps> = ({
  key,
  children,
  className,
  style,
  onBegin,
  onEnd,
  useCustomerDragLayer,
  ...rest
}) => {
  const [{ opacity, isDragging }, drag, preview] = useDrag({
    item: { name, type: 'box' },
    begin(monitor) {
      onBegin && onBegin(monitor);
    },
    end(item, monitor) {
      onEnd && onEnd(item, monitor);
    },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
      isDragging: monitor.isDragging(),
    }),
    options: {
      dropEffect: 'copy',
    },
  });

  //隐藏默认预览
  useEffect(() => {
    if (useCustomerDragLayer) {
      preview(getEmptyImage(), { captureDraggingState: true });
    }
  }, []);

  return (
    <div key={key} ref={drag} className={className} style={{ ...style, opacity }} {...rest}>
      {children}
    </div>
  );
};
export default Component;
