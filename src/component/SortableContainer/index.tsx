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
import { DndContext, closestCenter, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import {
  arrayMove,
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DragEndEvent } from '@dnd-kit/core';
/** DndKei Docs:https://docs.dndkit.com/ */

interface SortableContainerProps {
  /** 排序的key值数组 */
  list: React.Key[];
  onDrapEnd: (param: React.Key[]) => void;
}

const SortableContainer: React.FC<SortableContainerProps> = React.memo((props) => {
  const { list, onDrapEnd } = props;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      /**
       * NOTE: dndkit，拖曳事件会和子项一些自定义事件(比如点击事件)冲突，需要配置 activationConstraint属性解决
       * https://docs.dndkit.com/api-documentation/sensors
       */
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const oldIndex = list.indexOf(active.id);
    const newIndex = list.indexOf(over.id);
    onDrapEnd(arrayMove(list, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={list} strategy={verticalListSortingStrategy}>
        {props.children}
      </SortableContext>
    </DndContext>
  );
});

export default SortableContainer;

interface DraggableItemProps {
  id: string;
}
export const DraggableItem: React.FC<DraggableItemProps> = React.memo((props) => {
  const { id } = props;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </div>
  );
});
