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

import React, { useImperativeHandle, useRef } from 'react';
import type { XYCoord } from 'react-dnd';
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
  DragSource,
  DragSourceConnector,
  DragSourceMonitor,
  DropTarget,
  DropTargetConnector,
  DropTargetMonitor,
} from 'react-dnd';

interface IInstance {
  getNode(): HTMLDivElement | null;
}

export interface IDragable {
  id: number;
  index: number;
  connectDragSource: ConnectDragSource;
  connectDropTarget?: ConnectDropTarget;
  connectDragPreview: ConnectDragPreview;
  isDragging: boolean;
  isOver: boolean;
  dragIndex: number;
  handleMove: (dragIndex: number, hoverIndex: number) => void;
  handleDelete: (idx: number) => void;
  handleEdit: (idx: number, rule: any) => void;
}

function DragableParam<T extends IDragable>(WrappedComponent: any) {
  return React.forwardRef<HTMLDivElement, T>((props, ref) => {
    const {
      handleDelete,
      handleEdit,
      isDragging,
      connectDropTarget,
      connectDragSource,
      connectDragPreview,
    } = props;

    const elementRef = useRef(null);

    connectDragPreview(elementRef);
    connectDropTarget(elementRef);

    const opacity = isDragging ? 0 : 1;
    useImperativeHandle<{}, IInstance>(ref, () => ({
      getNode: () => elementRef.current,
    }));

    return (
      <div ref={elementRef} style={{ opacity }}>
        <WrappedComponent
          props={{ ...props }}
          connectDragSource={connectDragSource}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      </div>
    );
  });
}

export default function Dragable<T extends IDragable>(WrappedComponent: any, type: string) {
  return DropTarget<Text>(
    type,
    {
      // @ts-ignore
      hover(props: T, monitor: DropTargetMonitor, component: IInstance) {
        if (!component) {
          return null;
        }
        // node = HTML Div element from imperative API
        const node = component.getNode();
        if (!node) {
          return null;
        }

        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
          return;
        }

        // Determine rectangle on screen
        const hoverBoundingRect = node.getBoundingClientRect();

        // Get vertical middle
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

        // Determine mouse position
        const clientOffset = monitor.getClientOffset();

        // Get pixels to the top
        const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%

        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }

        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }

        // Time to actually perform the action
        props.handleMove(dragIndex, hoverIndex);

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        monitor.getItem().index = hoverIndex;
      },
    },
    (connect: DropTargetConnector, monitor: DropTargetMonitor) => ({
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver(),
      dragIndex: monitor.getItem()?.index,
    }),
  )(
    DragSource(
      type,
      {
        beginDrag: (props: T) => ({
          id: props.id,
          index: props.index,
        }),
      },
      (connect: DragSourceConnector, monitor: DragSourceMonitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging(),
      }),
    )(DragableParam(WrappedComponent)),
  );
}
